import { publicPack, publicSourcesById, research } from "./data";
import { pickerCars } from "./picker-cars";
import { fleetSelection, fleetView, WINDOW } from "./fleet";

/** Sources the fleet page cites in its own copy; each car's sources arrive with the car. */
const FLEET_SOURCES = ["r5_au_ev_sales_sep2026", "r3_tesla_fsd"];
/**
 * What the fleet page sends: a summary of every variant, and full packs only for the baseline and the cars
 * around the opening position. The rest are fetched as the reader moves along (see use-packs.ts).
 */
export function fleetProps(query: URLSearchParams) {
  const cars = pickerCars();
  const initial = fleetSelection(cars, query);
  const shown = fleetView(cars, initial).ids;
  const ids = [
    initial.baseline,
    ...shown.filter((_, i) => Math.abs(i - initial.index) <= WINDOW),
  ];
  return {
    cars,
    initial,
    initialPacks: ids.map(publicPack),
    criteria: research().criteria,
    sources: publicSourcesById(FLEET_SOURCES),
  };
}
