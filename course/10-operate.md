# 10 · Find out why something broke

**Plant a bug for bisect.** Nool runs the tests before a change lands, so a bug that breaks a test is refused. Land it with `--fast`, which defers that check:

```bash
# in src/billing/client.ts, listInvoices: drop .reverse()
nool propose --path src/billing/client.ts --intent "Simplify listInvoices" --fast --solidify
# land one more unrelated change so there is something to search through
```

`npm test -- billing` now fails on "lists one customer's invoices, newest first".

**Bisect with this test command:**

```bash
nool debug bisect --good <a knot before the bug> --test "test ! -f package.json || npm test -- billing"
```

The `test ! -f package.json ||` part matters on 7.28.0. Since Module 05 there is a rule, and every change also leaves a small record of the rule check. Bisect checks those records out with no source files in them; plain `npm test` fails there and bisect blames the record. The guard counts a tree without `package.json` as good, and bisect finds your change. This is filed with the Nool team.

Put the bug back with `.reverse()` and land the fix.

**Seal the checkpoint.** `nool checkpoint 1.0.0` only stages a release. Use `nool checkpoint 1.0.0 -s`.

**If `nool doctor --strict` says `Found 1 pending proposal`**, a staged change is waiting: `nool solidify` seals it.
