import Link from "next/link";
import {
  type Claim,
  type CitableReport,
  reportMarkdown,
  reportSchema,
} from "@/lib/citable";
import { CopyForAI } from "./copy-for-ai";

const terms: Record<string, string> = {
  range_km: "wltp",
  battery_chemistry: "lfp",
  v2l: "v2l",
  novated_fbt: "fbt",
  driveaway_price: "driveaway",
};
export function CitedClaim({ claim }: { claim: Claim }) {
  return (
    <div className="cited-claim">
      <p>{claim.sentence}</p>
      <ul
        className="claim-sources"
        aria-label={`Sources for ${claim.car} ${claim.label}`}
      >
        {claim.sources.map((s) => (
          <li key={s.id}>
            <a href={s.url || undefined} rel="noreferrer">
              {s.publisher}: {s.title} ({s.market})
            </a>
            {" · Source accessed "}
            <time dateTime={s.accessed_date}>{s.accessed_date}</time>
            {s.published_date && <> · Published {s.published_date}</>}
            {s.checked && <> · Full text checked {s.checked}</>}
            {s.limitation && (
              <span className="source-limitation"> · {s.limitation}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
export function CitableReportContent({
  report,
  exports = false,
}: {
  report: CitableReport;
  exports?: boolean;
}) {
  const copyId = "ai-comparison-text";
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(reportSchema(report)).replace(/</g, "\\u003c"),
        }}
      />
      <p className="citable-summary">{report.summary}</p>
      <p className="small muted">
        Page updated{" "}
        <time dateTime={report.dateModified}>{report.dateModified}</time>. Each
        fact keeps its own evidence date.
      </p>
      <div className="report-actions">
        <CopyForAI targetId={copyId} />
        {exports && (
          <>
            <a href={`${report.path}/comparison.md`}>Markdown</a>
            <a href={`${report.path}/comparison.json`}>JSON</a>
          </>
        )}
      </div>
      <pre id={copyId} hidden>
        {reportMarkdown(report)}
      </pre>
      <section aria-labelledby="key-facts">
        <h2 id="key-facts">Key facts</h2>
        <p className="small muted">
          Six useful differences to check. Each price, range and charging time
          names its basis; where the bases differ the row says so and no
          difference is calculated. Cargo methods may also differ.
        </p>
        {[...new Set(report.keyFacts.map((f) => f.key))].map((key) => (
          <section className="answer-row" id={`fact-${key}`} key={key}>
            <h3>
              {report.keyFacts.find((f) => f.key === key)!.label}
              {terms[key] && (
                <>
                  {" "}
                  <Link className="term-link" href={`/glossary#${terms[key]}`}>
                    What does this mean?
                  </Link>
                </>
              )}
            </h3>
            {report.comparisons.find((c) => c.key === key && !c.comparable) && (
              <p className="small">
                <span className="basis-marker" role="note">
                  <span aria-hidden="true">≠</span>{" "}
                  {report.comparisons.find((c) => c.key === key)!.note}. No
                  difference is calculated.
                </span>
              </p>
            )}
            <div
              className={`answer-columns ${report.cars.length === 1 ? "single" : ""}`}
            >
              {report.keyFacts
                .filter((f) => f.key === key)
                .map((f) => (
                  <CitedClaim claim={f} key={f.carId} />
                ))}
            </div>
          </section>
        ))}
      </section>
      <section aria-labelledby="questions">
        <h2 id="questions">Buyer questions</h2>
        {report.questions.map((q) => (
          <section className="answer-row" id={`question-${q.id}`} key={q.id}>
            <h3>{q.question}</h3>
            <p>{q.answer}</p>
            {terms[q.id] && (
              <Link className="term-link" href={`/glossary#${terms[q.id]}`}>
                Explain {terms[q.id].toUpperCase()}
              </Link>
            )}
            <div
              className={`answer-columns ${report.cars.length === 1 ? "single" : ""}`}
            >
              {q.claims.map((f) => (
                <CitedClaim claim={f} key={f.carId} />
              ))}
            </div>
          </section>
        ))}
      </section>
    </>
  );
}
