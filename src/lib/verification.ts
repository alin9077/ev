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
/** The wording an unconfirmed fact or equipment row shows: the app's existing empty state. */
export const NOT_CONFIRMED = "Needs confirmation";
/**
 * What a visitor sees for a fact that fails isVerifiedFact: no value, basis, dates, sources or
 * qualifications (any of them could repeat the withheld value). Done on the server, so the value never
 * reaches a page, a client component or an export.
 */
export function maskFact(f: Fact): Fact {
  if (isVerifiedFact(f)) return f;
  return {
    key: f.key,
    label: f.label,
    value: null,
    unit: "",
    basis: "",
    comparisonBasis: "",
    status: "not_verified",
    sourceIds: [],
    date: "",
    market: f.market,
    scope: "",
    qualifications: [],
    issues: [],
    grade: f.grade,
  };
}
/** A car whose unverified facts are masked. */
export function maskCar(car: Car): Car {
  return {
    ...car,
    facts: Object.fromEntries(
      Object.entries(car.facts).map(([key, f]) => [key, maskFact(f)]),
    ),
  };
}
/** The row shown for an equipment criterion that has no verified evidence. */
export function neutralFeature(
  car: Pick<Car, "id" | "modelId">,
  criterion: string,
): Feature {
  return {
    variant_id: car.id,
    model_id: car.modelId,
    criterion,
    status: "not_verified",
    value: NOT_CONFIRMED,
    conditions: "",
    source_ids: [],
    evidence_scope: "",
    last_evidence_date: "",
    reviewed_date: "",
    verification_state: "",
  };
}
/**
 * The equipment row for a criterion. A public pack stores only verified rows, so a missing row is an
 * unconfirmed one and reads as the neutral empty state.
 */
export function featureFor(
  pack: { car: Pick<Car, "id" | "modelId">; features: Feature[] },
  criterion: string,
): Feature {
  return (
    pack.features.find((f) => f.criterion === criterion) ??
    neutralFeature(pack.car, criterion)
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
