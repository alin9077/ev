import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FactValue } from "../src/components/graded-figure";
import { FactValue as UiFactValue } from "../src/components/ui";
import {
  shortCheckedDate,
  FreshnessLabel,
} from "../src/components/freshness-label";
import type { Fact, BuyerGrade } from "../src/lib/types";

const fact = (over: Partial<Fact> = {}): Fact => ({
  key: "range_km",
  label: "Range",
  value: 500,
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  status: "standard",
  sourceIds: [],
  date: "2026-10-10",
  market: "AU",
  scope: "x",
  issues: [],
  qualifications: [],
  ...over,
});
const graded = (g: BuyerGrade, over: Partial<Fact> = {}) =>
  fact({
    buyerGrade: g,
    gradeReview: {
      reviewedAt: "2026-10-14",
      overlayId: "t",
      reason: "r",
      evidenceScope:
        g === "reported" ? "secondary_or_sibling" : "exact_au_version",
      sourceIds: [],
      sourceLabel: "CarExpert",
    },
    ...over,
  });
const card = (f: Fact) =>
  renderToStaticMarkup(
    createElement(FactValue, { fact: f, compact: true, dateStyle: "short" }),
  );

test("one grade component serves cards, detail pages and comparison rows", () => {
  assert.equal(UiFactValue, FactValue);
});

test("short checked date is DD Mon and leaves non-dates alone", () => {
  assert.equal(shortCheckedDate("2026-10-04"), "4 Oct");
  assert.equal(shortCheckedDate("2026-12-31"), "31 Dec");
  assert.equal(shortCheckedDate("not a date"), "not a date");
});

test("Confirmed is a plain figure with no mark", () => {
  const out = card(graded("confirmed"));
  assert.match(out, /<strong>500 km<\/strong>/);
  assert.doesNotMatch(out, /Check|Reported|<details/);
  assert.match(out, /checked 10 Oct/);
});

test("Check carries a mark and the condition opens on tap (native details)", () => {
  const out = card(
    graded("check", { conditionExplanation: "Needs the 19-inch wheels." }),
  );
  assert.match(out, /<details[^>]*evidence-grade-check/);
  assert.match(out, /<summary>[^]*Check<\/summary>/);
  assert.match(out, /Needs the 19-inch wheels/);
  assert.match(out, /500 km/);
});

test("Reported is muted and names its source", () => {
  const out = card(graded("reported"));
  assert.match(out, /<strong class="muted">500 km/);
  assert.match(out, /Reported by CarExpert/);
});

test("Not published says so in words, in place of a number", () => {
  const out = card(
    graded("not_published", { value: null, status: "not_verified" }),
  );
  assert.match(out, /Not published/);
  assert.doesNotMatch(out, /Needs confirmation/);
});

test("an Unreviewed figure keeps its value and says so, without legacy condition prose", () => {
  const out = card(
    fact({
      status: "conditional",
      qualifications: ["Model year unconfirmed."],
    }),
  );
  assert.match(out, /500 km/);
  assert.match(out, /Unreviewed/);
  assert.doesNotMatch(out, /Why conditional|Model year unconfirmed/);
});

test("aged figures stay visible with an amber checked label; fresh ones do not", () => {
  const label = (asOf: string) =>
    renderToStaticMarkup(
      createElement(FreshnessLabel, {
        checkedAt: "2026-10-14",
        factKey: "price_aud",
        asOf,
        short: true,
      }),
    );
  assert.doesNotMatch(label("2026-10-20"), /evidence-stale/);
  const aged = label("2026-12-20");
  assert.match(aged, /evidence-stale/);
  assert.match(aged, /checked 14 Oct/);
  // The figure is never removed by age.
  assert.match(card(fact({ date: "2020-01-01" })), /500 km/);
});
