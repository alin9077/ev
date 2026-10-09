/**
 * Smaller things the B scenes set down in the white town: luggage and
 * shopping, coins, a home charger, a row of public ones, a café to wait at,
 * and the three places a car keeps its load.
 */
import { carPoint, type CarModel } from "./car";
import { CLAY, type Item, type Lighting, type Material } from "./gl";
import {
  DEG,
  about,
  colour,
  compose,
  curve,
  lerp,
  mix3,
  rotateY,
  rotateZ,
  scale,
  translate,
  unit,
  type M4,
  type V3,
} from "./math";
import { post, turned } from "./mesh";
import { DAYLIGHT } from "./stage";
import {
  ASPHALT,
  STONE,
  WARM,
  WHITE,
  box,
  charger,
  clay,
  gloss,
  glow,
  kept,
  person,
  ribbon,
} from "./world";

const DARK = colour("#2a2d31");
export const TAN = colour("#d9c3a0");

/* ---------- Light ---------- */

const NIGHT: Lighting = {
  sun: unit([-0.5, -0.8, 0.9]),
  sunColour: [0.2, 0.23, 0.33],
  sky: [0.4, 0.45, 0.6],
  bounce: [0.3, 0.32, 0.4],
  ground: [0.4, 0.43, 0.52],
  soft: 0.34,
  shade: [1.0, 0.9],
  grain: 0.012,
};
/** Daylight, turned down towards a clear night: 0 is day, 1 is night. */
export function evening(amount: number): Lighting {
  const k = Math.min(1, Math.max(0, amount));
  if (k <= 0.001) return DAYLIGHT;
  return {
    sun: unit(mix3(DAYLIGHT.sun, NIGHT.sun, k)),
    sunColour: mix3(DAYLIGHT.sunColour, NIGHT.sunColour, k),
    sky: mix3(DAYLIGHT.sky, NIGHT.sky, k),
    bounce: mix3(DAYLIGHT.bounce, NIGHT.bounce, k),
    ground: mix3(DAYLIGHT.ground, NIGHT.ground, k),
    soft: lerp(DAYLIGHT.soft, NIGHT.soft, k),
    shade: [
      lerp(DAYLIGHT.shade[0], NIGHT.shade[0], k),
      lerp(DAYLIGHT.shade[1], NIGHT.shade[1], k),
    ],
    grain: DAYLIGHT.grain,
  };
}

/* ---------- Things people carry ---------- */

/** An upright suitcase with a handle; `at` is the middle of its base. */
export function suitcase(
  at: M4,
  size: V3 = [0.46, 0.26, 0.66],
  mat = clay(TAN),
) {
  return [
    box(size, at, mat, 0.05),
    box(
      [size[0] * 0.42, 0.03, 0.07],
      compose(at, translate(0, 0, size[2])),
      clay(STONE),
      0.012,
    ),
  ];
}
/** A soft bag lying down. */
export const holdall = (at: M4, mat = clay(WHITE)): Item[] => [
  box([0.62, 0.3, 0.3], at, mat, 0.11),
  box([0.3, 0.04, 0.05], compose(at, translate(0, 0, 0.3)), clay(STONE), 0.015),
];
/** A paper shopping bag. */
export const shoppingBag = (at: M4, mat = clay(TAN)): Item =>
  box([0.3, 0.15, 0.36], at, mat, 0.03);
/**
 * A person with a shopping bag in each hand: the bags hang from the hands
 * and swing a little with the walk. `carrying` 0 drops the bags from view.
 */
export function shopper(
  at: M4,
  stride = 0,
  walking = 0,
  carrying = 1,
  mat: Material = clay(),
): Item[] {
  const items = person(at, stride, walking, mat);
  if (carrying > 0.5)
    for (const side of [1, -1]) {
      const swing =
        0.07 * walking * Math.sin(stride + (side > 0 ? Math.PI : 0));
      items.push(
        shoppingBag(compose(at, translate(0.04 + swing, side * 0.3, 0.26))),
      );
    }
  return items;
}

/** A stack of coins standing on the ground: `count` may be fractional as it grows. */
export function coins(
  at: V3,
  count: number,
  mat = gloss(colour("#e2b23c"), 0.08),
) {
  const items: Item[] = [];
  const disc = kept("coin", () => post(0.26, 0.058, 0.012, 28));
  for (let k = 0; k < count; k++) {
    const part = Math.min(1, count - k);
    items.push({
      mesh: disc,
      at: compose(
        translate(at[0], at[1], at[2] + k * 0.066),
        rotateZ(k * 0.7),
        scale(lerp(0.4, 1, part), lerp(0.4, 1, part), 1),
      ),
      mat,
    });
  }
  return items;
}

/* ---------- Charging ---------- */

/** A home charger on its own slim post, cable side facing +x of its heading. */
export function wallbox(at: V3, heading = 0): Item[] {
  const m = compose(translate(at[0], at[1], 0), rotateZ(heading));
  return [
    box([0.1, 0.1, 1.5], m, clay(), 0.02),
    box([0.14, 0.3, 0.42], compose(m, translate(0.02, 0, 0.98)), clay(), 0.04),
    box(
      [0.02, 0.2, 0.2],
      compose(m, translate(0.1, 0, 1.1)),
      gloss(DARK, 0.06),
      0.006,
      false,
    ),
  ];
}
/** Where a home charger's cable leaves it. */
export const wallboxHolster = (at: V3, heading = 0): V3 => {
  const c = Math.cos(heading),
    s = Math.sin(heading);
  return [at[0] + 0.12 * c, at[1] + 0.12 * s, 1.02];
};
/**
 * A row of public fast chargers along x, one at the head of each bay, with
 * the bays marked out beyond them (towards +y). `at` is the first post.
 */
export function chargingSite(at: V3, stalls = 5, pitch = 3.1): Item[] {
  const [x, y] = at;
  const long = (stalls - 1) * pitch;
  const items: Item[] = [
    box(
      [long + pitch + 3, 13.5, 0.02],
      [x + long / 2, y + 6.2, 0],
      clay(ASPHALT),
      0.004,
      false,
    ),
    box(
      [long + pitch + 1, 1.3, 0.13],
      [x + long / 2, y - 0.55, 0],
      clay(),
      0.04,
    ),
  ];
  for (let k = 0; k < stalls; k++) {
    items.push(...charger([x + k * pitch, y, 0], 90 * DEG));
    items.push(
      box([0.9, 0.16, 0.1], [x + k * pitch, y + 0.95, 0], clay(), 0.04),
    );
  }
  for (let k = 0; k <= stalls; k++) {
    const lx = x - pitch / 2 + k * pitch;
    items.push(
      ribbon(
        `site line ${x} ${y} ${k}`,
        [
          [lx, y + 0.3],
          [lx, y + 5.9],
        ],
        0.11,
        WHITE,
        0.95,
      ),
    );
  }
  return items;
}

/** A café: a low glazed room under a deep awning, tables out in front (−y). */
export function cafe(at: V3, width = 9): Item[] {
  const [x, y] = at;
  const glazing: Material = {
    kind: CLAY,
    color: WARM,
    color2: colour("#ffd9a0"),
    p: [0.2, 0.2, 0, 0],
  };
  const items: Item[] = [
    box([width, 5, 3.1], [x, y, 0]),
    box([width + 0.6, 7.4, 0.24], [x, y - 1.1, 3.1]),
    box([width - 1, 0.1, 2.2], [x, y - 2.52, 0.3], glazing, 0.02, false),
  ];
  for (const sx of [-1, 1])
    items.push({
      mesh: kept("awning post", () => post(0.06, 3.1, 0.01, 10)),
      at: translate(x + sx * (width / 2 + 0.05), y - 4.5, 0),
      mat: clay(),
    });
  const table = kept("table", () =>
    turned(
      [
        [0, 0],
        [0.2, 0],
        [0.2, 0.03],
        [0.035, 0.05],
        [0.035, 0.7],
        [0.42, 0.7],
        [0.42, 0.74],
        [0, 0.74],
      ],
      20,
    ),
  );
  [-0.3, 0.14, 0.42].forEach((f, i) => {
    const tx = x + f * width,
      ty = y - 3.9 - (i % 2) * 0.5;
    items.push({ mesh: table, at: translate(tx, ty, 0), mat: clay() });
    for (const side of [-1, 1])
      items.push(
        box([0.38, 0.38, 0.45], [tx + side * 0.78, ty, 0], clay(STONE), 0.05),
      );
  });
  return items;
}

/* ---------- Where a car keeps its load ---------- */

export type Stores = {
  at: M4;
  /** 0 flat – 1 raised: the boot floor, hinged behind the seats. */
  floor?: number;
  /** 0–1 each: how strongly each space is picked out in colour. */
  frunk?: number;
  boot?: number;
  well?: number;
  tint?: V3;
};
/** Station, half-width and heights of the three spaces, in the car's own frame. */
export const STORE = {
  frunk: { from: 0.44, to: 1.04, half: 0.47, low: 0.56, high: 0.84 },
  boot: { from: 3.84, to: 4.6, half: 0.5, low: 0.64, high: 1.02 },
  /** Under the rear half of the boot floor, which is its lid. */
  well: { from: 4.2, to: 4.58, half: 0.42, low: 0.33, high: 0.62 },
};
type Space = (typeof STORE)[keyof typeof STORE];
/** An open-topped tray: a floor and four thin walls. */
function tray(model: CarModel, at: M4, space: Space, mat: Material): Item[] {
  const long = space.to - space.from,
    deep = space.high - space.low;
  const mid = carPoint(model, (space.from + space.to) / 2, 0, space.low);
  const put = (size: V3, dx: number, dy: number) =>
    box(
      size,
      compose(at, translate(mid[0] + dx, mid[1] + dy, mid[2])),
      mat,
      0.012,
      false,
    );
  return [
    put([long, space.half * 2, 0.03], 0, 0),
    put([0.03, space.half * 2, deep], long / 2, 0),
    put([0.03, space.half * 2, deep], -long / 2, 0),
    put([long, 0.03, deep], 0, space.half),
    put([long, 0.03, deep], 0, -space.half),
  ];
}
/** The middle of a space, in the world: for labels and for things going in. */
export const storePoint = (model: CarModel, space: Space, lift = 0): V3 =>
  carPoint(model, (space.from + space.to) / 2, 0, space.high + lift);
/**
 * The front trunk's tub, the boot's floor, and the well under it. Drawn
 * inside the shell, so they show when a panel opens or the shell turns to glass.
 */
export function stores(model: CarModel, state: Stores): Item[] {
  const { at } = state;
  const liner = clay(colour("#8f9196"));
  const items: Item[] = [
    ...tray(model, at, STORE.frunk, liner),
    ...tray(model, at, STORE.well, liner),
  ];
  // The boot floor: a fixed front half, and a rear half that lifts as the
  // well's lid. Behind the floor, the back of the rear seats.
  const b = STORE.boot,
    w = STORE.well;
  const floor = clay(colour("#a4a6aa"));
  const front = carPoint(model, (b.from + w.from) / 2, 0, b.low - 0.03);
  const lid = carPoint(model, (w.from + b.to) / 2, 0, b.low - 0.03);
  const hinge = carPoint(model, w.from, 0, b.low);
  const back = carPoint(model, b.from - 0.05, 0, b.low - 0.03);
  items.push(
    box(
      [w.from - b.from, b.half * 2, 0.03],
      compose(at, translate(front[0], front[1], front[2])),
      floor,
      0.01,
      false,
    ),
    box(
      [b.to - w.from, b.half * 2, 0.03],
      compose(
        at,
        about(hinge, rotateY((state.floor ?? 0) * 62 * DEG)),
        translate(lid[0], lid[1], lid[2]),
      ),
      floor,
      0.01,
      false,
    ),
    box(
      [0.07, b.half * 2 + 0.2, 0.46],
      compose(at, translate(back[0], back[1], back[2])),
      clay(colour("#6d6f73")),
      0.03,
      false,
    ),
  );
  // Each space as a block of colour, for the cutaway.
  const tint = state.tint ?? colour("#e9ad1f");
  for (const [space, amount] of [
    [STORE.frunk, state.frunk],
    [STORE.boot, state.boot],
    [STORE.well, state.well],
  ] as const) {
    if (!amount || amount < 0.01) continue;
    const p = carPoint(model, (space.from + space.to) / 2, 0, space.low + 0.03);
    items.push(
      box(
        [
          space.to - space.from - 0.06,
          space.half * 2 - 0.06,
          space.high - space.low - 0.05,
        ],
        compose(at, translate(p[0], p[1], p[2])),
        glow(tint, 0.9, 0.55 * amount),
        0.03,
        false,
      ),
    );
  }
  return items;
}
/** The top of the bonnet over the front trunk, for a label's tie. */
export const bonnetTop = (model: CarModel): V3 =>
  carPoint(model, 0.74, 0, curve(model.shape.top)(0.74));
