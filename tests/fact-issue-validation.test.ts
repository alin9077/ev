import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCatalogueIssues } from "../src/lib/validate-catalogue-issues";
import { catalogue, pack, research } from "../src/lib/data";
import { factClaim } from "../src/lib/citable";
import { issueReaderText } from "../src/lib/issue-presentation";

const issue = {
  issue_id: "local-hold",
  title: "Source conflict",
  priority: "review",
  publication_action: "Do not rank this measurement",
  model_ids: ["all"],
  source_ids: ["source-1"],
};
const fixture = (issues: unknown) => [
  { id: "car-1", facts: { held: { issues } } },
];

test("catalogue issue preflight accepts canonical local issues without changing evidence", () => {
  for (const issues of [
    [],
    [issue],
    [issue, issue],
    [
      {
        ...issue,
        model_ids: [],
        source_ids: [],
        sourceHold: { detail: "Preserved" },
      },
    ],
  ]) {
    const value = fixture(issues);
    const before = JSON.stringify(value);
    Object.freeze(value);
    assert.deepEqual(validateCatalogueIssues(value), []);
    assert.equal(JSON.stringify(value), before);
  }
});

test("catalogue issue preflight rejects raw hold IDs with exact diagnostic context", () => {
  const errors = validateCatalogueIssues(
    fixture([issue, "battery-rated-unit"]),
  );
  assert.equal(errors.length, 1);
  assert.match(errors[0], /car-1.*facts.held.issues\[1\].*Issue object/);
});

test("catalogue issue preflight rejects malformed and sparse containers without throwing", () => {
  for (const value of [undefined, null, "id", {}, 1])
    assert.ok(validateCatalogueIssues(fixture(value)).length);
  for (const value of [null, "id", 1, [], undefined])
    assert.ok(validateCatalogueIssues(fixture([value])).length);
  assert.ok(validateCatalogueIssues(fixture(new Array(1))).length);
  assert.ok(validateCatalogueIssues(new Array(1)).length);
  for (const value of [
    null,
    {},
    "cars",
    [null],
    [{ facts: [] }],
    [{ facts: { bad: null } }],
  ])
    assert.ok(validateCatalogueIssues(value).length);
});

test("catalogue issue preflight validates every required member and allows no blank IDs", () => {
  for (const key of Object.keys(issue)) {
    const value: Record<string, unknown> = { ...issue };
    delete value[key];
    assert.ok(
      validateCatalogueIssues(fixture([value])).some((e) => e.includes(key)),
    );
  }
  for (const key of ["issue_id", "title", "priority", "publication_action"])
    for (const value of ["", "  ", null, 5])
      assert.ok(
        validateCatalogueIssues(fixture([{ ...issue, [key]: value }])).length,
      );
  for (const key of ["model_ids", "source_ids"])
    for (const value of ["id", {}, [""], [null], [5], new Array(1)])
      assert.ok(
        validateCatalogueIssues(fixture([{ ...issue, [key]: value }])).length,
      );
});

test("catalogue issue preflight aggregates failures across all cars and fact keys", () => {
  const errors = validateCatalogueIssues([
    {
      id: "one",
      facts: { first: { issues: ["bad"] }, second: { issues: null } },
    },
    { id: "two", facts: { third: { issues: [{}] } } },
  ]);
  for (const key of ["one", "two", "first", "second", "third"])
    assert.ok(errors.some((error) => error.includes(key)));
});

test("all compiled facts have canonical issues and retain every warning in citable output", () => {
  const cars = catalogue();
  const snapshot = { data: research(), cars };
  assert.deepEqual(validateCatalogueIssues(cars), []);
  let checked = 0;
  for (const car of cars) {
    const report = pack(car.id, snapshot);
    for (const fact of Object.values(car.facts)) {
      const claim = factClaim(report, fact);
      assert.ok(
        claim.qualifications.every((value) => typeof value === "string"),
      );
      for (const held of fact.issues) {
        const warning = issueReaderText(held).replace(/\s+/g, " ").trim();
        assert.ok(
          claim.qualifications.includes(warning),
          `${car.id}/${fact.key}: ${held.issue_id}`,
        );
      }
      checked++;
    }
  }
  assert.ok(checked > 0);
});
