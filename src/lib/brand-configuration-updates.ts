/** Narrow, explicit changes to live scope; historical source/build records stay frozen. */
import {
  sameReviewedState,
  usableCorrectionSources,
} from "./correction-guards";
import { hasEarnedBuyerGrade } from "./evidence-grading";
import type { BrandUpdatePacket } from "./brand-updates";
import type { ConfigurationEvidence, Fact, Source } from "./types";

export type BrandConfigurationUpdate = {
  variantId: string;
  before: ConfigurationEvidence | null;
  /** Scope cannot be erased to bypass the global ranking guard. */
  after: ConfigurationEvidence;
  reason: string;
  sourceIds: string[];
  /** Exact facts reviewed in this packet, not historical or unrelated proxies. */
  dependencies: { key: string; expected: Fact }[];
};
const text = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  value.every(text) &&
  new Set(value).size === value.length;
function fail(message: string): never {
  throw new Error(`Brand update: configuration ${message}`);
}
const mutable = new Set([
  "rankingEligible",
  "projectionScope",
  "sourceIds",
  "requiredBuyerVisibleConditions",
  "requiredNulls",
  "countContribution",
  "configurationReview",
]);
const historicalBoundaryFields = [
  "pricingBoundary",
  "chargingBoundary",
  "projectionContract",
];
/** Only established scalar aliases can release a legacy null. Composite holds stay held. */
const nullFactAliases: Record<string, { key: string; basis?: RegExp }> = {
  battery_usable_kwh: { key: "battery_kwh", basis: /usable/i },
  range_wltp_km: { key: "range_km", basis: /wltp/i },
  range_nedc_km: { key: "range_km", basis: /nedc/i },
  range_adr_km: { key: "range_km", basis: /adr/i },
  range_cycle: { key: "range_km", basis: /\S/ },
  ac_charge_max_kw: { key: "ac_kw", basis: /maximum|max/i },
  dc_charge_peak_kw: { key: "dc_peak_kw", basis: /peak/i },
  dc_10_80_min: { key: "dc_charge_time_min", basis: /10.*80/ },
  braked_tow_kg: { key: "towing_braked_kg", basis: /braked/i },
  rear_cargo_l: { key: "boot_l" },
};
function frozenFields(value: ConfigurationEvidence | null) {
  return Object.fromEntries(
    Object.entries(value ?? {}).filter(([key]) => !mutable.has(key)),
  );
}
function validateShape(value: ConfigurationEvidence, id: string) {
  if (
    !object(value) ||
    typeof value.rankingEligible !== "boolean" ||
    typeof value.completeVehicleCountEligible !== "boolean" ||
    !text(value.projectionScope) ||
    (value.sourceIds !== undefined && !strings(value.sourceIds)) ||
    (value.requiredBuyerVisibleConditions !== undefined &&
      !strings(value.requiredBuyerVisibleConditions))
  )
    fail(`invalid typed scope: ${id}`);
  if (value.countContribution !== undefined) {
    const counts = value.countContribution;
    if (
      !object(counts) ||
      Object.keys(counts).length !== 3 ||
      ![
        "boundedConfigurationRecords",
        "completeTechnicalRecords",
        "rankableRecords",
      ].every(
        (key) =>
          Number.isSafeInteger(counts[key]) && (counts[key] as number) >= 0,
      )
    )
      fail(`invalid count boundaries: ${id}`);
  }
  if (value.requiredNulls !== undefined) {
    if (!object(value.requiredNulls)) fail(`invalid required nulls: ${id}`);
    for (const [key, hold] of Object.entries(value.requiredNulls))
      if (
        !text(key) ||
        // Legacy strings are opaque hold explanations, never fact values or
        // implicit nulls. Retention and release use the same exact guards below.
        (!text(hold) &&
          (!object(hold) ||
            hold.value !== null ||
            !text(hold.reason) ||
            Object.keys(hold).some(
              (field) =>
                !["value", "reason", "sourceCopyLedgerId"].includes(field),
            ) ||
            (hold.sourceCopyLedgerId !== undefined &&
              !text(hold.sourceCopyLedgerId))))
      )
        fail(`invalid required null: ${id}/${key}`);
  }
  if (value.configurationReview !== undefined) {
    const review = value.configurationReview;
    if (
      !object(review) ||
      Object.keys(review).length !== 4 ||
      !text(review.overlayId) ||
      !text(review.reviewedAt) ||
      !strings(review.historicalBoundaryFields) ||
      !Array.isArray(review.releasedNulls) ||
      review.releasedNulls.some(
        (entry) =>
          !object(entry) ||
          Object.keys(entry).length !== 2 ||
          !text(entry.key) ||
          !strings(entry.factKeys) ||
          !entry.factKeys.length,
      ) ||
      new Set(review.releasedNulls.map((entry) => entry.key)).size !==
        review.releasedNulls.length
    )
      fail(`invalid review structure: ${id}`);
  }
}
function explicitSources(
  ids: unknown,
  packet: BrandUpdatePacket,
  sources: Source[],
) {
  if (
    !strings(ids) ||
    !ids.length ||
    ids.some((id) => !packet.sources.some((source) => source.id === id)) ||
    !usableCorrectionSources(ids, sources, packet.reviewedAt)
  )
    fail(`missing usable explicit source snapshots: ${packet.id}`);
}
/** Preparation can verify proof against packet facts before catalogue construction. */
export function validateConfigurationUpdate(
  row: BrandConfigurationUpdate,
  current: ConfigurationEvidence | null,
  packet: BrandUpdatePacket,
  sources: Source[],
) {
  if (
    !object(row) ||
    !text(row.variantId) ||
    !text(row.reason) ||
    !Object.hasOwn(row, "before") ||
    (row.before !== null && !object(row.before))
  )
    fail(`invalid update: ${packet.id}`);
  validateShape(row.after, row.variantId);
  if (row.before !== null) validateShape(row.before, row.variantId);
  if (!sameReviewedState(current, row.before))
    fail(`before snapshot changed: ${row.variantId}`);
  // This path is deliberately limited to existing bounded records. Creating a
  // new provenance boundary needs the separate exact-version admission path.
  if (row.before === null)
    fail(`existing bounded scope required: ${row.variantId}`);
  if (!sameReviewedState(frozenFields(row.before), frozenFields(row.after)))
    fail(`historical source/build boundary changed: ${row.variantId}`);
  explicitSources(row.sourceIds, packet, sources);
  if (!sameReviewedState(row.after.sourceIds ?? null, row.sourceIds))
    fail(`scope source IDs differ from review: ${row.variantId}`);
  if (
    !Array.isArray(row.dependencies) ||
    !row.dependencies.length ||
    row.dependencies.some(
      (dep) => !object(dep) || !text(dep.key) || !object(dep.expected),
    ) ||
    new Set(row.dependencies.map((dep) => dep.key)).size !==
      row.dependencies.length
  )
    fail(`invalid dependencies: ${row.variantId}`);
  for (const dependency of row.dependencies) {
    const matching = [
      ...packet.facts
        .filter((fact) => fact.variantId === row.variantId)
        .map((fact) => fact.after),
      ...(packet.brandTerms ?? [])
        .filter((term) => term.applicableVariantIds.includes(row.variantId))
        .map((term) => term.fact),
    ].filter((fact) => fact.key === dependency.key);
    if (
      matching.length !== 1 ||
      !sameReviewedState(matching[0], dependency.expected)
    )
      fail(
        `dependency lacks exact packet fact: ${row.variantId}/${dependency.key}`,
      );
  }
  validateConfigurationDependencies(
    row,
    Object.fromEntries(row.dependencies.map((dep) => [dep.key, dep.expected])),
    sources,
    packet,
  );
  const review = row.after.configurationReview;
  if (
    !review ||
    review.overlayId !== packet.id ||
    review.reviewedAt !== packet.reviewedAt
  )
    fail(`missing current review: ${row.variantId}`);
  if (
    !sameReviewedState(
      review.historicalBoundaryFields.slice().sort(),
      historicalBoundaryFields
        .filter((key) => Object.hasOwn(row.before!, key))
        .sort(),
    ) ||
    review.historicalBoundaryFields.some((key) => !object(row.before![key]))
  )
    fail(`invalid historical boundary reference: ${row.variantId}`);
  const beforeNulls = (row.before.requiredNulls ?? {}) as Record<
    string,
    unknown
  >;
  const afterNulls = (row.after.requiredNulls ?? {}) as Record<string, unknown>;
  if (
    Object.keys(afterNulls).some(
      (key) =>
        !Object.hasOwn(beforeNulls, key) ||
        !sameReviewedState(beforeNulls[key], afterNulls[key]),
    )
  )
    fail(`retained null hold changed: ${row.variantId}`);
  const removed = Object.keys(beforeNulls)
    .filter((key) => !Object.hasOwn(afterNulls, key))
    .sort();
  if (
    !sameReviewedState(
      removed,
      review.releasedNulls.map((entry) => entry.key).sort(),
    ) ||
    review.releasedNulls.some((entry) =>
      entry.factKeys.some(
        (key) => !row.dependencies.some((dep) => dep.key === key),
      ),
    )
  )
    fail(`released null lacks exact fact proof: ${row.variantId}`);
  for (const release of review.releasedNulls) {
    if (release.factKeys.length !== 1)
      fail(
        `composite null release is unsupported: ${row.variantId}/${release.key}`,
      );
    const dependency = row.dependencies.find(
      (dep) => dep.key === release.factKeys[0],
    )!;
    if (release.key !== dependency.key) {
      const alias = nullFactAliases[release.key];
      if (
        !alias ||
        dependency.key !== alias.key ||
        (alias.basis && !alias.basis.test(dependency.expected.comparisonBasis))
      )
        fail(
          `null release proof has wrong measurement: ${row.variantId}/${release.key}`,
        );
    }
  }
  const oldCounts = row.before.countContribution as
    Record<string, number> | undefined;
  const newCounts = row.after.countContribution as
    Record<string, number> | undefined;
  if (
    !!oldCounts !== !!newCounts ||
    (oldCounts &&
      newCounts &&
      (oldCounts.boundedConfigurationRecords !==
        newCounts.boundedConfigurationRecords ||
        oldCounts.completeTechnicalRecords !==
          newCounts.completeTechnicalRecords ||
        newCounts.rankableRecords !== (row.after.rankingEligible ? 1 : 0)))
  )
    fail(`count promotion or inconsistent ranking boundary: ${row.variantId}`);
}

/** Recheck the active review after all packets; a later withdrawal must be explicit. */
export function validateConfigurationDependencies(
  row: BrandConfigurationUpdate,
  facts: Record<string, Fact>,
  sources: Source[],
  packet: BrandUpdatePacket,
) {
  for (const { key, expected } of row.dependencies) {
    explicitSources(expected.sourceIds, packet, sources);
    if (
      expected.key !== key ||
      expected.value === null ||
      !Array.isArray(expected.issues) ||
      expected.issues.length ||
      !sameReviewedState(facts[key] ?? null, expected) ||
      !hasEarnedBuyerGrade(expected, sources, packet.reviewedAt) ||
      expected.sourceIds.some((id) => !row.sourceIds.includes(id))
    )
      fail(`dependency changed or unearned: ${row.variantId}/${key}`);
  }
}
