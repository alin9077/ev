import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { marketBeforeCheckpoint91 as market } from "./helpers/checkpoint91-market-history";
import evidence from "../data/market-evito-tourer-seating-evidence-2026-10-11.json";
import { marketBeforeCheckpoint89 as before, marketHash89 } from "./helpers/checkpoint89-history";
const row = market.records.find(record => record.id === "mercedes-benz-evito-tourer")!;
const old = before.records.find(record => record.id === row.id)!;

test("eVito seating evidence changes six fields without adding a row, trim, stock unit or rank", () => {
  const changed = Object.keys(row).filter(key => JSON.stringify((row as Record<string, unknown>)[key]) !== JSON.stringify((old as Record<string, unknown>)[key]));
  assert.deepEqual(changed.sort(), ["sourceUrls", "checkedAt", "evidenceNote", "limitations", "sourceArtifacts", "evidenceHistory"].sort());
  assert.equal(market.records.length, 241);
  assert.deepEqual(market.counts, before.counts);
  assert.deepEqual(market.records.filter(record => record.id !== row.id), before.records.filter(record => record.id !== row.id));
  assert.deepEqual(market.unverifiedLeads, before.unverifiedLeads);
  assert.deepEqual(market.reconciledLeads, before.reconciledLeads);
  assert.deepEqual(market.peripheralRecords, before.peripheralRecords);
  assert.equal(market.complete, false);
  assert.ok(Object.values(evidence.countEffect).every(value => value === 0));
});

test("eight including driver stays bound to one returned AU configuration and an uninterpreted epoch", () => {
  const finding = evidence.evidence.boundedSeatingFinding;
  assert.equal(finding.seatsIncludingDriver, 8);
  assert.equal(finding.rawSeats, 8);
  assert.equal(finding.rawSeatsMax, 8);
  assert.deepEqual(finding.layout, [2, 3, 3]);
  assert.deepEqual(finding.standardSeatCodes, ["SB1", "SB2", "US4", "US5"]);
  assert.equal(evidence.evidence.identity.nationalType, "44770323-AEF");
  assert.match(finding.configurationVehicleId, /^en_AU__44770323_AEF__/);
  assert.equal(evidence.integrationReviewAdaptations.configurationDateRaw, "2027-01-11");
  assert.equal(evidence.integrationReviewAdaptations.configurationDateSemantics, "unresolved");
  assert.equal(evidence.integrationReviewAdaptations.formalCurrentModelYear, null);
  assert.equal(evidence.integrationReviewAdaptations.technicalValuesPromoted, false);
  assert.match(row.evidenceNote, /eight seats including the driver \(2\+3\+3\)/);
  assert.match(row.evidenceNote, /2027-01-11 with unresolved date semantics/);
  assert.equal(row.modelYear, null);
  assert.deepEqual(row.trims, ["129 MWB FWD"]);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.catalogueCoverage, "market_audit_only");
  assert.equal(row.trimCoverage, "verified_named_configurations_incomplete_matrix");
  assert.equal(row.completeVehicleCountEligible, null);
  assert.equal(row.rankingEligible, false);
  assert.match(row.limitations.join(" "), /93 kWh/);
  assert.match(row.limitations.join(" "), /90 kWh/);
  assert.match(row.limitations.join(" "), /80 kW DC/);
  assert.match(row.limitations.join(" "), /110 kW/);
  assert.match(row.limitations.join(" "), /430 km uses NEDC/);
  assert.match(row.limitations.join(" "), /diesel Vito/);
});

test("eVito history preserves original observation and all contradictory manufacturer source scope", () => {
  assert.equal(old.checkedAt, "2026-10-10");
  assert.equal(row.checkedAt, "2026-10-11");
  assert.deepEqual(evidence.previousRecord, old);
  assert.equal(marketHash89(old), "59964ed765b699b8a164da9ee6ec01091fcaa0ddd8466d530296687f2d147ace");
  assert.equal(evidence.previousRecordCanonicalSHA256, marketHash89(old));
  const legacyHistory = old.evidenceHistory as Record<string, unknown>[];
  assert.deepEqual(row.evidenceHistory!.slice(0, legacyHistory.length), legacyHistory.map(entry => ({ ...entry, checkedAt: entry.checkedAt ?? old.checkedAt })));
  const latest = row.evidenceHistory!.at(-1)!;
  assert.ok("previousRecord" in latest);
  assert.deepEqual(latest.previousRecord, old);
  assert.ok(old.sourceUrls.every(url => row.sourceUrls.includes(url)));
  assert.ok(row.sourceUrls.includes("https://www.mercedes-benz.com.au/vans/electric-vans.html"));
  assert.match(row.limitations[0], /overview and electric-vans pages retain incompatible/);
  assert.deepEqual(evidence.amendedRecord, row);
});

test("eVito source sidecar binds the reviewed raw packet without changing correction registers", () => {
  const bytes = readFileSync(new URL("../data/market-evito-tourer-seating-evidence-2026-10-11.json", import.meta.url));
  const hash = createHash("sha256").update(bytes).digest("hex");
  assert.equal(hash, "1b018cbb59e5fd5337d9acb3ea5892bfe1f0d30c20b827ca390d04b7013bb06e");
  assert.equal(market.sourceArtifacts.at(-1)!.sha256, hash);
  assert.equal(evidence.sourcePacket.sealSHA256, "ea52ed5a82d2eb977ea2af61c1a40252a24e09f3011575eae750f0c4d1728feb");
  assert.equal(evidence.sourcePacket.independentReviewSHA256, "ad31747e7ca3932e77b83dee8804c0322d76e6eb83d15c70f00120bdfaf2a1c6");
  assert.equal(evidence.sources.length, 13);
  assert.ok(evidence.sources.every(source => source.credentialsUsed === false && source.status === 200 && !Object.hasOwn(source, "responseHeaders")));
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
  assert.equal(evidence.holds.acceptedOrder, null);
  assert.equal(evidence.holds.newStockUnit, null);
  for (const name of ["approved-corrections", "approved-feature-corrections", "approved-availability-corrections"]) assert.deepEqual(JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), "utf8")), []);
});
