import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
const rows = catalogue().filter(
  (c) => c.brand === "Mercedes-Benz" && c.vehicleClass === "passenger",
);
const get = (trim: string) => rows.find((c) => c.trim === trim)!;
test("Mercedes imports seven manufacturer-listed records without stock or MY claims", () => {
  assert.equal(rows.length, 7);
  assert.equal(new Set(rows.map((c) => c.modelFamily)).size, 5);
  for (const c of rows) {
    assert.equal(c.year, null);
    assert.equal(c.drive, "Unknown");
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.range_km.value, null);
  }
  assert.ok(!rows.some((c) => c.model.includes("GLC") || c.model === "EQB"));
});
test("Mercedes charging conflicts cannot become canonical maxima", () => {
  assert.equal(get("CLA 200").facts.dc_peak_kw.value, null);
  assert.equal(get("CLA 200").facts.attributed_dc_table_kw.value, 200);
  assert.equal(get("EQS 400").facts.dc_peak_kw.value, null);
  assert.equal(get("EQS 400").facts.attributed_dc_table_kw.value, 330);
  for (const c of rows.filter(
    (c) => !["EQA 250+", "G 580 with EQ Technology"].includes(c.trim),
  ))
    assert.equal(c.facts.ac_kw.value, null);
  assert.equal(get("G 580 with EQ Technology").facts.ac_kw.value, 11);
  assert.ok(rows.every((c) => c.facts.dc_test_station_kw.value === null));
  assert.ok(
    rows.every((c) => c.facts.dc_charge_time_min.status === "conditional"),
  );
});
test("GLB seven-seat claim never supplies occupied-row cargo or an inherited battery warranty", () => {
  for (const trim of ["GLB 250+", "GLB 350 4MATIC"]) {
    const c = get(trim);
    assert.equal(c.facts.seats.value, 7);
    assert.equal(c.facts.boot_l.value, null);
    assert.equal(c.facts.battery_warranty_years.value, null);
    assert.equal(c.facts.battery_retention_pct.value, null);
  }
});
test("Mercedes usable energy and scoped warranty durations remain distinct", () => {
  assert.equal(get("CLA 200").facts.battery_kwh.value, 58);
  assert.equal(get("CLA 350 4MATIC").facts.battery_kwh.value, 85);
  const eqs = get("EQS 400");
  assert.equal(eqs.facts.battery_kwh.value, 112);
  assert.equal(eqs.facts.battery_warranty_years.value, 10);
  assert.equal(eqs.facts.battery_warranty_km.value, 250000);
  assert.ok(
    get("G 580 with EQ Technology").facts.battery_warranty.qualifications.some(
      (q) => q.includes("excludes commercial"),
    ),
  );
  assert.ok(rows.every((c) => c.facts.battery_gross_kwh.value === null));
});
