import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { toIsoDate } from "@/lib/dates";
import { checkDate } from "@/server/booking/availability";
import { expireHolds, reserveDate } from "@/server/booking/reservations";
import { bookTour, listOpenSlots } from "@/server/booking/tours";
import { DateUnavailableError, IdempotencyConflictError, SlotUnavailableError, ValidationError } from "@/server/errors";
import { closePool, fakeTourInput, resetData, testPool } from "./helpers";

const now = new Date("2026-11-24T15:00:00Z"); // Tuesday 7 am in Port Gamble
const SLOT = "2026-11-30T18:00:00.000Z"; // Monday 10 am PST

beforeEach(resetData);
afterAll(closePool);

describe("date reservations", () => {
  it("lets exactly one of many simultaneous requests reserve a day", async () => {
    const pool = testPool();
    const attempts = await Promise.allSettled(
      Array.from({ length: 8 }, () => reserveDate(pool, { date: toIsoDate("2027-06-12"), pkg: "pavilion", kind: "booking", now })),
    );
    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
    const rejected = attempts.filter((a): a is PromiseRejectedResult => a.status === "rejected");
    expect(rejected.every((r) => r.reason instanceof DateUnavailableError)).toBe(true);
  });

  it("reserves a combination all-or-nothing", async () => {
    const pool = testPool();
    await reserveDate(pool, { date: toIsoDate("2027-06-12"), pkg: "church", kind: "booking", now });
    await expect(
      reserveDate(pool, { date: toIsoDate("2027-06-12"), pkg: "combination", kind: "booking", now }),
    ).rejects.toBeInstanceOf(DateUnavailableError);
    const { rows } = await pool.query("SELECT space FROM space_reservations WHERE status = 'active'");
    expect(rows).toEqual([{ space: "church" }]); // the pavilion row was rolled back
  });

  it("lets an expired hold be replaced, and an active one block", async () => {
    const pool = testPool();
    const date = toIsoDate("2027-07-09");
    await reserveDate(pool, { date, pkg: "pavilion", kind: "hold", expiresAt: new Date(now.getTime() + 3_600_000), now });
    await expect(reserveDate(pool, { date, pkg: "pavilion", kind: "booking", now })).rejects.toBeInstanceOf(DateUnavailableError);

    const later = new Date(now.getTime() + 2 * 3_600_000);
    expect((await checkDate(pool, date, "pavilion", later)).status).toBe("available"); // expired hold no longer blocks
    await reserveDate(pool, { date, pkg: "pavilion", kind: "booking", now: later });
    expect(await expireHolds(pool, later)).toBe(0); // already expired by the booking
  });
});

describe("checkDate", () => {
  it("reports a taken Saturday with priced nearby alternatives", async () => {
    const pool = testPool();
    await reserveDate(pool, { date: toIsoDate("2027-06-12"), pkg: "combination", kind: "booking", now });
    const res = await checkDate(pool, toIsoDate("2027-06-12"), "combination", now);
    expect(res.status).toBe("unavailable");
    expect(res.price.amount).toBe(7250);
    expect(res.alternatives.map((a) => a.date).slice(0, 2)).toEqual(["2027-06-11", "2027-06-13"]);
    expect(res.offSeasonPick?.date).toBe("2027-10-01");
  });

  it("treats church-only and pavilion as separate spaces", async () => {
    const pool = testPool();
    await reserveDate(pool, { date: toIsoDate("2027-08-06"), pkg: "pavilion", kind: "booking", now });
    expect((await checkDate(pool, toIsoDate("2027-08-06"), "church", now)).status).toBe("available");
    expect((await checkDate(pool, toIsoDate("2027-08-06"), "combination", now)).status).toBe("unavailable");
  });

  it("handles past, too-soon and too-far dates", async () => {
    const pool = testPool();
    expect((await checkDate(pool, toIsoDate("2026-11-01"), "pavilion", now)).status).toBe("past");
    expect((await checkDate(pool, toIsoDate("2026-11-30"), "pavilion", now)).status).toBe("too_soon");
    expect((await checkDate(pool, toIsoDate("2031-01-01"), "pavilion", now)).status).toBe("too_far");
  });
});

describe("bookTour", () => {
  it("books a tour, creates the lead and queues messages for approval only", async () => {
    const pool = testPool();
    const res = await bookTour(pool, fakeTourInput(SLOT, { phone: "360-555-0100", smsConsent: true }), "key-0000001", {
      now,
      messagingMode: "approval",
    });
    expect(res.replayed).toBe(false);
    const lead = await pool.query("SELECT stage FROM leads WHERE id = $1", [res.leadId]);
    expect(lead.rows[0].stage).toBe("tour_booked");
    const outbox = await pool.query("SELECT template, status FROM outbox_messages ORDER BY template");
    expect(outbox.rows.map((r) => r.template)).toEqual([
      "staff_new_tour",
      "tour_confirmation_email",
      "tour_confirmation_sms",
      "tour_reminder_24h_email",
      "tour_reminder_2h_sms",
    ]);
    expect(outbox.rows.every((r) => r.status === "awaiting_approval")).toBe(true);
    const events = await pool.query("SELECT name FROM funnel_events");
    expect(events.rows).toEqual([{ name: "tour_booked" }]);
  });

  it("writes no messages in off mode and no texts without consent", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT), "key-0000002", { now, messagingMode: "off" });
    expect((await pool.query("SELECT count(*)::int AS n FROM outbox_messages")).rows[0].n).toBe(0);
    await bookTour(pool, fakeTourInput("2026-11-30T20:00:00.000Z", { email: "other@example.com", phone: "360-555-0101" }), "key-0000003", {
      now,
      messagingMode: "auto",
    });
    const channels = await pool.query("SELECT DISTINCT channel FROM outbox_messages");
    expect(channels.rows.map((r) => r.channel).sort()).toEqual(["email", "internal"]);
  });

  it("lets exactly one of many visitors take a slot at the same moment", async () => {
    const pool = testPool();
    const attempts = await Promise.allSettled(
      Array.from({ length: 10 }, (_, i) =>
        bookTour(pool, fakeTourInput(SLOT, { email: `racer${i}@example.com` }), `race-key-${i}-xx`, { now, messagingMode: "off" }),
      ),
    );
    expect(attempts.filter((a) => a.status === "fulfilled")).toHaveLength(1);
    const rejected = attempts.filter((a): a is PromiseRejectedResult => a.status === "rejected");
    expect(rejected.every((r) => r.reason instanceof SlotUnavailableError)).toBe(true);
    expect((await pool.query("SELECT count(*)::int AS n FROM tours")).rows[0].n).toBe(1);
  });

  it("returns the same tour when a request is retried, even concurrently", async () => {
    const pool = testPool();
    const input = fakeTourInput(SLOT);
    const results = await Promise.all(
      Array.from({ length: 5 }, () => bookTour(pool, input, "retry-key-01", { now, messagingMode: "approval" })),
    );
    expect(new Set(results.map((r) => r.tourId)).size).toBe(1);
    expect((await pool.query("SELECT count(*)::int AS n FROM tours")).rows[0].n).toBe(1);
    expect((await pool.query("SELECT count(*)::int AS n FROM outbox_messages")).rows[0].n).toBe(3);
    expect((await pool.query("SELECT count(*)::int AS n FROM funnel_events")).rows[0].n).toBe(1);
  });

  it("refuses to reuse a key for a different booking", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT), "reuse-key-01", { now, messagingMode: "off" });
    await expect(
      bookTour(pool, fakeTourInput("2026-11-30T20:00:00.000Z"), "reuse-key-01", { now, messagingMode: "off" }),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });

  it("rejects off-schedule times, short notice, honeypots and event days", async () => {
    const pool = testPool();
    await expect(bookTour(pool, fakeTourInput("2026-11-30T18:30:00.000Z"), "bad-time-01", { now })).rejects.toBeInstanceOf(ValidationError);
    await expect(bookTour(pool, fakeTourInput("2026-11-24T18:00:00.000Z"), "too-soon-01", { now })).rejects.toBeInstanceOf(SlotUnavailableError);
    await expect(bookTour(pool, fakeTourInput(SLOT, { company: "spam" }), "honeypot-01", { now })).rejects.toBeInstanceOf(ValidationError);
    await reserveDate(pool, { date: toIsoDate("2026-11-30"), pkg: "pavilion", kind: "booking", now });
    await expect(bookTour(pool, fakeTourInput(SLOT), "event-day-01", { now })).rejects.toBeInstanceOf(SlotUnavailableError);
  });

  it("updates an existing lead instead of duplicating it", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT, { phone: "360-555-0100" }), "lead-key-01", { now, messagingMode: "off" });
    await bookTour(pool, fakeTourInput("2026-12-01T18:00:00.000Z", { email: "TEST.couple@example.com" }), "lead-key-02", { now, messagingMode: "off" });
    const { rows } = await pool.query("SELECT phone FROM leads");
    expect(rows).toEqual([{ phone: "360-555-0100" }]);
  });
});

describe("listOpenSlots", () => {
  it("hides taken slots and event days", async () => {
    const pool = testPool();
    const before = await listOpenSlots(pool, now);
    expect(before.some((s) => s.startsAt === SLOT)).toBe(true);
    await bookTour(pool, fakeTourInput(SLOT), "slots-key-01", { now, messagingMode: "off" });
    await reserveDate(pool, { date: toIsoDate("2026-12-01"), pkg: "pavilion", kind: "booking", now });
    const after = await listOpenSlots(pool, now);
    expect(after.some((s) => s.startsAt === SLOT)).toBe(false);
    expect(after.some((s) => s.date === "2026-12-01")).toBe(false);
    expect(after.length).toBe(before.length - 1 - 4); // one slot booked, Tuesday's four slots blocked
  });
});
