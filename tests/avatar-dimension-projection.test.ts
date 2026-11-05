import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CarAvatar } from "../src/components/car-avatar";
import {
  carAvatarShape,
  hasCarAvatarShape,
} from "../src/lib/car-avatar-shapes";
import { catalogue, research } from "../src/lib/data";
import { discoveryCars, attributes } from "../src/lib/discovery";
import { carEvidenceIds, pageEvidenceSources } from "../src/lib/page-evidence";
const all = catalogue(),
  data = research();
const slim = discoveryCars(all);
const oldKeys = new Set<string>([
  ...attributes.map((a) => a.key),
  "height_mm",
  "wheelbase_mm",
]);
const prior = slim.map((car, i) => ({
  ...car,
  facts: Object.fromEntries(
    Object.entries(all[i].facts).filter(([key]) => oldKeys.has(key)),
  ),
}));
test("one avatar registry preserves exact markup while generic records omit only unused dimensions", () => {
  let bespoke = 0,
    generic = 0;
  for (const [i, car] of all.entries()) {
    const supported = hasCarAvatarShape(car.modelId);
    assert.equal(supported, !!carAvatarShape(car.modelId));
    if (supported) bespoke++;
    else generic++;
    for (const key of ["height_mm", "wheelbase_mm"]) {
      if (supported) assert.equal(slim[i].facts[key], car.facts[key]);
      else assert.equal(Object.hasOwn(slim[i].facts, key), false);
    }
    for (const { key } of attributes)
      assert.equal(slim[i].facts[key], car.facts[key]);
    assert.equal(slim[i].buyerSummary, car.buyerSummary);
    assert.equal(
      renderToStaticMarkup(createElement(CarAvatar, { car: slim[i] })),
      renderToStaticMarkup(createElement(CarAvatar, { car })),
    );
  }
  assert.ok(
    bespoke > 0 && generic > 0,
    "Both explicit and generic avatar paths are exercised",
  );
  assert.equal(
    bespoke + generic,
    all.length,
    "Live projection still covers every current record",
  );
  assert.equal(
    carAvatarShape("byd_atto_3_legacy"),
    carAvatarShape("byd_atto_3_evo"),
  );
  assert.equal(hasCarAvatarShape("unmapped-new-model"), false);
});
test("dimension omission preserves complete current citation closure and canonical source identity", () => {
  assert.deepEqual(
    [...carEvidenceIds(slim)].sort(),
    [...carEvidenceIds(prior)].sort(),
  );
  const before = pageEvidenceSources(data.sources, { cars: prior });
  const after = pageEvidenceSources(data.sources, { cars: slim });
  assert.deepEqual(after, before);
  after.forEach((source, i) => assert.equal(source, before[i]));
  const saved =
    Buffer.byteLength(JSON.stringify(prior)) -
    Buffer.byteLength(JSON.stringify(slim));
  assert.ok(saved > 350_000);
});

test("omitted dimensions retain unique direct and Issue citation context without restoring unused facts", () => {
  const original = structuredClone(
    all.find((car) => !hasCarAvatarShape(car.modelId))!,
  );
  const before = structuredClone(original);
  original.facts.height_mm = {
    ...original.facts.height_mm,
    sourceIds: ["dimension-only-source"],
    issues: [
      {
        issue_id: "DIMENSION-HOLD",
        title: "Dimension is held",
        priority: "low",
        model_ids: [original.modelId],
        publication_action: "Keep unknown",
        source_ids: ["dimension-issue-only-source"],
      },
    ],
  };
  const input = structuredClone(original);
  const projected = discoveryCars([original])[0];
  assert.deepEqual(original, input);
  assert.equal(Object.hasOwn(projected.facts, "height_mm"), false);
  assert.ok(
    projected.projectedEvidenceSourceIds?.includes("dimension-only-source"),
  );
  assert.ok(
    projected.projectedEvidenceSourceIds?.includes(
      "dimension-issue-only-source",
    ),
  );
  assert.deepEqual(discoveryCars([projected])[0], projected);
  const additions = [
    "dimension-only-source",
    "dimension-issue-only-source",
  ].map((id) => ({ ...data.sources[0], id }));
  const sources = pageEvidenceSources([...data.sources, ...additions], {
    cars: [projected],
  });
  for (const source of additions)
    assert.equal(
      sources.find((item) => item.id === source.id),
      source,
    );
  assert.throws(
    () => pageEvidenceSources(data.sources, { cars: [projected] }),
    /missing sources/,
  );
  assert.deepEqual(projected.buyerSummary, before.buyerSummary);
});
