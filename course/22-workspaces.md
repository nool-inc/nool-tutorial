# 18 · Align every repository in the company

Enterprise. This project becomes `billing-api`; a script makes the two repositories that call it.

**Step 1: lay out the company.** Replace the module's `for` loop with:

```bash
scripts/setup-workspace.sh ~/acme
mv "$PWD" ~/acme/engineering/billing-api
cd ~/acme/engineering/billing-api
```

The script writes `checkout-web` and `usage-reports`, each with `git init` and `nool init`. Both call `GET /health`, `POST /v1/charges` and `GET /v1/invoices` through a small client written `billing.get("/route")` and `billing.post("/route")`, the shape Nool reads when it compares two sides of a contract.

Moving the repository keeps its `.nool` ledger, so your history from Modules 01 to 17 comes with it.

**Steps 2 and 3** as in the module. `nool workspace doctor` shows no API CONTRACT DRIFT. It may suggest an edge between checkout-web and usage-reports because they call the same routes; you can ignore that.

**Step 5: the route change** in billing-api. Two files: the route and its tests.

```bash
sed -i.bak 's|"/v1/charges"|"/v2/charges"|' src/api/routes.ts tests/api/routes.test.ts && rm src/api/*.bak tests/api/*.bak
nool propose --path src/api/routes.ts --path tests/api/routes.test.ts --intent "Serve charges at /v2/charges" --solidify
```

You should see, for each dependent:

```
[Workspace] contract drift with checkout-web (advisory): HTTP POST /v2/charges (only here), HTTP POST /v1/charges (only in checkout-web)
```

**Step 7: adapt checkout-web.** In `src/orders.js`, change `"/v1/charges"` to `"/v2/charges"` and land it. After `nool notice reply`, `nool workspace doctor` shows drift only for usage-reports (`src/report.js`), which is the practice.

Run from start to finish against this project on 7.28.0 Enterprise.
