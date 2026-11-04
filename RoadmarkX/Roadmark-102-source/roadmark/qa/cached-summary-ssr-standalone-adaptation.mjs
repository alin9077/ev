// Pure date/expiry and actual component SSR regressions; run alongside tests/*.test.ts with node --import tsx --test.
// Pure library + component SSR fixtures only; no src/lib/data import.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
} from "../src/lib/selling-points.ts";
import { buyerSummaryNeedsClock } from "../src/lib/buyer-summary-timing.ts";
import { australianEvidenceDate } from "../src/lib/evidence-date.ts";
import { BuyerSummary } from "../src/components/buyer-summary.tsx";
import DiscoveryModule from "../src/components/discovery.tsx";
const Discovery =
  typeof DiscoveryModule === "function"
    ? DiscoveryModule
    : DiscoveryModule.default;
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
const source = {
  id: "s",
  url: "https://example.com",
  accessed_date: "2026-10-10",
};
const sources = [source];
const fact = (key, value, validUntil) => ({
  key,
  label: key,
  value,
  status: "standard",
  unit: "km",
  basis: "same",
  comparisonBasis: "same",
  market: "AU",
  scope: "exact",
  qualifications: [],
  issues: [],
  sourceIds: ["s"],
  date: "2026-10-10",
  ...(validUntil !== undefined ? { validUntil } : {}),
});
const car = (id, facts) => ({
  id,
  modelId: id,
  modelFamily: id,
  family: id,
  slug: id,
  brand: "Test",
  model: id,
  trim: "Test trim",
  year: 2026,
  drive: "RWD",
  generation: "Test",
  availability: "current_or_order_listed",
  facts,
  issues: [],
});
function fixture() {
  const cars = [
    car("c", {
      a: fact("a", 300, "2026-10-15"),
      b: fact("b", 200),
      year: fact("year", 2026),
    }),
    car("related", {
      a: fact("a", 200, "2026-10-12"),
      unconsumed: fact("unconsumed", 111, "2026-10-11"),
    }),
  ];
  const dep = (id, variantId, key) => {
    const f = cars.find((x) => x.id === variantId).facts[key];
    return {
      id,
      kind: "fact",
      variantId,
      key,
      expectedValue: f.value,
      expectedStatus: f.status,
      expectedUnit: f.unit,
      expectedBasis: f.basis,
      expectedQualifications: f.qualifications,
      expectedEffectiveFact: structuredClone(f),
      sourceIds: ["s"],
      checkedAt: "2026-10-10",
    };
  };
  const proposal = {
    expectedSourceSnapshots: [source],
    dependencies: [
      dep("a", "c", "a"),
      dep("ra", "related", "a"),
      dep("b", "c", "b"),
      dep("u", "related", "unconsumed"),
      dep("my", "c", "year"),
    ],
    records: [
      {
        variantId: "c",
        checkedAt: "2026-10-10",
        modelYearDependency: "my",
        requiredVisibleConditions: ["Keep exact-variant scope"],
        strength: {
          label: "difference",
          text: "UNIQUE_TIMED_BUYER_COPY",
          dependencyIds: ["a", "ra"],
          derivations: [
            {
              a: "a",
              b: "ra",
              operation: "a - b",
              expectedResult: 100,
              unit: "km",
            },
          ],
        },
        tradeoff: {
          label: "independent",
          text: "UNIQUE_UNTIMED_BUYER_COPY",
          dependencyIds: ["b"],
        },
      },
    ],
  };
  const setDeadline = (id, deadline) => {
    const dep = proposal.dependencies.find((d) => d.id === id);
    const f = cars.find((c) => c.id === dep.variantId).facts[dep.key];
    if (deadline === undefined) delete f.validUntil;
    else f.validUntil = deadline;
    dep.expectedEffectiveFact = structuredClone(f);
  };
  const build = (asOf = policy.asOf) =>
    buildBuyerSummaries(cars, [], sources, proposal, { ...policy, asOf }).get(
      "c",
    );
  return { cars, proposal, setDeadline, build };
}
test("earliest own/related consumed fact deadline; unconsumed deadline ignored", () => {
  const s = fixture().build();
  assert.equal(s.strength.validUntil, "2026-10-12");
  assert.equal(s.tradeoff.validUntil, undefined);
});
test("deadline inclusive; expired clause removed independently with visible conditions retained", () => {
  const s = fixture().build();
  assert.ok(
    currentBuyerSummary(s, sources, { ...policy, asOf: "2026-10-12" }).strength,
  );
  const after = currentBuyerSummary(s, sources, {
    ...policy,
    asOf: "2026-10-13",
  });
  assert.equal(after.strength, undefined);
  assert.deepEqual(after.tradeoff, s.tradeoff);
  assert.deepEqual(after.conditions, s.conditions);
});
test("fact-kind model-year deadline guards both cached clauses", () => {
  const f = fixture();
  f.setDeadline("my", "2026-10-11");
  const s = f.build();
  assert.equal(s.strength.validUntil, "2026-10-11");
  assert.equal(s.tradeoff.validUntil, "2026-10-11");
  assert.equal(
    currentBuyerSummary(s, sources, { ...policy, asOf: "2026-10-12" }),
    undefined,
  );
  assert.equal(f.build("2026-10-12"), undefined);
});
test("malformed effective fact deadlines fail closed before projection", () => {
  for (const deadline of ["", null, false, 0, 42, "invalid", "2026-02-30"]) {
    const f = fixture();
    f.setDeadline("a", deadline);
    assert.equal(f.build()?.strength, undefined, JSON.stringify(deadline));
    assert.ok(f.build()?.tradeoff);
  }
});
test("malformed cached deadlines fail closed", () => {
  for (const deadline of ["", null, false, 0, 42, "invalid", "2026-02-30"]) {
    const s = fixture().build();
    s.strength.validUntil = deadline;
    delete s.tradeoff;
    assert.equal(
      currentBuyerSummary(s, sources, policy),
      undefined,
      JSON.stringify(deadline),
    );
  }
});
test("source holds and changed source snapshots still suppress", () => {
  const s = fixture().build();
  assert.equal(
    currentBuyerSummary(s, [{ ...source, publication_hold: true }], policy),
    undefined,
  );
  assert.equal(
    currentBuyerSummary(s, [{ ...source, title: "changed" }], policy),
    undefined,
  );
});
test("actual BuyerSummary static HTML withholds all clock-dependent copy", () => {
  for (const deadline of ["2026-10-12", "", null, false, 0, 42]) {
    const s = fixture().build();
    s.strength.validUntil = deadline;
    assert.equal(buyerSummaryNeedsClock(s), true);
    const html = renderToStaticMarkup(
      React.createElement(BuyerSummary, { car: { buyerSummary: s }, sources }),
    );
    assert.equal(html, "", JSON.stringify(deadline));
  }
});
test("actual BuyerSummary static HTML preserves untimed editorial copy", () => {
  const f = fixture();
  f.setDeadline("a", undefined);
  f.setDeadline("ra", undefined);
  const s = f.build();
  const html = renderToStaticMarkup(
    React.createElement(BuyerSummary, { car: { buyerSummary: s }, sources }),
  );
  assert.ok(html.includes("UNIQUE_UNTIMED_BUYER_COPY"));
  assert.ok(html.includes("UNIQUE_TIMED_BUYER_COPY"));
});
test("actual Discovery SSR never substitutes a timed ranking fallback", () => {
  const price = (value, deadline) => ({
    ...fact("price_aud", value, deadline),
    unit: "AUD",
    basis: "driveaway",
    comparisonBasis: "driveaway",
  });
  const cars = [
    car("A", { price_aud: price(39991, "2026-10-12") }),
    car("B", { price_aud: price(59992, undefined) }),
  ];
  cars[0].buyerSummary = fixture().build();
  const html = renderToStaticMarkup(
    React.createElement(Discovery, { cars, sources }),
  );
  assert.ok(!html.includes("UNIQUE_TIMED_BUYER_COPY"));
  assert.ok(!html.includes("39,991"));
  assert.ok(!html.includes("59,992"));
  assert.ok(!html.includes("#1 of 2"));
});
test("Sydney date is independent of UTC date and handles summer/winter + invalid dates", () => {
  assert.equal(
    australianEvidenceDate(new Date("2026-01-10T12:59:59Z")),
    "2026-01-10",
  );
  assert.equal(
    australianEvidenceDate(new Date("2026-01-10T13:00:00Z")),
    "2026-01-11",
  );
  assert.equal(
    australianEvidenceDate(new Date("2026-07-10T13:59:59Z")),
    "2026-07-10",
  );
  assert.equal(
    australianEvidenceDate(new Date("2026-07-10T14:00:00Z")),
    "2026-07-11",
  );
  assert.equal(australianEvidenceDate(new Date("invalid")), "");
});
