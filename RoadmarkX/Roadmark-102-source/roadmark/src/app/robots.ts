import type { MetadataRoute } from "next";
import { site, publishedOrigin } from "@/lib/config";
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
      allow: publishedOrigin ? "/" : undefined,
      disallow: publishedOrigin ? ["/*?"] : ["/"],
    })),
    sitemap: `${site.origin}/sitemap.xml`,
  };
}
