import type { MetadataRoute } from "next";
import { site, indexable, previewNoindex } from "@/lib/config";
export const dynamic = "force-static";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      "*",
      "OAI-SearchBot",
      "ChatGPT-User",
      "GPTBot",
      "PerplexityBot",
      "Perplexity-User",
      "ClaudeBot",
      "Claude-SearchBot",
      "Claude-User",
      "Google-Extended",
    ].map((userAgent) => ({
      userAgent,
      allow: indexable ? "/" : undefined,
      disallow: indexable ? ["/*?"] : ["/"],
    })),
    // A preview does not advertise a sitemap.
    ...(!previewNoindex ? { sitemap: `${site.origin}/sitemap.xml` } : {}),
  };
}
