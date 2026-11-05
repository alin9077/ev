import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import market from "../data/market-inventory-2026-10-10.json";
import evidence from "../data/market-skywell-ecrew-evidence-2026-10-11.json";
const row = market.records.find((r) => r.id === "skywell-ec11-e-crew")!;
const cargo = market.records.find((r) => r.id === "skywell-ec11-e-cargo")!;
const old = evidence.previousECargoRecord;

test("E-Crew fills one bus audit gap without duplicate lead or canonical-family admission", () => {
  assert.ok(!Object.hasOwn(row, "familyId"));
  assert.equal(evidence.countEffect.detailedCanonicalFamilies, 0);
  assert.equal(evidence.countEffect.detailedConfigurations, 0);
  assert.equal(evidence.countEffect.verifiedAvailableVehicles, 0);
  assert.equal(market.complete, false);
});

test("E-Crew preserves unverified exact-build, order, stock, approval and model-year scope", () => {
  assert.deepEqual(row.trims, []);
  assert.equal(row.vehicleClass, "bus");
  assert.equal(row.modelYear, null);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, null);
  assert.match(row.evidenceNote, /12 including the driver/);
  assert.match(row.evidenceNote, /EOFY-2024/);
  assert.match(
    row.limitations.join(" "),
    /not evidence of E-Crew child-restraint/,
  );
  assert.equal(evidence.holds.acceptedOrder, null);
  assert.equal(evidence.holds.approvalIdentity, null);
  assert.equal(evidence.exactDetailedConfigurationProposalApproved, false);
});

test("E-Crew and E-Cargo retain their distinct evidence records", () => {
  assert.deepEqual(evidence.proposedECrewRecord, row);
  assert.deepEqual(evidence.amendedECargoRecord, cargo);
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

test("E-Cargo retains its original observations alongside the E-Crew relationship", () => {
  const latest = cargo.evidenceHistory!.at(-1)!;
  assert.ok("previousRecord" in latest);
  assert.deepEqual(latest.previousRecord, old);
  assert.deepEqual(
    cargo.evidenceHistory!.slice(0, old.evidenceHistory!.length),
    old.evidenceHistory,
  );
  assert.equal(cargo.checkedAt, old.checkedAt);
  assert.equal(cargo.orderStatus, old.orderStatus);
  assert.equal(cargo.stockStatus, old.stockStatus);
});
