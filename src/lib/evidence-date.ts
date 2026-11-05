/** Australian dated claims use Sydney's calendar, conservatively ahead of other mainland zones.
 * Seller-specific terms remain authoritative; an unstated timezone is not inferred as a source fact.
 */
export function australianEvidenceDate(now = new Date()): string {
  if (!Number.isFinite(now.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) =>
    parts.find((p) => p.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
