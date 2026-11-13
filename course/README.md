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
| 3 Team | 13 Claim code before you edit it | [13-announce.md](13-announce.md) | |
| | 14 Let agents ask instead of collide | [14-agent-to-agent.md](14-agent-to-agent.md) | |
| | 15 Run a fleet you can steer | [15-fleets.md](15-fleets.md) | |
| | 16 Merge by your team's branch rules | [16-branches-merge.md](16-branches-merge.md) | |
| | 17 Team capstone | [17-capstone.md](17-capstone.md) | Module 17 tests |
| 4 Company | 18 Align every repository in the company | [18-workspaces.md](18-workspaces.md) | `scripts/setup-workspace.sh` |
| | 19 Hold sensitive changes | [19-gates.md](19-gates.md) | |

**What was checked.** Modules 01 to 10 and 18, and the rule in 19, were run start to finish against this project with Nool 7.28.0 (Enterprise binary) on 2026-11-14. Modules 11 to 17 and the rest of 19 need a model provider key, a Team trial or a second reviewer, so only their code and tests were checked here. If something on your screen differs from these notes, the notes say so where we know about it; otherwise, tell us at help@nool.dev.
