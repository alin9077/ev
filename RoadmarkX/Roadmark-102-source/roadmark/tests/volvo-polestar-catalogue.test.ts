import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack } from "../src/lib/data";
const cars = catalogue();
const batch = cars.filter((c) => ["Volvo", "Polestar"].includes(c.brand));
const car = (id: string) => batch.find((c) => c.id === id + "__20261010")!;
test("21 exact MY27 Volvo/Polestar configurations preserve grade and separate body families", () => {
  assert.equal(batch.length, 21);
  assert.ok(
    batch.every(
      (c) => c.year === 2027 && c.availability === "current_or_order_listed",
    ),
  );
  const coupe = car("polestar_4_coupe_my27_rear_motor");
  const suv = car("polestar_4_suv_my27_rear_motor");
  assert.notEqual(coupe.modelFamily, suv.modelFamily);
  assert.equal(coupe.facts.height_mm.value, 1534);
  assert.equal(suv.facts.height_mm.value, 1556);
  assert.equal(batch.filter((c) => c.id.startsWith("volvo_ex90")).length, 2);
  assert.ok(!batch.some((c) => /ex60|polestar_5|ec40/.test(c.id)));
});
test("Polestar 4 Performance option ranges never inherit base Dual figures", () => {
  const coupe = car("polestar_4_coupe_my27_dual_motor_with_performance_pack");
  const suv = car("polestar_4_suv_my27_dual_motor_with_performance_pack");
  assert.equal(coupe.facts.range_km.value, 500);
  assert.equal(suv.facts.range_km.value, 520);
  for (const c of batch) {
    assert.equal(c.facts.range_km.status, "conditional");
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.battery_gross_kwh.value, null);
    assert.equal(c.facts.battery_usable_kwh.value, null);
  }
  assert.ok(
    suv.availabilityEvidence?.qualifications?.some((q) =>
      q.includes("option configuration"),
    ),
  );
});
test("station ratings, unknown seats and unclassified towing remain separate facts", () => {
  const ex30 = car("volvo_ex30_my27_plus_p5_long_range_electric");
  assert.equal(ex30.facts.dc_peak_kw.value, null);
  assert.equal(ex30.facts.dc_test_station_kw.value, 150);
  assert.equal(ex30.facts.dc_charge_time_min.value, 28);
  for (const c of batch.filter((c) => /^polestar_[34]_/.test(c.id))) {
    assert.equal(c.facts.seats.value, null);
    assert.equal(c.facts.towing_braked_kg.value, null);
  }
  assert.equal(car("polestar_4_suv_my27_rear_motor").facts.ac_kw.value, 11);
});
test("cargo occupied rows and measurement boundaries cannot silently collapse", () => {
  const ex90 = car("volvo_ex90_my27_plus_single_motor");
  assert.equal(ex90.facts.boot_l.value, 324);
  assert.equal(ex90.facts.cargo_open_second_row_up_l.value, 697);
  assert.equal(
    car("volvo_ex30_my27_cross_country_p8_awd_electric").facts.boot_l.value,
    null,
  );
  const suv = car("polestar_4_suv_my27_rear_motor");
  assert.equal(suv.facts.boot_l.value, 530);
  assert.equal(suv.facts.cargo_rear_to_inner_roof_l.value, 655);
  assert.equal(suv.facts.boot_l.status, "conditional");
});
test("advertised Volvo stock is exact-grade scoped and links its evidence", () => {
  const plus = car("volvo_es90_my27_plus_single_motor_extended_range");
  const ultra = car("volvo_es90_my27_ultra_single_motor_extended_range");
  assert.equal(plus.availabilityEvidence?.stockStatus, "new_stock_listed");
  assert.equal(ultra.availabilityEvidence?.stockStatus, "unverified");
  assert.ok(
    batch
      .filter((c) => c.brand === "Polestar")
      .every((c) => c.availabilityEvidence?.stockStatus === "unverified"),
  );
  const ids = new Set(pack(plus.id).sources.map((s) => s.id));
  assert.ok(plus.availabilityEvidence!.sourceIds.every((id) => ids.has(id)));
});
