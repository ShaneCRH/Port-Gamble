import { z } from "zod";
import { isIsoDate, type IsoDate } from "./dates";
import { PACKAGES } from "./venue";

export const isoDateSchema = z
  .string()
  .refine(isIsoDate, { message: "Use a real calendar date in YYYY-MM-DD form." })
  .transform((v) => v as IsoDate);

export const packageSchema = z.enum(PACKAGES);

export const availabilityQuerySchema = z.object({
  date: isoDateSchema,
  package: packageSchema.default("combination"),
});

const trimmed = (max: number) => z.string().trim().min(1).max(max);

/** Loose phone check: 7 to 15 digits once formatting is stripped. */
const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  }, { message: "Enter a phone number we can reach you on." });

const utmSchema = z
  .object({
    source: z.string().max(120).optional(),
    medium: z.string().max(120).optional(),
    campaign: z.string().max(120).optional(),
    term: z.string().max(120).optional(),
    content: z.string().max(120).optional(),
  })
  .strict()
  .default({});

export const bookTourSchema = z.object({
  startsAt: z.iso.datetime({ offset: true }).transform((v) => new Date(v)),
  firstName: trimmed(80),
  lastName: trimmed(80),
  email: z.string().trim().toLowerCase().pipe(z.email({ message: "Enter a valid email." })).pipe(z.string().max(254)),
  phone: phoneSchema.optional().or(z.literal("").transform(() => undefined)),
  smsConsent: z.boolean().default(false),
  weddingDate: isoDateSchema.optional(),
  package: packageSchema.optional(),
  guestCount: z.coerce.number().int().min(1).max(1000).optional(),
  notes: z.string().trim().max(2000).optional(),
  source: z.string().trim().max(120).optional(),
  utm: utmSchema,
  sessionId: z.string().max(64).optional(),
  /** Honeypot: real visitors never fill this in. */
  company: z.string().max(200).optional(),
});
export type BookTourInput = z.output<typeof bookTourSchema>;

/** Idempotency keys come from the browser (a UUID per form submission). */
export const idempotencyKeySchema = z.string().trim().min(8).max(128).regex(/^[A-Za-z0-9_\-:.]+$/);
