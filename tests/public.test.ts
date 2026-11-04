import { test } from "node:test";
import assert from "node:assert/strict";
import {
  catalogue,
  pack,
  pickerCatalogue,
  publicCatalogue,
  publicPack,
  publicSources,
  publicEquipment,
  research,
  verificationCounts,
} from "../src/lib/data";
import {
  featureFor,
  isVerifiedFact,
  NOT_CONFIRMED,
} from "../src/lib/verification";
import {
  changedTrims,
  defaultTrim,
  familyOrder,
  fleetSelection,
  fleetView,
  inVehicleType,
  vehicleTypes,
  WINDOW,
} from "../src/lib/fleet";
import { fleetProps } from "../src/lib/fleet-props";
import { formatFact, formatYear } from "../src/lib/compare";
import { formatValue } from "../src/lib/format";
import { makeReport } from "../src/lib/citable";
import { fromWire, toWire } from "../src/lib/pack-wire";
import type { Car, Fact } from "../src/lib/types";

const fact = (patch: Partial<Fact>): Fact => ({
  key: "price_aud",
  label: "Listed price",
  value: null,
  unit: "",
  basis: "",
  comparisonBasis: "",
  status: "standard",
  sourceIds: [],
  date: "",
  market: "AU",
  scope: "",
  qualifications: [],
  issues: [],
  ...patch,
});
const car = (id: string, family: string, price: Fact): Car => ({
  id,
  modelId: family,
  family,
  slug: id,
  brand: "Test",
  model: family,
  trim: id,
  generation: "",
  year: 2026,
  vehicleClass: "passenger",
  availability: "current_or_order_listed",
  drive: "AWD",
  facts: { price_aud: price },
  issues: [],
});

test("public packs carry only verified values, and no source cited only by hidden ones", () => {
  for (const c of catalogue()) {
    const raw = pack(c.id);
    const shown = publicPack(c.id);
    for (const [key, f] of Object.entries(raw.car.facts)) {
      const p = shown.car.facts[key];
      if (isVerifiedFact(f)) assert.deepEqual(p, f, `${c.id} ${key}`);
      else {
        assert.equal(p.value, null, `${c.id} ${key}`);
        assert.equal(p.status, "not_verified");
        assert.deepEqual(
          [p.basis, p.date, p.sourceIds, p.qualifications],
          ["", "", [], []],
        );
      }
    }
    const rawRows = new Map(raw.features.map((f) => [f.criterion, f]));
    for (const f of shown.features) {
      assert.ok(isVerifiedFact(f), `${c.id} ${f.criterion}`);
      assert.deepEqual(f, rawRows.get(f.criterion));
    }
    // A dropped row reads as the app's empty state.
    for (const f of raw.features.filter((f) => !isVerifiedFact(f))) {
      const row = featureFor(shown, f.criterion);
      assert.equal(row.value, NOT_CONFIRMED);
      assert.equal(row.status, "not_verified");
    }
    const cited = new Set([
      ...Object.values(shown.car.facts).flatMap((f) => f.sourceIds),
      ...shown.features.flatMap((f) => f.source_ids),
    ]);
    for (const id of cited)
      assert.ok(
        shown.sources.some((s) => s.id === id),
        `${c.id} ${id}`,
      );
  }
});
test("vans, trucks, buses and motorcycles show no figures; utes and cars mostly do", () => {
  for (const c of publicCatalogue()) {
    const values = Object.values(c.facts).filter((f) => f.value !== null);
    if (["van", "truck", "bus", "motorcycle"].includes(c.vehicleClass))
      assert.equal(values.length, 0, c.id);
  }
  const v = verificationCounts();
  assert.equal(v.factsShown + v.factsHidden, v.facts);
  assert.equal(v.rowsShown + v.rowsHidden, v.rows);
  assert.ok(v.factsHidden > 0 && v.factsShown > 0);
});
test("the picker catalogue holds public values for every variant and nothing more", () => {
  const picker = pickerCatalogue();
  assert.equal(picker.length, catalogue().length);
  const shown = new Map(publicCatalogue().map((c) => [c.id, c]));
  for (const c of picker) {
    assert.deepEqual(Object.keys(c.facts).sort(), [
      "price_aud",
      "range_km",
      "seats",
    ]);
    for (const [key, f] of Object.entries(c.facts)) {
      assert.equal(f.value, shown.get(c.id)!.facts[key].value);
      assert.deepEqual(f.sourceIds, []);
    }
  }
  assert.ok(
    JSON.stringify(picker).length < 500_000,
    "the selection list stays small",
  );
});
test("hidden sources stay out of the public registry", () => {
  const ids = new Set(publicSources().map((s) => s.id));
  for (const c of catalogue())
    for (const s of publicPack(c.id).sources) assert.ok(ids.has(s.id));
  // Some source is cited only by withheld figures, so the registry is smaller than the research.
  assert.ok(ids.size < research().sources.length);
});
test("explorer equipment answers come from supplied variants only", () => {
  const equipment = publicEquipment();
  assert.ok(Object.keys(equipment).length > 0);
  const original = new Set(
    publicCatalogue()
      .filter((c) => c.vehicleClass === "passenger")
      .map((c) => c.id),
  );
  for (const id of Object.keys(equipment)) assert.ok(original.has(id));
});
test("rankings use verified prices only", () => {
  // The hidden price would win if it were read; the verified one must.
  const cheapHidden = car(
    "a",
    "x",
    fact({ value: 10_000, status: "not_verified" }),
  );
  const masked = {
    ...cheapHidden,
    facts: { price_aud: fact({ value: null }) },
  };
  const dear = car("b", "x", fact({ value: 50_000 }));
  assert.equal(defaultTrim([masked, dear]).id, "b");
  const real = publicCatalogue().filter((c) => c.family === "byd-sealion-7");
  assert.ok(defaultTrim(real));
});
test("vehicle types split the fleet; passenger cars are the default view", () => {
  const cars = pickerCatalogue();
  const families = familyOrder(cars);
  assert.equal(families.length, 192, "every family but Model Y");
  const initial = fleetSelection(cars, new URLSearchParams());
  assert.equal(initial.type, "cars");
  const byId = new Map(cars.map((c) => [c.id, c]));
  const shown = fleetView(cars, initial).ids;
  assert.ok(shown.length > 100 && shown.length < families.length);
  assert.ok(
    shown.every((id) =>
      ["passenger", "ute"].includes(byId.get(id)!.vehicleClass),
    ),
  );
  // Featured families lead, as they did when there were nine.
  assert.deepEqual(
    shown.slice(0, 3).map((id) => byId.get(id)!.family),
    ["byd-sealion-7", "geely-ex5", "zeekr-7x"],
  );
  // The types partition the families.
  const parts = vehicleTypes
    .filter((t) => t.value !== "all")
    .map(
      (t) => fleetView(cars, { ids: initial.ids, type: t.value, q: "" }).ids,
    );
  assert.equal(
    parts.reduce((n, p) => n + p.length, 0),
    fleetView(cars, { ids: initial.ids, type: "all", q: "" }).ids.length,
  );
  assert.ok(cars.every((c) => inVehicleType(c, "all")));
});
test("search narrows by brand or model, and a miss keeps the type's list", () => {
  const cars = pickerCatalogue();
  const { ids } = fleetSelection(cars, new URLSearchParams());
  const byId = new Map(cars.map((c) => [c.id, c]));
  const volvo = fleetView(cars, { ids, type: "cars", q: "volvo" });
  assert.ok(volvo.ids.length > 0 && !volvo.noMatch);
  assert.ok(volvo.ids.every((id) => byId.get(id)!.brand === "Volvo"));
  const miss = fleetView(cars, { ids, type: "cars", q: "zzzz" });
  assert.equal(miss.noMatch, true);
  assert.equal(miss.ids.length, miss.total);
});
test("links keep only the trims that differ from the default", () => {
  const cars = pickerCatalogue();
  const initial = fleetSelection(cars, new URLSearchParams());
  assert.deepEqual(changedTrims(cars, initial.ids), []);
  const other = cars.find((c) => c.id === "byd_sealion_7__performance_awd__2")!;
  const next = fleetSelection(cars, new URLSearchParams({ fleet: other.id }));
  assert.deepEqual(changedTrims(cars, next.ids), [other.id]);
  // A link to a family outside the default type opens on that type.
  const van = cars.find((c) => c.vehicleClass === "van")!;
  const linked = fleetSelection(
    cars,
    new URLSearchParams({ focus: van.family }),
  );
  assert.equal(linked.type, "van");
  assert.equal(
    fleetView(cars, linked).ids[linked.index],
    linked.ids.find(
      (id) => cars.find((c) => c.id === id)!.family === van.family,
    ),
  );
});
test("the fleet page sends the cars in view, not the catalogue", () => {
  const props = fleetProps(new URLSearchParams());
  assert.ok(props.initialPacks.length <= 2 * WINDOW + 2);
  assert.equal(props.initialPacks[0].car.id, props.initial.baseline);
  assert.ok(props.cars.length > props.initialPacks.length * 10);
  const bytes = JSON.stringify(props).length;
  assert.ok(bytes < 1_000_000, `fleet props are ${bytes} bytes`);
});
test("values that are not text or numbers read as words, years never as null", () => {
  assert.equal(formatValue(true), "Yes");
  assert.equal(formatValue(false), "No");
  assert.equal(
    formatValue({ years: 7, km_unlimited: true }),
    "years: 7; km unlimited: Yes",
  );
  assert.equal(formatValue(["a", null, 2000]), "a, 2,000");
  assert.equal(formatValue(NaN), NOT_CONFIRMED);
  assert.equal(formatValue({}), NOT_CONFIRMED);
  assert.equal(
    formatFact(fact({ value: { a: 1 } as unknown as number })),
    "a: 1",
  );
  assert.equal(formatFact(fact({ value: 52_000, unit: "AUD" })), "A$52,000");
  assert.equal(
    formatFact(fact({ value: "From 52,000", unit: "AUD" })),
    "From 52,000",
  );
  assert.equal(formatFact(fact({ value: 482, unit: "km" })), "482 km");
  assert.equal(formatFact(fact({ value: null, unit: "km" })), NOT_CONFIRMED);
  assert.equal(formatYear(null), "Model year not confirmed");
  assert.equal(formatYear(undefined), "Model year not confirmed");
  assert.equal(formatYear("Model year unverified"), "Model year not confirmed");
  assert.equal(formatYear(2026), "2026");
  assert.equal(formatYear("MY26.50"), "MY26.50");
});
test("a pair report for withheld figures names none of them", () => {
  const van = catalogue().find((c) => c.vehicleClass === "van")!;
  const report = makeReport([publicPack(van.id)], "/x");
  for (const c of report.keyFacts) {
    assert.equal(c.confirmed, false);
    assert.equal(c.value, NOT_CONFIRMED);
    assert.deepEqual(c.sources, []);
  }
  assert.match(report.summary, /No figure here is verified yet/);
  assert.doesNotMatch(JSON.stringify(report), /\bA\$\d/);
  for (const q of report.questions)
    assert.match(
      q.answer,
      /not yet confirmed|check the driver profile|Eligibility/,
    );
});
test("the offline file's packs round-trip through source ids and are smaller for it", () => {
  const sources = new Map(publicSources().map((s) => [s.id, s]));
  let plain = 0,
    wire = 0;
  for (const c of catalogue().filter((_, i) => i % 7 === 0)) {
    // JSON drops undefined fields, so compare with the pack as JSON would carry it.
    const p = JSON.parse(JSON.stringify(publicPack(c.id)));
    const json = JSON.stringify(toWire(p));
    assert.deepEqual(
      fromWire(JSON.parse(json), (id) => sources.get(id)),
      p,
      c.id,
    );
    plain += JSON.stringify(p).length;
    wire += json.length;
  }
  assert.ok(wire < plain * 0.9, `${wire} of ${plain} bytes`);
});
