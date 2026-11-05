import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};

test("Abarth mixed New/demo campaign remains unbound to any exact eligible current unit", () => {
  const row = market.unverifiedLeads.find((x) => x.id === "abarth-500e")!;

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

test("Unresolved leads retain their distinct identities and eligibility holds", () => {
  for (const [id] of [
    "abarth-500e",
    "nexport-ze-b-106",
    "nexport-ze-b-125",
    "nexport-ze-b-86",
  ].map((id) => [id])) {
    const row = market.unverifiedLeads.find((x) => x.id === id)!;

    assert.deepEqual(row.trims, []);
    assert.equal(row.orderStatus, "listed_unconfirmed");
    assert.equal(row.stockStatus, "unverified");
    assert.equal(row.rankingEligible, false);
    assert.notEqual(row.completeVehicleCountEligible, true);
    assert.equal(row.resolutionStatus, "unresolved");
  }
});
