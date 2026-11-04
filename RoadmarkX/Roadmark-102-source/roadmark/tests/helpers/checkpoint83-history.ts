import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint84 as current } from "./checkpoint84-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../qa/checkpoint83-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
export const marketHash83 = (value: unknown) =>
  createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
const metadata = Object.fromEntries(
  Object.entries(current).filter(([key]) => key !== "records"),
);
assert.deepEqual(metadata, fixture.approvedMetadata);
assert.equal(marketHash83(current), fixture.approvedCanonicalSHA256);
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
      "Exact reviewed83 amendment: " + row.id,
    );
    return change.before;
  }
  assert.equal(
    marketHash83(row),
    fixture.unchangedRecordHashes[row.id],
    "Unchanged pre83 record: " + row.id,
  );
  return row;
});
export const marketBeforeCheckpoint83 = {
  ...fixture.previousMetadata,
  records: priorRecords,
} as typeof current;
assert.equal(
  marketHash83(marketBeforeCheckpoint83),
  fixture.previousCanonicalSHA256,
  "Exact full source82 market reconstructed",
);
