import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack } from "../src/lib/data";
import { configurationSourceIds } from "../src/lib/configuration-evidence";
import { carEvidenceIds, pageEvidenceSources } from "../src/lib/page-evidence";
import { discoveryCars } from "../src/lib/discovery";
import type { ConfigurationEvidence, Source } from "../src/lib/types";
const cars = catalogue();
const data = research();
const context = { id: "held-context-fixture", title: "Historical conflict context only", url: "https://example.com/au/context", publisher: "Example", source_type: "audit", accessed_date: "2026-10-10", published_date: null, market: "AU", supports: "Audit only", publication_hold: true } as Source;
const car = { ...cars[0], configurationEvidence: { rankingEligible: false, completeVehicleCountEligible: false, projectionScope: "Bounded fixture", sourceIds: [context.id] } };

test("full packs retain explicit context sources unchanged, including publication holds", () => {
  const input = { ...data, sources: [...data.sources, context] };
  const before = JSON.stringify(car);
  const selected = pack(car.id, { cars: [car], data: input });
  assert.equal(selected.sources.find((s) => s.id === context.id), context);
  assert.equal(selected.sources.at(-1)?.publication_hold, true);
  assert.equal(JSON.stringify(car), before);
  assert.ok(carEvidenceIds([car]).has(context.id));
  assert.equal(pageEvidenceSources(input.sources, { cars: [car] }).at(-1), context);
  assert.equal(car.buyerSummary, cars[0].buyerSummary);
  assert.equal(car.availabilityEvidence, cars[0].availabilityEvidence);
});

test("discovery drops raw context citations and retains the same three display and gate fields", () => {
  const projected = discoveryCars([car])[0];
  assert.deepEqual(Object.keys(projected.configurationEvidence!).sort(), ["completeVehicleCountEligible", "projectionScope", "rankingEligible"]);
  assert.deepEqual(configurationSourceIds(projected), []);
  assert.ok(!carEvidenceIds([projected]).has(context.id));
  assert.equal(projected.buyerSummary, car.buyerSummary);
});

test("malformed, duplicate or missing configuration source IDs fail closed", () => {
  for (const invalid of [null, "bad", [""], [5], [context.id, context.id]]) {
    const changed = { ...car, configurationEvidence: { ...car.configurationEvidence, sourceIds: invalid } as unknown as ConfigurationEvidence };
    assert.throws(() => configurationSourceIds(changed), /Invalid configuration source IDs/);
  }
  assert.throws(() => pack(car.id, { cars: [car], data }), /Configuration evidence references missing source/);
  assert.throws(() => pageEvidenceSources(data.sources, { cars: [car] }), /missing sources/);
  assert.deepEqual(configurationSourceIds(cars[0]), []);
});
