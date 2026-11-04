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
    (value.validUntil === undefined || string(value.validUntil)) &&
    // Existing persisted catalogue metadata uses explicit null for an absent explanation.
    (value.conditionExplanation === undefined ||
      value.conditionExplanation === null ||
      string(value.conditionExplanation)) &&
    (value.resolvedElsewhere === undefined ||
      typeof value.resolvedElsewhere === "boolean")
  );
}
