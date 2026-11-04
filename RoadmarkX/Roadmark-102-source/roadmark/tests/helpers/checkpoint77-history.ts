import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint80 as current } from "./checkpoint80-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
type Row = Record<string, unknown>;
// Resolve relative to this helper, not the invoking process.
const fixture = JSON.parse(readFileSync(new URL("../../qa/checkpoint77-market-fixture.json", import.meta.url), "utf8")) as {
  previousMetadata: Row;
  approvedMetadata: Row;
  previousRecordCount: number;
  previousCanonicalSHA256: string;
  changes: Record<string, { before: Row; after: Row }>;
  unchangedRecordHashes: Record<string, string>;
};
export const marketHash77 = (value: unknown) => createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
const metadata = Object.fromEntries(Object.entries(current).filter(([key]) => key !== "records"));
assert.deepEqual(metadata, fixture.approvedMetadata, "Every current market metadata field matches reviewed77");
assert.equal(current.records.length, fixture.previousRecordCount);
assert.equal(new Set(current.records.map(row => row.id)).size, fixture.previousRecordCount);
const priorRecords = current.records.map(row => {
  const change = fixture.changes[row.id];
  if (!change) {
    assert.equal(marketHash77(row), fixture.unchangedRecordHashes[row.id], "Unchanged record: " + row.id);
    return row;
  }
  assert.deepEqual(row, change.after, "Exact reviewed77 amendment: " + row.id);
  const snapshots = (row as unknown as Row).priorEvidenceSnapshots as { checkpoint: number; previousRecord: Row; previousRecordCanonicalSHA256: string }[];
  const saved = snapshots.at(-1)!;
  assert.equal(saved.checkpoint, 77);
  assert.deepEqual(saved.previousRecord, change.before);
  assert.equal(marketHash77(saved.previousRecord), saved.previousRecordCanonicalSHA256);
  return saved.previousRecord;
});
export const marketBeforeCheckpoint77 = { ...fixture.previousMetadata, records: priorRecords } as unknown as typeof current;
assert.equal(marketHash77(marketBeforeCheckpoint77), fixture.previousCanonicalSHA256, "Exact full source76 market restores from live preserved records");
