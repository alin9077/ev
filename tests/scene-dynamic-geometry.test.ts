import { before, test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { build } from "esbuild";
import type { Item } from "../src/lib/scenes/b/gl";
import type { Mesh } from "../src/lib/scenes/b/mesh";
import type { dynamicBox } from "../src/lib/scenes/b/world";

// Test-only exports inspect the actual private retention path and uploader.
// No diagnostic API is shipped in the application bundle.
let probe: {
  moment: (t: number, wide?: boolean, spec?: unknown) => { items: Item[] };
  stats: () => { entries: number; bytes: number };
  dynamicBox: typeof dynamicBox;
  block: (x: number, y: number, z: number, soft: number) => Mesh;
  upload: (state: unknown, mesh: Mesh) => unknown;
};
before(async () => {
  const root = process.cwd();
  const output = await build({
    absWorkingDir: root,
    stdin: {
      contents: `
        import { priceSceneB } from './src/lib/scenes/b/price';
        import { __testDef } from './src/lib/scenes/b/stage';
        export { __testStats as stats, dynamicBox } from './src/lib/scenes/b/world';
        export { block } from './src/lib/scenes/b/mesh';
        export { __testUpload as upload } from './src/lib/scenes/b/gl';
        export function moment(t, wide=true, spec) {
          void priceSceneB;
          return __testDef.moment({t,wide,spec,aspect:wide?1.8:1});
        }`,
      loader: "ts",
      resolveDir: root,
    },
    bundle: true,
    format: "cjs",
    platform: "node",
    write: false,
    plugins: [
      {
        name: "private-scene-test-observations",
        setup(builder) {
          builder.onLoad(
            { filter: /\/scenes\/b\/(world|stage|gl)\.ts$/ },
            (args) => {
              let source = fs.readFileSync(args.path, "utf8");
              if (args.path.endsWith("/world.ts")) {
                source += `\nexport function __testStats() {
              return {entries:cache.size,bytes:[...cache.values()].reduce((n,m)=>
                n+m.pos.byteLength+m.nrm.byteLength+m.aux.byteLength+m.idx.byteLength,0)};
            }`;
              } else if (args.path.endsWith("/stage.ts")) {
                const marker =
                  "export function scene(def: SceneDef): ChapterScene {";
                assert.equal(source.split(marker).length, 2);
                source = source.replace(
                  marker,
                  `export let __testDef: SceneDef;\n${marker}\n__testDef=def;`,
                );
              } else {
                source += "\nexport { upload as __testUpload };";
              }
              return {
                contents: source,
                loader: "ts",
                resolveDir: path.dirname(args.path),
              };
            },
          );
        },
      },
    ],
  });
  const compiledModule = { exports: {} };
  const run = vm.runInThisContext(
    `(function(module,exports){${output.outputFiles[0].text}\n})`,
  );
  run(compiledModule, compiledModule.exports);
  probe = compiledModule.exports as typeof probe;
});

function shapeValues(mesh: Mesh) {
  return [mesh.pos, mesh.nrm, mesh.aux, mesh.idx].map((data) =>
    Array.from(data),
  );
}
function visualValues(value: unknown): unknown {
  if (ArrayBuffer.isView(value))
    return Array.from(value as unknown as ArrayLike<number>);
  if (Array.isArray(value)) return value.map(visualValues);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key, item]) =>
            key !== "key" && key !== "slot" && typeof item !== "function",
        )
        .map(([key, item]) => [key, visualValues(item)]),
    );
  }
  return value;
}

test("dynamic boxes retain exact softened geometry without retaining size keys", () => {
  assert.throws(
    () => probe.dynamicBox("", [1, 2, 3], [0, 0, 0]),
    /nonempty slot/,
  );
  const initial = probe.stats();
  for (const width of [0, 0.00001, 0.0215001, 0.04, 0.5, 2.15, 2.5]) {
    const material = { kind: 0, color: [0.2, 0.3, 0.4] } as Item["mat"];
    const item = probe.dynamicBox(
      "test-dynamic-box",
      [width, 1.36, 0.21],
      [1, 2, 3],
      material,
      0.02,
      false,
    );
    assert.deepEqual(
      shapeValues(item.mesh),
      shapeValues(probe.block(width, 1.36, 0.21, 0.02)),
    );
    assert.equal(item.mesh.slot, "test-dynamic-box");
    assert.strictEqual(item.mat, material);
    assert.equal(item.cast, false);
    assert.deepEqual(Array.from(item.at).slice(12, 15), [1, 2, 3]);
  }
  assert.deepEqual(probe.stats(), initial);
  const matrix = new Float32Array(16);
  assert.strictEqual(
    probe.dynamicBox("test-matrix", [1, 2, 3], matrix).at,
    matrix,
  );
});

test("actual price charging frames plateau in CPU cache for distinct times", () => {
  probe.moment(8.1);
  const warm = probe.stats();
  for (let i = 0; i < 24; i++) probe.moment(8.1);
  assert.deepEqual(probe.stats(), warm);
  for (let i = 0; i < 120; i++) {
    const frame = probe.moment(7.4 + ((i + 0.137) * 2.9) / 120);
    const batteries = frame.items.filter((item) =>
      item.mesh.slot?.startsWith("price-battery-"),
    );
    assert.equal(batteries.length, 4);
    assert.deepEqual(
      [...new Set(batteries.map((item) => item.mesh.slot))].sort(),
      ["price-battery-empty", "price-battery-full"],
    );
    assert.deepEqual(probe.stats(), warm, `distinct charging sample ${i}`);
  }
});

test("36 populated-spec price scene frames preserve source84 geometry, materials, transforms and shot definitions", () => {
  const fixture = JSON.parse(
    fs.readFileSync("tests/fixtures/price-scene-v84-parity.json", "utf8"),
  );
  for (const sample of fixture.samples) {
    const frame = probe.moment(sample.t, sample.wide, fixture.spec);
    assert.equal(frame.items.length, sample.itemCount);
    const digest = createHash("sha256")
      .update(JSON.stringify(visualValues(frame)))
      .digest("hex");
    assert.equal(
      digest,
      sample.geometrySHA256,
      `${sample.t}s wide=${sample.wide}`,
    );
  }
});

test("actual uploader reuses two battery buffer slots across changing meshes and render passes", () => {
  let vertices = 0,
    buffers = 0,
    uploads = 0;
  const bound = new Map<number, number>();
  const latest = new Map<number, ArrayBufferView>();
  const gl = {
    ARRAY_BUFFER: 1,
    ELEMENT_ARRAY_BUFFER: 2,
    FLOAT: 3,
    DYNAMIC_DRAW: 4,
    STATIC_DRAW: 5,
    createVertexArray: () => ++vertices,
    createBuffer: () => ++buffers,
    bindVertexArray: () => {},
    bindBuffer: (target: number, buffer: number) => {
      bound.set(target, buffer);
    },
    enableVertexAttribArray: () => {},
    vertexAttribPointer: () => {},
    bufferData: (_target: number, data: ArrayBufferView, usage: number) => {
      assert.ok(data.byteLength > 0);
      assert.equal(usage, gl.DYNAMIC_DRAW);
      latest.set(bound.get(_target)!, data);
      uploads++;
    },
  };
  const state = { gl, meshes: new Map(), tick: 0 };
  for (let i = 0; i < 30; i++) {
    state.tick++;
    const batteries = probe
      .moment(7.4 + ((i + 0.137) * 2.9) / 30)
      .items.filter((item) => item.mesh.slot?.startsWith("price-battery-"));
    for (let pass = 0; pass < 3; pass++) {
      for (const item of batteries) {
        const held = probe.upload(state, item.mesh) as {
          buffers: number[];
          count: number;
        };
        assert.equal(held.count, item.mesh.idx.length);
        for (const [index, data] of [
          item.mesh.pos,
          item.mesh.nrm,
          item.mesh.aux,
          item.mesh.idx,
        ].entries()) {
          assert.strictEqual(
            latest.get(held.buffers[index]),
            data,
            "every upload uses current geometry",
          );
        }
      }
    }
    assert.equal(state.meshes.size, 2);
  }
  assert.equal(vertices, 2);
  assert.equal(buffers, 8);
  assert.equal(latest.size, 8);
  assert.equal(uploads, 30 * 4 * 3 * 4);
});
