import { suggestNearbyDates, suggestOffSeasonDate, type AlternativeDate } from "@/lib/alternatives";
import { BOOKING_RULES } from "@/lib/booking-rules";
import { addDays, venueToday, weekday, type IsoDate } from "@/lib/dates";
import { quote, type PriceQuote } from "@/lib/pricing";
import { PACKAGE_INFO, type PackageId, type Space } from "@/lib/venue";
import type { Queryable } from "../db";

/**
 * Reservations that block a space on a date: active bookings, blackouts, and holds that
 * haven't expired. An expired hold blocks nothing even before the sweeper marks it.
 */
const BLOCKING_SQL = `
  SELECT to_char(event_date, 'YYYY-MM-DD') AS date, space
  FROM space_reservations
  WHERE status = 'active'
    AND event_date BETWEEN $1::date AND $2::date
    AND (kind <> 'hold' OR expires_at > $3)
`;

export type BusyMap = Map<string, Set<Space>>;

export async function loadBusySpaces(db: Queryable, from: IsoDate, to: IsoDate, now: Date): Promise<BusyMap> {
  const { rows } = await db.query<{ date: string; space: Space }>(BLOCKING_SQL, [from, to, now]);
  const busy: BusyMap = new Map();
  for (const r of rows) {
    const set = busy.get(r.date) ?? new Set<Space>();
    set.add(r.space);
    busy.set(r.date, set);
  }
  return busy;
}

export function isOpenFor(busy: BusyMap, date: IsoDate, pkg: PackageId): boolean {
  const taken = busy.get(date);
  if (!taken) return true;
  return PACKAGE_INFO[pkg].spaces.every((s) => !taken.has(s));
}

export type DateCheckStatus = "available" | "unavailable" | "too_soon" | "too_far" | "past";

export interface DateCheckResult {
  date: IsoDate;
  package: PackageId;
  status: DateCheckStatus;
  price: PriceQuote;
  /** Venue-specific notes to show with the result (e.g. Sunday church hours). */
  notes: string[];
  alternatives: AlternativeDate[];
  offSeasonPick: AlternativeDate | null;
}

export function bookableWindow(now: Date): { today: IsoDate; minDate: IsoDate; maxDate: IsoDate } {
  const today = venueToday(now);
  return {
    today,
    minDate: addDays(today, BOOKING_RULES.minLeadDays),
    maxDate: addDays(today, BOOKING_RULES.maxLeadDays),
  };
}

function notesFor(date: IsoDate, pkg: PackageId): string[] {
  const notes: string[] = [];
  if (weekday(date) === 7 && pkg !== "pavilion") notes.push("On Sundays St. Paul's is available from 1 pm (morning services).");
  return notes;
}

/** The whole date-check answer in one read: status, price and open alternatives. */
export async function checkDate(db: Queryable, date: IsoDate, pkg: PackageId, now: Date): Promise<DateCheckResult> {
  const { today, minDate, maxDate } = bookableWindow(now);
  const base = { date, package: pkg, price: quote(date, pkg), notes: notesFor(date, pkg) };

  if (date < today) return { ...base, status: "past", alternatives: [], offSeasonPick: null };
  if (date > maxDate) return { ...base, status: "too_far", alternatives: [], offSeasonPick: null };

  // One query covers the date, the alternative window and the off-season search.
  const from = addDays(date, -BOOKING_RULES.alternativeWindowDays);
  const to = addDays(date, Math.max(BOOKING_RULES.alternativeWindowDays, BOOKING_RULES.offSeasonSearchDays));
  const busy = await loadBusySpaces(db, from, to, now);
  const isOpen = (d: IsoDate) => isOpenFor(busy, d, pkg);

  const suggestInput = { requested: date, pkg, isOpen, minDate, maxDate };
  const alternatives = suggestNearbyDates(suggestInput);
  const offSeasonPick = suggestOffSeasonDate(suggestInput);

  if (date < minDate) return { ...base, status: "too_soon", alternatives, offSeasonPick };
  return {
    ...base,
    status: isOpen(date) ? "available" : "unavailable",
    alternatives,
    offSeasonPick: isOpen(date) ? null : offSeasonPick,
  };
}
