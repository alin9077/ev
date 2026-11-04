import fs from "node:fs";
import path from "node:path";
import { build } from "esbuild";
import { toWire } from "../src/lib/pack-wire";
import {
  catalogue,
  pickerCatalogue,
  publicPack,
  publicSources,
  research,
  publicCounts,
  publicEquipment,
  verificationCounts,
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
      "@/lib/pack-source": path.join(root, "src/portable/pack-source.ts"),
      "@/lib/chapter-art-src": path.join(
        root,
        "src/portable/chapter-art-src.ts",
      ),
    },
  });
  const d = research();
  const data = {
    cars: pickerCatalogue(),
    packs: Object.fromEntries(
      catalogue().map((c) => [c.id, toWire(publicPack(c.id))]),
    ),
    research: {
      sources: publicSources(),
      criteria: d.criteria,
      publication_issues: d.publication_issues,
    },
    equipment: publicEquipment(),
    verification: verificationCounts(),
    counts: publicCounts(),
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
  const json = JSON.stringify(data).replaceAll("<", "\\u003c");
  const js = result.outputFiles[0].text.replaceAll("</script", "<\\/script");
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  const page = (flag: string, title: string) =>
    `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><style>${css}</style></head><body><div id="root"></div><noscript>This interactive comparison needs JavaScript enabled.</noscript><script id="ev-data" type="application/json">${json}</script><script>${flag}${js}</script></body></html>`;
  // The B experience is the default landing page; keep index-b.html as an alias.
  const htmlB = page("window.__EV_B=true;", "EV Side by Side");
  fs.writeFileSync("index.html", htmlB);
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync("public/index.html", htmlB);
  fs.writeFileSync("index-b.html", htmlB);
  fs.writeFileSync("public/index-b.html", htmlB);
  console.log(
    `Portable B landing page written (${(Buffer.byteLength(htmlB) / 1e6).toFixed(2)} MB).`,
  );
  console.log("index.html and index-b.html both open the B experience.");
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
