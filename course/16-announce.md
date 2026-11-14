# 13 · Claim code before you edit it

Team from here on. Nothing new to build: the claims are on `src/billing/client.ts`.

Open two terminals and put a name in front of every command, so Nool sees two agents:

```bash
NOOL_SESSION_ID=agent-a nool announce intent --intent "Add retries to the billing client" \
  --target-nodes src/billing/client.ts      # terminal A
NOOL_SESSION_ID=agent-b nool announce intent --intent "Add jitter to retries" \
  --target-nodes src/billing/client.ts      # terminal B: refused, exit 3
```

Without the variable, Nool names the session itself. Inside Claude Code that is the Claude Code session, so two commands typed there count as one agent.

Run `nool announce wait` as agent B, the one waiting. As the holder it returns at once with `✓ file:src/billing/client.ts is free.`, because your own claims never count.

**The change agent A lands.** Any small edit to `client.ts` will do. If your copy has no backoff yet (Module 08), this one fits:

```ts
// in DeliverOptions
  /** Injected in tests; a real timer otherwise. */
  sleep?: (ms: number) => Promise<void>;

// in deliver(), at the top
const retries = Math.min(options.retries ?? 3, 4);
const sleep = options.sleep ?? wait;

// in deliver(), first line of the loop
if (attempt > 1) await sleep(100 * 2 ** (attempt - 2));

// next to isPermanent()
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
```

Use the `sleep` the tests pass in. If you always call a real timer, the "never makes more than 5 attempts" test asks for 50 retries and `npm test` seems to hang.

What you should see, in order:

- A: `✓ Announced intent: Add retries to the billing client` and `Lease: seq N, exclusive mode, expires in 1800000 ms`
- B: `Error: Coordination conflict: agent <id> (Add retries to the billing client) on file:src/billing/client.ts.` (exit 3)
- B, with `--timeout-ms 5000`: `Error: timed out after 5000 ms waiting for file:src/billing/client.ts: still leased by agent <id>` (exit 3)
- A: `landing <id> started`, then `nool land wait <id>` prints `landed <knot id>`
- B: the wait prints `✓ file:src/billing/client.ts is free.`, and B's announce now succeeds

**For the second agent's "jitter" change**, if you want one to land after the first is released:

```ts
// in deliver(): spread retries out so subscribers are not hit in lockstep
if (attempt > 1) await sleep(Math.round((result.retryAfterMs ?? 100 * 2 ** (attempt - 2)) * (0.8 + Math.random() * 0.4)));
```

It reads `result.retryAfterMs` from Module 12. If your copy skipped that, the type check fails with `Property 'retryAfterMs' does not exist on type 'DeliveryResult'`, so use `100 * 2 ** (attempt - 2)` on its own.

Jitter breaks the exact numbers in the "waits twice as long" test, so keep it on a branch to throw away, or check ranges instead.

Done with a claim you will not use? `nool announce release <id>` lets it go.

Run against this project on 7.28.0 Enterprise, 2026-11-14. The trial and upgrade step was checked against `--help` only.
