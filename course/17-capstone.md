# 17 · Team capstone: ship a feature with three agents

Three agents, three scopes, three exercise tests:

| Agent | Scope | Done when |
|---|---|---|
| billing | `src/billing/` | `tests/billing/signing.test.ts`: "signs each delivery with an HMAC of its body" |
| api | `src/api/` | `tests/api/routes.test.ts`: "GET /v1/invoices returns at most ?limit invoices" |
| docs | `docs/` | `docs/retry-policy.md` describes the policy in `src/billing/client.ts` |

```bash
nool task create --name "Webhook delivery v2" \
  --acceptance "Every delivery carries a webhook-signature header" \
  --acceptance "GET /v1/invoices takes a limit" \
  --acceptance "Docs describe the retry policy" --solidify
```

**Billing, `src/billing/client.ts`.** Add `secret?: string` to `DeliverOptions`, and in `attemptOnce` sign the body:

```ts
import { createHmac } from "node:crypto";

const body = JSON.stringify(event);
const headers: Record<string, string> = { "content-type": "application/json", "webhook-id": event.id };
if (options.secret) headers["webhook-signature"] = `sha256=${createHmac("sha256", options.secret).update(body).digest("hex")}`;
// then send `headers` and `body`
```

**API, `src/api/routes.ts`**, in `GET /v1/invoices`:

```ts
const limit = req.query.limit ? Number(req.query.limit) : undefined;
return { status: 200, body: { invoices: listInvoices(services.provider, customer).slice(0, limit) } };
```

**Docs, `docs/retry-policy.md`.** Which failures are retried (5xx, network errors and timeouts, 429), at most 5 attempts, the wait (100 ms doubling, or Retry-After when the subscriber sends it), and what happens when it gives up.

Not run against this project yet; the code and tests were checked with `npm test`.
