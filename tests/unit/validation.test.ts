import { describe, expect, it } from "vitest";
import { availabilityQuerySchema, bookTourSchema, idempotencyKeySchema } from "@/lib/validation";
import { messagingMode } from "@/server/messaging/config";

const valid = {
  startsAt: "2026-11-30T18:00:00.000Z",
  firstName: " Test ",
  lastName: "Couple",
  email: "Test.Couple@Example.com",
};

describe("validation", () => {
  it("normalises a valid tour request", () => {
    const out = bookTourSchema.parse(valid);
    expect(out.firstName).toBe("Test");
    expect(out.email).toBe("test.couple@example.com");
    expect(out.startsAt).toBeInstanceOf(Date);
    expect(out.smsConsent).toBe(false);
    expect(out.utm).toEqual({});
  });

  it("rejects bad email, phone and dates", () => {
    expect(bookTourSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(bookTourSchema.safeParse({ ...valid, phone: "12" }).success).toBe(false);
    expect(bookTourSchema.safeParse({ ...valid, weddingDate: "2027-02-30" }).success).toBe(false);
    expect(bookTourSchema.safeParse({ ...valid, startsAt: "tomorrow" }).success).toBe(false);
    expect(bookTourSchema.safeParse({ ...valid, utm: { evil: "x" } }).success).toBe(false);
  });

  it("treats an empty phone as no phone", () => {
    expect(bookTourSchema.parse({ ...valid, phone: "" }).phone).toBeUndefined();
    expect(bookTourSchema.parse({ ...valid, phone: "(360) 555-0100" }).phone).toBe("(360) 555-0100");
  });

  it("defaults the package for date checks", () => {
    expect(availabilityQuerySchema.parse({ date: "2027-06-12" }).package).toBe("combination");
    expect(availabilityQuerySchema.safeParse({ date: "2027-06-12", package: "barn" }).success).toBe(false);
  });

  it("checks idempotency keys", () => {
    expect(idempotencyKeySchema.safeParse("3f1c2b8e-0d4a-4c2e-9b7a-2f0e5c1d9a77").success).toBe(true);
    expect(idempotencyKeySchema.safeParse("short").success).toBe(false);
    expect(idempotencyKeySchema.safeParse("has spaces in it!").success).toBe(false);
  });

  it("falls back to approval for unknown messaging modes", () => {
    expect(messagingMode({ MESSAGING_MODE: "auto" } as unknown as NodeJS.ProcessEnv)).toBe("auto");
    expect(messagingMode({ MESSAGING_MODE: "yes please" } as unknown as NodeJS.ProcessEnv)).toBe("approval");
    expect(messagingMode({} as unknown as NodeJS.ProcessEnv)).toBe("approval");
  });
});
