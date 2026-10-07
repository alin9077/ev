import { pairPages, pairReport } from "@/lib/pair-pages";
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
  return report
    ? Response.json({ schemaVersion: "1.0", ...report })
    : Response.json({ error: "Comparison not found" }, { status: 404 });
}
