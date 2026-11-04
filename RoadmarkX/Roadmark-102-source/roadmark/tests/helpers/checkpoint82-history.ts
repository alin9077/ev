import {
  carsBeforeCheckpoint84,
  dataBeforeCheckpoint84,
} from "./checkpoint84-runtime";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Car } from "../../src/lib/types";
const fixture = JSON.parse(
  readFileSync(
    new URL("../../qa/checkpoint82-summary-fixture.json", import.meta.url),
    "utf8",
  ),
);
const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
/** Reconstruct historical assertions only after verifying the full approved delta. */
export function carsBeforeCheckpoint82(cars: Car[]): Car[] {
  return carsBeforeCheckpoint84(cars).map((car) => {
    if (car.id !== fixture.id) return car;
    assert.equal(hash(car), fixture.approvedCarSHA256);
    const previous = { ...car, buyerSummary: undefined };
    assert.equal(hash(previous), fixture.previousCarSHA256);
    return previous;
  });
}
/** Verify the entire approved JSON before removing its single bounded append. */
export function dataBeforeCheckpoint82(file: string): Record<string, unknown> {
  const current = JSON.parse(JSON.stringify(dataBeforeCheckpoint84(file)));
  const delta = fixture.dataDelta[file];
  if (!delta) return current;
  assert.equal(hash(current), delta.approvedSHA256, file);
  if (delta.arrays) {
    for (const [key, spec] of Object.entries(delta.arrays) as [
      string,
      { previousLength: number; appended: unknown[] },
    ][]) {
      assert.deepEqual(current[key].slice(spec.previousLength), spec.appended);
      current[key] = current[key].slice(0, spec.previousLength);
    }
  }
  for (const id of delta.addedSnapshotIds || []) delete current.snapshots[id];
  assert.equal(hash(current), delta.previousSHA256, file);
  return current;
}
