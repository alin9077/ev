import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
await page.goto('http://127.0.0.1:3001/');
await page.locator('.inline-chapter').first().waitFor();
await page.screenshot({ path: 'qa/screenshots/inline-home-desktop.png' });
await page.locator('#detail-driver_profiles_local').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'qa/screenshots/inline-details-desktop.png' });
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('#detail-v2l').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'qa/screenshots/inline-v2l-phone.png' });
await page.locator('#chapter-01').scrollIntoViewIfNeeded();
await page.screenshot({ path: 'qa/screenshots/inline-chapters-phone.png' });
const a11y = [];
for (const route of ['/', '/compare', '/cars', '/model-y', '/software', '/sources', '/methodology']) {
 await page.goto('http://127.0.0.1:3001'+route);
 const result = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 a11y.push({ route, violations: result.violations.map(v=>({id:v.id, impact:v.impact, targets:v.nodes.map(n=>n.target)})) });
}
fs.writeFileSync('qa/inline-accessibility.json',JSON.stringify(a11y,null,2));
console.log(JSON.stringify(a11y));
await browser.close();
