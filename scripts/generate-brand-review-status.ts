/**
 * Derives which brands are research-complete (plan section 1) from the coverage
 * report, so the public footer says "N brands fully reviewed, M partly" without
 * a hand-kept number. `--write` regenerates; `--check` fails if stale.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { buildCoverageReport, isOnSale, isTierOne } from "./reporting/reports";
import { loadReportInput } from "./reporting/load";

const FILE = "src/lib/generated/brand-review-status.json";
// Pinned by the data's own newest check date, never the wall clock, so the
// file is reproducible. Research-complete is evaluated at that date.
const AS_OF = "2026-10-16";
const input = loadReportInput();
const report = buildCoverageReport(input, AS_OF);
const listedBrands = [
  ...new Set(
    input.cars.filter((c) => isTierOne(c) && isOnSale(c)).map((c) => c.brand),
  ),
].sort();
const complete = new Set(report.brandsResearchCompleted);
const status = {
  asOf: AS_OF,
  fullyReviewed: listedBrands.filter((b) => complete.has(b)),
  partlyReviewed: listedBrands.filter((b) => !complete.has(b)),
};
const text = JSON.stringify(status, null, 2) + "\n";
if (process.argv.includes("--write")) {
  writeFileSync(FILE, text);
  console.log(
    `brand review status: ${status.fullyReviewed.length} fully, ${status.partlyReviewed.length} partly`,
  );
} else {
  let current = "";
  try {
    current = readFileSync(FILE, "utf8");
  } catch {}
  if (current !== text) {
    console.error(`${FILE} is stale; run: pnpm generate:brand-review-status`);
    process.exit(1);
  }
  console.log("brand review status is current");
}
