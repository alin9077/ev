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
const roots = (
  process.argv.slice(2).length
    ? process.argv.slice(2)
    : [".next/server/app", "out"]
).filter(existsSync);
if (!roots.length) {
  console.error("No rendered output found; run next build first.");
  process.exit(1);
}
let files = 0;
const failures: string[] = [];
for (const root of roots)
  for (const file of htmlFiles(root)) {
    files++;
    const hits = plainWordsViolations(readFileSync(file, "utf8"));
    if (hits.length)
      failures.push(
        `${file}: ${hits.map((h) => `"${h.word}" ×${h.count}`).join(", ")}`,
      );
  }
if (failures.length) {
  console.error(`Plain-words check failed in ${failures.length} page(s):`);
  for (const line of failures.slice(0, 40)) console.error("  " + line);
  process.exit(1);
}
console.log(`Plain-words check: ${files} rendered pages, no banned words.`);
