# 08 · Tie work to the change that finishes it

The work: bounded retries with exponential backoff in `deliver()`. Two exercise tests in `tests/billing/retries.test.ts` say what done looks like.

**Seal each task step with `-s`.** Without it, a task change is only staged, and the next step fails with `cannot 'start' a task in state Open`. Use:

```bash
nool task pick --id <task-id> -s
nool task start --id <task-id> -s
```

**Step 4: cross the rail.** Make any edit to `tests/billing/retries.test.ts` (rename a test), then propose it with `--task <task-id>`. You get `TASK_RAILS refused`. Undo the edit: `git checkout -- tests/billing/retries.test.ts`.

**Step 5: the work.** In the `webhook-retries` worktree, change the top of `src/billing/client.ts`:

```ts
/** Send one webhook event to a subscriber. A 5xx or a network error is retried with backoff, 5 attempts at most. */
export async function deliver(event: WebhookEvent, options: DeliverOptions): Promise<DeliveryResult> {
  const send = options.fetch ?? fetch;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const attempts = Math.min((options.retries ?? 3) + 1, MAX_ATTEMPTS);
  let result: DeliveryResult = { ok: false, status: null, attempts: 0, error: "not sent" };
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt > 1) await sleep(100 * 2 ** (attempt - 2));
    result = await attemptOnce(send, event, options, attempt);
    if (result.ok || isPermanent(result.status)) return result;
  }
  return result;
}

const MAX_ATTEMPTS = 5;
```

and add `sleep` to `DeliverOptions`:

```ts
  /** Injected in tests; a real timer otherwise. */
  sleep?: (ms: number) => Promise<void>;
```

Propose with `--try-branch webhook-retries`, promote, and `npm test -- billing` shows ✔ on "never makes more than 5 attempts" and "waits twice as long before each retry".

**Step 6: verify.** `verify-done` needs test evidence on the landed knot, or it refuses with `completion contract not satisfied — missing: TestsPassed`:

```bash
nool task qa --id <task-id> -s
nool task verify-done --id <task-id> --landed-knot <knot-id> \
  --test-note "npm test -- billing: bounded retries and backoff pass" --solidify
```

**Step 8: the bug.** "a 429 is retried" is still ⚠. That is the bug you report. To fix it, let 429 through `isPermanent`:

```ts
return status !== null && status >= 400 && status < 500 && status !== 429;
```

Land the fix, then link it: `nool bug link <bug-id> --fix <knot-id> --solidify`.

**Afterwards.** With the task VerifiedDone its rails are off. Delete the `todo` option from the three Module 08 tests and land that, so they guard the code from now on.
