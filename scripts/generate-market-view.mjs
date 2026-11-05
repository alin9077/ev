import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const recordFields = Object.freeze([
  "id", "brand", "model", "vehicleClass", "trims", "aliases", "modelAliases",
  "checkedAt", "orderStatus", "stockStatus", "trimCoverage", "evidenceNote",
  "sourceUrls", "limitations",
]);
export const topFields = Object.freeze(["checkedAt", "scope", "notes", "statusDefinitions", "records"]);

// A display/search projection only. The canonical audit remains the fact source.
export function projectMarketView(inventory) {
  assert.ok(Array.isArray(inventory.records), "Market records must be an array");
  const ids = new Set();
  const records = inventory.records.map((record) => {
    assert.equal(typeof record.id, "string");
    assert.ok(record.id.length && !ids.has(record.id), "Missing or duplicate market ID");
    ids.add(record.id);
    const result = {};
    for (const key of recordFields) {
      if (Object.hasOwn(record, key)) result[key] = structuredClone(record[key]);
      else assert.ok(["vehicleClass", "aliases", "modelAliases"].includes(key), `Missing display field: ${key}`);
    }
    for (const key of ["trims", "sourceUrls", "limitations", "aliases", "modelAliases"]) {
      if (result[key] !== undefined) assert.ok(Array.isArray(result[key]) && result[key].every((value) => typeof value === "string"), `Invalid display array: ${key}`);
    }
    return result;
  });
  for (const key of topFields) {
    assert.ok(Object.hasOwn(inventory, key), `Missing display section: ${key}`);
  }
  return {
    checkedAt: structuredClone(inventory.checkedAt),
    scope: structuredClone(inventory.scope),
    notes: structuredClone(inventory.notes),
    statusDefinitions: structuredClone(inventory.statusDefinitions),
    records,
  };
}

export function serializeMarketView(inventory) {
  return JSON.stringify(projectMarketView(inventory), null, 2) + "\n";
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv.slice(2);
  assert.ok(mode.length === 1 && ["--write", "--check"].includes(mode[0]), "Use --write or --check");
  const source = new URL("../data/market-inventory-2026-10-10.json", import.meta.url);
  const target = new URL("../data/market-view.generated.json", import.meta.url);
  const expected = serializeMarketView(JSON.parse(fs.readFileSync(source, "utf8")));
  if (mode[0] === "--write") fs.writeFileSync(target, expected);
  else {
    assert.ok(fs.existsSync(target), "Missing market view; run generate:market-view");
    assert.equal(fs.readFileSync(target, "utf8"), expected, "Stale market view; run generate:market-view");
  }
  console.log(`Market view ${mode[0] === "--write" ? "generated" : "verified without writing"}`);
}
