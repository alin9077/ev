import { fixture100, reconstructMarketBeforeCheckpoint100, sourceBeforeCheckpoint100 } from "./checkpoint100-market-history";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Car, Research } from "../../src/lib/types";

const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");
const sha = (v: Uint8Array) => createHash("sha256").update(v).digest("hex");
const fixtureBytes = readFileSync(new URL("../../qa/checkpoint99-mazda-fixture.json", import.meta.url));
assert.equal(sha(fixtureBytes), "405e14b6a02a771fba0fb8cdfea6f651c817f6b8e112dfb531dd94b73164e3a2", "Exact authored checkpoint99 fixture");
export const fixture99 = JSON.parse(fixtureBytes.toString("utf8"));
const f91 = JSON.parse(readFileSync(new URL("../../qa/checkpoint91/checkpoint91-runtime-fixture.json", import.meta.url), "utf8"));
const read = (file: string) => readFileSync(new URL("../../" + file, import.meta.url));
// Normalize only the whole-hash-exact100 inventory before retaining every existing99 pin.
const atCheckpoint99 = (file: string, current: Uint8Array): Buffer =>
  file === fixture100.marketFile && sha(current) === fixture100.afterSHA256
    ? sourceBeforeCheckpoint100(file, current)
    : Buffer.from(current);

type FileSpec = { beforeSHA256: string; afterSHA256: string; beforeJSONSHA256: string; afterJSONSHA256: string; insertions?: { at: number; currentAt: number; text: string }[] };

/** Exact whole-input verification precedes reversal. Original number notation is retained. */
export function sourceBeforeCheckpoint99(file: string, current: Uint8Array): Buffer {
  current = atCheckpoint99(file, current);
  const spec = fixture99.files[file] as FileSpec | undefined;
  assert.ok(spec, `No checkpoint99 byte delta for ${file}`);
  assert.equal(sha(current), spec.afterSHA256, `Unapproved checkpoint99 source: ${file}`);
  let text = Buffer.from(current).toString("utf8");
  if (spec.insertions) {
    for (const insertion of [...spec.insertions].reverse()) {
      assert.equal(text.slice(insertion.currentAt, insertion.currentAt + insertion.text.length), insertion.text);
      text = text.slice(0, insertion.currentAt) + text.slice(insertion.currentAt + insertion.text.length);
    }
  } else {
    assert.equal(file, "data/market-inventory-2026-10-10.json");
    text = JSON.stringify(reconstructMarketBeforeCheckpoint99(JSON.parse(text)), null, 2) + "\n";
  }
  const bytes = Buffer.from(text);
  assert.equal(sha(bytes), spec.beforeSHA256, `Exact predecessor bytes: ${file}`);
  return bytes;
}
export function createCheckpoint99SourceReader(readCurrent: (file: string) => Buffer) {
  // Check the coordinated four-file state before exposing any predecessor.
  for (const [file, spec] of Object.entries(fixture99.files) as [string, FileSpec][])
    assert.equal(sha(atCheckpoint99(file, readCurrent(file))), spec.afterSHA256, `Unapproved checkpoint99 source: ${file}`);
  return (file: string): Buffer => Object.hasOwn(fixture99.files, file)
    ? sourceBeforeCheckpoint99(file, readCurrent(file))
    : Buffer.from(readCurrent(file));
}
export function dataBeforeCheckpoint99(file: string): Record<string, unknown> {
  const bytes = Object.hasOwn(fixture99.files, file) ? sourceBeforeCheckpoint99(file, read(file)) : read(file);
  return JSON.parse(bytes.toString("utf8"));
}
/** Only the exact revised Mazda row, context and one sidecar may be undone. */
export function reconstructMarketBeforeCheckpoint99<T>(value: T): T {
  if (hash(value) === fixture100.afterJSONSHA256) value = reconstructMarketBeforeCheckpoint100(value);
  const file = "data/market-inventory-2026-10-10.json";
  assert.equal(hash(value), fixture99.files[file].afterJSONSHA256, "Whole checkpoint99 market value");
  const market = structuredClone(value) as unknown as { records: unknown[]; sourceArtifacts: unknown[]; detailedCatalogueContext: unknown };
  assert.deepEqual(market.records[fixture99.market.index], fixture99.market.afterRow);
  assert.deepEqual(market.sourceArtifacts.at(-1), fixture99.market.appendedArtifact);
  assert.deepEqual(market.detailedCatalogueContext, fixture99.market.afterContext);
  market.records[fixture99.market.index] = structuredClone(fixture99.market.beforeRow);
  market.sourceArtifacts.pop();
  market.detailedCatalogueContext = structuredClone(fixture99.market.beforeContext);
  assert.equal(hash(market), fixture99.files[file].beforeJSONSHA256, "Whole unchanged checkpoint98 market predecessor");
  return market as T;
}
export function researchBeforeCheckpoint99(value: Research): Research {
  const d = structuredClone(value);
  for (const [key, rows] of Object.entries(fixture99.researchDelta) as [keyof Research, unknown[]][]) {
    const actual = d[key] as unknown[];
    assert.ok(Array.isArray(actual));
    assert.deepEqual(actual.slice(-rows.length), rows, `Exact appended research ${key}`);
    (d as unknown as Record<string, unknown>)[key] = actual.slice(0, -rows.length);
  }
  const sourceAt: number = fixture99.sourceInsertionIndex;
  const addedSources = fixture99.dataDelta.sources;
  assert.deepEqual(d.sources.slice(sourceAt, sourceAt + addedSources.length), addedSources, "Exact interior source block");
  d.sources.splice(sourceAt, addedSources.length);
  assert.deepEqual(d.metadata, { ...fixture99.previousMetadata, added_variant_count: fixture99.previousMetadata.added_variant_count + 2, added_feature_row_count: fixture99.previousMetadata.added_feature_row_count + 138 });
  d.metadata = structuredClone(fixture99.previousMetadata);
  assert.equal(hash(d), fixture99.previousResearchSHA256, "Complete original research, including every source and unknown");
  return d;
}
export function carsBeforeCheckpoint99(cars: Car[]): Car[] {
  assert.equal(cars.length, 345, "Current99 exact record count");
  assert.equal(new Set(cars.map(c => c.id)).size, 345);
  assert.deepEqual(JSON.parse(JSON.stringify(cars.slice(-2))), fixture99.expectedCars, "Both full authored Mazda cars, facts and summaries");
  const before = cars.slice(0, -2);
  assert.deepEqual(before.map(c => c.id), f91.previousCars.map((c: { id: string }) => c.id));
  for (const [i, c] of before.entries())
    assert.equal(hash(c), c.id === f91.targetId ? f91.approvedTargetSHA256 : f91.previousCars[i].hash, `Unchanged pre99 car: ${c.id}`);
  return structuredClone(before);
}
export function countsBeforeCheckpoint99(cars: Car[], data: Research) {
  const previousCars = carsBeforeCheckpoint99(cars), previousData = researchBeforeCheckpoint99(data);
  const counts = { variants: previousCars.length, families: new Set(previousCars.map(c => c.modelFamily || c.family)).size, generations: previousData.models.length, criteria: previousData.criteria.length, evidence: previousData.feature_evidence.length, current: previousCars.filter(c => c.availability === "current_or_order_listed").length, outgoing: previousCars.filter(c => c.availability === "outgoing").length, provisional: previousCars.filter(c => c.availability === "announced_provisional").length };
  assert.deepEqual(counts, fixture99.counts.before);
  return counts;
}
