import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compiledSource, elementNodes } from "./helpers/compiled-source";
import {
  SITE_NAV_ITEMS,
  savedShortlist,
  shortlistHref,
} from "../src/components/site-nav";

const pushed: string[] = [];
function nav(path: string) {
  return compiledSource("src/components/site-nav.tsx", {
    "next/link": {
      __esModule: true,
      default: (props: Record<string, unknown>) =>
        createElement("a", props as object),
    },
    "next/navigation": {
      usePathname: () => path,
      useRouter: () => ({ push: (href: string) => pushed.push(href) }),
    },
  }).SiteNav as () => React.ReactElement;
}

test("the bar carries exactly the five destinations, in order", () => {
  assert.deepEqual(
    SITE_NAV_ITEMS.map((i) => i.label),
    ["Find by need", "Explore", "Compare", "Shortlist", "Model Y pick"],
  );
  const html = renderToStaticMarkup(createElement(nav("/")));
  for (const label of SITE_NAV_ITEMS.map((i) => i.label))
    assert.ok(html.includes(`>${label}<`), label);
  assert.match(html, /<nav[^>]*aria-label="Main"/);
});

test("the current page is marked for assistive technology", () => {
  assert.match(
    renderToStaticMarkup(createElement(nav("/compare"))),
    /aria-current="page"[^>]*>Compare</,
  );
  assert.match(
    renderToStaticMarkup(createElement(nav("/"))),
    /aria-current="page"[^>]*>Model Y pick</,
  );
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(nav("/methodology"))),
    /aria-current/,
  );
});

test("Shortlist opens the saved comparison, or the list when nothing is saved", () => {
  assert.deepEqual(savedShortlist('["a","b"]'), ["a", "b"]);
  assert.deepEqual(savedShortlist("not json"), []);
  assert.deepEqual(savedShortlist('{"a":1}'), []);
  assert.deepEqual(savedShortlist(null), []);
  assert.equal(shortlistHref(["a", "b"]), "/compare?cars=a,b");
  assert.equal(shortlistHref(["a"]), "/discover#discover");
  assert.equal(shortlistHref([]), "/discover#discover");
});

test("Shortlist click routes through the saved list and tolerates unavailable storage", () => {
  const Nav = nav("/");
  const item = elementNodes(Nav()).find(
    (n) => (n.props as { children?: unknown }).children === "Shortlist",
  )!;
  const click = item.props.onClick as unknown as (e: {
    preventDefault(): void;
  }) => void;
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  try {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: {
        getItem: () => {
          throw new Error("blocked");
        },
      },
    });
    let prevented = false;
    click({ preventDefault: () => (prevented = true) });
    assert.ok(prevented);
    assert.equal(pushed.at(-1), "/discover#discover");
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: () => '["x","y"]' },
    });
    click({ preventDefault() {} });
    assert.equal(pushed.at(-1), "/compare?cars=x,y");
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});
