import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, effectiveFeatures } from "../src/lib/data";
import {
  applyFeatureCorrections,
  type FeatureCorrection,
} from "../src/lib/feature-corrections";
import { featureReportClaim, makeIssueDraft } from "../src/lib/corrections";
import {
  buildBuyerSummaries,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { buyerProposal as proposal } from "../src/lib/buyer-proposal";
const cars = catalogue();
const dataSnapshot = research();
const sources = dataSnapshot.sources;
const id = "byd_dolphin__premium_fwd__20261010";
const rows = cars.flatMap((c) => effectiveFeatures(c, dataSnapshot));
const original = rows.find(
  (f) => f.variant_id === id && f.criterion === "front_heated_seats",
)!;
const snapshot = {
  value: original.value,
  status: original.status,
  conditions: original.conditions,
  source_ids: original.source_ids,
};
const edit: FeatureCorrection = {
  id: "test-equipment-1",
  variantId: id,
  criterion: original.criterion,
  beforeFeature: structuredClone(original),
  before: snapshot,
  after: {
    ...snapshot,
    value: "Requires confirmation",
    status: "not_verified",
    conditions: "QA simulation: exact build applicability needs checking.",
  },
  status: "approved",
  reviewedBy: "QA fixture",
  reviewedAt: "2026-10-10",
  evidenceDate: "2026-10-10",
  reason: "Test only; no production correction saved",
};
test("approved equipment correction propagates to effective rows and suppresses dependent buyer copy", () => {
  const changed = applyFeatureCorrections(rows, [edit], sources);
  const row = changed.find(
    (f) => f.variant_id === id && f.criterion === original.criterion,
  )!;
  assert.equal(row.status, "not_verified");
  assert.match(row.conditions, /Correction test-equipment-1/);
  assert.equal(original.status, "standard");
  const summary = buildBuyerSummaries(
    cars,
    changed,
    sources,
    proposal as SellingPointProposal,
    { asOf: "2026-10-10", maxAgeDays: 30 },
  ).get(id);
  assert.equal(summary?.strength, undefined);
  assert.ok(summary?.tradeoff);
});
test("equipment correction requires full reviewed snapshot, provenance and usable sources", () => {
  assert.deepEqual(
    applyFeatureCorrections(rows, [{ ...edit, status: "pending" }], []),
    rows,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        rows,
        [{ ...edit, before: { ...snapshot, conditions: "different" } }],
        sources,
      ),
    /conflict/,
  );
  assert.throws(
    () => applyFeatureCorrections(rows, [{ ...edit, reviewedBy: "" }], sources),
    /provenance/,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        rows,
        [{ ...edit, after: { ...edit.after, source_ids: ["missing"] } }],
        sources,
      ),
    /sources/,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        rows,
        [
          {
            ...edit,
            after: { ...edit.after, status: "conditional", conditions: "" },
          },
        ],
        sources,
      ),
    /conditions/,
  );
});
test("equipment report preserves exact criterion, displayed status and qualifications", () => {
  const draft = makeIssueDraft(
    id,
    featureReportClaim(original, "Heated front seats"),
    "QA test: verify exact equipment applicability.",
    "2026-10-10T00:00:00Z",
    "qa-1",
  );
  assert.equal(draft.factKey, "feature:front_heated_seats");
  assert.equal(draft.claimKind, "feature");
  assert.equal(draft.observedStatus, original.status);
  assert.equal(draft.observedConditions, original.conditions);
  assert.equal(draft.status, "pending");
});
