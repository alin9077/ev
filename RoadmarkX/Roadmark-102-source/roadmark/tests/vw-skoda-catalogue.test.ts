import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
const cars = catalogue();
// Freeze this earlier six-model batch; later MY26 Buzz builds have their own tests.
const batchModels = new Set([
  "volkswagen_id_4_my27", "volkswagen_id_5_my26", "skoda_elroq_my27",
  "skoda_enyaq_suv_my27", "skoda_enyaq_coupe_my27", "volkswagen_id_buzz_cargo_my25",
]);
const batch = cars.filter((c) => batchModels.has(c.modelId));
const find = (prefix: string, trim: string) =>
  batch.find((c) => c.modelId === prefix && c.trim === trim)!;
test("VW and Skoda preserve eleven current configurations and one outgoing NEW van", () => {
  assert.equal(batch.length, 12);
  assert.equal(
    batch.filter((c) => c.availability === "current_or_order_listed").length,
    11,
  );
  const old = batch.find((c) => c.availability === "outgoing")!;
  assert.equal(old.year, 2025);
  assert.equal(old.vehicleClass, "van");
  assert.equal(old.availabilityEvidence?.stockStatus, "new_stock_listed");
  assert.ok(!batch.some((c) => c.model === "ID. Buzz" || c.brand === "CUPRA"));
});
test("ID4 and ID5 Pro/GTX battery pairs never inherit each other's usable or gross capacity", () => {
  for (const [model, trim, gross, usable] of [
    ["volkswagen_id_4_my27", "Pro", 84, 79],
    ["volkswagen_id_4_my27", "GTX", 82, 77],
    ["volkswagen_id_5_my26", "Pro", 82, 77],
    ["volkswagen_id_5_my26", "GTX", 84, 79],
  ] as const) {
    const c = find(model, trim);
    assert.ok(c, model + trim);
    assert.equal(c.facts.battery_gross_kwh.value, gross);
    assert.equal(c.facts.battery_kwh.value, usable);
  }
});
test("Enyaq price conflicts remain null while verified offers expire independently", () => {
  for (const [model, trim] of [
    ["skoda_enyaq_suv_my27", "Select 60"],
    ["skoda_enyaq_suv_my27", "Sportline 85"],
    ["skoda_enyaq_coupe_my27", "Sportline 85"],
  ]) {
    assert.equal(find(model, trim).facts.driveaway_price_aud.value, null);
  }
  const offer = find("volkswagen_id_4_my27", "Pro").facts.driveaway_price_aud;
  assert.equal(offer.value, 65990);
  assert.equal(offer.status, "conditional");
  assert.equal(offer.validUntil, "2026-12-31");
  assert.ok(batch.every((c) => c.facts.price_aud.value === null));
});
test("cargo methods, standard seating gaps and the outgoing van keep their scope", () => {
  assert.equal(
    find("skoda_elroq_my27", "Select 60").facts.boot_l.status,
    "standard",
  );
  assert.equal(
    find("volkswagen_id_4_my27", "Pro").facts.boot_l.status,
    "conditional",
  );
  for (const c of batch.filter((c) => c.vehicleClass === "passenger"))
    assert.equal(c.facts.seats.value, null);
  const van = batch.find((c) => c.vehicleClass === "van")!;
  assert.equal(van.facts.seats.value, 3);
  assert.equal(van.facts.boot_l.value, null);
  assert.equal(van.facts.ac_kw.value, null);
  assert.equal(van.facts.torque_nm.value, null);
});
test("Skoda July-production applicability and separate Coupe identities remain visible", () => {
  const suv = find("skoda_enyaq_suv_my27", "RS"),
    coupe = find("skoda_enyaq_coupe_my27", "RS");
  assert.notEqual(suv.modelFamily, coupe.modelFamily);
  assert.equal(suv.facts.boot_l.value, 585);
  assert.equal(coupe.facts.boot_l.value, 570);
  assert.ok(
    suv.availabilityEvidence?.qualifications?.some((q) => q.includes("June")),
  );
  assert.equal(coupe.availabilityEvidence?.stockStatus, "unverified");
  assert.equal(suv.facts.dc_peak_kw.value, 165);
});
