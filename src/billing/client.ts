import type { Charge, PaymentProvider } from "./provider.ts";

/** Send one webhook event to a subscriber. A 5xx or a network error is retried at once. */
export async function deliver(event: WebhookEvent, options: DeliverOptions): Promise<DeliveryResult> {
  const send = options.fetch ?? fetch;
  const retries = options.retries ?? 3;
  let result: DeliveryResult = { ok: false, status: null, attempts: 0, error: "not sent" };
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    result = await attemptOnce(send, event, options, attempt);
    if (result.ok || isPermanent(result.status)) return result;
  }
  return result;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: unknown;
}

export interface DeliverOptions {
  /** The subscriber's endpoint. */
  url: string;
  /** How many times to try again after the first attempt fails. */
  retries?: number;
  /** Abort one attempt after this long. */
  timeoutMs?: number;
  /** Injected in tests; the global fetch otherwise. */
  fetch?: typeof fetch;
}

export interface DeliveryResult {
  ok: boolean;
  /** The subscriber's HTTP status, or null when no response arrived. */
  status: number | null;
  attempts: number;
  error?: string;
}

async function attemptOnce(send: typeof fetch, event: WebhookEvent, options: DeliverOptions, attempt: number): Promise<DeliveryResult> {
  try {
    const response = await send(options.url, {
      method: "POST",
      headers: { "content-type": "application/json", "webhook-id": event.id },
      body: JSON.stringify(event),
      signal: AbortSignal.timeout(options.timeoutMs ?? 5000),
    });
    if (response.ok) return { ok: true, status: response.status, attempts: attempt };
    return { ok: false, status: response.status, attempts: attempt, error: `HTTP ${response.status}` };
  } catch (err) {
    return { ok: false, status: null, attempts: attempt, error: err instanceof Error ? err.message : String(err) };
  }
}

/** A 4xx will not change on a retry. */
function isPermanent(status: number | null): boolean {
  return status !== null && status >= 400 && status < 500;
}

export interface ChargeInput {
  customer: string;
  amount: number;
  currency?: string;
}

/** Charge a customer. Route handlers call this, never the provider directly. */
export function charge(provider: PaymentProvider, input: ChargeInput): Charge {
  if (!input.customer) throw new BillingError("customer is required");
  if (!Number.isInteger(input.amount) || input.amount <= 0) throw new BillingError("amount must be a positive integer, in cents");
  return provider.createCharge({ customer: input.customer, amount: input.amount, currency: input.currency ?? "usd" });
}

/** Every charge for one customer, newest first. */
export function listInvoices(provider: PaymentProvider, customer: string): Charge[] {
  return provider.listCharges(customer).reverse();
}

export class BillingError extends Error {
  override name = "BillingError";
}
