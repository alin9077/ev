import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint71 as inventory, verifiedPre71DataHash } from "./helpers/checkpoint71-history";
import fixture from "../qa/checkpoint66-market-fixture.json";
const canonical = (value: unknown): unknown =>
  Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === "object"
      ? Object.fromEntries(
          Object.entries(value)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([key, part]) => [key, canonical(part)]),
        )
      : value;
const hash = (value: unknown) =>
  createHash("sha256")
    .update(JSON.stringify(canonical(value)))
    .digest("hex");
const market = inventory as unknown as {
  records: Record<string, unknown>[];
  unverifiedLeads: Record<string, unknown>[];
  reconciledLeads: Record<string, unknown>[];
  counts: Record<string, unknown>;
};
test("three Maserati family audits distinguish named offerings, one New ad and unknown exact builds", () => {
  for (const [id, digest] of Object.entries(fixture.newRecordHashes)) {
    const row = market.records.find((x) => x.id === id)!;
    assert.equal(hash(row), digest);
    assert.deepEqual(row.trims, ["Folgore"]);
    assert.equal(row.modelYear, null);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.rankingEligible, false);
    assert.equal(row.completeVehicleCountEligible, false);
    assert.equal(row.physicalStockVerified, false);
    assert.equal(row.factoryBuildSpecificationVerified, false);
    assert.equal(row.factoryOrderAcceptanceVerified, false);
    assert.equal(row.catalogueCoverage, "market_audit_only");
    assert.equal(
      row.stockStatus,
      id === "maserati-granturismo-folgore" ? "new_stock_listed" : "unverified",
    );
  }
  const granturismo = market.records.find(
    (x) => x.id === "maserati-granturismo-folgore",
  )!;
  assert.match(String(granturismo.evidenceNote), /151062/);
  assert.match(String(granturismo.evidenceNote), /ZAMBMVE17SX457650/);
  assert.match(String(granturismo.evidenceNote), /unit only/);
});
test("Maserati umbrella is reconciled once and its entire original remains historical", () => {
  const id = "maserati-grecale-folgore-granturismo-folgore-grancabrio-folgore";
  assert.equal(
    market.unverifiedLeads.some((x) => x.id === id),
    false,
  );
  const rows = market.reconciledLeads.filter((x) => x.id === id);
  assert.equal(rows.length, 1);
  const row = rows[0];
  assert.equal(hash(row), fixture.maseratiHistoryHash);
  assert.equal(row.historicalOnly, true);
  assert.equal(row.countsAsAdditionalFamily, false);
  assert.equal(row.countsAsNamedConfiguration, false);
  assert.equal(hash(row.originalRecord), fixture.originalLeadHashes[id]);
  assert.equal((row.relatedRecordIds as string[]).length, 3);
});
test("Fiat and CPX evidence amendments preserve unresolved identities, holds and complete before snapshots", () => {
  for (const [id, digest] of Object.entries(fixture.amendedLeadHashes)) {
    const row = market.unverifiedLeads.find((x) => x.id === id)!;
    assert.equal(hash(row), digest);
    assert.equal(row.rankingEligible, false);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.stockStatus, "unverified");
    const snapshots = row.priorEvidenceSnapshots as {
      originalRecord?: unknown;
      previousRecord?: unknown;
    }[];
    assert.equal(snapshots.length, 1);
    assert.equal(
      hash(snapshots[0].originalRecord),
      fixture.originalLeadHashes[id as keyof typeof fixture.originalLeadHashes],
    );
  }
  const fiat = market.unverifiedLeads.find((x) => x.id === "fiat-500e")!;
  assert.deepEqual(fiat.trims, []);
  assert.match(
    String(fiat.evidenceNote) + " " + (fiat.limitations as string[]).join(" "),
    /1417F/,
  );
  assert.match(
    String(fiat.evidenceNote) + " " + (fiat.limitations as string[]).join(" "),
    /ZFAEFA266RX186330/,
  );
  const cpx = market.unverifiedLeads.find(
    (x) => x.id === "moto-lead-scooter-02",
  )!;
  assert.equal(cpx.modelYear, null);
  assert.deepEqual(cpx.trims, [
    "Single Battery",
    "Dual Battery (historical AU offer)",
  ]);
  assert.match(
    String(cpx.evidenceNote) + " " + (cpx.limitations as string[]).join(" "),
    /LYSCPA417P1000059/,
  );
  assert.ok(
    (cpx.sourceArtifacts as string[]).includes(
      "super-soco-cpx-au-offers-2026-10-11/raw/wayne-stock-detail.json",
    ),
  );
});
test("all preexisting records, lead objects, historical rows and detailed data remain recoverable", () => {
  for (const [id, digest] of Object.entries(fixture.originalRecordHashes)) {
    const row = market.records.find((x) => x.id === id)!;
    if (
      [
        "volvo-bzl-electric",
        "fonz-nkd",
        "benzina-zero-duo",
        "savic-c-series",
      ].includes(id)
    ) {
      // Sources67/69 amend only these families. Require the exact complete
      // preceding record; dedicated current-version tests separately pin each after object.
      const snapshots = row.priorEvidenceSnapshots as {
        originalRecord?: unknown;
        previousRecord?: unknown;
      }[];
      assert.ok(
        snapshots.some(
          (x) => hash(x.originalRecord ?? x.previousRecord) === digest,
        ),
        id,
      );
    } else assert.equal(hash(row), digest, id);
  }
  const contained = new Set<string>();
  const walk = (v: unknown) => {
    if (!v || typeof v !== "object") return;
    contained.add(hash(v));
    for (const child of Object.values(v)) walk(child);
  };
  walk(market.unverifiedLeads);
  walk(market.reconciledLeads);
  for (const [id, digest] of Object.entries(fixture.originalLeadHashes))
    assert.ok(contained.has(digest), id);
  assert.deepEqual(
    market.reconciledLeads.slice(0, 15).map(hash),
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
    unresolvedLeadGroups: 145,
    reconciledLeadGroups: 18,
  });
  assert.equal(market.records.length, 237);
  assert.equal(market.unverifiedLeads.length, 145);
  assert.equal(market.reconciledLeads.length, 18);
  assert.equal(
    market.records.reduce(
      (sum, row) => sum + (row.trims as string[]).length,
      0,
    ),
    388,
  );
});
