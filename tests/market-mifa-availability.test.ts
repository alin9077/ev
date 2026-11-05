import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-residual-stock-source-check-2026-10-11.json";
const row = market.records.find((r) => r.id === "ldv-mifa-9")!;
const old = evidence.previousRecord;

test("MIFA9 preserves historical grades and every unresolved supply, epoch and eligibility hold", () => {
  assert.deepEqual(row.trims, ["Mode", "Executive", "Luxe"]);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.modelYear, null);
  assert.equal(row.completeVehicleCountEligible, null);
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.deepEqual(row.limitations, old.limitations);
  assert.match(
    row.limitations.join(" "),
    /Do not confuse petrol MIFA with MIFA 9/,
  );
  assert.equal(evidence.holds.nationalNonavailabilityEstablished, false);
  assert.equal(evidence.holds.currentFactoryClosureEstablished, false);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
});

test("MIFA9 dates distinguish the historical dealer listing from the new bounded404 observation", () => {
  assert.equal(old.checkedAt, "2026-10-10");
  assert.equal(row.checkedAt, "2026-10-11");
  assert.match(row.evidenceNote, /10 October 2026 audit recorded/);
  assert.match(
    row.evidenceNote,
    /On 11 October, that cited URL returned HTTP 404/,
  );
  assert.match(
    row.evidenceNote,
    /Current factory ordering and residual New stock remain unverified/,
  );
  assert.match(row.evidenceNote, /do not establish nationwide unavailability/);
  assert.ok(!row.evidenceNote.includes("page retains"));
  assert.equal(evidence.applicationScope.wholeMarketReverified, false);
});

test("MIFA9 retains prior observations with their original dates", () => {
  assert.deepEqual(evidence.previousRecord, old);
  assert.deepEqual(evidence.amendedRecord, row);

  assert.ok(old.evidenceHistory);
  assert.deepEqual(
    row.evidenceHistory!.slice(0, old.evidenceHistory.length),
    old.evidenceHistory,
  );
  assert.equal(row.evidenceHistory!.length, old.evidenceHistory.length + 1);
  const latest = row.evidenceHistory!.at(-1)!;
  assert.ok("previousRecord" in latest);
  assert.deepEqual(latest.previousRecord, old);
  assert.ok("originalObservationDate" in latest);
  assert.equal(latest.originalObservationDate, "2026-10-10");
  assert.deepEqual(
    row.sourceUrls.slice(0, old.sourceUrls.length),
    old.sourceUrls,
  );
  assert.deepEqual(
    row.sourceArtifacts.slice(0, old.sourceArtifacts.length),
    old.sourceArtifacts,
  );
});

test("MIFA9 fresh source ledger retains404 versus200 status and avoids a visible-browser claim", () => {
  assert.equal(evidence.sources.length, 4);
  const callaghan = evidence.sources.find(
    (source) => source.id === "callaghan-mifa9-model",
  )!;
  assert.equal(callaghan.status, 404);
  assert.equal(callaghan.url, "https://www.callaghanldv.com.au/models/mifa-9");

  assert.ok(
    evidence.sources
      .filter((source) => source.id !== callaghan.id)
      .every((source) => source.status === 200),
  );
  assert.ok(
    evidence.sources.every(
      (source) =>
        source.credentialsUsed === false &&
        source.method === "GET" &&
        source.requestBody === null,
    ),
  );
  assert.match(
    evidence.qualifications.join(" "),
    /No visible browser 404 screen was verified/,
  );
  assert.match(
    evidence.qualifications.join(" "),
    /26 is source query\/facet scope; 21 is returned embedded hit objects/,
  );
});

test("MIFA9 source check stays scoped to the named market record", () => {
  assert.equal(evidence.reviewedResidualRecommendations.length, 4);
  assert.equal(evidence.applicationScope.amendedRecordId, "ldv-mifa-9");
  for (const name of [
    "approved-corrections",
    "approved-feature-corrections",
    "approved-availability-corrections",
  ])
    assert.deepEqual(
      JSON.parse(
        readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"),
      ),
      [],
    );
});
