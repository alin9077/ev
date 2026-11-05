/** pnpm refresh:diff — the only writer of data/changes/<YYYY-MM>.json. */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { diffSnapshots } from "./diff-lib";
import { validateAgainstSchema, type Schema } from "./schema-validate";
import type { Snapshot } from "./snapshot-lib";

const sha256 = (file: string) =>
  crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
try {
  const args = process.argv.slice(2);
  let beforePath = "", afterPath = "", month = "", out = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--before") beforePath = args[++i] ?? "";
    else if (args[i] === "--after") afterPath = args[++i] ?? "";
    else if (args[i] === "--month") month = args[++i] ?? "";
    else if (args[i] === "--out") out = args[++i] ?? "";
    else if (args[i] === "--help") {
      console.log("pnpm refresh:diff --before SNAPSHOT --after SNAPSHOT --month YYYY-MM --out data/changes/YYYY-MM.json\nGenerates the month's changes from two snapshots and validates them against data/changes/schema.json.");
      process.exit(0);
    } else throw new Error(`Unknown option ${args[i]}; use --help`);
  }
  if (!beforePath || !afterPath || !month || !out)
    throw new Error("--before, --after, --month and --out are required");
  if (out !== `data/changes/${month}.json`)
    throw new Error(`--out must be data/changes/${month}.json`);
  const before = JSON.parse(fs.readFileSync(beforePath, "utf8")) as Snapshot;
  const after = JSON.parse(fs.readFileSync(afterPath, "utf8")) as Snapshot;
  const result = diffSnapshots(before, after, {
    month,
    beforeSha256: sha256(beforePath),
    afterSha256: sha256(afterPath),
  });
  const schema = JSON.parse(fs.readFileSync("data/changes/schema.json", "utf8")) as Schema;
  const errors = validateAgainstSchema(result, schema);
  if (errors.length) throw new Error(`Generated changes fail data/changes/schema.json:\n${errors.slice(0, 10).join("\n")}`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`Wrote ${out}: ${result.changes.length} changes (${Object.entries(result.counts).filter(([, n]) => n).map(([t, n]) => `${t} ${n}`).join(", ") || "none"}).`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
