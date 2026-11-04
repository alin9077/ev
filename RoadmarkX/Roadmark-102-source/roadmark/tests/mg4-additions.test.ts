import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue().filter(
  (c) => c.brand === "MG" && c.model.startsWith("MG4"),
);
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
test("four current MG4 trims remain separate, exact MY26 and stock-evidenced", () => {
  assert.equal(cars.length, 4);
  assert.equal(new Set(cars.map((c) => c.family)).size, 2);
  for (const c of cars) {
    assert.equal(c.year, 2026);
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.facts.driveaway_price_aud.status, "conditional");
    assert.equal(c.availabilityEvidence?.stockStatus, "new_stock_listed");
    assert.ok(
      c.availabilityEvidence!.sourceIds.every((id) =>
        research().sources.some((s) => s.id === id),
      ),
    );
    assert.ok(pack(c.id).features.every((f) => f.status === "not_verified"));
  }
});
test("Urban cargo, charging and unknown manufacturer towing cannot inherit MSP data", () => {
  const urban = cars.filter((c) => c.model.includes("Urban"));
  for (const c of urban) {
    assert.equal(c.facts.boot_l.value, 382);
    assert.equal(c.facts.boot_l.status, "conditional");
    assert.equal(c.facts.towing_braked_kg.value, null);
  }
  assert.deepEqual(urban.map((c) => c.facts.dc_peak_kw.value).sort(), [82, 87]);
  assert.equal(
    rankAttribute(cars, research().sources, "boot_l", policy).groups.length,
    0,
  );
  assert.equal(
    rankAttribute(cars, research().sources, "price_aud", policy).groups.length,
    0,
  );
  assert.deepEqual(
    rankAttribute(
      cars,
      research().sources,
      "range_km",
      policy,
    ).groups[0].entries.map((e) => e.fact.value),
    [452, 405, 405, 316],
  );
});
test("expired availability independently removes otherwise current facts from rankings", () => {
  const stale = {
    ...cars[0],
    availabilityEvidence: {
      ...cars[0].availabilityEvidence!,
      checkedAt: "2026-08-01",
    },
  };
  assert.equal(
    rankAttribute([stale], research().sources, "range_km", policy).groups
      .length,
    0,
  );
});
