import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ChangesView from "../src/components/changes-view";
import { changesJson, changesRss } from "../src/lib/changes-feed";
import { loadChangeMonths } from "../src/lib/changes-data";
import {
  CHANGE_TYPES,
  describeAvailability,
  groupChanges,
  type ChangeEntry,
  type ChangesMonth,
} from "../src/lib/changes";

const origin = "https://example.test";
const entry = (over: Partial<ChangeEntry>): ChangeEntry => ({
  type: "price_changed", versionId: "byd_sealion_7__premium_rwd__1", brand: "BYD",
  vehicle: "BYD SEALION 7 Premium RWD", family: "byd-sealion-7", slug: "premium-rwd-1", field: "price_aud",
  before: { value: 54990, unit: "AUD", basis: "Before on-road costs" },
  after: { value: 52990, unit: "AUD", basis: "Before on-road costs" },
  beforeDate: "2026-10-14", afterDate: "2026-11-06", sourceIds: ["src-1"], ...over,
});
function month(m: string, changes: ChangeEntry[], asOf = `${m}-28`): ChangesMonth {
  return {
    schema: "roadmark-changes-v1", month: m, generator: "scripts/refresh/diff.ts",
    before: { asOf: "2026-10-15", sha256: "a".repeat(64) }, after: { asOf, sha256: "b".repeat(64) },
    counts: Object.fromEntries(CHANGE_TYPES.map((t) => [t, changes.filter((c) => c.type === t).length])) as ChangesMonth["counts"],
    sources: [{ id: "src-1", url: "https://bydautomotive.com.au/configurator/byd-sealion-7", title: "Configurator", publisher: "BYD Australia", accessed_date: "2026-11-06" }],
    changes,
  };
}
const nov = month("2026-11", [
  entry({}),
  entry({ type: "price_changed", brand: "Tesla", vehicle: "Tesla Model Y RWD", versionId: "tesla_y", family: "tesla-model-y", slug: "rwd", before: { value: 61900, unit: "AUD", basis: "Before on-road costs" }, after: { value: 59900, unit: "AUD", basis: "Before on-road costs" } }),
  entry({ type: "version_added", versionId: "byd_new", vehicle: "BYD New Premium", slug: "new-premium", field: "version", before: null, after: { value: "current_or_order_listed; orders: accepting_orders; stock: unverified", unit: "", basis: "Exact Australian version availability" } }),
  entry({ type: "version_withdrawn", versionId: "kia_old", brand: "Kia", vehicle: "Kia Old", family: "kia-old", slug: "old", field: "version", before: { value: "current_or_order_listed; orders: accepting_orders; stock: unverified", unit: "", basis: "" }, after: null }),
]);
const oct = month("2026-10", [entry({ type: "range_changed", field: "range_km", before: { value: 400, unit: "km", basis: "WLTP combined" }, after: { value: 420, unit: "km", basis: "WLTP combined" } })]);
const html = (months: ChangesMonth[], feeds = true) => renderToStaticMarkup(createElement(ChangesView, { months, feeds }));

test("months are listed newest first, whatever order they arrive in", () => {
  const out = html([oct, nov]);
  assert.ok(out.indexOf("November 2026") < out.indexOf("October 2026"));
  assert.ok(out.indexOf('id="2026-11"') < out.indexOf('id="2026-10"'));
});

test("within a month entries are grouped by type then brand, each linking to its version page with its source", () => {
  const out = html([nov]);
  assert.ok(out.indexOf("Price changed (2)") < out.indexOf("New versions on sale (1)"));
  assert.ok(out.indexOf("New versions on sale (1)") < out.indexOf("Versions no longer on sale (1)"));
  assert.ok(out.indexOf("<h4>BYD</h4>") < out.indexOf("<h4>Tesla</h4>"));
  assert.match(out, /<a href="\/cars\/byd-sealion-7\/premium-rwd-1">BYD SEALION 7 Premium RWD<\/a>/);
  assert.match(out, /A\$54,990 \(Before on-road costs\) → A\$52,990 \(Before on-road costs\)/);
  assert.match(out, /href="https:\/\/bydautomotive\.com\.au\/configurator\/byd-sealion-7"[^>]*>BYD Australia<\/a>, checked <time dateTime="2026-11-06">/);
  assert.match(out, /checked 2026-10-14 → 2026-11-06/);
});

test("an arrival is described in buyer words and never claims stock", () => {
  const out = html([nov]);
  assert.match(out, /New on sale: Current listing · orders open/);
  assert.doesNotMatch(out, /in stock/i);
  assert.equal(describeAvailability("outgoing; orders: not_accepting_orders; stock: no_new_stock_verified"), "Older / outgoing version · not taking orders");
});

test("with no data the page says so; an empty month says nothing changed; feed links only where the routes exist", () => {
  assert.match(html([]), /No changes recorded yet/);
  assert.match(html([month("2026-11", [])]), /Nothing changed on the facts this page tracks/);
  assert.match(html([nov], true), /href="\/changes\.json"[\s\S]*href="\/changes\/feed\.xml"/);
  assert.doesNotMatch(html([nov], false), /changes\.json|feed\.xml/);
});

test("JSON and RSS carry exactly the page's entries, in the same order, newest month first", () => {
  const months = [oct, nov];
  const json = changesJson(months, origin);
  const rss = changesRss(months, origin);
  const jsonIds = json.months.flatMap((m) => m.changes.map((c) => c.id));
  const rssIds = [...rss.matchAll(/<guid isPermaLink="false">([^<]+)<\/guid>/g)].map((m) => m[1].replaceAll("&amp;", "&"));
  const pageIds = [...html(months).matchAll(/<li id="([^"]+)"/g)].map((m) => `${origin}/changes#${m[1]}`);
  assert.equal(jsonIds.length, 5);
  assert.deepEqual(rssIds, jsonIds);
  assert.deepEqual([...pageIds].sort(), [...jsonIds].sort());
  assert.deepEqual(json.months.map((m) => m.month), ["2026-11", "2026-10"]);
  assert.equal(new Set(jsonIds).size, jsonIds.length, "entry ids are unique");
});

test("the RSS is well-formed RSS 2.0 with escaped text, links to version pages and a deterministic build date", () => {
  const tricky = month("2026-11", [entry({ vehicle: "Tom & Jerry <EV> \"Pro\"" })]);
  const rss = changesRss([tricky], origin);
  assert.match(rss, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<rss version="2\.0">/);
  assert.match(rss, /<title>Tom &amp; Jerry &lt;EV&gt; &quot;Pro&quot;: Price changed<\/title>/);
  assert.match(rss, /<link>https:\/\/example\.test\/cars\/byd-sealion-7\/premium-rwd-1<\/link>/);
  assert.match(rss, /<pubDate>Fri, 06 Nov 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(rss, /<lastBuildDate>Sat, 28 Nov 2026 00:00:00 GMT<\/lastBuildDate>/);
  assert.match(rss, /Source: BYD Australia: https:\/\/bydautomotive\.com\.au\/configurator\/byd-sealion-7 \(accessed 2026-11-06\)/);
  assert.equal(rss, changesRss([tricky], origin));
  assert.doesNotMatch(rss, /<(?:\/)?(?:entry|feed)\b/, "RSS, not Atom");
  assert.match(changesRss([], origin), /<channel>[\s\S]*<\/channel>/);
});

test("groupChanges keeps the plan's type order", () => {
  assert.deepEqual(groupChanges(nov.changes).map((g) => g.type), ["price_changed", "version_added", "version_withdrawn"]);
});

test("loadChangeMonths reads only generated YYYY-MM files and sorts newest first", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "changes-"));
  fs.writeFileSync(path.join(dir, "2026-10.json"), JSON.stringify(oct));
  fs.writeFileSync(path.join(dir, "2026-11.json"), JSON.stringify(nov));
  fs.writeFileSync(path.join(dir, "notes.json"), "not json");
  fs.writeFileSync(path.join(dir, "schema.json"), "{}");
  assert.deepEqual(loadChangeMonths(dir).map((m) => m.month), ["2026-11", "2026-10"]);
  fs.writeFileSync(path.join(dir, "2026-12.json"), JSON.stringify({ ...nov, month: "2026-11" }));
  assert.throws(() => loadChangeMonths(dir), /Invalid changes file 2026-12\.json/);
  assert.deepEqual(loadChangeMonths(path.join(dir, "missing")), []);
});

test("routes and discovery files expose /changes, /changes.json and /changes/feed.xml", async () => {
  const { GET: getJson } = await import("../src/app/changes.json/route");
  const { GET: getFeed } = await import("../src/app/changes/feed.xml/route");
  const json = (await getJson().json()) as { months: unknown[] };
  assert.ok(Array.isArray(json.months));
  const feed = getFeed();
  assert.match(feed.headers.get("content-type") ?? "", /application\/rss\+xml/);
  assert.match(await feed.text(), /<rss version="2\.0">/);
  const llms = fs.readFileSync("src/app/llms.txt/route.ts", "utf8");
  assert.match(llms, /\/changes\)/);
  assert.match(llms, /changes\.json/);
  assert.match(llms, /changes\/feed\.xml/);
  assert.match(fs.readFileSync("src/app/sitemap.ts", "utf8"), /"\/changes"/);
});

test("the portable build lists changes through the same component", () => {
  const entryFile = fs.readFileSync("src/portable/entry.tsx", "utf8");
  assert.match(entryFile, /import ChangesView from "@\/components\/changes-view"/);
  assert.match(entryFile, /path === "\/changes"[\s\S]{0,80}<ChangesView months=\{changes\(\)\} feeds=\{false\}/);
  assert.match(fs.readFileSync("src/app/changes/page.tsx", "utf8"), /import ChangesView from "@\/components\/changes-view"/);
  assert.match(fs.readFileSync("scripts/build-portable.ts", "utf8"), /changes: loadChangeMonths\(\)/);
});
