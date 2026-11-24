import { existsSync } from "node:fs";
import type { Pool } from "pg";
import { createPool } from "../../src/server/db";
import type { BookTourInput } from "../../src/lib/validation";

for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
// Route handlers read DATABASE_URL through getPool(); point them at the test database.
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST;

let pool: Pool | undefined;
export function testPool(): Pool {
  pool ??= createPool(process.env.DATABASE_URL_TEST!);
  return pool;
}

export async function resetData(): Promise<void> {
  await testPool().query(
    "TRUNCATE funnel_events, outbox_messages, tours, space_reservations, leads RESTART IDENTITY CASCADE",
  );
}

export async function closePool(): Promise<void> {
  await pool?.end();
  pool = undefined;
}

/** A clearly fake visitor. */
export function fakeTourInput(startsAt: string, overrides: Partial<BookTourInput> = {}): BookTourInput {
  return {
    startsAt: new Date(startsAt),
    firstName: "Test",
    lastName: "Couple",
    email: "test.couple@example.com",
    smsConsent: false,
    utm: {},
    ...overrides,
  };
}
