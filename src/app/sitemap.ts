import type { MetadataRoute } from "next";
import { catalogue } from "@/lib/data";
import { site } from "@/lib/config";
import { pairPages } from "@/lib/pair-pages";
import { PAGE_UPDATED } from "@/lib/citable";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/market",
    "/discover",
    "/model-y",
    "/cars",
    "/software",
    "/methodology",
    "/sources",
    "/comparisons",
    "/glossary",
    "/changes",
    ...pairPages.map((p) => `/compare/${p.slug}`),
    ...catalogue().map((c) => `/cars/${c.family}/${c.slug}`),
  ].map((path) => ({
    url: `${site.origin}${path}`,
    lastModified: PAGE_UPDATED,
  }));
}
