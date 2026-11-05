import type { SceneCar } from "./scenes/kit";

/** Caption only: the price scene's protected geometry and timing are unchanged. */
export function priceSceneCaption(cars: SceneCar[]): string {
  if (cars.some((car) => car.facts.price_offer_expired === "expired"))
    return "An offer has expired. Current price needs confirmation; check the source and date below.";
  const bases = cars.map((car) => car.facts.price_comparison_basis);
  const same = bases.length === 2 && bases[0] === bases[1];
  if (same && bases[0] === "Before on-road costs")
    return "Published prices before on-road costs. Each tile is A$10,000; source and checked date are below.";
  if (same && bases[0] === "Driveaway")
    return "Published driveaway prices. Each tile is A$10,000; state, offer conditions and checked date are below.";
  return "Price bases differ or are unconfirmed, so tile lengths are not like-for-like. Price labels and checked dates are below.";
}
