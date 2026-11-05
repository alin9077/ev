import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Detail from "../src/components/detail";
import { FeatureValue, featureEvidence } from "../src/components/ui";
import {
  applyBrandFeatureUpdates,
  applyBrandUpdates,
  brandVersionSnapshot,
  prepareBrandResearch,
  type BrandUpdatePacket,
} from "../src/lib/brand-updates";
import { featureClaim } from "../src/lib/citable";
import { availabilitySnapshot } from "../src/lib/availability-corrections";
import {
  buyerGradeOf,
  gradeLabel,
  hasEarnedBuyerGrade,
} from "../src/lib/evidence-grading";
import { rankAttribute } from "../src/lib/discovery";
import { sameReviewedState } from "../src/lib/correction-guards";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
import { compiledSource } from "./helpers/compiled-source";
import type {
  Car,
  Fact,
  Feature,
  Pack,
  Research,
  Source,
} from "../src/lib/types";

function fixture() {
  const source: Source = {
    id: "fixture-maker-2026-10-14",
    url: "https://maker.example/au/specifications",
    title: "Synthetic fixture specification",
    publisher: "Maker",
    source_type: "manufacturer",
    published_date: null,
    accessed_date: "2026-10-14",
    market: "AU",
    supports: "Synthetic exact-version measurements for behavioural tests",
  };
  const fact: Fact = {
    key: "range_km",
    label: "Claimed range",
    value: 450,
    unit: "km",
    basis: "WLTP",
    comparisonBasis: "WLTP",
    status: "standard",
    sourceIds: [source.id],
    date: "2026-10-14",
    market: "AU",
    scope: "Maker Example Base",
    qualifications: [],
    issues: [],
  };
  const car: Car = {
    id: "fixture_maker_example__base__1",
    modelId: "fixture_maker_example",
    family: "fixture-maker-example",
    slug: "base-1",
    brand: "Maker",
    model: "Example",
    trim: "Base",
    year: null,
    generation: "Current",
    drive: "RWD",
    vehicleClass: "passenger",
    availability: "current_or_order_listed",
    availabilityEvidence: {
      checkedAt: "2026-10-14",
      orderStatus: "unverified",
      stockStatus: "unverified",
      sourceIds: [source.id],
      qualifications: ["Stock unverified."],
    },
    facts: {
      range_km: fact,
      seats: {
        ...fact,
        key: "seats",
        label: "Seats",
        value: 5,
        unit: "",
        basis: "Occupied seats",
        comparisonBasis: "Occupied seats",
      },
    },
    issues: [],
  };
  const research: Research = {
    schema_version: "fixture",
    metadata: {
      as_of: "2026-10-14",
      baseline_variant_id: car.id,
      record_count: 1,
      criterion_count: 1,
      feature_row_count: 1,
    },
    models: [
      {
        id: car.modelId,
        brand: car.brand,
        model: car.model,
        generation: car.generation,
      },
    ],
    variants: [
      {
        id: car.id,
        model_id: car.modelId,
        brand: car.brand,
        model: car.model,
        trim: car.trim,
        model_year: null,
        record_state: car.availability,
        price_aud: null,
        price_basis: "",
        range_km: null,
        range_cycle: "",
        seats: null,
        source_ids: [source.id],
        notes: [],
        variant_review_date: "2026-10-14",
        drive: "RWD",
        vehicle_class: "passenger",
      },
    ],
    criteria: [
      {
        key: "fixture",
        label: "Fixture",
        group: "Fixture",
        definition: "Fixture",
      },
    ],
    trim_equipment: [{ variant_id: car.id, source_ids: [] }],
    feature_evidence: [
      {
        variant_id: car.id,
        model_id: car.modelId,
        criterion: "fixture",
        value: "Needs confirmation",
        status: "not_verified",
        conditions: "Unknown",
        source_ids: [],
        evidence_scope: "Fixture",
        last_evidence_date: "2026-10-14",
        reviewed_date: "2026-10-14",
        verification_state: "unverified",
      },
    ],
    update_eligibility: [
      {
        variant_id: car.id,
        model_id: car.modelId,
        documented_family_minimum: null,
        exact_total_known: false,
        exact_total: null,
        scope: "Unknown",
        meaning: "Research pending",
        source_ids: [],
        observation_window_start: "2026-10-14",
        observation_window_end: "2026-10-14",
      },
    ],
    update_events: [],
    configuration_history: [],
    sources: [source],
    publication_issues: [],
    prior_update_summary: [],
  };
  const packet: BrandUpdatePacket = {
    schemaVersion: 1,
    id: "m1-fixture-2026-10-14",
    brand: car.brand,
    reviewedAt: "2026-10-14",
    reviewedBy: "Fixture review",
    sources: [source],
    models: [],
    variants: [],
    versionGuards: [{ variantId: car.id, before: brandVersionSnapshot(car) }],
    versionUpdates: [],
    facts: [],
    availability: [],
    summaries: [],
  };
  const grade = (input: Fact, owner = packet): Fact => ({
    ...structuredClone(input),
    buyerGrade: "confirmed",
    gradeReview: {
      reviewedAt: owner.reviewedAt,
      overlayId: owner.id,
      reason: "Exact Australian version confirmed by maker fixture",
      evidenceScope: "exact_au_version",
      sourceIds: [...input.sourceIds],
    },
  });
  return { car, source, fact, research, packet, grade };
}

function featureFixture() {
  const data = fixture();
  const { car, fact, grade, research, packet } = data;
  const before: Feature = {
    ...research.feature_evidence[0],
    gradeReviewStatus: "review_required",
  };
  research.feature_evidence = [before];
  const afterFact = grade({ ...fact, value: 470 });
  packet.facts = [{ variantId: car.id, before: fact, after: afterFact }];
  const after: Feature = {
    ...before,
    value: "470 km WLTP",
    status: "standard",
    conditions: "",
    source_ids: afterFact.sourceIds,
    buyerGrade: "confirmed",
    gradeReview: structuredClone(afterFact.gradeReview),
    evidence_scope: "Exact Australian version",
    verification_state: "reviewed_exact_version",
  };
  packet.features = [
    {
      variantId: car.id,
      criterion: before.criterion,
      before,
      after,
      dependencies: [{ key: fact.key, expected: afterFact }],
    },
  ];
  const apply = (
    owner = packet,
    inputCar = car,
    inputResearch = research,
    inputFeatures = [before],
  ) => {
    const prepared = prepareBrandResearch(inputResearch, [owner]);
    const updated = applyBrandUpdates([inputCar], prepared, [owner])[0];
    return applyBrandFeatureUpdates(updated, inputFeatures, prepared, [owner]);
  };
  return { ...data, before, after, afterFact, apply };
}

function unpublishedFeatureFixture() {
  const data = featureFixture();
  const { car, packet, after } = data;
  const second: Source = {
    ...data.source,
    id: "fixture-second-search",
    url: "https://maker.example/au/manual",
    title: "Synthetic fixture manual",
    supports: "Second synthetic source searched for the fixture equipment",
  };
  packet.sources.push(second);
  const sourceIds = packet.sources.map((source) => source.id);
  const unknown: Fact = {
    ...data.fact,
    key: `feature_${after.criterion}`,
    label: "Fixture equipment publication",
    value: null,
    unit: "",
    basis: "Exact-version equipment searched in the specification and manual",
    comparisonBasis: "",
    status: "not_verified",
    sourceIds,
    buyerGrade: "not_published",
    gradeReview: {
      reviewedAt: packet.reviewedAt,
      overlayId: packet.id,
      reason:
        "No exact-version equipment answer found in the two searched fixture sources.",
      evidenceScope: "searched_not_found",
      sourceIds,
    },
  };
  packet.facts = [{ variantId: car.id, before: null, after: unknown }];
  Object.assign(after, {
    value: "Not published",
    status: "not_verified",
    conditions: unknown.gradeReview!.reason,
    source_ids: [...sourceIds],
    buyerGrade: "not_published",
    gradeReview: structuredClone(unknown.gradeReview),
    verification_state: "searched_not_found",
  });
  packet.features![0].dependencies = [{ key: unknown.key, expected: unknown }];
  return { ...data, afterFact: unknown };
}

test("a two-source whole-row equipment search earns Not published without changing the input", () => {
  const { car, packet, research, afterFact, apply } =
    unpublishedFeatureFixture();
  const original = structuredClone({ car, packet, research });
  const [feature] = apply();
  assert.equal(feature.value, "Not published");
  assert.equal(feature.status, "not_verified");
  assert.equal(buyerGradeOf(feature), "not_published");
  assert.equal(gradeLabel(feature.buyerGrade!), "Not published");
  assert.equal(
    hasEarnedBuyerGrade(feature, packet.sources, packet.reviewedAt),
    true,
  );
  assert.equal(
    hasEarnedBuyerGrade(afterFact, packet.sources, packet.reviewedAt),
    true,
  );
  assert.equal(afterFact.value, null);
  assert.equal(Object.hasOwn(feature, "gradeReviewStatus"), false);
  assert.deepEqual({ car, packet, research }, original);
});

test("whole-row missing equipment needs canonical text, status and a genuine two-source review", () => {
  const { packet, apply } = unpublishedFeatureFixture();
  for (const value of [
    "unknown",
    "Needs confirmation",
    "Included",
    "Not published ",
    "not published",
    "Not published; 470 km WLTP",
  ]) {
    const edited = structuredClone(packet);
    edited.features![0].after.value = value;
    assert.throws(() => apply(edited), /unearned grade/, value);
  }
  for (const status of [
    "standard",
    "conditional",
    "optional",
    "unavailable",
    "not_applicable",
    "subjective",
  ] as const) {
    const edited = structuredClone(packet);
    edited.features![0].after.status = status;
    assert.throws(
      () => apply(edited),
      /unearned grade|grade\/status mismatch/,
      status,
    );
  }
  for (const change of [
    (row: BrandUpdatePacket) => {
      const feature = row.features![0].after;
      feature.source_ids = [row.sources[0].id];
      feature.gradeReview!.sourceIds = [...feature.source_ids];
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].url = `${row.sources[0].url}#another-section`;
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].url = "javascript:alert(1)";
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].access_limitation = "Unable to read";
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].publication_hold = true;
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].conflict = true;
    },
    (row: BrandUpdatePacket) => {
      row.sources[1].accessed_date = "2026-10-15";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].after.gradeReview!.evidenceScope = "exact_au_version";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].after.gradeReview!.reason = "";
    },
  ]) {
    const edited = structuredClone(packet);
    change(edited);
    assert.throws(() => apply(edited), /Brand update:/);
  }
});

test("Not published Fact values remain null-only, including hybrid citation shapes", () => {
  const { packet, afterFact, after, apply } = unpublishedFeatureFixture();
  const sources = packet.sources;
  for (const value of ["Not published", "unknown", 0, false]) {
    const forged = { ...afterFact, value };
    assert.equal(
      hasEarnedBuyerGrade(forged, sources, packet.reviewedAt),
      false,
    );
    const hybrid = { ...forged, source_ids: [...forged.sourceIds] };
    assert.equal(
      hasEarnedBuyerGrade(hybrid, sources, packet.reviewedAt),
      false,
    );
    const edited = structuredClone(packet);
    edited.facts[0].after = hybrid;
    edited.features![0].dependencies[0].expected = hybrid;
    assert.throws(() => apply(edited), /invalid fact or unearned grade/);
  }
  assert.equal(
    hasEarnedBuyerGrade(
      { ...after, sourceIds: after.source_ids },
      sources,
      packet.reviewedAt,
    ),
    false,
  );
  assert.equal(
    hasEarnedBuyerGrade(
      { ...afterFact, status: "standard" },
      sources,
      packet.reviewedAt,
    ),
    false,
  );
  assert.equal(
    hasEarnedBuyerGrade(
      { ...after, gradeReviewStatus: "review_required" },
      sources,
      packet.reviewedAt,
    ),
    false,
  );
});

test("a whole-row search cannot use an unrelated missing fact or known brochure/numeric proxy", () => {
  const { packet, grade, apply } = unpublishedFeatureFixture();
  for (const replacement of [
    { ...packet.facts[0].after, key: "folded_l" },
    grade({
      ...packet.facts[0].after,
      key: "brochure_exists",
      value: true,
      status: "standard",
    }),
    grade({
      ...packet.facts[0].after,
      key: "seats",
      value: 5,
      status: "standard",
    }),
    grade({
      ...packet.facts[0].after,
      value: "Brochure found",
      status: "standard",
    }),
  ]) {
    const edited = structuredClone(packet);
    // Use a new key where necessary so a before-snapshot error cannot mask the binding check.
    if (replacement.key === "seats") replacement.key = "fixture_seat_count";
    edited.facts[0].after = replacement;
    edited.features![0].dependencies = [
      { key: replacement.key, expected: replacement },
    ];
    assert.throws(() => apply(edited), /missing criterion search dependency/);
  }
});

test("whole-row searches still reject exact before, source, identity and dependency drift", () => {
  const { car, research, before, packet, apply } = unpublishedFeatureFixture();
  for (const change of [
    (row: BrandUpdatePacket) => {
      row.features![0].before.conditions = "Changed before qualification";
    },
    (row: BrandUpdatePacket) => {
      row.sources[0].supports = "Changed source snapshot";
    },
    (row: BrandUpdatePacket) => {
      row.versionGuards[0].before.trim = "Other trim";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies[0].expected.qualifications.push(
        "Unreviewed drift",
      );
    },
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies[0].expected.gradeReview!.reason +=
        " Changed";
    },
  ]) {
    const edited = structuredClone(packet);
    // JSON serialization breaks any fixture aliases just as a saved packet does.
    const serialized = JSON.parse(JSON.stringify(edited)) as BrandUpdatePacket;
    change(serialized);
    assert.throws(() => apply(serialized), /Brand update:/);
  }
  const prepared = prepareBrandResearch(research, [packet]);
  const updated = applyBrandUpdates([car], prepared, [packet])[0];
  updated.facts[packet.facts[0].after.key].qualifications.push(
    "Changed after review",
  );
  assert.throws(
    () => applyBrandFeatureUpdates(updated, [before], prepared, [packet]),
    /feature dependency changed/,
  );
});

test("reviewed missing equipment and null facts never become ranking values", () => {
  const { car, packet, afterFact, apply } = unpublishedFeatureFixture();
  assert.equal(apply()[0].buyerGrade, "not_published");
  for (const value of [null, "Not published", 999]) {
    const input: Car = {
      ...car,
      buyerGradesRequired: true,
      facts: {
        ...car.facts,
        range_km: { ...afterFact, key: "range_km", value },
      },
    };
    const ranked = rankAttribute([input], packet.sources, "range_km", {
      asOf: packet.reviewedAt,
    });
    assert.equal(ranked.groups.length, 0);
    assert.equal(ranked.excluded.length, 1);
  }
});

test("reviewed feature replacement preserves inputs and carries its new citations and grade", () => {
  const { car, research, packet, before, after, apply } = featureFixture();
  const original = structuredClone({ car, research, packet, before, after });
  const [updated] = apply();
  assert.equal(updated.value, "470 km WLTP");
  assert.equal(updated.buyerGrade, "confirmed");
  assert.equal(updated.gradeReview?.overlayId, packet.id);
  assert.equal(Object.hasOwn(updated, "gradeReviewStatus"), false);
  assert.deepEqual(updated.source_ids, after.source_ids);
  assert.notEqual(updated, after);
  assert.deepEqual({ car, research, packet, before, after }, original);
  assert.equal(
    applyBrandFeatureUpdates(car, [before], research, [])[0],
    before,
  );
});

test("feature target, exact before metadata, version and source snapshots fail closed", () => {
  const { car, research, packet, before, apply } = featureFixture();
  for (const change of [
    (row: BrandUpdatePacket) => {
      row.features![0].variantId = "wrong";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].criterion = "unknown";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].before.conditions = "Different qualification";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].after.model_id = "wrong_model";
    },
    (row: BrandUpdatePacket) => {
      row.features!.push(structuredClone(row.features![0]));
    },
    (row: BrandUpdatePacket) => {
      row.versionGuards = [];
    },
    (row: BrandUpdatePacket) => {
      row.sources[0].supports = "Changed source scope";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].after.source_ids = ["missing"];
    },
  ]) {
    const edited = structuredClone(packet);
    change(edited);
    assert.throws(() => apply(edited), /Brand update:/);
  }
  assert.throws(
    () => apply(packet, { ...car, trim: "Other" }),
    /version changed/,
  );
  const updated = applyBrandUpdates([car], research, [packet])[0];
  assert.throws(
    () =>
      applyBrandFeatureUpdates(
        { ...updated, trim: "Other" },
        [before],
        research,
        [packet],
      ),
    /version changed/,
  );
  assert.throws(
    () =>
      applyBrandFeatureUpdates(updated, [before, before], research, [packet]),
    /before snapshot changed/,
  );
});

test("feature grades require current review provenance and full matching citations", () => {
  const { packet, apply } = featureFixture();
  for (const change of [
    (feature: Feature) => {
      feature.gradeReview!.overlayId = "old-review";
    },
    (feature: Feature) => {
      feature.gradeReview!.reviewedAt = "2026-10-13";
    },
    (feature: Feature) => {
      feature.reviewed_date = "2026-10-13";
    },
    (feature: Feature) => {
      feature.last_evidence_date = "2026-10-15";
    },
    (feature: Feature) => {
      feature.gradeReview!.sourceIds = [];
    },
    (feature: Feature) => {
      feature.gradeReview!.reason = "";
    },
    (feature: Feature) => {
      feature.buyerGrade = "reported";
    },
    (feature: Feature) => {
      feature.buyerGrade = "not_published";
      feature.value = "Not published";
    },
    (feature: Feature) => {
      feature.buyerGrade = "check";
      feature.status = "conditional";
      feature.conditions = "";
    },
  ]) {
    const edited = structuredClone(packet);
    change(edited.features![0].after);
    assert.throws(() => apply(edited), /unearned grade|grade\/status mismatch/);
  }
});

test("Confirmed equipment keeps explicitly reviewed optional, unavailable and not-applicable fitment", () => {
  const { packet, apply } = featureFixture();
  for (const status of ["optional", "unavailable", "not_applicable"] as const) {
    const edited = structuredClone(packet);
    edited.features![0].after.status = status;
    edited.features![0].after.conditions =
      "Explicitly reviewed equipment fitment.";
    assert.equal(apply(edited)[0].status, status);
  }
  const check = structuredClone(packet);
  check.features![0].after.buyerGrade = "check";
  check.features![0].after.status = "conditional";
  check.features![0].after.conditions = "Requires the optional wheel package.";
  assert.equal(apply(check)[0].buyerGrade, "check");
});

test("dependencies must exactly match post-packet facts", () => {
  const { packet, apply, car, research } = featureFixture();
  for (const change of [
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies[0].expected = {
        ...row.features![0].dependencies[0].expected,
        value: 999,
      };
    },
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies[0].key = "seats";
    },
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies = [];
    },
    (row: BrandUpdatePacket) => {
      row.features![0].dependencies.push(
        structuredClone(row.features![0].dependencies[0]),
      );
    },
  ]) {
    const edited = structuredClone(packet);
    change(edited);
    assert.throws(() => apply(edited), /feature dependenc/);
  }
  const updated = applyBrandUpdates([car], research, [packet])[0];
  updated.facts.range_km = {
    ...updated.facts.range_km,
    qualifications: ["Changed later"],
  };
  assert.throws(
    () =>
      applyBrandFeatureUpdates(
        updated,
        [packet.features![0].before],
        research,
        [packet],
      ),
    /feature dependency changed/,
  );
});

test("a mixed feature can cite an earned null Not published fact without weakening fact grading", () => {
  const { packet, research, fact, apply } = featureFixture();
  const second: Source = {
    ...research.sources[0],
    id: "second-search",
    url: "https://maker.example/au/manual",
  };
  packet.sources.push(second);
  const unknown: Fact = {
    ...fact,
    key: "folded_l",
    value: null,
    status: "not_verified",
    sourceIds: packet.sources.map((source) => source.id),
    buyerGrade: "not_published",
    gradeReview: {
      reviewedAt: packet.reviewedAt,
      overlayId: packet.id,
      reason: "No folded cargo measurement found in two current maker sources.",
      evidenceScope: "searched_not_found",
      sourceIds: packet.sources.map((source) => source.id),
    },
  };
  packet.facts.push({
    variantId: packet.features![0].variantId,
    before: null,
    after: unknown,
  });
  packet.features![0].dependencies.push({
    key: unknown.key,
    expected: unknown,
  });
  packet.features![0].after.value += "; folded cargo Not published";
  packet.features![0].after.source_ids = [...unknown.sourceIds];
  packet.features![0].after.gradeReview!.sourceIds = [...unknown.sourceIds];
  assert.equal(apply()[0].buyerGrade, "confirmed");
});

test("later fact changes require a reviewed feature replacement and replay exact before states", () => {
  const { car, research, packet, before, grade } = featureFixture();
  const firstCar = applyBrandUpdates([car], research, [packet])[0];
  const firstFeature = applyBrandFeatureUpdates(firstCar, [before], research, [
    packet,
  ])[0];
  const second: BrandUpdatePacket = {
    ...structuredClone(packet),
    id: "m1-fixture-2026-10-15",
    reviewedAt: "2026-10-15",
    features: [],
    facts: [],
  };
  const updatedFact = grade(
    { ...firstCar.facts.range_km, value: 480, date: second.reviewedAt },
    second,
  );
  second.facts = [
    { variantId: car.id, before: firstCar.facts.range_km, after: updatedFact },
  ];
  assert.throws(
    () => applyBrandUpdates([car], research, [packet, second]),
    /feature dependency changed/,
  );
  const after: Feature = {
    ...firstFeature,
    value: "480 km WLTP",
    reviewed_date: second.reviewedAt,
    last_evidence_date: second.reviewedAt,
    gradeReview: structuredClone(updatedFact.gradeReview),
  };
  second.features = [
    {
      variantId: car.id,
      criterion: before.criterion,
      before: firstFeature,
      after,
      dependencies: [{ key: updatedFact.key, expected: updatedFact }],
    },
  ];
  const finalCar = applyBrandUpdates([car], research, [packet, second])[0];
  assert.equal(
    applyBrandFeatureUpdates(finalCar, [before], research, [packet, second])[0]
      .value,
    "480 km WLTP",
  );
  second.features[0].before = before;
  assert.throws(
    () =>
      applyBrandFeatureUpdates(finalCar, [before], research, [packet, second]),
    /before snapshot changed/,
  );
});

test("canonical driveaway and roadside equipment rows cannot be manually overwritten", () => {
  const { packet, research, car, apply } = featureFixture();
  for (const criterion of ["driveaway_price", "roadside_assistance"]) {
    const edited = structuredClone(packet);
    edited.features![0].criterion = criterion;
    edited.features![0].before.criterion = criterion;
    edited.features![0].after.criterion = criterion;
    const data = structuredClone(research);
    data.criteria[0].key = criterion;
    data.feature_evidence[0].criterion = criterion;
    assert.throws(() => apply(edited, car, data), /canonical feature target/);
  }
});

function currentFixturePack({
  car,
  research: inputResearch,
  packet,
  before,
}: ReturnType<typeof featureFixture>) {
  const research = prepareBrandResearch(inputResearch, [packet]);
  const updated = applyBrandUpdates([car], research, [packet])[0];
  return featureDataModule([packet], [before]).pack(car.id, {
    data: research,
    cars: [updated],
  });
}

function featureDataModule(packets: BrandUpdatePacket[], regraded?: Feature[]) {
  const emptyOverlay = {
    features: [],
    facts: [],
    sources: [],
    criteria: [],
    issues: [],
    eligibility: [],
    configuration: [],
  };
  const overrides: Record<string, unknown> = {
    "./brand-update-registry": { brandUpdatePackets: packets },
    "./retained-fact-fills": {},
    "./price-ladder": {},
    ...(regraded
      ? { "./evidence-regrading": { applyFeatureRegrading: () => regraded } }
      : {}),
    "./catalogue-additions": {
      catalogueAdditions: { ...emptyOverlay, variants: [] },
    },
    "./buyer-proposal": { buyerProposal: {} },
    "./launch-evidence": { auditedFeature: (feature: Feature) => feature },
  };
  for (const name of [
    "refinement",
    "usability",
    "sales",
    "completion",
    "editorial",
    "buyer",
  ])
    overrides[
      `../../data/research-${name}-2026-10-${["completion", "editorial", "buyer"].includes(name) ? "07" : "06"}.json`
    ] = emptyOverlay;
  for (const name of [
    "approved-feature-corrections",
    "approved-availability-corrections",
    "approved-corrections",
    "research-refresh-2026-10-10",
  ])
    overrides[`../../data/${name}.json`] = [];
  return compiledSource("src/lib/data.ts", {
    ...overrides,
    "./evidence-consumers": compiledSource("src/lib/evidence-consumers.ts", overrides),
  }) as {
    pack(id: string, snapshot: { data: Research; cars: Car[] }): Pack;
    sourceEffectiveFeatures(car: Car, data: Research): Feature[];
  };
}

function currentAvailability(packet: BrandUpdatePacket, car: Car) {
  packet.availability = [
    {
      id: `${packet.id}-availability`,
      variantId: car.id,
      before: availabilitySnapshot(car),
      after: {
        availability: "current_or_order_listed",
        evidence: {
          checkedAt: packet.reviewedAt,
          orderStatus: "accepting_orders_advertised",
          stockStatus: "unverified",
          sourceIds: [packet.sources[0].id],
          qualifications: ["Physical stock remains unverified."],
        },
      },
      status: "approved",
      reviewedBy: packet.reviewedBy,
      reviewedAt: packet.reviewedAt,
      evidenceDate: packet.reviewedAt,
      reason: "Synthetic fixture now advertises this exact version.",
    },
  ];
}

test("current metadata and availability preserve historical feature warnings through cloned and chained research", () => {
  const { car, research, packet } = featureFixture();
  car.availability = "announced_provisional";
  research.variants[0].record_state = car.availability;
  research.publication_issues.push({
    issue_id: "V2-06",
    title: "Provisional version",
    priority: "high",
    model_ids: [car.modelId],
    publication_action: "Original provisional warning.",
    source_ids: [packet.sources[0].id],
  });
  const pipeline = featureDataModule([packet]);
  const baseline = pipeline.sourceEffectiveFeatures(car, research);
  assert.match(baseline[0].conditions, /Original provisional warning/);
  assert.deepEqual(baseline[0].source_ids, [packet.sources[0].id]);
  packet.features![0].before = baseline[0];
  delete packet.features![0].after.gradeReviewStatus;
  const identity = brandVersionSnapshot(car);
  packet.versionUpdates = [
    {
      variantId: car.id,
      before: identity,
      after: { ...identity, trim: "Current Base", generation: "Reviewed" },
      reason: "Synthetic current identity review.",
    },
  ];
  currentAvailability(packet, car);
  const input = structuredClone({ car, research, packet });
  const prepared = prepareBrandResearch(research, [packet]);
  const updated = applyBrandUpdates([car], prepared, [packet])[0];
  assert.equal(prepared.variants[0].record_state, "current_or_order_listed");
  assert.equal(prepared.variants[0].trim, "Current Base");
  assert.equal(updated.trim, "Current Base");
  assert.equal(updated.generation, "Reviewed");
  assert.deepEqual(availabilitySnapshot(updated), packet.availability[0].after);
  assert.deepEqual(
    prepared.variants[0].availability_evidence,
    updated.availabilityEvidence,
  );
  assert.equal(research.feature_evidence_variant_context, undefined);
  for (const data of [
    prepared,
    structuredClone(prepared),
    JSON.parse(JSON.stringify(prepared)),
  ]) {
    assert.deepEqual(pipeline.sourceEffectiveFeatures(updated, data), baseline);
    assert.deepEqual(
      pipeline.pack(car.id, { data, cars: [updated] }).features,
      [packet.features![0].after],
    );
  }
  assert.deepEqual(prepareBrandResearch(research, [packet]), prepared);
  assert.deepEqual({ car, research, packet }, input);

  const next: BrandUpdatePacket = {
    ...structuredClone(packet),
    id: "m1-fixture-2026-10-15",
    reviewedAt: "2026-10-15",
    versionGuards: [
      { variantId: car.id, before: brandVersionSnapshot(updated) },
    ],
    versionUpdates: [],
    facts: [],
    features: [],
    availability: [],
  };
  currentAvailability(next, updated);
  const chained = prepareBrandResearch(JSON.parse(JSON.stringify(prepared)), [
    next,
  ]);
  const together = prepareBrandResearch(research, [packet, next]);
  assert.deepEqual(
    chained.feature_evidence_variant_context,
    together.feature_evidence_variant_context,
  );
  assert.notEqual(
    chained.feature_evidence_variant_context,
    prepared.feature_evidence_variant_context,
  );
  assert.notEqual(
    chained.feature_evidence_variant_context![0],
    prepared.feature_evidence_variant_context![0],
  );
  const final = applyBrandUpdates([car], together, [packet, next])[0];
  const replay = featureDataModule([packet, next]);
  assert.deepEqual(replay.sourceEffectiveFeatures(final, chained), baseline);
  assert.deepEqual(
    replay.pack(car.id, { data: chained, cars: [final] }).features,
    [packet.features![0].after],
  );
  const changed = structuredClone(baseline);
  changed[0].source_ids = [];
  assert.throws(
    () => applyBrandFeatureUpdates(final, changed, chained, [packet, next]),
    /feature before snapshot changed/,
  );
});

test("new packet versions retain their admission warning context before same-packet availability changes", () => {
  const { research, packet, car, fact, grade } = fixture();
  const variant = {
    ...research.variants[0],
    record_state: "announced_provisional",
  };
  research.variants = [];
  research.feature_evidence = [];
  research.trim_equipment = [];
  research.update_eligibility = [];
  research.publication_issues = [
    {
      issue_id: "V2-06",
      title: "Provisional admission",
      priority: "high",
      model_ids: [car.modelId],
      publication_action: "New version admission warning.",
      source_ids: [packet.sources[0].id],
    },
  ];
  packet.variants = [variant];
  packet.versionGuards = [];
  const admitted = prepareBrandResearch(research, [packet]);
  const added = applyBrandUpdates([], admitted, [packet])[0];
  const pipeline = featureDataModule([packet]);
  const baseline = pipeline.sourceEffectiveFeatures(added, admitted);
  assert.match(baseline[0].conditions, /New version admission warning/);
  currentAvailability(packet, added);
  const reviewed = grade(fact);
  packet.facts = [{ variantId: car.id, before: null, after: reviewed }];
  const after: Feature = {
    ...baseline[0],
    value: "450 km WLTP",
    status: "standard",
    conditions: "",
    source_ids: [...reviewed.sourceIds],
    buyerGrade: "confirmed",
    gradeReview: structuredClone(reviewed.gradeReview),
    evidence_scope: "Exact Australian version",
    verification_state: "reviewed_exact_version",
  };
  packet.features = [
    {
      variantId: car.id,
      criterion: after.criterion,
      before: baseline[0],
      after,
      dependencies: [{ key: fact.key, expected: reviewed }],
    },
  ];
  const current = prepareBrandResearch(research, [packet]);
  const currentCar = applyBrandUpdates([], current, [packet])[0];
  assert.equal(current.variants[0].record_state, "current_or_order_listed");
  assert.equal(currentCar.availability, "current_or_order_listed");
  assert.deepEqual(current.feature_evidence_variant_context, [
    {
      id: variant.id,
      model_id: variant.model_id,
      record_state: "announced_provisional",
    },
  ]);
  assert.deepEqual(
    pipeline.sourceEffectiveFeatures(
      currentCar,
      JSON.parse(JSON.stringify(current)),
    ),
    baseline,
  );
  assert.deepEqual(
    pipeline.pack(car.id, { data: current, cars: [currentCar] }).features,
    [after],
  );
  assert.equal(research.variants.length, 0);
  assert.equal(variant.record_state, "announced_provisional");
});

test("current pack, citable claims and portable hydration carry the reviewed feature", () => {
  const fixture = featureFixture();
  const { car, research, packet, before } = fixture;
  const packed = currentFixturePack(fixture);
  assert.equal(packed.features[0].value, "470 km WLTP");
  assert.equal(packed.features[0].gradeReview?.overlayId, packet.id);
  const restored = hydratePortablePacks(
    storePortablePacks({ [car.id]: packed }),
    research.sources,
  )[car.id];
  assert.deepEqual(restored, packed);
  const claim = featureClaim(restored, before.criterion, "Fixture")!;
  assert.equal(claim.value, "470 km WLTP");
  assert.equal(claim.buyerGrade, "confirmed");
  assert.equal(claim.gradeReviewStatus, undefined);
  assert.equal(claim.gradeReview?.overlayId, packet.id);
  assert.deepEqual(
    claim.sources.map((source) => source.id),
    packet.features![0].after.source_ids,
  );
});

test("Not published survives detail/evidence, citable JSON and exact portable transport", () => {
  const fixture = unpublishedFeatureFixture();
  const { car, packet, afterFact, research } = fixture;
  const packed = currentFixturePack(fixture);
  const feature = packed.features[0];
  assert.equal(feature.value, "Not published");
  assert.equal(packed.car.facts[afterFact.key].value, null);
  const stored = JSON.parse(
    JSON.stringify(storePortablePacks({ [car.id]: packed })),
  );
  const restored = hydratePortablePacks(stored, packet.sources)[car.id];
  assert.deepEqual(restored, packed);
  assert.deepEqual(restored.features[0].gradeReview, feature.gradeReview);
  assert.equal(
    hasEarnedBuyerGrade(
      restored.features[0],
      restored.sources,
      packet.reviewedAt,
    ),
    true,
  );
  const claim = featureClaim(
    restored,
    feature.criterion,
    "Fixture",
    packet.reviewedAt,
  )!;
  assert.equal(claim.value, "Not published");
  assert.equal(claim.status, "not_verified");
  assert.equal(claim.buyerGrade, "not_published");
  assert.equal(claim.gradeReviewStatus, undefined);
  assert.deepEqual(claim.gradeReview, feature.gradeReview);
  assert.deepEqual(
    claim.sources.map((source) => source.id),
    feature.source_ids,
  );
  assert.deepEqual(
    claim.sources.map((source) => source.url),
    packet.sources.map((source) => source.url),
  );
  assert.ok(claim.qualifications.includes(feature.conditions));
  assert.match(claim.sentence, /Not published.*not published/);
  assert.ok(sameReviewedState(JSON.parse(JSON.stringify(claim)), claim));
  const evidence = featureEvidence(restored.features[0], "Fixture");
  assert.equal(evidence.value, "Not published");
  assert.equal(evidence.buyerGrade, "not_published");
  assert.equal(evidence.status, "not_verified");
  assert.equal(evidence.conditions, feature.conditions);
  assert.deepEqual(evidence.sourceIds, feature.source_ids);
  const html = renderToStaticMarkup(
    createElement(FeatureValue, { feature, asOf: packet.reviewedAt }),
  );
  assert.match(html, /class="feature-answer">Not published<\/p>/);
  assert.ok(html.includes(feature.conditions));
  assert.doesNotMatch(html, /Needs confirmation|>Standard</);
  const detail = renderToStaticMarkup(
    createElement(Detail, { pack: restored, criteria: research.criteria }),
  );
  assert.match(detail, /<h2>Equipment<\/h2>/);
  assert.match(detail, /class="feature-answer">Not published<\/p>/);
  assert.ok(detail.includes(feature.conditions));
});

// React cache does not memoize outside a server render. Share one real, read-only
// catalogue build between the registered-packet tests below; synthetic fixtures
// and their mutation/guard assertions still receive independent inputs.
async function buildRegisteredSnapshots() {
  const pipeline = await import("../src/lib/data");
  return {
    pipeline,
    original: {
      data: pipeline.sourceResearch(),
      cars: pipeline.sourceCatalogue(),
    },
    current: pipeline.catalogueSnapshot(),
  };
}
let registeredSnapshots: ReturnType<typeof buildRegisteredSnapshots> | undefined;
function registeredDataSnapshots() {
  return (registeredSnapshots ??= buildRegisteredSnapshots());
}

test("immutable Tesla source snapshots still pack while current Tesla storage uses the reviewed overlay", async () => {
  const { sourceSnapshotPack } = await import("./helpers/source-fixture");
  const { pipeline, original, current } = await registeredDataSnapshots();
  const { sourceEffectiveFeatures, pack } = pipeline;
  for (const id of [
    "tesla_model_3__premium_long_range_rwd__1",
    "tesla_model_y__l_premium_awd__4",
  ]) {
    const car = original.cars.find((row) => row.id === id)!;
    assert.equal(car.buyerGradesRequired, undefined);
    const frozen = sourceSnapshotPack(id, original);
    const originalStorage = sourceEffectiveFeatures(car, original.data).find(
      (row) => row.criterion === "storage",
    )!;
    assert.deepEqual(
      frozen.features.find((row) => row.criterion === "storage"),
      originalStorage,
    );
    assert(
      !frozen.sources.some((source) =>
        source.id.startsWith("m1-tesla-2026-10-14"),
      ),
    );
    const updated = pack(id, current);
    assert.equal(updated.car.buyerGradesRequired, true);
    const storage = updated.features.find(
      (row) => row.criterion === "storage",
    )!;
    assert.equal(storage.gradeReview?.overlayId, "m1-tesla-2026-10-14");
    assert.equal(storage.gradeReviewStatus, undefined);
    if (id.startsWith("tesla_model_3")) {
      assert.match(
        storage.value,
        /594 L rear boot.*88 L front boot.*Not published/,
      );
      assert.doesNotMatch(storage.value, /977/);
    } else {
      assert.match(storage.value, /420 L rear behind occupied third row/);
      assert.equal(updated.car.model, "Model Y L");
    }
    const drifted: Car = {
      ...updated.car,
      facts: {
        ...updated.car.facts,
        boot_l: { ...updated.car.facts.boot_l, value: 9999 },
      },
    };
    assert.throws(
      () => pack(id, { data: current.data, cars: [drifted] }),
      /feature dependency changed/,
    );
  }
});

test("original source defaults and earlier registered feature packets retain their exact evidence baselines", async () => {
  const { pipeline, original: sourceSnapshot, current: snapshot } =
    await registeredDataSnapshots();
  const { sourceEffectiveFeatures, pack } = pipeline;
  const { brandUpdatePackets } =
    await import("../src/lib/brand-update-registry");
  const original = sourceSnapshot.data;
  assert.equal(original.feature_evidence_variant_context, undefined);
  const originalCar = sourceSnapshot.cars.find(
    (car) => car.id === "kia_ev3__gt_line_awd_long_range__5",
  )!;
  const historical = sourceEffectiveFeatures(originalCar);
  assert.deepEqual(sourceEffectiveFeatures(originalCar, original), historical);
  for (const criterion of [
    "interior_fit_finish_subjective",
    "style_refinement",
    "alert_sound_quality",
  ]) {
    const feature = historical.find((row) => row.criterion === criterion)!;
    assert.ok(feature.source_ids.includes("v2_kia_ev3_awd_report"), criterion);
  }
  const active = new Map<string, Map<string, Feature>>();
  for (const packet of brandUpdatePackets)
    for (const row of packet.features ?? []) {
      const rows = active.get(row.variantId) ?? new Map<string, Feature>();
      rows.set(row.criterion, row.after);
      active.set(row.variantId, rows);
    }
  assert.ok(active.size > 0);
  for (const [id, rows] of active) {
    const packed = pack(id, snapshot);
    for (const [criterion, after] of rows)
      assert.deepEqual(
        packed.features.find((row) => row.criterion === criterion),
        after,
        `${id}/${criterion}`,
      );
  }
});

test("configuration overlays retain historical feature scope and warnings instead of rebasing before guards", () => {
  const { car, research, packet } = featureFixture();
  car.configurationEvidence = {
    rankingEligible: false,
    completeVehicleCountEligible: false,
    projectionScope: "Original exact build and provisional evidence scope.",
    requiredBuyerVisibleConditions: [
      "Original build options must be confirmed.",
    ],
    sourceIdentity: { build: "Original MY26" },
  };
  research.variants[0].configuration_evidence = structuredClone(
    car.configurationEvidence,
  );
  car.availability = "announced_provisional";
  research.variants[0].record_state = car.availability;
  research.publication_issues.push({
    issue_id: "V2-06",
    title: "Provisional build",
    priority: "high",
    model_ids: [car.modelId],
    publication_action: "Original provisional build warning.",
    source_ids: [packet.sources[0].id],
  });
  const pipeline = featureDataModule([packet]);
  const historical = pipeline.sourceEffectiveFeatures(car, research);
  packet.features![0].before = historical[0];
  delete packet.features![0].after.gradeReviewStatus;
  const dependency = packet.facts[0].after;
  packet.configurationUpdates = [
    {
      variantId: car.id,
      before: structuredClone(car.configurationEvidence),
      after: {
        ...structuredClone(car.configurationEvidence),
        projectionScope:
          "Current reviewed exact version, with historical build retained.",
        rankingEligible: true,
        sourceIds: [...dependency.sourceIds],
        requiredBuyerVisibleConditions: [
          "Current reviewed build options must be confirmed.",
        ],
        configurationReview: {
          overlayId: packet.id,
          reviewedAt: packet.reviewedAt,
          historicalBoundaryFields: [],
          releasedNulls: [],
        },
      },
      reason:
        "Current exact-version fact review resolves the general ranking hold.",
      sourceIds: [...dependency.sourceIds],
      dependencies: [
        { key: dependency.key, expected: structuredClone(dependency) },
      ],
    },
  ];
  currentAvailability(packet, car);
  const original = structuredClone({ car, research, packet });
  const prepared = prepareBrandResearch(research, [packet]);
  const updated = applyBrandUpdates([car], prepared, [packet])[0];
  for (const data of [
    prepared,
    structuredClone(prepared),
    JSON.parse(JSON.stringify(prepared)),
  ]) {
    assert.deepEqual(
      data.feature_evidence_variant_context![0].configuration_evidence,
      car.configurationEvidence,
    );
    assert.deepEqual(
      pipeline.sourceEffectiveFeatures(updated, data),
      historical,
    );
    assert.deepEqual(
      pipeline.pack(car.id, { data, cars: [updated] }).features,
      [packet.features![0].after],
    );
  }
  assert.deepEqual({ car, research, packet }, original);
  const rebased = structuredClone(historical);
  rebased[0].conditions = packet.configurationUpdates[0].after.projectionScope;
  assert.throws(
    () => applyBrandFeatureUpdates(updated, rebased, prepared, [packet]),
    /feature before snapshot changed/,
  );
});
