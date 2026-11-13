# 04 · Keep what your agents learn

Nothing to write in the code this time. The finding is about `src/billing/client.ts`, which every billing change goes through.

**Use this wording for step 3.** The packet only carries a finding when your question matches code that exists. This project has no refund code, so ask about the billing client:

```bash
nool context "add a refund to the billing client" --scope billing --budget 3000
```

The finding shows up next to the matching entities. Asked as "add a refund endpoint", nothing matches and the billing finding is not included.

**Step 4** needs the id `nool learn` printed in step 1 (`ID: <8 characters>`). `nool findings` does not print it.

**Step 5.** Your work so far is on the `main` thread:

```bash
nool thread show main --full
```
