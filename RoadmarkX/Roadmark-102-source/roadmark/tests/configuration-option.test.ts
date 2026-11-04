import test from "node:test";
import assert from "node:assert/strict";
import { buildBuyerSummaries, type SellingPointProposal } from "../src/lib/selling-points";
import type { Car, Source } from "../src/lib/types";
const option = { sourceCopyLedgerId: "exact-option", name: "Camera package", selectedInCapturedBuild: false, priceMlpAud: 490, equipmentStatus: "optional_not_selected", genericFeatureAliases: [] };
const car = { id: "bounded", year: 2026, availability: "current_or_order_listed", facts: {}, configurationEvidence: { rankingEligible: false, completeVehicleCountEligible: false, projectionScope: "Exact build only", options: [option] } } as unknown as Car;
const source = { id: "maker", url: "https://example.com/au/build", accessed_date: "2026-10-10" } as Source;
const proposal: SellingPointProposal = {
  records: [{ variantId: car.id, checkedAt: "2026-10-10", modelYearDependency: "year", requiredVisibleConditions: ["Exact build only"], strength: {label: "Equipment", text: "Named option", dependencyIds: ["option"]}, tradeoff: {label: "Extra cost", text: "Not selected", dependencyIds: ["option"]} }],
  dependencies: [
    {id: "year", kind: "variant_property", variantId: car.id, key: "model_year", expectedValue: 2026, sourceIds: [source.id], checkedAt: "2026-10-10"},
    {id: "option", kind: "configuration_option", variantId: car.id, key: option.sourceCopyLedgerId, expectedValue: option, sourceIds: [source.id], checkedAt: "2026-10-10"},
  ],
};
const run = (c: Car, sources = [source], asOf = "2026-10-10") => buildBuyerSummaries([c], [], sources, proposal, { asOf, maxAgeDays: 30 });
test("exact configuration option requires a unique unchanged complete snapshot", () => {
  assert.equal(run(car).size, 1);
  for (const key of Object.keys(option)) {
    const changed = structuredClone(car);
    const items = changed.configurationEvidence!.options as Record<string, unknown>[];
    items[0][key] = "changed";
    assert.equal(run(changed).size, 0, key);
  }
  for (const options of [[], null, [option, option]]) {
    const changed = structuredClone(car);
    changed.configurationEvidence!.options = options;
    assert.equal(run(changed).size, 0);
  }
  const missing = structuredClone(car); delete missing.configurationEvidence;
  assert.equal(run(missing).size, 0);
});
test("configuration options cannot bypass source holds, dates or model-year guards", () => {
  assert.equal(run(car, []).size, 0);
  for (const key of ["publication_hold", "conflict", "access_limitation"]) assert.equal(run(car, [{...source, [key]: true}]).size, 0);
  assert.equal(run(car, [source], "2026-10-09").size, 0);
  assert.equal(run(car, [source], "2026-11-09").size, 1);
  assert.equal(run(car, [source], "2026-11-10").size, 0);
  assert.equal(run({...car, year: 2025}).size, 0);
});
