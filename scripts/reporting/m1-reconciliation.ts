/** Auditable M1 closure evidence. A flag or a matching family name is never completion. */
import { isDeepStrictEqual } from "node:util";
import { evidenceDateValue } from "../../src/lib/freshness";
import type { Car } from "../../src/lib/types";
import type { AuditRecord, ReportInventory } from "./reports";

export type TierOneClass = "passenger" | "ute";
export type MarketIdentity = {
  brand: string;
  model: string;
  /** Exact body scope, e.g. sedan, wagon, SUV, or dual-cab. Never silently merged. */
  bodyStyle: string;
  vehicleClass: TierOneClass;
};
export type PublishedModelList = {
  id: string;
  title: string;
  publisher: string;
  /** Common publisher/underlying dataset means the lists are not independent. */
  independenceKey: string;
  independenceReason: string;
  url: string;
  publishedAt: string;
  checkedAt: string;
  scope: "australian-new-tier1-bevs";
  /** Complete transcribed snapshot, including entries subsequently excluded. */
  entries: (MarketIdentity & { id: string })[];
};
export type CurrentVersionReview = MarketIdentity & {
  id: string;
  modelId: string;
  checkedAt: string;
  officialSourceUrls: string[];
  reason: string;
  /** Explicit source-bound naming equivalences; body/trim matching stays exact. */
  publishedModelAliases?: {
    name: string;
    reason: string;
    sourceUrls: string[];
  }[];
  /** Complete current official Australian version list, not a sample. */
  versions: {
    carId: string;
    model: string;
    trim: string;
    modelYear: string | number | null;
  }[];
};
export type ExclusionReason =
  | "not_sold_new_in_australia"
  | "not_officially_imported"
  | "not_battery_electric"
  | "outside_tier1"
  | "not_orderable_or_new_stock"
  | "duplicate_same_model_body";
export type Resolution = {
  reviewedAt: string;
  reason: string;
  sourceUrls: string[];
} & (
  | { outcome: "included"; modelReviewId: string }
  | {
      outcome: "excluded";
      exclusionReason: ExclusionReason;
      duplicateOfReviewId?: string;
    }
  | { outcome: "unresolved" }
);
/** A declared source interpretation, not an automatic claim about webpage semantics. */
export type InventorySplitVersion = MarketIdentity & {
  modelReviewId: string;
  modelId: string;
  carId: string;
  trim: string;
  modelYear: string | number;
};
export type InventorySplitResolution = {
  outcome: "included_split";
  reviewedAt: string;
  reason: string;
  sourceUrls: string[];
  /** Entire unmodified inherited JSON row, including fields outside AuditRecord. */
  originalRecord: AuditRecord & Record<string, unknown>;
  declaredCoverage: {
    reviewedAt: string;
    reason: string;
    /** All cited sources must have a current, explicit check and scoped interpretation. */
    sources: { url: string; checkedAt: string; supports: string }[];
    /** Independently declared full coverage; never infer this from supplied components. */
    versions: InventorySplitVersion[];
  };
  components: (MarketIdentity & {
    modelReviewId: string;
    modelId: string;
    /** Every version in the referenced current review; subsets cannot settle a split. */
    versions: CurrentVersionReview["versions"];
  })[];
};
/** Split disposition is deliberately unavailable to published-list resolutions. */
export type InventoryResolution = (Resolution | InventorySplitResolution) & {
  kind: "record" | "lead";
  inventoryId: string;
};
export type M1MarketReconciliation = {
  schemaVersion: 1;
  checkedAt: string;
  notes: string[];
  publishedLists: PublishedModelList[];
  currentVersionReviews: CurrentVersionReview[];
  listResolutions: (Resolution & { listId: string; entryId: string })[];
  /** Every reviewed model absent from a published list needs a sourced explanation. */
  catalogueOnlyDifferences: {
    listId: string;
    modelReviewId: string;
    reviewedAt: string;
    reason: string;
    sourceUrls: string[];
  }[];
  /** Each inherited Tier 1 audit record and lead must have an explicit disposition. */
  inventoryResolutions: InventoryResolution[];
};
/** Combine dated evidence without silently replacing duplicate or conflicting entries. */
export function combineM1Reconciliations(
  ...registries: M1MarketReconciliation[]
): M1MarketReconciliation {
  if (
    !registries.length ||
    registries.some(
      (registry) =>
        registry.schemaVersion !== 1 ||
        !Number.isFinite(evidenceDateValue(registry.checkedAt)),
    )
  )
    throw new Error(
      "M1 reconciliation overlays must use schemaVersion 1 and a real checkedAt date",
    );
  return {
    schemaVersion: 1,
    checkedAt: registries
      .map((registry) => registry.checkedAt)
      .sort()
      .at(-1)!,
    notes: registries.flatMap((registry) => registry.notes),
    publishedLists: registries.flatMap((registry) => registry.publishedLists),
    currentVersionReviews: registries.flatMap(
      (registry) => registry.currentVersionReviews,
    ),
    listResolutions: registries.flatMap((registry) => registry.listResolutions),
    catalogueOnlyDifferences: registries.flatMap(
      (registry) => registry.catalogueOnlyDifferences,
    ),
    inventoryResolutions: registries.flatMap(
      (registry) => registry.inventoryResolutions,
    ),
  };
}
export type ClosureIssue = {
  code: string;
  reason: string;
  brand?: string;
  reference?: string;
};
const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]/g, "");
const equal = (a: string, b: string) => normalise(a) === normalise(b);
const urlOkay = (value: string) => /^https?:\/\/[^/\s]+(?:\/|$)/.test(value);
const citationsOkay = (urls: string[]) =>
  urls.length > 0 && urls.every(urlOkay);
const modelNameMatches = (
  name: string,
  review: MarketIdentity & {
    publishedModelAliases?: CurrentVersionReview["publishedModelAliases"];
  },
) =>
  [
    review.model,
    ...(review.publishedModelAliases || [])
      .filter(
        (alias) =>
          !!alias.name.trim() &&
          !!alias.reason.trim() &&
          citationsOkay(alias.sourceUrls),
      )
      .map((alias) => alias.name),
  ].some(
    (model) => equal(name, model) || equal(name, `${review.brand} ${model}`),
  );
const identityMatches = (
  a: MarketIdentity,
  b: MarketIdentity & {
    publishedModelAliases?: CurrentVersionReview["publishedModelAliases"];
  },
) =>
  equal(a.brand, b.brand) &&
  modelNameMatches(a.model, b) &&
  equal(a.bodyStyle, b.bodyStyle) &&
  a.vehicleClass === b.vehicleClass;
const tierOne = (record: { vehicleClass?: string }) =>
  !record.vehicleClass || ["passenger", "ute"].includes(record.vehicleClass);
export const inventoryRecordId = (record: AuditRecord) =>
  record.id || record.familyId || `${record.brand}-${record.model}`;
const exclusionReasons = new Set<ExclusionReason>([
  "not_sold_new_in_australia",
  "not_officially_imported",
  "not_battery_electric",
  "outside_tier1",
  "not_orderable_or_new_stock",
  "duplicate_same_model_body",
]);

export function buildMarketReconciliation(
  registry: M1MarketReconciliation | undefined,
  cars: Car[],
  inventory: ReportInventory,
  asOf: string,
) {
  const issues: ClosureIssue[] = [];
  const add = (
    code: string,
    reason: string,
    brand?: string,
    reference?: string,
  ) => issues.push({ code, reason, brand, reference });
  const lists = registry?.publishedLists || [];
  const reviews = registry?.currentVersionReviews || [];
  const resolutions = registry?.listResolutions || [];
  const inventoryResolutions = registry?.inventoryResolutions || [];
  const differences = registry?.catalogueOnlyDifferences || [];
  const asOfTime = evidenceDateValue(asOf);
  const validDate = (date: string, fresh = true) => {
    const time = evidenceDateValue(date);
    return (
      Number.isFinite(time) &&
      time <= asOfTime &&
      (!fresh || asOfTime - time <= 45 * 86400000)
    );
  };
  const validResolutionEvidence = (record: {
    reviewedAt: string;
    reason: string;
    sourceUrls: string[];
  }) =>
    validDate(record.reviewedAt) &&
    !!record.reason.trim() &&
    citationsOkay(record.sourceUrls);
  if (
    !registry ||
    registry.schemaVersion !== 1 ||
    !validDate(registry.checkedAt)
  )
    add(
      "registry",
      "No current, dated M1 reconciliation registry has been established",
    );
  const listIds = new Set<string>();
  const validLists = lists.filter((list) => {
    const duplicate = listIds.has(list.id);
    listIds.add(list.id);
    const okay =
      !!list.id &&
      !duplicate &&
      !!list.title.trim() &&
      !!list.publisher.trim() &&
      !!list.independenceKey.trim() &&
      !!list.independenceReason.trim() &&
      urlOkay(list.url) &&
      validDate(list.publishedAt, false) &&
      list.publishedAt <= list.checkedAt &&
      validDate(list.checkedAt) &&
      list.scope === "australian-new-tier1-bevs" &&
      list.entries.length > 0 &&
      new Set(list.entries.map((entry) => entry.id)).size ===
        list.entries.length &&
      list.entries.every(
        (entry) =>
          !!entry.id &&
          !!entry.brand.trim() &&
          !!entry.model.trim() &&
          !!entry.bodyStyle.trim() &&
          tierOne(entry),
      );
    if (!okay)
      add(
        "list_invalid",
        `Published list ${list.id || "(unnamed)"} is incomplete, duplicated, undated or outside its 45-day check window`,
        undefined,
        list.id,
      );
    return okay;
  });
  const independentListCount = Math.min(
    new Set(validLists.map((list) => normalise(list.independenceKey))).size,
    new Set(validLists.map((list) => normalise(list.publisher))).size,
    new Set(validLists.map((list) => list.url)).size,
  );
  if (independentListCount < 2)
    add(
      "independent_lists",
      "At least two independently published complete model-list snapshots must be reconciled",
    );

  const reviewById = new Map(reviews.map((review) => [review.id, review]));
  const carById = new Map(cars.map((car) => [car.id, car]));
  const reviewedCarIds = new Set<string>();
  const validReviewIds = new Set<string>();
  for (const review of reviews) {
    const local: string[] = [];
    if (
      !review.id ||
      reviews.filter((candidate) => candidate.id === review.id).length !== 1
    )
      local.push("review ID is missing or duplicated");
    if (
      !validDate(review.checkedAt) ||
      !citationsOkay(review.officialSourceUrls) ||
      !review.reason.trim()
    )
      local.push(
        "current official version-list evidence, reason or checked date is missing",
      );
    if (
      !review.modelId ||
      !review.brand ||
      !review.model ||
      !review.bodyStyle ||
      !tierOne(review)
    )
      local.push("exact model/body identity is incomplete");
    if (
      (review.publishedModelAliases || []).some(
        (alias) =>
          !alias.name.trim() ||
          !alias.reason.trim() ||
          !citationsOkay(alias.sourceUrls),
      )
    )
      local.push(
        "a published model-name alias lacks its explicit reason or source evidence",
      );
    if (
      !review.versions.length ||
      new Set(review.versions.map((version) => version.carId)).size !==
        review.versions.length
    )
      local.push("current version list is empty or duplicated");
    for (const version of review.versions) {
      const car = carById.get(version.carId);
      const body = car?.facts.body_style?.value ?? car?.facts.body_type?.value;
      if (
        !car ||
        !equal(car.brand, review.brand) ||
        car.modelId !== review.modelId ||
        !equal(car.model, review.model) ||
        !equal(car.model, version.model) ||
        !equal(car.trim, version.trim) ||
        car.year !== version.modelYear ||
        (car.vehicleClass || "passenger") !== review.vehicleClass ||
        (typeof body === "string" && !equal(body, review.bodyStyle))
      )
        local.push(
          `${version.carId}: exact catalogue model/body/trim/year does not match the published current version`,
        );
      if (reviewedCarIds.has(version.carId))
        local.push(
          `${version.carId}: current version is assigned to more than one model review`,
        );
      reviewedCarIds.add(version.carId);
    }
    if (!local.length) validReviewIds.add(review.id);
    for (const reason of local)
      add("version_review", reason, review.brand, review.id);
  }
  const validCoveredCarIds = new Set(
    reviews
      .filter((review) => validReviewIds.has(review.id))
      .flatMap((review) => review.versions.map((version) => version.carId)),
  );
  for (const car of cars)
    if (!validCoveredCarIds.has(car.id))
      add(
        "version_unreviewed",
        `${car.model} ${car.trim}: current version-list membership has not been settled`,
        car.brand,
        car.id,
      );

  const resolutionOkay = (
    resolution: Resolution,
    identity?: MarketIdentity,
  ) => {
    if (
      !validResolutionEvidence(resolution) ||
      resolution.outcome === "unresolved"
    )
      return false;
    if (resolution.outcome === "included") {
      const review = reviewById.get(resolution.modelReviewId);
      return (
        !!review &&
        validReviewIds.has(review.id) &&
        (!identity || identityMatches(identity, review))
      );
    }
    if (!exclusionReasons.has(resolution.exclusionReason)) return false;
    if (
      resolution.exclusionReason !== "duplicate_same_model_body" &&
      identity &&
      reviews.some(
        (review) =>
          validReviewIds.has(review.id) && identityMatches(identity, review),
      )
    )
      return false;
    return (
      resolution.exclusionReason !== "duplicate_same_model_body" ||
      !!(
        resolution.duplicateOfReviewId &&
        validReviewIds.has(resolution.duplicateOfReviewId) &&
        (!identity ||
          identityMatches(
            identity,
            reviewById.get(resolution.duplicateOfReviewId)!,
          ))
      )
    );
  };
  const settledListEntries: string[] = [];
  for (const list of lists) {
    for (const entry of list.entries) {
      const matches = resolutions.filter(
        (resolution) =>
          resolution.listId === list.id && resolution.entryId === entry.id,
      );
      if (matches.length !== 1 || !resolutionOkay(matches[0], entry))
        add(
          "list_difference",
          `${list.title}: ${entry.model} (${entry.bodyStyle}) needs one valid sourced resolution`,
          entry.brand,
          `${list.id}:${entry.id}`,
        );
      else settledListEntries.push(`${list.id}:${entry.id}`);
    }
    for (const review of reviews) {
      const represented = list.entries.some(
        (entry) =>
          identityMatches(entry, review) &&
          resolutions.some(
            (resolution) =>
              resolution.listId === list.id &&
              resolution.entryId === entry.id &&
              resolution.outcome === "included" &&
              resolution.modelReviewId === review.id &&
              resolutionOkay(resolution, entry),
          ),
      );
      if (!represented) {
        const matches = differences.filter(
          (difference) =>
            difference.listId === list.id &&
            difference.modelReviewId === review.id,
        );
        if (matches.length !== 1 || !validResolutionEvidence(matches[0]))
          add(
            "catalogue_only_difference",
            `${review.model} (${review.bodyStyle}) is absent from ${list.title}; a sourced difference reason is required`,
            review.brand,
            `${list.id}:${review.id}`,
          );
      }
    }
  }
  for (const resolution of resolutions)
    if (
      !lists.some(
        (list) =>
          list.id === resolution.listId &&
          list.entries.some((entry) => entry.id === resolution.entryId),
      )
    )
      add(
        "orphan_resolution",
        "A resolution refers to a model-list entry that does not exist",
        undefined,
        `${resolution.listId}:${resolution.entryId}`,
      );
  for (const difference of differences)
    if (
      !lists.some((list) => list.id === difference.listId) ||
      !reviewById.has(difference.modelReviewId)
    )
      add(
        "orphan_difference",
        "A catalogue-only difference refers to a missing list or model review",
        undefined,
        `${difference.listId}:${difference.modelReviewId}`,
      );

  const settledInventory: string[] = [];
  const inventoryRows = [
    ...inventory.records
      .filter(tierOne)
      .map((record) => ({ kind: "record" as const, record })),
    ...inventory.unverifiedLeads
      .filter(tierOne)
      .map((record) => ({ kind: "lead" as const, record })),
  ];
  const splitResolutionOkay = (
    resolution: InventorySplitResolution,
    record: AuditRecord,
  ): boolean => {
    const nonempty = (value: unknown): value is string =>
      typeof value === "string" && !!value.trim();
    const coverage = resolution.declaredCoverage;
    const components = resolution.components;
    if (
      !nonempty(resolution.reason) ||
      !validDate(resolution.reviewedAt) ||
      !Array.isArray(resolution.sourceUrls) ||
      !resolution.sourceUrls.every(nonempty) ||
      !citationsOkay(resolution.sourceUrls) ||
      new Set(resolution.sourceUrls).size !== resolution.sourceUrls.length ||
      !isDeepStrictEqual(resolution.originalRecord, record) ||
      !coverage ||
      !nonempty(coverage.reason) ||
      !validDate(coverage.reviewedAt) ||
      coverage.reviewedAt > resolution.reviewedAt ||
      !Array.isArray(coverage.sources) ||
      coverage.sources.length !== resolution.sourceUrls.length ||
      new Set(coverage.sources.map((source) => source?.url)).size !==
        coverage.sources.length ||
      !coverage.sources.every(
        (source) =>
          !!source &&
          nonempty(source.url) &&
          resolution.sourceUrls.includes(source.url) &&
          validDate(source.checkedAt) &&
          source.checkedAt <= coverage.reviewedAt &&
          nonempty(source.supports),
      ) ||
      !Array.isArray(coverage.versions) ||
      coverage.versions.length < 2 ||
      !Array.isArray(components) ||
      components.length < 2 ||
      new Set(components.map((component) => component?.modelReviewId)).size !==
        components.length ||
      new Set(components.map((component) => component?.modelId)).size !==
        components.length ||
      new Set(coverage.versions.map((version) => version?.carId)).size !==
        coverage.versions.length
    )
      return false;

    // Exact identity comparisons here intentionally do not use normalisation or aliases.
    const sameIdentity = (
      a: MarketIdentity & { modelId: string },
      b: MarketIdentity & { modelId: string },
    ) =>
      a.brand === b.brand &&
      a.model === b.model &&
      a.bodyStyle === b.bodyStyle &&
      a.vehicleClass === b.vehicleClass &&
      a.modelId === b.modelId;
    const declaredByCar = new Map(
      coverage.versions.map((version) => [version?.carId, version]),
    );
    const coveredCars = new Set<string>();
    for (const component of components) {
      if (
        !component ||
        !nonempty(component.modelReviewId) ||
        !nonempty(component.modelId) ||
        !nonempty(component.model) ||
        !nonempty(component.bodyStyle) ||
        component.brand !== record.brand ||
        component.vehicleClass !== (record.vehicleClass || "passenger") ||
        (!!record.bodyStyle && record.bodyStyle !== component.bodyStyle) ||
        !Array.isArray(component.versions) ||
        !component.versions.length
      )
        return false;
      const review = reviewById.get(component.modelReviewId);
      if (
        !review ||
        !validReviewIds.has(review.id) ||
        !sameIdentity(component, review) ||
        review.checkedAt > resolution.reviewedAt ||
        !review.officialSourceUrls.some((url) =>
          coverage.sources.some((source) => source.url === url),
        ) ||
        review.versions.length !== component.versions.length
      )
        return false;
      // A review cannot be reused by another split, even under a different inventory ID.
      if (
        inventoryResolutions
          .filter(
            (entry): entry is InventorySplitResolution & InventoryResolution =>
              entry.outcome === "included_split",
          )
          .flatMap((entry) =>
            Array.isArray(entry.components) ? entry.components : [],
          )
          .filter((entry) => entry?.modelReviewId === component.modelReviewId)
          .length !== 1
      )
        return false;
      for (const version of component.versions) {
        if (
          !version ||
          !nonempty(version.carId) ||
          !nonempty(version.model) ||
          !nonempty(version.trim) ||
          !(
            nonempty(version.modelYear) ||
            (typeof version.modelYear === "number" &&
              Number.isInteger(version.modelYear))
          ) ||
          coveredCars.has(version.carId)
        )
          return false;
        const declared = declaredByCar.get(version.carId);
        const reviewVersion = review.versions.find(
          (entry) => entry.carId === version.carId,
        );
        const matches = cars.filter((car) => car.id === version.carId);
        const car = matches[0];
        const bodies = [car?.facts.body_style?.value, car?.facts.body_type?.value];
        if (
          !declared ||
          !sameIdentity(declared, component) ||
          declared.modelReviewId !== component.modelReviewId ||
          declared.modelYear !== version.modelYear ||
          declared.trim !== version.trim ||
          version.model !== component.model ||
          !reviewVersion ||
          !isDeepStrictEqual(version, reviewVersion) ||
          matches.length !== 1 ||
          car.brand !== component.brand ||
          car.modelId !== component.modelId ||
          car.model !== component.model ||
          car.trim !== version.trim ||
          car.year !== version.modelYear ||
          (car.vehicleClass || "passenger") !== component.vehicleClass ||
          // Existing catalogue rows may have no body fact. The exact modelId and
          // declaration/component/review body identity still bind the body scope.
          // If a body fact is present, it must agree; never infer or invent one.
          bodies.some((body) => body != null && body !== component.bodyStyle) ||
          reviews
            .flatMap((entry) => entry.versions)
            .filter((entry) => entry.carId === version.carId).length !== 1
        )
          return false;
        coveredCars.add(version.carId);
      }
    }
    // Equality to the separately reviewed declaration catches missing bodies or grades,
    // even if both a component and its current review have been accidentally shortened.
    return (
      coveredCars.size === coverage.versions.length &&
      coverage.versions.every((version) => coveredCars.has(version.carId)) &&
      (!record.trim ||
        coverage.versions.some((version) => version.trim === record.trim)) &&
      (record.catalogueVariantIds || []).every((id) => coveredCars.has(id))
    );
  };
  for (const { kind, record } of inventoryRows) {
    const id = inventoryRecordId(record);
    const matches = inventoryResolutions.filter(
      (resolution) => resolution.kind === kind && resolution.inventoryId === id,
    );
    const match = matches[0];
    let valid =
      matches.length === 1 &&
      (match.outcome === "included_split"
        ? inventoryRows.filter(
            (row) =>
              row.kind === kind && inventoryRecordId(row.record) === id,
          ).length === 1 && splitResolutionOkay(match, record)
        : resolutionOkay(match));
    if (valid && match.outcome === "included") {
      const review = reviewById.get(match.modelReviewId)!;
      const knownNames = [record.model, ...(record.modelAliases || [])];
      valid =
        equal(record.brand, review.brand) &&
        (record.vehicleClass || "passenger") === review.vehicleClass &&
        knownNames.some((name) => modelNameMatches(name, review)) &&
        (!record.bodyStyle || equal(record.bodyStyle, review.bodyStyle)) &&
        (!record.trim ||
          review.versions.some((version) =>
            equal(version.trim, record.trim!),
          )) &&
        (record.catalogueVariantIds || []).every((id) =>
          review.versions.some((version) => version.carId === id),
        );
    }
    if (
      valid &&
      match.outcome === "excluded" &&
      match.exclusionReason !== "duplicate_same_model_body" &&
      cars.some(
        (car) =>
          equal(car.brand, record.brand) && equal(car.model, record.model),
      )
    )
      valid = false;
    if (valid) settledInventory.push(`${kind}:${id}`);
    else
      add(
        "inventory_unresolved",
        `${record.model}: inherited ${kind} still needs a sourced disposition`,
        record.brand,
        `${kind}:${id}`,
      );
  }
  for (const resolution of inventoryResolutions)
    if (
      !inventoryRows.some(
        ({ kind, record }) =>
          kind === resolution.kind &&
          inventoryRecordId(record) === resolution.inventoryId,
      )
    )
      add(
        "orphan_inventory_resolution",
        "An inventory disposition refers to a missing record or lead",
        undefined,
        `${resolution.kind}:${resolution.inventoryId}`,
      );

  if (!cars.length)
    add(
      "empty_catalogue",
      "An empty on-sale Tier 1 catalogue cannot establish market closure",
    );
  return {
    pass: issues.length === 0,
    registryCheckedAt: registry?.checkedAt || null,
    registryValid:
      !!registry &&
      registry.schemaVersion === 1 &&
      validDate(registry.checkedAt),
    independentListCount,
    listCount: lists.length,
    listEntryCount: lists.reduce((sum, list) => sum + list.entries.length, 0),
    settledListEntryCount: settledListEntries.length,
    reviewedModels: validReviewIds.size,
    reviewedVersions: validCoveredCarIds.size,
    reviewedVersionIds: [...validCoveredCarIds],
    validModelReviewIds: [...validReviewIds],
    settledInventory,
    issues,
    evidence: registry || null,
  };
}
