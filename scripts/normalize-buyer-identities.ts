/** Explicit migration of checked expected snapshots; never consumes actual cars. */
import fs from "node:fs";
import assert from "node:assert/strict";
import {
  identitySnapshotId,
  resolveBuyerProposal,
  IDENTITY_STORAGE_VERSION,
} from "../src/lib/buyer-proposal-storage";
const input = process.argv[2];
if (!input) throw new Error("Provide the checked inline proposal path");
const original = JSON.parse(fs.readFileSync(input, "utf8"));
const snapshots: Record<string, Record<string, unknown>> = {};
function intern(snapshot: Record<string, unknown>) {
  const id = identitySnapshotId(snapshot);
  if (Object.hasOwn(snapshots, id))
    assert.equal(JSON.stringify(snapshots[id]), JSON.stringify(snapshot));
  snapshots[id] = snapshot;
  return id;
}
const records = original.records.map((record: Record<string, unknown>) => {
  assert.ok(!Object.hasOwn(record, "expectedIdentityRef"));
  const next = Object.fromEntries(
    Object.entries(record).map(([key, value]) => {
      if (key === "expectedIdentity")
        return [
          "expectedIdentityRef",
          intern(value as Record<string, unknown>),
        ];
      if (key === "expectedRelatedIdentities")
        return [
          "expectedRelatedIdentityRefs",
          Object.fromEntries(
            Object.entries(
              value as Record<string, Record<string, unknown>>,
            ).map(([target, snapshot]) => [target, intern(snapshot)]),
          ),
        ];
      return [key, value];
    }),
  );
  if (!Object.hasOwn(next, "expectedIdentityRef"))
    next.expectedIdentityRef = "none";
  if (!Object.hasOwn(next, "expectedRelatedIdentityRefs"))
    next.expectedRelatedIdentityRefs = "none";
  return next;
});
const stored = {
  ...original,
  records,
  identityStorageVersion: IDENTITY_STORAGE_VERSION,
};
const ledger = { schemaVersion: IDENTITY_STORAGE_VERSION, snapshots };
assert.equal(
  JSON.stringify(resolveBuyerProposal(stored, ledger)),
  JSON.stringify(original),
);
fs.writeFileSync(
  "data/buyer-selling-points-2026-10-10.json",
  JSON.stringify(stored, null, 2) + "\n",
);
fs.writeFileSync(
  "data/buyer-identity-snapshots-2026-10-10.json",
  JSON.stringify(ledger, null, 2) + "\n",
);
console.log(
  `${records.length} rows, ${Object.keys(snapshots).length} immutable snapshots; exact expanded round trip passed`,
);
