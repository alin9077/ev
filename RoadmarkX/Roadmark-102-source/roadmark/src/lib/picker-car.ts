import type { Car, Fact } from "./types";

/** Comparison selection only. Full evidence stays on the selected Packs. */
export type ComparisonPickerCar = Pick<
  Car,
  | "id"
  | "modelId"
  | "family"
  | "brand"
  | "model"
  | "trim"
  | "generation"
  | "availability"
  | "drive"
> & {
  facts: {
    price_aud: Pick<Fact, "value" | "unit" | "basis" | "status" | "validUntil">;
    range_km: Pick<Fact, "value">;
    seats: Pick<Fact, "value">;
  };
};

/** Do not reuse this projection for detail cards or evidence-bearing Explorer rows. */
export function comparisonPickerCars(
  cars: readonly Car[],
): ComparisonPickerCar[] {
  return cars.map((car) => {
    const price = car.facts.price_aud;
    return {
      id: car.id,
      modelId: car.modelId,
      family: car.family,
      brand: car.brand,
      model: car.model,
      trim: car.trim,
      generation: car.generation,
      availability: car.availability,
      drive: car.drive,
      facts: {
        price_aud: {
          value: price.value,
          unit: price.unit,
          basis: price.basis,
          status: price.status,
          ...(price.validUntil !== undefined
            ? { validUntil: price.validUntil }
            : {}),
        },
        range_km: { value: car.facts.range_km.value },
        seats: { value: car.facts.seats.value },
      },
    };
  });
}
