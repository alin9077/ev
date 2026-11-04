import { test, expect, type Locator } from "@playwright/test";
import path from "node:path";
import { pathToFileURL } from "node:url";

const progress = (scene: Locator) =>
  scene.locator(".driving-scene-acts").innerHTML();

for (const source of ["/", "/b", "index.html", "index-b.html"]) {
  const url = source.startsWith("/")
    ? source
    : pathToFileURL(path.join(process.cwd(), source)).href;

  test(`${source}: load ahead, play on entry, suspend and preserve pause`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(url);
    const scene = page.locator("#chapter-07 .driving-scene");
    await expect(scene).toHaveAttribute("data-scene-state", "pending");
    expect(await scene.locator("canvas").getAttribute("width")).toBeNull();

    // Approach without revealing it: load and prepare, but don't spend its opening.
    await scene.evaluate((el) => {
      window.scrollTo({
        top:
          window.scrollY + el.getBoundingClientRect().top - innerHeight - 200,
        behavior: "instant",
      });
    });
    await expect(scene).toHaveAttribute("data-scene-state", "ready");
    await expect(scene.locator("canvas")).toHaveAttribute("width", /\d+/);
    const prepared = await progress(scene);
    await page.waitForTimeout(300);
    expect(await progress(scene)).toBe(prepared);

    await scene.scrollIntoViewIfNeeded();
    await expect.poll(() => progress(scene)).not.toBe(prepared);
    await scene.getByRole("button", { name: "Pause animation" }).click();
    const paused = await progress(scene);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(200);
    await scene.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    expect(await progress(scene)).toBe(paused);

    await scene.getByRole("button", { name: "Play animation" }).click();
    await expect.poll(() => progress(scene)).not.toBe(paused);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(200);
    const away = await progress(scene);
    await page.waitForTimeout(300);
    expect(await progress(scene)).toBe(away);
    await scene.scrollIntoViewIfNeeded();
    await expect.poll(() => progress(scene)).not.toBe(away);

    // Exercise visibility lifecycle deterministically, including its resume path.
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const hidden = await progress(scene);
    await page.waitForTimeout(300);
    expect(await progress(scene)).toBe(hidden);
    await page.evaluate(() => {
      Reflect.deleteProperty(document, "hidden");
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(() => progress(scene)).not.toBe(hidden);
  });

  test(`${source}: reduced motion waits for explicit play on mobile`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(url);
    const scene = page.locator("#chapter-02 .driving-scene");
    await scene.scrollIntoViewIfNeeded();
    await expect(scene).toHaveAttribute("data-scene-state", "ready");
    await expect(
      scene.getByRole("button", { name: "Play animation" }),
    ).toBeEnabled();
    await page.waitForTimeout(200);
    const still = await progress(scene);
    await page.waitForTimeout(300);
    expect(await progress(scene)).toBe(still);
    await scene.getByRole("button", { name: "Play animation" }).click();
    await expect.poll(() => progress(scene)).not.toBe(still);
  });
}
