import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Detail from "../src/components/detail";
import { WithEvidence } from "../src/components/with-evidence";
import { catalogueSnapshot, pack } from "../src/lib/data";
import { brandUpdatePackets } from "../src/lib/brand-update-registry";

test("new brand-packet versions render complete exact detail and per-claim evidence controls", () => {
  const snapshot = catalogueSnapshot();
  const { data } = snapshot;
  const ids = brandUpdatePackets.flatMap((packet) =>
    packet.variants.map((variant) => variant.id),
  );
  assert.ok(ids.length > 0, "Exercise a real newly added version");
  for (const id of ids) {
    const full = pack(id, snapshot);
    const html = renderToStaticMarkup(
      createElement(
        WithEvidence,
        null,
        createElement(Detail, { pack: full, criteria: data.criteria }),
      ),
    );
    assert.equal((html.match(/<h1\b/g) || []).length, 1, id);
    assert.ok(html.includes(encodeURIComponent(id)), id);
    assert.ok(html.includes("Choose vehicles to compare"), id);
    assert.equal(
      (html.match(/Report an issue with /g) || []).length,
      Object.keys(full.car.facts).length + data.criteria.length + 1,
      id,
    );
    assert.doesNotMatch(html, />NaN</, id);
  }
});
