import test from "node:test";
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { encodePortableJson, parsePortableData, PORTABLE_STRING_FORMAT } from "../src/lib/portable-string-codec";
const envelope = (data: unknown, strings: unknown = ["original"]) => JSON.stringify({ format: PORTABLE_STRING_FORMAT, strings, data });
const roundTrip = (value: unknown, threshold = 64) => {
  const original = JSON.stringify(value);
  const encoded = encodePortableJson(original, threshold);
  const decoded = parsePortableData(encoded.json);
  assert.deepEqual(decoded, JSON.parse(original));
  assert.equal(JSON.stringify(decoded), JSON.stringify(JSON.parse(original)));
  assert.deepEqual(encodePortableJson(original, threshold), encoded);
  return { encoded, decoded };
};

test("portable codec preserves complete nested JSON with deterministic value-only interning", () => {
  const text = "Source qualification: ".repeat(12);
  const input = { cars: [{ id: "one", evidence: text }, { id: "two", evidence: text }], sources: [{ title: text, id: 1 }], [text]: text, nil: null, no: false, n: 54.33 };
  const { encoded } = roundTrip(input);
  assert.equal(encoded.dictionaryValues, 1);
  assert.equal(encoded.replacedOccurrences, 4);
  assert.ok(encoded.json.length < JSON.stringify(input).length);
  assert.ok(Object.hasOwn(JSON.parse(encoded.json).data, text));
});

test("portable codec uses UTF-8 thresholds and first-occurrence JSON order", () => {
  const value = "🦘".repeat(16);
  const input = { "10": value, "2": "x".repeat(64), b: value, c: "x".repeat(64), short: "a", other: "a" };
  const { encoded } = roundTrip(input);
  assert.deepEqual(JSON.parse(encoded.json).strings, ["x".repeat(64), value]);
  assert.equal(encoded.dictionaryValues, 2);
  assert.equal(encodePortableJson(JSON.stringify(input), 65).dictionaryValues, 0);
  for (const threshold of [0, -1, 1.5, NaN, Infinity])
    assert.throws(() => encodePortableJson("null", threshold), /threshold/);
});

test("portable codec escapes existing reference-like strings and never decodes dictionary values twice", () => {
  roundTrip(["~", "~0", "~~0", "~A", "~00", "~constructor", "~__proto__", "~0"], 1);
  assert.equal(parsePortableData(envelope("~0", ["~1"])), "~1");
  assert.equal(parsePortableData(envelope("~0", [""])), "");
  assert.equal(parsePortableData(envelope("~~0", [])), "~0");
  for (const value of [null, false, true, 123, "", "plain", "~", [], {}]) roundTrip(value);
});

test("portable JSON cannot terminate its script element and preserves Unicode and source-like keys", () => {
  const text = '</script><SCRIPT>"&<!--\u2028\u2029\u0000\\u003c\ud800🦘';
  const { encoded } = roundTrip({ [text]: text, repeated: [text, text], prefix: "~" + text }, 1);
  assert.ok(!encoded.json.includes("<"));
  assert.ok(!encoded.json.includes("\u2028"));
  assert.ok(!encoded.json.includes("\u2029"));
  assert.ok(encoded.json.includes("\\u003c"));
  assert.ok(encoded.json.includes("\\u2028"));
});

test("portable codec preserves own prototype-like keys without prototype pollution", () => {
  const original = '{"__proto__":"~literal","constructor":{"prototype":{"polluted":"' + "x".repeat(64) + '"}},"prototype":"~literal","toString":"value","hasOwnProperty":false}';
  const encoded = encodePortableJson(original, 1);
  const decoded = parsePortableData(encoded.json) as Record<string, unknown>;
  assert.deepEqual(decoded, JSON.parse(original));
  assert.equal(Object.getPrototypeOf(decoded), Object.prototype);
  assert.equal(Object.getOwnPropertyDescriptor(decoded, "__proto__")?.value, "~literal");
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.equal(Object.getOwnPropertyDescriptor(decoded, "__proto__")?.enumerable, true);
  assert.equal(Object.getOwnPropertyDescriptor(decoded, "__proto__")?.writable, true);
});

test("portable codec keeps equal object containers independent and property order intact", () => {
  const text = "A complete source snapshot ".repeat(10);
  const { decoded } = roundTrip({ source: { title: text, date: "2026-10-10" }, snapshot: { title: text, date: "2026-10-10" }, arrays: [[text], [text]] });
  const data = decoded as { source: { title: string }; snapshot: { title: string }; arrays: string[][] };
  assert.notEqual(data.source, data.snapshot);
  assert.notEqual(data.arrays[0], data.arrays[1]);
  data.source.title = "changed";
  data.arrays[0][0] = "changed";
  assert.equal(data.snapshot.title, text);
  assert.equal(data.arrays[1][0], text);
});

test("portable codec preserves existing JSON normalization and all parsed number values", () => {
  let calls = 0;
  const input = { missing: undefined, sparse: [, undefined, NaN, Infinity, -Infinity], minusZero: -0, number: 0.1, date: new Date("2026-10-10T00:00:00Z"), custom: { toJSON() { calls++; return "normalized"; } } };
  const text = JSON.stringify(input);
  const decoded = parsePortableData(encodePortableJson(text).json);
  assert.deepEqual(decoded, JSON.parse(text));
  assert.equal(calls, 1);
  assert.ok(Object.is(parsePortableData('{"format":"roadmark-string-table-v1","strings":[],"data":-0}'), -0));
});

test("portable codec rejects malformed envelopes and noncanonical or absent references", () => {
  for (const value of [null, [], 4, "raw", {}, { format: "other", strings: [], data: {} }, { format: PORTABLE_STRING_FORMAT, strings: [], data: {}, extra: true }, { format: PORTABLE_STRING_FORMAT, strings: [] }, { format: PORTABLE_STRING_FORMAT, strings: [1], data: {} }, { format: PORTABLE_STRING_FORMAT, strings: null, data: {} }])
    assert.throws(() => parsePortableData(JSON.stringify(value)), /envelope/);
  for (const reference of ["~", "~1", "~00", "~A", "~-1", "~+0", "~0.0", "~ 0", "~0suffix", "~constructor", "~__proto__"])
    assert.throws(() => parsePortableData(envelope({ nested: [reference] })), /reference/);
  assert.throws(() => parsePortableData("{"), SyntaxError);
  assert.equal(parsePortableData('{"data":"~0","strings":["value"],"format":"roadmark-string-table-v1"}'), "value");
});

test("portable codec tolerates deep JSON containers without recursive decoder traversal", () => {
  const text = "[".repeat(1000) + '"~0"' + "]".repeat(1000);
  const raw = '{"format":"roadmark-string-table-v1","strings":["restored"],"data":' + text + '}';
  let decoded = parsePortableData(raw);
  for (let i = 0; i < 1000; i++) decoded = (decoded as unknown[])[0];
  assert.equal(decoded, "restored");
});

test("portable codec round-trips seeded mixed JSON fixtures across thresholds", () => {
  let seed = 713;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  const strings = ["", "~0", "~~~", "</script>", "\u2028", "\ud800", "same evidence ".repeat(20), "🦘".repeat(16)];
  const make = (depth: number): unknown => {
    const kind = next() % (depth ? 7 : 5);
    if (kind === 0) return null;
    if (kind === 1) return !!(next() % 2);
    if (kind === 2) return (next() - 2000000000) / 7;
    if (kind < 5) return strings[next() % strings.length];
    if (kind === 5) return Array.from({ length: next() % 5 }, () => make(depth - 1));
    return Object.fromEntries(Array.from({ length: next() % 5 }, (_, i) => [i === 0 ? "__proto__" : String(next()), make(depth - 1)]));
  };
  for (let i = 0; i < 300; i++) roundTrip(make(4), [1, 16, 64, 128][i % 4]);
});

test("portable references cross base-36 boundaries without ambiguity or alternate spellings", () => {
  const strings = Array.from({ length: 80 }, (_, i) => `distinct source ${i}: ` + "detail ".repeat(12));
  const { encoded } = roundTrip([...strings, ...strings]);
  const stored = JSON.parse(encoded.json);
  assert.equal(stored.data[35], "~z");
  assert.equal(stored.data[36], "~10");
  assert.equal(stored.data[71], "~1z");
  assert.equal(stored.data[72], "~20");
  assert.equal(parsePortableData(envelope("~10", strings)), strings[36]);
  assert.equal(parsePortableData(envelope("~1z", strings)), strings[71]);
  for (const bad of ["~010", "~1Z", "~ 10", "~+10"])
    assert.throws(() => parsePortableData(envelope(bad, strings)), /reference/);
});


test("portable builder uses the reviewed 32-byte threshold without changing the v1 decoder", () => {
  const builder = readFileSync(new URL("../scripts/build-portable.ts", import.meta.url), "utf8");
  assert.match(builder, /encodePortableJson\(JSON\.stringify\(data\), 32\)/);
  assert.equal(PORTABLE_STRING_FORMAT, "roadmark-string-table-v1");
});

test("32-byte encoding uses UTF-8 boundaries and preserves complete unknown metadata", () => {
  const below = "a".repeat(31), exact = "b".repeat(32), above = "c".repeat(33);
  const unicode = "🦘".repeat(8);
  const input = JSON.parse('{"__proto__":null,"unknown":{"nested":[]},"items":[]}');
  input.__proto__ = exact;
  input.unknown.nested = [below, exact, above, unicode, "~literal"];
  input.items = [below, exact, above, unicode, "~literal"];
  const { encoded, decoded } = roundTrip(input, 32);
  assert.deepEqual(JSON.parse(encoded.json).strings, [exact, above, unicode]);
  const result = decoded as { unknown: { nested: string[] }; items: string[] };
  assert.notEqual(result.unknown.nested, result.items);
  assert.equal(Object.getPrototypeOf(result), Object.prototype);
  assert.equal(Object.getOwnPropertyDescriptor(result, "__proto__")?.value, exact);
  result.items[0] = "changed";
  assert.equal(result.unknown.nested[0], below);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
});

test("reviewed threshold32 preserves seeded mixed structures with 64-byte wire compatibility", () => {
  let seed = 7232;
  const next = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  const values = ["", "~0", "~~0", "</script>", "\u2028", "\ud800", "x".repeat(31), "y".repeat(32), "z".repeat(33), "🦘".repeat(8), "long evidence ".repeat(20)];
  const make = (depth: number): unknown => {
    const kind = next() % (depth ? 7 : 5);
    if (kind === 0) return null;
    if (kind === 1) return !!(next() % 2);
    if (kind === 2) return (next() - 2000000000) / 7;
    if (kind < 5) return values[next() % values.length];
    if (kind === 5) return Array.from({ length: next() % 5 }, () => make(depth - 1));
    return Object.fromEntries(Array.from({ length: next() % 5 }, (_, i) => [i === 0 ? "__proto__" : String(next()), make(depth - 1)]));
  };
  for (let i = 0; i < 300; i++) {
    const input = make(4);
    const small = roundTrip(input, 32), prior = roundTrip(input, 64);
    assert.deepEqual(small.decoded, prior.decoded);
  }
});
