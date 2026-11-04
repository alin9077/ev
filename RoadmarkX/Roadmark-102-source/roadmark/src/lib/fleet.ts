import type { Car, Fact, Feature } from "./types";
import { BASELINE } from "./config";

/** The original illustrated experience covers established records only. */
export function curatedFleetCars(cars: Car[]) {
  return cars.filter((c) => c.researchStage !== "partial");
}

/** One current representative per existing family; this is not a sales ranking. */
export function fleetSelection(cars: Car[], query: URLSearchParams) {
  // This legacy illustrated route is curated; incomplete additions live in discovery.
  cars = curatedFleetCars(cars);
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
  const families = [
    ...new Set(
      cars.filter((c) => c.modelId !== "tesla_model_y").map((c) => c.family),
    ),
  ];
  const requested = (query.get("fleet") || query.get("cars") || "").split(",");
  const alternatives = families.map((family) => {
    const group = cars.filter((c) => c.family === family);
    const selected = group.find((c) => requested.includes(c.id));
    const current = group.filter(
      (c) => c.availability === "current_or_order_listed",
    );
    return (
      selected ||
      [...(current.length ? current : group)].sort(
        (a, b) =>
          Number(a.facts.price_aud.value ?? Infinity) -
          Number(b.facts.price_aud.value ?? Infinity),
      )[0]
    );
  });
  const current = alternatives.findIndex(
    (c) => c.family === query.get("focus") || c.id === query.get("active"),
  );
  return {
    baseline,
    ids: alternatives.map((c) => c.id),
    index: Math.max(0, current),
    priority: query.get("priority") || "",
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
  if (f.conditionExplanation) return f.conditionExplanation;
  if (f.resolvedElsewhere)
    return "Not from the maker's Australian specification for this exact version. The source is named below.";
  if (f.qualifications.length) return f.qualifications.join(" ");
  return "Source conditions apply. Check the measurement basis and exact-version details below.";
}
