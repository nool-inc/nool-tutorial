import { startServer } from "./api/server.ts";
import { deliver } from "./billing/client.ts";
import { PaymentProvider } from "./billing/provider.ts";
import { DeliveryQueue, drain } from "./queue.ts";

const port = Number(process.env.PORT ?? 3000);
const webhookUrl = process.env.WEBHOOK_URL;
const retries = Number(process.env.WEBHOOK_RETRIES ?? 10);

const services = { provider: new PaymentProvider(), queue: new DeliveryQueue() };
startServer(services, port);
console.log(`webhook-service listening on http://localhost:${port}`);

if (webhookUrl) {
  console.log(`delivering webhooks to ${webhookUrl}`);
  setInterval(async () => {
    for (const result of await drain(services.queue, (event) => deliver(event, { url: webhookUrl, retries }))) {
      if (!result.ok) console.warn(`delivery failed after ${result.attempts} attempt(s): ${result.error}`);
    }
  }, 1000);
}
