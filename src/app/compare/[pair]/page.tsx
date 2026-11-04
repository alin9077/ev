import Link from "next/link";
import { notFound } from "next/navigation";
import { pairPages, pairReport, pairLinks } from "@/lib/pair-pages";
import { publicCatalogue } from "@/lib/data";
import { carName, carPath } from "@/lib/citable";
import { CitableReportContent } from "@/components/citable-report";
export const dynamicParams = false;
export function generateStaticParams() {
  return pairPages.map((p) => ({ pair: p.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const report = pairReport(pair);
  return report
    ? {
        title: report.title,
        description: report.summary,
        alternates: { canonical: report.path },
      }
    : {};
}
export default async function PairPage({
  params,
}: {
  params: Promise<{ pair: string }>;
}) {
  const { pair } = await params;
  const report = pairReport(pair);
  if (!report) notFound();
  const families = publicCatalogue()
    .filter((c) => report.cars.some((r) => r.id === c.id))
    .map((c) => c.family);
  return (
    <main id="main" className="container editorial-page citable-page">
      <p className="eyebrow">Australian EV comparison / Dated evidence</p>
      <h1>{report.title}</h1>
      <CitableReportContent report={report} exports />
      <section className="answer-row">
        <h2>Compare a different trim</h2>
        <p>
          These pages describe exact variants. The default is Model Y Premium
          RWD and the entry current rival trim in our October snapshot.
        </p>
        <Link
          className="button primary"
          href={`/compare?cars=${report.cars.map((c) => c.id).join(",")}`}
        >
          Open the interactive comparison
        </Link>
        <ul>
          {publicCatalogue()
            .filter((c) => families.includes(c.family))
            .map((c) => (
              <li key={c.id}>
                <Link href={carPath(c)}>{carName(c)}</Link>
              </li>
            ))}
        </ul>
      </section>
      <section className="answer-row">
        <h2>Other Model Y comparisons</h2>
        <ul>
          {pairLinks()
            .filter((p) => p.slug !== pair)
            .map((p) => (
              <li key={p.slug}>
                <Link href={p.href}>{p.label}</Link>
              </li>
            ))}
        </ul>
      </section>
      <p>
        Read the <Link href="/methodology">methodology and limitations</Link> or{" "}
        <Link href="/sources">sources and corrections</Link>.
      </p>
    </main>
  );
}
