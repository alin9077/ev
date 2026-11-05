import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { EvidenceConditions } from "../src/components/evidence-conditions";
test("evidence conditions remain complete in an accessible native disclosure", () => {
  const conditions = ["WLTP is not real-world range.", "Stock is unverified."];
  const html = renderToStaticMarkup(
    createElement(EvidenceConditions, { conditions }),
  );
  assert.match(html, /<details class="evidence-conditions">/);
  assert.match(html, /<summary>Evidence &amp; conditions/);
  assert.match(html, /\(2\)/);
  for (const condition of conditions) assert.ok(html.includes(condition));
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.ok(!html.includes(' open="'));
});
test("empty conditions add no empty disclosure", () => {
  assert.equal(
    renderToStaticMarkup(createElement(EvidenceConditions, { conditions: [] })),
    "",
  );
});
