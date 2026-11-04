# Rebuilt101 market payload: verified static result

Initial modern JavaScript listed by /market HTML fell from 1,815,511 to 886,228 raw bytes: 929,283 fewer bytes, a 51.19% reduction.

- HTML + initial modern JS + CSS: 2,004,450 → 1,075,167 raw bytes, down 46.36%
- Market-associated JS chunk: 1,325,478 → 396,195 bytes; the other eight modern JS files are byte-identical
- CSS is byte-identical at 88,013 bytes. HTML length stays 100,926 bytes, but its hash differs
- The separate 112,594-byte noModule fallback is unchanged and excluded from modern totals

The before build is freshly rebuilt exact100 source (T7Eu_1zdzMaYbEyQjlV-X), using copied current dependencies and matching build command/environment. The after build is current101 (oWIsGbFiaYgzVUEyU5Zrg).

Independent static review rechecked both HTML resource lists, every listed asset hash/size, arithmetic, preload coverage and absence of query/fragment aliases. All 2,816 restored baseline archive payloads, 1,678 baseline inputs, 1,684 current authored inputs, 2,813 current QA inputs, 15 previously pinned current assets and eight current QA artifact hash/byte/mtime seals remain exact. Both dependency trees still match across all 35,730 file/link entries. The root's successful baseline and measurement terminals are retained and matched to their results.

This measures raw emitted initial-route artifacts only. It does not measure HTTP compression/transfer, async or prefetched requests, browser consumption, speed, paint, memory or physical-phone performance. The earlier lost-VM 31.7% request-body result uses unavailable evidence and a different basis; it is not reused or compared numerically here.

Evidence: FINAL-MEASURED-REVIEW.json and FINAL-TERMINAL-JOIN.json in this directory; original root result is roadmark-measurement101/static-route-comparison.json. The reviewer read data and hashed files only; it did not execute the measurement script, application or build. Root performance/release acceptance remains unset.
