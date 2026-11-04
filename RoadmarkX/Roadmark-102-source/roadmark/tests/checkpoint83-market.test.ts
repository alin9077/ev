import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint84 as market } from "./helpers/checkpoint84-history";
import evidence from "../data/market-c9h-identity-evidence-2026-10-11.json";
import {
  carsBeforeCheckpoint84 as catalogue,
  countsBeforeCheckpoint84 as counts,
} from "./helpers/checkpoint84-runtime";
import {
  marketBeforeCheckpoint83,
  marketHash83,
} from "./helpers/checkpoint83-history";
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint83-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
const row = market.records.find((r) => r.id === "sitrak-c9h-ev")!;
const old = marketBeforeCheckpoint83.records.find((r) => r.id === row.id)!;
test("C9H amendment changes exactly six reviewed evidence fields and no other239 rows", () => {
  assert.equal(marketHash83(market), fixture.approvedCanonicalSHA256);
  assert.equal(
    marketHash83(marketBeforeCheckpoint83),
    fixture.previousCanonicalSHA256,
  );
  assert.deepEqual(Object.keys(row).sort(), Object.keys(old).sort());
  const different = Object.keys(row)
    .filter(
      (k) =>
        JSON.stringify((row as Record<string, unknown>)[k]) !==
        JSON.stringify((old as Record<string, unknown>)[k]),
    )
    .sort();
  assert.deepEqual(
    different,
    [
      "sourceUrls",
      "checkedAt",
      "evidenceNote",
      "limitations",
      "sourceArtifacts",
      "evidenceHistory",
    ].sort(),
  );
  assert.deepEqual(
    market.records.filter((r) => r.id !== row.id),
    marketBeforeCheckpoint83.records.filter((r) => r.id !== row.id),
  );
  assert.deepEqual(market.counts, marketBeforeCheckpoint83.counts);
  assert.equal(market.records.length, 240);
  assert.equal(market.counts.namedTrimConfigurationEntries, 393);
  assert.equal(market.complete, false);
  assert.equal(market.validation.completeMarketAudit, false);
});
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
test("C9H entire old row, history, source caveats and amendment hash remain recoverable", () => {
  assert.deepEqual(evidence.previousRecord, old);
  assert.equal(marketHash83(old), evidence.previousRecordCanonicalSHA256);
  assert.ok(row.evidenceNote.startsWith(old.evidenceNote));
  for (const k of [
    "sourceUrls",
    "limitations",
    "sourceArtifacts",
    "evidenceHistory",
  ] as const)
    assert.deepEqual(row[k]!.slice(0, old[k]!.length), old[k]);
  const bytes = readFileSync(
    new URL(
      "../data/market-c9h-identity-evidence-2026-10-11.json",
      import.meta.url,
    ),
  );
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, fixture.evidenceArtifactSHA256);
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  assert.equal(evidence.sourceLedger.recordId, row.id);
  assert.match(evidence.sourceLedger.boundedOutcome, /reviewed source set/);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
});
test("C9H research-only amendment leaves342 detailed cars330 summaries and approval registers unchanged", () => {
  assert.equal(catalogue().length, 342);
  assert.equal(catalogue().filter((c) => c.buyerSummary).length, 330);
  assert.equal(counts().families, 148);
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
