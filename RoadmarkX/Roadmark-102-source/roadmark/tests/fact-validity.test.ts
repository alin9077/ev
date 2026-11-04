import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research } from "../src/lib/data";
import { offerExpired } from "../src/lib/fact-validity";
import { formatFact } from "../src/lib/compare";
import { exclusionReason } from "../src/lib/discovery";
test("offer deadline expires independently of 30-day evidence freshness", () => {
  const car = catalogue().find(
    (c) => c.id === "ldv_edeliver_7_my25__swb_low_roof_77kwh__20261010",
  )!;
  const fact = car.facts.retail_driveaway_from_aud;
  assert.equal(fact.validUntil, "2026-10-31");
  assert.equal(offerExpired(fact, "2026-10-31"), false);
  assert.equal(offerExpired(fact, "2026-11-01"), true);
  assert.match(formatFact(fact, "2026-11-01"), /Expired offer/);
  const otherwiseRankable = {
    ...fact,
    status: "standard" as const,
    comparisonBasis: fact.basis,
  };
  assert.match(
    exclusionReason(car, otherwiseRankable, research().sources, {
      asOf: "2026-11-01",
      maxAgeDays: 30,
    })!,
    /expired/,
  );
  assert.equal(
    offerExpired({ ...fact, validUntil: "2026-02-31" }, "2026-10-10"),
    true,
  );
});
test("ATTO 1 order deadline is separate from its later delivery deadline", () => {
  const car = catalogue().find(
    (c) => c.id === "byd_atto_1__essential_fwd__20261010",
  )!;
  assert.equal(car.facts.driveaway_price_aud.validUntil, "2026-12-15");
  assert.equal(offerExpired(car.facts.driveaway_price_aud, "2026-12-16"), true);
});
