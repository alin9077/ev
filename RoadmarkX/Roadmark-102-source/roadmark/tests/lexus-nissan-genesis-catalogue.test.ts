import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack } from "../src/lib/data";
import audit from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/lexus-nissan-genesis-evidence-2026-10-10.json";
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const group = cars.filter((car) =>
  ["Lexus", "Nissan", "Genesis"].includes(car.brand),
);
const find = (prefix: string, trim?: string) => {
  const c = group.find(
    (car) => car.id.startsWith(prefix) && (!trim || car.trim.includes(trim)),
  );
  assert.ok(c, `${prefix} ${trim}`);
  return c;
};

test("thirteen exact current configurations retain independent MY and advertised-stock scopes", () => {
  assert.equal(group.length, 13);
  assert.equal(new Set(group.map((c) => c.modelFamily)).size, 7);
  for (const c of group) {
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(
      c.availabilityEvidence?.stockStatus,
      c.brand === "Nissan" ? "new_stock_listed" : "unverified",
    );
    if (c.brand === "Lexus") assert.equal(c.year, null);
    if (c.brand === "Nissan") assert.equal(c.year, 2025);
  }
  assert.equal(find("genesis_gv60_2027").year, 2027);
  assert.equal(find("genesis_gv60magma").year, 2027);
  assert.equal(find("genesis_g80ev").year, 2026);
  assert.equal(find("genesis_gv70ev").year, 2025);
  assert.ok(audit.records.some((r) => r.id === "lexus-es-bev"));
  assert.equal(
    audit.counts.consolidatedModelAuditRecords,
    audit.records.length,
  );
  assert.equal(evidence.exact_new_stock_evidence.length, 5);
});

test("Lexus system output, cell voltage, turning radius and current prices never inherit incompatible values", () => {
  const es = find("lexus_es_bev", "350e");
  assert.equal(es.facts.power_kw.value, 165);
  assert.equal(es.facts.motor_individual_max_power_kw.value, 167);
  assert.equal(es.facts.battery_cell_nominal_voltage_v.value, 3.76);
  assert.equal(es.facts.battery_pack_voltage_v.value, null);
  assert.equal(es.facts.turning_radius_tyres_m.value, 5.918);
  assert.equal(es.facts.turning_circle_m.value, null);
  assert.equal(find("lexus_rz", "550e").facts.price_aud.value, 104920);
  assert.equal(find("lexus_rz", "550e").facts.dc_peak_kw.value, null);
  for (const c of group.filter((c) => c.brand === "Lexus")) {
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, null);
    assert.equal(c.facts.dc_quoted_minutes.value, 28);
    assert.equal(c.facts.boot_l.status, "conditional");
  }
});

test("Ariya standard versus optional AC charging and cargo boundaries stay exact", () => {
  const plus = find("nissan_ariya", "Advance+");
  const evolve = find("nissan_ariya", "Evolve");
  assert.equal(plus.facts.ac_kw.value, 7.4);
  assert.equal(plus.facts.ac_optional_kw.value, 22);
  assert.equal(plus.facts.ac_optional_kw.status, "optional");
  assert.equal(plus.facts.ac_charge_10_100_at_22kw_hours.status, "conditional");
  assert.equal(evolve.facts.ac_kw.value, 22);
  assert.equal(plus.facts.battery_usable_kwh.value, 87);
  assert.equal(plus.facts.boot_l.value, 466);
  assert.equal(evolve.facts.boot_l.value, 408);
  assert.match(String(plus.facts.boot_l.basis), /roof/);
  assert.equal(plus.facts.turning_circle_m.value, 11.5);
  assert.match(plus.facts.turning_circle_m.basis, /Wall-to-wall/);
  for (const c of group.filter((c) => c.brand === "Nissan")) {
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.advertised_driveaway_aud.validUntil, "2026-10-31");
    assert.match(
      c.facts.advertised_driveaway_aud.conditionExplanation || "",
      /demonstrator/,
    );
    assert.equal(c.facts.warranty_battery_minimum_soh_percent.value, null);
    assert.match(String(c.facts.battery_warranty.value), /nine gauge bars/);
  }
});

test("Genesis normal/boost output, charger test power and held conflicts never become fabricated specs", () => {
  const magma = find("genesis_gv60magma");
  assert.equal(magma.facts.power_kw.value, 448);
  assert.equal(magma.facts.power_boost_kw.value, 478);
  assert.equal(magma.facts.torque_nm.value, 740);
  assert.equal(magma.facts.torque_boost_nm.value, 790);
  for (const key of [
    "zero_to_100_s",
    "length_mm",
    "width_mm",
    "height_mm",
    "tare_mass_kg",
  ])
    assert.equal(magma.facts[key].value, null, key);
  assert.equal(magma.facts.range_km.value, 425);
  assert.equal(find("genesis_g80ev").facts.battery_kwh.value, 94.5);
  assert.equal(find("genesis_g80ev").facts.range_km.value, 570);
  assert.equal(find("genesis_gv70ev").facts.power_kw.value, 320);
  assert.equal(find("genesis_gv70ev").facts.power_boost_kw.value, 360);
  for (const c of group.filter((c) => c.brand === "Genesis")) {
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.dc_time_charger_kw.value, 350);
    assert.equal(c.facts.price_aud.value, null);
    assert.match(c.facts.example_driveaway_aud.basis, /NSW postcode 2000/);
  }
  assert.equal(
    find("genesis_gv60_2027").facts.equipment_v2l_capable.value,
    null,
  );
});

test("warranty and equipment qualifications remain available through the shared exact-version pack", () => {
  for (const c of group) {
    const p = pack(c.id, snapshot);
    assert.equal(p.car.facts.warranty.status, "conditional");
    assert.equal(p.car.facts.battery_warranty.status, "conditional");
    assert.match(String(p.car.facts.warranty.value), /5 years/);
    const sourceIds = new Set(data.sources.map((s) => s.id));
    for (const f of Object.values(p.car.facts))
      for (const id of f.sourceIds) assert.ok(sourceIds.has(id), id);
  }
  const rz = find("lexus_rz", "Sports Luxury");
  const sport = find("lexus_rz", "F Sport");
  assert.equal(rz.facts.equipment_panoramic_roof.value, true);
  assert.equal(sport.facts.equipment_panoramic_roof.value, false);
  assert.equal(sport.facts.equipment_front_seats_ventilated.value, null);
  assert.match(String(rz.facts.battery_warranty.value), /Defects: 5-year base/);
  assert.equal(
    find("genesis_gv60_2027").facts.equipment_head_up_display.value,
    false,
  );
  assert.equal(
    find("genesis_gv60_2027").facts.equipment_driver_memory.value,
    false,
  );
});
