import { dataBeforeCheckpoint82 } from "./checkpoint82-history";
import { marketBeforeCheckpoint77 } from "./checkpoint77-history";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
type Row = Record<string, unknown>;
type Market = Row & {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};
type ArraySpec = Record<string, { length: number; appended: unknown[] }>;
type Fixture = {
  previousData: Record<string, { rawSHA256: string; canonicalSHA256: string }>;
  previousMarketMetadata: Row;
  approvedCurrentMarketMetadata: Row;
  previousRecordCount: number;
  previousHistoryCount: number;
  originalLeadIndex: number;
  newMarketRecord: Row;
  newHistory: Row;
  changedRecords: Record<string, Row>;
  additionArrays: ArraySpec;
  buyerArrays: ArraySpec;
  buyerNewTopFields: Row;
  newIdentitySnapshots: Row;
};
const read = (file: string): Row =>
  JSON.parse(
    readFileSync(new URL("../../" + file, import.meta.url), "utf8"),
  ) as Row;
const fixture = read("qa/checkpoint73-fixture.json") as unknown as Fixture;
export const canonical73 = (v: unknown): unknown =>
  Array.isArray(v)
    ? v.map(canonical73)
    : v && typeof v === "object"
      ? Object.fromEntries(
          Object.entries(v)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, x]) => [k, canonical73(x)]),
        )
      : v;
export const canonicalHash73 = (v: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical73(v)))
    .digest("hex");
const current = marketBeforeCheckpoint77 as unknown as Market;
assert.deepEqual(
  Object.fromEntries(
    Object.entries(current).filter(
      ([k]) => !["records", "unverifiedLeads", "reconciledLeads"].includes(k),
    ),
  ),
  fixture.approvedCurrentMarketMetadata,
  "Every current market metadata field must match the reviewed73 candidate",
);
assert.equal(current.records.length, fixture.previousRecordCount + 1);
assert.equal(current.reconciledLeads.length, fixture.previousHistoryCount + 1);
assert.deepEqual(current.records.at(-1), fixture.newMarketRecord);
assert.deepEqual(current.reconciledLeads.at(-1), fixture.newHistory);
for (const [id, approved] of Object.entries(fixture.changedRecords))
  assert.deepEqual(
    current.records.find((r) => r.id === id),
    approved,
    "Only exact reviewed existing-row amendments: " + id,
  );
const priorRecords = current.records
  .filter((r) => r.id !== fixture.newMarketRecord.id)
  .map((r) => {
    if (!Object.hasOwn(fixture.changedRecords, r.id as string)) return r;
    const snapshots = r.priorEvidenceSnapshots as { previousRecord: Row }[];
    assert.ok(Array.isArray(snapshots) && snapshots.length > 0);
    return snapshots.at(-1)!.previousRecord;
  });
const priorLeads = [...current.unverifiedLeads];
priorLeads.splice(
  fixture.originalLeadIndex,
  0,
  fixture.newHistory.originalRecord as Row,
);
export const marketBeforeCheckpoint73 = {
  ...fixture.previousMarketMetadata,
  records: priorRecords,
  unverifiedLeads: priorLeads,
  reconciledLeads: current.reconciledLeads.slice(
    0,
    fixture.previousHistoryCount,
  ),
} as Market;
assert.equal(
  canonicalHash73(marketBeforeCheckpoint73),
  fixture.previousData["data/market-inventory-2026-10-10.json"].canonicalSHA256,
  "Exact complete source72 market reconstructs from preserved live snapshots",
);
function restoreArrays(value: Row, specs: ArraySpec) {
  for (const [key, spec] of Object.entries(specs)) {
    const rows = value[key] as unknown[];
    assert.ok(Array.isArray(rows));
    assert.deepEqual(
      rows.slice(spec.length),
      spec.appended,
      "Only approved73 array additions: " + key,
    );
    value[key] = rows.slice(0, spec.length);
  }
}
export function dataBeforeCheckpoint73(file: string): Row {
  if (file === "data/market-inventory-2026-10-10.json")
    return structuredClone(marketBeforeCheckpoint73);
  const value = dataBeforeCheckpoint82(file);
  if (file === "data/catalogue-additions-2026-10-10.json")
    restoreArrays(value, fixture.additionArrays);
  else if (file === "data/buyer-selling-points-2026-10-10.json") {
    restoreArrays(value, fixture.buyerArrays);
    for (const [key, expected] of Object.entries(fixture.buyerNewTopFields)) {
      assert.deepEqual(value[key], expected);
      delete value[key];
    }
  } else if (file === "data/buyer-identity-snapshots-2026-10-10.json") {
    const snapshots = value.snapshots as Row;
    for (const [key, expected] of Object.entries(
      fixture.newIdentitySnapshots,
    )) {
      assert.deepEqual(snapshots[key], expected);
      delete snapshots[key];
    }
  }
  if (fixture.previousData[file])
    assert.equal(
      canonicalHash73(value),
      fixture.previousData[file].canonicalSHA256,
      "Every source72 data field remains reconstructable: " + file,
    );
  return value;
}
export function verifiedPre73DataHash(file: string): string {
  if (!fixture.previousData[file])
    return createHash("sha256")
      .update(readFileSync(new URL("../../" + file, import.meta.url)))
      .digest("hex");
  dataBeforeCheckpoint73(file);
  // This is the pinned original byte digest after exact semantic restoration,
  // never a claim that current JSON bytes have the predecessor's hash.
  return fixture.previousData[file].rawSHA256;
}
