import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint93 as market } from "./helpers/checkpoint93-market-history";
import evidence from "../data/market-residual-stock-source-check-2026-10-11.json";
import { marketBeforeCheckpoint91 as before, marketHash91 } from "./helpers/checkpoint91-market-history";
const row = market.records.find(record => record.id === "ldv-mifa-9")!;
const old = before.records.find(record => record.id === row.id)!;

test("MIFA9 changes five evidence fields while all counts, other records and leads remain exact", () => {
  const changed = Object.keys(row).filter(key => JSON.stringify((row as Record<string, unknown>)[key]) !== JSON.stringify((old as Record<string, unknown>)[key]));
  assert.deepEqual(changed.sort(), ["sourceUrls", "checkedAt", "evidenceNote", "sourceArtifacts", "evidenceHistory"].sort());
  assert.equal(market.records.length, 241);
  assert.deepEqual(market.counts, before.counts);
  assert.deepEqual(market.records.filter(record => record.id !== row.id), before.records.filter(record => record.id !== row.id));
  for (const key of ["unverifiedLeads", "reconciledLeads", "peripheralRecords"] as const) assert.deepEqual(market[key], before[key]);
  assert.equal(market.complete, false);
  assert.equal(market.checkedAt, "2026-10-10");
  assert.ok(Object.values(evidence.countEffect).every(value => value === 0));
});

test("MIFA9 preserves historical grades and every unresolved supply, epoch and eligibility hold", () => {
  assert.deepEqual(row.trims, ["Mode", "Executive", "Luxe"]);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.modelYear, null);
  assert.equal(row.completeVehicleCountEligible, null);
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.deepEqual(row.limitations, old.limitations);
  assert.match(row.limitations.join(" "), /Do not confuse petrol MIFA with MIFA 9/);
  assert.equal(evidence.holds.nationalNonavailabilityEstablished, false);
  assert.equal(evidence.holds.currentFactoryClosureEstablished, false);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
});

test("MIFA9 dates distinguish the historical dealer listing from the new bounded404 observation", () => {
  assert.equal(old.checkedAt, "2026-10-10");
  assert.equal(row.checkedAt, "2026-10-11");
  assert.match(row.evidenceNote, /10 October 2026 audit recorded/);
  assert.match(row.evidenceNote, /On 11 October, that cited URL returned HTTP 404/);
  assert.match(row.evidenceNote, /Current factory ordering and residual New stock remain unverified/);
  assert.match(row.evidenceNote, /do not establish nationwide unavailability/);
  assert.ok(!row.evidenceNote.includes("page retains"));
  assert.equal(evidence.applicationScope.wholeMarketReverified, false);
});

test("MIFA9 keeps the complete prior record and original evidence history byte-equivalent as values", () => {
  assert.deepEqual(evidence.previousRecord, old);
  assert.deepEqual(evidence.amendedRecord, row);
  assert.equal(evidence.previousRecordCanonicalSHA256, marketHash91(old));
  assert.ok(old.evidenceHistory);
  assert.deepEqual(row.evidenceHistory!.slice(0, old.evidenceHistory.length), old.evidenceHistory);
  assert.equal(row.evidenceHistory!.length, old.evidenceHistory.length + 1);
  const latest = row.evidenceHistory!.at(-1)!;
  assert.ok("previousRecord" in latest);
  assert.deepEqual(latest.previousRecord, old);
  assert.ok("originalObservationDate" in latest);
  assert.equal(latest.originalObservationDate, "2026-10-10");
  assert.deepEqual(row.sourceUrls.slice(0, old.sourceUrls.length), old.sourceUrls);
  assert.deepEqual(row.sourceArtifacts.slice(0, old.sourceArtifacts.length), old.sourceArtifacts);
});

test("MIFA9 fresh source ledger retains404 versus200 status and avoids a visible-browser claim", () => {
  assert.equal(evidence.sources.length, 4);
  const callaghan = evidence.sources.find(source => source.id === "callaghan-mifa9-model")!;
  assert.equal(callaghan.status, 404);
  assert.equal(callaghan.url, "https://www.callaghanldv.com.au/models/mifa-9");
  assert.equal(callaghan.sha256, "5d64064c279d1080a301be5cf888d970c5743f758725a2eecf2691ce202cd28e");
  assert.ok(evidence.sources.filter(source => source.id !== callaghan.id).every(source => source.status === 200));
  assert.ok(evidence.sources.every(source => source.credentialsUsed === false && source.method === "GET" && source.requestBody === null));
  assert.match(evidence.qualifications.join(" "), /No visible browser 404 screen was verified/);
  assert.match(evidence.qualifications.join(" "), /26 is source query\/facet scope; 21 is returned embedded hit objects/);
});

test("MIFA9 sidecar is exactly bound and appends one artifact without refreshing prior metadata", () => {
  const bytes = readFileSync(new URL("../data/market-residual-stock-source-check-2026-10-11.json", import.meta.url));
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, "a56017c332f4f0a08f121b51e4784525aa67234a9ba114c95fe567361278eb04");
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  assert.deepEqual(market.sourceArtifacts.slice(0, -1), before.sourceArtifacts);
  assert.equal(evidence.reviewedResidualRecommendations.length, 4);
  assert.equal(evidence.applicationScope.amendedRecordId, "ldv-mifa-9");
  for (const name of ["approved-corrections", "approved-feature-corrections", "approved-availability-corrections"]) assert.deepEqual(JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")), []);
});
