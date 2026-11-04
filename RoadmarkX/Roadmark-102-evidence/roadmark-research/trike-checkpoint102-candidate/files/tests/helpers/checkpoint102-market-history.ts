import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

type FileIdentity = { file: string; approvedBytes: number | null; approvedSHA256: string | null };
type Fixture = {
  market: {
    file: string; beforeBytes: number; beforeSHA256: string; afterBytes: number; afterSHA256: string;
    beforeJSONSHA256: string; afterJSONSHA256: string; countsBefore: unknown; countsAfter: unknown;
    appends: { key: string; beforeLength: number; values: unknown[] }[];
    replacements: { key: string; before: unknown; after: unknown }[];
  };
  changes: { file: string; previousBytes: number; previousSHA256: string; approvedBytes: number; approvedSHA256: string; previousText?: string }[];
  introduced: FileIdentity[];
  bootstrapCycleExclusions: string[];
  preservedPins: { file: string; bytes: number; sha256: string }[];
};
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const hash = (value: unknown) => sha(Buffer.from(JSON.stringify(value)));
export const checkpoint102FixtureSHA256 = "6ab1848a802a75241cbd13834d24d3ac3cc63260435453c5f0087bd0ad164bc8";
const fixtureBytes = readFileSync(new URL("../fixtures/checkpoint102-trikes.json", import.meta.url));
assert.equal(sha(fixtureBytes), checkpoint102FixtureSHA256, "Unapproved checkpoint102 fixture");
const fixture = JSON.parse(fixtureBytes.toString("utf8")) as Fixture;
/** Copies prevent a test caller from changing trusted reversal evidence. */
export function checkpoint102Fixture(): Fixture { return structuredClone(fixture); }
export function isCheckpoint102MarketValue(value: unknown): boolean { return hash(value) === fixture.market.afterJSONSHA256; }
export function isCheckpoint102MarketBytes(file: string, bytes: Uint8Array): boolean {
  return file === fixture.market.file && bytes.byteLength === fixture.market.afterBytes && sha(bytes) === fixture.market.afterSHA256;
}

/** Verify the whole approved value, then undo only the exact append/metadata operations. */
export function reconstructMarketBeforeCheckpoint102<T>(value: T): T {
  assert.equal(hash(value), fixture.market.afterJSONSHA256, "Whole checkpoint102 market value");
  const market = structuredClone(value) as Record<string, unknown>;
  for (const operation of fixture.market.appends) {
    const rows = market[operation.key];
    assert.ok(Array.isArray(rows), `Checkpoint102 array: ${operation.key}`);
    assert.equal(rows.length, operation.beforeLength + operation.values.length, operation.key);
    assert.deepEqual(rows.slice(operation.beforeLength), operation.values, `Exact checkpoint102 append: ${operation.key}`);
    market[operation.key] = rows.slice(0, operation.beforeLength);
  }
  for (const operation of fixture.market.replacements) {
    assert.deepEqual(market[operation.key], operation.after, `Exact checkpoint102 metadata: ${operation.key}`);
    market[operation.key] = structuredClone(operation.before);
  }
  assert.equal(hash(market), fixture.market.beforeJSONSHA256, "Whole exact checkpoint101 market predecessor, including unknown metadata");
  return market as T;
}

/** Only exact authored102 bytes qualify; preserve exact101 serialization and byte identity. */
export function sourceBeforeCheckpoint102(file: string, current: Uint8Array): Buffer {
  assert.equal(file, fixture.market.file, "Only the exact checkpoint102 market path has a byte delta");
  assert.equal(current.byteLength, fixture.market.afterBytes, "Unapproved checkpoint102 market length");
  assert.equal(sha(current), fixture.market.afterSHA256, "Unapproved checkpoint102 market bytes");
  const before = reconstructMarketBeforeCheckpoint102(JSON.parse(Buffer.from(current).toString("utf8")));
  const result = Buffer.from(JSON.stringify(before, null, 2) + "\n");
  assert.equal(result.length, fixture.market.beforeBytes, "Exact checkpoint101 market length");
  assert.equal(sha(result), fixture.market.beforeSHA256, "Exact checkpoint101 market bytes");
  return result;
}
