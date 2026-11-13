# 07 · Know what a change will break before it lands

The change: a billing error learns whether it is worth retrying, and the API answers 503 for one that is.

**Step 2: billing only.** In `src/billing/client.ts`, give `BillingError` a flag:

```ts
export class BillingError extends Error {
  override name = "BillingError";
  /** True when the same request may succeed if it is sent again. */
  retryable = false;
}
```

Propose it with `--path src/billing/client.ts`. You should see:

```
Blast radius: 11 node(s) affected (declared 1) — CRITICAL [indicative]
```

One file named, eleven nodes reached: `src/api/routes.ts` catches `BillingError`, and the tests reach both. The exact count depends on what you have changed so far.

**Step 3: reach into the API.** Also change the catch in `src/api/routes.ts`:

```ts
if (err instanceof BillingError) return { status: err.retryable ? 503 : 400, body: { error: err.message, retryable: err.retryable } };
```

Propose with `--all`. Nool now counts both files as declared (`declared 2`) and still flags the reach.

**When does Nool refuse?** Above `[gating] blast_block_threshold` in `nool.toml`, 30 nodes by default, Nool stops and asks for `--justification`. This project is too small to get there, so here you see the warning, not the refusal. On a real codebase, a change to a widely imported file crosses it quickly.

**Step 4: justify it anyway**, so the reason is on record:

```bash
nool propose --all --intent "Add retries to the billing client" --full \
  --justification "The API layer maps the client's errors to HTTP statuses, so a retryable error has to answer 503"
nool solidify --full --compact
```

**Known issue (7.28.0).** The justification is accepted and the change lands, but `nool why` does not print it yet. It is filed with the Nool team.
