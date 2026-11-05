import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogue, pack, research } from "../src/lib/data";
import {
  PLAIN_WORDS_BANNED,
  plainWords,
  plainWordsViolations,
} from "../src/lib/plain-words";
import Home from "../src/app/page";
import Discover from "../src/app/discover/page";
import Detail from "../src/components/detail";
import type { ReactNode } from "react";
import { compiledSource } from "./helpers/compiled-source";
import { experienceProps, selectedPackSources } from "../src/lib/page-props";
import { WithEvidence } from "../src/components/with-evidence";
import Methodology from "../src/app/methodology/page";

test("the detector finds each banned word, ignores data in scripts, and matches whole words", () => {
  for (const word of PLAIN_WORDS_BANNED)
    assert.deepEqual(plainWordsViolations(`<p>An ${word} here</p>`), [
      { word, count: 1 },
    ]);
  assert.equal(plainWordsViolations("<p>Ranking Eligible</p>").length, 0);
  assert.equal(plainWordsViolations("<p>ranking-eligible</p>").length, 1);
  assert.equal(plainWordsViolations("<p>Bounded  Configuration</p>").length, 1);
  assert.equal(
    plainWordsViolations("<script>tier 1 packet</script>").length,
    0,
  );
  assert.equal(plainWordsViolations("<p>packets</p>").length, 1);
  assert.equal(plainWordsViolations("<p>backpacket tier 10</p>").length, 0);
});

const pages: [string, () => string][] = [
  ["home", () => renderToStaticMarkup(createElement(Home))],
  ["discover", () => renderToStaticMarkup(createElement(Discover))],
  [
    "a version page",
    () => {
      const car = catalogue().find((c) => c.id.startsWith("kia_ev5"))!;
      return renderToStaticMarkup(
        createElement(
          WithEvidence,
          null,
          createElement(Detail, {
            pack: pack(car.id),
            criteria: research().criteria,
          }),
        ),
      );
    },
  ],
  ["methodology", () => renderToStaticMarkup(createElement(Methodology))],
];
for (const [name, render] of pages)
  test(`no internal vocabulary on ${name}`, () => {
    assert.deepEqual(plainWordsViolations(render()), []);
  });

test("no internal vocabulary on a comparison", () => {
  const Experience = compiledSource("src/components/experience.tsx", {
    "next/navigation": {
      useRouter: () => ({ push() {}, replace() {} }),
      usePathname: () => "/compare",
      useSearchParams: () => new URLSearchParams(),
    },
  }).default as (props: Record<string, unknown>) => ReactNode;
  const props = experienceProps({
    cars: "kia_ev5__air_2wd_standard_range__1,byd_sealion_7__premium_rwd__1",
  });
  const html = renderToStaticMarkup(
    createElement(
      WithEvidence,
      {
        sources: selectedPackSources(props.packs, research().sources),
      } as never,
      createElement(Experience, { mode: "compare", ...props }),
    ),
  );
  assert.match(html, /Sealion 7/);
  assert.deepEqual(plainWordsViolations(html), []);
});

test("display mapping swaps internal words and leaves ordinary text alone", () => {
  assert.equal(
    plainWords("Not established in bounded packet"),
    "Not established in this research",
  );
  assert.equal(
    plainWords("a comparison/ranking-eligible range"),
    "a comparison/can be ranked range",
  );
  assert.equal(
    plainWords("technical cohort remains source-scoped"),
    "technical cohort remains limited to the named source",
  );
  assert.equal(
    plainWords("outside this Tier 1 inheritance"),
    "outside this passenger-vehicle inheritance",
  );
  assert.equal(plainWords("Maker's list price"), "Maker's list price");
  assert.equal(plainWords(undefined), undefined);
  for (const word of PLAIN_WORDS_BANNED)
    assert.deepEqual(
      plainWordsViolations(plainWords(`An ${word} here`)),
      [],
      word,
    );
});

test("formerly failing version pages are clean, including the copy-for-AI text", async () => {
  const VariantPage = (await import("../src/app/cars/[family]/[variant]/page"))
    .default as (p: {
    params: Promise<{ family: string; variant: string }>;
  }) => Promise<React.ReactElement>;
  const cars = catalogue();
  for (const family of [
    "fonz-z-series",
    "alfa-romeo-junior",
    "mercedes-benz-eqb-city-edition",
  ]) {
    const car = cars.find((c) => c.family === family);
    assert.ok(car, family);
    const html = renderToStaticMarkup(
      await VariantPage({
        params: Promise.resolve({ family, variant: car.slug }),
      }),
    );
    assert.deepEqual(plainWordsViolations(html), [], family);
  }
});
