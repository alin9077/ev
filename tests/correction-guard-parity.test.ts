import test from "node:test";
import assert from "node:assert/strict";
import type { Car, Feature, Source } from "../src/lib/types";
import {
  applyFeatureCorrections,
  validateFeatureCorrectionRegistry,
  type FeatureCorrection,
} from "../src/lib/feature-corrections";
import {
  applyAvailabilityCorrections,
  availabilitySnapshot,
  type AvailabilityCorrection,
} from "../src/lib/availability-corrections";
import { sameReviewedState } from "../src/lib/correction-guards";
const source: Source = {
  id: "source",
  url: "https://example.com/spec",
  title: "Fixture",
  publisher: "Fixture",
  source_type: "manufacturer",
  published_date: null,
  accessed_date: "2026-10-10",
  market: "AU",
  supports: "Fixture only",
};
const feature: Feature = {
  variant_id: "one",
  model_id: "model",
  criterion: "equipment",
  value: "Included",
  status: "standard",
  conditions: "Exact fixture",
  source_ids: [source.id],
  evidence_scope: "exact trim",
  last_evidence_date: "2026-10-10",
  reviewed_date: "2026-10-10",
  verification_state: "fixture",
  usability_notes: ["Retain me"],
};
const selected = (f: Feature) => ({
  value: f.value,
  status: f.status,
  conditions: f.conditions,
  source_ids: [...f.source_ids],
});
const equipment = (f = feature, id = "equipment-1"): FeatureCorrection => ({
  id,
  variantId: f.variant_id,
  criterion: f.criterion,
  beforeFeature: structuredClone(f),
  before: selected(f),
  after: {
    ...selected(f),
    value: "Needs verification",
    status: "not_verified",
  },
  status: "approved",
  reviewedBy: "Fixture reviewer",
  reviewedAt: "2026-10-10",
  evidenceDate: "2026-10-10",
  reason: "Fixture correction",
});
const car = {
  id: "one",
  availability: "current_or_order_listed",
  availabilityEvidence: {
    checkedAt: "2026-10-10",
    orderStatus: "accepting_orders_advertised",
    stockStatus: "unverified",
    sourceIds: [source.id],
    qualifications: ["Advertisement only"],
    physicalStockVerified: false,
    factoryOrderAcceptanceVerified: false,
  },
  facts: {},
  issues: [],
} as unknown as Car;
const availability = (
  c = car,
  id = "availability-1",
): AvailabilityCorrection => ({
  id,
  variantId: c.id,
  before: structuredClone(availabilitySnapshot(c)),
  after: structuredClone(availabilitySnapshot(c)),
  status: "approved",
  reviewedBy: "Fixture reviewer",
  reviewedAt: "2026-10-10",
  evidenceDate: "2026-10-10",
  reason: "Fixture correction",
});

test("equipment full before-state guards every known field and unknown nested metadata", () => {
  const edits: Partial<Feature>[] = [
    { model_id: "different" },
    { evidence_scope: "different" },
    { last_evidence_date: "2026-10-09" },
    { reviewed_date: "2026-10-09" },
    { verification_state: "different" },
    { condition_label: "new" },
    { usability_notes: ["changed"] },
    { confirmation_needed: "new" },
    { value: "different" },
    { status: "conditional" },
    { source_ids: ["other"] },
    { conditions: "different" },
  ];
  for (const drift of edits)
    assert.throws(
      () =>
        applyFeatureCorrections(
          [{ ...feature, ...drift }],
          [equipment()],
          [source],
        ),
      /conflict/,
    );
  const withExtra = { ...feature, extra: { evidence: ["one"] } };
  const changed = { ...withExtra, extra: { evidence: ["two"] } };
  assert.throws(
    () => applyFeatureCorrections([changed], [equipment(withExtra)], [source]),
    /conflict/,
  );
  const missing = equipment();
  delete (missing as Partial<FeatureCorrection>).beforeFeature;
  assert.throws(
    () => applyFeatureCorrections([feature], [missing], [source]),
    /conflict/,
  );
});

test("equipment registry rejects unknown, ambiguous and cross-variant duplicate targets and IDs", () => {
  const other = { ...feature, variant_id: "two" };
  assert.throws(
    () =>
      validateFeatureCorrectionRegistry(
        [equipment(), equipment(other)],
        [feature, other],
      ),
    /Duplicate/,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        [feature],
        [{ ...equipment(), variantId: "unknown" }],
        [source],
      ),
    /target/,
  );
  assert.throws(
    () => applyFeatureCorrections([feature, feature], [equipment()], [source]),
    /ambiguous/,
  );
  assert.throws(
    () =>
      validateFeatureCorrectionRegistry(
        [{ ...equipment(), criterion: "unknown" }],
        [feature],
      ),
    /target/,
  );
  assert.deepEqual(
    applyFeatureCorrections(
      [feature],
      [{ ...equipment(), variantId: "unknown", status: "pending" }],
      [],
    ),
    [feature],
  );
});

test("equipment chains require immediate predecessors, complete resulting state and monotonic review dates", () => {
  const first = equipment();
  const nextRow = applyFeatureCorrections([feature], [first], [source])[0];
  const second = { ...equipment(nextRow, "equipment-2"), supersedes: first.id };
  assert.equal(
    applyFeatureCorrections([feature], [first, second], [source])[0]
      .reviewed_date,
    second.reviewedAt,
  );
  for (const supersedes of [undefined, "missing"])
    assert.throws(
      () =>
        applyFeatureCorrections(
          [feature],
          [first, { ...second, supersedes }],
          [source],
        ),
      /predecessor/,
    );
  assert.throws(
    () =>
      applyFeatureCorrections(
        [feature],
        [{ ...first, supersedes: "missing" }],
        [source],
      ),
    /predecessor/,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        [feature],
        [first, { ...second, reviewedAt: "2026-10-09" }],
        [source],
      ),
    /chronology/,
  );
  assert.throws(
    () =>
      applyFeatureCorrections(
        [feature],
        [first, { ...second, beforeFeature: feature }],
        [source],
      ),
    /conflict/,
  );
  const thirdRow = applyFeatureCorrections(
    [feature],
    [first, second],
    [source],
  )[0];
  assert.throws(
    () =>
      applyFeatureCorrections(
        [feature],
        [
          first,
          second,
          { ...equipment(thirdRow, "equipment-3"), supersedes: first.id },
        ],
        [source],
      ),
    /predecessor/,
  );
});

test("equipment sources reject duplicate references, ambiguous registry, unsafe URL and invalid dates", () => {
  for (const ids of [[], ["source", "source"], ["missing"], [""], null]) {
    const edit = equipment();
    edit.after.source_ids = ids as string[];
    assert.throws(
      () => applyFeatureCorrections([feature], [edit], [source]),
      /sources/,
    );
  }
  for (const drift of [
    { url: "https://user:pass@example.com/spec" },
    { url: "javascript:alert(1)" },
    { accessed_date: "2026-02-30" },
    { accessed_date: "2026-10-11" },
    { publication_hold: true },
    { access_limitation: "blocked" },
    { conflict: true },
  ])
    assert.throws(
      () =>
        applyFeatureCorrections(
          [feature],
          [equipment()],
          [{ ...source, ...drift }],
        ),
      /sources/,
    );
  assert.throws(
    () => applyFeatureCorrections([feature], [equipment()], [source, source]),
    /sources/,
  );
});

test("equipment corrections do not alias proposals or modify original inputs", () => {
  const input = structuredClone(feature),
    edit = equipment(input),
    saved = structuredClone(edit);
  const result = applyFeatureCorrections([input], [edit], [source]);
  assert.deepEqual(input, feature);
  assert.deepEqual(edit, saved);
  edit.after.source_ids.push("later");
  edit.beforeFeature.usability_notes!.push("later");
  assert.deepEqual(result[0].source_ids, ["source"]);
  assert.deepEqual(result[0].usability_notes, ["Retain me"]);
});

test("equipment after patches cannot replace identities or unreviewed metadata", () => {
  for (const key of [
    "variant_id",
    "model_id",
    "criterion",
    "evidence_scope",
    "verification_state",
    "extra",
  ]) {
    const edit = equipment();
    Object.assign(edit.after, { [key]: "injected" });
    assert.throws(
      () => applyFeatureCorrections([feature], [edit], [source]),
      /invalid/,
    );
  }
});

test("availability full snapshot includes stock/order flags, unknown metadata and absence distinctions", () => {
  for (const key of [
    "physicalStockVerified",
    "factoryOrderAcceptanceVerified",
  ] as const) {
    for (const value of [true, undefined]) {
      const changed = structuredClone(car);
      if (value === undefined) delete changed.availabilityEvidence![key];
      else changed.availabilityEvidence![key] = value;
      assert.throws(
        () =>
          applyAvailabilityCorrections([changed], [availability()], [source]),
        /snapshot/,
      );
    }
  }
  const extraCar = {
    ...car,
    availabilityEvidence: {
      ...car.availabilityEvidence!,
      extra: { sourceEpoch: "old" },
    },
  };
  const changed = {
    ...extraCar,
    availabilityEvidence: {
      ...extraCar.availabilityEvidence,
      extra: { sourceEpoch: "new" },
    },
  };
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [changed],
        [availability(extraCar)],
        [source],
      ),
    /snapshot/,
  );
  assert.equal(sameReviewedState({ a: null }, {}), false);
  assert.equal(sameReviewedState({ a: false }, {}), false);
  assert.equal(sameReviewedState({ a: [] }, {}), false);
});

test("availability chains require exact immediate predecessor and chronology", () => {
  const first = availability();
  const changed = applyAvailabilityCorrections([car], [first], [source])[0];
  const second = {
    ...availability(changed, "availability-2"),
    supersedes: first.id,
  };
  assert.equal(
    applyAvailabilityCorrections([car], [first, second], [source])[0]
      .availabilityRevision,
    second.id,
  );
  for (const supersedes of [undefined, "missing"])
    assert.throws(
      () =>
        applyAvailabilityCorrections(
          [car],
          [first, { ...second, supersedes }],
          [source],
        ),
      /predecessor/,
    );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [car],
        [{ ...first, supersedes: "missing" }],
        [source],
      ),
    /predecessor/,
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [car],
        [first, { ...second, reviewedAt: "2026-10-09" }],
        [source],
      ),
    /chronology/,
  );
  const other = { ...car, id: "two" };
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [car, other],
        [
          first,
          { ...availability(other, "availability-2"), supersedes: first.id },
        ],
        [source],
      ),
    /predecessor/,
  );
  assert.throws(
    () => applyAvailabilityCorrections([car, car], [first], [source]),
    /variant/,
  );
});

test("availability after flags must be booleans and supporting sources unambiguous", () => {
  for (const key of [
    "physicalStockVerified",
    "factoryOrderAcceptanceVerified",
  ] as const)
    for (const value of [null, "true", 1]) {
      const edit = availability();
      Object.assign(edit.after.evidence, { [key]: value });
      assert.throws(
        () => applyAvailabilityCorrections([car], [edit], [source]),
        /status/,
      );
    }
  for (const ids of [[], ["source", "source"], ["missing"], null]) {
    const edit = availability();
    edit.after.evidence.sourceIds = ids as string[];
    assert.throws(
      () => applyAvailabilityCorrections([car], [edit], [source]),
      /sources/,
    );
  }
  assert.throws(
    () =>
      applyAvailabilityCorrections([car], [availability()], [source, source]),
    /sources/,
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [car],
        [availability()],
        [{ ...source, accessed_date: "2026-08-01" }],
      ),
    /sources/,
  );
});

test("availability result is isolated from after-proposal mutations and keeps advertising flags false", () => {
  const edit = availability(),
    original = structuredClone(car);
  const result = applyAvailabilityCorrections([car], [edit], [source])[0];
  edit.after.evidence.sourceIds.push("later");
  edit.after.evidence.physicalStockVerified = true;
  assert.deepEqual(car, original);
  assert.deepEqual(result.availabilityEvidence!.sourceIds, ["source"]);
  assert.equal(result.availabilityEvidence!.physicalStockVerified, false);
  assert.equal(
    result.availabilityEvidence!.factoryOrderAcceptanceVerified,
    false,
  );
});

test("full-state comparisons ignore object key order while retaining array order and literal special keys", () => {
  assert.equal(
    sameReviewedState(
      { nested: { é: 1, "e\u0301": 2 } },
      { nested: { "e\u0301": 2, é: 1 } },
    ),
    true,
  );
  assert.equal(
    sameReviewedState(
      { b: [1, 2], a: { y: false, x: null } },
      { a: { x: null, y: false }, b: [1, 2] },
    ),
    true,
  );
  assert.equal(sameReviewedState([1, 2], [2, 1]), false);
  assert.equal(
    sameReviewedState(JSON.parse('{"__proto__":{"x":1}}'), {}),
    false,
  );
  const f = Object.fromEntries(Object.entries(feature).reverse()) as Feature;
  assert.doesNotThrow(() =>
    applyFeatureCorrections([f], [equipment()], [source]),
  );
});

test("reviewed-state comparison rejects lossy non-JSON inputs instead of equating them", () => {
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  for (const invalid of [
    NaN,
    Infinity,
    -Infinity,
    undefined,
    [undefined],
    Array(1),
    cycle,
    new Date(),
    () => 1,
  ])
    assert.throws(
      () => sameReviewedState(invalid, null),
      /Invalid reviewed state/,
    );
});

test("captured availability snapshots are independent of later car mutations", () => {
  const input = structuredClone(car),
    before = availabilitySnapshot(input);
  input.availabilityEvidence!.sourceIds.push("later");
  input.availabilityEvidence!.physicalStockVerified = true;
  assert.deepEqual(before.evidence.sourceIds, ["source"]);
  assert.equal(before.evidence.physicalStockVerified, false);
});

test("sparse after-source and qualification arrays cannot bypass per-item checks", () => {
  const featureEdit = equipment();
  featureEdit.after.source_ids = Array(1);
  assert.throws(
    () => applyFeatureCorrections([feature], [featureEdit], [source]),
    /Invalid reviewed state/,
  );
  const sourceEdit = availability();
  sourceEdit.after.evidence.sourceIds = Array(1);
  assert.throws(
    () => applyAvailabilityCorrections([car], [sourceEdit], [source]),
    /Invalid reviewed state/,
  );
  const qualificationsEdit = availability();
  qualificationsEdit.after.evidence.qualifications = Array(1);
  assert.throws(
    () => applyAvailabilityCorrections([car], [qualificationsEdit], [source]),
    /Invalid reviewed state/,
  );
});

test("global equipment preflight permits distinct approvals followed by exact per-car application", () => {
  const other = { ...feature, variant_id: "two" };
  const edits = [equipment(), equipment(other, "equipment-2")];
  assert.doesNotThrow(() =>
    validateFeatureCorrectionRegistry(edits, [feature, other]),
  );
  for (const row of [feature, other]) {
    const applied = applyFeatureCorrections(
      [row],
      edits.filter((e) => e.variantId === row.variant_id),
      [source],
    );
    assert.equal(applied[0].variant_id, row.variant_id);
    assert.equal(applied[0].status, "not_verified");
  }
  for (const id of ["", "  "]) {
    assert.throws(
      () =>
        applyFeatureCorrections([feature], [{ ...equipment(), id }], [source]),
      /empty/,
    );
    assert.throws(
      () =>
        applyAvailabilityCorrections(
          [car],
          [{ ...availability(), id }],
          [source],
        ),
      /ID/,
    );
  }
  assert.deepEqual(
    applyFeatureCorrections(
      [feature],
      [{ ...equipment(), status: "rejected" }],
      [],
    ),
    [feature],
  );
  assert.deepEqual(
    applyAvailabilityCorrections(
      [car],
      [{ ...availability(), status: "rejected" }],
      [],
    ),
    [car],
  );
});

test("availability guards each existing evidence field and a stale chained snapshot", () => {
  const changes = [
    { checkedAt: "2026-10-09" },
    { orderStatus: "unverified" },
    { stockStatus: "new_stock_listed" },
    { sourceIds: ["other"] },
    { qualifications: ["Different"] },
  ];
  for (const change of changes) {
    const changed = {
      ...car,
      availabilityEvidence: { ...car.availabilityEvidence!, ...change },
    };
    assert.throws(
      () => applyAvailabilityCorrections([changed], [availability()], [source]),
      /snapshot/,
    );
  }
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [{ ...car, availability: "not_current" }],
        [availability()],
        [source],
      ),
    /snapshot/,
  );
  const first = availability();
  first.after.evidence.qualifications = ["Newly reviewed qualification"];
  const second = {
    ...availability(car, "availability-2"),
    supersedes: first.id,
  };
  assert.throws(
    () => applyAvailabilityCorrections([car], [first, second], [source]),
    /snapshot/,
  );
});

test("availability preserves the exact 45-day source freshness boundary", () => {
  assert.doesNotThrow(() =>
    applyAvailabilityCorrections(
      [car],
      [availability()],
      [{ ...source, accessed_date: "2026-08-26" }],
    ),
  );
  assert.throws(
    () =>
      applyAvailabilityCorrections(
        [car],
        [availability()],
        [{ ...source, accessed_date: "2026-08-25" }],
      ),
    /sources/,
  );
  assert.doesNotThrow(() =>
    applyFeatureCorrections(
      [feature],
      [equipment()],
      [{ ...source, accessed_date: "2026-08-25" }],
    ),
  );
});
