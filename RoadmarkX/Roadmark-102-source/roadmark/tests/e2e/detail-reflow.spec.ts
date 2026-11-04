import { test, expect, type Page } from "@playwright/test";

const sourceToken =
  "dealer_advertised_exact_MY26_page_not_manufacturer_verified";
const records = [
  {
    name: "Kawasaki Ninja e-1 MY26",
    model: "Ninja e-1",
    path: "/cars/kawasaki-ninja-e1-my26/kawasaki-ninja-e1-my26-nx011atfnn-brisbane-kaw-ne1-my26-1--20261010",
    longSourceToken: true,
  },
  {
    name: "Lexus ES 350e supplementary evidence",
    model: "ES",
    path: "/cars/lexus-es-bev-2026-launch/350e-sports-luxury-fwd-20261010",
    longSourceToken: false,
  },
  {
    name: "Tesla Model Y Premium RWD",
    model: "Model Y",
    path: "/cars/tesla-model-y/premium-rwd-2",
    longSourceToken: false,
  },
];

async function expectReflow(page: Page, columns: number) {
  const geometry = await page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const grids = [...document.querySelectorAll<HTMLElement>(".detail-facts")];
    const visible = (element: HTMLElement) => {
      for (let parent: HTMLElement | null = element; parent; parent = parent.parentElement) {
        if (parent instanceof HTMLDetailsElement && !parent.open) return false;
      }
      return element.getClientRects().length > 0;
    };
    return {
      viewport,
      documentWidth: document.documentElement.scrollWidth,
      columns: getComputedStyle(grids[0]).gridTemplateColumns.split(/\s+/).length,
      overflowing: grids.flatMap((grid) =>
        [...grid.querySelectorAll<HTMLElement>("section")]
          .filter(visible)
          .filter((section) => {
            const box = section.getBoundingClientRect();
            const gridBox = grid.getBoundingClientRect();
            return (
              box.left < gridBox.left - 1 ||
              box.right > gridBox.right + 1 ||
              box.right > viewport + 1 ||
              section.scrollWidth > section.clientWidth + 1
            );
          })
          .map((section) => section.querySelector("h3")?.textContent || "unnamed fact"),
      ),
    };
  });
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewport + 1);
  expect(geometry.columns).toBe(columns);
  expect(geometry.overflowing).toEqual([]);
}

for (const surface of ["production", "portable"] as const) {
  for (const record of records) {
    test(`${surface}: ${record.name} reflows with evidence and report disclosures`, async ({ page }) => {
      // 333 CSS px reproduces the reported layout width; this is not native zoom or real-phone QA.
      await page.setViewportSize({ width: 333, height: 844 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const target = surface === "portable"
        ? `/index.html?page=${encodeURIComponent(record.path)}`
        : record.path;
      await page.goto(target);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(record.model);
      const essentials = page.locator(".detail-facts").first();
      await expect(essentials.locator("section").first()).toBeVisible();
      if (record.longSourceToken) {
        await expect(
          essentials.locator(".fact-basis").filter({ hasText: sourceToken }).first(),
        ).toContainText(sourceToken);
      }

      const report = essentials.locator(".claim-report").first();
      const summary = report.locator(":scope > summary");
      const textarea = report.getByLabel("What needs correcting?");
      const draft = "Reflow regression draft: " + "unbroken_source_reference_".repeat(12);
      const supplementary = page.locator(".detail-supplementary > details");
      const supplementaryCount = await supplementary.count();
      for (let index = 0; index < supplementaryCount; index++) {
        await supplementary.nth(index).locator(":scope > summary").click();
        await expect(supplementary.nth(index)).toHaveAttribute("open", "");
      }

      for (const width of [320, 333, 390, 500, 768, 1100, 1440]) {
        await page.setViewportSize({ width, height: 844 });
        const columns = width <= 767 ? 1 : width <= 1100 ? 2 : 3;
        await expectReflow(page, columns);
        await summary.focus();
        await page.keyboard.press("Enter");
        await expect(report).toHaveAttribute("open", "");
        await textarea.fill(draft);
        await expect(textarea).toHaveValue(draft);
        await expectReflow(page, columns);
        const box = await textarea.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
        await summary.focus();
        await page.keyboard.press("Enter");
        await expect(report).not.toHaveAttribute("open", "");
        await expect(summary).toBeFocused();
        await expectReflow(page, columns);
      }
      // Repeated open/close must keep the user's draft and native keyboard operation intact.
      await summary.click();
      await expect(textarea).toHaveValue(draft);
      await summary.click();
      await expect(report).not.toHaveAttribute("open", "");
      expect(errors).toEqual([]);
    });
  }
}
