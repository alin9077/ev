/**
 * The white model the B scenes are set in: floor, kerbs, buildings, trees,
 * chargers and people, all to scale in metres and all in the same pale clay.
 */
import { CLAY, GLOSS, GLOW, GROUND, type Item, type Material } from "./gl";
import {
  TAU,
  colour,
  compose,
  identity,
  lerp,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  transform,
  translate,
  type M4,
  type V3,
} from "./math";
import {
  Shape,
  ball,
  block,
  merge,
  post,
  sheet,
  tube,
  turned,
  type Mesh,
} from "./mesh";
import { FLOOR } from "./stage";

export const WHITE = colour("#ecebe8"),
  STONE = colour("#dcdbd7"),
  ASPHALT = colour("#c9c8c5"),
  WARM = colour("#e6d8c2"),
  /** The paint of the car the page is about: a deep gloss black. */
  PAINT = colour("#101114"),
  GRAPHITE = colour("#4a4c50"),
  INK = colour("#22272b");

export const clay = (
  color: V3 = WHITE,
  extra: Partial<Material> = {},
): Material => ({
  kind: CLAY,
  color,
  ...extra,
});
export const gloss = (color: V3, shine = 0.05, flake = 0): Material => ({
  kind: GLOSS,
  color,
  p: [shine, flake, 0, 0],
});
/** Something that gives light of its own, at a strength. */
export const glow = (color: V3, strength = 1, alpha = 1): Material => ({
  kind: GLOW,
  color,
  p: [strength, 0, 0, 0],
  alpha,
});

const cache = new Map<string, Mesh>();
/** One mesh per distinct shape, however often a scene asks for it. */
export function kept(name: string, make: () => Mesh): Mesh {
  let mesh = cache.get(name);
  if (!mesh) {
    mesh = make();
    cache.set(name, mesh);
  }
  return mesh;
}
/** A softened box by its size, placed with its base centre at a point. */
export function box(
  size: V3,
  at: V3 | M4,
  mat: Material = clay(),
  soft = 0.03,
  cast = true,
): Item {
  return {
    mesh: kept(`box ${size.join(" ")} ${soft}`, () =>
      block(size[0], size[1], size[2], soft),
    ),
    at: at instanceof Float32Array ? at : translate(at[0], at[1], at[2]),
    mat,
    cast,
  };
}

/** The floor: one sheet, far wider than any view, dimming gently outwards. */
export function ground(
  focus: V3 = [0, 0, 0],
  across = 30,
  dim = 0.05,
  /** A map's dot grid: the pitch in metres, and how dark the dots are. */
  dots: [number, number] = [1, 0],
): Item {
  return {
    mesh: kept("ground", () => sheet(1, 1)),
    at: compose(
      translate(focus[0], focus[1], 0),
      scale(Math.max(4000, across * 40)),
    ),
    mat: {
      kind: GROUND,
      color: FLOOR,
      p: [focus[0], focus[1], across, dim],
      q: [dots[0], dots[1], 0, 0],
    },
    cast: false,
  };
}

/* ---------- Ground markings ---------- */

/**
 * A flat shape lying just above the floor, in one colour: a lane, a bay, a
 * band of light. Points are [x, y]; the shape must be convex. `fades` gives
 * each point how far it has thinned to nothing, 0–1.
 */
export function decal(
  slot: string,
  points: [number, number][],
  color: V3,
  alpha = 1,
  lift = 0.012,
  fades?: number[],
): Item {
  const shape = new Shape();
  const up: V3 = [0, 0, 1];
  points.forEach(([x, y], i) =>
    shape.vertex([x, y, lift], up, [fades?.[i] ?? 0, 0, 0, 0]),
  );
  for (let i = 1; i < points.length - 1; i++) shape.tri(0, i, i + 1);
  return {
    mesh: { ...shape.done(), slot },
    at: identity(),
    mat: { kind: GLOW, color, p: [1, 0, 0, 0], alpha: Math.min(alpha, 0.999) },
    cast: false,
  };
}
/** A band along a path on the floor: a route, a ring, a rule. */
export function ribbon(
  slot: string,
  path: [number, number][],
  width: number,
  color: V3,
  alpha = 1,
  lift = 0.014,
  closed = false,
): Item {
  const shape = new Shape();
  const up: V3 = [0, 0, 1];
  const n = path.length;
  for (let i = 0; i < n; i++) {
    const before = path[closed ? (i + n - 1) % n : Math.max(0, i - 1)],
      after = path[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    const dx = after[0] - before[0],
      dy = after[1] - before[1];
    const l = Math.hypot(dx, dy) || 1;
    const ox = (-dy / l) * (width / 2),
      oy = (dx / l) * (width / 2);
    shape.vertex([path[i][0] + ox, path[i][1] + oy, lift], up);
    shape.vertex([path[i][0] - ox, path[i][1] - oy, lift], up);
  }
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const j = (i + 1) % n;
    shape.quad(i * 2, i * 2 + 1, j * 2 + 1, j * 2);
  }
  return {
    mesh: { ...shape.done(), slot },
    at: identity(),
    mat: {
      kind: GLOW,
      color,
      p: [1, 0, 0, 0],
      alpha: Math.min(alpha, 0.999),
      faces: "both",
    },
    cast: false,
  };
}
/** Points round a circle on the floor, or part of one. */
export function arc(
  cx: number,
  cy: number,
  r: number,
  from = 0,
  to = 1,
  steps = 96,
): [number, number][] {
  const n = Math.max(2, Math.ceil(steps * Math.abs(to - from)));
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (from + ((to - from) * i) / n) * TAU;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
}

/* ---------- Street ---------- */

/**
 * A straight road along x: a sunk carriageway between two raised footpaths,
 * with a dashed centre line. `shift` slides the dashes, so a road can run
 * past a car that the camera is following.
 */
export function road(
  centre: V3,
  length: number,
  width = 7,
  shift = 0,
  path = 2.6,
): Item[] {
  const [x, y] = centre;
  const items: Item[] = [
    box([length, width, 0.02], [x, y, 0], clay(ASPHALT), 0.004, false),
  ];
  for (const side of [1, -1])
    items.push(
      box(
        [length, path, 0.13],
        [x, y + side * (width / 2 + path / 2), 0],
        clay(WHITE),
        0.035,
      ),
    );
  const pitch = 6;
  const first = Math.ceil((x - length / 2 - shift) / pitch) * pitch + shift;
  for (let at = first; at < x + length / 2 - 2.4; at += pitch)
    items.push(
      box([2.4, 0.13, 0.012], [at + 1.2, y, 0.02], clay(WHITE), 0.003, false),
    );
  return items;
}

/* ---------- Buildings ---------- */

/** A warm window: a recessed bay, softly lit from inside. */
const windowMat = (lit = 0.16): Material => ({
  kind: CLAY,
  color: WARM,
  color2: colour("#ffd9a0"),
  p: [lit, 0.2, 0, 0],
});
/**
 * A flat-roofed house in the white model's manner: a ground floor set back
 * under a wider upper floor, bays of warm glazing between white fins. Its
 * front faces −y; `at` is the centre of its footprint.
 */
export function house(at: V3, width = 10, depth = 7.5, upper = true): Item[] {
  const [x, y] = at;
  const items: Item[] = [];
  const floor = 2.9;
  items.push(box([width - 1.2, depth - 1, floor], [x, y, 0]));
  // Glazing along the front of the ground floor, with fins.
  const bays = Math.max(3, Math.round((width - 1.6) / 1.5));
  const span = (width - 1.8) / bays;
  for (let i = 0; i < bays; i++)
    items.push(
      box(
        [span - 0.16, 0.1, floor - 0.7],
        [
          x - (width - 1.8) / 2 + span * (i + 0.5),
          y - (depth - 1) / 2 - 0.02,
          0.3,
        ],
        windowMat(),
        0.02,
        false,
      ),
    );
  items.push(box([width, depth, 0.32], [x, y, floor]));
  if (upper) {
    items.push(
      box([width - 2.4, depth - 1.6, 2.7], [x - 0.6, y + 0.3, floor + 0.32]),
    );
    const upperBays = Math.max(2, Math.round((width - 3.2) / 1.6));
    const upperSpan = (width - 3.2) / upperBays;
    for (let i = 0; i < upperBays; i++)
      items.push(
        box(
          [upperSpan - 0.18, 0.1, 1.7],
          [
            x - 0.6 - (width - 3.2) / 2 + upperSpan * (i + 0.5),
            y + 0.3 - (depth - 1.6) / 2 - 0.02,
            floor + 0.32 + 0.5,
          ],
          windowMat(),
          0.02,
          false,
        ),
      );
    items.push(
      box(
        [width - 1.8, depth - 1, 0.26],
        [x - 0.6, y + 0.3, floor + 0.32 + 2.7],
      ),
    );
  }
  return items;
}
/** A plain block of the town beyond: a white mass with a roof slab. */
export function mass(at: V3, size: V3): Item[] {
  return [
    box([size[0], size[1], size[2]], [at[0], at[1], 0]),
    box([size[0] + 0.5, size[1] + 0.5, 0.25], [at[0], at[1], size[2]]),
  ];
}
/** A carport: four posts and a roof of dark panels, open on every side. */
export function carport(
  at: V3,
  width = 6.2,
  depth = 5.8,
  height = 2.5,
): Item[] {
  const [x, y] = at;
  const items: Item[] = [];
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      items.push({
        mesh: kept(`post ${height}`, () => post(0.07, height, 0.01, 12)),
        at: translate(
          x + sx * (width / 2 - 0.2),
          y + sy * (depth / 2 - 0.2),
          0,
        ),
        mat: clay(),
      });
  items.push(box([width, depth, 0.14], [x, y, height]));
  // Panels on top, in a grid.
  const cols = 4,
    rows = 3;
  const pw = (width - 0.5) / cols,
    pd = (depth - 0.5) / rows;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      items.push(
        box(
          [pw - 0.06, pd - 0.06, 0.04],
          [
            x - (width - 0.5) / 2 + pw * (c + 0.5),
            y - (depth - 0.5) / 2 + pd * (r + 0.5),
            height + 0.14,
          ],
          gloss(colour("#2b3440"), 0.07),
          0.008,
          false,
        ),
      );
  return items;
}

/* ---------- Planting ---------- */

const FOLIAGE = (tone = 1): Material => ({
  kind: CLAY,
  color: [WHITE[0] * tone, WHITE[1] * tone, WHITE[2] * tone],
  p: [0, 0, 0, 0.22],
});
/** A model tree: a thin trunk under a crown of pale foam. */
export function tree(at: V3, height = 5, seed = 1): Item[] {
  const crown = height * 0.27;
  const mesh = kept(`tree ${seed % 4}`, () =>
    merge([
      [ball([1, 1, 1.15], 0.5, seed * 7 + 1, 12, 16), translate(0, 0, 0)],
      [
        ball([0.72, 0.7, 0.8], 0.5, seed * 7 + 2, 10, 14),
        translate(0.55, 0.3, -0.35),
      ],
      [
        ball([0.68, 0.72, 0.75], 0.5, seed * 7 + 3, 10, 14),
        translate(-0.5, -0.35, -0.4),
      ],
      [
        ball([0.6, 0.6, 0.7], 0.5, seed * 7 + 4, 10, 14),
        translate(-0.2, 0.5, 0.45),
      ],
    ]),
  );
  return [
    {
      mesh: kept("trunk", () => post(0.5, 1, 0.02, 10)),
      at: compose(
        translate(at[0], at[1], 0),
        scale(height * 0.022, height * 0.022, height * 0.62),
      ),
      mat: clay(STONE),
    },
    {
      mesh,
      at: compose(
        translate(at[0], at[1], height * 0.72),
        rotateZ(seed * 1.7),
        scale(crown),
      ),
      mat: FOLIAGE(),
      shades: false,
    },
  ];
}
/** A clipped hedge. */
export function hedge(at: V3, length: number, width = 0.9, height = 0.8): Item {
  return box([length, width, height], at, FOLIAGE(0.97), 0.16);
}

/* ---------- Charging ---------- */

/** A public fast charger: a tall slim post with a dark face. */
export function charger(at: V3, heading = 0): Item[] {
  const m = compose(translate(at[0], at[1], 0), rotateZ(heading));
  return [
    box([0.3, 0.62, 2.0], m, clay(), 0.07),
    box(
      [0.02, 0.36, 0.9],
      compose(m, translate(0.15, 0, 0.9)),
      gloss(colour("#2a2d31"), 0.06),
      0.008,
      false,
    ),
    box([0.7, 1.0, 0.1], compose(m, translate(0, 0, 0)), clay(STONE), 0.03),
  ];
}
/** Where a charger's cable leaves it, in the world. */
export const chargerHolster = (at: V3, heading = 0): V3 =>
  transform(
    compose(translate(at[0], at[1], 0), rotateZ(heading)),
    [0.17, 0.2, 1.25],
  );

/** A cable hanging between two points, as a tube rebuilt each frame. */
export function cable(
  slot: string,
  from: V3,
  to: V3,
  sag: number,
  mat: Material = gloss(colour("#26282b"), 0.04),
  radius = 0.02,
): Item {
  const path: V3[] = [];
  for (let i = 0; i <= 18; i++) {
    const f = i / 18;
    path.push([
      lerp(from[0], to[0], f),
      lerp(from[1], to[1], f),
      Math.max(0.03, lerp(from[2], to[2], f) - sag * 4 * f * (1 - f)),
    ]);
  }
  return { mesh: { ...tube(path, radius, 8), slot }, at: identity(), mat };
}

/* ---------- People ---------- */

const limb = (top: number, bottom: number, length: number) =>
  turned(
    [
      [0, -length - bottom],
      [bottom * 0.72, -length - bottom * 0.7],
      [bottom, -length],
      [top, 0],
      [top * 0.72, top * 0.7],
      [0, top],
    ],
    12,
  );
type Figure = {
  torso: Mesh;
  head: Mesh;
  thigh: Mesh;
  shin: Mesh;
  foot: Mesh;
  upperArm: Mesh;
  forearm: Mesh;
};
let figure: Figure | undefined;
function figureMeshes(): Figure {
  figure ??= {
    torso: merge([
      [
        turned(
          [
            [0, 0],
            [0.13, 0],
            [0.168, 0.07],
            [0.16, 0.24],
            [0.196, 0.44],
            [0.2, 0.52],
            [0.13, 0.6],
            [0.062, 0.625],
            [0.056, 0.7],
            [0, 0.7],
          ],
          18,
        ),
        scale(0.62, 1, 1),
      ],
    ]),
    head: ball([0.1, 0.088, 0.118], 0, 1, 10, 14),
    thigh: limb(0.082, 0.062, 0.42),
    shin: limb(0.06, 0.044, 0.41),
    foot: block(0.25, 0.095, 0.07, 0.03),
    upperArm: limb(0.052, 0.042, 0.29),
    forearm: limb(0.042, 0.034, 0.27),
  };
  return figure;
}
/**
 * A person as a model-maker's figure, 1.74 m tall, facing +x of `at`.
 * `stride` is where they are in a walking step, in radians; `walking` 0–1 is
 * how much of a walk shows, so 0 stands still.
 */
export function person(
  at: M4,
  stride = 0,
  walking = 0,
  mat: Material = clay(),
): Item[] {
  const f = figureMeshes();
  const swing = (a: number) => rotateY(-a);
  const bob = 0.022 * walking * Math.abs(Math.cos(stride));
  const root = compose(at, translate(0, 0, 0.9 - bob));
  const items: Item[] = [
    { mesh: f.torso, at: compose(root, swing(0.05 * walking)), mat },
    { mesh: f.head, at: compose(root, translate(0.015, 0, 0.79)), mat },
  ];
  for (const side of [1, -1]) {
    const phase = stride + (side > 0 ? 0 : Math.PI);
    const hip = 0.5 * walking * Math.sin(phase);
    const knee = 0.95 * walking * Math.max(0, Math.cos(phase - 0.35)) ** 1.5;
    const thigh = compose(root, translate(0, side * 0.09, 0), swing(hip));
    const shin = compose(thigh, translate(0, 0, -0.42), swing(-knee));
    items.push(
      { mesh: f.thigh, at: thigh, mat },
      { mesh: f.shin, at: shin, mat },
      {
        mesh: f.foot,
        at: compose(shin, translate(0.07, 0, -0.5)),
        mat,
      },
    );
    const shoulder = -0.36 * walking * Math.sin(phase);
    const elbow = 0.18 + 0.3 * walking * Math.max(0, -Math.sin(phase));
    const upper = compose(
      root,
      translate(0, side * 0.225, 0.5),
      rotateX(side * 0.07),
      swing(shoulder),
    );
    items.push(
      { mesh: f.upperArm, at: upper, mat },
      {
        mesh: f.forearm,
        at: compose(upper, translate(0, 0, -0.29), swing(elbow)),
        mat,
      },
    );
  }
  return items;
}

/* ---------- Surroundings ---------- */

/**
 * The town round a scene's subject, as the camera sees it. A wide plate has
 * room at its sides, not above, so most of it stands to the left and right:
 * a house, trees, a hedge and a few people each side, with a taller block and
 * more trees further back for a square plate. Everything is placed by how far
 * right of the subject it sits and how far behind it, for a camera standing
 * at `az`; nothing comes within `clear` metres across, and nothing stands in
 * front. `houses` off leaves the buildings out where a scene has its own.
 */
export function surroundings(
  subject: V3,
  az: number,
  clear = 7,
  seed = 1,
  houses = true,
): Item[] {
  const a = (az * Math.PI) / 180;
  const right: [number, number] = [-Math.sin(a), Math.cos(a)],
    back: [number, number] = [-Math.cos(a), -Math.sin(a)];
  const at = (across: number, behind: number): V3 => [
    subject[0] + right[0] * across + back[0] * behind,
    subject[1] + right[1] * across + back[1] * behind,
    0,
  ];
  const r = (n: number) => {
    const v = Math.sin((seed * 31 + n) * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const items: Item[] = [];
  if (houses)
    items.push(
      ...house(at(-clear - 9, 6 + 2 * r(1)), 10 + 2 * r(2), 7, r(3) > 0.4),
      ...house(at(clear + 10, 8 + 2 * r(4)), 11, 7.5, r(5) > 0.5),
      ...mass(at(-3 + 4 * r(6), 30), [16, 12, 9 + 4 * r(7)]),
      ...mass(at(-clear - 26, 14), [12, 10, 6]),
      ...mass(at(clear + 27, 18), [13, 11, 7]),
    );
  const trees: [number, number][] = [
    [-clear - 1.5, 4.5],
    [-clear - 4.5, -0.5],
    [-clear - 15, 1],
    [clear + 2, 5.5],
    [clear + 5.5, 0.5],
    [clear + 17, 3],
    [-5, 15],
    [6, 17],
    [-16, 16],
    [18, 19],
  ];
  trees.forEach(([across, behind], i) =>
    items.push(
      ...tree(
        at(across + 1.5 * r(10 + i), behind + 1.5 * r(20 + i)),
        3.6 + 1.8 * r(30 + i),
        i + seed,
      ),
    ),
  );
  for (const [across, behind, long] of [
    [-clear - 2.5, 2, 4],
    [clear + 3.5, 2.8, 5],
  ] as const)
    items.push(
      box(
        [long, 0.8, 0.7],
        at(across, behind),
        clay(WHITE, { p: [0, 0, 0, 0.22] }),
        0.16,
      ),
    );
  const people: [number, number, number][] = [
    [-clear - 0.6, 0.6, 0.4],
    [-clear - 1.3, 1.1, 3.6],
    [clear + 1.2, 1.4, 2.4],
    [clear + 7, 3.5, 5.2],
    [-clear - 7, 3, 1.2],
  ];
  people.forEach(([across, behind, facing]) => {
    const p = at(across, behind);
    items.push(
      ...person(compose(translate(p[0], p[1], 0), rotateZ(facing)), 0, 0),
    );
  });
  return items;
}
