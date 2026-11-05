import Link from "next/link";
import {
  CHANGE_TYPE_LABELS,
  describeChange,
  entryAnchor,
  groupChanges,
  monthLabel,
  sortMonthsNewestFirst,
  type ChangeEntry,
  type ChangesMonth,
} from "@/lib/changes";

function Sources({ entry, month }: { entry: ChangeEntry; month: ChangesMonth }) {
  const index = new Map(month.sources.map((s) => [s.id, s]));
  const cited = entry.sourceIds.flatMap((id) => (index.get(id) ? [index.get(id)!] : []));
  return (
    <>
      {cited.map((source) => (
        <span key={source.id}>
          {" "}
          · Source:{" "}
          <a href={source.url} rel="noopener noreferrer">
            {source.publisher}
          </a>
          , checked <time dateTime={source.accessed_date}>{source.accessed_date}</time>
        </span>
      ))}
    </>
  );
}
/** Used by the Next page and by the portable build, so every build lists the same entries. */
export default function ChangesView({
  months,
  feeds = true,
}: {
  months: readonly ChangesMonth[];
  /** The single-file portable build has no JSON or RSS routes to link to. */
  feeds?: boolean;
}) {
  const ordered = sortMonthsNewestFirst(months);
  return (
    <main id="main" className="container editorial-page citable-page">
      <p className="eyebrow">Updated after each monthly check</p>
      <h1>What changed</h1>
      <p className="lede">
        Price moves, new arrivals and withdrawals found when we recheck each
        maker&apos;s Australian pages. Facts we rechecked and found unchanged are not
        listed; their check date simply moves forward.
      </p>
      <p className="small">
        {feeds && (
          <>
            <a href="/changes.json">JSON</a> · <a href="/changes/feed.xml">RSS feed</a> ·{" "}
          </>
        )}
        <Link href="/methodology">How we check the evidence</Link>
      </p>
      {!ordered.length && (
        <section className="answer-row">
          <h2>No changes recorded yet</h2>
          <p>The first monthly check has not been published.</p>
        </section>
      )}
      {ordered.map((month) => {
        const total = month.changes.length;
        return (
          <section className="answer-row" id={month.month} key={month.month}>
            <h2>{monthLabel(month.month)}</h2>
            <p className="small">
              Compared the catalogue as at{" "}
              <time dateTime={month.before.asOf}>{month.before.asOf}</time> with{" "}
              <time dateTime={month.after.asOf}>{month.after.asOf}</time>:{" "}
              {total} {total === 1 ? "change" : "changes"}.
            </p>
            {!total && <p>Nothing changed on the facts this page tracks.</p>}
            {groupChanges(month.changes).map((group) => (
              <div key={group.type}>
                <h3>
                  {CHANGE_TYPE_LABELS[group.type]} (
                  {group.brands.reduce((n, b) => n + b.entries.length, 0)})
                </h3>
                {group.brands.map((brand) => (
                  <div key={brand.brand}>
                    <h4>{brand.brand}</h4>
                    <ul>
                      {brand.entries.map((entry) => (
                        <li id={entryAnchor(month.month, entry)} key={entryAnchor(month.month, entry)}>
                          <Link href={`/cars/${entry.family}/${entry.slug}`}>{entry.vehicle}</Link>
                          {" — "}
                          {describeChange(entry)}
                          {entry.beforeDate && entry.afterDate && (
                            <span className="small">
                              {" "}
                              (checked {entry.beforeDate} → {entry.afterDate})
                            </span>
                          )}
                          <span className="small">
                            <Sources entry={entry} month={month} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
}
