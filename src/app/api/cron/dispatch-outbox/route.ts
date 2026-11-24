import { NextResponse } from "next/server";
import { getPool } from "@/server/db";
import { apiHandler, isAuthorizedCron, jsonError } from "@/server/http";
import { dispatchDue } from "@/server/messaging/dispatcher";
import { providersFromEnv } from "@/server/messaging/providers";

export const dynamic = "force-dynamic";

/** Sends due, queued messages. Requires `Authorization: Bearer $CRON_SECRET`. */
export const GET = apiHandler(async (request: Request) => {
  if (!isAuthorizedCron(request)) return jsonError(401, "unauthorized", "Unauthorized");
  const summary = await dispatchDue(getPool(), providersFromEnv(), { staffEmail: process.env.STAFF_NOTIFY_EMAIL });
  return NextResponse.json(summary);
});
