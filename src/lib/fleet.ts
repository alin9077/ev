import type { Car, Fact, Feature } from "./types";
import { BASELINE } from "./config";
import { basisTag, rankableIndices } from "./comparison-basis";

/** The vehicle-type filter. Utes sit with passenger cars: there are only a few and their figures are graded. */
export const vehicleTypes = [
  {
    value: "cars",
    label: "Passenger cars & utes",
    classes: ["passenger", "ute"],
  },
  { value: "van", label: "Vans", classes: ["van"] },
  { value: "truck", label: "Trucks", classes: ["truck"] },
  { value: "bus", label: "Buses", classes: ["bus"] },
  { value: "motorcycle", label: "Motorcycles", classes: ["motorcycle"] },
  { value: "all", label: "All vehicles", classes: [] as string[] },
] as const;
export const DEFAULT_TYPE = "cars";
export function vehicleType(value: string | null | undefined) {
  return (
    vehicleTypes.find((t) => t.value === value) ??
    vehicleTypes.find((t) => t.value === DEFAULT_TYPE)!
  );
}
export function inVehicleType(car: Pick<Car, "vehicleClass">, type: string) {
  const t = vehicleType(type);
  return (
    !t.classes.length || (t.classes as string[]).includes(car.vehicleClass)
  );
}
/**
 * How many variants of a type have no verified specification (the `unverified` flag of pickerCars()), as a
 * suffix for a menu label: "" when all are verified, " · unverified" when none is, " · 3 unverified" otherwise.
 */
export function unverifiedSuffix(
  cars: readonly Pick<Car, "vehicleClass" | "unverified">[],
  type: string,
) {
  const inType = cars.filter((c) => inVehicleType(c, type));
  const unverified = inType.filter((c) => c.unverified).length;
  if (!unverified) return "";
  return unverified === inType.length
    ? " · unverified"
    : ` · ${unverified} unverified`;
}
/** The ten best-selling EVs the guide began with come first; every other family follows by brand. */
const FEATURED_FAMILIES = [
  "byd-sealion-7",
  "geely-ex5",
  "zeekr-7x",
  "jaecoo-j5-ev",
  "byd-atto-2",
  "tesla-model-3",
  "kia-ev5",
  "kia-ev3",
  "byd-atto-3",
  "byd-atto-1",
];
export function isFeatured(family: string) {
  return FEATURED_FAMILIES.includes(family);
}
/** Every family except the Model Y baseline, featured first, then by brand and model. */
export function familyOrder(
  cars: Pick<Car, "family" | "modelId" | "brand" | "model">[],
) {
  const first = new Map<string, Pick<Car, "brand" | "model">>();
  for (const c of cars)
    if (c.modelId !== "tesla_model_y" && !first.has(c.family))
      first.set(c.family, c);
  const rank = (family: string) => {
    const i = FEATURED_FAMILIES.indexOf(family);
    return i < 0 ? FEATURED_FAMILIES.length : i;
  };
  return [...first.keys()].sort((a, b) => {
    const [x, y] = [first.get(a)!, first.get(b)!];
    return (
      rank(a) - rank(b) ||
      (rank(a) < FEATURED_FAMILIES.length
        ? 0
        : x.brand.localeCompare(y.brand, "en") ||
          x.model.localeCompare(y.model, "en", { numeric: true }))
    );
  });
}
/**
 * The lowest-priced current trim of a family, by verified prices only. Only prices on the family's shared basis
 * compete (a driveaway offer is not "cheaper" than a list price); trims on another basis, or with no verified
 * price, rank after them. If no two prices share a basis the plain price order stands.
 */
export function defaultTrim(group: Car[]) {
  const current = group.filter(
    (c) => c.availability === "current_or_order_listed",
  );
  const pool = current.length ? current : group;
  const ranked = new Set(rankableIndices(pool.map((c) => c.facts.price_aud)));
  const order = new Map(pool.map((c, i) => [c, ranked.has(i) ? 0 : 1]));
  return [...pool].sort(
    (a, b) =>
      order.get(a)! - order.get(b)! ||
      Number(a.facts.price_aud?.value ?? Infinity) -
        Number(b.facts.price_aud?.value ?? Infinity),
  )[0];
}
/** One current representative per family; this is not a sales ranking. */
export function fleetSelection(cars: Car[], query: URLSearchParams) {
  const baseline =
    cars.find(
      (c) => c.id === query.get("baseline") && c.modelId === "tesla_model_y",
    )?.id ||
    cars.find(
      (c) =>
        c.id === query.get("cars")?.split(",")[0] &&
        c.modelId === "tesla_model_y",
    )?.id ||
    BASELINE;
  const groups = new Map<string, Car[]>();
  for (const c of cars)
    if (c.modelId !== "tesla_model_y") {
      const group = groups.get(c.family);
      if (group) group.push(c);
      else groups.set(c.family, [c]);
    }
  const requested = new Set(
    (query.get("fleet") || query.get("cars") || "").split(","),
  );
  const ids = familyOrder(cars).map((family) => {
    const group = groups.get(family)!;
    return (group.find((c) => requested.has(c.id)) ?? defaultTrim(group)).id;
  });
  const byId = new Map(cars.map((c) => [c.id, c]));
  const focusFamily = query.get("focus"),
    active = query.get("active");
  const focus = ids.find(
    (id) => byId.get(id)!.family === focusFamily || id === active,
  );
  // A link to a family outside the default filter opens on that family's type.
  const type = query.get("type")
    ? vehicleType(query.get("type")).value
    : focus && !inVehicleType(byId.get(focus)!, DEFAULT_TYPE)
      ? ((
          vehicleTypes.find((t) =>
            (t.classes as string[]).includes(byId.get(focus)!.vehicleClass),
          ) ?? vehicleTypes[0]
        ).value as string)
      : DEFAULT_TYPE;
  const q = (query.get("q") || "").slice(0, 60);
  const state = {
    baseline,
    ids,
    index: 0,
    priority: query.get("priority") || "",
    type,
    q,
  };
  const shown = fleetView(cars, state).ids;
  return {
    ...state,
    index: Math.max(
      0,
      shown.findIndex((id) => id === focus),
    ),
  };
}
export type FleetSelection = ReturnType<typeof fleetSelection>;
/** The alternatives a type and search show; a search with no match leaves the type's list whole. */
export function fleetView(
  cars: Pick<Car, "id" | "brand" | "model" | "vehicleClass">[],
  state: { ids: string[]; type: string; q: string },
) {
  const byId = new Map(cars.map((c) => [c.id, c]));
  const typed = state.ids.filter((id) =>
    inVehicleType(byId.get(id)!, state.type),
  );
  const words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
  const matched = words.length
    ? typed.filter((id) => {
        const c = byId.get(id)!;
        const text = `${c.brand} ${c.model}`.toLowerCase();
        return words.every((w) => text.includes(w));
      })
    : typed;
  return {
    ids: matched.length ? matched : typed,
    noMatch: words.length > 0 && !matched.length,
    total: typed.length,
  };
}
export function featureCondition(f: Feature) {
  const context = f.conditions
    .replace(
      "Family evidence is retained, but this trim has not been independently confirmed for this feature.",
      "The feature is documented for the model family, but has not been confirmed on this exact trim.",
    )
    .trim();
  return (
    context ||
    f.confirmation_needed ||
    "Availability is not confirmed for every build. Check the exact trim, installed software and any required equipment before relying on this feature."
  );
}
export function factCondition(f: Fact) {
  if (f.resolvedElsewhere)
    return "Not from the maker's Australian specification for this exact version. The source is named below.";
  if (f.key === "price_aud")
    return basisTag(f) === "Driveaway"
      ? "This dated driveaway figure is an advertised offer. Confirm it with the dealer before relying on it."
      : "This dated figure is not a driveaway quote. Confirm it on a current order sheet.";
  if (f.key === "zero_to_100_s")
    return "The figure has changed since launch or is reported, not confirmed for this build.";
  if (f.key === "range_km")
    return "Reported for this version; not yet confirmed on the maker's Australian sheet.";
  return "Carried over from a closely related version; not yet confirmed for this one.";
}
/** How many cars either side of the one in view are drawn and fetched. */
export const WINDOW = 4;
const groupCache = new WeakMap<readonly Car[], Map<string, Car[]>>();
/** Variants grouped by family, in catalogue order. */
export function familyGroups(cars: readonly Car[]) {
  let groups = groupCache.get(cars);
  if (!groups) {
    groups = new Map();
    for (const c of cars) {
      const group = groups.get(c.family);
      if (group) group.push(c);
      else groups.set(c.family, [c]);
    }
    groupCache.set(cars, groups);
  }
  return groups;
}
/** The picked trims that differ from their family's default: all a shared link needs to keep. */
export function changedTrims(cars: readonly Car[], ids: string[]) {
  const byId = new Map(cars.map((c) => [c.id, c]));
  const groups = familyGroups(cars);
  return ids.filter(
    (id) => defaultTrim(groups.get(byId.get(id)!.family)!).id !== id,
  );
}
