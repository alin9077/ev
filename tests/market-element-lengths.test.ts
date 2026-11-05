import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-element22-epoch-evidence-2026-10-11.json";
const row = market.records.find((r) => r.id === "custom-denning-element")!;
const old = evidence.previousRecord;

test("Element2.2 retains conflicting capacity and power evidence", () => {
  assert.deepEqual(evidence.previousRecord, old);
  assert.equal(
    evidence.previousRecordCanonicalHashMethod,
    "SHA-256 of jq -S -c JSON serialization with one trailing LF",
  );

  for (const k of [
    "sourceUrls",
    "limitations",
    "sourceArtifacts",
    "evidenceHistory",
  ] as const)
    assert.deepEqual(row[k]!.slice(0, old[k]!.length), old[k]);
  assert.ok(row.evidenceNote.includes(old.evidenceNote));
  assert.equal(evidence.normalizationHolds.longBusSeatedPassengers, null);
  assert.equal(evidence.normalizationHolds.longBusTotalCapacity, null);
  assert.match(row.limitations.join(" "), /39 seated.*43 seated/);
  assert.match(row.limitations.join(" "), /411.5 kW/);
});

test("Two published lengths do not become trims, accepted orders, stock or rankings", () => {
  assert.deepEqual(row.trims, []);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.modelYear, null);
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, null);
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.ok("configurationEvidence" in row);
  const configuration = row.configurationEvidence;
  assert.ok(
    configuration &&
      !Array.isArray(configuration) &&
      "lengthOptions" in configuration,
  );
  assert.deepEqual(
    configuration.lengthOptions,
    evidence.publishedLengthOptions,
  );
  assert.equal(configuration.fullyClosedFactoryBuild, false);
  assert.equal(configuration.detailedConfigurationCountContribution, 0);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
  for (const [k, v] of Object.entries(evidence.countEffect))
    if (k !== "qualification") assert.equal(v, 0, k);
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
