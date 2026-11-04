import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { catalogue, pack, research } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import fixture from "../qa/fonz-z-integration-fixture.json";
const cars = catalogue(),
  data = research();
const selected = fixture.map((row) => cars.find((car) => car.id === row.id)!);
const hash = (value: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
test("FONZ Z keeps two exact paint and saddle offers without inventing model years", () => {
  assert.equal(selected.length, 2);
  assert.deepEqual(
    selected.map((c) => c.trim),
    [
      "SR · Forza Aranciata / Black vegan",
      "LR · Forza Aranciata / Black vegan",
    ],
  );
  for (const c of selected) {
    assert.equal(c.year, null);
    assert.equal(c.researchStage, "partial");
    assert.ok(c.buyerSummary);
    assert.match(
      c.buyerSummary!.strength!.text,
      /offer lists dual-channel ABS, reverse and tyre-pressure monitoring/,
    );
    assert.match(
      c.buyerSummary!.tradeoff!.text,
      /compatible charging cable\/mobile connector is not included/,
    );
  }
});
test("FONZ complete facts, qualifications and all context sources match checked binding", () => {
  for (const row of fixture) {
    const c = cars.find((x) => x.id === row.id)!;
    assert.equal(hash(c.facts), row.factsSHA256);
    assert.equal(hash(c.configurationEvidence), row.configurationSHA256);
    assert.deepEqual(c.buyerSummary?.strength, row.strength);
    assert.deepEqual(c.buyerSummary?.tradeoff, row.tradeoff);
    assert.deepEqual(c.buyerSummary?.conditions, row.conditions);
    const p = pack(c.id, { cars, data });
    assert.equal(row.sourceIds.length, 19);
    for (const id of row.sourceIds)
      assert.deepEqual(
        p.sources.find((x) => x.id === id),
        data.sources.find((x) => x.id === id),
      );
  }
});
test("106 FONZ canonical unknowns remain unranked and do not certify available builds", () => {
  assert.equal(
    fixture.reduce((n, r) => n + r.nullKeys.length, 0),
    106,
  );
  for (const row of fixture) {
    const c = cars.find((x) => x.id === row.id)!;
    for (const key of row.nullKeys) assert.equal(c.facts[key].value, null, key);
    assert.equal(c.configurationEvidence?.rankingEligible, false);
    assert.equal(c.configurationEvidence?.completeVehicleCountEligible, false);
    assert.equal(c.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(c.availabilityEvidence?.factoryOrderAcceptanceVerified, false);
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
  }
  for (const a of attributes)
    assert.deepEqual(
      rankAttribute(selected, data.sources, a.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups,
      [],
    );
});
test("FONZ separates onboard charger inclusion, cable exclusion and unknown external charger", () => {
  for (const c of selected) {
    assert.equal(c.facts.onboard_charger_claim_kw.value, 1.85);
    assert.equal(c.facts.onboard_charger_included.value, true);
    assert.equal(c.facts.charging_cable_included.value, false);
    assert.equal(c.facts.external_charger_included.value, null);
    assert.ok(c.facts.external_charger_included.issues.length);
    assert.equal(c.facts.external_charger_warranty_months.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.range_km.value, null);
    assert.equal(c.facts.power_kw.value, null);
    assert.ok(c.facts.source_fonz_z_motor_power.issues.length);
    assert.match(
      c.buyerSummary!.conditions.join(" "),
      /External-charger inclusion and SKU are not established/,
    );
  }
});
test("FONZ market reconciliation retains S.E. context and advertised orders without a third detail record", () => {
  const m = JSON.parse(
    fs.readFileSync("data/market-inventory-2026-10-10.json", "utf8"),
  );
  const rows = m.records.filter(
    (x: { id: string }) => x.id === "fonz-z-series",
  );
  assert.equal(rows.length, 1);
  const r = rows[0];
  assert.deepEqual(r.trims, ["SR", "LR", "S.E. Electric Blue"]);
  assert.equal(r.orderStatus, "accepting_orders");
  assert.equal(r.stockStatus, "unverified");
  assert.equal(r.factoryOrderAcceptanceVerified, false);
  assert.equal(r.physicalStockVerified, false);
  assert.equal(r.detailedCoverageIds.length, 2);
  assert.equal(cars.filter((c) => c.modelId === "fonz_z_series").length, 2);
  assert.equal(r.evidenceHistory.length, 2);
  assert.equal(r.heldConfigurationContexts[0].detailedCandidateProposed, false);
});
