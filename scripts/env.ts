import { existsSync } from "node:fs";

/** Load .env.local then .env for CLI scripts (Next.js does this itself for the app). */
export function loadEnv(): void {
  for (const file of [".env.local", ".env"]) {
    if (existsSync(file)) process.loadEnvFile(file);
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`${name} is not set. Copy .env.example to .env.local and fill it in.`);
    process.exit(1);
  }
  return v;
}
