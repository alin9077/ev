import test from "node:test";
import assert from "node:assert/strict";
import { factCondition } from "../src/lib/fleet";
import type { Fact } from "../src/lib/types";
const fixture = (key: string): Fact => ({
  key,
  label: key,
  value: 5,
  unit: "",
  basis: "Exact Australian manufacturer specification",
  comparisonBasis: "Exact version only",
  market: "AU",
  scope: "variant",
  status: "conditional",
  sourceIds: ["official"],
  date: "2026-10-10",
  qualifications: [],
  issues: [],
});
test("conditional exact-source facts never invent inherited or changed-since-launch provenance", () => {
  for (const key of [
    "seats",
    "boot_l",
    "range_km",
    "zero_to_100_s",
    "price_aud",
  ]) {
    const text = factCondition(fixture(key));
    assert.match(text, /Source conditions apply/);
    assert.doesNotMatch(
      text,
      /Carried over|closely related|changed since launch|not.*maker|not a driveaway/,
    );
  }
});
test("explicit condition explanations and qualifications remain authoritative", () => {
  const f = fixture("range_km");
  f.qualifications = [
    "WLTP laboratory result.",
    "Temperature changes real-world range.",
  ];
  assert.equal(factCondition(f), f.qualifications.join(" "));
  f.conditionExplanation = "Exact source-provided explanation.";
  assert.equal(factCondition(f), f.conditionExplanation);
});
