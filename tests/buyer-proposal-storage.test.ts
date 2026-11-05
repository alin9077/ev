import test from "node:test";
import assert from "node:assert/strict";
import {
  identitySnapshotId,
  resolveBuyerProposal,
  IDENTITY_STORAGE_VERSION,
} from "../src/lib/buyer-proposal-storage";
function fixture() {
  const own = {
    id: "a",
    facts: { range: { value: null, sources: ["s1", "s2"] } },
  };
  const related = {
    ...structuredClone(own),
    availabilityEvidence: { stockStatus: "unverified" },
  };
  const ownRef = identitySnapshotId(own),
    relatedRef = identitySnapshotId(related);
  return {
    own,
    related,
    ownRef,
    relatedRef,
    stored: {
      dependencies: [],
      records: [
        {
          variantId: "a",
          expectedIdentityRef: ownRef,
          expectedRelatedIdentityRefs: { a: relatedRef },
        },
      ],
      identityStorageVersion: IDENTITY_STORAGE_VERSION,
    },
    ledger: {
      schemaVersion: IDENTITY_STORAGE_VERSION,
      snapshots: { [ownRef]: own, [relatedRef]: related },
    },
  };
}
test("storage resolves exact distinct own/related snapshots without cloning or sorting", () => {
  const f = fixture();
  const p = resolveBuyerProposal(f.stored, f.ledger);
  assert.equal(p.records[0].expectedIdentity, f.own);
  assert.equal(p.records[0].expectedRelatedIdentities?.a, f.related);
  assert.notEqual(f.ownRef, f.relatedRef);
  assert.deepEqual(Object.keys(p), ["dependencies", "records"]);
  assert.deepEqual(Object.keys(p.records[0]), [
    "variantId",
    "expectedIdentity",
    "expectedRelatedIdentities",
  ]);
  assert.notEqual(
    identitySnapshotId({ a: 1, b: 2 }),
    identitySnapshotId({ b: 2, a: 1 }),
  );
});
test("resolved expected identities and nested collections are immutable and detached from actual inputs", () => {
  const f = fixture();
  const actual = structuredClone(f.own);
  const before = JSON.stringify(f.ledger);
  resolveBuyerProposal(f.stored, f.ledger);
  assert.ok(Object.isFrozen(f.own.facts.range.sources));
  assert.throws(() => f.own.facts.range.sources.push("changed"));
  actual.facts.range.sources.reverse();
  assert.equal(JSON.stringify(f.ledger), before);
  assert.notDeepEqual(actual, f.own);
});
test("explicit unguarded records round trip without introducing optional guards", () => {
  const f = fixture();
  const p = resolveBuyerProposal(
    {
      ...f.stored,
      records: [
        {
          variantId: "legacy",
          expectedIdentityRef: "none",
          expectedRelatedIdentityRefs: "none",
        },
      ],
    },
    f.ledger,
  );
  assert.deepEqual(p.records, [{ variantId: "legacy" }]);
});
test("missing, null, prototype-named, malformed and wrong-target references fail closed", () => {
  for (const ref of [
    undefined,
    null,
    "",
    "__proto__",
    "constructor",
    "i_" + "0".repeat(64),
    42,
    [],
  ]) {
    const f = fixture();
    assert.throws(() =>
      resolveBuyerProposal(
        {
          ...f.stored,
          records: [{ ...f.stored.records[0], expectedIdentityRef: ref }],
        },
        f.ledger,
      ),
    );
  }
  const f = fixture();
  assert.throws(() =>
    resolveBuyerProposal(
      {
        ...f.stored,
        records: [{ variantId: "a", expectedRelatedIdentityRefs: {} }],
      },
      f.ledger,
    ),
  );
  assert.throws(() =>
    resolveBuyerProposal(
      {
        ...f.stored,
        records: [{ ...f.stored.records[0], variantId: "wrong" }],
      },
      f.ledger,
    ),
  );
  assert.throws(() =>
    resolveBuyerProposal(
      {
        ...f.stored,
        records: [
          {
            ...f.stored.records[0],
            expectedRelatedIdentityRefs: { wrong: f.relatedRef },
          },
        ],
      },
      f.ledger,
    ),
  );
});
test("corrupted ledger, missing schema and mixed inline guards cannot silently disable evidence checks", () => {
  for (const ledger of [
    null,
    {},
    { schemaVersion: IDENTITY_STORAGE_VERSION, snapshots: [] },
  ])
    assert.throws(() => resolveBuyerProposal(fixture().stored, ledger));
  for (const bad of [null, {}, [], { id: "a" }]) {
    const f = fixture();
    assert.throws(() =>
      resolveBuyerProposal(f.stored, {
        ...f.ledger,
        snapshots: { [f.ownRef]: bad },
      }),
    );
  }
  const f = fixture();
  assert.throws(() =>
    resolveBuyerProposal(
      { ...f.stored, identityStorageVersion: "wrong" },
      f.ledger,
    ),
  );
  for (const key of ["expectedIdentity", "expectedRelatedIdentities"])
    assert.throws(() =>
      resolveBuyerProposal(
        {
          ...f.stored,
          records: [{ ...f.stored.records[0], [key]: undefined }],
        },
        f.ledger,
      ),
    );
  f.own.facts.range.sources.reverse();
  assert.throws(() => resolveBuyerProposal(f.stored, f.ledger));
});
