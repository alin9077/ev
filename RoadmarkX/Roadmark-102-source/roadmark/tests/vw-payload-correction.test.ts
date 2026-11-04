import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { catalogue, research, effectiveFeatures } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import {
  buildBuyerSummaries,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { compareFacts, formatFact } from "../src/lib/compare";
const id = "volkswagen_id_buzz_cargo_my25__swb__20261010";
const cars = catalogue();
const car = cars.find((row) => row.id === id)!;
const data = research();
const proposal = buyerProposal as SellingPointProposal;
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
test("catalogue additions contain one row per exact variant and fact key", () => {
  const additions = JSON.parse(
    fs.readFileSync("data/catalogue-additions-2026-10-10.json", "utf8"),
  ) as { facts: { variantId: string; key: string }[] };
  const seen = new Set<string>();
  for (const row of additions.facts) {
    const pair = JSON.stringify([row.variantId, row.key]);
    assert.ok(!seen.has(pair), `Duplicate fact pair: ${pair}`);
    seen.add(pair);
  }
});
test("Cargo payload restores kg without changing its conditional measurement scope", () => {
  const fact = car.facts.payload_kg;
  assert.equal(formatFact(fact, policy.asOf), "774 kg");
  assert.equal(fact.label, "Payload");
  assert.equal(fact.basis, "Manufacturer payload");
  assert.equal(fact.status, "conditional");
  assert.equal(fact.comparisonBasis, "");
  assert.deepEqual(fact.qualifications, [
    "Base vehicle maximum; configuration-specific final payload requires weighing",
  ]);
  assert.deepEqual(fact.sourceIds, ["r10_vag_vw_cargo_spec"]);
  const comparison = compareFacts(fact, { ...fact, value: 800 });
  assert.equal(comparison.state, "conditional");
  assert.equal(comparison.delta, undefined);
});
test("Cargo buyer copy remains bound to the complete corrected payload fact", () => {
  const dependency = proposal.dependencies.find(
    (row) => row.id === `fact:${id}:payload_kg`,
  )!;
  assert.deepEqual(dependency.expectedEffectiveFact, car.facts.payload_kg);
  assert.ok(car.buyerSummary?.strength && car.buyerSummary?.tradeoff);
  const features = effectiveFeatures(car, data);
  assert.ok(
    buildBuyerSummaries([car], features, data.sources, proposal, policy).has(
      id,
    ),
  );
  for (const patch of [
    { unit: "" },
    { value: 775 },
    { basis: "Different basis" },
    { qualifications: [] },
    { sourceIds: [] },
  ]) {
    const changed = structuredClone(car);
    Object.assign(changed.facts.payload_kg, patch);
    assert.ok(
      !buildBuyerSummaries(
        [changed],
        features,
        data.sources,
        proposal,
        policy,
      ).has(id),
      JSON.stringify(patch),
    );
  }
});
