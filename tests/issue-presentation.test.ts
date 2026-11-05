import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { issueReaderText } from "../src/lib/issue-presentation";
import { Issues } from "../src/components/ui";
import type { Issue } from "../src/lib/types";
const legacy = "A 350 kW supply used in a Kia test does not establish a 350 kW vehicle peak.";
const issue: Issue = { issue_id: "V2-13", title: "Charging windows and supply ratings differ", priority: "high", model_ids: ["all"], publication_action: legacy, source_ids: ["kia_ev3_spec"] };
test("known global charging example retains both safety cautions without implying a tested make", () => {
  const before = JSON.stringify(issue);
  const text = issueReaderText(issue);
  assert.doesNotMatch(text, /Kia|350/);
  assert.match(text, /station’s rated output does not establish this vehicle’s peak/);
  assert.match(text, /charge windows and test conditions match/);
  assert.equal(JSON.stringify(issue), before);
  const html = renderToStaticMarkup(createElement(Issues, { issues: [issue] }));
  assert.match(html, /1 research qualification/);
  assert.match(html, /charge windows and test conditions match/);
  assert.doesNotMatch(html, /Kia test/);
});
test("new or changed warnings are never replaced or hidden by the presentation mapping", () => {
  for (const changed of [{ ...issue, issue_id: "OTHER" }, { ...issue, publication_action: legacy + " Additional restriction." }, { ...issue, publication_action: "New evidence warning" }]) assert.equal(issueReaderText(changed), changed.publication_action);
});
