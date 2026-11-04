import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import { catalogue, pack, research } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import fixture from "../qa/mache-mazda6e-integration-fixture.json";

const cars = catalogue();
const data = research();
const selected = fixture.map((row) => cars.find((car) => car.id === row.id)!);
const mache = selected.filter((car) => car.modelId === "ford_mustang_mach_e");
const mazda = selected.filter((car) => car.modelId === "mazda_6e");
const hash = (value: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

test("Mach-E and Mazda6e preserve five exact Australian catalogue grade identities", () => {
  assert.equal(mache.length, 3);
  assert.equal(mazda.length, 2);
  assert.deepEqual(
    mache.map((car) => car.trim),
    ["Select RWD", "Premium Extended Range RWD", "GT AWD"],
  );
  assert.deepEqual(
    mazda.map((car) => car.trim),
    ["E35 GT", "E35 Atenza"],
  );
  assert.ok(
    mache.every((car) => car.year === 2026 && /2026.00MY/.test(car.generation)),
  );
  assert.ok(mazda.every((car) => car.year === null));
  assert.ok(
    selected.every(
      (car) =>
        car.vehicleClass === "passenger" && car.researchStage === "partial",
    ),
  );
});

test("every admitted Fact, bounded identity, buyer clause and full source registry matches the checked fixture", () => {
  for (const row of fixture) {
    const car = cars.find((car) => car.id === row.id)!;
    assert.equal(hash(car.facts), row.factsSHA256);
    assert.equal(hash(car.configurationEvidence), row.configurationSHA256);
    assert.deepEqual(car.buyerSummary?.strength, row.strength);
    assert.deepEqual(car.buyerSummary?.tradeoff, row.tradeoff);
    assert.deepEqual(car.buyerSummary?.conditions, row.conditions);
    const packed = pack(car.id, { cars, data });
    for (const id of row.sourceIds) {
      const packedSource = packed.sources.find((source) => source.id === id);
      const canonicalSource = data.sources.find((source) => source.id === id);
      assert.ok(packedSource, `${car.id}: missing packed source ${id}`);
      assert.ok(canonicalSource, `${car.id}: missing canonical source ${id}`);
      assert.deepEqual(packedSource, canonicalSource);
    }
  }
});

test("bounded technical grades preserve 134 explicit unknowns and cannot imply rankings, stock or orders", () => {
  assert.equal(
    fixture.reduce((sum, row) => sum + row.nullKeys.length, 0),
    134,
  );
  for (const row of fixture) {
    const car = cars.find((car) => car.id === row.id)!;
    for (const key of row.nullKeys)
      assert.equal(car.facts[key].value, null, `${car.id}/${key}`);
    assert.equal(car.configurationEvidence?.rankingEligible, false);
    assert.equal(
      car.configurationEvidence?.completeVehicleCountEligible,
      false,
    );
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(
      car.availabilityEvidence?.factoryOrderAcceptanceVerified,
      false,
    );
    assert.equal(car.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(car.facts.price_aud.value, null);
  }
  for (const attribute of attributes)
    assert.deepEqual(
      rankAttribute(selected, data.sources, attribute.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups,
      [],
    );
});

test("Mach-E retains usable capacity and same-cycle ranges without inventing strict charging peaks", () => {
  assert.deepEqual(
    mache.map((car) => car.facts.battery_usable_kwh.value),
    [73, 88, 91],
  );
  assert.deepEqual(
    mache.map((car) => car.facts.range_km.value),
    [470, 615, 515],
  );
  for (const car of mache) {
    assert.equal(car.facts.ac_advertised_kw.value, 11);
    assert.equal(car.facts.dc_advertised_kw.value, 150);
    assert.equal(car.facts.ac_peak_kw.value, null);
    assert.equal(car.facts.dc_peak_kw.value, null);
    assert.equal(car.facts.battery_warranty_retention_percent.value, null);
  }
  assert.match(
    mache[2].buyerSummary!.tradeoff!.text,
    /515.*615.*same stated cycle/,
  );
});

test("Mazda6e keeps battery labels, price conditions and conflicting equipment distinct", () => {
  for (const car of mazda) {
    assert.equal(car.facts.battery_label_kwh.value, 78);
    for (const key of [
      "battery_kwh",
      "battery_gross_kwh",
      "battery_usable_kwh",
      "price_aud",
      "current_national_price_aud",
      "boot_l",
      "climate_zones",
      "glove_box_light",
    ])
      assert.equal(car.facts[key].value, null, key);
    assert.equal(car.facts.dc_peak_kw.value, 194);
    assert.equal(car.facts.dc_charge_time_min.value, 24);
    assert.match(car.buyerSummary!.conditions.join(" "), /while stocks last/);
    assert.match(car.buyerSummary!.tradeoff!.text, /0–100%.*11 kW AC.*7.2 kW/);
  }
});

test("market reconciliation retains one Mazda family with historical lead, and one existing Mach-E family", () => {
  const market: {
    records: {
      id: string;
      trims: string[];
      orderStatus: string;
      stockStatus: string;
      rankingEligible: boolean;
      catalogueVariantIds?: string[];
    }[];
    unverifiedLeads: { id: string }[];
    reconciledLeads: { id: string; countsAsAdditionalFamily?: boolean }[];
    counts: {
      consolidatedModelAuditRecords: number;
      namedTrimConfigurationEntries: number;
      unresolvedLeadGroups: number;
      reconciledLeadGroups: number;
    };
  } = JSON.parse(
    fs.readFileSync("data/market-inventory-2026-10-10.json", "utf8"),
  );
  for (const id of ["ford-mustang-mach-e", "mazda-6e"]) {
    const matches = market.records.filter((row) => row.id === id);
    assert.equal(matches.length, 1);
    assert.equal(matches[0].orderStatus, "listed_unconfirmed");
    assert.equal(matches[0].stockStatus, "unverified");
    assert.equal(matches[0].rankingEligible, false);
  }
  assert.deepEqual(
    market.records.find((row) => row.id === "mazda-6e")!.catalogueVariantIds,
    mazda.map((car) => car.id),
  );
  assert.equal(
    market.unverifiedLeads.filter((row) => row.id === "mazda-6e").length,
    0,
  );
  const historical = market.reconciledLeads.filter(
    (row) => row.id === "mazda-6e",
  );
  assert.equal(historical.length, 1);
  assert.equal(historical[0].countsAsAdditionalFamily, false);
  assert.equal(
    market.counts.consolidatedModelAuditRecords,
    market.records.length,
  );
  assert.equal(
    market.counts.namedTrimConfigurationEntries,
    market.records.reduce((sum, row) => sum + row.trims.length, 0),
  );
  assert.equal(
    market.counts.unresolvedLeadGroups,
    market.unverifiedLeads.length,
  );
  assert.equal(
    market.counts.reconciledLeadGroups,
    market.reconciledLeads.length,
  );
});
