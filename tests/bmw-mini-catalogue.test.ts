// Admission behaviour is checked against the immutable source layer.
// Dated M1 overlays have separate current-catalogue safety coverage.
import test from "node:test";
import assert from "node:assert/strict";
import { sourceCatalogue as catalogue } from "../src/lib/data";
const batch = catalogue().filter((c) => ["BMW", "MINI"].includes(c.brand));
const find = (model: string, trim: string) =>
  batch.find((c) => c.modelId === model && c.trim === trim)!;
test("BMW MINI imports eighteen configurations across nine families without inventing MY", () => {
  assert.equal(batch.length, 18);
  assert.equal(new Set(batch.map((c) => c.modelFamily)).size, 9);
  assert.ok(batch.every((c) => c.year === null));
  assert.ok(
    batch.every(
      (c) => c.availabilityEvidence?.orderStatus === "listed_unconfirmed",
    ),
  );
  assert.ok(!batch.some((c) => c.trim.includes("Sport Collection")));
  assert.equal(
    batch.filter((c) => c.modelId === "mini_countryman_u25_bev").length,
    5,
  );
});
test("MINI derived from-price candidates never become list prices or Paul Smith prices", () => {
  assert.ok(batch.every((c) => c.facts.price_aud.value === null));
  const mini = batch.filter((c) => c.brand === "MINI");
  assert.equal(
    mini.filter((c) => c.facts.qualified_derived_price_aud?.value != null)
      .length,
    9,
  );
  assert.equal(
    find("mini_cooper_j01", "SE Favoured").facts.qualified_derived_price_aud
      .value,
    58990,
  );
  assert.equal(
    find("mini_cooper_j01", "SE Favoured").facts.qualified_derived_price_aud
      .status,
    "conditional",
  );
  assert.equal(
    find("mini_cooper_j01", "SE Paul Smith Edition").facts
      .qualified_derived_price_aud,
    undefined,
  );
});
test("BMW conflicting battery and range bases remain held; i5 stale codes stay attributed", () => {
  const ix = find("bmw_ix_current", "xDrive45 M Sport");
  assert.equal(ix.facts.battery_kwh.value, null);
  assert.equal(ix.facts.attributed_battery_net_kwh.value, 94.8);
  assert.equal(ix.facts.range_km.value, null);
  assert.equal(
    find("bmw_ix1_current", "xDrive30 M Sport").facts.battery_kwh.value,
    null,
  );
  assert.equal(
    find("bmw_i4_current", "eDrive35 M Sport Package").facts.seats.value,
    null,
  );
  for (const c of batch.filter((c) => c.modelId === "bmw_i5_sedan_current")) {
    assert.equal(c.drive, "Unknown");
    assert.equal(c.facts.battery_kwh.status, "conditional");
    assert.equal(c.facts.ac_kw.status, "conditional");
    assert.match(c.facts.range_km.basis, /ADR81/);
    assert.equal(c.facts.length_mm.value, null);
  }
});
test("MINI current production scopes retain capacity conflicts and Countryman E DC hold", () => {
  for (const c of batch.filter(
    (c) =>
      c.modelId === "mini_cooper_j01" ||
      c.modelId === "mini_countryman_u25_bev",
  ))
    assert.equal(c.facts.battery_kwh.value, null);
  for (const c of batch.filter(
    (c) => c.modelId === "mini_countryman_u25_bev" && c.trim.startsWith("E "),
  ))
    assert.equal(c.facts.dc_peak_kw.value, null);
  assert.equal(find("mini_aceman_j05", "SE").facts.battery_kwh.value, 49.2);
  assert.equal(
    find("mini_cooper_j01", "SE Favoured").facts.production_revision.value,
    "2026-09",
  );
  assert.equal(
    find("mini_cooper_j01", "SE Paul Smith Edition").facts.production_revision
      .value,
    "2026-07",
  );
  assert.ok(
    batch
      .filter((c) => c.brand === "MINI")
      .every((c) => c.facts.battery_retention_pct.status === "conditional"),
  );
});
test("iX3 powertrain distinctions and cargo/charging protocols remain explicit", () => {
  const a = find("bmw_ix3_na5", "40 M Sport Package"),
    b = find("bmw_ix3_na5", "50 xDrive M Sport Package");
  assert.equal(a.facts.battery_kwh.value, 82.6);
  assert.equal(b.facts.battery_kwh.value, 108.7);
  assert.equal(a.facts.dc_peak_kw.value, 300);
  assert.equal(b.facts.dc_peak_kw.value, 400);
  assert.match(a.facts.range_km.basis, /ADR81/);
  assert.match(b.facts.range_km.basis, /WLTP/);
  assert.ok(
    batch.every(
      (c) =>
        c.facts.boot_l.value === null ||
        c.facts.boot_l.status === "conditional",
    ),
  );
  assert.ok(
    batch.every(
      (c) =>
        c.facts.dc_charge_time_min.value === null ||
        c.facts.dc_charge_time_min.status === "conditional",
    ),
  );
  assert.ok(batch.every((c) => c.facts.kerb_weight_kg.value === null));
});
