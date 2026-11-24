import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, DatabaseUnavailableError } from "./errors";

export interface ApiErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

export function jsonError(status: number, code: string, message: string, fields?: Record<string, string>) {
  return NextResponse.json<ApiErrorBody>({ error: { code, message, ...(fields ? { fields } : {}) } }, { status });
}

function isConnectionError(err: unknown): boolean {
  const code = typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : "";
  // Network errors, and Postgres "cannot connect now" / "too many connections" / admin shutdown.
  return ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "ECONNRESET", "57P01", "57P03", "53300"].includes(code);
}

/**
 * Wrap a route handler so every failure becomes a clean JSON error a visitor can act on.
 * Unexpected errors are logged without request bodies (which hold personal details).
 */
export function apiHandler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ZodError) {
        const fields: Record<string, string> = {};
        for (const issue of err.issues) fields[issue.path.join(".") || "_"] = issue.message;
        return jsonError(400, "invalid_request", "Please check the highlighted fields.", fields);
      }
      if (err instanceof DatabaseUnavailableError) {
        console.error("[api] database unavailable:", err.detail);
        return jsonError(503, err.code, err.message);
      }
      if (err instanceof AppError) {
        return jsonError(err.status, err.code, err.message, "fields" in err ? (err.fields as Record<string, string>) : undefined);
      }
      if (isConnectionError(err)) {
        console.error("[api] database connection failed:", (err as Error).message);
        const unavailable = new DatabaseUnavailableError("connection");
        return jsonError(503, unavailable.code, unavailable.message);
      }
      console.error("[api] unexpected error:", err instanceof Error ? `${err.name}: ${err.message}` : "unknown");
      return jsonError(500, "internal_error", "Something went wrong on our side. Please try again or call us.");
    }
  };
}

/** Constant-time check of `Authorization: Bearer <CRON_SECRET>`. Fails closed if unset. */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret === "change-me" || secret.length < 16) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = Buffer.from(`Bearer ${secret}`);
  const given = Buffer.from(header);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
