import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint88 as current } from "./checkpoint88-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../qa/checkpoint86-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
export const marketHash86 = (value: unknown) =>
  createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
const metadata = Object.fromEntries(
  Object.entries(current).filter(([key]) => key !== "records"),
);
assert.deepEqual(metadata, fixture.approvedMetadata);
assert.equal(marketHash86(current), fixture.approvedCanonicalSHA256);
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
      "Exact reviewed86 amendment: " + row.id,
    );
    return change.before;
  }
  assert.equal(
    marketHash86(row),
    fixture.unchangedRecordHashes[row.id],
    "Unchanged pre86 record: " + row.id,
  );
  return row;
});
export const marketBeforeCheckpoint86 = {
  ...fixture.previousMetadata,
  records: priorRecords,
} as typeof current;
assert.equal(
  marketHash86(marketBeforeCheckpoint86),
  fixture.previousCanonicalSHA256,
  "Exact full source85 market reconstructed",
);
