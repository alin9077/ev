import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pickerCatalogue } from "../src/lib/data";
import {
  comparisonPickerCars,
  type ComparisonPickerCar,
} from "../src/lib/picker-car";
import { formatFact, parseSelection, selectionUrl } from "../src/lib/compare";
import {
  catalogueFilterOptions,
  matchesSearch,
  driveFilterKey,
} from "../src/lib/search";
import type { Car, Fact } from "../src/lib/types";
const full = catalogue();
const compact = comparisonPickerCars(full);
const labels = (c: Car | ComparisonPickerCar, date: string) => [
  c.id,
  c.modelId,
  c.family,
  c.brand,
  c.model,
  c.trim,
  c.generation,
  c.availability,
  c.drive,
  c.facts.seats.value === null
    ? "Seats unverified"
    : `${c.facts.seats.value} seats`,
  formatFact(c.facts.price_aud, date),
  c.facts.price_aud.status === "conditional",
];
test("compact comparison choices preserve all identity, displayed price and expiry labels", () => {
  assert.equal(compact.length, full.length);
  for (let i = 0; i < full.length; i++) {
    for (const date of ["2026-10-10", "2026-11-12", "invalid"])
      assert.deepEqual(labels(compact[i], date), labels(full[i], date));
    assert.deepEqual(Object.keys(compact[i].facts), [
      "price_aud",
      "range_km",
      "seats",
    ]);
    assert.ok(!("availabilityEvidence" in compact[i]));
    assert.ok(!("buyerSummary" in compact[i]));
    assert.ok(!("sourceIds" in compact[i].facts.price_aud));
  }
  assert.deepEqual(
    catalogueFilterOptions(compact),
    catalogueFilterOptions(full),
  );
});
test("all exact-trim selections and share URLs remain identical with compact choices", () => {
  const queries: Record<string, string>[] = [
    {},
    { cars: "missing" },
    { cars: `${full[0].id},missing,${full[0].id}` },
    {
      cars: full
        .slice(0, 5)
        .map((c) => c.id)
        .join(","),
      active: "missing",
      section: "bogus",
      data: "old",
    },
  ];
  for (let i = 0; i < full.length; i++) {
    queries.push({ cars: full[i].id });
    queries.push({
      cars: [full[i], full[(i + 1) % full.length], full[(i + 2) % full.length]]
        .map((c) => c.id)
        .join(","),
      active: full[(i + 2) % full.length].id,
      section: "features",
      q: "range",
      diff: "1",
    });
  }
  for (const q of queries) {
    const before = parseSelection(new URLSearchParams(q), full),
      after = parseSelection(new URLSearchParams(q), compact);
    assert.deepEqual(after, before);
    assert.equal(selectionUrl(after), selectionUrl(before));
  }
});
test("picker search, availability, drive, seats, price and range filters keep catalogue order", () => {
  const options = catalogueFilterOptions(full);
  const base = {
    q: "",
    availability: "all",
    drive: "all",
    seats: "all",
    budget: "",
    range: "",
    basis: "all",
    baseline: false,
    exclude: [] as string[],
  };
  const cases = [base];
  for (const q of ["EV3", "ELEXIO", "MY26", "Yutong", "no result"])
    cases.push({ ...base, q });
  for (const availability of [
    "current_or_order_listed",
    "outgoing",
    "announced_provisional",
  ])
    cases.push({ ...base, availability });
  for (const drive of options.drive) cases.push({ ...base, drive });
  for (const seats of options.seats.map(String)) cases.push({ ...base, seats });
  for (const budget of ["0", "50000", "90000"]) cases.push({ ...base, budget });
  for (const range of ["300", "500", "900"]) cases.push({ ...base, range });
  for (const basis of ["reported", "manufacturer"])
    cases.push({ ...base, basis });
  cases.push(
    { ...base, baseline: true },
    { ...base, exclude: [full[0].id, full[1].id] },
  );
  const filter = (
    cars: readonly (Car | ComparisonPickerCar)[],
    f: typeof base,
  ) =>
    cars.filter(
      (c) =>
        (!f.baseline || c.modelId === "tesla_model_y") &&
        !f.exclude.includes(c.id) &&
        matchesSearch(`${c.brand} ${c.model} ${c.trim} ${c.generation}`, f.q) &&
        (f.availability === "all" || c.availability === f.availability) &&
        (f.drive === "all" || driveFilterKey(c.drive) === f.drive) &&
        (f.seats === "all" || c.facts.seats.value === Number(f.seats)) &&
        (!f.budget ||
          c.facts.price_aud.value === null ||
          Number(c.facts.price_aud.value) <= Number(f.budget)) &&
        (!f.range ||
          c.facts.range_km.value === null ||
          Number(c.facts.range_km.value) >= Number(f.range)) &&
        (f.basis === "all" ||
          (f.basis === "reported"
            ? c.facts.price_aud.basis.toLowerCase().includes("reported")
            : !c.facts.price_aud.basis.toLowerCase().includes("reported"))),
    );
  for (const f of cases)
    assert.deepEqual(
      filter(compact, f).map((c) => c.id),
      filter(full, f).map((c) => c.id),
    );
});
test("compact prices preserve nulls, malformed values and explicit deadlines", () => {
  for (const value of [
    null,
    0,
    49990,
    "unknown",
    { amount: 1 },
  ] as Fact["value"][]) {
    for (const validUntil of [
      undefined,
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
      "invalid",
    ]) {
      const c: Car = {
        ...full[0],
        facts: {
          ...full[0].facts,
          price_aud: {
            ...full[0].facts.price_aud,
            value,
            validUntil,
            status: "conditional",
          },
        },
      };
      assert.deepEqual(
        labels(comparisonPickerCars([c])[0], "2026-10-10"),
        labels(c, "2026-10-10"),
      );
    }
  }
});
test("comparison projection is non-mutating and leaves evidence-bearing picker consumers intact", () => {
  const original = JSON.stringify(full);
  comparisonPickerCars(full);
  assert.equal(JSON.stringify(full), original);
  const shared = pickerCatalogue();
  assert.ok(shared.every((c) => Array.isArray(c.facts.price_aud.sourceIds)));
  assert.ok(
    Buffer.byteLength(JSON.stringify(compact)) <
      Buffer.byteLength(JSON.stringify(shared)) * 0.25,
  );
});
