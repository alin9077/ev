# Verification plan for a later display-only candidate

Assessment only: none of the checks below has been run by this worker. Do not change evidence data merely to make a check pass.

## Exact-match behavior

1. For each of the ten manifest entries, provide its exact ID, field and old string; expect precisely the proposed after string.
2. Same old text, different/unknown ID: original text remains. This includes a new vehicle copying the old FONZ or Surron notice.
3. Same ID, different/updated text: original updated text remains. Match the whole old string, including punctuation and case; no loose root/candidate/admission substitution.
4. Same ID and old text, wrong field: original text remains. Mazda evidenceNote and limitations[4] have separate entries.
5. Missing configuration evidence: preserve the existing absence of the notice; create no configuration object, evidence claim, availability status or eligibility default.
6. Do not mutate caller objects, imported inventory, active car configuration, source records, nested frozen readiness snapshots, expected identity snapshots or strings elsewhere. Verify unchanged data-file hashes and representative object equality before/after presentation.
7. Apply the same exact configuration display behavior in both Discovery and detail, without rewriting the projected data. Use shared presentation behavior for app and portable surfaces.

## Meaning and neighboring caveats

- FONZ: named advertised selection is limited and review remains necessary. Existing manufacturer-MY, component-level factory-build, VIN/unit, stock, order and delivery warnings remain verbatim; both eligibility flags remain false.
- Surron: exact advertised New MY26 EBMX offer is retained verbatim in substance, along with the need for review. Do not display MY26 as newly manufacturer-verified, or call the advertisement physical stock.
- Kawasaki: seller, New Ninja e-1 (LAMS) (MY26), NX011ATFNN and catalogue KAW-NE1-MY26_1 remain visible; complete factory build is unverified and separate specification review remains explicit.
- Mazda limitation: only pages 5, 7 and 14 are described as visually checked; headings, cargo basis and publication footer/code are retained. The visible text must still say the limited check does not verify detailed technical information, applicable specification version or specifications.
- Mazda evidence note: compare all but the final sentence byte-for-byte. Stock 11397703, VIN LVRHDCEK6TN551337, 6 October 2026 metadata date, preorder/enquiry route and no present unsold physical availability stay untouched. Other limitations retain formal-MY/build uncertainty and the unresolved 363 L VDA versus 468 L cargo difference.
- Lexus: keep BEVs separate from hybrids, preserve the late-addition history, retain order/stock uncertainty and every remaining limitation. Do not derive manufacturer MY from publication/launch date or use held charging figures in ranks.
- BCI: keep the sales-sheet-only restriction and unverified exact-build caveat. All technical-conflict strings, unknown/null fields and class/ranking boundaries remain unchanged.

## Regression boundaries

- Compare guarded summary presence, content, source references and required conditions for both FONZ Z and the two Surron HP T records against the unchanged baseline at the same evidence date. Changing only visible scope copy must neither create nor remove a summary.
- Assert original Model Y hero and all nine selling points are unchanged, including their source dependencies and timing behavior.
- Unknown records, false eligibility, unresolved values, stale/expired evidence and unverified availability must retain their prior results. The display layer must never call an admission, ranking, source-validation or evidence-date function, or return a modified Car/Fact object.
- The seven old strings remain intact inside frozen provenance and expected-identity data. No renamed hash keys or migrated buyer-summary identity references.
- Root should run the repository's relevant static/unit/render checks and app/portable browser checks against the later applied candidate; this report supplies no test-pass claim.

## Optional freshness placeholder is separate

If root later chooses the clock-placeholder improvement, test not-ready, ready/current, ready/stale, ready/expired and no-summary states separately. Not-ready must reveal no dated summary or rank. Ready must preserve all existing guard outcomes. A passive fresh page must update without requiring search. This optional behavior is not part of the wording manifest or the above copy-only candidate.
