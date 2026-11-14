# Try two ideas, keep the one that works

This module needs Team. It writes no code in `src/`. You keep a record of two approaches to one problem, then add a playbook to `nool.toml`.

**Where you start.** Modules 01 to 12 done and `nool status` says `Tree Status : ✓ CLEAN`. Nothing here depends on what those modules changed; a fresh clone with `nool init --from-git main` works too. That is how it was checked.

**Steps 1 to 5: the record.** The goal is retries piling up while a subscriber is down. The two approaches are "pause the subscriber for a minute after 5 failures in a row" and "drop events older than an hour". Use the ids each `nool explore open` prints. When you are done, `nool explore view` shows:

```
1  [pending]  Stop retries piling up when a subscriber is down  (<root-id>)
  1.1  [merged] score=1.000  Pause a subscriber for a minute after 5 failures in a row  (<pause-id>)
      ↳ Pause the subscriber, keep its events
  1.2  [pruned] score=0.000  Drop events older than an hour  (<drop-id>)
      ↳ Dropping events loses money; never drop a charge event
```

and `nool explore constraints` shows:

```
✗ Drop events older than an hour — Drops charge events a subscriber still needs
```

`explore merge` records the decision. It does not change any file. Record a score before you merge: merge also accepts a node that was never started.

**Step 6: the playbook.** Add this to the end of `nool.toml`:

```toml
# One command before a release: the structural controls, then release readiness.
[playbook.pre-release]
steps = [
  { verb = "verify", args = "--all" },
  { verb = "doctor" },
]
```

Copy it exactly. The field is `verb`, and `args` is one string, not a list. With anything else, every nool command prints `Warning: could not parse nool.toml ... Using defaults.` and ignores the whole file, your rules included. `{ verb = "test" }` looks right but fails: `nool test` needs a subcommand.

`nool playbook plan pre-release` shows:

```
Playbook 'pre-release' (2 steps):
  1. nool verify --all
  2. nool doctor
```

**Step 7: land it, then run it.** Run it before you land `nool.toml` and doctor fails on the unlanded file, so the playbook stops:

```
Error: playbook step 1 (doctor) failed: `nool doctor` exited with exit status: 2
```

(The error counts steps from 0; this is the second step.) Land `nool.toml` on its own. With another file in the same propose it is refused with `CONFIG_CHANGE refused: a change to nool.toml must be solidified on its own`.

```bash
nool propose --path nool.toml --kind config --intent "Add the pre-release playbook" \
  --justification "One command to check the repository before a release" --solidify
nool playbook run pre-release
```

**What you should see**

- `✓ All 4 controls satisfied.` from the first step, a doctor report, then `✓ playbook 'pre-release' completed — 2 step(s) run.`
- `nool playbook audit --suggest` prints `Governance/loop readiness: 25/100` and three suggestions. One says `verify` is "not yet known to signal failure reliably via exit code".
- `nool playbook cost pre-release --cadence 1d` marks verify `unrecognized verb -- not modeled, assumed free` and ends with `At cadence 1d: ~$0.00/day, ~$0.00/month`. Neither step calls a model.

If the playbook still stops at doctor after `nool.toml` has landed, doctor found something else. Its `Required Fixes` list says what. Fix that and run the playbook again.

**Checked** with Nool 7.28.0 (Enterprise binary) on 2026-11-14, on a fresh clone of this project.
