import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { FeatureValue, featureEvidence } from "../src/components/ui";
import {
  applyBrandUpdates,
  prepareBrandResearch,
  brandVersionSnapshot,
  applyBrandTermFeatures,
  type BrandUpdatePacket,
} from "../src/lib/brand-updates";
import { availabilitySnapshot } from "../src/lib/availability-corrections";
import { currentBuyerSummary } from "../src/lib/selling-points";
import { validateResearch } from "../src/lib/validate";
import {
  storePortablePacks,
  hydratePortablePacks,
} from "../src/lib/portable-packs";
import { factClaim, featureClaim } from "../src/lib/citable";
import { hasEarnedBuyerGrade } from "../src/lib/evidence-grading";
import { compiledSource } from "./helpers/compiled-source";
import type {
  Car,
  Fact,
  Feature,
  Research,
  Source,
  Pack,
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

test("dated fact updates target the reviewed version and preserve original sources, dates and cars", () => {
  const { car, source, fact, research, packet, grade } = fixture();
  packet.facts = [
    { variantId: car.id, before: fact, after: grade({ ...fact, value: 470 }) },
  ];
  const before = structuredClone({ car, source, research, packet });
  const sibling = { ...car, id: "unrelated", trim: "Other" };
  const updated = prepareBrandResearch(research, [packet]);
  const cars = applyBrandUpdates([car, sibling], updated, [packet]);
  assert.equal(cars[0].facts.range_km.value, 470);
  assert.equal(cars[0].facts.range_km.buyerGrade, "confirmed");
  assert.equal(cars[0].facts.range_km.gradeReview?.overlayId, packet.id);
  assert.equal(cars[1], sibling);
  assert.deepEqual({ car, source, research, packet }, before);
  assert.equal(updated.sources.filter((row) => row.id === source.id).length, 1);
  assert.equal(cars[0].facts.seats.date, car.facts.seats.date);
});

test("wrong identity, tier, source drift and changed fact snapshots fail closed", () => {
  const { car, fact, source, research, packet, grade } = fixture();
  packet.facts = [
    { variantId: car.id, before: fact, after: grade({ ...fact, value: 470 }) },
  ];
  for (const changed of [
    { ...car, trim: "AWD" },
    { ...car, brand: "Other" },
    { ...car, vehicleClass: "van" as const },
  ])
    assert.throws(
      () => applyBrandUpdates([changed], research, [packet]),
      /version|tier|brand/,
    );
  const changedFact = {
    ...car,
    facts: { ...car.facts, range_km: { ...fact, qualifications: ["Changed"] } },
  };
  assert.throws(
    () => applyBrandUpdates([changedFact], research, [packet]),
    /before snapshot changed/,
  );
  assert.throws(
    () =>
      prepareBrandResearch(
        {
          ...research,
          sources: [{ ...source, supports: "Different version" }],
        },
        [packet],
      ),
    /source snapshot changed/,
  );
  const missing = structuredClone(packet);
  missing.sources = [];
  assert.throws(
    () => applyBrandUpdates([car], research, [missing]),
    /explicit source snapshot/,
  );
});

test("new versions have complete unknown rows and no fabricated update counts", () => {
  const { car, research, packet, grade, fact, source } = fixture();
  packet.versionGuards = [];
  packet.sources.push({
    ...source,
    id: "fixture-new-source",
    url: "https://maker.example/au/new-version",
  });
  const variant = {
    ...research.variants[0],
    id: "fixture_maker_example__new__1",
    trim: "New",
  };
  packet.variants.push(variant);
  packet.facts.push({
    variantId: variant.id,
    before: null,
    after: grade({ ...fact, value: 490 }),
  });
  const updated = prepareBrandResearch(research, [packet]);
  const cars = applyBrandUpdates([car], updated, [packet]);
  const added = cars.find((candidate) => candidate.id === variant.id)!;
  assert.equal(added.facts.range_km.value, 490);
  assert.equal(added.facts.seats.value, null);
  assert.equal(added.facts.seats.buyerGrade, undefined);
  assert.deepEqual(added.facts.seats.sourceIds, []);
  assert.equal(
    updated.feature_evidence.find((row) => row.variant_id === variant.id)
      ?.status,
    "not_verified",
  );
  assert.equal(
    updated.update_eligibility.find((row) => row.variant_id === variant.id)
      ?.exact_total,
    null,
  );
  assert.equal(
    updated.update_eligibility.find((row) => row.variant_id === variant.id)
      ?.documented_family_minimum,
    null,
  );
  assert.equal(
    updated.sources.filter((row) => row.id === "fixture-new-source").length,
    1,
  );
  assert.deepEqual(validateResearch(updated), []);
  assert.equal(research.variants.length, 1);
  assert.throws(
    () => prepareBrandResearch(updated, [packet]),
    /duplicate new version/,
  );
});

test("new versions do not acquire unrelated catalogue equipment fields or source-derived labels", () => {
  const { car, research, packet, grade, fact } = fixture();
  for (let i = 0; i < 500; i++) {
    const key = `equipment_unrelated_${i}`;
    car.facts[key] = {
      ...fact,
      key,
      label: "Other model equipment",
      value: true,
    };
  }
  const variant = {
    ...research.variants[0],
    id: "fixture_maker_example__bounded__1",
    trim: "Bounded",
  };
  packet.variants = [variant];
  packet.versionGuards = [];
  packet.facts = [
    {
      variantId: variant.id,
      before: null,
      after: grade({ ...fact, key: "equipment_reviewed", value: true }),
    },
  ];
  const original = JSON.stringify({ car, research, packet });
  const updated = prepareBrandResearch(research, [packet]);
  const added = applyBrandUpdates([car], updated, [packet]).find(
    (candidate) => candidate.id === variant.id,
  )!;
  assert.equal(added.facts.equipment_reviewed.value, true);
  assert.equal(added.facts.equipment_unrelated_0, undefined);
  assert.equal(added.facts.equipment_unrelated_499, undefined);
  assert.ok(Object.keys(added.facts).length < 40);
  for (const key of [
    "price_aud",
    "range_km",
    "seats",
    "power_kw",
    "drive",
    "battery_warranty",
  ]) {
    assert.equal(added.facts[key].value, null, key);
    assert.equal(added.facts[key].buyerGrade, undefined, key);
    assert.deepEqual(added.facts[key].sourceIds, [], key);
  }
  assert.deepEqual(applyBrandUpdates([], updated, [packet])[0], added);
  assert.equal(JSON.stringify({ car, research, packet }), original);
});

test("new grades require genuine search evidence and price ladder provenance", () => {
  const { car, research, packet, fact, grade, source } = fixture();
  packet.facts = [
    {
      variantId: car.id,
      before: fact,
      after: {
        ...grade(fact),
        value: null,
        status: "not_verified",
        buyerGrade: "not_published",
        gradeReview: {
          ...grade(fact).gradeReview!,
          evidenceScope: "searched_not_found",
        },
      },
    },
  ];
  assert.throws(
    () => applyBrandUpdates([car], research, [packet]),
    /unearned grade/,
  );
  const second = {
    ...source,
    id: "second-search",
    url: "https://maker.example/au/brochure",
  };
  packet.sources.push(second);
  packet.facts[0].after.sourceIds.push(second.id);
  packet.facts[0].after.gradeReview!.sourceIds.push(second.id);
  assert.equal(
    applyBrandUpdates([car], prepareBrandResearch(research, [packet]), [
      packet,
    ])[0].facts.range_km.buyerGrade,
    "not_published",
  );
  packet.facts = [
    {
      variantId: car.id,
      before: null,
      after: grade({ ...fact, key: "price_aud", value: 42000, unit: "AUD" }),
    },
  ];
  assert.throws(
    () =>
      applyBrandUpdates([car], prepareBrandResearch(research, [packet]), [
        packet,
      ]),
    /price lacks ladder/,
  );
});

test("availability and current metadata changes use reviewed guards", () => {
  const { car, research, packet } = fixture();
  packet.versionUpdates = [
    {
      variantId: car.id,
      before: brandVersionSnapshot(car),
      after: { ...brandVersionSnapshot(car), year: 2027 },
      reason: "Maker identifies current model year",
    },
  ];
  packet.availability = [
    {
      id: "fixture-orders-open",
      variantId: car.id,
      before: availabilitySnapshot(car),
      after: {
        availability: "current_or_order_listed",
        evidence: {
          ...car.availabilityEvidence!,
          orderStatus: "accepting_orders_advertised",
          qualifications: ["Delivery and physical stock need confirmation."],
        },
      },
      status: "approved",
      reviewedAt: packet.reviewedAt,
      reviewedBy: packet.reviewedBy,
      evidenceDate: packet.reviewedAt,
      reason: "Exact version maker order listing",
    },
  ];
  const updated = prepareBrandResearch(research, [packet]);
  const result = applyBrandUpdates([car], updated, [packet])[0];
  assert.equal(result.year, 2027);
  assert.equal(updated.variants[0].model_year, 2027);
  assert.equal(
    result.availabilityEvidence?.orderStatus,
    "accepting_orders_advertised",
  );
  assert.equal(result.availabilityEvidence?.physicalStockVerified, undefined);
  packet.availability[0].before.evidence.stockStatus = "new_stock_listed";
  assert.throws(
    () => applyBrandUpdates([car], updated, [packet]),
    /snapshot changed/,
  );
});

test("summary freshness and correction invalidation use actual fact dependencies", () => {
  const { car, research, packet, grade, fact } = fixture();
  const range = grade(fact);
  const seats = grade(car.facts.seats);
  packet.facts = [
    { variantId: car.id, before: fact, after: range },
    { variantId: car.id, before: car.facts.seats, after: seats },
  ];
  packet.summaries = [
    {
      variantId: car.id,
      strength: {
        label: "Range",
        text: "Published range suits longer trips",
        dependencies: [{ key: "range_km", expected: range }],
      },
      tradeoff: {
        label: "Five seats",
        text: "No third row in this version",
        dependencies: [{ key: "seats", expected: seats }],
      },
    },
  ];
  const updated = prepareBrandResearch(research, [packet]);
  const first = applyBrandUpdates([car], updated, [packet])[0];
  const later = currentBuyerSummary(first.buyerSummary, updated.sources, {
    asOf: "2027-05-01",
  });
  assert.equal(later?.strength, undefined);
  assert.equal(later?.tradeoff?.label, "Five seats");
  assert.deepEqual(
    new Set(first.buyerSummary?.strength?.freshness?.map((row) => row.key)),
    new Set(["range_km"]),
  );
  const correction: BrandUpdatePacket = {
    ...structuredClone(packet),
    id: "m1-fixture-correction-2026-10-15",
    reviewedAt: "2026-10-15",
    summaries: [],
    facts: [],
    versionGuards: [{ variantId: car.id, before: brandVersionSnapshot(first) }],
  };
  correction.facts = [
    {
      variantId: car.id,
      before: first.facts.range_km,
      after: grade({ ...range, value: 460 }, correction),
    },
  ];
  const corrected = applyBrandUpdates(
    [car],
    prepareBrandResearch(research, [packet, correction]),
    [packet, correction],
  )[0];
  assert.equal(corrected.facts.range_km.value, 460);
  assert.equal(corrected.facts.range_km.gradeReview?.overlayId, correction.id);
  assert.equal(corrected.buyerSummary?.strength, undefined);
  assert.equal(corrected.buyerSummary?.tradeoff?.label, "Five seats");
  packet.summaries[0].strength.dependencies[0].expected = {
    ...range,
    value: 999,
  };
  assert.throws(
    () => applyBrandUpdates([car], updated, [packet]),
    /summary dependency changed/,
  );
});

test("public research, catalogue, packs and exact-version route enumeration share added IDs", () => {
  const { research: fixtureResearch, packet, source, fact, grade } = fixture();
  packet.models = fixtureResearch.models;
  packet.variants = fixtureResearch.variants;
  packet.versionGuards = [];
  packet.facts = [
    { variantId: packet.variants[0].id, before: null, after: grade(fact) },
  ];
  const overrides = {
    "./brand-update-registry": { brandUpdatePackets: [packet] },
  };
  const loaded = compiledSource("src/lib/data.ts", {
    ...overrides,
    "./evidence-consumers": compiledSource("src/lib/evidence-consumers.ts", overrides),
  }) as {
    research(): Research;
    sourceResearch(): Research;
    catalogue(): Car[];
    sourceCatalogue(): Car[];
    pack(id: string, snapshot: { data: Research; cars: Car[] }): Pack;
  };
  const original = loaded.sourceResearch();
  const originalSource = JSON.stringify(original.sources);
  const data = loaded.research();
  const cars = loaded.catalogue();
  const id = packet.variants[0].id;
  assert(data.variants.some((variant) => variant.id === id));
  assert(!loaded.sourceCatalogue().some((car) => car.id === id));
  assert.equal(JSON.stringify(loaded.sourceResearch().sources), originalSource);
  assert.equal(data.sources.filter((row) => row.id === source.id).length, 1);
  const pack = loaded.pack(id, { data, cars });
  assert.equal(pack.car.facts.range_km.value, fact.value);
  assert.equal(pack.features.length, data.criteria.length);
  assert(
    pack.features.every(
      (row) => row.variant_id === id && row.status === "not_verified",
    ),
  );
  assert.equal(pack.eligibility.exact_total, null);
  assert(pack.sources.some((row) => row.id === source.id));
  assert.deepEqual(validateResearch(data), []);
  const routes = cars.map((car) => ({ family: car.family, variant: car.slug }));
  assert(
    routes.some(
      (route) =>
        route.family === pack.car.family && route.variant === pack.car.slug,
    ),
  );
  assert.equal(JSON.parse(JSON.stringify(pack)).car.id, id);
  const restored = hydratePortablePacks(
    storePortablePacks({ [id]: pack }),
    data.sources,
  )[id];
  assert.deepEqual(restored, pack);
  const exported = factClaim(restored, restored.car.facts.range_km);
  assert.equal(exported.buyerGrade, "confirmed");
  assert.equal(exported.gradeReview?.overlayId, packet.id);
  assert(exported.sources.some((citation) => citation.id === source.id));
});

test("brand terms are stored once, inherited only within reviewed scope, and project roadside into equipment", () => {
  const { car, research, packet, grade, fact } = fixture();
  const sibling = {
    ...structuredClone(car),
    id: "fixture_sibling",
    trim: "Other",
  };
  const exception = {
    ...structuredClone(car),
    id: "fixture_legacy",
    trim: "Legacy",
  };
  const roadside = grade({
    ...fact,
    key: "roadside_assistance",
    label: "Roadside assistance",
    value: "Five years",
    unit: "",
    basis: "Australian brand terms",
    comparisonBasis: "",
    scope: "Maker current Australian vehicles",
  });
  roadside.gradeReview!.evidenceScope = "brand_au_terms";
  packet.versionGuards.push({
    variantId: sibling.id,
    before: brandVersionSnapshot(sibling),
  });
  packet.brandTerms = [
    {
      key: "roadside_assistance",
      fact: roadside,
      applicableVariantIds: [car.id, sibling.id],
      before: { [car.id]: null, [sibling.id]: null },
      exceptions: [
        {
          variantId: exception.id,
          reason: "Prior policy applies to this older version",
        },
      ],
    },
  ];
  const result = applyBrandUpdates([car, sibling, exception], research, [
    packet,
  ]);
  assert.equal(result[0].facts.roadside_assistance.value, "Five years");
  assert.equal(result[1].facts.roadside_assistance.value, "Five years");
  assert.equal(result[2].facts.roadside_assistance, undefined);
  assert.equal(packet.facts.length, 0);
  const feature = {
    ...research.feature_evidence[0],
    criterion: "roadside_assistance",
  };
  const features = applyBrandTermFeatures(result[0], [feature]);
  assert.equal(features[0].value, "Five years");
  assert.equal(features[0].buyerGrade, "confirmed");
  assert.deepEqual(features[0].source_ids, roadside.sourceIds);
  assert.equal(feature.status, "not_verified");
  result[0].facts.roadside_assistance.value = "Local mutation";
  assert.equal(result[1].facts.roadside_assistance.value, "Five years");
  assert.equal(packet.brandTerms[0].fact.value, "Five years");
  packet.brandTerms[0].exceptions = [];
  assert.throws(
    () => applyBrandUpdates([car, sibling, exception], research, [packet]),
    /account for every current version/,
  );
});

function reviewedDriveawayFixture(state?: string) {
  const data = fixture();
  const price: Fact = {
    ...data.grade(data.fact),
    key: "price_aud",
    label: "Published price",
    value: 39990,
    unit: "AUD",
    basis: state
      ? "Maker state driveaway offer"
      : "Maker national driveaway offer",
    comparisonBasis: "Driveaway",
    status: "conditional",
    buyerGrade: "check",
    qualifications: ["Private retail buyers; metallic paint excluded."],
    conditionExplanation:
      "Order by the stated deadline; subject to allocation.",
    validUntil: "2026-12-15",
    priceEvidence: {
      rung: state ? 4 : 2,
      basisTag: state
        ? `Maker's ${state} driveaway`
        : "Maker's national driveaway",
      sourceKey: "fixture_driveaway_offer",
      sourcePointer: data.source.url,
      ...(state ? { state } : {}),
      originalBasis: "Maker's explicitly published driveaway offer",
      rankingEligible: true,
    },
  };
  data.car.facts.price_aud = price;
  const feature: Feature = {
    ...data.research.feature_evidence[0],
    criterion: "driveaway_price",
    value: "Request an older quote",
    conditions: "Superseded quotation conditions.",
    gradeReviewStatus: "review_required",
    usability_notes: ["Superseded quote note."],
    confirmation_needed: "Superseded quote request.",
  };
  return { ...data, price, feature };
}

test("reviewed national and state driveaway facts project value, provenance and conditions into feature claims", () => {
  for (const state of [undefined, "NSW"]) {
    const { car, source, price, feature, research } =
      reviewedDriveawayFixture(state);
    const unrelated: Feature = { ...feature, criterion: "unrelated_fixture" };
    const before = structuredClone({ car, source, feature, unrelated });
    const features = applyBrandTermFeatures(car, [feature, unrelated]);
    const projected = features[0];
    assert.equal(projected.value, "A$39,990");
    assert.equal(projected.status, price.status);
    assert.equal(projected.buyerGrade, price.buyerGrade);
    assert.deepEqual(projected.gradeReview, price.gradeReview);
    assert.equal(Object.hasOwn(projected, "gradeReviewStatus"), false);
    assert.deepEqual(projected.source_ids, price.sourceIds);
    assert.equal(projected.last_evidence_date, price.date);
    assert.equal(projected.reviewed_date, price.gradeReview!.reviewedAt);
    assert.equal(projected.evidence_scope, price.scope);
    assert.match(
      projected.conditions,
      /Private retail buyers; metallic paint excluded/,
    );
    assert.match(
      projected.conditions,
      /Order by the stated deadline; subject to allocation/,
    );
    assert.match(projected.conditions, /Offer deadline: 2026-12-15/);
    assert.equal(
      projected.conditions.includes("Driveaway price applies in NSW."),
      !!state,
    );
    assert.ok(
      projected.condition_label!.includes(price.priceEvidence!.basisTag),
    );
    assert.deepEqual(projected.usability_notes, []);
    assert.equal(projected.confirmation_needed, "");
    assert.doesNotMatch(projected.conditions, /Superseded/);
    assert.equal(features[1], unrelated);
    const pack: Pack = {
      car,
      features,
      eligibility: research.update_eligibility[0],
      events: [],
      configuration: [],
      sources: [source],
    };
    const claim = featureClaim(pack, "driveaway_price", "Driveaway price")!;
    assert.equal(claim.value, "A$39,990");
    assert.equal(claim.evidenceDate, price.date);
    assert.equal(claim.buyerGrade, "check");
    assert.equal(claim.gradeReviewStatus, undefined);
    assert.deepEqual(claim.gradeReview, price.gradeReview);
    assert.deepEqual(
      claim.sources.map((citation) => citation.id),
      price.sourceIds,
    );
    assert.equal(claim.sources[0].url, source.url);
    assert.equal(claim.sources[0].accessed_date, source.accessed_date);
    assert.ok(claim.basis.includes(price.priceEvidence!.basisTag));
    assert.match(claim.qualifications.join(" "), /Offer deadline: 2026-12-15/);
    assert.equal(
      claim.qualifications
        .join(" ")
        .includes("Driveaway price applies in NSW."),
      !!state,
    );
    assert.doesNotMatch(claim.sentence, /Superseded|review required/i);
    assert.deepEqual({ car, source, feature, unrelated }, before);
    projected.source_ids.push("local-mutation");
    projected.gradeReview!.sourceIds.push("local-mutation");
    assert.deepEqual({ car, source, feature, unrelated }, before);
  }
});

test("before-on-road canonical prices preserve separately sourced driveaway feature evidence", () => {
  const { car, price, feature } = reviewedDriveawayFixture();
  car.facts.price_aud = {
    ...price,
    comparisonBasis: "Before on-road costs",
    basis: "Maker list price before on-road costs",
    status: "standard",
    buyerGrade: "confirmed",
    priceEvidence: {
      ...price.priceEvidence!,
      rung: 1,
      basisTag: "Maker list price",
    },
  };
  const before = structuredClone({ car, feature });
  const projected = applyBrandTermFeatures(car, [feature])[0];
  assert.equal(projected, feature);
  assert.deepEqual({ car, feature }, before);
});

test("withdrawn or incomplete canonical driveaway reviews never replace the separate feature", () => {
  const { car, price, feature } = reviewedDriveawayFixture("NSW");
  const variants: Fact[] = [
    { ...price, gradeReviewStatus: "review_required" },
    { ...price, buyerGrade: undefined },
    { ...price, gradeReview: undefined },
    { ...price, priceEvidence: undefined },
    { ...price, value: null },
  ];
  for (const unreviewed of variants) {
    const candidate = {
      ...car,
      facts: { ...car.facts, price_aud: unreviewed },
    };
    const before = structuredClone({ candidate, feature });
    assert.equal(applyBrandTermFeatures(candidate, [feature])[0], feature);
    assert.deepEqual({ candidate, feature }, before);
  }
});

test("a separately reviewed driveaway offer updates its answer without replacing the higher-rung list price", () => {
  const { car, price, feature } = reviewedDriveawayFixture("NSW");
  car.facts.price_aud = {
    ...price,
    value: 35990,
    comparisonBasis: "Before on-road costs",
    basis: "Maker list price before on-road costs",
  };
  const offer = { ...price, key: "promotional_driveaway_aud" };
  car.facts.promotional_driveaway_aud = offer;
  const original = structuredClone({ car, feature });
  const projected = applyBrandTermFeatures(car, [feature])[0];
  assert.equal(projected.value, "A$39,990");
  assert.equal(car.facts.price_aud.value, 35990);
  assert.match(projected.conditions, /Offer deadline: 2026-12-15/);
  assert.match(projected.conditions, /applies in NSW/);
  assert.deepEqual(projected.source_ids, offer.sourceIds);
  assert.deepEqual(projected.gradeReview, offer.gradeReview);
  assert.deepEqual({ car, feature }, original);
  for (const invalid of [
    { ...offer, gradeReviewStatus: "review_required" as const },
    { ...offer, priceEvidence: undefined },
    { ...offer, comparisonBasis: "Before on-road costs" },
    { ...offer, value: null },
  ]) {
    const candidate = {
      ...car,
      facts: { ...car.facts, promotional_driveaway_aud: invalid },
    };
    assert.equal(applyBrandTermFeatures(candidate, [feature])[0], feature);
  }
});

test("supplemental driveaway offers require the same price provenance as canonical prices", () => {
  const { car, price, packet, research } = reviewedDriveawayFixture();
  const offer = { ...price, key: "promotional_driveaway_aud" };
  packet.facts = [{ variantId: car.id, before: null, after: offer }];
  assert.equal(
    applyBrandUpdates([car], research, [packet])[0].facts
      .promotional_driveaway_aud.value,
    price.value,
  );
  for (const invalid of [
    { ...offer, priceEvidence: undefined },
    {
      ...offer,
      priceEvidence: {
        ...offer.priceEvidence!,
        sourcePointer: "",
      },
    },
    { ...offer, comparisonBasis: "Before on-road costs" },
  ]) {
    assert.throws(
      () =>
        applyBrandUpdates([car], research, [
          {
            ...packet,
            facts: [{ variantId: car.id, before: null, after: invalid }],
          },
        ]),
      /price|driveaway/i,
    );
  }
});

test("brand price validation rejects basis flips on flexible rungs without losing legitimate reported prices", () => {
  for (const rung of [3, 5, 6] as const) {
    for (const comparisonBasis of [
      "Before on-road costs",
      "Driveaway",
    ] as const) {
      const { car, price, packet, research } = reviewedDriveawayFixture();
      const reported = rung >= 5;
      const fact: Fact = {
        ...price,
        comparisonBasis,
        basis: `Named version price · ${comparisonBasis}`,
        buyerGrade: reported ? "reported" : "check",
        resolvedElsewhere: reported,
        gradeReview: {
          ...price.gradeReview!,
          evidenceScope: reported ? "secondary_or_sibling" : "exact_au_version",
        },
        priceEvidence: {
          ...price.priceEvidence!,
          rung,
          basisTag: `Named version price · ${comparisonBasis}`,
          originalBasis: `Published price ${comparisonBasis}`,
          rankingEligible: !reported,
          ...(rung === 5 ? { publisher: "Example Motoring" } : {}),
        },
      };
      packet.facts = [{ variantId: car.id, before: price, after: fact }];
      const before = structuredClone({ car, research, packet });
      const updated = applyBrandUpdates([car], research, [packet])[0].facts
        .price_aud;
      assert.equal(updated.value, fact.value);
      assert.equal(updated.comparisonBasis, comparisonBasis);
      assert.equal(updated.buyerGrade, reported ? "reported" : "check");
      assert.equal(updated.priceEvidence?.rankingEligible, !reported);
      const corrupted = structuredClone(packet);
      corrupted.facts[0].after.comparisonBasis =
        comparisonBasis === "Driveaway" ? "Before on-road costs" : "Driveaway";
      assert.throws(
        () => applyBrandUpdates([car], research, [corrupted]),
        /comparison basis contradicts retained price provenance/,
      );
      assert.deepEqual({ car, research, packet }, before);
    }
  }
});

test("a guarded valid replacement clears its stale review marker without weakening identity, fact or source guards", () => {
  const { car, fact, source, research, packet, grade } = fixture();
  const withdrawn: Fact = { ...fact, gradeReviewStatus: "review_required" };
  car.facts.range_km = withdrawn;
  packet.facts = [
    {
      variantId: car.id,
      before: structuredClone(withdrawn),
      after: grade({ ...withdrawn, value: 470 }),
    },
  ];
  const before = structuredClone({ car, source, research, packet });
  const updated = applyBrandUpdates([car], research, [packet])[0];
  assert.equal(updated.facts.range_km.value, 470);
  assert.equal(updated.facts.range_km.buyerGrade, "confirmed");
  assert.equal(updated.facts.range_km.gradeReview!.overlayId, packet.id);
  assert.equal(
    Object.hasOwn(updated.facts.range_km, "gradeReviewStatus"),
    false,
  );
  assert.equal(packet.facts[0].after.gradeReviewStatus, "review_required");
  assert.deepEqual({ car, source, research, packet }, before);
  assert.throws(
    () =>
      applyBrandUpdates([{ ...car, trim: "Different version" }], research, [
        packet,
      ]),
    /reviewed version changed/,
  );
  assert.throws(
    () =>
      applyBrandUpdates(
        [
          {
            ...car,
            facts: { ...car.facts, range_km: { ...withdrawn, value: 451 } },
          },
        ],
        research,
        [packet],
      ),
    /fact before snapshot changed/,
  );
  assert.throws(
    () =>
      applyBrandUpdates(
        [car],
        {
          ...research,
          sources: [{ ...source, supports: "Different source content" }],
        },
        [packet],
      ),
    /source snapshot changed/,
  );
  const invalid = structuredClone(packet);
  invalid.facts[0].after.gradeReview!.reason = "";
  assert.throws(
    () => applyBrandUpdates([car], research, [invalid]),
    /invalid fact or unearned grade/,
  );
  assert.equal(invalid.facts[0].after.gradeReviewStatus, "review_required");
  assert.deepEqual({ car, source, research, packet }, before);
});

function reviewedRoadsideFixture(fitment?: Fact["roadsideFitment"]) {
  const data = fixture();
  const roadside = data.grade({
    ...data.fact,
    key: "roadside_assistance",
    label: "Roadside assistance",
    value: fitment === "optional" ? "Paid roadside membership" : "Five years",
    unit: "",
    basis: "Australian brand terms",
    comparisonBasis: "",
    scope: "Maker current Australian vehicles",
    qualifications: [
      fitment === "optional"
        ? "Optional paid membership from A$99/year; Plus A$139/year."
        : "Included for five years from delivery.",
      "Warranty-covered towing and a loan car are a separate benefit.",
    ],
    conditionExplanation: "Membership eligibility and service limits apply.",
    ...(fitment === undefined ? {} : { roadsideFitment: fitment }),
  });
  roadside.gradeReview!.evidenceScope = "brand_au_terms";
  data.packet.brandTerms = [
    {
      key: "roadside_assistance",
      fact: roadside,
      applicableVariantIds: [data.car.id],
      before: { [data.car.id]: null },
      exceptions: [],
    },
  ];
  data.research.criteria[0].key = "roadside_assistance";
  data.research.feature_evidence[0].criterion = "roadside_assistance";
  return { ...data, roadside, feature: data.research.feature_evidence[0] };
}

test("confirmed paid roadside terms project optional fitment without changing evidence, conditions or other facts", () => {
  const { car, research, packet, roadside, feature } =
    reviewedRoadsideFixture("optional");
  const before = structuredClone({ car, research, packet, feature });
  const updated = applyBrandUpdates([car], research, [packet])[0];
  const canonical = updated.facts.roadside_assistance;
  const projected = applyBrandTermFeatures(updated, [feature])[0];
  assert.equal(canonical.status, "standard");
  assert.equal(canonical.roadsideFitment, "optional");
  assert.equal(projected.status, "optional");
  assert.equal(projected.buyerGrade, "confirmed");
  for (const row of [canonical, projected])
    assert.equal(
      hasEarnedBuyerGrade(row, research.sources, packet.reviewedAt),
      true,
    );
  assert.equal(projected.value, roadside.value);
  assert.deepEqual(projected.gradeReview, roadside.gradeReview);
  assert.deepEqual(projected.source_ids, roadside.sourceIds);
  assert.equal(projected.last_evidence_date, roadside.date);
  assert.equal(
    projected.conditions,
    [...roadside.qualifications, roadside.conditionExplanation].join(" "),
  );
  assert.deepEqual(updated.facts.range_km, car.facts.range_km);
  assert.deepEqual(updated.facts.seats, car.facts.seats);
  assert.deepEqual({ car, research, packet, feature }, before);
  const markup = renderToStaticMarkup(
    createElement(FeatureValue, {
      feature: projected,
      asOf: packet.reviewedAt,
    }),
  );
  assert.match(markup, /Paid roadside membership/);
  assert.match(
    markup,
    /Optional paid membership from A\$99\/year; Plus A\$139\/year/,
  );
  assert.match(
    markup,
    /Warranty-covered towing and a loan car are a separate benefit/,
  );
  assert.doesNotMatch(markup, /status standard|>Standard</);
});

test("explicit included roadside fitment and metadata-free legacy terms keep their intended status", () => {
  for (const fitment of ["standard", undefined] as const) {
    for (const buyerGrade of ["confirmed", "check"] as const) {
      const { car, research, packet, roadside, feature } =
        reviewedRoadsideFixture(fitment);
      roadside.buyerGrade = buyerGrade;
      roadside.status = buyerGrade === "confirmed" ? "standard" : "conditional";
      const updated = applyBrandUpdates([car], research, [packet])[0];
      const projected = applyBrandTermFeatures(updated, [feature])[0];
      assert.equal(projected.status, fitment ?? roadside.status);
      assert.equal(projected.buyerGrade, buyerGrade);
      assert.deepEqual(projected.gradeReview, roadside.gradeReview);
      assert.equal(
        Object.hasOwn(updated.facts.roadside_assistance, "roadsideFitment"),
        fitment !== undefined,
      );
    }
  }
});

test("malformed or misplaced explicit roadside fitment fails closed instead of becoming standard", () => {
  const { car, research, packet, roadside, feature } =
    reviewedRoadsideFixture("optional");
  for (const invalid of [
    null,
    undefined,
    "paid",
    "Optional",
    "",
    false,
    1,
    [],
    {},
    ["optional"],
  ]) {
    const malformed = {
      ...roadside,
      roadsideFitment: invalid,
    } as unknown as Fact;
    const candidate = structuredClone(packet);
    candidate.brandTerms![0].fact = malformed;
    assert.throws(
      () => applyBrandUpdates([car], research, [candidate]),
      /invalid roadside fitment/,
    );
    assert.throws(
      () =>
        applyBrandTermFeatures(
          {
            ...car,
            facts: { ...car.facts, roadside_assistance: malformed },
          },
          [feature],
        ),
      /invalid roadside fitment/,
    );
  }
  for (const key of ["warranty", "battery_warranty"] as const) {
    const candidate = structuredClone(packet);
    candidate.brandTerms![0].key = key;
    candidate.brandTerms![0].fact.key = key;
    assert.throws(
      () => applyBrandUpdates([car], research, [candidate]),
      /invalid roadside fitment/,
    );
  }
});

test("roadside fitment is guarded in complete before snapshots and only a reviewed replacement may change it", () => {
  const { car, research, packet, feature } =
    reviewedRoadsideFixture("optional");
  const updated = applyBrandUpdates([car], research, [packet])[0];
  const replacement = structuredClone(packet);
  replacement.id = "m1-fixture-roadside-replacement";
  const term = replacement.brandTerms![0];
  term.before[car.id] = structuredClone(updated.facts.roadside_assistance);
  term.fact.gradeReview!.overlayId = replacement.id;
  term.fact.roadsideFitment = "standard";
  term.fact.value = "Included roadside assistance";
  term.fact.qualifications = ["Included for five years from delivery."];
  const accepted = applyBrandUpdates([updated], research, [replacement])[0];
  assert.equal(
    applyBrandTermFeatures(accepted, [feature])[0].status,
    "standard",
  );
  for (const fitment of ["standard", undefined] as const) {
    const drifted = structuredClone(updated);
    if (fitment === undefined)
      delete drifted.facts.roadside_assistance.roadsideFitment;
    else drifted.facts.roadside_assistance.roadsideFitment = fitment;
    assert.throws(
      () => applyBrandUpdates([drifted], research, [replacement]),
      /fact before snapshot changed/,
    );
  }
  assert.equal(updated.facts.roadside_assistance.roadsideFitment, "optional");
  assert.equal(packet.brandTerms![0].fact.roadsideFitment, "optional");
});

test("withdrawn roadside reviews or sources cannot earn optional projection or bypass source snapshot guards", () => {
  const { car, research, packet, roadside, source, feature } =
    reviewedRoadsideFixture("optional");
  for (const withdrawn of [
    { ...roadside, gradeReviewStatus: "review_required" as const },
    { ...roadside, gradeReview: undefined },
    {
      ...roadside,
      gradeReview: {
        ...roadside.gradeReview!,
        evidenceScope: "exact_au_version" as const,
      },
    },
  ]) {
    assert.equal(
      applyBrandTermFeatures(
        {
          ...car,
          facts: { ...car.facts, roadside_assistance: withdrawn },
        },
        [feature],
      )[0],
      feature,
    );
  }
  for (const restriction of [
    "publication_hold",
    "access_limitation",
    "conflict",
  ] as const) {
    const withdrawnSource = {
      ...source,
      [restriction]: "Withdrawn for review",
    };
    const changedResearch = { ...research, sources: [withdrawnSource] };
    assert.throws(
      () => applyBrandUpdates([car], changedResearch, [packet]),
      /source snapshot changed/,
    );
    const changedPacket = { ...packet, sources: [withdrawnSource] };
    assert.throws(
      () => applyBrandUpdates([car], changedResearch, [changedPacket]),
      /invalid fact or unearned grade/,
    );
  }
  assert.throws(
    () => applyBrandUpdates([car], { ...research, sources: [] }, [packet]),
    /research is missing packet sources/,
  );
});

test("withdrawal clears a reused roadside projection while preserving separately reviewed source-row fallback", () => {
  const { car, research, packet, feature } =
    reviewedRoadsideFixture("optional");
  const updated = applyBrandUpdates([car], research, [packet])[0];
  const projected = applyBrandTermFeatures(updated, [feature])[0];
  const original = structuredClone(projected);
  const independent: Feature = {
    ...feature,
    status: "optional",
    value: "Independent source-row membership evidence",
    buyerGrade: "confirmed",
    gradeReview: {
      ...projected.gradeReview!,
      evidenceScope: "exact_au_version",
    },
    verification_state: "independent_exact_version_review",
  };
  for (const withdrawal of [
    "marker",
    "missing_review",
    "missing_fact",
  ] as const) {
    const withdrawnCar = structuredClone(updated);
    const fact = withdrawnCar.facts.roadside_assistance;
    if (withdrawal === "marker") fact.gradeReviewStatus = "review_required";
    else if (withdrawal === "missing_review") delete fact.gradeReview;
    else delete withdrawnCar.facts.roadside_assistance;
    const stale = applyBrandTermFeatures(withdrawnCar, [projected])[0];
    assert.equal(stale.buyerGrade, undefined);
    assert.equal(stale.gradeReview, undefined);
    assert.equal(stale.gradeReviewStatus, "review_required");
    assert.equal(
      hasEarnedBuyerGrade(stale, research.sources, packet.reviewedAt),
      false,
    );
    assert.equal(stale.status, "optional");
    assert.equal(stale.value, projected.value);
    assert.equal(stale.conditions, projected.conditions);
    assert.deepEqual(stale.source_ids, projected.source_ids);
    assert.equal(applyBrandTermFeatures(withdrawnCar, [feature])[0], feature);
    assert.equal(
      applyBrandTermFeatures(withdrawnCar, [independent])[0],
      independent,
    );
    assert.match(
      renderToStaticMarkup(
        createElement(FeatureValue, {
          feature: stale,
          asOf: packet.reviewedAt,
        }),
      ),
      /Needs review/,
    );
    // A later accepted canonical review can replace the stale snapshot normally.
    assert.deepEqual(applyBrandTermFeatures(updated, [stale])[0], projected);
  }
  assert.deepEqual(projected, original);
});

test("canonical roadside terms still prohibit competing manual feature edits", () => {
  const { car, research, packet, feature } =
    reviewedRoadsideFixture("optional");
  const updated = applyBrandUpdates([car], research, [packet])[0];
  packet.features = [
    {
      variantId: car.id,
      criterion: "roadside_assistance",
      before: feature,
      after: {
        ...applyBrandTermFeatures(updated, [feature])[0],
        status: "standard",
      },
      dependencies: [
        {
          key: "roadside_assistance",
          expected: updated.facts.roadside_assistance,
        },
      ],
    },
  ];
  assert.throws(
    () => applyBrandUpdates([car], research, [packet]),
    /invalid or canonical feature target/,
  );
});

test("portable roadside facts and evidence claims preserve optional fitment, Confirmed provenance and exact conditions", () => {
  const { car, research, packet, feature } =
    reviewedRoadsideFixture("optional");
  const updated = applyBrandUpdates([car], research, [packet])[0];
  const pack: Pack = {
    car: updated,
    features: applyBrandTermFeatures(updated, [feature]),
    eligibility: research.update_eligibility[0],
    events: [],
    configuration: [],
    sources: research.sources,
  };
  const stored = JSON.parse(
    JSON.stringify(storePortablePacks({ [car.id]: pack })),
  );
  const portable = hydratePortablePacks(stored, research.sources)[car.id];
  assert.deepEqual(portable, pack);
  assert.equal(
    portable.car.facts.roadside_assistance.roadsideFitment,
    "optional",
  );
  assert.equal(portable.features[0].status, "optional");
  const evidence = featureEvidence(portable.features[0], "Roadside assistance");
  assert.equal(evidence.status, "optional");
  assert.equal(evidence.buyerGrade, "confirmed");
  assert.equal(evidence.conditions, portable.features[0].conditions);
  assert.deepEqual(evidence.sourceIds, portable.features[0].source_ids);
  const claim = featureClaim(
    portable,
    "roadside_assistance",
    "Roadside assistance",
    packet.reviewedAt,
  )!;
  assert.deepEqual(
    claim,
    featureClaim(
      pack,
      "roadside_assistance",
      "Roadside assistance",
      packet.reviewedAt,
    ),
  );
  assert.equal(claim.status, "optional");
  assert.equal(claim.buyerGrade, "confirmed");
  assert.deepEqual(
    claim.gradeReview,
    portable.car.facts.roadside_assistance.gradeReview,
  );
  assert.deepEqual(claim.qualifications, [portable.features[0].conditions]);
  assert.deepEqual(
    claim.sources.map((citation) => citation.id),
    portable.car.facts.roadside_assistance.sourceIds,
  );
  assert.match(claim.sentence, /confirmed/);
  assert.match(claim.sentence, /Optional paid membership from A\$99\/year/);
  assert.equal(claim.evidenceDate, portable.car.facts.roadside_assistance.date);
  assert.deepEqual(
    applyBrandTermFeatures(portable.car, [feature]),
    portable.features,
  );
});

test("the supplemental Mercedes towing packet changes only the reviewed basis and retains exact evidence guards", () => {
  const readPacket = (name: string): BrandUpdatePacket =>
    JSON.parse(
      readFileSync(
        new URL(`../data/m1-brand-updates/${name}.json`, import.meta.url),
        "utf8",
      ),
    ) as BrandUpdatePacket;
  const original = readPacket("mercedes-benz-2026-10-15");
  const correction = readPacket("mercedes-benz-towing-basis-2026-10-15");
  const edit = correction.facts[0];
  const prior = original.facts.find(
    (row) =>
      row.variantId === edit.variantId && row.after.key === "towing_braked_kg",
  )!;
  const identity = original.versionUpdates.find(
    (row) => row.variantId === edit.variantId,
  )!.after;
  assert.deepEqual(edit.before, prior.after);
  assert.deepEqual(correction.versionGuards, [
    { variantId: edit.variantId, before: identity },
  ]);
  assert.deepEqual(edit.after, {
    ...prior.after,
    basis: "CarsGuide 2026 EQA 250+: explicitly published 0 kg braked towing",
    gradeReview: { ...prior.after.gradeReview, overlayId: correction.id },
  });
  assert.deepEqual(
    correction.sources,
    prior.after.sourceIds.map((id) =>
      original.sources.find((row) => row.id === id),
    ),
  );
  assert.equal(
    correction.facts.length,
    1,
    "this correction has one fact target",
  );
  for (const key of [
    "models",
    "variants",
    "versionUpdates",
    "availability",
    "summaries",
  ] as const)
    assert.deepEqual(correction[key], []);
  assert.deepEqual(correction.features ?? [], []);
  assert.deepEqual(correction.configurationUpdates ?? [], []);
  assert.deepEqual(correction.brandTerms ?? [], []);
  const registry = JSON.parse(
    readFileSync(
      new URL("../data/m1-brand-updates/registry.json", import.meta.url),
      "utf8",
    ),
  ) as { packets: string[] };
  assert.equal(
    registry.packets[
      registry.packets.indexOf("mercedes-benz-2026-10-15.json") + 1
    ],
    "mercedes-benz-towing-basis-2026-10-15.json",
  );

  // Exercise the real guarded packet against a tiny effective-catalogue fixture.
  const fixtureData = fixture();
  const car: Car = {
    ...fixtureData.car,
    ...identity,
    facts: {
      ...fixtureData.car.facts,
      towing_braked_kg: structuredClone(prior.after),
    },
  };
  const research = {
    ...fixtureData.research,
    sources: structuredClone(correction.sources),
  };
  const sibling = { ...car, id: "unrelated-sibling", trim: "Other" };
  const before = structuredClone({ original, correction, car, research });
  const result = applyBrandUpdates([car, sibling], research, [correction]);
  assert.deepEqual(result[0], {
    ...car,
    buyerGradesRequired: true,
    facts: { ...car.facts, towing_braked_kg: edit.after },
  });
  assert.deepEqual(result[0].facts.towing_braked_kg, edit.after);
  assert.equal(result[0].facts.towing_braked_kg.value, 0);
  assert.equal(result[0].facts.towing_braked_kg.buyerGrade, "reported");
  assert.equal(result[0].facts.towing_braked_kg.status, "conditional");
  assert.equal(result[0].facts.towing_braked_kg.resolvedElsewhere, true);
  assert.equal(result[0].facts.range_km, car.facts.range_km);
  assert.equal(result[1], sibling);
  assert.deepEqual({ original, correction, car, research }, before);

  const changedFact = structuredClone(car);
  changedFact.facts.towing_braked_kg.qualifications.push(
    "Changed qualification",
  );
  assert.throws(
    () => applyBrandUpdates([changedFact], research, [correction]),
    /fact before snapshot changed/,
  );
  assert.throws(
    () =>
      applyBrandUpdates([{ ...car, drive: "Unknown" }], research, [correction]),
    /reviewed version changed/,
  );
  const changedSource = structuredClone(research);
  changedSource.sources[0].title = "Changed source snapshot";
  assert.throws(
    () => applyBrandUpdates([car], changedSource, [correction]),
    /source snapshot changed/,
  );
  const wrongOverlay = structuredClone(correction);
  wrongOverlay.facts[0].after.gradeReview!.overlayId = original.id;
  assert.throws(
    () => applyBrandUpdates([car], research, [wrongOverlay]),
    /invalid fact or unearned grade/,
  );
});

function publishedDriveawayFixture() {
  const data = reviewedDriveawayFixture("NSW");
  const published: Fact = {
    ...structuredClone(data.price),
    key: "published_driveaway_aud",
    label: "Published driveaway estimate",
    value: 43990,
    basis: "Maker driveaway estimate · NSW 2000",
    qualifications: ["NSW 2000; standard paint and interior; private purchaser.", "Estimated total; confirm the final retailer price."],
    conditionExplanation: "Postcode-specific estimate, not a promotional offer or accepted order.",
    priceEvidence: {
      ...data.price.priceEvidence!,
      sourceKey: "published_driveaway_aud",
      basisTag: "Maker driveaway estimate · NSW",
      originalBasis: "Published driveaway estimate for NSW 2000",
    },
  };
  delete published.validUntil;
  data.car.facts.price_aud = {
    ...structuredClone(data.price), value: 35990,
    comparisonBasis: "Before on-road costs", basis: "Maker list price before on-road costs",
    buyerGrade: "confirmed", status: "standard", qualifications: [],
    priceEvidence: { ...data.price.priceEvidence!, rung: 1, basisTag: "Before on-road costs", originalBasis: "Maker list price before on-road costs" },
  };
  delete data.car.facts.price_aud.validUntil;
  return { ...data, published };
}

test("ordinary published driveaway estimates retain the list-price primary and exact state/source qualifications", () => {
  const { car, source, research, packet, published, feature } = publishedDriveawayFixture();
  packet.facts = [{ variantId: car.id, before: null, after: published }];
  const before = structuredClone({ car, source, research, packet, feature });
  const prepared = prepareBrandResearch(research, [packet]);
  const updated = applyBrandUpdates([car], prepared, [packet])[0];
  const unrelated: Feature = { ...feature, criterion: "unrelated_fixture" };
  const features = applyBrandTermFeatures(updated, [feature, unrelated], prepared.sources);
  const projected = features[0];
  assert.equal(updated.facts.price_aud.value, 35990);
  assert.equal(updated.facts.price_aud.comparisonBasis, "Before on-road costs");
  assert.equal(projected.value, "A$43,990");
  assert.equal(projected.verification_state, "reviewed_published_driveaway_price");
  assert.equal(projected.buyerGrade, "check");
  assert.deepEqual(projected.source_ids, published.sourceIds);
  assert.deepEqual(projected.gradeReview, published.gradeReview);
  assert.equal(projected.last_evidence_date, published.date);
  assert.equal(projected.reviewed_date, published.gradeReview!.reviewedAt);
  assert.match(projected.condition_label!, /estimate.*NSW/i);
  assert.match(projected.conditions, /NSW 2000/);
  assert.match(projected.conditions, /not a promotional offer/);
  assert.match(projected.conditions, /applies in NSW/);
  assert.doesNotMatch(projected.conditions, /Offer deadline|Superseded/);
  assert.equal(Object.hasOwn(projected, "validUntil"), false);
  assert.equal(Object.hasOwn(projected, "gradeReviewStatus"), false);
  assert.equal(features[1], unrelated);
  const pack: Pack = { car: updated, features, sources: prepared.sources, eligibility: research.update_eligibility[0], events: [], configuration: [] };
  const claim = featureClaim(pack, "driveaway_price", "Driveaway price", packet.reviewedAt)!;
  assert.equal(claim.value, "A$43,990");
  assert.equal(claim.evidenceDate, published.date);
  assert.equal(claim.buyerGrade, "check");
  assert.equal(claim.sources[0].url, source.url);
  assert.match(claim.basis, /estimate.*NSW/i);
  assert.match(claim.qualifications.join(" "), /NSW 2000/);
  const stored = storePortablePacks({ [car.id]: pack });
  assert.deepEqual(hydratePortablePacks(stored, prepared.sources), { [car.id]: pack });
  const written = JSON.parse(JSON.stringify(stored));
  const hydrated = hydratePortablePacks(written, prepared.sources);
  assert.deepEqual(hydrated, { [car.id]: pack });
  assert.deepEqual(featureClaim(hydrated[car.id], "driveaway_price", "Driveaway price", packet.reviewedAt), claim);
  assert.deepEqual({ car, source, research, packet, feature }, before);
});

test("ordinary driveaway fallback preserves main then promotional precedence", () => {
  const { car, source, price, feature, published } = publishedDriveawayFixture();
  car.facts.published_driveaway_aud = published;
  car.facts.promotional_driveaway_aud = { ...price, key: "promotional_driveaway_aud", value: 40990 };
  const list = car.facts.price_aud;
  car.facts.price_aud = { ...price, value: 41990 };
  assert.equal(applyBrandTermFeatures(car, [feature], [source])[0].value, "A$41,990");
  car.facts.price_aud = list;
  assert.equal(applyBrandTermFeatures(car, [feature], [source])[0].value, "A$40,990");
  delete car.facts.promotional_driveaway_aud;
  assert.equal(applyBrandTermFeatures(car, [feature], [source])[0].value, "A$43,990");
  delete car.facts.published_driveaway_aud;
  assert.equal(applyBrandTermFeatures(car, [feature], [source])[0], feature);
});

test("ordinary driveaway packet admission rejects invalid ladder provenance, units, state and basis", () => {
  const { car, research, packet, published } = publishedDriveawayFixture();
  const invalid: Fact[] = [
    { ...published, priceEvidence: undefined },
    { ...published, priceEvidence: { ...published.priceEvidence!, sourcePointer: "" } },
    { ...published, priceEvidence: { ...published.priceEvidence!, sourceKey: "" } },
    { ...published, priceEvidence: { ...published.priceEvidence!, state: "Australia" } },
    { ...published, priceEvidence: { ...published.priceEvidence!, originalBasis: "Before on-road costs" } },
    { ...published, priceEvidence: { ...published.priceEvidence!, rung: 1 } },
    { ...published, comparisonBasis: "Before on-road costs" },
    { ...published, comparisonBasis: "" },
    { ...published, unit: "USD" },
    { ...published, value: -1 },
    { ...published, sourceIds: [] },
    { ...published, sourceIds: [published.sourceIds[0], published.sourceIds[0]] },
  ];
  for (const after of invalid) assert.throws(() => applyBrandUpdates([car], research, [{ ...packet, facts: [{ variantId: car.id, before: null, after }] }]), /price|driveaway|source|grade|fact|state|provenance/i);
});

test("ordinary driveaway projection requires current earned provenance and never projects a before-ORC value", () => {
  const { car, source, feature, published } = publishedDriveawayFixture();
  for (const candidate of [
    { ...published, comparisonBasis: "Before on-road costs" },
    { ...published, market: "NZ" },
    { ...published, status: "not_verified" as const },
    { ...published, gradeReviewStatus: "review_required" as const },
    { ...published, buyerGrade: undefined },
    { ...published, gradeReview: undefined },
    { ...published, priceEvidence: undefined },
    { ...published, priceEvidence: { ...published.priceEvidence!, sourcePointer: "" } },
    { ...published, priceEvidence: { ...published.priceEvidence!, state: "XX" } },
    { ...published, value: null },
    { ...published, sourceIds: [published.sourceIds[0], published.sourceIds[0]] },
  ]) {
    const changed = { ...car, facts: { ...car.facts, published_driveaway_aud: candidate } };
    assert.equal(applyBrandTermFeatures(changed, [feature], [source])[0], feature);
  }
  const current = { ...car, facts: { ...car.facts, published_driveaway_aud: published } };
  assert.equal(applyBrandTermFeatures(current, [feature])[0], feature, "new ordinary fallback requires source context");
  for (const sources of [[], [{ ...source, access_limitation: "Source withdrawn" }], [{ ...source, publication_hold: "Hold" }], [{ ...source, conflict: "Conflicting current source" }], [{ ...source, market: "NZ" }], [{ ...source, accessed_date: "2027-01-01" }]]) {
    assert.equal(applyBrandTermFeatures(current, [feature], sources)[0], feature);
  }
});

test("withdrawn reused driveaway projections lose their earned grade without damaging independent fallbacks", () => {
  const { car, source, feature, published } = publishedDriveawayFixture();
  const current = { ...car, facts: { ...car.facts, published_driveaway_aud: published } };
  const projected = applyBrandTermFeatures(current, [feature], [source])[0];
  const unrelated = { ...feature, criterion: "unrelated_fixture" };
  for (const [candidate, sources] of [
    [car, [source]],
    [{ ...current, facts: { ...current.facts, published_driveaway_aud: { ...published, value: null } } }, [source]],
    [{ ...current, facts: { ...current.facts, published_driveaway_aud: { ...published, gradeReviewStatus: "review_required" } } }, [source]],
    [{ ...current, facts: { ...current.facts, published_driveaway_aud: { ...published, comparisonBasis: "Before on-road costs" } } }, [source]],
    [current, []],
  ] as [Car, Source[]][]) {
    const before = structuredClone({ candidate, sources, projected, unrelated });
    for (const state of ["reviewed_published_driveaway_price", "reviewed_canonical_driveaway_price"]) {
      const reused = { ...projected, verification_state: state };
      const result = applyBrandTermFeatures(candidate, [reused, unrelated], sources);
      assert.equal(result[0].value, projected.value);
      assert.deepEqual(result[0].source_ids, projected.source_ids);
      assert.equal(result[0].buyerGrade, undefined);
      assert.equal(result[0].gradeReview, undefined);
      assert.equal(result[0].gradeReviewStatus, "review_required");
      assert.equal(hasEarnedBuyerGrade(result[0], sources, "2026-10-14"), false);
      assert.equal(result[1], unrelated);
      const pack: Pack = { car: candidate, features: result, sources, eligibility: { variant_id: candidate.id } as Pack["eligibility"], events: [], configuration: [] };
      const claim = featureClaim(pack, "driveaway_price", "Driveaway price", "2026-10-14")!;
      assert.equal(claim.gradeReviewStatus, "review_required");
      assert.equal(claim.buyerGrade, undefined);
      assert.match(claim.sentence, /review required/i);
    }
    assert.equal(applyBrandTermFeatures(candidate, [feature], sources)[0], feature);
    assert.deepEqual({ candidate, sources, projected, unrelated }, before);
  }
});
