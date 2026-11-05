import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  readExplorerFilters,
  clearExplorerFilters,
  explorerFilterUrl,
  EXPLORER_DEFAULT_FILTERS,
} from "../src/lib/explorer-state";
const hosted = { pathname: "/cars", protocol: "https:", search: "", hash: "" };
const queryOf = (href: string) =>
  new URL(href, "https://roadmark.invalid").searchParams;
test("empty URL and initial props share complete deterministic Explorer defaults", () => {
  assert.deepEqual(readExplorerFilters({}), EXPLORER_DEFAULT_FILTERS);
  assert.deepEqual(
    readExplorerFilters(new URLSearchParams()),
    EXPLORER_DEFAULT_FILTERS,
  );
  assert.equal(
    readExplorerFilters({ availability: "" }).availability,
    "on_sale_now",
  );
});
test("clear all keeps explicit availability all across URL reload", () => {
  const cleared = clearExplorerFilters();
  assert.equal(cleared.availability, "all");
  const href = explorerFilterUrl(cleared, hosted);
  assert.equal(queryOf(href).get("availability"), "all");
  assert.deepEqual(readExplorerFilters(queryOf(href)), cleared);
  assert.notEqual(cleared, clearExplorerFilters());
});
test("history URL omissions restore defaults instead of retaining former active filters", () => {
  const previous = readExplorerFilters({
    q: "Kia",
    family: "kia_ev3",
    availability: "all",
    budget: "70000",
    range: "500",
    drive: "AWD",
    seats: "7",
    equipment: "hud",
  });
  const restored = readExplorerFilters(new URLSearchParams("q=BYD"));
  assert.notDeepEqual(restored, previous);
  assert.deepEqual(restored, { ...EXPLORER_DEFAULT_FILTERS, q: "BYD" });
});
test("all Explorer filters round trip Unicode spaces and URL punctuation", () => {
  const filters = readExplorerFilters({
    q: "Škoda & A+B #Long?",
    family: "kia_ev3",
    availability: "all",
    budget: "65000",
    range: "450",
    drive: "AWD",
    seats: "5",
    equipment: "front_ventilated",
  });
  const href = explorerFilterUrl(filters, { ...hosted, hash: "#results" });
  assert.deepEqual(readExplorerFilters(queryOf(href)), filters);
  assert.equal(new URL(href, "https://roadmark.invalid").hash, "#results");
  assert.equal(queryOf(href).get("page"), null);
});
test("file preview reset preserves filename route and explicit all filter", () => {
  const location = {
    pathname: "/Users/Ailing/Roadmark/index.html",
    protocol: "file:",
    search: "?page=/cars&q=Kia",
    hash: "",
  };
  const href = explorerFilterUrl(clearExplorerFilters(), location);
  assert.ok(href.startsWith(location.pathname + "?"));
  assert.equal(queryOf(href).get("page"), "/cars");
  assert.deepEqual(readExplorerFilters(queryOf(href)), clearExplorerFilters());
});
test("served alternative and renamed HTML previews keep their existing file route", () => {
  for (const pathname of [
    "/roadmark/index-b.html",
    "/Roadmark%20preview.html",
  ]) {
    const href = explorerFilterUrl(clearExplorerFilters(), {
      ...hosted,
      pathname,
    });
    assert.ok(href.startsWith(pathname + "?"));
    assert.equal(queryOf(href).get("page"), "/cars");
  }
});
test("portable page marker preserves extensionless hosting path", () => {
  const href = explorerFilterUrl(clearExplorerFilters(), {
    ...hosted,
    pathname: "/preview/",
    search: "?page=%2Fcars&q=Tesla",
  });
  assert.ok(href.startsWith("/preview/?"));
  assert.equal(queryOf(href).get("page"), "/cars");
});
test("filter input cannot inject routes or retain unrelated query fields", () => {
  const filters = readExplorerFilters({
    q: "&page=https://example.invalid/#x",
    page: "https://example.invalid",
    unknown: "ignored",
  });
  const href = explorerFilterUrl(filters, hosted);
  assert.equal(new URL(href, "https://roadmark.invalid").pathname, "/cars");
  assert.equal(queryOf(href).get("page"), null);
  assert.equal(queryOf(href).get("unknown"), null);
  assert.equal(queryOf(href).get("q"), "&page=https://example.invalid/#x");
});
test("Explorer binds initial change reset and history paths to the same state helpers", () => {
  const source = readFileSync(
    new URL("../src/components/explorer.tsx", import.meta.url),
    "utf8",
  );
  assert.ok(source.includes("readExplorerFilters(initial)"));
  assert.ok(source.includes("setFilters(readExplorerFilters(query))"));
  assert.ok(source.includes("updateFilters(clearExplorerFilters(), true)"));
  assert.ok(source.includes("explorerFilterUrl(next, window.location)"));
  assert.ok(source.includes("window.history.state"));
  assert.ok(!source.includes('replaceState(null, "", "/cars")'));
  assert.ok(!source.includes("query.get(k) || v"));
  assert.ok(!source.includes("Ten model families"));
  assert.ok(source.includes("car.modelFamily || car.family"));
});
