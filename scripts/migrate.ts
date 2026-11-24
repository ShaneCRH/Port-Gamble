import { createPool } from "../src/server/db";
import { runMigrations } from "../src/server/migrate";
import { loadEnv, requireEnv } from "./env";

loadEnv();
const pool = createPool(requireEnv("DATABASE_URL"));
runMigrations(pool)
  .then((applied) => console.log(applied.length ? `Applied: ${applied.join(", ")}` : "Database is up to date."))
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
