export function publicOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash ||
      /^(localhost|127\.|0\.|\[::1\])/.test(url.hostname) ||
      url.hostname.endsWith(".local")
    )
      return null;
    return url.origin;
  } catch {
    return null;
  }
}
export const publishedOrigin = publicOrigin(process.env.NEXT_PUBLIC_SITE_URL);
export const site = {
  name: "EV Side by Side",
  description:
    "Compare Tesla Model Y with other EVs in Australia: prices, range, charging and features for exact Australian variants.",
  date: "2026-10-06",
  dateLabel: "6 October 2026",
  origin: publishedOrigin || "http://localhost:3000",
};
export const BASELINE = "tesla_model_y__premium_rwd__2";
export const CHALLENGER = "byd_sealion_7__premium_rwd__1";
export const statusLabels = {
  standard: "Standard",
  conditional: "Conditional",
  not_verified: "Needs confirmation",
  subjective: "Subjective",
  unavailable: "Unavailable",
  optional: "Optional",
  not_applicable: "Not applicable",
};
export const availabilityLabels: Record<string, string> = {
  current_or_order_listed: "Current / order-listed",
  outgoing: "Outgoing generation",
  announced_provisional: "Announced / provisional",
};
export const priorities = [
  "Price",
  "Range and charging",
  "Family space",
  "Daily convenience",
  "Software",
  "Comfort and performance",
];
export function safeUrl(input: string) {
  try {
    const url = new URL(input);
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
