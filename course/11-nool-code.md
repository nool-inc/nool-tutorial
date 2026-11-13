# 11 · Hand a whole goal to nool code

You need a model provider key. Module 02 already added `/health`, so give the agent something new.

**The `[code]` checks** for this project:

```toml
[code]
checks = ["npm test"]
min_verdict = "verified"
```

**A goal with a check that can fail.** If you have not fixed the 429 bug from Module 08 yet:

```bash
nool code --playbook bug-fix "Retry a 429 response like a 5xx. Then remove the todo option from the 'a 429 is retried' test in tests/billing/retries.test.ts so it guards the fix."
```

Removing `todo` is what makes the check meaningful: a `todo` test never fails, so without it `npm test` passes whether the fix works or not.

If you already fixed it, use: `"POST /v1/charges answers 400 for a currency other than usd or eur. Add a test for it in tests/billing/charges.test.ts."`

**For the practice**, "make the code cleaner" ends `self_checked` or `unverified`; the goal above can end `verified`.

Not run against this project yet: it needs a provider key.
