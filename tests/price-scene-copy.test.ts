import test from "node:test";
import assert from "node:assert/strict";
import { priceSceneCaption } from "../src/lib/price-scene-copy";
import type { SceneCar } from "../src/lib/scenes/kit";
const car = (basis?: string) =>
  ({
    name: "Example",
    features: {},
    facts: { price_comparison_basis: basis },
  }) as SceneCar;
test("the price scene never labels driveaway or mixed amounts as before on-road costs", () => {
  assert.match(
    priceSceneCaption([
      car("Before on-road costs"),
      car("Before on-road costs"),
    ]),
    /before on-road costs/,
  );
  assert.match(
    priceSceneCaption([car("Driveaway"), car("Driveaway")]),
    /Published driveaway prices/,
  );
  const mixed = priceSceneCaption([
    car("Before on-road costs"),
    car("Driveaway"),
  ]);
  assert.match(mixed, /not like-for-like/);
  assert.doesNotMatch(mixed, /prices before on-road costs/);
  assert.match(priceSceneCaption([car(), car()]), /unconfirmed/);
});

import { readoutFor, specFor } from "../src/lib/scene-readout";
import type { Fact, Pack } from "../src/lib/types";
function pack(basis: string, validUntil?: string): Pack {
  const price: Fact = {
    key: "price_aud",
    label: "Published price",
    value: 49990,
    unit: "AUD",
    basis,
    comparisonBasis: basis,
    date: "2026-10-10",
    status: "standard",
    market: "AU",
    sourceIds: ["maker"],
    scope: "Exact version",
    qualifications: [],
    issues: [],
    validUntil,
  };
  return {
    car: { model: "Example", trim: "Version", facts: { price_aud: price } },
    features: [],
    events: [],
    eligibility: {
      documented_family_minimum: null,
      observation_window_start: "2026-10-01",
      observation_window_end: "2026-10-10",
    },
  } as unknown as Pack;
}

test("chapter readout carries each price basis and evidence date", () => {
  const before = pack("Before on-road costs"),
    driveaway = pack("Driveaway");
  const readout = readoutFor("01", before, driveaway, "2026-10-13");
  assert.match(
    readout.rows[0].values[0],
    /A\$49,990 · Before on-road costs · checked 2026-10-10/,
  );
  assert.match(
    readout.rows[0].values[1],
    /A\$49,990 · Driveaway · checked 2026-10-10/,
  );
  const spec = specFor(before, driveaway, "2026-10-13");
  assert.match(priceSceneCaption(spec.cars!), /not like-for-like/);
});

test("expired offers have an explicit caption and cannot draw a current price tile", () => {
  const spec = specFor(
    pack("Driveaway", "2026-10-12"),
    pack("Driveaway"),
    "2026-10-13",
  );
  assert.equal(spec.cars?.[0].facts.price_aud, undefined);
  assert.equal(spec.cars?.[0].facts.price_offer_expired, "expired");
  assert.match(priceSceneCaption(spec.cars!), /offer has expired/);
  assert.match(
    readoutFor(
      "01",
      pack("Driveaway", "2026-10-12"),
      pack("Driveaway"),
      "2026-10-13",
    ).rows[0].values[0],
    /Expired offer/,
  );
});

test("age alone does not remove price amounts from chapter illustration or readout", () => {
  const a = pack("Before on-road costs"),
    b = pack("Before on-road costs");
  assert.equal(specFor(a, b, "2026-12-01").cars?.[0].facts.price_aud, 49990);
  assert.match(
    readoutFor("01", a, b, "2026-12-01").rows[0].values[0],
    /A\$49,990/,
  );
});
