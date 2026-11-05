import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
const rows = catalogue().filter(
  (c) => c.brand === "Mercedes-Benz" && c.vehicleClass === "passenger",
);
const get = (trim: string) => rows.find((c) => c.trim === trim)!;
const ORIGINAL_IDS = [
  "mercedes_benz_eqa_current__eqa_250_plus__20261010",
  "mercedes_benz_cla_electric_current__cla_200__20261010",
  "mercedes_benz_cla_electric_current__cla_350_4matic__20261010",
  "mercedes_benz_glb_electric_current__glb_250_plus__20261010",
  "mercedes_benz_glb_electric_current__glb_350_4matic__20261010",
  "mercedes_benz_eqs_current__eqs_400__20261010",
  "mercedes_benz_g_class_electric_current__g_580_with_eq_technology__20261010",
];
// Added by the dated 15 October packet (data/m1-brand-updates/mercedes-benz-2026-10-15.json).
const ADDED_20261015_IDS = [
  "mercedes_benz_glc_electric_current__glc_400_4matic__20261015",
  "mercedes_benz_evito_tourer_current__129_mid_mwb__20261015",
  "mercedes_benz_eqa_city_edition__eqa_250_plus_city_edition__20261015",
  "mercedes_benz_eqb_city_edition__eqb_250_plus_city_edition__20261015",
];
const PACKET = "m1-mercedes-benz-2026-10-15";
const original = rows.filter((c) => ORIGINAL_IDS.includes(c.id));
test("Mercedes keeps its seven original manufacturer-listed records and exactly the four 15 October additions, without stock or MY claims", () => {
  assert.deepEqual(
    rows.map((c) => c.id).sort(),
    [...ORIGINAL_IDS, ...ADDED_20261015_IDS].sort(),
  );
  assert.equal(new Set(original.map((c) => c.modelFamily)).size, 5);
  for (const c of rows) {
    assert.equal(c.year, null);
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
  }
  // Price and range now exist only as dated, sourced, values with a packet-earned grade.
  for (const c of original) {
    for (const key of ["price_aud", "range_km"] as const) {
      const f = c.facts[key];
      if (f.value === null) continue;
      assert.ok(
        f.sourceIds.every((id: string) => id.startsWith(PACKET)),
        `${c.trim} ${key} must cite the 15 October packet`,
      );
      assert.equal(
        f.gradeReview?.overlayId,
        PACKET,
        `${c.trim} grade must be earned in the packet`,
      );
    }
  }
});
test("Mercedes charging conflicts cannot become canonical maxima", () => {
  assert.equal(get("CLA 200").facts.attributed_dc_table_kw.value, 200);
  assert.equal(get("EQS 400").facts.attributed_dc_table_kw.value, 330);
  // A canonical DC maximum on an original record must come from the dated 15 October packet and be an earned packet grade, not a legacy status.
  for (const c of original) {
    const f = c.facts.dc_peak_kw;
    if (f.value === null) continue;
    assert.ok(f.sourceIds.every((id: string) => id.startsWith(PACKET)));
    assert.equal(
      f.gradeReview?.overlayId,
      PACKET,
      `${c.trim} grade must be earned in the packet`,
    );
  }
  assert.equal(get("G 580 with EQ Technology").facts.ac_kw.value, 11);
  assert.ok(original.every((c) => c.facts.dc_test_station_kw.value === null));
  assert.ok(
    original.every((c) =>
      ["conditional", "standard"].includes(c.facts.dc_charge_time_min.status),
    ),
  );
});
test("GLB seven-seat claim never supplies occupied-row cargo or an inherited battery warranty", () => {
  for (const trim of ["GLB 250+", "GLB 350 4MATIC"]) {
    const c = get(trim);
    assert.equal(c.facts.seats.value, 7);
    assert.equal(c.facts.boot_l.value, null);
    // Battery warranty is now a version-scoped value from the dated 15 October passenger-warranty source, not an inherited one.
    assert.equal(c.facts.battery_warranty_years.value, 8);
    assert.ok(
      c.facts.battery_warranty_years.scope.includes("GLB"),
      "warranty scope names the GLB version",
    );
    assert.ok(
      c.facts.battery_warranty_years.sourceIds.every((id: string) =>
        id.startsWith(PACKET),
      ),
    );
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
      (q) => /commercial.*exclud/i.test(q),
    ),
  );
  assert.ok(original.every((c) => c.facts.battery_gross_kwh.value === null));
});
