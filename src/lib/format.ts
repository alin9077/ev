import type { Car } from "./types";
import { NOT_CONFIRMED } from "./verification";

/** A value for reading: no "[object Object]", no bare true/false, and the empty state for nothing. */
export function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "")
    return NOT_CONFIRMED;
  if (typeof value === "number")
    return Number.isFinite(value)
      ? value.toLocaleString("en-AU")
      : NOT_CONFIRMED;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value))
    return (
      value
        .map(formatValue)
        .filter((v) => v !== NOT_CONFIRMED)
        .join(", ") || NOT_CONFIRMED
    );
  if (typeof value === "object")
    return (
      Object.entries(value)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k.replaceAll("_", " ")}: ${formatValue(v)}`)
        .join("; ") || NOT_CONFIRMED
    );
  return String(value);
}
const NO_YEAR =
  /^(|unknown|unverified|model year (unverified|not confirmed)|n\/?a|null)$/i;
/** Whether a record has a model year worth showing. */
export function hasYear(year: unknown) {
  return !(
    year === null ||
    year === undefined ||
    (typeof year === "number" && !Number.isFinite(year)) ||
    (typeof year === "string" && NO_YEAR.test(year.trim()))
  );
}
/** The model year as shown to readers; a missing one reads as not confirmed, never "null". */
export function formatYear(year: unknown) {
  return hasYear(year) ? String(year).trim() : "Model year not confirmed";
}
/** The seat count of a car, or undefined while it is unconfirmed. */
export function seatsOf(car: Pick<Car, "facts">): number | undefined {
  const seats = car.facts.seats?.value;
  return typeof seats === "number" && seats > 0 ? seats : undefined;
}
