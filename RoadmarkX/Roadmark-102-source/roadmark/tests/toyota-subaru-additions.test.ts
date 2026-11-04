import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research } from "../src/lib/data";
import { rankAttribute, buildStrengthsIndex } from "../src/lib/discovery";
const cars = catalogue().filter((c) => ["Toyota", "Subaru"].includes(c.brand));
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
test("Toyota/Subaru exact versions preserve current and source-backed older stock", () => {
  assert.equal(cars.length, 15);
  assert.equal(cars.filter((c) => c.availability === "outgoing").length, 3);
  for (const c of cars.filter((c) => c.availability === "outgoing"))
    assert.equal(c.availabilityEvidence?.stockStatus, "new_stock_listed");
  for (const c of cars.filter((c) => c.brand === "Toyota"))
    assert.match(String(c.year), /unverified/);
  assert.equal(new Set(cars.map((c) => c.modelFamily || c.family)).size, 6);
});
test("electric Hilux NEDC and cab-chassis dimensions stay separate from passenger claims", () => {
  const utes = cars.filter((c) => c.model === "HiLux BEV");
  assert.equal(utes.length, 3);
  assert.deepEqual(
    utes.map((c) => c.facts.range_km.value),
    [245, 315, 315],
  );
  assert.ok(
    utes.every(
      (c) =>
        c.vehicleClass === "ute" && c.facts.range_km.basis === "NEDC combined",
    ),
  );
  assert.equal(
    utes.find((c) => c.trim.includes("Cab-Chassis"))!.facts.length_mm.status,
    "conditional",
  );
  const ranked = rankAttribute(
    catalogue(),
    research().sources,
    "range_km",
    policy,
  );
  assert.ok(
    ranked.groups
      .filter((g) => g.entries.some((e) => e.car.model === "HiLux BEV"))
      .every((g) => g.vehicleClass === "ute" && g.basis === "NEDC combined"),
  );
});
test("Toyota charging and tow classification gaps are unknown, not borrowed", () => {
  const bz = cars.find((c) => c.model === "bZ4X" && c.trim === "2WD")!;
  assert.equal(bz.facts.dc_charge_time_min.value, null);
  assert.equal(bz.facts.towing_braked_kg.value, null);
  assert.equal(bz.facts.towing_unclassified_kg.value, 750);
  assert.equal(bz.facts.battery_kwh.basis, "Gross battery capacity");
  for (const c of cars) assert.notEqual(c.facts.boot_l.status, "standard");
});
test("Uncharted roof option stays selectable without creating a new model family", () => {
  const current = cars.filter(
    (c) => c.model === "Uncharted" && c.year === 2027,
  );
  assert.equal(current.length, 2);
  assert.equal(new Set(current.map((c) => c.modelFamily)).size, 1);
  assert.equal(new Set(current.map((c) => c.id)).size, 2);
  assert.deepEqual(
    current.map((c) => c.facts.price_aud.value),
    [59990, 61190],
  );
  assert.ok(current.some((c) => c.trim.includes("Panoramic")));
  const trail = cars.filter((c) => c.model === "Trailseeker");
  assert.ok(
    [...buildStrengthsIndex(trail, research().sources, policy).values()].every(
      (s) => s.length === 0,
    ),
  );
});
