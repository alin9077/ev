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
