/** pnpm refresh:scaffold — writes an empty findings file. Reads the catalogue; changes nothing else. */
import fs from "node:fs";
import path from "node:path";
import { australianEvidenceDate } from "../../src/lib/evidence-date";
import { catalogueSnapshot } from "../../src/lib/data";
import { loadReportInput } from "../reporting/load";
import { loadBrandOrder } from "./brands";
import { buildWorkQueue } from "./queue";
import { scaffoldFindings } from "./findings";

try {
  const args = process.argv.slice(2);
  let brand = "",
    asOf = australianEvidenceDate(),
    out = "",
    days = 45;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--brand") brand = args[++i] ?? "";
    else if (args[i] === "--as-of") asOf = args[++i] ?? "";
    else if (args[i] === "--out") out = args[++i] ?? "";
    else if (args[i] === "--days") days = Number(args[++i]);
    else if (args[i] === "--help") {
      console.log(
        "pnpm refresh:scaffold --brand NAME --out PATH [--as-of YYYY-MM-DD] [--days 45]\nWrites a findings file listing every on-sale Tier 1 version of the catalogue brand with all 17 core fields, outcome \"pending\". Refuses to overwrite.",
      );
      process.exit(0);
    } else throw new Error(`Unknown option ${args[i]}; use --help`);
  }
  if (!brand || !out) throw new Error("--brand and --out are required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) throw new Error("--as-of must be YYYY-MM-DD");
  if (fs.existsSync(out)) throw new Error(`${out} exists; refusing to overwrite`);
  const snapshot = catalogueSnapshot();
  const input = loadReportInput(snapshot);
  const queue = buildWorkQueue(input, asOf, {
    horizonDays: days,
    brand,
    order: loadBrandOrder(),
  });
  const findings = scaffoldFindings(input.cars, input.sources, queue, {
    brand,
    asOf,
  });
  if (!findings.versions.length)
    throw new Error(`No on-sale Tier 1 versions for catalogue brand "${brand}" (use the catalogue spelling, e.g. Jaecoo, MG, IM)`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(findings, null, 2)}\n`, { flag: "wx" });
  const fields = findings.versions.reduce((n, v) => n + v.fields.length, 0);
  console.log(
    `Wrote ${out}: ${findings.versions.length} versions, ${fields} fields (${findings.versions.reduce((n, v) => n + v.fields.filter((f) => f.due).length, 0)} due), all pending.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
