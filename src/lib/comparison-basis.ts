import type { Fact } from "./types";

/**
 * The basis a compared figure is quoted on, normalised in one place.
 *
 * The research stores a free-text `basis` and a tidier `comparisonBasis` for every fact. Four measurements
 * are routinely quoted on different bases, so putting two of them side by side as equals misleads:
 *   - price_aud           list price, driveaway, "incl. GST and delivery", tax treatment unresolved
 *   - range_km            WLTP, ADR 81/02, NEDC, WLTC
 *   - battery_kwh         usable, gross, or not stated
 *   - dc_charge_time_min  the state-of-charge window: 10–80%, 30–80%, 0–80%, ...
 * This module turns those strings into a short tag for display, and decides whether values may be compared,
 * ranked or subtracted: only figures on the same, determinable basis are. Everything else is shown with its
 * tag and a "not directly comparable" marker. It reads only what the public fact already carries, so a
 * masked (unverified) fact has no basis and is never classified.
 */

export const BASIS_KEYS = [
  "price_aud",
  "range_km",
  "battery_kwh",
  "dc_charge_time_min",
] as const;
export type BasisKey = (typeof BASIS_KEYS)[number];

export type FactBasis = {
  key: BasisKey;
  /** Stable class id: figures with the same id share a basis (unless `determinate` is false). */
  id: string;
  /** A short tag to show beside the value, e.g. "Driveaway", "NEDC", "Gross", "30–80%". */
  tag: string;
  /** The same basis in words, for titles and exports. */
  label: string;
  /**
   * False when the basis could not be established (tax treatment unresolved, mixed cycle labels, no charge
   * window). Two such figures are not treated as like for like, even when they carry the same tag.
   */
  determinate: boolean;
};

export const NOT_COMPARABLE = "Not directly comparable";

export function isBasisKey(key: string): key is BasisKey {
  return (BASIS_KEYS as readonly string[]).includes(key);
}

type Rule = { id: string; tag: string; label: string; determinate?: boolean };
const make = (key: BasisKey, r: Rule): FactBasis => ({
  key,
  id: r.id,
  tag: r.tag,
  label: r.label,
  determinate: r.determinate !== false,
});

const PRICE = {
  list: { id: "list", tag: "List", label: "List price before on-road costs" },
  driveaway: {
    id: "driveaway",
    tag: "Driveaway",
    label: "Driveaway price",
  },
  delivery: {
    id: "incl-gst-delivery",
    tag: "Incl. GST & delivery",
    label: "Price including GST and dealer delivery",
  },
  unresolved: {
    id: "tax-unresolved",
    tag: "Tax unresolved",
    label: "Price with tax inclusion unresolved",
    determinate: false,
  },
  unknown: {
    id: "unknown",
    tag: "Basis unclear",
    label: "Price basis not established",
    determinate: false,
  },
} satisfies Record<string, Rule>;

function priceBasis(text: string): Rule | undefined {
  // The selection list stores the short tags themselves.
  if (/^list$/i.test(text.trim())) return PRICE.list;
  if (/tax inclusion|tax unresolved|on-road treatment unresolved/i.test(text))
    return PRICE.unresolved;
  if (/drive-?\s?away/i.test(text)) return PRICE.driveaway;
  if (
    /incl(?:uding|\.)?\s+(?:GST\s+(?:and|&)\s+)?(?:dealer\s+)?delivery/i.test(
      text,
    )
  )
    return PRICE.delivery;
  if (
    /before on[- ]road|excl(?:uding|\.)?\s+(?:on[- ]road|registration)|list price|\bRRP\b|recommended (?:retail )?price|\bMSRP\b|from[- ]price|base price|guide price|stamp duty|(?:government )?charges[^.;]*excluded|excludes? government charges/i.test(
      text,
    )
  )
    return PRICE.list;
  return undefined;
}

const RANGE = {
  wltp: { id: "wltp", tag: "WLTP", label: "WLTP combined" },
  adr: { id: "adr", tag: "ADR", label: "ADR 81/02" },
  nedc: { id: "nedc", tag: "NEDC", label: "NEDC" },
  wltc: { id: "wltc", tag: "WLTC", label: "WLTC" },
  mixed: {
    id: "adr-wltp",
    tag: "ADR/WLTP",
    label: "ADR 81/02 or WLTP, source labels both",
    determinate: false,
  },
  unknown: {
    id: "unknown",
    tag: "Cycle unclear",
    label: "Range cycle not established",
    determinate: false,
  },
} satisfies Record<string, Rule>;

function rangeBasis(text: string): Rule | undefined {
  // The research marks some figures as not to be used for ranking.
  if (/ranking promotion not approved/i.test(text)) return RANGE.unknown;
  const wltp = /WLTP/i.test(text),
    adr = /\bADR(?![A-Za-z])/i.test(text),
    nedc = /NEDC/i.test(text),
    wltc = /WLTC/i.test(text);
  // "A WLTP laboratory test accepted under ADR81/02" is a WLTP figure.
  if (wltp && adr && !/accepted under/i.test(text)) return RANGE.mixed;
  if (wltp) return RANGE.wltp;
  if (nedc) return RANGE.nedc;
  if (wltc) return RANGE.wltc;
  if (adr) return RANGE.adr;
  return undefined;
}

const BATTERY = {
  usable: { id: "usable", tag: "Usable", label: "Usable capacity" },
  gross: { id: "gross", tag: "Gross", label: "Gross capacity" },
  unstated: {
    id: "unstated",
    tag: "Basis not stated",
    label: "Gross or usable not stated",
  },
} satisfies Record<string, Rule>;

function batteryBasis(text: string): Rule | undefined {
  if (
    /gross\s*(?:\/|or|and)\s*(?:usable|net|nett)|(?:usable|net|nett)\s*(?:\/|or|and)\s*gross|not (?:stated|specified|distinguished|labelled|uniform)|unspecified|unresolved|unlabelled/i.test(
      text,
    )
  )
    return BATTERY.unstated;
  if (/\bnot usable\b/i.test(text)) return BATTERY.gross;
  if (/\b(?:usable|net|nett)\b/i.test(text)) return BATTERY.usable;
  if (/\bgross\b/i.test(text)) return BATTERY.gross;
  return undefined;
}

const WINDOW_PATTERN = /(\d{1,3})\s*[–—-]\s*(\d{1,3})\s*%/;
function windowBasis(text: string): Rule | undefined {
  const m = text.match(WINDOW_PATTERN);
  if (!m) return undefined;
  const [from, to] = [Number(m[1]), Number(m[2])];
  if (!(from >= 0 && to <= 100 && from < to)) return undefined;
  return {
    id: `soc-${from}-${to}`,
    tag: `${from}–${to}%`,
    label: `${from}–${to}% state of charge`,
  };
}
const NO_WINDOW: Rule = {
  id: "unknown",
  tag: "Window not stated",
  label: "Charging window not stated",
  determinate: false,
};

const CLASSIFIERS: Record<BasisKey, (text: string) => Rule | undefined> = {
  price_aud: priceBasis,
  range_km: rangeBasis,
  battery_kwh: batteryBasis,
  dc_charge_time_min: windowBasis,
};
const FALLBACK: Record<BasisKey, Rule> = {
  price_aud: PRICE.unknown,
  range_km: RANGE.unknown,
  battery_kwh: BATTERY.unstated,
  dc_charge_time_min: NO_WINDOW,
};

type BasisSource = Pick<Fact, "key" | "value"> &
  Partial<Pick<Fact, "basis" | "comparisonBasis">>;

/**
 * The basis of a fact, or null when it has no value or is not one of the four tracked measurements.
 * `comparisonBasis` is read first (the research's own normalised label), then `basis` (the free text).
 * For battery capacity the two sometimes contradict each other ("Net battery capacity" filed under
 * "Gross or usable not stated"); a contradiction reads as not stated rather than picking a side.
 */
export function basisOf(
  fact: BasisSource | null | undefined,
): FactBasis | null {
  if (!fact || fact.value === null || fact.value === undefined) return null;
  if (!isBasisKey(fact.key)) return null;
  const key = fact.key;
  const classify = CLASSIFIERS[key];
  const fromComparison = classify(fact.comparisonBasis ?? "");
  const fromBasis = classify(fact.basis ?? "");
  if (key === "battery_kwh" && fromComparison && fromBasis) {
    return make(
      key,
      fromComparison.id === fromBasis.id ? fromComparison : BATTERY.unstated,
    );
  }
  return make(key, fromComparison ?? fromBasis ?? FALLBACK[key]);
}

/** The short tag to show beside a value, or undefined where the fact has no tracked basis. */
export function basisTag(fact: BasisSource | null | undefined) {
  return basisOf(fact)?.tag;
}

/** Whether two bases are like for like: the same class, and one that could be determined. */
export function sameBasis(a: FactBasis | null, b: FactBasis | null) {
  return !!a && !!b && a.key === b.key && a.id === b.id && a.determinate;
}

export type RowBasis = {
  /** At least two valued figures were compared. */
  compared: boolean;
  /** Every compared figure is on the same determinate basis. */
  comparable: boolean;
  /** The bases in play, in column order, one per valued figure (null where a column has no figure). */
  bases: (FactBasis | null)[];
  /** The distinct tags present, in first-seen order. */
  tags: string[];
  /** Short text for the marker: "Not directly comparable: Driveaway vs List". Empty when comparable. */
  note: string;
};

/**
 * Whether the figures of one row (one per selected car) share a basis. Columns without a figure are ignored.
 * A row with fewer than two valued figures compares nothing and is not flagged.
 */
export function compareBases(
  facts: (BasisSource | null | undefined)[],
): RowBasis {
  const bases = facts.map(basisOf);
  const present = bases.filter((b): b is FactBasis => !!b);
  const tags = [...new Set(present.map((b) => b.tag))];
  if (present.length < 2)
    return { compared: false, comparable: true, bases, tags, note: "" };
  const first = present[0];
  const comparable = present.every((b) => sameBasis(first, b));
  return {
    compared: true,
    comparable,
    bases,
    tags,
    note: comparable ? "" : `${NOT_COMPARABLE}: ${describeMix(present)}`,
  };
}

function describeMix(present: FactBasis[]) {
  const tags = [...new Set(present.map((b) => b.tag))];
  // Two figures with the same undetermined tag still cannot be compared; say why.
  return tags.length > 1
    ? tags.join(" vs ")
    : `${tags[0]} (basis could not be established)`;
}

/** The numeric value of a fact, or undefined for text such as "<30 min" or a missing figure. */
export function numericValue(fact: BasisSource | null | undefined) {
  return typeof fact?.value === "number" && Number.isFinite(fact.value)
    ? fact.value
    : undefined;
}

/**
 * Which of a set of facts can be ranked against one another: the numeric figures sharing the most common
 * determinate basis (the basis in `prefer`, in order, breaks a tie). Figures on any other basis, and text
 * figures, are left out. Tracked keys only; an untracked key ranks every numeric figure, as before.
 * Returns the indices into `facts`.
 */
export function rankableIndices(
  facts: (BasisSource | null | undefined)[],
  prefer: readonly string[] = ["list", "wltp", "usable", "soc-10-80"],
): number[] {
  const numeric = facts
    .map((f, i) => [i, numericValue(f)] as const)
    .filter(([, v]) => v !== undefined)
    .map(([i]) => i);
  if (!numeric.length) return [];
  const key = facts.find((f) => f)?.key;
  if (!key || !isBasisKey(key)) return numeric;
  const groups = new Map<string, number[]>();
  for (const i of numeric) {
    const b = basisOf(facts[i]);
    if (!b || !b.determinate) continue;
    const g = groups.get(b.id);
    if (g) g.push(i);
    else groups.set(b.id, [i]);
  }
  const rank = (id: string) => {
    const at = prefer.indexOf(id);
    return at < 0 ? prefer.length : at;
  };
  const best = [...groups.entries()].sort(
    (a, b) => b[1].length - a[1].length || rank(a[0]) - rank(b[0]),
  )[0];
  return best ? best[1] : [];
}

/**
 * The index of the lowest or highest figure among those that can be ranked together, or -1 when fewer than two
 * share a basis (a "winner" among one is not a comparison) or the leaders tie.
 */
export function leaderIndex(
  facts: (BasisSource | null | undefined)[],
  direction: "min" | "max",
): number {
  const ranked = rankableIndices(facts);
  if (ranked.length < 2) return -1;
  const values = ranked.map((i) => numericValue(facts[i])!);
  const best = direction === "min" ? Math.min(...values) : Math.max(...values);
  const winners = ranked.filter((_, n) => values[n] === best);
  return winners.length === 1 ? winners[0] : -1;
}

/** A difference between two figures, only when they are numbers on the same determinate basis. */
export function likeForLikeDelta(
  from: BasisSource | null | undefined,
  to: BasisSource | null | undefined,
): number | undefined {
  const [a, b] = [numericValue(from), numericValue(to)];
  if (a === undefined || b === undefined || !from || !to) return undefined;
  if (isBasisKey(from.key) || isBasisKey(to.key))
    if (!sameBasis(basisOf(from), basisOf(to))) return undefined;
  return b - a;
}

/** The tag of each valued figure joined for an export: "Model Y: List; Kia EV3: Driveaway". */
export function describeBases(
  entries: { name: string; fact: BasisSource | null | undefined }[],
) {
  return entries
    .map(({ name, fact }) => {
      const tag = basisTag(fact);
      return tag ? `${name}: ${tag}` : "";
    })
    .filter(Boolean)
    .join("; ");
}
