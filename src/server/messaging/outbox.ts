import type { Queryable } from "../db";
import { messagingMode, type MessagingMode } from "./config";
import type { TemplateId } from "./templates";

export interface OutboxItem {
  channel: "email" | "sms" | "internal";
  template: TemplateId;
  leadId: string;
  tourId?: string;
  sendAfter: Date;
  /** Must be unique per logical message so retries never duplicate it. */
  idempotencyKey: string;
  payload?: Record<string, unknown>;
}

/**
 * Write messages in the caller's transaction. With mode "off" nothing is written; with
 * "approval" rows wait for a person; with "auto" the dispatcher may send them.
 * Re-running with the same idempotency keys is a no-op.
 */
export async function enqueue(db: Queryable, items: OutboxItem[], mode: MessagingMode = messagingMode()): Promise<number> {
  if (mode === "off" || items.length === 0) return 0;
  const status = mode === "auto" ? "queued" : "awaiting_approval";
  let written = 0;
  for (const item of items) {
    const res = await db.query(
      `INSERT INTO outbox_messages (channel, template, lead_id, tour_id, payload, status, send_after, idempotency_key)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (idempotency_key) DO NOTHING`,
      [item.channel, item.template, item.leadId, item.tourId ?? null, item.payload ?? {}, status, item.sendAfter, item.idempotencyKey],
    );
    written += res.rowCount ?? 0;
  }
  return written;
}
