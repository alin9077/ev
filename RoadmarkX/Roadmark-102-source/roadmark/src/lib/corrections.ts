import type { Fact, Feature, Source } from "./types";
import { safeUrl } from "./config";
export type Correction = {
  id: string;
  variantId: string;
  factKey: string;
  before: Fact["value"];
  after: Fact["value"];
  status: "pending" | "approved" | "rejected";
  reviewedBy: string;
  reviewedAt: string;
  reason: string;
  sourceIds: string[];
  basis: string;
  comparisonBasis: string;
  unit: string;
  evidenceDate: string;
  supersedes?: string;
  resolvedIssueIds?: string[];
  qualifications?: string[];
  validUntil?: string | null;
  beforeFact?: Fact;
  afterStatus?: Fact["status"];
  conditionExplanation?: string | null;
};
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}
const factStatuses = new Set<Fact["status"]>([
  "standard",
  "conditional",
  "not_verified",
  "subjective",
  "unavailable",
  "optional",
  "not_applicable",
]);
const nonempty = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();
function evidenceValue(value: unknown, parents = new Set<object>()): boolean {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return true;
  if (typeof value === "number") return Number.isFinite(value);
  if (typeof value !== "object" || parents.has(value)) return false;
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  )
    return false;
  parents.add(value);
  const okay =
    (!Array.isArray(value) || Object.keys(value).length === value.length) &&
    Object.values(value).every((part) => evidenceValue(part, parents));
  parents.delete(value);
  return okay;
}
/** JSON object order is immaterial; arrays and every defined optional field remain significant. */
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value !== null && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, part]) => part !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, part]) => [key, canonical(part)]),
    );
  return value;
}
const same = (a: unknown, b: unknown) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

/** Global checks run once, so an unknown variant or cross-variant duplicate cannot be skipped. */
export function validateFactCorrectionRegistry(
  corrections: Correction[],
  variantIds: string[],
) {
  const known = new Set(variantIds),
    seen = new Map<string, Correction>();
  for (const edit of corrections) {
    if (edit.status !== "approved") continue;
    if (!nonempty(edit.id) || seen.has(edit.id))
      throw new Error(`Duplicate or empty correction ${edit.id}`);
    if (!known.has(edit.variantId) || !nonempty(edit.factKey))
      throw new Error(`Correction ${edit.id} has unknown variant or target`);
    if (edit.supersedes !== undefined) {
      const prior = seen.get(edit.supersedes);
      if (
        !prior ||
        prior.variantId !== edit.variantId ||
        prior.factKey !== edit.factKey
      )
        throw new Error(`Correction ${edit.id} has invalid predecessor`);
    }
    seen.set(edit.id, edit);
  }
}

/** Approved value changes preserve semantics; changing restrictions needs the full reviewed old claim. */
export function applyCorrections(
  variantId: string,
  facts: Record<string, Fact>,
  corrections: Correction[],
  sources: Source[],
): Record<string, Fact> {
  const result = structuredClone(facts);
  const active = corrections.filter(
    (edit) => edit.variantId === variantId && edit.status === "approved",
  );
  if (!active.length) return result;
  const seen = new Set<string>(),
    last = new Map<string, Correction>();
  const sourceIndex = new Map<string, Source>();
  const duplicateSources = new Set<string>();
  for (const source of sources) {
    if (sourceIndex.has(source.id)) duplicateSources.add(source.id);
    sourceIndex.set(source.id, source);
  }
  for (const edit of active) {
    if (!nonempty(edit.id) || seen.has(edit.id))
      throw new Error(`Duplicate or empty correction ${edit.id}`);
    seen.add(edit.id);
    const fact = result[edit.factKey];
    if (
      !fact ||
      fact.key !== edit.factKey ||
      !evidenceValue(edit.before) ||
      !evidenceValue(edit.after)
    )
      throw new Error(`Correction ${edit.id} has invalid target or value`);
    if (
      !same(fact.value, edit.before) ||
      (edit.beforeFact !== undefined && !same(fact, edit.beforeFact))
    )
      throw new Error(
        `Correction conflict ${edit.id}: reviewed claim has changed`,
      );
    if (
      !nonempty(edit.reviewedBy) ||
      !nonempty(edit.reason) ||
      !validDate(edit.reviewedAt) ||
      !validDate(edit.evidenceDate) ||
      edit.evidenceDate > edit.reviewedAt ||
      (edit.validUntil != null && !validDate(edit.validUntil)) ||
      !nonempty(edit.basis) ||
      typeof edit.comparisonBasis !== "string" ||
      typeof edit.unit !== "string"
    )
      throw new Error(`Correction ${edit.id} lacks review provenance`);
    if (
      !Array.isArray(edit.sourceIds) ||
      !edit.sourceIds.length ||
      new Set(edit.sourceIds).size !== edit.sourceIds.length ||
      edit.sourceIds.some((id) => {
        const source = sourceIndex.get(id);
        return (
          !nonempty(id) ||
          duplicateSources.has(id) ||
          !source ||
          !safeUrl(source.url) ||
          !validDate(source.accessed_date) ||
          source.accessed_date > edit.reviewedAt ||
          source.access_limitation ||
          source.conflict ||
          source.publication_hold
        );
      })
    )
      throw new Error(`Correction ${edit.id} lacks usable supporting sources`);
    if (
      (edit.qualifications !== undefined &&
        (!Array.isArray(edit.qualifications) ||
          !edit.qualifications.every(nonempty))) ||
      (edit.conditionExplanation !== undefined &&
        edit.conditionExplanation !== null &&
        !nonempty(edit.conditionExplanation)) ||
      (edit.resolvedIssueIds !== undefined &&
        (!Array.isArray(edit.resolvedIssueIds) ||
          !edit.resolvedIssueIds.every(nonempty)))
    )
      throw new Error(`Correction ${edit.id} has invalid qualification fields`);
    const changesRestrictions =
      edit.afterStatus !== undefined ||
      edit.conditionExplanation !== undefined ||
      edit.qualifications !== undefined ||
      edit.validUntil !== undefined ||
      !!edit.resolvedIssueIds?.length;
    if (changesRestrictions && !edit.beforeFact)
      throw new Error(
        `Correction ${edit.id} requires the complete reviewed beforeFact snapshot`,
      );
    const prior = last.get(edit.factKey);
    if (
      (edit.supersedes !== undefined &&
        (!prior || edit.supersedes !== prior.id)) ||
      (prior && edit.beforeFact && edit.supersedes !== prior.id) ||
      (prior && edit.reviewedAt < prior.reviewedAt)
    )
      throw new Error(
        `Correction ${edit.id} has invalid predecessor or review chronology`,
      );
    const nextStatus =
      edit.afterStatus ??
      (edit.after === null &&
      !["unavailable", "not_applicable"].includes(fact.status)
        ? "not_verified"
        : fact.status);
    if (
      (edit.afterStatus !== undefined && !factStatuses.has(edit.afterStatus)) ||
      !factStatuses.has(nextStatus) ||
      (nextStatus === "not_verified" && edit.after !== null) ||
      (["standard", "conditional", "optional", "subjective"].includes(
        nextStatus,
      ) &&
        edit.after === null) ||
      (["unavailable", "not_applicable"].includes(nextStatus) &&
        edit.after === true)
    )
      throw new Error(
        `Correction ${edit.id} has contradictory fact status and value`,
      );
    if (
      fact.status !== "standard" &&
      nextStatus === "standard" &&
      (edit.afterStatus !== "standard" ||
        !edit.beforeFact ||
        edit.qualifications === undefined ||
        edit.conditionExplanation === undefined)
    )
      throw new Error(
        `Correction ${edit.id} requires explicit reviewed status and restriction decisions`,
      );
    const qualifications = edit.qualifications ?? fact.qualifications;
    const explanation =
      edit.conditionExplanation === undefined
        ? fact.conditionExplanation
        : (edit.conditionExplanation ?? undefined);
    if (
      edit.afterStatus !== undefined &&
      ["conditional", "optional"].includes(nextStatus) &&
      !nonempty(explanation) &&
      !qualifications.some(
        (text) => nonempty(text) && !text.startsWith("Correction "),
      )
    )
      throw new Error(`Correction ${edit.id} requires substantive conditions`);
    const resolved = new Set(edit.resolvedIssueIds || []);
    if (
      [...resolved].some(
        (id) => !fact.issues.some((issue) => issue.issue_id === id),
      )
    )
      throw new Error(`Correction ${edit.id} resolves an unknown claim issue`);
    result[edit.factKey] = {
      ...fact,
      value: structuredClone(edit.after),
      validUntil:
        edit.validUntil === undefined
          ? fact.validUntil
          : (edit.validUntil ?? undefined),
      status: nextStatus,
      conditionExplanation: explanation,
      sourceIds: [...edit.sourceIds],
      date: edit.evidenceDate,
      basis: edit.basis,
      comparisonBasis: edit.comparisonBasis,
      unit: edit.unit,
      issues: fact.issues.filter((issue) => !resolved.has(issue.issue_id)),
      qualifications: [
        ...qualifications,
        `Correction ${edit.id}: ${edit.reason}`,
      ],
    };
    last.set(edit.factKey, edit);
  }
  return result;
}
/** Capture an explanation even when it is not duplicated in the qualification list. */
export function factConditions(fact: Fact): string[] {
  const conditions = [...fact.qualifications];
  const explanation = fact.conditionExplanation?.trim();
  if (explanation && !conditions.join(" ").includes(explanation))
    conditions.push(explanation);
  return [...new Set(conditions.filter(Boolean))];
}
export type IssueDraft = {
  id: string;
  variantId: string;
  factKey: string;
  observedValue: Fact["value"];
  sourceIds: string[];
  description: string;
  createdAt: string;
  status: "pending";
  claimKind?: "fact" | "feature" | "availability";
  observedStatus?: string;
  observedConditions?: string;
};
export function makeIssueDraft(
  variantId: string,
  fact: Fact,
  description: string,
  now: string,
  id: string,
): IssueDraft {
  const text = description.trim();
  if (text.length < 10 || text.length > 2000)
    throw new Error("Describe the issue in 10–2,000 characters.");
  return {
    id,
    variantId,
    factKey: fact.key,
    observedValue: fact.value,
    sourceIds: [...fact.sourceIds],
    description: text,
    createdAt: now,
    status: "pending",
    claimKind: fact.key.startsWith("availability:")
      ? "availability"
      : fact.key.startsWith("feature:")
        ? "feature"
        : "fact",
    observedStatus: fact.status,
    observedConditions: factConditions(fact).join(" "),
  };
}

/** Equipment report uses a namespaced key and includes its displayed qualifications. */
export function featureReportClaim(feature: Feature, label: string): Fact {
  return {
    key: `feature:${feature.criterion}`,
    label,
    value: feature.value,
    unit: "",
    basis: feature.evidence_scope,
    comparisonBasis: "",
    status: feature.status,
    sourceIds: feature.source_ids,
    date: feature.reviewed_date,
    market: "AU",
    scope: feature.evidence_scope,
    qualifications: [feature.conditions],
    issues: [],
  };
}

/** Legacy history must not infer an unrecorded old semantic status. */
export function correctionHistoryStatus(edit: Correction) {
  const before = edit.beforeFact?.status;
  const after =
    edit.afterStatus ??
    (before
      ? edit.after === null &&
        !["unavailable", "not_applicable"].includes(before)
        ? "not_verified"
        : before
      : undefined);
  return {
    before: before ?? "previous claim status not recorded",
    after:
      after ??
      (edit.after === null
        ? "withdrawn value; resulting claim status not recorded"
        : "claim status preserved"),
  };
}
