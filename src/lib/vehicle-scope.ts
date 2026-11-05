import type { VehicleClass } from "./types";

export const DEFAULT_VEHICLE_SCOPE = "tier1";
export const vehicleClassLabels: Record<VehicleClass, string> = {
  passenger: "Passenger cars, SUVs & people movers",
  ute: "Utes",
  van: "Vans & light commercials",
  truck: "Trucks",
  bus: "Buses",
  motorcycle: "Motorcycles & scooters",
  other: "Other vehicles",
};
export type VehicleScope = VehicleClass | "tier1" | "all";
type ClassifiedCar = { vehicleClass?: string };

/** Omitting a scope is the Tier 1 default; explicitly choosing all is reversible. */
export function readVehicleScope(value?: string | null): VehicleScope {
  return value === "all" ||
    value === "tier1" ||
    (value && Object.hasOwn(vehicleClassLabels, value))
    ? (value as VehicleScope)
    : DEFAULT_VEHICLE_SCOPE;
}

export function matchesVehicleScope(car: ClassifiedCar, value?: string | null) {
  const scope = readVehicleScope(value);
  const vehicleClass = car.vehicleClass || "passenger";
  if (scope === "all") return true;
  if (scope === "tier1")
    return vehicleClass === "passenger" || vehicleClass === "ute";
  return vehicleClass === scope;
}

export function vehicleScopeOptions(cars: readonly ClassifiedCar[]) {
  return [
    { value: "tier1", label: "Cars, SUVs, people movers & utes" },
    { value: "all", label: "All vehicle types" },
    ...Object.entries(vehicleClassLabels)
      .filter(([value]) =>
        cars.some((car) => (car.vehicleClass || "passenger") === value),
      )
      .map(([value, label]) => ({ value, label })),
  ];
}
