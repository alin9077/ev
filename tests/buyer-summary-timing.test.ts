import test from "node:test";
import assert from "node:assert/strict";
import { buyerSummaryNeedsClock } from "../src/lib/buyer-summary-timing";
import type { BuyerSummary } from "../src/lib/selling-points";
const base: BuyerSummary = {
  checkedAt: "2026-10-10",
  guardSourceIds: [],
  conditions: [],
  strength: { label: "Reason", text: "Dated claim", sourceIds: [] },
};
test("all freshness-limited buyer copy waits for today's clock, including untimed claims", () => {
  assert.equal(buyerSummaryNeedsClock(undefined), false);
  assert.equal(buyerSummaryNeedsClock(base), true);
  for (const deadline of ["2026-10-31", "", null, 42, undefined]) {
    const copy = structuredClone(base);
    Object.assign(copy.strength!, { validUntil: deadline });
    assert.equal(buyerSummaryNeedsClock(copy), true);
  }
  const trade = structuredClone(base);
  trade.tradeoff = { ...trade.strength!, validUntil: "2026-10-30" };
  assert.equal(buyerSummaryNeedsClock(trade), true);
});
