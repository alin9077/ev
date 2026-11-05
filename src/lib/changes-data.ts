/** Server-only: reads the generated monthly files at build time. Nothing here is hand-edited. */
import fs from "node:fs";
import path from "node:path";
import { sortMonthsNewestFirst, type ChangesMonth } from "./changes";

export function loadChangeMonths(
  directory = path.join(process.cwd(), "data/changes"),
): ChangesMonth[] {
  if (!fs.existsSync(directory)) return [];
  const months = fs
    .readdirSync(directory)
    .filter((name) => /^\d{4}-(0[1-9]|1[0-2])\.json$/.test(name))
    .map((name) => {
      const month = JSON.parse(
        fs.readFileSync(path.join(directory, name), "utf8"),
      ) as ChangesMonth;
      if (
        month.schema !== "roadmark-changes-v1" ||
        month.month !== name.slice(0, 7) ||
        !Array.isArray(month.changes) ||
        !Array.isArray(month.sources)
      )
        throw new Error(`Invalid changes file ${name}`);
      return month;
    });
  return sortMonthsNewestFirst(months);
}
