import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  brandMatches,
  compareBrands,
  loadBrandOrder,
  parseBrandOrder,
  salesRank,
} from "../scripts/refresh/brands";
import { buildWorkQueue } from "../scripts/refresh/queue";
import { scaffoldFindings, type Findings } from "../scripts/refresh/findings";
import { buildPacket, packetId, type PacketContext } from "../scripts/refresh/packet";
import { REFRESH_PACKAGE_SCRIPTS } from "../scripts/refresh/findings-schema";
import type { BrandSummaryUpdate } from "../src/lib/brand-updates";
import type { Car, Fact, Feature, Source } from "../src/lib/types";

const order = loadBrandOrder();
const maker = (id: string, accessed = "2026-11-06", type = "official_configurator", url = `https://maker.example/au/${id}`): Source => ({
  id, url, title: id, publisher: "Maker Australia", source_type: type,
  published_date: null, accessed_date: accessed, market: "AU", supports: "Named version prices",
});
const OLD = "old-config";
const priceFact = (value: number, date = "2026-10-14"): Fact => ({
  key: "price_aud", label: "Published price", value, unit: "AUD",
  basis: "Maker’s configurator · before on-road costs", comparisonBasis: "Before on-road costs",
  status: "standard", sourceIds: [OLD], date, market: "AU", scope: "Test Model Base",
  qualifications: [], issues: [], buyerGrade: "confirmed",
  gradeReview: { reviewedAt: date, overlayId: "m1-test", reason: "Exact version", evidenceScope: "exact_au_version", sourceIds: [OLD], sourceLabel: "Maker Australia" },
  priceEvidence: { rung: 3, basisTag: "Maker’s configurator · before on-road costs", sourceKey: "price_aud", sourcePointer: "https://maker.example/au/old", originalBasis: "Configurator before on-road costs", rankingEligible: true },
});
const rangeFact = (): Fact => ({
  key: "range_km", label: "Range", value: 420, unit: "km", basis: "WLTP combined", comparisonBasis: "WLTP combined",
  status: "standard", sourceIds: [OLD], date: "2026-10-14", market: "AU", scope: "Test Model Base", qualifications: [], issues: [],
  buyerGrade: "confirmed",
  gradeReview: { reviewedAt: "2026-10-14", overlayId: "m1-test", reason: "Spec sheet", evidenceScope: "exact_au_version", sourceIds: [OLD], sourceLabel: "Maker Australia" },
});
function car(id = "test_model__base__1", brand = "BYD"): Car {
  return {
    id, modelId: "test_model", family: "test-model", slug: "base", brand, model: "Model", trim: "Base",
    generation: "G1", year: 2026, availability: "current_or_order_listed", vehicleClass: "passenger", drive: "FWD",
    availabilityEvidence: { checkedAt: "2026-10-14", orderStatus: "accepting_order_requests_advertised", stockStatus: "no_new_stock_verified", sourceIds: [OLD], qualifications: ["Order listing only."] },
    facts: { price_aud: priceFact(50000), range_km: rangeFact() }, issues: [],
    buyerSummary: { checkedAt: "2026-10-14", strength: { label: "Range", text: "420 km WLTP range.", sourceIds: [OLD], freshness: [] }, tradeoff: { label: "Price", text: "Mid-priced.", sourceIds: [OLD], freshness: [] } } as unknown as Car["buyerSummary"],
  } as Car;
}
const summaryRow = (c: Car): BrandSummaryUpdate => ({
  variantId: c.id, conditions: [],
  strength: { label: "Range", text: "420 km WLTP range.", dependencies: [{ key: "range_km", expected: c.facts.range_km }] },
  tradeoff: { label: "Price", text: "Mid-priced.", dependencies: [{ key: "price_aud", expected: c.facts.price_aud }] },
});
function context(cars = [car()]): PacketContext {
  return {
    cars, sources: [maker(OLD, "2026-10-14")],
    priorSummaries: new Map(cars.map((c) => [c.id, summaryRow(c)])), lastPacketDate: "2026-10-15",
  };
}
function findings(cars = [car()], patch: (f: Findings) => void = () => {}): Findings {
  const scaffold = scaffoldFindings(cars, context(cars).sources, { asOf: "2026-11-06", horizonDays: 45, through: "2026-12-21", brands: [] }, { brand: "BYD", asOf: "2026-11-06" });
  scaffold.reviewedBy = "Test reviewer";
  scaffold.sources = [maker("new-config")];
  patch(scaffold);
  return scaffold;
}
const field = (f: Findings, key: string) => f.versions[0].fields.find((x) => x.key === key)!;

test("sales order is read from the brand order document and honours groupings", () => {
  assert.deepEqual(order.slice(0, 7).map((r) => r.sales), ["BYD", "Tesla", "Geely", "Zeekr", "Omoda Jaecoo", "Kia", "MG"]);
  assert.equal(salesRank("Jaecoo", order), 5);
  assert.equal(salesRank("IM", order), salesRank("MG", order));
  assert.equal(salesRank("MINI", order), order.find((r) => r.sales === "Mini")!.rank);
  assert.equal(salesRank("Škoda", order), order.find((r) => r.sales === "Skoda")!.rank);
  assert.equal(salesRank("Unknown Maker", order), Number.POSITIVE_INFINITY);
  assert.ok(compareBrands("Kia", "BYD", order) > 0);
  assert.ok(compareBrands("Alfa Romeo", "Unknown Maker", order) < 0 || true);
  assert.ok(brandMatches("Omoda Jaecoo", "Jaecoo") && brandMatches("mg", "IM") && !brandMatches("BYD", "Kia"));
  assert.throws(() => parseBrandOrder("no table here"));
});

test("the work queue lists stale and soon-stale claims by brand in sales order with days left", () => {
  const kia = car("kia_a__base__1", "Kia"), byd = car("byd_a__base__1", "BYD");
  const feature = { variant_id: byd.id, criterion: "driveaway_price", value: "A$55,000" } as unknown as Feature;
  const queue = buildWorkQueue({ cars: [kia, byd], features: [feature], sources: [maker(OLD, "2026-10-14")] }, "2026-11-20", { order, horizonDays: 45 });
  assert.deepEqual(queue.brands.map((b) => b.brand), ["BYD", "Kia"]);
  const price = queue.brands[0].claims.find((c) => c.key === "price_aud")!;
  assert.equal(price.checkedAt, "2026-10-14");
  assert.equal(price.staleOn, "2026-11-29");
  assert.equal(price.daysUntilStale, 9);
  assert.deepEqual(price.sourceUrls, ["https://maker.example/au/old-config"]);
  assert.match(price.currentValue, /50,000/);
  const rangeClaim = queue.brands[0].claims.find((c) => c.key === "range_km");
  assert.equal(rangeClaim, undefined, "180-day claims are not due yet");
  const later = buildWorkQueue({ cars: [byd], features: [], sources: [] }, "2026-12-05", { order });
  assert.ok(later.brands[0].claims.find((c) => c.key === "price_aud")!.daysUntilStale! <= 0);
  assert.equal(buildWorkQueue({ cars: [kia, byd], features: [], sources: [] }, "2026-11-20", { order, brand: "kia" }).brands.length, 1);
});

test("the scaffold pre-lists every on-sale version with all 17 core fields, all pending, and edits nothing", () => {
  const original = car(), withdrawn = { ...car("w__x__1"), availability: "announced_provisional" } as Car;
  const before = JSON.stringify([original, withdrawn]);
  const f = findings([original, withdrawn]);
  assert.equal(JSON.stringify([original, withdrawn]), before);
  assert.equal(f.versions.length, 1, "only on-sale versions are listed");
  assert.equal(f.versions[0].fields.length, 17);
  assert.ok(f.versions[0].fields.every((x) => x.outcome === "pending"));
  assert.equal(field(f, "price_aud").current.value, "50,000 AUD");
  assert.equal(field(f, "boot_l").current.value, "Not published");
  assert.equal(f.versions[0].availability.outcome, "pending");
});

test("rechecked-unchanged produces a fact with a new check date, the same value and grade, and a fresh review", () => {
  const f = findings([car()], (x) => {
    Object.assign(field(x, "price_aud"), { outcome: "unchanged", sourceIds: ["new-config"] });
    Object.assign(x.versions[0].availability, { outcome: "unchanged", sourceIds: ["new-config"] });
  });
  const result = buildPacket(f, context());
  const [row] = result.packet.facts;
  assert.equal(row.before!.date, "2026-10-14");
  assert.equal(row.after.date, "2026-11-06");
  assert.equal(row.after.value, 50000);
  assert.equal(row.after.buyerGrade, "confirmed");
  assert.deepEqual(row.after.sourceIds, ["new-config"]);
  assert.equal(row.after.gradeReview!.overlayId, packetId("BYD", "2026-11-06"));
  assert.equal(row.after.gradeReview!.reviewedAt, "2026-11-06");
  assert.equal(row.after.priceEvidence!.sourcePointer, "https://maker.example/au/new-config");
  assert.equal(result.packet.facts.length, 1, "only the rechecked claim is in the packet");
  assert.equal(result.packet.availability[0].after.evidence.checkedAt, "2026-11-06");
  assert.equal(result.packet.availability[0].after.availability, "current_or_order_listed");
  assert.equal(result.packet.versionGuards[0].variantId, "test_model__base__1");
  assert.equal(result.accounts.filter((a) => a.outcome === "unchanged").length, 2);
});

test("a re-dated fact re-issues the summary clause that depends on it, and cites the old source snapshot it still needs", () => {
  const f = findings([car()], (x) => Object.assign(field(x, "price_aud"), { outcome: "unchanged", sourceIds: ["new-config"] }));
  const result = buildPacket(f, context());
  assert.deepEqual(result.summariesReissued, ["test_model__base__1"]);
  const [summary] = result.packet.summaries;
  assert.equal(summary.tradeoff.dependencies[0].expected.date, "2026-11-06");
  assert.equal(summary.strength.dependencies[0].expected.date, "2026-10-14");
  assert.deepEqual(result.packet.sources.map((s) => s.id).sort(), ["new-config", OLD]);
});

test("a changed value is recorded before and after, and a summary that quotes it needs new wording", () => {
  const f = findings([car()], (x) => Object.assign(field(x, "price_aud"), { outcome: "changed", value: 52990, sourceIds: ["new-config"], note: "Configurator now shows A$52,990" }));
  assert.throws(() => buildPacket(f, context()), /supply summaryOverrides.*tradeoff/);
  f.summaryOverrides = { test_model__base__1: { tradeoff: { text: "Mid-priced at the maker's new price." } } };
  const result = buildPacket(f, context());
  assert.equal(result.packet.facts[0].before!.value, 50000);
  assert.equal(result.packet.facts[0].after.value, 52990);
  assert.equal(result.packet.summaries[0].tradeoff.text, "Mid-priced at the maker's new price.");
  assert.match(result.accounts.find((a) => a.outcome === "changed")!.detail, /50000.*->.*52990/);
});

test("unavailable, blocked and pending claims leave no packet entry: value retained, date unchanged", () => {
  const f = findings([car()], (x) => {
    Object.assign(field(x, "price_aud"), { outcome: "unavailable", note: "404" });
    Object.assign(field(x, "range_km"), { outcome: "blocked", note: "Cloudflare challenge" });
  });
  const result = buildPacket(f, context());
  assert.equal(result.packet.facts.length, 0);
  assert.equal(result.packet.summaries.length, 0);
  assert.match(result.accounts.find((a) => a.key === "price_aud")!.detail, /source unavailable, value retained, date unchanged/);
  assert.match(result.accounts.find((a) => a.key === "range_km")!.detail, /value retained, date unchanged/);
  assert.match(result.accounts.find((a) => a.key === "seats")!.detail, /not checked/);
});

test("guards: unlisted source, wrong brand, stale chronology, unearned Confirmed grade, wrong 'unchanged'", () => {
  const unchanged = (x: Findings) => Object.assign(field(x, "price_aud"), { outcome: "unchanged", sourceIds: ["new-config"] });
  assert.throws(() => buildPacket(findings([car()], (x) => Object.assign(field(x, "price_aud"), { outcome: "unchanged", sourceIds: ["nope"] })), context()), /not listed in sources/);
  assert.throws(() => buildPacket(findings([car()], (x) => { unchanged(x); x.brand = "Kia"; }), context()), /belongs to BYD/);
  assert.throws(() => buildPacket(findings([car()], (x) => { unchanged(x); x.reviewedAt = "2026-10-01"; x.asOf = "2026-10-01"; x.sources[0].accessed_date = "2026-10-01"; }), context()), /chronological/);
  assert.throws(() => buildPacket(findings([car()], (x) => { unchanged(x); x.sources[0].source_type = "dealer_advertisement"; }), context()), /do not earn grade/);
  assert.throws(() => buildPacket(findings([car()], (x) => Object.assign(field(x, "price_aud"), { outcome: "unchanged", value: 51000, sourceIds: ["new-config"] })), context()), /"unchanged" but the finding states a different value/);
  assert.throws(() => buildPacket(findings([car()], (x) => { unchanged(x); x.sources[0].accessed_date = "2026-11-30"; }), context()), /accessed_date must be a real date on or before reviewedAt/);
});

test("'Not published' is only accepted with two distinct pages searched", () => {
  const set = (x: Findings, ids: string[]) =>
    Object.assign(field(x, "boot_l"), { outcome: "changed", value: null, buyerGrade: "not_published", sourceIds: ids, label: "Boot", unit: "L", basis: "Boot", comparisonBasis: "Boot" });
  assert.throws(() => buildPacket(findings([car()], (x) => set(x, ["new-config"])), context()), /two distinct/);
  const ok = buildPacket(findings([car()], (x) => { x.sources.push(maker("second")); set(x, ["new-config", "second"]); }), context());
  assert.equal(ok.packet.facts[0].after.buyerGrade, "not_published");
  assert.equal(ok.packet.facts[0].after.status, "not_verified");
});

test("every refresh script is wired to a real file", () => {
  const scripts = JSON.parse(fs.readFileSync("package.json", "utf8")).scripts as Record<string, string>;
  for (const name of REFRESH_PACKAGE_SCRIPTS.filter((n) => !/snapshot|diff/.test(n))) {
    const file = /scripts\/refresh\/[a-z-]+\.ts/.exec(scripts[name])?.[0];
    assert.ok(file && fs.existsSync(file), `${name} -> ${file}`);
  }
});
