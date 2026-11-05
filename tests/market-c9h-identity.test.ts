import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalogue } from "../src/lib/data";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-c9h-identity-evidence-2026-10-11.json";
const row = market.records.find((r) => r.id === "sitrak-c9h-ev")!;
const old = evidence.previousRecord;

test("C9H listing evidence does not admit an exact EV build, stock, model year or ranking", () => {
  assert.deepEqual(row.trims, []);
  assert.deepEqual(row.aliases, []);
  assert.equal(row.modelYear, null);
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, null);
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.equal(row.exactConfigurationStatus, "partial_or_unverified");
  assert.equal(
    row.availabilityCategory,
    "listing_only_order_stock_unconfirmed",
  );
  const latest = row.evidenceHistory!.at(-1)!;
  assert.ok("technicalIdentityBridgeFound" in latest);
  assert.equal(latest.technicalIdentityBridgeFound, false);
  assert.match(row.evidenceNote, /supplier-specific available-soon/);
  assert.match(JSON.stringify(row.limitations), /diesel 660 HP/);
  assert.match(JSON.stringify(row.limitations), /not new original HTML\/PDF/);
  assert.match(
    JSON.stringify(row.limitations),
    /only the -2 page advertises 25,000/,
  );
  assert.deepEqual(evidence.requestedAdmissionDeltas, {
    families: 0,
    namedTrims: 0,
    detailedConfigurations: 0,
    completeVehicles: 0,
    rankingAdmissions: 0,
  });
});

test("C9H source caveats and earlier evidence remain available", () => {
  assert.deepEqual(evidence.previousRecord, old);

  assert.ok(row.evidenceNote.startsWith(old.evidenceNote));
  for (const k of [
    "sourceUrls",
    "limitations",
    "sourceArtifacts",
    "evidenceHistory",
  ] as const)
    assert.deepEqual(row[k]!.slice(0, old[k]!.length), old[k]);

  assert.equal(evidence.sourceLedger.recordId, row.id);
  assert.match(evidence.sourceLedger.boundedOutcome, /reviewed source set/);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
});

test("C9H market evidence is not promoted into the detailed catalogue", () => {
  assert.equal(
    catalogue().filter((c) => c.brand === "Sitrak" && c.model.includes("C9H"))
      .length,
    0,
  );
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
