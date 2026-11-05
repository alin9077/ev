import type { Fact } from "./types";
import { evidenceDateValue } from "./freshness";
/** An explicit offer deadline is independent of the normal evidence-age window. */
export function offerExpired(fact: Pick<Fact, "validUntil">, asOf: string) {
  if (fact.validUntil === undefined) return false;
  if (typeof fact.validUntil !== "string" || fact.validUntil.length === 0)
    return true;
  const valid = (s: string) => Number.isFinite(evidenceDateValue(s));
  return !valid(fact.validUntil) || !valid(asOf) || asOf > fact.validUntil;
}

/** Keep the sourced amount visible; validity is a separate, dated qualification. */
export function offerValidityLabel(
  offer: Pick<Fact, "validUntil">,
  asOf?: string,
): string | undefined {
  if (offer.validUntil === undefined) return undefined;
  if (!Number.isFinite(evidenceDateValue(offer.validUntil)))
    return "Offer deadline needs confirmation";
  // Server rendering has no visitor clock yet. Show the deadline without assuming
  // either that the offer has ended or that an unrecorded start date exists.
  if (asOf === undefined || asOf === "")
    return `Offer deadline: ${offer.validUntil}`;
  if (!Number.isFinite(evidenceDateValue(asOf)))
    return `Offer deadline: ${offer.validUntil}; validity needs confirmation`;
  return offerExpired(offer, asOf)
    ? `Offer ended ${offer.validUntil}; confirm a current price`
    : `Offer deadline: ${offer.validUntil}`;
}
