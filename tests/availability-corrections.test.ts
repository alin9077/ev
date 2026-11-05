import { makeReport, reportMarkdown } from "../src/lib/citable";
import test from "node:test";
import assert from "node:assert/strict";
import {
  sourceCatalogue as catalogue,
  sourceResearch as research,
  catalogue as currentCatalogue,
  research as currentResearch,
  pack,
} from "../src/lib/data";
import {
  applyAvailabilityCorrections,
  availabilitySnapshot,
  availabilityReportClaim,
  type AvailabilityCorrection,
} from "../src/lib/availability-corrections";
import { makeIssueDraft } from "../src/lib/corrections";
import { rankAttribute } from "../src/lib/discovery";
import {
  buildBuyerSummaries,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { buyerProposal as proposal } from "../src/lib/buyer-proposal";
// These 10 October approvals target the immutable source stage; the current-overlay case is separate.
const cars = catalogue();
const sources = research().sources;
const original = cars.find(
  (c) => c.id === "byd_dolphin__essential_fwd__20261010",
)!;
const before = availabilitySnapshot(original);
const edit: AvailabilityCorrection = {
  id: "qa-availability-1",
  variantId: original.id,
  before,
  after: {
    availability: "not_current",
    evidence: {
      ...before.evidence,
      checkedAt: "2026-10-10",
      orderStatus: "not_accepting_orders",
      stockStatus: "no_new_stock_verified",
      qualifications: [
        "QA fixture only: no current eligible offering verified.",
      ],
    },
  },
  status: "approved",
  reviewedBy: "QA fixture",
  reviewedAt: "2026-10-10",
  evidenceDate: "2026-10-10",
  reason: "Test only; never saved to the production register",
};
test("approved availability withdrawal propagates, removes ranks and suppresses stale buyer copy", () => {
  const changed = applyAvailabilityCorrections(cars, [edit], sources);
  const car = changed.find((c) => c.id === original.id)!;
  assert.equal(car.availability, "not_current");
  assert.equal(car.availabilityRevision, edit.id);
  assert.equal(original.availability, "current_or_order_listed");
  assert.deepEqual(car.facts, original.facts);
  const exported = pack(car.id, { data: research(), cars: changed });
  assert.equal(exported.car.availability, "not_current");
  const report = makeReport([exported], "/compare");
  assert.match(report.availability[0].value, /Not currently available/);
  assert.match(reportMarkdown(report), /Not currently available/);
  assert.deepEqual(exported.car.availabilityEvidence, edit.after.evidence);
  for (const id of edit.after.evidence.sourceIds)
    assert.ok(exported.sources.some((s) => s.id === id));
  const ranked = rankAttribute([car], sources, "range_km", {
    asOf: "2026-10-10",
    maxAgeDays: 30,
  });
  assert.equal(ranked.groups.length, 0);
  assert.equal(ranked.excluded.length, 1);
  assert.equal(
    buildBuyerSummaries(
      changed,
      [],
      sources,
      proposal as SellingPointProposal,
      { asOf: "2026-10-10", maxAgeDays: 30 },
    ).has(car.id),
    false,
  );
});
test("even a still-listed availability correction requires buyer-copy re-review", () => {
  const change = {
    ...edit,
    after: { ...edit.after, availability: "current_or_order_listed" },
  };
  const changed = applyAvailabilityCorrections(cars, [change], sources);
  assert.equal(
    buildBuyerSummaries(
      changed,
      [],
      sources,
      proposal as SellingPointProposal,
      { asOf: "2026-10-10", maxAgeDays: 30 },
    ).has(original.id),
    false,
  );
});
test("availability correction requires full snapshot, valid provenance and usable evidence", () => {
  assert.deepEqual(
    applyAvailabilityCorrections(cars, [{ ...edit, status: "pending" }], []),
    cars,
  );
  for (const invalid of [
    {
      ...edit,
      before: {
        ...before,
        evidence: { ...before.evidence, checkedAt: "2026-10-01" },
      },
    },
    { ...edit, variantId: "missing" },
  ])
    assert.throws(
      () => applyAvailabilityCorrections(cars, [invalid], sources),
      /conflict/,
    );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        cars,
        [{ ...edit, reviewedBy: "" }],
        sources,
      ),
    /provenance/,
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        cars,
        [{ ...edit, evidenceDate: "2026-02-30" }],
        sources,
      ),
    /provenance/,
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        cars,
        [
          {
            ...edit,
            after: {
              ...edit.after,
              evidence: { ...edit.after.evidence, sourceIds: ["missing"] },
            },
          },
        ],
        sources,
      ),
    /sources/,
  );
  const held = sources.map((s) =>
    edit.after.evidence.sourceIds.includes(s.id)
      ? { ...s, publication_hold: "QA hold" }
      : s,
  );
  assert.throws(
    () => applyAvailabilityCorrections(cars, [edit], held),
    /sources/,
  );
  assert.throws(
    () => applyAvailabilityCorrections(cars, [edit, edit], sources),
    /duplicate/,
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        cars,
        [
          {
            ...edit,
            after: {
              ...edit.after,
              evidence: {
                ...edit.after.evidence,
                stockStatus: "new_stock_listed",
              },
            },
          },
        ],
        sources,
      ),
    /contradictory/,
  );
});
test("availability reports retain exact version, checked date, status and evidence without approval", () => {
  const draft = makeIssueDraft(
    original.id,
    availabilityReportClaim(original),
    "Please verify this exact version is still available.",
    "2026-10-10T00:00:00Z",
    "qa-availability-report",
  );
  assert.equal(draft.claimKind, "availability");
  assert.equal(draft.factKey, "availability:exact_version");
  assert.equal(draft.variantId, original.id);
  assert.match(String(draft.observedValue), /orders:.*stock:/);
  assert.match(
    draft.observedConditions!,
    new RegExp(before.evidence.checkedAt),
  );
  assert.deepEqual(draft.sourceIds, before.evidence.sourceIds);
  assert.equal(draft.status, "pending");
});

test("a current graded BYD withdrawal reaches packs and rankings without altering its facts", () => {
  const currentCars = currentCatalogue();
  const data = currentResearch();
  const current = currentCars.find((car) => car.id === original.id)!;
  const currentBefore = availabilitySnapshot(current);
  const asOf = "2026-10-14";
  assert.equal(current.buyerGradesRequired, true);
  assert.ok(current.buyerSummary?.strength);
  assert.equal(
    rankAttribute([current], data.sources, "range_km", { asOf }).groups.length,
    1,
  );
  const correction: AvailabilityCorrection = {
    ...edit,
    id: "qa-current-availability-withdrawal",
    before: currentBefore,
    after: {
      availability: "not_current",
      evidence: {
        ...currentBefore.evidence,
        checkedAt: asOf,
        orderStatus: "not_accepting_orders",
        stockStatus: "no_new_stock_verified",
        qualifications: ["QA current-catalogue withdrawal fixture only."],
      },
    },
    reviewedAt: asOf,
    evidenceDate: asOf,
  };
  const changed = applyAvailabilityCorrections(
    currentCars,
    [correction],
    data.sources,
  );
  const withdrawn = changed.find((car) => car.id === current.id)!;
  const exported = pack(current.id, { cars: changed, data });
  assert.equal(exported.car.availability, "not_current");
  assert.equal(withdrawn.buyerSummary, undefined);
  assert.deepEqual(withdrawn.facts, current.facts);
  assert.deepEqual(availabilitySnapshot(current), currentBefore);
  assert.equal(
    rankAttribute([withdrawn], data.sources, "range_km", { asOf }).groups
      .length,
    0,
  );
  for (const id of correction.after.evidence.sourceIds)
    assert.ok(exported.sources.some((source) => source.id === id));
});
