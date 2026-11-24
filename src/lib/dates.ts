import { DateTime } from "luxon";

/** The venue's time zone. Every "today", tour time and calendar day is computed here. */
export const VENUE_TZ = "America/Los_Angeles";

/** A calendar date with no time zone, always formatted YYYY-MM-DD. */
export type IsoDate = string & { readonly __brand: "IsoDate" };

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE_RE.test(value)) return false;
  // Reject impossible dates like 2027-02-30.
  return DateTime.fromISO(value, { zone: "UTC" }).isValid;
}

export function toIsoDate(value: string): IsoDate {
  if (!isIsoDate(value)) throw new RangeError(`Not a valid calendar date: ${value}`);
  return value;
}

function asDt(date: IsoDate): DateTime {
  // Calendar arithmetic is done in UTC so DST never shifts a day.
  return DateTime.fromISO(date, { zone: "UTC" });
}

export function addDays(date: IsoDate, days: number): IsoDate {
  return asDt(date).plus({ days }).toISODate() as IsoDate;
}

export function diffDays(a: IsoDate, b: IsoDate): number {
  return Math.round(asDt(a).diff(asDt(b), "days").days);
}

/** 1 = Monday ... 7 = Sunday (ISO weekday). */
export function weekday(date: IsoDate): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  return asDt(date).weekday as 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

export function monthOf(date: IsoDate): number {
  return asDt(date).month;
}

export function yearOf(date: IsoDate): number {
  return asDt(date).year;
}

/** Today's calendar date at the venue, for a given instant. */
export function venueToday(now: Date = new Date()): IsoDate {
  return DateTime.fromJSDate(now, { zone: VENUE_TZ }).toISODate() as IsoDate;
}

/** The venue calendar date that an instant falls on. */
export function venueDateOf(instant: Date): IsoDate {
  return DateTime.fromJSDate(instant, { zone: VENUE_TZ }).toISODate() as IsoDate;
}

/** Convert a venue wall-clock time on a calendar date to an instant (handles DST). */
export function venueWallClockToInstant(date: IsoDate, hour: number, minute: number): Date {
  const dt = DateTime.fromISO(date, { zone: VENUE_TZ }).set({ hour, minute, second: 0, millisecond: 0 });
  return dt.toJSDate();
}

export function compareIsoDates(a: IsoDate, b: IsoDate): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Inclusive range of calendar dates. */
export function dateRange(from: IsoDate, to: IsoDate): IsoDate[] {
  const out: IsoDate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

const WEEKDAY_NAMES = ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

export function weekdayName(date: IsoDate): string {
  return WEEKDAY_NAMES[weekday(date)] ?? "";
}

/** "Saturday, June 12, 2027" */
export function formatLongDate(date: IsoDate): string {
  return asDt(date).toFormat("cccc, LLLL d, yyyy");
}

/** "Sat, Jun 12" */
export function formatShortDate(date: IsoDate): string {
  return asDt(date).toFormat("ccc, LLL d");
}

/** "Tuesday, Dec 1 at 10:00 AM" in venue time. */
export function formatVenueDateTime(instant: Date): string {
  return DateTime.fromJSDate(instant, { zone: VENUE_TZ }).toFormat("cccc, LLL d 'at' h:mm a");
}

export function formatVenueTime(instant: Date): string {
  return DateTime.fromJSDate(instant, { zone: VENUE_TZ }).toFormat("h:mm a");
}
