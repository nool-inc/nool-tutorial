// Runs the test suite with Node's built-in runner. No dependencies.
//   npm test             every test
//   npm test -- billing  only test files whose path contains "billing"
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function find(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return find(path);
    return entry.name.endsWith(".test.ts") ? [path] : [];
  });
}

const filters = process.argv.slice(2);
const files = find("tests").filter((file) => filters.every((f) => file.includes(f))).sort();
if (files.length === 0) {
  console.error(`No test file under tests/ matches: ${filters.join(" ")}`);
  process.exit(1);
}
const run = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
process.exit(run.status ?? 1);
