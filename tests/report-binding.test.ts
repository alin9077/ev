import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Fact } from "../src/lib/types";
import {
  createClaimBinding,
  prepareBoundIssueReport,
  matchingReportAcknowledgement,
  supportsBoundReporting,
  reportClaimContextKey,
  REPORT_CLAIM_SCHEMA,
  REPORT_SUBMISSION_PROTOCOL,
  REPORT_CONTENT_TYPE,
} from "../src/lib/report-claim-binding";
import { handleBoundReportIntake } from "../src/lib/local-report-intake";
import { projectStoredIssueReport } from "../src/lib/report-queue-projection";
import {
  boundReportFilename,
  reportFileKind,
} from "../src/lib/report-queue-files";
import { ReportSubmissionGate } from "../src/lib/report-submission-state";
const digest = async (s: string) =>
  createHash("sha256").update(s).digest("hex");
const id = "12345678-1234-1234-1234-123456789abc";
const now = "2026-10-11T01:00:00.000Z";
const fact = (): Fact => ({
  key: "range",
  label: "Range",
  value: 420,
  unit: "km",
  basis: "WLTP",
  comparisonBasis: "WLTP",
  status: "standard",
  sourceIds: ["source-a"],
  date: "2026-10-10",
  market: "AU",
  scope: "Exact version",
  qualifications: ["Combined"],
  issues: [],
});
const deps = (f = fact()) => ({
  resolveClaim: (variantId: string, key: string) =>
    variantId === "car-a" && key === f.key
      ? { fact: f, vehicleLabel: "Example exact trim" }
      : undefined,
  now: () => now,
  id: () => id,
  digest,
});
const input = async (f = fact()) => ({
  variantId: "car-a",
  factKey: f.key,
  description: "The source appears different.",
  claimBinding: await createClaimBinding("car-a", f, digest),
});
const record = async () => prepareBoundIssueReport(await input(), deps());
const chunks = async function* (value: Uint8Array, split = 7) {
  for (let i = 0; i < value.length; i += split) yield value.slice(i, i + split);
};
const intake = async (
  value: unknown,
  overrides: Record<string, unknown> = {},
  persist = async (r: unknown) => {
    void r;
  },
) =>
  handleBoundReportIntake(
    {
      host: "localhost:3013",
      origin: "http://localhost:3013",
      contentType: REPORT_CONTENT_TYPE,
      chunks: chunks(new TextEncoder().encode(JSON.stringify(value))),
      ...overrides,
    },
    { ...deps(), port: 3013, persist },
  );
test("complete claim binding includes unknown metadata, exact trim, source order and nested issues", async () => {
  const f = fact();
  const base = await createClaimBinding("car-a", f, digest);
  for (const changed of [
    { ...f, value: 421 },
    { ...f, sourceIds: ["source-b"] },
    { ...f, scope: "Other" },
    { ...f, extra: { boundary: "different" } },
    {
      ...f,
      issues: [
        {
          issue_id: "i",
          title: "Conflict",
          priority: "high",
          model_ids: ["m"],
          publication_action: "hold",
          source_ids: ["s"],
        },
      ],
    },
  ])
    assert.notEqual(
      (await createClaimBinding("car-a", changed, digest)).digest,
      base.digest,
    );
  assert.notEqual(
    (await createClaimBinding("car-b", f, digest)).digest,
    base.digest,
  );
  assert.equal(
    (await createClaimBinding("car-a", JSON.parse(JSON.stringify(f)), digest))
      .digest,
    base.digest,
  );
});
test("binding is compact even for complete large metadata and captures before asynchronous digest", async () => {
  const f = { ...fact(), sourceBoundary: "x".repeat(50000) };
  let release!: () => void;
  const wait = new Promise<void>((r) => (release = r));
  const promise = createClaimBinding("car-a", f, async (s) => {
    await wait;
    return digest(s);
  });
  const expected = await createClaimBinding("car-a", f, digest);
  f.sourceBoundary = "changed";
  release();
  assert.deepEqual(await promise, expected);
  assert.ok(JSON.stringify(expected).length < 200);
});
test("canonical context keys are stable across equivalent object identities and change with metadata", () => {
  const f = fact();
  assert.equal(
    reportClaimContextKey("car-a", f),
    reportClaimContextKey("car-a", { ...f }),
  );
  assert.notEqual(
    reportClaimContextKey("car-a", f),
    reportClaimContextKey("car-a", { ...f, scope: "changed" }),
  );
});
test("intake binds service snapshot and ignores forged client approval and observations", async () => {
  const r = await prepareBoundIssueReport(
    {
      ...(await input()),
      id: "forged",
      status: "approved",
      observedClaim: { value: 0 },
      observedValue: 0,
    },
    deps(),
  );
  assert.equal(r.id, id);
  assert.equal(r.status, "pending");
  assert.equal(r.observedValue, 420);
  assert.deepEqual(r.observedClaim, fact());
  assert.equal(r.bindingState, "matched_service_snapshot");
});
test("stale, absent, malformed and wrong-target bindings fail without allocating IDs", async () => {
  let allocated = 0;
  const d = {
    ...deps(),
    id: () => {
      allocated++;
      return id;
    },
  };
  const valid = await input();
  for (const value of [
    { ...valid, claimBinding: undefined },
    { ...valid, claimBinding: { ...valid.claimBinding, extra: true } },
    {
      ...valid,
      claimBinding: { ...valid.claimBinding, digest: "A".repeat(64) },
    },
    { ...valid, factKey: "missing" },
    { ...valid, description: "short" },
  ])
    await assert.rejects(prepareBoundIssueReport(value, d));
  await assert.rejects(
    prepareBoundIssueReport(
      {
        ...valid,
        claimBinding: { ...valid.claimBinding, digest: "0".repeat(64) },
      },
      d,
    ),
    (e: unknown) => (e as { status: number }).status === 409,
  );
  assert.equal(allocated, 0);
});
test("server snapshots are isolated from mutation during asynchronous hashing", async () => {
  const f = fact();
  const valid = await input(f);
  let release!: () => void;
  const pending = new Promise<void>((r) => (release = r));
  const p = prepareBoundIssueReport(valid, {
    ...deps(f),
    digest: async (s) => {
      await pending;
      return digest(s);
    },
  });
  f.value = 999;
  f.sourceIds.push("new");
  valid.description = "A changed description after call.";
  valid.claimBinding.digest = "0".repeat(64);
  release();
  const r = await p;
  assert.equal(r.observedValue, 420);
  assert.deepEqual(r.sourceIds, ["source-a"]);
  assert.equal(r.description, "The source appears different.");
});
test("server timestamps must use exact canonical UTC ISO and report IDs canonical UUID", async () => {
  for (const date of [
    "October 11 2026",
    "2026-10-11T01:00:00Z",
    "2026-02-30T01:00:00.000Z",
  ])
    await assert.rejects(
      prepareBoundIssueReport(await input(), { ...deps(), now: () => date }),
    );
  await assert.rejects(
    prepareBoundIssueReport(await input(), {
      ...deps(),
      id: () => "not-a-uuid",
    }),
  );
});
test("old and mixed protocol capabilities and acknowledgements are rejected", async () => {
  const binding = await createClaimBinding("car-a", fact(), digest);
  assert.equal(supportsBoundReporting({ mode: "local", enabled: true }), false);
  assert.equal(
    supportsBoundReporting({
      mode: "local",
      enabled: true,
      submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
      claimSchema: REPORT_CLAIM_SCHEMA,
    }),
    true,
  );
  const good = {
    id,
    status: "pending",
    mode: "local",
    submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
    claimBinding: binding,
  };
  assert.equal(matchingReportAcknowledgement(good, binding), true);
  for (const patch of [
    { id: "bad" },
    { status: "approved" },
    { claimBinding: { ...binding, digest: "0".repeat(64) } },
    { submissionProtocol: "old" },
  ])
    assert.equal(
      matchingReportAcknowledgement({ ...good, ...patch }, binding),
      false,
    );
});
test("mocked transport accepts fragmented multibyte UTF-8 and awaits persistence before receipt", async () => {
  const valid = await input();
  valid.description = "Source needs review: 中文 🚗";
  let stored: unknown;
  const response = await intake(valid, {}, async (r) => {
    stored = structuredClone(r);
  });
  assert.equal(response.status, 201);
  assert.equal(
    (stored as { description: string }).description,
    valid.description,
  );
  assert.equal(response.body.id, id);
});
test("mocked transport refuses old media, wrong origins, invalid UTF-8 and oversized bytes before writes", async () => {
  let writes = 0;
  const persist = async () => {
    writes++;
  };
  const valid = await input();
  for (const [patch, status] of [
    [{ contentType: "application/json" }, 415],
    [{ contentType: REPORT_CONTENT_TYPE + "; charset=latin1" }, 415],
    [{ origin: "https://example.com" }, 403],
    [{ host: "example.com:3013" }, 403],
    [{ chunks: chunks(new Uint8Array([0xff])) }, 400],
    [{ chunks: chunks(new Uint8Array(12001)) }, 413],
  ] as const)
    assert.equal((await intake(valid, patch, persist)).status, status);
  assert.equal(writes, 0);
});
test("receipt is detached from sink mutation and failures do not expose filesystem paths", async () => {
  const valid = await input();
  const response = await intake(valid, {}, async (raw) => {
    const r = raw as Awaited<ReturnType<typeof record>>;
    r.id = "mutated";
    r.claimBinding.digest = "0".repeat(64);
  });
  assert.equal(response.body.id, id);
  assert.deepEqual(response.body.claimBinding, valid.claimBinding);
  const failed = await intake(valid, {}, async () => {
    throw new Error("/secret/private/path");
  });
  assert.equal(failed.status, 500);
  assert.doesNotMatch(JSON.stringify(failed), /secret/);
  assert.match(String(failed.body.error), /Check the local queue/);
});
test("new filenames are invisible to the legacy filter while current reader preserves both families", () => {
  const name = boundReportFilename(id);
  assert.equal(/^[a-f0-9-]+\.json$/.test(name), false);
  assert.equal(reportFileKind(name), "bound-v2");
  assert.equal(reportFileKind(id + ".json"), "legacy");
  assert.equal(reportFileKind("../" + name), undefined);
  assert.throws(() => boundReportFilename("../bad"));
});
test("queue projection validates binding, exact filename and bounded display without leaking full snapshot", async () => {
  const r = await record();
  const context = {
    fileKind: "bound-v2" as const,
    filename: boundReportFilename(id),
    digest,
  };
  const p = await projectStoredIssueReport(r, context);
  assert.equal(p?.bindingState, "bound_snapshot");
  assert.equal(p?.labelProvenance, "recorded_snapshot");
  assert.equal(p?.observedValuePreview, "420");
  assert.equal(p?.id, id);
  assert.ok(!Object.hasOwn(p!, "observedClaim"));
  assert.equal(
    (
      await projectStoredIssueReport(r, {
        ...context,
        filename: boundReportFilename("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
      })
    )?.bindingState,
    "invalid_binding",
  );
  assert.equal(
    (await projectStoredIssueReport({ ...r, observedValue: 0 }, context))
      ?.bindingState,
    "invalid_binding",
  );
  assert.equal(
    (
      await projectStoredIssueReport(r, {
        ...context,
        digest: async () => {
          throw new Error("unavailable");
        },
      })
    )?.bindingState,
    "verification_unavailable",
  );
});
test("legacy queue entries stay unbound, machine references exact and oversized sources counted", async () => {
  const r = await record();
  const {
    submissionProtocol,
    claimBinding,
    observedClaim,
    bindingState,
    ...legacy
  } = r;
  void submissionProtocol;
  void claimBinding;
  void observedClaim;
  void bindingState;
  const key = "k".repeat(900);
  const projected = await projectStoredIssueReport(
    {
      ...legacy,
      factKey: key,
      sourceIds: ["s".repeat(300), "z".repeat(1100)],
      description: "x".repeat(50000),
    },
    { fileKind: "legacy", filename: id + ".json", digest },
  );
  assert.equal(projected?.bindingState, "legacy_unbound");
  assert.equal(projected?.factKey, key);
  assert.deepEqual(projected?.sourceIds, ["s".repeat(300)]);
  assert.equal(projected?.omittedSourceCount, 1);
  assert.equal(projected?.fieldsTruncated, true);
  assert.ok(
    new TextEncoder().encode(JSON.stringify(projected)).length <= 24000,
  );
  assert.equal(
    await projectStoredIssueReport(
      { ...legacy, claimKind: ["fact"] },
      { fileKind: "legacy", filename: id + ".json", digest },
    ),
    undefined,
  );
});
test("new malformed markers never masquerade as verified legacy", async () => {
  const r = await record();
  const {
    submissionProtocol,
    claimBinding,
    observedClaim,
    bindingState,
    ...legacy
  } = r;
  void submissionProtocol;
  void claimBinding;
  void observedClaim;
  void bindingState;
  const p = await projectStoredIssueReport(
    { ...legacy, claimBinding: null },
    { fileKind: "legacy", filename: id + ".json", digest },
  );
  assert.equal(p?.bindingState, "invalid_binding");
});
test("submission gate blocks same-claim double clicks, preserves edits and isolates contexts", () => {
  const key = reportClaimContextKey("car-a", fact());
  const gate = new ReportSubmissionGate(key);
  const token = gate.begin(key, "Original description")!;
  assert.equal(
    gate.begin(reportClaimContextKey("car-a", { ...fact() }), "Second"),
    undefined,
  );
  gate.noteEdit(key);
  assert.equal(gate.canClear(token, key, "Original description"), false);
  assert.equal(gate.canPublishFeedback(token), false);
  assert.equal(gate.finish(token), true);
  const next = gate.begin(key, "New description")!;
  const other = reportClaimContextKey("car-b", fact());
  gate.activate(other);
  assert.equal(gate.isCurrent(next), false);
  assert.equal(gate.finish(next), false);
  assert.ok(gate.begin(other, "Other description"));
});
test("deferred clear remains safe after finish and becomes invalid after edit, new operation or disposal", () => {
  const gate = new ReportSubmissionGate("claim");
  const t = gate.begin("claim", "Same")!;
  assert.equal(gate.finish(t), true);
  assert.equal(gate.canClear(t, "claim", "Same"), true);
  gate.noteEdit("claim");
  assert.equal(gate.canClear(t, "claim", "Same"), false);
  const t2 = gate.begin("claim", "Same")!;
  gate.finish(t2);
  gate.begin("claim", "Same");
  assert.equal(gate.canClear(t2, "claim", "Same"), false);
  gate.dispose();
  assert.equal(gate.begin("claim", "Same"), undefined);
});
test("canonical protocol pins numeric-looking keys, Unicode, literal special keys and null prototypes", async () => {
  const f = {
    ...fact(),
    metadata: JSON.parse(
      '{"z":1,"10":"ten","2":"two","01":"zero","é":"accent","a":{"__proto__":{"x":1},"constructor":"literal"}}',
    ),
  };
  const text = reportClaimContextKey("car-a", f);
  assert.ok(
    text.includes(
      '"metadata":{"2":"two","10":"ten","01":"zero","a":{"__proto__":{"x":1},"constructor":"literal"},"z":1,"é":"accent"}',
    ),
  );
  const equivalent = Object.assign(Object.create(null), f);
  assert.equal(reportClaimContextKey("car-a", equivalent), text);
  assert.equal(
    (await createClaimBinding("car-a", f, digest)).digest,
    createHash("sha256").update(text).digest("hex"),
  );
});
test("accepted reports JSON-round-trip into bound queue entries and unsupported resolver shapes reject", async () => {
  const r = await record();
  assert.equal(
    (
      await projectStoredIssueReport(JSON.parse(JSON.stringify(r)), {
        fileKind: "bound-v2",
        filename: boundReportFilename(id),
        digest,
      })
    )?.bindingState,
    "bound_snapshot",
  );
  await assert.rejects(
    prepareBoundIssueReport(await input(), {
      ...deps(),
      resolveClaim: () => ({ fact: fact(), vehicleLabel: "" }),
    }),
  );
  const bad = { ...fact(), issues: [{}] } as Fact;
  await assert.rejects(prepareBoundIssueReport(await input(), deps(bad)));
  await assert.rejects(
    prepareBoundIssueReport(
      { ...(await input()), variantId: "v".repeat(1025) },
      deps(),
    ),
  );
});
test("pending display ownership cannot become stuck after A to B to A or a late completion", () => {
  const gate = new ReportSubmissionGate("A");
  const pending = gate.begin("A", "First")!;
  gate.dispose();
  gate.activate("B");
  assert.equal(gate.isCurrent(pending), false);
  gate.dispose();
  gate.activate("A");
  assert.equal(gate.isCurrent(pending), false);
  assert.equal(gate.finish(pending), false);
  const replacement = gate.begin("A", "Second")!;
  assert.equal(gate.isCurrent(replacement), true);
  assert.equal(gate.finish(pending), false);
  assert.equal(gate.isCurrent(replacement), true);
});
test("exact serialized UTF-8 record bound prevents accepted but unreadable reports", async () => {
  const f = { ...fact(), sourceBoundary: "\u0001".repeat(100000) };
  const value = await input(f);
  let writes = 0;
  await assert.rejects(
    prepareBoundIssueReport(value, deps(f)),
    (e: unknown) => (e as { status: number }).status === 413,
  );
  const response = await handleBoundReportIntake(
    {
      host: "localhost:3013",
      origin: "http://localhost:3013",
      contentType: REPORT_CONTENT_TYPE,
      chunks: chunks(new TextEncoder().encode(JSON.stringify(value))),
    },
    {
      ...deps(f),
      port: 3013,
      persist: async () => {
        writes++;
      },
    },
  );
  assert.equal(response.status, 413);
  assert.equal(writes, 0);
});
test("every live server-resolvable claim satisfies shared shape and canonical reference constraints", async () => {
  const { catalogue, research, effectiveFeatures } =
    await import("../src/lib/data");
  const { availabilityReportClaim } =
    await import("../src/lib/availability-corrections");
  const { featureReportClaim } = await import("../src/lib/corrections");
  const { validReportFact } = await import("../src/lib/report-claim-shape");
  const data = research();
  let claims = 0;
  for (const car of catalogue()) {
    assert.ok(car.id.length <= 1024);
    const values = [
      ...Object.values(car.facts),
      availabilityReportClaim(car),
      ...effectiveFeatures(car, data).map((f) =>
        featureReportClaim(
          f,
          data.criteria.find((c) => c.key === f.criterion)?.label ||
            f.criterion,
        ),
      ),
    ];
    for (const f of values) {
      assert.equal(validReportFact(f), true, `${car.id}/${f.key}`);
      assert.ok(f.key.length <= 1024);
      assert.ok(reportClaimContextKey(car.id, f));
      claims++;
    }
  }
  assert.ok(claims > 10000);
});
test("client sends one bounded versioned POST and requires a matching receipt", async () => {
  const { submitBoundIssueReport } =
    await import("../src/lib/report-submission-client");
  const payload = await input();
  let calls = 0;
  const result = await submitBoundIssueReport(payload, async (url, options) => {
    calls++;
    assert.equal(url, "/api/issues");
    assert.equal(
      (options?.headers as Record<string, string>)["content-type"],
      REPORT_CONTENT_TYPE,
    );
    assert.deepEqual(JSON.parse(String(options?.body)), payload);
    return new Response(
      JSON.stringify({
        id,
        status: "pending",
        mode: "local",
        submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
        claimBinding: payload.claimBinding,
      }),
      { status: 201 },
    );
  });
  assert.equal(result.id, id);
  assert.equal(calls, 1);
});
test("client preserves explicit conflicts and treats transport or undecodable receipts as uncertain without retry", async () => {
  const { submitBoundIssueReport, UNCONFIRMED_REPORT_SAVE } =
    await import("../src/lib/report-submission-client");
  const payload = await input();
  let calls = 0;
  for (const post of [
    async () => {
      calls++;
      throw new Error("Failed to fetch");
    },
    async () => {
      calls++;
      return new Response("{", { status: 201 });
    },
    async () => {
      calls++;
      return new Response(
        JSON.stringify({ id, status: "pending", mode: "local" }),
        { status: 201 },
      );
    },
  ])
    await assert.rejects(submitBoundIssueReport(payload, post), {
      message: UNCONFIRMED_REPORT_SAVE,
    });
  assert.equal(calls, 3);
  await assert.rejects(
    submitBoundIssueReport(
      payload,
      async () =>
        new Response(
          JSON.stringify({ error: "Claim changed; reload and review." }),
          { status: 409 },
        ),
    ),
    { message: "Claim changed; reload and review." },
  );
});
test("explicit null condition explanations remain part of accepted persisted snapshots", async () => {
  const f = { ...fact(), conditionExplanation: null } as unknown as Fact;
  const r = await prepareBoundIssueReport(await input(f), deps(f));
  assert.equal(r.observedClaim.conditionExplanation, null);
  assert.equal(
    (
      await projectStoredIssueReport(JSON.parse(JSON.stringify(r)), {
        fileKind: "bound-v2",
        filename: boundReportFilename(id),
        digest,
      })
    )?.bindingState,
    "bound_snapshot",
  );
});
test("transport never returns a success receipt before the persistence promise resolves", async () => {
  let release!: () => void, started!: () => void;
  const waiting = new Promise<void>((r) => (release = r));
  const entered = new Promise<void>((r) => (started = r));
  let settled = false;
  const promise = intake(await input(), {}, async () => {
    started();
    await waiting;
  }).then((r) => {
    settled = true;
    return r;
  });
  await entered;
  assert.equal(settled, false);
  release();
  assert.equal((await promise).status, 201);
  assert.equal(settled, true);
});
test("deferred and replayed React-style clear updater preserves later edits and operation ownership", () => {
  const gate = new ReportSubmissionGate("claim");
  const token = gate.begin("claim", "Original description")!;
  const update = (previous: { context: string; text: string }) =>
    gate.canClear(token, previous.context, previous.text)
      ? { context: "claim", text: "" }
      : previous;
  gate.finish(token);
  const cleared = update({ context: "claim", text: "Original description" });
  assert.equal(cleared.text, "");
  assert.equal(update(cleared), cleared);
  gate.noteEdit("claim");
  const later = { context: "claim", text: "Original description" };
  assert.equal(update(later), later);
  gate.begin("claim", "Original description");
  assert.equal(update(later), later);
  assert.equal(gate.canPublishFeedback(token), false);
});
test("client receipt comparison uses the detached binding actually posted", async () => {
  const { submitBoundIssueReport } =
    await import("../src/lib/report-submission-client");
  const payload = await input();
  const original = { ...payload.claimBinding };
  let release!: () => void, started!: () => void;
  const waiting = new Promise<void>((r) => (release = r)),
    entered = new Promise<void>((r) => (started = r));
  const response = submitBoundIssueReport(payload, async (_url, options) => {
    assert.deepEqual(JSON.parse(String(options?.body)).claimBinding, original);
    started();
    await waiting;
    return new Response(
      JSON.stringify({
        id,
        status: "pending",
        mode: "local",
        submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
        claimBinding: original,
      }),
      { status: 201 },
    );
  });
  await entered;
  payload.claimBinding.digest = "0".repeat(64);
  release();
  assert.equal((await response).id, id);
});
