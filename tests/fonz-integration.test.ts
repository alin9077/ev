import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research, pack } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { makeReport, reportMarkdown, factClaim } from "../src/lib/citable";
import { buyerProposal } from "../src/lib/buyer-proposal";
import fixture from "../qa/fonz-integration-fixture.json";
const all = catalogue(), data = research();
const cars = fixture.map((row) => all.find((car) => car.id === row.id)!);
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
test("FONZ keeps one attributed MY26 reservation identity and38 canonical unknowns", () => {
 assert.equal(cars.length, 1);
 const car = cars[0], row = fixture[0];
 assert.equal(car.year, 2026);
 assert.equal(car.modelFamily, "fonz-arthur-7");
 assert.equal(hash(car.facts), row.factsSHA256);
 assert.equal(hash(car.configurationEvidence), row.configurationSHA256);
 assert.equal(row.nullKeys.length, 38);
 for (const key of row.nullKeys) assert.equal(car.facts[key].value, null, key);
 assert.equal(car.configurationEvidence!.rankingEligible, false);
 assert.equal(car.configurationEvidence!.completeVehicleCountEligible, false);
 assert.deepEqual(car.buyerSummary!.conditions, row.conditions);
 assert.deepEqual(car.buyerSummary!.expectedVisibleConditions, row.conditions);
 assert.equal(car.buyerSummary!.strength!.text, row.strength.text);
 assert.equal(car.buyerSummary!.tradeoff!.text, row.tradeoff.text);
 assert.ok(row.conditions.some((condition) => condition.includes("MY26 is supplier-stated offer identity")));
});
test("FONZ full evidence exports include context without promoting it to summary support", () => {
 const car = cars[0], selected = pack(car.id, { cars: all, data });
 assert.equal(car.configurationEvidence!.sourceIds!.length, 13);
 const markdown = reportMarkdown(makeReport([selected], "/fixture"));
 assert.ok(markdown.length > 0);
 for (const fact of Object.values(car.facts)) assert.ok(factClaim(selected, fact).qualifications.every((text) => typeof text === "string"));
 assert.match(factClaim(selected, car.facts.source_sale_technical_battery_rated_raw).sentence, /4\.32Wh/);
 const issues = Object.values(car.facts).flatMap((fact) => fact.issues);
 assert.equal(issues.length, 63);
 for (const issue of issues) { assert.ok(issue.issue_id && issue.title && issue.publication_action); assert.ok(issue.model_ids.includes(car.modelId)); assert.ok(issue.source_ids.length); }
 for (const id of car.configurationEvidence!.sourceIds!) assert.ok(selected.sources.some((source) => source.id === id));
 const context = "r10_fonz_arthur7_warranty_claim";
 assert.ok(selected.sources.some((source) => source.id === context));
 assert.ok(!car.buyerSummary!.guardSourceIds.includes(context));
 assert.equal(buyerProposal.dependencies.filter((dep) => dep.variantId === car.id).length, 10);
});
test("FONZ reservation evidence never implies physical stock or ranking eligibility", () => {
 const car = cars[0];
 assert.equal(car.availabilityEvidence!.stockStatus, "unverified");
 assert.equal(car.availabilityEvidence!.orderStatus, "listed_unconfirmed");
 assert.equal(car.availabilityEvidence!.physicalStockVerified, false);
 assert.equal(car.availabilityEvidence!.factoryOrderAcceptanceVerified, false);
 assert.ok(car.buyerSummary!.conditions.some((condition) => condition.includes("10% reservation")));
 const altered = structuredClone(cars);
 for (const c of altered) for (const attribute of attributes) c.facts[attribute.key] = { ...c.facts[attribute.key], value: 999, status: "standard", comparisonBasis: "WLTP", date: "2026-10-10", sourceIds: c.availabilityEvidence!.sourceIds };
 for (const attribute of attributes) assert.equal(rankAttribute(altered, data.sources, attribute.key, { asOf: "2026-10-10", maxAgeDays: 30 }).groups.length, 0);
});
test("FONZ range, battery-unit and charger holds survive the supported delivery-cost tradeoff", () => {
 const car = cars[0];
 assert.equal(car.facts.source_sale_technical_battery_rated_raw.value, "Rated energy capacity of 4.32Wh.");
 assert.ok(car.facts.source_sale_technical_battery_rated_raw.issues.some((issue) => issue.issue_id === "battery-rated-unit"));
 assert.ok(car.facts.source_sale_technical_motor_output_kw.issues.some((issue) => issue.issue_id === "motor-basis"));
 for (const key of ["source_sale_technical_range_modes_km", "source_sale_technical_range_conditions", "source_sale_technical_range_cycle"]) assert.ok(car.facts[key].issues.some((issue) => issue.issue_id === "range-charge-conditions"));
 assert.equal(car.facts.battery_kwh.value, null);
 assert.equal(car.facts.price_aud.value, null);
 assert.equal(car.facts.range_km.value, null);
 assert.equal(car.facts.power_kw.value, null);
 assert.equal(car.facts.dc_charge_time_min.value, null);
 assert.equal(car.facts.source_sale_price_amount_aud.value, 8690);
 assert.match(car.buyerSummary!.tradeoff!.text, /excludes local dealer delivery and freight/);
 assert.match(car.buyerSummary!.tradeoff!.text, /Sydney HQ/);
 assert.equal(buyerProposal.dependencies.find((dep) => dep.id === "fonz_range_cycle")!.expectedValue, null);
});

test("FONZ reservation classification agrees across the existing market and motorcycle census", async () => {
 const inventory = (await import("../data/market-inventory-2026-10-10.json")).default;
 const census = (await import("../data/motorcycle-ev-census.json")).default;
 for (const snapshot of [inventory, census]) {
  const rows = snapshot.records.filter((row) => row.id === "fonz-arthur-7");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].orderStatus, "listed_unconfirmed");
  assert.equal(rows[0].stockStatus, "unverified");
  assert.equal(rows[0].modelYear, null);
  assert.equal(rows[0].trims.length, 4);
  const orders: Record<string, number> = {};
  for (const row of snapshot.records) orders[row.orderStatus] = (orders[row.orderStatus] || 0) + 1;
  assert.deepEqual(snapshot.counts.byOrderStatus, orders);
 }
});
