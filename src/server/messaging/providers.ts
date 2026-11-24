/**
 * Delivery providers sit behind these small interfaces so Twilio, Resend, GHL or anything
 * else can be swapped in without touching booking logic. Only the "log" providers exist
 * today: they write a line to the server log (no personal details) and send nothing.
 */

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  /** Providers that support it should de-duplicate on this key. */
  idempotencyKey: string;
}

export interface SmsMessage {
  to: string;
  body: string;
  idempotencyKey: string;
}

export interface DeliveryResult {
  providerMessageId: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<DeliveryResult>;
}

export interface SmsProvider {
  readonly name: string;
  send(message: SmsMessage): Promise<DeliveryResult>;
}

export class LogEmailProvider implements EmailProvider {
  readonly name = "log";
  readonly sent: EmailMessage[] = [];
  async send(message: EmailMessage): Promise<DeliveryResult> {
    this.sent.push(message);
    console.info(`[email:log] would send "${message.subject}" (key ${message.idempotencyKey})`);
    return { providerMessageId: `log-${message.idempotencyKey}` };
  }
}

export class LogSmsProvider implements SmsProvider {
  readonly name = "log";
  readonly sent: SmsMessage[] = [];
  async send(message: SmsMessage): Promise<DeliveryResult> {
    this.sent.push(message);
    console.info(`[sms:log] would send ${message.body.length} chars (key ${message.idempotencyKey})`);
    return { providerMessageId: `log-${message.idempotencyKey}` };
  }
}

export interface Providers {
  email: EmailProvider;
  sms: SmsProvider;
}

/** Build providers from env. An unknown name is a configuration error, not a silent fallback. */
export function providersFromEnv(env: NodeJS.ProcessEnv = process.env): Providers {
  const email = env.EMAIL_PROVIDER ?? "log";
  const sms = env.SMS_PROVIDER ?? "log";
  if (email !== "log") throw new Error(`EMAIL_PROVIDER "${email}" is not implemented yet`);
  if (sms !== "log") throw new Error(`SMS_PROVIDER "${sms}" is not implemented yet`);
  return { email: new LogEmailProvider(), sms: new LogSmsProvider() };
}
