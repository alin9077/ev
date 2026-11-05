import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
const origin = process.env.NEXT_PUBLIC_SITE_URL;
if (!origin || !origin.startsWith("https://"))
  throw new Error(
    "Set NEXT_PUBLIC_SITE_URL to the public HTTPS origin before building.",
  );
const url = new URL(origin);
if (
  url.origin !== origin ||
  url.username ||
  url.password ||
  url.hostname === "localhost" ||
  url.hostname.endsWith(".local")
)
  throw new Error(
    "Use a public HTTPS origin without credentials, path, query or trailing slash.",
  );
// Next regenerates these route definitions after route additions/removals.
rmSync(".next/types", { recursive: true, force: true });
rmSync(".next/dev/types", { recursive: true, force: true });
rmSync("out", { recursive: true, force: true });
const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  { stdio: "inherit", env: { ...process.env, SITE_STATIC_EXPORT: "1" } },
);
if (result.status !== 0) process.exit(result.status || 1);
const preview = process.env.NEXT_PUBLIC_PREVIEW_NOINDEX === "1";
const html = readFileSync("out/index.html", "utf8");
const noindexed = html.includes('name="robots" content="noindex');
if (!html.includes('id="main"') || noindexed === !preview)
  throw new Error(
    preview
      ? "Preview homepage must contain rendered HTML and be marked noindex."
      : "Public homepage must contain rendered HTML and allow indexing.",
  );
writeFileSync(
  "out/_headers",
  `/*\n${preview ? "  X-Robots-Tag: noindex, nofollow\n" : ""}  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Content-Type-Options: nosniff\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n`,
);
console.log(`Public static HTML built for ${origin}`);
