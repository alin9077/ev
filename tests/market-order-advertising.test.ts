import test from "node:test";
import assert from "node:assert/strict";
import inventory from "../data/market-inventory-2026-10-10.json";
type Row = Record<string, unknown>;
const market = inventory as unknown as {
  records: Row[];
  unverifiedLeads: Row[];
  reconciledLeads: Row[];
};
const row = (id: string, lead = false) =>
  (lead ? market.unverifiedLeads : market.records).find((r) => r.id === id)!;
const text = (r: Row) =>
  String(r.evidenceNote) + " " + (r.limitations as string[]).join(" ");

test("FONZ NKD current order route is explicitly downgraded without borrowing Arthur specifications", () => {
  const r = row("fonz-nkd");

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

  assert.match(text(r), /10-pallet Austruck/);
  assert.match(text(r), /300 kWh\/230 kW paragraph describes an L-series/);
  assert.match(text(r), /No explicit same-code\/technical-epoch bridge/);
  assert.equal(r.orderStatus, "listed_unconfirmed");
});
