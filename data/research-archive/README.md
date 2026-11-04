# Research archive

Everything from the 2026-10-16 research import that has no slot in the app, plus the logs that show how the rest was mapped. Nothing here is read by the app at run time. Regenerate with `node --import tsx scripts/import-dot-research.ts <export-dir>`.

| File | Content |
|---|---|
| `IMPORT-REPORT.md` | Slot mapping table, counts, change log summary, hidden-fact statistics, open gaps. Start here. |
| `change-log-original-34.md` / `.json` | Every divergence on the original 34 variants (old -> new, grade, sources, decision). |
| `hidden-facts.json` | Facts with a value that the verification helper hides, by class, and the original 34 variants' hidden facts. |
| `mapping-log.json` | Unit conversions, text clean-up counts, warnings, source type mapping, disposition of every unmapped fact key. |
| `id-map.json` | Dot id -> app id for variants; merged source ids -> canonical id. |
| `extra-facts.json` | Fact keys with no app slot (dimensions variants, equipment flags, charging detail, ...), per variant, graded, with sources. Tuple layout described inside the file. |
| `feature-extras.json`, `variant-meta.json`, `price-evidence.json`, `configuration-evidence.json` | Evidence locators, availability evidence and strength/trade-off text, the price ladder choice per variant, configuration identity. |
| `sources-archive.json` | Sources cited only by archived content (same format as the app's sources). Source ids anywhere in the archive resolve in the app's source list, the earlier data files, or this file. |
| `extra/` | Dot's market research around the catalogue (market inventory, missing models and leads, per-brand reconciliation, price ladder, vehicle census, selling points, glossary, coverage report, brand packets, raw lead evidence). Minified; variant ids use the app's ids, source ids the canonical ids. Not re-verified. Unknown means unknown. |

Cautions carried over from the research: whole-market completeness was never established; `listed_unconfirmed` means a maker page exists, not that the car is orderable; flags such as `rankingEligible` are Dot's ranking rules, not facts.
