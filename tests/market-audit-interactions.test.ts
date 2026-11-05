import test from "node:test";
import assert from "node:assert/strict";
import {
  applicationRequire,
  compiledSource,
  elementNodes,
} from "./helpers/compiled-source";

function harness(initial: [string, string, string, number]) {
  const state: (string | number)[] = [...initial];
  let cursor = 0;
  const inventory = applicationRequire(
    "./data/market-inventory-2026-10-10.json",
  );
  const component = compiledSource("src/components/market-audit.tsx", {
    react: {
      ...applicationRequire("react"),
      useState: (initialValue: string | number) => {
        const index = cursor++;
        if (!(index in state)) state[index] = initialValue;
        return [
          state[index],
          (value: string | number) => {
            state[index] = value;
          },
        ];
      },
    },
    "@/lib/market-view-data": { __esModule: true, default: inventory },
  }).default as () => unknown;
  return {
    state,
    render: () => {
      cursor = 0;
      return elementNodes(component());
    },
  };
}

test("market Clear filters resets search, evidence, vehicle type and pagination", () => {
  const h = harness(["no such vehicle zzzz", "listed_unconfirmed", "bus", 72]);
  const clear = h
    .render()
    .find((n) => n.type === "button" && n.props.children === "Clear filters");
  assert.ok(clear?.props.onClick);
  clear.props.onClick();
  assert.deepEqual(h.state, ["", "all", "tier1", 24]);
  const nodes = h.render();
  assert.equal(nodes.filter((n) => n.type === "article").length, 24);
  assert.deepEqual(
    nodes.filter((n) => n.type === "select").map((n) => n.props.value),
    ["tier1", "all"],
  );
  assert.ok(
    !nodes.some(
      (n) => n.type === "button" && n.props.children === "Clear filters",
    ),
  );
  clear.props.onClick();
  assert.deepEqual(h.state, ["", "all", "tier1", 24]);
});

test("market search resets pagination while retaining independent filters", () => {
  const h = harness(["old", "listed_unconfirmed", "bus", 72]);
  const search = h
    .render()
    .find((n) => n.type === "input" && n.props.type === "search");
  assert.ok(search?.props.onChange);
  search.props.onChange({ target: { value: "Yutong" } });
  assert.deepEqual(h.state, ["Yutong", "listed_unconfirmed", "bus", 24]);
});

test("market vehicle-type and evidence changes each reset pagination", () => {
  const h = harness(["", "listed_unconfirmed", "bus", 72]);
  const selects = h.render().filter((n) => n.type === "select");
  assert.ok(selects[0].props.onChange && selects[1].props.onChange);
  selects[0].props.onChange({ target: { value: "van" } });
  assert.deepEqual(h.state, ["", "listed_unconfirmed", "van", 24]);
  h.state[3] = 72;
  selects[1].props.onChange({ target: { value: "accepting_orders" } });
  assert.deepEqual(h.state, ["", "accepting_orders", "van", 24]);
});

test("market Show more preserves filters across successive rendered pages", () => {
  const h = harness(["", "all", "all", 24]);
  for (const expected of [48, 72]) {
    const more = h
      .render()
      .find(
        (n) =>
          n.type === "button" && n.props.children === "Show 24 more records",
      );
    assert.ok(more?.props.onClick);
    more.props.onClick();
    assert.deepEqual(h.state, ["", "all", "all", expected]);
    assert.equal(
      h.render().filter((n) => n.type === "article").length,
      expected,
    );
  }
});

test("market aliases find one existing Element family without adding trim claims", () => {
  for (const query of [
    "Element 2.2",
    "Element2.2",
    "Custom Denning 2.2",
    "Element 2",
  ]) {
    const nodes = harness([query, "listed_unconfirmed", "bus", 24]).render();
    assert.equal(nodes.filter((n) => n.type === "article").length, 1, query);
    assert.ok(
      nodes.some((n) => n.type === "h2" && n.props.children === "Element"),
    );
    assert.ok(
      nodes.some(
        (n) =>
          n.type === "p" &&
          n.props.children === "Exact trim names still need verification.",
      ),
    );
  }
  for (const initial of [
    ["Element 2.2", "all", "van", 24],
    ["Element 2.2", "accepting_orders", "bus", 24],
    ["Element 2.2 nonexistentzzz", "all", "all", 24],
  ] as [string, string, string, number][]) {
    assert.equal(
      harness(initial)
        .render()
        .filter((n) => n.type === "article").length,
      0,
    );
  }
});

test("market bus search reveals E-Crew without treating layouts as trims or orders", () => {
  const nodes = harness(["E-Crew", "listed_unconfirmed", "bus", 24]).render();
  assert.equal(nodes.filter((n) => n.type === "article").length, 1);
  assert.ok(
    nodes.some((n) => n.type === "h2" && n.props.children === "EC11 E-Crew"),
  );
  assert.ok(
    nodes.some(
      (n) =>
        n.type === "p" &&
        n.props.children === "Exact trim names still need verification.",
    ),
  );
  assert.equal(
    harness(["E-Crew", "accepting_orders", "bus", 24])
      .render()
      .filter((n) => n.type === "article").length,
    0,
  );
  assert.equal(
    harness(["E-Crew", "all", "van", 24])
      .render()
      .filter((n) => n.type === "article").length,
    0,
  );
  assert.equal(
    harness(["EC11", "all", "all", 24])
      .render()
      .filter((n) => n.type === "article").length,
    2,
  );
});

test("eVito market result shows bounded seating and date caveats while retaining supply holds", () => {
  const nodes = harness([
    "eVito Tourer",
    "listed_unconfirmed",
    "passenger",
    24,
  ]).render();
  assert.equal(nodes.filter((node) => node.type === "article").length, 1);
  assert.ok(
    nodes.some(
      (node) => node.type === "h2" && node.props.children === "eVito Tourer",
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "p" &&
        typeof node.props.children === "string" &&
        node.props.children.includes(
          "eight seats including the driver (2+3+3)",
        ) &&
        node.props.children.includes(
          "2027-01-11 with unresolved date semantics",
        ),
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "li" &&
        typeof node.props.children === "string" &&
        node.props.children.includes("diesel Vito"),
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "a" &&
        node.props.href ===
          "https://www.mercedes-benz.com.au/vans/electric-vans.html",
    ),
  );
  assert.equal(
    harness(["eVito Tourer", "accepting_orders", "passenger", 24])
      .render()
      .filter((node) => node.type === "article").length,
    0,
  );
  assert.equal(
    harness(["eVito Tourer", "all", "bus", 24])
      .render()
      .filter((node) => node.type === "article").length,
    0,
  );
});

test("MIFA9 market result qualifies the historical listing without promoting orders or stock", () => {
  const nodes = harness([
    "MIFA 9",
    "listed_unconfirmed",
    "passenger",
    24,
  ]).render();
  assert.equal(nodes.filter((node) => node.type === "article").length, 1);
  assert.ok(
    nodes.some(
      (node) => node.type === "h2" && node.props.children === "MIFA 9",
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "p" &&
        typeof node.props.children === "string" &&
        node.props.children.includes("10 October 2026 audit recorded") &&
        node.props.children.includes("returned HTTP 404") &&
        node.props.children.includes(
          "do not establish nationwide unavailability",
        ),
    ),
  );
  assert.ok(
    nodes.some(
      (node) =>
        node.type === "a" &&
        node.props.href ===
          "https://www.callaghanldv.com.au/search/new-and-demo-cars",
    ),
  );
  assert.equal(
    harness(["MIFA 9", "accepting_orders", "passenger", 24])
      .render()
      .filter((node) => node.type === "article").length,
    0,
  );
  assert.equal(
    harness(["MIFA 9", "all", "bus", 24])
      .render()
      .filter((node) => node.type === "article").length,
    0,
  );
});
