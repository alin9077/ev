import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint71 as inventory, verifiedPre71DataHash } from "./helpers/checkpoint71-history";
import fixture from "../qa/checkpoint67-market-fixture.json";
const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, v]) => [k, canonical(v)]),
        )
      : value;
const hash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
  counts: Record<string, unknown>;
};
const deepHashes = (value: unknown) => {
  const found = new Set<string>();
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    found.add(hash(v));
    for (const x of Object.values(v)) walk(x);
  };
  walk(value);
  return found;
};
test("Volvo articulated identity stays inside its existing nonsellable chassis family", () => {
  const row = market.records.find((x) => x.id === "volvo-bzl-electric")!;
  assert.equal(hash(row), fixture.amendedRecordHashes["volvo-bzl-electric"]);
  assert.deepEqual(row.trims, []);
  assert.equal(row.modelYear, null);
  assert.equal(row.recordScope, "factory_new_chassis");
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.completeVehicleCountEligible, false);
  assert.ok(
    deepHashes(row.priorEvidenceSnapshots).has(
      fixture.originalRecordHashes["volvo-bzl-electric"],
    ),
  );
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
  for (const [id, digest] of Object.entries(fixture.newHistoryHashes)) {
    assert.equal(
      market.unverifiedLeads.some((x) => x.id === id),
      false,
    );
    const rows = market.reconciledLeads.filter((x) => x.id === id);
    assert.equal(rows.length, 1);
    const row = rows[0];
    assert.equal(hash(row), digest);
    assert.equal(row.historicalOnly, true);
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, false);
    assert.equal(row.countsAsAdditionalFamily, false);
    assert.equal(row.countsAsNamedConfiguration, false);
    assert.equal(
      hash(row.originalRecord),
      fixture.originalLeadHashes[id as keyof typeof fixture.originalLeadHashes],
    );
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
  assert.equal(hash(row), fixture.amendedLeadHashes["lotus-eletre-emeya"]);
  assert.deepEqual(row.trims, []);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.resolutionStatus, "unresolved");
  assert.ok(
    deepHashes(row.priorEvidenceSnapshots).has(
      fixture.originalLeadHashes["lotus-eletre-emeya"],
    ),
  );
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
  assert.equal(hash(row), fixture.amendedLeadHashes["moto-lead-enduro-06"]);
  assert.equal(row.orderStatus, "listed_unconfirmed");
  assert.equal(row.stockStatus, "unverified");
  assert.equal(row.roadRegistrationStatus, "unresolved");
  assert.equal(row.rankingEligible, false);
  assert.equal(row.parentFamilyId, "stark-varg-ex");
  assert.ok(
    deepHashes(row.evidenceHistory).has(
      fixture.originalLeadHashes["moto-lead-enduro-06"],
    ),
  );
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
test("all earlier market and lead objects remain recoverable while detailed data and counts stay bounded", () => {
  const recordHashes = deepHashes(market.records);
  for (const [id, digest] of Object.entries(fixture.originalRecordHashes)) {
    if (
      [
        "volvo-bzl-electric",
        "fonz-nkd",
        "benzina-zero-duo",
        "savic-c-series",
      ].includes(id)
    )
      assert.ok(recordHashes.has(digest), id);
    else
      assert.equal(hash(market.records.find((x) => x.id === id)), digest, id);
  }
  const leadHashes = deepHashes([
    market.unverifiedLeads,
    market.reconciledLeads,
  ]);
  for (const [id, digest] of Object.entries(fixture.originalLeadHashes))
    assert.ok(leadHashes.has(digest), id);
  assert.deepEqual(
    market.reconciledLeads.slice(0, 16).map(hash),
    fixture.previousHistoryHashes,
  );
  for (const [file, digest] of Object.entries(fixture.unchangedDataHashes))
    assert.equal(
      verifiedPre71DataHash(file),
      digest,
      file,
    );
  assert.deepEqual(market.counts, {
    ...fixture.counts,
    byOrderStatus: {
      ...fixture.counts.byOrderStatus,
      accepting_orders: 35,
      listed_unconfirmed: 190,
    },
  });
  assert.equal(market.records.length, 237);
  assert.equal(market.unverifiedLeads.length, 145);
  assert.equal(market.reconciledLeads.length, 18);
  assert.equal(
    market.records.reduce((n, x) => n + (x.trims as string[]).length, 0),
    388,
  );
});
