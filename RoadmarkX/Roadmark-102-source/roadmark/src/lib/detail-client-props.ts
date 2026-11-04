import type { Car, Pack } from "./types";

/** Client transport only: keep the complete guarded summary, without the full Car. */
export type BuyerSummaryCar = Pick<Car, "buyerSummary">;
export function buyerSummaryCar(car: Car): BuyerSummaryCar {
  return { buyerSummary: car.buyerSummary };
}

/** Complete timeline inputs; unrelated facts and source history remain in the full Pack. */
export type SoftwareTimelinePack = Pick<
  Pack,
  "eligibility" | "events" | "configuration"
> & {
  car: Pick<Car, "id" | "modelId" | "brand" | "model" | "trim">;
};
export function softwareTimelinePack(pack: Pack): SoftwareTimelinePack {
  const { id, modelId, brand, model, trim } = pack.car;
  return {
    car: { id, modelId, brand, model, trim },
    eligibility: pack.eligibility,
    events: pack.events,
    configuration: pack.configuration,
  };
}
