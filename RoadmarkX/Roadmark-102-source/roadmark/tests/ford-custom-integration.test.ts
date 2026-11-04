import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research, pack } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { makeReport, reportSchema, reportMarkdown } from "../src/lib/citable";
import { buyerProposal } from "../src/lib/buyer-proposal";
import fixture from "../qa/ford-custom-integration-fixture.json";
const all = catalogue(), data = research();
const cars = fixture.map((row) => all.find((car) => car.id === row.id)!);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
test("two Ford phase-labelled configurations preserve exact facts, provenance and 140 unknowns", () => {
  assert.equal(cars.length, 2);
  assert.equal(fixture.reduce((sum, row) => sum + row.nullKeys.length, 0), 140);
  for (const [i, car] of cars.entries()) {
    assert.equal(car.year, "MY26.50");
    assert.equal(car.modelFamily, "ford-e-transit-custom");
    assert.equal(hash(car.facts), fixture[i].factsSHA256);
    assert.equal(hash(car.configurationEvidence), fixture[i].configurationSHA256);
    for (const key of fixture[i].nullKeys) assert.equal(car.facts[key].value, null, key);
    assert.equal(car.configurationEvidence?.rankingEligible, false);
    assert.equal(car.configurationEvidence?.completeVehicleCountEligible, false);
    assert.deepEqual(car.buyerSummary?.conditions, fixture[i].conditions);
    assert.deepEqual(car.buyerSummary?.expectedVisibleConditions, fixture[i].conditions);
    assert.equal(car.buyerSummary?.strength?.text, fixture[i].strength.text);
    assert.equal(car.buyerSummary?.tradeoff?.text, fixture[i].tradeoff.text);
  }
});
test("Ford context sources remain in full exports without becoming copy support or calendar dates", () => {
  const held = "r10_fordcustom_bound_carexpert_custom_future_update";
  for (const car of cars) {
    const selected = pack(car.id, { cars: all, data });
    for (const id of car.configurationEvidence!.sourceIds!) assert.ok(selected.sources.some((source) => source.id === id));
    assert.ok(selected.sources.find((source) => source.id === held)?.publication_hold);
    assert.ok(!car.buyerSummary!.guardSourceIds.includes(held));
    assert.ok(!car.buyerSummary!.expectedSourceSnapshots!.some((source) => source.id === held));
    const report = makeReport([selected], "/fixture");
    const schema = reportSchema(report)["@graph"].find((entry) => entry["@type"] === "Vehicle")!;
    assert.ok(schema && !("vehicleModelDate" in schema));
    assert.match(reportMarkdown(report), /MY26.50/);
  }
  assert.equal(buyerProposal.dependencies.filter((dep) => cars.some((car) => car.id === dep.variantId)).length, 14);
});
test("Ford exact-phase advertisements and ranking exclusions do not imply verified stock or performance", () => {
  assert.equal(cars[0].availabilityEvidence?.stockStatus, "new_stock_listed");
  assert.equal(cars[1].availabilityEvidence?.stockStatus, "unverified");
  for (const car of cars) {
    assert.equal(car.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(car.availabilityEvidence?.factoryOrderAcceptanceVerified, false);
  }
  const altered = structuredClone(cars);
  for (const car of altered) for (const attribute of attributes) car.facts[attribute.key] = { ...car.facts[attribute.key], value: 999, status: "standard", comparisonBasis: "WLTP", date: "2026-10-10", sourceIds: car.availabilityEvidence!.sourceIds };
  for (const attribute of attributes) assert.equal(rankAttribute(altered, data.sources, attribute.key, { asOf: "2026-10-10", maxAgeDays: 30 }).groups.length, 0);
});
