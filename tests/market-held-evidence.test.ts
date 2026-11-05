import test from "node:test";
import assert from "node:assert/strict";
import market from "../data/market-inventory-2026-10-10.json";

test("Held evidence keeps BMW local/global timing and announced variants separate from held grades", () => {
  const i3 = market.records.find((row) => row.id === "bmw-i3")!;
  const ix4 = market.records.find((row) => row.id === "bmw-ix4")!;
  assert.match(
    String(i3.evidenceNote),
    /electric-range FAQ says arrival in 2027/,
  );
  assert.match(
    String(ix4.evidenceNote),
    /global, not certified Australian timing/,
  );
  assert.match(JSON.stringify(i3.limitations), /not a formal model year/);
  assert.match(
    JSON.stringify(i3.limitations),
    /M60 order timing applies only to M60, not 50 xDrive/,
  );
  assert.match(JSON.stringify(ix4.limitations), /no Australian launch month/);
  assert.match(
    JSON.stringify(ix4.limitations),
    /Historical sales code 22HU has not been reverified/,
  );
});

test("Held evidence keeps commercial interest, layout, approval and measurement evidence bounded", () => {
  for (const id of ["dfac-captain-45e", "dfac-captain-85e"]) {
    const row = market.unverifiedLeads.find((entry) => entry.id === id)!;
    assert.match(String(row.evidenceNote), /general enquiry form/);
    assert.match(
      String(row.evidenceNote),
      /diesel Captain 45 campaign is not evidence/,
    );
    assert.equal(row.roadRegistrationScope, "unverified");
    assert.equal(row.exactConfigurationStatus, "partial_or_unverified");
  }
  const pioneer = market.unverifiedLeads.find(
    (row) => row.id === "pioneer-ev-dfsk-ec35",
  )!;
  assert.equal(pioneer.brand, "Pioneer EV / DFSK");
  assert.match(
    String(pioneer.evidenceNote),
    /DFSK badge association and road approval remain unverified/,
  );
  assert.match(
    JSON.stringify(pioneer.limitations),
    /not verified independently orderable Australian grades/,
  );
  assert.match(
    JSON.stringify(pioneer.limitations),
    /WLTP heading conflicts with an NEDC-labelled range/,
  );
  assert.match(
    JSON.stringify(pioneer.limitations),
    /approval wording concerns chargers/,
  );
  assert.match(
    JSON.stringify(pioneer.limitations),
    /separate from later HTTP 406/,
  );
});

test("held BMW, Mercedes, DFAC and DFSK entries keep their individual availability boundaries", () => {
  const ids = [
    "bmw-i3",
    "bmw-ix4",
    "dfac-captain-45e",
    "dfac-captain-85e",
    "pioneer-ev-dfsk-ec35",
    "mercedes-benz-eqb",
    "mercedes-benz-eqe-sedan",
    "mercedes-benz-eqe-suv",
    "mercedes-benz-eqs-suv",
    "mercedes-benz-maybach-eqs",
  ];
  for (const id of ids) {
    const record = market.records.find((row) => row.id === id);
    const row = record ?? market.unverifiedLeads.find((row) => row.id === id);
    assert.ok(row, id);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    if (record) {
      assert.deepEqual(record.trims, ["50 xDrive"]);
      assert.equal(record.trimCoverage, "partial");
      assert.equal(
        record.availabilityCategory,
        "current_listing_order_stock_unconfirmed",
      );
      assert.equal(record.catalogueCoverage, "market_audit_only");
      assert.equal(record.modelYear, null);
      assert.equal(record.completeVehicleCountEligible, null);
    } else {
      assert.deepEqual(row.trims, []);
      assert.equal(row.resolutionStatus, "unresolved");
    }
  }
});
