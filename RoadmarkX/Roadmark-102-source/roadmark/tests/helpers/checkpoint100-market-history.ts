import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

type MarketRow = Record<string, unknown> & { id: string };
type Market = { records: MarketRow[]; unverifiedLeads: MarketRow[] };
type Change = {
  section: "records" | "unverifiedLeads";
  index: number;
  id: string;
  before: MarketRow;
  after: MarketRow;
  changedFields: string[];
  researchBatch: string;
  sourceIds: string[];
};
type Fixture = {
  marketFile: string;
  beforeSHA256: string;
  afterSHA256: string;
  beforeJSONSHA256: string;
  afterJSONSHA256: string;
  allowedFields: string[];
  countsBefore: unknown;
  countsAfter: unknown;
  changes: Change[];
};
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const hash = (value: unknown) => sha(Buffer.from(JSON.stringify(value)));
const bytes = readFileSync(new URL("../../qa/checkpoint100-market-fixture.json", import.meta.url));
assert.equal(sha(bytes), "6ca6057ef2db97fb7aa1251e307f9d419c88dadfe67d2390014ccd436f967837", "Exact authored checkpoint100 evidence fixture");
export const fixture100 = JSON.parse(bytes.toString("utf8")) as Fixture;

/** Accept only the complete authored100 state, then reverse its exact ten rows. */
export function reconstructMarketBeforeCheckpoint100<T>(value: T): T {
  assert.equal(hash(value), fixture100.afterJSONSHA256, "Exact whole checkpoint100 market value");
  const market = structuredClone(value) as unknown as Market;
  assert.equal(fixture100.changes.length, 10);
  for (const change of fixture100.changes) {
    assert.deepEqual(market[change.section][change.index], change.after, `Exact checkpoint100 row: ${change.id}`);
    assert.equal(change.after.id, change.id);
    assert.equal(change.before.id, change.id);
    const changedFields = [...new Set([...Object.keys(change.before), ...Object.keys(change.after)])]
      .filter((key) => JSON.stringify(change.before[key]) !== JSON.stringify(change.after[key])).sort();
    assert.deepEqual(changedFields, fixture100.allowedFields, `Only four evidence fields: ${change.id}`);
    market[change.section][change.index] = structuredClone(change.before);
  }
  assert.equal(hash(market), fixture100.beforeJSONSHA256, "Exact complete checkpoint99 predecessor, including unrelated evidence and counts");
  return market as T;
}

/** Actual predecessor bytes, never a replacement hash or an inferred historical baseline. */
export function sourceBeforeCheckpoint100(file: string, current: Uint8Array): Buffer {
  assert.equal(file, fixture100.marketFile, "Only the exact checkpoint100 market path has a delta");
  assert.equal(sha(current), fixture100.afterSHA256, "Exact checkpoint100 market bytes");
  const before = reconstructMarketBeforeCheckpoint100(JSON.parse(Buffer.from(current).toString("utf8")));
  const result = Buffer.from(JSON.stringify(before, null, 2) + "\n");
  assert.equal(sha(result), fixture100.beforeSHA256, "Exact checkpoint99 market bytes");
  return result;
}
