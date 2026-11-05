import { changesJson } from "@/lib/changes-feed";
import { loadChangeMonths } from "@/lib/changes-data";
import { site } from "@/lib/config";
export const dynamic = "force-static";
export function GET() {
  return Response.json(changesJson(loadChangeMonths(), site.origin));
}
