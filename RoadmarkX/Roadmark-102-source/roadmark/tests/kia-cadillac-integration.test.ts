import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research } from "../src/lib/data";
import { attributes, rankAttribute } from "../src/lib/discovery";
import { comparisonFactLabel, formatFact } from "../src/lib/compare";
import { offerExpired } from "../src/lib/fact-validity";
import stage from "../data/research-pending/kia-cadillac-staged-delta.json";
const all = catalogue();
const cars = stage.variants.map((v) => {
  const c = all.find((c) => c.id === v.id);
  assert.ok(c);
  return c;
});
const sources = research().sources;
test("ten Kia/Cadillac configurations preserve exact model-year and availability boundaries", () => {
  assert.equal(cars.length, 10);
  assert.equal(new Set(cars.map((c) => c.modelFamily)).size, 4);
  const provisional = cars.filter((c) => c.id.startsWith("kia_ev4_my27"));
  assert.equal(provisional.length, 3);
  for (const c of provisional) {
    assert.equal(c.year, 2027);
    assert.equal(c.availability, "announced_provisional");
    assert.equal(c.buyerSummary, undefined);
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
  }
  for (const c of cars.filter((c) => c.id.startsWith("kia_ev4_my26"))) {
    assert.equal(c.year, 2026);
    assert.equal(c.availabilityEvidence?.stockStatus, "new_stock_listed");
  }
  for (const c of cars) {
    assert.equal(c.facts.price_aud.value, null);
    assert.equal(c.availabilityEvidence?.orderStatus, "listed_unconfirmed");
  }
});
test("all 2983 Kia/Cadillac fact projections retain exact values, qualifications and sources", () => {
  assert.equal(stage.facts.length, 2983);
  const known = new Set(sources.map((s) => s.id));
  for (const row of stage.facts) {
    const c = cars.find((c) => c.id === row.variantId)!;
    const f = c.facts[row.key];
    assert.ok(f, `${c.id}:${row.key}`);
    assert.deepEqual(f.value, row.value);
    assert.equal(f.status, row.status);
    assert.equal(f.unit, row.unit);
    assert.equal(f.comparisonBasis, row.comparisonBasis);
    assert.deepEqual(f.sourceIds, row.sourceIds);
    for (const q of row.qualifications) assert.ok(f.qualifications.includes(q));
    assert.ok(f.sourceIds.every((id) => known.has(id)));
  }
});
test("conditional Kia/Cadillac declarations create no attribute ranking groups", () => {
  for (const a of attributes)
    assert.equal(
      rankAttribute(cars, sources, a.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups.length,
      0,
      a.key,
    );
  assert.equal(stage.features.length, 0);
});
test("OPTIQ dated drive-away campaign remains separate and expires before 31 October", () => {
  const c = cars.find((c) => c.id.startsWith("cadillac_optiq"))!;
  const f = c.facts.current_driveaway_campaign;
  assert.equal(f.value, 85000);
  assert.equal(f.status, "conditional");
  assert.equal(f.validUntil, "2026-10-30");
  assert.equal(offerExpired(f, "2026-10-30"), false);
  assert.equal(offerExpired(f, "2026-10-31"), true);
  assert.equal(c.facts.price_aud.value, null);
});

test("all six Kia source offers expire after 31 October without establishing model-year price", () => {
  for (const c of cars.filter((c) => c.brand === "Kia")) {
    const f = c.facts.source_current_grade_offer_declared;
    assert.equal(f.validUntil, "2026-10-31");
    assert.equal(offerExpired(f, "2026-10-31"), false);
    assert.equal(offerExpired(f, "2026-11-01"), true);
    assert.equal(c.facts.price_aud.value, null);
  }
});

test("mixed cargo methods and model years receive neutral shared headings", () => {
  const ev4 = cars.find((c) => c.id.startsWith("kia_ev4_my27_air"))!;
  const vistiq = cars.find((c) => c.id.startsWith("cadillac_vistiq"))!;
  const lyriq = cars.find((c) => c.id.startsWith("cadillac_lyriq_my27_sport"))!;
  const optiq = cars.find((c) => c.id.startsWith("cadillac_optiq"))!;
  assert.equal(
    comparisonFactLabel("boot_l", [ev4.facts.boot_l, vistiq.facts.boot_l]),
    "Cargo behind occupied seats",
  );
  assert.equal(
    comparisonFactLabel("price_aud", [
      lyriq.facts.price_aud,
      optiq.facts.price_aud,
    ]),
    "Current exact-model-year price",
  );
  assert.equal(formatFact(ev4.facts.source_model_year), "2027");
  assert.equal(formatFact({ value: 7, unit: "year" }), "7 year");
});

test("mixed acceleration modes and normalized model-year labels stay unambiguous", () => {
  const v = cars.find((c) => c.id.startsWith("cadillac_lyriq_my27_v"))!;
  const sport = cars.find((c) => c.id.startsWith("cadillac_lyriq_my27_sport"))!;
  assert.equal(
    comparisonFactLabel("zero_to_100_s", [
      v.facts.zero_to_100_s,
      sport.facts.zero_to_100_s,
    ]),
    "Published 0–100 km/h claim",
  );
  assert.equal(formatFact(sport.facts.model_year), "2027");
});
