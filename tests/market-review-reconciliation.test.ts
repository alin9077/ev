import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import fixture from "../qa/market59-reconciliation-fixture.json";

type MarketRow = {
  id: string;
  trims: string[];
  orderStatus: string;
  stockStatus: string;
  modelYear: number | null;
  rankingEligible: boolean;
  completeVehicleCountEligible: boolean | null;
  evidenceNote: string;
  roadRegistrationStatus?: string;
  closedExactFactoryBuildCount?: number;
  boundedSourceReview?: {
    newDetailedCatalogueBuildsProposed: number;
    newMarketFamiliesProposed: number;
    newTrimEntriesProposed: number;
    completeMarketEligibilityEstablished: boolean;
    rankingEligibilityPromoted: boolean;
  };
  evidenceHistory: { previousRecord?: Record<string, unknown> }[];
};
const market = JSON.parse(
  fs.readFileSync("data/market-inventory-2026-10-10.json", "utf8"),
) as {
  records: MarketRow[];
  unverifiedLeads: { id: string }[];
  reconciledLeads: {
    id: string;
    originalRecord: unknown;
    countsAsAdditionalFamily?: boolean;
    countsAsNamedConfiguration?: boolean;
  }[];
  counts: {
    consolidatedModelAuditRecords: number;
    namedTrimConfigurationEntries: number;
    unresolvedLeadGroups: number;
    reconciledLeadGroups: number;
  };
};
function sorted(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, item]) => [key, sorted(item)]),
    );
  return value;
}
const hash = (value: unknown) =>
  crypto
    .createHash("sha256")
    .update(JSON.stringify(sorted(value)))
    .digest("hex");

test("bounded market review retains both exact reviewed rows and their complete history", () => {
  for (const [id, expected] of Object.entries(fixture.reviewedRecordHashes)) {
    const rows = market.records.filter((row) => row.id === id);
    assert.equal(rows.length, 1);
    assert.equal(hash(rows[0]), expected);
  }
});

test("platform and package research adds no invented builds or availability eligibility", () => {
  for (const id of ["windrose-e700", "ftn-motion-streetdog-xr"]) {
    const row = market.records.find((item) => item.id === id)!;
    assert.equal(row.closedExactFactoryBuildCount, 0);
    assert.equal(row.modelYear, null);
    assert.equal(row.orderStatus, "accepting_orders");
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, null);
    assert.equal(
      row.boundedSourceReview?.newDetailedCatalogueBuildsProposed,
      0,
    );
    assert.equal(row.boundedSourceReview?.newMarketFamiliesProposed, 0);
    assert.equal(row.boundedSourceReview?.newTrimEntriesProposed, 0);
    assert.equal(
      row.boundedSourceReview?.completeMarketEligibilityEstablished,
      false,
    );
    assert.equal(row.boundedSourceReview?.rankingEligibilityPromoted, false);
  }
  const ftn = market.records.find(
    (row) => row.id === "ftn-motion-streetdog-xr",
  )!;
  assert.equal(
    ftn.roadRegistrationStatus,
    "supplier_terms_conflict_registration_unverified",
  );
  assert.match(ftn.evidenceNote, /self-registration.*conflicts/);
  assert.match(ftn.evidenceNote, /not a current build promise/);
  assert.equal(ftn.evidenceHistory.length, 3);
});

test("B03X duplicate lead is archived intact without rewriting future-delivery evidence", () => {
  assert.equal(
    market.unverifiedLeads.filter((row) => row.id === "leapmotor-b03x").length,
    0,
  );
  const history = market.reconciledLeads.filter(
    (row) => row.id === "leapmotor-b03x",
  );
  assert.equal(history.length, 1);
  assert.equal(hash(history[0]), fixture.reconciliationArchiveHash);
  assert.equal(hash(history[0].originalRecord), fixture.originalLeadHash);
  assert.equal(history[0].countsAsAdditionalFamily, false);
  assert.equal(history[0].countsAsNamedConfiguration, false);
  const row = market.records.find((item) => item.id === "leapmotor-b03x")!;
  assert.equal(hash(row), fixture.b03xEstablishedHash);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.match(row.evidenceNote, /November 2026/);
});

test("market counts reflect live and historical collections independently", () => {
  assert.equal(
    market.counts.consolidatedModelAuditRecords,
    market.records.length,
  );
  assert.equal(
    market.counts.namedTrimConfigurationEntries,
    market.records.reduce((sum, row) => sum + row.trims.length, 0),
  );
  assert.equal(
    market.counts.unresolvedLeadGroups,
    market.unverifiedLeads.length,
  );
  assert.equal(
    market.counts.reconciledLeadGroups,
    market.reconciledLeads.length,
  );
});
