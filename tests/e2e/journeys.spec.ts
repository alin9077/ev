import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const baseline = "tesla_model_y__premium_long_range_awd__1",
  challenger = "byd_sealion_7__premium_rwd__1",
  third = "kia_ev3__air_2wd_standard_range__1";
test("homepage offers an actionable comparison in the first phone viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Tesla Model Y vs.",
  );
  // On phones the home page is the one-to-one comparison: both names and the picker lead.
  await expect(page.locator(".fleet-anchor-label")).toBeInViewport();
  await expect(page.getByLabel("Jump to EV")).toBeInViewport();
  await page.getByRole("button", { name: "Next EV", exact: true }).click();
  await expect(page.locator(".fleet-position")).toHaveText("2 / 9");
  expect(errors).toEqual([]);
});
test("all four Model Ys update data, L scope stays separate, picker focus returns", async ({
  page,
}) => {
  await page.goto("/compare");
  for (const [search, label, seat] of [
    ["Premium RWD", "Premium RWD", "5"],
    ["L Premium", "L Premium AWD (six-seat)", "6"],
    ["Performance", "Performance AWD", "5"],
  ]) {
    const trigger = page.getByRole("button", { name: /Model Y baseline/ });
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Model Y baseline" });
    await dialog.getByLabel("Search by model, trim or generation").fill(search);
    await dialog
      .getByRole("button")
      .filter({ has: page.getByText(label, { exact: true }) })
      .click();
    await expect(trigger).toContainText(label);
    await expect(page.locator("#overview-seats").locator("..")).toContainText(
      seat,
    );
  }
  await page.getByRole("button", { name: /Model Y baseline/ }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: /Model Y baseline/ }),
  ).toBeFocused();
});
test("desktop third vehicle persists on phone, refresh and history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/compare");
  await page.getByRole("button", { name: /Add a third vehicle/ }).click();
  const picker = page.getByRole("dialog");
  await picker.getByLabel("Search by model, trim or generation").fill("EV3");
  await picker
    .getByRole("button")
    .filter({ has: page.getByText("Air 2WD Standard Range", { exact: true }) })
    .click();
  await expect(page).toHaveURL(new RegExp(third));
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".mobile-challengers")).toBeVisible();
  await expect(page.locator(".compact-identity")).toContainText("EV3");
  await page
    .locator(".mobile-challengers")
    .getByRole("button", { name: /BYD Sealion/ })
    .click();
  await expect(
    page.locator(".compact-identity>div").filter({ visible: true }),
  ).toHaveCount(2);
  await expect(page.locator("main")).toHaveAttribute("aria-busy", "false");
  await page.reload();
  expect(new URL(page.url()).searchParams.get("cars")?.split(",")).toHaveLength(
    3,
  );
  await page.getByRole("button", { name: "All features", exact: true }).click();
  await expect(page.getByLabel("Find a feature")).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("button", { name: "Overview", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});
test("feature search, numbered footnotes and safe source links", async ({
  page,
}) => {
  await page.goto("/compare");
  await page.getByRole("button", { name: "All features", exact: true }).click();
  await page.getByLabel("Find a feature").fill("needs confirmation");
  await expect(
    page.getByRole("status").filter({ hasText: "features" }),
  ).toContainText("features");
  await page.getByLabel("Find a feature").fill("Phone as driving key");
  await page.getByLabel("Differences only").check();
  await expect(page.locator(".comparison-table tbody tr")).toHaveCount(1);
  const ref = page.locator(".comparison-table .footnote-refs a").first();
  const target = await ref.getAttribute("href");
  await ref.click();
  await expect(page.locator(target!)).toBeFocused();
  await expect(
    page
      .locator(target!)
      .getByRole("link", { name: /new tab/ })
      .first(),
  ).toHaveAttribute("href", /^https:/);
  await page
    .locator(target!)
    .getByRole("link", { name: "Back to reference ↑" })
    .click();
  await expect(ref).toBeFocused();
  await expect(
    page.getByRole("button", { name: /View.*evidence/ }),
  ).toHaveCount(0);
});
test("software distinguishes EV3 pending notices and Model Y L", async ({
  page,
}) => {
  await page.goto(`/software?car=${third}`);
  await expect(
    page.getByRole("heading", {
      name: "At least 6 update notices documented",
    }),
  ).toBeVisible();
  await page.getByLabel("Show events").selectOption("Pending evidence");
  await expect(page.locator(".timeline>li")).toHaveCount(2);
  await page.goto("/software?car=tesla_model_y__l_premium_awd__4");
  await expect(
    page.getByRole("heading", {
      name: "No release count documented for this version",
    }),
  ).toBeVisible();
  await expect(page.getByText(/not a count for this variant/)).toBeVisible();
});
test("URL handles duplicates, unknown IDs and dated shared context", async ({
  page,
}) => {
  await page.goto(
    `/compare?cars=missing,${challenger},${challenger}&data=2020-01-01`,
  );
  await expect(page.locator(".notice[role=status]")).toContainText(
    "unknown or removed",
  );
  await expect(
    page
      .locator(".compare-selectors")
      .getByRole("button", { name: /Model Y baseline/ }),
  ).toBeVisible();
  await expect(page.locator(".notice[role=status]")).toContainText(
    "2020-01-01",
  );
});
test("all chapter details are inline with usable anchors, evidence and specific conditions", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator(".inline-chapter")).toHaveCount(7);
  await expect(page.locator(".fleet-detail")).toHaveCount(90);
  await expect(page.locator(".inline-chapter").first()).toHaveAttribute(
    "id",
    "chapter-01",
  );
  await expect(page.locator(".fleet-detail").first()).toHaveAttribute(
    "aria-labelledby",
    "detail-price_aud",
  );
  await expect(page.locator("#chapter-02 .fleet-detail")).toHaveCount(7);
  await page.getByRole("button", { name: "Software", exact: true }).click();
  await expect(page.locator(".inline-chapter").first()).toHaveAttribute(
    "id",
    "chapter-01",
  );
  await expect(page.locator(".inline-chapter").nth(2)).toHaveAttribute(
    "id",
    "chapter-07",
  );
  await expect(page.locator("#chapter-07 .inline-history")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Comparison chapters" })
    .getByRole("link", { name: /Daily convenience/ })
    .click();
  await expect(page).toHaveURL(/#chapter-05$/);
  const memory = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-driver_profiles_local") });
  await expect(memory).toContainText("Up to 10 driver profiles");
  await expect(memory).toContainText("2 seat-and-mirror memory positions");
  const v2l = page
    .locator(".fleet-detail")
    .filter({ has: page.locator("#detail-v2l") });
  await expect(v2l).toContainText("3.3 kW V2L · at least 15% charge to start");
  await v2l.getByRole("button", { name: "Details: Vehicle-to-load" }).click();
  const ref = v2l
    .locator('.swipe-card[data-index="0"] .footnote-refs a')
    .first();
  const target = await ref.getAttribute("href");
  await ref.click();
  await expect(page.locator(target!)).toBeFocused();
  await page
    .locator(target!)
    .getByRole("link", { name: "Back to reference ↑" })
    .click();
  await expect(ref).toBeFocused();
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
test("discovery, detail and sources routes are usable", async ({ page }) => {
  await page.goto("/cars?family=byd-atto-3&availability=all");
  await expect(page.locator(".vehicle-card")).toHaveCount(4);
  await page.getByLabel("Search cars").fill("Dynamic");
  await expect(page.locator(".vehicle-card")).toHaveCount(1);
  await page.getByRole("link", { name: "Explore this variant" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /ATTO 3/i,
  );
  await page
    .getByText("ANCAP applicability is unresolved", { exact: false })
    .first()
    .isVisible();
  await page.goto("/sources");
  await page.getByLabel("Search sources").fill("v2_tesla_y_l_ancap");
  await expect(page.locator(".source-registry details")).toHaveCount(2);
});
test("local shortlist never overrides a shared URL and copy has a fallback", async ({
  page,
}) => {
  await page.goto(`/compare?cars=${baseline},${third}`);
  await page
    .getByRole("button", { name: "Save shortlist on this device" })
    .click();
  await expect(page.getByRole("status").last()).toContainText("Saved");
  await page.goto(`/compare?cars=${baseline},${challenger}`);
  await expect(
    page.getByRole("button", { name: /Challenger 1/ }),
  ).toContainText("Sealion 7");
  await page.getByRole("button", { name: "Copy comparison link" }).click();
  await expect(page.getByRole("status").first()).toContainText(
    /copied|Copy the link/,
  );
});
test("print retains all three vehicles and evidence references", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Print media emulation documented in Chromium",
  );
  await page.goto(`/compare?cars=${baseline},${challenger},${third}`);
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".print-notes")).toBeVisible();
  await expect(page.locator(".compact-identity>div")).toHaveCount(3);
  await expect(page.locator(".compare-selectors")).toBeHidden();
  await page.pdf({
    path: "qa/comparison-print.pdf",
    format: "A4",
    landscape: true,
  });
});
test("viewport screenshots, reflow and no restricted media requests", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Viewport matrix captured in Chromium; journeys run in other engines",
  );
  const requests: string[] = [];
  page.on("request", (r) => {
    if (!r.url().startsWith(process.env.TEST_URL || "http://127.0.0.1:3001"))
      requests.push(r.url());
  });
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width > 767 ? 1000 : 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `qa/screenshots/home-${width}.png` });
    await page.goto(`/compare?cars=${baseline},${challenger},${third}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `qa/screenshots/compare-${width}.png` });
  }
  expect(
    requests.filter((u) => /tesla|youtube|google-analytics/.test(u)),
  ).toEqual([]);
});
