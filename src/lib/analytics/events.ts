/**
 * The conversion events the site emits. One list, shared by the browser and the server,
 * so names can't drift. Ad platforms (GA4, Google Ads, Meta) read these from the
 * dataLayer once their tags are installed; no real IDs are configured yet.
 */
export const FUNNEL_EVENTS = [
  "cta_clicked",
  "date_check_started",
  "date_checked",
  "alternative_date_selected",
  "tour_slot_selected",
  "tour_booked",
  "tour_booking_failed",
  "phone_clicked",
] as const;
export type FunnelEventName = (typeof FUNNEL_EVENTS)[number];

/**
 * Events the API records itself, authoritatively, when the action happens.
 * The browser still pushes them to the dataLayer but does not post them again.
 */
export const SERVER_RECORDED_EVENTS: ReadonlySet<FunnelEventName> = new Set(["date_checked", "tour_booked"]);

export type EventProps = Record<string, string | number | boolean>;

export function isFunnelEvent(name: unknown): name is FunnelEventName {
  return typeof name === "string" && (FUNNEL_EVENTS as readonly string[]).includes(name);
}
