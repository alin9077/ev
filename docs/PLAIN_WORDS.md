# Plain words

Buyer-facing pages never use the left-hand words. The build fails (`pnpm check:plain-words`, run inside `pnpm build`) if any appear in a rendered page, ignoring scripts, styles and comments. The list is `PLAIN_WORDS_BANNED` in `src/lib/plain-words.ts`.

| Internal word | Say this instead |
|---|---|
| bounded configuration | captured configuration, with "specifications incomplete" |
| audit record | source check |
| held lead | model we are still checking |
| ranking-eligible | can be ranked |
| source-scoped | from the named source only |
| exact-trim record | version page |
| Tier 1 | cars, SUVs, people movers and utes (headline: "passenger EVs") |
| packet | dated research update |

The check is word-based. If a page legitimately needs one of these words (for example a quotation), change the sentence, not the list.
