import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue().filter((c) =>
  c.id.startsWith("hyundai_ioniq_5_my27__"),
);
test("Regular IONIQ 5 retains its three exact MY27 grades separately from N and other Hyundai models", () => {
  assert.equal(cars.length, 3);
  assert.deepEqual(
    cars.map((c) => c.facts.price_aud.value),
    [68200, 73200, 83700],
  );
  assert.deepEqual(
    cars.map((c) => c.facts.range_km.value),
    [570, 530, 495],
  );
  assert.deepEqual(
    cars.map((c) => c.drive),
    ["RWD", "RWD", "AWD"],
  );
  for (const c of cars) {
    assert.equal(c.year, 2027);
    assert.equal(c.facts.seats.value, 5);
    assert.equal(c.facts.price_aud.status, "standard");
    assert.equal(c.facts.driveaway_price_aud.status, "conditional");
    assert.ok(pack(c.id).features.some((f) => f.status === "not_verified"));
    assert.ok(pack(c.id).features.some((f) => f.status !== "not_verified"));
  }
});
test("Hyundai never substitutes charger rating, usable battery or cargo loading assumptions", () => {
  for (const c of cars) {
    assert.equal(c.facts.dc_peak_kw.value, null);
    assert.equal(c.facts.dc_charge_time_min.value, 18);
    assert.equal(c.facts.battery_kwh.status, "conditional");
    assert.equal(c.facts.boot_l.status, "conditional");
    assert.match(c.facts.boot_l.basis, /unverified/);
  }
  assert.equal(
    rankAttribute(cars, research().sources, "boot_l", {
      asOf: "2026-10-10",
      maxAgeDays: 30,
    }).groups.length,
    0,
  );
});

test("manufacturer maximum braked towing compares with existing equivalent claims", () => {
  const result = rankAttribute(
    catalogue(),
    research().sources,
    "towing_braked_kg",
    { asOf: "2026-10-10", maxAgeDays: 30 },
  );
  const cohort = result.groups.find((g) =>
    g.entries.some((e) => e.car.brand === "Hyundai"),
  )!;
  assert.ok(cohort.entries.some((e) => e.car.brand === "Tesla"));
  assert.equal(cohort.basis, "Maximum braked towing");
});
