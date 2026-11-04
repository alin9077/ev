import type { Fact } from "./types";
/** An explicit offer deadline is independent of the normal evidence-age window. */
export function offerExpired(fact: Pick<Fact, "validUntil">, asOf: string) {
  if (fact.validUntil === undefined) return false;
  if (typeof fact.validUntil !== "string" || fact.validUntil.length === 0)
    return true;
  const valid = (s: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    Number.isFinite(Date.parse(`${s}T00:00:00Z`)) &&
    new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
  return !valid(fact.validUntil) || !valid(asOf) || asOf > fact.validUntil;
}
