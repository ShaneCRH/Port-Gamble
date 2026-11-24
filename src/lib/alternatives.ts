import { BOOKING_RULES } from "./booking-rules";
import { addDays, diffDays, weekday, type IsoDate } from "./dates";
import { quote, seasonOf, type PriceQuote } from "./pricing";
import type { PackageId } from "./venue";

export interface AlternativeDate {
  date: IsoDate;
  /** Days from the requested date (negative = earlier). */
  offsetDays: number;
  price: PriceQuote;
  reason: "nearby" | "off_season_value";
}

export interface SuggestInput {
  requested: IsoDate;
  pkg: PackageId;
  /** True when every space the package needs is free on that date. */
  isOpen: (date: IsoDate) => boolean;
  /** Earliest and latest dates that may be suggested (inclusive). */
  minDate: IsoDate;
  maxDate: IsoDate;
  windowDays?: number;
  limit?: number;
}

/** Weekdays cost more "distance" so Fridays and Sundays rank ahead of a Tuesday. */
const MID_WEEK_PENALTY_DAYS = 14;

function score(offsetDays: number, date: IsoDate): number {
  const wd = weekday(date);
  const midweek = wd >= 1 && wd <= 4;
  return Math.abs(offsetDays) + (midweek ? MID_WEEK_PENALTY_DAYS : 0);
}

/**
 * Nearby open dates when the requested date is taken (or as extra options when it's open).
 * Deterministic: ties break on the earlier date. Pure, so it's easy to test.
 */
export function suggestNearbyDates(input: SuggestInput): AlternativeDate[] {
  const window = input.windowDays ?? BOOKING_RULES.alternativeWindowDays;
  const limit = input.limit ?? BOOKING_RULES.alternativeCount;
  const candidates: { date: IsoDate; offset: number; score: number }[] = [];

  for (let offset = -window; offset <= window; offset++) {
    if (offset === 0) continue;
    const date = addDays(input.requested, offset);
    if (date < input.minDate || date > input.maxDate) continue;
    if (!input.isOpen(date)) continue;
    candidates.push({ date, offset, score: score(offset, date) });
  }

  candidates.sort((a, b) => a.score - b.score || (a.date < b.date ? -1 : 1));

  return candidates.slice(0, limit).map((c) => ({
    date: c.date,
    offsetDays: c.offset,
    price: quote(c.date, input.pkg),
    reason: "nearby" as const,
  }));
}

/**
 * For a peak-season request, the nearest open off-season Friday, Saturday or Sunday
 * after it: the "fewer crowds, same view" option. Null if none is found.
 */
export function suggestOffSeasonDate(input: Omit<SuggestInput, "windowDays" | "limit">): AlternativeDate | null {
  if (seasonOf(input.requested) !== "peak") return null;
  for (let offset = 1; offset <= BOOKING_RULES.offSeasonSearchDays; offset++) {
    const date = addDays(input.requested, offset);
    if (date > input.maxDate) break;
    if (date < input.minDate) continue;
    if (seasonOf(date) !== "offPeak") continue;
    const wd = weekday(date);
    if (wd < 5) continue;
    if (!input.isOpen(date)) continue;
    return { date, offsetDays: diffDays(date, input.requested), price: quote(date, input.pkg), reason: "off_season_value" };
  }
  return null;
}
