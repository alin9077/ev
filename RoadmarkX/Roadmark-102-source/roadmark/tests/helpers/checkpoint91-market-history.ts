import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint93 as current } from "./checkpoint93-market-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
const fixture = JSON.parse(readFileSync(new URL("../../qa/checkpoint91-market-fixture.json", import.meta.url), "utf8"));
export const marketHash91 = (value: unknown) => createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
assert.equal(marketHash91(current), fixture.approvedCanonicalSHA256);
assert.equal(current.records.length, fixture.approvedRecordCount);
assert.equal(new Set(current.records.map(row => row.id)).size, 241);
assert.deepEqual(Object.fromEntries(Object.entries(current).filter(([key]) => key !== "records")), fixture.approvedMetadata);
assert.deepEqual(Object.keys(fixture.changes), ["ldv-mifa-9"]);
assert.deepEqual(fixture.addedRecords, []);
assert.equal(Object.keys(fixture.unchangedRecordHashes).length, 240);
const priorRecords = current.records.map(row => {
  const change = fixture.changes[row.id];
  if (change) {
    assert.deepEqual(row, change.after, "Reviewed91 amendment " + row.id);
    return change.before;
  }
  assert.equal(marketHash91(row), fixture.unchangedRecordHashes[row.id], "Unchanged pre91 record " + row.id);
  return row;
});
assert.equal(priorRecords.length, fixture.previousRecordCount);
export const marketBeforeCheckpoint91 = { ...fixture.previousMetadata, records: priorRecords } as typeof current;
assert.equal(marketHash91(marketBeforeCheckpoint91), fixture.previousCanonicalSHA256, "Exact full source90 market reconstructed");
