import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-seller-evidence-2026-10-11.json";
type Row = Record<string, unknown>;
const rows = market.records as unknown as Row[];
const h9e = rows.find((r) => r.id === "farizon-h9e")!;
const lightning = rows.find((r) => r.id === "ford-f-150-lightning")!;

test("H9E New advertisement remains a partial family match rather than verified exact technical stock", () => {
  assert.equal(h9e.stockStatus, "new_stock_listed");
  assert.equal(h9e.orderStatus, "listed_unconfirmed");
  assert.equal(
    h9e.availabilityCategory,
    "new_stock_advertised_orders_unconfirmed",
  );
  assert.equal(h9e.exactConfigurationStatus, "partial_or_unverified");
  const stock = (h9e.stockEvidence as Row[]).find(
    (r) => r.stockNumber === "39400",
  )!;
  assert.equal(stock.vin, "HGLH3ACR2TA710095");
  assert.equal(stock.condition, "New");
  assert.equal(stock.exactConfigurationMatch, false);
  assert.equal(stock.physicalAvailability, "unverified");
  assert.equal(stock.orderAcceptance, "unverified");
  assert.equal(stock.deliveryTiming, "unverified");
  for (const key of [
    "batteryDeclaredKwh",
    "chargingAcMaxKw",
    "finishedPayloadKg",
    "modelYear",
  ])
    assert.equal(stock[key], null);
  assert.equal(stock.technicalValuesTransferredFromBrochure, false);
});

test("seller body, mass, model-year and cached-advertisement discrepancies remain explicit", () => {
  const stock = (h9e.stockEvidence as Row[]).find(
    (r) => r.stockNumber === "39400",
  )!;
  assert.equal(stock.sellerHeightMm, 3300);
  assert.equal(stock.sellerTareWeightKg, 3305);
  assert.equal(stock.sellerStructuredModelYear, 2026);
  assert.equal(stock.sellerDescriptionModelYear, "MY25");
  assert.equal(stock.sellerBuildMonth, "2026-05");
  assert.equal(stock.sellerComplianceMonth, "2026-06");
  assert.match(String(stock.datePrecisionQualification), /not proven exact/);
  assert.equal(stock.sourceUpdatedAt, "2026-08-12T05:30:18.868Z");
  assert.equal(stock.sourceCacheAgeSeconds, 134198);
  const text = JSON.stringify(h9e);
  assert.match(text, /3,600|3600/);
  assert.match(text, /3,268|3268/);
  assert.match(text, /[Cc]ached/);
});

test("Performax evidence stays separately attributed with New condition and build identity held", () => {
  assert.equal(lightning.stockStatus, "unverified");
  assert.equal(lightning.orderStatus, "listed_unconfirmed");
  assert.deepEqual(lightning.trims, []);
  const last = (lightning.evidenceHistory as Row[]).at(-1)!;
  const offer = last.sellerAdvertisement as Row;
  assert.equal(offer.seller, "Performax International");
  assert.equal(offer.condition, null);
  assert.equal(offer.vin, null);
  assert.equal(offer.conversionIdentity, null);
  assert.equal(offer.yearAsAdvertised, 2024);
  assert.equal(offer.gradeAsAdvertised, "Pro");
  assert.equal(offer.odometerKmAsAdvertised, 150);
  assert.equal(offer.batteryKwhAsAdvertised, 98);
  assert.equal(offer.batteryBasis, null);
  assert.equal(offer.priceAUDAsAdvertised, 99990);
  assert.equal(offer.newStockVerified, false);
  assert.equal(offer.physicalStockVerified, false);
  assert.equal(offer.newVariantAdmission, false);
  assert.equal(offer.warrantyApplicableTerm, null);
  assert.match(JSON.stringify(last), /3 years|three.year/i);
  assert.match(JSON.stringify(lightning), /5.year|five.year/i);
  assert.match(JSON.stringify(lightning), /traction|auxiliary/);
});

test("detailed catalogue count and existing H9E technical configurations are not promoted or duplicated", () => {
  const cars = catalogue();

  assert.equal(cars.filter((c) => c.modelId.includes("h9e")).length, 4);
  assert.equal(cars.filter((c) => /lightning/i.test(c.model)).length, 0);
  for (const car of cars.filter((c) => c.modelId.includes("h9e"))) {
    assert.notEqual(car.availabilityEvidence?.stockStatus, "new_stock_listed");
    assert.ok(
      !car.availabilityEvidence?.sourceIds.includes("farizon-h9e-39400"),
    );
  }
});

test("seller advertisements do not promote confirmed stock or a complete vehicle", () => {
  for (const row of [h9e, lightning]) {
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, null);
  }
  assert.equal(evidence.detailedVariantDelta, 0);
  assert.equal(evidence.familyDelta, 0);
  assert.equal(evidence.physicalStockVerified, false);
  assert.equal(evidence.rankingsChanged, false);
});
