import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const layout = readFileSync("src/app/layout.tsx", "utf8");

function run(env: Record<string, string>) {
  const code = `
    Promise.all([import("./src/lib/config.ts"), import("./src/app/robots.ts")]).then(([c, r]) => {
      const robots = (r.default.default || r.default)();
      console.log(JSON.stringify({ indexable: c.indexable, rules: robots.rules, sitemap: robots.sitemap }));
    });`;
  const out = spawnSync(process.execPath, ["--import", "tsx", "-e", code], {
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
  assert.equal(out.status, 0, out.stderr);
  return JSON.parse(out.stdout.trim().split("\n").pop()!);
}

test("a preview is never indexable, even at a public https origin", () => {
  const p = run({
    NEXT_PUBLIC_SITE_URL: "https://preview.example.com",
    NEXT_PUBLIC_PREVIEW_NOINDEX: "1",
  });
  assert.equal(p.indexable, false);
  assert.match(layout, /index: indexable, follow: !previewNoindex/);
  assert.ok(
    p.rules.every((r: { disallow: string[] }) => r.disallow[0] === "/"),
  );
  assert.ok(p.rules.every((r: { allow?: string }) => r.allow === undefined));
  assert.equal(p.sitemap, undefined);
});

test("the public build stays indexable when the preview flag is absent", () => {
  const p = run({
    NEXT_PUBLIC_SITE_URL: "https://example.com",
    NEXT_PUBLIC_PREVIEW_NOINDEX: "",
  });
  assert.equal(p.indexable, true);
  assert.equal(p.sitemap, "https://example.com/sitemap.xml");
});
