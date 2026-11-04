import test, { type TestContext } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  applicationRequire,
  compiledSource,
  elementNodes,
  type ElementNode,
} from "./helpers/compiled-source";

function harness(t: TestContext, count = 29) {
  const state: unknown[] = [],
    refs: { current: unknown }[] = [];
  let cursor = 0,
    refCursor = 0;
  const effects: (() => unknown)[] = [];
  const listeners: Record<string, () => void> = {};
  const urls: string[] = [];
  const location = {
    protocol: "http:",
    pathname: "/index.html",
    search: "?availability=all&page=%2Fcars",
    hash: "#catalogue",
  };
  function expose(name: string, value: unknown) {
    const prior = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, {
      value,
      configurable: true,
      writable: true,
    });
    t.after(() => {
      if (prior) Object.defineProperty(globalThis, name, prior);
      else Reflect.deleteProperty(globalThis, name);
    });
  }
  expose("location", location);
  expose("window", {
    location,
    history: {
      state: null,
      replaceState: (_: unknown, __: string, url: string) => urls.push(url),
    },
    addEventListener: (name: string, callback: () => void) => {
      listeners[name] = callback;
    },
    removeEventListener: (name: string) => {
      delete listeners[name];
    },
  });
  const config = applicationRequire("./src/lib/config.ts");
  const cars = Array.from({ length: count }, (_, i) => ({
    id: i === 0 ? config.BASELINE : `car-${i}`,
    brand: "Test",
    model: `Model ${i}`,
    trim: i === count - 1 ? "Beyond initial batch" : "Standard",
    family: `family-${i}`,
    modelFamily: `family-${i}`,
    availability: "current_or_order_listed",
    drive: i % 2 ? "AWD" : "RWD",
    facts: {
      price_aud: { value: 40000 + i * 1000 },
      range_km: { value: 300 + i },
      seats: { value: 5 },
    },
  }));
  const Card = () => null;
  const component = compiledSource("src/components/explorer.tsx", {
    react: {
      ...applicationRequire("react"),
      useState: (initial: unknown) => {
        const index = cursor++;
        if (!(index in state))
          state[index] = typeof initial === "function" ? initial() : initial;
        return [
          state[index],
          (next: unknown) => {
            state[index] =
              typeof next === "function" ? next(state[index]) : next;
          },
        ];
      },
      useRef: (initial: unknown) => {
        const index = refCursor++;
        return refs[index] ?? (refs[index] = { current: initial });
      },
      useEffect: (effect: () => unknown) => {
        effects.push(effect);
      },
    },
    "next/navigation": {
      useRouter: () => ({ push: (url: string) => urls.push(url) }),
    },
    "next/link": { __esModule: true, default: "a" },
    "@/lib/search": applicationRequire("./src/lib/search.ts"),
    "@/lib/explorer-state": applicationRequire("./src/lib/explorer-state.ts"),
    "@/lib/config": config,
    "./ui": { Notice: "aside", VehicleCard: Card },
  }).default as (props: unknown) => unknown;
  const render = () => {
    cursor = 0;
    refCursor = 0;
    effects.length = 0;
    return elementNodes(
      component({ cars, initial: { availability: "all" }, equipment: {} }),
    );
  };
  const cards = (nodes: ElementNode[]) => nodes.filter((n) => n.type === Card);
  const more = (nodes: ElementNode[]) =>
    nodes.find(
      (n) =>
        n.type === "button" &&
        Array.isArray(n.props.children) &&
        n.props.children[0] === "Show ",
    );
  const text = (value: unknown): string =>
    Array.isArray(value)
      ? value.map(text).join("")
      : value && typeof value === "object" && "props" in value
        ? text((value as ElementNode).props.children)
        : value == null
          ? ""
          : String(value);
  return {
    state,
    refs,
    effects,
    listeners,
    location,
    urls,
    render,
    cards,
    more,
    text,
  };
}

test("catalogue renders twelve initially, successive batches and the accurate final batch", (t) => {
  const h = harness(t);
  let nodes = h.render();
  assert.equal(h.cards(nodes).length, 12);
  assert.match(
    h.text(nodes.find((n) => n.props.role === "status")),
    /Showing 12 of 29 matching variants/,
  );
  h.more(nodes)?.props.onClick?.();
  nodes = h.render();
  assert.equal(h.cards(nodes).length, 24);
  assert.equal(h.text(h.more(nodes)), "Show 5 more variants");
  h.more(nodes)?.props.onClick?.();
  nodes = h.render();
  assert.equal(h.cards(nodes).length, 29);
  assert.equal(h.more(nodes), undefined);
  assert.deepEqual(h.urls, []);
});

test("whole-catalogue search finds a vehicle outside the initial batch and resets reveal", (t) => {
  const h = harness(t);
  h.more(h.render())?.props.onClick?.();
  const search = h
    .render()
    .find((n) => n.type === "input" && n.props.type === "search");
  search?.props.onChange?.({ target: { value: "Beyond initial batch" } });
  const nodes = h.render();
  assert.equal(h.cards(nodes).length, 1);
  assert.equal((h.cards(nodes)[0].props.car as { id: string }).id, "car-28");
  assert.equal(h.state[1], 12);
  assert.ok(h.urls[0].includes("page=%2Fcars"));
  assert.ok(h.urls[0].endsWith("#catalogue"));
});

test("every catalogue filter and clear resets reveal without changing selection", (t) => {
  const h = harness(t);
  const nodes = h.render();
  for (const field of nodes.filter(
    (n) => n.type === "select" || n.type === "input",
  )) {
    h.state[1] = 24;
    const selected = h.state[2];
    field.props.onChange?.({
      target: { value: String(field.props.value ?? "") },
    });
    assert.equal(h.state[1], 12);
    assert.equal(h.state[2], selected);
  }
  h.state[1] = 24;
  nodes
    .find((n) => n.props.children === "Clear all filters")
    ?.props.onClick?.();
  assert.equal(h.state[1], 12);
  assert.equal((h.state[0] as { availability: string }).availability, "all");
});

test("selected challengers survive search, reveal and the three-car limit", (t) => {
  const h = harness(t);
  const add = (index: number) => {
    const card = h.cards(h.render())[index];
    elementNodes(card.props.action)
      .find((n) => n.type === "button")
      ?.props.onClick?.();
  };
  add(1);
  add(2);
  add(3);
  assert.equal((h.state[2] as string[]).length, 3);
  assert.match(String(h.state[3]), /Three vehicles selected/);
  const selected = [...(h.state[2] as string[])];
  h.render()
    .find((n) => n.props.type === "search")
    ?.props.onChange?.({ target: { value: "Beyond initial batch" } });
  assert.deepEqual(h.state[2], selected);
  const compare = h
    .render()
    .find((n) => n.type === "a" && n.props.children === "Compare");
  assert.ok(String(compare?.props.href).includes(selected.join(",")));
});

test("history restoration resets reveal and preserves the complete filter URL", async (t) => {
  const h = harness(t);
  h.render();
  const cleanup = h.effects[1]() as () => void;
  await Promise.resolve();
  h.state[1] = 29;
  h.location.search = "?q=Beyond&availability=all&page=%2Fcars";
  h.listeners.popstate();
  assert.equal(h.state[1], 12);
  assert.equal((h.state[0] as { q: string }).q, "Beyond");
  assert.equal(h.cards(h.render()).length, 1);
  assert.deepEqual(h.urls, []);
  cleanup();
  assert.equal(h.listeners.popstate, undefined);
});

test("reveal focuses the first new heading even when the final button disappears", (t) => {
  const h = harness(t, 13);
  class Heading {
    tabIndex = 0;
    focused = false;
    focus() {
      this.focused = true;
    }
  }
  const prior = Object.getOwnPropertyDescriptor(globalThis, "HTMLElement");
  Object.defineProperty(globalThis, "HTMLElement", {
    value: Heading,
    configurable: true,
  });
  t.after(() => {
    if (prior) Object.defineProperty(globalThis, "HTMLElement", prior);
    else Reflect.deleteProperty(globalThis, "HTMLElement");
  });
  const heading = new Heading();
  h.more(h.render())?.props.onClick?.();
  const nodes = h.render();
  h.refs[0].current = {
    children: Array.from({ length: 13 }, (_, i) => ({
      querySelector: () => (i === 12 ? heading : null),
    })),
  };
  h.effects[0]();
  assert.equal(heading.tabIndex, -1);
  assert.equal(heading.focused, true);
  assert.equal(h.more(nodes), undefined);
  assert.equal(h.refs[1].current, null);
});

test("empty results do not show reveal and narrow title wrapping is catalogue-scoped", (t) => {
  const h = harness(t, 0);
  assert.equal(h.more(h.render()), undefined);
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\.editorial-page \.vehicle-title \{\s*flex-wrap: wrap;/);
  assert.match(
    css,
    /\.editorial-page \.vehicle-title h3 \{\s*max-width: 100%;\s*overflow-wrap: anywhere;/,
  );
});
