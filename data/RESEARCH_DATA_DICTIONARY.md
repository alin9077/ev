# Research mapping

This implementation companion was reconstructed from the supplied JSON. It is not an original attachment or additional automotive verification.

The immutable original is retained in the folder root and copied byte-for-byte to `data/`. SHA-256: `010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657`.

| Input | Display / integrity rule |
| --- | --- |
| metadata | Snapshot/review dates; counts independently calculated and checked against metadata |
| models | 11 generation records; Atto 3 legacy/EVO share navigation family, not specifications |
| variants | 34 stable IDs; dated facts retain raw numeric value, unit, basis, source IDs, AU scope, date and qualifications |
| trim_equipment | Equipment filters; unknown remains visible, false is excluded only when an equipment filter is active |
| criteria / feature_evidence | 48 criteria, 1,632 rows; original seven evidence states retained; structured values rendered as readable text |
| buyer overlay (`research-buyer-2026-10-07.json`) | 21 added criteria (714 rows) and four added measurements per variant; declared beside the supplied counts as `added_criterion_count` and `added_feature_row_count`, so the supplied 48 and 1,632 still reconcile |
| update_eligibility | Primary current summary, supersedes prior_update_summary; Model Y L inherited count suppressed in display |
| update_events | Individual records, separate delivery/category/evidence labels; EV3 pending records retained without headline counting |
| configuration_history | Separate from delivered OTA; never counted as software installations |
| publication_issues | Relevant fact and feature qualifications plus detailed model warnings and methodology registry |
| sources | 283 retained IDs; safe HTTP(S) links; no current retrieval claim inferred from build date |
| prior_update_summary | Preserved only as historical research; not used to generate current headline totals |

`src/lib/data.ts` is the server-side adapter. The JSON is read on the server; client components receive compact catalogue records and only the selected variants' feature, timeline and source evidence. No live scraping or arbitrary remote fetch endpoint exists.

Numeric helpers return comparable, different_basis, conditional or unknown. Matching basis is intentionally conservative: even `WLTP` and `WLTP combined` labels do not silently collapse. Prices with different stated exclusions do not receive a delta. Unknown never means zero. Status and conditions form part of differences-only semantics.

`validateResearch` checks structure, uniqueness, relations, coverage, counts and source references. It does not establish factual correctness. The JSON schema documents required structure; the executable validator also checks cross-record relationships.

## 2026-10-16 research import

`scripts/import-dot-research.ts` brought 399 further variants (433 in total) and a per-fact verification grade into this layout. The immutable base file and the earlier overlays are untouched; the import is one more overlay, `data/research-import-2026-10-16.json`, that `src/lib/data.ts` merges last. Counts, the slot mapping, the change log for the original 34 variants and the facts the import hides are in `data/research-archive/IMPORT-REPORT.md`; everything with no slot is in `data/research-archive/`.

| Input | Display / integrity rule |
| --- | --- |
| `vehicle_class` (variants) | New slot: passenger, ute, van, truck, bus, motorcycle. Absent on the supplied records, which are passenger cars. Exposed as `Car.vehicleClass`. |
| `grade` (facts and equipment rows) | New slot: `confirmed` (current Australian maker material for the exact version), `reported` (named Australian publication or dealer), `established` (the original 34 variants' values, not contradicted by a sourced conflict), `check` (sourced but conflicting or unresolved), `not_published`, `unrated` (never graded, which includes every van, truck, bus and motorcycle). |
| visible facts | `isVerifiedFact()` in `src/lib/verification.ts`: a value, status other than `not_verified`, grade `confirmed`, `reported` or `established`. Everything else stays in the data and is excluded by the helper. Unknown is never zero. |
| facts | The same 22 slots, units and formats for every variant: AUD, km, kWh, kW, min, L, s, mm, kg, m; warranties as "N years / unlimited km" or "N years / 160,000 km"; published charging ranges as text such as "25–30 min" (as before). Values Dot gave in other forms were converted by the importer and logged in `mapping-log.json`. |
| ids | `<model_id>__<trim_slug>__<n>` for every variant, so `(family, slug)` is unique. The original 34 keep their ids; Dot's ids are in `data/research-archive/id-map.json`. |
| equipment rows | The same 69 criteria for every variant. Unresearched rows read "Needs confirmation" with status `not_verified` and are not stored (they expand from `feature_defaults`). |
| sources | Source type, market and dates are mapped onto the app's vocabulary; duplicates (same URL) are merged. Sources cited only by archived content are in `sources-archive.json`. |
| software history | New variants have the "Research pending" default; update events and configuration history are unchanged. |
