# 05 · Write a rule your agents cannot break

The rule file is in the module. Create `policies/no_secret_keys.yaml` from step 1 exactly.

**Step 3: break it.** Create `src/config.ts`:

```ts
export const awsConfig = {
  region: "us-east-1",
  accessKeyId: "AKIAIOSFODNN7EXAMPLE",
  bucket: "usage-exports",
};
```

`AKIAIOSFODNN7EXAMPLE` is the example key from AWS's own documentation. It is not a real credential.

**Step 5: fix it.** Read the key from the environment instead:

```ts
export const awsConfig = {
  region: process.env.AWS_REGION ?? "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  bucket: process.env.USAGE_EXPORT_BUCKET ?? "usage-exports",
};
```

**What you should see:** `[Aram DSL] POL-WS-001 failed: diff_matches(AKIA[0-9A-Z]{16})` and `Gate stack denied [POLICY_DENY] at stage pre-propose: reason code 403`, twice, word for word. The fixed file lands, and `nool policy stats` has a row for `policy:POL-WS-001`.

**Edition note.** Checked on 7.28.0 Enterprise. Rules and `nool admin contract grant --role editor` are coming to every edition; on an older Community release, a rule in `policies/` can make later proposals fail with `no unexpired Editor/Planner contract`.
