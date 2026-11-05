import test from "node:test";
import assert from "node:assert/strict";
import { sourceCatalogue as catalogue, research, sourceEffectiveFeatures as effectiveFeatures } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import { buildBuyerSummaries, currentBuyerSummary, type SellingPointProposal } from "../src/lib/selling-points";
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
const data = research();
const cars = catalogue();
const features = cars.flatMap((car) => effectiveFeatures(car, data));
const id = "byd_seal__premium_rwd__20261010";
function fixture() {
  const actual = structuredClone(cars);
  const car = actual.find((car) => car.id === id)!;
  const conditions = ["Dated catalogue observation only", "Exact production applicability remains unverified"];
  car.configurationEvidence = { rankingEligible: false, completeVehicleCountEligible: false, projectionScope: "Test scope", requiredBuyerVisibleConditions: [...conditions] };
  const original = buyerProposal.records.find((record) => record.variantId === id)!;
  const record = { ...structuredClone(original), expectedIdentity: undefined, requiredVisibleConditions: [...conditions] };
  const proposal: SellingPointProposal = { ...buyerProposal, records: [record] };
  return { actual, car, record, proposal, conditions };
}
test("configuration-bound reader conditions cannot be removed, truncated or rewritten", () => {
  const f = fixture();
  const run = () => buildBuyerSummaries(f.actual, features, data.sources, f.proposal, policy);
  assert.ok(run().has(id));
  for (const changed of [undefined, [], f.conditions.slice(1), ["Unqualified replacement"]]) {
    f.record.requiredVisibleConditions = changed as string[];
    assert.equal(run().has(id), false);
  }
  f.record.requiredVisibleConditions = [...f.conditions];
  assert.ok(run().has(id));
  for (const malformed of [null, [], [""], [null]]) {
    f.car.configurationEvidence!.requiredBuyerVisibleConditions = malformed as unknown as string[];
    assert.equal(run().has(id), false);
  }
});
test("cached buyer summaries retain a separate exact visible-condition snapshot", () => {
  const f = fixture();
  const summary = buildBuyerSummaries(f.actual, features, data.sources, f.proposal, policy).get(id)!;
  assert.deepEqual(summary.expectedVisibleConditions, f.conditions);
  assert.notEqual(summary.conditions, summary.expectedVisibleConditions);
  assert.ok(currentBuyerSummary(summary, data.sources, policy));
  for (const changed of [undefined, [], f.conditions.slice(1), ["Unqualified replacement"]]) {
    const clone = structuredClone(summary);
    clone.conditions = changed as string[];
    assert.equal(currentBuyerSummary(clone, data.sources, policy), undefined);
  }
  f.record.requiredVisibleConditions.push("Later proposal mutation");
  assert.deepEqual(summary.conditions, f.conditions);
  assert.ok(currentBuyerSummary(summary, data.sources, policy));
});
