import { TOUR_SCHEDULE } from "./booking-rules";
import { addDays, venueDateOf, venueToday, venueWallClockToInstant, weekday, type IsoDate } from "./dates";

export interface TourSlot {
  /** UTC instant, ISO 8601. This string is the slot's identity. */
  startsAt: string;
  /** The venue calendar date the slot falls on. */
  date: IsoDate;
}

export interface SlotOptions {
  now: Date;
  /** Venue dates on which no tours are offered (e.g. a wedding in the Pavilion). */
  blockedDates?: ReadonlySet<string>;
  horizonDays?: number;
}

/** Holidays with no tours: the fixed dates in TOUR_SCHEDULE plus US Thanksgiving. */
export function isClosedDay(date: IsoDate): boolean {
  const md = date.slice(5);
  if ((TOUR_SCHEDULE.closedMonthDays as readonly string[]).includes(md)) return true;
  // Thanksgiving: the fourth Thursday of November (day 22 to 28).
  const day = Number(date.slice(8));
  return date.slice(5, 7) === "11" && weekday(date) === 4 && day >= 22 && day <= 28;
}

/** Every slot the schedule defines on one venue calendar date, ignoring notice and blocks. */
export function scheduledSlotsOn(date: IsoDate): TourSlot[] {
  if (isClosedDay(date)) return [];
  const times = TOUR_SCHEDULE.times[weekday(date)];
  return times.map(([h, m]) => ({ startsAt: venueWallClockToInstant(date, h, m).toISOString(), date }));
}

/** Slots a visitor may book right now (before removing ones already taken). */
export function bookableSlots(opts: SlotOptions): TourSlot[] {
  const horizon = opts.horizonDays ?? TOUR_SCHEDULE.horizonDays;
  const earliest = opts.now.getTime() + TOUR_SCHEDULE.minNoticeHours * 3_600_000;
  const start = venueToday(opts.now);
  const out: TourSlot[] = [];
  for (let i = 0; i <= horizon; i++) {
    const date = addDays(start, i);
    if (opts.blockedDates?.has(date)) continue;
    for (const slot of scheduledSlotsOn(date)) {
      if (Date.parse(slot.startsAt) >= earliest) out.push(slot);
    }
  }
  return out;
}

export type SlotCheck =
  | { ok: true; slot: TourSlot }
  | { ok: false; reason: "not_a_slot" | "too_soon" | "too_far" };

/** Is this exact instant a slot on the schedule, with enough notice, inside the horizon? */
export function checkSlot(startsAt: Date, now: Date): SlotCheck {
  const date = venueDateOf(startsAt);
  const iso = startsAt.toISOString();
  const slot = scheduledSlotsOn(date).find((s) => s.startsAt === iso);
  if (!slot) return { ok: false, reason: "not_a_slot" };
  if (startsAt.getTime() < now.getTime() + TOUR_SCHEDULE.minNoticeHours * 3_600_000) {
    return { ok: false, reason: "too_soon" };
  }
  const lastDate = addDays(venueToday(now), TOUR_SCHEDULE.horizonDays);
  if (date > lastDate) return { ok: false, reason: "too_far" };
  return { ok: true, slot };
}
