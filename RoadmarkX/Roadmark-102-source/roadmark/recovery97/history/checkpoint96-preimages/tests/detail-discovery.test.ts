import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Detail from "../src/components/detail";
import Discover from "../src/app/discover/page";
import Discovery from "../src/components/discovery";
import { WithEvidence } from "../src/components/with-evidence";
import { catalogue, pack, research } from "../src/lib/data";
test("exact detail starts a same-class comparison with only the requested version selected", () => {
  const van = catalogue().find((c) => c.vehicleClass === "van")!;
  const html = renderToStaticMarkup(
    createElement(
      WithEvidence,
      null,
      createElement(Detail, {
        pack: pack(van.id),
        criteria: research().criteria,
      }),
    ),
  );
  assert.ok(
    html.includes(
      `/discover?selected=${encodeURIComponent(van.id)}&amp;class=van`,
    ),
  );
  assert.ok(html.includes("Choose vehicles to compare"));
  assert.ok(!html.includes("cars=tesla_model_y"));
  assert.equal(
    (html.match(/Report an issue with /g) || []).length,
    Object.keys(van.facts).length + research().criteria.length + 1,
  );
});
test("server discovery route exists with one main heading and catalogue controls", () => {
  const html = renderToStaticMarkup(createElement(Discover));
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(html.includes("Vehicle type"));
  assert.ok(html.includes("Stock evidence"));
});

test("unknown MY and manufacturer-only listing stay explicit in exact detail", () => {
  const c = catalogue().find((c) => c.modelId === "mini_cooper_j01")!;
  const html = renderToStaticMarkup(
    createElement(
      WithEvidence,
      null,
      createElement(Detail, {
        pack: pack(c.id),
        criteria: research().criteria,
      }),
    ),
  );
  assert.ok(html.includes("MY unverified"));
  assert.ok(html.includes("Current manufacturer listing"));
});

test("captured build scope remains visible when dated buyer copy is absent", () => {
  const bounded = catalogue()
    .filter((c) => c.configurationEvidence)
    .map((c) => ({ ...c, buyerSummary: undefined }));
  assert.ok(bounded.length > 0, "Bounded catalogue fixtures must be present");
  const sources = research().sources;
  // Discovery deliberately renders twelve initial cards. Check each bounded
  // record in twelve-card batches rather than weakening progressive rendering.
  const firstPage = renderToStaticMarkup(
    createElement(
      WithEvidence,
      null,
      createElement(Discovery, { cars: bounded, sources }),
    ),
  );
  assert.equal(
    (
      firstPage.match(/Captured configuration · specifications incomplete/g) ||
      []
    ).length,
    Math.min(12, bounded.length),
  );
  const html = Array.from(
    { length: Math.ceil(bounded.length / 12) },
    (_, page) =>
      renderToStaticMarkup(
        createElement(
          WithEvidence,
          null,
          createElement(Discovery, {
            cars: bounded.slice(page * 12, page * 12 + 12),
            sources,
          }),
        ),
      ),
  ).join("");
  for (const car of bounded) {
    const escaped = car
      .configurationEvidence!.projectionScope.replaceAll("&", "&amp;")
      .replaceAll("'", "&#x27;");
    assert.ok(html.includes(escaped));
  }
  assert.ok(html.includes("F14 9675"));
  assert.ok(html.includes("B4B4"));
  assert.ok(html.includes("MSIBN1C"));
  assert.equal(
    (html.match(/Captured configuration · specifications incomplete/g) || [])
      .length,
    bounded.length,
  );
});

test("a single matching version uses a singular record label", () => {
  const car = catalogue().find(
    (c) => c.id === "ford_e_transit_custom_my26_50__trend_lwb__20261010",
  )!;
  const html = renderToStaticMarkup(
    createElement(
      WithEvidence,
      null,
      createElement(Discovery, { cars: [car], sources: research().sources }),
    ),
  );
  const text = html.replace(/<!--[\s\S]*?-->/g, "");
  assert.ok(text.includes("1 version record."));
  assert.ok(!text.includes("1 version records."));
});
