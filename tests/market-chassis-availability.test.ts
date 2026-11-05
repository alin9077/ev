import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};

test("Volvo articulated identity stays inside its existing nonsellable chassis family", () => {
  const row = market.records.find((x) => x.id === "volvo-bzl-electric")!;

  assert.deepEqual(row.trims, []);
  assert.equal(row.modelYear, null);
  assert.equal(row.recordScope, "factory_new_chassis");
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, false);

  const relation = (row.derivativeEvidence as Row[])[0];
  assert.equal(relation.derivativeCode, "BZLA");
  assert.equal(relation.parentFamilyId, row.id);
  assert.equal(relation.rankingEligible, false);
  assert.equal(relation.completeVehicleCountEligible, false);
  assert.match(String(relation.scope), /not a sellable/);
  assert.match(String(row.evidenceNote), /497 kWh total installed/);
  assert.match(
    String(row.evidenceNote),
    /actual passenger-service entry remain unverified/,
  );
});

test("only the Volvo duplicate identity and Buddy discovery trail move once to preserved history", () => {
  for (const [id] of [
    "volvo-buses-bzl-electric-articulated",
    "moto-lead-local-24",
  ].map((id) => [id])) {
    assert.equal(
      market.unverifiedLeads.some((x) => x.id === id),
      false,
    );
    const rows = market.reconciledLeads.filter((x) => x.id === id);
    assert.equal(rows.length, 1);
    const row = rows[0];

    assert.equal(row.historicalOnly, true);
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, false);
    assert.equal(row.countsAsAdditionalFamily, false);
    assert.equal(row.countsAsNamedConfiguration, false);
  }
  const buddy = market.reconciledLeads.find(
    (x) => x.id === "moto-lead-local-24",
  )!;
  assert.equal(
    buddy.resolutionStatus,
    "non_model_marketing_copy_discovery_reconciled",
  );
  assert.match(
    String(buddy.resolutionNote),
    /no V-10 public-path or road-legality determination/,
  );
});

test("Lotus bounded feeds never promote Demo stock or unverified grade and model-year epochs", () => {
  const row = market.unverifiedLeads.find(
    (x) => x.id === "lotus-eletre-emeya",
  )!;

  assert.deepEqual(row.trims, []);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.resolutionStatus, "unresolved");

  assert.match(
    String(row.evidenceNote),
    /does not establish nationwide absence/,
  );
  const limits = (row.limitations as string[]).join(" ");
  assert.match(limits, /four seats versus five/);
  assert.match(limits, /HTTP403/);
  assert.match(limits, /not refreshed/);
});

test("Stark Factory EX preserves contradictory availability observations without admitting a variant", () => {
  const row = market.unverifiedLeads.find(
    (x) => x.id === "moto-lead-enduro-06",
  )!;

  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.roadRegistrationStatus, "unresolved");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.parentFamilyId, "stark-varg-ex");

  const evidence = row.availabilityEvidence as Row;
  const hydrated = evidence.hydrationObservation as Row;
  const jsonld = evidence.productJsonLdObservation as Row;
  assert.equal(hydrated.inStock, false);
  assert.equal(hydrated.deliveryDate, "2027-02-20");
  assert.equal(hydrated.stockBikeDeliveryDate, "2027-02-20");
  assert.equal(
    (jsonld.offers as Row).availability,
    "https://schema.org/InStock",
  );
  assert.deepEqual(evidence.renderedSelectionObservation, {
    MX: "selected",
    EX: "unselected",
  });
  for (const k of [
    "selectedEXStateExercised",
    "conflictResolved",
    "physicalStockVerified",
    "factoryOrderAcceptanceVerified",
    "deliveryPromiseVerified",
  ])
    assert.equal(evidence[k], false);
});
