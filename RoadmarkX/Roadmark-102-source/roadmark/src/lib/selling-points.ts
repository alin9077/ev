import { offerExpired } from "./fact-validity";
import type { Car, Feature, Source } from "./types";
import { freshDate, type EvidencePolicy } from "./discovery";
export type BuyerClause = {
  label: string;
  text: string;
  sourceIds: string[];
  validUntil?: string;
};
export type BuyerSummary = {
  expectedVisibleConditions?: string[];
  expectedSourceSnapshots?: Source[];
  checkedAt: string;
  guardSourceIds: string[];
  conditions: string[];
  strength?: BuyerClause;
  tradeoff?: BuyerClause;
};
type Dependency = {
  id: string;
  kind: string;
  variantId: string;
  key: string;
  expectedValue: unknown;
  expectedStatus?: string;
  expectedUnit?: string;
  expectedBasis?: string;
  expectedComparisonBasis?: string;
  expectedMarket?: string;
  expectedScope?: string;
  expectedQualifications?: string[];
  expectedConditionExplanation?: string | null;
  expectedConditions?: string;
  expectedEffectiveFact?: Car["facts"][string];
  sourceIds: string[];
  checkedAt: string;
};
type Clause = {
  label: string;
  text: string;
  dependencyIds: string[];
  derivations?: {
    a: string;
    b: string;
    operation: string;
    expectedResult: number;
    unit: string;
  }[];
};
export type SellingPointProposal = {
  expectedSourceSnapshots?: Source[];
  dependencies: Dependency[];
  records: {
    variantId: string;
    checkedAt: string;
    modelYearDependency: string;
    availabilityScope?: "outgoing_new_stock";
    availabilityRevision?: string;
    expectedIdentity?: Record<string, unknown>;
    expectedAvailabilityEvidence?: Car["availabilityEvidence"];
    expectedRelatedIdentities?: Record<string, Record<string, unknown>>;
    expectedRelatedAvailabilityEvidence?: Record<
      string,
      Car["availabilityEvidence"]
    >;
    availabilityGuardSourceIds?: string[];
    requiredVisibleConditions: string[];
    strength: Clause;
    tradeoff?: Clause;
  }[];
};
/** Omission is supported; malformed present editorial clauses fail closed. */
function clauseShape(value: unknown): value is Clause {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const part = value as Partial<Clause>;
  return (
    typeof part.label === "string" &&
    part.label.trim().length > 0 &&
    typeof part.text === "string" &&
    part.text.trim().length > 0 &&
    Array.isArray(part.dependencyIds) &&
    part.dependencyIds.length > 0 &&
    part.dependencyIds.every((id) => typeof id === "string" && id.length > 0) &&
    (part.derivations === undefined ||
      (Array.isArray(part.derivations) &&
        part.derivations.every(
          (d) =>
            !!d &&
            typeof d === "object" &&
            typeof d.a === "string" &&
            typeof d.b === "string" &&
            typeof d.operation === "string" &&
            typeof d.expectedResult === "number" &&
            Number.isFinite(d.expectedResult) &&
            typeof d.unit === "string",
        )))
  );
}
const equal = (a: unknown, b: unknown) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
function identityMatches(
  car: Car | undefined,
  expected: Record<string, unknown>,
) {
  return (
    !!car &&
    Object.keys(expected).length > 0 &&
    Object.entries(expected).every(
      ([key, value]) =>
        Object.hasOwn(car, key) && equal(car[key as keyof Car], value),
    )
  );
}
function sourcesCurrent(
  ids: string[],
  sources: Map<string, Source>,
  policy: EvidencePolicy,
) {
  return (
    Array.isArray(ids) &&
    ids.length > 0 &&
    ids.every((id) => {
      const source = sources.get(id);
      return (
        !!source &&
        /^https?:\/\//.test(source.url) &&
        freshDate(source.accessed_date, policy) &&
        !source.access_limitation &&
        !source.conflict &&
        !source.publication_hold
      );
    })
  );
}
/** Editorial copy fails closed when any effective fact, condition or source changes. */
export function buildBuyerSummaries(
  cars: Car[],
  features: Feature[],
  sources: Source[],
  proposal: SellingPointProposal,
  policy: EvidencePolicy,
) {
  const carIndex = new Map(cars.map((c) => [c.id, c]));
  const featureIndex = new Map(
    features.map((f) => [`${f.variant_id}:${f.criterion}`, f]),
  );
  const expectedSources = proposal.expectedSourceSnapshots
    ? new Map(
        proposal.expectedSourceSnapshots.map((source) => [source.id, source]),
      )
    : undefined;
  const sourceIndex = new Map(
    sources
      .filter(
        (source) =>
          !expectedSources?.has(source.id) ||
          equal(source, expectedSources.get(source.id)),
      )
      .map((source) => [source.id, source]),
  );
  const dependencies = new Map(proposal.dependencies.map((d) => [d.id, d]));
  const valid = new Map<string, boolean>();
  for (const dep of proposal.dependencies) {
    const car = carIndex.get(dep.variantId);
    let okay =
      !!car &&
      freshDate(dep.checkedAt, policy) &&
      sourcesCurrent(dep.sourceIds, sourceIndex, policy);
    if (car && dep.kind === "fact") {
      const fact = car.facts?.[dep.key];
      okay =
        okay &&
        !!fact &&
        !offerExpired(fact, policy.asOf) &&
        Array.isArray(fact.issues) &&
        fact.issues.length === 0 &&
        Array.isArray(fact.sourceIds) &&
        Array.isArray(fact.qualifications) &&
        freshDate(fact.date, policy) &&
        (dep.expectedEffectiveFact === undefined ||
          equal(fact, dep.expectedEffectiveFact)) &&
        equal(fact.value, dep.expectedValue) &&
        equal(fact.status, dep.expectedStatus) &&
        equal(fact.unit, dep.expectedUnit) &&
        equal(fact.basis, dep.expectedBasis) &&
        (!Object.hasOwn(dep, "expectedComparisonBasis") ||
          equal(fact.comparisonBasis, dep.expectedComparisonBasis)) &&
        (!Object.hasOwn(dep, "expectedMarket") ||
          equal(fact.market, dep.expectedMarket)) &&
        (!Object.hasOwn(dep, "expectedScope") ||
          equal(fact.scope, dep.expectedScope)) &&
        equal(fact.qualifications, dep.expectedQualifications) &&
        equal(fact.conditionExplanation, dep.expectedConditionExplanation) &&
        dep.sourceIds.every((id) => fact.sourceIds.includes(id));
    } else if (car && dep.kind === "feature") {
      const feature = featureIndex.get(`${dep.variantId}:${dep.key}`);
      okay =
        okay &&
        !!feature &&
        Array.isArray(feature.source_ids) &&
        freshDate(feature.reviewed_date, policy) &&
        equal(feature.value, dep.expectedValue) &&
        equal(feature.status, dep.expectedStatus) &&
        equal(feature.conditions, dep.expectedConditions) &&
        dep.sourceIds.every((id) => feature.source_ids.includes(id));
    } else if (car && dep.kind === "configuration_option") {
      // Exact captured option records are not scalar specifications or generic features.
      // Ambiguous identifiers, missing options and any changed snapshot fail closed.
      const options = car.configurationEvidence?.options;
      const matches = Array.isArray(options)
        ? options.filter(
            (option) =>
              option &&
              typeof option === "object" &&
              option.sourceCopyLedgerId === dep.key,
          )
        : [];
      okay =
        okay && matches.length === 1 && equal(matches[0], dep.expectedValue);
    } else if (car && dep.kind === "variant_property") {
      const actual =
        dep.key === "model_year"
          ? car.year
          : dep.key === "drive"
            ? car.drive
            : undefined;
      okay = okay && actual !== undefined && equal(actual, dep.expectedValue);
    } else okay = false;
    valid.set(dep.id, okay);
  }
  const result = new Map<string, BuyerSummary>();
  for (const record of proposal.records) {
    if (
      !clauseShape(record.strength) ||
      (Object.hasOwn(record, "tradeoff") && !clauseShape(record.tradeoff))
    )
      continue;
    const car = carIndex.get(record.variantId);
    const stock = car?.availabilityEvidence;
    const outgoing = car?.availability === "outgoing";
    if (
      !car ||
      (car.configurationEvidence?.requiredBuyerVisibleConditions !==
        undefined &&
        (!Array.isArray(
          car.configurationEvidence.requiredBuyerVisibleConditions,
        ) ||
          !car.configurationEvidence.requiredBuyerVisibleConditions.length ||
          !car.configurationEvidence.requiredBuyerVisibleConditions.every(
            (value) => typeof value === "string" && value.trim().length > 0,
          ) ||
          !equal(
            record.requiredVisibleConditions,
            car.configurationEvidence.requiredBuyerVisibleConditions,
          ))) ||
      (record.availabilityRevision || "") !==
        (car.availabilityRevision || "") ||
      (record.expectedIdentity !== undefined &&
        !identityMatches(car, record.expectedIdentity)) ||
      (record.expectedAvailabilityEvidence !== undefined &&
        (!stock ||
          !equal(stock, record.expectedAvailabilityEvidence) ||
          !freshDate(stock.checkedAt, policy))) ||
      (record.expectedRelatedIdentities !== undefined &&
        !Object.entries(record.expectedRelatedIdentities).every(
          ([id, expected]) => identityMatches(carIndex.get(id), expected),
        )) ||
      (record.expectedRelatedAvailabilityEvidence !== undefined &&
        !Object.entries(record.expectedRelatedAvailabilityEvidence).every(
          ([id, expected]) => {
            const related = carIndex.get(id);
            return (
              related?.availability === "current_or_order_listed" &&
              !!related.availabilityEvidence &&
              equal(related.availabilityEvidence, expected) &&
              freshDate(related.availabilityEvidence.checkedAt, policy)
            );
          },
        )) ||
      (record.availabilityGuardSourceIds !== undefined &&
        !sourcesCurrent(
          record.availabilityGuardSourceIds,
          sourceIndex,
          policy,
        )) ||
      (car.availability !== "current_or_order_listed" &&
        !(
          outgoing &&
          record.availabilityScope === "outgoing_new_stock" &&
          stock?.stockStatus === "new_stock_listed" &&
          freshDate(stock.checkedAt, policy) &&
          sourcesCurrent(stock.sourceIds, sourceIndex, policy)
        ))
    )
      continue;
    if (
      !valid.get(record.modelYearDependency) ||
      !freshDate(record.checkedAt, policy)
    )
      continue;
    const clause = (part: Clause): BuyerClause | undefined => {
      if (
        !part.dependencyIds.length ||
        !part.dependencyIds.every((id) => valid.get(id))
      )
        return;
      if (
        part.derivations?.some(
          (d) =>
            d.operation !== "a - b" ||
            !part.dependencyIds.includes(d.a) ||
            !part.dependencyIds.includes(d.b) ||
            typeof dependencies.get(d.a)?.expectedValue !== "number" ||
            typeof dependencies.get(d.b)?.expectedValue !== "number" ||
            Number(dependencies.get(d.a)?.expectedValue) -
              Number(dependencies.get(d.b)?.expectedValue) !==
              d.expectedResult,
        )
      )
        return;
      const deadlines = [record.modelYearDependency, ...part.dependencyIds]
        .flatMap((id) => {
          const dep = dependencies.get(id)!;
          const deadline =
            dep.kind === "fact"
              ? carIndex.get(dep.variantId)?.facts?.[dep.key]?.validUntil
              : undefined;
          return deadline ? [deadline] : [];
        })
        .sort();
      return {
        ...(deadlines.length ? { validUntil: deadlines[0] } : {}),
        label: part.label,
        text: part.text,
        sourceIds: [
          ...new Set(
            part.dependencyIds.flatMap((id) => dependencies.get(id)!.sourceIds),
          ),
        ],
      };
    };
    const strength = clause(record.strength),
      tradeoff =
        record.tradeoff === undefined ? undefined : clause(record.tradeoff);
    const summarySources = expectedSources
      ? [
          ...new Set([
            ...dependencies.get(record.modelYearDependency)!.sourceIds,
            ...(record.availabilityGuardSourceIds || []),
            ...(outgoing ? stock!.sourceIds : []),
            ...(strength?.sourceIds || []),
            ...(tradeoff?.sourceIds || []),
          ]),
        ]
          .filter((id) => expectedSources.has(id))
          .map((id) => expectedSources.get(id)!)
      : [];
    if (strength || tradeoff)
      result.set(record.variantId, {
        checkedAt:
          outgoing && stock!.checkedAt < record.checkedAt
            ? stock!.checkedAt
            : record.checkedAt,
        guardSourceIds: [
          ...new Set([
            ...dependencies.get(record.modelYearDependency)!.sourceIds,
            ...(outgoing ? stock!.sourceIds : []),
            ...(record.availabilityGuardSourceIds || []),
          ]),
        ],
        conditions: [...record.requiredVisibleConditions],
        ...(car.configurationEvidence?.requiredBuyerVisibleConditions !==
        undefined
          ? {
              expectedVisibleConditions: [
                ...car.configurationEvidence.requiredBuyerVisibleConditions,
              ],
            }
          : {}),
        ...(summarySources.length
          ? { expectedSourceSnapshots: summarySources }
          : {}),
        strength,
        tradeoff,
      });
  }
  return result;
}
export function currentBuyerSummary(
  summary: BuyerSummary | undefined,
  sources: Source[],
  policy: EvidencePolicy,
) {
  if (!summary || !freshDate(summary.checkedAt, policy)) return;
  if (
    summary.expectedVisibleConditions !== undefined &&
    (!Array.isArray(summary.expectedVisibleConditions) ||
      !summary.expectedVisibleConditions.length ||
      !summary.expectedVisibleConditions.every(
        (value) => typeof value === "string" && value.trim().length > 0,
      ) ||
      !equal(summary.conditions, summary.expectedVisibleConditions))
  )
    return;
  const expectedSources = summary.expectedSourceSnapshots
    ? new Map(
        summary.expectedSourceSnapshots.map((source) => [source.id, source]),
      )
    : undefined;
  const index = new Map(
    sources
      .filter(
        (source) =>
          !expectedSources?.has(source.id) ||
          equal(source, expectedSources.get(source.id)),
      )
      .map((s) => [s.id, s]),
  );
  if (!sourcesCurrent(summary.guardSourceIds, index, policy)) return;
  const strength =
    summary.strength &&
    (summary.strength.validUntil === undefined ||
      (typeof summary.strength.validUntil === "string" &&
        summary.strength.validUntil.length > 0 &&
        !offerExpired(summary.strength, policy.asOf))) &&
    sourcesCurrent(summary.strength.sourceIds, index, policy)
      ? summary.strength
      : undefined;
  const tradeoff =
    summary.tradeoff &&
    (summary.tradeoff.validUntil === undefined ||
      (typeof summary.tradeoff.validUntil === "string" &&
        summary.tradeoff.validUntil.length > 0 &&
        !offerExpired(summary.tradeoff, policy.asOf))) &&
    sourcesCurrent(summary.tradeoff.sourceIds, index, policy)
      ? summary.tradeoff
      : undefined;
  return strength || tradeoff ? { ...summary, strength, tradeoff } : undefined;
}
