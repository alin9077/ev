import type { Fact } from "./types";
const object = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const string = (value: unknown): value is string => typeof value === "string";
const nonempty = (value: unknown): value is string =>
  string(value) && !!value.trim();
const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && Array.from(value).every(string);
const own = (value: Record<string, unknown>, key: string) =>
  Object.hasOwn(value, key);
const statuses = new Set([
  "standard",
  "conditional",
  "not_verified",
  "subjective",
  "unavailable",
  "optional",
  "not_applicable",
]);
const buyerGrades = new Set([
  "confirmed",
  "check",
  "reported",
  "not_published",
]);
function gradeReview(value: unknown): boolean {
  return (
    object(value) &&
    ["reviewedAt", "overlayId", "reason", "evidenceScope"].every((key) =>
      nonempty(value[key]),
    ) &&
    [
      "exact_au_version",
      "explicit_au_range",
      "brand_au_terms",
      "secondary_or_sibling",
      "searched_not_found",
    ].includes(String(value.evidenceScope)) &&
    strings(value.sourceIds) &&
    (value.sourceLabel === undefined || string(value.sourceLabel))
  );
}
function priceEvidence(value: unknown): boolean {
  return (
    object(value) &&
    [1, 2, 3, 4, 5, 6].includes(Number(value.rung)) &&
    typeof value.rung === "number" &&
    ["basisTag", "sourceKey", "sourcePointer", "originalBasis"].every((key) =>
      string(value[key]),
    ) &&
    typeof value.rankingEligible === "boolean" &&
    (value.state === undefined || string(value.state)) &&
    (value.publisher === undefined || string(value.publisher))
  );
}
function issue(value: unknown): boolean {
  return (
    object(value) &&
    ["issue_id", "title", "priority", "publication_action"].every((key) =>
      string(value[key]),
    ) &&
    strings(value.model_ids) &&
    strings(value.source_ids)
  );
}
export function validReportFact(value: unknown): value is Fact {
  return (
    object(value) &&
    [
      "key",
      "label",
      "unit",
      "basis",
      "comparisonBasis",
      "date",
      "market",
      "scope",
    ].every((key) => string(value[key])) &&
    nonempty(value.key) &&
    nonempty(value.label) &&
    string(value.status) &&
    statuses.has(value.status) &&
    own(value, "value") &&
    strings(value.sourceIds) &&
    strings(value.qualifications) &&
    Array.isArray(value.issues) &&
    Array.from(value.issues).every(issue) &&
    (value.gradeReviewStatus === undefined ||
      value.gradeReviewStatus === "review_required") &&
    (value.buyerGrade === undefined ||
      (string(value.buyerGrade) &&
        buyerGrades.has(value.buyerGrade) &&
        gradeReview(value.gradeReview))) &&
    (value.gradeReview === undefined || gradeReview(value.gradeReview)) &&
    (value.priceEvidence === undefined || priceEvidence(value.priceEvidence)) &&
    (value.validUntil === undefined || string(value.validUntil)) &&
    (value.modelYearChangedAt === undefined ||
      string(value.modelYearChangedAt)) &&
    // Existing persisted catalogue metadata uses explicit null for an absent explanation.
    (value.conditionExplanation === undefined ||
      value.conditionExplanation === null ||
      string(value.conditionExplanation)) &&
    (value.resolvedElsewhere === undefined ||
      typeof value.resolvedElsewhere === "boolean")
  );
}
