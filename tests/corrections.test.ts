import productionCorrections from "../data/approved-corrections.json";
import test from "node:test";
import assert from "node:assert/strict";
import {
  applyCorrections,
  makeIssueDraft,
  validateFactCorrectionRegistry,
  factConditions,
  type Correction,
} from "../src/lib/corrections";
import type { Fact, Source } from "../src/lib/types";
const source: Source = {
  id: "a",
  url: "https://example.com/specification",
  title: "Exact specification",
  publisher: "Maker",
  source_type: "official",
  published_date: null,
  accessed_date: "2026-10-09",
  market: "AU",
  supports: "Exact fixture claim",
};
const fact: Fact = {
  label: "Claimed range",
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  date: "2026-10-09",
  market: "AU",
  scope: "Exact test configuration",
  key: "range_km",
  value: 500,
  status: "standard",
  sourceIds: ["a"],
  qualifications: [],
  issues: [],
};
const edit: Correction = {
  id: "fix-1",
  variantId: "car-1",
  factKey: "range_km",
  before: 500,
  after: 550,
  status: "approved",
  reviewedBy: "editor",
  reviewedAt: "2026-10-10",
  reason: "Updated exact-trim specification",
  sourceIds: ["a"],
  basis: "WLTP",
  comparisonBasis: "WLTP",
  unit: "km",
  evidenceDate: "2026-10-09",
};
test("approved correction updates shared fact without mutating original", () => {
  const corrected = applyCorrections(
    "car-1",
    { range_km: fact },
    [edit],
    [source],
  );
  assert.equal(corrected.range_km.value, 550);
  assert.equal(fact.value, 500);
});
test("unapproved reports cannot modify facts", () => {
  assert.equal(
    applyCorrections(
      "car-1",
      { range_km: fact },
      [{ ...edit, status: "pending" }],
      [],
    ).range_km.value,
    500,
  );
});
test("conflicting or unsupported corrections fail closed", () => {
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [{ ...edit, before: 600 }],
        [source],
      ),
    /conflict/,
  );
  assert.throws(
    () => applyCorrections("car-1", { range_km: fact }, [edit], []),
    /sources/,
  );
});
test("issue draft binds exact claim and does not approve itself", () => {
  const draft = makeIssueDraft(
    "car-1",
    fact,
    "The quoted range is for a different wheel size.",
    "2026-10-10T00:00:00Z",
    "report-1",
  );
  assert.equal(draft.variantId, "car-1");
  assert.equal(draft.factKey, "range_km");
  assert.equal(draft.status, "pending");
  assert.equal(draft.observedValue, 500);
});

test("impossible or chronologically inconsistent correction dates fail closed", () => {
  for (const change of [
    { reviewedAt: "2026-02-31" },
    { evidenceDate: "2026-10-11" },
  ]) {
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [{ ...edit, ...change }],
          [source],
        ),
      /provenance/,
    );
  }
});

test("approved corrections resolve only explicitly reviewed issues on the exact claim", () => {
  const held = {
    ...fact,
    issues: [{ issue_id: "claim-hold" }] as Fact["issues"],
    qualifications: ["Old qualification"],
  };
  const sources = [source];
  assert.equal(
    applyCorrections("car-1", { range_km: held }, [edit], sources).range_km
      .issues.length,
    1,
  );
  const corrected = applyCorrections(
    "car-1",
    { range_km: held },
    [
      {
        ...edit,
        beforeFact: structuredClone(held),
        resolvedIssueIds: ["claim-hold"],
        qualifications: ["New verified qualification"],
      },
    ],
    sources,
  ).range_km;
  assert.equal(corrected.issues.length, 0);
  assert.equal(corrected.qualifications[0], "New verified qualification");
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: held },
        [
          {
            ...edit,
            beforeFact: structuredClone(held),
            resolvedIssueIds: ["other-claim-hold"],
          },
        ],
        sources,
      ),
    /unknown claim issue/,
  );
});

test("approved corrections can explicitly revise or remove an offer deadline", () => {
  const original = { ...fact, validUntil: "2026-10-31" };
  const changed = applyCorrections(
    "car-1",
    { range_km: original },
    [
      {
        ...edit,
        beforeFact: structuredClone(original),
        validUntil: "2026-11-30",
      },
    ],
    [source],
  );
  assert.equal(changed.range_km.validUntil, "2026-11-30");
  const removed = applyCorrections(
    "car-1",
    { range_km: original },
    [{ ...edit, beforeFact: structuredClone(original), validUntil: null }],
    [source],
  );
  assert.equal(removed.range_km.validUntil, undefined);
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: original },
        [
          {
            ...edit,
            beforeFact: structuredClone(original),
            validUntil: "2026-02-31",
          },
        ],
        [source],
      ),
    /provenance/,
  );
});

test("structured fact corrections compare full JSON values without reference identity", () => {
  const structured: Fact = {
    ...fact,
    key: "components",
    value: { front: 200, rear: 372 },
  };
  const change: Correction = {
    ...edit,
    factKey: "components",
    before: { front: 200, rear: 372 },
    after: { front: 200, rear: 370 },
    unit: "kW",
    basis: "Separate motor ratings",
    comparisonBasis: "Separate motor ratings",
  };
  const result = applyCorrections(
    "car-1",
    { components: structured },
    [change],
    [source],
  );
  assert.deepEqual(result.components.value, { front: 200, rear: 370 });
  assert.deepEqual(structured.value, { front: 200, rear: 372 });
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { components: structured },
        [{ ...change, before: { front: 201, rear: 372 } }],
        [source],
      ),
    /conflict/,
  );
});

test("ordinary approved value edits preserve every non-standard semantic status", () => {
  for (const status of [
    "conditional",
    "optional",
    "subjective",
    "unavailable",
    "not_applicable",
  ] as const) {
    const current = {
      ...fact,
      status,
      qualifications: ["Exact option applies"],
      conditionExplanation: "Confirm the specified wheels",
    };
    const changed = applyCorrections(
      "car-1",
      { range_km: current },
      [edit],
      [source],
    ).range_km;
    assert.equal(changed.status, status);
    assert.equal(changed.conditionExplanation, current.conditionExplanation);
    assert.equal(changed.qualifications[0], current.qualifications[0]);
  }
  const absent = { ...fact, value: false, status: "unavailable" as const };
  assert.equal(
    applyCorrections(
      "car-1",
      { range_km: absent },
      [{ ...edit, before: false, after: false }],
      [source],
    ).range_km.status,
    "unavailable",
  );
});
test("unknown-to-known and nonstandard-to-standard need explicit reviewed semantics and restrictions", () => {
  const unknown = { ...fact, value: null, status: "not_verified" as const };
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: unknown },
        [{ ...edit, before: null }],
        [source],
      ),
    /status/,
  );
  const conditional = {
    ...fact,
    status: "conditional" as const,
    qualifications: ["19-inch wheels"],
    conditionExplanation: "Only with specified wheels",
  };
  const promote = {
    ...edit,
    beforeFact: structuredClone(conditional),
    afterStatus: "standard" as const,
    qualifications: ["WLTP lab claim; real-world range varies"],
    conditionExplanation: null,
  };
  const result = applyCorrections(
    "car-1",
    { range_km: conditional },
    [promote],
    [source],
  ).range_km;
  assert.equal(result.status, "standard");
  assert.equal(result.conditionExplanation, undefined);
  for (const missing of [
    "beforeFact",
    "qualifications",
    "conditionExplanation",
  ] as const) {
    const incomplete = { ...promote };
    delete incomplete[missing];
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: conditional },
          [incomplete],
          [source],
        ),
      /snapshot|explicit reviewed/,
    );
  }
});
test("null withdrawals remain non-rankable and contradictions are rejected", () => {
  assert.equal(
    applyCorrections(
      "car-1",
      { range_km: fact },
      [{ ...edit, after: null }],
      [source],
    ).range_km.status,
    "not_verified",
  );
  for (const [after, status] of [
    [null, "standard"],
    [null, "conditional"],
    [550, "not_verified"],
    [true, "unavailable"],
    [true, "not_applicable"],
  ] as const)
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [{ ...edit, after, afterStatus: status, beforeFact: fact }],
          [source],
        ),
      /status/,
    );
  const noConditions = {
    ...edit,
    afterStatus: "conditional" as const,
    beforeFact: fact,
    qualifications: [],
    conditionExplanation: null,
  };
  assert.throws(
    () =>
      applyCorrections("car-1", { range_km: fact }, [noConditions], [source]),
    /substantive conditions/,
  );
});
test("reviewed metadata snapshots catch drift even when the value stays unchanged", () => {
  const keys = [
    "status",
    "unit",
    "basis",
    "comparisonBasis",
    "date",
    "market",
    "scope",
    "label",
    "qualifications",
    "sourceIds",
    "conditionExplanation",
    "validUntil",
    "issues",
    "resolvedElsewhere",
  ];
  for (const key of keys) {
    const drift = structuredClone(fact) as Fact & Record<string, unknown>;
    drift[key] =
      key === "qualifications" || key === "sourceIds"
        ? ["changed"]
        : key === "issues"
          ? [{ issue_id: "new" }]
          : key === "resolvedElsewhere"
            ? true
            : "changed";
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: drift },
          [{ ...edit, beforeFact: fact }],
          [source],
        ),
      /conflict/,
      key,
    );
  }
  for (const change of [
    { qualifications: [] },
    { conditionExplanation: null },
    { validUntil: null },
    { resolvedIssueIds: ["x"] },
  ])
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [{ ...edit, ...change }],
          [source],
        ),
      /beforeFact/,
    );
});
test("only usable source metadata can support an approved replacement", () => {
  for (const change of [
    { url: "javascript:alert(1)" },
    { url: "https://secret@example.com/spec" },
    { accessed_date: "2026-10-11" },
    { accessed_date: "2026-02-31" },
    { publication_hold: true },
    { access_limitation: "not accessible" },
    { conflict: true },
  ])
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [edit],
          [{ ...source, ...change }],
        ),
      /sources/,
    );
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [{ ...edit, sourceIds: ["a", "a"] }],
        [source],
      ),
    /sources/,
  );
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [edit],
        [source, { ...source }],
      ),
    /sources/,
  );
});
test("structured values are key-order independent, finite and unaliased", () => {
  const current = { ...fact, value: { front: 200, rear: 372 } };
  const update = {
    ...edit,
    before: { rear: 372, front: 200 },
    after: { front: 200, rear: 370 },
  };
  const result = applyCorrections(
    "car-1",
    { range_km: current },
    [update],
    [source],
  ).range_km;
  assert.deepEqual(result.value, { front: 200, rear: 370 });
  (result.value as { rear: number }).rear = 1;
  result.sourceIds.push("x");
  assert.equal(update.after.rear, 370);
  assert.deepEqual(update.sourceIds, ["a"]);
  for (const after of [
    { x: NaN },
    { x: Infinity },
    { x: undefined },
    [undefined],
  ])
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [{ ...edit, after } as Correction],
          [source],
        ),
      /invalid.*value/,
    );
});
test("global correction IDs and targets cannot disappear across variant filters", () => {
  assert.throws(
    () =>
      validateFactCorrectionRegistry(
        [edit, { ...edit, variantId: "car-2" }],
        ["car-1", "car-2"],
      ),
    /Duplicate/,
  );
  assert.throws(
    () => validateFactCorrectionRegistry([edit], []),
    /unknown variant/,
  );
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [{ ...edit, factKey: "missing" }],
        [source],
      ),
    /target/,
  );
  assert.doesNotThrow(() =>
    validateFactCorrectionRegistry(
      [{ ...edit, status: "pending", variantId: "unknown" }],
      [],
    ),
  );
});
test("append-only chains require the exact latest reviewed predecessor", () => {
  const first = { ...edit, beforeFact: fact };
  const afterFirst = applyCorrections(
    "car-1",
    { range_km: fact },
    [first],
    [source],
  ).range_km;
  const second = {
    ...edit,
    id: "fix-2",
    before: 550,
    after: 560,
    beforeFact: structuredClone(afterFirst),
    supersedes: "fix-1",
  };
  assert.equal(
    applyCorrections("car-1", { range_km: fact }, [first, second], [source])
      .range_km.value,
    560,
  );
  for (const supersedes of [undefined, "missing", "fix-2"])
    assert.throws(
      () =>
        applyCorrections(
          "car-1",
          { range_km: fact },
          [first, { ...second, supersedes }],
          [source],
        ),
      /predecessor/,
    );
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [first, { ...second, beforeFact: fact }],
        [source],
      ),
    /conflict/,
  );
  assert.throws(
    () => validateFactCorrectionRegistry([second, first], ["car-1"]),
    /predecessor/,
  );
  assert.equal(
    applyCorrections(
      "car-1",
      { range_km: fact },
      [edit, { ...edit, id: "legacy-2", before: 550, after: 560 }],
      [source],
    ).range_km.value,
    560,
  );
});
test("rejected reports stay inert and explanation-only conditions survive issue drafts", () => {
  assert.deepEqual(
    applyCorrections(
      "car-1",
      { range_km: fact },
      [{ ...edit, status: "rejected", after: NaN }],
      [],
    ),
    { range_km: fact },
  );
  const current = { ...fact, conditionExplanation: "Only on 19-inch wheels" };
  assert.deepEqual(factConditions(current), ["Only on 19-inch wheels"]);
  assert.match(
    makeIssueDraft(
      "car-1",
      current,
      "Please check this range claim.",
      "2026-10-10T00:00:00Z",
      "fixture-report",
    ).observedConditions!,
    /19-inch/,
  );
});

test("the real correction pipeline cannot silently turn conditional range into a ranking", async () => {
  const { rankAttribute } = await import("../src/lib/discovery");
  const conditional: Fact = {
    ...fact,
    status: "conditional",
    conditionExplanation: "Optional wheel configuration only",
    qualifications: [],
  };
  const corrected = applyCorrections(
    "car-1",
    { range_km: conditional },
    [edit],
    [source],
  );
  const car = {
    id: "car-1",
    availability: "current_or_order_listed",
    facts: corrected,
  } as import("../src/lib/types").Car;
  const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
  assert.equal(
    rankAttribute([car], [source], "range_km", policy).groups.length,
    0,
  );
  const promoted = applyCorrections(
    "car-1",
    { range_km: conditional },
    [
      {
        ...edit,
        beforeFact: conditional,
        afterStatus: "standard",
        qualifications: [],
        conditionExplanation: null,
      },
    ],
    [source],
  );
  assert.equal(
    rankAttribute([{ ...car, facts: promoted }], [source], "range_km", policy)
      .groups[0].entries[0].fact.value,
    550,
  );
  assert.equal(
    rankAttribute(
      [{ ...car, facts: promoted }],
      [{ ...source, publication_hold: "Recheck source" }],
      "range_km",
      policy,
    ).groups.length,
    0,
  );
});

test("runtime malformed statuses and sparse JSON values fail closed", () => {
  for (const afterStatus of [null, "approved", ""]) {
    assert.throws(() =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [{ ...edit, beforeFact: fact, afterStatus } as unknown as Correction],
        [source],
      ),
    );
  }
  assert.throws(() =>
    applyCorrections(
      "car-1",
      { range_km: fact },
      [{ ...edit, after: Array(2) }],
      [source],
    ),
  );
});

test("review audit notes cannot substitute for substantive optional conditions", () => {
  const first = applyCorrections(
    "car-1",
    { range_km: fact },
    [edit],
    [source],
  ).range_km;
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [
          edit,
          {
            ...edit,
            id: "fix-2",
            before: first.value,
            beforeFact: first,
            supersedes: edit.id,
            afterStatus: "optional",
            conditionExplanation: null,
          },
        ],
        [source],
      ),
    /substantive conditions/,
  );
});

test("correction history never invents missing legacy semantic status", async () => {
  const { correctionHistoryStatus } = await import("../src/lib/corrections");
  assert.match(
    correctionHistoryStatus({ ...edit, after: null }).after,
    /not recorded/,
  );
  assert.equal(
    correctionHistoryStatus({
      ...edit,
      after: null,
      beforeFact: { ...fact, status: "unavailable" },
    }).after,
    "unavailable",
  );
  assert.equal(
    correctionHistoryStatus({ ...edit, after: null, beforeFact: fact }).after,
    "not_verified",
  );
  assert.equal(correctionHistoryStatus(edit).after, "claim status preserved");
});

test("catalogue approval snapshots match published towing metadata and keep approved replacement basis", async () => {
  const { sourceCatalogue: catalogue, catalogue: currentCatalogue } =
    await import("../src/lib/data");
  const registry = productionCorrections as Correction[];
  assert.equal(registry.length, 0);
  const id = "tesla_model_y__premium_rwd__2";
  const published = catalogue().find((car) => car.id === id)!.facts
    .towing_braked_kg;
  assert.equal(published.comparisonBasis, "Maximum braked towing");
  const fixture: Correction = {
    ...edit,
    id: "isolated-towing-snapshot",
    variantId: id,
    factKey: published.key,
    before: published.value,
    after: published.value,
    beforeFact: published,
    sourceIds: published.sourceIds,
    basis: published.basis,
    unit: published.unit,
    comparisonBasis: "Reviewed exact towing protocol",
    evidenceDate: published.date,
  };
  try {
    registry.push(fixture);
    const result = catalogue().find((car) => car.id === id)!.facts
      .towing_braked_kg;
    assert.equal(result.comparisonBasis, fixture.comparisonBasis);
    assert.equal(result.status, published.status);
    // A later reviewed brand packet must not replay over a changed historical
    // input. Its exact guard blocks that stale approval until re-reviewed.
    assert.throws(
      () => currentCatalogue(),
      /fact before snapshot changed: tesla_model_y__premium_rwd__2\/towing_braked_kg/,
    );
  } finally {
    registry.length = 0;
  }
  assert.equal(registry.length, 0);
});

test("unusual valid correction IDs cannot turn audit text into conditions", () => {
  const firstEdit = { ...edit, id: ":review-id" };
  const first = applyCorrections(
    "car-1",
    { range_km: fact },
    [firstEdit],
    [source],
  ).range_km;
  assert.throws(
    () =>
      applyCorrections(
        "car-1",
        { range_km: fact },
        [
          firstEdit,
          {
            ...edit,
            id: "second",
            before: first.value,
            beforeFact: first,
            supersedes: firstEdit.id,
            afterStatus: "conditional",
            conditionExplanation: null,
          },
        ],
        [source],
      ),
    /substantive conditions/,
  );
});
