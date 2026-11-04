import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, pack, research } from "../src/lib/data";
import {
  attributes,
  discoveryCars,
  rankAttribute,
  buildStrengthsIndex,
} from "../src/lib/discovery";
import { curatedFleetCars } from "../src/lib/fleet";
import { currentBuyerSummary } from "../src/lib/selling-points";
import {
  carEvidenceIds,
  HERO_EVIDENCE_IDS,
  pageEvidenceSources,
} from "../src/lib/page-evidence";
import type { Source } from "../src/lib/types";
const all = catalogue();
const cars = discoveryCars(all);
const data = research();
const full = data.sources;
const scoped = pageEvidenceSources(full, { cars });
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };

test("page source scope preserves canonical object identity/order and every retained reference", () => {
  const ids = carEvidenceIds(cars);
  assert.deepEqual(
    scoped,
    full.filter((s) => ids.has(s.id)),
  );
  assert.equal(scoped.length, ids.size);
  for (const s of scoped)
    assert.equal(
      s,
      full.find((x) => x.id === s.id),
    );
  assert.ok(scoped.length < full.length);
  assert.ok(all.length > 0);
  assert.equal(cars.length, all.length);
  assert.ok(cars.some((car) => car.buyerSummary));
  assert.ok(cars.some((car) => !car.buyerSummary));
  assert.deepEqual(
    cars.map((car) => car.id),
    all.map((car) => car.id),
  );
  for (const [index, car] of cars.entries())
    assert.equal(car.buyerSummary, all[index].buyerSummary);
  assert.throws(
    () =>
      pageEvidenceSources(full, { cars, extraIds: ["missing-source-probe"] }),
    /missing sources/,
  );
  const before = JSON.stringify(cars);
  pageEvidenceSources(full, { cars });
  assert.equal(JSON.stringify(cars), before);
});

test("all seven attribute results and strength groups are unchanged across freshness states", () => {
  for (const day of ["2026-10-10", "2026-10-09", "2026-11-09", "2026-12-01"]) {
    const p = { ...policy, asOf: day };
    for (const a of attributes)
      assert.deepEqual(
        rankAttribute(cars, scoped, a.key, p),
        rankAttribute(cars, full, a.key, p),
      );
    assert.deepEqual(
      buildStrengthsIndex(cars, scoped, p),
      buildStrengthsIndex(cars, full, p),
    );
  }
});

test("every cached buyer summary retains exact source drift and date behavior", () => {
  for (const car of cars) {
    for (const day of [
      "2026-10-09",
      "2026-10-10",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-09",
      "2026-11-10",
    ]) {
      const p = { ...policy, asOf: day };
      assert.deepEqual(
        currentBuyerSummary(car.buyerSummary, scoped, p),
        currentBuyerSummary(car.buyerSummary, full, p),
        car.id + day,
      );
    }
  }
});

test("each summary source keeps full/scoped parity under holds, metadata drift and removal", () => {
  for (const source of scoped) {
    const affected = cars.find(
      (car) =>
        car.buyerSummary &&
        [
          ...car.buyerSummary.guardSourceIds,
          ...(car.buyerSummary.strength?.sourceIds || []),
          ...(car.buyerSummary.tradeoff?.sourceIds || []),
          ...(car.buyerSummary.expectedSourceSnapshots?.map((s) => s.id) || []),
        ].includes(source.id),
    );
    if (!affected) continue;
    for (const [field, value] of [
      ["url", ""],
      ["accessed_date", "2025-01-01"],
      ["title", "changed metadata"],
      ["publication_hold", true],
      ["conflict", true],
      ["access_limitation", "unavailable"],
    ] as const) {
      const changed: Source = { ...source, [field]: value };
      const replace = (values: Source[]) =>
        values.map((s) => (s.id === source.id ? changed : s));
      assert.deepEqual(
        currentBuyerSummary(affected.buyerSummary, replace(scoped), policy),
        currentBuyerSummary(affected.buyerSummary, replace(full), policy),
        source.id + field,
      );
    }
    assert.deepEqual(
      currentBuyerSummary(
        affected.buyerSummary,
        scoped.filter((s) => s.id !== source.id),
        policy,
      ),
      currentBuyerSummary(
        affected.buyerSummary,
        full.filter((s) => s.id !== source.id),
        policy,
      ),
    );
  }
});

test("all curated hero alternatives and explicit sales/FSD citations remain available", () => {
  const packs = curatedFleetCars(all).map((c) =>
    pack(c.id, { cars: all, data }),
  );
  assert.equal(packs.length, 34);
  const hero = pageEvidenceSources(full, {
    packs,
    extraIds: HERO_EVIDENCE_IDS,
  });
  const home = pageEvidenceSources(full, {
    cars,
    packs,
    extraIds: HERO_EVIDENCE_IDS,
  });
  for (const id of [
    ...HERO_EVIDENCE_IDS,
    ...packs.flatMap((p) => p.sources.map((s) => s.id)),
  ]) {
    assert.ok(hero.some((s) => s.id === id));
    assert.ok(home.some((s) => s.id === id));
  }
  for (const s of scoped) assert.ok(home.includes(s));
  assert.ok(hero.length < home.length && home.length < full.length);
});
