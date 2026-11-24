import type { EventProps, FunnelEventName } from "@/lib/analytics/events";
import type { Queryable } from "./db";

/** Record a funnel event. Analytics must never break a booking, so failures are logged and swallowed. */
export async function recordEvent(
  db: Queryable,
  name: FunnelEventName,
  props: EventProps = {},
  opts: { sessionId?: string | null; leadId?: string | null } = {},
): Promise<void> {
  try {
    await db.query(`INSERT INTO funnel_events (name, session_id, lead_id, props) VALUES ($1, $2, $3, $4)`, [
      name,
      opts.sessionId ?? null,
      opts.leadId ?? null,
      props,
    ]);
  } catch (err) {
    console.error(`[analytics] could not record ${name}:`, (err as Error).message);
  }
}
