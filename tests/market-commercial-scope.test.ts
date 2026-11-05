import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};
const object = (value: unknown) => value as Row;

test("two commercial market records retain the full independently reviewed evidence and holds", () => {
  for (const [id] of ["king-long-evolution-low-floor", "sany-light-truck"].map(
    (id) => [id],
  )) {
    const row = market.records.find((row) => row.id === id)!;

    assert.deepEqual(row.trims, []);
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    assert.equal(row.physicalStockVerified, false);
    assert.equal(row.physicalStockQuantity, null);
    assert.equal(row.completeVehicleCountEligible, null);
    assert.equal(row.readyForDetailedCompleteBuildPromotion, false);
    assert.equal(row.independentAustralianRoadApprovalVerified, false);
  }
  const king = market.records.find(
    (row) => row.id === "king-long-evolution-low-floor",
  )!;
  assert.equal(king.orderStatus, "listed_unconfirmed");
  assert.equal(
    object(king.procurementEvidence).currentAustralianPlatformPathsEvidenced,
    true,
  );
  const sany = market.records.find((row) => row.id === "sany-light-truck")!;
  assert.equal(sany.orderStatus, "accepting_order_requests_advertised");
  const adverts = object(sany.advertisingEvidence).adverts as Record<
    string,
    unknown
  >[];
  const advert = adverts.find((row) => row.advertId === "1261976")!;
  assert.equal(object(object(advert.fields)["No. in Stock"]).value, "4");
  assert.equal(advert.advertIdIsNotVINOrChassisCode, true);
  assert.match(
    String(advert.duplicateRisk),
    /Do not add their stock quantities/,
  );
});

test("XPENG duplicate scope moves to history without inventing another grade or vehicle", () => {
  assert.equal(
    market.unverifiedLeads.some((row) => row.id === "xpeng-new-g6"),
    false,
  );
  const row = market.reconciledLeads.find((row) => row.id === "xpeng-new-g6")!;

  assert.equal(row.historicalOnly, true);
  assert.equal(row.countsAsAdditionalFamily, false);
  assert.equal(row.countsAsNamedConfiguration, false);
  assert.equal((row.catalogueVariantIds as string[]).length, 3);
});

test("BCI and Lexus amendments keep exact unresolved scope and complete originals", () => {
  for (const [id] of [
    "bci-fleetmaster-ev",
    "lexus-rz-600e-f-sport-performance",
  ].map((id) => [id])) {
    const row = market.unverifiedLeads.find((row) => row.id === id)!;

    assert.equal(row.resolutionStatus, "unresolved");
    assert.equal(row.rankingEligible, false);
    assert.deepEqual(row.trims, []);
  }
  const bci = market.unverifiedLeads.find(
    (row) => row.id === "bci-fleetmaster-ev",
  )!;
  const derivative = object(bci.unresolvedDerivativeScope);
  assert.deepEqual(derivative.catalogueVariantIds, []);
  assert.equal(derivative.countAsAdditionalFamily, false);
  assert.match(String(bci.evidenceNote), /53 reclining/);
  assert.match(String(bci.evidenceNote), /57-fixed-seat/);
  assert.match((bci.limitations as string[]).join(" "), /422 kW/);
  const lexus = market.unverifiedLeads.find(
    (row) => row.id === "lexus-rz-600e-f-sport-performance",
  )!;
  assert.equal(lexus.orderStatus, "not_current");
  assert.equal(lexus.stockStatus, "unverified");
});
