import test from "node:test";
import assert from "node:assert/strict";
import { compareFacts } from "../src/lib/compare";
import type { Fact } from "../src/lib/types";
const fact = (comparisonBasis: string, value: number): Fact => ({
  key: "boot_l",
  label: "Rear boot",
  value,
  unit: "L",
  basis: comparisonBasis,
  comparisonBasis,
  status: "standard",
  sourceIds: ["maker"],
  date: "2026-10-14",
  market: "AU",
  scope: "Named version",
  qualifications: [],
  issues: [],
});
test("matching unspecified cargo method labels never produce a numerical delta", () => {
  for (const basis of [
    "Tesla cargo volume behind occupied seats; method unspecified",
    "Rear boot; maker method not stated",
    "Unclassified cargo volume",
    "Unknown measurement method",
  ]) {
    const a = fact(basis, 594),
      b = fact(basis, 822);
    const before = structuredClone([a, b]);
    const result = compareFacts(a, b);
    assert.equal(result.state, "different_basis");
    assert.equal(result.delta, undefined);
    assert.deepEqual([a, b], before);
  }
});
test("established matching measurement methods keep exact deltas", () => {
  assert.equal(
    compareFacts(
      fact("VDA rear boot with seats up", 500),
      fact("VDA rear boot with seats up", 550),
    ).delta,
    50,
  );
});
test("generic model-year uncertainty is not mistaken for an unknown measurement method", () => {
  const basis = "WLTP combined; model year unverified";
  assert.equal(compareFacts(fact(basis, 500), fact(basis, 550)).delta, 50);
});
