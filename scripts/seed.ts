/**
 * Fills the dev database with FAKE reservations so date-check has something to show.
 * Shape loosely follows the 2027 pattern (peak Saturdays mostly booked, about half the
 * in-season Fridays and Sundays). No real couples, names or contacts are used.
 */
import { addDays, monthOf, venueToday, weekday, type IsoDate } from "../src/lib/dates";
import { createPool } from "../src/server/db";
import { runMigrations } from "../src/server/migrate";
import { loadEnv, requireEnv } from "./env";

loadEnv();
if (process.env.NODE_ENV === "production" && !process.argv.includes("--force")) {
  console.error("Refusing to seed fake data with NODE_ENV=production.");
  process.exit(1);
}

/** Small deterministic PRNG so every seed run produces the same calendar. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function main() {
  const pool = createPool(requireEnv("DATABASE_URL"));
  try {
    await runMigrations(pool);
    await pool.query("DELETE FROM space_reservations WHERE note LIKE 'seed:%'");
    const rand = mulberry32(2027);
    const start = venueToday();
    let count = 0;
    for (let i = 14; i < 2 * 365; i++) {
      const date = addDays(start, i) as IsoDate;
      const wd = weekday(date);
      const peak = monthOf(date) >= 5 && monthOf(date) <= 9;
      const p = peak ? (wd === 6 ? 0.95 : wd === 5 || wd === 7 ? 0.5 : 0.05) : wd >= 5 ? 0.2 : 0.01;
      if (rand() >= p) continue;
      const spaces = rand() < 0.58 ? ["church", "pavilion"] : ["pavilion"];
      for (const space of spaces) {
        await pool.query(
          `INSERT INTO space_reservations (space, event_date, kind, note) VALUES ($1, $2, 'booking', 'seed: fake booking')
           ON CONFLICT DO NOTHING`,
          [space, date],
        );
      }
      count++;
    }
    console.log(`Seeded ${count} fake event days.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
