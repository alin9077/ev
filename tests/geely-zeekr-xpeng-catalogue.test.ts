// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures as effectiveFeatures,
} from "../src/lib/data";
import { sourceSnapshotPack as pack } from "./helpers/source-fixture";
import audit from "../data/market-inventory-2026-10-10.json";
const cars = catalogue();
const data = research();
const snapshot = { cars, data };
const group = cars.filter((c) =>
  /^(geely_ex2_launch|zeekr_x_my26|zeekr_009_116|xpeng_g6_my26|xpeng_x9_launch)__/.test(
    c.id,
  ),
);
const find = (prefix: string, trim = "") => {
  const c = group.find((v) => v.id.startsWith(prefix) && v.trim.includes(trim));
  assert.ok(c, `${prefix} ${trim}`);
  return c;
};
test("twelve new base configurations retain five identities and no duplicate factory-package car", () => {
  assert.equal(group.length, 12);
  for (const car of group) {
    assert.ok(car.buyerSummary?.strength);
    assert.ok(car.buyerSummary?.tradeoff);
  }
  assert.equal(new Set(group.map((c) => c.modelFamily)).size, 5);
  assert.equal(group.filter((c) => c.year === null).length, 7);
  assert.equal(
    group.some((c) => c.trim.includes("Black Edition")),
    false,
  );
  assert.ok(audit.records.some((r) => r.id === "xpeng-g6"));
  assert.equal(cars.filter((c) => c.id.startsWith("geely_ex5__")).length, 4);
  assert.equal(cars.filter((c) => c.id.startsWith("zeekr_7x__")).length, 4);
});
test("Geely EX2 exact equipment distinguishes omission from false and preserves unverified seat count", () => {
  const complete = find("geely_ex2_launch", "Complete");
  const inspire = find("geely_ex2_launch", "Inspire");
  assert.equal(complete.facts.range_km.value, 252);
  assert.equal(complete.facts.dc_peak_kw.value, 60);
  assert.equal(inspire.facts.dc_peak_kw.value, 80);
  assert.equal(complete.facts.equipment_heated_front_seats.value, false);
  assert.equal(complete.facts.equipment_front_seat_ventilation.value, null);
  assert.equal(complete.facts.seats.value, null);
  const parking = effectiveFeatures(complete, data).find(
    (f) => f.criterion === "parking_cameras",
  )!;
  assert.equal(parking.status, "standard");
  assert.match(parking.value, /Rear-view camera.*no surround-view/);
  assert.equal(complete.facts.battery_usable_kwh.value, null);
  assert.equal(complete.facts.battery_gross_kwh.value, null);
  assert.equal(complete.facts.price_aud.value, 26490);
  assert.equal(complete.availabilityEvidence?.stockStatus, "new_stock_listed");
  assert.equal(
    effectiveFeatures(complete, data).find(
      (f) => f.criterion === "front_heated_seats",
    )?.status,
    "unavailable",
  );
});
test("Zeekr X battery/charge split and AWD options never inherit each other", () => {
  const rwd = find("zeekr_x_my26", "RWD");
  const awd = find("zeekr_x_my26", "AWD");
  assert.equal(rwd.year, 2026);
  assert.equal(rwd.facts.dc_peak_kw.value, 230);
  assert.equal(awd.facts.dc_peak_kw.value, 150);
  assert.equal(rwd.facts.dc_charge_time_min.value, null);
  assert.equal(awd.facts.dc_charge_time_min.value, null);
  assert.equal(awd.facts.equipment_automatic_front_doors.status, "optional");
  assert.equal(awd.facts.equipment_black_forged_20_wheels.status, "optional");
  assert.equal(rwd.facts.price_aud.value, null);
  assert.equal(rwd.facts.advertised_driveaway_aud.value, 48900);
  assert.equal(rwd.availabilityEvidence?.stockStatus, "unverified");
});
test("009 keeps 400 V architecture, station-only charging power and unscoped cargo separate", () => {
  const records = group.filter((c) => c.id.startsWith("zeekr_009_116"));
  assert.equal(records.length, 3);
  for (const c of records) {
    assert.equal(c.facts.architecture_v.value, 400);
    assert.equal(c.facts.battery_kwh.value, 116);
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.dc_test_charger_kw.value, 150);
    assert.equal(c.facts.dc_charge_time_min.value, 30);
    assert.match(c.facts.dc_charge_time_min.basis, /10–80%.*150/);
    assert.equal(c.facts.boot_l.value, null);
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.warranty_battery_minimum_soh_percent.value, 70);
  }
  assert.equal(
    find("zeekr_009_116", "7-seat FWD").facts.equipment_heated_front_seats
      .value,
    false,
  );
  assert.equal(
    find("zeekr_009_116", "7-seat AWD").availabilityEvidence?.stockStatus,
    "unverified",
  );
});
test("New G6 preserves exact configurator wheel ranges and unresolved price/stock epochs", () => {
  const sr = find("xpeng_g6_my26", "Standard");
  const lr = find("xpeng_g6_my26", "Long");
  const awd = find("xpeng_g6_my26", "Performance");
  assert.equal(sr.facts.battery_gross_kwh.value, 68.5);
  assert.equal(sr.facts.range_km.value, 480);
  assert.deepEqual(sr.facts.wheel_configuration_options.value, [
    {
      wheel_in: 18,
      status: "standard",
      wltp_km: 480,
      consumption_kwh_100km: 16.6,
    },
    {
      wheel_in: 20,
      status: "optional",
      wltp_km: 470,
      consumption_kwh_100km: 16.9,
      option_price_aud: null,
    },
  ]);
  assert.equal(lr.facts.range_km.value, 525);
  assert.equal(awd.facts.range_km.value, 510);
  assert.equal(awd.facts.black_edition_option_price_aud.value, 3000);
  assert.equal(awd.facts.black_edition_option_price_aud.status, "optional");
  for (const c of [sr, lr, awd]) {
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, 12);
  }
  assert.equal(sr.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(lr.availabilityEvidence?.stockStatus, "unverified");
});
test("X9 launch equipment stays conditional and every imported claim resolves to evidence", () => {
  const fwd = find("xpeng_x9_launch", "FWD");
  const awd = find("xpeng_x9_launch", "AWD");
  assert.equal(fwd.availabilityEvidence?.orderStatus, "accepting_orders");
  assert.equal(fwd.facts.dc_charge_time_min.value, null);
  assert.equal(fwd.facts.dc_peak_kw.value, null);
  assert.equal(awd.facts.dc_peak_kw.value, 542);
  assert.equal(awd.facts.dc_charge_time_min.value, 12);
  assert.equal(
    fwd.facts.equipment_active_rear_wheel_steering.status,
    "conditional",
  );
  assert.equal(fwd.facts.warranty_vehicle_km_commercial.value, 160000);
  assert.match(fwd.facts.boot_l.basis, /Seven seats occupied/);
  const sources = new Set(data.sources.map((s) => s.id));
  for (const car of group) {
    const p = pack(car.id, snapshot);
    for (const fact of Object.values(p.car.facts))
      for (const id of fact.sourceIds) assert.ok(sources.has(id), id);
  }
});
