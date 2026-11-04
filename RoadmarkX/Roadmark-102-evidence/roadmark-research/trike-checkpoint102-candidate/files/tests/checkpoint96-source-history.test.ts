import { createCheckpoint102SourceReader } from "./helpers/checkpoint102-source-history";
import { createCheckpoint101SourceReader } from "./helpers/checkpoint101-source-history";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createCheckpoint97SourceReader } from "./helpers/checkpoint97-source-history";
import {
  createCheckpoint96SourceReader,
  sourceBeforeCheckpoint96,
} from "./helpers/checkpoint96-source-history";

const discovery = "src/components/discovery.tsx";
const portable = "src/portable/link.tsx";
const files = [discovery, portable];
const read = createCheckpoint97SourceReader(createCheckpoint101SourceReader(createCheckpoint102SourceReader((file) =>
  readFileSync(new URL("../" + file, import.meta.url)),
)));
const sha = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");
const expected = [
  { sha256: "c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f", bytes: 26192 },
  { sha256: "0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6", bytes: 647 },
];
function replaceOne(source: string, from: string, to: string) {
  assert.equal(source.split(from).length, 2, from);
  return Buffer.from(source.replace(from, to));
}

test("approved96 sources reconstruct exact checkpoint95 bytes and the original91 Discovery pin", () => {
  for (const [index, file] of files.entries()) {
    const current = read(file);
    const original = Buffer.from(current);
    const previous = sourceBeforeCheckpoint96(file, current);
    assert.equal(sha(previous), expected[index].sha256);
    assert.equal(previous.length, expected[index].bytes);
    assert.notEqual(sha(previous), sha(current));
    assert.deepEqual(current, original, "reconstruction must not mutate its input");
  }
  const pins = JSON.parse(read("qa/checkpoint91/before-app-input-hashes.json").toString());
  assert.equal(pins[discovery].sha256, expected[0].sha256);
  assert.equal(pins[portable], undefined, "portable is validated in addition to the original91 pins");
});

test("source reconstruction rejects already-old, swapped, truncated, trailing and line-ending mutations", () => {
  for (const [index, file] of files.entries()) {
    const current = read(file);
    const old = sourceBeforeCheckpoint96(file, current);
    const mutations = [
      old,
      read(files[1 - index]),
      current.subarray(0, current.length - 1),
      Buffer.concat([current, Buffer.from("\n")]),
      Buffer.from(current.toString().replaceAll("\n", "\r\n")),
      Buffer.concat([Buffer.from("// unrelated change\n"), current]),
    ];
    for (const mutation of mutations)
      assert.throws(
        () => sourceBeforeCheckpoint96(file, mutation),
        /Unapproved checkpoint96 source/,
      );
  }
});

test("each Discovery prefetch false must remain present and false", () => {
  const source = read(discovery).toString();
  const marker = "prefetch={false}";
  const positions: number[] = [];
  for (let at = source.indexOf(marker); at !== -1; at = source.indexOf(marker, at + marker.length))
    positions.push(at);
  assert.equal(positions.length, 4);
  for (const at of positions) {
    for (const replacement of ["", "prefetch={true}"]) {
      const mutation = Buffer.from(
        source.slice(0, at) + replacement + source.slice(at + marker.length),
      );
      assert.throws(
        () => sourceBeforeCheckpoint96(discovery, mutation),
        /Unapproved checkpoint96 source/,
      );
    }
  }
});

test("Discovery route, evidence and unrelated prefetch mutations cannot masquerade as the reviewed delta", () => {
  const source = read(discovery).toString();
  const mutations = [
    replaceOne(source, "`/cars/${c.family}/${c.slug}`", "`/cars/changed/${c.family}/${c.slug}`"),
    replaceOne(source, "Evidence expires after 30 days.", "Evidence expires after 90 days."),
    replaceOne(source, '<Link href="/market">', '<Link href="/market" prefetch={false}>'),
  ];
  for (const mutation of mutations)
    assert.throws(
      () => sourceBeforeCheckpoint96(discovery, mutation),
      /Unapproved checkpoint96 source/,
    );
});

test("portable consumption and existing click-handler mutations are rejected", () => {
  const source = read(portable).toString();
  const mutations = [
    replaceOne(source, "  prefetch,\n", ""),
    replaceOne(source, "  void prefetch;\n", ""),
    replaceOne(source, "href={localUrl(href)}", "href={href}"),
    replaceOne(source, "        navigate(href);", "        navigate(\"/\");"),
    replaceOne(source, "          event.defaultPrevented ||\n", ""),
    replaceOne(source, "event.button !== 0", "event.button !== 1"),
    ...["metaKey", "ctrlKey", "shiftKey", "altKey"].map((key) =>
      replaceOne(source, `          event.${key} ||\n`, ""),
    ),
  ];
  for (const mutation of mutations)
    assert.throws(
      () => sourceBeforeCheckpoint96(portable, mutation),
      /Unapproved checkpoint96 source/,
    );
});

test("the historical reader rejects mixed approved and predecessor pairs", () => {
  const current = files.map(read);
  const previous = files.map((file, index) => sourceBeforeCheckpoint96(file, current[index]));
  for (const oldIndexes of [[0], [1], [0, 1]]) {
    assert.throws(
      () => createCheckpoint96SourceReader((file) => {
        const index = files.indexOf(file);
        assert.ok(index >= 0);
        return oldIndexes.includes(index) ? previous[index] : current[index];
      }),
      /Unapproved checkpoint96 source/,
    );
  }
});

test("both approved files are verified before the reader can serve a historical source", () => {
  const reads: string[] = [];
  const reader = createCheckpoint96SourceReader((file) => {
    reads.push(file);
    return read(file);
  });
  assert.deepEqual(reads, files);
  assert.equal(sha(reader(discovery)), expected[0].sha256);
  assert.throws(
    () => createCheckpoint96SourceReader((file) =>
      file === portable ? Buffer.concat([read(file), Buffer.from(" ")]) : read(file),
    ),
    /Unapproved checkpoint96 source: src\/portable\/link.tsx/,
  );
});

test("non-target sources stay raw and retain the original outer pin rejection", () => {
  const other = "src/lib/discovery.ts";
  const current = read(other);
  const pins = JSON.parse(read("qa/checkpoint91/before-app-input-hashes.json").toString());
  const reader = createCheckpoint96SourceReader(read);
  assert.deepEqual(reader(other), current);
  assert.equal(sha(reader(other)), pins[other].sha256);
  const mutation = Buffer.concat([current, Buffer.from("\n// unapproved drift\n")]);
  const changedReader = createCheckpoint96SourceReader((file) =>
    file === other ? mutation : read(file),
  );
  assert.deepEqual(changedReader(other), mutation);
  assert.throws(() => assert.equal(sha(changedReader(other)), pins[other].sha256));
  for (const file of ["./" + discovery, "/" + discovery, other])
    assert.throws(
      () => sourceBeforeCheckpoint96(file, read(discovery)),
      /No checkpoint96 source delta/,
    );
});

test("historical reader results cannot mutate cached predecessor bytes", () => {
  const reader = createCheckpoint96SourceReader(read);
  for (const [index, file] of files.entries()) {
    const first = reader(file);
    first.fill(0);
    const second = reader(file);
    assert.notStrictEqual(first, second);
    assert.equal(sha(second), expected[index].sha256);
    assert.equal(second.length, expected[index].bytes);
  }
});

test("checkpoint91 keeps its sealed fixture and original pin comparison through the verified reader", () => {
  assert.equal(
    sha(read("qa/checkpoint91/before-app-input-hashes.json")),
    "7e164c30217b8eff2180c1cdaefccea9effa95a2c9cce283cec01dfbe5768fb9",
  );
  const source = read("tests/helpers/checkpoint91-history.ts").toString();
  assert.ok(source.includes("const readBefore99 = createCheckpoint99SourceReader((file) => readFileSync(new URL(\"../../\" + file, import.meta.url)));"));
  assert.ok(source.includes("const readSourceBefore97 = createCheckpoint97SourceReader(readBefore99);"));
  assert.match(source, /const readSourceBefore96 = createCheckpoint96SourceReader\(readSourceBefore97\);/);
  assert.match(source, /if \(file !== H.PROPOSAL_FILE && file !== H.LEDGER_FILE\)\s*assert.equal\(H.sha\(readSourceBefore96\(file\)\), pin.sha256, file\);/);
  assert.ok(source.includes("const f = H.loadFixtures(dir);"));
  assert.ok(source.includes("core.checkResearch(researchBeforeCheckpoint99(research()), fixture);"));
  assert.ok(source.includes("core.previousStorage(read(H.PROPOSAL_FILE), read(H.LEDGER_FILE), fixture, f)"));
});
