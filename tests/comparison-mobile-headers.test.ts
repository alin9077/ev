import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { ComparisonTable } from "../src/components/experience";
import { pack } from "../src/lib/data";
import { elementNodes } from "./helpers/compiled-source";

const packs = [
  "toyota_hilux_bev_current__sr_double_cab_cab_chassis__20261010",
  "tesla_model_y__premium_long_range_awd__1",
  "tesla_model_y__premium_rwd__2",
].map((id) => pack(id)!);
const rows = [{ key: "range", label: "Claimed range", cells: ["245", "600", "466"] }];
function table(active: string, count = 3, visibleHead = false, columnId = "overview") {
  return elementNodes(ComparisonTable({
    packs: packs.slice(0, count), active,
    rows: rows.map((row) => ({ ...row, cells: row.cells.slice(0, count) })),
    id: "overview", visibleHead, columnId,
  }));
}
for (const active of packs.slice(1).map((p) => p.car.id)) {
  test(`mobile headers and cells retain the same baseline and active challenger: ${active}`, () => {
    const nodes = table(active);
    const headers = nodes.filter((n) => n.type === "th" && n.props.scope === "col");
    const cells = nodes.filter((n) => n.type === "td");
    assert.equal(headers.length, 4); // All columns remain in the DOM for desktop and print.
    assert.equal(cells.length, 3);
    assert.equal(headers[0].props.children, "Criterion");
    for (let i = 0; i < packs.length; i++) {
      const expected = i > 0 && packs[i].car.id !== active ? "inactive-mobile" : "";
      assert.equal(headers[i + 1].props.className, expected);
      assert.equal(cells[i].props.className, expected);
      assert.equal(headers[i + 1].props.id, `overview-${packs[i].car.id}`);
      assert.equal(cells[i].props.headers, `overview-range overview-${packs[i].car.id}`);
    }
    assert.equal(headers.filter((n) => n.props.className === "inactive-mobile").length, 1);
  });
}
test("two-car tables retain both headers and both cells", () => {
  const nodes = table(packs[1].car.id, 2);
  assert.equal(nodes.filter((n) => n.props.className === "inactive-mobile").length, 0);
  assert.equal(nodes.filter((n) => n.type === "td").length, 2);
  assert.equal(nodes.filter((n) => n.type === "th" && n.props.scope === "col").length, 3);
});
test("visible chapter heads preserve custom IDs and matching header references", () => {
  const nodes = table(packs[2].car.id, 3, true, "chapter-range");
  assert.equal(nodes.find((n) => n.type === "thead")?.props.className, "detail-column-heads");
  for (const [i, cell] of nodes.filter((n) => n.type === "td").entries()) {
    assert.equal(cell.props.headers, `overview-range chapter-range-${packs[i].car.id}`);
    assert.ok(nodes.some((n) => n.type === "th" && n.props.id === `chapter-range-${packs[i].car.id}`));
  }
});
test("print explicitly restores inactive headers as table cells after the mobile rule", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  const mobile = css.indexOf(".inactive-mobile {\n    display: none !important;");
  const print = css.indexOf("@media print");
  const restore = css.indexOf(".comparison-table th.inactive-mobile {\n    display: table-cell !important;", print);
  assert.ok(mobile >= 0 && print > mobile && restore > print);
  assert.match(css.slice(print), /\.comparison-table td\.inactive-mobile\s*\{\s*display: table-cell !important;/);
});

test("catalogue fact cells can shrink and wrap unbroken source caveats without clipping", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /\.card-facts > div\s*\{\s*min-width: 0;\s*overflow-wrap: anywhere;/);
});
