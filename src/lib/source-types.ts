/**
 * One small vocabulary for Source.source_type.
 *
 * The earlier data files carry ~110 free-text types ("primary_manufacturer_content_mirror",
 * "australian_secondary_report_of_manufacturer_pricing", ...). Readers and the grading rules only need the
 * kind of publisher, so every value is mapped onto the eight types below. The importer applies the same
 * function to the sources it brings in, and data.ts to every source it loads, so the result is one vocabulary.
 */
export const SOURCE_TYPES = [
  "manufacturer",
  "authorised_dealer",
  "regulator",
  "independent_test",
  "independent_database",
  "industry_reporting",
  "firsthand_owner_report",
  "other",
] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

/**
 * Hosts that are the maker (or the maker's Australian importer) even when the export typed the page as a
 * dealer listing or "other": mgmotor.com.au, genesis.com, denza.com and so on.
 */
const MAKER_HOSTS =
  /(^|\.)(mgmotor\.com\.au|genesis\.com|denza\.com|starkfuture\.com|fotonmobility\.com\.au|farizonauto\.au|kawasaki\.com\.au|tesla\.com|leapmotor\.net|xpeng\.com|zeekrlife\.com|byd\.com|bydautomotive\.com\.au)$/i;
/** Dealer-website platforms and their CDNs, which host documents that makers supply. */
const DEALER_PLATFORMS =
  /(^|\.)(mattaki\.com|digitaldealer\.com\.au|tddashboard\.s3\.[a-z0-9-]+\.amazonaws\.com)$/i;
const REGULATOR_HOSTS =
  /(^|\.)(infrastructure\.gov\.au|vehiclestandards\.gov\.au|accc\.gov\.au)$/i;
const TEST_HOSTS = /(^|\.)(ancap\.com\.au|euroncap\.com|iihs\.org)$/i;

function hostOf(url: string | undefined): string {
  try {
    return new URL(String(url ?? "")).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** The label's own words decide first; a maker/regulator/test-lab host corrects a dealer or "other" label. */
export function normaliseSourceType(
  raw: string,
  url?: string,
  title?: string,
): SourceType {
  const t = String(raw ?? "").toLowerCase();
  let out: SourceType = "other";
  if (
    /^(secondary|australian_secondary|au_report|australian_report|contemporaneous|news_|secondary_news)/.test(
      t,
    ) ||
    /reported_by_australian_media|report_of_manufacturer|report_on_|manufacturer_release_reported|sales_compilation/.test(
      t,
    )
  )
    out = "industry_reporting";
  else if (/owner/.test(t) && !/^manufacturer_/.test(t))
    out = "firsthand_owner_report";
  else if (/regulat|government|recall/.test(t)) out = "regulator";
  else if (
    /ancap|crash|safety|test_authority|independent_test|rating_registry|road_test|product_test|vehicle_test|two_week|firsthand.*(review|test)|tester/.test(
      t,
    )
  )
    out = "independent_test";
  else if (
    /^firsthand_(manufacturer|launch|au_dealer)|interview|firsthand_launch/.test(
      t,
    )
  )
    out = "industry_reporting";
  else if (/fleet_telemetry/.test(t)) out = "independent_database";
  else if (/dealer|retailer|stock/.test(t) && !/dealer_hosted/.test(t))
    out = "authorised_dealer";
  else if (
    /manufactur|official|importer|oem|brand|configurator|brochure|distributor|press|primary_(warranty|australian_release|global_announcement)|program_partner/.test(
      t,
    )
  )
    out = "manufacturer";
  else if (
    /database|specification|spec\b|fact_sheet|index|tracker|telemetry|community|platform_vendor|charging_network|network_operator|network_access/.test(
      t,
    )
  )
    out = "independent_database";
  else if (
    /secondary|publication|reporting|report|news|review|motoring|media|price_guide|reputable|industry|launch/.test(
      t,
    )
  )
    out = "industry_reporting";
  const host = hostOf(url);
  // A maker's brochure or spec sheet is the maker's document even when a dealer platform's CDN serves it.
  if (
    out === "authorised_dealer" &&
    DEALER_PLATFORMS.test(host) &&
    /brochure|spec[-_ ]?sheet/i.test(`${url} ${title ?? ""}`)
  )
    out = "manufacturer";
  if (host && (out === "authorised_dealer" || out === "other")) {
    if (MAKER_HOSTS.test(host)) out = "manufacturer";
    else if (REGULATOR_HOSTS.test(host)) out = "regulator";
    else if (TEST_HOSTS.test(host)) out = "independent_test";
  }
  return out;
}

/** Source types whose material can back a "confirmed" grade: the maker, a regulator or a test authority. */
export const CONFIRMING_SOURCE_TYPES: readonly SourceType[] = [
  "manufacturer",
  "regulator",
  "independent_test",
];
