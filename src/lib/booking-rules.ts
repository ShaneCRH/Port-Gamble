/**
 * Business rules for date-check and tours, in one place so they're easy to change.
 * Items marked ASSUMPTION have not been confirmed with the venue team yet.
 */
export const BOOKING_RULES = {
  /** Earliest wedding date a couple can check, in days from today. ASSUMPTION. */
  minLeadDays: 14,
  /** Latest wedding date a couple can check, in days from today (about 3 years). */
  maxLeadDays: 3 * 366,
  /** How far either side of the requested date we look for open alternatives. */
  alternativeWindowDays: 42,
  /** How many alternatives to suggest. */
  alternativeCount: 4,
  /** How far ahead we look for an off-season (Oct to Apr) value date. */
  offSeasonSearchDays: 200,
} as const;

/** Tour schedule in venue wall-clock time. ASSUMPTION: confirm days and times with the event team. */
export const TOUR_SCHEDULE = {
  durationMinutes: 60,
  /** Earliest bookable slot, in hours from now. */
  minNoticeHours: 12,
  /** How many days ahead tours can be booked. */
  horizonDays: 21,
  /** Times by ISO weekday (1 = Monday ... 7 = Sunday), as [hour, minute]. */
  times: {
    1: [[10, 0], [12, 0], [14, 0], [16, 0]],
    2: [[10, 0], [12, 0], [14, 0], [16, 0]],
    3: [[10, 0], [12, 0], [14, 0], [16, 0]],
    4: [[10, 0], [12, 0], [14, 0], [16, 0]],
    5: [[10, 0], [12, 0], [14, 0]],
    6: [[10, 0], [12, 0]],
    7: [],
  } as Record<1 | 2 | 3 | 4 | 5 | 6 | 7, ReadonlyArray<readonly [number, number]>>,
  /** Fixed-date closures as MM-DD. Thanksgiving is added in code. ASSUMPTION. */
  closedMonthDays: ["01-01", "07-04", "12-24", "12-25", "12-31"],
  /** No tours on a day the Pavilion hosts a booked event. ASSUMPTION. */
  blockOnPavilionEventDays: true,
} as const;

/** Holds expire after this many days unless converted to a booking. ASSUMPTION. */
export const HOLD_DEFAULT_DAYS = 7;
