/** pnpm refresh:snapshot — write a coverage snapshot of the effective catalogue (read-only). */
import fs from "node:fs";
import path from "node:path";
import { australianEvidenceDate } from "../../src/lib/evidence-date";
import { catalogueSnapshot } from "../../src/lib/data";
import { buildSnapshot } from "./snapshot-lib";

try {
  const args = process.argv.slice(2);
  let out = "", asOf = australianEvidenceDate(), force = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--out") out = args[++i] ?? "";
    else if (args[i] === "--as-of") asOf = args[++i] ?? "";
    else if (args[i] === "--force") force = true;
    else if (args[i] === "--help") {
      console.log("pnpm refresh:snapshot --out PATH [--as-of YYYY-MM-DD]\nWrites every Tier 1 version's availability, price, range and warranty facts as the catalogue stands now. Refuses to overwrite a snapshot (use --force only for a snapshot you have not committed).");
      process.exit(0);
    } else throw new Error(`Unknown option ${args[i]}; use --help`);
  }
  if (!out) throw new Error("--out is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("--as-of must be YYYY-MM-DD");
  if (fs.existsSync(out) && !force) throw new Error(`${out} exists; refusing to overwrite`);
  const { data, cars } = catalogueSnapshot();
  const snapshot = buildSnapshot(cars, data.sources, asOf);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(snapshot)}\n`);
  console.log(`Wrote ${out}: ${snapshot.versions.length} Tier 1 versions (${snapshot.versions.filter((v) => v.onSale).length} on sale), ${snapshot.sources.length} sources.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
