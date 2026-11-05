"use strict";
// Live-data behavioral mutation harness. No recovery source or checkpoint fixture is required.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const TARGET = "surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010";
const CARBON = "surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010";
const equal = (actual, expected, label) =>
  assert.deepEqual(actual, expected, label);
function freeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}
function unique(rows, key, label) {
  assert.ok(Array.isArray(rows), label);
  assert.equal(new Set(rows.map((row) => row[key])).size, rows.length, label);
}
// An immutable copy-on-write actual-data mutation. The expected graph is untouched.
const parts = (pointer) =>
  pointer
    .slice(1)
    .split("/")
    .map((s) => s.replaceAll("~1", "/").replaceAll("~0", "~"));
function editAt(value, pointer, operation, replacement) {
  const keys = parts(pointer);
  const walk = (node, at) => {
    assert.ok(
      node && typeof node === "object",
      "missing pointer ancestor: " + pointer,
    );
    const result = Array.isArray(node) ? [...node] : { ...node };
    const key = keys[at];
    if (at < keys.length - 1) result[key] = walk(node[key], at + 1);
    else if (operation === "delete") {
      assert.ok(Object.hasOwn(node, key), "delete absent path: " + pointer);
      if (Array.isArray(result)) result.splice(Number(key), 1);
      else delete result[key];
    } else if (operation === "reverse") {
      assert.ok(Array.isArray(node[key]));
      result[key] = [...node[key]].reverse();
    } else if (operation === "append") {
      assert.ok(Array.isArray(node[key]));
      result[key] = [...node[key], structuredClone(replacement)];
    } else {
      assert.ok(operation === "replace" || operation === "add");
      result[key] = structuredClone(replacement);
    }
    return result;
  };
  return walk(value, 0);
}
function assertCandidateIntegrity(f, candidate = f.delta, ledger = f.ledger) {
  assert.equal(candidate.identityStorageVersion, "buyer-identity-snapshots-1");
  unique(candidate.records, "variantId", "candidate record uniqueness");
  unique(candidate.dependencies, "id", "candidate dependency uniqueness");
  unique(
    candidate.expectedSourceSnapshots,
    "id",
    "candidate source uniqueness",
  );
  const record = candidate.records[0];
  assert.equal(record.variantId, TARGET);
  assert.equal(
    record.expectedIdentityRef,
    f.ref,
    "own identity reference is mandatory, never none",
  );
  assert.equal(record.expectedRelatedIdentityRefs, "none");
  for (const dependency of candidate.dependencies)
    assert.equal(
      dependency.variantId,
      TARGET,
      "all strength dependencies must belong to Brown",
    );
  assert.equal(Object.hasOwn(record, "tradeoff"), false);
  equal(candidate, f.delta, "candidate must retain its reviewed guards");
  equal(ledger, f.ledger, "candidate must retain its own snapshot ledger");
}
function createHarness(root) {
  const appRequire = createRequire(path.join(root, "package.json"));
  const { catalogue, research } = appRequire(
    path.join(root, "src/lib/data.ts"),
  );
  const { buildBuyerSummaries, currentBuyerSummary } = appRequire(
    path.join(root, "src/lib/selling-points.ts"),
  );
  const { resolveBuyerProposal } = appRequire(
    path.join(root, "src/lib/buyer-proposal-storage.ts"),
  );
  const read = (name) =>
    JSON.parse(readFileSync(path.join(root, name), "utf8"));
  const stored = read("data/buyer-selling-points-2026-10-10.json");
  const allLedger = read("data/buyer-identity-snapshots-2026-10-10.json");
  const record = stored.records.find((row) => row.variantId === TARGET);
  const carbonRecord = stored.records.find((row) => row.variantId === CARBON);
  const REF = record.expectedIdentityRef;
  const dependencyIds = new Set([
    record.modelYearDependency,
    ...record.strength.dependencyIds,
  ]);
  const dependencies = stored.dependencies.filter((row) =>
    dependencyIds.has(row.id),
  );
  const sourceIds = new Set([
    ...record.availabilityGuardSourceIds,
    ...dependencies.flatMap((row) => row.sourceIds),
  ]);
  const delta = {
    ...stored,
    records: [record],
    dependencies,
    expectedSourceSnapshots: stored.expectedSourceSnapshots.filter((row) =>
      sourceIds.has(row.id),
    ),
  };
  const ledger = {
    ...allLedger,
    snapshots: { [REF]: allLedger.snapshots[REF] },
  };
  const f = freeze({
    delta,
    ledger,
    ref: REF,
    identity: ledger.snapshots[REF],
    spec: read("tests/fixtures/desert-strength-mutations.json"),
    carbonLedger: {
      ...allLedger,
      snapshots: {
        [carbonRecord.expectedIdentityRef]:
          allLedger.snapshots[carbonRecord.expectedIdentityRef],
      },
    },
  });
  assertCandidateIntegrity(f);
  const proposal = freeze(
    resolveBuyerProposal(structuredClone(delta), structuredClone(ledger)),
  );
  const liveCar = catalogue().find((car) => car.id === TARGET);
  const { buyerSummary: ignored, ...identity } = liveCar;
  void ignored;
  const car = freeze(structuredClone(identity));
  const currentSources = research().sources;
  const sources = freeze(
    delta.expectedSourceSnapshots.map((source) =>
      currentSources.find((current) => current.id === source.id),
    ),
  );
  equal(
    car,
    f.identity,
    "live car identity matches its reviewed source guards",
  );
  equal(
    sources,
    delta.expectedSourceSnapshots,
    "live sources match reviewed source guards",
  );
  const policy = freeze({ ...f.spec.baselinePolicy });
  const build = (
    actualCar = car,
    actualSources = sources,
    actualProposal = proposal,
    asOf = policy.asOf,
  ) =>
    buildBuyerSummaries([actualCar], [], actualSources, actualProposal, {
      ...policy,
      asOf,
    }).get(TARGET);
  const cached = freeze(build());
  assert.ok(cached?.strength, "positive baseline has a strength");
  const expected = cached;
  const guardsBefore = JSON.stringify({ proposal, expected, car, sources });
  const sourceReplace = (all, id, fn) => {
    assert.equal(all.filter((s) => s.id === id).length, 1);
    return all.map((source) => (source.id === id ? fn(source) : source));
  };
  function runBuildCase(c) {
    let actualCar = car,
      actualSources = sources,
      actualProposal = proposal;
    const apply = (input) => editAt(input, c.path, c.operation, c.value);
    if (
      c.expected.startsWith("candidate premerge integrity validation rejects")
    ) {
      let delta = f.delta;
      if (
        c.target.startsWith("candidate dependency ") &&
        c.target !== "candidate dependency array"
      ) {
        const index = delta.dependencies.findIndex(
          (d) => d.id === c.target.slice("candidate dependency ".length),
        );
        assert.ok(index >= 0);
        delta = editAt(
          delta,
          "/dependencies/" + index + c.path,
          c.operation,
          c.value,
        );
      } else if (c.target === "candidate normalized record")
        delta = editAt(delta, "/records/0" + c.path, c.operation, c.value);
      else delta = apply(delta);
      assert.throws(() => assertCandidateIntegrity(f, delta), undefined, c.id);
      return "premerge";
    }
    if (c.expected.startsWith("normalized storage rejects")) {
      let stored = f.delta;
      let ledger = {
        schemaVersion: f.ledger.schemaVersion,
        snapshots: { ...f.ledger.snapshots, ...f.carbonLedger.snapshots },
      };
      if (
        c.target === "candidate identity snapshot retaining original hash key"
      )
        ledger = editAt(
          ledger,
          "/snapshots/" + REF + c.path,
          c.operation,
          c.value,
        );
      else stored = editAt(stored, "/records/0" + c.path, c.operation, c.value);
      const message = c.expected.includes("target mismatch")
        ? /snapshot target mismatch/
        : c.expected.includes("hash mismatch")
          ? /snapshot shape or hash/
          : /Invalid buyer identity storage:/;
      assert.throws(() => resolveBuyerProposal(stored, ledger), message, c.id);
      return "storage";
    }
    if (c.target === "actual target car") actualCar = apply(car);
    else if (c.target === "candidate record")
      actualProposal = editAt(
        proposal,
        "/records/0" + c.path,
        c.operation,
        c.value,
      );
    else if (c.target.startsWith("actual sources: exact id "))
      actualSources = sourceReplace(
        sources,
        c.target.slice("actual sources: exact id ".length),
        apply,
      );
    else if (c.target === "actual source array") {
      const id = c.path.slice("/source-with-id/".length);
      assert.ok(sources.some((s) => s.id === id));
      actualSources = sources.filter((s) => s.id !== id);
    } else if (c.target === "resolved proposal dependencies") {
      const id = c.path.slice("/dependency-with-id/".length);
      assert.ok(proposal.dependencies.some((d) => d.id === id));
      actualProposal = {
        ...proposal,
        dependencies: proposal.dependencies.filter((d) => d.id !== id),
      };
    } else if (c.target.startsWith("candidate dependency ")) {
      const index = proposal.dependencies.findIndex(
        (d) => d.id === c.target.slice("candidate dependency ".length),
      );
      assert.ok(index >= 0);
      actualProposal = editAt(
        proposal,
        "/dependencies/" + index + c.path,
        c.operation,
        c.value,
      );
    } else
      assert.fail(
        "Unimplemented declared build case: " + c.id + " / " + c.target,
      );
    if (c.expected === "record age alone retains current dependencies")
      assert.ok(
        build(actualCar, actualSources, actualProposal)?.strength,
        c.id,
      );
    else
      assert.equal(
        build(actualCar, actualSources, actualProposal),
        undefined,
        c.id,
      );
    return "build";
  }
  function runCachedCase(c) {
    let summary = cached,
      currentSources = sources;
    if (c.target === "current source array")
      currentSources = sources.filter((s) => s.id !== c.sourceId);
    else if (c.target === "current source with exact id")
      currentSources = sourceReplace(sources, c.sourceId, (s) =>
        editAt(s, c.path, c.operation, c.value),
      );
    else if (c.target === "cached valid summary")
      summary = editAt(cached, c.path, c.operation, c.value);
    else assert.fail("Unimplemented cached case: " + c.id);
    // Never rebuild from the changed actual sources. Approved embedded guards stay fixed.
    if (c.expected === "record age alone retains current dependencies")
      assert.ok(
        currentBuyerSummary(summary, currentSources, policy)?.strength,
        c.id,
      );
    else
      assert.equal(
        currentBuyerSummary(summary, currentSources, policy),
        undefined,
        c.id,
      );
    return "cached";
  }
  function checkUnchanged() {
    assert.equal(
      JSON.stringify({ proposal, expected, car, sources }),
      guardsBefore,
      "fixed graphs were not changed",
    );
  }
  return {
    f,
    car,
    sources,
    proposal,
    policy,
    expected,
    cached,
    build,
    buildBuyerSummaries,
    currentBuyerSummary,
    resolveBuyerProposal,
    runBuildCase,
    runCachedCase,
    checkUnchanged,
  };
}
export {
  TARGET,
  CARBON,
  equal,
  editAt,
  assertCandidateIntegrity,
  createHarness,
};
