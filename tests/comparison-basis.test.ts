import { test } from "node:test";
import assert from "node:assert/strict";
import {
  basisOf,
  basisTag,
  compareBases,
  leaderIndex,
  likeForLikeDelta,
  numericValue,
  rankableIndices,
  sameBasis,
} from "../src/lib/comparison-basis";
import { compareFacts } from "../src/lib/compare";
import { defaultTrim } from "../src/lib/fleet";
import { publicCatalogue } from "../src/lib/data";
import { makeReport } from "../src/lib/citable";
import { publicPack } from "../src/lib/data";
import { isVerifiedFact } from "../src/lib/verification";
import type { Car, Fact } from "../src/lib/types";

const fact = (
  key: string,
  value: Fact["value"],
  text = "",
  extra = {},
): Fact => ({
  key,
  label: key,
  value,
  unit: key === "price_aud" ? "AUD" : key === "range_km" ? "km" : "",
  basis: text,
  comparisonBasis: text,
  status: "standard",
  sourceIds: [],
  date: "2026-10-05",
  market: "AU",
  scope: "",
  qualifications: [],
  issues: [],
  grade: "confirmed",
  ...extra,
});
const price = (value: number | null, text: string) =>
  fact("price_aud", value, text);
const range = (value: number | string | null, text: string) =>
  fact("range_km", value, text);

test("price bases: list, driveaway, incl. GST and delivery, tax unresolved", () => {
  const tag = (text: string) => basisTag(price(50_000, text));
  assert.equal(tag("List price before on-road costs"), "List");
  assert.equal(tag("Maker's list price · before on-road costs"), "List");
  assert.equal(tag("Manufacturer RRP excluding on-road costs"), "List");
  assert.equal(
    tag("Base price before A$1,400 delivery and on-road costs"),
    "List",
  );
  assert.equal(tag("Dealer-advertised driveaway"), "Driveaway");
  assert.equal(tag("National drive-away price"), "Driveaway");
  assert.equal(
    tag("Maker from-price including GST and dealer delivery"),
    "Incl. GST & delivery",
  );
  assert.equal(
    tag(
      "Visible version-card price; tax inclusion and on-road treatment unresolved",
    ),
    "Tax unresolved",
  );
  assert.equal(tag("something nobody explained"), "Basis unclear");
});
test("range bases: WLTP, ADR, NEDC, WLTC, and labels that name two cycles", () => {
  const tag = (text: string) => basisTag(range(400, text));
  assert.equal(tag("WLTP combined"), "WLTP");
  assert.equal(tag("Manufacturer-declared maximum WLTP range"), "WLTP");
  assert.equal(tag("WLTP laboratory test accepted under ADR81/02"), "WLTP");
  assert.equal(tag("ADR81/02 combined"), "ADR");
  assert.equal(tag("ADR 81/02"), "ADR");
  assert.equal(tag("NEDC combined"), "NEDC");
  assert.equal(tag("Manufacturer range using WLTC test procedure"), "WLTC");
  assert.equal(
    tag("Reported range; RedBook labels both ADR and WLTP"),
    "ADR/WLTP",
  );
  assert.equal(
    basisOf(range(400, "RedBook labels both ADR and WLTP"))!.determinate,
    false,
  );
  assert.equal(
    tag("Source-scoped catalogue observation; ranking promotion not approved"),
    "Cycle unclear",
  );
  assert.equal(tag("km"), "Cycle unclear");
});
test("battery bases: usable, gross, not stated, and contradictory labels", () => {
  const tag = (comparison: string, basis = comparison) =>
    basisTag(fact("battery_kwh", 60, basis, { comparisonBasis: comparison }));
  assert.equal(tag("Usable capacity"), "Usable");
  assert.equal(tag("Gross capacity"), "Gross");
  assert.equal(tag("Gross or usable not stated"), "Basis not stated");
  assert.equal(
    tag("Manufacturer figure; gross/usable not specified"),
    "Basis not stated",
  );
  assert.equal(tag("Net battery capacity"), "Usable");
  // The normalised label and the source text disagree: neither side is trusted.
  assert.equal(
    tag("Usable capacity", "Manufacturer nominal capacity, not usable"),
    "Basis not stated",
  );
  assert.equal(
    tag("Gross or usable not stated", "Net battery capacity"),
    "Basis not stated",
  );
  // Two figures that agree that nothing was stated share that (weak) basis.
  const a = basisOf(fact("battery_kwh", 60, "Gross or usable not stated"));
  assert.ok(sameBasis(a, a));
  assert.ok(!sameBasis(a, basisOf(fact("battery_kwh", 60, "Usable capacity"))));
});
test("DC windows are read from the text; text values keep their window but cannot be ranked", () => {
  const dc = (value: number | string | null, text: string) =>
    fact("dc_charge_time_min", value, text);
  assert.equal(basisTag(dc(24, "10–80% DC at 150 kW")), "10–80%");
  assert.equal(basisTag(dc(24, "30-80% SOC")), "30–80%");
  assert.equal(basisTag(dc(24, "0–80%")), "0–80%");
  assert.equal(basisTag(dc("<30 min", "10–80% state of charge")), "10–80%");
  assert.equal(numericValue(dc("<30 min", "10–80%")), undefined);
  assert.equal(
    basisTag(dc(24, "charge window not published")),
    "Window not stated",
  );
  const row = compareBases([dc(24, "10–80%"), dc(28, "30–80%")]);
  assert.equal(row.comparable, false);
  assert.match(row.note, /Not directly comparable: 10–80% vs 30–80%/);
  assert.equal(
    compareBases([dc(24, "10–80%"), dc(28, "10–80% at 350 kW")]).comparable,
    true,
  );
  // Unknown windows are never assumed equal.
  assert.equal(compareBases([dc(24, ""), dc(28, "")]).comparable, false);
});
test("untracked facts and missing values have no basis", () => {
  assert.equal(basisOf(fact("seats", 5, "Occupied seating positions")), null);
  assert.equal(basisOf(price(null, "Driveaway")), null);
  assert.equal(basisTag(undefined), undefined);
});
test("a row is flagged only when the figures present use different bases", () => {
  const same = compareBases([
    price(50_000, "List price"),
    price(60_000, "RRP before on-road costs"),
  ]);
  assert.deepEqual(
    [same.compared, same.comparable, same.note],
    [true, true, ""],
  );
  const mixed = compareBases([
    price(50_000, "List price"),
    price(60_000, "Driveaway"),
    price(70_000, "List price"),
  ]);
  assert.equal(mixed.comparable, false);
  assert.equal(mixed.note, "Not directly comparable: List vs Driveaway");
  assert.deepEqual(mixed.tags, ["List", "Driveaway"]);
  // A column with no figure takes no part.
  const one = compareBases([
    price(50_000, "Driveaway"),
    price(null, "List price"),
  ]);
  assert.deepEqual([one.compared, one.comparable], [false, true]);
  // The same unresolved basis twice is still not a comparison.
  const unresolved = compareBases([
    price(1, "tax inclusion unresolved"),
    price(2, "tax inclusion unresolved"),
  ]);
  assert.equal(unresolved.comparable, false);
  assert.match(unresolved.note, /could not be established/);
});
test("deltas and leaders use like-for-like figures only", () => {
  assert.equal(
    likeForLikeDelta(price(50_000, "List price"), price(54_000, "List price")),
    4_000,
  );
  assert.equal(
    likeForLikeDelta(price(50_000, "List price"), price(54_000, "Driveaway")),
    undefined,
  );
  assert.equal(
    likeForLikeDelta(range(400, "WLTP"), range(564, "NEDC")),
    undefined,
  );
  assert.equal(
    likeForLikeDelta(range(400, "WLTP"), range("up to 500", "WLTP")),
    undefined,
  );
  // The cheapest of a mixed set is the cheapest on the shared basis, never a driveaway price.
  const set = [
    price(61_000, "List price"),
    price(49_990, "Driveaway"),
    price(57_000, "List price"),
    price(58_000, "List price"),
  ];
  assert.deepEqual(rankableIndices(set), [0, 2, 3]);
  assert.equal(leaderIndex(set, "min"), 2);
  assert.equal(leaderIndex(set, "max"), 0);
  // Two figures on different bases have no leader at all.
  assert.equal(
    leaderIndex([price(1, "List price"), price(2, "Driveaway")], "min"),
    -1,
  );
  // A tie has no single leader.
  assert.equal(
    leaderIndex([price(1, "List price"), price(1, "List price")], "min"),
    -1,
  );
  // The preferred basis breaks a tie between equally common groups.
  assert.deepEqual(
    rankableIndices([price(1, "Driveaway"), price(2, "List price")]),
    [1],
  );
});
test("compareFacts defers to the basis helper for the four tracked measurements", () => {
  assert.equal(
    compareFacts(range(400, "WLTP"), range(420, "WLTP combined")).delta,
    20,
  );
  const mixed = compareFacts(range(400, "WLTP"), range(564, "NEDC"));
  assert.equal(mixed.state, "different_basis");
  assert.equal(mixed.delta, undefined);
  assert.match(mixed.reason, /WLTP vs NEDC/);
  assert.equal(
    compareFacts(price(1, "Driveaway"), price(2, "List price")).state,
    "different_basis",
  );
});
test("defaultTrim ranks prices on the family's shared basis", () => {
  const trim = (
    id: string,
    value: number,
    text: string,
    extra: Partial<Car> = {},
  ) =>
    ({
      id,
      availability: "current_or_order_listed",
      facts: { price_aud: price(value, text) },
      ...extra,
    }) as unknown as Car;
  const group = [
    trim("list-dear", 60_000, "List price before on-road costs"),
    trim("drive-cheap", 52_000, "Driveaway price"),
    trim("list-cheap", 55_000, "List price before on-road costs"),
  ];
  assert.equal(defaultTrim(group).id, "list-cheap");
  // With nothing else to go on, a single driveaway price is still a trim.
  assert.equal(defaultTrim([group[1]]).id, "drive-cheap");
});

test("the data: Inster mixes list and driveaway, the EQB is NEDC, 28 driveaway prices are visible", () => {
  const cars = publicCatalogue();
  const visible = (c: Car, key: string) =>
    c.facts[key] && isVerifiedFact(c.facts[key]) ? c.facts[key] : undefined;
  const tags = (family: string, key: string) =>
    new Set(
      cars
        .filter((c) => c.family === family)
        .flatMap((c) => basisTag(visible(c, key)) ?? []),
    );
  assert.deepEqual([...tags("hyundai-inster-current", "price_aud")].sort(), [
    "Driveaway",
    "List",
  ]);
  assert.ok(tags("ford-mustang-mach-e", "price_aud").size > 1);
  const eqb = cars.find((c) => c.id.startsWith("mercedes_benz_eqb"))!;
  assert.equal(eqb.facts.range_km.value, 564);
  assert.equal(basisTag(eqb.facts.range_km), "NEDC");
  const driveaway = cars.filter(
    (c) => basisTag(visible(c, "price_aud")) === "Driveaway",
  );
  assert.equal(driveaway.length, 28);
  // Every visible price, range, battery and charge time has a classified basis.
  for (const c of cars)
    for (const key of [
      "price_aud",
      "range_km",
      "battery_kwh",
      "dc_charge_time_min",
    ]) {
      const f = visible(c, key);
      if (f) assert.ok(basisOf(f)!.tag, `${c.id} ${key}`);
    }
});
test("a pair report names each figure's basis and says when a row mixes bases", () => {
  const cars = publicCatalogue();
  const eqb = cars.find((c) => c.id.startsWith("mercedes_benz_eqb"))!;
  const report = makeReport(
    ["tesla_model_y__premium_rwd__2", eqb.id].map(publicPack),
    "/compare",
  );
  const rangeRow = report.comparisons.find((c) => c.key === "range_km")!;
  assert.equal(rangeRow.comparable, false);
  assert.deepEqual(
    rangeRow.bases.map((b) => b.tag),
    ["WLTP", "NEDC"],
  );
  const claim = report.keyFacts.find(
    (f) => f.key === "range_km" && f.carId === eqb.id,
  )!;
  assert.equal(claim.basisTag, "NEDC");
  assert.match(claim.sentence, /\(NEDC\)/);
  assert.match(report.summary, /not directly comparable/i);
});
