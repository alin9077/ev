/** Server/build-only: never import this module from a client component. */
import { createHash } from "node:crypto";
import type { SellingPointProposal } from "./selling-points";

export const IDENTITY_STORAGE_VERSION = "buyer-identity-snapshots-1";
function object(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype ||
      Object.getPrototypeOf(value) === null)
  );
}
function fail(message: string): never {
  throw new Error(`Invalid buyer identity storage: ${message}`);
}
function freeze(value: unknown): void {
  if (!value || typeof value !== "object") return;
  for (const child of Object.values(value)) freeze(child);
  Object.freeze(value);
}
export function identitySnapshotId(value: Record<string, unknown>): string {
  return (
    "i_" + createHash("sha256").update(JSON.stringify(value)).digest("hex")
  );
}
/** Resolve only approved expected snapshots. Never derive these from actual cars. */
export function resolveBuyerProposal(
  stored: unknown,
  ledger: unknown,
): SellingPointProposal {
  if (
    !object(stored) ||
    stored.identityStorageVersion !== IDENTITY_STORAGE_VERSION ||
    !Array.isArray(stored.records) ||
    !Array.isArray(stored.dependencies)
  )
    fail("proposal schema");
  if (
    !object(ledger) ||
    ledger.schemaVersion !== IDENTITY_STORAGE_VERSION ||
    !object(ledger.snapshots)
  )
    fail("ledger schema");
  const snapshots = ledger.snapshots;
  for (const [id, snapshot] of Object.entries(snapshots)) {
    if (
      !object(snapshot) ||
      Object.keys(snapshot).length === 0 ||
      typeof snapshot.id !== "string" ||
      !snapshot.id ||
      identitySnapshotId(snapshot) !== id
    )
      fail("snapshot shape or hash");
  }
  const resolve = (ref: unknown, target: string): Record<string, unknown> => {
    if (
      typeof ref !== "string" ||
      !/^i_[a-f0-9]{64}$/.test(ref) ||
      !Object.hasOwn(snapshots, ref)
    )
      fail("missing snapshot reference");
    const snapshot = snapshots[ref] as Record<string, unknown>;
    if (snapshot.id !== target) fail("snapshot target mismatch");
    return snapshot;
  };
  const records = stored.records.map((record: unknown) => {
    if (!object(record) || typeof record.variantId !== "string")
      fail("record schema");
    // Inline guards are never accepted in normalized storage, including explicit undefined.
    if (
      Object.hasOwn(record, "expectedIdentity") ||
      Object.hasOwn(record, "expectedRelatedIdentities")
    )
      fail("mixed inline identity");
    if (
      !Object.hasOwn(record, "expectedIdentityRef") ||
      !Object.hasOwn(record, "expectedRelatedIdentityRefs")
    )
      fail("missing guard declaration");
    const entries = Object.entries(record)
      .filter(
        ([key, value]) =>
          !(
            (key === "expectedIdentityRef" ||
              key === "expectedRelatedIdentityRefs") &&
            value === "none"
          ),
      )
      .map(([key, value]): [string, unknown] => {
        if (key === "expectedIdentityRef")
          return [
            "expectedIdentity",
            resolve(value, record.variantId as string),
          ];
        if (key === "expectedRelatedIdentityRefs") {
          if (!object(value)) fail("related references schema");
          return [
            "expectedRelatedIdentities",
            Object.fromEntries(
              Object.entries(value).map(([target, ref]) => [
                target,
                resolve(ref, target),
              ]),
            ),
          ];
        }
        return [key, value];
      });
    return Object.fromEntries(entries);
  });
  // Freeze only expected input graphs, not mutable actual catalogue objects.
  freeze(snapshots);
  const expanded = Object.fromEntries(
    Object.entries(stored)
      .filter(([key]) => key !== "identityStorageVersion")
      .map(([key, value]) => [key, key === "records" ? records : value]),
  );
  return expanded as SellingPointProposal;
}
