import type { Router } from "./router.ts";
import { health } from "./health.ts";
import { BillingError, charge, listInvoices } from "../billing/client.ts";
import type { PaymentProvider } from "../billing/provider.ts";
import type { DeliveryQueue } from "../queue.ts";

export interface Services {
  provider: PaymentProvider;
  queue: DeliveryQueue;
}

export function registerRoutes(router: Router, services: Services): void {
  router.get("/health", () => health(services));

  router.post("/v1/charges", (req) => {
    try {
      const created = charge(services.provider, req.body as { customer: string; amount: number; currency?: string });
      services.queue.enqueue({ id: `evt_${created.id}`, type: "charge.succeeded", data: created });
      return { status: 201, body: created };
    } catch (err) {
      if (err instanceof BillingError) return { status: 400, body: { error: err.message } };
      throw err;
    }
  });

  router.get("/v1/invoices", (req) => {
    const customer = req.query.customer;
    if (!customer) return { status: 400, body: { error: "customer is required" } };
    return { status: 200, body: { invoices: listInvoices(services.provider, customer) } };
  });
}
