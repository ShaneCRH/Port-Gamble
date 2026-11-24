import { NextResponse } from "next/server";
import { listOpenSlots } from "@/server/booking/tours";
import { getPool } from "@/server/db";
import { apiHandler } from "@/server/http";

export const dynamic = "force-dynamic";

/** GET /api/tour-slots: open tour times from now to the booking horizon. */
export const GET = apiHandler(async () => {
  const slots = await listOpenSlots(getPool(), new Date());
  return NextResponse.json({ timeZone: "America/Los_Angeles", slots }, { headers: { "Cache-Control": "no-store" } });
});
