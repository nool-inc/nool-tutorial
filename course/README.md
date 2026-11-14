# Course notes

One file per module of [Learn Nool](https://www.nool.dev/tutorial). Each says what to change in this project, gives you the code, and tells you what you should see. The commands themselves are on the course page.

Exercises live in the tests as `todo` tests: they run on every `npm test` and show as ⚠ until you do the work, then turn ✔. A `todo` test never fails the suite, so Nool's checks pass while you work.

| Part | Module | Notes | Exercise tests |
|---|---|---|---|
| 1 Start here | 01 Put your repository under Nool | [01-install.md](01-install.md) | |
| | 02 Land your first governed change | [02-first-change.md](02-first-change.md) | `tests/api/routes.test.ts` (Module 02) |
| | 03 Stop two agents colliding | [03-parallel.md](03-parallel.md) | |
| | 04 Keep what your agents learn | [04-memory.md](04-memory.md) | |
| | 05 Write a rule your agents cannot break | [05-write-rule.md](05-write-rule.md) | |
| 2 Go deeper | 06 Read one function, not the whole file | [06-read-code.md](06-read-code.md) | |
| | 07 Know what a change will break | [07-blast-radius.md](07-blast-radius.md) | |
| | 08 Tie work to the change that finishes it | [08-tasks.md](08-tasks.md) | `tests/billing/retries.test.ts` (Module 08) |
| | 09 See what was checked, and by whom | [09-rules.md](09-rules.md) | |
| | 10 Find out why something broke | [10-operate.md](10-operate.md) | |
| | 11 Hand a whole goal to nool code | [11-nool-code.md](11-nool-code.md) | |
| | 12 Solo capstone | [12-solo-capstone.md](12-solo-capstone.md) | Module 12 tests |
| | 13 Undo a change without rewriting history | [13-history.md](13-history.md) | |
| | 14 Write down how your code is meant to fit together | [14-review-architecture.md](14-review-architecture.md) | |
| | 15 Take a branch from pull request to merge | [15-github-loop.md](15-github-loop.md) | `tests/billing/charges.test.ts` |
| 3 Team | 16 Claim code before you edit it | [16-announce.md](16-announce.md) | |
| | 17 Let agents ask instead of collide | [17-agent-to-agent.md](17-agent-to-agent.md) | |
| | 18 Run a fleet you can steer | [18-fleets.md](18-fleets.md) | |
| | 19 Try two ideas, keep the one that works | [19-explore-playbooks.md](19-explore-playbooks.md) | |
| | 20 Merge by your team's branch rules | [20-branches-merge.md](20-branches-merge.md) | |
| | 21 Team capstone | [21-capstone.md](21-capstone.md) | Module 21 tests |
| 4 Company | 22 Align every repository in the company | [22-workspaces.md](22-workspaces.md) | `scripts/setup-workspace.sh` |
| | 23 Hold sensitive changes | [23-gates.md](23-gates.md) | |

**What was checked.** Every module except 11, 12, 18 and 21 was run against this project with Nool 7.28.0 (Enterprise binary) on 2026-11-14: each module was run once, then run again from a fresh clone to catch what differed. Modules 11, 12, 18 and 21 need a model provider key, and steps that need GitHub or a second reviewer's key were checked against `--help` only; the notes say which. If something on your screen differs from these notes, tell us at help@nool.dev.
