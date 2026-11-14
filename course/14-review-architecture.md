# Write down how your code is meant to fit together

The work: settle two of Nool's guesses about the project, then record the rule "billing never imports the API" and watch it come up when a change breaks it. Nothing you land here changes the code; the edit in step 6 is thrown away.

**State assumed.** Checked on a fresh clone with `nool init --from-git main` and nothing else, on Nool 7.28.0 (Enterprise binary), 2026-11-14. Steps 5 and 8 were checked again with Module 05's rule landed. After Modules 01 to 12 you have more code, so the candidate count in step 2 is higher. The two edge ids below come from file, folder and function names, so they should be the same on your clone; if `grep` finds nothing, run `nool architecture review --limit 200` and look for the line by its text.

**Step 3: the wrong guess.** Nool lists `entity:handle:… calls entity:get:…`. Open `src/api/router.ts`:

```ts
  async handle(req: Request): Promise<Reply> {
    const handler = this.#routes.get(`${req.method} ${req.path}`);
```

That `get` is `Map.get` on the route table, not `Router.get`. Reject the edge.

**Step 4: the right guess.** `src/api/routes.ts` imports `charge` and `listInvoices` from `../billing/client.ts`. The API depending on billing is what we want. Accept it, then `nool solidify`. You get two knots: the rejection reads `Assertion … must_not_calls entity:get:…` in `nool log`, the acceptance `Assertion … depends_on entity:src/billing:…`.

**Step 5: the rule.** Use file locators. A folder locator such as `entity:src/billing:ab7214e7fa7328cd` is refused with `No identity binding found for subject`, and `nool discover lift` does not fix that on this project (it says nothing is new to lift).

**Step 6: break the rule.** Add one line under the first import of `src/billing/client.ts`:

```ts
import type { Services } from "../api/routes.ts";
```

and add this at the end of the file:

```ts
/** Charge with the API's services. */
export function chargeWith(services: Services, input: ChargeInput): Charge {
  return charge(services.provider, input);
}
```

Propose it **without** `--solidify`. Under 🔭 Semantic signal you should see:

```
   Affected contracts (1):
     · [assertion] assertion:<your assert knot> — triggered by entity:src/billing/client.ts:c3429d828d1e7e7b
```

The type check and the tests still pass, so nothing refuses it. In 7.28.0 the assertion is shown, not enforced; if you seal this, it lands. Do not seal it.

**Step 7: back out.** Use the ID from the PROPOSAL SUMMARY:

```bash
nool candidate drop <candidate-id>
git checkout -- src/billing/client.ts
```

You should see `0 candidate(s) still pending.` and `nool status --compact` shows `Tree Status   : ✓ CLEAN`.

**Step 8: evidence.** `nool evidence knot <assert-knot-id>` shows the intent and the policy results. On a clone with no rules they read `pre-solidify: not evaluated (no policies configured)`. After Module 05 they read `pre-solidify: passed (1 policies recorded)` and `policy POL-WS-001: allow [...]`. Run it on a knot that changed code, such as one from Module 02 or 08, as well: a code change lists `compile: pass by integrity-driver` and `unit-tests: pass by integrity-driver` under Attestations. `--format md` on `nool evidence export` gives the same record as a file you can attach to a review.

**Team: nool council.** Not run here; it needs model provider keys and a `[consortium.<name>]` in `nool.toml`. A fresh `nool init` leaves the `[consortium]` table empty.
