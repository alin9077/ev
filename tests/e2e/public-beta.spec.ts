import { test, expect } from "@playwright/test";

// The ten-minute phone script (docs/PHONE_TEST_SCRIPT.md), automated at 375x667.
test.describe("public beta on a phone", () => {
  test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });

  test("homepage is at most 12,000 px tall and lists twelve cards", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".catalogue-card")).toHaveCount(12);
    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );
    expect(height).toBeLessThanOrEqual(12000);
    await expect(page.getByText("Show 12 more")).toBeVisible();
  });

  test("the top bar is on every page, sticky, and keyboard reachable", async ({
    page,
    browserName,
  }) => {
    for (const path of ["/", "/discover", "/compare", "/methodology"]) {
      await page.goto(path);
      const nav = page.getByRole("navigation", { name: "Main" });
      await expect(nav.getByRole("link")).toHaveText([
        "Find by need",
        "Explore",
        "Compare",
        "Shortlist",
        "Model Y pick",
      ]);
    }
    await page.goto("/discover");
    await page.evaluate(() => window.scrollTo(0, 3000));
    await expect(page.locator(".site-nav")).toBeInViewport();
    // Reachable by keyboard: focusable, and Tab moves along the bar. (WebKit
    // does not Tab onto links unless the OS setting is on, so the move is
    // asserted only where the browser supports it.)
    const links = page
      .getByRole("navigation", { name: "Main" })
      .getByRole("link");
    await links.first().focus();
    await expect(links.first()).toBeFocused();
    if (browserName !== "webkit") {
      await page.keyboard.press("Tab");
      await expect(links.nth(1)).toBeFocused();
    }
  });

  test("a hero reason still lands on its detail inside the closed comparison", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator(".fleet-full-comparison")).not.toHaveAttribute(
      "open",
      "",
    );
    await page.locator(".verdict-reason").first().click();
    await expect(page.locator(".fleet-full-comparison")).toHaveAttribute(
      "open",
      "",
    );
    await expect(page.locator("#detail-adas_optional")).toBeInViewport();
  });

  test("first-time phone visitor completes the script in under 60 s", async ({
    page,
    browser,
  }) => {
    // Loading the 12 MB page is measured by Lighthouse, not by this budget.
    test.setTimeout(180_000);
    await page.goto("/");
    const search = page.getByRole("searchbox", {
      name: "Find a model or exact trim",
    });
    await expect(search).toBeVisible({ timeout: 90_000 });
    const started = Date.now();

    // Find Kia EV5 and see its price and range on the card.
    await search.fill("Kia EV5");
    const ev5 = page
      .locator(".catalogue-card")
      .filter({ hasText: "EV5" })
      .first();
    await expect(ev5).toContainText("A$");
    await expect(ev5).toContainText(/\d+ km/);
    await ev5.getByRole("button", { name: /^Compare/ }).click();

    // Add BYD Sealion 7.
    await search.fill("Sealion 7");
    const sealion = page
      .locator(".catalogue-card")
      .filter({ hasText: "Sealion 7" })
      .first();
    await expect(sealion).toContainText("A$");
    await sealion.getByRole("button", { name: /^Compare/ }).click();
    await page.getByRole("link", { name: /Compare selected/ }).click();
    await expect(page).toHaveURL(/\/compare\?cars=/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Open a Check condition, when the pair carries one.
    const check = page
      .locator("details.evidence-grade-check > summary")
      .first();
    if (await check.count()) {
      await check.click();
      await expect(check.locator("..")).toHaveAttribute("open", "");
    }

    // Share link: the address of the comparison is the link.
    const shared = page.url();
    expect(Date.now() - started).toBeLessThan(60_000);

    // Open on desktop.
    const desktop = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await desktop.goto(shared);
    await expect(desktop.locator("body")).toContainText("Kia EV5");
    await expect(desktop.locator("body")).toContainText("Sealion 7");
    await desktop.close();
  });
});
