import { NextResponse } from "next/server";
import { availabilityQuerySchema } from "@/lib/validation";
import { recordEvent } from "@/server/analytics";
import { checkDate } from "@/server/booking/availability";
import { getPool } from "@/server/db";
import { apiHandler } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/availability?date=2027-06-12&package=combination */
export const GET = apiHandler(async (request: Request) => {
  const url = new URL(request.url);
  const query = availabilityQuerySchema.parse({
    date: url.searchParams.get("date") ?? undefined,
    package: url.searchParams.get("package") ?? undefined,
  });
  const pool = getPool();
  const result = await checkDate(pool, query.date, query.package, new Date());
  await recordEvent(
    pool,
    "date_checked",
    { date: result.date, package: result.package, status: result.status, alternatives: result.alternatives.length },
    { sessionId: request.headers.get("x-session-id")?.slice(0, 64) ?? null },
  );
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
});
