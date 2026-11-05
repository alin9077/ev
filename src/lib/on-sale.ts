import type { Car } from "./types";

/**
 * Plan definitions (section 1). Tier is a property of the vehicle class:
 * passenger cars, SUVs, people movers and utes are Tier 1.
 */
export const isTierOne = (car: { vehicleClass?: string }) =>
  !car.vehicleClass || ["passenger", "ute"].includes(car.vehicleClass);

/**
 * "On sale": a current/order-listed version, or an outgoing version with a
 * sourced dealer new-stock advertisement. Never a claim of physical stock.
 */
export const isOnSale = (
  car: Pick<Car, "availability" | "availabilityEvidence">,
) =>
  car.availability === "current_or_order_listed" ||
  (car.availability === "outgoing" &&
    car.availabilityEvidence?.stockStatus === "new_stock_listed" &&
    !!car.availabilityEvidence.sourceIds.length);

/** Versions the default buyer view lists: Tier 1 and on sale. */
export const isDefaultListed = (car: Car) => isTierOne(car) && isOnSale(car);

/** Headline: "N passenger EVs" counts only Tier 1 on-sale versions. */
export function passengerEvCount(cars: readonly Car[]): number {
  return cars.filter(isDefaultListed).length;
}

/** Footer line: brands with a Tier 1 on-sale version, split by review state. */
export function brandCoverage(
  cars: readonly Car[],
  status: { fullyReviewed: readonly string[] },
) {
  const brands = new Set(cars.filter(isDefaultListed).map((c) => c.brand));
  const full = new Set(status.fullyReviewed);
  const fullyReviewed = [...brands].filter((b) => full.has(b)).length;
  return { fullyReviewed, partly: brands.size - fullyReviewed };
}
