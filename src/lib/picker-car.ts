import {
  buyerAvailability,
  buyerAvailabilityCheckedAt,
  statedArrivalTiming,
  type BuyerAvailability,
} from "./buyer-availability";
import type { Car, Fact } from "./types";

export type ComparisonPickerPrice = Pick<
  Fact,
  | "value"
  | "unit"
  | "basis"
  | "status"
  | "validUntil"
  | "date"
  | "buyerGrade"
  | "gradeReviewStatus"
  | "conditionExplanation"
> & {
  priceEvidence?: Pick<
    NonNullable<Fact["priceEvidence"]>,
    "rung" | "basisTag" | "publisher"
  >;
  gradeReview?: Pick<NonNullable<Fact["gradeReview"]>, "sourceLabel">;
};

export function pickerPriceIsReported(price: ComparisonPickerPrice) {
  return (
    price.buyerGrade === "reported" ||
    (price.priceEvidence?.rung ?? 0) >= 5 ||
    /reported|dealer ad/i.test(price.basis)
  );
}

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
  | "vehicleClass"
  | "drive"
  | "buyerGradesRequired"
> & {
  buyerAvailabilityDisplay: {
    state: BuyerAvailability;
    timing?: string;
    checkedAt: string;
  };
  facts: {
    price_aud: ComparisonPickerPrice;
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
      buyerAvailabilityDisplay: {
        state: buyerAvailability(car),
        checkedAt: buyerAvailabilityCheckedAt(car),
        ...(statedArrivalTiming(car)
          ? { timing: statedArrivalTiming(car) }
          : {}),
      },
      vehicleClass: car.vehicleClass,
      drive: car.drive,
      ...(car.buyerGradesRequired
        ? { buyerGradesRequired: true as const }
        : {}),
      facts: {
        price_aud: {
          value: price.value,
          unit: price.unit,
          basis: price.basis,
          status: price.status,
          date: price.date,
          ...(price.buyerGrade ? { buyerGrade: price.buyerGrade } : {}),
          ...(price.gradeReviewStatus
            ? { gradeReviewStatus: price.gradeReviewStatus }
            : {}),
          ...(price.conditionExplanation
            ? { conditionExplanation: price.conditionExplanation }
            : {}),
          ...(price.priceEvidence
            ? {
                priceEvidence: {
                  rung: price.priceEvidence.rung,
                  basisTag: price.priceEvidence.basisTag,
                  ...(price.priceEvidence.publisher
                    ? { publisher: price.priceEvidence.publisher }
                    : {}),
                },
              }
            : {}),
          ...(price.gradeReview?.sourceLabel
            ? { gradeReview: { sourceLabel: price.gradeReview.sourceLabel } }
            : {}),
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
