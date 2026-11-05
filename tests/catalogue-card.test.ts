import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogue, research } from "../src/lib/data";
import { discoveryCars } from "../src/lib/discovery";
import {
  cardModel,
  standingSentences,
  thirdFigure,
  REPEATED_SENTENCE_LIMIT,
} from "../src/lib/catalogue-card";
import { CatalogueCard } from "../src/components/catalogue-card";
import { FootnoteProvider } from "../src/components/footnotes";
import {
  isDefaultListed,
  isOnSale,
  isTierOne,
  passengerEvCount,
} from "../src/lib/on-sale";
import {
  isOnSale as reportOnSale,
  isTierOne as reportTierOne,
} from "../scripts/reporting/reports";
import type { Car, Fact } from "../src/lib/types";

const all = catalogue();
const data = research();
const policy = { asOf: "2026-10-20" };
const listed = discoveryCars(all.filter(isDefaultListed));

const fact = (over: Partial<Fact> = {}): Fact => ({
  key: "range_km",
  label: "Range",
  value: 500,
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  status: "standard",
  sourceIds: [],
  date: "2026-10-10",
  market: "AU",
  scope: "x",
  issues: [],
  qualifications: [],
  ...over,
});
test("on-sale and Tier 1 definitions agree with the coverage report on every version", () => {
  for (const car of all) {
    assert.equal(isOnSale(car), reportOnSale(car), car.id);
    assert.equal(isTierOne(car), reportTierOne(car), car.id);
  }
  assert.equal(
    passengerEvCount(all),
    all.filter((c) => reportTierOne(c) && reportOnSale(c)).length,
  );
});

test("third figure is seats for 6+ seaters and DC 10–80% otherwise, never a mislabelled window", () => {
  const car = (seats: number | null, dc?: Partial<Fact>): Car =>
    ({
      facts: {
        ...(seats === null
          ? {}
          : { seats: fact({ key: "seats", value: seats, unit: "people" }) }),
        ...(dc
          ? {
              dc_charge_time_min: fact({
                key: "dc_charge_time_min",
                unit: "min",
                ...dc,
              }),
            }
          : {}),
      },
    }) as unknown as Car;
  assert.equal(thirdFigure(car(7)).kind, "seats");
  assert.equal(thirdFigure(car(6)).kind, "seats");
  assert.equal(
    thirdFigure(car(5, { value: 28, comparisonBasis: "10–80%" })).kind,
    "dc",
  );
  assert.equal(
    thirdFigure(car(5, { value: 28, comparisonBasis: "10–80%" })).label,
    "DC 10–80%",
  );
  assert.equal(
    thirdFigure(
      car(5, { value: 22, comparisonBasis: "30–80% SOC", basis: "30–80% SOC" }),
    ).label,
    "DC 30–80%",
  );
  assert.equal(thirdFigure(car(null)).fact, undefined);
});

test("a sentence shown on more than the limit of cards is a standing note, not card content", () => {
  const summaries = standingSentences(listed, data.sources, policy);
  const counts = new Map<string, number>();
  for (const car of listed) {
    const m = cardModel(car, data.sources, policy, summaries);
    for (const s of [m.strength?.text, m.tradeoff?.text, ...m.conditions])
      if (s) counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  assert.ok(
    [...counts.values()].every((n) => n <= REPEATED_SENTENCE_LIMIT),
    "no card sentence repeats on more than 20 cards",
  );
});

test("every default-listed card renders the required content and none of the removed text", () => {
  const standing = standingSentences(listed, data.sources, policy);
  assert.ok(listed.length > 250);
  let strengths = 0;
  for (const car of listed) {
    const model = cardModel(car, data.sources, policy, standing);
    const out = renderToStaticMarkup(
      createElement(
        FootnoteProvider,
        { sources: data.sources } as never,
        createElement(CatalogueCard, {
          card: model,
          car,
          selected: false,
          onToggle() {},
        }),
      ),
    );
    assert.ok(out.includes(car.brand) && out.includes(car.model), car.id);
    assert.match(out, /Compare \+/);
    assert.match(out, /On sale now|Order open or arriving|Not confirmed/);
    assert.match(out, />Price</);
    assert.match(out, />Range</);
    assert.doesNotMatch(
      out,
      /Buyer-use interpretation|Stock not verified|market-leading claim|shortlist trims/,
    );
    if (model.strength) strengths++;
  }
  assert.ok(strengths > 0);
});

test("default list is Tier 1 only and on sale", () => {
  assert.ok(listed.every((c) => isTierOne(c) && isOnSale(c)));
  assert.equal(listed.length, passengerEvCount(all));
});
