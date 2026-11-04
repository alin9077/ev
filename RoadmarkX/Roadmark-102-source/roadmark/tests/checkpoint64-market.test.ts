import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint71 as inventory } from "./helpers/checkpoint71-history";
import fixture from "../qa/checkpoint64-market-fixture.json";
const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([key, part]) => [key, canonical(part)]),
        )
      : value;
const hash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
const market = inventory as unknown as {
  records: Record<string, unknown>[];
  unverifiedLeads: Record<string, unknown>[];
  reconciledLeads: Record<string, unknown>[];
  counts: Record<string, unknown>;
};
const object = (value: unknown) => value as Record<string, unknown>;

test("two commercial market records retain the full independently reviewed evidence and holds", () => {
  for (const [id, expected] of Object.entries(fixture.marketRecords)) {
    const row = market.records.find((row) => row.id === id)!;
    assert.equal(hash(row), expected);
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
  assert.equal(hash(row), fixture.xpengHistorySHA256);
  assert.equal(row.historicalOnly, true);
  assert.equal(row.countsAsAdditionalFamily, false);
  assert.equal(row.countsAsNamedConfiguration, false);
  assert.equal((row.catalogueVariantIds as string[]).length, 3);
  assert.equal(
    hash(row.originalRecord),
    fixture.originalLeadHashes["xpeng-new-g6"],
  );
});

test("BCI and Lexus amendments keep exact unresolved scope and complete originals", () => {
  for (const [id, expected] of Object.entries(fixture.amendedLeads)) {
    const row = market.unverifiedLeads.find((row) => row.id === id)!;
    assert.equal(hash(row), expected);
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

test("all149 original leads and all14 previous historical rows remain recoverable", () => {
  const contained = new Set<string>();
  const walk = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    contained.add(hash(value));
    for (const child of Object.values(value)) walk(child);
  };
  walk(market.unverifiedLeads);
  walk(market.reconciledLeads);
  for (const [id, digest] of Object.entries(fixture.originalLeadHashes))
    assert.ok(contained.has(digest), id);
  assert.deepEqual(
    market.reconciledLeads.slice(0, 14).map(hash),
    fixture.priorHistoryHashes,
  );
  assert.equal(market.unverifiedLeads.length, 145);
  assert.equal(market.reconciledLeads.length, 18);
  assert.equal(market.records.length, 237);
  assert.equal(
    market.records.reduce(
      (sum, row) => sum + (row.trims as string[]).length,
      0,
    ),
    388,
  );
});
