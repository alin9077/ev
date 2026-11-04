import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import current from "../../data/market-inventory-2026-10-10.json";
import { canonicalReviewedJson } from "../../src/lib/correction-guards";

const byteHash95 = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const fixtureBytes = readFileSync(new URL("../../qa/checkpoint95-market-fixture.json", import.meta.url));
assert.equal(byteHash95(fixtureBytes), "be8fc1fb14600253d57ecdcd2ec27927208c66abf853f03fcb34b5ff706259e2", "Exact checkpoint95 disposition fixture");
const fixture = JSON.parse(fixtureBytes.toString("utf8"));
export const marketHash95 = (value: unknown) => createHash("sha256").update(canonicalReviewedJson(value)).digest("hex");
export function assertMarketEvidence95(bytes: Uint8Array): void {
  assert.equal(byteHash95(bytes), "370449ee44a832977f99952ec6fc764fe38180c5c4aa10128fc4187856863c68", "Exact CX-6e sidecar including the limited visual-status correction");
}
assertMarketEvidence95(readFileSync(new URL("../../data/market-mazda-cx6e-lead-evidence-2026-10-12.json", import.meta.url)));

/** Undo only the exact approved95 disposition, preserving ordered predecessor data.
 * Checkpoint93 receives this exact predecessor and retains all its existing pins.
 * No guessed latest record, filtered replacement baseline or live repinning is allowed.
 */
export function reconstructMarketBeforeCheckpoint95(value: unknown): typeof current {
  assert.equal(marketHash95(value), "29b406b2179013a99100771ab9ccec20f21f6736bc06ad39295a5bce017f5576", "Exact complete checkpoint95 market value");
  const market = value as typeof current;
  for (const key of ["records", "unverifiedLeads", "reconciledLeads", "sourceArtifacts", "peripheralRecords"] as const)
    assert.equal(market[key].length, fixture.lengthsAfter[key], "Approved95 length: " + key);
  assert.deepEqual(market.records.at(-1), fixture.appendedRecord, "Only the exact CX-6e record was appended");
  assert.deepEqual(market.reconciledLeads.at(-1), fixture.appendedReconciledLead, "Exact original lead retained in history");
  assert.deepEqual(market.sourceArtifacts.at(-1), fixture.appendedArtifact, "Exact evidence artifact appended");
  assert.deepEqual(market.counts, fixture.countsAfter, "Only reviewed dependent counts");
  assert.equal(market.unverifiedLeads.filter(row => row.id === fixture.leadId).length, 0);
  assert.equal(market.records.filter(row => row.id === fixture.leadId).length, 1);
  assert.equal(marketHash95(fixture.originalLead), "c04445cb1695a970f853920f45fd1f2ec251c173c917884eb118af7f53ebd8bc", "Exact original lead value");
  const originalIndex: number = fixture.originalLeadIndex;
  assert.equal(originalIndex, 40);
  const before = {
    ...market,
    records: market.records.slice(0, -1),
    unverifiedLeads: [
      ...market.unverifiedLeads.slice(0, originalIndex),
      fixture.originalLead,
      ...market.unverifiedLeads.slice(originalIndex),
    ],
    reconciledLeads: market.reconciledLeads.slice(0, -1),
    sourceArtifacts: market.sourceArtifacts.slice(0, -1),
    counts: fixture.countsBefore,
  };
  for (const key of ["records", "unverifiedLeads", "reconciledLeads", "sourceArtifacts", "peripheralRecords"] as const)
    assert.equal(before[key].length, fixture.lengthsBefore[key], "Pre95 length: " + key);
  assert.equal(marketHash95(before), "1f1c0cd52a18794ea249f4295b94b2d0b1981c42d570cd68070f0cb4cb243be2", "Exact complete checkpoint93 market predecessor; no historical repinning");
  return before;
}

export const marketBeforeCheckpoint95 = reconstructMarketBeforeCheckpoint95(current);
