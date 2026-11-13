# 19 · Hold sensitive changes and answer the auditor

Enterprise. The sensitive path in this project is `src/billing/`: payments.

For step 2, a change worth holding: make `charge()` refuse amounts over 1,000,000 cents.

```ts
if (input.amount > 1_000_000) throw new BillingError("amount is over the single-charge limit");
```

**The practice rule**, route handlers never import the payment provider:

```yaml
inv_id: POL-WS-002
title: "Route handlers go through the billing client"
scope: { type: global }
kind: behavioral
severity: high
mode: blocking
reason_code: 403
when:
  not: { semantic_path_is_test: true }
forbids:
  # a value import of the provider; `import type` is fine
  - diff_matches: 'import \{[^}]*\} from "\.\./billing/provider'
```

Keep the pattern in single quotes. Land the rule, then break it: add these two lines near the top of `src/api/routes.ts` and propose the file.

```ts
import { PaymentProvider as Provider } from "../billing/provider.ts";
export const _p = Provider;
```

You should see `[Aram DSL] POL-WS-002 failed: diff_matches(...)` and `Gate stack denied [POLICY_DENY] at stage pre-propose: reason code 403`. The rule was run against this project on 7.28.0 Enterprise.

Approvals need a second key, so on your own you will see your approval refused. The hold, attestation and audit steps were not run against this project.
