# 13 · Claim code before you edit it

Team from here on. Nothing new to build: the claims are on `src/billing/client.ts`.

For the second agent's "jitter" change, if you want one to land after the first is released:

```ts
// in deliver(): spread retries out so subscribers are not hit in lockstep
if (attempt > 1) await sleep(Math.round((result.retryAfterMs ?? 100 * 2 ** (attempt - 2)) * (0.8 + Math.random() * 0.4)));
```

Jitter makes the "waits twice as long" test exact numbers wrong, so keep it on a branch to throw away, or pass a fixed `sleep` and check ranges instead.

Not run against this project yet; the announce and wait commands were run on 7.26.0 Enterprise for the course.
