# 16 · Merge by your team's branch rules

The conventions in the module branch features from `develop`. This project only has `main`.

**Order matters.** Land the `[branches]` section first, then make `develop`:

```bash
git branch develop main
```

If you make `develop` before the conventions land, branches cut from it have no `[branches]` section. `nool branch check` then quietly falls back to the defaults.

**Every pattern except `release` needs `{slug}`.** With `hotfix/{version}`, `nool branch conventions` stops with ``Error: [branches] hotfix: `hotfix/{version}` needs {slug} so each branch gets its own name`` (exit 2). The propose does not check this: the bad pattern lands, and then every `nool branch` command fails. Use `hotfix/{version}-{slug}`.

**A `nool.toml` change needs `--justification`.** With `--why` alone it is refused: `CONFIG_CHANGE refused: a change to nool.toml must carry a justification typed for it`.

"order history" fits this project: `GET /v1/invoices` already returns a customer's charges, newest first. A small change for the branch:

```ts
// in src/api/routes.ts, the /v1/invoices handler
const invoices = listInvoices(services.provider, customer);
return { status: 200, body: { invoices, count: invoices.length } };
```

Propose it while on `feature/SHOP-12-order-history`. It lands there, on a thread named `SHOP-12-order-history`.

**The wrong branch name.** In your own terminal, `git switch -c my-experiment` works, and `nool branch check` then exits 2. Agents are stopped earlier: `nool hooks install` adds a guard to Claude Code that refuses the switch with `that branch name breaks this repository's naming conventions`. Land the files it writes (`.claude/settings.json`, `.codex/hooks.json`), or `nool pr merge` later refuses with `uncommitted changes`.

**Two agents, two branches.** Announce `src/api/routes.ts` as one agent on `develop`, switch to the feature branch, and announce it as another. The second claim succeeds with `⚠ also being changed on develop (...): file:src/api/routes.ts. Not a conflict here; expect to reconcile them when the branches merge.` On 7.28.0 the second agent's propose was still refused with `Coordination conflict` (exit 3), so release the first claim before you land.

**Typed commit messages (Enterprise).** The `[commit]` table is already in `nool.toml`, empty. Fill it in:

```toml
[commit]
template = "{{type}}: {{subject}}\n\n{{body}}\n\n{{nool_block}}"
allowed_types = ["feat", "fix", "docs", "chore"]
validation = "block"
```

`{{nool_block}}` must appear exactly once. Otherwise you get `required placeholder {{nool_block}} must appear exactly once (found 0)`. A type outside the list is refused: `commit type wip is not allowed`. Once it lands, Nool's commits read `chore: <intent>`. Commits made before the template fail `nool commit-template validate`, so check from that point on.

**Merging.** `nool pr merge` fetches both branches from a remote (`origin` by default). Your clone's `origin` is the course repository, so use your fork, or a local one:

```bash
git init --bare ../shop-remote.git
git remote add local ../shop-remote.git
nool push local
nool pr merge feature/SHOP-12-order-history --into develop --remote local
```

If you follow the module as written, `develop` has not moved since you branched, so git fast-forwards: `Fast-forward`, then `✓ merged feature/SHOP-12-order-history into develop`, and no merge commit. When `develop` has moved on, you see `Merge made by the 'ort' strategy.` and `git log --graph develop` shows the two parents.

On 7.28.0, watch one thing: the merge commit's subject (`Merge branch '...' of ../shop-remote into develop`) is over 72 characters, so `nool commit-template validate` fails it under a `validation = "block"` template (exit 2).

`nool code --fleet ... --into` needs a model provider key and was not run for these notes. Neither was `nool push local`: the local remote was filled with `git -C ../shop-remote.git fetch "$PWD" "refs/heads/*:refs/heads/*"` instead.

Run against this project on 7.28.0 Enterprise, 2026-11-14.
