import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
const batch = catalogue().filter((c) => ["Audi", "Porsche"].includes(c.brand));
const get = (trim: string) => batch.find((c) => c.trim === trim)!;
test("Audi Porsche preserves32 current configurations and eight distinct body families", () => {
  assert.equal(batch.length, 32);
  assert.equal(batch.filter((c) => c.brand === "Audi").length, 7);
  assert.equal(new Set(batch.map((c) => c.modelFamily)).size, 8);
  assert.ok(
    batch.every(
      (c) =>
        c.availabilityEvidence?.stockStatus === "unverified" &&
        c.availabilityEvidence?.orderStatus === "listed_unconfirmed",
    ),
  );
  assert.ok(batch.every((c) => c.facts.price_aud.value === null));
  assert.ok(
    !batch.some((c) => c.model.includes("Q4") || c.model.includes("Q8")),
  );
  assert.equal(
    batch.filter((c) => c.modelFamily === "porsche-cayenne-coup-electric")
      .length,
    3,
  );
});
test("Taycan standard battery branches never inherit optional battery maxima", () => {
  for (const trim of ["Taycan", "Taycan 4"]) {
    const c = get(trim);
    assert.equal(c.facts.battery_gross_kwh.value, 89);
    assert.equal(c.facts.battery_kwh.value, 82.3);
    assert.equal(c.facts.dc_peak_kw.value, 270);
  }
  assert.equal(get("Taycan 4S").facts.battery_gross_kwh.value, 105);
  assert.equal(get("Taycan 4S").facts.battery_kwh.value, 97);
  assert.equal(get("Taycan 4S").facts.dc_peak_kw.value, 320);
  assert.equal(get("Taycan Turbo GT").facts.seats.value, 4);
  assert.equal(
    get("Taycan Turbo GT with Weissach Package").facts.seats.value,
    2,
  );
});
test("Audi current GT range is ADR while Porsche VehicleHigh remains separate", () => {
  assert.equal(get("S e-tron GT").facts.range_km.value, 558);
  assert.match(get("S e-tron GT").facts.range_km.basis, /ADR/);
  assert.ok(
    batch
      .filter((c) => c.brand === "Porsche")
      .every((c) => c.facts.range_km.value === null),
  );
  assert.ok(
    batch
      .filter((c) => c.brand === "Porsche")
      .every(
        (c) => c.facts.range_wltp_vehicle_high_km.status === "conditional",
      ),
  );
  assert.equal(get("RS e-tron GT").facts.power_launch_control_kw.value, 630);
  assert.ok(
    batch.every((c) => c.facts.dc_charge_time_min.status === "conditional"),
  );
});
test("Macan audio cargo and Cayenne hitch/400kW options do not become generic claims", () => {
  assert.equal(get("Macan Electric").facts.battery_kwh.value, null);
  assert.equal(get("Macan Electric").facts.boot_l.value, null);
  assert.ok(
    batch
      .filter((c) => c.model === "Macan Electric")
      .every((c) => c.facts.ac_kw.value === 22),
  );
  const coupe = get("Cayenne Coupé Electric");
  assert.equal(coupe.facts.dc_peak_kw.value, null);
  assert.equal(coupe.facts.dc_conditional_peak_kw.value, 400);
  assert.equal(coupe.facts.dc_conditional_peak_kw.status, "conditional");
  assert.equal(coupe.facts.seats.status, "conditional");
  assert.ok(
    batch
      .filter((c) => c.model.startsWith("Cayenne"))
      .every((c) => c.facts.towing_braked_kg.value === null),
  );
});
test("model year, production scope, test station and warranty stages stay independent", () => {
  for (const c of batch.filter((c) => c.brand === "Audi")) {
    assert.equal(c.year, 2026);
    assert.ok(c.facts.production_revision.value);
    assert.equal(c.facts.seats.value, null);
  }
  for (const c of batch.filter((c) => c.brand === "Porsche")) {
    assert.equal(c.year, 2027);
    assert.equal(c.facts.warranty_years.value, 3);
    assert.equal(c.facts.battery_warranty_years.value, 8);
    assert.equal(c.facts.battery_retention_schedule.status, "conditional");
  }
  assert.ok(batch.every((c) => c.facts.dc_test_station_kw.value === null));
  assert.equal(get("Q6 e-tron").facts.battery_kwh.value, 75.8);
  assert.equal(get("SQ6 e-tron").facts.battery_kwh.value, 94.9);
});
