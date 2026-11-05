import test from "node:test";
import assert from "node:assert/strict";
import { compiledSource } from "./helpers/compiled-source";
import type { Car } from "../src/lib/types";
type Pair = { slug: string; rival: string };
type Link = Pair & { href: string; label: string; car: Car };
type PairModule = { pairPages: Pair[]; pairLinks: (cars?: readonly Car[]) => Link[] };
const emptyPack = () => { throw new Error("pairLinks must not call pack"); };
function pairModule(catalogue: () => Car[], old = false) {
  return compiledSource(old ? "tests/fixtures/pair-pages-v86.txt" : "src/lib/pair-pages.ts", {
    "./data": { catalogue, pack: emptyPack },
    "./config": { BASELINE: "baseline" },
    "./citable": { makeReport: emptyPack },
  }) as PairModule;
}
const pairs = pairModule(() => []).pairPages;
function carsFor(epoch: string): Car[] {
  return pairs.map((p, i) => ({ id: p.rival, brand: i === 5 ? "Tesla" : `Brand${i}`, model: `${epoch} Model${i}`, trim: `Trim${i}`, family: `family${i}`, slug: `slug${i}` } as Car));
}
test("pairLinks reduces nine catalogue evaluations to one with identical nine outputs", () => {
  const cars = carsFor("first"); let oldCalls = 0, calls = 0;
  const old = pairModule(() => { oldCalls++; return cars; }, true);
  const current = pairModule(() => { calls++; return cars; });
  assert.deepEqual(current.pairLinks(), old.pairLinks());
  assert.equal(oldCalls, 9); assert.equal(calls, 1);
  assert.equal(current.pairLinks().length, 9);
  assert.match(current.pairLinks()[5].label, /^Model Y vs first Model5$/);
});
test("caller-supplied readonly catalogue is used by reference without loading or mutation", () => {
  const cars = carsFor("supplied"); cars.forEach(Object.freeze); Object.freeze(cars);
  const current = pairModule(() => { throw new Error("Unexpected catalogue load"); });
  const before = JSON.stringify(cars), result = current.pairLinks(cars);
  assert.equal(JSON.stringify(cars), before);
  result.forEach((link, i) => { assert.equal(link.car,cars[i]); assert.equal(link.href,`/compare/${pairs[i].slug}`); });
});
test("default catalogue remains fresh across calls and loader errors are not swallowed", () => {
  let epoch = "one", calls = 0;
  const current = pairModule(() => { calls++; return carsFor(epoch); });
  assert.match(current.pairLinks()[0].label,/one/); epoch = "two";
  assert.match(current.pairLinks()[0].label,/two/); assert.equal(calls,2);
  const error = new Error("Identity guard failed");
  assert.throws(() => pairModule(() => { throw error; }).pairLinks(), e => e === error);
});
test("missing selected rivals still fail rather than skip or reload a supplied catalogue", () => {
  const cars = carsFor("held").slice(1);
  for (const old of [false,true]) assert.throws(() => pairModule(() => cars,old).pairLinks(),TypeError);
  assert.throws(() => pairModule(() => { throw new Error("Must not reload"); }).pairLinks([]),TypeError);
});
function routeHarness(old: boolean) {
  let calls = 0, epoch = "one";
  const catalogue = () => { calls++; return carsFor(epoch); };
  const pair = pairModule(catalogue,old);
  const route = compiledSource(old ? "tests/fixtures/llms-route-v86.txt" : "src/app/llms.txt/route.ts", {
    "@/lib/pair-pages": pair,
    "@/lib/data": { catalogue },
    "@/lib/citable": { carName: (c: Car) => `${c.brand} ${c.model} ${c.trim}`, carPath: (c: Car) => `/cars/${c.family}/${c.slug}`, PAGE_UPDATED: "2026-10-11" },
    "@/lib/config": { site: { name: "Roadmark", origin: "https://example.test" } },
  }) as { GET: () => Response; dynamic: string };
  return {route,calls:()=>calls,setEpoch:(v:string)=>{epoch=v;}};
}
test("llms export loads once instead of ten times with byte-identical text and headers", async () => {
  const old = routeHarness(true), current = routeHarness(false);
  const a = old.route.GET(), b = current.route.GET();
  assert.equal(await b.text(),await a.text());
  assert.deepEqual([...b.headers],[...a.headers]); assert.equal(b.status,a.status);
  assert.equal(old.calls(),10); assert.equal(current.calls(),1);
  assert.equal(current.route.dynamic,old.route.dynamic);
});
test("each llms invocation receives fresh consistent catalogue content", async () => {
  const current = routeHarness(false);
  const first = await current.route.GET().text(); current.setEpoch("two");
  const second = await current.route.GET().text();
  assert.notEqual(first,second); assert.ok(first.includes("one Model0"));
  assert.ok(second.includes("two Model0")); assert.ok(!second.includes("one Model0"));
  assert.equal(current.calls(),2);
});
