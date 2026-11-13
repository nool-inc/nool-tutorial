# 12 · Solo capstone: ship a feature with two agents

Modules 02 and 08 already did bounded retries and queue depth. The capstone ships the next piece of each, one agent per scope. Two exercise tests describe it:

- `tests/billing/retries.test.ts`: "waits as long as Retry-After asks" (agent 1, `src/billing/`)
- `tests/api/routes.test.ts`: "GET /health says degraded when more than 100 events are waiting" (agent 2, `src/api/`)

```bash
nool task create --name "Webhook delivery v2" \
  --acceptance "Retries wait as long as Retry-After asks" \
  --acceptance "GET /health says degraded when the queue backs up" \
  --rails tests/ --solidify
nool try new v2-retries --worktree --nodes src/billing/ --intent "Honour Retry-After"
nool try new v2-health --worktree --nodes src/api/ --intent "Degraded health when the queue backs up"
```

**Agent 1, `src/billing/client.ts`.** Remember the subscriber's Retry-After and wait that long:

```ts
// in DeliveryResult
  /** How long the subscriber asked us to wait, from its Retry-After header. */
  retryAfterMs?: number;

// in attemptOnce, replacing the line that returns a failed response
const retryAfter = Number(response.headers.get("retry-after"));
return {
  ok: false, status: response.status, attempts: attempt, error: `HTTP ${response.status}`,
  ...(retryAfter > 0 ? { retryAfterMs: retryAfter * 1000 } : {}),
};

// in deliver, the wait before a retry
if (attempt > 1) await sleep(result.retryAfterMs ?? 100 * 2 ** (attempt - 2));
```

**Agent 2, `src/api/health.ts`:**

```ts
const DEGRADED_AT = 100;

export function health(services: Services): Reply {
  const queueDepth = services.queue.depth();
  return { status: 200, body: { status: queueDepth > DEGRADED_AT ? "degraded" : "ok", queueDepth } };
}
```

Then promote one at a time, and verify with a test note as in Module 08:

```bash
nool task verify-done --id <task-id> --landed-knot <knot-id> \
  --test-note "npm test: Retry-After and degraded health pass" --solidify
nool checkpoint 1.1.0 -s
```

The rail is `tests/`, so the agents cannot remove the `todo` markers. Do that yourself once the task is VerifiedDone.

Not run as a whole against this project yet; each command was run on its own in Modules 03, 08 and 10.
