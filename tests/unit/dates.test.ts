import { describe, expect, it } from "vitest";
import { addDays, diffDays, isIsoDate, toIsoDate, venueToday, venueWallClockToInstant, weekday } from "@/lib/dates";

describe("dates", () => {
  it("validates real calendar dates only", () => {
    expect(isIsoDate("2027-06-12")).toBe(true);
    expect(isIsoDate("2027-02-30")).toBe(false);
    expect(isIsoDate("2027-6-12")).toBe(false);
    expect(isIsoDate("06/12/2027")).toBe(false);
    expect(isIsoDate(20270612)).toBe(false);
  });

  it("does calendar arithmetic across DST and year boundaries", () => {
    const d = toIsoDate("2027-03-13");
    expect(addDays(d, 1)).toBe("2027-03-14"); // US DST starts
    expect(addDays(toIsoDate("2026-12-31"), 1)).toBe("2027-01-01");
    expect(diffDays(toIsoDate("2027-11-08"), toIsoDate("2027-11-06"))).toBe(2); // DST ends Nov 7
  });

  it("knows the weekday", () => {
    expect(weekday(toIsoDate("2027-06-12"))).toBe(6); // Saturday
    expect(weekday(toIsoDate("2027-06-13"))).toBe(7); // Sunday
  });

  it("uses the venue's date, not UTC, for today", () => {
    // 05:00 UTC on Nov 25 is still 9 pm Nov 24 in Port Gamble.
    expect(venueToday(new Date("2026-11-25T05:00:00Z"))).toBe("2026-11-24");
    expect(venueToday(new Date("2026-11-25T08:30:00Z"))).toBe("2026-11-25");
  });

  it("converts venue wall-clock time to the right instant either side of DST", () => {
    expect(venueWallClockToInstant(toIsoDate("2027-03-12"), 10, 0).toISOString()).toBe("2027-03-12T18:00:00.000Z"); // PST
    expect(venueWallClockToInstant(toIsoDate("2027-03-15"), 10, 0).toISOString()).toBe("2027-03-15T17:00:00.000Z"); // PDT
  });
});
