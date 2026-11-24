import type { Pool } from "pg";
import { TOUR_SCHEDULE } from "@/lib/booking-rules";
import { addDays, diffDays, venueDateOf, venueToday, type IsoDate } from "@/lib/dates";
import { bookableSlots, checkSlot, type TourSlot } from "@/lib/tour-slots";
import type { BookTourInput } from "@/lib/validation";
import { recordEvent } from "../analytics";
import { PG, pgConstraint, pgErrorCode, withTransaction, type Queryable } from "../db";
import { IdempotencyConflictError, SlotUnavailableError, ValidationError } from "../errors";
import { enqueue, type OutboxItem } from "../messaging/outbox";
import type { MessagingMode } from "../messaging/config";

/** Dates on which the Pavilion has a booked event or a blackout; no tours those days. */
async function blockedTourDates(db: Queryable, from: IsoDate, to: IsoDate): Promise<Set<string>> {
  if (!TOUR_SCHEDULE.blockOnPavilionEventDays) return new Set();
  const { rows } = await db.query<{ date: string }>(
    `SELECT DISTINCT to_char(event_date, 'YYYY-MM-DD') AS date FROM space_reservations
     WHERE space = 'pavilion' AND status = 'active' AND kind IN ('booking', 'blackout')
       AND event_date BETWEEN $1::date AND $2::date`,
    [from, to],
  );
  return new Set(rows.map((r) => r.date));
}

/** Open tour slots from now to the booking horizon. */
export async function listOpenSlots(db: Queryable, now: Date): Promise<TourSlot[]> {
  const today = venueToday(now);
  const last = addDays(today, TOUR_SCHEDULE.horizonDays);
  const blockedDates = await blockedTourDates(db, today, last);
  const candidates = bookableSlots({ now, blockedDates });
  if (candidates.length === 0) return [];
  const { rows } = await db.query<{ starts_at: Date }>(
    `SELECT starts_at FROM tours WHERE status = 'scheduled' AND starts_at = ANY($1::timestamptz[])`,
    [candidates.map((c) => c.startsAt)],
  );
  const taken = new Set(rows.map((r) => r.starts_at.toISOString()));
  return candidates.filter((c) => !taken.has(c.startsAt));
}

export interface BookTourResult {
  tourId: string;
  leadId: string;
  startsAt: string;
  /** True when this exact request was already processed and we returned the original tour. */
  replayed: boolean;
}

interface ExistingTour {
  id: string;
  lead_id: string;
  starts_at: Date;
  email: string;
}

async function findByIdempotencyKey(db: Queryable, key: string): Promise<ExistingTour | null> {
  const { rows } = await db.query<ExistingTour>(
    `SELECT t.id, t.lead_id, t.starts_at, l.email::text AS email
     FROM tours t JOIN leads l ON l.id = t.lead_id WHERE t.idempotency_key = $1`,
    [key],
  );
  return rows[0] ?? null;
}

function replayOrConflict(existing: ExistingTour, input: BookTourInput): BookTourResult {
  const same = existing.starts_at.getTime() === input.startsAt.getTime() && existing.email.toLowerCase() === input.email;
  if (!same) throw new IdempotencyConflictError();
  return { tourId: existing.id, leadId: existing.lead_id, startsAt: existing.starts_at.toISOString(), replayed: true };
}

function messagesFor(tourId: string, leadId: string, startsAt: Date, input: BookTourInput, now: Date): OutboxItem[] {
  const canText = Boolean(input.phone && input.smsConsent);
  const base = { leadId, tourId };
  const items: OutboxItem[] = [
    { ...base, channel: "email", template: "tour_confirmation_email", sendAfter: now, idempotencyKey: `${tourId}:confirm:email` },
    { ...base, channel: "internal", template: "staff_new_tour", sendAfter: now, idempotencyKey: `${tourId}:staff` },
  ];
  if (canText) {
    items.push({ ...base, channel: "sms", template: "tour_confirmation_sms", sendAfter: now, idempotencyKey: `${tourId}:confirm:sms` });
  }
  const day = new Date(startsAt.getTime() - 24 * 3_600_000);
  if (day.getTime() > now.getTime() + 3_600_000) {
    items.push({ ...base, channel: "email", template: "tour_reminder_24h_email", sendAfter: day, idempotencyKey: `${tourId}:remind:24h` });
  }
  const twoHours = new Date(startsAt.getTime() - 2 * 3_600_000);
  if (canText && twoHours > now) {
    items.push({ ...base, channel: "sms", template: "tour_reminder_2h_sms", sendAfter: twoHours, idempotencyKey: `${tourId}:remind:2h` });
  }
  return items;
}

/**
 * Book a tour. Safe to retry with the same idempotency key: the original tour comes back
 * and nothing is written twice. Two visitors racing for one slot: exactly one wins, the
 * other gets SlotUnavailableError.
 */
export async function bookTour(
  pool: Pool,
  input: BookTourInput,
  idempotencyKey: string,
  opts: { now?: Date; messagingMode?: MessagingMode } = {},
): Promise<BookTourResult> {
  const now = opts.now ?? new Date();

  if (input.company) throw new ValidationError("We couldn't book that tour. Please call us.");

  const prior = await findByIdempotencyKey(pool, idempotencyKey);
  if (prior) return replayOrConflict(prior, input);

  const check = checkSlot(input.startsAt, now);
  if (!check.ok) {
    if (check.reason === "not_a_slot") throw new ValidationError("That isn't one of our tour times.", { startsAt: "invalid" });
    throw new SlotUnavailableError("That tour time is no longer bookable. Please pick another.");
  }

  const tourDate = venueDateOf(input.startsAt);
  let result: BookTourResult;
  try {
    result = await withTransaction(pool, async (tx) => {
      const blocked = await blockedTourDates(tx, tourDate, tourDate);
      if (blocked.has(tourDate)) throw new SlotUnavailableError("We're hosting an event that day. Please pick another time.");

      const lead = await tx.query<{ id: string }>(
        `INSERT INTO leads (first_name, last_name, email, phone, wedding_date, guest_count, package_interest, stage, source, utm, sms_consent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'tour_booked', $8, $9, $10)
         ON CONFLICT (email) DO UPDATE SET
           first_name = EXCLUDED.first_name,
           last_name = EXCLUDED.last_name,
           phone = COALESCE(EXCLUDED.phone, leads.phone),
           wedding_date = COALESCE(EXCLUDED.wedding_date, leads.wedding_date),
           guest_count = COALESCE(EXCLUDED.guest_count, leads.guest_count),
           package_interest = COALESCE(EXCLUDED.package_interest, leads.package_interest),
           sms_consent = EXCLUDED.sms_consent,
           source = COALESCE(leads.source, EXCLUDED.source),
           stage = CASE WHEN leads.stage IN ('inquiry', 'lost') THEN 'tour_booked' ELSE leads.stage END,
           updated_at = now()
         RETURNING id`,
        [
          input.firstName,
          input.lastName,
          input.email,
          input.phone ?? null,
          input.weddingDate ?? null,
          input.guestCount ?? null,
          input.package ?? null,
          input.source ?? null,
          input.utm,
          input.smsConsent,
        ],
      );
      const leadId = lead.rows[0]!.id;

      // ON CONFLICT on the key handles two identical requests racing each other; a
      // different lead taking the same slot still raises the slot's unique violation.
      const inserted = await tx.query<{ id: string }>(
        `INSERT INTO tours (lead_id, starts_at, duration_minutes, idempotency_key, notes)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (idempotency_key) DO NOTHING
         RETURNING id`,
        [leadId, input.startsAt, TOUR_SCHEDULE.durationMinutes, idempotencyKey, input.notes ?? null],
      );
      const tourId = inserted.rows[0]?.id;
      if (!tourId) {
        const existing = await findByIdempotencyKey(tx, idempotencyKey);
        if (!existing) throw new Error("Idempotency key conflict without an existing tour");
        return replayOrConflict(existing, input);
      }

      await enqueue(tx, messagesFor(tourId, leadId, input.startsAt, input, now), opts.messagingMode);
      return { tourId, leadId, startsAt: input.startsAt.toISOString(), replayed: false };
    });
  } catch (err) {
    if (pgErrorCode(err) === PG.uniqueViolation && pgConstraint(err) === "tours_one_scheduled_per_slot") {
      throw new SlotUnavailableError();
    }
    throw err;
  }

  // Recorded after commit so analytics can never roll back a booking.
  if (!result.replayed) {
    await recordEvent(
      pool,
      "tour_booked",
      {
        package: input.package ?? "unknown",
        has_wedding_date: Boolean(input.weddingDate),
        tour_lead_days: diffDays(tourDate, venueToday(now)),
        source: input.utm.source ?? input.source ?? "direct",
      },
      { sessionId: input.sessionId, leadId: result.leadId },
    );
  }
  return result;
}
