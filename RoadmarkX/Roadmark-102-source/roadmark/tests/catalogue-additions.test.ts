import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
const cars = catalogue();
const added = cars.filter(
  (c) =>
    c.brand === "BYD" &&
    ["SEAL", "DOLPHIN"].includes(c.model) &&
    c.id.endsWith("__20261010"),
);
test("BYD additions preserve exact four trims and unknown model years", () => {
  assert.equal(added.length, 4);
  for (const c of added) {
    assert.equal(c.year, "Model year unverified");
    assert.equal(c.facts.towing_braked_kg.value, null);
    assert.equal(c.facts.price_aud.status, "conditional");
    assert.equal(c.facts.boot_l.status, "conditional");
    assert.equal(pack(c.id).features.length, research().criteria.length);
    assert.ok(pack(c.id).features.some((f) => f.status === "not_verified"));
  }
});
test("WLTP additions rank; cargo and formal-price uncertainty cannot enter ranks", () => {
  const sources = research().sources,
    policy = { asOf: "2026-10-10", maxAgeDays: 30 };
  const range = rankAttribute(added, sources, "range_km", policy);
  assert.equal(range.groups.length, 1);
  assert.deepEqual(
    range.groups[0].entries.map((x) => x.fact.value),
    [570, 520, 427, 340],
  );
  for (const key of ["price_aud", "boot_l", "towing_braked_kg"] as const)
    assert.equal(rankAttribute(added, sources, key, policy).groups.length, 0);
  assert.equal(
    added.find((c) => c.model === "DOLPHIN" && c.trim.startsWith("Essential"))!
      .facts.price_aud.value,
    29990,
  );
});
