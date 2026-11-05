/** Dated Tier 1 research packets, applied after the frozen initial M1 view. */
import {
  validateConfigurationUpdate,
  validateConfigurationDependencies,
  type BrandConfigurationUpdate,
} from "./brand-configuration-updates";
import { validDate } from "./corrections";
import { availabilityLabels, safeUrl } from "./config";
import {
  applyAvailabilityCorrections,
  type AvailabilityCorrection,
} from "./availability-corrections";
import {
  sameReviewedState,
  assertReviewedJson,
  usableCorrectionSources,
} from "./correction-guards";
import { hasEarnedBuyerGrade } from "./evidence-grading";
import { priceCandidateRejection } from "./price-ladder";
import type { BuyerClause, BuyerSummary } from "./selling-points";
import type { Car, Fact, Feature, Research, Source, Variant } from "./types";

export type BrandVersionSnapshot = Pick<
  Car,
  | "id"
  | "modelId"
  | "brand"
  | "model"
  | "trim"
  | "year"
  | "generation"
  | "drive"
> & { vehicleClass: "passenger" | "ute" };
export type BrandFactUpdate = {
  variantId: string;
  before: Fact | null;
  after: Fact;
};
export type BrandFeatureUpdate = {
  variantId: string;
  criterion: string;
  /** Full effective row after initial regrading and preceding feature packets. */
  before: Feature;
  after: Feature;
  /** Exact post-packet facts. A wholly Not published row requires feature_<criterion>: null. */
  dependencies: { key: string; expected: Fact }[];
};
export type BrandSummaryClause = {
  label: string;
  text: string;
  /** Exact effective facts after this packet, never unrelated proxy evidence. */
  dependencies: { key: string; expected: Fact }[];
};
export type BrandSummaryUpdate = {
  variantId: string;
  conditions?: string[];
  strength: BrandSummaryClause;
  tradeoff: BrandSummaryClause;
};
export type BrandTerm = {
  key: "warranty" | "battery_warranty" | "roadside_assistance";
  fact: Fact;
  applicableVariantIds: string[];
  before: Record<string, Fact | null>;
  exceptions: { variantId: string; reason: string }[];
};
export type BrandUpdatePacket = {
  schemaVersion: 1;
  id: string;
  brand: string;
  reviewedAt: string;
  reviewedBy: string;
  /** Full snapshots. Existing IDs are checked; only genuinely new IDs are added. */
  sources: Source[];
  models: Research["models"];
  variants: Variant[];
  versionGuards: { variantId: string; before: BrandVersionSnapshot }[];
  versionUpdates: {
    variantId: string;
    before: BrandVersionSnapshot;
    after: BrandVersionSnapshot;
    reason: string;
  }[];
  facts: BrandFactUpdate[];
  features?: BrandFeatureUpdate[];
  configurationUpdates?: BrandConfigurationUpdate[];
  /** One reviewed source of truth, explicitly inherited by all applicable versions. */
  brandTerms?: BrandTerm[];
  availability: AvailabilityCorrection[];
  summaries: BrandSummaryUpdate[];
};
const text = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
const tier1 = (value: unknown) =>
  value === undefined || value === "passenger" || value === "ute";
function fail(message: string): never {
  throw new Error(`Brand update: ${message}`);
}
export function brandVersionSnapshot(car: Car): BrandVersionSnapshot {
  if (!tier1(car.vehicleClass)) fail(`version is outside Tier 1: ${car.id}`);
  return {
    id: car.id,
    modelId: car.modelId,
    brand: car.brand,
    model: car.model,
    trim: car.trim,
    year: car.year,
    generation: car.generation,
    vehicleClass: (car.vehicleClass ?? "passenger") as "passenger" | "ute",
    drive: car.drive,
  };
}
function validatePacket(packet: BrandUpdatePacket) {
  assertReviewedJson(packet);
  if (
    packet.schemaVersion !== 1 ||
    !text(packet.id) ||
    !text(packet.brand) ||
    !text(packet.reviewedBy) ||
    !validDate(packet.reviewedAt)
  )
    fail("invalid packet header");
  for (const key of [
    "sources",
    "models",
    "variants",
    "versionGuards",
    "versionUpdates",
    "facts",
    "availability",
    "summaries",
  ] as const)
    if (!Array.isArray(packet[key])) fail(`missing ${key} in ${packet.id}`);
  if (packet.brandTerms !== undefined && !Array.isArray(packet.brandTerms))
    fail(`invalid brand terms in ${packet.id}`);
  if (packet.features !== undefined && !Array.isArray(packet.features))
    fail(`invalid features in ${packet.id}`);
  if (
    packet.configurationUpdates !== undefined &&
    !Array.isArray(packet.configurationUpdates)
  )
    fail(`invalid configuration updates in ${packet.id}`);
  const configurationUpdates = packet.configurationUpdates ?? [];
  if (
    configurationUpdates.some(
      (row) => !row || typeof row !== "object" || !text(row.variantId),
    ) ||
    new Set(configurationUpdates.map((row) => row.variantId)).size !==
      configurationUpdates.length
  )
    fail(`invalid or duplicate configuration target in ${packet.id}`);
  const features = packet.features ?? [];
  if (
    new Set(features.map((row) => `${row.variantId}\0${row.criterion}`))
      .size !== features.length
  )
    fail(`duplicate feature target in ${packet.id}`);
  for (const key of ["sources", "models", "variants"] as const)
    if (new Set(packet[key].map((row) => row.id)).size !== packet[key].length)
      fail(`duplicate ${key} in ${packet.id}`);
  for (const key of [
    "versionGuards",
    "versionUpdates",
    "availability",
    "summaries",
  ] as const)
    if (
      new Set(packet[key].map((row) => row.variantId)).size !==
      packet[key].length
    )
      fail(`duplicate ${key} target in ${packet.id}`);
  if (
    new Set(packet.facts.map((row) => `${row.variantId}\0${row.after?.key}`))
      .size !== packet.facts.length
  )
    fail(`duplicate fact target in ${packet.id}`);
}
function orderedPackets(packets: readonly BrandUpdatePacket[]) {
  const seen = new Set<string>();
  let previous = "";
  for (const packet of packets) {
    validatePacket(packet);
    if (seen.has(packet.id) || packet.reviewedAt < previous)
      fail("duplicate packet ID or non-chronological registry");
    seen.add(packet.id);
    previous = packet.reviewedAt;
  }
}
function mergeSources(sources: Source[], packet: BrandUpdatePacket): Source[] {
  const result = [...sources];
  for (const source of packet.sources) {
    if (
      !text(source.id) ||
      !safeUrl(source.url) ||
      !text(source.title) ||
      !text(source.publisher) ||
      !text(source.source_type) ||
      !text(source.supports) ||
      !["AU", "Australia", "AU/NZ"].includes(source.market) ||
      !validDate(source.accessed_date) ||
      source.accessed_date > packet.reviewedAt
    )
      fail(`invalid source ${source.id}`);
    const current = result.filter((row) => row.id === source.id);
    if (
      current.length > 1 ||
      (current.length === 1 && !sameReviewedState(current[0], source))
    )
      fail(`source snapshot changed: ${source.id}`);
    if (!current.length) result.push(structuredClone(source));
  }
  return result;
}
function cited(ids: string[], packet: BrandUpdatePacket) {
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !packet.sources.some((source) => source.id === id))
  )
    fail(`missing explicit source snapshot in ${packet.id}`);
}
function newVariantCar(variant: Variant, models: Research["models"]): Car {
  const model = models.find((row) => row.id === variant.model_id);
  if (!model) fail(`unknown model for ${variant.id}`);
  return {
    id: variant.id,
    modelId: variant.model_id,
    modelFamily: model.family_id,
    family: variant.model_id.startsWith("byd_atto_3")
      ? "byd-atto-3"
      : variant.model_id.replaceAll("_", "-"),
    slug: (variant.id.split("__").length >= 3
      ? variant.id.split("__").slice(1).join("-")
      : variant.id
    ).replaceAll("_", "-"),
    brand: variant.brand,
    model:
      typeof variant.brand_update_model === "string"
        ? variant.brand_update_model
        : variant.model_id === "byd_atto_3_legacy"
          ? "ATTO 3 (legacy FWD)"
          : variant.model,
    trim: variant.trim,
    year: variant.model_year,
    generation:
      typeof variant.brand_update_generation === "string"
        ? variant.brand_update_generation
        : model.generation || "Generation details not verified",
    vehicleClass: (variant.vehicle_class ?? "passenger") as Car["vehicleClass"],
    researchStage: "partial",
    buyerGradesRequired: true,
    availability: variant.record_state,
    availabilityEvidence: {
      checkedAt: variant.variant_review_date,
      orderStatus: "unverified",
      stockStatus: "unverified",
      sourceIds: [...variant.source_ids],
      qualifications: [
        "Physical stock and factory-order acceptance have not been verified.",
      ],
    },
    drive: typeof variant.drive === "string" ? variant.drive : "Unknown",
    ...(variant.configuration_evidence
      ? {
          configurationEvidence: structuredClone(
            variant.configuration_evidence,
          ),
        }
      : {}),
    facts: {},
    issues: [],
  };
}
/** Research identity/features are added before route and pack enumeration. No original object is edited. */
export function prepareBrandResearch(
  base: Research,
  packets: readonly BrandUpdatePacket[],
): Research {
  orderedPackets(packets);
  if (!packets.length) return base;
  const result = {
    ...base,
    metadata: { ...base.metadata },
    models: [...base.models],
    variants: [...base.variants],
    // Availability and identity below are current. Historical feature guards
    // must still reconstruct the warning context present before those changes.
    feature_evidence_variant_context: (
      base.feature_evidence_variant_context ?? base.variants
    ).map(({ id, model_id, record_state, configuration_evidence }) => ({
      id,
      model_id,
      record_state,
      ...(configuration_evidence
        ? { configuration_evidence: structuredClone(configuration_evidence) }
        : {}),
    })),
    sources: [...base.sources],
    trim_equipment: [...base.trim_equipment],
    feature_evidence: [...base.feature_evidence],
    update_eligibility: [...base.update_eligibility],
  };
  for (const packet of packets) {
    result.sources = mergeSources(result.sources, packet);
    for (const model of packet.models) {
      if (
        !text(model.id) ||
        !text(model.model) ||
        model.brand !== packet.brand ||
        result.models.some((row) => row.id === model.id)
      )
        fail(`invalid or duplicate model ${model.id}`);
      result.models.push(structuredClone(model));
    }
    for (const variant of packet.variants) {
      if (
        !text(variant.id) ||
        variant.brand !== packet.brand ||
        !text(variant.model) ||
        !text(variant.trim) ||
        !tier1(variant.vehicle_class) ||
        !Object.hasOwn(availabilityLabels, variant.record_state) ||
        !validDate(variant.variant_review_date) ||
        variant.variant_review_date > packet.reviewedAt ||
        result.variants.some((row) => row.id === variant.id) ||
        !result.models.some(
          (model) =>
            model.id === variant.model_id && model.brand === packet.brand,
        )
      )
        fail(`invalid or duplicate new version ${variant.id}`);
      // Values belong in guarded facts, not in two competing specification stores.
      if (
        [variant.price_aud, variant.range_km, variant.seats].some(
          (value) => value !== null,
        )
      )
        fail(`new version values must be supplied as facts: ${variant.id}`);
      if (variant.availability_evidence !== undefined)
        fail(
          `new version availability must use a guarded availability change: ${variant.id}`,
        );
      cited(variant.source_ids, packet);
      if (variant.configuration_evidence?.sourceIds)
        cited(variant.configuration_evidence.sourceIds, packet);
      result.variants.push(structuredClone(variant));
      result.feature_evidence_variant_context.push({
        id: variant.id,
        model_id: variant.model_id,
        record_state: variant.record_state,
        ...(variant.configuration_evidence
          ? {
              configuration_evidence: structuredClone(
                variant.configuration_evidence,
              ),
            }
          : {}),
      });
      result.trim_equipment.push({
        variant_id: variant.id,
        source_ids: [],
        notes: "Exact-version equipment research pending",
      });
      for (const criterion of result.criteria)
        result.feature_evidence.push({
          variant_id: variant.id,
          model_id: variant.model_id,
          criterion: criterion.key,
          value: "Needs confirmation",
          status: "not_verified",
          conditions: "Exact-version equipment research pending.",
          source_ids: [],
          evidence_scope: "AU exact version; research pending",
          last_evidence_date: packet.reviewedAt,
          reviewed_date: packet.reviewedAt,
          verification_state: "unverified",
        });
      result.update_eligibility.push({
        variant_id: variant.id,
        model_id: variant.model_id,
        documented_family_minimum: null,
        exact_total_known: false,
        exact_total: null,
        scope: "No exact-version software-update history established.",
        meaning: "Research pending",
        source_ids: [],
        observation_window_start: packet.reviewedAt,
        observation_window_end: packet.reviewedAt,
      });
    }
    const researchTargets = new Set(
      [
        ...packet.versionGuards,
        ...packet.versionUpdates,
        ...packet.availability,
        ...packet.facts,
        ...(packet.features ?? []),
        ...(packet.configurationUpdates ?? []),
        ...packet.summaries,
        ...(packet.brandTerms ?? []).flatMap((term) =>
          term.applicableVariantIds.map((variantId) => ({ variantId })),
        ),
      ].map((row) => row.variantId),
    );
    for (const id of researchTargets) {
      const variant = result.variants.find((row) => row.id === id);
      if (
        !variant ||
        variant.brand !== packet.brand ||
        !tier1(variant.vehicle_class)
      )
        fail(`wrong brand, version or tier: ${id}`);
      if (!packet.variants.some((row) => row.id === id)) {
        const guard = packet.versionGuards.find((row) => row.variantId === id);
        if (
          !guard ||
          !sameReviewedState(
            brandVersionSnapshot(newVariantCar(variant, result.models)),
            guard.before,
          )
        )
          fail(`reviewed version changed: ${id}`);
      }
    }
    for (const edit of packet.versionUpdates) {
      const index = result.variants.findIndex(
        (variant) => variant.id === edit.variantId,
      );
      if (
        index < 0 ||
        edit.after.id !== edit.variantId ||
        edit.after.brand !== packet.brand ||
        edit.after.modelId !== result.variants[index].model_id ||
        !sameReviewedState(
          brandVersionSnapshot(
            newVariantCar(result.variants[index], result.models),
          ),
          edit.before,
        ) ||
        !text(edit.reason)
      )
        fail(`invalid metadata target ${edit.variantId}`);
      result.variants[index] = {
        ...result.variants[index],
        brand: edit.after.brand,
        model: edit.after.model,
        brand_update_model: edit.after.model,
        trim: edit.after.trim,
        model_year: edit.after.year,
        drive: edit.after.drive,
        vehicle_class: edit.after.vehicleClass,
        brand_update_generation: edit.after.generation,
      };
    }
    for (const edit of packet.configurationUpdates ?? []) {
      if (packet.variants.some((variant) => variant.id === edit.variantId))
        fail(
          `configuration update requires an existing version: ${edit.variantId}`,
        );
      if (
        result.variants.filter((variant) => variant.id === edit.variantId)
          .length !== 1
      )
        fail(`configuration target is not unique: ${edit.variantId}`);
      const index = result.variants.findIndex(
        (variant) => variant.id === edit.variantId,
      );
      validateConfigurationUpdate(
        edit,
        result.variants[index].configuration_evidence ?? null,
        packet,
        result.sources,
      );
      for (const dependency of edit.dependencies)
        validateFact(dependency.expected, packet, result.sources);
      result.variants[index] = {
        ...result.variants[index],
        configuration_evidence: structuredClone(edit.after),
      };
    }
    for (const edit of packet.availability) {
      const index = result.variants.findIndex(
        (variant) => variant.id === edit.variantId,
      );
      if (index < 0 || result.variants[index].brand !== packet.brand)
        fail(`invalid availability target ${edit.variantId}`);
      result.variants[index] = {
        ...result.variants[index],
        record_state: edit.after.availability,
        availability_evidence: structuredClone(edit.after.evidence),
      };
    }
  }
  result.metadata.added_variant_count =
    Number(base.metadata.added_variant_count ?? 0) +
    result.variants.length -
    base.variants.length;
  result.metadata.added_feature_row_count =
    Number(base.metadata.added_feature_row_count ?? 0) +
    result.feature_evidence.length -
    base.feature_evidence.length;
  result.metadata.brand_update_packet_ids = packets.map((packet) => packet.id);
  return result;
}
/** Explicit roadside fitment never derives from source quality or parsed prose. */
function roadsideFeatureStatus(fact: Fact): Feature["status"] {
  if (!Object.hasOwn(fact, "roadsideFitment")) return fact.status;
  if (
    fact.key !== "roadside_assistance" ||
    !["standard", "optional"].includes(fact.roadsideFitment ?? "")
  )
    fail(`invalid roadside fitment: ${fact.key}`);
  return fact.roadsideFitment!;
}
function validateFact(
  fact: Fact,
  packet: BrandUpdatePacket,
  sources: Source[],
) {
  assertReviewedJson(fact);
  if (Object.hasOwn(fact, "roadsideFitment")) roadsideFeatureStatus(fact);
  cited(fact.sourceIds, packet);
  if (
    !text(fact.key) ||
    !text(fact.label) ||
    !text(fact.basis) ||
    !text(fact.scope) ||
    !Array.isArray(fact.qualifications) ||
    !Array.isArray(fact.issues) ||
    !["AU", "Australia"].includes(fact.market) ||
    !validDate(fact.date) ||
    fact.date > packet.reviewedAt ||
    !fact.gradeReview ||
    fact.gradeReview.overlayId !== packet.id ||
    fact.gradeReview.reviewedAt !== packet.reviewedAt ||
    !sameReviewedState(fact.sourceIds, fact.gradeReview.sourceIds) ||
    !hasEarnedBuyerGrade(fact, sources, packet.reviewedAt) ||
    !usableCorrectionSources(fact.sourceIds, sources, packet.reviewedAt)
  )
    fail(`invalid fact or unearned grade: ${fact.key}`);
  const expectedStatus =
    fact.buyerGrade === "confirmed"
      ? "standard"
      : fact.buyerGrade === "not_published"
        ? "not_verified"
        : "conditional";
  if (
    fact.status !== expectedStatus ||
    (fact.buyerGrade === "check" && !text(fact.conditionExplanation)) ||
    (fact.buyerGrade === "reported" && fact.resolvedElsewhere !== true)
  )
    fail(`grade/status mismatch: ${fact.key}`);
  if (
    ["price_aud", "promotional_driveaway_aud", "published_driveaway_aud"].includes(fact.key) &&
    fact.value !== null
  ) {
    if (
      ["promotional_driveaway_aud", "published_driveaway_aud"].includes(fact.key) &&
      fact.comparisonBasis !== "Driveaway"
    )
      fail("supplemental driveaway price lacks an explicit Driveaway basis");
    if (fact.key === "published_driveaway_aud" && fact.unit !== "AUD")
      fail("published driveaway price must use AUD");
    const price = fact.priceEvidence;
    if (!price || !text(price.basisTag) || typeof fact.value !== "number")
      fail("price lacks ladder provenance");
    const rejection = priceCandidateRejection(
      {
        variantId: "packet",
        value: fact.value,
        sourceIds: fact.sourceIds,
        date: fact.date,
        ...price,
        comparisonBasis: fact.comparisonBasis as
          "" | "Before on-road costs" | "Driveaway",
        qualifications: fact.qualifications,
        validUntil: fact.validUntil,
      },
      "packet",
      sources,
      packet.reviewedAt,
    );
    if (rejection) fail(rejection);
    if (
      typeof price.rankingEligible !== "boolean" ||
      !text(price.originalBasis) ||
      (!fact.comparisonBasis && price.rankingEligible) ||
      (price.rung === 5 && !text(price.publisher))
    )
      fail("price lacks a truthful basis or source label");
    if (
      (price.rung >= 5 && fact.buyerGrade !== "reported") ||
      (price.rung === 1 && fact.comparisonBasis !== "Before on-road costs") ||
      ([2, 4].includes(price.rung) && fact.comparisonBasis !== "Driveaway")
    )
      fail("price grade or measurement basis contradicts its ladder rung");
  }
}
// Shared buyer fields need explicit unknowns even for the first added version.
// Never derive this schema from the union of the catalogue: that imports thousands
// of unrelated brands' equipment keys and variant-specific labels into every car.
const newVariantFactFields = [
  ["price_aud", "Listed price", "AUD"],
  ["range_km", "Claimed range", "km"],
  ["seats", "Seats", ""],
  ["dc_charge_time_min", "DC charging time", "min"],
  ["ac_kw", "AC charging", "kW"],
  ["dc_peak_kw", "Peak DC acceptance", "kW"],
  ["battery_kwh", "Battery capacity", "kWh"],
  ["boot_l", "Cargo behind occupied seats", "L"],
  ["frunk_l", "Front storage", "L"],
  ["max_total_cargo_l", "Maximum folded cargo", "L"],
  ["zero_to_100_s", "0–100 km/h", "s"],
  ["power_kw", "Motor power", "kW"],
  ["drive", "Drive type", ""],
  ["length_mm", "Length", "mm"],
  ["width_mm", "Width", "mm"],
  ["height_mm", "Height", "mm"],
  ["wheelbase_mm", "Wheelbase", "mm"],
  ["towing_braked_kg", "Braked towing", "kg"],
  ["towing_unbraked_kg", "Unbraked towing", "kg"],
  ["warranty", "Vehicle warranty", ""],
  ["battery_warranty", "Battery warranty", ""],
  ["roadside_assistance", "Roadside assistance", ""],
  ["ground_clearance_mm", "Ground clearance", "mm"],
  ["turning_circle_m", "Turning circle", "m"],
  ["kerb_weight_kg", "Kerb weight", "kg"],
] as const;

function unknownFacts(car: Car, date: string) {
  const facts = { ...car.facts };
  for (const [key, label, unit] of newVariantFactFields)
    if (!facts[key])
      facts[key] = {
        key,
        label,
        unit,
        value: null,
        status: "not_verified",
        basis: "Exact-version research pending",
        comparisonBasis: "",
        sourceIds: [],
        date,
        market: "AU",
        scope: `${car.brand} ${car.model} ${car.trim}`,
        qualifications: [
          "No exact-version measurement has been verified for this field.",
        ],
        issues: [],
      };
  return { ...car, facts };
}
function clauseFor(
  clause: BrandSummaryClause,
  car: Car,
  packet: BrandUpdatePacket,
  strict: boolean,
): BuyerClause | undefined {
  if (
    !text(clause.label) ||
    !text(clause.text) ||
    !Array.isArray(clause.dependencies) ||
    !clause.dependencies.length ||
    new Set(clause.dependencies.map((dep) => dep.key)).size !==
      clause.dependencies.length
  )
    fail(`invalid summary clause for ${car.id}`);
  for (const dependency of clause.dependencies) {
    cited(dependency.expected.sourceIds, packet);
    if (
      dependency.expected.key !== dependency.key ||
      dependency.expected.value === null ||
      dependency.expected.issues.length ||
      !sameReviewedState(car.facts[dependency.key], dependency.expected)
    ) {
      if (strict)
        fail(`summary dependency changed: ${car.id}/${dependency.key}`);
      return undefined;
    }
  }
  const sources = new Map(packet.sources.map((source) => [source.id, source]));
  const facts = clause.dependencies.map((dep) => dep.expected);
  const deadlines = facts
    .flatMap((fact) => (fact.validUntil ? [fact.validUntil] : []))
    .sort();
  return {
    label: clause.label,
    text: clause.text,
    sourceIds: [...new Set(facts.flatMap((fact) => fact.sourceIds))],
    freshness: facts.flatMap((fact) =>
      [
        fact.date,
        ...fact.sourceIds.map((id) => sources.get(id)!.accessed_date),
      ].map((checkedAt) => ({
        checkedAt,
        key: fact.key,
        ...(fact.modelYearChangedAt
          ? { modelYearChangedAt: fact.modelYearChangedAt }
          : {}),
      })),
    ),
    ...(deadlines.length ? { validUntil: deadlines[0] } : {}),
  };
}
function summaryFor(
  row: BrandSummaryUpdate,
  car: Car,
  packet: BrandUpdatePacket,
  strict: boolean,
): BuyerSummary | undefined {
  const strength = clauseFor(row.strength, car, packet, strict);
  const tradeoff = clauseFor(row.tradeoff, car, packet, strict);
  if (!strength && !tradeoff) return undefined;
  const conditions = row.conditions ?? [];
  const required = car.configurationEvidence?.requiredBuyerVisibleConditions;
  if (required && !sameReviewedState(required, conditions))
    fail(`summary dropped version conditions: ${car.id}`);
  const ids = [
    ...new Set([
      ...(strength?.sourceIds ?? []),
      ...(tradeoff?.sourceIds ?? []),
    ]),
  ];
  return {
    checkedAt: packet.reviewedAt,
    guardSourceIds: ids,
    expectedSourceSnapshots: packet.sources.filter((source) =>
      ids.includes(source.id),
    ),
    conditions,
    ...(required ? { expectedVisibleConditions: [...required] } : {}),
    strength,
    tradeoff,
  };
}
/** Guarded changes to the effective initial M1 catalogue; legacy ledgers are never regenerated. */
export function applyBrandUpdates(
  base: Car[],
  research: Research,
  packets: readonly BrandUpdatePacket[],
): Car[] {
  orderedPackets(packets);
  if (!packets.length) return base;
  let cars = [...base];
  const configurationReviews = new Map<
    string,
    { row: BrandConfigurationUpdate; packet: BrandUpdatePacket }
  >();
  const featureReviews = new Map<
    string,
    { row: BrandFeatureUpdate; packet: BrandUpdatePacket }
  >();
  const summaries = new Map<
    string,
    { row: BrandSummaryUpdate; packet: BrandUpdatePacket }
  >();
  for (const packet of packets) {
    // The research extension is independently usable, but catalogue application checks all sources again.
    if (
      mergeSources(research.sources, packet).length !== research.sources.length
    )
      fail(`research is missing packet sources: ${packet.id}`);
    const addedIds = new Set(packet.variants.map((variant) => variant.id));
    for (const variant of packet.variants) {
      if (cars.some((car) => car.id === variant.id))
        fail(`duplicate catalogue version ${variant.id}`);
      cars.push(newVariantCar(variant, research.models));
    }
    const facts = [...packet.facts, ...expandBrandTerms(packet, cars)];
    if (
      new Set(facts.map((row) => `${row.variantId}\0${row.after.key}`)).size !==
      facts.length
    )
      fail(`duplicate shared or version-specific fact in ${packet.id}`);
    const guards = new Map(
      packet.versionGuards.map((guard) => [guard.variantId, guard.before]),
    );
    const targets = new Set(
      [
        ...facts,
        ...(packet.features ?? []),
        ...(packet.configurationUpdates ?? []),
        ...packet.availability,
        ...packet.summaries,
        ...packet.versionUpdates,
      ].map((row) => row.variantId),
    );
    for (const guard of packet.versionGuards) targets.add(guard.variantId);
    for (const id of targets) {
      const car = cars.find((row) => row.id === id);
      if (!car || car.brand !== packet.brand || !tier1(car.vehicleClass))
        fail(`wrong brand, version or tier: ${id}`);
      if (
        !addedIds.has(id) &&
        (!guards.has(id) ||
          !sameReviewedState(brandVersionSnapshot(car), guards.get(id)))
      )
        fail(`reviewed version changed: ${id}`);
    }
    cars = cars.map((car) =>
      targets.has(car.id) ? { ...car, buyerGradesRequired: true } : car,
    );
    for (const edit of packet.versionUpdates) {
      const index = cars.findIndex((car) => car.id === edit.variantId);
      const car = cars[index];
      if (
        !text(edit.reason) ||
        !sameReviewedState(brandVersionSnapshot(car), edit.before) ||
        edit.after.id !== car.id ||
        edit.after.brand !== packet.brand ||
        edit.after.modelId !== car.modelId ||
        !tier1(edit.after.vehicleClass)
      )
        fail(`metadata before snapshot changed: ${edit.variantId}`);
      cars[index] = {
        ...car,
        ...structuredClone(edit.after),
        buyerSummary: undefined,
      };
    }
    for (const edit of facts) {
      const index = cars.findIndex((car) => car.id === edit.variantId);
      const car = cars[index];
      const current = car.facts[edit.after.key] ?? null;
      if (!sameReviewedState(current, edit.before))
        fail(
          `fact before snapshot changed: ${edit.variantId}/${edit.after.key}`,
        );
      const accepted = structuredClone(edit.after);
      // A genuinely reviewed replacement supersedes a stale review marker; it
      // still has to earn its grade against this packet and its exact sources.
      delete accepted.gradeReviewStatus;
      validateFact(accepted, packet, research.sources);
      const touchesSummary = [
        car.buyerSummary?.strength,
        car.buyerSummary?.tradeoff,
      ].some((clause) =>
        clause?.freshness?.some((entry) => entry.key === edit.after.key),
      );
      cars[index] = {
        ...car,
        buyerGradesRequired: true,
        facts: { ...car.facts, [edit.after.key]: accepted },
        ...(touchesSummary ? { buyerSummary: undefined } : {}),
      };
    }
    for (const edit of packet.configurationUpdates ?? []) {
      if (addedIds.has(edit.variantId))
        fail(
          `configuration update requires an existing version: ${edit.variantId}`,
        );
      if (cars.filter((car) => car.id === edit.variantId).length !== 1)
        fail(`configuration target is not unique: ${edit.variantId}`);
      const index = cars.findIndex((car) => car.id === edit.variantId);
      const car = cars[index];
      validateConfigurationUpdate(
        edit,
        car.configurationEvidence ?? null,
        packet,
        research.sources,
      );
      validateConfigurationDependencies(
        edit,
        car.facts,
        research.sources,
        packet,
      );
      cars[index] = {
        ...car,
        configurationEvidence: structuredClone(edit.after),
        buyerSummary: undefined,
      };
      configurationReviews.set(edit.variantId, { row: edit, packet });
    }
    for (const edit of packet.availability) {
      if (
        edit.status !== "approved" ||
        edit.reviewedAt !== packet.reviewedAt ||
        edit.reviewedBy !== packet.reviewedBy
      )
        fail(`invalid availability review: ${edit.id}`);
      cited(edit.after.evidence.sourceIds, packet);
    }
    if (packet.availability.length)
      cars = applyAvailabilityCorrections(
        cars,
        packet.availability,
        research.sources,
      );
    cars = cars.map((car) =>
      addedIds.has(car.id) ? unknownFacts(car, packet.reviewedAt) : car,
    );
    for (const row of packet.features ?? []) {
      const car = cars.find((candidate) => candidate.id === row.variantId)!;
      reviewedFeature(row, car, research, packet);
      validateFeatureDependencies(row, car, research.sources, packet);
      featureReviews.set(`${row.variantId}\0${row.criterion}`, { row, packet });
    }
    for (const row of packet.summaries) {
      const car = cars.find((candidate) => candidate.id === row.variantId)!;
      summaryFor(row, car, packet, true);
      summaries.set(row.variantId, { row, packet });
    }
    // A later correction invalidates only actual dependent clauses of prior packets.
    cars = cars.map((car) => {
      const summary = summaries.get(car.id);
      return summary
        ? {
            ...car,
            buyerSummary: summaryFor(summary.row, car, summary.packet, false),
          }
        : car;
    });
  }
  // A later fact change must have an explicit reviewed replacement for any
  // affected feature. Never silently leave stale prose or invent a fallback.
  for (const { row, packet } of featureReviews.values()) {
    const car = cars.find((candidate) => candidate.id === row.variantId)!;
    validateFeatureDependencies(row, car, research.sources, packet);
  }
  for (const { row, packet } of configurationReviews.values()) {
    const car = cars.find((candidate) => candidate.id === row.variantId)!;
    validateConfigurationDependencies(row, car.facts, research.sources, packet);
  }
  return cars;
}

/** Store a brand term once; preserve reviewed per-version guards and explicit policy exceptions. */
function expandBrandTerms(
  packet: BrandUpdatePacket,
  cars: Car[],
): BrandFactUpdate[] {
  const rows: BrandFactUpdate[] = [];
  const keys = new Set<string>();
  const brandIds = cars
    .filter((car) => car.brand === packet.brand && tier1(car.vehicleClass))
    .map((car) => car.id);
  for (const term of packet.brandTerms ?? []) {
    if (
      !["warranty", "battery_warranty", "roadside_assistance"].includes(
        term.key,
      ) ||
      keys.has(term.key) ||
      term.fact.key !== term.key ||
      term.fact.gradeReview?.evidenceScope !== "brand_au_terms" ||
      !["confirmed", "check"].includes(term.fact.buyerGrade ?? "")
    )
      fail(`invalid brand term ${term.key}`);
    keys.add(term.key);
    const applicable = term.applicableVariantIds;
    const exceptions = term.exceptions;
    if (
      !Array.isArray(applicable) ||
      !applicable.length ||
      new Set(applicable).size !== applicable.length ||
      !Array.isArray(exceptions) ||
      new Set(exceptions.map((row) => row.variantId)).size !==
        exceptions.length ||
      exceptions.some(
        (row) => !text(row.reason) || applicable.includes(row.variantId),
      )
    )
      fail(`invalid brand term scope ${term.key}`);
    const all = [...applicable, ...exceptions.map((row) => row.variantId)];
    if (
      all.length !== brandIds.length ||
      all.some((id) => !brandIds.includes(id)) ||
      brandIds.some((id) => !all.includes(id)) ||
      !term.before ||
      !sameReviewedState(
        Object.keys(term.before).sort(),
        [...applicable].sort(),
      )
    )
      fail(`brand term must account for every current version: ${term.key}`);
    for (const variantId of applicable)
      rows.push({
        variantId,
        before: term.before[variantId],
        after: term.fact,
      });
  }
  return rows;
}
/** Validate a complete replacement without changing equipment fitment from its grade. */
function reviewedFeature(
  row: BrandFeatureUpdate,
  car: Car,
  research: Research,
  packet: BrandUpdatePacket,
): Feature {
  if (
    !text(row.criterion) ||
    ["driveaway_price", "roadside_assistance"].includes(row.criterion) ||
    !research.criteria.some((criterion) => criterion.key === row.criterion) ||
    research.feature_evidence.filter(
      (feature) =>
        feature.variant_id === row.variantId &&
        feature.criterion === row.criterion,
    ).length !== 1 ||
    [row.before, row.after].some(
      (feature) =>
        !feature ||
        feature.variant_id !== car.id ||
        feature.model_id !== car.modelId ||
        feature.criterion !== row.criterion,
    )
  )
    fail(
      `invalid or canonical feature target: ${row.variantId}/${row.criterion}`,
    );
  const accepted = structuredClone(row.after);
  // A fresh valid review can supersede a marker left by the frozen grade ledger.
  delete accepted.gradeReviewStatus;
  cited(accepted.source_ids, packet);
  if (
    !text(accepted.value) ||
    typeof accepted.conditions !== "string" ||
    !text(accepted.evidence_scope) ||
    !text(accepted.verification_state) ||
    !validDate(accepted.last_evidence_date) ||
    accepted.last_evidence_date > packet.reviewedAt ||
    accepted.reviewed_date !== packet.reviewedAt ||
    !accepted.gradeReview ||
    accepted.gradeReview.overlayId !== packet.id ||
    accepted.gradeReview.reviewedAt !== packet.reviewedAt ||
    !sameReviewedState(accepted.source_ids, accepted.gradeReview.sourceIds) ||
    !hasEarnedBuyerGrade(accepted, research.sources, packet.reviewedAt) ||
    !usableCorrectionSources(
      accepted.source_ids,
      research.sources,
      packet.reviewedAt,
    )
  )
    fail(
      `invalid feature or unearned grade: ${row.variantId}/${row.criterion}`,
    );
  const fitment = ["optional", "unavailable", "not_applicable"].includes(
    accepted.status,
  );
  const expectedStatus =
    accepted.buyerGrade === "confirmed"
      ? "standard"
      : accepted.buyerGrade === "not_published"
        ? "not_verified"
        : "conditional";
  if (
    ((!fitment || accepted.buyerGrade === "not_published") &&
      accepted.status !== expectedStatus) ||
    ((accepted.buyerGrade === "check" || accepted.status === "optional") &&
      !text(accepted.conditions))
  )
    fail(`feature grade/status mismatch: ${row.variantId}/${row.criterion}`);
  return accepted;
}

function validateFeatureDependencies(
  row: BrandFeatureUpdate,
  car: Car,
  sources: Source[],
  packet: BrandUpdatePacket,
) {
  if (
    !Array.isArray(row.dependencies) ||
    !row.dependencies.length ||
    new Set(row.dependencies.map((dependency) => dependency.key)).size !==
      row.dependencies.length
  )
    fail(`invalid feature dependencies: ${row.variantId}/${row.criterion}`);
  // Bind a whole-row search result to this exact equipment question. A null
  // unrelated measurement or a fact saying only that a brochure exists cannot
  // establish that this feature was searched for and not found.
  if (
    row.after.buyerGrade === "not_published" &&
    !row.dependencies.some(
      ({ key, expected }) =>
        key === `feature_${row.criterion}` &&
        expected.value === null &&
        expected.buyerGrade === "not_published" &&
        expected.status === "not_verified",
    )
  )
    fail(
      `missing criterion search dependency: ${row.variantId}/${row.criterion}`,
    );
  for (const dependency of row.dependencies) {
    cited(dependency.expected.sourceIds, packet);
    if (
      dependency.expected.key !== dependency.key ||
      !sameReviewedState(
        car.facts[dependency.key] ?? null,
        dependency.expected,
      ) ||
      dependency.expected.issues.length ||
      !hasEarnedBuyerGrade(dependency.expected, sources, packet.reviewedAt) ||
      !usableCorrectionSources(
        dependency.expected.sourceIds,
        sources,
        packet.reviewedAt,
      ) ||
      dependency.expected.sourceIds.some(
        (id) => !row.after.source_ids.includes(id),
      )
    )
      fail(
        `feature dependency changed: ${row.variantId}/${row.criterion}/${dependency.key}`,
      );
  }
}

/** Replay reviewed equipment after initial regrading, before canonical term projections.
 * applyBrandUpdates checks each historical dependency against its post-packet facts;
 * this helper checks the exact feature chain and the final active dependencies again.
 */
export function applyBrandFeatureUpdates(
  car: Car,
  features: Feature[],
  research: Research,
  packets: readonly BrandUpdatePacket[],
): Feature[] {
  if (
    !packets.some((packet) =>
      packet.features?.some((row) => row.variantId === car.id),
    )
  )
    return features;
  orderedPackets(packets);
  if (!tier1(car.vehicleClass))
    fail(`feature version is outside Tier 1: ${car.id}`);
  let version: BrandVersionSnapshot | undefined;
  const result = [...features];
  const active = new Map<
    string,
    { row: BrandFeatureUpdate; packet: BrandUpdatePacket }
  >();
  for (const packet of packets) {
    const guard = packet.versionGuards.find((row) => row.variantId === car.id);
    const added = packet.variants.find((row) => row.id === car.id);
    if (guard) {
      if (version && !sameReviewedState(version, guard.before))
        fail(`reviewed feature version changed: ${car.id}`);
      version = guard.before;
    }
    if (added) {
      if (version) fail(`duplicate feature version: ${car.id}`);
      version = brandVersionSnapshot(newVariantCar(added, research.models));
    }
    const metadata = packet.versionUpdates.find(
      (row) => row.variantId === car.id,
    );
    if (metadata) {
      if (!version || !sameReviewedState(version, metadata.before))
        fail(`reviewed feature version changed: ${car.id}`);
      version = metadata.after;
    }
    for (const row of (packet.features ?? []).filter(
      (row) => row.variantId === car.id,
    )) {
      if (car.brand !== packet.brand || (!guard && !added))
        fail(`wrong brand or unguarded feature version: ${car.id}`);
      if (
        mergeSources(research.sources, packet).length !==
        research.sources.length
      )
        fail(`research is missing packet sources: ${packet.id}`);
      const matches = result.filter(
        (feature) =>
          feature.variant_id === car.id && feature.criterion === row.criterion,
      );
      if (matches.length !== 1 || !sameReviewedState(matches[0], row.before))
        fail(`feature before snapshot changed: ${car.id}/${row.criterion}`);
      const index = result.indexOf(matches[0]);
      result[index] = reviewedFeature(row, car, research, packet);
      active.set(row.criterion, { row, packet });
    }
  }
  if (!version || !sameReviewedState(brandVersionSnapshot(car), version))
    fail(`reviewed feature version changed: ${car.id}`);
  for (const { row, packet } of active.values())
    validateFeatureDependencies(row, car, research.sources, packet);
  return result;
}

/** Ordinary published driveaway totals are not promotional offers. Source context
 * is required for this fallback so a withdrawn source/review cannot keep it active.
 * Packet admission applies the same full fact/source and price-ladder guards as
 * price_aud and promotional_driveaway_aud; this repeats those price guards at use.
 */
function publishedDriveawayFact(car: Car, sources: Source[]): Fact | undefined {
  const fact = car.facts.published_driveaway_aud;
  const price = fact?.priceEvidence;
  const asOf = fact?.gradeReview?.reviewedAt ?? "";
  if (
    !fact || fact.key !== "published_driveaway_aud" ||
    fact.unit !== "AUD" || fact.comparisonBasis !== "Driveaway" ||
    !["AU", "Australia"].includes(fact.market) ||
    fact.status !== (fact.buyerGrade === "confirmed" ? "standard" : "conditional") ||
    typeof fact.value !== "number" || !price ||
    !text(price.basisTag) || !text(price.originalBasis) ||
    typeof price.rankingEligible !== "boolean" ||
    (price.rung === 5 && !text(price.publisher)) ||
    price.rung === 1 ||
    (price.rung >= 5 && fact.buyerGrade !== "reported") ||
    !fact.gradeReview ||
    !sameReviewedState(fact.sourceIds, fact.gradeReview.sourceIds) ||
    !hasEarnedBuyerGrade(fact, sources, asOf) ||
    !usableCorrectionSources(fact.sourceIds, sources, asOf) ||
    priceCandidateRejection({
      variantId: car.id,
      value: fact.value,
      sourceIds: fact.sourceIds,
      date: fact.date,
      ...price,
      comparisonBasis: "Driveaway",
      qualifications: fact.qualifications,
      validUntil: fact.validUntil,
    }, car.id, sources, asOf)
  ) return undefined;
  return fact;
}

/** Canonical reviewed facts also feed their equipment/question rows. */
export function applyBrandTermFeatures(
  car: Car,
  features: Feature[],
  sources: Source[] = [],
): Feature[] {
  const roadside = car.facts.roadside_assistance;
  // A higher-rung before-ORC list price remains the catalogue's main price.
  // Its separately reviewed driveaway offer still owns the driveaway answer.
  // An ordinary published estimate is only the third fallback, never a promotion.
  const price = [car.facts.price_aud, car.facts.promotional_driveaway_aud].find(
    (candidate) =>
      candidate?.comparisonBasis === "Driveaway" &&
      typeof candidate.value === "number" &&
      Number.isFinite(candidate.value) &&
      candidate.value > 0 &&
      !!candidate.priceEvidence &&
      !!candidate.buyerGrade &&
      candidate.buyerGrade !== "not_published" &&
      !!candidate.gradeReview &&
      candidate.gradeReviewStatus !== "review_required",
  ) ?? publishedDriveawayFact(car, sources);
  const reviewedRoadside =
    !!roadside?.gradeReview &&
    roadside.gradeReview.evidenceScope === "brand_au_terms" &&
    roadside.gradeReviewStatus !== "review_required";
  return features.map((feature) => {
    const isPrice = feature.criterion === "driveaway_price" && !!price;
    const fact = isPrice
      ? price
      : feature.criterion === "roadside_assistance" && reviewedRoadside
        ? roadside
        : undefined;
    if (!fact) {
      // A reused canonical projection is not independent fallback evidence.
      // Preserve its exact content and fitment, but withdraw its stale grade.
      if (
        (feature.criterion === "roadside_assistance" &&
          feature.verification_state === "reviewed_brand_au_terms") ||
        (feature.criterion === "driveaway_price" &&
          ["reviewed_canonical_driveaway_price", "reviewed_published_driveaway_price"].includes(
            feature.verification_state,
          ))
      )
        return {
          ...feature,
          buyerGrade: undefined,
          gradeReview: undefined,
          gradeReviewStatus: "review_required",
        };
      return feature;
    }
    const projected: Feature = {
      ...feature,
      value: isPrice
        ? `A$${Number(fact.value).toLocaleString("en-AU")}`
        : String(fact.value ?? "Not published"),
      status: isPrice ? fact.status : roadsideFeatureStatus(fact),
      buyerGrade: fact.buyerGrade,
      gradeReview: structuredClone(fact.gradeReview),
      conditions: [
        ...new Set([
          ...fact.qualifications,
          ...(fact.conditionExplanation ? [fact.conditionExplanation] : []),
          ...(isPrice && fact.priceEvidence?.state
            ? [`Driveaway price applies in ${fact.priceEvidence.state}.`]
            : []),
          ...(fact.validUntil
            ? [
                `Offer deadline: ${fact.validUntil}; confirm eligibility and earlier stock exhaustion.`,
              ]
            : []),
        ]),
      ].join(" "),
      source_ids: [...fact.sourceIds],
      last_evidence_date: fact.date,
      reviewed_date: fact.gradeReview!.reviewedAt,
      evidence_scope: fact.scope,
      verification_state: isPrice
        ? fact.key === "published_driveaway_aud"
          ? "reviewed_published_driveaway_price"
          : "reviewed_canonical_driveaway_price"
        : "reviewed_brand_au_terms",
      condition_label: isPrice
        ? [...new Set([fact.basis, fact.priceEvidence!.basisTag])].join(" · ")
        : fact.buyerGrade === "check"
          ? fact.conditionExplanation
          : "",
      // Notes from a replaced unknown/older quotation must not survive its replacement.
      usability_notes: [],
      confirmation_needed: "",
    };
    delete projected.gradeReviewStatus;
    // Replacement evidence owns the deadline too; never inherit an old offer's end.
    delete projected.validUntil;
    if (fact.validUntil !== undefined) projected.validUntil = fact.validUntil;
    return projected;
  });
}
