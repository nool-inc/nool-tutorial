# 19 · Hold sensitive changes and answer the auditor

Enterprise. The sensitive path in this project is `src/billing/`: payments.

**The hold.** `nool init` already wrote a `[steer]` table, switched off. Edit it in place (a second `[steer]` would be a duplicate table):

```toml
[steer]
enabled = true
points = [
  { point = "pre-solidify", role = "architect", triggers = [{ signal = "sensitive_path", paths = ["billing"] }] },
]
```

Land it with `--justification`, as every `nool.toml` change needs.

**A change worth holding:** make `charge()` refuse amounts over 1,000,000 cents.

```ts
if (input.amount > 1_000_000) throw new BillingError("amount is over the single-charge limit");
```

Give it an intent that says what it does. With an unrelated one, the proposal warns `Intent/diff overlap: 0%`.

What you should see:

- `nool propose --all ... --full`: `Affected contracts (4): [sensitive_path] billing — triggered by src/billing/client.ts`, then `Evidence plan: HumanApproval (billing)` and `Proposal stashed in .nool/candidate.knot`
- `nool solidify`: `⏸ Approval request <id> (pre-solidify): pending: needs 1 × steer:architect`, and the approver's and author's next commands
- `nool approval show <id>`: `Subject : candidate <id>`, `Needs : 1 × steer:architect`

`nool solidify` pushes the request to your `origin` remote without asking (`refs/nool/detached/<writer>`), so the approver can see it. Point `origin` at your fork, or at a local bare repository, before this step, so nothing goes to the course repository.

The held change is a candidate, not a knot yet, so `nool attest show` needs a landed knot id from `nool log`.

**Approving needs a second key.** The approver runs `nool approve <id> --comment "..."` on their own machine. Your own approval is refused. `nool steer ... --action approve` asks a multiple-choice challenge question first. On your own key, `nool approve` prints `Error: self-approval refused: this change was proposed by your own key` (exit 2). Approving with a second key was not run for these notes.

**An attestation.** `nool attest record --target <knot-id> --checker security-review --assertion security-scan --verdict pass` on a landed knot prints `✓ Attested security-scan Pass for <knot> (security-review · Full scope)` and `Ref : refs/knots/<id> (not pushed)`. `nool attest show <knot-id>` then lists `✓ security-scan pass full by security-review`.

**The audit.** On this project:

- `nool audit report`: `Status : ⚠ INCONCLUSIVE (absence of evidence is not a pass)`, exit 1. None of the four built-in invariants applied to anything here.
- `nool audit verify --framework soc2`: a status per control and `Verdict: FAIL`, exit 2. It reports `Integrity : FAIL` with `parent_missing` from the start: a fresh clone, right after `nool init --from-git main`, already shows one. After Module 20, the first knot landed on `main` after the merge adds another. With integrity failing, most controls show `UNVERIFIABLE`.
- `nool policy stats`: one row per gate, with evaluations, blocks and first-pass rate. Here `approval` blocked once.

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

Keep the pattern in single quotes. Save it as `policies/route_handlers.yaml` and land it. If you skipped Module 05, run `nool admin contract grant --role editor` first; without a contract, an agent's propose is refused with `no unexpired Editor/Planner contract`. Then break the rule: add these two lines near the top of `src/api/routes.ts` and propose the file.

```ts
import { PaymentProvider as Provider } from "../billing/provider.ts";
export const _p = Provider;
```

You should see `[Aram DSL] POL-WS-002 failed: diff_matches(...)` and `Gate stack denied [POLICY_DENY] at stage pre-propose: reason code 403`.

Hold, approval request, attestation, audit and the practice rule run against this project on 7.28.0 Enterprise, 2026-11-14. Approving with a second key was checked against `--help` only.
