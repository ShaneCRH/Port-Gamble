import { NextResponse } from "next/server";
import { z } from "zod";
import { FUNNEL_EVENTS, SERVER_RECORDED_EVENTS } from "@/lib/analytics/events";
import { recordEvent } from "@/server/analytics";
import { getPool } from "@/server/db";
import { apiHandler } from "@/server/http";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  name: z.enum(FUNNEL_EVENTS),
  sessionId: z.string().max(64).optional(),
  props: z
    .record(z.string().max(40), z.union([z.string().max(200), z.number().finite(), z.boolean()]))
    .refine((p) => Object.keys(p).length <= 20, { message: "Too many properties" })
    .default({}),
});

/** POST /api/events: browser-side funnel events (clicks and selections). */
export const POST = apiHandler(async (request: Request) => {
  const text = await request.text();
  if (text.length > 4_000) return NextResponse.json({ ok: false }, { status: 413 });
  const body = bodySchema.parse(JSON.parse(text || "{}"));
  // The API records these itself; ignore browser copies so counts aren't doubled.
  if (!SERVER_RECORDED_EVENTS.has(body.name)) {
    await recordEvent(getPool(), body.name, body.props, { sessionId: body.sessionId });
  }
  return new NextResponse(null, { status: 204 });
});
