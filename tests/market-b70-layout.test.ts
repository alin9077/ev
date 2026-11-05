import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { catalogue } from "../src/lib/data";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-b70-layout-evidence-2026-10-11.json";
const row = market.records.find((r) => r.id === "byd-b70")!;
const previous = evidence.previousRecord;

test("published B70 body and capacity modes do not invent two trims or a completed build", () => {
  assert.deepEqual(row.trims, []);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.modelYear, null);
  const body = row.configurationEvidence!;
  assert.ok(
    !Array.isArray(body) && "chassis" in body && "capacityModes" in body,
  );
  assert.equal(body.chassis, "BYD B70");
  assert.equal(body.bodyMaker, "Gemilang");
  assert.deepEqual(
    body.capacityModes.map((mode) => [
      mode.advertisedPassengerSeats,
      mode.wheelchairPositionsDeclared,
    ]),
    [
      [18, 0],
      [16, 1],
    ],
  );
  assert.equal(body.selectedCapacityMode, null);
  assert.equal(body.formalModelYear, null);
  assert.equal(body.visibleTechnicalIssueDate, null);
  assert.equal(body.fullyClosedFactoryBuild, false);
  assert.equal(body.rankingEligible, false);
  assert.equal(body.detailedConfigurationCountContribution, 0);
  assert.match(body.capacityModeQualification, /optional/);
  assert.match(row.evidenceNote, /do not create two trims/);
  assert.match(JSON.stringify(row.limitations), /7,100|7100/);
  assert.match(JSON.stringify(row.limitations), /7,094|7094/);
});

test("B70 source identities remain linked and retain earlier evidence", () => {
  assert.deepEqual(evidence.previousRecord, previous);

  assert.ok(row.evidenceHistory);
  assert.deepEqual(row.evidenceHistory.slice(0, -1), previous.evidenceHistory);
  assert.deepEqual(row.sourceArtifacts.slice(0, -1), previous.sourceArtifacts);
  assert.deepEqual(
    row.sourceUrls.slice(0, previous.sourceUrls.length),
    previous.sourceUrls,
  );

  assert.deepEqual(
    evidence.sources.map((source) => source.id),
    evidence.sourceIds,
  );
  for (const source of evidence.sources)
    assert.ok(row.sourceUrls.includes(source.url));
});

test("B70 source-only reconciliation changes no detailed catalogue count or approval registers", () => {
  assert.equal(
    catalogue().filter((car) => car.brand === "BYD" && car.model === "B70")
      .length,
    0,
  );
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
  for (const name of [
    "approved-corrections",
    "approved-feature-corrections",
    "approved-availability-corrections",
  ])
    assert.deepEqual(
      JSON.parse(
        readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8"),
      ),
      [],
    );
});
