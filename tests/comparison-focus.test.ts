import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  comparisonFocusOutcome,
  type ComparisonFocusRequest,
} from "../src/lib/comparison-focus";

const request: ComparisonFocusRequest = {
  ids: ["baseline", "second", "third"],
  active: "third",
};
function current(ids = request.ids) {
  return {
    pending: false,
    mode: "compare" as const,
    committedIds: [...ids],
    selectedIds: [...ids],
    packIds: [...ids],
    active: ids.at(-1)!,
    canRestoreFocus: true,
  };
}

test("adding a third vehicle focuses only after all committed identities agree", () => {
  assert.equal(comparisonFocusOutcome(request, current()), "focus");
});
test("removing the third vehicle can focus the replacement Add control", () => {
  const ids = request.ids.slice(0, 2);
  assert.equal(
    comparisonFocusOutcome({ ids, active: ids[1] }, current(ids)),
    "focus",
  );
});
test("pending optimistic updates wait even while committed packs lag", () => {
  assert.equal(
    comparisonFocusOutcome(request, {
      ...current(request.ids.slice(0, 2)),
      pending: true,
    }),
    "wait",
  );
});
for (const key of ["committedIds", "selectedIds", "packIds"] as const) {
  test(`settled ${key} mismatch discards stale focus intent`, () => {
    assert.equal(
      comparisonFocusOutcome(request, {
        ...current(),
        [key]: ["baseline", "different", "third"],
      }),
      "discard",
    );
    assert.equal(
      comparisonFocusOutcome(request, {
        ...current(),
        [key]: request.ids.slice(0, 2),
      }),
      "discard",
    );
    assert.equal(
      comparisonFocusOutcome(request, {
        ...current(),
        [key]: [...request.ids].reverse(),
      }),
      "discard",
    );
  });
}
test("a newer active challenger cannot inherit the old focus request", () => {
  assert.equal(
    comparisonFocusOutcome(request, { ...current(), active: "second" }),
    "discard",
  );
});
test("settled focus on another live control cancels restoration without stealing focus", () => {
  assert.equal(
    comparisonFocusOutcome(request, { ...current(), canRestoreFocus: false }),
    "discard",
  );
});
test("leaving the comparison discards the request even during a transition", () => {
  assert.equal(
    comparisonFocusOutcome(request, {
      ...current(),
      pending: true,
      mode: "home",
    }),
    "discard",
  );
});
test("invalid or duplicate identities never focus a selector", () => {
  for (const ids of [
    [],
    ["baseline"],
    ["baseline", ""],
    ["same", "same"],
    ["a", "b", "c", "d"],
  ]) {
    assert.equal(
      comparisonFocusOutcome({ ids, active: ids.at(-1) || "" }, current(ids)),
      "discard",
    );
  }
  assert.equal(
    comparisonFocusOutcome({ ...request, active: "second" }, current()),
    "discard",
  );
});
test("synchronous portable commits do not require an observed pending render", () => {
  assert.equal(comparisonFocusOutcome(request, current()), "focus");
  assert.deepEqual(request.ids, ["baseline", "second", "third"]);
});
test("comparison wiring consumes settled requests and cancels them on newer intent", () => {
  const source = fs.readFileSync("src/components/experience.tsx", "utf8");
  assert.match(
    source,
    /if \(outcome === "wait"\) return;\s*requestedSelectorFocus.current = null;/,
  );
  assert.match(
    source,
    /requestedSelectorFocus.current = focusThirdControl[\s\S]*?\? \{ ids: \[\.\.\.next.ids\], active: next.active \}\s*: null;/,
  );
  assert.match(
    source,
    /className="compare-selectors" ref=\{comparisonSelectors\}/,
  );
  assert.match(
    source,
    /querySelectorAll<HTMLButtonElement>\("\.picker-trigger"\)\[2\]\?\.focus\(\)/,
  );
  assert.equal(source.match(/pathname, true\)/g)?.length, 2);
});
