import test from "node:test";
import assert from "node:assert/strict";
import {
  matchesSearch,
  catalogueFilterOptions,
  driveFilterKey,
} from "../src/lib/search";
import { filterDiscoveryCars } from "../src/lib/discovery";
import { catalogue } from "../src/lib/data";
test("plain keyboard queries find accents, punctuation and word spacing", () => {
  assert.ok(
    matchesSearch("Škoda Enyaq Coupé Sportline 85", "skoda enyaq coupe"),
  );
  assert.ok(matchesSearch("Volkswagen ID.4 Pro", "ID4"));
  assert.ok(matchesSearch("Mercedes-Benz eVito", "mercedes benz"));
  assert.ok(matchesSearch("Polestar 4 coupé", "COUPE"));
  assert.equal(matchesSearch("Enyaq Sportline 85", "Elroq"), false);
});
test("catalogue search retains all filters when matching unaccented model names", () => {
  const result = filterDiscoveryCars(
    catalogue(),
    "skoda enyaq coupe",
    "passenger",
    false,
    { asOf: "2026-10-10", maxAgeDays: 30 },
  );
  assert.equal(result.length, 2);
  assert.ok(result.every((c) => c.modelId === "skoda_enyaq_coupe_my27"));
  assert.equal(
    filterDiscoveryCars(catalogue(), "skoda enyaq coupe", "van", false, {
      asOf: "2026-10-10",
      maxAgeDays: 30,
    }).length,
    0,
  );
});

test("model and trim words can skip intervening badges in either order", () => {
  assert.ok(matchesSearch("Renault Kangoo E-Tech SWB EV45 90kW", "Kangoo SWB"));
  assert.ok(
    matchesSearch("Renault Kangoo E-Tech SWB EV45 90kW", "SWB Renault"),
  );
  assert.ok(
    matchesSearch("Škoda Enyaq Coupé Sportline 85", "skoda sportline coupe"),
  );
  assert.equal(
    matchesSearch("Renault Kangoo E-Tech LWB EV45 90kW", "Kangoo SWB"),
    false,
  );
  assert.equal(
    matchesSearch("Renault Kangoo E-Tech SWB EV45 90kW", "Kangoo SWB hybrid"),
    false,
  );
});

test("separated model/trim searches retain vehicle-class and fresh-stock filters", () => {
  const cars = catalogue();
  const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
  const result = filterDiscoveryCars(cars, "Kangoo SWB", "van", false, policy);
  assert.equal(result.length, 1);
  assert.match(result[0].id, /kangoo.*swb/);
  assert.equal(
    filterDiscoveryCars(cars, "Kangoo SWB", "passenger", false, policy).length,
    0,
  );
  assert.equal(
    filterDiscoveryCars(cars, "Kangoo SWB", "van", true, policy).length,
    0,
  );
});

test("seat and drive options grow with passenger, commercial and specialist configurations", () => {
  const cars = catalogue();
  const options = catalogueFilterOptions(cars);
  for (const seats of [2, 3, 5, 6, 7]) assert.ok(options.seats.includes(seats));
  for (const car of cars)
    assert.ok(options.drive.includes(driveFilterKey(car.drive)));
  const base = cars[0];
  const invalid = [null, "3", 0, -1, 2.5, NaN].map((value) => ({
    ...base,
    facts: { ...base.facts, seats: { ...base.facts.seats, value } },
  }));
  assert.deepEqual(catalogueFilterOptions(invalid).seats, []);
  assert.deepEqual(catalogueFilterOptions([]), { seats: [], drive: [] });
});

test("drive filters group equivalent rear-drive descriptions without guessing a two-wheel-drive axle", () => {
  for (const value of [
    "RWD",
    "RWD e-Axle",
    "rear-wheel drive",
    "rear-wheel drive eAxle",
    "rear driven axle",
  ])
    assert.equal(driveFilterKey(value), "RWD");
  assert.equal(driveFilterKey("2WD"), "2WD");
  assert.equal(driveFilterKey("FWD"), "FWD");
  assert.equal(driveFilterKey("Unknown"), "unknown");
  assert.equal(driveFilterKey("Unverified"), "unknown");
});
