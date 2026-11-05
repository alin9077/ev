/** pnpm refresh:plan — read-only. Work queue grouped by brand in sales order. */
import { australianEvidenceDate } from "../../src/lib/evidence-date";
import { catalogueSnapshot } from "../../src/lib/data";
import { loadReportInput } from "../reporting/load";
import { loadBrandOrder } from "./brands";
import { buildWorkQueue, formatWorkQueue } from "./queue";

function parseArgs(args: string[]) {
  const options = {
    asOf: australianEvidenceDate(),
    days: 45,
    brand: undefined as string | undefined,
    json: false,
    help: false,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--as-of") options.asOf = args[++i] ?? "";
    else if (arg === "--days") options.days = Number(args[++i]);
    else if (arg === "--brand") options.brand = args[++i];
    else if (arg === "--json") options.json = true;
    else if (arg === "--help") options.help = true;
    else throw new Error(`Unknown option ${arg}; use --help`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.asOf))
    throw new Error("--as-of must be YYYY-MM-DD");
  if (!Number.isInteger(options.days) || options.days < 1 || options.days > 366)
    throw new Error("--days must be an integer from 1 to 366");
  return options;
}
try {
  const options = parseArgs(process.argv.slice(2));
  if (options.help)
    console.log(
      "pnpm refresh:plan [--as-of YYYY-MM-DD] [--days 45] [--brand NAME] [--json]\nRead-only. Claims due for a recheck, by brand in sales order (docs/M1_BRAND_ORDER.md).",
    );
  else {
    const snapshot = catalogueSnapshot();
    const queue = buildWorkQueue(loadReportInput(snapshot), options.asOf, {
      horizonDays: options.days,
      brand: options.brand,
      order: loadBrandOrder(),
    });
    console.log(
      options.json ? JSON.stringify(queue, null, 2) : formatWorkQueue(queue),
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
