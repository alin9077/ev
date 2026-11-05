import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  sourceEffectiveFeatures,
  catalogue as currentCatalogue,
  research as currentResearch,
} from "../src/lib/data";
import { rankAttribute } from "../src/lib/discovery";
// Preserve the original admission contract; the final availability test uses current graded cars.
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
    assert.ok(
      sourceEffectiveFeatures(c, research()).every(
        (f) => f.status === "not_verified",
      ),
    );
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
test("older availability leaves fresh current-sale range ranked but never revives withdrawn or outgoing stock", () => {
  const current = currentCatalogue().find((car) => car.id === cars[0].id)!;
  const policy = { asOf: "2026-11-05" };
  assert.equal(current.buyerGradesRequired, true);
  const stale = {
    ...current,
    availabilityEvidence: {
      ...current.availabilityEvidence!,
      checkedAt: "2026-08-01",
    },
  };
  const sources = currentResearch().sources;
  const result = rankAttribute([stale], sources, "range_km", policy);
  assert.equal(result.groups[0].entries[0].car.id, stale.id);
  assert.equal(
    result.groups[0].entries[0].fact.value,
    stale.facts.range_km.value,
  );
  assert.equal(
    result.groups[0].entries[0].car.availabilityEvidence?.checkedAt,
    "2026-08-01",
  );
  const withdrawn = { ...stale, availability: "not_current" };
  assert.equal(
    rankAttribute([withdrawn], sources, "range_km", policy).groups.length,
    0,
  );
  const outgoing = {
    ...stale,
    availability: "outgoing",
    availabilityEvidence: {
      ...stale.availabilityEvidence,
      stockStatus: "new_stock_listed",
    },
  };
  assert.equal(
    rankAttribute([outgoing], sources, "range_km", policy).groups.length,
    0,
  );
});
