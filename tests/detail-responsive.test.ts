import test from "node:test";
import assert from "node:assert/strict";

import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);

// Static guards supplement, but do not replace, the rendered reflow tests.
test("exact-detail grids keep zero-minimum tracks at all three existing column counts", () => {
  const rules = [...css.matchAll(/\.detail-facts\s*\{([^}]+)\}/g)];
  assert.equal(rules.length, 3);
  assert.deepEqual(
    rules.map(
      (rule) => rule[1].match(/grid-template-columns:\s*([^;]+);/)?.[1],
    ),
    [
      "repeat(3, minmax(0, 1fr))",
      "repeat(2, minmax(0, 1fr))",
      "minmax(0, 1fr)",
    ],
  );
  const narrow = css.slice(
    css.indexOf("@media (max-width: 767px)"),
    css.indexOf("@media (max-width: 359px)"),
  );
  assert.match(
    narrow,
    /\.detail-facts\s*\{\s*grid-template-columns: minmax\(0, 1fr\);\s*gap: 0;\s*\}/,
  );
});

test("exact-detail evidence can shrink and wrap long source tokens without clipping", () => {
  const rules = [...css.matchAll(/\.detail-facts section\s*\{([^}]+)\}/g)];
  assert.equal(rules.length, 1);
  const declarations = rules[0][1];
  assert.match(declarations, /min-width:\s*0;/);
  assert.match(declarations, /overflow-wrap:\s*anywhere;/);
  assert.doesNotMatch(declarations, /(?:^|[;\n])\s*overflow(?:-[xy])?:/);
  assert.doesNotMatch(declarations, /text-overflow:|white-space:\s*nowrap/);
});
