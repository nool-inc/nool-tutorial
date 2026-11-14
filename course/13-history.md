# Undo a change without rewriting history

The work: an unwanted `version` field on `GET /health`. You land it on its own thread, look back at the code before it, then take it out and land the undo. Nothing is deleted from history.

**Where you start.** After Module 12: a clean tree, the Module 02 health check landed, and release `1.1.0` from the capstone. Check with `nool status --compact` (`Tree Status   : ✓ CLEAN`). If you skipped Module 12, run `nool checkpoint 1.1.0 -s` first so step 7 has something to compare with.

**Step 1: the bookmark.**

```bash
nool tag before-version -s
```

If `nool status` lists a pending candidate, `-s` seals that one first. Run `nool solidify` again for the tag.

**Step 2: the unwanted change.** Make the thread, then in `src/api/health.ts` add `version: "1.2.0"` to the body that `health()` returns. With the Module 02 code it reads:

```ts
export function health(services: Services): Reply {
  return { status: 200, body: { status: "ok", queueDepth: services.queue.depth(), version: "1.2.0" } };
}
```

If your capstone changed `health()` (the degraded status), keep that code and only add the `version` field to the same object.

```bash
nool thread create --name show-version --desc "Report the build version on /health"
nool diff
nool propose --path src/api/health.ts --thread show-version \
  --intent "Report the version on /health" --why "Support asks which build is running" --solidify
```

`nool diff` shows the one changed line. The propose ends with `✓ Landed knot <knot-id>`. Note the id.

**Step 3: find out what it was.**

```bash
nool compare thread:main thread:show-version
nool explain <knot-id>
```

You should see `Only in show-version (2)` (the thread and the change), and `intent          : Report the version on /health` with `impact` lines for `health in src/api/health.ts`. Keep the `hlc_timestamp` number from `explain` for step 7.

**Step 4: look back, then come back.** Land or save any edits of your own first. `rewind` overwrites unlanded edits to tracked files without asking.

```bash
nool rewind --intent before-version
npm test -- api
nool log --limit 1
nool rewind --knot <newest knot-id>
```

The first rewind prints `DAG history preserved — this is a working-tree change only, not a new Knot.` and `src/api/health.ts` has no `version`. `npm test -- api` reports `ℹ pass 7` and `ℹ todo 1` (the Module 21 exercise). After the second rewind, `git status --short` prints nothing.

`--intent` takes a tag name. It matches part of a name and picks the newest match, so `before` would find this tag too. A change's intent text, a thread name or a release label such as `1.1.0` gives `No historical knot found matching intent`. Use `--knot` when you need one exact knot.

**Step 5: take the thread out.**

```bash
nool pluck show-version
nool pluck show-version --execute
nool diff
```

The first command only simulates. It prints the long timeline that would remain, then `would restore src/api/health.ts` and `Simulation only — run with --execute to apply to the working tree.` The second prints `✓ Restored 1 file(s), removed 0 file(s) created only by the plucked lineage.` The diff removes the `version` field.

**Step 6: land the undo.**

```bash
nool propose --path src/api/health.ts --intent "Pluck thread 'show-version'" \
  --why "Version reporting waits for the release process" --solidify
nool log --thread show-version
```

The log still lists `Report the version on /health` and `Thread    show-version created`. The history says what was added, then why it went.

**Step 7: release and compare.**

```bash
nool checkpoint 1.2.0 -s
nool compare release:1.1.0 release:1.2.0
nool changelog --since <hlc_timestamp from step 3>
```

You should see `Only in 1.1.0 (0)` and, under `Only in 1.2.0`, the 1.1.0 release itself, the tag, the thread, the change and the undo. The changelog starts `*Since <the time of your change>*` and lists the `show-version` thread separately from `main`.

**Practice.** Append one line to `README.md`, land it on `main`, then `nool link <knot-id> --thread show-version` and `nool solidify`. `nool pluck show-version` (no `--execute`) now also says `would restore README.md`. Because the undo already landed, it may also list `src/api/health.ts` under `would reconcile`. If you run it with `--execute` by mistake, `nool rewind --knot <newest knot-id>` puts every file back.
