import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CarAvatar } from "../src/components/car-avatar";
import {
  avatarProfile,
  bodyTypeOf,
  carAvatarShape,
} from "../src/lib/car-avatar-shapes";
import { catalogue } from "../src/lib/data";
import { isTierOne } from "../src/lib/on-sale";
import type { Car } from "../src/lib/types";

const car = (
  facts: Record<string, number>,
  extra: Record<string, unknown> = {},
): Car =>
  ({
    modelId: "unmapped",
    vehicleClass: "passenger",
    facts: Object.fromEntries(
      Object.entries(facts).map(([k, value]) => [k, { value }]),
    ),
    ...extra,
  }) as unknown as Car;
const svg = (c: Car) =>
  renderToStaticMarkup(createElement(CarAvatar, { car: c }));

test("body type follows the car's own proportions", () => {
  const base = { length_mm: 4700, wheelbase_mm: 2800, seats: 5 };
  assert.equal(bodyTypeOf(car({ ...base, height_mm: 1440 })), "sedan");
  assert.equal(bodyTypeOf(car({ ...base, height_mm: 1620 })), "crossover");
  assert.equal(bodyTypeOf(car({ ...base, height_mm: 1750 })), "suv");
  assert.equal(
    bodyTypeOf(car({ length_mm: 4100, height_mm: 1550, wheelbase_mm: 2600 })),
    "compact",
  );
});

test("utes, six-plus seaters, vans and cars without a published length or height keep the class silhouette", () => {
  const ok = { length_mm: 4700, height_mm: 1700, wheelbase_mm: 2800 };
  assert.equal(bodyTypeOf(car({ ...ok, seats: 7 })), undefined);
  assert.equal(bodyTypeOf(car({ ...ok, seats: 6 })), undefined);
  assert.equal(bodyTypeOf(car(ok, { vehicleClass: "ute" })), undefined);
  assert.equal(bodyTypeOf(car(ok, { vehicleClass: "van" })), undefined);
  assert.equal(bodyTypeOf(car({ height_mm: 1700 })), undefined);
  assert.equal(bodyTypeOf(car({ length_mm: 4700 })), undefined);
  assert.equal(
    bodyTypeOf(car({ length_mm: 4700, height_mm: 1700, wheelbase_mm: 5000 })),
    undefined,
    "a wheelbase longer than the car is bad data, not a drawing",
  );
  assert.equal(avatarProfile(car({ height_mm: 1700 })).kind, "class");
});

test("the drawing is to scale: a longer car draws longer, a taller car draws taller", () => {
  const a = car({ length_mm: 4400, height_mm: 1600, wheelbase_mm: 2650 });
  const b = car({ length_mm: 4900, height_mm: 1600, wheelbase_mm: 2650 });
  const c = car({ length_mm: 4400, height_mm: 1700, wheelbase_mm: 2650 });
  // Absolute move/line/curve points only; arcs and relative moves carry radii.
  const points = (html: string) => {
    const d = [...html.matchAll(/class="car-avatar-body" d="([^"]+)"/g)][0][1];
    return [...d.matchAll(/[MLQ]([-\d.\s]+)/g)].flatMap((m) => {
      const n = m[1].trim().split(/\s+/).map(Number);
      return Array.from({ length: n.length / 2 }, (_, i) => [
        n[2 * i],
        n[2 * i + 1],
      ]);
    });
  };
  const xs = (h: string) => points(h).map((p) => p[0]);
  const ys = (h: string) => points(h).map((p) => p[1]);
  const width = (h: string) => Math.max(...xs(h)) - Math.min(...xs(h));
  const top = (h: string) => Math.min(...ys(h));
  assert.ok(width(svg(b)) > width(svg(a)));
  assert.ok(top(svg(c)) < top(svg(a)));
  assert.equal(svg(a), svg(structuredClone(a)), "deterministic");
});

test("a missing class silhouette stays the generic mark, and hand-drawn models are unchanged", () => {
  assert.match(svg(car({ height_mm: 1700 })), />EV</);
  const all = catalogue();
  const model = all.find((c) => carAvatarShape(c.modelId))!;
  assert.equal(avatarProfile(model).kind, "model");
  assert.doesNotMatch(svg(model), />EV</);
});

test("every Tier 1 version is drawn to scale or listed as a gap with a reason", () => {
  const tier1 = catalogue().filter(isTierOne);
  const kinds = new Set(tier1.map((c) => avatarProfile(c).kind));
  assert.ok(kinds.has("model") && kinds.has("body-type") && kinds.has("class"));
  const drawn = tier1.filter((c) => avatarProfile(c).kind !== "class");
  assert.ok(drawn.length > tier1.length / 2);
  for (const c of tier1.filter((c) => avatarProfile(c).kind === "class")) {
    const why =
      c.vehicleClass === "ute" ||
      Number(c.facts.seats?.value) >= 6 ||
      typeof c.facts.length_mm?.value !== "number" ||
      typeof c.facts.height_mm?.value !== "number" ||
      Number(c.facts.wheelbase_mm?.value) >= Number(c.facts.length_mm?.value) ||
      Number(c.facts.height_mm?.value) / Number(c.facts.length_mm?.value) >
        0.5 ||
      Number(c.facts.height_mm?.value) / Number(c.facts.length_mm?.value) <
        0.25;
    assert.ok(why, `${c.id} falls back without a recorded reason`);
  }
});
