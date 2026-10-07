import { pairPages, pairReport } from "@/lib/pair-pages";
import { reportMarkdown } from "@/lib/citable";
export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
  return pairPages.map((p) => ({ pair: p.slug }));
}
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pair: string }> },
) {
  const report = pairReport((await params).pair);
  return new Response(
    report ? reportMarkdown(report) : "Comparison not found",
    {
      status: report ? 200 : 404,
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    },
  );
}
