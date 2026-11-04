import type { MetadataRoute } from "next";
import { publicCatalogue } from "@/lib/data";
import { isUnverifiedVehicle } from "@/lib/coverage";
import { site } from "@/lib/config";
import { pairPages } from "@/lib/pair-pages";
import { PAGE_UPDATED } from "@/lib/citable";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/model-y",
    "/cars",
    "/software",
    "/methodology",
    "/sources",
    "/comparisons",
    "/glossary",
    ...pairPages.map((p) => `/compare/${p.slug}`),
    // Variants with no verified specification stay reachable but are not offered to search engines.
    ...publicCatalogue()
      .filter((c) => !isUnverifiedVehicle(c))
      .map((c) => `/cars/${c.family}/${c.slug}`),
  ].map((path) => ({
    url: `${site.origin}${path}`,
    lastModified: PAGE_UPDATED,
  }));
}
