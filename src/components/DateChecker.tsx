"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import type { AlternativeDate } from "@/lib/alternatives";
import { getSessionId, track } from "@/lib/analytics/client";
import { formatLongDate, formatShortDate, weekdayName, type IsoDate } from "@/lib/dates";
import { PACKAGE_INFO, PACKAGES, type PackageId } from "@/lib/venue";
import type { DateCheckResult } from "@/server/booking/availability";
import { SITE } from "@/content/site";
import { PhoneLink } from "./TrackedLink";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: DateCheckResult }
  | { kind: "error"; message: string; offline: boolean };

function tourHref(date: string, pkg: PackageId): string {
  return `/book-a-tour?${new URLSearchParams({ date, package: pkg }).toString()}`;
}

export function DateChecker({ location, initialPackage = "combination" }: { location: string; initialPackage?: PackageId }) {
  const ids = { date: useId(), pkg: useId() };
  const [date, setDate] = useState("");
  const [pkg, setPkg] = useState<PackageId>(initialPackage);
  const [state, setState] = useState<State>({ kind: "idle" });
  const started = useRef(false);
  const resultRef = useRef<HTMLDivElement>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    setState({ kind: "loading" });
    try {
      const res = await fetch(`/api/availability?${new URLSearchParams({ date, package: pkg })}`, {
        headers: { "x-session-id": getSessionId() },
        cache: "no-store",
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setState({
          kind: "error",
          message: body?.error?.message ?? "We couldn't check that date just now.",
          offline: res.status >= 500,
        });
        return;
      }
      const result = body as DateCheckResult;
      track("date_checked", { location, date: result.date, package: result.package, status: result.status });
      setState({ kind: "result", result });
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setState({ kind: "error", message: "We couldn't reach the calendar.", offline: true });
    }
  }

  function onFirstInteraction() {
    if (started.current) return;
    started.current = true;
    track("date_check_started", { location });
  }

  return (
    <div className="checker">
      <form className="checker-form" onSubmit={check} onFocus={onFirstInteraction}>
        <div className="field">
          <label htmlFor={ids.date}>Your wedding date</label>
          <input id={ids.date} type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={ids.pkg}>Where</label>
          <select id={ids.pkg} value={pkg} onChange={(e) => setPkg(e.target.value as PackageId)}>
            {PACKAGES.map((p) => (
              <option key={p} value={p}>
                {PACKAGE_INFO[p].short}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary" type="submit" disabled={state.kind === "loading"}>
          {state.kind === "loading" ? "Checking…" : "Check my date"}
        </button>
      </form>

      <div ref={resultRef} tabIndex={-1} aria-live="polite" className="checker-result-wrap">
        {state.kind === "error" && (
          <div className="result result-error">
            <p>{state.message}</p>
            <p>
              Call us at <PhoneLink location={`${location}:checker_error`}>{SITE.phoneDisplay}</PhoneLink>
              {state.offline ? " and we'll check the calendar for you." : "."}
            </p>
          </div>
        )}
        {state.kind === "result" && <Result result={state.result} location={location} />}
      </div>
    </div>
  );
}

function Result({ result, location }: { result: DateCheckResult; location: string }) {
  const pkgName = PACKAGE_INFO[result.package].short;
  const longDate = formatLongDate(result.date);

  if (result.status === "past") {
    return <div className="result result-muted">That date has passed. Pick a date in the future.</div>;
  }
  if (result.status === "too_far") {
    return (
      <div className="result result-muted">
        <p>We haven&apos;t opened that far ahead yet. Book a tour and we&apos;ll note your date.</p>
        <Link className="btn btn-primary" href={tourHref(result.date, result.package)}>Book a tour</Link>
      </div>
    );
  }

  const available = result.status === "available";
  return (
    <div className={`result ${available ? "result-open" : "result-taken"}`}>
      {available && (
        <>
          <p className="result-head">
            <span className="badge badge-open">Open</span> {longDate} is available for {pkgName}.
          </p>
          <p className="result-price">{result.price.label}</p>
          <Notes notes={result.notes} />
          <p>Dates go fast. The quickest way to secure it is to see it in person.</p>
          <Link
            className="btn btn-primary btn-lg"
            href={tourHref(result.date, result.package)}
            onClick={() => track("cta_clicked", { location: `${location}:result_open`, date: result.date })}
          >
            Book a tour for this date
          </Link>
        </>
      )}
      {result.status === "unavailable" && (
        <p className="result-head">
          <span className="badge badge-taken">Booked</span> {longDate} is taken for {pkgName}, but these nearby dates are open:
        </p>
      )}
      {result.status === "too_soon" && (
        <p className="result-head">{longDate} is too soon for us to plan well. Here are the closest dates we can do:</p>
      )}

      {!available && (
        <>
          {result.alternatives.length > 0 ? (
            <ul className="alt-list">
              {result.alternatives.map((alt) => (
                <AltRow key={alt.date} alt={alt} pkg={result.package} location={location} />
              ))}
              {result.offSeasonPick && <AltRow alt={result.offSeasonPick} pkg={result.package} location={location} />}
            </ul>
          ) : (
            <p>Nothing nearby is open for {pkgName}. Try another package or month, or book a tour and we&apos;ll find you a date.</p>
          )}
          <Link className="btn btn-secondary" href={tourHref(result.date, result.package)}>
            Book a tour and talk dates with us
          </Link>
        </>
      )}
    </div>
  );
}

function AltRow({ alt, pkg, location }: { alt: AlternativeDate; pkg: PackageId; location: string }) {
  const tag = alt.reason === "off_season_value" ? "Off-season" : weekdayName(alt.date as IsoDate);
  return (
    <li className="alt-row">
      <div>
        <strong>{formatShortDate(alt.date as IsoDate)}</strong>
        <span className="alt-tag">{tag}</span>
        <span className="alt-price">{alt.price.label}</span>
      </div>
      <Link
        className="btn btn-small btn-primary"
        href={tourHref(alt.date, pkg)}
        onClick={() => track("alternative_date_selected", { location, date: alt.date, reason: alt.reason, offset_days: alt.offsetDays })}
      >
        Tour for this date
      </Link>
    </li>
  );
}

function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <ul className="result-notes">
      {notes.map((n) => (
        <li key={n}>{n}</li>
      ))}
    </ul>
  );
}
