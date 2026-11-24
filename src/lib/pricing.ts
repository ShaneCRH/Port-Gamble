import { monthOf, weekday, yearOf, type IsoDate } from "./dates";
import type { PackageId } from "./venue";

/**
 * Published rates, from the live site (captured 2026-11-18; see docs/HANDOFF.md section 3).
 * `null` means the rate is not published or not captured yet. The site says so honestly
 * instead of inventing a number. Update this table when the 2028 and seasonal rate cards
 * are confirmed.
 */

export type DayType = "monThu" | "fri" | "sat" | "sun";
export type Season = "peak" | "offPeak";

type RateRow = Record<DayType, number | null>;

/** Peak season (May through September) all-day rates. */
const PEAK_RATES: Record<number, Partial<Record<PackageId, RateRow>>> = {
  2026: {
    pavilion: { monThu: 5050, fri: 5600, sat: 6350, sun: 5600 },
    combination: { monThu: 5500, fri: 5900, sat: 6950, sun: 5900 },
  },
  2027: {
    pavilion: { monThu: 5350, fri: 5850, sat: 6650, sun: 5850 },
    combination: { monThu: null, fri: 6450, sat: 7250, sun: 6450 },
  },
};

/** Church-only is hourly with a 3-hour minimum; only the extra-hour rate is published. */
export const CHURCH_EXTRA_HOUR: Record<number, number> = { 2026: 375, 2027: 400 };

/** Unconfirmed: the site says $300, the tour document says $280. */
export const PAVILION_EXTRA_HOUR = { amount: 300, confirmed: false } as const;

export function seasonOf(date: IsoDate): Season {
  const m = monthOf(date);
  return m >= 5 && m <= 9 ? "peak" : "offPeak";
}

export function dayTypeOf(date: IsoDate): DayType {
  const wd = weekday(date);
  if (wd === 5) return "fri";
  if (wd === 6) return "sat";
  if (wd === 7) return "sun";
  return "monThu";
}

export interface PriceQuote {
  /** Whole US dollars, or null when the rate isn't published. */
  amount: number | null;
  season: Season;
  dayType: DayType;
  /** Short human label, e.g. "$6,650" or "Seasonal rate shared on your tour". */
  label: string;
}

export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export function quote(date: IsoDate, pkg: PackageId): PriceQuote {
  const season = seasonOf(date);
  const dayType = dayTypeOf(date);
  const year = yearOf(date);

  if (pkg === "church") {
    const extra = CHURCH_EXTRA_HOUR[year];
    return {
      amount: null,
      season,
      dayType,
      label: extra ? `Hourly, 3-hour minimum (${formatUsd(extra)} per extra hour)` : "Hourly, 3-hour minimum",
    };
  }

  if (season === "offPeak") {
    return { amount: null, season, dayType, label: "Seasonal rate (Oct to Apr) shared on your tour" };
  }

  const amount = PEAK_RATES[year]?.[pkg]?.[dayType] ?? null;
  if (amount === null) {
    return { amount, season, dayType, label: `${year} rate shared on your tour` };
  }
  return { amount, season, dayType, label: formatUsd(amount) };
}

/** Rows for the pricing page. */
export function peakRateTable(year: number, pkg: Exclude<PackageId, "church">): RateRow | null {
  return PEAK_RATES[year]?.[pkg] ?? null;
}

export const PUBLISHED_RATE_YEARS = Object.keys(PEAK_RATES).map(Number).sort();
