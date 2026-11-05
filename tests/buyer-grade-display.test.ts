import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  FactValue,
  FeatureValue,
  factEvidence,
  featureEvidence,
} from "../src/components/ui";
import type { Fact, Feature, BuyerGrade, Pack } from "../src/lib/types";
import { factClaim } from "../src/lib/citable";
import { validReportFact } from "../src/lib/report-claim-shape";
import { formatFact } from "../src/lib/compare";
const fact = (buyerGrade?: BuyerGrade): Fact => ({
  key: "range_km",
  label: "Range",
  value: 500,
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  status: "conditional",
  sourceIds: ["maker"],
  date: "2026-10-10",
  market: "AU",
  scope: "Named version",
  issues: [],
  qualifications: ["Requires the 19-inch wheels."],
  buyerGrade,
  gradeReview: buyerGrade
    ? {
        reviewedAt: "2026-10-14",
        overlayId: "test",
        reason: "Reviewed exact scope",
        evidenceScope:
          buyerGrade === "reported"
            ? "secondary_or_sibling"
            : "exact_au_version",
        sourceIds: ["maker"],
        sourceLabel: "Example publication",
      }
    : undefined,
});
const render = (f: Fact) =>
  renderToStaticMarkup(createElement(FactValue, { fact: f }));
test("Confirmed renders a plain figure without the old conditional badge", () => {
  const html = render({ ...fact("confirmed"), qualifications: [] });
  assert.match(html, /500/);
  assert.doesNotMatch(html, /Why conditional|>Conditional|<details/);
  assert.match(html, /Checked on.*2026-10-10/);
});
test("Check puts all specific conditions behind a native keyboard-accessible disclosure", () => {
  const html = render({
    ...fact("check"),
    conditionExplanation: "Optional wheel package.",
  });
  assert.match(html, /<details[^>]*evidence-grade-check/);
  assert.match(html, /<summary>.*Check<\/summary>/);
  assert.match(html, /Optional wheel package/);
  assert.match(html, /Requires the 19-inch wheels/);
  assert.doesNotMatch(html, /Why conditional/);
});
test("Reported keeps the number visible with muted styling and its source label", () => {
  const html = render(fact("reported"));
  assert.match(html, /<strong class="muted">500/);
  assert.match(html, /Reported.*Example publication/);
});
test("Not published differs from an unreviewed unknown in display and evidence", () => {
  const reviewed = {
    ...fact("not_published"),
    value: null,
    status: "not_verified" as const,
  };
  assert.match(render(reviewed), /Not published/);
  assert.doesNotMatch(render(reviewed), /Needs confirmation/);
  assert.equal(factEvidence(reviewed).value, "Not published");
  assert.equal(formatFact(reviewed), "Not published");
  assert.match(
    render({ ...reviewed, buyerGrade: undefined }),
    /Needs confirmation/,
  );
});
test("Unreviewed legacy conditions remain visible until reviewed", () => {
  assert.match(render(fact()), /Why conditional/);
});
test("Feature evidence uses the same earned grade and leaves the answer visible", () => {
  const f: Feature = {
    variant_id: "car",
    model_id: "model",
    criterion: "heat_pump",
    status: "conditional",
    value: "Included with winter pack",
    conditions: "Winter pack required",
    source_ids: ["maker"],
    evidence_scope: "Exact trim",
    last_evidence_date: "2026-10-10",
    reviewed_date: "2026-10-14",
    verification_state: "reviewed",
    buyerGrade: "check",
  };
  const html = renderToStaticMarkup(
    createElement(FeatureValue, { feature: f }),
  );
  assert.match(html, /Included with winter pack/);
  assert.match(html, /Winter pack required/);
  assert.match(html, /<summary>.*Check<\/summary>/);
  assert.doesNotMatch(html, /Why conditional/);
});
test("Citable claims retain earned grades and original checked dates", () => {
  const pack = {
    car: { id: "car", brand: "Example", model: "EV", trim: "Base" },
    sources: [],
  } as unknown as Pack;
  const sourceFact = fact("reported");
  const claim = factClaim(pack, sourceFact);
  assert.equal(claim.buyerGrade, "reported");
  assert.deepEqual(claim.gradeReview, sourceFact.gradeReview);
  assert.equal(claim.evidenceDate, "2026-10-10");
  assert.match(claim.sentence, /reported/);
  assert.doesNotMatch(claim.sentence, /; conditional\./);
});
test("Claim reports reject malformed grade metadata rather than treating it as evidence", () => {
  assert.ok(validReportFact(fact("confirmed")));
  assert.ok(validReportFact(fact()));
  assert.equal(
    validReportFact({ ...fact("confirmed"), gradeReview: undefined }),
    false,
  );
  assert.equal(
    validReportFact({ ...fact("confirmed"), buyerGrade: "invented" }),
    false,
  );
  assert.equal(
    validReportFact({
      ...fact("confirmed"),
      gradeReview: { ...fact("confirmed").gradeReview, sourceIds: 5 },
    }),
    false,
  );
});

test("Withdrawn grades retain figures but disclose the required review everywhere", () => {
  const withdrawn: Fact = {
    ...fact(),
    status: "standard",
    gradeReviewStatus: "review_required",
  };
  assert.match(render(withdrawn), /500/);
  assert.match(render(withdrawn), /Needs review/);
  assert.equal(factEvidence(withdrawn).gradeReviewStatus, "review_required");
  const pack = {
    car: { id: "car", brand: "Example", model: "EV", trim: "Base" },
    sources: [],
  } as unknown as Pack;
  const claim = factClaim(pack, withdrawn);
  assert.equal(claim.gradeReviewStatus, "review_required");
  assert.match(claim.sentence, /review required/);
  assert.doesNotMatch(claim.sentence, /; standard\./);
  assert.ok(validReportFact(withdrawn));
  assert.equal(
    validReportFact({ ...withdrawn, gradeReviewStatus: "approved" }),
    false,
  );
});

test("Withdrawn feature reviews do not retain a Standard badge", () => {
  const f: Feature = {
    variant_id: "car",
    model_id: "model",
    criterion: "heat_pump",
    status: "standard",
    value: "Included",
    conditions: "",
    source_ids: ["maker"],
    evidence_scope: "Exact trim",
    last_evidence_date: "2026-10-10",
    reviewed_date: "2026-10-14",
    verification_state: "reviewed",
    gradeReviewStatus: "review_required",
  };
  const html = renderToStaticMarkup(
    createElement(FeatureValue, { feature: f }),
  );
  assert.match(html, /Included/);
  assert.match(html, /Needs review/);
  assert.doesNotMatch(html, />Standard</);
  assert.equal(
    featureEvidence(f, "Heat pump").gradeReviewStatus,
    "review_required",
  );
});
