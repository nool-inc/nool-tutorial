# 01 · Put your repository under Nool

You need Node 22.18 or later (it runs the TypeScript directly) and Git.

```bash
git clone https://github.com/nool-inc/nool-tutorial.git
cd nool-tutorial
npm install      # TypeScript and Node's types, for the type check Nool runs
npm test         # 13 pass, 9 todo
```

The 9 `todo` tests are the course's exercises. Leave them alone for now.

Then follow the module from step 2: `nool init --from-git main`.

**What you should see**

- `nool init` imports the history and records its own files: `nool.toml`, `.noolignore`, agent hooks, and a few lines added to `.gitignore`. Each is a commit in `git log`.
- `nool discover features` finds one feature for this small project.
- `nool doctor` grades it A, with a warning or two.

**Why `npm install` matters.** On every change Nool type-checks TypeScript with `tsc` and runs `npm test`. Without `@types/node` the type check fails and every landing is refused with `Reification failed for '.ts'`.
