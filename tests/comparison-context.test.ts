import test from "node:test";
import assert from "node:assert/strict";
import { busComparisonContext } from "../src/lib/comparison-context";

test("passenger-only comparisons retain their existing range and seat introduction", () => {
  assert.equal(
    busComparisonContext([
      { vehicleClass: "passenger" },
      { vehicleClass: "passenger" },
    ]),
    null,
  );
  assert.equal(busComparisonContext([]), null);
});
test("bus-only comparisons describe separate passenger, standing and driver capacities", () => {
  const text = busComparisonContext([
    { vehicleClass: "bus" },
    { vehicleClass: "bus" },
  ]);
  assert.match(
    text!,
    /Seated passengers, standing passengers and the driver are shown separately/,
  );
  assert.doesNotMatch(
    text!,
    /Seat count needs confirmation|Both selected vehicles have/,
  );
});
test("mixed selections warn about different layouts and methods even when the bus is third", () => {
  const text = busComparisonContext([
    { vehicleClass: "passenger" },
    { vehicleClass: "passenger" },
    { vehicleClass: "bus" },
  ]);
  assert.match(text!, /different layouts/);
  assert.match(text!, /incompatible methods/);
  assert.doesNotMatch(text!, /overall winner|\d+ seats/);
});

import { formatFact } from "../src/lib/compare";
test("a single driver place uses singular person without changing capacity facts", () => {
  assert.equal(formatFact({ value: 1, unit: "people" }), "1 person");
  assert.equal(formatFact({ value: 0, unit: "people" }), "0 people");
  assert.equal(formatFact({ value: 28, unit: "people" }), "28 people");
  assert.equal(
    formatFact({ value: null, unit: "people" }),
    "Needs confirmation",
  );
});

import { boundedComparisonContext } from "../src/lib/comparison-context";
const bounded = { configurationEvidence: { rankingEligible: false, completeVehicleCountEligible: false, projectionScope: "Captured catalogue only" } };
test("bounded comparisons avoid unqualified common seating claims", () => {
  const text = boundedComparisonContext([bounded, bounded])!;
  assert.match(text, /^These are captured catalogue configurations/);
  assert.match(text, /equipment and seating claims.*source and build conditions/);
  assert.doesNotMatch(text, /Both selected vehicles have|\d+ seats/);
});
test("mixed comparisons identify only the bounded subset", () => {
  const text = boundedComparisonContext([{}, bounded])!;
  assert.match(text, /^At least one selected version/);
  assert.doesNotMatch(text, /^These are/);
});
test("unbounded and empty selections retain the legacy introduction", () => {
  assert.equal(boundedComparisonContext([{}, {}]), null);
  assert.equal(boundedComparisonContext([]), null);
});
