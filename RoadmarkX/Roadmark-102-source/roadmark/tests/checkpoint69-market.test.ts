import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint71 as inventory, verifiedPre71DataHash } from "./helpers/checkpoint71-history";
import fixture from "../qa/checkpoint69-market-fixture.json";
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
const row = (id: string, lead = false) =>
  (lead ? market.unverifiedLeads : market.records).find((x) => x.id === id)!;
const text = (r: Row) =>
  String(r.evidenceNote) + " " + (r.limitations as string[]).join(" ");
const deepHashes = (value: unknown) => {
  const result = new Set<string>();
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    result.add(hash(v));
    for (const child of Object.values(v)) walk(child);
  };
  walk(value);
  return result;
};
test("FONZ NKD current order route is explicitly downgraded without borrowing Arthur specifications", () => {
  const r = row("fonz-nkd");
  assert.equal(hash(r), fixture.amendedRecordHashes["fonz-nkd"]);
  assert.equal(r.orderStatus, "listed_unconfirmed");
  assert.equal(
    r.availabilityCategory,
    "current_listing_order_acceptance_unverified",
  );
  assert.match(text(r), /MY26 ARTHUR/);
  assert.match(text(r), /43630051623151/);
  assert.match(
    text(r),
    /not evidence that all NKD production or order channels have ended/,
  );
  assert.match(
    String(r.supplierContinuityNote),
    /linked builder resolves to Arthur/,
  );
  assert.ok(
    (r.sourceUrls as string[]).includes(
      "https://www.fonzmoto.com.au/products/nkd-new-1?variant=43630051623151",
    ),
  );
});
test("Benzina Duo selected New purchase advertising does not resolve delivered-build conflicts", () => {
  const r = row("benzina-zero-duo");
  assert.equal(hash(r), fixture.amendedRecordHashes["benzina-zero-duo"]);
  assert.equal(r.orderStatus, "accepting_orders");
  assert.match(text(r), /40968369143921/);
  assert.match(text(r), /colour, not mechanical trim/);
  assert.match(text(r), /50km\/h conflicts with linked 2023 manual 45km\/h/);
  assert.match(text(r), /combined vehicle\+rider\+passenger\+cargo/);
  assert.match(text(r), /not an accepted order or allocated physical New unit/);
  assert.deepEqual(r.trims, []);
});
test("Savic single Alpha-labelled base does not revive a separate Alpha Delta offering", () => {
  const r = row("savic-c-series"),
    lead = row("moto-lead-local-10", true);
  assert.equal(hash(r), fixture.amendedRecordHashes["savic-c-series"]);
  assert.equal(hash(lead), fixture.amendedLeadHashes["moto-lead-local-10"]);
  assert.match(text(r), /Alpha-labelled/);
  assert.match(text(r), /No current Delta choice is established/);
  assert.match(text(r), /absent from the static price calculation/);
  assert.match(text(r), /does not establish a formal model year/);
  assert.equal(r.exactConfigurationStatus, "exact_trims_unverified");
  assert.equal(r.trimCoverage, "exact_trims_unverified");
  assert.deepEqual(r.trims, []);
  for (const x of [r, lead])
    assert.ok(
      (x.sourceArtifacts as string[]).includes(
        "audits/savic-current-build-review/corrected-raw-locators.json",
      ),
    );
});
test("Scania TLS historical completed build does not transfer L-series specification or current orderability", () => {
  const r = row("scania-25p", true);
  assert.equal(hash(r), fixture.amendedLeadHashes["scania-25p"]);
  assert.match(text(r), /10-pallet Austruck/);
  assert.match(text(r), /300 kWh\/230 kW paragraph describes an L-series/);
  assert.match(text(r), /No explicit same-code\/technical-epoch bridge/);
  assert.equal(r.orderStatus, "listed_unconfirmed");
});
test("all five amendments retain full exact predecessors while identities details and histories remain bounded", () => {
  for (const [collection, amended, previous] of [
    [market.records, fixture.amendedRecordHashes, fixture.originalRecordHashes],
    [
      market.unverifiedLeads,
      fixture.amendedLeadHashes,
      fixture.originalLeadHashes,
    ],
  ] as const) {
    for (const [id, digest] of Object.entries(amended)) {
      const r = collection.find((x) => x.id === id)!;
      assert.equal(hash(r), digest);
      const snapshots = r.priorEvidenceSnapshots as {
        previousRecord: Row;
        previousRecordSHA256: string;
        sourceCheckpoint: number;
        sourceMarketSHA256: string;
      }[];
      assert.equal(snapshots.length, 1);
      const snapshot = snapshots[0];
      assert.equal(
        hash(snapshot.previousRecord),
        (previous as Record<string, string>)[id],
      );
      assert.equal(
        snapshot.previousRecordSHA256,
        hash(snapshot.previousRecord),
      );
      assert.equal(snapshot.sourceCheckpoint, 68);
      assert.equal(
        snapshot.sourceMarketSHA256,
        "6cecc00c35a894466d1fa132cba557456925f4ff472b22c3cc1075934968b434",
      );
      assert.equal(r.stockStatus, "unverified");
      assert.equal(r.rankingEligible, false);
      assert.notEqual(r.completeVehicleCountEligible, true);
      for (const key of [
        "id",
        "familyId",
        "brand",
        "model",
        "vehicleClass",
        "trims",
        "modelYear",
        "recordScope",
        "roadRegistrationScope",
        "roadRegistrationStatus",
        "catalogueCoverage",
        "exactConfigurationStatus",
        "trimCoverage",
      ])
        assert.deepEqual(r[key], snapshot.previousRecord[key], id + "/" + key);
      const oldHistory = (snapshot.previousRecord.evidenceHistory ||
        []) as unknown[];
      assert.deepEqual(
        ((r.evidenceHistory || []) as unknown[]).slice(0, oldHistory.length),
        oldHistory,
      );
    }
  }
  const allRecords = deepHashes(market.records),
    allLeads = deepHashes(market.unverifiedLeads);
  for (const [id, digest] of Object.entries(fixture.originalRecordHashes)) {
    assert.ok(allRecords.has(digest), id);
    if (!(id in fixture.amendedRecordHashes))
      assert.equal(hash(row(id)), digest, id);
  }
  for (const [id, digest] of Object.entries(fixture.originalLeadHashes)) {
    assert.ok(allLeads.has(digest), id);
    if (!(id in fixture.amendedLeadHashes))
      assert.equal(hash(row(id, true)), digest, id);
  }
  assert.deepEqual(
    market.reconciledLeads.map(hash),
    fixture.previousHistoryHashes,
  );
  assert.deepEqual(market.counts, fixture.counts);
  assert.equal(market.records.length, 237);
  assert.equal(market.unverifiedLeads.length, 145);
  assert.equal(market.reconciledLeads.length, 18);
  const orders: Record<string, number> = {};
  for (const r of market.records)
    orders[String(r.orderStatus)] = (orders[String(r.orderStatus)] || 0) + 1;
  assert.deepEqual(orders, fixture.counts.byOrderStatus);
  assert.equal(orders.accepting_orders, 35);
  assert.equal(orders.listed_unconfirmed, 190);
  for (const [file, digest] of Object.entries(fixture.unchangedDataHashes))
    assert.equal(
      verifiedPre71DataHash(file),
      digest,
      file,
    );
});
