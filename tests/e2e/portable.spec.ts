import { test, expect } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
const file = pathToFileURL(path.join(process.cwd(), "index.html")).href;
test("standalone index works offline with selection, history, details and footnotes", async ({
  page,
  context,
  browserName,
}) => {
  // WebKit offline emulation blocks file URLs themselves. Block HTTP at routing instead.
  if (browserName !== "webkit") await context.setOffline(true);
  await context.route(/^https?:/, (route) => route.abort());
  const errors: string[] = [],
    network: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (/^https?:/.test(r.url())) network.push(r.url());
  });
  await page.goto(file);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tesla Model Y vs.",
  );
  await page.getByRole("link", { name: "Compare these cars" }).click();
  await page.getByRole("button", { name: /Challenger 1/ }).click();
  const picker = page.getByRole("dialog");
  await picker.getByLabel("Search by model, trim or generation").fill("EV3");
  await picker
    .getByRole("button")
    .filter({ has: page.getByText("Air 2WD Standard Range", { exact: true }) })
    .click();
  await expect(page.locator(".compact-identity")).toContainText("EV3");
  await page.reload();
  await expect(page.locator(".compact-identity")).toContainText("EV3");
  await page.getByRole("button", { name: "All features", exact: true }).click();
  await expect(page.getByLabel("Find a feature")).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Overview", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "EV Side by Side home" }).click();
  await expect(page.locator(".fleet-detail")).toHaveCount(90);
  const v2l = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-v2l") });
  await expect(v2l).toContainText("Five-seat V2L");
  const ref = v2l.locator(".footnote-refs a").first();
  const target = await ref.getAttribute("href");
  await ref.click();
  await expect(page.locator(target!)).toBeFocused();
  await page.getByRole("link", { name: "Explore cars", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Explore cars",
  );
  await page.getByLabel("Search cars").fill("Sealion");
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".vehicle-card")).toHaveCount(2);
  await page
    .getByRole("link", { name: "Explore this variant" })
    .first()
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Sealion",
  );
  expect(errors).toEqual([]);
  expect(network).toEqual([]);
});
test("served index loads as a self-contained page and passes automated accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/index.html");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tesla Model Y vs.",
  );
  await expect(page.locator(".inline-chapter")).toHaveCount(7);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
