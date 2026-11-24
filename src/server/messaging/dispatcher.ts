import type { Pool } from "pg";
import { withTransaction } from "../db";
import type { Providers } from "./providers";
import { render, type TemplateId } from "./templates";

const MAX_ATTEMPTS = 5;
/** A row stuck in "sending" this long is assumed abandoned by a crashed worker. */
const STALE_SENDING_MINUTES = 10;

interface ClaimedRow {
  id: string;
  channel: "email" | "sms" | "internal";
  template: TemplateId;
  idempotency_key: string;
  attempts: number;
  first_name: string | null;
  email: string | null;
  phone: string | null;
  sms_consent: boolean | null;
  starts_at: Date | null;
}

export interface DispatchSummary {
  claimed: number;
  sent: number;
  failed: number;
  retrying: number;
}

/**
 * Send due, queued messages. Rows are claimed with FOR UPDATE SKIP LOCKED so several
 * dispatchers can run at once without double-sending, and each send uses the row's
 * idempotency key so a provider retry can't duplicate it either.
 * Only status = 'queued' rows are ever sent; awaiting_approval rows are never touched.
 */
export async function dispatchDue(pool: Pool, providers: Providers, opts: { now?: Date; batch?: number; staffEmail?: string } = {}): Promise<DispatchSummary> {
  const now = opts.now ?? new Date();
  const batch = opts.batch ?? 25;

  // Release rows a crashed worker left in "sending".
  await pool.query(
    `UPDATE outbox_messages SET status = 'queued', updated_at = now()
     WHERE status = 'sending' AND updated_at < $1::timestamptz - make_interval(mins => $2)`,
    [now, STALE_SENDING_MINUTES],
  );

  const claimed = await withTransaction(pool, async (tx) => {
    const { rows } = await tx.query<ClaimedRow>(
      `SELECT o.id, o.channel, o.template, o.idempotency_key, o.attempts,
              l.first_name, l.email::text AS email, l.phone, l.sms_consent, t.starts_at
       FROM outbox_messages o
       LEFT JOIN leads l ON l.id = o.lead_id
       LEFT JOIN tours t ON t.id = o.tour_id
       WHERE o.status = 'queued' AND o.send_after <= $1
       ORDER BY o.send_after
       LIMIT $2
       FOR UPDATE OF o SKIP LOCKED`,
      [now, batch],
    );
    if (rows.length > 0) {
      await tx.query(`UPDATE outbox_messages SET status = 'sending', updated_at = now() WHERE id = ANY($1::uuid[])`, [rows.map((r) => r.id)]);
    }
    return rows;
  });

  const summary: DispatchSummary = { claimed: claimed.length, sent: 0, failed: 0, retrying: 0 };

  for (const row of claimed) {
    try {
      await deliver(row, providers, opts.staffEmail);
      await pool.query(`UPDATE outbox_messages SET status = 'sent', attempts = attempts + 1, last_error = NULL, updated_at = now() WHERE id = $1`, [row.id]);
      summary.sent++;
    } catch (err) {
      const attempts = row.attempts + 1;
      const final = attempts >= MAX_ATTEMPTS || err instanceof PermanentDeliveryError;
      const backoffMinutes = 2 ** attempts;
      await pool.query(
        `UPDATE outbox_messages
         SET status = $2, attempts = $3, last_error = $4,
             send_after = now() + make_interval(mins => $5), updated_at = now()
         WHERE id = $1`,
        [row.id, final ? "failed" : "queued", attempts, (err as Error).message.slice(0, 500), backoffMinutes],
      );
      if (final) summary.failed++;
      else summary.retrying++;
    }
  }
  return summary;
}

export class PermanentDeliveryError extends Error {}

async function deliver(row: ClaimedRow, providers: Providers, staffEmail?: string): Promise<void> {
  if (!row.starts_at || !row.first_name) throw new PermanentDeliveryError("Message has no tour or lead to describe");
  const content = render(row.template, { firstName: row.first_name, startsAt: row.starts_at.toISOString() });

  if (row.channel === "sms") {
    if (!row.phone || !row.sms_consent) throw new PermanentDeliveryError("No phone number or no SMS consent");
    await providers.sms.send({ to: row.phone, body: content.text, idempotencyKey: row.idempotency_key });
    return;
  }
  const to = row.channel === "internal" ? staffEmail : row.email;
  if (!to) throw new PermanentDeliveryError(row.channel === "internal" ? "STAFF_NOTIFY_EMAIL is not set" : "Lead has no email");
  await providers.email.send({ to, subject: content.subject ?? "Port Gamble Weddings", text: content.text, idempotencyKey: row.idempotency_key });
}
