import { buildCoverageReport, formatCoverageReport } from "./reporting/reports";
import { loadReportInput, reportOptions } from "./reporting/load";
try {
  const options = reportOptions(process.argv.slice(2));
  if (options.help)
    console.log(
      "pnpm report:coverage [--as-of YYYY-MM-DD] [--details] [--json]\nRead-only Tier 1 baseline, C1–C6 checks, every core grade and gap. Default date: Australia/Sydney today. Open criteria do not make this reporting command fail.",
    );
  else {
    const report = buildCoverageReport(loadReportInput(), options.asOf);
    console.log(
      options.json
        ? JSON.stringify(report, null, 2)
        : formatCoverageReport(report, options.details),
    );
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
