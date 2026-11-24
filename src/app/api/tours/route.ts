import { NextResponse } from "next/server";
import { bookTourSchema, idempotencyKeySchema } from "@/lib/validation";
import { bookTour } from "@/server/booking/tours";
import { getPool } from "@/server/db";
import { ValidationError } from "@/server/errors";
import { apiHandler } from "@/server/http";

export const dynamic = "force-dynamic";

/**
 * POST /api/tours with an `Idempotency-Key` header (a UUID per form submission).
 * Retrying with the same key returns the original booking; it never books twice.
 */
export const POST = apiHandler(async (request: Request) => {
  const key = idempotencyKeySchema.safeParse(request.headers.get("idempotency-key"));
  if (!key.success) throw new ValidationError("Missing or invalid Idempotency-Key header.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError("Request body must be JSON.");
  }
  const input = bookTourSchema.parse(body);
  const result = await bookTour(getPool(), input, key.data);
  return NextResponse.json(result, { status: result.replayed ? 200 : 201 });
});
