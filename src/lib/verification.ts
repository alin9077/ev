import type { Car, Fact, Feature, Grade, VehicleClass } from "./types";

/**
 * Hide unverified facts: one definition of "visible".
 *
 * A fact (or equipment row) is verified when it has a value and its grade is
 *   - confirmed    : current Australian maker material for the exact version,
 *   - reported     : a named Australian publication or dealer for the exact version, or
 *   - established  : one of the original 34 variants' values supplied with the app that the
 *                    research import did not contradict with a sourced conflict.
 * check, not_published and unrated facts stay in the data but are excluded here.
 */
export const VERIFIED_GRADES: readonly Grade[] = [
  "confirmed",
  "reported",
  "established",
];
export const GRADE_LABELS: Record<Grade, string> = {
  confirmed: "Confirmed",
  reported: "Reported",
  established: "Established",
  check: "Check",
  not_published: "Not published",
  unrated: "Not rated",
};
export const VEHICLE_CLASSES: readonly VehicleClass[] = [
  "passenger",
  "ute",
  "van",
  "truck",
  "bus",
  "motorcycle",
];
type Gradable = {
  grade?: Grade;
  value?: unknown;
  status?: string;
};
export function isVerifiedFact(item: Gradable): boolean {
  if (item.value === null || item.value === undefined) return false;
  if (item.status === "not_verified") return false;
  return !!item.grade && VERIFIED_GRADES.includes(item.grade);
}
/** A fact that carries a value but fails isVerifiedFact (what "hide unverified" removes). */
export function isHiddenFact(item: Gradable): boolean {
  return (
    item.value !== null && item.value !== undefined && !isVerifiedFact(item)
  );
}
export function verifiedFacts(car: Pick<Car, "facts">): Record<string, Fact> {
  return Object.fromEntries(
    Object.entries(car.facts).filter(([, f]) => isVerifiedFact(f)),
  );
}
export function hiddenFacts(car: Pick<Car, "facts">): Record<string, Fact> {
  return Object.fromEntries(
    Object.entries(car.facts).filter(([, f]) => isHiddenFact(f)),
  );
}
export function verifiedFeatures(features: Feature[]): Feature[] {
  return features.filter((f) => isVerifiedFact({ ...f, value: f.value }));
}
