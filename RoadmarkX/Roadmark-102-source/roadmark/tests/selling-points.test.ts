import test from "node:test";
import assert from "node:assert/strict";
import { catalogue, research, pack, effectiveFeatures } from "../src/lib/data";
import { buyerProposalBeforeCheckpoint91 } from "./helpers/checkpoint91-history";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
  type SellingPointProposal,
} from "../src/lib/selling-points";
const policy = { asOf: "2026-10-10", maxAgeDays: 30 };
const input: SellingPointProposal = buyerProposalBeforeCheckpoint91();
const seal = "byd_seal__premium_rwd__20261010";
const perf = "byd_seal__performance_awd__20261010";
const dataSnapshot = research();
const catalogueSnapshot = catalogue();
const featureSnapshot = catalogueSnapshot.flatMap((car) =>
  effectiveFeatures(car, dataSnapshot),
);
function fixture() {
  return {
    cars: structuredClone(catalogueSnapshot),
    features: structuredClone(featureSnapshot),
    sources: structuredClone(dataSnapshot.sources),
  };
}
test("all 328 eligible buyer reasons at the original policy date have matching dependencies", () => {
  const { cars, features, sources } = fixture();
  const result = buildBuyerSummaries(cars, features, sources, input, policy);
  assert.equal(result.size, 328);
  assert.equal(
    [...result.values()].filter((s) => s.strength && s.tradeoff).length,
    327,
  );
  for (const [id, s] of result) {
    const ids = new Set(
      pack(id, { data: dataSnapshot, cars: catalogueSnapshot }).sources.map(
        (s) => s.id,
      ),
    );
    assert.ok(
      [
        ...(s.strength?.sourceIds || []),
        ...(s.tradeoff?.sourceIds || []),
      ].every((id) => ids.has(id)),
    );
  }
});
test("a corrected related-trim fact suppresses stale editorial arithmetic without hiding independent copy", () => {
  const { cars, features, sources } = fixture();
  cars.find((c) => c.id === seal)!.facts.range_km.value = 600;
  const result = buildBuyerSummaries(cars, features, sources, input, policy);
  assert.equal(result.get(seal)?.strength, undefined);
  assert.equal(result.get(perf)?.tradeoff, undefined);
  assert.ok(result.get(perf)?.strength);
});
test("changed conditions, equipment and model year fail closed", () => {
  const { cars, features, sources } = fixture();
  cars
    .find((c) => c.id === seal)!
    .facts.range_km.qualifications.push("New limitation");
  let result = buildBuyerSummaries(cars, features, sources, input, policy);
  assert.equal(result.get(seal)?.strength, undefined);
  const p = cars.find((c) => c.id === perf)!;
  p.year = 2027;
  result = buildBuyerSummaries(cars, features, sources, input, policy);
  assert.equal(result.has(perf), false);
  const dolphin = "byd_dolphin__premium_fwd__20261010";
  features.find(
    (f) => f.variant_id === dolphin && f.criterion === "front_heated_seats",
  )!.status = "not_verified";
  result = buildBuyerSummaries(cars, features, sources, input, policy);
  assert.equal(result.get(dolphin)?.strength, undefined);
});
test("expired evidence, source holds and removed availability suppress buyer summaries", () => {
  const { cars, features, sources } = fixture();
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, {
      ...policy,
      asOf: "2026-11-11",
    }).size,
    0,
  );
  const summary = cars.find((c) => c.id === seal)!.buyerSummary!;
  const held = sources.map((s) =>
    summary.strength!.sourceIds.includes(s.id)
      ? { ...s, publication_hold: true }
      : s,
  );
  assert.equal(currentBuyerSummary(summary, held, policy)?.strength, undefined);
  cars.find((c) => c.id === seal)!.availability = "announced_provisional";
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(seal),
    false,
  );
});

test("summary guards and details use identical final equipment including legacy overlays", () => {
  const cars = catalogue();
  for (const id of ["tesla_model_y__premium_long_range_awd__1", seal]) {
    const car = cars.find((c) => c.id === id);
    assert.ok(car);
    assert.deepEqual(effectiveFeatures(car), pack(car.id).features);
  }
});

test("older-model-year summaries require an explicit scope and fresh, source-backed NEW stock", () => {
  const { cars, features, sources } = fixture();
  const id = "subaru_trailseeker_my26__awd__20261010";
  const car = cars.find((c) => c.id === id)!;
  assert.ok(
    buildBuyerSummaries(cars, features, sources, input, policy).get(id)
      ?.strength,
  );
  const noOptIn = structuredClone(input);
  delete noOptIn.records.find((r) => r.variantId === id)!.availabilityScope;
  assert.equal(
    buildBuyerSummaries(cars, features, sources, noOptIn, policy).has(id),
    false,
  );
  car.availabilityEvidence!.stockStatus = "unverified";
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(id),
    false,
  );
  car.availabilityEvidence!.stockStatus = "new_stock_listed";
  car.availabilityEvidence!.checkedAt = "2026-08-01";
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(id),
    false,
  );
  car.availabilityEvidence!.checkedAt = "2026-10-10";
  car.availabilityEvidence!.sourceIds = [];
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(id),
    false,
  );
});

test("fact scope, market and comparison-basis changes suppress stale buyer copy", () => {
  for (const key of ["scope", "market", "comparisonBasis"] as const) {
    const { cars, features, sources } = fixture();
    cars.find((c) => c.id === seal)!.facts.range_km[key] = "changed scope";
    const result = buildBuyerSummaries(cars, features, sources, input, policy);
    assert.equal(result.get(seal)?.strength, undefined, key);
  }
});

test("optional exact identity, availability and source snapshots suppress changed context", () => {
  const { cars, features, sources } = fixture();
  const guarded = structuredClone(input);
  guarded.records = guarded.records.filter((r) => r.variantId === seal);
  const car = cars.find((c) => c.id === seal)!;
  const record = guarded.records[0];
  record.expectedIdentity = {
    id: car.id,
    trim: car.trim,
    generation: car.generation,
    year: car.year,
  };
  record.expectedAvailabilityEvidence = structuredClone(
    car.availabilityEvidence,
  );
  record.availabilityGuardSourceIds = [...car.availabilityEvidence!.sourceIds];
  guarded.expectedSourceSnapshots = structuredClone(sources);
  const run = () =>
    buildBuyerSummaries(cars, features, sources, guarded, policy).has(seal);
  assert.equal(run(), true);
  const trim = car.trim;
  car.trim += " changed";
  assert.equal(run(), false);
  car.trim = trim;
  const stock = car.availabilityEvidence!.stockStatus;
  car.availabilityEvidence!.stockStatus = "changed";
  assert.equal(run(), false);
  car.availabilityEvidence!.stockStatus = stock;
  const source = sources.find(
    (s) => s.id === record.availabilityGuardSourceIds![0],
  )!;
  const cached = buildBuyerSummaries(
    cars,
    features,
    sources,
    guarded,
    policy,
  ).get(seal)!;
  const url = source.url;
  source.url = "https://example.com/different-evidence";
  assert.equal(run(), false);
  assert.equal(currentBuyerSummary(cached, sources, policy), undefined);
  source.url = url;
  assert.equal(run(), true);
});

test("related vehicle identity and availability guards fail closed independently of numeric facts", () => {
  const { cars, features, sources } = fixture();
  const guarded = structuredClone(input);
  guarded.records = guarded.records.filter((r) => r.variantId === perf);
  const partner = cars.find((c) => c.id === seal)!;
  const record = guarded.records[0];
  record.expectedRelatedIdentities = {
    [seal]: { id: seal, trim: partner.trim, generation: partner.generation },
  };
  record.expectedRelatedAvailabilityEvidence = {
    [seal]: structuredClone(partner.availabilityEvidence),
  };
  const run = () =>
    buildBuyerSummaries(cars, features, sources, guarded, policy).has(perf);
  assert.equal(run(), true);
  const generation = partner.generation;
  partner.generation = "new generation";
  assert.equal(run(), false);
  partner.generation = generation;
  partner.availabilityEvidence!.checkedAt = "2026-09-01";
  assert.equal(run(), false);
});

test("whole-fact guards detect still-fresh dates, labels and source membership changes", () => {
  const { cars, features, sources } = fixture();
  const guarded = structuredClone(input);
  guarded.records = guarded.records.filter((r) => r.variantId === seal);
  const record = guarded.records[0];
  const dep = guarded.dependencies.find(
    (d) => record.strength.dependencyIds.includes(d.id) && d.kind === "fact",
  )!;
  const fact = cars.find((c) => c.id === dep.variantId)!.facts[dep.key];
  dep.expectedEffectiveFact = structuredClone(fact);
  const run = () =>
    buildBuyerSummaries(cars, features, sources, guarded, policy).get(seal)
      ?.strength;
  assert.ok(run());
  const date = fact.date;
  fact.date = date === "2026-10-09" ? "2026-10-08" : "2026-10-09";
  assert.equal(run(), undefined);
  fact.date = date;
  const label = fact.label;
  fact.label += " changed";
  assert.equal(run(), undefined);
  fact.label = label;
  fact.sourceIds.push(sources.find((s) => !fact.sourceIds.includes(s.id))!.id);
  assert.equal(run(), undefined);
});

test("scooter copy holds source-less unknowns and optional-pack context closed", () => {
  const { cars, features, sources } = fixture();
  const id = "segway_e300se_au__20261010";
  assert.ok(
    buildBuyerSummaries(cars, features, sources, input, policy).get(id)
      ?.strength,
  );
  const car = cars.find((car) => car.id === id)!;
  car.facts.charger_included_count.value = 1;
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(id),
    false,
  );
  const second = fixture();
  second.cars.find(
    (car) => car.id === id,
  )!.facts.under_seat_storage_optional_pack_l.value = 34;
  assert.equal(
    buildBuyerSummaries(
      second.cars,
      second.features,
      second.sources,
      input,
      policy,
    ).has(id),
    false,
  );
});

test("scooter source metadata and advertised availability guard exact buyer pairs", () => {
  const { cars, features, sources } = fixture();
  const id = "zeeho_ae4_au__20261010";
  assert.ok(
    buildBuyerSummaries(cars, features, sources, input, policy).get(id)
      ?.tradeoff,
  );
  cars.find((car) => car.id === id)!.availabilityEvidence!.stockStatus =
    "unverified";
  assert.equal(
    buildBuyerSummaries(cars, features, sources, input, policy).has(id),
    false,
  );
  const second = fixture();
  second.sources.find(
    (source) => source.id === "r10_scooter_zeeho_ae4_pdf",
  )!.url += "?changed-evidence";
  assert.equal(
    buildBuyerSummaries(
      second.cars,
      second.features,
      second.sources,
      input,
      policy,
    ).has(id),
    false,
  );
});

test("commercial copy fails closed when held MY, warranty or towball uncertainty changes", () => {
  for (const [id, key, value] of [
    [
      "kia_pv5_cargo_s_4dr_long_range_my26__20261010",
      "battery_warranty_confirmed_years",
      8,
    ],
    ["kgm_musso_ev_my26_awd__20261010", "towball_download", 230],
    ["hyundai_staria_load_electric_84_fwd_liftback__20261010", "seats", 2],
  ] as const) {
    const f = fixture();
    assert.ok(
      buildBuyerSummaries(f.cars, f.features, f.sources, input, policy).has(id),
    );
    f.cars.find((c) => c.id === id)!.facts[key].value = value;
    assert.equal(
      buildBuyerSummaries(f.cars, f.features, f.sources, input, policy).has(id),
      false,
    );
  }
});
test("commercial copy requires exact accepted sources and configuration availability", () => {
  const id = "farizon_v7e_standard_range_50kwh__20261010";
  const f = fixture();
  assert.ok(
    buildBuyerSummaries(f.cars, f.features, f.sources, input, policy).has(id),
  );
  f.sources.find((s) => s.id === "r10_uv_farizon_bartons_sr_540814")!.url +=
    "?changed-snapshot";
  assert.equal(
    buildBuyerSummaries(f.cars, f.features, f.sources, input, policy).has(id),
    false,
  );
  const next = fixture();
  next.cars.find((c) => c.id === id)!.availabilityEvidence!.stockStatus =
    "unverified";
  assert.equal(
    buildBuyerSummaries(
      next.cars,
      next.features,
      next.sources,
      input,
      policy,
    ).has(id),
    false,
  );
});

test("missing or malformed effective fact containers suppress copy without crashing", () => {
  for (const field of ["issues", "sourceIds", "qualifications"] as const) {
    for (const replacement of [undefined, null, "malformed"]) {
      const { cars, features, sources } = fixture();
      const fact = cars.find((c) => c.id === seal)!.facts.range_km;
      const untrusted = fact as unknown as Record<string, unknown>;
      if (replacement === undefined) delete untrusted[field];
      else untrusted[field] = replacement;
      const result = buildBuyerSummaries(
        cars,
        features,
        sources,
        input,
        policy,
      );
      assert.equal(
        result.get(seal)?.strength,
        undefined,
        `${field}: ${replacement}`,
      );
    }
  }
  for (const replacement of [undefined, null, {}]) {
    const { cars, features, sources } = fixture();
    const car = cars.find((c) => c.id === seal)!;
    const untrusted = car as unknown as Record<string, unknown>;
    if (replacement === undefined) delete untrusted.facts;
    else untrusted.facts = replacement;
    const result = buildBuyerSummaries(cars, features, sources, input, policy);
    assert.equal(result.get(seal)?.strength, undefined);
  }
});

test("cached buyer clauses expire independently even within the evidence-age window", () => {
  const cached = structuredClone(
    catalogueSnapshot.find((c) => c.id === seal)!.buyerSummary!,
  );
  cached.strength!.validUntil = "2026-10-12";
  assert.ok(
    currentBuyerSummary(cached, dataSnapshot.sources, {
      asOf: "2026-10-12",
      maxAgeDays: 30,
    })?.strength,
  );
  const after = currentBuyerSummary(cached, dataSnapshot.sources, {
    asOf: "2026-10-13",
    maxAgeDays: 30,
  });
  assert.equal(after?.strength, undefined);
  assert.deepEqual(after?.tradeoff, cached.tradeoff);
  cached.tradeoff!.validUntil = "2026-10-12";
  assert.equal(
    currentBuyerSummary(cached, dataSnapshot.sources, {
      asOf: "2026-10-13",
      maxAgeDays: 30,
    }),
    undefined,
  );
  for (const deadline of ["", "2026-02-30", "invalid", null, 42]) {
    const malformed = structuredClone(cached);
    Object.assign(malformed.strength!, { validUntil: deadline });
    delete malformed.tradeoff;
    assert.equal(
      currentBuyerSummary(malformed, dataSnapshot.sources, policy),
      undefined,
      String(deadline),
    );
  }
});

test("buyer clause projection carries the earliest consumed fact deadline into cached rendering", () => {
  const { cars, features, sources } = fixture();
  const local = structuredClone(input);
  const record = local.records.find((r) => r.variantId === perf)!;
  const deps = record.strength.dependencyIds
    .map((id) => local.dependencies.find((d) => d.id === id)!)
    .filter((d) => d.kind === "fact");
  assert.ok(deps.length >= 2);
  for (const [i, dep] of deps.slice(0, 2).entries()) {
    const fact = cars.find((c) => c.id === dep.variantId)!.facts[dep.key];
    fact.validUntil = i === 0 ? "2026-10-14" : "2026-10-12";
    if (dep.expectedEffectiveFact)
      dep.expectedEffectiveFact = structuredClone(fact);
  }
  const summaries = buildBuyerSummaries(cars, features, sources, local, policy);
  const cached = summaries.get(perf);
  assert.ok(cached?.strength);
  assert.equal(cached.strength.validUntil, "2026-10-12");
  assert.equal(
    currentBuyerSummary(cached, sources, { asOf: "2026-10-13", maxAgeDays: 30 })
      ?.strength,
    undefined,
  );
});

test("fact-backed model-year dependency expiry survives cached projection on both clauses", () => {
  const { cars, features, sources } = fixture();
  const local = structuredClone(input);
  const record = local.records.find((r) => r.variantId === perf)!;
  const template = local.dependencies.find(
    (d) => d.variantId === perf && d.key === "zero_to_100_s",
  )!;
  const car = cars.find((c) => c.id === perf)!;
  const fact = {
    ...structuredClone(car.facts.zero_to_100_s),
    key: "test_model_year_deadline",
    value: 2026,
    validUntil: "2026-10-12",
  };
  car.facts[fact.key] = fact;
  const dep = {
    ...structuredClone(template),
    id: "test_year_deadline",
    key: fact.key,
    expectedValue: 2026,
    expectedEffectiveFact: structuredClone(fact),
  };
  local.dependencies.push(dep);
  record.modelYearDependency = dep.id;
  const cached = buildBuyerSummaries(
    cars,
    features,
    sources,
    local,
    policy,
  ).get(perf)!;
  assert.equal(cached.strength?.validUntil, "2026-10-12");
  assert.equal(cached.tradeoff?.validUntil, "2026-10-12");
  assert.equal(
    currentBuyerSummary(cached, sources, {
      asOf: "2026-10-13",
      maxAgeDays: 30,
    }),
    undefined,
  );
  assert.equal(
    buildBuyerSummaries(cars, features, sources, local, {
      asOf: "2026-10-13",
      maxAgeDays: 30,
    }).has(perf),
    false,
  );
});
