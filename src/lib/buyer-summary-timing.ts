import type { BuyerSummary } from "./selling-points";
/** Every summary has a freshness window, even without an offer expiry.
 * Cached static HTML must await the browser's current Australian evidence date. */
export function buyerSummaryNeedsClock(summary: BuyerSummary | undefined) {
  return summary !== undefined;
}
