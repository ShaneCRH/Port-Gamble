/**
 * MESSAGING_MODE decides what happens to couple-facing messages:
 *   off      - nothing is written to the outbox
 *   approval - messages are written as awaiting_approval and never sent automatically (default)
 *   auto     - messages are queued and the dispatcher sends them through the configured providers
 * Anything unrecognised falls back to "approval", the safe choice.
 */
export type MessagingMode = "off" | "approval" | "auto";

export function messagingMode(env: NodeJS.ProcessEnv = process.env): MessagingMode {
  const v = env.MESSAGING_MODE?.trim().toLowerCase();
  return v === "off" || v === "auto" ? v : "approval";
}
