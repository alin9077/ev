import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research, pack } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { makeReport, reportSchema, reportMarkdown } from "../src/lib/citable";
import { buyerProposal } from "../src/lib/buyer-proposal";
import fixture from "../qa/junior-integration-fixture.json";
const all = catalogue(), data = research();
const cars = fixture.map((row) => all.find((car) => car.id === row.id)!);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
test("Junior Series1 catalogue preserves scoped facts, provenance and27 canonical nulls", () => {
  assert.equal(cars.length, 1);
  assert.equal(fixture.reduce((sum, row) => sum + row.nullKeys.length, 0), 27);
  for (const [i, car] of cars.entries()) {
    assert.equal(car.year, null);
    assert.equal(car.modelFamily, "alfa-romeo-junior");
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
test("Junior context sources remain in full exports without becoming copy support or calendar dates", () => {
  const held = "r10_alfa_junior_brochure_index";
  for (const car of cars) {
    const selected = pack(car.id, { cars: all, data });
    for (const id of car.configurationEvidence!.sourceIds!) assert.ok(selected.sources.some((source) => source.id === id));
    assert.ok(selected.sources.some((source) => source.id === held));
    assert.ok(!car.buyerSummary!.guardSourceIds.includes(held));
    assert.ok(!car.buyerSummary!.expectedSourceSnapshots!.some((source) => source.id === held));
    const report = makeReport([selected], "/fixture");
    const schema = reportSchema(report)["@graph"].find((entry) => entry["@type"] === "Car")!;
    assert.ok(schema && !("vehicleModelDate" in schema));
    assert.match(reportMarkdown(report), /Series 1/);
  }
  assert.equal(buyerProposal.dependencies.filter((dep) => cars.some((car) => car.id === dep.variantId)).length, 5);
});
test("Junior catalogue and separate advertisements and ranking exclusions do not imply verified stock or performance", () => {
  assert.equal(cars[0].availabilityEvidence?.stockStatus, "unverified");
  for (const car of cars) {
    assert.equal(car.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(car.availabilityEvidence?.factoryOrderAcceptanceVerified, false);
  }
  const altered = structuredClone(cars);
  for (const car of altered) for (const attribute of attributes) car.facts[attribute.key] = { ...car.facts[attribute.key], value: 999, status: "standard", comparisonBasis: "WLTP", date: "2026-10-10", sourceIds: car.availabilityEvidence!.sourceIds };
  for (const attribute of attributes) assert.equal(rankAttribute(altered, data.sources, attribute.key, { asOf: "2026-10-10", maxAgeDays: 30 }).groups.length, 0);
});

test("Junior source methods, net/gross battery and separate stock quote remain distinct", () => {
 const car = cars[0];
 assert.equal(car.facts.battery_kwh.value, 51);
 assert.equal(car.facts.battery_gross_kwh.value, 54);
 assert.equal(car.facts.price_aud.value, null);
 assert.equal(car.facts.dc_charge_time_min.value, 27);
 assert.match(car.facts.dc_charge_time_min.comparisonBasis || "", /20–80%/);
 assert.equal(car.facts.dc_charge_10_80_min.value, null);
 assert.equal(car.facts.towing_braked_kg.value, null);
 assert.equal(car.facts.towing_braked_kg.status, "unavailable");
 assert.match(car.facts.boot_l.comparisonBasis || "", /method not supplied/);
});
