import type { Car } from "./types";
import { pickerCatalogue, publicCatalogue } from "./data";
import { basisOf } from "./comparison-basis";
import { visibleFactCount } from "./coverage";

/**
 * The selection list the pages and the offline file send: pickerCatalogue() (identity plus three public
 * facts) with what a picker needs to be honest about those facts:
 *   - the price carries its normalised basis tag, so a list shows "Driveaway" beside the figure and ranks
 *     only like with like (the range basis is the fact's own `basis`, already in the list);
 *   - `unverified` marks variants with no verified specification at all.
 * Both come from the public (masked) catalogue, so nothing withheld is read.
 */
let cached: Car[] | undefined;
export function pickerCars(): Car[] {
  if (cached) return cached;
  const full = new Map(publicCatalogue().map((c) => [c.id, c]));
  cached = pickerCatalogue().map((car) => {
    const source = full.get(car.id)!;
    const price = basisOf(source.facts.price_aud);
    return {
      ...car,
      // Only the flagged few carry it; the list stays small.
      ...(visibleFactCount(source) === 0 ? { unverified: true } : {}),
      facts: {
        ...car.facts,
        price_aud: price
          ? { ...car.facts.price_aud, comparisonBasis: price.tag }
          : car.facts.price_aud,
      },
    };
  });
  return cached;
}
