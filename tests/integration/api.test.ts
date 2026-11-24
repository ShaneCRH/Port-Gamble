import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { GET as availability } from "@/app/api/availability/route";
import { GET as dispatchCron } from "@/app/api/cron/dispatch-outbox/route";
import { POST as events } from "@/app/api/events/route";
import { GET as tourSlots } from "@/app/api/tour-slots/route";
import { POST as tours } from "@/app/api/tours/route";
import { closePool, resetData, testPool } from "./helpers";

beforeEach(resetData);
afterAll(closePool);

function post(url: string, body: unknown, headers: Record<string, string> = {}) {
  return new Request(url, { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json", ...headers } });
}

describe("API", () => {
  it("answers a date check and records date_checked", async () => {
    const res = await availability(new Request("http://x/api/availability?date=2028-06-10&package=pavilion"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("available");
    const { rows } = await testPool().query("SELECT name, props FROM funnel_events");
    expect(rows[0]).toMatchObject({ name: "date_checked", props: { status: "available", package: "pavilion" } });
  });

  it("returns 400 with field messages for a bad date", async () => {
    const res = await availability(new Request("http://x/api/availability?date=2027-02-30"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.fields.date).toBeTruthy();
  });

  it("books a tour from the first open slot, and replays on retry", async () => {
    const slots = await (await tourSlots()).json();
    expect(slots.slots.length).toBeGreaterThan(0);
    const body = { startsAt: slots.slots[0].startsAt, firstName: "Test", lastName: "Couple", email: "api.test@example.com" };
    const first = await tours(post("http://x/api/tours", body, { "idempotency-key": "api-key-000001" }));
    expect(first.status).toBe(201);
    const second = await tours(post("http://x/api/tours", body, { "idempotency-key": "api-key-000001" }));
    expect(second.status).toBe(200);
    expect((await second.json()).replayed).toBe(true);
    const taken = await tours(post("http://x/api/tours", { ...body, email: "someone.else@example.com" }, { "idempotency-key": "api-key-000002" }));
    expect(taken.status).toBe(409);
    expect((await taken.json()).error.code).toBe("slot_unavailable");
  });

  it("requires an idempotency key and valid JSON", async () => {
    expect((await tours(post("http://x/api/tours", {}))).status).toBe(400);
    const bad = new Request("http://x/api/tours", { method: "POST", body: "{not json", headers: { "idempotency-key": "api-key-000003" } });
    expect((await tours(bad)).status).toBe(400);
  });

  it("accepts whitelisted browser events and ignores server-recorded ones", async () => {
    expect((await events(post("http://x/api/events", { name: "cta_clicked", props: { location: "hero" } }))).status).toBe(204);
    expect((await events(post("http://x/api/events", { name: "tour_booked" }))).status).toBe(204);
    expect((await events(post("http://x/api/events", { name: "drop_tables" }))).status).toBe(400);
    const { rows } = await testPool().query("SELECT name FROM funnel_events");
    expect(rows).toEqual([{ name: "cta_clicked" }]);
  });

  it("locks the cron endpoints behind CRON_SECRET", async () => {
    process.env.CRON_SECRET = "integration-test-secret-123";
    expect((await dispatchCron(new Request("http://x/api/cron/dispatch-outbox"))).status).toBe(401);
    const ok = await dispatchCron(new Request("http://x/api/cron/dispatch-outbox", { headers: { authorization: "Bearer integration-test-secret-123" } }));
    expect(ok.status).toBe(200);
  });
});
