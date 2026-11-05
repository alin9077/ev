/** JSON and RSS 2.0 renderings of the same change entries the page lists. Pure. */
import {
  CHANGE_TYPE_LABELS,
  describeChange,
  entryAnchor,
  sortMonthsNewestFirst,
  type ChangeEntry,
  type ChangesMonth,
} from "./changes";

export const carPathFor = (entry: Pick<ChangeEntry, "family" | "slug">) =>
  `/cars/${entry.family}/${entry.slug}`;
export function changesJson(months: readonly ChangesMonth[], origin: string) {
  return {
    schemaVersion: "1.0",
    description:
      "Month-by-month changes to Australian EV prices, availability, range and warranty, generated from dated evidence checks. A rechecked claim whose value is unchanged is not listed.",
    page: `${origin}/changes`,
    feed: `${origin}/changes/feed.xml`,
    months: sortMonthsNewestFirst(months).map((month) => ({
      month: month.month,
      checkedBetween: { from: month.before.asOf, to: month.after.asOf },
      counts: month.counts,
      sources: month.sources,
      changes: month.changes.map((entry) => ({
        ...entry,
        summary: describeChange(entry),
        url: `${origin}${carPathFor(entry)}`,
        id: `${origin}/changes#${entryAnchor(month.month, entry)}`,
      })),
    })),
  };
}
const xml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
const rfc822 = (date: string) =>
  new Date(`${date}T00:00:00Z`).toUTCString();
export function changesRss(months: readonly ChangesMonth[], origin: string) {
  const ordered = sortMonthsNewestFirst(months);
  const latest = ordered[0]?.after.asOf;
  const items = ordered.flatMap((month) => {
    const sources = new Map(month.sources.map((s) => [s.id, s]));
    return month.changes.map((entry) => {
      const cited = entry.sourceIds
        .flatMap((id) => (sources.get(id) ? [sources.get(id)!] : []))
        .map((s) => `${s.publisher}: ${s.url} (accessed ${s.accessed_date})`)
        .join("; ");
      const guid = `${origin}/changes#${entryAnchor(month.month, entry)}`;
      return `    <item>
      <title>${xml(`${entry.vehicle}: ${CHANGE_TYPE_LABELS[entry.type]}`)}</title>
      <link>${xml(`${origin}${carPathFor(entry)}`)}</link>
      <guid isPermaLink="false">${xml(guid)}</guid>
      <pubDate>${rfc822(entry.afterDate ?? month.after.asOf)}</pubDate>
      <category>${xml(entry.type)}</category>
      <description>${xml(`${describeChange(entry)}.${cited ? ` Source: ${cited}.` : ""}`)}</description>
    </item>`;
    });
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>What changed: Australian EV prices and availability</title>
    <link>${xml(`${origin}/changes`)}</link>
    <description>Price moves, arrivals and withdrawals found by each monthly evidence check. Unchanged rechecks are not listed.</description>
    <language>en-AU</language>${latest ? `\n    <lastBuildDate>${rfc822(latest)}</lastBuildDate>` : ""}
${items.join("\n")}
  </channel>
</rss>
`;
}
