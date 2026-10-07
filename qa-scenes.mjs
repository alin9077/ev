// Chapter scene checks on the running site and the offline file, in three engines.
import { chromium, firefox, webkit } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
const SITE = "http://127.0.0.1:3001/";
const FILE = pathToFileURL(path.join(process.cwd(), "index.html")).href;
const CHAPTERS = ["01", "02", "03", "04", "05", "06", "07"];
// The tone each panel rests in: the page's paper by day, navy by night.
const TONES = { "01": "day", "02": "night", "03": "day", "04": "day", "05": "day", "06": "night", "07": "night" };
const report = { errors: [], checks: [], violations: [], overflow: [] };
const check = (label, pass, detail = "") => {
  report.checks.push({ label, pass, detail });
  if (!pass) console.log("FAIL", label, detail);
};
/** A cheap fingerprint of what a canvas shows, and how much of it is lit. */
const read = (page, n) =>
  page.evaluate((n) => {
    const c = document.querySelector(`#chapter-${n} .driving-scene canvas`);
    const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
    let sum = 0, lit = 0;
    for (let i = 0; i < d.length; i += 16) { sum = (sum * 31 + d[i] + d[i + 1] * 3 + d[i + 2] * 7) % 1e9; if (d[i] + d[i + 1] + d[i + 2] > 150) lit++; }
    return { sum, lit, size: [c.width, c.height] };
  }, n);

for (const [engine, type] of [["chromium", chromium], ["webkit", webkit], ["firefox", firefox]]) {
  const browser = await type.launch();
  for (const [where, url] of [["site", SITE], ["offline file", FILE]]) {
    for (const reduced of [false, true]) {
      if (where === "offline file" && (reduced || engine !== "chromium")) continue;
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
      const page = await context.newPage();
      page.on("pageerror", (e) => report.errors.push(`${engine} ${where}: ${e.message}`));
      await page.goto(url);
      const tag = `${engine}, ${where}${reduced ? ", reduced motion" : ""}`;
      check(`${tag}: seven scenes`, (await page.locator(".driving-scene").count()) === 7 && (await page.locator(".loop-scene").count()) === 6);
      for (const n of CHAPTERS) {
        const scene = page.locator(`#chapter-${n} .driving-scene`);
        await scene.scrollIntoViewIfNeeded();
        await page.waitForTimeout(250);
        const toggle = scene.getByRole("button");
        const first = await read(page, n);
        check(`${tag}: ${n} paints`, first.lit > 500, JSON.stringify(first));
        check(`${tag}: ${n} is labelled`, ((await scene.locator("canvas").getAttribute("aria-label")) || "").length > 60);
        check(`${tag}: ${n} has three beats`, (await scene.locator(".driving-scene-acts li").count()) === 3);
        await page.waitForTimeout(300);
        const later = await read(page, n);
        if (reduced) {
          check(`${tag}: ${n} starts still`, later.sum === first.sum && (await toggle.getAttribute("aria-label")) === "Play animation");
          check(`${tag}: ${n} rests in its ${TONES[n]} tone`, (await scene.getAttribute("data-tone")) === TONES[n]);
          await toggle.click();
          await page.waitForTimeout(300);
          check(`${tag}: ${n} plays on request`, (await read(page, n)).sum !== later.sum);
        } else {
          check(`${tag}: ${n} moves`, later.sum !== first.sum);
          await toggle.click();
          await page.waitForTimeout(120);
          const held = await read(page, n);
          await page.waitForTimeout(300);
          check(`${tag}: ${n} pauses`, (await read(page, n)).sum === held.sum && (await toggle.getAttribute("aria-label")) === "Play animation");
          await toggle.click();
          await page.waitForTimeout(300);
          check(`${tag}: ${n} resumes`, (await read(page, n)).sum !== held.sum);
        }
      }
      if (where === "site" && !reduced) {
        // Scenes stop when scrolled away: nothing repaints off screen.
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const a = await read(page, "07");
        await page.waitForTimeout(300);
        check(`${tag}: 07 rests off screen`, (await read(page, "07")).sum === a.sum);
        // Software passes from night to day inside its loop, and its labels follow.
        await page.locator("#chapter-07 .driving-scene").scrollIntoViewIfNeeded();
        const tones = new Set();
        for (let i = 0; i < 28 && tones.size < 2; i++) { tones.add(await page.locator("#chapter-07 .driving-scene").getAttribute("data-tone")); await page.waitForTimeout(250); }
        check(`${tag}: 07 passes through night and day`, tones.size === 2, [...tones].join(","));
        for (const [label, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
          await page.setViewportSize({ width: w, height: h });
          await page.locator("#chapter-04 .driving-scene").scrollIntoViewIfNeeded();
          const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
          report.violations.push({ engine, label, violations: results.violations.map((v) => ({ id: v.id, targets: v.nodes.map((x) => x.target) })) });
        }
        for (const w of [320, 390, 768, 1024, 1440]) {
          await page.setViewportSize({ width: w, height: 800 });
          await page.waitForTimeout(100);
          const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
          report.overflow.push({ engine, width: w, scroll });
          check(`${tag}: no overflow at ${w}`, scroll <= w, String(scroll));
        }
        if (engine === "chromium")
          for (const [label, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
            await page.setViewportSize({ width: w, height: h });
            for (const n of CHAPTERS) {
              const el = page.locator(`#chapter-${n} .chapter-opening-art`);
              await el.scrollIntoViewIfNeeded();
              await page.waitForFunction((n) => {
                const item = document.querySelectorAll(`#chapter-${n} .driving-scene-acts li`)[1];
                const p = Number(getComputedStyle(item).getPropertyValue("--progress"));
                return item.hasAttribute("data-active") && p > 0.45 && p < 0.65;
              }, n, { polling: "raf", timeout: 10000 });
              await el.screenshot({ path: `qa/screenshots/scenes-${n}-${label}.png` });
            }
          }
      }
      await context.close();
    }
  }
  await browser.close();
}
const failed = report.checks.filter((c) => !c.pass);
const summary = { checks: report.checks.length, failed: failed.length, errors: report.errors.length, violations: report.violations.reduce((n, v) => n + v.violations.length, 0) };
fs.writeFileSync("qa/scenes-accessibility.json", JSON.stringify({ summary, ...report, checks: undefined, failed }, null, 2));
console.log(JSON.stringify(summary), failed.slice(0, 12), report.errors.slice(0, 5), JSON.stringify(report.violations.filter((v) => v.violations.length)).slice(0, 800));
