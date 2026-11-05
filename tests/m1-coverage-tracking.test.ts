import assert from "node:assert/strict";
import test from "node:test";
import {
  buildCoverageReport,
  coreFacts,
  formatCoverageReport,
  type ReportInput,
} from "../scripts/reporting/reports";
import {
  combineM1Reconciliations,
  type M1MarketReconciliation,
  type Resolution,
} from "../scripts/reporting/m1-reconciliation";
import type { Car, Fact, Source } from "../src/lib/types";

const asOf = "2026-10-14";
const source: Source = {
  id: "maker",
  url: "https://maker.example/au/specifications",
  title: "Current Australian versions",
  publisher: "Maker",
  source_type: "manufacturer",
  published_date: asOf,
  accessed_date: asOf,
  market: "AU",
  supports: "Exact named Australian version",
};
function fact(key: string): Fact {
  return {
    key,
    label: key,
    value: 100,
    unit: key === "price_aud" ? "AUD" : "",
    basis:
      key === "dc_charge_time_min"
        ? "10–80%"
        : key === "price_aud"
          ? "Before on-road costs"
          : key === "towing_braked_kg"
            ? "Braked towing"
            : "same measurement method",
    comparisonBasis:
      key === "dc_charge_time_min"
        ? "10–80%"
        : key === "price_aud"
          ? "Before on-road costs"
          : key === "towing_braked_kg"
            ? "Braked towing"
            : "same measurement method",
    status: "standard",
    sourceIds: [source.id],
    date: asOf,
    market: "AU",
    scope: "Exact version",
    qualifications: [],
    issues: [],
    buyerGrade: "confirmed",
    gradeReview: {
      reviewedAt: asOf,
      overlayId: "m1-test",
      reason: "Current Australian maker material names this version",
      evidenceScope: "exact_au_version",
      sourceIds: [source.id],
    },
  };
}
function car(): Car {
  return {
    id: "maker-orbit-sedan-standard",
    modelId: "maker-orbit-sedan",
    family: "maker-orbit-sedan",
    slug: "maker-orbit-sedan-standard",
    brand: "Maker",
    model: "Orbit Sedan",
    trim: "Standard",
    generation: "1",
    year: 2026,
    vehicleClass: "passenger",
    drive: "RWD",
    availability: "current_or_order_listed",
    availabilityEvidence: {
      checkedAt: asOf,
      orderStatus: "current_or_order_listed",
      stockStatus: "unverified",
      sourceIds: [source.id],
    },
    facts: Object.fromEntries(coreFacts.map(({ key }) => [key, fact(key)])),
    issues: [],
    buyerSummary: {
      checkedAt: asOf,
      guardSourceIds: [source.id],
      conditions: [],
      strength: {
        label: "Useful",
        text: "Room for five passengers",
        sourceIds: [source.id],
      },
      tradeoff: {
        label: "Consider",
        text: "Check the garage width",
        sourceIds: [source.id],
      },
    },
  };
}
function evidence(): Pick<Resolution, "reviewedAt" | "reason" | "sourceUrls"> {
  return {
    reviewedAt: asOf,
    reason:
      "Exact Australian model/body identity checked against the current maker list",
    sourceUrls: [source.url],
  };
}
function registry(): M1MarketReconciliation {
  const identity = {
    brand: "Maker",
    model: "Orbit Sedan",
    bodyStyle: "sedan",
    vehicleClass: "passenger" as const,
  };
  return {
    schemaVersion: 1,
    checkedAt: asOf,
    notes: [],
    publishedLists: ["first", "second"].map((id) => ({
      id,
      title: `${id} complete model list`,
      publisher: `${id} publisher`,
      independenceKey: `${id} original dataset`,
      independenceReason: "Independently compiled published model list",
      url: `https://${id}.example/au-electric-models`,
      publishedAt: asOf,
      checkedAt: asOf,
      scope: "australian-new-tier1-bevs",
      entries: [{ id: "orbit", ...identity }],
    })),
    currentVersionReviews: [
      {
        id: "orbit-review",
        ...identity,
        modelId: "maker-orbit-sedan",
        checkedAt: asOf,
        officialSourceUrls: [source.url],
        reason: "Complete current official Australian version list transcribed",
        versions: [
          {
            carId: car().id,
            model: "Orbit Sedan",
            trim: "Standard",
            modelYear: 2026,
          },
        ],
      },
    ],
    listResolutions: ["first", "second"].map((listId) => ({
      listId,
      entryId: "orbit",
      outcome: "included",
      modelReviewId: "orbit-review",
      ...evidence(),
    })),
    catalogueOnlyDifferences: [],
    inventoryResolutions: [],
  };
}
function input(): ReportInput {
  return {
    cars: [car()],
    sources: [source],
    features: [],
    inventory: { records: [], unverifiedLeads: [] },
    m1Reconciliation: registry(),
  };
}
const passes = (data: ReportInput, criterion = "C1") =>
  buildCoverageReport(data, asOf).criteria.find(
    (item) => item.id === criterion,
  )!.pass;

test("complete sourced fixture can pass C1 and earn brand completion; empty registry cannot", () => {
  const data = input();
  const report = buildCoverageReport(data, asOf);
  assert.equal(report.reconciliation.pass, true);
  assert.deepEqual(report.brandsDone, ["Maker"]);
  assert.deepEqual(report.brandsRemaining, []);
  assert.ok(report.criteria.every((criterion) => criterion.pass));
  data.m1Reconciliation = {
    ...registry(),
    publishedLists: [],
    currentVersionReviews: [],
    listResolutions: [],
  };
  const empty = buildCoverageReport(data, asOf);
  assert.equal(
    empty.criteria.find((criterion) => criterion.id === "C1")!.pass,
    false,
  );
  assert.deepEqual(empty.brandsDone, []);
  assert.match(empty.brandProgress[0].reason, /C1/);
  assert.equal(empty.reconciliation.evidence!.publishedLists.length, 0);
});

test("two URLs do not establish independence for a shared publisher or underlying model dataset", () => {
  const data = input();
  data.m1Reconciliation!.publishedLists[1].independenceKey =
    data.m1Reconciliation!.publishedLists[0].independenceKey;
  assert.equal(passes(data), false);
  data.m1Reconciliation = registry();
  data.m1Reconciliation.publishedLists[1].publisher =
    data.m1Reconciliation.publishedLists[0].publisher;
  assert.equal(passes(data), false);
  data.m1Reconciliation = registry();
  data.m1Reconciliation.publishedLists[1].entries = [];
  assert.equal(
    passes(data),
    false,
    "empty list snapshots cannot certify completeness",
  );
});

test("each published model difference and each current version must be settled, even when aggregate coverage is full", () => {
  const data = input();
  data.m1Reconciliation!.publishedLists[1].entries.push({
    id: "wagon",
    brand: "Maker",
    model: "Orbit Wagon",
    bodyStyle: "wagon",
    vehicleClass: "passenger",
  });
  assert.equal(passes(data), false);
  assert.ok(
    buildCoverageReport(data, asOf).reconciliation.issues.some(
      (issue) => issue.reference === "second:wagon",
    ),
  );
  data.m1Reconciliation = registry();
  data.cars.push({
    ...car(),
    id: "maker-orbit-sedan-long-range",
    trim: "Long Range",
  });
  assert.equal(
    passes(data),
    false,
    "an unreviewed actual trim keeps the complete current version list open",
  );
});

test("exact C1 identity cannot match a wrong body, trim, model, year or brand", () => {
  for (const change of [
    (data: ReportInput) => {
      data.m1Reconciliation!.publishedLists[1].entries[0].bodyStyle = "wagon";
    },
    (data: ReportInput) => {
      data.m1Reconciliation!.currentVersionReviews[0].versions[0].trim =
        "Long Range";
    },
    (data: ReportInput) => {
      data.m1Reconciliation!.currentVersionReviews[0].versions[0].model =
        "Orbit Wagon";
    },
    (data: ReportInput) => {
      data.m1Reconciliation!.currentVersionReviews[0].versions[0].modelYear = 2025;
    },
    (data: ReportInput) => {
      data.m1Reconciliation!.currentVersionReviews[0].brand = "Other";
    },
    (data: ReportInput) => {
      data.cars[0].facts.body_style = { ...fact("body_style"), value: "wagon" };
    },
  ]) {
    const data = input();
    change(data);
    assert.equal(passes(data), false);
  }
});

test("audit model matching rejects sibling bodies, wrong brands and a declared trim mismatch", () => {
  const data = input();
  data.inventory.records = [
    { brand: "Maker", model: "Orbit Wagon", vehicleClass: "passenger" },
    {
      brand: "Other",
      model: "Orbit Sedan",
      catalogueVariantIds: [car().id],
      vehicleClass: "passenger",
    },
    {
      brand: "Maker",
      model: "Orbit Sedan",
      trim: "Long Range",
      catalogueVariantIds: [car().id],
      vehicleClass: "passenger",
    },
  ];
  const report = buildCoverageReport(data, asOf);
  assert.equal(report.missingModels.length, 3);
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C1")!.pass,
    false,
  );
});

test("exclusions require a valid reason, current evidence and citations; unresolved leads never disappear by name", () => {
  const data = input();
  data.inventory.unverifiedLeads.push({
    id: "not-for-au",
    brand: "Other",
    model: "Not For AU",
    vehicleClass: "passenger",
  });
  assert.equal(passes(data), false);
  data.m1Reconciliation!.inventoryResolutions.push({
    kind: "lead",
    inventoryId: "not-for-au",
    outcome: "excluded",
    exclusionReason: "not_sold_new_in_australia",
    ...evidence(),
  });
  assert.equal(passes(data), true);
  assert.equal(buildCoverageReport(data, asOf).unresolvedLeads.length, 0);
  data.m1Reconciliation!.inventoryResolutions[0].sourceUrls = [];
  assert.equal(passes(data), false);
  data.m1Reconciliation!.inventoryResolutions[0].sourceUrls = [source.url];
  data.m1Reconciliation!.inventoryResolutions[0].reason = "";
  assert.equal(passes(data), false);
  data.m1Reconciliation!.inventoryResolutions[0].reason = "Not sold here";
  data.m1Reconciliation!.inventoryResolutions[0].reviewedAt = "2026-10-15";
  assert.equal(passes(data), false);
});

test("catalogue-only differences are recorded against every independent list, and duplicate or orphan records block closure", () => {
  const data = input();
  data.m1Reconciliation!.publishedLists[1].entries[0] = {
    id: "excluded",
    brand: "Other",
    model: "Other Model",
    bodyStyle: "SUV",
    vehicleClass: "passenger",
  };
  data.m1Reconciliation!.listResolutions[1] = {
    listId: "second",
    entryId: "excluded",
    outcome: "excluded",
    exclusionReason: "not_sold_new_in_australia",
    ...evidence(),
  };
  assert.equal(passes(data), false, "our model is absent from the second list");
  data.m1Reconciliation!.catalogueOnlyDifferences.push({
    listId: "second",
    modelReviewId: "orbit-review",
    ...evidence(),
  });
  assert.equal(passes(data), true);
  data.m1Reconciliation!.listResolutions.push(
    data.m1Reconciliation!.listResolutions[0],
  );
  assert.equal(passes(data), false);
  data.m1Reconciliation = registry();
  data.m1Reconciliation.inventoryResolutions.push({
    kind: "record",
    inventoryId: "does-not-exist",
    outcome: "excluded",
    exclusionReason: "not_sold_new_in_australia",
    ...evidence(),
  });
  assert.equal(passes(data), false);
});

test("C3 counts auditable earned grades, supports honest below-half patterns and never chases a Confirmed quota", () => {
  const data = input();
  const grade = data.cars[0].facts.range_km;
  grade.buyerGrade = "reported";
  grade.gradeReview!.evidenceScope = "secondary_or_sibling";
  grade.gradeReview!.reason =
    "Range comes from the named sibling version because maker version-specific range is unavailable";
  const report = buildCoverageReport(data, asOf);
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C3")!.pass,
    true,
  );
  const range = report.core.find((field) => field.key === "range_km")!;
  assert.equal(range.confirmedPercent, 0);
  assert.match(range.explanation!, /sibling/);
  delete grade.gradeReview;
  const unreviewed = buildCoverageReport(data, asOf);
  assert.equal(
    unreviewed.criteria.find((criterion) => criterion.id === "C3")!.pass,
    false,
  );
  assert.equal(unreviewed.brandProgress[0].unreviewedCoreGrades, 1);
  assert.deepEqual(unreviewed.brandsDone, []);
  assert.match(
    formatCoverageReport(unreviewed, true),
    /C3: 1 core grades unreviewed/,
  );
});

test("Not published needs an explicit two-source unsuccessful search and does not fill a missing core fact", () => {
  const data = input();
  const missing = data.cars[0].facts.boot_l;
  missing.value = null;
  missing.status = "not_verified";
  missing.buyerGrade = "not_published";
  missing.gradeReview!.evidenceScope = "searched_not_found";
  missing.gradeReview!.reason =
    "No boot volume published on either checked source";
  assert.equal(passes(data, "C3"), false);
  data.sources.push({
    ...source,
    id: "second-source",
    url: "https://maker.example/au/brochure",
  });
  missing.gradeReview!.sourceIds.push("second-source");
  missing.sourceIds.push("second-source");
  const report = buildCoverageReport(data, asOf);
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C3")!.pass,
    true,
  );
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C2")!.pass,
    false,
  );
  assert.equal(
    report.core.find((field) => field.key === "boot_l")!.grades[
      "Not published"
    ],
    1,
  );
  assert.equal(report.core.find((field) => field.key === "boot_l")!.filled, 0);
});

test("completion expires for a stale current-list check and the default report remains compact", () => {
  const data = input();
  data.m1Reconciliation!.currentVersionReviews[0].checkedAt = "2026-08-01";
  assert.equal(passes(data), false);
  const report = buildCoverageReport(data, asOf);
  assert.ok(formatCoverageReport(report).split("\n").length <= 26);
  assert.ok(JSON.stringify(report).includes("officialSourceUrls"));
  assert.ok(
    formatCoverageReport(report, true).includes("actual remaining work"),
  );
});

test("a sourced inventory disposition cannot bind a sibling trim or contradict an on-sale model with an exclusion", () => {
  const data = input();
  data.inventory.records = [
    {
      id: "orbit",
      brand: "Maker",
      model: "Orbit Sedan",
      trim: "Long Range",
      vehicleClass: "passenger",
      catalogueVariantIds: [car().id],
    },
  ];
  data.m1Reconciliation!.inventoryResolutions = [
    {
      kind: "record",
      inventoryId: "orbit",
      outcome: "included",
      modelReviewId: "orbit-review",
      ...evidence(),
    },
  ];
  assert.equal(passes(data), false);
  data.inventory.records[0].trim = "Standard";
  assert.equal(passes(data), true);
  data.m1Reconciliation!.inventoryResolutions[0] = {
    kind: "record",
    inventoryId: "orbit",
    outcome: "excluded",
    exclusionReason: "not_sold_new_in_australia",
    ...evidence(),
  };
  assert.equal(
    passes(data),
    false,
    "a current on-sale catalogue model cannot simultaneously be excluded as not sold here",
  );
});

test("brand progress merges accent and case aliases without merging different model identities", () => {
  const data = input();
  data.cars[0].brand = "Škoda";
  data.inventory.unverifiedLeads.push({
    id: "open-skoda",
    brand: "Skoda",
    model: "Other model",
    vehicleClass: "passenger",
  });
  const report = buildCoverageReport(data, asOf);
  assert.equal(
    report.brandProgress.filter((brand) => /koda/i.test(brand.brand)).length,
    1,
  );
  assert.equal(
    report.brandProgress.find((brand) => brand.brand === "Škoda")!
      .unresolvedLeads,
    1,
  );
});

test("brand research can finish with earned two-source gaps while strict coverage remains open", () => {
  const data = input();
  data.sources.push({
    ...source,
    id: "second-source",
    url: "https://maker.example/au/brochure",
  });
  const missing = data.cars[0].facts.dc_charge_time_min;
  missing.value = null;
  missing.status = "not_verified";
  missing.buyerGrade = "not_published";
  missing.gradeReview!.evidenceScope = "searched_not_found";
  missing.gradeReview!.sourceIds.push("second-source");
  missing.sourceIds.push("second-source");
  missing.gradeReview!.reason =
    "Both checked official sources publish 30–80% time only; 10–80% time is not published";
  data.m1Reconciliation!.publishedLists = [];
  data.m1Reconciliation!.listResolutions = [];
  const report = buildCoverageReport(data, asOf);
  assert.deepEqual(report.brandsResearchCompleted, ["Maker"]);
  assert.deepEqual(report.brandsDone, []);
  assert.equal(report.brandProgress[0].researchCompletedAsOf, asOf);
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C1")!.pass,
    false,
  );
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C2")!.pass,
    false,
  );
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C3")!.pass,
    true,
  );
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C5")!.pass,
    false,
  );
  assert.match(
    formatCoverageReport(report),
    /Brands done \(research\): Maker; coverage-qualified \(C1–C6\): none/,
  );
  missing.gradeReview!.sourceIds.pop();
  assert.deepEqual(
    buildCoverageReport(data, asOf).brandsResearchCompleted,
    [],
    "an unfinished unsuccessful search keeps the research queue open",
  );
});

test("report source indexes are invocation-local and recheck changed evidence", () => {
  const data = input();
  data.sources = data.sources.map((item) => ({ ...item }));
  assert.equal(passes(data, "C3"), true);
  data.sources[0].source_type = "secondary_report";
  assert.equal(
    passes(data, "C3"),
    false,
    "a prior source index must not preserve Confirmed after evidence changes",
  );
  data.sources[0].source_type = "manufacturer";
  data.sources[0].publication_hold = true;
  assert.equal(passes(data, "C3"), false);
});

test("unlabelled towing stays outside braked coverage, while a conflicting published 10–80% value stays filled but unranked", () => {
  const data = input();
  data.sources.push({
    ...source,
    id: "handbook",
    url: "https://maker.example/au/handbook",
  });
  const towing = data.cars[0].facts.towing_braked_kg;
  towing.value = null;
  towing.status = "not_verified";
  towing.buyerGrade = "not_published";
  towing.sourceIds.push("handbook");
  towing.gradeReview = {
    reviewedAt: asOf,
    overlayId: "m1-test",
    evidenceScope: "searched_not_found",
    sourceIds: [...towing.sourceIds],
    reason:
      "Brochure and handbook do not state whether the published towing limit is braked",
  };
  data.cars[0].facts.towing_limit_kg = {
    ...fact("towing_limit_kg"),
    value: 750,
    buyerGrade: "check",
    comparisonBasis: "Brake basis not stated",
  };
  const charging = data.cars[0].facts.dc_charge_time_min;
  charging.value = 30;
  charging.buyerGrade = "check";
  charging.gradeReview!.reason =
    "The maker publishes 10–80% at 30 minutes but a shorter 30–100% time; confirm the conflicting figures";
  charging.issues = [
    {
      issue_id: "conflicting-charging-windows",
      title: "Published charging durations conflict",
      priority: "high",
      model_ids: [data.cars[0].modelId],
      publication_action: "Display qualified and exclude from ranking",
      source_ids: [source.id],
    },
  ];
  const report = buildCoverageReport(data, asOf);
  assert.equal(
    report.core.find((field) => field.key === "towing_braked_kg")!.filled,
    0,
  );
  assert.equal(
    report.core.find((field) => field.key === "towing_braked_kg")!.grades[
      "Not published"
    ],
    1,
  );
  assert.equal(
    report.rankings.find((ranking) => ranking.key === "towing_braked_kg")!
      .ranked,
    0,
  );
  assert.equal(
    report.core.find((field) => field.key === "dc_charge_time_min")!.filled,
    1,
  );
  assert.equal(
    report.core.find((field) => field.key === "dc_charge_time_min")!.grades
      .Check,
    1,
  );
  assert.equal(
    report.rankings.find((ranking) => ranking.key === "dc_charge_time_min")!
      .ranked,
    0,
  );
});

test("sourced model-label aliases reconcile naming differences without relaxing body or trim identity", () => {
  const data = input();
  data.m1Reconciliation!.publishedLists[0].entries[0].model =
    "Orbit Electric Sedan";
  data.inventory.records = [
    {
      id: "orbit-alias",
      brand: "Maker",
      model: "Orbit Electric Sedan",
      vehicleClass: "passenger",
    },
  ];
  data.m1Reconciliation!.inventoryResolutions.push({
    kind: "record",
    inventoryId: "orbit-alias",
    outcome: "included",
    modelReviewId: "orbit-review",
    ...evidence(),
  });
  assert.equal(passes(data), false);
  data.m1Reconciliation!.currentVersionReviews[0].publishedModelAliases = [
    {
      name: "Orbit Electric Sedan",
      reason:
        "The maker uses both names for the same sedan body and current version list",
      sourceUrls: [source.url],
    },
  ];
  assert.equal(passes(data), true);
  data.m1Reconciliation!.publishedLists[0].entries[0].bodyStyle = "wagon";
  assert.equal(passes(data), false);
  data.m1Reconciliation!.publishedLists[0].entries[0].bodyStyle = "sedan";
  data.m1Reconciliation!.currentVersionReviews[0].publishedModelAliases[0].sourceUrls =
    [];
  assert.equal(passes(data), false);
});

test("an unknown brake basis cannot fill C2 even when stored under the braked field; expressly prohibited towing retains zero", () => {
  const data = input();
  const towing = data.cars[0].facts.towing_braked_kg;
  towing.value = 750;
  towing.basis = "Maximum total towing capacity";
  towing.comparisonBasis = "Braked status not stated";
  towing.buyerGrade = "check";
  let report = buildCoverageReport(data, asOf);
  assert.equal(
    report.core.find((field) => field.key === "towing_braked_kg")!.filled,
    0,
  );
  assert.match(
    report.gaps.find((gap) => gap.key === "towing_braked_kg")!.reason,
    /braked-towing/,
  );
  towing.value = 0;
  towing.basis = "Towing not permitted";
  towing.comparisonBasis = "Manufacturer towing prohibition";
  towing.buyerGrade = "confirmed";
  report = buildCoverageReport(data, asOf);
  assert.equal(
    report.core.find((field) => field.key === "towing_braked_kg")!.filled,
    1,
  );
});

test("dated registry overlays preserve evidence and never silently overwrite duplicate completion records", () => {
  const data = input();
  const empty = {
    ...registry(),
    publishedLists: [],
    currentVersionReviews: [],
    listResolutions: [],
  };
  const before = JSON.stringify(empty);
  data.m1Reconciliation = combineM1Reconciliations(empty, registry());
  assert.equal(passes(data), true);
  assert.equal(JSON.stringify(empty), before);
  data.m1Reconciliation = combineM1Reconciliations(registry(), registry());
  assert.equal(
    passes(data),
    false,
    "duplicates remain visible blockers rather than last-write-wins completion",
  );
});

test("withdrawn ledger reviews retain filled values while C3 and low-grade explanations fail closed", () => {
  const data = input();
  data.cars[0].facts.range_km.gradeReviewStatus = "review_required";
  const report = buildCoverageReport(data, asOf);
  const range = report.core.find((field) => field.key === "range_km")!;
  assert.equal(range.filledPercent, 100);
  assert.equal(range.confirmedPercent, 0);
  assert.equal(range.grades.Unreviewed, 1);
  assert.match(range.explanation!, /incomplete or invalid evidence/);
  assert.equal(
    report.criteria.find((criterion) => criterion.id === "C3")!.pass,
    false,
  );
});

function reportedFact(
  data: ReportInput,
  key: string,
  value: Fact["value"],
  basis: string,
): Fact {
  const secondary: Source = {
    ...source,
    id: "secondary",
    url: "https://review.example/au/exact-version",
    publisher: "Australian review fixture",
    source_type: "secondary_australian_review",
  };
  data.sources.push(secondary);
  const row = data.cars[0].facts[key];
  Object.assign(row, {
    value,
    basis,
    comparisonBasis: "",
    status: "conditional",
    buyerGrade: "reported",
    resolvedElsewhere: true,
    sourceIds: [secondary.id],
    gradeReview: {
      reviewedAt: asOf,
      overlayId: "m1-secondary-fixture",
      evidenceScope: "secondary_or_sibling",
      sourceIds: [secondary.id],
      reason:
        "Exact-version secondary value; retain its published measurement qualification",
    },
  });
  return row;
}

test("the exact structured braked trailer token fills a reviewed value without admitting Reported rankings", () => {
  for (const location of ["basis", "comparisonBasis"] as const) {
    const data = input();
    const towing = reportedFact(data, "towing_braked_kg", 750, "");
    towing[location] = "braked_trailer_mass";
    towing.qualifications = [
      "Confirm the delivered vehicle rating and approved towing equipment",
    ];
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === "towing_braked_kg")!;
    assert.equal(field.filled, 1, location);
    assert.equal(field.grades.Reported, 1, location);
    assert.equal(field.reviewed, 1, location);
    assert.equal(
      report.rankings.find((row) => row.key === field.key)!.ranked,
      0,
    );
    assert.equal(
      report.gaps.some((gap) => gap.key === field.key),
      false,
    );
    assert.deepEqual(data, before);
  }
});

test("unknown, unbraked and trailer-total near-match tokens never establish a braked basis", () => {
  for (const basis of [
    "unbraked_trailer_mass",
    "total_trailer_mass",
    "unknown_trailer_mass",
    "unknown_braked_trailer_mass",
    "braked_trailer_mass_unknown",
    "braked_trailer_mass_total",
    "braked_trailer_mass_unbraked",
    "braked_trailer_mass_kg",
  ]) {
    const data = input();
    reportedFact(data, "towing_braked_kg", 750, basis);
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === "towing_braked_kg")!;
    assert.equal(field.filled, 0, basis);
    assert.equal(
      field.grades.Reported,
      1,
      "review is independent of strict fill",
    );
    assert.match(
      report.gaps.find((gap) => gap.key === field.key)!.reason,
      /braked-towing/,
    );
    assert.equal(
      report.rankings.find((row) => row.key === field.key)!.ranked,
      0,
    );
    assert.deepEqual(data, before);
  }
});

test("explicit uncertainty still overrides the exact token and review prose never establishes a basis", () => {
  for (const qualify of [
    (row: Fact) => {
      row.qualifications = ["Braked rating not stated"];
    },
    (row: Fact) => {
      row.conditionExplanation = "Braked basis unknown";
    },
    (row: Fact) => {
      row.comparisonBasis = "Without a braked rating";
    },
    (row: Fact) => {
      row.qualifications = ["The source does not establish a braked rating"];
    },
  ]) {
    const data = input();
    const towing = reportedFact(
      data,
      "towing_braked_kg",
      750,
      "braked_trailer_mass",
    );
    qualify(towing);
    const before = structuredClone(data);
    const field = buildCoverageReport(data, asOf).core.find(
      (row) => row.key === towing.key,
    )!;
    assert.equal(field.filled, 0);
    assert.equal(field.grades.Reported, 1);
    assert.deepEqual(data, before);
  }
  const data = input();
  const towing = reportedFact(data, "towing_braked_kg", 750, "Trailer mass");
  towing.gradeReview!.reason =
    "Review prose mentions braked_trailer_mass and braked towing";
  towing.qualifications = ["braked_trailer_mass"];
  towing.conditionExplanation = "braked_trailer_mass";
  const before = structuredClone(data);
  const field = buildCoverageReport(data, asOf).core.find(
    (row) => row.key === towing.key,
  )!;
  assert.equal(field.filled, 0);
  assert.equal(field.grades.Reported, 1);
  assert.deepEqual(data, before);
});

test("reviewed explicit braked zero is retained, while a categorical no-towing label never creates zero", () => {
  for (const [value, basis, filled] of [
    [0, "Explicitly published 0 kg braked towing", 1],
    [0, "Towing not permitted", 1],
    [0, "No Towing", 0],
    [null, "No Towing", 0],
    [null, "Towing not permitted", 0],
    ["No Towing", "Categorical towing label", 0],
  ] as const) {
    const data = input();
    const towing = reportedFact(data, "towing_braked_kg", value, basis);
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === towing.key)!;
    assert.equal(field.filled, filled, `${value}: ${basis}`);
    assert.equal(field.grades.Reported, value === null ? 0 : 1);
    assert.equal(field.grades.Unreviewed, value === null ? 1 : 0);
    assert.equal(
      report.rankings.find((row) => row.key === towing.key)!.ranked,
      0,
    );
    assert.equal(towing.value, value);
    assert.deepEqual(data, before);
  }
});

test("reviewed City charging durations retain their grades while unknown windows remain strict gaps", () => {
  for (const minutes of [35, 32]) {
    const data = input();
    const charging = reportedFact(
      data,
      "dc_charge_time_min",
      minutes,
      "Reported DC duration in minutes; charge window not published in that source",
    );
    charging.qualifications = ["State-of-charge window not established"];
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === charging.key)!;
    assert.equal(field.filled, 0);
    assert.equal(field.grades.Reported, 1);
    assert.equal(field.reviewed, 1);
    assert.equal(field.gradingPasses, true);
    assert.equal(report.criteria.find((row) => row.id === "C2")!.pass, false);
    assert.equal(report.criteria.find((row) => row.id === "C3")!.pass, true);
    assert.match(
      report.gaps.find((gap) => gap.key === charging.key)!.reason,
      /unestablished state-of-charge window/,
    );
    assert.equal(
      report.rankings.find((row) => row.key === charging.key)!.ranked,
      0,
    );
    assert.deepEqual(data, before);
  }
});

test("strict-gap review accounting still rejects missing, invalid, withdrawn and null Reported evidence", () => {
  for (const invalidate of [
    (row: Fact) => {
      delete row.gradeReview;
    },
    (row: Fact) => {
      row.gradeReview!.reason = "";
    },
    (row: Fact) => {
      row.gradeReview!.overlayId = "";
    },
    (row: Fact) => {
      row.gradeReview!.reviewedAt = "2026-02-30";
    },
    (row: Fact) => {
      row.gradeReview!.reviewedAt = "2026-10-15";
    },
    (row: Fact) => {
      row.gradeReview!.evidenceScope = "exact_au_version";
    },
    (row: Fact) => {
      row.gradeReview!.sourceIds = [];
    },
    (row: Fact) => {
      row.sourceIds = [];
    },
    (row: Fact) => {
      row.gradeReviewStatus = "review_required";
    },
    (_row: Fact, data: ReportInput) => {
      data.sources = [data.sources[0]];
    },
    (_row: Fact, data: ReportInput) => {
      data.sources[1].publication_hold = "Review withdrawn";
    },
    (_row: Fact, data: ReportInput) => {
      data.sources[1].access_limitation = "Source no longer readable";
    },
    (row: Fact) => {
      row.value = null;
    },
  ]) {
    const data = input();
    const charging = reportedFact(
      data,
      "dc_charge_time_min",
      35,
      "Charge window not published",
    );
    invalidate(charging, data);
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === charging.key)!;
    assert.equal(field.filled, 0);
    assert.equal(field.grades.Unreviewed, 1);
    assert.equal(field.grades.Reported, 0);
    assert.equal(field.gradingPasses, false);
    assert.equal(report.criteria.find((row) => row.id === "C3")!.pass, false);
    assert.deepEqual(data, before);
  }
});

test("a real null two-source Not published review is unchanged and incomplete searches stay Unreviewed", () => {
  for (const complete of [false, true]) {
    const data = input();
    const charging = data.cars[0].facts.dc_charge_time_min;
    charging.value = null;
    charging.status = "not_verified";
    charging.buyerGrade = "not_published";
    charging.basis = "No 10–80% time found in either checked source";
    charging.comparisonBasis = "";
    charging.gradeReview!.evidenceScope = "searched_not_found";
    charging.gradeReview!.reason =
      "Two distinct sources checked for an exact-version 10–80% duration";
    data.sources.push({
      ...source,
      id: "second-source",
      url: "https://maker.example/au/brochure",
    });
    charging.sourceIds.push("second-source");
    if (complete) charging.gradeReview!.sourceIds.push("second-source");
    const before = structuredClone(data);
    const report = buildCoverageReport(data, asOf);
    const field = report.core.find((row) => row.key === charging.key)!;
    assert.equal(field.filled, 0);
    assert.equal(field.grades["Not published"], complete ? 1 : 0);
    assert.equal(field.grades.Unreviewed, complete ? 0 : 1);
    assert.equal(
      report.rankings.find((row) => row.key === charging.key)!.ranked,
      0,
    );
    assert.deepEqual(data, before);
  }
});

test("earned maker grades rank the exact braked token only with an established basis", () => {
  for (const grade of ["confirmed", "check"] as const) {
    for (const restriction of [
      "none",
      "uncertain",
      "resolvedElsewhere",
    ] as const) {
      const data = input();
      data.cars[0].buyerGradesRequired = true;
      const towing = data.cars[0].facts.towing_braked_kg;
      towing.value = 750;
      towing.basis = "Trailer mass";
      towing.comparisonBasis = "braked_trailer_mass";
      towing.buyerGrade = grade;
      towing.status = grade === "confirmed" ? "standard" : "conditional";
      if (grade === "check")
        towing.conditionExplanation =
          "Rating applies with approved towing equipment";
      if (restriction === "uncertain")
        towing.qualifications = ["Braked basis unknown"];
      if (restriction === "resolvedElsewhere") towing.resolvedElsewhere = true;
      const before = structuredClone(data);
      const report = buildCoverageReport(data, asOf);
      const field = report.core.find((row) => row.key === towing.key)!;
      assert.equal(field.filled, restriction === "uncertain" ? 0 : 1);
      assert.equal(
        field.grades[grade === "confirmed" ? "Confirmed" : "Check"],
        1,
      );
      assert.equal(
        report.rankings.find((row) => row.key === towing.key)!.ranked,
        restriction === "none" ? 1 : 0,
      );
      assert.deepEqual(data, before);
    }
  }
});
