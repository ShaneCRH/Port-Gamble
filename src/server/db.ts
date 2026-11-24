import { Pool, type PoolClient } from "pg";
import { DatabaseUnavailableError } from "./errors";

/** Anything that can run a query: the pool or a client inside a transaction. */
export type Queryable = Pick<Pool, "query"> | Pick<PoolClient, "query">;

const globalForPool = globalThis as unknown as { __pgWeddingsPool?: Pool };

export function createPool(connectionString: string): Pool {
  const pool = new Pool({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    // Fail fast instead of hanging a visitor's request on a stuck query.
    statement_timeout: 10_000,
  });
  // An idle client erroring must not crash the process.
  pool.on("error", (err) => console.error("[db] idle client error:", err.message));
  return pool;
}

/** The shared pool. Created lazily so builds and static pages never need a database. */
export function getPool(): Pool {
  if (globalForPool.__pgWeddingsPool) return globalForPool.__pgWeddingsPool;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseUnavailableError("DATABASE_URL is not set");
  globalForPool.__pgWeddingsPool = createPool(url);
  return globalForPool.__pgWeddingsPool;
}

/** Run fn in a transaction; commits on success, rolls back on any error. */
export async function withTransaction<T>(pool: Pool, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  let client: PoolClient;
  try {
    client = await pool.connect();
  } catch (err) {
    throw new DatabaseUnavailableError((err as Error).message);
  }
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/** Postgres error codes we act on. */
export const PG = {
  uniqueViolation: "23505",
  checkViolation: "23514",
  foreignKeyViolation: "23503",
} as const;

export function pgErrorCode(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "code" in err ? String((err as { code: unknown }).code) : undefined;
}

export function pgConstraint(err: unknown): string | undefined {
  return typeof err === "object" && err !== null && "constraint" in err
    ? String((err as { constraint: unknown }).constraint)
    : undefined;
}
