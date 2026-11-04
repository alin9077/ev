import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint95 as current } from "./checkpoint95-market-history";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";

const fixture = JSON.parse(readFileSync(new URL("../../qa/checkpoint93-market-fixture.json", import.meta.url), "utf8"));
export const marketHash93 = (value: unknown) => createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
export function assertMarketEvidence93(bytes: Uint8Array): void {
  assert.equal(createHash("sha256").update(bytes).digest("hex"), fixture.sidecarSHA256, "Exact reviewed Deepway evidence sidecar");
}
assertMarketEvidence93(readFileSync(new URL("../../data/market-deepway-star-lead-evidence-2026-10-12.json", import.meta.url)));

/** Verify the complete approved append before returning the exact pre93 JSON value.
 * Never remove a guessed latest lead or derive a new baseline from changed input.
 */
export function reconstructMarketBeforeCheckpoint93(value: unknown): typeof current {
  assert.equal(marketHash93(value), fixture.approvedCanonicalSHA256, "Exact complete approved93 market state");
  const market = value as typeof current;
  assert.equal(market.records.length, fixture.previousRecordCount);
  assert.equal(market.unverifiedLeads.length, fixture.approvedLeadCount);
  assert.equal(market.counts.unresolvedLeadGroups, fixture.approvedLeadCount);
  assert.equal(market.sourceArtifacts.length, fixture.approvedArtifactCount);
  assert.deepEqual(market.unverifiedLeads.at(-1), fixture.addedLead);
  assert.deepEqual(market.sourceArtifacts.at(-1), fixture.addedArtifact);
  assert.deepEqual(market.records.map(row => ({ id: row.id, sha256: marketHash93(row) })), fixture.unchangedRecordHashes, "Every prior record and its order");
  assert.deepEqual(market.unverifiedLeads.slice(0, -1).map(row => ({ id: row.id, sha256: marketHash93(row) })), fixture.unchangedLeadHashes, "Every prior lead and its order");
  const before = {
    ...market,
    unverifiedLeads: market.unverifiedLeads.slice(0, -1),
    sourceArtifacts: market.sourceArtifacts.slice(0, -1),
    counts: { ...market.counts, unresolvedLeadGroups: fixture.previousLeadCount },
  };
  assert.deepEqual(Object.fromEntries(Object.entries(before).filter(([key]) => !["records", "unverifiedLeads"].includes(key))), fixture.previousMetadata, "All predecessor metadata");
  assert.equal(marketHash93(before), fixture.previousCanonicalSHA256, "Exact full pre93 market value, not serialized-byte reconstruction");
  return before;
}
export const marketBeforeCheckpoint93 = reconstructMarketBeforeCheckpoint93(current);
