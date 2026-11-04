import { createCheckpoint101SourceReader } from "./helpers/checkpoint101-source-history";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  createCheckpoint97SourceReader,
  sourceBeforeCheckpoint97,
} from "./helpers/checkpoint97-source-history";
import { createCheckpoint96SourceReader } from "./helpers/checkpoint96-source-history";

const files = [
  "src/components/discovery.tsx",
  "src/components/detail.tsx",
  "src/components/market-audit.tsx",
];
const helper = "src/lib/buyer-display-copy.ts";
const read = createCheckpoint101SourceReader((file: string) => readFileSync(new URL("../" + file, import.meta.url)));
const sha = (bytes: Uint8Array) => createHash("sha256").update(bytes).digest("hex");
const expected = [
  { sha256: "02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8", bytes: 26356 },
  { sha256: "978ab14e0eda23a2369b46348195d1d82a67bb229533a340c5051ccd735505db", bytes: 6759 },
  { sha256: "6b52fec78d11617b6bd1f74142765186c6b647a72fbe3dc928afdc07336401cf", bytes: 8323 },
];

test("approved97 components reconstruct exact96 bytes without mutating current inputs", () => {
  for (const [index, file] of files.entries()) {
    const current = read(file);
    const original = Buffer.from(current);
    const previous = sourceBeforeCheckpoint97(file, current);
    assert.equal(sha(previous), expected[index].sha256, file);
    assert.equal(previous.length, expected[index].bytes, file);
    assert.notEqual(sha(previous), sha(current));
    assert.deepEqual(current, original);
  }
});

test("97 source recovery rejects previous, swapped, truncated, appended and line-ending drift", () => {
  for (const [index, file] of files.entries()) {
    const current = read(file);
    const old = sourceBeforeCheckpoint97(file, current);
    for (const mutation of [old, read(files[(index + 1) % files.length]), current.subarray(0, current.length - 1), Buffer.concat([current, Buffer.from("\n")]), Buffer.from(current.toString().replaceAll("\n", "\r\n")), Buffer.concat([Buffer.from("// unrelated change\n"), current])])
      assert.throws(() => sourceBeforeCheckpoint97(file, mutation), /Unapproved checkpoint97 source/);
  }
});

test("each display call and the preserved Discovery clock and prefetch policy are hash-bound", () => {
  for (const file of files) {
    const source = read(file).toString();
    assert.ok(source.includes("buyerDisplayCopy("));
    const mutation = Buffer.from(source.replace("buyerDisplayCopy(", "String("));
    assert.throws(() => sourceBeforeCheckpoint97(file, mutation), /Unapproved checkpoint97 source/);
  }
  const discovery = read(files[0]).toString();
  for (const [before, after] of [
    ["prefetch={false}", "prefetch={true}"],
    ["useState(false)", "useState(true)"],
    ["Comparable evidence is still incomplete.", "Evidence is complete."],
    ["Evidence expires after 30 days.", "Evidence expires after 90 days."],
    ['"configurationEvidence.projectionScope"', '"evidenceNote"'],
  ]) {
    assert.ok(discovery.includes(before), before);
    assert.throws(() => sourceBeforeCheckpoint97(files[0], Buffer.from(discovery.replace(before, after))), /Unapproved checkpoint97 source/);
  }
});

test("all three97 components and the exact new helper are checked before historical reads", () => {
  const reads: string[] = [];
  const reader = createCheckpoint97SourceReader((file) => {
    reads.push(file);
    return read(file);
  });
  assert.deepEqual(reads, [...files, helper]);
  assert.equal(sha(reader(files[0])), expected[0].sha256);
  for (const changed of [...files, helper]) {
    assert.throws(
      () => createCheckpoint97SourceReader((file) => file === changed ? Buffer.concat([read(file), Buffer.from(" ")]) : read(file)),
      /Unapproved checkpoint97 source/,
      changed,
    );
  }
  const helperText = read(helper).toString();
  const changedCopy = helperText.replace("further review is required", "fully verified and available now");
  assert.notEqual(changedCopy, helperText);
  assert.throws(
    () => createCheckpoint97SourceReader((file) => file === helper ? Buffer.from(changedCopy) : read(file)),
    /Unapproved checkpoint97 source/,
  );
});

test("mixed97 and96 component inputs are rejected for every nonempty predecessor subset", () => {
  const previous = files.map((file) => sourceBeforeCheckpoint97(file, read(file)));
  for (let mask = 1; mask < (1 << files.length); mask++) {
    assert.throws(
      () => createCheckpoint97SourceReader((file) => {
        const index = files.indexOf(file);
        return index >= 0 && (mask & (1 << index)) ? previous[index] : read(file);
      }),
      /Unapproved checkpoint97 source/,
    );
  }
});

test("cached predecessors are copied and an introduced helper is never supplied as historical", () => {
  const reader = createCheckpoint97SourceReader(read);
  for (const [index, file] of files.entries()) {
    const first = reader(file);
    first.fill(0);
    const second = reader(file);
    assert.notStrictEqual(first, second);
    assert.equal(sha(second), expected[index].sha256);
  }
  assert.throws(() => reader(helper), /No checkpoint96 predecessor file/);
  for (const file of ["./" + files[0], "/" + files[0], helper, "src/lib/discovery.ts"])
    assert.throws(() => sourceBeforeCheckpoint97(file, read(files[0])), /No checkpoint97 source delta/);
});

test("unrelated inputs stay raw so the original outer pins still reject unapproved drift", () => {
  const other = "src/lib/discovery.ts";
  const raw = read(other);
  const pins = JSON.parse(read("qa/checkpoint91/before-app-input-hashes.json").toString());
  const reader = createCheckpoint97SourceReader(read);
  assert.deepEqual(reader(other), raw);
  assert.equal(sha(reader(other)), pins[other].sha256);
  const changed = Buffer.concat([raw, Buffer.from("\n// unapproved drift\n")]);
  const changedReader = createCheckpoint97SourceReader((file) => file === other ? changed : read(file));
  assert.deepEqual(changedReader(other), changed);
  assert.throws(() => assert.equal(sha(changedReader(other)), pins[other].sha256));
});

test("verified97 to96 to95 chaining preserves the sealed91 Discovery pin and96 adapter", () => {
  assert.equal(sha(read("tests/helpers/checkpoint96-source-history.ts")), "fe9d9db20d712e71971c4a7458762cfd3653c6addc5cb019b42372be4b0c6d16");
  assert.equal(sha(read("qa/checkpoint91/before-app-input-hashes.json")), "7e164c30217b8eff2180c1cdaefccea9effa95a2c9cce283cec01dfbe5768fb9");
  const before97 = createCheckpoint97SourceReader(read);
  const before96 = createCheckpoint96SourceReader(before97);
  const pins = JSON.parse(read("qa/checkpoint91/before-app-input-hashes.json").toString());
  assert.equal(sha(before96(files[0])), pins[files[0]].sha256);
  assert.equal(sha(before96(files[0])), "c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f");
  assert.equal(sha(before96("src/portable/link.tsx")), "0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6");
  assert.equal(sha(before96(files[1])), expected[1].sha256);
  assert.equal(sha(before96(files[2])), expected[2].sha256);
});
