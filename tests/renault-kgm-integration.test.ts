// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
} from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import stage from "./fixtures/catalogue/renault-kgm-staged-delta.json";
const all = catalogue(),
  sources = research().sources;
const cars = stage.variants.map((v) => {
  const c = all.find((c) => c.id === v.id);
  assert.ok(c);
  return c;
});
const megane = cars.find((c) => c.id.startsWith("renault_megane"))!;
const scenic = cars.filter((c) => c.id.startsWith("renault_scenic"));
const torres = cars.find((c) => c.id.startsWith("kgm_torres"))!;
test("five Renault/KGM technical records remain separate from residual Megane advertising", () => {
  assert.equal(cars.length, 5);
  assert.equal(new Set(cars.map((c) => c.modelFamily)).size, 3);
  assert.equal(megane.year, null);
  assert.equal(megane.drive, "Unknown");
  assert.equal(megane.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    4,
  );
  for (const c of scenic) {
    assert.equal(c.year, 2026);
    assert.equal(
      c.availabilityEvidence?.orderStatus,
      "accepting_orders_advertised",
    );
  }
  assert.equal(torres.year, 2026);
});
test("all 448 Renault/KGM projections retain source values, nulls and qualifications", () => {
  assert.equal(stage.facts.length, 448);
  assert.equal(stage.facts.filter((f) => f.value === null).length, 111);
  for (const row of stage.facts) {
    const f = cars.find((c) => c.id === row.variantId)!.facts[row.key];
    const { variantId, ...expected } = row;
    void variantId;
    assert.deepEqual(f, expected);
  }
  assert.equal(stage.features.length, 0);
});
test("conditional source declarations create no rankings or generic price advantage", () => {
  for (const c of cars) assert.equal(c.facts.price_aud.value, null);
  for (const a of attributes)
    assert.equal(
      rankAttribute(cars, sources, a.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups.length,
      0,
    );
});
test("Megane charging conflict and unknown technical model year stay explicit", () => {
  assert.equal(megane.facts.ac_kw.value, 7.4);
  assert.equal(megane.facts.model_year.value, null);
  assert.equal(megane.facts.dc_charge_time_min.value, null);
  assert.match(megane.facts.dc_charge_time_min.basis, /30 and 35/);
});
test("Scenic 15–80 windows, station power and erroneous consumption units remain separate", () => {
  assert.deepEqual(
    scenic.map((c) => c.facts.dc_charge_time_min.value),
    [32, 37, 37],
  );
  assert.deepEqual(
    scenic.map((c) => c.facts.dc_peak_kw.value),
    [130, 150, 150],
  );
  for (const c of scenic) {
    assert.match(c.facts.dc_charge_time_min.comparisonBasis, /15–80%/);
    assert.equal(c.facts.consumption_wh_km.value, null);
    assert.equal(c.facts.consumption_kwh_100km.value, null);
  }
});
test("Torres station capability is not promoted to vehicle DC acceptance", () => {
  assert.equal(torres.facts.ac_kw.value, 10.5);
  assert.equal(torres.facts.dc_peak_kw.value, null);
  assert.equal(torres.facts.dc_charge_time_min.value, 37);
  assert.match(
    torres.facts.dc_charge_time_min.comparisonBasis,
    /300 kW station/,
  );
  assert.equal(torres.facts.boot_l.value, 465);
  assert.match(torres.facts.boot_l.comparisonBasis, /VDA/);
  assert.match(
    String(torres.facts.battery_warranty.value),
    /10 years.*unlimited.*70%/,
  );
});
test("five guarded buyer summaries preserve charging and model-year caveats", () => {
  for (const c of cars) {
    assert.ok(c.buyerSummary?.strength);
    assert.ok(c.buyerSummary?.tradeoff);
    assert.ok(c.buyerSummary.conditions.length >= 2);
  }
  assert.match(megane.buyerSummary!.tradeoff!.text, /30 and 35/);
  for (const c of scenic)
    assert.match(c.buyerSummary!.tradeoff!.text, /15–80%/);
  assert.match(
    torres.buyerSummary!.tradeoff!.text,
    /own peak DC charging power is unconfirmed/,
  );
});
