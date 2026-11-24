import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { bookTour } from "@/server/booking/tours";
import { dispatchDue } from "@/server/messaging/dispatcher";
import { LogEmailProvider, LogSmsProvider, type EmailProvider } from "@/server/messaging/providers";
import { closePool, fakeTourInput, resetData, testPool } from "./helpers";

const now = new Date("2026-11-24T15:00:00Z");
const SLOT = "2026-11-30T18:00:00.000Z";

beforeEach(resetData);
afterAll(closePool);

describe("dispatchDue", () => {
  it("never sends messages awaiting approval", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT), "disp-key-01", { now, messagingMode: "approval" });
    const email = new LogEmailProvider();
    const summary = await dispatchDue(pool, { email, sms: new LogSmsProvider() }, { now, staffEmail: "staff@example.com" });
    expect(summary.claimed).toBe(0);
    expect(email.sent).toHaveLength(0);
  });

  it("sends due queued messages once and leaves future reminders queued", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT, { phone: "360-555-0100", smsConsent: true }), "disp-key-02", { now, messagingMode: "auto" });
    const email = new LogEmailProvider();
    const sms = new LogSmsProvider();
    const first = await dispatchDue(pool, { email, sms }, { now, staffEmail: "staff@example.com" });
    expect(first).toMatchObject({ claimed: 3, sent: 3, failed: 0 });
    expect(email.sent.map((m) => m.to).sort()).toEqual(["staff@example.com", "test.couple@example.com"]);
    expect(sms.sent).toHaveLength(1);

    const again = await dispatchDue(pool, { email, sms }, { now });
    expect(again.claimed).toBe(0); // nothing is sent twice

    const pending = await pool.query("SELECT template FROM outbox_messages WHERE status = 'queued' ORDER BY send_after");
    expect(pending.rows.map((r) => r.template)).toEqual(["tour_reminder_24h_email", "tour_reminder_2h_sms"]);
  });

  it("retries a failing provider with backoff, then marks it failed", async () => {
    const pool = testPool();
    await bookTour(pool, fakeTourInput(SLOT), "disp-key-03", { now, messagingMode: "auto" });
    await pool.query("DELETE FROM outbox_messages WHERE template <> 'tour_confirmation_email'");
    const broken: EmailProvider = { name: "broken", send: async () => { throw new Error("provider down"); } };
    let t = now;
    for (let i = 0; i < 5; i++) {
      await dispatchDue(pool, { email: broken, sms: new LogSmsProvider() }, { now: t });
      t = new Date(t.getTime() + 24 * 3_600_000); // jump past any backoff
      await pool.query("UPDATE outbox_messages SET send_after = $1 WHERE status = 'queued'", [t]);
    }
    const { rows } = await pool.query("SELECT status, attempts, last_error FROM outbox_messages");
    expect(rows[0]).toMatchObject({ status: "failed", attempts: 5, last_error: "provider down" });
  });
});
