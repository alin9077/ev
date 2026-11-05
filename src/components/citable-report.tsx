import { plainWords } from "@/lib/plain-words";
import { EvidenceConditions } from "./evidence-conditions";
import Link from "next/link";
import {
  type Claim,
  type CitableReport,
  reportMarkdown,
  reportSchema,
} from "@/lib/citable";
import { comparisonFactLabel } from "@/lib/compare";
import { CopyForAI } from "./copy-for-ai";
import { FreshnessLabel } from "./freshness-label";

const terms: Record<string, string> = {
  range_km: "wltp",
  battery_chemistry: "lfp",
  v2l: "v2l",
  novated_fbt: "fbt",
  driveaway_price: "driveaway",
};
export function CitedClaim({
  claim,
  compactEvidence = false,
}: {
  claim: Claim;
  compactEvidence?: boolean;
}) {
  const suffix = " " + claim.qualifications.join(" ");
  const sentence =
    compactEvidence &&
    claim.qualifications.length &&
    claim.sentence.endsWith(suffix)
      ? claim.sentence.slice(0, -suffix.length)
      : claim.sentence;
  return (
    <div className="cited-claim">
      <p>{plainWords(sentence)}</p>
      {claim.validUntil !== undefined && (
        <FreshnessLabel
          checkedAt={claim.evidenceDate}
          factKey={claim.key}
          validUntil={claim.validUntil}
        />
      )}
      {compactEvidence && (
        <EvidenceConditions conditions={claim.qualifications} />
      )}
      <ul
        className="claim-sources"
        aria-label={`Sources for ${claim.car} ${claim.label}`}
      >
        {claim.sources.map((s) => (
          <li key={s.id}>
            <a href={s.url || undefined} rel="noreferrer">
              {s.publisher}: {s.displayTitle || s.title} ({s.market})
            </a>
            {" · Source accessed "}
            <time dateTime={s.accessed_date}>{s.accessed_date}</time>
            {s.published_date && <> · Published {s.published_date}</>}
            {s.checked && <> · Full text checked {s.checked}</>}
            {s.displayTitleNote && (
              <span className="source-label-note"> · {s.displayTitleNote}</span>
            )}
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
  const hasSpecialist = report.cars.some(
    (car) => !!car.vehicleClass && car.vehicleClass !== "passenger",
  );
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
        {plainWords(reportMarkdown(report))}
      </pre>
      <section aria-labelledby="key-facts">
        <h2 id="key-facts">Key facts</h2>
        <p className="small muted">
          {hasSpecialist
            ? "Check the exact configuration, load-space definition, test method and charging window. Conditions stay attached to each claim."
            : "Six useful differences to check. Charging windows and cargo methods may differ; these are not automatically comparable."}
        </p>
        {[...new Set(report.keyFacts.map((f) => f.key))].map((key) => (
          <section className="answer-row" id={`fact-${key}`} key={key}>
            <h3>
              {comparisonFactLabel(
                key,
                report.keyFacts.filter((f) => f.key === key),
              )}
              {terms[key] && !(hasSpecialist && key === "range_km") && (
                <>
                  {" "}
                  <Link className="term-link" href={`/glossary#${terms[key]}`}>
                    What does this mean?
                  </Link>
                </>
              )}
            </h3>
            <div
              className={`answer-columns ${report.cars.length === 1 ? "single" : ""}`}
            >
              {report.keyFacts
                .filter((f) => f.key === key)
                .map((f) => (
                  <CitedClaim
                    claim={f}
                    key={f.carId}
                    compactEvidence={hasSpecialist || f.sentence.length > 700}
                  />
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
                <CitedClaim
                  claim={f}
                  key={f.carId}
                  compactEvidence={hasSpecialist || f.sentence.length > 700}
                />
              ))}
            </div>
          </section>
        ))}
      </section>
    </>
  );
}
