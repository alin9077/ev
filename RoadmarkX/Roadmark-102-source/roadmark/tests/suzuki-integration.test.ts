import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research, pack } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { makeReport, reportSchema, reportMarkdown } from "../src/lib/citable";
import { buyerProposal } from "../src/lib/buyer-proposal";
import fixture from "../qa/suzuki-integration-fixture.json";
const all = catalogue(), data = research();
const cars = fixture.map((row) => all.find((car) => car.id === row.id)!);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
test("Suzuki named-grade catalogue preserves scoped facts, provenance and47 canonical nulls", () => {
  assert.equal(cars.length, 2);
  assert.equal(fixture.reduce((sum, row) => sum + row.nullKeys.length, 0), 47);
  for (const [i, car] of cars.entries()) {
    assert.equal(car.year, null);
    assert.equal(car.modelFamily, "suzuki-e-vitara");
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
test("Suzuki context sources remain in full exports without becoming copy support or calendar dates", () => {
  const held = "r10_suzuki_e_vitara_brochure_request";
  for (const car of cars) {
    const selected = pack(car.id, { cars: all, data });
    for (const id of car.configurationEvidence!.sourceIds!) assert.ok(selected.sources.some((source) => source.id === id));
    assert.ok(selected.sources.some((source) => source.id === held));
    assert.ok(!car.buyerSummary!.guardSourceIds.includes(held));
    assert.ok(!car.buyerSummary!.expectedSourceSnapshots!.some((source) => source.id === held));
    const report = makeReport([selected], "/fixture");
    const schema = reportSchema(report)["@graph"].find((entry) => entry["@type"] === "Car")!;
    assert.ok(schema && !("vehicleModelDate" in schema));
    assert.match(reportMarkdown(report), /Queensland/);
  }
  assert.equal(buyerProposal.dependencies.filter((dep) => cars.some((car) => car.id === dep.variantId )).length, 15);
});
test("Suzuki catalogue and separate advertisements and ranking exclusions do not imply verified stock or performance", () => {
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

test("Suzuki expired offers, battery labels and incompatible charging observations remain held", () => {
 const motion = cars.find((car) => car.id.includes("motion"))!;
 const ultra = cars.find((car) => car.id.includes("ultra"))!;
 for (const car of cars) {
  assert.equal(car.facts.battery_kwh.value, null);
  assert.equal(car.facts.battery_gross_kwh.value, null);
  assert.equal(car.facts.price_aud.value, null);
  assert.equal(car.facts.dc_peak_kw.value, null);
  assert.equal(car.facts.source_catalogue_ac_onboard_kw.value, 7);
  assert.equal(car.facts.range_subcycle.value, null);
  assert.match(car.facts.range_km.comparisonBasis || "", /subcycle unspecified/);
  assert.equal(car.facts.boot_l.value, 244);
  assert.match(car.facts.boot_l.comparisonBasis || "", /rear seats right back; VDA/);
  assert.equal(car.facts.max_total_cargo_l.value, null);
  assert.equal(car.facts.towing_braked_kg.value, 750);
  assert.ok(car.buyerSummary!.conditions.some((x) => x.includes("30 September 2026")));
  assert.ok(car.buyerSummary!.conditions.some((x) => x.includes("Queensland and Northern NSW")));
 }
 assert.equal(motion.facts.source_catalogue_battery_advertised_total_kwh.value, 49);
 assert.equal(ultra.facts.source_catalogue_battery_advertised_total_kwh.value, 61);
 assert.equal(motion.facts.dc_charge_time_min.value, 45);
 assert.match(motion.facts.dc_charge_time_min.comparisonBasis || "", /10–80%.*development target/);
 assert.equal(ultra.facts.dc_charge_time_min.value, null);
 assert.ok(ultra.buyerSummary!.conditions.some((x) => x.includes("05:30")));
});
