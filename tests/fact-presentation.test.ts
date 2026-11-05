import test from "node:test";
import assert from "node:assert/strict";
import { factReaderLabel } from "../src/lib/fact-presentation";
import { comparisonFactLabel } from "../src/lib/compare";
import { pack } from "../src/lib/data";
import { makeReport } from "../src/lib/citable";
test("raw field labels receive neutral reader wording while custom scope labels remain exact", () => {
  for (const [key, raw, expected] of [
    ["price_aud", "Price aud", "Published price"],
    ["range_km", "range_km", "Published range"],
    ["dc_charge_time_min", "Dc charge time min", "Published DC charging duration"],
    ["boot_l", "Boot l", "Published load space"],
    ["towing_braked_kg", "Towing braked kg", "Braked towing"],
  ]) {
    assert.equal(factReaderLabel(key, raw), expected);
    assert.equal(comparisonFactLabel(key, [{ label: raw, basis: "Captured catalogue" }]), expected);
  }
  assert.equal(factReaderLabel("dc_charge_time_min", "DC charging 15–80%"), "DC charging 15–80%");
  assert.equal(factReaderLabel("boot_l", "VDA cargo behind second row"), "VDA cargo behind second row");
  assert.equal(factReaderLabel("unknown_key", "Unknown key"), "Unknown key");
});
test("Ford reports use reader labels without changing any underlying evidence or guarded copy", () => {
  const selected = pack("ford_e_transit_custom_my26_50__trend_lwb__20261010");
  const before = JSON.stringify(selected);
  const report = makeReport([selected], "/fixture");
  assert.equal(report.keyFacts.find((claim) => claim.key === "price_aud")!.label, "Published price");
  assert.equal(report.keyFacts.find((claim) => claim.key === "dc_charge_time_min")!.label, "Published DC charging duration");
  assert.equal(JSON.stringify(selected), before);
  assert.ok(selected.car.buyerSummary?.strength);
});
