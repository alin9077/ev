import { freshnessWindowDays } from "./freshness";
import type { Source } from "./types";
import { safeUrl } from "./config";
import { validDate } from "./corrections";

export const nonemptyReviewText = (value: unknown): value is string =>
  typeof value === "string" && !!value.trim();

/** Compare every recorded JSON field, including metadata unknown to current types. */
function canonical(value: unknown, parents = new Set<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean")
    return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || parents.has(value))
    throw new Error("Invalid reviewed state: finite acyclic JSON required");
  if (
    !Array.isArray(value) &&
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  )
    throw new Error("Invalid reviewed state: plain JSON objects required");
  parents.add(value);
  let result: unknown;
  if (Array.isArray(value)) {
    if (
      Object.keys(value).length !== value.length ||
      Array.from({ length: value.length }, (_, i) => i).some(
        (i) => !Object.hasOwn(value, i),
      )
    )
      throw new Error("Invalid reviewed state: dense JSON arrays required");
    result = value.map((part) => canonical(part, parents));
  } else {
    result = Object.fromEntries(
      Object.entries(value)
        .filter(([, part]) => part !== undefined)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, part]) => [key, canonical(part, parents)]),
    );
  }
  parents.delete(value);
  return result;
}
/** Protocol canonicalization v1: ECMAScript JSON ordering after recursive code-unit key sorting. */
export const canonicalReviewedJson = (value: unknown): string =>
  JSON.stringify(canonical(value));

export const sameReviewedState = (a: unknown, b: unknown) =>
  JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

export function assertReviewedJson(value: unknown): void {
  canonical(value);
}

export function usableCorrectionSources(
  ids: unknown,
  sources: Source[],
  reviewedAt: string,
  evidenceDate?: string,
): boolean {
  return (
    Array.isArray(ids) &&
    ids.length > 0 &&
    new Set(ids).size === ids.length &&
    Array.from(ids).every((id) => {
      if (!nonemptyReviewText(id)) return false;
      const matches = sources.filter((source) => source.id === id);
      if (matches.length !== 1) return false;
      const source = matches[0];
      return (
        !!safeUrl(source.url) &&
        validDate(source.accessed_date) &&
        source.accessed_date <= reviewedAt &&
        (!evidenceDate ||
          Date.parse(evidenceDate) - Date.parse(source.accessed_date) <=
            freshnessWindowDays("availability") * 86400000) &&
        !source.access_limitation &&
        !source.conflict &&
        !source.publication_hold
      );
    })
  );
}
