/**
 * Payments (date retainer, final balance, security deposit) will sit behind this
 * interface. Nothing is wired to the booking flow yet; the fake implementation lets
 * later features and tests run without a real processor or account.
 */
export interface CheckoutRequest {
  leadId: string;
  amountCents: number;
  description: string;
  idempotencyKey: string;
}

export interface PaymentProvider {
  readonly name: string;
  createCheckout(req: CheckoutRequest): Promise<{ checkoutId: string; url: string }>;
}

export class FakePaymentProvider implements PaymentProvider {
  readonly name = "fake";
  async createCheckout(req: CheckoutRequest) {
    if (!Number.isInteger(req.amountCents) || req.amountCents <= 0) throw new RangeError("amountCents must be a positive integer");
    return { checkoutId: `fake_${req.idempotencyKey}`, url: `/payments/fake/${encodeURIComponent(req.idempotencyKey)}` };
  }
}
