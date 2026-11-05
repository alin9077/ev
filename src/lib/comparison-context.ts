import type { Car } from "./types";

/** Bus layout capacity is not the passenger-car seat total used by the legacy intro. */
export function busComparisonContext(
  cars: readonly Pick<Car, "vehicleClass">[],
): string | null {
  if (!cars.some((car) => car.vehicleClass === "bus")) return null;
  return cars.every((car) => car.vehicleClass === "bus")
    ? "Compare the named bus bodies and layouts. Seated passengers, standing passengers and the driver are shown separately; confirm the configuration of the delivered vehicle."
    : "These vehicles use different layouts. Bus passenger and driver capacities are shown separately from passenger-car seats. Range and cargo figures may use incompatible methods.";
}

/** A captured configuration must not become an unqualified delivered-vehicle claim. */
export function boundedComparisonContext(
  cars: readonly Pick<Car, "configurationEvidence">[],
): string | null {
  if (!cars.some((car) => car.configurationEvidence)) return null;
  const scope = cars.every((car) => car.configurationEvidence)
    ? "These are captured catalogue configurations with incomplete specifications."
    : "At least one selected version is a captured catalogue configuration with incomplete specifications.";
  return `${scope} Read equipment and seating claims with each version’s source and build conditions; exact production or VIN applicability may remain unverified.`;
}
