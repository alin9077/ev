import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Home from "../src/app/page";

test("homepage retains original Model Y hero and all nine reason targets above discovery", () => {
  const html = renderToStaticMarkup(createElement(Home));
  assert.equal((html.match(/<main\b/g) || []).length, 1);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.ok(
    html.indexOf("Tesla Model Y is the EV car of the year") <
      html.indexOf('id="discover"'),
  );
  assert.equal((html.match(/class="verdict-reason"/g) || []).length, 9);
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
    assert.ok(html.includes(`href="#${target}"`), target);
    assert.ok(html.includes(`id="${target}"`), target);
    const destination = html.match(
      new RegExp(`<[^>]+id="${target}"[^>]*>`),
    )?.[0];
    assert.ok(
      destination?.includes('tabindex="-1"'),
      `${target} must support the hero focus handoff`,
    );
  }
});
