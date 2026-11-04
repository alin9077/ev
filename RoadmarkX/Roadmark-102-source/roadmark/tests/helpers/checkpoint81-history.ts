import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint83 as current } from "./checkpoint83-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../qa/checkpoint81-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
export const marketHash81 = (value: unknown) =>
  createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
const metadata = Object.fromEntries(
  Object.entries(current).filter(([key]) => key !== "records"),
);
assert.deepEqual(metadata, fixture.approvedMetadata);
assert.equal(marketHash81(current), fixture.approvedCanonicalSHA256);
assert.equal(current.records.length, fixture.previousRecordCount);
assert.equal(
  new Set(current.records.map((row) => row.id)).size,
  fixture.previousRecordCount,
);
assert.equal(Object.keys(fixture.changes).length, 1);
assert.equal(
  Object.keys(fixture.unchangedRecordHashes).length,
  fixture.previousRecordCount - 1,
);
const priorRecords = current.records.map((row) => {
  const change = fixture.changes[row.id];
  if (change) {
    assert.deepEqual(
      row,
      change.after,
      "Exact reviewed81 amendment: " + row.id,
    );
    return change.before;
  }
  assert.equal(
    marketHash81(row),
    fixture.unchangedRecordHashes[row.id],
    "Unchanged pre81 record: " + row.id,
  );
  return row;
});
export const marketBeforeCheckpoint81 = {
  ...fixture.previousMetadata,
  records: priorRecords,
} as typeof current;
assert.equal(
  marketHash81(marketBeforeCheckpoint81),
  fixture.previousCanonicalSHA256,
  "Exact full source80 market reconstructed",
);
