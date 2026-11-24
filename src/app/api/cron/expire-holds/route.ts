import { NextResponse } from "next/server";
import { expireHolds } from "@/server/booking/reservations";
import { getPool } from "@/server/db";
import { apiHandler, isAuthorizedCron, jsonError } from "@/server/http";

export const dynamic = "force-dynamic";

/** Marks lapsed date holds as expired. Requires `Authorization: Bearer $CRON_SECRET`. */
export const GET = apiHandler(async (request: Request) => {
  if (!isAuthorizedCron(request)) return jsonError(401, "unauthorized", "Unauthorized");
  const expired = await expireHolds(getPool(), new Date());
  return NextResponse.json({ expired });
});
