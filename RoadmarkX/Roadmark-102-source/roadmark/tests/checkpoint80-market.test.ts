import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint81 as market } from "./helpers/checkpoint81-history";
import evidence from "../data/market-c3he-evidence-2026-10-11.json";
import {
  carsBeforeCheckpoint84 as catalogue,
  countsBeforeCheckpoint84 as counts,
} from "./helpers/checkpoint84-runtime";
import {
  marketBeforeCheckpoint80,
  marketHash80,
} from "./helpers/checkpoint80-history";
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint80-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
const row = market.records.find((record) => record.id === "sitrak-c3he")!;

test("C3HE census addition preserves all 239 previous records and complete metadata history", () => {
  assert.equal(marketBeforeCheckpoint80.records.length, 239);
  assert.equal(
    marketHash80(marketBeforeCheckpoint80),
    fixture.previousCanonicalSHA256,
  );
  assert.equal(marketHash80(market), fixture.approvedCanonicalSHA256);
  assert.deepEqual(
    market.records.slice(0, -1),
    marketBeforeCheckpoint80.records,
  );
  assert.deepEqual(row, fixture.addedRecord);
  assert.equal(market.records.length, 240);
  assert.equal(market.counts.namedTrimConfigurationEntries, 393);
  assert.equal(market.counts.newStockListedModelRecords, 68);
  assert.equal(market.checkedAt, marketBeforeCheckpoint80.checkedAt);
  assert.equal(market.complete, false);
  assert.equal(market.validation.completeMarketAudit, false);
});

test("two exact dealer source identities remain listing-only with visible conflicting-specification warning", () => {
  assert.deepEqual(row.sourceRecordIds, [
    "sitrak-c3he-cityfleet-86kwh",
    "sitrak-c3he-cityfleet-100kwh",
  ]);
  assert.equal(row.trims.length, 2);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, false);
  assert.equal(row.physicalStockVerified, false);
  assert.equal(row.physicalStockQuantity, null);
  assert.equal(row.independentAustralianRoadApprovalVerified, false);
  assert.equal(row.readyForDetailedCompleteBuildPromotion, false);
  assert.equal(row.modelYear, null);
  assert.match(
    row.evidenceNote,
    /incomplete, partly conflicting specifications/,
  );
  assert.match(
    row.evidenceNote,
    /No finished-build payload, traction voltage, warranty or delivery promise is inferred/,
  );
});

test("C3HE evidence is a registered byte-verified artifact with exact source configurations", () => {
  const raw = readFileSync(
    new URL("../data/market-c3he-evidence-2026-10-11.json", import.meta.url),
  );
  const hash = createHash("sha256").update(raw).digest("hex");
  assert.equal(hash, fixture.evidenceArtifactSHA256);
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  assert.deepEqual(row.sourceArtifacts, [
    "market-c3he-evidence-2026-10-11.json",
  ]);
  assert.deepEqual(
    evidence.sourceConfigurations.map((source) => source.sourceConfigurationId),
    row.sourceRecordIds,
  );
  for (const source of evidence.sourceConfigurations) {
    assert.equal(source.sourceFactsOnly, true);
    assert.equal(source.completeVehicleIdentity, null);
    assert.equal(source.manufacturerModelYear, null);
    assert.ok(row.sourceUrls.includes(source.page));
    assert.ok(row.sourceUrls.includes(source.linkedGuide));
  }
  assert.equal(evidence.pdfPixelsVerified, false);
});

test("market census addition does not admit detailed builds, stock or ranking candidates", () => {
  assert.equal(catalogue().length, 342);
  assert.equal(counts().families, 148);
  assert.equal(
    catalogue().filter((car) => /c3he/i.test(car.modelId + car.model)).length,
    0,
  );
  assert.equal(evidence.detailedFamilyDelta, 0);
  assert.equal(evidence.detailedVariantDelta, 0);
  assert.equal(evidence.newStockAdvertisedFamilyDelta, 0);
  assert.equal(evidence.physicalStockVerified, false);
  assert.equal(evidence.rankingsChanged, false);
});
