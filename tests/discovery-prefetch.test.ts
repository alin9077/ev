import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { ComponentProps, MouseEvent, ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { LinkProps } from "next/link";
import ts from "typescript";
import type PortableLink from "../src/portable/link";
import { compiledSource } from "./helpers/compiled-source";

function discoveryLinks() {
  const source = ts.createSourceFile(
    "discovery.tsx",
    readFileSync("src/components/discovery.tsx", "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const links: (ts.JsxOpeningElement | ts.JsxSelfClosingElement)[] = [];
  function visit(node: ts.Node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === "Link"
    )
      links.push(node);
    ts.forEachChild(node, visit);
  }
  visit(source);
  const attribute = (
    node: (typeof links)[number],
    name: string,
  ): ts.JsxAttribute | undefined =>
    node.attributes.properties.find(
      (item): item is ts.JsxAttribute =>
        ts.isJsxAttribute(item) && item.name.getText(source) === name,
    );
  const href = (node: (typeof links)[number]) =>
    attribute(node, "href")?.initializer?.getText(source);
  return { source, links, attribute, href };
}

test("every Discovery exact-trim Link site, including unranked figures, explicitly disables prefetch", () => {
  const { source, links, attribute, href } = discoveryLinks();
  assert.match(source.text, /import Link from "next\/link"/);
  assert.match(
    source.text,
    /const urlFor = \(c: Car\) => `\/cars\/\$\{c.family\}\/\$\{c.slug\}`;/,
  );
  const details = links.filter((node) => href(node)?.startsWith("{urlFor("));
  assert.deepEqual(details.map(href), [
    "{urlFor(e.car)}",
    "{urlFor(entry.car)}",
    "{urlFor(c)}",
  ]);
  const labels = [
    "attribute ranking",
    "unranked published figure",
    "excluded record",
  ];
  details.forEach((node, index) => {
    const value = attribute(node, "prefetch")?.initializer;
    assert.ok(value && ts.isJsxExpression(value), labels[index]);
    assert.equal(
      value.expression?.kind,
      ts.SyntaxKind.FalseKeyword,
      labels[index],
    );
    assert.ok(
      node.attributes.properties.every(ts.isJsxAttribute),
      `${labels[index]} must not override its policy with spread props`,
    );
  });
});

test("Discovery comparison and supporting links retain their existing prefetch policy", () => {
  const { links, attribute, href } = discoveryLinks();
  const other = links.filter((node) => !href(node)?.startsWith("{urlFor("));
  assert.deepEqual(other.map(href), [
    '{`/compare?cars=${selected.join(",")}`}',
    '"/methodology"',
    '"/b"',
    '"/market"',
    '"/sources"',
  ]);
  for (const node of other) assert.equal(attribute(node, "prefetch"), undefined);
});

function portableHarness() {
  const calls: string[] = [];
  const resolved: string[] = [];
  const component = compiledSource("src/portable/link.tsx", {
    "./navigation": {
      localUrl: (href: string) => {
        resolved.push(href);
        return `/index.html?resolved=${encodeURIComponent(href)}`;
      },
      navigate: (href: string) => calls.push(`navigate:${href}`),
    },
  }).default as typeof PortableLink;
  const link = (props: ComponentProps<typeof PortableLink>) =>
    component(props) as ReactElement<ComponentProps<"a">>;
  return { link, calls, resolved };
}

function clickEvent(overrides: Record<string, unknown> = {}) {
  return {
    defaultPrevented: false,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    button: 0,
    preventDefault(this: { defaultPrevented: boolean }) {
      this.defaultPrevented = true;
    },
    ...overrides,
  } as unknown as MouseEvent<HTMLAnchorElement>;
}

// Match the installed public Next Link contract, including its default forms.
const prefetchValues: LinkProps["prefetch"][] = [
  undefined,
  null,
  false,
  true,
  "auto",
];

test("portable Link consumes every supported prefetch value without leaking a DOM prop", () => {
  const h = portableHarness();
  const href = "/cars/test-family/exact-trim?view=evidence#sources";
  for (const prefetch of prefetchValues) {
    const anchor = h.link({
      href,
      prefetch,
      className: "exact-trim-link",
      title: "Exact trim",
      target: "_blank",
      rel: "noopener",
      "aria-label": "Open exact trim and evidence",
      children: "Exact trim & evidence →",
    });
    assert.equal(anchor.type, "a");
    assert.equal(Object.hasOwn(anchor.props, "prefetch"), false);
    assert.equal(
      anchor.props.href,
      `/index.html?resolved=${encodeURIComponent(href)}`,
    );
    assert.equal(anchor.props.className, "exact-trim-link");
    assert.equal(anchor.props.target, "_blank");
    assert.equal(anchor.props.rel, "noopener");
    assert.equal(anchor.props["aria-label"], "Open exact trim and evidence");
    assert.equal(anchor.props.children, "Exact trim & evidence →");
    const html = renderToStaticMarkup(anchor);
    assert.doesNotMatch(html, /\bprefetch=/);
    assert.match(html, /Exact trim &amp; evidence →/);
  }
  assert.deepEqual(h.resolved, prefetchValues.map(() => href));
  assert.deepEqual(h.calls, []);
});

test("portable prefetch policy preserves primary activation and callback order", () => {
  for (const prefetch of prefetchValues) {
    const h = portableHarness();
    const href = "/cars/test-family/exact-trim?view=evidence#sources";
    const anchor = h.link({
      href,
      prefetch,
      onClick: (event) => {
        assert.equal(event.defaultPrevented, false);
        h.calls.push("caller");
      },
    });
    const event = clickEvent();
    anchor.props.onClick?.(event);
    assert.equal(event.defaultPrevented, true);
    assert.deepEqual(h.calls, ["caller", `navigate:${href}`]);
  }
});

test("portable disabled prefetch preserves modifier, non-primary, external and hash activation", () => {
  const cases = [
    { href: "/cars/test/exact", event: { metaKey: true } },
    { href: "/cars/test/exact", event: { ctrlKey: true } },
    { href: "/cars/test/exact", event: { shiftKey: true } },
    { href: "/cars/test/exact", event: { altKey: true } },
    { href: "/cars/test/exact", event: { button: 1 } },
    { href: "/cars/test/exact", event: { button: 2 } },
    { href: "https://example.com/evidence", event: {} },
    { href: "#sources", event: {} },
  ];
  for (const sample of cases) {
    const h = portableHarness();
    const anchor = h.link({
      href: sample.href,
      prefetch: false,
      onClick: () => h.calls.push("caller"),
    });
    const event = clickEvent(sample.event);
    anchor.props.onClick?.(event);
    assert.equal(event.defaultPrevented, false);
    assert.deepEqual(h.calls, ["caller"]);
  }
});

test("portable disabled prefetch still honors prior and caller cancellation", () => {
  for (const alreadyPrevented of [false, true]) {
    const h = portableHarness();
    const anchor = h.link({
      href: "/cars/test/exact",
      prefetch: false,
      onClick: (event) => {
        h.calls.push("caller");
        if (!alreadyPrevented) event.preventDefault();
      },
    });
    const event = clickEvent({ defaultPrevented: alreadyPrevented });
    anchor.props.onClick?.(event);
    assert.equal(event.defaultPrevented, true);
    assert.deepEqual(h.calls, ["caller"]);
  }
});

test("the catalogue card's exact-version link also disables prefetch", () => {
  const source = ts.createSourceFile(
    "catalogue-card.tsx",
    readFileSync("src/components/catalogue-card.tsx", "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const links: ts.JsxOpeningElement[] = [];
  (function visit(node: ts.Node) {
    if (
      ts.isJsxOpeningElement(node) &&
      node.tagName.getText(source) === "Link"
    )
      links.push(node);
    ts.forEachChild(node, visit);
  })(source);
  assert.equal(links.length, 1);
  const prefetch = links[0].attributes.properties.find(
    (item): item is ts.JsxAttribute =>
      ts.isJsxAttribute(item) && item.name.getText(source) === "prefetch",
  )?.initializer;
  assert.ok(prefetch && ts.isJsxExpression(prefetch));
  assert.equal(prefetch.expression?.kind, ts.SyntaxKind.FalseKeyword);
});
