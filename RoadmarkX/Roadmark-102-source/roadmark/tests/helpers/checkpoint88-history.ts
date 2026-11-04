import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint89 as current } from "./checkpoint89-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";
const fixture = JSON.parse(readFileSync(new URL("../../qa/checkpoint88-market-fixture.json", import.meta.url),"utf8"));
export const marketHash88 = (v: unknown) => createHash("sha256").update(canonicalReviewedJson(v)).digest("hex");
assert.equal(marketHash88(current),fixture.approvedCanonicalSHA256);
assert.equal(current.records.length,fixture.approvedRecordCount);
assert.equal(new Set(current.records.map(r=>r.id)).size,241);
assert.deepEqual(Object.fromEntries(Object.entries(current).filter(([k])=>k!=="records")),fixture.approvedMetadata);
assert.equal(Object.keys(fixture.changes).length,1);
assert.equal(fixture.addedRecords.length,1);
assert.equal(Object.keys(fixture.unchangedRecordHashes).length,239);
assert.deepEqual(current.records.slice(-1),fixture.addedRecords);
const priorRecords=current.records.slice(0,-1).map(row=>{
  const change=fixture.changes[row.id];
  if(change){assert.deepEqual(row,change.after,"Reviewed88 amendment "+row.id);return change.before;}
  assert.equal(marketHash88(row),fixture.unchangedRecordHashes[row.id],"Unchanged pre88 record "+row.id);
  return row;
});
assert.equal(priorRecords.length,fixture.previousRecordCount);
export const marketBeforeCheckpoint88={...fixture.previousMetadata,records:priorRecords} as typeof current;
assert.equal(marketHash88(marketBeforeCheckpoint88),fixture.previousCanonicalSHA256,"Exact full source87 market reconstructed");
