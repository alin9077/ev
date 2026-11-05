import { CorrectionHistory } from "@/components/correction-history";
import Link from "next/link";
import type { Query } from "@/lib/page-props";
import { research } from "@/lib/data";
import SourceRegistry from "@/components/source-registry";
import audit from "../../../data/source-audit-2026-10-08.json";
export const metadata = {
  title: "Sources & corrections",
  alternates: { canonical: "/sources" },
};
export default async function Sources({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query =
    process.env.SITE_STATIC_EXPORT === "1" ? {} : await searchParams;
  const ids = typeof query.ids === "string" ? query.ids.split(",") : [];
  const sources = ids.length
    ? research().sources.filter((s) => ids.includes(s.id))
    : research().sources;
  return (
    <main id="main" className="container editorial-page">
      <p className="eyebrow">Follow the claim to its source</p>
      <h1>Sources</h1>
      <p className="lede">
        Manufacturer documents, independent reports and owner observations have
        different evidential weight. Dates and access limitations stay attached.
      </p>
      <p>
        Research dates vary by claim and source. This registry preserves
        supplied and subsequently checked references; it does not imply every
        page was freshly retrieved.
      </p>
      <>
        <section className="source-audit" id="source-audit">
          <h2>8 October 2026 source audit</h2>
          <p>
            All 32 buyer sources previously read only through search summaries
            were attempted. Full text was retrieved for 22; 10 remain
            inaccessible. Opening a page does not confirm every claim.
            Unsupported or inaccessible claims are withheld or explicitly
            qualified in the comparison.
          </p>
          <details>
            <summary>See every source check and correction</summary>
            <ul>
              {audit.sources.map((s) => (
                <li key={s.source_id}>
                  <a href={s.url}>{s.source_id}</a> — {s.status} · Attempted{" "}
                  {s.attempted_date}. {s.note}
                </li>
              ))}
            </ul>
          </details>
        </section>
        {ids.length > 0 && (
          <p>
            Showing references for the selected claim.{" "}
            <Link href="/sources">View all sources</Link>
          </p>
        )}
        <SourceRegistry sources={sources} />
      </>
      <CorrectionHistory />
      <section className="editorial-text">
        <h2>Corrections</h2>
        <p>
          A useful correction identifies the exact variant, claim, dated
          original source and Australian build applicability. A public
          correction inbox has not yet been provided; no contact form collects
          data.
        </p>
        <h3>Correction log</h3>
        <p>
          8 October 2026 — Added dated source checks and corrected unsupported
          alert persistence, battery chemistry, service-centre count and
          charging-cable claims. Restricted industry-data driveaway and weight
          figures are withheld pending maker evidence or permission. The
          original research remains preserved.
        </p>
        <p>
          6 October 2026 — Imported supplied research without altering
          automotive source records. The display adapter suppresses the
          inherited Model Y L software count and preserves the EV3 six-plus-two
          evidence distinction.
        </p>
      </section>
    </main>
  );
}
