import { buildStaleReport, formatStaleReport } from "./reporting/reports";
import {
  loadReportInput,
  loadThresholds,
  reportOptions,
} from "./reporting/load";
try {
  const options = reportOptions(process.argv.slice(2), true);
  if (options.help)
    console.log(
      "pnpm report:stale [--as-of YYYY-MM-DD] [--days 30] [--details] [--json] [--all-tiers]\nRead-only, grouped by brand; default Tier 1 and Australia/Sydney today. The window includes tomorrow through day 30; already-aged claims are separate.",
    );
  else {
    const report = buildStaleReport(
      loadReportInput(),
      options.asOf,
      options.days,
      options.allTiers,
      loadThresholds(),
    );
    console.log(
      options.json
        ? JSON.stringify(report, null, 2)
        : formatStaleReport(report, options.details),
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
