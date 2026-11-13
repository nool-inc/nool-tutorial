import { test } from "node:test";
import assert from "node:assert/strict";
import { deliver } from "../../src/billing/client.ts";
import { event, fakeFetch, ok } from "../helpers.ts";

const url = "https://subscriber.example/hooks";

test("delivers on the first try", async () => {
  const fetch = fakeFetch(200);
  assert.deepEqual(await deliver(event, { url, fetch }), ok(1));
});

test("retries a 5xx until it succeeds", async () => {
  const fetch = fakeFetch(503, 502, 200);
  assert.deepEqual(await deliver(event, { url, fetch }), ok(3));
});

test("a permanent failure (4xx) is not retried", async () => {
  const fetch = fakeFetch(400);
  const result = await deliver(event, { url, fetch, retries: 3 });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.equal(fetch.calls, 1);
});

test("a timeout is retried", async () => {
  const fetch = fakeFetch(new DOMException("The operation was aborted due to timeout", "TimeoutError"), 200);
  assert.deepEqual(await deliver(event, { url, fetch }), ok(2));
});

test("gives up after the last retry and keeps the last error", async () => {
  const fetch = fakeFetch(500);
  const result = await deliver(event, { url, fetch, retries: 2 });
  assert.deepEqual(result, { ok: false, status: 500, attempts: 3, error: "HTTP 500" });
});

// Module 08 exercises. They run, and show as ⚠ until the work is done; they never fail npm test.

test("never makes more than 5 attempts, whatever retries is set to", { todo: "Module 08: bounded retries" }, async () => {
  const fetch = fakeFetch(500);
  const result = await deliver(event, { url, fetch, retries: 50, sleep: async () => {} } as Parameters<typeof deliver>[1]);
  assert.equal(result.attempts, 5);
  assert.equal(fetch.calls, 5);
});

test("waits twice as long before each retry, from 100 ms", { todo: "Module 08: exponential backoff" }, async () => {
  const waits: number[] = [];
  const sleep = async (ms: number) => { waits.push(ms); };
  await deliver(event, { url, fetch: fakeFetch(500), retries: 4, sleep } as Parameters<typeof deliver>[1]);
  assert.deepEqual(waits, [100, 200, 400, 800]);
});

test("a 429 is retried", { todo: "Module 08: the bug you report, 'Retries ignore 429'" }, async () => {
  const fetch = fakeFetch(429, 200);
  const result = await deliver(event, { url, fetch, sleep: async () => {} } as Parameters<typeof deliver>[1]);
  assert.deepEqual(result, ok(2));
});

// Module 12 exercise (solo capstone).

test("waits as long as Retry-After asks", { todo: "Module 12: honour Retry-After" }, async () => {
  const waits: number[] = [];
  const sleep = async (ms: number) => { waits.push(ms); };
  const fetch = fakeFetch({ status: 503, headers: { "retry-after": "2" } }, 200);
  await deliver(event, { url, fetch, sleep } as Parameters<typeof deliver>[1]);
  assert.deepEqual(waits, [2000]);
});
