#!/usr/bin/env bash
# Module 22: lay out a small company of repositories for `nool workspace`.
#
#   scripts/setup-workspace.sh [acme-dir]      (default: ~/acme)
#
# Creates two callers of this project's billing API, each its own repository:
#   <acme-dir>/engineering/checkout-web   pays for orders and shows order history
#   <acme-dir>/data/usage-reports         reads invoices and charges overage
# Both call POST /v1/charges and GET /v1/invoices, so every contract starts in step.
# Then move this repository to <acme-dir>/engineering/billing-api (the script prints how).
set -euo pipefail

ACME="${1:-$HOME/acme}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"

if [ -e "$ACME/engineering/checkout-web" ] || [ -e "$ACME/data/usage-reports" ]; then
  echo "$ACME already has checkout-web or usage-reports; remove them or pick another folder." >&2
  exit 1
fi

mkdir -p "$ACME/engineering/checkout-web/src" "$ACME/data/usage-reports/src"

# Each caller reaches billing-api through a small client. Calls are written
# billing.get("/route") and billing.post("/route"), which is how Nool reads
# the routes a repository uses when it compares two sides of a contract.
CLIENT='// A small HTTP client for billing-api.
const BILLING_URL = process.env.BILLING_URL ?? "http://localhost:3000";

async function request(method, path, { query, body } = {}) {
  const url = new URL(path, BILLING_URL);
  for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, value);
  const response = await fetch(url, {
    method,
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${method} ${path}: HTTP ${response.status}`);
  return response.json();
}

export const billing = {
  get: (path, options) => request("GET", path, options),
  post: (path, options) => request("POST", path, options),
};'

for repo in "$ACME/engineering/checkout-web" "$ACME/data/usage-reports"; do
  printf '%s\n' "$CLIENT" > "$repo/src/client.js"
done

cat > "$ACME/engineering/checkout-web/src/orders.js" <<'JS'
import { billing } from "./client.js";

export async function billingIsUp() {
  const { status } = await billing.get("/health");
  return status === "ok";
}

export function payForOrder(customer, amountCents) {
  return billing.post("/v1/charges", { body: { customer, amount: amountCents } });
}

export async function orderHistory(customer) {
  const { invoices } = await billing.get("/v1/invoices", { query: { customer } });
  return invoices;
}
JS

cat > "$ACME/engineering/checkout-web/README.md" <<'MD'
# checkout-web

Pays for orders through billing-api (`POST /v1/charges`), shows order history (`GET /v1/invoices`) and checks `GET /health` first.
MD

cat > "$ACME/data/usage-reports/src/report.js" <<'JS'
import { billing } from "./client.js";

export async function billingIsUp() {
  const { status } = await billing.get("/health");
  return status === "ok";
}

export async function monthlyTotal(customer) {
  const { invoices } = await billing.get("/v1/invoices", { query: { customer } });
  return invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
}

export function chargeOverage(customer, overageCents) {
  return billing.post("/v1/charges", { body: { customer, amount: overageCents } });
}
JS

cat > "$ACME/data/usage-reports/README.md" <<'MD'
# usage-reports

Totals a customer's invoices (`GET /v1/invoices`) and charges overage (`POST /v1/charges`) through billing-api, after checking `GET /health`.
MD

for repo in "$ACME/engineering/checkout-web" "$ACME/data/usage-reports"; do
  (cd "$repo" && git init -q -b main)
  if command -v nool >/dev/null 2>&1; then
    (cd "$repo" && nool init >/dev/null && echo "✓ $repo (git + nool)")
  else
    echo "✓ $repo (git only: install nool, then run nool init there)"
  fi
done

cat <<EOF

Now put the course project in the tree, ledger and all:

  mv "$HERE" "$ACME/engineering/billing-api"
  cd "$ACME" && nool workspace init && nool workspace status

Then carry on from step 2 of course/18-workspaces.md.
EOF
