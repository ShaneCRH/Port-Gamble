"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { getSessionId, getUtm, track } from "@/lib/analytics/client";
import { formatLongDate, formatShortDate, formatVenueDateTime, formatVenueTime, type IsoDate } from "@/lib/dates";
import type { TourSlot } from "@/lib/tour-slots";
import { PACKAGE_INFO, PACKAGES, type PackageId } from "@/lib/venue";
import { SITE } from "@/content/site";
import { PhoneLink } from "./TrackedLink";

interface Props {
  weddingDate?: string;
  initialPackage?: PackageId;
}

type SlotsState = { kind: "loading" } | { kind: "ready"; slots: TourSlot[] } | { kind: "error" };

interface FieldErrors {
  [field: string]: string;
}

async function fetchSlots(): Promise<SlotsState> {
  try {
    const res = await fetch("/api/tour-slots", { cache: "no-store" });
    if (!res.ok) return { kind: "error" };
    const body = (await res.json()) as { slots: TourSlot[] };
    return { kind: "ready", slots: body.slots };
  } catch {
    return { kind: "error" };
  }
}

export function TourBooker({ weddingDate, initialPackage }: Props) {
  const uid = useId();
  const [slotsState, setSlotsState] = useState<SlotsState>({ kind: "loading" });
  const [selected, setSelected] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [booked, setBooked] = useState<{ startsAt: string } | null>(null);
  // One key per form: a double click or a network retry can never book twice.
  const idempotencyKey = useRef<string>("");

  const applySlots = useCallback((next: SlotsState) => {
    setSlotsState(next);
    if (next.kind === "ready") {
      setActiveDate((d) => (d && next.slots.some((s) => s.date === d) ? d : (next.slots[0]?.date ?? null)));
    }
  }, []);

  const reloadSlots = useCallback(() => {
    setSlotsState({ kind: "loading" });
    void fetchSlots().then(applySlots);
  }, [applySlots]);

  useEffect(() => {
    idempotencyKey.current = crypto.randomUUID();
    let cancelled = false;
    void fetchSlots().then((next) => {
      if (!cancelled) applySlots(next);
    });
    return () => {
      cancelled = true;
    };
  }, [applySlots]);

  const byDate = useMemo(() => {
    const map = new Map<string, TourSlot[]>();
    if (slotsState.kind === "ready") {
      for (const s of slotsState.slots) map.set(s.date, [...(map.get(s.date) ?? []), s]);
    }
    return map;
  }, [slotsState]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) {
      setMessage("Pick a tour time first.");
      return;
    }
    const form = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = form.get(k);
      return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
    };
    const guest = get("guestCount");
    const payload = {
      startsAt: selected,
      firstName: get("firstName"),
      lastName: get("lastName"),
      email: get("email"),
      phone: get("phone") ?? "",
      smsConsent: form.get("smsConsent") === "on",
      weddingDate: get("weddingDate"),
      package: get("package"),
      guestCount: guest ? Number(guest) : undefined,
      notes: get("notes"),
      company: get("company"),
      utm: getUtm(),
      sessionId: getSessionId(),
    };

    setSubmitting(true);
    setMessage(null);
    setFieldErrors({});
    try {
      const res = await fetch("/api/tours", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": idempotencyKey.current },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => null);
      if (res.ok) {
        track("tour_booked", { package: payload.package ?? "unknown", has_wedding_date: Boolean(payload.weddingDate) });
        setBooked({ startsAt: body.startsAt });
        return;
      }
      const code: string = body?.error?.code ?? "error";
      track("tour_booking_failed", { code });
      setMessage(body?.error?.message ?? "We couldn't book that tour.");
      if (body?.error?.fields) setFieldErrors(body.error.fields);
      if (code === "slot_unavailable") {
        setSelected(null);
        reloadSlots();
      }
    } catch {
      track("tour_booking_failed", { code: "network" });
      setMessage("We couldn't reach our calendar. Please try again, or call us.");
    } finally {
      setSubmitting(false);
    }
  }

  if (booked) {
    return (
      <div className="result result-open booked">
        <p className="result-head">You&apos;re booked for {formatVenueDateTime(new Date(booked.startsAt))}.</p>
        <p>We&apos;ll meet you at the Hood Canal Vista Pavilion. Parking is free.</p>
        <p>
          Need to change it? Call <PhoneLink location="tour_confirmed">{SITE.phoneDisplay}</PhoneLink>.
        </p>
      </div>
    );
  }

  const err = (k: string) => (fieldErrors[k] ? <span className="field-error">{fieldErrors[k]}</span> : null);

  return (
    <form className="booker" onSubmit={submit} noValidate={false}>
      <fieldset className="booker-slots">
        <legend>1. Pick a tour time (Pacific time)</legend>
        {slotsState.kind === "loading" && <p className="muted">Loading open times…</p>}
        {slotsState.kind === "error" && (
          <p className="result-error">
            We couldn&apos;t load tour times. Call <PhoneLink location="slots_error">{SITE.phoneDisplay}</PhoneLink> and we&apos;ll book you in.
          </p>
        )}
        {slotsState.kind === "ready" && byDate.size === 0 && (
          <p>No open tour times right now. Call <PhoneLink location="slots_empty">{SITE.phoneDisplay}</PhoneLink>.</p>
        )}
        {byDate.size > 0 && (
          <>
            <div className="day-strip" role="tablist" aria-label="Tour days">
              {[...byDate.keys()].map((d) => (
                <button
                  key={d}
                  type="button"
                  role="tab"
                  aria-selected={d === activeDate}
                  className={`day-chip ${d === activeDate ? "is-active" : ""}`}
                  onClick={() => setActiveDate(d)}
                >
                  {formatShortDate(d as IsoDate)}
                </button>
              ))}
            </div>
            <div className="time-grid">
              {(activeDate ? (byDate.get(activeDate) ?? []) : []).map((s) => (
                <button
                  key={s.startsAt}
                  type="button"
                  aria-pressed={selected === s.startsAt}
                  className={`time-chip ${selected === s.startsAt ? "is-selected" : ""}`}
                  onClick={() => {
                    setSelected(s.startsAt);
                    track("tour_slot_selected", { date: s.date });
                  }}
                >
                  {formatVenueTime(new Date(s.startsAt))}
                </button>
              ))}
            </div>
          </>
        )}
      </fieldset>

      <fieldset className="booker-details">
        <legend>2. Your details</legend>
        <div className="grid-2">
          <div className="field">
            <label htmlFor={`${uid}-fn`}>First name</label>
            <input id={`${uid}-fn`} name="firstName" required maxLength={80} autoComplete="given-name" />
            {err("firstName")}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-ln`}>Last name</label>
            <input id={`${uid}-ln`} name="lastName" required maxLength={80} autoComplete="family-name" />
            {err("lastName")}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-em`}>Email</label>
            <input id={`${uid}-em`} name="email" type="email" required maxLength={254} autoComplete="email" />
            {err("email")}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-ph`}>Mobile (optional)</label>
            <input id={`${uid}-ph`} name="phone" type="tel" maxLength={32} autoComplete="tel" />
            {err("phone")}
          </div>
        </div>
        <label className="check">
          <input type="checkbox" name="smsConsent" /> Text me my confirmation and reminders. Msg &amp; data rates may apply; reply STOP to opt out.
        </label>
        <div className="grid-3">
          <div className="field">
            <label htmlFor={`${uid}-wd`}>Wedding date (if you have one)</label>
            <input id={`${uid}-wd`} name="weddingDate" type="date" defaultValue={weddingDate} />
            {err("weddingDate")}
          </div>
          <div className="field">
            <label htmlFor={`${uid}-pk`}>Interested in</label>
            <select id={`${uid}-pk`} name="package" defaultValue={initialPackage ?? ""}>
              <option value="">Not sure yet</option>
              {PACKAGES.map((p) => (
                <option key={p} value={p}>
                  {PACKAGE_INFO[p].short}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor={`${uid}-gc`}>Guests (approx.)</label>
            <input id={`${uid}-gc`} name="guestCount" type="number" min={1} max={1000} inputMode="numeric" />
            {err("guestCount")}
          </div>
        </div>
        <div className="field">
          <label htmlFor={`${uid}-nt`}>Anything we should know? (optional)</label>
          <textarea id={`${uid}-nt`} name="notes" rows={3} maxLength={2000} />
        </div>
        {/* Honeypot for bots; hidden from people and screen readers. */}
        <div className="hp" aria-hidden="true">
          <label>
            Company <input name="company" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </fieldset>

      {weddingDate && <p className="muted">We&apos;ll bring the calendar for {formatLongDate(weddingDate as IsoDate)} to your tour.</p>}
      {message && (
        <p className="result-error" role="alert">
          {message}
        </p>
      )}
      <button className="btn btn-primary btn-lg" type="submit" disabled={submitting || !selected}>
        {submitting ? "Booking…" : selected ? `Book my tour: ${formatVenueDateTime(new Date(selected))}` : "Pick a time above"}
      </button>
    </form>
  );
}
