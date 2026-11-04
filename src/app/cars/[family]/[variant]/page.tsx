import { CitableReportContent } from "@/components/citable-report";
import { FootnoteProvider } from "@/components/footnotes";
import { makeReport, carPath } from "@/lib/citable";
export const dynamicParams = false;
import { notFound } from "next/navigation";
import Detail from "@/components/detail";
import { catalogue, publicPack, research } from "@/lib/data";
import { isUnverifiedVehicle } from "@/lib/coverage";
export function generateStaticParams() {
  return catalogue().map((c) => ({ family: c.family, variant: c.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string; variant: string }>;
}) {
  const p = await params;
  const c = catalogue().find(
    (c) => c.family === p.family && c.slug === p.variant,
  );
  return c
    ? {
        title: `${c.brand} ${c.model} ${c.trim}`,
        description: `Dated Australian research for ${c.brand} ${c.model} ${c.trim}. Specifications, conditions, software eligibility and original evidence.`,
        alternates: { canonical: `/cars/${c.family}/${c.slug}` },
        // No verified specification: the page stays reachable but is not offered to search engines.
        ...(isUnverifiedVehicle(publicPack(c.id).car)
          ? { robots: { index: false, follow: true } }
          : {}),
      }
    : {};
}
export default async function VariantPage({
  params,
}: {
  params: Promise<{ family: string; variant: string }>;
}) {
  const p = await params;
  const c = catalogue().find(
    (c) => c.family === p.family && c.slug === p.variant,
  );
  if (!c) notFound();
  const record = publicPack(c.id);
  return (
    <FootnoteProvider sources={record.sources}>
      <Detail pack={record} criteria={research().criteria}>
        {!isUnverifiedVehicle(record.car) && (
          <CitableReportContent report={makeReport([record], carPath(c))} />
        )}
      </Detail>
    </FootnoteProvider>
  );
}
