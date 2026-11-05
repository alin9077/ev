// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
} from "../src/lib/data";
import { rankAttribute, vehicleStrengths } from "../src/lib/discovery";
const cars = catalogue().filter((c) => c.model === "ATTO 1");
test("ATTO 1 preserves four-seat trims and unresolved current-order model year", () => {
  assert.equal(cars.length, 2);
  assert.deepEqual(
    cars.map((c) => c.facts.range_km.value),
    [220, 310],
  );
  assert.deepEqual(
    cars.map((c) => c.facts.dc_peak_kw.value),
    [65, 85],
  );
  for (const car of cars) {
    assert.equal(car.facts.seats.value, 4);
    assert.match(String(car.year), /unverified/i);
    assert.equal(car.facts.price_aud.status, "conditional");
    assert.equal(car.facts.towing_braked_kg.value, null);
  }
  assert.equal(cars[0].availabilityEvidence?.stockStatus, "unverified");
  assert.equal(cars[1].availabilityEvidence?.stockStatus, "new_stock_listed");
});
test("ATTO 1 contradictory charging, unspecified cargo and conditional prices cannot rank", () => {
  for (const attribute of [
    "dc_charge_time_min",
    "boot_l",
    "price_aud",
  ] as const) {
    assert.equal(
      rankAttribute(cars, research().sources, attribute, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups.length,
      0,
    );
  }
  assert.equal(cars[0].facts.driveaway_price_aud.value, 19990);
  assert.equal(cars[1].facts.driveaway_price_aud.value, null);
});

test("ATTO 1 compact-length strength preserves measurement cohorts and ties", () => {
  const strengths = vehicleStrengths(cars[0], catalogue(), research().sources, {
    asOf: "2026-10-10",
    maxAgeDays: 30,
  });
  const length = strengths.find((s) => s.attribute.key === "length_mm")!;
  assert.equal(length.rank, 1);
  assert.equal(length.tied, true);
  assert.equal(length.fact.value, 3990);
  assert.equal(length.basis, "Manufacturer exterior length");
  assert.ok(length.compared > 2);
  assert.match(length.attribute.note, /does not prove easier parking/);
});
