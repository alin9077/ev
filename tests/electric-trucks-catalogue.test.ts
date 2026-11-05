import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, effectiveFeatures } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
import audit from "../data/market-inventory-2026-10-10.json";
const cars = catalogue();
const data = research();
const trucks = cars.filter((c) => c.vehicleClass === "truck");
const get = (id: string) => {
  const car = trucks.find((c) => c.id === `${id}__20261010`);
  assert.ok(car, id);
  return car;
};
test("24 exact truck configurations keep rating options, historical and future candidates out of the version count", () => {
  assert.equal(trucks.length, 24);
  assert.equal(new Set(trucks.map((c) => c.modelFamily)).size, 5);
  assert.equal(trucks.filter((c) => c.brand === "Fuso").length, 14);
  assert.equal(trucks.filter((c) => c.brand === "Hyundai").length, 1);
  for (const c of trucks) {
    assert.ok(c.buyerSummary?.strength);
    assert.ok(c.buyerSummary?.tradeoff);
    assert.equal(c.year, null);
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.battery_gross_kwh.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.dc_10_80_min.value, null);
    assert.equal(c.facts.payload_kg.value, null);
  }
  assert.ok(!trucks.some((c) => /JAC|eAUMARK|eAUMAN/.test(c.brand + c.model)));
  assert.equal(
    audit.records.find((r) => r.id === "foton-eaumark-s")
      ?.completeVehicleCountEligible,
    false,
  );
  assert.equal(
    audit.records.find((r) => r.id === "jac-n55-ev")?.stockStatus,
    "unverified",
  );
});
test("Fuso preserves exact wheelbase, estimated body allowance and optional ePTO", () => {
  const city = get("fuso_ecanter_feavkbrcsfad");
  assert.equal(city.facts.wheelbase_mm.value, 2500);
  assert.equal(city.facts.turning_circle_m.value, 9.8);
  assert.equal(city.facts.body_and_payload_allowance_calculated_kg.value, 1920);
  assert.equal(city.facts.completed_vehicle_payload_kg.value, null);
  assert.equal(city.facts.range_km.value, null);
  assert.equal(city.facts.dc_charge_time_quoted_hours.value, 0.6);
  assert.equal(city.facts.dc_charge_time_quoted_hours.unit, "h");
  assert.equal(city.facts.equipment_q02.status, "optional");
  assert.match(String(city.facts.equipment_q02.value), /not standard/);
  const lwb = get("fuso_ecanter_febvkgrdsfab");
  assert.equal(lwb.facts.speed_limiter.value, 89);
  assert.equal(lwb.facts.optional_gvm_kg.value, 4495);
  assert.equal(city.facts.towing_braked_kg.value, null);
});
test("Hyundai charging voltage, SOC and low-GVM conflicts stay explicit", () => {
  const c = get("hyundai_mighty_electric_cab_chassis_3300_7300");
  assert.equal(c.facts.gvm_kg.value, 7300);
  assert.equal(c.facts.dc_charge_time_min.value, 71);
  assert.match(c.facts.dc_charge_time_min.basis, /8–100%.*100 kW.*800 V/);
  assert.equal(c.facts.dc_minimum_charger_voltage_v.value, 569.4);
  assert.equal(c.facts.turning_circle_m.value, null);
  assert.equal(c.facts.optional_gvm_conflict.value, null);
  assert.match(
    c.facts.optional_gvm_conflict.qualifications.join(" "),
    /4495.*4500/,
  );
  assert.equal(c.facts.equipment_touchscreen_size.value, null);
  assert.match(c.facts.range_km.basis, /tray-body.*7,300/);
});
test("Farizon body-specific range and minute-labelled durations never mix with chassis payload", () => {
  const chassis = get("farizon_f3e_cab_chassis_72_8kwh");
  const tray = get("farizon_f3e_tray_72_8kwh");
  const box = get("farizon_f3e_cargo_box_72_8kwh");
  assert.equal(chassis.facts.range_km.value, null);
  assert.equal(tray.facts.range_km.value, 314);
  assert.equal(box.facts.range_km.value, 250);
  assert.equal(chassis.facts.published_payload_kg.value, 1705);
  assert.match(chassis.facts.published_payload_kg.basis, /body-plus-load/);
  assert.equal(tray.facts.published_payload_kg.value, 1440);
  assert.equal(box.facts.published_payload_kg.value, 1190);
  for (const c of trucks.filter((c) => c.brand === "Farizon")) {
    assert.equal(c.facts.dc_charge_time_min.unit, "min");
    assert.doesNotMatch(c.facts.dc_charge_time_min.label, /hours/);
    assert.equal(c.facts.dc_charge_time_quoted_hours, undefined);
  }
  assert.equal(get("farizon_h9e_4_5t_cargo").facts.range_km.value, null);
});
test("Foton production epoch and charging hours do not inherit 2023 dealer stock", () => {
  const c = get("foton_t5_4495_81_14kwh");
  assert.match(c.generation, /2025 Production/);
  assert.equal(c.year, null);
  assert.equal(c.facts.battery_kwh.value, 81.14);
  assert.equal(c.facts.dc_peak_kw.value, 85);
  assert.equal(c.facts.dc_charge_time_quoted_hours.value, 1);
  assert.equal(c.facts.dc_charge_time_quoted_hours.unit, "h");
  assert.match(c.facts.dc_charge_time_quoted_hours.basis, /window.*not stated/);
  assert.equal(c.facts.body_and_payload_allowance_calculated_kg.value, 2095);
});
test("truck ranking and equipment never borrow passenger measurements or automatic convenience features", () => {
  for (const key of [
    "range_km",
    "dc_charge_time_min",
    "towing_braked_kg",
  ] as const) {
    const ranked = rankAttribute(cars, data.sources, key, {
      asOf: "2026-10-10",
      maxAgeDays: 30,
    });
    assert.ok(
      ranked.groups.every((g) =>
        g.entries.every((e) => e.car.vehicleClass !== "truck"),
      ),
    );
  }
  for (const c of trucks) {
    const features = effectiveFeatures(c, data);
    for (const key of [
      "phone_key",
      "automatic_start",
      "walk_away_lock",
      "pet_mode",
      "heat_pump",
    ]) {
      assert.equal(
        features.find((f) => f.criterion === key)?.status,
        "not_verified",
        `${c.id}: ${key}`,
      );
    }
  }
});
