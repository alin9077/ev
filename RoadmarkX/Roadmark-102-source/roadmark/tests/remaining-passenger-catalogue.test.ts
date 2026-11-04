import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack, effectiveFeatures } from "../src/lib/data";
import audit from "../data/market-inventory-2026-10-10.json";
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const group = cars.filter((c) =>
  /^(leapmotor_b05_my26|leapmotor_b10_my26|leapmotor_c10_current|chery_e5_my26|deepal_s07_current|deepal_e07_current)__/.test(
    c.id,
  ),
);
const find = (prefix: string, trim = "") => {
  const car = group.find(
    (c) => c.id.startsWith(prefix) && c.trim.includes(trim),
  );
  assert.ok(car, `${prefix} ${trim}`);
  return car;
};
test("ten current passenger configurations exclude future, residual and hybrid candidates", () => {
  assert.equal(group.length, 10);
  for (const car of group) {
    assert.ok(car.buyerSummary?.strength);
    assert.ok(car.buyerSummary?.tradeoff);
  }
  assert.equal(new Set(group.map((c) => c.modelFamily)).size, 6);
  assert.equal(group.filter((c) => c.year === null).length, 5);
  assert.ok(cars.every((c) => !c.id.startsWith("leapmotor_b03x")));
  assert.ok(group.every((c) => !/Sports\+|MY25.5|Hybrid/.test(c.trim)));
  const future = audit.records.find((r) => r.id === "leapmotor-b03x")!;
  assert.equal(future.stockStatus, "unverified");
  assert.equal(future.completeVehicleCountEligible, false);
  assert.match(future.evidenceNote, /November 2026/);
});
test("Leapmotor exact BEV columns retain 30–80 charging windows and unknown omitted equipment", () => {
  const b05 = find("leapmotor_b05_my26", "Style");
  const b05lr = find("leapmotor_b05_my26", "Design");
  const b10 = find("leapmotor_b10_my26", "Design");
  assert.equal(b05.facts.battery_kwh.value, 56.2);
  assert.equal(b05.facts.range_km.value, 401);
  assert.equal(b05lr.facts.range_km.value, 482);
  assert.equal(b10.facts.range_km.value, 434);
  assert.equal(b05.facts.dc_charge_time_min.value, 16);
  assert.equal(b05lr.facts.dc_charge_time_min.value, 18);
  assert.equal(b10.facts.dc_charge_time_min.value, 20);
  const b05Equipment = effectiveFeatures(b05, data);
  assert.equal(
    b05Equipment.find((f) => f.criterion === "front_ventilated_seats")?.status,
    "not_verified",
  );
  assert.equal(
    b05Equipment.find((f) => f.criterion === "power_tailgate")?.status,
    "not_verified",
  );
  assert.equal(b05.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(b05.facts.price_aud.value, null);
  for (const c of group) {
    assert.match(c.facts.dc_charge_time_min.basis, /30–80%/);
    assert.equal(c.facts.dc_10_80_min.value, null);
  }
});
test("current C10 uses a neutral shared epoch and holds consumption and stock-epoch conflicts", () => {
  const style = find("leapmotor_c10_current", "Style");
  const lr = find("leapmotor_c10_current", "Design");
  assert.equal(style.year, null);
  assert.equal(lr.year, null);
  const model = data.models.find((m) => m.id === lr.modelId)!;
  assert.doesNotMatch(String(model.generation), /Style exact hardware/);
  assert.match(String(model.generation), /June 2026/);
  assert.equal(style.facts.battery_kwh.value, 69.9);
  assert.equal(lr.facts.battery_kwh.value, 81.9);
  assert.equal(lr.facts.power_kw.value, 220);
  assert.equal(lr.facts.range_km.value, 510);
  assert.equal(lr.facts.dc_charge_time_min.value, 22);
  assert.equal(lr.facts.wltp_energy_wh_km.value, null);
  assert.match(
    (lr.facts.wltp_energy_wh_km.qualifications ?? []).join(" "),
    /185.*180/,
  );
  assert.match(lr.facts.towing_braked_kg.basis, /Aggregate Trailer Mass/);
  assert.equal(style.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(lr.availabilityEvidence?.stockStatus, "unverified");
});
test("Deepal retains technical-document scope, charging conflicts and VIN recall uncertainty", () => {
  const s07 = find("deepal_s07_current");
  assert.equal(
    s07.facts.wltp_energy_consumption_kwh_per100_km.unit,
    "kWh/100km",
  );
  assert.equal(s07.facts.dc_charge_time_min.value, 35);
  assert.equal(s07.facts.equipment_optional_wheel_size.status, "optional");
  assert.equal(s07.facts.equipment_optional_tyres.status, "optional");
  const e07s = group.filter((c) => c.id.startsWith("deepal_e07_current"));
  assert.equal(e07s.length, 2);
  for (const c of [s07, ...e07s]) {
    assert.equal(c.year, null);
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(c.facts.warranty_battery_retention_guarantee.value, null);
  }
  for (const c of e07s) {
    assert.equal(c.facts.dc_charge_time_min.value, 15);
    assert.ok(
      c.facts.battery_chemistry.sourceIds.includes("r10_ldc_deepal_e07"),
    );
    assert.equal(c.facts.equipment_orange_nappa_seat_trim.status, "optional");
    assert.equal(c.facts.ac_charge_time_hours.value, null);
    assert.equal(c.facts.ac_charge_time_hours.sourceIds.length, 2);
    assert.equal(c.facts.ac_charge_time_observation.status, "conditional");
    assert.equal(c.facts.child_restraint_recall_applicability.value, null);
    assert.match(
      (c.facts.child_restraint_recall_applicability.qualifications ?? []).join(
        " ",
      ),
      /VIN/,
    );
    assert.match(
      (c.availabilityEvidence?.qualifications ?? []).join(" "),
      /REC-006560/,
    );
  }
});
test("Chery MY26 preserves VDA boundaries, test-station distinction and portable-cable conflict", () => {
  const car = find("chery_e5_my26");
  assert.equal(car.year, 2026);
  assert.equal(car.facts.boot_l.value, 300);
  assert.equal(car.facts.energy_consumption_nedc_whkm.value, 132);
  assert.equal(car.facts.energy_consumption_nedc_whkm.unit, "Wh/km");
  assert.match(car.facts.energy_consumption_nedc_whkm.basis, /NEDC/);
  assert.match(car.facts.boot_l.basis, /VDA to cargo cover/);
  assert.equal(car.facts.rear_seats_folded_cargo_l.value, 1079);
  assert.match(car.facts.rear_seats_folded_cargo_l.basis, /VDA to roof/);
  assert.equal(car.facts.dc_charger_rating_in_test_kw.value, 130);
  assert.equal(car.facts.dc_peak_kw.value, null);
  assert.equal(car.facts.towing_braked_kg.value, null);
  assert.equal(car.facts.equipment_portable_evse_included.value, null);
  assert.equal(car.facts.equipment_portable_evse_included.sourceIds.length, 2);
  assert.equal(car.availabilityEvidence?.stockStatus, "new_stock_listed");
  assert.equal(car.facts.price_aud.value, null);
  assert.equal(car.facts.driveaway_launch_price_aud.value, 37990);
  assert.equal(
    effectiveFeatures(car, data).find((f) => f.criterion === "heat_pump")
      ?.status,
    "standard",
  );
});
test("all imported exact claims remain linked through the same detailed pack", () => {
  const sources = new Set(data.sources.map((s) => s.id));
  for (const car of group) {
    const p = pack(car.id, snapshot);
    for (const f of Object.values(p.car.facts))
      for (const id of f.sourceIds) assert.ok(sources.has(id), id);
    assert.ok(p.sources.every((s) => /^https?:/.test(s.url)));
  }
});
