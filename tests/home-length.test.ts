import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/app/page";

const html = renderToStaticMarkup(createElement(Home));
const open = html.indexOf('<details class="fleet-full-comparison"');
const close = html.indexOf("</details>", open);

test("the long Model Y comparison is closed behind one summary on the home page", () => {
  assert.ok(open > -1, "comparison wrapper present");
  assert.doesNotMatch(html.slice(open, open + 60), /open/, "closed by default");
  assert.match(html.slice(open, open + 400), /<summary>/);
});

test("the hero and the nine reasons stay outside it, above the discovery list", () => {
  assert.ok(html.indexOf("Tesla Model Y is the EV car of the year") < open);
  assert.ok(html.indexOf('id="discover"') < open);
  assert.equal(
    (html.slice(0, open).match(/class="verdict-reason"/g) || []).length,
    9,
  );
});

test("every one of the nine reason targets is still in the page, inside the closed comparison", () => {
  for (const target of [
    "detail-adas_optional",
    "chapter-07",
    "detail-safety_ancap",
    "detail-supercharger_access",
    "detail-boot_l",
    "detail-bidirectional_v2g",
    "detail-sentry_parked_recording",
    "chapter-05",
    "detail-pet_mode",
  ]) {
    const at = html.indexOf(`id="${target}"`);
    assert.ok(at > open && at < html.length, target);
  }
  assert.ok(close > open);
});

test("the home page lists at most twelve cards before Show more", () => {
  const cards = (html.match(/class="catalogue-card"/g) || []).length;
  assert.equal(cards, 12);
  assert.match(html, /Show 12 more/);
});

test("the headline counts only Tier 1 versions on sale", () => {
  assert.match(html, /\d+ passenger EVs on sale in Australia/);
});
