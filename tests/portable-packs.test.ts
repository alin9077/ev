import { encodePortableJson, parsePortableData } from "../src/lib/portable-string-codec";
import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
test("portable evidence deduplication preserves every exact-trim pack and source", () => {
  const snapshot = { data: research(), cars: catalogue() };
  const original = Object.fromEntries(
    snapshot.cars.map((car) => [car.id, pack(car.id, snapshot)]),
  );
  const before = JSON.stringify(original);
  const stored = storePortablePacks(original);
  assert.deepEqual(
    hydratePortablePacks(
      JSON.parse(JSON.stringify(stored)),
      JSON.parse(JSON.stringify(research().sources)),
    ),
    JSON.parse(before),
  );
  assert.equal(JSON.stringify(original), before);
  // Savings depend on the proportion of facts versus repeated source metadata.
  // Assert the actual deduplication contract, rather than a catalogue-size ratio.
  assert.ok(JSON.stringify(stored).length < before.length);
  for (const [id, saved] of Object.entries(stored)) {
    assert.equal("sources" in saved, false);
    assert.deepEqual(
      saved.sourceIds,
      original[id].sources.map((s) => s.id),
    );
    for (let i = 0; i < saved.features.length; i++) {
      if (original[id].features[i].variant_id === original[id].car.id)
        assert.equal(saved.features[i].variant_id, undefined);
      if (original[id].features[i].model_id === original[id].car.modelId)
        assert.equal(saved.features[i].model_id, undefined);
    }
  }
});
test("portable source gaps fail visibly instead of discarding provenance", () => {
  const car = catalogue()[0];
  assert.throws(
    () =>
      hydratePortablePacks(storePortablePacks({ [car.id]: pack(car.id) }), []),
    /Missing portable source/,
  );
});

test("build-scoped packs match ordinary exact-version packs", () => {
  const snapshot = { data: research(), cars: catalogue() };
  for (const car of [
    snapshot.cars[0],
    snapshot.cars[Math.floor(snapshot.cars.length / 2)],
    snapshot.cars.at(-1)!,
  ]) {
    assert.deepEqual(pack(car.id, snapshot), pack(car.id));
  }
});

test("portable string codec preserves every stored and hydrated exact-version pack and canonical source", () => {
  const snapshot = { data: research(), cars: catalogue() };
  const original = Object.fromEntries(snapshot.cars.map((car) => [car.id, pack(car.id, snapshot)]));
  const input = { packs: storePortablePacks(original), sources: snapshot.data.sources };
  const before = JSON.stringify(input);
  const restored = parsePortableData(encodePortableJson(before).json) as typeof input;
  assert.equal(JSON.stringify(restored), before);
  const hydrated = hydratePortablePacks(restored.packs, restored.sources);
  assert.deepEqual(hydrated, JSON.parse(JSON.stringify(original)));
  assert.equal(JSON.stringify(input), before);
  const byId = new Map(restored.sources.map((source) => [source.id, source]));
  for (const full of Object.values(hydrated))
    for (const source of full.sources) assert.equal(source, byId.get(source.id));
});

test("source-gap rejection remains intact after portable string encoding and decoding", () => {
  const car = catalogue()[0];
  const input = { packs: storePortablePacks({ [car.id]: pack(car.id) }), sources: research().sources };
  const restored = parsePortableData(encodePortableJson(JSON.stringify(input)).json) as typeof input;
  assert.throws(() => hydratePortablePacks(restored.packs, []), /Missing portable source/);
});
