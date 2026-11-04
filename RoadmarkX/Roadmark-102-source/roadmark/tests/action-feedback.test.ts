import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createActionFeedbackGate,
  shareViewFeedback,
} from "../src/lib/action-feedback";
function deferred() {
  let resolve!: () => void, reject!: (reason: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const success =
  "Link copied, including the filters and trims in the view you shared.";
const fallback = "Copy the address from your browser to share this view.";
test("share captures the requested exact URL and publishes once after success", async () => {
  const gate = createActionFeedbackGate(),
    pending = deferred(),
    writes: string[] = [],
    messages: string[] = [];
  const href = "https://roadmark.invalid/discover?q=Kia&selected=a,b";
  const run = shareViewFeedback({
    gate,
    href,
    currentHref: () => href,
    writeText: (text) => {
      writes.push(text);
      return pending.promise;
    },
    publish: (text) => messages.push(text),
  });
  assert.deepEqual(writes, [href]);
  assert.deepEqual(messages, []);
  pending.resolve();
  await run;
  assert.deepEqual(messages, [success]);
});
test("rejected and synchronously unavailable clipboard use the visible manual-copy fallback", async () => {
  for (const writeText of [
    () => Promise.reject(new Error("Permission denied")),
    () => {
      throw new Error("Clipboard unavailable");
    },
  ]) {
    const messages: string[] = [];
    const gate = createActionFeedbackGate();
    await shareViewFeedback({
      gate,
      href: "view-a",
      currentHref: () => "view-a",
      writeText,
      publish: (text) => messages.push(text),
    });
    assert.deepEqual(messages, [fallback]);
  }
});
test("newer selection or history action invalidates both old success and failure completions", async () => {
  for (const reject of [false, true]) {
    const gate = createActionFeedbackGate(),
      pending = deferred(),
      messages = ["Choose up to three exact trims. Remove one to add another."];
    const run = shareViewFeedback({
      gate,
      href: "view-a",
      currentHref: () => "view-a",
      writeText: () => pending.promise,
      publish: (text) => messages.push(text),
    });
    gate.invalidate();
    if (reject) pending.reject(new Error("Late denial"));
    else pending.resolve();
    await run;
    assert.deepEqual(messages, [
      "Choose up to three exact trims. Remove one to add another.",
    ]);
  }
});
test("only newest share attempt may publish when promises settle out of order", async () => {
  const gate = createActionFeedbackGate(),
    old = deferred(),
    latest = deferred(),
    messages: string[] = [];
  const run = (pending: ReturnType<typeof deferred>) =>
    shareViewFeedback({
      gate,
      href: "same-view",
      currentHref: () => "same-view",
      writeText: () => pending.promise,
      publish: (text) => messages.push(text),
    });
  const oldRun = run(old),
    latestRun = run(latest);
  latest.resolve();
  await latestRun;
  old.reject(new Error("Older request denied"));
  await oldRun;
  assert.deepEqual(messages, [success]);
});
test("context mismatch and invalidated A to B to A cannot revive an earlier attempt", async () => {
  for (const backToA of [false, true]) {
    const gate = createActionFeedbackGate(),
      pending = deferred(),
      messages: string[] = [];
    let current = "view-a";
    const run = shareViewFeedback({
      gate,
      href: current,
      currentHref: () => current,
      writeText: () => pending.promise,
      publish: (text) => messages.push(text),
    });
    current = "view-b";
    if (backToA) {
      gate.invalidate();
      current = "view-a";
    }
    pending.resolve();
    await run;
    assert.deepEqual(messages, []);
  }
});
test("Discovery binds selection URL history and cleanup invalidation before guarded publication", () => {
  const source = readFileSync(
    new URL("../src/components/discovery.tsx", import.meta.url),
    "utf8",
  );
  assert.equal(
    (source.match(/feedbackGate\.current\.invalidate\(\)/g) || []).length,
    2,
  );
  assert.match(
    source,
    /function toggle\(id: string\)\s*\{\s*feedbackGate\.current\.invalidate\(\)/,
  );
  assert.match(source, /const restore = \(\) => \{\s*gate\.invalidate\(\)/);
  assert.match(source, /return \(\) => \{\s*gate\.invalidate\(\)/);
  assert.ok(source.includes("const gate = feedbackGate.current;"));
  assert.equal((source.match(/gate\.invalidate\(\)/g) || []).length, 2);
  assert.ok(source.includes("return shareViewFeedback({"));
  assert.ok(source.includes("publish: announceShare"));
  assert.ok(
    !source.includes("await navigator.clipboard.writeText(location.href)"),
  );
});
