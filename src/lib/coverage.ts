import type { Car, VehicleClass } from "./types";
import { isVerifiedFact } from "./verification";

/**
 * Whether a variant has anything to show. Vans, trucks, buses and motorcycles were imported without a
 * grade on any figure, so every one of their facts is hidden; their pages would read only "Needs
 * confirmation". Such pages stay reachable but are not offered to search engines (sitemap, llms.txt,
 * robots noindex) and say plainly that the specifications have not been verified.
 */

/** How many of a car's facts pass isVerifiedFact. Pass a car as the public pages hold it (masked). */
export function visibleFactCount(car: Pick<Car, "facts">): number {
  return Object.values(car.facts).filter((f) => isVerifiedFact(f)).length;
}

/** True when none of a full car's facts is visible. */
export function isUnverifiedVehicle(car: Pick<Car, "facts">): boolean {
  return visibleFactCount(car) === 0;
}

/** Wording shown on a page for a vehicle with no verified specification. */
export const UNVERIFIED_NOTICE =
  "Specifications for this vehicle haven't been verified yet.";
export const UNVERIFIED_DETAIL =
  "It is listed so it can be found, and compared once its figures are confirmed against Australian maker or dealer material. Until then no price, range, charging or equipment figure is shown.";
/** The short badge used in pickers and filters. */
export const UNVERIFIED_BADGE = "Unverified";

/**
 * Per vehicle class, how many variants of a selection list have no verified specification (the `unverified`
 * flag pickerCars() sets), and in how many families.
 */
export function unverifiedClasses(
  cars: readonly Pick<Car, "family" | "vehicleClass" | "unverified">[],
) {
  const by = new Map<
    VehicleClass,
    { variants: number; unverified: number; families: Set<string> }
  >();
  for (const c of cars) {
    const e = by.get(c.vehicleClass) ?? {
      variants: 0,
      unverified: 0,
      families: new Set<string>(),
    };
    e.variants++;
    if (c.unverified) {
      e.unverified++;
      e.families.add(c.family);
    }
    by.set(c.vehicleClass, e);
  }
  return by;
}
