/** Run the message dispatcher once from the command line (same code as the cron route). */
import { createPool } from "../src/server/db";
import { dispatchDue } from "../src/server/messaging/dispatcher";
import { providersFromEnv } from "../src/server/messaging/providers";
import { loadEnv, requireEnv } from "./env";

loadEnv();
const pool = createPool(requireEnv("DATABASE_URL"));
dispatchDue(pool, providersFromEnv(), { staffEmail: process.env.STAFF_NOTIFY_EMAIL })
  .then((s) => console.log(JSON.stringify(s)))
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
