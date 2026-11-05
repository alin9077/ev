import assert from "node:assert/strict";
import { buyerProposal } from "../../src/lib/buyer-proposal";
import type { BuyerClause } from "../../src/lib/selling-points";
import { evidenceFreshness } from "../../src/lib/freshness";

/** Preserve reviewed copy exactly while independently checking the added age metadata. */
export function assertReviewedBuyerClause(
  variantId: string,
  kind: "strength" | "tradeoff",
  actual: BuyerClause | undefined,
  expected: Omit<BuyerClause, "freshness"> | null | undefined,
) {
  if (!expected) {
    assert.equal(actual, undefined, `${variantId}:${kind} remains absent`);
    return;
  }
  assert.ok(actual, `${variantId}:${kind} remains visible`);
  const { freshness, ...reviewed } = actual;
  assert.deepEqual(reviewed, expected, `${variantId}:${kind} reviewed content`);
  assert.ok(freshness?.length, `${variantId}:${kind} has dependency freshness`);
  const record = buyerProposal.records.find(
    (row) => row.variantId === variantId,
  )!;
  const clause = record[kind]!;
  for (const id of clause.dependencyIds) {
    const dependency = buyerProposal.dependencies.find((row) => row.id === id)!;
    const key =
      dependency.kind === "configuration_option"
        ? "equipment"
        : dependency.key;
    assert.ok(
      freshness.some(
        (entry) =>
          entry.key === key && entry.checkedAt === dependency.checkedAt,
      ),
      `${variantId}:${kind}:${id} freshness dependency`,
    );
  }
  for (const entry of freshness) {
    assert.ok(entry.key, `${variantId}:${kind} fact type`);
    assert.equal(
      evidenceFreshness(entry.checkedAt, entry.key, "2026-10-12").fresh,
      true,
      `${variantId}:${kind} valid current evidence date`,
    );
  }
}
