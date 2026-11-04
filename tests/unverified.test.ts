import { test } from "node:test";
import assert from "node:assert/strict";
import sitemap from "../src/app/sitemap";
import { GET as llms } from "../src/app/llms.txt/route";
import { generateMetadata } from "../src/app/cars/[family]/[variant]/page";
import { publicCatalogue, pickerCatalogue } from "../src/lib/data";
import { pickerCars } from "../src/lib/picker-cars";
import {
  isUnverifiedVehicle,
  unverifiedClasses,
  visibleFactCount,
} from "../src/lib/coverage";
import { unverifiedSuffix } from "../src/lib/fleet";
import { carPath } from "../src/lib/citable";

const cars = publicCatalogue();
const unverified = cars.filter(isUnverifiedVehicle);
const OTHER = ["van", "truck", "bus", "motorcycle"];

test("only vans, trucks, buses and motorcycles lack a single verified fact", () => {
  assert.ok(unverified.length > 0);
  assert.ok(unverified.every((c) => OTHER.includes(c.vehicleClass)));
  assert.ok(
    cars
      .filter((c) => OTHER.includes(c.vehicleClass))
      .every((c) => visibleFactCount(c) === 0),
  );
  assert.ok(
    cars
      .filter((c) => !OTHER.includes(c.vehicleClass))
      .every((c) => visibleFactCount(c) > 0),
  );
});
test("the sitemap and llms.txt leave out variants with no verified fact, and keep the rest", async () => {
  const urls = sitemap().map((e) => e.url);
  const text = await llms().text();
  for (const c of cars) {
    const path = carPath(c);
    const listed = !isUnverifiedVehicle(c);
    assert.equal(
      urls.some((u) => u.endsWith(path)),
      listed,
      `sitemap ${c.id}`,
    );
    assert.equal(text.includes(`${path})`), listed, `llms ${c.id}`);
  }
  assert.equal(
    urls.filter((u) => u.includes("/cars/")).length,
    cars.length - unverified.length,
  );
  assert.match(
    text,
    new RegExp(`a further ${unverified.length} vans, trucks, buses`),
  );
});
test("their pages are noindex and the others are not", async () => {
  for (const c of [unverified[0], cars.find((x) => !isUnverifiedVehicle(x))!]) {
    const meta = (await generateMetadata({
      params: Promise.resolve({ family: c.family, variant: c.slug }),
    })) as { robots?: { index: boolean; follow: boolean } };
    assert.deepEqual(
      meta.robots,
      isUnverifiedVehicle(c) ? { index: false, follow: true } : undefined,
    );
  }
});
test("the selection list flags unverified variants, and type menus say so", () => {
  const list = pickerCars();
  assert.equal(list.length, pickerCatalogue().length);
  const flagged = list.filter((c) => c.unverified);
  assert.deepEqual(
    flagged.map((c) => c.id).sort(),
    unverified.map((c) => c.id).sort(),
  );
  const classes = unverifiedClasses(list);
  for (const cls of OTHER)
    assert.equal(
      classes.get(cls as "van")!.unverified,
      classes.get(cls as "van")!.variants,
    );
  assert.equal(classes.get("passenger")!.unverified, 0);
  assert.equal(unverifiedSuffix(list, "van"), " · unverified");
  assert.equal(unverifiedSuffix(list, "cars"), "");
  assert.match(unverifiedSuffix(list, "all"), /^ · \d+ unverified$/);
});
