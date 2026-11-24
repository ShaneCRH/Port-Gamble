import { describe, expect, it } from "vitest";
import { toIsoDate } from "@/lib/dates";
import { dayTypeOf, quote, seasonOf } from "@/lib/pricing";

describe("pricing", () => {
  it("classifies season and day", () => {
    expect(seasonOf(toIsoDate("2027-05-01"))).toBe("peak");
    expect(seasonOf(toIsoDate("2027-09-30"))).toBe("peak");
    expect(seasonOf(toIsoDate("2027-10-01"))).toBe("offPeak");
    expect(dayTypeOf(toIsoDate("2027-06-10"))).toBe("monThu");
    expect(dayTypeOf(toIsoDate("2027-06-11"))).toBe("fri");
  });

  it("quotes published 2027 peak rates", () => {
    expect(quote(toIsoDate("2027-06-12"), "pavilion").amount).toBe(6650);
    expect(quote(toIsoDate("2027-06-12"), "combination").amount).toBe(7250);
    expect(quote(toIsoDate("2027-06-13"), "combination").label).toBe("$6,450");
    expect(quote(toIsoDate("2027-06-10"), "pavilion").amount).toBe(5350);
  });

  it("never invents a rate that isn't published", () => {
    expect(quote(toIsoDate("2027-06-10"), "combination").amount).toBeNull(); // 2027 Mon-Thu combo not captured
    expect(quote(toIsoDate("2027-11-13"), "combination").amount).toBeNull(); // seasonal
    expect(quote(toIsoDate("2028-06-10"), "pavilion").amount).toBeNull(); // 2028 not published
    expect(quote(toIsoDate("2027-06-12"), "church").amount).toBeNull(); // hourly
    expect(quote(toIsoDate("2027-06-12"), "church").label).toContain("$400");
  });
});
