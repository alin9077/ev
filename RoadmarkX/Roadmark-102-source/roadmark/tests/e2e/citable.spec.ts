import { test, expect } from "@playwright/test";
import { pairPages, pairReport } from "../../src/lib/pair-pages";
import { catalogue } from "../../src/lib/data";
import { PAGE_UPDATED, reportMarkdown } from "../../src/lib/citable";

test("all nine comparisons expose dated claims, links and schema without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const pair of pairPages) {
    const report = pairReport(pair.slug)!;
    const response = await page.goto(report.path);
    expect(response?.status()).toBe(200);
    expect((await response!.body()).byteLength).toBeLessThan(250000);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      report.title,
    );
    for (const fact of report.keyFacts) {
      await expect(
        page
          .locator(`#fact-${fact.key} .cited-claim`)
          .filter({ hasText: fact.car })
          .first(),
      ).toContainText(fact.evidenceDate);
      for (const source of fact.sources)
        await expect(
          page
            .locator(`#fact-${fact.key} a`)
            .filter({ hasText: source.title })
            .first(),
        ).toHaveAttribute("href", source.url);
    }
    const schema = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').textContent())!,
    );
    expect(
      schema["@graph"].filter((x: { "@type": string }) => x["@type"] === "Car"),
    ).toHaveLength(2);
    expect(
      await page.locator('meta[name="robots"]').getAttribute("content"),
    ).not.toContain("noindex");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /https:\/\/.+\/compare\/model-y-vs-/,
    );
    const json = await context.request.get(`${report.path}/comparison.json`);
    expect(json.headers()["content-type"]).toContain("application/json");
    const data = await json.json();
    expect(data.cars.map((c: { id: string }) => c.id)).toEqual(
      report.cars.map((c) => c.id),
    );
    const markdown = await context.request.get(`${report.path}/comparison.md`);
    expect(markdown.headers()["content-type"]).toContain("text/markdown");
    expect(await markdown.text()).toBe(reportMarkdown(data));
  }
  const unknown = await page.goto("/compare/model-y-vs-unlisted-car");
  expect(unknown?.status()).toBe(404);
  await context.close();
});
test("all catalogue variant pages have a key-facts block before JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const car of catalogue()) {
    const response = await page.goto(`/cars/${car.family}/${car.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("#key-facts")).toBeVisible();
    await expect(page.locator("#fact-price_aud")).toContainText(
      `${car.brand} ${car.model} ${car.trim}`,
    );
    expect(
      await page.locator("#fact-price_aud .claim-sources a").count(),
    ).toBeGreaterThan(0);
  }
  await context.close();
});
test("copy includes exact dates/sources and offers a selectable fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as unknown as { copiedText: string }).copiedText = text;
        },
      },
    });
  });
  await page.goto("/compare/model-y-vs-sealion-7");
  await page
    .getByRole("button", { name: "Copy for your AI assistant" })
    .click();
  await expect(page.getByRole("status")).toHaveText(
    "Copied with dates and sources.",
  );
  const copied = await page.evaluate(
    () => (window as unknown as { copiedText: string }).copiedText,
  );
  expect(copied).toContain("Tesla Model Y Premium RWD");
  expect(copied).toContain("BYD Sealion 7 Premium RWD");
  expect(copied).toContain("2026-10-05");
  expect(copied).toContain("https://");
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Denied");
        },
      },
    }),
  );
  await page
    .getByRole("button", { name: "Copy for your AI assistant" })
    .click();
  await expect(
    page.getByLabel("Comparison with dates and sources"),
  ).toHaveValue(copied);
});
test("glossary anchors and discovery files resolve", async ({
  page,
  request,
}) => {
  await page.goto("/glossary");
  for (const id of ["wltp", "lfp", "v2l", "fbt", "driveaway"]) {
    await expect(page.locator(`#${id}`)).toBeVisible();
    const target = await page.locator(`#${id} a`).last().getAttribute("href");
    expect((await request.get(target!.split("#")[0])).status()).toBe(200);
  }
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("User-Agent: OAI-SearchBot");
  expect(robots).toContain("Allow: /");
  const llms = await (await request.get("/llms.txt")).text();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const pair of pairPages) {
    expect(llms).toContain(pair.slug);
    expect(sitemap).toContain(pair.slug);
  }
  expect(sitemap).toContain(`<lastmod>${PAGE_UPDATED}</lastmod>`);
});
