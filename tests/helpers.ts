import type { DeliveryResult } from "../src/billing/client.ts";

type Answer = number | Error | { status: number; headers: Record<string, string> };
type FakeFetch = typeof fetch & { calls: number; requests: RequestInit[] };

/** A fake fetch that answers in turn: a status, a status with headers, or an Error to throw. */
export function fakeFetch(...answers: Answer[]): FakeFetch {
  const fn = (async (_url: string, init: RequestInit) => {
    const answer = answers[Math.min(fn.calls, answers.length - 1)];
    fn.calls++;
    fn.requests.push(init);
    if (answer instanceof Error) throw answer;
    if (typeof answer === "number") return new Response(null, { status: answer });
    return new Response(null, answer);
  }) as unknown as FakeFetch;
  fn.calls = 0;
  fn.requests = [];
  return fn;
}

export const event = { id: "evt_1", type: "charge.succeeded", data: { amount: 500 } };

export function ok(attempts: number): DeliveryResult {
  return { ok: true, status: 200, attempts };
}
