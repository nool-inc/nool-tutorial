# 03 · Stop two agents colliding

The two branches touch different code: `api-health` owns `src/api/`, `billing-retries` owns `src/billing/`.

Give each its own identity, or Nool sees one agent holding both:

```bash
NOOL_SESSION_ID=agent-a nool try new api-health --worktree --nodes src/api/ --intent "Add GET /health"
NOOL_SESSION_ID=agent-b nool try new billing-retries --worktree --nodes src/billing/ --intent "Bounded retries in the billing client"
```

**The change in `api-health`.** Module 02 already added `/health`, so give this branch something small to land: an uptime field. In `.nool/try/api-health/src/api/health.ts`:

```ts
const startedAt = Date.now();

export function health(services: Services): Reply {
  return {
    status: 200,
    body: { status: "ok", queueDepth: services.queue.depth(), uptimeSeconds: Math.round((Date.now() - startedAt) / 1000) },
  };
}
```

Propose it with `--try-branch api-health`, then `nool try impact` (Ready to promote: YES) and `nool try promote`.

**Running tests inside a worktree.** A worktree has no `node_modules`. Run `npm install` in it first if you want `npm test` there. Nool's own checks do not need this.

**Before you move on.** Module 08 does the billing work properly, on a branch of its own. Drop this one so its lease on `src/billing/` does not block you later:

```bash
nool try discard billing-retries
nool lease status     # no lease left on src/billing/
```

**What you should see:** the third agent is refused with `Coordination conflict: agent <id> (try branch api-health) on src/api/` and exit code 3; `nool lease wait src/api/ --timeout-ms 60000` names the holder when it times out.
