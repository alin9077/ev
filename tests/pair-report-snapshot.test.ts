import test from "node:test";
import assert from "node:assert/strict";
import { compiledSource } from "./helpers/compiled-source";
import type { Car, Pack, Research } from "../src/lib/types";

type Snapshot = { data: Research; cars: Car[] };
type Report = { packs: Pack[]; path: string };
type PairModule = {
  pairPages: { slug: string; rival: string }[];
  pairReport: (slug: string, snapshot?: Snapshot) => Report | undefined;
};
function pairModule(pack: (id: string, snapshot?: Snapshot) => Pack) {
  return compiledSource("src/lib/pair-pages.ts", {
    "./data": {
      pack,
      catalogue: () => {
        throw new Error("pairReport must not load a separate catalogue");
      },
    },
    "./config": { BASELINE: "baseline" },
    "./citable": {
      makeReport: (packs: Pack[], path: string): Report => ({ packs, path }),
    },
  }) as PairModule;
}

test("pairReport forwards the same caller snapshot to both exact packs without mutation", () => {
  const snapshot = {
    data: Object.freeze({ metadata: Object.freeze({ as_of: "fixture" }) }),
    cars: Object.freeze([]),
  } as unknown as Snapshot;
  Object.freeze(snapshot);
  const calls: { id: string; snapshot?: Snapshot }[] = [];
  const pairSource = pairModule((id, supplied) => {
    calls.push({ id, snapshot: supplied });
    return { car: { id } } as Pack;
  });
  const pair = pairSource.pairPages[0];
  const before = JSON.stringify(snapshot);
  const report = pairSource.pairReport(pair.slug, snapshot)!;
  assert.deepEqual(
    calls.map(({ id }) => id),
    ["baseline", pair.rival],
  );
  for (const call of calls) assert.equal(call.snapshot, snapshot);
  assert.deepEqual(
    report.packs.map(({ car }) => car.id),
    ["baseline", pair.rival],
  );
  assert.equal(report.path, `/compare/${pair.slug}`);
  assert.equal(JSON.stringify(snapshot), before);
});

test("pairReport without a snapshot replays both default pack loaders on every call", () => {
  let epoch = "one";
  const calls: { id: string; snapshot?: Snapshot }[] = [];
  const pairSource = pairModule((id, snapshot) => {
    calls.push({ id, snapshot });
    return { car: { id, model: epoch } } as Pack;
  });
  const slug = pairSource.pairPages[0].slug;
  const first = pairSource.pairReport(slug)!;
  epoch = "two";
  const second = pairSource.pairReport(slug)!;
  assert.equal(calls.length, 4);
  for (const call of calls) assert.equal(call.snapshot, undefined);
  assert.deepEqual(
    first.packs.map(({ car }) => car.model),
    ["one", "one"],
  );
  assert.deepEqual(
    second.packs.map(({ car }) => car.model),
    ["two", "two"],
  );
});

test("pairReport propagates current pack guard errors without retry or stale fallback", () => {
  for (const failingId of ["baseline", "byd_sealion_7__premium_rwd__1"]) {
    const error = new Error("Source snapshot changed");
    const calls: string[] = [];
    const pairSource = pairModule((id) => {
      calls.push(id);
      if (id === failingId) throw error;
      return { car: { id } } as Pack;
    });
    assert.throws(
      () => pairSource.pairReport(pairSource.pairPages[0].slug),
      (caught) => caught === error,
    );
    assert.equal(calls.length, failingId === "baseline" ? 1 : 2);
  }
});

test("an unknown pair slug never loads a pack even with a supplied snapshot", () => {
  const pairSource = pairModule(() => {
    throw new Error("Unexpected pack load");
  });
  assert.equal(pairSource.pairReport("made-up"), undefined);
  assert.equal(
    pairSource.pairReport("made-up", { data: {} as Research, cars: [] }),
    undefined,
  );
});
