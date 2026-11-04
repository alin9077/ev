import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint73 as inventory, dataBeforeCheckpoint73, verifiedPre73DataHash } from "./checkpoint73-history";
import fixture from "../../qa/checkpoint71-fixture.json";
export const canonical = (value: unknown): unknown => Array.isArray(value) ? value.map(canonical) : value && typeof value === "object" ? Object.fromEntries(Object.entries(value).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => [k, canonical(v)])) : value;
export const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
type Row = Record<string, unknown>;
const live = inventory as unknown as { records: Row[]; unverifiedLeads: Row[]; reconciledLeads: Row[] };
const liveMetadata = Object.fromEntries(Object.entries(inventory).filter(([key]) => !["records", "unverifiedLeads", "reconciledLeads"].includes(key)));
assert.deepEqual(liveMetadata, fixture.approvedCurrentMarketMetadata, "Every verified source72 top-level market field must match the reviewed candidate");
const history = live.reconciledLeads.find(r => r.id === "moto-lead-local-08")!;
assert.deepEqual(history, fixture.newHistory, "Exact approved bounded lead reconciliation");
const sany = live.records.find(r => r.id === "sany-6x4-prime-mover")!;
assert.deepEqual(sany, fixture.newSanyRecord, "Exact evidence-only SANY amendment");
assert.deepEqual(live.records.find(r => r.id === "ftn-motion-streetdog-80"), fixture.newMarketRecord, "Exact bounded FTN admission");
const oldSany = (sany.priorEvidenceSnapshots as { previousRecord: Row }[])[0].previousRecord;
const oldLeads = [...live.unverifiedLeads];
oldLeads.splice(fixture.originalLeadIndex, 0, history.originalRecord as Row);
// Historical regressions keep their original expectations. Reconstruct their
// exact shared source70 predecessor from live rows and preserved snapshots.
export const marketBeforeCheckpoint71 = { ...fixture.previousMarketMetadata, records: live.records.filter(r => r.id !== "ftn-motion-streetdog-80").map(r => r.id === "sany-6x4-prime-mover" ? oldSany : r), unverifiedLeads: oldLeads, reconciledLeads: live.reconciledLeads.slice(0, fixture.previousHistoryCount) };
assert.equal(hash(marketBeforeCheckpoint71), fixture.previousMarketCanonicalSHA256, "Complete source70 market must remain reconstructable");
export function verifiedPre71DataHash(file: string): string {
 if (file !== "data/catalogue-additions-2026-10-10.json") return verifiedPre73DataHash(file);
 const current = dataBeforeCheckpoint73(file);
 for (const [key, length] of Object.entries(fixture.previousAdditionsLengths)) {
  const rows = current[key] as unknown[];
  assert.deepEqual(rows.slice(length), fixture.newAdapter[key as keyof typeof fixture.previousAdditionsLengths], "Only the reviewed additions may follow the old prefix: " + key);
  current[key] = rows.slice(0, length);
 }
 assert.equal(hash(current), fixture.previousAdditionsCanonicalSHA256, "Every pre71 addition and metadata field unchanged");
 // The canonical predecessor check above verifies semantic restoration; this
 // is its separately pinned original byte digest, not the live file's digest.
 return fixture.previousAdditionsRawSHA256;
}
