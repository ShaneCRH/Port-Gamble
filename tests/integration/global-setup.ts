import { existsSync } from "node:fs";
import { Pool } from "pg";
import { runMigrations } from "../../src/server/migrate";

/** Wipe and migrate the test database once per run. Refuses anything not named like a test DB. */
export default async function setup() {
  for (const f of [".env.local", ".env"]) if (existsSync(f)) process.loadEnvFile(f);
  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error("DATABASE_URL_TEST is not set; integration tests need a disposable Postgres database.");
  if (!/test/i.test(new URL(url).pathname)) throw new Error("DATABASE_URL_TEST must point at a database whose name contains 'test'.");
  const pool = new Pool({ connectionString: url });
  try {
    await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    await runMigrations(pool);
  } finally {
    await pool.end();
  }
}
