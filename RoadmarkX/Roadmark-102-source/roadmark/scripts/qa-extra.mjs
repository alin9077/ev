import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import assert from "node:assert/strict";
const origin = process.env.TEST_URL || "http://127.0.0.1:3002";
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const results = {
  routes: [],
  reflow: [],
  timing: [],
  fallbacks: [],
  requests: [],
};
page.on("request", (r) => {
  if (!r.url().startsWith(origin)) results.requests.push(r.url());
});
for (const path of [
  "/",
  "/cars",
  "/model-y",
  "/software",
  "/methodology",
  "/sources",
  "/cars/tesla-model-y/l-premium-awd-4",
]) {
  const response = await page.goto(origin + path);
  assert.equal(response.status(), 200);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  results.routes.push({
    path,
    violations: audit.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target),
    })),
  });
}
for (const [width, height, label] of [
  [320, 256, "400% equivalent layout viewport"],
  [640, 400, "200% equivalent layout viewport"],
  [844, 390, "phone landscape"],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(origin + "/compare");
  const reflow = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    headerPosition: getComputedStyle(
      document.querySelector(".compact-identity"),
    ).position,
  }));
  results.reflow.push({ label, ...reflow });
  assert.ok(reflow.scrollWidth <= width);
  assert.equal(reflow.headerPosition, "static");
  await page.screenshot({
    path: `qa/screenshots/reflow-${width}x${height}.png`,
  });
}
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(origin + "/compare");
await page
  .locator(".comparison-table tbody tr")
  .first()
  .scrollIntoViewIfNeeded();
await page.screenshot({ path: "qa/screenshots/compare-rows-390.png" });
await page.setViewportSize({ width: 1440, height: 1000 });
await page.goto(origin + "/compare");
await page
  .locator(".comparison-table tbody tr")
  .first()
  .scrollIntoViewIfNeeded();
await page.screenshot({ path: "qa/screenshots/compare-rows-1440.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(origin + "/");
await page
  .locator(".dark-chapter")
  .screenshot({ path: "qa/screenshots/software-chapter-390.png" });
await page.goto(origin + "/compare");
await page.evaluate(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: () => Promise.reject(new Error("Blocked for test")) },
    configurable: true,
  });
});
await page.getByRole("button", { name: "Copy comparison link" }).click();
await page.getByLabel("Comparison link", { exact: true }).waitFor();
results.fallbacks.push(
  "Clipboard denied: ordinary link and selectable input shown",
);
await page.evaluate(() => {
  Storage.prototype.setItem = () => {
    throw new Error("Blocked for test");
  };
});
await page
  .getByRole("button", { name: "Save shortlist on this device" })
  .click();
assert.match(await page.locator(".comparison-end").innerText(), /unavailable/);
results.fallbacks.push(
  "Local storage denied: useful message, comparison preserved",
);
const timingContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const timingPage = await timingContext.newPage();
for (const load of ["cold", "warm"]) {
  await timingPage.goto(origin);
  await timingPage.waitForLoadState("networkidle");
  const timing = await timingPage.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const resources = performance.getEntriesByType("resource");
    return {
      domContentLoadedMs: nav.domContentLoadedEventEnd,
      documentTransferBytes: nav.transferSize,
      scriptTransferBytes: resources
        .filter((r) => r.initiatorType === "script")
        .reduce((sum, r) => sum + r.transferSize, 0),
      resourceTransferBytes: resources.reduce(
        (sum, r) => sum + r.transferSize,
        0,
      ),
    };
  });
  results.timing.push({ load, ...timing });
}
fs.writeFileSync("qa/extended-results.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
await browser.close();
if (results.routes.some((r) => r.violations.length)) process.exitCode = 1;
