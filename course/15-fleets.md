# 15 · Run a fleet you can steer

You need provider keys for two vendors. The scopes in the module match this project: `src/api/` and `src/billing/`.

A fleet goal that suits it, with tests it can check against:

```bash
nool fleet start --builder agents/builder.yaml --reviewer agents/reviewer-a.yaml --reviewer agents/reviewer-b.yaml \
  --intent "Send an idempotency key with every webhook delivery and reject a duplicate charge" \
  --isolation worktree --max-iterations 2
```

`deliver()` already sends a `webhook-id` header; the builder has to carry it through charges as well.

Not run against this project yet.
