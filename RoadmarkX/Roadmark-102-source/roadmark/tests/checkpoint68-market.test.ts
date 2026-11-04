import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { marketBeforeCheckpoint71 as inventory, verifiedPre71DataHash } from "./helpers/checkpoint71-history";
import fixture from "../qa/checkpoint68-market-fixture.json";
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
test("Abarth mixed New/demo campaign remains unbound to any exact eligible current unit", () => {
  const row = market.unverifiedLeads.find((x) => x.id === "abarth-500e")!;
  assert.equal(hash(row), fixture.amendedLeadHashes["abarth-500e"]);
  assert.match(String(row.evidenceNote), /New and demonstrator/);
  assert.match(
    String(row.evidenceNote),
    /not verify an exact current New Scorpionissima/,
  );
  assert.match(String(row.evidenceNote), /1417F remains identity-conflicted/);
  assert.match(String(row.evidenceNote), /not a current VIN\/MY binding/);
  for (const file of [
    "abarth-500e-n58419-corrigendum-2026-10-11/amendment.json",
    "abarth-500e-n58419-corrigendum-2026-10-11/effective-dealer-advertisement-ledger.json",
    "abarth-500e-n58419-corrigendum-2026-10-11/effective-REPORT.md",
  ])
    assert.ok((row.sourceArtifacts as string[]).includes(file));
});
test("Nexport legacy codes remain distinct from NexGen and customer-build epochs", () => {
  for (const id of [
    "nexport-ze-b-106",
    "nexport-ze-b-125",
    "nexport-ze-b-86",
  ]) {
    const row = market.unverifiedLeads.find((x) => x.id === id)!;
    assert.equal(
      hash(row),
      fixture.amendedLeadHashes[id as keyof typeof fixture.amendedLeadHashes],
    );
    assert.match(String(row.evidenceNote), /2022/);
    assert.match(String(row.evidenceNote), /NexGen/);
    assert.equal(row.unresolvedReason, "legacy_name_or_unverified_variant");
    assert.ok(
      (row.sourceArtifacts as string[]).includes(
        "nexport-bus-epochs-2026-10-11/code-epoch-crosswalk.json",
      ),
    );
  }
  const row = market.unverifiedLeads.find((x) => x.id === "nexport-ze-b-125")!;
  assert.match(String(row.evidenceNote), /368kWh/);
  assert.match(String(row.evidenceNote), /378kWh-upgradeable-to-453kWh/);
  assert.match(
    String(row.evidenceNote),
    /No explicit same-code\/same-epoch bridge/,
  );
});
test("all four amended leads retain full predecessors and unchanged unresolved eligibility", () => {
  for (const [id, digest] of Object.entries(fixture.amendedLeadHashes)) {
    const row = market.unverifiedLeads.find((x) => x.id === id)!;
    assert.equal(hash(row), digest);
    assert.deepEqual(row.trims, []);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    assert.notEqual(row.completeVehicleCountEligible, true);
    assert.equal(row.resolutionStatus, "unresolved");
    assert.ok(
      deepHashes(row.priorEvidenceSnapshots).has(
        fixture.originalLeadHashes[
          id as keyof typeof fixture.originalLeadHashes
        ],
      ),
      id,
    );
  }
  const all = deepHashes([market.unverifiedLeads, market.reconciledLeads]);
  for (const [id, digest] of Object.entries(fixture.originalLeadHashes))
    assert.ok(all.has(digest), id);
});
test("earlier market family evidence stays recoverable and detailed-data bytes remain unchanged", () => {
  for (const [id, digest] of Object.entries(fixture.originalRecordHashes)) {
    const current = market.records.find((x) => x.id === id)!;
    if (["fonz-nkd", "benzina-zero-duo", "savic-c-series"].includes(id))
      assert.ok(deepHashes(current.priorEvidenceSnapshots).has(digest), id);
    else assert.equal(hash(current), digest, id);
  }
  assert.deepEqual(
    market.reconciledLeads.map(hash),
    fixture.previousHistoryHashes,
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
  for (const [file, digest] of Object.entries(fixture.unchangedDataHashes))
    assert.equal(
      verifiedPre71DataHash(file),
      digest,
      file,
    );
});
