import marketInventory from "../src/lib/market-inventory-data";
import { encodePortableJson } from "../src/lib/portable-string-codec";
import fs from "node:fs";
import { validateCatalogueIssues } from "../src/lib/validate-catalogue-issues";
import { storePortablePacks } from "../src/lib/portable-packs";
import path from "node:path";
import { build } from "esbuild";
import {
  catalogue,
  pickerCatalogue,
  pack,
  research,
  counts,
} from "../src/lib/data";
async function main() {
  const root = process.cwd();
  const result = await build({
    entryPoints: ["src/portable/entry.tsx"],
    bundle: true,
    minify: true,
    write: false,
    format: "iife",
    platform: "browser",
    target: ["es2022"],
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.NEXT_PUBLIC_SITE_URL": '""',
    },
    alias: {
      "next/link": path.join(root, "src/portable/link.tsx"),
      "next/image": path.join(root, "src/portable/image.tsx"),
      "next/navigation": path.join(root, "src/portable/navigation.ts"),
      "@/lib/data": path.join(root, "src/portable/data.ts"),
      "@/lib/market-view-data": path.join(root, "src/portable/market-inventory-data.ts"),
      "@/lib/market-inventory-data": path.join(
        root,
        "src/portable/market-inventory-data.ts",
      ),
      "@/lib/chapter-art-src": path.join(
        root,
        "src/portable/chapter-art-src.ts",
      ),
    },
  });
  const d = research();
  const cars = catalogue();
  const issueErrors = validateCatalogueIssues(cars);
  if (issueErrors.length) throw new Error(issueErrors.join("\n"));
  const snapshot = { data: d, cars };
  const data = {
    marketInventory,
    cars: pickerCatalogue(),
    packs: storePortablePacks(
      Object.fromEntries(cars.map((c) => [c.id, pack(c.id, snapshot)])),
    ),
    research: {
      sources: d.sources,
      criteria: d.criteria,
      publication_issues: d.publication_issues,
      trim_equipment: d.trim_equipment,
    },
    counts: counts(),
    art: Object.fromEntries(
      fs
        .readdirSync("public/media/chapters")
        .filter((file) => file.endsWith(".svg"))
        .map((file) => [
          path.basename(file, ".svg"),
          `data:image/svg+xml;base64,${fs.readFileSync(path.join("public/media/chapters", file)).toString("base64")}`,
        ]),
    ),
  };
  const { json } = encodePortableJson(JSON.stringify(data), 32);
  const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  const page = (flag: string, title: string) =>
    `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${css}</style></head><body><div id="root"></div><noscript>This interactive comparison needs JavaScript enabled.</noscript><script id="ev-data" type="application/json">${json}</script><script>${flag}${js}</script></body></html>`;
  // Preserve the original Model Y hero above discovery; keep index-b.html as an alias.
  const htmlB = page(
    "window.__EV_B=true;",
    "Roadmark · Discover your kind of electric",
  );
  fs.writeFileSync("index.html", htmlB);
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync("public/index.html", htmlB);
  fs.writeFileSync("index-b.html", htmlB);
  fs.writeFileSync("public/index-b.html", htmlB);
  console.log(
    `Portable Roadmark experience written (${(Buffer.byteLength(htmlB) / 1e6).toFixed(2)} MB).`,
  );
  console.log(
    "index.html and index-b.html retain the Model Y hero above discovery; the original comparison is also available at ?page=/b.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
