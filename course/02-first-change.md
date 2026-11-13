# 02 · Land your first governed change

`src/api/health.ts` answers 501 today. You will make it answer, then report the queue depth.

**Step 2: the change.** Replace `src/api/health.ts` with:

```ts
import type { Reply } from "./router.ts";
import type { Services } from "./routes.ts";

export function health(_services: Services): Reply {
  return { status: 200, body: { status: "ok" } };
}
```

`npm test` now shows ✔ on "GET /health answers 200 with status ok". Propose it as the module says, and `nool land wait` prints `landed <knot id>`.

**Step 5: the second change.**

```ts
export function health(services: Services): Reply {
  return { status: 200, body: { status: "ok", queueDepth: services.queue.depth() } };
}
```

Both health tests are green now, so make them real tests: in `tests/api/routes.test.ts`, delete `, { todo: "Module 02: …" }` from the two `GET /health` tests. Then propose both files:

```bash
nool propose --path src/api/health.ts --path tests/api/routes.test.ts \
  --intent "Return queue depth from /health"
nool solidify --compact
```

**What you should see**

- `nool why <knot-id>` lists `compile pass` and `unit-tests pass` by integrity-driver.
- On the first change you may also see `✕ tests_constrain_change fail`. Nool planted small bugs in your new lines and no test caught them, because the health tests were still `todo`. Removing `todo` is what fixes that.
- `git log --oneline` shows each change as an ordinary commit.
