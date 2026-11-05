/**
 * Fails the build if internal vocabulary appears in rendered buyer pages.
 * Scans every prerendered HTML file under the given directories (default:
 * the Next server output and the static export, whichever exist).
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { plainWordsViolations } from "../src/lib/plain-words";

function* htmlFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* htmlFiles(full);
    else if (name.endsWith(".html")) yield full;
  }
}
// The plan's required pages fail the build. Every other prerendered page is
// reported (and fails only with --all) until their data text is reworded.
const REQUIRED = [
  "index.html",
  "discover.html",
  "cars/kia-ev5/air-2wd-standard-range-1.html",
  "compare/model-y-vs-atto-2.html",
];
const all = process.argv.includes("--all");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const roots = (args.length ? args : [".next/server/app", "out"]).filter(
  existsSync,
);
if (!roots.length) {
  console.error("No rendered output found; run next build first.");
  process.exit(1);
}
let files = 0;
const failures: string[] = [];
const others: string[] = [];
for (const root of roots)
  for (const file of htmlFiles(root)) {
    files++;
    const hits = plainWordsViolations(readFileSync(file, "utf8"));
    if (!hits.length) continue;
    const line = `${file}: ${hits.map((h) => `"${h.word}" ×${h.count}`).join(", ")}`;
    const required = REQUIRED.some((r) => file.endsWith(path.join(r)));
    (required || all ? failures : others).push(line);
  }
if (others.length)
  console.warn(
    `Plain-words: ${others.length} other page(s) still contain banned words (run with --all to fail on them).`,
  );
if (failures.length) {
  console.error(`Plain-words check failed in ${failures.length} page(s):`);
  for (const line of failures.slice(0, 40)) console.error("  " + line);
  process.exit(1);
}
console.log(
  `Plain-words check: ${files} rendered pages scanned; required pages clean.`,
);
