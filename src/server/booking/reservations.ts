import type { Pool } from "pg";
import { HOLD_DEFAULT_DAYS } from "@/lib/booking-rules";
import type { IsoDate } from "@/lib/dates";
import { PACKAGE_INFO, type PackageId } from "@/lib/venue";
import { PG, pgConstraint, pgErrorCode, withTransaction, type Queryable } from "../db";
import { DateUnavailableError } from "../errors";

export interface ReserveInput {
  date: IsoDate;
  pkg: PackageId;
  kind: "booking" | "hold" | "blackout";
  leadId?: string;
  note?: string;
  /** Holds only. Defaults to HOLD_DEFAULT_DAYS from now. */
  expiresAt?: Date;
  now?: Date;
}

/** Mark holds that have passed their expiry as expired, optionally for one date only. */
export async function expireHolds(db: Queryable, now: Date, date?: IsoDate): Promise<number> {
  const res = await db.query(
    `UPDATE space_reservations SET status = 'expired', updated_at = now()
     WHERE kind = 'hold' AND status = 'active' AND expires_at <= $1
       AND ($2::date IS NULL OR event_date = $2::date)`,
    [now, date ?? null],
  );
  return res.rowCount ?? 0;
}

/**
 * Reserve every space a package needs on one date, all or nothing. The partial unique
 * index guarantees two people can never hold the same space on the same day, even when
 * requests arrive at the same instant.
 */
export async function reserveDate(pool: Pool, input: ReserveInput): Promise<string[]> {
  const now = input.now ?? new Date();
  const expiresAt =
    input.kind === "hold" ? (input.expiresAt ?? new Date(now.getTime() + HOLD_DEFAULT_DAYS * 86_400_000)) : null;
  if (expiresAt && expiresAt <= now) throw new RangeError("A hold must expire in the future");

  try {
    return await withTransaction(pool, async (tx) => {
      // Free the day of any lapsed holds so they can't block a real reservation.
      await expireHolds(tx, now, input.date);
      const ids: string[] = [];
      for (const space of PACKAGE_INFO[input.pkg].spaces) {
        const { rows } = await tx.query<{ id: string }>(
          `INSERT INTO space_reservations (space, event_date, kind, expires_at, lead_id, note)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
          [space, input.date, input.kind, expiresAt, input.leadId ?? null, input.note ?? null],
        );
        ids.push(rows[0]!.id);
      }
      if (input.leadId && input.kind !== "blackout") {
        await tx.query(
          `UPDATE leads SET stage = $2, updated_at = now() WHERE id = $1 AND stage <> 'booked'`,
          [input.leadId, input.kind === "booking" ? "booked" : "hold"],
        );
      }
      return ids;
    });
  } catch (err) {
    if (pgErrorCode(err) === PG.uniqueViolation && pgConstraint(err) === "space_reservations_one_active_per_day") {
      throw new DateUnavailableError();
    }
    throw err;
  }
}

/** Release an active reservation (e.g. a couple lets a hold go). */
export async function releaseReservation(db: Queryable, id: string): Promise<boolean> {
  const res = await db.query(
    `UPDATE space_reservations SET status = 'released', updated_at = now() WHERE id = $1 AND status = 'active'`,
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}
