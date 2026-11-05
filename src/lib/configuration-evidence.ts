import type { Car } from "./types";

/** Full-pack evidence context, not claim support or availability certification.
 * Discovery deliberately projects this away after server-side summary checks.
 */
export function configurationSourceIds(car: Pick<Car, "id" | "configurationEvidence">): readonly string[] {
  const ids = car.configurationEvidence?.sourceIds;
  if (ids === undefined) return [];
  if (
    !Array.isArray(ids) ||
    ids.some((id) => typeof id !== "string" || !id.trim()) ||
    new Set(ids).size !== ids.length
  )
    throw new Error(`Invalid configuration source IDs for ${car.id}`);
  return ids;
}
