import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { deliver } from "../../src/billing/client.ts";
import { event, fakeFetch } from "../helpers.ts";

// Module 17 exercise (team capstone).

test("signs each delivery with an HMAC of its body", { todo: "Module 17: signed deliveries" }, async () => {
  const fetch = fakeFetch(200);
  await deliver(event, { url: "https://subscriber.example/hooks", fetch, secret: "whsec_test" } as Parameters<typeof deliver>[1]);
  const { body, headers } = fetch.requests[0] as { body: string; headers: Record<string, string> };
  const expected = createHmac("sha256", "whsec_test").update(body).digest("hex");
  assert.equal(headers["webhook-signature"], `sha256=${expected}`);
});
