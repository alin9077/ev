import { test, expect } from "@playwright/test";

test("all ten families share swipe position, keep Tesla fixed and preserve trims", async ({
  page,
}) => {
  // Retained traces of all ten cars add substantial per-action overhead in WebKit.
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(
    page.getByRole("combobox", { name: "Tesla baseline", exact: true }),
  ).toHaveValue("tesla_model_y__premium_rwd__2");
  const hero = page.locator(".fleet-hero-row"),
    track = hero.locator(".swipe-track");
  await expect(hero.locator(".baseline-card")).toHaveCount(1);
  await expect(track.locator(".swipe-card")).toHaveCount(9);
  await expect(page.locator(".fleet-detail")).toHaveCount(90);
  await expect(
    page.getByRole("button", { name: "Previous EV", exact: true }),
  ).toBeDisabled();
  await track.scrollIntoViewIfNeeded();
  const rect = await track.boundingBox();
  await page.mouse.move(rect!.x + 310, rect!.y + 35);
  await page.mouse.down();
  await page.mouse.move(rect!.x + 40, rect!.y + 35, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByLabel("Jump to EV")).toHaveValue("1");
  await expect(page.locator(".fleet-anchor-label")).toContainText("Model Y");
  const profiles = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-driver_profiles_local") });
  await expect
    .poll(() =>
      profiles.locator(".swipe-track").evaluate((el) => el.scrollLeft),
    )
    .toBeGreaterThan(300);
  await page.getByLabel("Jump to EV").selectOption("8");
  await expect(
    page.getByRole("button", { name: "Next EV", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".fleet-position")).toHaveText("9 / 9");
  await track.focus();
  await page.keyboard.press("Home");
  await expect(page.getByLabel("Jump to EV")).toHaveValue("0");
  await page
    .getByRole("combobox", { name: "BYD Sealion 7 trim", exact: true })
    .selectOption("byd_sealion_7__performance_awd__2");
  await page
    .getByRole("combobox", { name: "Tesla baseline", exact: true })
    .selectOption("tesla_model_y__l_premium_awd__4");
  await expect(hero.locator(".baseline-card")).toContainText("six-seat");
  await expect(profiles.locator('.swipe-card[data-index="0"]')).toContainText(
    "Performance AWD",
  );
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "BYD Sealion 7 trim", exact: true }),
  ).toHaveValue("byd_sealion_7__performance_awd__2");
  await expect(
    page.getByRole("combobox", { name: "Tesla baseline", exact: true }),
  ).toHaveValue("tesla_model_y__l_premium_awd__4");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel("Jump to EV").selectOption("7");
  await expect(page.locator(".fleet-position")).toHaveText("8 / 9");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const v2l = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-v2l") });
  await v2l.locator(".swipe-track").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Jump to EV")).toHaveValue("8");
});

test("conditional features explain dependencies beside the label", async ({
  page,
}) => {
  await page.goto("/");
  const v2l = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-v2l") });
  await expect(
    v2l.locator(".baseline-card .conditional-context"),
  ).toContainText("Why conditional");
  await expect(
    v2l.locator(".baseline-card .conditional-context"),
  ).toContainText("VIN");
  const phone = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-supercharger_access") });
  await expect(
    phone.locator('.swipe-card[data-index="0"] .conditional-context'),
  ).toContainText("Tesla app");
  await expect(
    page.locator(
      ".feature-value:has(> .status.conditional):not(:has(.conditional-context))",
    ),
  ).toHaveCount(0);
  await page.getByLabel("Jump to EV").selectOption("8");
  await expect(
    page
      .locator(".fleet-detail")
      .filter({ has: page.locator("#detail-price_aud") })
      .locator('.swipe-card[data-index="8"] .conditional-context'),
  ).toContainText("driveaway quote");
});

test("phones show one rival beside Model Y in the offline file", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await context.route(/^https?:/, (route) => route.abort());
  await page.goto(`file://${process.cwd()}/index.html`);
  const range = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-range_km") });
  const sides = await range.evaluate((el) => {
    const left = el.querySelector(".baseline-card")!.getBoundingClientRect(),
      right = el
        .querySelector(".swipe-card:not([inert])")!
        .getBoundingClientRect();
    return { top: left.top - right.top, gap: right.left - left.right };
  });
  expect(Math.abs(sides.top)).toBeLessThan(2);
  expect(sides.gap).toBeGreaterThanOrEqual(0);
  await expect(range.locator(".fact-basis").first()).toBeHidden();
  await range.getByRole("button", { name: "Details: Claimed range" }).click();
  await expect(range.locator(".fact-basis").first()).toBeVisible();
  await page.getByRole("button", { name: "Next EV", exact: true }).click();
  await expect(page.getByLabel("Jump to EV")).toHaveValue("1");
  await page.getByLabel("Jump to EV").selectOption("5");
  await expect(page.locator(".fleet-position")).toHaveText("6 / 9");
  await expect(page.locator(".fleet-anchor-label")).toContainText("Model Y");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("the chapter row in the sticky bar jumps, steps and marks the chapter in view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Jump to chapter" });
  const current = nav.locator('[aria-current="true"]');
  await expect(nav.locator(".fleet-chapter-chip")).toHaveCount(7);
  await nav.getByRole("link", { name: /^Chapter C:/ }).click();
  await expect(page).toHaveURL(/#chapter-03$/);
  // From here the bar is stuck to the top. Playwright's click scrolls a sticky target
  // "into view" first, moving the page under test, so these clicks are dispatched.
  await expect(current).toHaveAttribute("aria-label", /Range & charging/);
  // Steps taken while the page is still scrolling and loading must add up.
  const next = nav.getByRole("link", { name: /^Next chapter/ });
  const previous = nav.getByRole("link", { name: /^Previous chapter/ });
  await expect(next).toHaveAttribute("href", "#chapter-04");
  await next.dispatchEvent("click");
  await expect(page).toHaveURL(/#chapter-04$/);
  await expect(next).toHaveAttribute("href", "#chapter-05");
  await next.dispatchEvent("click");
  await expect(page).toHaveURL(/#chapter-05$/);
  await expect(previous).toHaveAttribute("href", "#chapter-04");
  await previous.dispatchEvent("click");
  await expect(page).toHaveURL(/#chapter-04$/);
  await expect(current).toHaveAttribute("aria-label", /Space & safety/);
  await expect(nav.locator(".fleet-chapter-title")).toHaveText(
    "Space & safety",
  );
  // The chapter comes to rest just under the bar, even as rows above load.
  const gap = () =>
    page.evaluate(
      () =>
        document.querySelector("#chapter-04")!.getBoundingClientRect().top -
        document.querySelector(".fleet-controls")!.getBoundingClientRect()
          .bottom,
    );
  await expect.poll(gap).toBeGreaterThanOrEqual(0);
  await expect.poll(gap).toBeLessThan(80);
  await expect(current).toHaveAttribute("aria-label", /Space & safety/);
  const price = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-driveaway_price") });
  await expect(price.locator(".baseline-card")).toContainText(
    "A$63,963 in Sydney",
  );
});
