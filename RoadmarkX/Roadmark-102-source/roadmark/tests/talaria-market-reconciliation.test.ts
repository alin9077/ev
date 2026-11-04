import { test } from "node:test";
import assert from "node:assert/strict";
import { marketBeforeCheckpoint80 } from "./helpers/checkpoint80-history";
import { catalogue } from "../src/lib/data";
const market = marketBeforeCheckpoint80;
const rows = market.records.filter(
  (row: { id: string }) => row.id === "talaria-sting-pro-l1e",
);
test("Talaria advertised retail order route does not imply verified new condition or physical stock", () => {
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(row.orderStatus, "accepting_orders");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.advertisedRetailOrderRoute, true);
  assert.equal(row.advertisedNewEligibility, false);
  assert.equal(row.conditionStatus, "not_explicitly_established");
  assert.equal(row.physicalStockVerified, false);
  assert.equal(row.factoryOrderAcceptanceVerified, false);
  assert.equal(row.completeVehicleCountEligible, false);
  assert.equal(row.rankingEligible, false);
  assert.match(row.evidenceNote, /SKU SQ0881834/);
  assert.match(row.evidenceNote, /NewCondition.*remain unestablished/);
});
test("Talaria remains market-only and retains the complete previous family record", () => {
  const row = rows[0];
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.equal(
    row.detailedCoverageAdmissionStatus,
    "provisional_reference_candidate_not_admitted",
  );
  assert.equal(
    catalogue().filter((car) => car.modelId === "talaria_sting_pro_l1e").length,
    0,
  );
  const history = row.evidenceHistory.at(-1);
  assert.ok(history && "priorRecord" in history && history.priorRecord);
  const previous = history.priorRecord;
  assert.equal(previous.id, row.id);
  assert.deepEqual(previous.trims, row.trims);
  assert.deepEqual(previous.evidenceHistory, row.evidenceHistory.slice(0, -1));
  assert.equal(row.modelYear, null);
  assert.equal(
    row.roadRegistrationScope,
    "cited_source_claim_not_per_vin_or_state_verified",
  );
  assert.equal(market.records.length, 239);
  assert.equal(market.counts.namedTrimConfigurationEntries, 391);
});
