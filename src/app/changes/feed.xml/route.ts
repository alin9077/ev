import { changesRss } from "@/lib/changes-feed";
import { loadChangeMonths } from "@/lib/changes-data";
import { site } from "@/lib/config";
export const dynamic = "force-static";
export function GET() {
  return new Response(changesRss(loadChangeMonths(), site.origin), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
