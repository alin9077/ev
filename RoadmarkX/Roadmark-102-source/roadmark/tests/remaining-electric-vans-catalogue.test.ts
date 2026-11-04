import test from "node:test";
import assert from "node:assert/strict";
import { pack } from "../src/lib/data";
import {
  carsBeforeCheckpoint84 as catalogue,
  researchBeforeCheckpoint84 as research,
} from "./helpers/checkpoint84-runtime";
import { comparisonFactLabel } from "../src/lib/compare";
import { rankAttribute } from "../src/lib/discovery";
import audit from "../data/market-inventory-2026-10-10.json";
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const vans = cars.filter((c) =>
  /^(renault_kangoo_current|renault_master_my26|peugeot_epartner_current|peugeot_eexpert_my24)__/.test(
    c.id,
  ),
);
const find = (prefix: string, trim?: string) => {
  const c = vans.find(
    (v) => v.id.startsWith(prefix) && (!trim || v.trim.includes(trim)),
  );
  assert.ok(c, `${prefix} ${trim}`);
  return c;
};

test("six commercial records separate current listing, formal MY and mismatched stock epochs", () => {
  assert.equal(vans.length, 6);
  for (const car of vans) {
    assert.ok(car.buyerSummary?.strength);
    assert.ok(car.buyerSummary?.tradeoff);
  }
  assert.equal(new Set(vans.map((c) => c.modelFamily)).size, 4);
  for (const c of vans) {
    assert.equal(c.vehicleClass, "van");
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    if (c.id.startsWith("renault_master")) assert.equal(c.year, 2026);
    else if (c.id.startsWith("peugeot_eexpert")) assert.equal(c.year, 2024);
    else assert.equal(c.year, null);
  }
  assert.equal(
    cars.some((c) => /transit.city/i.test(c.model)),
    false,
  );
  const city = audit.records.find((r) => r.id === "ford-transit-city")!;
  assert.equal(
    city.deliveryStatus,
    "manufacturer_expected_first_deliveries_2026_11",
  );
  assert.equal(city.stockStatus, "unverified");
});

test("Kangoo uses visible electric dimensions/payload and never converts distance recovery to SOC", () => {
  const swb = find("renault_kangoo", "SWB");
  const lwb = find("renault_kangoo", "LWB");
  assert.equal(swb.facts.payload_kg.value, 523);
  assert.equal(swb.facts.turning_circle_m.unit, "m");
  assert.equal(
    swb.facts.turning_circle_m.comparisonBasis,
    "Kerb-to-kerb turning circle",
  );
  assert.equal(lwb.facts.payload_kg.value, 668);
  assert.equal(swb.facts.gvm_kg.value, 2230);
  assert.equal(lwb.facts.gvm_kg.value, 2490);
  for (const c of [swb, lwb]) {
    assert.equal(c.facts.height_mm.value, 1830);
    assert.equal(c.facts.battery_usable_kwh.value, 45);
    assert.equal(c.facts.battery_gross_kwh.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, null);
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.ac_kw.value, 22);
    assert.equal(c.facts.dc_peak_kw.value, 80);
    assert.equal(c.facts.equipment_optional.status, "optional");
    assert.ok(Array.isArray(c.facts.equipment_optional.value));
  }
});

test("Master preserves H2 bodies, distinct unladen/tare mass and mutually exclusive options", () => {
  const mwb = find("renault_master", "MWB");
  const lwb = find("renault_master", "LWB");
  assert.equal(mwb.facts.unladen_mass_kg.value, 2336);
  assert.equal(mwb.facts.tare_mass_kg.value, 2344);
  assert.equal(lwb.facts.unladen_mass_kg.value, 2416);
  assert.equal(lwb.facts.tare_mass_kg.value, 2424);
  assert.equal(mwb.facts.payload_kg.value, 1164);
  assert.equal(lwb.facts.payload_kg.value, 1084);
  for (const c of [mwb, lwb]) {
    assert.equal(c.facts.height_mm.value, 2498);
    assert.equal(c.facts.seats.value, 3);
    assert.equal(c.facts.battery_kwh.value, 87);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.ac_kw.value, 11);
    assert.equal(c.facts.ac_optional_kw.value, 22);
    assert.equal(c.facts.ac_optional_kw.status, "optional");
    assert.match(
      c.facts.ac_optional_kw.conditionExplanation || "",
      /removes V2L/,
    );
    assert.equal(c.facts.v2l_standard.value, true);
    assert.equal(c.facts.dc_charge_time_min.value, 38);
    assert.match(c.facts.dc_charge_time_min.basis, /15–80%/);
    assert.equal(c.facts.dc_10_80_min.value, null);
    assert.match(
      JSON.stringify(c.facts.equipment_optional.value),
      /sensors delete blind-spot/,
    );
    assert.equal(
      c.facts.warranty_advertised_retained_capacity_percent.value,
      null,
    );
    assert.equal(c.facts.warranty_vehicle_km.value, "unlimited");
  }
});

test("Peugeot conflicts, charging windows and battery warranties do not inherit older or foreign values", () => {
  const partner = find("peugeot_epartner");
  const expert = find("peugeot_eexpert");
  for (const key of [
    "payload_kg",
    "seats",
    "ac_kw",
    "wheelbase_mm",
    "cargo_extended_volume_m3",
  ])
    assert.equal(partner.facts[key].value, null, key);
  assert.equal(partner.facts.equipment_touchscreen_inches.value, 10);
  assert.equal(partner.facts.battery_warranty.value, null);
  assert.equal(partner.facts.dc_charge_time_min.value, 30);
  for (const key of [
    "range_km",
    "range_cycle",
    "ac_charge_minutes",
    "cargo_extended_volume_m3",
    "dc_peak_kw",
  ])
    assert.equal(expert.facts[key].value, null, key);
  assert.equal(expert.facts.width_mm.value, null);
  assert.equal(expert.facts.width_mirrors_folded_mm.value, 1920);
  assert.equal(expert.facts.dc_charge_time_min.value, 45);
  assert.equal(expert.facts.price_aud.value, 79990);
  assert.equal(expert.facts.advertised_driveaway_aud.value, 56990);
  assert.equal(expert.facts.advertised_driveaway_aud.validUntil, undefined);
  for (const c of [partner, expert]) {
    assert.match(c.facts.dc_charge_time_min.basis, /0–80%/);
    assert.equal(c.facts.dc_10_80_min.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(
      c.facts.warranty_battery_capacity_retention_percent.value,
      null,
    );
  }
});

test("commercial measurements remain in commercial cohorts and every exact claim has resolvable evidence", () => {
  const groups = rankAttribute(cars, data.sources, "length_mm", {
    asOf: "2026-10-10",
    maxAgeDays: 30,
  }).groups;
  for (const group of groups) {
    if (group.entries.some((e) => vans.some((v) => v.id === e.car.id)))
      assert.equal(group.vehicleClass, "van");
  }
  const sources = new Set(data.sources.map((s) => s.id));
  for (const c of vans) {
    const p = pack(c.id, snapshot);
    for (const f of Object.values(p.car.facts))
      for (const id of f.sourceIds) assert.ok(sources.has(id), id);
  }
});

test("mixed charge windows never inherit the first vehicle's 10–80 heading", () => {
  const ariya = cars.find((c) => c.id.startsWith("nissan_ariya_my25"))!;
  const master = find("renault_master_my26");
  const expert = find("peugeot_eexpert_my24");
  for (const other of [master, expert]) {
    const facts = [
      ariya.facts.dc_charge_time_min,
      other.facts.dc_charge_time_min,
    ];
    assert.equal(
      comparisonFactLabel("dc_charge_time_min", facts),
      "Published DC charging duration",
    );
    assert.equal(
      comparisonFactLabel("dc_charge_time_min", [...facts].reverse()),
      "Published DC charging duration",
    );
  }
  assert.equal(
    comparisonFactLabel("dc_charge_time_min", [
      ariya.facts.dc_charge_time_min,
      ariya.facts.dc_charge_time_min,
    ]),
    ariya.facts.dc_charge_time_min.label,
  );
  assert.equal(
    comparisonFactLabel("price_aud", [expert.facts.price_aud]),
    expert.facts.price_aud.label,
  );
});
