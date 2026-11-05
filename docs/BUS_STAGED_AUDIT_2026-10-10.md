# Independent bus staging audit

**Result: revised research stage passes; runtime integration gates remain open.**

No remaining blocking value, hold, citation or scope error was found. This audit does not approve an app merge or establish exhaustive coverage, orders open, stock or road approval.

## Audited revision

- Stage SHA-256: `e2a9fcd5f78f5141e7c519a34ec13cfadf294318c9fc5fa084880dcfb2663b55`
- Frozen evidence SHA-256: `e843b9941b25b9384245b8403c3e0fe8925f1384d731df1886bed34494650874`
- Boundary SHA-256: `d56f13d3af71897e5d1696b6e6d9bb2da472ab41a9a0d9b81670cb186feba6e0`
- App files were not edited by this audit. Staged bus IDs are still absent from current additions.

## Counts

- 7 bounded listed-configuration rows across 7 existing families; no new market family counted
- 383 facts and 383 one-to-one mappings: 194 conditional, 189 not_verified, 0 standard
- 304 boundary field mappings matched values, statuses, qualifications and citations
- 98 required-null checks passed (14 shared fields × 7 rows)
- 147 saved original/text source-path hashes matched; 74 registry entries, 17 cited sources
- 30 alternative-layout facts across 13 explicit layout scopes; no Cartesian-product variants
- 0 Fleetmaster derivative detail rows/facts, 0 Citirider technical detail rows, 0 confirmed-order or verified-stock claims
- 32 automated checks passed; 17 saved PDF pages visually reviewed

## Findings resolved before this revision

- The first 421-fact stage included 38 Fleetmaster facts under the Classmaster base. The parent removed all of them; final stage is 383 facts. Fleetmaster remains a known named derivative outside this integration subset.
- Availability now uses listed_unconfirmed/unverified. This aligns with the boundary and correction workflow. The current reader itself accepts arbitrary strings, so the first enum warning was not a present-reader validation failure.

## Per-record checks

### Yutong D7E
28 fixed passenger seats and separate driver preserved; 23/24-seat alternatives stay labelled options, 23-fixed-versus-reclining conflict retained. 175 kWh declared-only; 120/240 power and 1200/2400 torque pairs remain unlabelled pairs. 1800 kg towing stays literal, braked/unbraked fields null. Generic stock/trial claims stay sourced conditional claims.

### Yutong E7S
16 seated, 8 standing, one separate driver and one wheelchair position are separate fields; wheelchair not added to 24 pax. Charging is a RHS DC port, not invented CCS2/kW. Visible BSIS/ISA/DDAW/MOIS retained, hidden AEBS absent.

### Yutong C12E
57 fixed passengers plus separate driver retained. 53 reclining and 83 school-flex alternatives do not create rows or adult seating totals. 350 kWh declared-only; literal power/torque pairs preserved. Current Yutong body is not merged with procurement or alternate-body epochs.

### Yutong E12
44 seated, 20 standing, separate driver and two wheelchair positions retained without arithmetic. Printed 65 pax conflict keeps passenger_capacity null. Cover 434 kWh and table 434 / 399 kWh are separately named declarations; generic/gross/usable capacity null. Visible ISA preserved; hidden AEBS absent.

### BCI Classmaster EV
57-fixed listed layout admitted; 53 reclining retained as a labelled alternative. CATL 422 kW LFP remains quoted malformed-unit evidence, all battery-kWh normalizations null. 310 kW continuous and 410 kW peak are explicitly sourced. Range and procurement warranties held. Fleetmaster details removed.

### BCI Mini Bus EV
Advertised 12-seat sales-sheet layout is explicit; 14-seat alternative retained as a label. Generic seats, driver-exclusive passengers, driver seats, width, normalized motor output/layout, manual charging limits and battery energy remain null. 140/front/2000 versus manual 120/rear/2040 and 150/centred conflicts retained. 105 kW/hr and two-hour charge text not normalized. Linked warranty summary remains conditional, with source scope and delivery/maintenance terms.

### BCI Proma Low Floor EV
28 metro layout isolated from 29-belted and 17-accessible alternatives. Wheelchair 2-versus-up-to-4 conflict held; no invented passenger total. Eight packs is not kWh. EBS/cruise standard-versus-optional contradictions remain explicit in conditional equipment facts; none standard.

## Provenance notes

- 58 staged mapping sourcePath values use custom relative records/<id> or bodyOptions/<index> routes rather than canonical file#JSON pointers. All resolve; this audit supplies canonicalSourcePath for every source-backed mapping. Twenty-one required_null entries are intentionally synthetic null overlays. Use the audit canonical mapping or serialize canonical pointers if downstream tooling requires RFC-style JSON pointers. Do not call all 383 original stage sourcePath strings canonical JSON pointers.

- Proma option-level conditions [Accessible wheelchair count unresolved] are not copied into the two layout_12_* facts. The unresolved 2-versus-up-to-4 issue remains explicit in the base wheelchair null fact, base qualifications and availability notes; no wheelchair count is promoted. Consider copying bodyOptions[].conditions into each option fact so standalone option-card export retains that warning.

- Five boundary optional-equipment rows become conditional facts rather than optional status. Each retains explicit optional-only wording and all remain non-ranking. No equipment is promoted to standard. Keep the optional wording visible in any later renderer or feature projection.

- The stage contains the full 74-source research registry; only 17 sources are cited by admitted records/facts. SourceHashes covers all original and text snapshots. Unused failed or unmatched leads are marked access_limitation. Do not count 74 sources as 74 independently verified commercial listings or use unused research leads as evidence for admitted builds.

## Required integration checks

1. After merging, validate actual catalogue() output for all 98 shared null holds plus Mini/E12/model-specific holds. Stage checks do not establish effective runtime behavior.
2. Run full structural validation, type checking, tests and build. Verify conditional facts never enter ranked comparisons, including numeric length, passenger count and declared battery facts.
3. Check detail, compare, catalogue, search and buyer-summary surfaces. Generic seats stays null; static SeatingDiagram returns null for Number(null)=0, but runtime rendered verification is still required.
4. Mini sales-sheet-only identity and unresolved driver, width and powertrain conditions must remain visible. If rendering loses those boundaries, leave Mini audit/search-only.
5. Reconcile the seven existing market families and aliases instead of adding seven family records. Preserve family evidence and separately count listed configurations, named derivatives and audit-only technical references.
6. Fleetmaster derivative, Citirider FBC6120BRS8, U18, Citirider 14.5 E and Citirider D E remain outside the seven staged detail rows. Keep market coverage open without inventing missing configurations.
7. No rollout or validation may imply exhaustive market/trim coverage, approved registration, guaranteed operating mass, open order books or identifiable new stock.

## Scope and limits

Read-only audit of staged bus data, frozen evidence, boundary recommendations and saved original sources. Only research audit outputs were written. No app files edited, new network research, source refresh, contacts, orders, Codex tasks, cloud environments or user-computer work.

This is a bounded evidence/subset audit. Citirider BRS8 commercial matching, the named Fleetmaster derivative and the other audit-only offerings remain open coverage work, without fabricated configuration rows. No live source refresh or runtime/UI tests were performed. The JSON contains all check results, per-record counts, canonical mapping references and the full source hash audit.
