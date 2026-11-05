import test from "node:test";
import assert from "node:assert/strict";
import { compiledSource, applicationRequire, elementNodes } from "./helpers/compiled-source";
import { makeDeviceIssueDraft } from "../src/lib/device-issue-drafts";
import { makeIssueDraft } from "../src/lib/corrections";
import { reportClaimContextKey } from "../src/lib/report-claim-binding";
import { ReportSubmissionGate } from "../src/lib/report-submission-state";
import type { Fact } from "../src/lib/types";
const fact: Fact = { key: "range_km", label: "Published range", value: 300, unit: "km", basis: "WLTP combined", comparisonBasis: "WLTP combined", status: "conditional", sourceIds: ["source-one"], date: "2026-10-11", market: "AU", scope: "Exact displayed grade", qualifications: ["Test result"], issues: [] };
const description = "Please check this precise claim.";
function harness(initial: string, rejectWrite = false, rejectRead = false, displayedFact = fact) {
  let stored = initial, writes = 0, exports = 0, blob: Blob | undefined;
  const state: unknown[] = [], refs: { current: unknown }[] = [];
  let cursor = 0, refCursor = 0;
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const create = URL.createObjectURL, revoke = URL.revokeObjectURL;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => { if (rejectRead) throw new Error("Device storage denied"); return stored; }, setItem: (_key: string, value: string) => { if (rejectWrite) throw new Error("Device quota unavailable"); stored = value; writes++; } } });
  URL.createObjectURL = (value: Blob) => { blob = value; exports++; return "blob:fixture"; };
  URL.revokeObjectURL = () => undefined;
  const doc = { createElement: () => ({ href: "", download: "", click: () => undefined }) };
  const component = compiledSource("src/components/claim-report.tsx", {
    react: { ...applicationRequire("react"), useState: (initialValue: unknown) => { const index = cursor++; if (!(index in state)) state[index] = initialValue; return [state[index], (value: unknown) => { state[index] = typeof value === "function" ? value(state[index]) : value; }]; }, useRef: (initialValue: unknown) => { const index = refCursor++; return refs[index] ??= { current: initialValue }; }, useEffect: () => undefined, useLayoutEffect: (effect: () => unknown) => { effect(); } },
    "@/lib/corrections": { makeIssueDraft },
    "@/lib/device-issue-drafts": { makeDeviceIssueDraft },
    "@/lib/report-claim-binding": { reportClaimContextKey, supportsBoundReporting: () => false, createClaimBinding: () => { throw new Error("Device save must not bind"); } },
    "@/lib/report-submission-state": { ReportSubmissionGate },
    "@/lib/report-submission-client": { submitBoundIssueReport: () => { throw new Error("Device save must not submit"); } },
  }, doc).ClaimReport as (props: { variantId: string; fact: Fact }) => unknown;
  const render = () => { cursor = 0; refCursor = 0; return elementNodes(component({ variantId: "fixture", fact: displayedFact })); };
  const button = (label: string) => { const n = render().find(n => n.type === "button" && n.props.children === label); assert.ok(n?.props.onClick); return n.props.onClick; };
  const type = () => { const n = render().find(n => n.type === "textarea"); assert.ok(n?.props.onChange); n.props.onChange({ target: { value: description } }); };
  return { state, refs, render, button, type, stored: () => stored, writes: () => writes, exports: () => exports, blob: () => blob, restore: () => { if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage); else Reflect.deleteProperty(globalThis, "localStorage"); URL.createObjectURL = create; URL.revokeObjectURL = revoke; } };
}

test("actual device-save handler appends complete snapshot without backfilling old drafts and exports both", async () => {
  const old = { id: "old", description: "Legacy partial observation", custom: { preserve: true } }, h = harness(JSON.stringify([old]));
  try {
    h.type(); h.button("Save issue draft")();
    const saved = JSON.parse(h.stored());
    assert.deepEqual(saved[0], old);
    assert.ok(!Object.hasOwn(saved[0], "deviceClaimSnapshot"));
    assert.deepEqual(saved[1].deviceClaimSnapshot.fact, fact);
    assert.equal(saved[1].deviceClaimSnapshot.variantId, "fixture");
    assert.equal(h.writes(), 1);
    assert.equal(h.render().find(n => n.type === "textarea")?.props.value, "");
    assert.match(String(h.render().find(n => n.props.role === "status")?.props.children), /Not sent to Roadmark/);
    h.button("Export saved drafts")();
    assert.equal(h.exports(), 1); assert.equal(await h.blob()!.text(), h.stored());
  } finally { h.restore(); }
});

test("storage and capture failures retain prior device data and description without a success message", () => {
  const original = '[{"legacy":true}]';
  for (const [writeDenied, readDenied, shown, expected] of [[true, false, fact, /quota unavailable/], [false, true, fact, /storage denied/], [false, false, { ...fact, scope: undefined } as unknown as Fact, /complete claim could not be captured/]] as const) {
    const h = harness(original, writeDenied, readDenied, shown);
    try {
      h.type(); h.button("Save issue draft")();
      assert.equal(h.stored(), original); assert.equal(h.writes(), 0);
      assert.equal(h.render().find(n => n.type === "textarea")?.props.value, description);
      assert.match(String(h.render().find(n => n.props.role === "status")?.props.children), expected);
    } finally { h.restore(); }
  }
});

test("malformed or non-array saved storage is not overwritten by new draft", () => {
  for (const original of ['{"legacy":true}', 'not valid json', 'null']) {
    const h = harness(original);
    try {
      h.type(); h.button("Save issue draft")();
      assert.equal(h.stored(), original); assert.equal(h.writes(), 0);
      assert.equal(h.render().find(n => n.type === "textarea")?.props.value, description);
      assert.ok(h.render().find(n => n.props.role === "status")?.props.children);
    } finally { h.restore(); }
  }
});

test("device save and export remain blocked during active service submission", () => {
  const h = harness("[]");
  try {
    h.type(); const save = h.button("Save issue draft"), download = h.button("Export saved drafts");
    const gate = h.refs[0].current as ReportSubmissionGate;
    const token = gate.begin(reportClaimContextKey("fixture", fact), description); assert.ok(token);
    save(); download();
    assert.equal(h.writes(), 0); assert.equal(h.exports(), 0);
    assert.equal(h.render().find(n => n.type === "textarea")?.props.value, description);
    gate.finish(token);
  } finally { h.restore(); }
});
