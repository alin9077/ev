/**
 * Reader-facing text clean-up shared by the research importer and the data layer.
 *
 * Dot's export mixes three kinds of text: sentences for readers, locators that say where in a source a figure was
 * found (API paths, JSON blobs, "PDF page 4"), and notes the researchers wrote for each other ("retain exact basis",
 * "keep separate", "stays null"). Only the first kind belongs on a page. Every rule here either drops a piece of text
 * or rewrites it into a plain sentence; nothing is invented.
 */

/** What was removed, by rule; the importer writes these counts to the mapping log. */
export type TextCleanupKind =
  | "source_locator"
  | "source_locator_with_url"
  | "api_path"
  | "api_path_rewritten"
  | "json_or_dict"
  | "snake_case_field"
  | "snake_case_humanised"
  | "researcher_instruction"
  | "url"
  | "placeholder_word"
  | "truncated_long";
export type TextCleanupReport = (
  kind: TextCleanupKind,
  before: string,
  after: string,
) => void;

/** The words a placeholder leaves behind when a value was missing (String(undefined), "null"). */
const PLACEHOLDER = /\b(undefined|null|NaN)\b/;
const SNAKE = /\b[a-z][a-z0-9]*(?:_[a-z0-9]+)+\b/i;
const CAMEL_PATH =
  /\b[a-z]+[A-Z][A-Za-z]*\.[a-z][A-Za-z]*\b|\b(?!macOS)[a-z]{3,}[A-Z][a-z]+[A-Za-z]*\b/;
/**
 * Researcher-to-researcher wording. "retained capacity" is a battery-warranty term, so it is not caught.
 */
const INSTRUCTION = new RegExp(
  [
    String.raw`\bretain(?:s|ed)?\b(?![- ]capacity)`,
    String.raw`\bpreserv(?:e|es|ed)\b`,
    String.raw`\b(?:keep|kept)\s+(?:\S+\s+){0,5}separate\b`,
    String.raw`\b(?:remains?|stays?|stay)\s+(?:separate|null)\b`,
    String.raw`\bkeep\s+.{0,40}\bnull\b`,
    String.raw`\bkept\s+null\b`,
    String.raw`\bunranked\b`,
    String.raw`\b(?:not\s+)?(?:used\s+for\s+)?rank(?:ing|ings|ed)?\b`,
    String.raw`\bnot_verified\b`,
    String.raw`\bnever\b`,
    String.raw`\bquarantined\b`,
    String.raw`\bnever\s+(?:zero|false|rep)\w*`,
    String.raw`\bnormali[sz]ed\b`,
    String.raw`\bcanonical\b`,
    String.raw`\bUI\b.{0,40}\b(?:cannot|can't)\b`,
    String.raw`\baudit\/search\b`,
    String.raw`\bfalsely exact\b`,
    String.raw`\boriginal source status:`,
    String.raw`\bgeneric\s+\w+_\w+`,
    String.raw`\bdo not\b`,
    String.raw`\bmust not\b`,
  ].join("|"),
  "i",
);

/** Where in a source a figure sits ("PDF page 9", "printed p.39", page-scrape fragments): not reader content. */
const LOCATOR_FRAGMENT =
  /^[\d.;,\s-]+$|\bexact technical column\b|\bPDF\s+(?:page|physical|p\.?\s*\d)|\bprinted\s+p\.?\s*\d|\bphysical\s+p\d|^\d+(?:\.\d+)*\.?;|\b(?:Warranty Period|Specifications?)\s*>|\bTotal Price;\s*Select a dealer|\(1-based\)|\bfootnote\s+\d+\s+ATM\b/i;

const PAGE_REF = /(?<![A-Za-z])p\d{1,3}\b(?![-\w])/;

/** Sentences are split here; clauses inside a flagged sentence are split on semicolons. */
const SENTENCE_SPLIT = /(?<=[.!?])\s+(?=[A-Z0-9“"(])/;
const CLAUSE_SPLIT = /\s*(?:\.;|;)\s+/;

/** Plain names for the specification fields Porsche's configurator API labels. */
const API_LABELS: [RegExp, string][] = [
  [
    /Acceleration 0 - 100 km\/h with Launch Control/i,
    "0–100 km/h time is the manufacturer's figure with Launch Control.",
  ],
  [
    /Charging time for direct current \(DC\) with maximum charging power/i,
    "10–80% charging time is quoted at the maximum DC charging power.",
  ],
  [
    /Maximum charging power with direct current/i,
    "Maximum DC charging power as published by the manufacturer.",
  ],
  [/Gross battery energy content/i, "Gross battery energy content."],
  [
    /Height, air suspension \(standard level\)/i,
    "Height is measured with the air suspension at its standard level.",
  ],
];
function rewriteApiPath(text: string): string {
  const label = text.split(/;\s+/).slice(1).join("; ").trim();
  if (!label || label.includes("categories[")) return "";
  const hit = API_LABELS.find(([rx]) => rx.test(label));
  const variant = label.match(/\(((?:Performance Battery)[^)]*)\)\s*$/)?.[1];
  const base = hit ? hit[1] : "";
  if (base && variant)
    return `${base.replace(/\.$/, "")}; applies to the ${variant}.`;
  return base;
}

/** "before_on_road_costs" -> "Before on-road costs"; snake_case that is the whole text reads as a label. */
const TOKEN_LABELS: Record<string, string> = {
  before_on_road_costs: "Before on-road costs",
  standard_capacity: "Standard capacity",
  maximum_ac: "Maximum AC input",
  peak_dc: "Peak DC",
  overall_length: "Overall length",
  overall_height: "Overall height",
  body_width_excluding_mirrors: "Body width excluding mirrors",
  braked_trailer_mass: "Braked trailer mass",
  ground_clearance: "Ground clearance",
  length_mm: "Length",
  width_mm: "Width",
  height_mm: "Height",
  wheelbase_mm: "Wheelbase",
  ground_clearance_mm: "Ground clearance",
};
export function humaniseToken(token: string): string {
  const known = TOKEN_LABELS[token.toLowerCase()];
  if (known) return known;
  const words = token
    .toLowerCase()
    .replace(/_(mm|kg|kw|kwh|km|l|m)$/, "")
    .split("_")
    .filter(Boolean);
  const text = words.join(" ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type Options = {
  /** Which field the text is for: a basis is a short label with no full stop. */
  kind: "basis" | "sentence";
  report?: TextCleanupReport;
};
const flagged = (s: string) =>
  INSTRUCTION.test(s) ||
  LOCATOR_FRAGMENT.test(s) ||
  PAGE_REF.test(s) ||
  SNAKE.test(s) ||
  CAMEL_PATH.test(s) ||
  PLACEHOLDER.test(s) ||
  /https?:\/\//.test(s);
function classify(s: string): TextCleanupKind {
  if (LOCATOR_FRAGMENT.test(s) || PAGE_REF.test(s)) return "source_locator";
  if (/https?:\/\//.test(s)) return "url";
  if (SNAKE.test(s) || CAMEL_PATH.test(s)) return "snake_case_field";
  if (PLACEHOLDER.test(s) && !INSTRUCTION.test(s)) return "placeholder_word";
  return "researcher_instruction";
}

/**
 * The reader-facing form of a piece of research text, or "" when nothing readable is left.
 * A whole text that is one snake_case token becomes a label; otherwise only the flagged sentences or
 * semicolon clauses go, so the rest of the note survives.
 */
export function cleanReaderText(raw: unknown, opts: Options): string {
  const report = opts.report ?? (() => {});
  const original = String(raw ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!original) return "";
  if (/^Source locator:/i.test(original)) {
    report(
      /https?:\/\//.test(original)
        ? "source_locator_with_url"
        : "source_locator",
      original,
      "",
    );
    return "";
  }
  if (original.includes("categories[id=")) {
    const rewritten = rewriteApiPath(original);
    report(rewritten ? "api_path_rewritten" : "api_path", original, rewritten);
    return rewritten;
  }
  if (/^[{[]/.test(original) || /[{[]\s*["']\w+["']\s*:/.test(original)) {
    report("json_or_dict", original, "");
    return "";
  }
  if (/^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)+$/.test(original)) {
    // A bare field name is a usable label for a basis, and noise anywhere else.
    const label = opts.kind === "basis" ? humaniseToken(original) : "";
    if (label && !INSTRUCTION.test(label)) {
      report("snake_case_humanised", original, label);
      return label;
    }
    report("snake_case_field", original, "");
    return "";
  }
  if (!flagged(original)) return original;

  const kept: string[] = [];
  let firstKind: TextCleanupKind | null = null;
  for (const sentence of original.split(SENTENCE_SPLIT)) {
    if (!flagged(sentence)) {
      kept.push(sentence);
      continue;
    }
    const closing = /[.!?]$/.test(sentence) ? "." : "";
    const clauses = sentence
      .split(CLAUSE_SPLIT)
      .map((c) => c.replace(/[.;]+$/, "").trim())
      .filter(Boolean);
    const good = clauses.filter((c) => !flagged(c));
    firstKind ??= classify(sentence);
    if (good.length) kept.push(good.join("; ") + closing);
  }
  let text = kept
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (opts.kind === "basis") text = text.replace(/[.;]+$/, "").trim();
  if (text !== original)
    report(firstKind ?? "researcher_instruction", original, text);
  return text;
}

export const MAX_QUALIFICATION = 400;
/** A qualification no longer than the limit, cut at a sentence (or clause) boundary. */
export function limitQualification(
  text: string,
  report?: TextCleanupReport,
  max = MAX_QUALIFICATION,
): string {
  if (text.length <= max) return text;
  let out = "";
  for (const s of text.split(SENTENCE_SPLIT)) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  if (!out) {
    const head = text.slice(0, max);
    const cut = Math.max(head.lastIndexOf("; "), head.lastIndexOf(", "));
    out =
      cut > max * 0.4
        ? head.slice(0, cut).replace(/[,;]\s*$/, "") + "."
        : head.replace(/\s+\S*$/, "") + "…";
  }
  report?.("truncated_long", text, out);
  return out;
}

/** A scope or other label that must never show a placeholder word. */
export function readableLabel(value: unknown): string {
  const text = String(value ?? "")
    .replace(/\s*[·–—-]\s*(?:undefined|null|NaN)\b/gi, "")
    .replace(/\b(?:undefined|null|NaN)\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return text;
}
