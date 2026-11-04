import fs from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import {
  VEHICLE_CLASSES,
  hiddenFacts,
  isHiddenFact,
  isVerifiedFact,
  verifiedFacts,
} from "../src/lib/verification";
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
  assert.equal(changed.length, 32);
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
