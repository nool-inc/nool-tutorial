import type { DeliveryResult, WebhookEvent } from "./billing/client.ts";

/** Webhook events waiting to be delivered, oldest first. */
export class DeliveryQueue {
  #events: WebhookEvent[] = [];

  enqueue(event: WebhookEvent): void {
    this.#events.push(event);
  }

  depth(): number {
    return this.#events.length;
  }

  take(): WebhookEvent | undefined {
    return this.#events.shift();
  }
}

/** Deliver everything waiting. A failed event is dropped and reported. */
export async function drain(queue: DeliveryQueue, send: (event: WebhookEvent) => Promise<DeliveryResult>): Promise<DeliveryResult[]> {
  const results: DeliveryResult[] = [];
  for (let event = queue.take(); event; event = queue.take()) {
    results.push(await send(event));
  }
  return results;
}
