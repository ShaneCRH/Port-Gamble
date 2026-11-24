import { NextResponse } from "next/server";
import { getPool } from "@/server/db";

export const dynamic = "force-dynamic";

/** GET /api/health: 200 when the database answers, 503 otherwise. */
export async function GET() {
  try {
    await getPool().query("SELECT 1");
    return NextResponse.json({ ok: true, database: "up" });
  } catch {
    return NextResponse.json({ ok: false, database: "down" }, { status: 503 });
  }
}
