import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement, isValidElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buyerSummaryCar,
  softwareTimelinePack,
} from "../src/lib/detail-client-props";
import { catalogue, pack, research } from "../src/lib/data";
import { BuyerSummary } from "../src/components/buyer-summary";
import { SoftwareTimeline } from "../src/components/ui";
import Detail from "../src/components/detail";

const cars = catalogue();
const data = research();
const snapshot = { cars, data };

test("detail client projections preserve complete nested values without unrelated vehicle facts", () => {
  for (const car of cars) {
    const full = pack(car.id, snapshot);
    const summary = buyerSummaryCar(car);
    const timeline = softwareTimelinePack(full);
    assert.deepEqual(Object.keys(summary), ["buyerSummary"]);
    assert.equal(summary.buyerSummary, car.buyerSummary);
    assert.deepEqual(Object.keys(timeline).sort(), [
      "car",
      "configuration",
      "eligibility",
      "events",
    ]);
    assert.deepEqual(Object.keys(timeline.car).sort(), [
      "brand",
      "id",
      "model",
      "modelId",
      "trim",
    ]);
    for (const key of ["id", "modelId", "brand", "model", "trim"] as const)
      assert.equal(timeline.car[key], car[key]);
    for (const key of ["eligibility", "events", "configuration"] as const)
      assert.equal(timeline[key], full[key]);
    assert.ok(!("facts" in timeline.car));
    assert.ok(!("sources" in timeline));
  }
});

test("all summary and timeline SSR markup is identical with projected or full props", () => {
  for (const car of cars) {
    const full = pack(car.id, snapshot);
    assert.equal(
      renderToStaticMarkup(
        createElement(BuyerSummary, {
          car: buyerSummaryCar(car),
          sources: full.sources,
        }),
      ),
      renderToStaticMarkup(
        createElement(BuyerSummary, { car, sources: full.sources }),
      ),
      `${car.id}: buyer summary`,
    );
    assert.equal(
      renderToStaticMarkup(
        createElement(SoftwareTimeline, { pack: softwareTimelinePack(full) }),
      ),
      renderToStaticMarkup(createElement(SoftwareTimeline, { pack: full })),
      `${car.id}: timeline`,
    );
  }
});

test("actual passenger and commercial detail trees wire both narrow boundaries and retain original sources", () => {
  for (const car of [
    cars.find((car) => car.brand === "Tesla")!,
    cars.find((car) => car.brand === "FONZ")!,
  ]) {
    assert.ok(car);
    const full = pack(car.id, snapshot);
    let summaries = 0;
    let timelines = 0;
    function visit(node: ReactNode): void {
      if (Array.isArray(node)) {
        node.forEach(visit);
        return;
      }
      if (
        !isValidElement<{
          children?: ReactNode;
          car?: unknown;
          pack?: unknown;
          sources?: unknown;
        }>(node)
      )
        return;
      if (node.type === BuyerSummary) {
        summaries++;
        assert.deepEqual(node.props.car, buyerSummaryCar(car));
        assert.equal(node.props.sources, full.sources);
      }
      if (node.type === SoftwareTimeline) {
        timelines++;
        assert.deepEqual(node.props.pack, softwareTimelinePack(full));
      }
      visit(node.props.children);
    }
    visit(Detail({ pack: full, criteria: data.criteria }));
    assert.equal(summaries, 1);
    assert.equal(timelines, 1);
  }
});
