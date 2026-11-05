import test from "node:test";
import assert from "node:assert/strict";
import { catalogue } from "../src/lib/data";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-deepway-star-lead-evidence-2026-10-12.json";
const lead = market.unverifiedLeads.find((r) => r.id === "deepway-star")!;

test("Deepway remains one unresolved family with no exact trim, stock, authority or ranking promotion", () => {
  assert.equal(lead.id, "deepway-star");
  assert.equal(
    market.unverifiedLeads.filter((row) => row.id === lead.id).length,
    1,
  );
  assert.ok(!market.records.some((row) => row.id === lead.id));
  assert.deepEqual(lead.trims, []);
  assert.deepEqual(lead.modelAliases, []);
  assert.equal(lead.orderStatus, "listed_unconfirmed");
  assert.equal(lead.stockStatus, "unverified");
  assert.equal(lead.rankingEligible, false);
  assert.equal(lead.roadRegistrationScope, "unverified");
  assert.equal(lead.exactConfigurationStatus, "partial_or_unverified");
  assert.equal(lead.recordScope, "unverified_lead");
  assert.equal(lead.resolutionStatus, "unresolved");
  assert.equal(lead.checkedAt, "2026-10-12");
  assert.ok(lead.limitations);
  assert.match(lead.limitations.join(" "), /authority is self-described/);
  assert.match(lead.limitations.join(" "), /No numerical specification/);
  assert.ok(Object.values(evidence.holds).every((value) => value === false));
});

test("evidence distinguishes direct dealer text from indexed404 articles and preserves date scope", () => {
  assert.equal(evidence.sources.length, 3);
  const direct = evidence.sources[0];
  assert.equal(direct.retrieval, "direct_web_open_success");
  assert.equal(direct.httpStatus, null);
  assert.equal(direct.authorityIndependentlyVerified, false);
  assert.equal(direct.capture.originHTMLRetained, false);
  for (const source of evidence.sources.slice(1)) {
    assert.equal(
      source.retrieval,
      "search_index_text_available_direct_web_open_404",
    );
    assert.equal(source.toolReportedHTTPStatus, 404);
  }
  assert.equal(evidence.applicationScope.wholeMarketReverified, false);
  assert.equal(
    evidence.applicationScope.exactDetailedConfigurationProposalApproved,
    false,
  );
  assert.equal(evidence.proposedCountEffect.activeLeadGroups, 1);
  assert.equal(evidence.proposedCountEffect.detailedConfigurations, 0);
  assert.equal(evidence.proposedCountEffect.catalogueSourceRecords, 0);
  assert.equal(evidence.proposedCountEffect.verifiedAvailableVehicles, 0);
  assert.ok(
    evidence.sources.every(
      (source) => source.capture.rawCaptureIncludedInThisSidecar === false,
    ),
  );
  assert.ok(
    market.sourceArtifacts.some(
      (artifact) =>
        artifact.path === "market-deepway-star-lead-evidence-2026-10-12.json",
    ),
  );
});

test("Deepway remains outside the detailed catalogue", () => {
  const cars = catalogue();

  assert.ok(!cars.some((car) => /deepway/i.test(car.brand + " " + car.model)));
});
