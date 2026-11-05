import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};

test("three Maserati family audits distinguish named offerings, one New ad and unknown exact builds", () => {
  for (const [id] of [
    "maserati-grecale-folgore",
    "maserati-granturismo-folgore",
    "maserati-grancabrio-folgore",
  ].map((id) => [id])) {
    const row = market.records.find((x) => x.id === id)!;

    assert.deepEqual(row.trims, ["Folgore"]);
    assert.equal(row.modelYear, null);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, false);
    assert.equal(row.physicalStockVerified, false);
    assert.equal(row.factoryBuildSpecificationVerified, false);
    assert.equal(row.factoryOrderAcceptanceVerified, false);
    assert.equal(row.catalogueCoverage, "market_audit_only");
    assert.equal(
      row.stockStatus,
      id === "maserati-granturismo-folgore" ? "new_stock_listed" : "unverified",
    );
  }
  const granturismo = market.records.find(
    (x) => x.id === "maserati-granturismo-folgore",
  )!;
  assert.match(String(granturismo.evidenceNote), /151062/);
  assert.match(String(granturismo.evidenceNote), /ZAMBMVE17SX457650/);
  assert.match(String(granturismo.evidenceNote), /unit only/);
});

test("Maserati umbrella is reconciled once and its entire original remains historical", () => {
  const id = "maserati-grecale-folgore-granturismo-folgore-grancabrio-folgore";
  assert.equal(
    market.unverifiedLeads.some((x) => x.id === id),
    false,
  );
  const rows = market.reconciledLeads.filter((x) => x.id === id);
  assert.equal(rows.length, 1);
  const row = rows[0];

  assert.equal(row.historicalOnly, true);
  assert.equal(row.countsAsAdditionalFamily, false);
  assert.equal(row.countsAsNamedConfiguration, false);

  assert.equal((row.relatedRecordIds as string[]).length, 3);
});

test("Fiat and CPX preserve unresolved identities and supply conditions", () => {
  for (const [id] of ["fiat-500e", "moto-lead-scooter-02"].map((id) => [id])) {
    const row = market.unverifiedLeads.find((x) => x.id === id)!;

    assert.equal(row.rankingEligible, false);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.stockStatus, "unverified");
  }
  const fiat = market.unverifiedLeads.find((x) => x.id === "fiat-500e")!;
  assert.deepEqual(fiat.trims, []);
  assert.match(
    String(fiat.evidenceNote) + " " + (fiat.limitations as string[]).join(" "),
    /1417F/,
  );
  assert.match(
    String(fiat.evidenceNote) + " " + (fiat.limitations as string[]).join(" "),
    /ZFAEFA266RX186330/,
  );
  const cpx = market.unverifiedLeads.find(
    (x) => x.id === "moto-lead-scooter-02",
  )!;
  assert.equal(cpx.modelYear, null);
  assert.deepEqual(cpx.trims, [
    "Single Battery",
    "Dual Battery (historical AU offer)",
  ]);
  assert.match(
    String(cpx.evidenceNote) + " " + (cpx.limitations as string[]).join(" "),
    /LYSCPA417P1000059/,
  );
  assert.ok(
    (cpx.sourceArtifacts as string[]).includes(
      "super-soco-cpx-au-offers-2026-10-11/raw/wayne-stock-detail.json",
    ),
  );
});
