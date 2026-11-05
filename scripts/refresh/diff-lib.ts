/**
 * Two coverage snapshots in, one month of changes out. Pure and deterministic:
 * the same two snapshots always give the same bytes. A change is exactly one of
 * the eight types in CHANGE_TYPES; anything else (a re-dated, re-sourced or
 * regraded claim whose value and basis are the same) is not a change.
 */
import {
  CHANGE_TYPES,
  type ChangeEntry,
  type ChangeSource,
  type ChangeType,
  type ChangeValue,
  type ChangesMonth,
} from "../../src/lib/changes";
import {
  WARRANTY_KEYS,
  type Snapshot,
  type SnapshotFact,
  type SnapshotVersion,
} from "./snapshot-lib";

const priceKey = (fact: SnapshotFact | undefined, key: string) =>
  fact && (key.endsWith("_aud") || fact.rung !== null);
const valueOf = (fact: SnapshotFact): ChangeValue => ({
  value: fact.value,
  unit: fact.unit,
  basis: fact.comparisonBasis || fact.basis,
});
const availabilityText = (v: SnapshotVersion) => ({
  value: `${v.availability.state}; orders: ${v.availability.orderStatus}; stock: ${v.availability.stockStatus}`,
  unit: "",
  basis: "Exact Australian version availability",
});
const sameFact = (a: SnapshotFact, b: SnapshotFact) =>
  JSON.stringify([a.value, a.unit, a.comparisonBasis, a.basis]) ===
  JSON.stringify([b.value, b.unit, b.comparisonBasis, b.basis]);
export function diffSnapshots(
  before: Snapshot,
  after: Snapshot,
  options: { month: string; beforeSha256: string; afterSha256: string },
): ChangesMonth {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(options.month))
    throw new Error("month must be YYYY-MM");
  const beforeById = new Map(before.versions.map((v) => [v.id, v]));
  const afterById = new Map(after.versions.map((v) => [v.id, v]));
  const ids = [...new Set([...beforeById.keys(), ...afterById.keys()])].sort();
  const entries: ChangeEntry[] = [];
  const identity = (v: SnapshotVersion) => ({
    versionId: v.id,
    brand: v.brand,
    vehicle: v.vehicle,
    family: v.family,
    slug: v.slug,
  });
  for (const id of ids) {
    const b = beforeById.get(id);
    const a = afterById.get(id);
    const bOn = !!b?.onSale;
    const aOn = !!a?.onSale;
    const who = identity((a ?? b)!);
    if (!b && aOn) {
      entries.push({
        type: "version_added", ...who, field: "version",
        before: null, after: availabilityText(a!),
        beforeDate: null, afterDate: a!.availability.checkedAt || null,
        sourceIds: [...a!.availability.sourceIds],
      });
      continue;
    }
    if (bOn && !aOn) {
      entries.push({
        type: "version_withdrawn", ...who, field: "version",
        before: availabilityText(b!), after: a ? availabilityText(a) : null,
        beforeDate: b!.availability.checkedAt || null,
        afterDate: a?.availability.checkedAt || null,
        sourceIds: [...(a ?? b)!.availability.sourceIds],
      });
      continue;
    }
    if (!bOn && aOn) {
      entries.push({
        type: "availability_changed", ...who, field: "availability",
        before: availabilityText(b!), after: availabilityText(a!),
        beforeDate: b!.availability.checkedAt || null,
        afterDate: a!.availability.checkedAt || null,
        sourceIds: [...a!.availability.sourceIds],
      });
      continue;
    }
    if (!bOn || !aOn || !b || !a) continue;
    const bAv = b.availability, aAv = a.availability;
    if (
      bAv.state !== aAv.state ||
      bAv.orderStatus !== aAv.orderStatus ||
      bAv.stockStatus !== aAv.stockStatus
    )
      entries.push({
        type: "availability_changed", ...who, field: "availability",
        before: availabilityText(b), after: availabilityText(a),
        beforeDate: bAv.checkedAt || null, afterDate: aAv.checkedAt || null,
        sourceIds: [...aAv.sourceIds],
      });
    const keys = [...new Set([...Object.keys(b.facts), ...Object.keys(a.facts)])].sort();
    for (const key of keys) {
      const bf = b.facts[key], af = a.facts[key];
      if (priceKey(bf, key) || priceKey(af, key)) {
        if (bf && af && bf.rung === af.rung) {
          if (!sameFact(bf, af))
            entries.push({
              type: "price_changed", ...who, field: key,
              before: valueOf(bf), after: valueOf(af),
              beforeDate: bf.date, afterDate: af.date, sourceIds: [...af.sourceIds],
            });
        } else {
          if (bf)
            entries.push({
              type: "price_removed", ...who, field: key,
              before: valueOf(bf), after: null,
              beforeDate: bf.date, afterDate: af ? af.date : null,
              sourceIds: [...(af ?? bf).sourceIds],
            });
          if (af)
            entries.push({
              type: "price_added", ...who, field: key,
              before: null, after: valueOf(af),
              beforeDate: bf ? bf.date : null, afterDate: af.date,
              sourceIds: [...af.sourceIds],
            });
        }
      } else if (key === "range_km" && bf && af && !sameFact(bf, af))
        entries.push({
          type: "range_changed", ...who, field: key,
          before: valueOf(bf), after: valueOf(af),
          beforeDate: bf.date, afterDate: af.date, sourceIds: [...af.sourceIds],
        });
      else if ((WARRANTY_KEYS as readonly string[]).includes(key) && bf && af && !sameFact(bf, af))
        entries.push({
          type: "warranty_changed", ...who, field: key,
          before: valueOf(bf), after: valueOf(af),
          beforeDate: bf.date, afterDate: af.date, sourceIds: [...af.sourceIds],
        });
    }
  }
  const rank = new Map<string, number>(CHANGE_TYPES.map((t, i) => [t, i]));
  entries.sort(
    (x, y) =>
      rank.get(x.type)! - rank.get(y.type)! ||
      x.brand.localeCompare(y.brand) ||
      x.versionId.localeCompare(y.versionId) ||
      x.field.localeCompare(y.field),
  );
  const counts = Object.fromEntries(CHANGE_TYPES.map((t) => [t, 0])) as Record<ChangeType, number>;
  for (const entry of entries) counts[entry.type]++;
  const sourceIndex = new Map([...before.sources, ...after.sources].map((s) => [s.id, s]));
  const used = [...new Set(entries.flatMap((e) => e.sourceIds))].sort();
  const sources: ChangeSource[] = used.map((id) => {
    const s = sourceIndex.get(id);
    if (!s) throw new Error(`Change cites source ${id}, which neither snapshot records`);
    return { id: s.id, url: s.url, title: s.title, publisher: s.publisher, accessed_date: s.accessed_date };
  });
  return {
    schema: "roadmark-changes-v1",
    month: options.month,
    generator: "scripts/refresh/diff.ts",
    before: { asOf: before.asOf, sha256: options.beforeSha256 },
    after: { asOf: after.asOf, sha256: options.afterSha256 },
    counts,
    sources,
    changes: entries,
  };
}
