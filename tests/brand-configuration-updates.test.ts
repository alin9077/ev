import test from "node:test";
import assert from "node:assert/strict";
import {
  applyBrandUpdates,
  prepareBrandResearch,
  brandVersionSnapshot,
  type BrandUpdatePacket,
} from "../src/lib/brand-updates";
import { rankAttribute } from "../src/lib/discovery";
import ora5LegacyHolds from "./fixtures/ora5-legacy-configuration-holds.json";
import type {
  Car,
  Fact,
  Research,
  Source,
  ConfigurationEvidence,
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

function configurationFixture(legacyHolds = false) {
  const fixtureValue = fixture();
  const { car, research, packet, grade, fact, source } = fixtureValue;
  car.researchStage = "partial";
  const before: ConfigurationEvidence = {
    rankingEligible: false,
    completeVehicleCountEligible: false,
    projectionScope: "Exact MY26 configuration; technical evidence held.",
    requiredBuyerVisibleConditions: [
      "Exact options depend on the ordered build.",
    ],
    sourceIdentity: { modelYear: 2026, buildCode: "BASE" },
    pricingBoundary: { useForPriceRankings: false, amount: null },
    chargingBoundary: { peakKw: null, cableDoesNotProveInlet: true },
    projectionContract: { originalScope: "Exact historical build" },
    options: [{ paint: "Paid two-tone", amount: 2000 }],
    countContribution: {
      boundedConfigurationRecords: 1,
      completeTechnicalRecords: 0,
      rankableRecords: 0,
    },
    requiredNulls: {
      range_wltp_km: {
        value: null,
        reason: "Not established for this exact MY26 version.",
      },
      motor_count: { value: null, reason: "Motor count unverified." },
    },
  };
  if (legacyHolds)
    before.requiredNulls = {
      ...(before.requiredNulls as Record<string, unknown>),
      range_wltp_km: "Not established for this exact MY26 version.",
      motor_continuous_power_kw:
        "  Maximum 150 kW is not a continuous rating.\n",
    };
  car.configurationEvidence = structuredClone(before);
  research.variants[0].configuration_evidence = structuredClone(before);
  const reviewed = grade({ ...fact, value: 470 });
  packet.facts = [{ variantId: car.id, before: fact, after: reviewed }];
  packet.configurationUpdates = [
    {
      variantId: car.id,
      before,
      after: {
        ...structuredClone(before),
        rankingEligible: true,
        projectionScope:
          "Reviewed MY26 range; historical build and option context retained separately.",
        sourceIds: [source.id],
        countContribution: {
          boundedConfigurationRecords: 1,
          completeTechnicalRecords: 0,
          rankableRecords: 1,
        },
        requiredNulls: {
          motor_count: { value: null, reason: "Motor count unverified." },
          ...(legacyHolds && {
            motor_continuous_power_kw:
              "  Maximum 150 kW is not a continuous rating.\n",
          }),
        },
        configurationReview: {
          overlayId: packet.id,
          reviewedAt: packet.reviewedAt,
          historicalBoundaryFields: [
            "pricingBoundary",
            "chargingBoundary",
            "projectionContract",
          ],
          releasedNulls: [{ key: "range_wltp_km", factKeys: ["range_km"] }],
        },
      },
      reason:
        "Exact maker review resolves the range hold without promoting incomplete specifications.",
      sourceIds: [source.id],
      dependencies: [{ key: "range_km", expected: structuredClone(reviewed) }],
    },
  ];
  return {
    ...fixtureValue,
    before,
    reviewed,
    update: packet.configurationUpdates[0],
  };
}

test("explicit configuration review releases only its proven scope and preserves inputs and incomplete-record status", () => {
  const { car, research, packet, before, update } = configurationFixture();
  const original = structuredClone({ car, research, packet });
  const prepared = prepareBrandResearch(research, [packet]);
  const [updated] = applyBrandUpdates([car], prepared, [packet]);
  assert.deepEqual(prepared.variants[0].configuration_evidence, update.after);
  assert.deepEqual(updated.configurationEvidence, update.after);
  assert.equal(updated.researchStage, "partial");
  assert.equal(
    updated.configurationEvidence!.completeVehicleCountEligible,
    false,
  );
  assert.deepEqual(updated.configurationEvidence!.options, before.options);
  assert.deepEqual(
    updated.configurationEvidence!.sourceIdentity,
    before.sourceIdentity,
  );
  assert.deepEqual(
    prepared.feature_evidence_variant_context![0].configuration_evidence,
    before,
  );
  assert.notEqual(
    prepared.feature_evidence_variant_context![0].configuration_evidence,
    before,
  );
  assert.equal(
    rankAttribute([updated], prepared.sources, "range_km", {
      asOf: packet.reviewedAt,
    }).groups[0].entries.length,
    1,
  );
  assert.deepEqual({ car, research, packet }, original);
  assert.deepEqual(prepareBrandResearch(research, [packet]), prepared);
});

test("legacy packets and empty registries never lift a configuration hold", () => {
  const { car, research, packet } = configurationFixture();
  delete packet.configurationUpdates;
  assert.equal(prepareBrandResearch(research, []), research);
  const cars = [car];
  assert.equal(applyBrandUpdates(cars, research, []), cars);
  const [updated] = applyBrandUpdates(
    cars,
    prepareBrandResearch(research, [packet]),
    [packet],
  );
  assert.equal(updated.configurationEvidence!.rankingEligible, false);
  assert.equal(
    rankAttribute([updated], research.sources, "range_km", {
      asOf: packet.reviewedAt,
    }).groups.length,
    0,
  );
});

test("mixed legacy and typed holds retain exact text and release only the proven legacy alias", () => {
  const { car, research, packet, before, update } = configurationFixture(true);
  const original = structuredClone({ car, research, packet });
  const prepared = prepareBrandResearch(research, [packet]);
  const [updated] = applyBrandUpdates([car], prepared, [packet]);
  assert.deepEqual(updated.configurationEvidence, update.after);
  assert.deepEqual(updated.configurationEvidence!.requiredNulls, {
    motor_count: { value: null, reason: "Motor count unverified." },
    motor_continuous_power_kw: "  Maximum 150 kW is not a continuous rating.\n",
  });
  assert.equal(updated.facts.motor_continuous_power_kw, undefined);
  assert.equal(updated.facts.motor_count, undefined);
  assert.equal(updated.facts.range_km.value, 470);
  assert.equal(
    updated.configurationEvidence!.completeVehicleCountEligible,
    false,
  );
  assert.deepEqual(
    prepared.feature_evidence_variant_context![0].configuration_evidence,
    before,
  );
  assert.deepEqual({ car, research, packet }, original);
  assert.deepEqual(prepareBrandResearch(research, [packet]), prepared);
});

test("legacy explanations never bypass the default ranking hold or become facts", () => {
  const { car, research, packet } = configurationFixture(true);
  delete packet.configurationUpdates;
  const prepared = prepareBrandResearch(research, [packet]);
  const [updated] = applyBrandUpdates([car], prepared, [packet]);
  assert.equal(updated.configurationEvidence!.rankingEligible, false);
  assert.deepEqual(updated.configurationEvidence, car.configurationEvidence);
  assert.equal(updated.facts.range_km.value, 470);
  assert.equal(updated.facts.motor_continuous_power_kw, undefined);
  assert.deepEqual(
    rankAttribute([updated], prepared.sources, "range_km", {
      asOf: packet.reviewedAt,
    }).groups,
    [],
  );
});

test("actual Ora5 legacy hold text supports same-key proof while retaining all 28 unrelated holds", () => {
  const { car, research, packet, update, before, fact, grade } =
    configurationFixture();
  // The exact 30-entry map is shared by the inherited Lux and Ultra records.
  // This test supplies synthetic proof; it does not approve a live GWM packet.
  assert.equal(ora5LegacyHolds.variantIds.length, 2);
  assert.equal(Object.keys(ora5LegacyHolds.requiredNulls).length, 30);
  before.requiredNulls = structuredClone(ora5LegacyHolds.requiredNulls);
  car.configurationEvidence = structuredClone(before);
  research.variants[0].configuration_evidence = structuredClone(before);
  const retained: Record<string, string> = structuredClone(
    ora5LegacyHolds.requiredNulls,
  );
  delete retained.dc_peak_kw;
  delete retained.towing_braked_kg;
  update.after.requiredNulls = retained;
  const measurements = [
    { key: "dc_peak_kw", value: 120, unit: "kW", basis: "Vehicle DC peak" },
    { key: "towing_braked_kg", value: 750, unit: "kg", basis: "Braked towing" },
  ];
  packet.facts = measurements.map(({ key, value, unit, basis }) => {
    const previous: Fact = {
      ...structuredClone(fact),
      key,
      value: null,
      unit,
      basis,
      comparisonBasis: basis,
    };
    car.facts[key] = previous;
    return {
      variantId: car.id,
      before: previous,
      after: grade({ ...previous, value }),
    };
  });
  update.dependencies = packet.facts.map(({ after }) => ({
    key: after.key,
    expected: structuredClone(after),
  }));
  update.after.configurationReview!.releasedNulls = measurements.map(
    ({ key }) => ({
      key,
      factKeys: [key],
    }),
  );
  const original = structuredClone({ car, research, packet });
  const prepared = prepareBrandResearch(research, [packet]);
  const [updated] = applyBrandUpdates([car], prepared, [packet]);
  assert.deepEqual(updated.configurationEvidence!.requiredNulls, retained);
  assert.equal(Object.keys(retained).length, 28);
  assert.equal(updated.facts.dc_peak_kw.value, 120);
  assert.equal(updated.facts.towing_braked_kg.value, 750);
  assert.equal(updated.facts.towing_unbraked_kg, undefined);
  assert.equal(updated.facts.battery_usable_kwh, undefined);
  assert.equal(
    updated.configurationEvidence!.completeVehicleCountEligible,
    false,
  );
  assert.deepEqual({ car, research, packet }, original);
});

test("configuration approval preserves independent fact measurement, grade, source and freshness exclusions", () => {
  const { car, research, packet } = configurationFixture();
  const [updated] = applyBrandUpdates(
    [car],
    prepareBrandResearch(research, [packet]),
    [packet],
  );
  for (const fact of [
    { ...updated.facts.range_km, comparisonBasis: "" },
    {
      ...updated.facts.range_km,
      buyerGrade: "reported" as const,
      resolvedElsewhere: true,
    },
    {
      ...updated.facts.range_km,
      gradeReviewStatus: "review_required" as const,
    },
    { ...updated.facts.range_km, value: null },
    { ...updated.facts.range_km, date: "2025-10-14" },
  ]) {
    const changed = { ...updated, facts: { ...updated.facts, range_km: fact } };
    assert.equal(
      rankAttribute([changed], research.sources, "range_km", {
        asOf: packet.reviewedAt,
      }).groups.length,
      0,
    );
  }
  assert.equal(
    rankAttribute(
      [updated],
      [{ ...research.sources[0], publication_hold: true }],
      "range_km",
      { asOf: packet.reviewedAt },
    ).groups.length,
    0,
  );
});

test("identity, exact before scope, existing-target uniqueness, brand and tier are checked independently at both stages", () => {
  for (const kind of [
    "identity",
    "before",
    "brand",
    "tier",
    "duplicate",
    "unguarded",
  ]) {
    const { car, research, packet } = configurationFixture();
    const cars = [car];
    if (kind === "identity") {
      car.trim = "Other";
      research.variants[0].trim = "Other";
    }
    if (kind === "before") {
      car.configurationEvidence!.projectionScope += " Changed";
      research.variants[0].configuration_evidence!.projectionScope +=
        " Changed";
    }
    if (kind === "brand") {
      car.brand = "Other";
      research.variants[0].brand = "Other";
    }
    if (kind === "tier") {
      car.vehicleClass = "van";
      research.variants[0].vehicle_class = "van";
    }
    if (kind === "duplicate") {
      cars.push(structuredClone(car));
      research.variants.push(structuredClone(research.variants[0]));
    }
    if (kind === "unguarded") packet.versionGuards = [];
    assert.throws(
      () => prepareBrandResearch(research, [packet]),
      /configuration|version|tier|brand/,
      kind,
    );
    assert.throws(
      () => applyBrandUpdates(cars, research, [packet]),
      /configuration|version|tier|brand/,
      kind,
    );
  }
});

const invalidUpdates: [
  string,
  (value: ReturnType<typeof configurationFixture>) => void,
][] = [
  [
    "duplicate target",
    ({ packet, update }) => {
      packet.configurationUpdates!.push(structuredClone(update));
    },
  ],
  [
    "no reason",
    ({ update }) => {
      update.reason = " ";
    },
  ],
  [
    "no dependencies",
    ({ update }) => {
      update.dependencies = [];
    },
  ],
  [
    "duplicate dependency",
    ({ update }) => {
      update.dependencies.push(structuredClone(update.dependencies[0]));
    },
  ],
  [
    "dependency drift",
    ({ update }) => {
      update.dependencies[0].expected.value = 999;
    },
  ],
  [
    "dependency absent from packet",
    ({ packet }) => {
      packet.facts = [];
    },
  ],
  [
    "unrelated release proof",
    ({ update }) => {
      update.after.configurationReview!.releasedNulls[0].key = "motor_count";
      update.after.requiredNulls = {
        range_wltp_km: (update.before!.requiredNulls as Record<string, unknown>)
          .range_wltp_km,
      };
    },
  ],
  [
    "missing release proof",
    ({ update }) => {
      update.after.configurationReview!.releasedNulls = [];
    },
  ],
  [
    "missing historical boundaries",
    ({ update }) => {
      update.after.configurationReview!.historicalBoundaryFields = [];
    },
  ],
  [
    "retained hold changed",
    ({ update }) => {
      (
        update.after.requiredNulls as Record<string, { reason: string }>
      ).motor_count.reason = "Changed";
    },
  ],
  [
    "no source snapshots",
    ({ packet }) => {
      packet.sources = [];
    },
  ],
  [
    "source drift",
    ({ packet }) => {
      packet.sources = [
        { ...packet.sources[0], supports: "Different version" },
      ];
    },
  ],
  [
    "blocked source",
    ({ packet, research }) => {
      packet.sources[0].publication_hold = true;
      research.sources[0].publication_hold = true;
    },
  ],
  [
    "missing cited source",
    ({ update }) => {
      update.sourceIds = ["unknown"];
      update.after.sourceIds = ["unknown"];
    },
  ],
  [
    "mismatched scope sources",
    ({ update }) => {
      update.after.sourceIds = [];
    },
  ],
  [
    "complete-record promotion",
    ({ update }) => {
      update.after.completeVehicleCountEligible = true;
    },
  ],
  [
    "source identity changed",
    ({ update }) => {
      update.after.sourceIdentity = { modelYear: 2027, buildCode: "BASE" };
    },
  ],
  [
    "build options changed",
    ({ update }) => {
      update.after.options = [];
    },
  ],
  [
    "pricing boundary changed",
    ({ update }) => {
      update.after.pricingBoundary = { useForPriceRankings: true };
    },
  ],
  [
    "unknown added field",
    ({ update }) => {
      update.after.arbitraryNewProof = true;
    },
  ],
  [
    "null after",
    ({ update }) => {
      Object.assign(update, { after: null });
    },
  ],
  [
    "null before",
    ({ update, car, research }) => {
      update.before = null;
      delete car.configurationEvidence;
      delete research.variants[0].configuration_evidence;
    },
  ],
  [
    "string ranking flag",
    ({ update }) => {
      Object.assign(update.after, { rankingEligible: "true" });
    },
  ],
  [
    "string complete flag",
    ({ update }) => {
      Object.assign(update.after, { completeVehicleCountEligible: "false" });
    },
  ],
  [
    "empty scope",
    ({ update }) => {
      update.after.projectionScope = "";
    },
  ],
  [
    "mistyped source IDs",
    ({ update }) => {
      Object.assign(update.after, { sourceIds: "source" });
    },
  ],
  [
    "mistyped conditions",
    ({ update }) => {
      Object.assign(update.after, { requiredBuyerVisibleConditions: [false] });
    },
  ],
  [
    "mistyped counts",
    ({ update }) => {
      update.after.countContribution = {
        boundedConfigurationRecords: 1,
        completeTechnicalRecords: 0,
        rankableRecords: "1",
      };
    },
  ],
  [
    "promoted counts",
    ({ update }) => {
      update.after.countContribution = {
        boundedConfigurationRecords: 1,
        completeTechnicalRecords: 1,
        rankableRecords: 1,
      };
    },
  ],
  [
    "non-null hold",
    ({ update }) => {
      update.after.requiredNulls = {
        motor_count: { value: 1, reason: "Unknown" },
      };
    },
  ],
  [
    "mistyped review",
    ({ update }) => {
      Object.assign(update.after, { configurationReview: [] });
    },
  ],
  [
    "mistyped release",
    ({ update }) => {
      Object.assign(update.after.configurationReview!, {
        releasedNulls: [false],
      });
    },
  ],
];
for (const legacyHolds of [false, true])
  for (const [name, mutate] of invalidUpdates)
    test(`configuration review with ${legacyHolds ? "mixed legacy" : "typed"} holds rejects ${name} at preparation and catalogue application`, () => {
      const value = configurationFixture(legacyHolds);
      mutate(value);
      assert.throws(
        () => prepareBrandResearch(value.research, [value.packet]),
        /Brand update|Invalid reviewed state/,
      );
      assert.throws(
        () => applyBrandUpdates([value.car], value.research, [value.packet]),
        /Brand update|Invalid reviewed state/,
      );
    });

const malformedLegacyHolds: [string, unknown][] = [
  ["empty string", ""],
  ["whitespace-only string", " \t\r\n\u00a0"],
  ["boxed string", Object("Legacy explanation")],
  ["string array", ["Legacy explanation"]],
  ["number", 120],
  ["boolean", false],
  ["bare null", null],
  ["undefined", undefined],
  ["reason-only object", { reason: "Legacy explanation" }],
  ["empty typed reason", { value: null, reason: " " }],
  ["typed string value", { value: "null", reason: "Legacy explanation" }],
  [
    "unexpected typed field",
    { value: null, reason: "Legacy explanation", fact: 120 },
  ],
];
for (const side of ["before", "after"] as const)
  for (const [name, hold] of malformedLegacyHolds)
    test(`configuration review rejects ${name} as a ${side} legacy hold at both stages`, () => {
      const { car, research, packet, update } = configurationFixture(true);
      (
        update[side]!.requiredNulls as Record<string, unknown>
      ).motor_continuous_power_kw = hold;
      if (side === "before") {
        car.configurationEvidence = structuredClone(update.before!);
        research.variants[0].configuration_evidence = structuredClone(
          update.before!,
        );
      }
      const expectedError =
        name === "boxed string"
          ? /Invalid reviewed state: plain JSON objects required/
          : /invalid required null/;
      assert.throws(
        () => prepareBrandResearch(research, [packet]),
        expectedError,
      );
      assert.throws(
        () => applyBrandUpdates([car], research, [packet]),
        expectedError,
      );
    });

const invalidLegacyUpdates: [
  string,
  (value: ReturnType<typeof configurationFixture>) => void,
  RegExp,
][] = [
  [
    "before text drift",
    ({ car, research }) => {
      (
        car.configurationEvidence!.requiredNulls as Record<string, unknown>
      ).range_wltp_km += " ";
      (
        research.variants[0].configuration_evidence!.requiredNulls as Record<
          string,
          unknown
        >
      ).range_wltp_km += " ";
    },
    /before snapshot changed/,
  ],
  [
    "retained text trimming",
    ({ update }) => {
      (
        update.after.requiredNulls as Record<string, string>
      ).motor_continuous_power_kw =
        "Maximum 150 kW is not a continuous rating.";
    },
    /retained null hold changed/,
  ],
  [
    "retained string normalized to typed hold",
    ({ update }) => {
      (
        update.after.requiredNulls as Record<string, unknown>
      ).motor_continuous_power_kw = {
        value: null,
        reason: "  Maximum 150 kW is not a continuous rating.\n",
      };
    },
    /retained null hold changed/,
  ],
  [
    "new legacy hold",
    ({ update }) => {
      (update.after.requiredNulls as Record<string, unknown>).battery_kwh =
        "Not reviewed.";
    },
    /retained null hold changed/,
  ],
  [
    "removed legacy hold without proof",
    ({ update }) => {
      delete (update.after.requiredNulls as Record<string, unknown>)
        .motor_continuous_power_kw;
    },
    /released null lacks exact fact proof/,
  ],
  [
    "release proof for retained legacy hold",
    ({ update }) => {
      update.after.configurationReview!.releasedNulls.push({
        key: "motor_continuous_power_kw",
        factKeys: ["range_km"],
      });
    },
    /released null lacks exact fact proof/,
  ],
  [
    "wrong legacy alias measurement",
    ({ update, packet }) => {
      packet.facts[0].after.comparisonBasis = "NEDC";
      update.dependencies[0].expected.comparisonBasis = "NEDC";
    },
    /null release proof has wrong measurement/,
  ],
  [
    "unrelated legacy hold proof",
    ({ update }) => {
      const holds = update.after.requiredNulls as Record<string, unknown>;
      holds.range_wltp_km = (
        update.before!.requiredNulls as Record<string, unknown>
      ).range_wltp_km;
      delete holds.motor_continuous_power_kw;
      update.after.configurationReview!.releasedNulls = [
        {
          key: "motor_continuous_power_kw",
          factKeys: ["range_km"],
        },
      ];
    },
    /null release proof has wrong measurement/,
  ],
];
for (const [name, mutate, expectedError] of invalidLegacyUpdates)
  test(`legacy configuration review rejects ${name} at both stages`, () => {
    const value = configurationFixture(true);
    mutate(value);
    assert.throws(
      () => prepareBrandResearch(value.research, [value.packet]),
      expectedError,
    );
    assert.throws(
      () => applyBrandUpdates([value.car], value.research, [value.packet]),
      expectedError,
    );
  });

test("later dependent fact correction needs a renewed configuration review with an exact before state", () => {
  const { car, research, packet, grade } = configurationFixture();
  const prepared = prepareBrandResearch(research, [packet]);
  const updated = applyBrandUpdates([car], prepared, [packet])[0];
  const next: BrandUpdatePacket = {
    ...structuredClone(packet),
    id: "m1-fixture-next",
    reviewedAt: "2026-10-15",
    facts: [],
    configurationUpdates: [],
  };
  const fact = grade(
    { ...updated.facts.range_km, value: 480, date: next.reviewedAt },
    next,
  );
  next.facts = [
    { variantId: car.id, before: updated.facts.range_km, after: fact },
  ];
  assert.throws(
    () => applyBrandUpdates([car], research, [packet, next]),
    /configuration dependency/,
  );
  next.configurationUpdates = [
    {
      ...structuredClone(packet.configurationUpdates![0]),
      before: structuredClone(updated.configurationEvidence!),
      after: {
        ...structuredClone(updated.configurationEvidence!),
        configurationReview: {
          overlayId: next.id,
          reviewedAt: next.reviewedAt,
          historicalBoundaryFields: [
            "pricingBoundary",
            "chargingBoundary",
            "projectionContract",
          ],
          releasedNulls: [],
        },
      },
      dependencies: [{ key: fact.key, expected: fact }],
      reason: "New exact range review replaces the earlier scope proof.",
    },
  ];
  const chained = prepareBrandResearch(JSON.parse(JSON.stringify(prepared)), [
    next,
  ]);
  const together = prepareBrandResearch(research, [packet, next]);
  assert.deepEqual(chained.variants, together.variants);
  assert.deepEqual(
    chained.feature_evidence_variant_context,
    together.feature_evidence_variant_context,
  );
  const final = applyBrandUpdates([car], together, [packet, next])[0];
  assert.equal(final.facts.range_km.value, 480);
  assert.deepEqual(
    final.configurationEvidence,
    next.configurationUpdates[0].after,
  );
});
