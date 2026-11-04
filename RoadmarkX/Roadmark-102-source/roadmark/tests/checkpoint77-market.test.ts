import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint80 as market } from "./helpers/checkpoint80-history";
import evidence from "../data/market-seller-evidence-2026-10-11.json";
import {
  marketBeforeCheckpoint77,
  marketHash77,
} from "./helpers/checkpoint77-history";
import {
  carsBeforeCheckpoint84 as catalogue,
  countsBeforeCheckpoint84 as counts,
} from "./helpers/checkpoint84-runtime";
type Row = Record<string, unknown>;
const rows = market.records as unknown as Row[];
const h9e = rows.find((r) => r.id === "farizon-h9e")!;
const lightning = rows.find((r) => r.id === "ford-f-150-lightning")!;
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint77-market-fixture.json", import.meta.url),
    "utf8",
  ),
);

test("exact source76 market reconstructs while only two reviewed seller records change", () => {
  assert.equal(
    marketHash77(marketBeforeCheckpoint77),
    fixture.previousCanonicalSHA256,
  );
  assert.deepEqual(
    rows.map((r) => r.id),
    marketBeforeCheckpoint77.records.map((r) => r.id),
  );
  assert.equal(Object.keys(fixture.changes).length, 2);
  assert.equal(Object.keys(fixture.unchangedRecordHashes).length, 237);
  for (const row of rows)
    assert.equal(
      marketHash77(row),
      fixture.changes[String(row.id)]
        ? marketHash77(fixture.changes[String(row.id)].after)
        : fixture.unchangedRecordHashes[String(row.id)],
    );
});

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

test("only the qualified advertised-stock family counter increases and full-market closure remains false", () => {
  assert.deepEqual(market.counts, {
    ...marketBeforeCheckpoint77.counts,
    newStockListedModelRecords: 68,
  });
  assert.equal(
    market.records.filter((r) => r.stockStatus === "new_stock_listed").length,
    68,
  );
  assert.equal(market.records.length, 239);
  assert.equal(market.unverifiedLeads.length, 143);
  assert.equal(market.reconciledLeads.length, 20);
  assert.equal(market.checkedAt, marketBeforeCheckpoint77.checkedAt);
  assert.equal(market.complete, false);
  assert.equal(market.validation.completeMarketAudit, false);
  const expectedNotes = [...marketBeforeCheckpoint77.notes];
  for (const change of fixture.noteChanges) {
    assert.equal(expectedNotes[change.index], change.before);
    expectedNotes[change.index] = change.after;
  }
  assert.deepEqual(market.notes.slice(0, -1), expectedNotes);
  assert.deepEqual(
    market.sourceArtifacts.slice(0, -1),
    marketBeforeCheckpoint77.sourceArtifacts,
  );
});

test("both family amendments preserve no-ranking and complete-vehicle holds", () => {
  for (const row of [h9e, lightning]) {
    const old = marketBeforeCheckpoint77.records.find((r) => r.id === row.id)!;
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, null);
    assert.equal(row.modelYear, old.modelYear);
    assert.deepEqual(row.trims, old.trims);
    for (const key of [
      "catalogueCoverage",
      "trimCoverage",
      "vehicleClass",
      "recordScope",
    ])
      assert.deepEqual(row[key], (old as unknown as Row)[key]);
  }
  assert.equal(evidence.detailedVariantDelta, 0);
  assert.equal(evidence.familyDelta, 0);
  assert.equal(evidence.physicalStockVerified, false);
  assert.equal(evidence.rankingsChanged, false);
});

test("detailed catalogue count and existing H9E technical configurations are not promoted or duplicated", () => {
  const cars = catalogue();
  assert.equal(cars.length, 342);
  assert.equal(counts().families, 148);
  assert.equal(cars.filter((c) => c.modelId.includes("h9e")).length, 4);
  assert.equal(cars.filter((c) => /lightning/i.test(c.model)).length, 0);
  for (const car of cars.filter((c) => c.modelId.includes("h9e"))) {
    assert.notEqual(car.availabilityEvidence?.stockStatus, "new_stock_listed");
    assert.ok(
      !car.availabilityEvidence?.sourceIds.includes("farizon-h9e-39400"),
    );
  }
});

test("market source artifact bytes and complete before-records remain verified", () => {
  const raw = readFileSync(
    new URL("../data/market-seller-evidence-2026-10-11.json", import.meta.url),
  );
  const hash = createHash("sha256").update(raw).digest("hex");
  assert.equal(hash, fixture.evidenceArtifactSHA256);
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  for (const row of evidence.records)
    assert.deepEqual(row.previousRecord, fixture.changes[row.recordId].before);
});
