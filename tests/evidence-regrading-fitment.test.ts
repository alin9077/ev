import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FactValue, FeatureValue } from "../src/components/ui";
import { rankAttribute } from "../src/lib/discovery";
import { hasEarnedBuyerGrade } from "../src/lib/evidence-grading";
import {
  decideRetainedFactGrade,
  featureAsFact,
  type GradeDecision,
} from "../src/lib/evidence-regrade-policy";
import {
  applyEvidenceRegrading,
  applyFeatureRegrading,
  evidenceDigest,
  type RegradingOverlay,
} from "../src/lib/evidence-regrading";
import { readoutFor, specFor } from "../src/lib/scene-readout";
import { driveSceneB } from "../src/lib/scenes/b/drive";
import type { Car, Fact, Feature, Pack, Source } from "../src/lib/types";

const maker: Source = {
  id: "maker",
  url: "https://maker.example/au/specifications",
  title: "Australian version specifications",
  publisher: "Maker Australia",
  source_type: "manufacturer_primary_AU",
  market: "AU",
  published_date: null,
  accessed_date: "2026-10-10",
  supports: "Optional equipment for the named Australian version",
};
const sources = [maker];
const sourceIndex = new Map(sources.map((source) => [source.id, source]));
const optionalFact: Fact = {
  key: "towing_braked_kg",
  label: "Braked towing",
  value: 1600,
  unit: "kg",
  basis: "Braked trailer mass with the optional towing package",
  comparisonBasis: "Braked trailer mass",
  status: "optional",
  sourceIds: [maker.id],
  date: "2026-10-10",
  market: "AU",
  scope: "Exact Australian version",
  qualifications: ["The optional towing package costs extra."],
  issues: [],
};
const optionalFeature: Feature = {
  variant_id: "example",
  model_id: "example",
  criterion: "adas_optional",
  status: "optional",
  value: "Supervised assistance · A$149/month",
  conditions: "Optional paid subscription; the driver must supervise.",
  condition_label: "Paid option",
  source_ids: [maker.id],
  evidence_scope: "Exact Australian version",
  last_evidence_date: "2026-10-10",
  reviewed_date: "2026-10-10",
  verification_state: "verified",
};
const car = (fact = optionalFact): Car => ({
  id: "example",
  modelId: "example",
  model: "Example",
  family: "example",
  slug: "example",
  brand: "Maker",
  trim: "Base",
  generation: "Current",
  year: null,
  availability: "current_or_order_listed",
  drive: "RWD",
  facts: { [fact.key]: fact },
  issues: [],
  vehicleClass: "passenger",
});
function overlay(
  fact = optionalFact,
  feature = optionalFeature,
  decision?: GradeDecision,
): RegradingOverlay {
  return {
    id: "fitment-review",
    reviewedAt: "2026-10-13",
    standingNote: "Confirm the delivered specification before signing.",
    sourceDigests: { [maker.id]: evidenceDigest(maker) },
    facts: [
      {
        variantId: "example",
        key: fact.key,
        before: evidenceDigest(fact),
        ...decideRetainedFactGrade(fact, sourceIndex)!,
        ...decision,
      },
    ],
    features: [
      {
        variantId: "example",
        key: feature.criterion,
        before: evidenceDigest(feature),
        ...decideRetainedFactGrade(featureAsFact(feature), sourceIndex)!,
        ...decision,
      },
    ],
  };
}
function reviewed() {
  const review = overlay();
  const vehicle = applyEvidenceRegrading([car()], sources, review)[0];
  const features = applyFeatureRegrading(
    vehicle,
    [optionalFeature],
    sources,
    review,
  );
  return { vehicle, features };
}

test("earned Check grades keep paid equipment optional and leave retained evidence immutable", () => {
  const before = structuredClone({ optionalFact, optionalFeature, maker });
  const { vehicle, features } = reviewed();
  const fact = vehicle.facts.towing_braked_kg;
  const feature = features[0];
  for (const claim of [fact, feature]) {
    assert.equal(claim.status, "optional");
    assert.equal(claim.buyerGrade, "check");
    assert.equal(hasEarnedBuyerGrade(claim, sources, "2026-10-13"), true);
  }
  assert.deepEqual(fact.qualifications, optionalFact.qualifications);
  assert.equal(feature.conditions, optionalFeature.conditions);
  assert.equal(feature.condition_label, "Paid option");
  assert.equal(fact.date, optionalFact.date);
  assert.equal(feature.last_evidence_date, optionalFeature.last_evidence_date);
  assert.deepEqual({ optionalFact, optionalFeature, maker }, before);
});

test("a grade records confidence without overwriting optional, unavailable or inapplicable fitment", () => {
  for (const status of ["optional", "unavailable", "not_applicable"] as const) {
    for (const grade of [
      "confirmed",
      "check",
      "reported",
      "not_published",
    ] as const) {
      const fact = { ...optionalFact, status };
      const feature = { ...optionalFeature, status };
      const review = overlay(fact, feature, {
        grade,
        evidenceScope: "exact_au_version",
        reason: "Reviewed confidence does not determine equipment inclusion.",
      });
      const vehicle = applyEvidenceRegrading([car(fact)], sources, review)[0];
      const result = applyFeatureRegrading(
        vehicle,
        [feature],
        sources,
        review,
      )[0];
      assert.equal(
        vehicle.facts[fact.key].status,
        status,
        `${status}: ${grade}`,
      );
      assert.equal(result.status, status, `${status}: ${grade}`);
      assert.equal(vehicle.facts[fact.key].buyerGrade, grade);
      assert.equal(result.buyerGrade, grade);
    }
  }
});

test("optional numerical equipment still ranks on its earned Check grade and exact measurement basis", () => {
  const { vehicle } = reviewed();
  const result = rankAttribute([vehicle], sources, "towing_braked_kg", {
    asOf: "2026-10-13",
  });
  assert.deepEqual(result.excluded, []);
  assert.equal(result.groups[0].entries[0].fact.status, "optional");
  assert.equal(result.groups[0].entries[0].fact.buyerGrade, "check");
  assert.equal(result.groups[0].entries[0].rank, 1);
});

test("Check presentation retains the extra-cost condition rather than treating optional equipment as included", () => {
  const { vehicle, features } = reviewed();
  const factMarkup = renderToStaticMarkup(
    createElement(FactValue, {
      fact: vehicle.facts.towing_braked_kg,
    }),
  );
  const featureMarkup = renderToStaticMarkup(
    createElement(FeatureValue, {
      feature: features[0],
    }),
  );
  assert.match(factMarkup, /evidence-grade-check/);
  assert.match(factMarkup, /optional towing package costs extra/);
  assert.match(featureMarkup, /evidence-grade-check/);
  assert.match(featureMarkup, /Optional paid subscription/);
  assert.doesNotMatch(featureMarkup, /class="status standard"/);
});

test("chapter readouts and driving labels continue identifying the regraded feature as a paid option", () => {
  const { vehicle, features } = reviewed();
  const pack: Pack = {
    car: vehicle,
    features,
    sources,
    events: [],
    configuration: [],
    eligibility: {
      variant_id: vehicle.id,
      model_id: vehicle.modelId,
      documented_family_minimum: null,
      exact_total_known: false,
      exact_total: null,
      scope: "Exact version",
      meaning: "Not established",
      source_ids: [],
      observation_window_start: "2026-10-01",
      observation_window_end: "2026-10-13",
    },
  };
  assert.deepEqual(readoutFor("02", pack, pack, "2026-10-13").rows[0].values, [
    "Optional",
    "Optional",
  ]);
  const text: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get:
        (_, name) =>
        (...args: unknown[]) => {
          if (name === "fillText") text.push(String(args[0]));
          if (name === "measureText") return { width: 60 };
          if (String(name).endsWith("Gradient")) return { addColorStop() {} };
        },
      set: () => true,
    },
  ) as CanvasRenderingContext2D;
  driveSceneB.draw(
    ctx,
    1200,
    514,
    driveSceneB.still,
    1,
    specFor(pack, pack, "2026-10-13"),
  );
  assert.ok(
    text.some((label) => /Paid option · Supervised assistance/.test(label)),
  );
  assert.ok(
    !text.some((label) => /Standard · Supervised assistance/.test(label)),
  );
});

test("changed claim or source snapshots invalidate grades without changing optional fitment", () => {
  const review = overlay();
  for (const changedSource of [false, true]) {
    const fact = changedSource
      ? optionalFact
      : { ...optionalFact, value: 1700 };
    const feature = changedSource
      ? optionalFeature
      : { ...optionalFeature, value: "Changed subscription" };
    const cited = changedSource
      ? [{ ...maker, title: "Updated specification" }]
      : sources;
    const vehicle = applyEvidenceRegrading([car(fact)], cited, review)[0];
    const result = applyFeatureRegrading(vehicle, [feature], cited, review)[0];
    for (const claim of [vehicle.facts[fact.key], result]) {
      assert.equal(claim.status, "optional");
      assert.equal(claim.buyerGrade, undefined);
      assert.equal(claim.gradeReview, undefined);
      assert.equal(claim.gradeReviewStatus, "review_required");
    }
  }
});
