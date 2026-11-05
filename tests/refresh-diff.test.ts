import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";
import { diffSnapshots } from "../scripts/refresh/diff-lib";
import { validateAgainstSchema, type Schema } from "../scripts/refresh/schema-validate";
import {
  SNAPSHOT_SCHEMA,
  buildSnapshot,
  type Snapshot,
  type SnapshotFact,
  type SnapshotVersion,
} from "../scripts/refresh/snapshot-lib";
import { CHANGE_TYPES } from "../src/lib/changes";
import type { Car, Fact, Source } from "../src/lib/types";

const schema = JSON.parse(fs.readFileSync("data/changes/schema.json", "utf8")) as Schema;
const src = (id: string, accessed: string): Snapshot["sources"][number] => ({
  id, url: `https://maker.example/${id}`, title: id, publisher: "Maker", accessed_date: accessed,
});
const price = (value: number, over: Partial<SnapshotFact> = {}): SnapshotFact => ({
  value, unit: "AUD", basis: "Maker configurator", comparisonBasis: "Before on-road costs",
  rung: 3, date: "2026-10-14", sourceIds: ["old"], ...over,
});
function version(id: string, over: Partial<SnapshotVersion> = {}): SnapshotVersion {
  return {
    id, brand: "BYD", vehicle: `BYD ${id}`, family: "byd-x", slug: id, onSale: true,
    availability: { state: "current_or_order_listed", orderStatus: "accepting_order_requests_advertised", stockStatus: "no_new_stock_verified", checkedAt: "2026-10-14", sourceIds: ["old"] },
    facts: {
      price_aud: price(50000),
      range_km: { value: 400, unit: "km", basis: "WLTP", comparisonBasis: "WLTP combined", rung: null, date: "2026-10-14", sourceIds: ["old"] },
      warranty: { value: "6 years / 150,000 km", unit: "", basis: "New-vehicle", comparisonBasis: "New-vehicle", rung: null, date: "2026-10-14", sourceIds: ["old"] },
      battery_warranty: { value: "8 years", unit: "", basis: "Battery", comparisonBasis: "Battery", rung: null, date: "2026-10-14", sourceIds: ["old"] },
    },
    ...over,
  };
}
const snap = (versions: SnapshotVersion[], asOf: string, extra: string[] = []): Snapshot => ({
  schema: SNAPSHOT_SCHEMA, asOf, versions,
  sources: [src("old", "2026-10-14"), src("new", "2026-11-06"), ...extra.map((id) => src(id, "2026-11-06"))],
});
const run = (before: Snapshot, after: Snapshot) =>
  diffSnapshots(before, after, { month: "2026-11", beforeSha256: "a".repeat(64), afterSha256: "b".repeat(64) });
const withFact = (v: SnapshotVersion, key: string, fact: SnapshotFact | null): SnapshotVersion => {
  const facts = { ...v.facts };
  if (fact) facts[key] = fact; else delete facts[key];
  return { ...v, facts };
};

test("price_changed: value differs on the same rung", () => {
  const out = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "price_aud", price(52990, { date: "2026-11-06", sourceIds: ["new"] }))], "2026-11-30"));
  assert.equal(out.changes.length, 1);
  const [c] = out.changes;
  assert.equal(c.type, "price_changed");
  assert.deepEqual([c.field, c.before?.value, c.after?.value, c.beforeDate, c.afterDate, c.sourceIds], ["price_aud", 50000, 52990, "2026-10-14", "2026-11-06", ["new"]]);
  assert.equal(out.counts.price_changed, 1);
  assert.deepEqual(out.sources.map((s) => s.id), ["new"]);
});

test("price_changed: basis differs on the same rung even when the figure is the same", () => {
  const out = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "price_aud", price(50000, { comparisonBasis: "Driveaway", date: "2026-11-06", sourceIds: ["new"] }))], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => c.type), ["price_changed"]);
});

test("a different rung is a removed price and an added price, never a 'move'", () => {
  const out = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "price_aud", price(50000, { rung: 1, date: "2026-11-06", sourceIds: ["new"] }))], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => c.type).sort(), ["price_added", "price_removed"]);
});

test("price_added and price_removed", () => {
  const promo = price(48000, { rung: 4, comparisonBasis: "Driveaway", date: "2026-11-06", sourceIds: ["new"] });
  const added = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "promotional_driveaway_aud", promo)], "2026-11-30"));
  assert.deepEqual(added.changes.map((c) => [c.type, c.field, c.before, c.after?.value]), [["price_added", "promotional_driveaway_aud", null, 48000]]);
  const removed = run(snap([withFact(version("a"), "promotional_driveaway_aud", promo)], "2026-10-31"), snap([version("a")], "2026-11-30"));
  assert.deepEqual(removed.changes.map((c) => [c.type, c.before?.value, c.after]), [["price_removed", 48000, null]]);
});

test("version_added: new on-sale version; a new provisional one is not a change", () => {
  const out = run(snap([version("a")], "2026-10-31"), snap([version("a"), version("b", { availability: { state: "current_or_order_listed", orderStatus: "accepting_orders", stockStatus: "unverified", checkedAt: "2026-11-06", sourceIds: ["new"] } }), version("c", { onSale: false })], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => [c.type, c.versionId]), [["version_added", "b"]]);
  assert.equal(out.changes[0].before, null);
});

test("version_withdrawn: on sale -> not on sale, and on sale -> gone from the catalogue", () => {
  const off = run(snap([version("a")], "2026-10-31"), snap([version("a", { onSale: false, availability: { state: "not_current", orderStatus: "not_accepting_orders", stockStatus: "no_new_stock_verified", checkedAt: "2026-11-06", sourceIds: ["new"] } })], "2026-11-30"));
  assert.deepEqual(off.changes.map((c) => c.type), ["version_withdrawn"], "withdrawal is not also an availability change");
  assert.match(off.changes[0].after!.value as string, /not_current/);
  const gone = run(snap([version("a")], "2026-10-31"), snap([], "2026-11-30"));
  assert.deepEqual(gone.changes.map((c) => [c.type, c.after]), [["version_withdrawn", null]]);
});

test("availability_changed: order status moves while still on sale; arrival of an existing provisional version", () => {
  const moved = version("a", { availability: { state: "current_or_order_listed", orderStatus: "accepting_orders", stockStatus: "new_stock_listed", checkedAt: "2026-11-06", sourceIds: ["new"] } });
  const out = run(snap([version("a")], "2026-10-31"), snap([moved], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => c.type), ["availability_changed"]);
  assert.match(out.changes[0].before!.value as string, /accepting_order_requests_advertised/);
  const arrival = run(snap([version("a", { onSale: false })], "2026-10-31"), snap([version("a")], "2026-11-30"));
  assert.deepEqual(arrival.changes.map((c) => c.type), ["availability_changed"]);
});

test("range_changed", () => {
  const range = { value: 430, unit: "km", basis: "WLTP", comparisonBasis: "WLTP combined", rung: null, date: "2026-11-06", sourceIds: ["new"] };
  const out = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "range_km", range)], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => [c.type, c.before?.value, c.after?.value]), [["range_changed", 400, 430]]);
});

test("warranty_changed covers vehicle and battery warranty", () => {
  const w = (key: string, value: string) => ({ value, unit: "", basis: key, comparisonBasis: key, rung: null, date: "2026-11-06", sourceIds: ["new"] });
  const v = withFact(withFact(version("a"), "warranty", w("New-vehicle", "7 years / unlimited km")), "battery_warranty", w("Battery", "10 years"));
  const out = run(snap([version("a")], "2026-10-31"), snap([v], "2026-11-30"));
  assert.deepEqual(out.changes.map((c) => [c.type, c.field]), [["warranty_changed", "battery_warranty"], ["warranty_changed", "warranty"]]);
});

test("rechecked-unchanged: no change entry, but the snapshot carries the new date", () => {
  const rechecked = withFact(version("a", { availability: { state: "current_or_order_listed", orderStatus: "accepting_order_requests_advertised", stockStatus: "no_new_stock_verified", checkedAt: "2026-11-06", sourceIds: ["new"] } }), "price_aud", price(50000, { date: "2026-11-06", sourceIds: ["new"] }));
  const after = snap([rechecked], "2026-11-30");
  const out = run(snap([version("a")], "2026-10-31"), after);
  assert.deepEqual(out.changes, []);
  assert.equal(after.versions[0].facts.price_aud.date, "2026-11-06");
  assert.equal(Object.values(out.counts).reduce((n, x) => n + x, 0), 0);
});

test("buildSnapshot records the effective state, and a rechecked car keeps its value with a new date", () => {
  const fact = (value: number, date: string): Fact => ({
    key: "price_aud", label: "Price", value, unit: "AUD", basis: "Configurator", comparisonBasis: "Before on-road costs",
    status: "standard", sourceIds: ["s"], date, market: "AU", scope: "x", qualifications: [], issues: [],
    priceEvidence: { rung: 3, basisTag: "t", sourceKey: "price_aud", sourcePointer: "p", originalBasis: "o", rankingEligible: true },
  });
  const car = (date: string) => ({
    id: "a", modelId: "m", family: "f", slug: "a", brand: "BYD", model: "X", trim: "Y", generation: "", year: 2026,
    availability: "current_or_order_listed", vehicleClass: "passenger", drive: "FWD",
    availabilityEvidence: { checkedAt: date, orderStatus: "accepting_orders", stockStatus: "unverified", sourceIds: ["s"] },
    facts: { price_aud: fact(50000, date), seats: { ...fact(5, date), key: "seats", priceEvidence: undefined } }, issues: [],
  }) as unknown as Car;
  const sources = [{ id: "s", url: "https://m.example/s", title: "S", publisher: "M", source_type: "official_configurator", published_date: null, accessed_date: "2026-10-14", market: "AU", supports: "" }] as Source[];
  const a = buildSnapshot([car("2026-10-14")], sources, "2026-10-31");
  const b = buildSnapshot([car("2026-11-06")], sources, "2026-11-30");
  assert.equal(a.versions[0].onSale, true);
  assert.deepEqual(Object.keys(a.versions[0].facts), ["price_aud"], "only tracked facts are recorded");
  assert.equal(b.versions[0].facts.price_aud.date, "2026-11-06");
  assert.deepEqual(run(a, b).changes, []);
});

test("output is deterministic, ordered by type then brand, and validates against data/changes/schema.json", () => {
  const before = snap([version("z"), version("a"), version("k", { brand: "Kia" })], "2026-10-31");
  const after = snap([
    withFact(version("z"), "price_aud", price(1, { date: "2026-11-06", sourceIds: ["new"] })),
    withFact(version("a"), "price_aud", price(2, { date: "2026-11-06", sourceIds: ["new"] })),
    withFact(version("k", { brand: "Kia" }), "price_aud", price(3, { date: "2026-11-06", sourceIds: ["new"] })),
    version("n", { brand: "Kia", availability: { state: "current_or_order_listed", orderStatus: "accepting_orders", stockStatus: "unverified", checkedAt: "2026-11-06", sourceIds: ["new"] } }),
  ], "2026-11-30");
  const first = run(before, after), second = run(before, after);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(first.changes.map((c) => [c.type, c.versionId]), [["price_changed", "a"], ["price_changed", "z"], ["price_changed", "k"], ["version_added", "n"]]);
  assert.deepEqual(validateAgainstSchema(first, schema), []);
  assert.deepEqual(Object.keys(first.counts), [...CHANGE_TYPES]);
});

test("the schema rejects an unknown change type, a missing source and a bad month", () => {
  const good = run(snap([version("a")], "2026-10-31"), snap([withFact(version("a"), "price_aud", price(9, { date: "2026-11-06", sourceIds: ["new"] }))], "2026-11-30"));
  assert.deepEqual(validateAgainstSchema(good, schema), []);
  const bad = structuredClone(good) as unknown as { changes: { type: string; sourceIds?: string[] }[]; month: string };
  bad.changes[0].type = "price_moved";
  assert.match(validateAgainstSchema(bad, schema).join("\n"), /price_moved/);
  delete bad.changes[0].sourceIds;
  bad.month = "2026-13";
  const errors = validateAgainstSchema(bad, schema).join("\n");
  assert.match(errors, /sourceIds/);
  assert.match(errors, /month/);
});

test("diff refuses a month label that is not YYYY-MM, and a change that cites an unrecorded source", () => {
  assert.throws(() => diffSnapshots(snap([], "2026-10-31"), snap([], "2026-11-30"), { month: "Nov 2026", beforeSha256: "", afterSha256: "" }), /YYYY-MM/);
  const after = snap([withFact(version("a"), "price_aud", price(9, { sourceIds: ["ghost"] }))], "2026-11-30");
  assert.throws(() => run(snap([version("a")], "2026-10-31"), after), /ghost/);
});

test("every committed data/changes/<month>.json is valid and is exactly what diff.ts makes from its recorded snapshots", () => {
  const files = fs.readdirSync("data/changes").filter((f) => /^\d{4}-\d{2}\.json$/.test(f));
  const snapshots = fs.existsSync("data/changes/snapshots")
    ? fs.readdirSync("data/changes/snapshots").filter((f) => f.endsWith(".json")).map((f) => {
        const bytes = fs.readFileSync(`data/changes/snapshots/${f}`);
        return { f, bytes, sha: crypto.createHash("sha256").update(bytes).digest("hex") };
      })
    : [];
  for (const file of files) {
    const body = JSON.parse(fs.readFileSync(`data/changes/${file}`, "utf8"));
    assert.deepEqual(validateAgainstSchema(body, schema), [], file);
    assert.equal(body.month, file.slice(0, 7));
    assert.equal(body.generator, "scripts/refresh/diff.ts");
    const before = snapshots.find((s) => s.sha === body.before.sha256);
    const after = snapshots.find((s) => s.sha === body.after.sha256);
    assert.ok(before && after, `${file}: its before/after snapshots are not committed in data/changes/snapshots`);
    const again = diffSnapshots(JSON.parse(before.bytes.toString()), JSON.parse(after.bytes.toString()), {
      month: body.month, beforeSha256: before.sha, afterSha256: after.sha,
    });
    assert.deepEqual(body, again, `${file} is not the output of diff.ts for its recorded snapshots`);
  }
});
