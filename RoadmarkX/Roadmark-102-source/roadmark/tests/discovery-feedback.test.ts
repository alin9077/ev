import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { VisualActionFeedback } from "../src/components/visual-action-feedback";
test("local action feedback uses visible in-flow text and no duplicate live announcement", () => {
  for (const message of [
    "Link copied, including the filters and trims in the view you shared.",
    "Copy the address from your browser to share this view.",
    "Choose up to three exact trims. Remove one to add another.",
    "Added to comparison.",
    "Removed from comparison.",
  ]) {
    const html = renderToStaticMarkup(
      createElement(VisualActionFeedback, { message }),
    );
    assert.ok(html.includes(message));
    assert.ok(html.includes('class="discovery-action-feedback small muted"'));
    assert.ok(!html.includes("sr-only"));
    assert.ok(html.includes('aria-hidden="true"'));
    assert.ok(!html.includes('role="status"'));
  }
});
test("empty feedback adds no unfinished placeholder or layout row", () => {
  assert.equal(
    renderToStaticMarkup(createElement(VisualActionFeedback, {})),
    "",
  );
  assert.equal(
    renderToStaticMarkup(createElement(VisualActionFeedback, { message: "" })),
    "",
  );
});
test("share card and ranking actions have local feedback while the parent retains one action live region", () => {
  const source = readFileSync(
    new URL("../src/components/discovery.tsx", import.meta.url),
    "utf8",
  );
  assert.equal((source.match(/<VisualActionFeedback\b/g) || []).length, 3);
  assert.equal(
    (source.match(/className="sr-only" role="status"/g) || []).length,
    1,
  );
  assert.ok(source.includes('visibleFeedback?.kind === "share"'));
  assert.ok(source.includes("visibleFeedback.carId === c.id"));
  assert.ok(source.includes("visibleFeedback.carId === e.car.id"));
  assert.ok(source.includes("setVisibleFeedback(null)"));
  assert.ok(source.includes("announceSelection("));
  assert.ok(source.includes("announceShare("));
  assert.ok(source.includes('setFeedback("Selection cleared.")'));
});
test("local feedback styles wrap in flow without introducing a new fixed overlay", () => {
  const css = readFileSync(
    new URL("../src/app/globals.css", import.meta.url),
    "utf8",
  );
  const block = css.match(/\.discovery-action-feedback\s*\{([^}]+)\}/)?.[1];
  assert.ok(block?.includes("overflow-wrap: anywhere"));
  assert.ok(!block?.includes("position:"));
  assert.ok(css.includes(".discovery-ranking .discovery-action-feedback"));
  assert.match(
    css,
    /\.discovery-ranking \.discovery-action-feedback\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/,
  );
});
