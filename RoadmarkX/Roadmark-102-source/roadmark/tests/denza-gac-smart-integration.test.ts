import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { catalogue, research } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import { attributes, rankAttribute } from "../src/lib/discovery";
import fixture from "../qa/denza-gac-smart-integration-fixture.json";
const all = catalogue();
const cars = fixture.map((f) => {
  const c = all.find((x) => x.id === f.id);
  assert.ok(c);
  return c;
});
const hash = (x: unknown) =>
  createHash("sha256").update(JSON.stringify(x)).digest("hex");
test("fifteen exact DGS identities preserve all 3136 effective facts and scoped availability", () => {
  assert.equal(cars.length, 15);
  assert.equal(
    cars.reduce((n, c) => n + Object.keys(c.facts).length, 0),
    3136,
  );
  for (const [i, c] of cars.entries()) {
    assert.equal(hash(c.facts), fixture[i].factsSHA256);
    assert.equal(c.year, fixture[i].year);
    assert.equal(c.availabilityEvidence?.stockStatus, fixture[i].stockStatus);
  }
  assert.equal(cars.filter((c) => c.year === null).length, 13);
  assert.equal(
    cars.filter(
      (c) => c.availabilityEvidence?.stockStatus === "new_stock_listed",
    ).length,
    2,
  );
});
test("DGS exact source copy and all 103 visible conditions survive shared runtime loading", () => {
  for (const [i, c] of cars.entries()) {
    assert.ok(c.buyerSummary?.strength && c.buyerSummary?.tradeoff);
    assert.equal(c.buyerSummary.strength.text, fixture[i].strength.text);
    assert.equal(c.buyerSummary.tradeoff.text, fixture[i].tradeoff.text);
    assert.deepEqual(c.buyerSummary.conditions, fixture[i].conditions);
  }
  assert.equal(
    fixture.reduce((n, f) => n + f.conditions.length, 0),
    103,
  );
});
test("GAC unknown model year is identity-guarded without inventing fact citations", () => {
  const gac = cars.filter((c) => c.brand === "GAC");
  assert.equal(gac.length, 4);
  for (const c of gac) {
    assert.equal(c.year, null);
    assert.equal(c.facts.model_year.status, "not_verified");
    assert.deepEqual(c.facts.model_year.sourceIds, []);
    const record = buyerProposal.records.find((r) => r.variantId === c.id)!;
    const dep = buyerProposal.dependencies.find(
      (d) => d.id === record.modelYearDependency,
    )!;
    assert.equal(dep.kind, "variant_property");
    assert.equal(dep.expectedValue, null);
    assert.ok(
      dep.sourceIds.every((id) => /^r10_dgs_gac_(ut|v)_config$/.test(id)),
    );
    assert.equal(c.availabilityEvidence?.stockStatus, "unverified");
  }
});
test("conditional DGS declarations never create attribute leaders or canonical price claims", () => {
  for (const c of cars) assert.equal(c.facts.price_aud.value, null);
  for (const a of attributes)
    assert.equal(
      rankAttribute(cars, research().sources, a.key, {
        asOf: "2026-10-10",
        maxAgeDays: 30,
      }).groups.length,
      0,
    );
});
test("DGS cross-grade comparisons retain seventeen exact related identities", () => {
  const ids = new Set(cars.map((c) => c.id));
  const records = buyerProposal.records.filter((r) => ids.has(r.variantId));
  assert.equal(
    records.reduce(
      (n, r) => n + Object.keys(r.expectedRelatedIdentities || {}).length,
      0,
    ),
    17,
  );
  for (const r of records) {
    assert.ok(r.expectedIdentity && r.expectedAvailabilityEvidence);
    assert.ok(r.availabilityGuardSourceIds?.length);
  }
});
