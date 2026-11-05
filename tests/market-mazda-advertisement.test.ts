import test from "node:test";
import assert from "node:assert/strict";
import evidence from "../data/market-mazda-cx6e-lead-evidence-2026-10-12.json";

test("CX-6e New advertisement preserves seller freshness and unsold/physical uncertainty", () => {
  const stock = evidence.specificNewAdvertisement;
  assert.equal(stock.exactAdvertisedGrade, "E35 Azami GR");
  assert.equal(stock.stockNumber, "11397703");
  assert.equal(stock.vin, "LVRHDCEK6TN551337");
  assert.equal(stock.conditionLabel, "New");
  assert.equal(stock.advertisedStockState, "in_stock");
  assert.equal(stock.reservedAdvertised, false);
  assert.equal(stock.preorderAdvertised, false);
  assert.equal(stock.soldDateInPublicData, null);
  assert.equal(stock.sellerRecordUpdatedAt, "2026-10-06T22:34:05.842Z");
  assert.equal(stock.physicalStockVerified, false);
  assert.equal(stock.independentUnsoldVerified, false);
  assert.equal(stock.buildMatchesBrochureVerified, false);
  assert.equal(stock.advertisedPriceAud, null);
  assert.equal(evidence.priceObservations[0].amountAud, 56990);
  assert.match(evidence.priceObservations[0].basis, /Driveaway from/);
});

test("limited root PDF visual check supersedes the blocker without resolving cargo or admitting technical data", () => {
  assert.equal(evidence.pdfVerification.visuallyVerified, true);
  assert.deepEqual(
    evidence.pdfVerification.visuallyVerifiedPrintedPages,
    [5, 7, 14],
  );
  assert.equal(
    evidence.pdfVerification.fullTechnicalCandidateVisuallyVerified,
    false,
  );

  assert.equal(evidence.sourceTechnicalEpoch, null);
  assert.equal(evidence.formalManufacturerModelYear, null);
  const cargo = evidence.heldConflicts.find(
    (conflict) => conflict.id === "CX6E95-CARGO",
  )!;
  assert.equal(cargo.normalizedValue, null);
  assert.deepEqual(
    cargo.observations.map((observation) => observation.value),
    [363, 468],
  );
  const brochureCargo = cargo.observations[0];
  const htmlCargo = cargo.observations[1];
  assert.ok(
    "basis" in brochureCargo && typeof brochureCargo.basis === "string",
  );
  assert.ok("basis" in htmlCargo);
  assert.match(brochureCargo.basis, /VDA/);
  assert.equal(htmlCargo.basis, "unspecified");
  assert.match(
    evidence.technicalCandidateDisposition,
    /not approved for import/,
  );
});
