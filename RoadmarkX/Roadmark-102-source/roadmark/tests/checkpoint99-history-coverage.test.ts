import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { catalogue, research } from "../src/lib/data";
import { attributes, discoveryCars, rankAttribute } from "../src/lib/discovery";
import { hasCarAvatarShape } from "../src/lib/car-avatar-shapes";
import { carsBeforeCheckpoint99, researchBeforeCheckpoint99, fixture99 } from "./helpers/checkpoint99-history";
import type { Car } from "../src/lib/types";
const cars = catalogue(), data = research();
const ids = new Set<string>(fixture99.expectedCars.map((car: Car) => car.id));
const historical84 = JSON.parse(readFileSync(new URL("../qa/checkpoint84-runtime-fixture.json", import.meta.url), "utf8"));
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("99 generic avatars add exactly the two reviewed grades while preserving the309 predecessor count", () => {
  const before = carsBeforeCheckpoint99(cars);
  const genericBefore = before.filter(car => !hasCarAvatarShape(car.modelId));
  const genericCurrent = cars.filter(car => !hasCarAvatarShape(car.modelId));
  assert.equal(genericBefore.length, 309);
  assert.equal(before.filter(car => hasCarAvatarShape(car.modelId)).length, 34);
  assert.equal(genericCurrent.length, genericBefore.length + 2);
  assert.deepEqual(genericCurrent.filter(car => ids.has(car.id)).map(car => car.id), [...ids]);
  assert.deepEqual(genericCurrent.filter(car => !ids.has(car.id)), genericBefore);
  const projected = discoveryCars(cars);
  assert.equal(projected.length, cars.length);
  for (const id of ids) {
    const car = projected.find(car => car.id === id)!;
    assert.equal(Object.hasOwn(car.facts, "height_mm"), false);
    assert.equal(Object.hasOwn(car.facts, "wheelbase_mm"), false);
    for (const attribute of attributes)
      assert.equal(car.facts[attribute.key], cars.find(car => car.id === id)!.facts[attribute.key]);
  }
});

test("99 ranking predecessors preserve all seven original City84 digests without hiding live Mazda exclusions", () => {
  const beforeCars = carsBeforeCheckpoint99(cars);
  const beforeData = researchBeforeCheckpoint99(data);
  const policy = { asOf: "2026-10-11", maxAgeDays: 30 };
  for (const attribute of attributes) {
    const prior = rankAttribute(beforeCars, beforeData.sources, attribute.key, policy);
    assert.equal(
      hash({ ...prior, excluded: prior.excluded.filter(row => row.carId !== historical84.id) }),
      historical84.previousRankingHashes[attribute.key],
      attribute.key,
    );
    assert.equal(prior.excluded.filter(row => row.carId === historical84.id).length, 1);
    const current = rankAttribute(cars, data.sources, attribute.key, policy);
    assert.deepEqual(current.excluded.filter(row => ids.has(row.carId)).map(row => row.carId), [...ids]);
    assert.deepEqual({ ...current, excluded: current.excluded.filter(row => !ids.has(row.carId)) }, prior);
  }
});
