import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-c3he-evidence-2026-10-11.json";
const row = market.records.find((r) => r.id === "sitrak-c3he")!;

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

test("C3HE source configurations remain distinct and linked", () => {
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
