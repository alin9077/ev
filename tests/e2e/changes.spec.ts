import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { entryAnchor, type ChangesMonth } from "../../src/lib/changes";

const months = fs
  .readdirSync("data/changes")
  .filter((name) => /^\d{4}-\d{2}\.json$/.test(name))
  .sort()
  .reverse()
  .map(
    (name) =>
      JSON.parse(fs.readFileSync(`data/changes/${name}`, "utf8")) as ChangesMonth,
  );
const anchors = months.flatMap((month) =>
  month.changes.map((entry) => entryAnchor(month.month, entry)),
);

test("/changes lists every generated entry without JavaScript, newest month first", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  const response = await page.goto("/changes");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What changed");
  const ids = await page.locator("li[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
  expect([...ids].sort()).toEqual([...anchors].sort());
  const monthIds = await page.locator("section[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
  expect(monthIds).toEqual(months.map((month) => month.month));
  await context.close();
});

test("/changes.json and /changes/feed.xml carry the same entries as the page", async ({
  request,
}) => {
  const json = await (await request.get("/changes.json")).json();
  const jsonIds: string[] = json.months.flatMap((m: { changes: { id: string }[] }) =>
    m.changes.map((c) => c.id.split("#")[1]),
  );
  expect(jsonIds).toEqual(anchors);
  const feed = await request.get("/changes/feed.xml");
  expect(feed.status()).toBe(200);
  const xml = await feed.text();
  expect(xml).toContain('<rss version="2.0">');
  const feedIds = [...xml.matchAll(/<guid isPermaLink="false">[^#<]*#([^<]+)<\/guid>/g)].map(
    (m) => m[1],
  );
  expect(feedIds).toEqual(anchors);
});

test("the standalone portable build lists the same entries at ?page=/changes", async ({
  page,
}) => {
  const file = pathToFileURL(path.join(process.cwd(), "index.html")).href;
  await page.goto(`${file}?page=/changes`);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What changed");
  const ids = await page.locator("li[id]").evaluateAll((nodes) => nodes.map((n) => n.id));
  expect([...ids].sort()).toEqual([...anchors].sort());
});
