import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Detail from "../src/components/detail";
import { catalogue, research, pack } from "../src/lib/data";

const cars = catalogue();
const data = research();
const snapshot = { cars, data };

test("exact equipment and warranty subclauses stay accessible inside native disclosures", () => {
  const car = cars.find(
    (c) => c.id.startsWith("lexus_es_bev") && c.trim.includes("350e"),
  )!;
  const html = renderToStaticMarkup(
    createElement(Detail, {
      pack: pack(car.id, snapshot),
      criteria: data.criteria,
    }),
  );
  assert.match(html, /Published equipment details/);
  assert.match(html, /Warranty conditions and separate cover/);
  assert.match(html, /Availability details/);
  assert.match(html, /ES300h is a hybrid/);
  assert.doesNotMatch(html, /main should add family audit/);
  for (const fact of Object.values(car.facts)) {
    const escaped = fact.label
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#x27;");
    assert.ok(html.includes(escaped), fact.key);
  }
  assert.ok(html.indexOf("Availability details") < html.indexOf("Essentials"));
  assert.equal((html.match(/<main\b/g) || []).length, 1);
});

test("established records without new subclauses keep their original essentials and equipment", () => {
  const car = cars.find((c) => c.modelId === "tesla_model_y")!;
  const html = renderToStaticMarkup(
    createElement(Detail, {
      pack: pack(car.id, snapshot),
      criteria: data.criteria,
    }),
  );
  assert.match(html, /<h2>Essentials<\/h2>/);
  assert.match(html, /<h2>Equipment<\/h2>/);
  assert.doesNotMatch(html, /Published equipment details/);
  assert.doesNotMatch(html, /Warranty conditions and separate cover/);
});
