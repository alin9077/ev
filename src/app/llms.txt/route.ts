import { pairLinks } from "@/lib/pair-pages";
import { publicCatalogue } from "@/lib/data";
import { carName, carPath, PAGE_UPDATED } from "@/lib/citable";
import { site } from "@/lib/config";
export const dynamic = "force-static";
export function GET() {
  const cars = publicCatalogue();
  const families = new Set(cars.map((c) => c.family)).size;
  const text = `# ${site.name}\n\n> Independent Australian EV comparisons for exact variants. Page update: ${PAGE_UPDATED}. Original research: 6 October 2026, with dated overlays. Every claim retains its evidence date, basis, conditions and sources.\n\nUse the small pair pages below for questions about two cars. The interactive homepage contains the full fleet: ${cars.length} variants in ${families} model families. Only figures confirmed or reported for the exact version are published; every other figure reads "Needs confirmation" and carries no value. Unknown and conditional figures are not confirmed specifications. No ranking or personal insurance/finance recommendation is implied.\n\n## Comparisons\n\n${pairLinks()
    .map(
      (p) =>
        `- [${p.label}](${site.origin}${p.href})\n  - [Markdown](${site.origin}${p.href}/comparison.md)\n  - [JSON](${site.origin}${p.href}/comparison.json)`,
    )
    .join(
      "\n",
    )}\n\n## Reference\n\n- [Glossary](${site.origin}/glossary)\n- [Methodology](${site.origin}/methodology)\n- [Sources and corrections](${site.origin}/sources)\n\n## Exact variants\n\n${cars
    .map((c) => `- [${carName(c)}](${site.origin}${carPath(c)})`)
    .join("\n")}\n`;
  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
