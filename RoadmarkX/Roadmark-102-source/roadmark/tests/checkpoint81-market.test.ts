import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint83 as market } from "./helpers/checkpoint83-history";
import evidence from "../data/market-b70-layout-evidence-2026-10-11.json";
import {
  carsBeforeCheckpoint84 as catalogue,
  countsBeforeCheckpoint84 as counts,
} from "./helpers/checkpoint84-runtime";
import {
  marketBeforeCheckpoint81,
  marketHash81,
} from "./helpers/checkpoint81-history";
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint81-market-fixture.json", import.meta.url),
    "utf8",
  ),
);
const row = market.records.find((record) => record.id === "byd-b70")!;
const previous = marketBeforeCheckpoint81.records.find(
  (record) => record.id === "byd-b70",
)!;

test("B70 amendment changes only seven reviewed fields and preserves all other239 market records", () => {
  assert.equal(
    marketHash81(marketBeforeCheckpoint81),
    fixture.previousCanonicalSHA256,
  );
  assert.equal(marketHash81(market), fixture.approvedCanonicalSHA256);
  assert.deepEqual(
    market.records.filter((record) => record.id !== row.id),
    marketBeforeCheckpoint81.records.filter((record) => record.id !== row.id),
  );
  assert.deepEqual(
    Object.keys(row)
      .filter(
        (key) =>
          marketHash81((row as Record<string, unknown>)[key] ?? null) !==
          marketHash81((previous as Record<string, unknown>)[key] ?? null),
      )
      .sort(),
    [
      "checkedAt",
      "configurationEvidence",
      "evidenceHistory",
      "evidenceNote",
      "limitations",
      "sourceArtifacts",
      "sourceUrls",
    ].sort(),
  );
  assert.deepEqual(market.counts, marketBeforeCheckpoint81.counts);
  assert.equal(market.records.length, 240);
  assert.equal(market.counts.namedTrimConfigurationEntries, 393);
  assert.equal(market.complete, false);
  assert.equal(market.validation.completeMarketAudit, false);
});

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

test("B70 complete old record and byte-verified source artifact remain recoverable", () => {
  assert.deepEqual(evidence.previousRecord, previous);
  assert.equal(
    marketHash81(evidence.previousRecord),
    evidence.previousRecordCanonicalSHA256,
  );
  assert.ok(row.evidenceHistory);
  assert.deepEqual(row.evidenceHistory.slice(0, -1), previous.evidenceHistory);
  assert.deepEqual(row.sourceArtifacts.slice(0, -1), previous.sourceArtifacts);
  assert.deepEqual(
    row.sourceUrls.slice(0, previous.sourceUrls.length),
    previous.sourceUrls,
  );
  const raw = readFileSync(
    new URL(
      "../data/market-b70-layout-evidence-2026-10-11.json",
      import.meta.url,
    ),
  );
  const hash = createHash("sha256").update(raw).digest("hex");
  assert.equal(hash, fixture.evidenceArtifactSHA256);
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  assert.deepEqual(
    evidence.sources.map((source) => source.id),
    evidence.sourceIds,
  );
  for (const source of evidence.sources)
    assert.ok(row.sourceUrls.includes(source.url));
});

test("B70 source-only reconciliation changes no detailed catalogue count or approval registers", () => {
  assert.equal(catalogue().length, 342);
  assert.equal(counts().families, 148);
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
