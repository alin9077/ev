/**
 * Internal vocabulary that must never reach a buyer-facing page (plan W1.6).
 * Replacements are listed in docs/PLAIN_WORDS.md.
 */
export const PLAIN_WORDS_BANNED = [
  "bounded configuration",
  "audit record",
  "held lead",
  "ranking-eligible",
  "source-scoped",
  "exact-trim record",
  "Tier 1",
  "packet",
] as const;

/** Visible markup only: scripts, styles and comments carry data, not words. */
export function visibleMarkup(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

export function plainWordsViolations(
  html: string,
): { word: string; count: number }[] {
  const text = visibleMarkup(html);
  return PLAIN_WORDS_BANNED.flatMap((word) => {
    // Whole words only: "packet" also catches "packets", never "backpacket".
    const pattern = new RegExp(
      `\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "[\\s-]+")}s?\\b`,
      "gi",
    );
    const count = (text.match(pattern) || []).length;
    return count ? [{ word, count }] : [];
  });
}

/**
 * Display mapping only: the evidence strings stay exactly as researched; the
 * words a buyer reads are swapped (docs/PLAIN_WORDS.md). Order matters:
 * specific phrases first.
 */
const REPLACEMENTS: [RegExp, string][] = [
  [/\bin (?:the )?bounded packets?\b/gi, "in this research"],
  [/\bwithin (?:the |this )?(?:bounded )?packets?\b/gi, "within this research"],
  [/\b(?:the |this )?bounded packets?\b/gi, "this research"],
  [/\bin (?:the |this )packets?\b/gi, "in this research"],
  [/\bthis packets?\b/gi, "this research"],
  [/\bpackets\b/gi, "research updates"],
  [/\bpacket\b/gi, "research update"],
  [/\bbounded[\s-]+configurations?\b/gi, "captured configuration"],
  [/\baudit records?\b/gi, "source check"],
  [/\bheld leads?\b/gi, "model we are still checking"],
  [/\branking-eligible\b/gi, "can be ranked"],
  [/\bsource-scoped\b/gi, "limited to the named source"],
  [/\bexact-trim records?\b/gi, "version page"],
  [/\bTier 1\b/g, "passenger-vehicle"],
];
export function plainWords<T extends string | undefined>(text: T): T {
  if (!text) return text;
  let out: string = text;
  for (const [pattern, replacement] of REPLACEMENTS)
    out = out.replace(pattern, replacement);
  return out as T;
}
