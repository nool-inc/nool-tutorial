# Take a branch from pull request to merge

The work: `charge()` keeps the customer id as sent, so `" cus_1 "` and `"cus_1"` are two customers. Trim it, on a branch, and merge the branch back.

**Before you start.** This module assumes Modules 01 to 12 are done and nothing is left staged: `nool status --compact` says `Tree Status   : ✓ CLEAN`. It does not need Module 20's branch rules; if you did that module, use a name your conventions allow instead of `feature/trim-customer`. If your `origin` is a GitHub repository with auto-push set, nothing here pushes, but check `[bridge] auto_push_remotes` in `nool.toml` is empty if you want to be sure.

**Step 1: the change.** Write down main's head knot: the short id `nool status --compact` prints under `✓ Linear timeline`. If Module 12's `1.1.0` release is the last thing on main, that id is the release knot. Then `git switch -c feature/trim-customer` and, in `src/billing/client.ts`, change the last line of `charge()`:

```ts
return provider.createCharge({ customer: input.customer.trim(), amount: input.amount, currency: input.currency ?? "usd" });
```

In `tests/billing/charges.test.ts`, add a test after "charges a customer in usd by default":

```ts
test("trims spaces around the customer id", () => {
  const provider = new PaymentProvider();
  assert.equal(charge(provider, { customer: " cus_1 ", amount: 500 }).customer, "cus_1");
});
```

`npm test -- billing` shows ✔ on "trims spaces around the customer id". Propose both files with `--solidify` as the module says.

**Step 2: test selection.** `nool test select --knot <knot-id>` picks all five test files here, because every test file imports `src/billing/client.ts`, directly or through another file:

```
full: selection covers 5/5 test files, estimated cost 100% of the full suite (5/5 test files): not cheaper than running everything
```

For the practice, add a `peek()` method to `DeliveryQueue` in `src/queue.ts` and a test for it in `tests/queue.test.ts`. That change selects two files:

```
2/5 test files: dependents closure of 2 touched path(s), estimated cost 40% of the full suite (2/5 test files)
  tests/api/routes.test.ts (ts): ...
  tests/queue.test.ts (ts): ...
```

**Step 3 (Team).** `nool pr summary --base <main-head-knot>` starts with:

```
## Nool Review Context

**Base:** `<main-head-knot>` · **Knots:** 1 · **Files touched:** 2
```

Use main's head knot, not `1.1.0`: a release as the base also lists the release knot under "Other changes".

**Step 4 (GitHub).** Not run in this course. It needs a GitHub repository you own and `nool github login`.

**Step 5: the request.** Run it from `main`. You authored the change, so you see:

```
  Filed range request <request-id> covering 1 knot(s)
Error: self-approval refused: this change was proposed by your own key; another role-holder has to decide (a sole developer can land `[approval] self_approval = "labelled"` to record a labelled self-approval)
```

**Step 7: labelled self-approval.** `nool init` already wrote an `[approval]` section in `nool.toml`. Add one line to it, after `hub_summary = "diffstat"`:

```toml
self_approval = "labelled"
```

Do not add a second `[approval]` header: propose refuses it with `Precheck failed: nool.toml: Invalid TOML syntax`. A `nool.toml` change also needs `--justification`; `--why` is refused with `CONFIG_CHANGE refused`. Then approve and wait:

```
✓ Labelled self-approval recorded: <id> on request <request-id>
  Request <request-id>: approved by <your key> (self_approved by the author: labelled, not independent review)
✓ request <request-id> approved by <your key>
```

`nool doctor` now lists `[approval] self_approval = "labelled" is landed`.

**Step 8: merge.** From `main`, `nool merge feature/trim-customer` ends with:

```
✅ Semantic convergence checked (no same-symbol collisions); trust gate evaluated
[main <sha>] Merge PR convergence from feature/trim-customer
✅ Converged PR branch 'feature/trim-customer'
```

`git log --oneline --graph -4` shows the branch merged into main, and `npm test` passes.

**What you should see**

- `nool approval list` shows the request as `approved`.
- `nool pr merge feature/trim-customer --into main` needs the branch on the remote first; without it you get ``Error: `origin` has no branch `feature/trim-customer` ``.

Run against a fresh clone of this project on nool 7.28.0 (Enterprise binary), with a local bare repository as `origin`. Steps 1, 2, 3, 5, 6, 7 and 8 were run; step 4 was checked against `--help` only. Modules 01 to 12 were not replayed first; only Module 12's `nool checkpoint 1.1.0 -s` was run before step 1. Checked a second time, in order, on another fresh clone.
