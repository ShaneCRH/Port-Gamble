import { describe, expect, it } from "vitest";
import { TOUR_SCHEDULE } from "@/lib/booking-rules";
import { toIsoDate } from "@/lib/dates";
import { bookableSlots, checkSlot, scheduledSlotsOn } from "@/lib/tour-slots";

describe("tour slots", () => {
  it("generates slots in venue time across the DST change", () => {
    expect(scheduledSlotsOn(toIsoDate("2027-03-12"))[0]?.startsAt).toBe("2027-03-12T18:00:00.000Z");
    expect(scheduledSlotsOn(toIsoDate("2027-03-15"))[0]?.startsAt).toBe("2027-03-15T17:00:00.000Z");
    expect(scheduledSlotsOn(toIsoDate("2027-03-14"))).toEqual([]); // Sunday: no tours
  });

  it("closes on holidays, including Thanksgiving", () => {
    expect(scheduledSlotsOn(toIsoDate("2026-11-26"))).toEqual([]); // Thanksgiving 2026
    expect(scheduledSlotsOn(toIsoDate("2027-11-25"))).toEqual([]); // Thanksgiving 2027
    expect(scheduledSlotsOn(toIsoDate("2026-12-24"))).toEqual([]);
    expect(scheduledSlotsOn(toIsoDate("2026-11-19")).length).toBeGreaterThan(0); // an ordinary Thursday
  });

  it("respects minimum notice and the horizon", () => {
    const now = new Date("2026-11-24T15:00:00Z"); // 7 am Tuesday in Port Gamble
    const slots = bookableSlots({ now });
    const earliest = now.getTime() + TOUR_SCHEDULE.minNoticeHours * 3_600_000;
    expect(slots.length).toBeGreaterThan(0);
    expect(slots.every((s) => Date.parse(s.startsAt) >= earliest)).toBe(true);
    expect(slots.at(-1)!.date <= "2026-12-15").toBe(true);
  });

  it("skips blocked dates", () => {
    const now = new Date("2026-11-24T15:00:00Z");
    const slots = bookableSlots({ now, blockedDates: new Set(["2026-11-27"]) });
    expect(slots.some((s) => s.date === "2026-11-27")).toBe(false);
  });

  it("accepts only exact scheduled times with enough notice", () => {
    const now = new Date("2026-11-24T15:00:00Z");
    expect(checkSlot(new Date("2026-11-30T18:00:00Z"), now)).toMatchObject({ ok: true }); // Mon 10 am PST
    expect(checkSlot(new Date("2026-11-30T18:15:00Z"), now)).toEqual({ ok: false, reason: "not_a_slot" });
    expect(checkSlot(new Date("2026-11-24T18:00:00Z"), now)).toEqual({ ok: false, reason: "too_soon" });
    expect(checkSlot(new Date("2027-02-01T18:00:00Z"), now)).toEqual({ ok: false, reason: "too_far" });
  });
});
