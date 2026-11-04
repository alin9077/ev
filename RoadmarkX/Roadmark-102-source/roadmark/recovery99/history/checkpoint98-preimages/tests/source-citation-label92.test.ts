// Candidate test delta. Not executed during research-only preparation.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import correction from "../data/source-citation-label-92.json";
import { sourcePresentation } from "../src/lib/source-presentation";
import { catalogue, pack, research } from "../src/lib/data";
import { buyerProposal } from "../src/lib/buyer-proposal";
import { buildBuyerSummaries, currentBuyerSummary } from "../src/lib/selling-points";
import { factClaim } from "../src/lib/citable";
import { CitedClaim } from "../src/components/citable-report";
import SourceRegistry from "../src/components/source-registry";
import { EvidenceDrawer, factEvidence } from "../src/components/ui";
import { compiledSource } from "./helpers/compiled-source";
import type { Source } from "../src/lib/types";

const SOURCE_ID = "r10_surron_hp_s01_importer_my26";
const SOURCE_URL = "https://ridesurron.com.au/2026-surron-ultra-bee-hp/";
const TITLE = "2026 Surron Ultra Bee HP";
const RAW_TITLE = "Surron Light Bee X (MY25) | Electric Dirt Bike";
const RAW_SHA = "7f9f4b44dee5e2611b660a0252860caa7d57f67db085de85b0ec92acb2b3e61f";
const NOTE = "Title follows the captured page heading. The publisher’s captured title metadata says “Surron Light Bee X (MY25) | Electric Dirt Bike”.";
const CARBON = "surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010";
const BROWN = "surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010";
const R = "surron_ultra_bee_hp_r_carbon_black_ebmx_19849__20261010";
const policy = { asOf: "2026-10-11", maxAgeDays: 30 };
const allSources = research().sources;
const allCars = catalogue();
const source = allSources.find((s) => s.id === SOURCE_ID)!;
const fixture82 = JSON.parse(readFileSync(new URL("../qa/checkpoint82-summary-fixture.json", import.meta.url), "utf8"));
const fixture91 = JSON.parse(readFileSync(new URL("../qa/checkpoint91/checkpoint91-runtime-fixture.json", import.meta.url), "utf8"));
const hash = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sourceBefore = JSON.stringify(allSources);
const proposalBefore = JSON.stringify(buyerProposal);
const correctionBefore = JSON.stringify(correction);
const markup = (node: React.ReactNode) => renderToStaticMarkup(node).replace(/<!--.*?-->/g, "");
const escape = (value: string) => renderToStaticMarkup(createElement("span", null, value)).slice(6, -7);

function change(value: unknown): unknown {
  if (typeof value === "string") return value + " [mutation]";
  if (typeof value === "number") return value + 1;
  if (typeof value === "boolean") return !value;
  if (value === null) return "changed";
  if (Array.isArray(value)) return [...value, "changed"];
  return { ...(value as object), unreviewed: true };
}
function* leaves(value: unknown, path: string[] = []): Generator<string[]> {
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) yield* leaves(child, [...path, key]);
  } else yield path;
}
function mutatedLeaf(original: Source, path: string[]): Source {
  const copy = structuredClone(original);
  let cursor: Record<string, unknown> = copy;
  for (const part of path.slice(0, -1)) cursor = cursor[part] as Record<string, unknown>;
  const key = path.at(-1)!;
  cursor[key] = change(cursor[key]);
  return copy;
}
function verifyUnchanged() {
  assert.equal(JSON.stringify(allSources), sourceBefore);
  assert.equal(JSON.stringify(buyerProposal), proposalBefore);
  assert.equal(JSON.stringify(correction), correctionBefore);
}

test("one exact full source gets a heading label with explicit preserved raw-title provenance", () => {
  assert.equal(correction.sourceId, SOURCE_ID);
  assert.equal(correction.url, SOURCE_URL);
  assert.equal(correction.displayTitle, TITLE);
  assert.equal(correction.displayNote, NOTE);
  assert.equal(correction.provenance.rawSHA256, RAW_SHA);
  assert.equal(correction.provenance.rawBytes, 307904);
  assert.equal(correction.provenance.retrievedAt, "2026-10-10T23:15:07.313072+00:00");
  assert.equal(correction.provenance.h1, TITLE);
  assert.equal(correction.provenance.canonicalUrl, SOURCE_URL);
  assert.equal(correction.provenance.capturedHtmlTitle, RAW_TITLE);
  assert.equal(correction.provenance.capturedOpenGraphTitle, RAW_TITLE);
  assert.equal(correction.provenance.httpCode, 200);
  assert.equal(correction.provenance.numRedirects, 0);
  assert.equal(correction.provenance.newFetchPerformed, false);
  const oldSource = fixture82.summary.expectedSourceSnapshots.find((s: Source) => s.id === SOURCE_ID);
  assert.equal(JSON.stringify(correction.expectedSource), JSON.stringify(oldSource));
  assert.equal(JSON.stringify(source), JSON.stringify(oldSource));
  assert.equal(source.title, RAW_TITLE);
  assert.deepEqual(sourcePresentation(source), { title: TITLE, note: NOTE });
  assert.deepEqual(allSources.filter((s) => sourcePresentation(s).note).map((s) => s.id), [SOURCE_ID]);
  for (const s of allSources.filter((s) => s.id !== SOURCE_ID))
    assert.deepEqual(sourcePresentation(s), { title: s.title }, s.id);
  verifyUnchanged();
});

test("same URL with wrong ID, same ID with wrong URL, metadata drift and added holds never get the override", () => {
  for (const changed of [
    { ...source, id: "other-source" },
    { ...source, url: SOURCE_URL + "?unreviewed=1" },
    { ...source, title: TITLE },
    { ...source, rawSHA256: "0".repeat(64) },
    { ...source, publication_hold: true },
    { ...source, conflict: "new conflict" },
    { ...source, access_limitation: "cannot verify" },
    { ...source, unreviewed: true },
    ...[...leaves(source)].map((path) => mutatedLeaf(source, path)),
  ]) {
    assert.deepEqual(sourcePresentation(changed), { title: changed.title });
  }
  for (const key of Object.keys(source)) {
    const changed = structuredClone(source);
    delete changed[key];
    assert.deepEqual(sourcePresentation(changed), { title: changed.title });
  }
  // The existing guards are field-order-sensitive; do not silently relax that here.
  const reversed = Object.fromEntries(Object.entries(source).reverse()) as Source;
  assert.deepEqual(sourcePresentation(reversed), { title: reversed.title });
  const frozen = Object.freeze(structuredClone(source));
  assert.deepEqual(sourcePresentation(frozen), { title: TITLE, note: NOTE });
  verifyUnchanged();
});

test("all2196 source records retain the pre91 hashes, including every one of the21 Surron sources", () => {
  assert.equal(allSources.length, 2196);
  assert.equal(new Set(allSources.map((s) => s.id)).size, 2196);
  assert.deepEqual(Object.fromEntries(allSources.map((s) => [s.id, hash(s)])), fixture91.previousSourceHashes);
  for (const old of fixture82.summary.expectedSourceSnapshots as Source[])
    assert.equal(JSON.stringify(allSources.find((s) => s.id === old.id)), JSON.stringify(old));
  verifyUnchanged();
});

test("both T summaries keep all21 full-source build and cached guards, eight conditions, and no tradeoff", () => {
  for (const id of [CARBON, BROWN]) {
    const car = allCars.find((c) => c.id === id)!;
    const expected = id === CARBON ? fixture82.summary : fixture91.approvedSummary;
    assert.equal(JSON.stringify(car.buyerSummary), JSON.stringify(expected), id);
    const summary = car.buyerSummary!;
    assert.equal(summary.guardSourceIds.length, 21);
    assert.equal(summary.expectedSourceSnapshots!.length, 21);
    assert.equal(summary.conditions.length, 8);
    assert.equal(summary.tradeoff, undefined);
    assert.deepEqual(summary.strength!.sourceIds, [SOURCE_ID]);
    assert.deepEqual(summary.conditions, car.configurationEvidence!.requiredBuyerVisibleConditions);
    assert.equal(car.availabilityEvidence!.stockStatus, "unverified");
    for (const key of ["rankingEligible", "completeVehicleCountEligible", "fullyClosedFactoryBuild"])
      assert.equal(car.configurationEvidence![key], false);
    for (const key of ["physicalStockVerified", "factoryOrderAcceptanceVerified", "factoryBuildSpecificationVerified", "deliveryToBuyerVerified"])
      assert.equal((car.availabilityEvidence as unknown as Record<string, unknown>)[key], false);
    const sources = allSources.filter((s) => summary.guardSourceIds.includes(s.id));
    const proposal = {
      ...buyerProposal,
      records: buyerProposal.records.filter((r) => r.variantId === id),
      dependencies: buyerProposal.dependencies.filter((d) => d.variantId === id),
    };
    const build = (ss: Source[]) => buildBuyerSummaries([car], [], ss, proposal, policy).get(id);
    assert.deepEqual(build(sources), summary);
    assert.ok(currentBuyerSummary(summary, sources, policy)?.strength);
    const reject = (ss: Source[]) => {
      // Keep the approved cached summary; never rebuild it from mutated sources.
      assert.equal(build(ss), undefined, id + ":build");
      assert.equal(currentBuyerSummary(summary, ss, policy), undefined, id + ":cached");
    };
    for (const actual of sources) {
      reject(sources.filter((s) => s.id !== actual.id));
      for (const key of Object.keys(actual)) {
        const changed = { ...actual, [key]: change(actual[key]) } as Source;
        reject(sources.map((s) => s.id === actual.id ? changed : s));
      }
      reject(sources.map((s) => s.id === actual.id ? { ...s, unreviewed: true } : s));
    }
    for (const path of leaves(source)) {
      const changed = mutatedLeaf(source, path);
      reject(sources.map((s) => s.id === SOURCE_ID ? changed : s));
    }
    for (const date of ["2026-10-09", "2026-11-10", "invalid", ""])
      assert.equal(currentBuyerSummary(summary, sources, { ...policy, asOf: date }), undefined);
    assert.ok(currentBuyerSummary(summary, sources, { ...policy, asOf: "2026-11-09" })?.strength);
  }
  assert.equal(allCars.find((c) => c.id === R)!.buyerSummary, undefined);
  verifyUnchanged();
});

test("footnote source anchor uses exact URL and corrected label without relying on a note number", () => {
  const key = SOURCE_ID;
  const hooks = {
    ...React,
    useState: () => [{ [key]: { ids: [key], number: 37, count: 1 } }, () => {}],
    useMemo: (fn: () => unknown) => fn(),
    useCallback: (fn: unknown) => fn,
    useEffect: () => {},
    useRef: (value: unknown) => ({ current: value }),
  };
  const compiledComponent = compiledSource("src/components/footnotes.tsx", { react: hooks });
  const Provider = compiledComponent.FootnoteProvider as (props: unknown) => React.ReactNode;
  const html = markup(Provider({ sources: [source], children: null, prefix: "test" }));
  assert.ok(html.includes(`href="${SOURCE_URL}"`));
  assert.ok(html.includes(`${TITLE}<span class="sr-only"> (new tab)</span></a>`));
  assert.ok(html.includes(escape(NOTE)));
  assert.ok(html.includes("Checked 2026-10-10"));
  assert.ok(html.includes("Supplied research"));
  verifyUnchanged();
});

test("registry renders the corrected heading and keeps the publisher metadata discrepancy visible", () => {
  const html = markup(createElement(SourceRegistry, { sources: [source] }));
  assert.ok(html.includes(`<summary>${TITLE}<span>`));
  assert.ok(html.includes(escape(NOTE)));
  assert.ok(html.includes(`href="${SOURCE_URL}"`));
  verifyUnchanged();
});

test("registry finds the reviewed heading and retained metadata title without duplicating the source", () => {
  for (const query of ["2026 Surron Ultra Bee HP", "Light Bee X"]) {
    const compiledComponent = compiledSource("src/components/source-registry.tsx", {
      react: { ...React, useState: () => [query, () => {}] },
    });
    const Registry = compiledComponent.default as (props: unknown) => React.ReactNode;
    const html = markup(Registry({ sources: [source] }));
    assert.ok(html.includes("1 source records"), query);
    assert.ok(html.includes(`<summary>${TITLE}<span>`), query);
  }
  verifyUnchanged();
});

test("all three offers keep raw citable title and add the same separately checked presentation label", () => {
  for (const id of [CARBON, BROWN, R]) {
    const p = pack(id);
    const fact = Object.values(p.car.facts).find((f) => f.sourceIds.includes(SOURCE_ID))!;
    assert.ok(fact);
    const claim = factClaim(p, fact);
    const citation = claim.sources.find((s) => s.id === SOURCE_ID)!;
    assert.equal(citation.title, RAW_TITLE);
    assert.equal(citation.url, SOURCE_URL);
    assert.equal(citation.displayTitle, TITLE);
    assert.equal(citation.displayTitleNote, NOTE);
    assert.equal(citation.accessed_date, source.accessed_date);
    const html = markup(createElement(CitedClaim, { claim }));
    assert.ok(html.includes(`${source.publisher}: ${TITLE} (AU)</a>`));
    assert.ok(html.includes(escape(NOTE)));
    const changedPack = { ...p, sources: p.sources.map((s) => s.id === SOURCE_ID ? { ...s, rawSHA256: "changed" } : s) };
    const changed = factClaim(changedPack, fact).sources.find((s) => s.id === SOURCE_ID)!;
    assert.equal(changed.title, RAW_TITLE);
    assert.equal(changed.displayTitle, undefined);
    assert.equal(changed.displayTitleNote, undefined);
  }
  verifyUnchanged();
});


test("every offer evidence drawer labels the exact importer link and retains dates, limitations and source ID", () => {
  for (const id of [CARBON, BROWN, R]) {
    const p = pack(id);
    const fact = Object.values(p.car.facts).find((f) => f.sourceIds.includes(SOURCE_ID))!;
    const html = markup(createElement(EvidenceDrawer, {
      evidence: factEvidence(fact), sources: p.sources, onClose: () => {},
    }));
    assert.ok(html.includes(`href="${SOURCE_URL}"`));
    assert.ok(html.includes(`${TITLE}<span class="sr-only"> (opens in a new tab)</span></a>`));
    assert.ok(html.includes(escape(NOTE)));
    assert.ok(html.includes(`<code>${SOURCE_ID}</code>`));
    assert.ok(html.includes(escape(source.supports)));
    assert.ok(html.includes("Accessed: 2026-10-10"));
  }
  verifyUnchanged();
});
