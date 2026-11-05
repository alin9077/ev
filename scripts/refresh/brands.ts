/** Sales order comes from docs/M1_BRAND_ORDER.md, the one place it is recorded. */
import fs from "node:fs";
import path from "node:path";

export type BrandRank = { sales: string; rank: number; ytdBevs: number };
const fold = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
/** Sales-table label -> catalogue brands processed with it (docs/M1_BRAND_ORDER.md). */
const catalogueBrandsForSales: Record<string, string[]> = {
  "omoda jaecoo": ["Jaecoo", "Omoda"],
  mg: ["MG", "IM"],
};
export function parseBrandOrder(markdown: string): BrandRank[] {
  const lines = markdown.split(/\r?\n/);
  const start = lines.findIndex((line) => /^\|\s*Brand\s*\|/i.test(line));
  if (start < 0) throw new Error("Brand order table not found");
  const rows: BrandRank[] = [];
  for (const line of lines.slice(start + 2)) {
    const match = /^\|\s*([^|]+?)\s*\|\s*([\d,]+)\s*\|\s*$/.exec(line);
    if (!match) break;
    rows.push({
      sales: match[1],
      rank: rows.length + 1,
      ytdBevs: Number(match[2].replaceAll(",", "")),
    });
  }
  if (!rows.length) throw new Error("Brand order table is empty");
  return rows;
}
export function loadBrandOrder(root = process.cwd()): BrandRank[] {
  return parseBrandOrder(
    fs.readFileSync(path.join(root, "docs/M1_BRAND_ORDER.md"), "utf8"),
  );
}
/** Position of a catalogue brand in sales order; unlisted brands sort last, alphabetically. */
export function salesRank(catalogueBrand: string, order: BrandRank[]) {
  const key = fold(catalogueBrand);
  for (const row of order) {
    const salesKey = fold(row.sales);
    const members = (catalogueBrandsForSales[salesKey] ?? [row.sales]).map(
      fold,
    );
    if (salesKey === key || members.includes(key)) return row.rank;
  }
  return Number.POSITIVE_INFINITY;
}
export function compareBrands(a: string, b: string, order: BrandRank[]) {
  const diff = salesRank(a, order) - salesRank(b, order);
  if (diff !== 0 && !Number.isNaN(diff)) return diff;
  return a.localeCompare(b);
}
/** True when `requested` names the catalogue brand, or its sales-table group. */
export function brandMatches(requested: string, catalogueBrand: string) {
  const want = fold(requested);
  if (want === fold(catalogueBrand)) return true;
  return (catalogueBrandsForSales[want] ?? []).map(fold).includes(
    fold(catalogueBrand),
  );
}
export function brandSlug(brand: string) {
  return fold(brand).replaceAll(" ", "-");
}
