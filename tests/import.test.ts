import fs from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import {
  VEHICLE_CLASSES,
  hiddenFacts,
  isExpiredOffer,
  isHiddenFact,
  isVerifiedFact,
  verifiedFacts,
} from "../src/lib/verification";
import { cleanReaderText, limitQualification } from "../src/lib/reader-text";
import {
  CONFIRMING_SOURCE_TYPES,
  SOURCE_TYPES,
  normaliseSourceType,
} from "../src/lib/source-types";
import type { Fact, Grade } from "../src/lib/types";

const cars = catalogue();
const archive = (name: string) =>
  JSON.parse(fs.readFileSync(`data/research-archive/${name}`, "utf8"));
const fact = (grade: Grade | undefined, value: Fact["value"] = 1): Fact =>
  ({ value, status: "standard", grade }) as Fact;

test("visible means a value with grade confirmed, reported or established", () => {
  for (const g of ["confirmed", "reported", "established"] as const)
    assert.equal(isVerifiedFact(fact(g)), true, g);
  for (const g of ["check", "not_published", "unrated", undefined] as const)
    assert.equal(isVerifiedFact(fact(g)), false, String(g));
  // Unknown is neither verified nor hidden: there is nothing to hide.
  assert.equal(isVerifiedFact(fact("confirmed", null)), false);
  assert.equal(isHiddenFact(fact("check", null)), false);
  assert.equal(isHiddenFact(fact("check")), true);
  assert.equal(
    isVerifiedFact({ ...fact("confirmed"), status: "not_verified" }),
    false,
  );
});

test("every variant has all 22 fact slots, each graded, and a known vehicle class", () => {
  assert.equal(cars.length, 433);
  for (const c of cars) {
    assert.equal(Object.keys(c.facts).length, 22, c.id);
    assert.ok(VEHICLE_CLASSES.includes(c.vehicleClass), c.id);
    for (const f of Object.values(c.facts))
      assert.ok(f.grade, `${c.id}/${f.key}`);
  }
  const byClass = Object.fromEntries(
    VEHICLE_CLASSES.map((k) => [
      k,
      cars.filter((c) => c.vehicleClass === k).length,
    ]),
  );
  assert.deepEqual(byClass, {
    passenger: 351,
    ute: 5,
    van: 29,
    truck: 24,
    bus: 7,
    motorcycle: 17,
  });
});

test("ids, slugs and routes are unique and in the app's id format", () => {
  assert.equal(new Set(cars.map((c) => c.id)).size, 433);
  assert.equal(new Set(cars.map((c) => `${c.family}/${c.slug}`)).size, 433);
  for (const c of cars)
    assert.match(c.id, /^[a-z0-9_]+__[a-z0-9_]+__\d+$/, c.id);
});

test("units and formats follow the app's conventions", () => {
  const units: Record<string, string> = {
    price_aud: "AUD",
    range_km: "km",
    battery_kwh: "kWh",
    ac_kw: "kW",
    dc_peak_kw: "kW",
    towing_braked_kg: "kg",
    length_mm: "mm",
    turning_circle_m: "m",
    zero_to_100_s: "s",
  };
  for (const c of cars) {
    for (const [k, u] of Object.entries(units)) {
      const f = c.facts[k];
      assert.equal(f.unit, u, `${c.id}/${k}`);
      assert.ok(
        f.value === null || typeof f.value === "number",
        `${c.id}/${k}`,
      );
    }
    for (const k of ["warranty", "battery_warranty"]) {
      const v = c.facts[k].value;
      assert.ok(
        v === null ||
          /^\d+(\.\d)? years? \/ (unlimited km|[\d,]+ km|distance limit unconfirmed)$/.test(
            String(v),
          ),
        `${c.id}/${k}: ${v}`,
      );
    }
    assert.ok(Number.isInteger(c.facts.price_aud.value ?? 0), c.id);
    assert.ok(["FWD", "RWD", "AWD", "Unknown"].includes(c.drive), c.id);
  }
});

test("original 34: only the logged changes differ, and hidden facts match the report", () => {
  const log = archive("change-log-original-34.json").changes as {
    variant: string;
    kind: string;
    key: string;
    decision: string;
    new: unknown;
  }[];
  const original = new Set(
    (
      JSON.parse(
        fs.readFileSync("data/au_ev_all_variants_2026-10-06.json", "utf8"),
      ) as { variants: { id: string }[] }
    ).variants.map((v) => v.id),
  );
  assert.equal(original.size, 34);
  const changed = log.filter(
    (c) => c.kind === "fact" && ["adopted", "filled"].includes(c.decision),
  );
  // 32 values were adopted or filled from Dot; three of them (EV3 AWD price and braked towing, Model 3 Performance
  // ground clearance) are corrected in data/manual-corrections.json back to the app's own value.
  assert.equal(changed.length, 29);
  for (const c of changed)
    assert.deepEqual(
      cars.find((x) => x.id === c.variant)!.facts[c.key].value,
      c.new,
      `${c.variant}/${c.key}`,
    );
  const hidden = cars
    .filter((c) => original.has(c.id))
    .flatMap((c) => Object.keys(hiddenFacts(c)).map((k) => `${c.id}/${k}`));
  assert.deepEqual(
    hidden,
    archive("hidden-facts.json").originalHidden.map(
      (h: { variant: string; key: string }) => `${h.variant}/${h.key}`,
    ),
  );
  // Every value the app supplied that Dot did not contradict stays visible.
  const shown = cars
    .filter((c) => original.has(c.id))
    .reduce((n, c) => n + Object.keys(verifiedFacts(c)).length, 0);
  assert.equal(shown, 737);
});

test("imported equipment rows are complete, graded and cite known sources", () => {
  const sources = new Set(research().sources.map((s) => s.id));
  for (const id of [
    "volvo_ex30_my27__plus_p5_long_range_electric__1",
    cars[cars.length - 1].id,
  ].filter((x) => cars.some((c) => c.id === x))) {
    const p = pack(id);
    assert.equal(p.features.length, 69);
    for (const f of p.features) {
      assert.ok(f.grade, `${id}/${f.criterion}`);
      assert.ok(f.source_ids.every((s) => sources.has(s)));
    }
  }
});

test("archived source references resolve", () => {
  const known = new Set(research().sources.map((s) => s.id));
  for (const s of archive("sources-archive.json").sources as { id: string }[])
    known.add(s.id);
  const extra = archive("extra-facts.json");
  for (const id of extra.sourceIds as string[])
    assert.ok(known.has(id), `unknown archived source ${id}`);
  const ids = new Set(cars.map((c) => c.id));
  for (const id of Object.keys(extra.variants)) assert.ok(ids.has(id), id);
  for (const id of Object.keys(archive("variant-meta.json").variants))
    assert.ok(ids.has(id), id);
});

const corrections = JSON.parse(
  fs.readFileSync("data/manual-corrections.json", "utf8"),
) as {
  corrections: {
    id: string;
    variant: string;
    field: string;
    value?: unknown;
    grade?: Grade;
    qualification?: string;
  }[];
};
const everyFact = cars.flatMap((c) =>
  Object.values(c.facts).map((f) => ({ car: c, fact: f })),
);
const readerTexts = everyFact.flatMap(({ car, fact }) =>
  [
    ["basis", fact.basis],
    ["comparisonBasis", fact.comparisonBasis],
    ["scope", fact.scope],
    ...fact.qualifications.map((q) => ["qualification", q]),
  ].map(([field, text]) => ({
    where: `${car.id}/${fact.key}/${field}`,
    text: String(text),
  })),
);

test("no fact shows the literal 'undefined' or 'null' as a scope, basis or note", () => {
  for (const { where, text } of readerTexts)
    assert.doesNotMatch(text, /\b(undefined|null|NaN)\b/, where);
  for (const { car, fact } of everyFact)
    assert.equal(typeof fact.scope, "string", `${car.id}/${fact.key}`);
  // The original variants had no scope of their own: the model generation (or nothing) stands in.
  const ex5 = cars.find((c) => c.id === "geely_ex5__complete__3")!;
  assert.notEqual(ex5.facts.price_aud.scope, "undefined");
});

test("reader text carries no locators, API paths, JSON, field names or researcher instructions", () => {
  const junk: [string, RegExp][] = [
    ["API path", /categories\[/],
    ["JSON or dict", /[{}]|\[\s*["']|["']\s*:/],
    ["source locator", /Source locator/i],
    ["URL", /https?:\/\//],
    ["snake_case field", /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/],
    [
      "researcher instruction",
      /\b(retain(s|ed)?(?![- ]capacity)|unranked|keep separate|kept separate|stay separate|remains? separate|stays? null|remains? null|do not|must not|never)\b/i,
    ],
  ];
  for (const { where, text } of readerTexts)
    for (const [name, rx] of junk)
      assert.doesNotMatch(text, rx, `${name}: ${where}`);
  for (const { where, text } of readerTexts)
    if (where.endsWith("/qualification"))
      assert.ok(text.length <= 400, `${where} is ${text.length} characters`);
});

test("reader-text rules rewrite or drop what they should", () => {
  const clean = (t: string, kind: "basis" | "sentence" = "sentence") =>
    cleanReaderText(t, { kind });
  assert.equal(
    clean('Source locator: {"row": "Range", "url": "https://x.test"}'),
    "",
  );
  assert.equal(clean("Source locator: PDF page 4, Max AC charging power"), "");
  assert.equal(
    clean(
      "categories[id=chargingCategory].attributes[id=chargingPowerDCMax-G1X]; Maximum charging power with direct current (DC) (Performance Battery)",
    ),
    "Maximum DC charging power as published by the manufacturer; applies to the Performance Battery.",
  );
  assert.equal(
    clean(
      "categories[id=bodyCategory].attributes[id=wheelBase-G1X]; Wheelbase",
    ),
    "",
  );
  assert.equal(clean("length_mm", "basis"), "Length");
  assert.equal(clean("before_on_road_costs", "basis"), "Before on-road costs");
  assert.equal(
    clean(
      "Exact named Australian configuration; retain source conditions",
      "basis",
    ),
    "Exact named Australian configuration",
  );
  assert.equal(
    clean(
      "Seats-up describes the load state; no standard method is established, so this volume is visible but unranked.",
    ),
    "Seats-up describes the load state.",
  );
  // A battery-warranty term is not researcher talk.
  assert.equal(
    clean("No retained-capacity threshold is implied."),
    "No retained-capacity threshold is implied.",
  );
  const long = `${"A sentence that runs on. ".repeat(30)}`.trim();
  const cut = limitQualification(long);
  assert.ok(cut.length <= 400 && cut.endsWith("."));
});

test("no trim repeats the model, equals it, or carries advertisement or sheet text", () => {
  for (const c of cars) {
    const trim = c.trim.toLowerCase();
    const model = c.model.toLowerCase();
    assert.notEqual(trim, model, c.id);
    assert.ok(!trim.startsWith(`${model} `), `${c.id}: ${c.trim}`);
    assert.doesNotMatch(
      c.trim,
      /residual|advertis|\bsheet\b|offer\b|provisional|pre-delivery|·\s*MY\d/i,
      c.id,
    );
  }
  const trimOf = (id: string) => cars.find((c) => c.id === id)!.trim;
  assert.equal(trimOf("porsche_taycan_sedan_current__taycan__1"), "Base RWD");
  assert.equal(trimOf("porsche_taycan_sedan_current__taycan_4s__5"), "4S");
  assert.equal(
    trimOf("porsche_macan_electric_current__macan_electric__1"),
    "Base RWD",
  );
});

test("brand, model and trim are never identical across two variants", () => {
  const names = cars.map((c) =>
    `${c.brand}|${c.model}|${c.trim}`.toLowerCase(),
  );
  assert.equal(new Set(names).size, cars.length);
});

test("every correction in data/manual-corrections.json is applied", () => {
  assert.ok(corrections.corrections.length >= 10);
  for (const c of corrections.corrections) {
    const car = cars.find((x) => x.id === c.variant);
    assert.ok(car, `${c.id}: unknown variant`);
    if (c.field === "record_state") {
      assert.equal(car.availability, c.value, c.id);
      continue;
    }
    const f = car.facts[c.field];
    if (c.value !== undefined) assert.equal(f.value, c.value, c.id);
    if (c.grade) assert.equal(f.grade, c.grade, c.id);
    if (c.qualification)
      assert.ok(f.qualifications.includes(c.qualification), c.id);
    assert.ok(f.sourceIds.length > 0, c.id);
  }
  const ev3 = cars.find((c) => c.id === "kia_ev3__gt_line_awd_long_range__5")!;
  assert.equal(ev3.facts.price_aud.value, 66490);
  assert.equal(ev3.facts.towing_braked_kg.value, 1000);
  const m3 = cars.find((c) => c.id === "tesla_model_3__premium_rwd__2")!;
  assert.equal(m3.facts.dc_peak_kw.grade, "reported");
  for (const id of [
    "volkswagen_id_5_my26__pro__1",
    "volkswagen_id_5_my26__gtx__2",
  ])
    assert.equal(cars.find((c) => c.id === id)!.availability, "outgoing");
});

test("prices on announced versions and on outgoing versions with no order confirmation are labelled", () => {
  const labelled = cars.filter((c) =>
    /^(Announced|Last listed) ·/.test(c.facts.price_aud.basis),
  );
  assert.ok(labelled.length >= 40);
  for (const c of labelled) {
    assert.ok(
      c.availability === "announced_provisional" ||
        c.availability === "outgoing",
      c.id,
    );
    // Like-for-like grouping still sees the plain price basis.
    assert.doesNotMatch(
      c.facts.price_aud.comparisonBasis,
      /^(Announced|Last listed)/,
      c.id,
    );
  }
  for (const c of cars)
    if (
      c.availability === "announced_provisional" &&
      c.facts.price_aud.value !== null
    )
      assert.match(c.facts.price_aud.basis, /^Announced ·/, c.id);
  for (const id of [
    "geely_ex5__complete__3",
    "geely_ex5__inspire__4",
    "zeekr_7x__black_special_edition_awd__4",
    "byd_atto_3_legacy__premium_fwd__2",
  ])
    assert.match(
      cars.find((c) => c.id === id)!.facts.price_aud.basis,
      /^Last listed ·/,
      id,
    );
});

test("source types use one small vocabulary and 'confirmed' needs a maker, regulator or test authority", () => {
  const sources = research().sources;
  for (const s of sources)
    assert.ok(
      (SOURCE_TYPES as readonly string[]).includes(s.source_type),
      `${s.id}: ${s.source_type}`,
    );
  assert.equal(
    normaliseSourceType("authorised_dealer", "https://www.mgmotor.com.au/x"),
    "manufacturer",
  );
  assert.equal(
    normaliseSourceType(
      "authorised_dealer",
      "https://www.volvocarsdoncaster.com.au/x",
    ),
    "authorised_dealer",
  );
  assert.equal(
    normaliseSourceType("primary_manufacturer_content_mirror"),
    "manufacturer",
  );
  const type = new Map(sources.map((s) => [s.id, s.source_type]));
  for (const { car, fact } of everyFact) {
    if (fact.grade !== "confirmed" || fact.value === null) continue;
    const types = fact.sourceIds
      .map((i) => type.get(i))
      .filter(Boolean) as string[];
    if (!types.length) continue;
    assert.ok(
      types.some((t) =>
        (CONFIRMING_SOURCE_TYPES as readonly string[]).includes(t),
      ),
      `${car.id}/${fact.key} is confirmed by ${types.join(", ")}`,
    );
  }
});

test("offers past their end date stop counting as verified", () => {
  const rows = cars.flatMap((c) =>
    pack(c.id).features.filter(
      (f) => f.criterion === "driveaway_price" && f.valid_until,
    ),
  );
  assert.ok(rows.length >= 9, "driveaway rows keep their end date");
  assert.equal(
    isExpiredOffer({ valid_until: "2026-10-31" }, "2026-11-04"),
    true,
  );
  assert.equal(
    isExpiredOffer({ valid_until: "2026-10-31" }, "2026-10-31"),
    false,
  );
  assert.equal(isExpiredOffer({}, "2026-11-04"), false);
  const row = { ...fact("reported"), valid_until: "2026-10-31" };
  assert.equal(isVerifiedFact(row), false);
  assert.equal(
    isVerifiedFact({ ...fact("reported"), valid_until: "2099-01-01" }),
    true,
  );
  // The four visible driveaway offers that ended on 31 October are no longer shown.
  for (const r of rows.filter((x) => x.valid_until === "2026-10-31"))
    assert.equal(isVerifiedFact({ ...r }), false, r.variant_id);
});
