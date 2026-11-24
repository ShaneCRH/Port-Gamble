"use client";

import { SERVER_RECORDED_EVENTS, type EventProps, type FunnelEventName } from "./events";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const SESSION_KEY = "pgw_session";
const UTM_KEY = "pgw_utm";
const UTM_FIELDS = ["source", "medium", "campaign", "term", "content"] as const;
export type Utm = Partial<Record<(typeof UTM_FIELDS)[number], string>>;

function safeStorage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function getSessionId(): string {
  const store = safeStorage();
  const existing = store?.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  store?.setItem(SESSION_KEY, id);
  return id;
}

/** Remember the first UTM tags of the visit so a booking can be credited to its ad. */
export function captureUtm(search: string): void {
  const store = safeStorage();
  if (!store || store.getItem(UTM_KEY)) return;
  const params = new URLSearchParams(search);
  const utm: Utm = {};
  for (const f of UTM_FIELDS) {
    const v = params.get(`utm_${f}`);
    if (v) utm[f] = v.slice(0, 120);
  }
  if (Object.keys(utm).length) store.setItem(UTM_KEY, JSON.stringify(utm));
}

export function getUtm(): Utm {
  try {
    return JSON.parse(safeStorage()?.getItem(UTM_KEY) ?? "{}") as Utm;
  } catch {
    return {};
  }
}

/**
 * Emit a funnel event. It always goes to window.dataLayer (where GA4, Google Ads and Meta
 * tags pick it up once installed). Events the API doesn't record itself are also beaconed
 * to /api/events. Tracking must never throw into the UI.
 */
export function track(name: FunnelEventName, props: EventProps = {}): void {
  try {
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ event: name, ...props });
    if (SERVER_RECORDED_EVENTS.has(name)) return;
    const body = JSON.stringify({ name, props, sessionId: getSessionId() });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/events", blob)) {
      void fetch("/api/events", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true }).catch(() => undefined);
    }
  } catch {
    /* analytics is best-effort */
  }
}
