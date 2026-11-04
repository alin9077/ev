import { pickerCatalogue, publicPack } from "../../src/lib/data";
import { featureFor } from "../../src/lib/verification";
import { fleetSelection, fleetView } from "../../src/lib/fleet";

/** The cars the homepage opens on: every family but Model Y that the default vehicle type shows. */
const cars = pickerCatalogue();
const opening = fleetSelection(cars, new URLSearchParams());
export const openingAlternatives = fleetView(cars, opening).ids.length;
/** How many variants a vehicle type holds in families beside Model Y, and the cars a brand search finds. */
export function familiesOfType(type: string) {
  return fleetView(cars, { ids: opening.ids, type, q: "" }).ids.length;
}
export function familiesMatching(q: string) {
  return fleetView(cars, { ids: opening.ids, type: "cars", q }).ids.length;
}
/** The first opening alternative whose answer for a fact or equipment row is confirmed and conditional. */
export function firstConditional(
  key: string,
  kind: "feature" | "fact" = "feature",
) {
  const ids = fleetView(cars, opening).ids;
  const i = ids.findIndex((id) => {
    const pack = publicPack(id);
    return (
      (kind === "fact"
        ? pack.car.facts[key].status
        : featureFor(pack, key).status) === "conditional"
    );
  });
  return { index: i, id: ids[i] };
}
/** All variants, and the families they fall in. */
export const variantCount = cars.length;
export const familyCount = new Set(cars.map((c) => c.family)).size;
