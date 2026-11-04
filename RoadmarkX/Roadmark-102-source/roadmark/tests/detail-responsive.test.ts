import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const css = readFileSync(
  new URL("../src/app/globals.css", import.meta.url),
  "utf8",
);
const sha = (text: string) =>
  createHash("sha256").update(text).digest("hex");

// Static guards supplement, but do not replace, the rendered reflow tests.
test("exact-detail grids keep zero-minimum tracks at all three existing column counts", () => {
  const rules = [...css.matchAll(/\.detail-facts\s*\{([^}]+)\}/g)];
  assert.equal(rules.length, 3);
  assert.deepEqual(
    rules.map((rule) => rule[1].match(/grid-template-columns:\s*([^;]+);/)?.[1]),
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

test("the reviewed reflow delta preserves every other checkpoint97 CSS byte", () => {
  const replacements = [
    {
      before: ".detail-facts section {\n  padding: 24px 0;",
      after:
        ".detail-facts section {\n  min-width: 0;\n  overflow-wrap: anywhere;\n  padding: 24px 0;",
    },
    {
      before:
        "  .detail-facts {\n    grid-template-columns: 1fr;\n    gap: 0;\n  }",
      after:
        "  .detail-facts {\n    grid-template-columns: minmax(0, 1fr);\n    gap: 0;\n  }",
    },
  ];
  let previous = css;
  for (const replacement of replacements) {
    assert.equal(previous.split(replacement.after).length, 2);
    previous = previous.replace(replacement.after, replacement.before);
  }
  assert.equal(Buffer.byteLength(previous), 113703);
  assert.equal(
    sha(previous),
    "18bd4641d0b37f32dea2f54c9ed3d8a6169e6a7d4503cb62d37e1cb96343d74e",
  );
  assert.notEqual(sha(css), sha(previous));
});
