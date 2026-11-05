import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buyerDisplayCopy } from "../src/lib/buyer-display-copy";

type Replacement = { id: string; field: string; before: string; after: string };
const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/buyer-copy97.json", import.meta.url), "utf8"),
) as { schemaVersion: number; replacements: Replacement[] };
const replacements = fixture.replacements;

test("ten approved display occurrences retain their independent exact before/after fixture", () => {
  assert.equal(fixture.schemaVersion, 1);
  assert.equal(replacements.length, 10);
  assert.equal(new Set(replacements.map((r) => `${r.id}\0${r.field}`)).size, 10);
  assert.equal(new Set(replacements.map((r) => r.after)).size, 7);
  for (const row of replacements) {
    assert.notEqual(row.before, row.after);
    assert.equal(buyerDisplayCopy(row.id, row.field, row.before), row.after);
    assert.equal(buyerDisplayCopy(row.id, row.field, row.after), row.after);
  }
});

test("unknown identities and fields keep the exact input, including known jargon", () => {
  for (const row of replacements) {
    for (const id of ["", "unknown-record", `unknown-${row.id}`, `${row.id} `, row.id.toUpperCase(), "__proto__"])
      assert.equal(buyerDisplayCopy(id, row.field, row.before), row.before);
    for (const field of ["", "unknown-field", `history.${row.field}`, `${row.field} `, "__proto__"])
      assert.equal(buyerDisplayCopy(row.id, field, row.before), row.before);
  }
  const market = replacements.find((r) => r.id === "mazda-cx-6e" && r.field === "limitations[4]")!;
  assert.equal(buyerDisplayCopy(market.id, "limitations[5]", market.before), market.before);
  assert.equal(buyerDisplayCopy(market.id, "evidenceNote", market.before), market.before);
});

test("changed, extended, shortened and differently cased source text falls back without promotion", () => {
  for (const row of replacements) {
    for (const changed of ["", `${row.before} `, ` ${row.before}`, `${row.before} Stock remains unverified.`, row.before.slice(1), row.before.toUpperCase(), row.before.replaceAll(" ", "  ")])
      assert.equal(buyerDisplayCopy(row.id, row.field, changed), changed);
  }
});

test("no general root, candidate or admission cleanup is performed", () => {
  const text = "Pinned candidate; root admission pending; gating remains unresolved.";
  for (const row of replacements)
    assert.equal(buyerDisplayCopy(row.id, row.field, text), text);
});

test("replacement wording preserves each selected boundary and Mazda metadata verbatim", () => {
  for (const row of replacements.filter((r) => r.id.startsWith("fonz_z_series_"))) {
    assert.match(row.after, /Only this named advertised selection is covered/);
    assert.match(row.after, /further review is required/);
  }
  for (const row of replacements.filter((r) => r.id.startsWith("surron_"))) {
    assert.match(row.after, /exact advertised New MY26 EBMX offer/);
    assert.match(row.after, /further review is required/);
  }
  const kawasaki = replacements.find((r) => r.id.startsWith("kawasaki_"))!;
  for (const literal of ["Brisbane Motorcycles", "New Ninja e-1 (LAMS) (MY26)", "NX011ATFNN", "KAW-NE1-MY26_1", "complete factory build is not verified", "detailed specifications still require separate review"])
    assert.ok(kawasaki.after.includes(literal), literal);
  const mazdaCheck = replacements.find((r) => r.id === "mazda-cx-6e" && r.field === "limitations[4]")!;
  for (const literal of ["pages 5, 7 and 14", "grade-table headings", "cargo measurement basis", "publication footer/code", "limited check does not verify", "applicable specification version", "vehicle specifications in this market record"])
    assert.ok(mazdaCheck.after.includes(literal), literal);
  const mazdaNote = replacements.find((r) => r.id === "mazda-cx-6e" && r.field === "evidenceNote")!;
  assert.equal(
    mazdaNote.after,
    mazdaNote.before.replace(
      "No detailed specification or brochure-to-VIN applicability is admitted.",
      "This market record does not verify detailed specifications or whether the brochure applies to that VIN.",
    ),
  );
  assert.match(replacements.find((r) => r.id === "lexus-es-bev")!.after, /hybrid ES models are separate/);
  const bci = replacements.find((r) => r.id === "bci-mini-bus-ev")!;
  assert.match(bci.after, /limited to the sales sheet/);
  assert.match(bci.after, /Unresolved technical conflicts/);
  assert.match(bci.after, /must not be treated as a verified exact build/);
});

test("the display function accepts only strings and has no data, clock, ranking or browser imports", () => {
  const source = readFileSync(new URL("../src/lib/buyer-display-copy.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /\bimport\b|\brequire\s*\(|\bDate\b|\bwindow\b|\bdocument\b|\bfetch\s*\(/);
  assert.match(source, /entry\.id === id && entry\.field === field && entry\.before === original/);
  assert.match(source, /\?\.after \?\? original/);
});
