import { test, expect } from "@playwright/test";

test("December keeps cards, buyer reasons and unranked price figures visible", async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date("2026-12-01T01:00:00Z"));
  await page.goto("/discover");
  await expect(page.locator(".catalogue-card")).toHaveCount(12);
  await expect(
    page.locator(".catalogue-card .evidence-stale").first(),
  ).toContainText("Checked on");
  await page
    .getByRole("searchbox", { name: "Find a model or exact trim" })
    .fill("BYD Seal");
  await expect(
    page.locator(".catalogue-card").filter({ hasText: "Premium RWD" }).first(),
  ).toContainText("Why consider");
  await page
    .getByRole("button", { name: /Find vehicles for an attribute/ })
    .click();
  await page.getByRole("button", { name: "Spend less", exact: true }).click();
  await expect(page.locator(".discovery-unranked")).toBeVisible();
  await expect(
    page.locator(".discovery-unranked .discovery-result-value").first(),
  ).not.toHaveText("");
  await expect(
    page.locator(".discovery-unranked .evidence-stale").first(),
  ).toContainText("Needs a fresh check");
  await expect(
    page.locator(".discovery-ranking:not(.discovery-unranked) li"),
  ).toHaveCount(0);
  await expect(
    page.locator(".discovery-unranked .discovery-rank").first(),
  ).toHaveText("—");
  await page.getByRole("button", { name: "Go further", exact: true }).click();
  await expect(page.locator(".discovery-unranked")).toBeVisible();
  await expect(
    page.locator(".discovery-ranking:not(.discovery-unranked) li").first(),
  ).toBeVisible();
  await expect(
    page
      .locator(".discovery-ranking:not(.discovery-unranked) .evidence-stale")
      .first(),
  ).toContainText("Availability checked on");
});
