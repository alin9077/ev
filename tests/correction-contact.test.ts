import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CorrectionLink from "../src/components/correction-link";
import { correctionMailto } from "../src/lib/correction-contact";

const KEY = "NEXT_PUBLIC_CORRECTION_EMAIL";
const original = process.env[KEY];
afterEach(() => {
  if (original === undefined) delete process.env[KEY];
  else process.env[KEY] = original;
});
const render = () => renderToStaticMarkup(createElement(CorrectionLink));

test("correction link is hidden when the address is unset or empty", () => {
  delete process.env[KEY];
  assert.equal(render(), "");
  process.env[KEY] = "   ";
  assert.equal(render(), "");
});

test("correction link renders a mailto only when an address is set", () => {
  process.env[KEY] = "corrections@example.com";
  const html = render();
  assert.match(html, /<a href="mailto:corrections@example\.com">/);
  assert.match(html, /corrections@example\.com<\/a>/);
});

test("malformed or multi-recipient values never produce a link", () => {
  for (const bad of [
    "not-an-email",
    "a@b",
    "a@b.com,c@d.com",
    "a@b.com?cc=x@y.com",
    "a b@c.com",
    "javascript:alert(1)",
    "<a@b.com>",
  ]) {
    process.env[KEY] = bad;
    assert.equal(render(), "", bad);
    assert.equal(correctionMailto(bad), null, bad);
  }
});
