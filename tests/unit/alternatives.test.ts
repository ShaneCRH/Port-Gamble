import { describe, expect, it } from "vitest";
import { suggestNearbyDates, suggestOffSeasonDate } from "@/lib/alternatives";
import { toIsoDate, type IsoDate } from "@/lib/dates";

const minDate = toIsoDate("2026-12-08");
const maxDate = toIsoDate("2029-12-01");

function openExcept(taken: string[]) {
  const set = new Set(taken);
  return (d: IsoDate) => !set.has(d);
}

describe("suggestNearbyDates", () => {
  it("offers the Friday and Sunday around a taken Saturday first", () => {
    const res = suggestNearbyDates({
      requested: toIsoDate("2027-06-12"),
      pkg: "combination",
      isOpen: openExcept(["2027-06-12"]),
      minDate,
      maxDate,
    });
    expect(res.map((r) => r.date).slice(0, 2)).toEqual(["2027-06-11", "2027-06-13"]);
    expect(res[0]?.price.amount).toBe(6450);
  });

  it("ranks a weekend a week away above a weekday two days away", () => {
    const res = suggestNearbyDates({
      requested: toIsoDate("2027-06-12"),
      pkg: "pavilion",
      isOpen: openExcept(["2027-06-11", "2027-06-12", "2027-06-13"]),
      minDate,
      maxDate,
      limit: 2,
    });
    // Sun Jun 6 and Fri Jun 18 (6 days away) beat Thu Jun 10 (2 days away, but midweek).
    expect(res.map((r) => r.date)).toEqual(["2027-06-06", "2027-06-18"]);
  });

  it("never suggests dates outside the bookable window", () => {
    const res = suggestNearbyDates({
      requested: toIsoDate("2026-12-12"),
      pkg: "pavilion",
      isOpen: () => true,
      minDate,
      maxDate,
      limit: 50,
    });
    expect(res.every((r) => r.date >= minDate)).toBe(true);
  });

  it("returns nothing when everything nearby is taken", () => {
    const res = suggestNearbyDates({ requested: toIsoDate("2027-06-12"), pkg: "pavilion", isOpen: () => false, minDate, maxDate });
    expect(res).toEqual([]);
  });
});

describe("suggestOffSeasonDate", () => {
  it("finds the first open off-season weekend day after a peak request", () => {
    const pick = suggestOffSeasonDate({
      requested: toIsoDate("2027-08-14"),
      pkg: "combination",
      isOpen: openExcept(["2027-10-01"]),
      minDate,
      maxDate,
    });
    expect(pick?.date).toBe("2027-10-02");
    expect(pick?.reason).toBe("off_season_value");
  });

  it("is not offered for an off-season request", () => {
    expect(
      suggestOffSeasonDate({ requested: toIsoDate("2027-11-13"), pkg: "pavilion", isOpen: () => true, minDate, maxDate }),
    ).toBeNull();
  });
});
