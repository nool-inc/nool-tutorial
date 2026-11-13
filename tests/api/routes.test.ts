import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRouter } from "../../src/api/server.ts";
import { PaymentProvider } from "../../src/billing/provider.ts";
import { DeliveryQueue } from "../../src/queue.ts";

function setup() {
  const services = { provider: new PaymentProvider(), queue: new DeliveryQueue() };
  const router = buildRouter(services);
  const call = (method: string, path: string, body?: unknown) => {
    const url = new URL(path, "http://localhost");
    return router.handle({ method, path: url.pathname, query: Object.fromEntries(url.searchParams), body });
  };
  return { services, call };
}

test("POST /v1/charges creates a charge and queues a webhook", async () => {
  const { services, call } = setup();
  const reply = await call("POST", "/v1/charges", { customer: "cus_1", amount: 500 });
  assert.equal(reply.status, 201);
  assert.equal(services.queue.depth(), 1);
});

test("POST /v1/charges answers 400 to a bad amount", async () => {
  const { services, call } = setup();
  const reply = await call("POST", "/v1/charges", { customer: "cus_1", amount: -5 });
  assert.equal(reply.status, 400);
  assert.equal(services.queue.depth(), 0);
});

test("GET /v1/invoices lists a customer's charges", async () => {
  const { call } = setup();
  await call("POST", "/v1/charges", { customer: "cus_1", amount: 500 });
  const reply = await call("GET", "/v1/invoices?customer=cus_1");
  assert.equal(reply.status, 200);
  assert.equal((reply.body as { invoices: unknown[] }).invoices.length, 1);
});

test("an unknown route is a 404", async () => {
  const { call } = setup();
  assert.equal((await call("GET", "/nope")).status, 404);
});

// Module 02 exercises.

test("GET /health answers 200 with status ok", { todo: "Module 02: your first change" }, async () => {
  const { call } = setup();
  const reply = await call("GET", "/health");
  assert.equal(reply.status, 200);
  assert.equal((reply.body as { status: string }).status, "ok");
});

test("GET /health reports the queue depth", { todo: "Module 02: the second change" }, async () => {
  const { call } = setup();
  await call("POST", "/v1/charges", { customer: "cus_1", amount: 500 });
  const reply = await call("GET", "/health");
  assert.equal((reply.body as { queueDepth: number }).queueDepth, 1);
});

// Module 12 exercise (solo capstone).

test("GET /health says degraded when more than 100 events are waiting", { todo: "Module 12: degraded health" }, async () => {
  const { services, call } = setup();
  for (let i = 0; i < 101; i++) services.queue.enqueue({ id: `evt_${i}`, type: "t", data: null });
  const reply = await call("GET", "/health");
  assert.equal((reply.body as { status: string }).status, "degraded");
});

// Module 17 exercise (team capstone).

test("GET /v1/invoices returns at most ?limit invoices", { todo: "Module 17: paged invoices" }, async () => {
  const { call } = setup();
  for (const amount of [100, 200, 300]) await call("POST", "/v1/charges", { customer: "cus_1", amount });
  const reply = await call("GET", "/v1/invoices?customer=cus_1&limit=2");
  assert.deepEqual((reply.body as { invoices: { amount: number }[] }).invoices.map((i) => i.amount), [300, 200]);
});
