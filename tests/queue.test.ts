import { test } from "node:test";
import assert from "node:assert/strict";
import { DeliveryQueue, drain } from "../src/queue.ts";
import { ok } from "./helpers.ts";

test("drains oldest first and empties the queue", async () => {
  const queue = new DeliveryQueue();
  queue.enqueue({ id: "a", type: "t", data: null });
  queue.enqueue({ id: "b", type: "t", data: null });
  const seen: string[] = [];
  await drain(queue, async (e) => { seen.push(e.id); return ok(1); });
  assert.deepEqual(seen, ["a", "b"]);
  assert.equal(queue.depth(), 0);
});
