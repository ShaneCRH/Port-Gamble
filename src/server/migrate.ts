import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Pool } from "pg";

/** Arbitrary constant so concurrent deploys can't run migrations twice. */
const MIGRATION_LOCK_ID = 74_093_219;

/**
 * Apply every db/migrations/*.sql file not applied yet, in filename order, each in its
 * own transaction, under an advisory lock. Applied files are recorded with a checksum;
 * editing an applied migration is refused.
 */
export async function runMigrations(pool: Pool, dir = path.join(process.cwd(), "db", "migrations")): Promise<string[]> {
  const client = await pool.connect();
  const applied: string[] = [];
  try {
    await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename text PRIMARY KEY,
      checksum text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const done = new Map(
      (await client.query<{ filename: string; checksum: string }>("SELECT filename, checksum FROM schema_migrations")).rows.map(
        (r) => [r.filename, r.checksum],
      ),
    );
    const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
    const { createHash } = await import("node:crypto");
    for (const file of files) {
      const sql = await readFile(path.join(dir, file), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const prior = done.get(file);
      if (prior) {
        if (prior !== checksum) throw new Error(`Migration ${file} was edited after it was applied. Add a new migration instead.`);
        continue;
      }
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)", [file, checksum]);
        await client.query("COMMIT");
        applied.push(file);
      } catch (err) {
        await client.query("ROLLBACK");
        throw new Error(`Migration ${file} failed: ${(err as Error).message}`);
      }
    }
    return applied;
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_ID]).catch(() => undefined);
    client.release();
  }
}
