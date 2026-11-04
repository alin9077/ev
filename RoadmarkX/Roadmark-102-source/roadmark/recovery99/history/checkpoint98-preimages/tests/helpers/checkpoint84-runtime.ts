import { carsBeforeCheckpoint91, dataBeforeCheckpoint91 } from "./checkpoint91-history";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  catalogue as liveCatalogue,
  research as liveResearch,
} from "../../src/lib/data";
import type { Car, Research } from "../../src/lib/types";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../qa/checkpoint84-runtime-fixture.json", import.meta.url),
    "utf8",
  ),
);
const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
/** Exact full approved delta validation precedes historical reconstruction. */
export function carsBeforeCheckpoint84(cars: Car[] = liveCatalogue()): Car[] {
  const before91 = carsBeforeCheckpoint91(cars);
  assert.equal(before91.length, fixture.previousCars.length + 1);
  assert.equal(new Set(before91.map((c) => c.id)).size, before91.length);
  const city = before91.find((c) => c.id === fixture.id);
  assert.ok(city);
  assert.equal(hash(city), fixture.approvedCityHash);
  const previous = before91.filter((c) => c.id !== fixture.id);
  assert.deepEqual(
    previous.map((c) => c.id),
    fixture.previousCars.map((c: { id: string }) => c.id),
  );
  for (const [i, car] of previous.entries())
    assert.equal(hash(car), fixture.previousCars[i].hash, car.id);
  return previous;
}
export function researchBeforeCheckpoint84(
  data: Research = liveResearch(),
): Research {
  assert.equal(hash(data), fixture.approvedResearchHash);
  const previous = structuredClone(data) as unknown as Record<string, unknown>;
  for (const [key, spec] of Object.entries(fixture.researchDelta.arrays) as [
    string,
    { previousLength: number; appended: unknown[] },
  ][]) {
    const rows = previous[key] as unknown[];
    assert.deepEqual(rows.slice(spec.previousLength), spec.appended, key);
    previous[key] = rows.slice(0, spec.previousLength);
  }
  previous.metadata = structuredClone(fixture.researchDelta.previousMetadata);
  assert.equal(hash(previous), fixture.previousResearchHash);
  const result = previous as unknown as Research;
  return result;
}
export function countsBeforeCheckpoint84() {
  const cars = carsBeforeCheckpoint84(),
    data = researchBeforeCheckpoint84();
  const counts = {
    variants: cars.length,
    families: new Set(cars.map((c) => c.modelFamily || c.family)).size,
    generations: data.models.length,
    criteria: data.criteria.length,
    evidence: data.feature_evidence.length,
    current: cars.filter((c) => c.availability === "current_or_order_listed")
      .length,
    outgoing: cars.filter((c) => c.availability === "outgoing").length,
    provisional: cars.filter((c) => c.availability === "announced_provisional")
      .length,
  };
  assert.deepEqual(counts, fixture.previousCounts);
  return counts;
}
export function dataBeforeCheckpoint84(file: string): Record<string, unknown> {
  const current = JSON.parse(JSON.stringify(dataBeforeCheckpoint91(file)));
  const delta = fixture.dataDelta[file];
  if (!delta) return current;
  assert.equal(hash(current), delta.approvedHash, file);
  for (const [key, len] of Object.entries(delta.previousLengths) as [
    string,
    number,
  ][]) {
    assert.deepEqual(current[key].slice(len), delta.appended[key], key);
    current[key] = current[key].slice(0, len);
  }
  assert.equal(hash(current), delta.previousHash, file);
  return current;
}
