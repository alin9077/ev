/**
 * The car in the B scenes, built to scale from its real dimensions: a body
 * lofted through cross-sections along its length, with glass, lamps, trim and
 * shut lines laid on by the material rather than cut into the mesh. Two
 * shapes: the mid-size fastback SUV the page is about, and a plainer,
 * squarer SUV that stands in for whichever alternative is selected.
 * Conceptual: no badge, wordmark or manufacturer interface is drawn.
 */
import { BODY, CLAY, GLOSS, WHEEL, type Item, type Material } from "./gl";
import {
  DEG,
  about,
  clamp,
  compose,
  cross,
  curve,
  lerp,
  rotateX,
  rotateY,
  rotateZ,
  scale,
  smooth,
  sub,
  transform,
  translate,
  unit,
  type M4,
  type V2,
  type V3,
} from "./math";
import { Shape, block, merge, post, turned, type Mesh } from "./mesh";

/** A car's shape: measured stations, in metres, nose (s = 0) to tail. */
export type CarShape = {
  length: number;
  frontAxle: number;
  rearAxle: number;
  track: number;
  wheelR: number;
  rimR: number;
  tyreW: number;
  archR: number;
  /** Heights along the centreline: the top surface and the underside. */
  top: V2[];
  under: V2[];
  /** Half-width at the widest point of the flank, and how high that is. */
  waist: V2[];
  waistZ: V2[];
  /** Height of the shoulder, where the flank turns in, and how far in it sits. */
  shoulder: V2[];
  tuck: V2[];
  /** The roof rail: half-width all along, height through the glasshouse. */
  railW: V2[];
  railZ: V2[];
  /** The side glass: where it starts, where its sill kicks up, and its rear tip. */
  glassFront: number;
  glassKick: number;
  glassTip: number;
  /** Where the bonnet meets the screen, screen meets roof, the tailgate hinges, and the glass ends. */
  cowl: number;
  header: number;
  hinge: number;
  spoiler: number;
  /** Heights of the lamp bars across the nose and tail. */
  noseBar: number;
  tailBar: number;
};

/** Mid-size electric fastback SUV: 4.79 m long, 1.92 wide, 1.62 high, 2.89 wheelbase. */
export const FASTBACK: CarShape = {
  length: 4.79,
  frontAxle: 0.865,
  rearAxle: 3.755,
  track: 1.636,
  wheelR: 0.356,
  rimR: 0.252,
  tyreW: 0.255,
  archR: 0.392,
  top: [
    [0, 0.7],
    [0.012, 0.75],
    [0.04, 0.79],
    [0.1, 0.83],
    [0.25, 0.885],
    [0.45, 0.935],
    [0.7, 0.985],
    [0.95, 1.02],
    [1.1, 1.04],
    [1.25, 1.115],
    [1.45, 1.228],
    [1.7, 1.368],
    [1.9, 1.472],
    [2.05, 1.543],
    [2.15, 1.58],
    [2.35, 1.613],
    [2.55, 1.624],
    [2.95, 1.616],
    [3.3, 1.594],
    [3.65, 1.55],
    [4.0, 1.476],
    [4.3, 1.39],
    [4.5, 1.325],
    [4.6, 1.29],
    [4.66, 1.25],
    [4.71, 1.16],
    [4.75, 1.04],
    [4.78, 0.92],
    [4.79, 0.8],
  ],
  under: [
    [0, 0.36],
    [0.012, 0.3],
    [0.04, 0.25],
    [0.1, 0.215],
    [0.22, 0.19],
    [0.45, 0.175],
    [0.8, 0.17],
    [3.9, 0.17],
    [4.25, 0.2],
    [4.5, 0.25],
    [4.66, 0.29],
    [4.71, 0.32],
    [4.75, 0.36],
    [4.78, 0.41],
    [4.79, 0.46],
  ],
  waist: [
    [0, 0.3],
    [0.012, 0.38],
    [0.04, 0.49],
    [0.1, 0.62],
    [0.2, 0.745],
    [0.35, 0.845],
    [0.55, 0.91],
    [0.89, 0.958],
    [1.6, 0.955],
    [2.4, 0.953],
    [3.2, 0.957],
    [3.78, 0.96],
    [4.2, 0.952],
    [4.45, 0.915],
    [4.62, 0.845],
    [4.72, 0.755],
    [4.77, 0.64],
    [4.79, 0.5],
  ],
  waistZ: [
    [0, 0.56],
    [0.3, 0.7],
    [0.89, 0.78],
    [1.6, 0.74],
    [3.0, 0.76],
    [3.78, 0.82],
    [4.4, 0.84],
    [4.79, 0.64],
  ],
  shoulder: [
    [0, 0.68],
    [0.012, 0.73],
    [0.04, 0.77],
    [0.1, 0.805],
    [0.25, 0.848],
    [0.45, 0.9],
    [0.7, 0.958],
    [0.95, 1.012],
    [1.2, 1.06],
    [1.35, 1.095],
    [1.6, 1.112],
    [2.2, 1.132],
    [2.8, 1.165],
    [3.4, 1.215],
    [3.8, 1.25],
    [4.1, 1.27],
    [4.35, 1.272],
    [4.5, 1.262],
    [4.6, 1.236],
    [4.66, 1.185],
    [4.71, 1.1],
    [4.75, 0.99],
    [4.78, 0.88],
    [4.79, 0.775],
  ],
  tuck: [
    [0, 0.05],
    [0.3, 0.16],
    [0.6, 0.25],
    [0.89, 0.28],
    [1.1, 0.24],
    [1.27, 0.19],
    [1.5, 0.115],
    [1.8, 0.082],
    [2.6, 0.078],
    [3.3, 0.082],
    [3.78, 0.12],
    [4.2, 0.16],
    [4.5, 0.15],
    [4.79, 0.06],
  ],
  railW: [
    [0, 0.2],
    [0.3, 0.45],
    [0.9, 0.6],
    [1.27, 0.69],
    [1.45, 0.695],
    [1.65, 0.69],
    [1.85, 0.68],
    [2.0, 0.665],
    [2.12, 0.655],
    [2.35, 0.635],
    [2.6, 0.62],
    [2.95, 0.61],
    [3.3, 0.59],
    [3.65, 0.56],
    [4.0, 0.525],
    [4.3, 0.5],
    [4.5, 0.5],
    [4.6, 0.54],
    [4.7, 0.6],
    [4.79, 0.4],
  ],
  railZ: [
    [1.27, 1.085],
    [1.45, 1.165],
    [1.65, 1.27],
    [1.85, 1.372],
    [2.0, 1.448],
    [2.12, 1.508],
    [2.35, 1.556],
    [2.6, 1.575],
    [2.95, 1.571],
    [3.3, 1.551],
    [3.65, 1.507],
    [4.0, 1.432],
    [4.3, 1.345],
    [4.5, 1.28],
    [4.6, 1.25],
  ],
  glassFront: 1.46,
  glassKick: 3.5,
  glassTip: 4.1,
  cowl: 1.27,
  header: 2.1,
  hinge: 3.72,
  spoiler: 4.5,
  noseBar: 0.765,
  tailBar: 1.1,
};

/** The stand-in for an alternative: the same footprint under an upright, square-backed roof. */
export const SQUAREBACK: CarShape = {
  ...FASTBACK,
  top: [
    ...FASTBACK.top.filter(([s]) => s <= 1.2),
    [1.35, 1.2],
    [1.55, 1.325],
    [1.8, 1.475],
    [2.0, 1.58],
    [2.1, 1.622],
    [2.3, 1.662],
    [2.6, 1.682],
    [3.2, 1.688],
    [3.8, 1.678],
    [4.2, 1.656],
    [4.42, 1.618],
    [4.55, 1.545],
    [4.64, 1.42],
    [4.7, 1.27],
    [4.745, 1.1],
    [4.775, 0.93],
    [4.79, 0.8],
  ],
  railZ: [
    [1.3, 1.09],
    [1.45, 1.18],
    [1.65, 1.3],
    [1.85, 1.42],
    [2.0, 1.51],
    [2.12, 1.572],
    [2.35, 1.616],
    [2.6, 1.636],
    [3.2, 1.642],
    [3.8, 1.632],
    [4.2, 1.61],
    [4.42, 1.572],
    [4.55, 1.5],
    [4.62, 1.4],
  ],
  railW: FASTBACK.railW.map(([s, w]): V2 => [
    s,
    s > 1.3 && s < 4.65 ? Math.max(w, 0.62) + 0.04 : w,
  ]),
  shoulder: FASTBACK.shoulder.map(([s, z]): V2 => [
    s,
    s > 1.6 && s < 4.62 ? Math.min(z, 1.16) : z,
  ]),
  // A squarer body: its wings and haunches stand nearly upright.
  tuck: FASTBACK.tuck.map(([s, t]): V2 => [s, Math.min(t, 0.1)]),
  glassKick: 3.95,
  glassTip: 4.46,
  hinge: 4.3,
  spoiler: 4.5,
};

type Ring = { y: number; z: number; q: number }[];
type Section = (s: number) => Ring;

/** Height of the roof rail at a station, where the glasshouse stands. */
function railOf(shape: CarShape) {
  const top = curve(shape.top),
    shoulder = curve(shape.shoulder),
    railZ = curve(shape.railZ);
  const [from, to] = [
    shape.railZ[0][0],
    shape.railZ[shape.railZ.length - 1][0],
  ];
  return (s: number) => {
    const zt = top(s),
      zs = Math.min(shoulder(s), zt - 0.004);
    // Ahead of the screen and behind the glass the rail is only a line on
    // the bonnet or the tail; between them it lifts into the roof's edge.
    const lifted =
      smooth(clamp((s - from) / 0.1)) * (1 - smooth(clamp((s - to) / 0.08)));
    return {
      lifted,
      zr: clamp(
        lerp(zs + 0.55 * (zt - zs), railZ(s), lifted),
        zs + 0.002,
        zt - 0.002,
      ),
    };
  };
}
/** Lower and upper edges of the side glass at a station. */
function glassOf(shape: CarShape) {
  const shoulder = curve(shape.shoulder),
    rail = railOf(shape);
  return (s: number): V2 => {
    const high = rail(s).zr - 0.032,
      sill = shoulder(s) + 0.024;
    // The sill sweeps up to meet the roof at the rear tip.
    const kick =
      clamp((s - shape.glassKick) / (shape.glassTip - shape.glassKick)) ** 1.8;
    const low = lerp(sill, high, kick);
    const lead = clamp((s - shape.glassFront) / 0.06);
    const mid = (low + high) / 2;
    return [lerp(mid, low, lead), lerp(mid, high, lead)];
  };
}

/** A straight line through a list of corners, each rounded off. */
function sectionOf(shape: CarShape): Section {
  const top = curve(shape.top),
    under = curve(shape.under),
    waist = curve(shape.waist),
    waistZ = curve(shape.waistZ),
    shoulder = curve(shape.shoulder),
    tuck = curve(shape.tuck),
    railW = curve(shape.railW),
    rail = railOf(shape);
  return (s) => {
    const zt = top(s),
      zb = under(s),
      zs = Math.min(shoulder(s), zt - 0.004),
      ww = waist(s);
    const zw = clamp(waistZ(s), zb + 0.03, zs - 0.03);
    const wsh = ww - tuck(s);
    const wr = Math.min(railW(s), wsh - 0.02);
    const { lifted, zr } = rail(s);
    const corners: V2[] = [
      [0, zb],
      [ww - 0.045, zb],
      [ww, zw],
      [wsh, zs],
      [wr, zr],
      [0, zt],
    ];
    // How far each corner's rounding reaches back along the way in, and on
    // along the way out. The roof rail is a broad shoulder: short up the
    // glass, long across the roof.
    const into = [0, 0.07, 0.34, lerp(0.085, 0.05, lifted), 0.036, 0],
      onto = [0, 0.07, 0.34, lerp(0.085, 0.05, lifted), 0.07, 0];
    const counts = { line: [2, 3, 3, 5, 7], arc: [0, 4, 8, 4, 4] };
    // Where each rounded corner starts and ends.
    const starts: V2[] = [],
      ends: V2[] = [];
    for (let i = 1; i <= 4; i++) {
      const [a, b, c] = [corners[i - 1], corners[i], corners[i + 1]];
      const lin = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6,
        lout = Math.hypot(c[0] - b[0], c[1] - b[1]) || 1e-6;
      const tin = Math.min(into[i], 0.48 * lin),
        tout = Math.min(onto[i], 0.48 * lout);
      starts[i] = [
        b[0] - ((b[0] - a[0]) / lin) * tin,
        b[1] - ((b[1] - a[1]) / lin) * tin,
      ];
      ends[i] = [
        b[0] + ((c[0] - b[0]) / lout) * tout,
        b[1] + ((c[1] - b[1]) / lout) * tout,
      ];
    }
    const points: V2[] = [corners[0]];
    /** Indices where q reaches 1, 2 and 3: the middles of corners 1, 3 and 4. */
    const marks: number[] = [0];
    for (let i = 0; i <= 4; i++) {
      const a = i === 0 ? corners[0] : ends[i],
        b = i === 4 ? corners[5] : starts[i + 1];
      const n = counts.line[i];
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        if (i === 4) {
          // The roof is crowned, not folded: flat at the centreline.
          const y = lerp(a[0], 0, t);
          points.push([y, zt - (zt - a[1]) * Math.abs(y / (a[0] || 1)) ** 1.7]);
        } else points.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
      }
      if (i === 4) break;
      const corner = corners[i + 1],
        end = ends[i + 1],
        m = counts.arc[i + 1];
      for (let k = 1; k <= m; k++) {
        const t = k / m,
          u = 1 - t;
        points.push([
          u * u * b[0] + 2 * u * t * corner[0] + t * t * end[0],
          u * u * b[1] + 2 * u * t * corner[1] + t * t * end[1],
        ]);
        if (k === m / 2 && i + 1 !== 2) marks.push(points.length - 1);
      }
    }
    marks.push(points.length - 1);
    // q: which zone, and how far along it by length.
    const ring: Ring = [];
    for (let zone = 0; zone < 4; zone++) {
      const [a, b] = [marks[zone], marks[zone + 1]];
      let total = 0;
      const along: number[] = [0];
      for (let i = a + 1; i <= b; i++) {
        total += Math.hypot(
          points[i][0] - points[i - 1][0],
          points[i][1] - points[i - 1][1],
        );
        along.push(total);
      }
      for (let i = zone ? a + 1 : a; i <= b; i++)
        ring.push({
          y: points[i][0],
          z: points[i][1],
          q: zone + (total ? along[i - a] / total : 0),
        });
    }
    return ring;
  };
}

/** The body: a skin through every section, closed at nose and tail. */
function loft(shape: CarShape, stations: number, every = 1): Mesh {
  const section = sectionOf(shape);
  const glass = glassOf(shape);
  const nose = shape.frontAxle + (shape.rearAxle - shape.frontAxle) / 2;
  const out = new Shape();
  const rings: { p: V3; s: number; q: number }[][] = [];
  for (let j = 0; j < stations; j++) {
    const u = j / (stations - 1);
    // Stations crowd towards nose and tail, where the shape turns quickly.
    const s =
      shape.length * (0.25 * u + 0.75 * (0.5 - 0.5 * Math.cos(Math.PI * u)));
    const half = section(s).filter(
      (_, i, list) => i % every === 0 || i === list.length - 1,
    );
    const ring = half.map((pt) => ({
      p: [nose - s, pt.y, pt.z] as V3,
      s,
      q: pt.q,
    }));
    // The other side, from the roof back down to the floor.
    for (let i = half.length - 2; i >= 1; i--)
      ring.push({ p: [nose - s, -half[i].y, half[i].z], s, q: half[i].q });
    rings.push(ring);
  }
  const R = rings[0].length;
  for (let j = 0; j < stations; j++)
    for (let i = 0; i < R; i++) {
      const here = rings[j][i];
      const along = sub(
        rings[Math.min(stations - 1, j + 1)][i].p,
        rings[Math.max(0, j - 1)][i].p,
      );
      const round = sub(rings[j][(i + 1) % R].p, rings[j][(i + R - 1) % R].p);
      out.vertex(here.p, unit(cross(along, round)), [
        here.s,
        here.q,
        ...glass(here.s),
      ]);
    }
  for (let j = 0; j < stations - 1; j++)
    for (let i = 0; i < R; i++) {
      const k = (i + 1) % R;
      out.quad(j * R + i, (j + 1) * R + i, (j + 1) * R + k, j * R + k);
    }
  for (const [j, facing] of [
    [0, 1],
    [stations - 1, -1],
  ]) {
    const ring = rings[j];
    const mid: V3 = [
      ring[0].p[0],
      0,
      ring.reduce((sum, v) => sum + v.p[2], 0) / R,
    ];
    const centre = out.vertex(mid, [facing, 0, 0], [ring[0].s, 3.5, 0, 0]);
    for (let i = 0; i < R; i++) {
      const k = (i + 1) % R;
      if (facing > 0) out.tri(centre, j * R + i, j * R + k);
      else out.tri(centre, j * R + k, j * R + i);
    }
  }
  return out.done();
}

/** A wheel with its axle along y and its outer face towards +y. */
function wheelMesh(shape: CarShape, sides = 40): Mesh {
  const R = shape.wheelR,
    rim = shape.rimR,
    w = shape.tyreW / 2;
  const mesh = turned(
    [
      [0, -w],
      [R - 0.035, -w],
      [R - 0.008, -w + 0.02],
      [R, -w + 0.05],
      [R, w - 0.05],
      [R - 0.008, w - 0.02],
      [R - 0.035, w],
      [rim + 0.012, w - 0.004],
      [rim, w - 0.012],
      [rim - 0.012, w - 0.03],
      [rim - 0.04, w - 0.045],
      [0.08, w - 0.062],
      [0.05, w - 0.052],
      [0, w - 0.052],
    ],
    sides,
  );
  return merge([[mesh, rotateX(-90 * DEG)]]);
}

/** One seat: cushion, back and head restraint, facing +x, hips over the origin. */
function seatMesh(width: number): Mesh {
  return merge([
    [block(0.5, width, 0.15, 0.05), translate(0.04, 0, 0)],
    [
      block(0.13, width - 0.02, 0.62, 0.05),
      compose(translate(-0.24, 0, 0.08), rotateY(-17 * DEG)),
    ],
    [
      block(0.1, Math.min(0.27, width - 0.14), 0.18, 0.045),
      compose(translate(-0.43, 0, 0.7)),
    ],
  ]);
}

/** The housing over a wheel: half a drum, open towards the outside of the car. */
function wellMesh(shape: CarShape): Mesh {
  const r = shape.archR + 0.014;
  const drum = turned(
    [
      [0, 0.44],
      [r, 0.44],
      [r, 0.9],
    ],
    20,
    230 * DEG,
  );
  return merge([[drum, compose(rotateX(-90 * DEG), rotateZ(155 * DEG))]]);
}

export type CarModel = {
  shape: CarShape;
  body: Mesh;
  wheel: Mesh;
  well: Mesh;
  mirror: Mesh;
  seat: Mesh;
  seatSlim: Mesh;
  /** x of the nose in the car's own frame, whose origin is mid-wheelbase on the ground. */
  nose: number;
};
const models = new Map<CarShape, CarModel>();
/** Builds a shape's meshes once and keeps them. */
export function carModel(shape: CarShape = FASTBACK): CarModel {
  let model = models.get(shape);
  if (!model) {
    const body = loft(shape, 110);
    body.lo = loft(shape, 16, 4);
    const wheel = wheelMesh(shape);
    wheel.lo = merge([
      [
        post(shape.wheelR, shape.tyreW, 0.02, 10),
        compose(translate(0, -shape.tyreW / 2, 0), rotateX(-90 * DEG)),
      ],
    ]);
    model = {
      shape,
      body,
      wheel,
      well: wellMesh(shape),
      mirror: merge([
        [
          block(0.17, 0.11, 0.12, 0.048),
          compose(translate(-0.03, 0.115, -0.02), rotateZ(-14 * DEG)),
        ],
        [block(0.06, 0.1, 0.03, 0.012), translate(0, 0.035, 0.0)],
      ]),
      seat: seatMesh(0.5),
      seatSlim: seatMesh(0.38),
      nose: shape.frontAxle + (shape.rearAxle - shape.frontAxle) / 2,
    };
    models.set(shape, model);
  }
  return model;
}

export type CarState = {
  /** Where the car stands: its frame in the world. */
  at: M4;
  paint: V3;
  /** A plain model in one colour, with nothing glazed or lit. */
  clay?: boolean;
  /** 0–1: the shell fades to a glass outline so what is inside shows. */
  xray?: number;
  /** 0–1: lamps front and rear. */
  lamps?: number;
  tail?: number;
  /** Radians the wheels have rolled, and the front wheels' steering angle. */
  roll?: number;
  steer?: number;
  /** 0 folded – 1 out. */
  mirrors?: number;
  /** 0 shut – 1 fully raised. */
  tailgate?: number;
  /** Radians the body squats (+) or dives (−) on its springs. */
  pitch?: number;
};

/** Where a car's frame is in the world: position on the ground, and heading. */
export const placed = (x: number, y: number, heading = 0) =>
  compose(translate(x, y, 0), rotateZ(heading));

/** A point given by station, side and height, in the car's own frame. */
export const carPoint = (
  model: CarModel,
  s: number,
  y: number,
  z: number,
): V3 => [model.nose - s, y, z];
/** The same point in the world. */
export const onCar = (
  model: CarModel,
  at: M4,
  s: number,
  y: number,
  z: number,
) => transform(at, carPoint(model, s, y, z));

const RUBBER: V3 = [0.03, 0.03, 0.032],
  ALLOY: V3 = [0.3, 0.305, 0.31];

/** The shell, wheels and mirrors of a car, ready to draw. */
export function carItems(model: CarModel, state: CarState): Item[] {
  const { shape } = model;
  const xray = clamp(state.xray ?? 0),
    clay = state.clay ? 1 : 0,
    open = clamp(state.tailgate ?? 0);
  const body = compose(
    state.at,
    about([0, 0, 0.45], rotateY(-(state.pitch ?? 0))),
  );
  const paint = state.paint;
  const base = {
    kind: BODY,
    color: paint,
    p: [shape.frontAxle, shape.rearAxle, shape.wheelR, shape.archR],
    r: [shape.cowl, shape.header, shape.hinge, shape.spoiler],
    s: [shape.length, shape.noseBar, shape.tailBar, clay],
    ghost: xray,
    faces: xray > 0 ? ("both" as const) : ("outside" as const),
  };
  const q = (part: number) => [xray, state.lamps ?? 0, state.tail ?? 0, part];
  const items: Item[] = [];
  if (open > 0.002) {
    const hinge = carPoint(
      model,
      shape.hinge,
      0,
      curve(shape.top)(shape.hinge) - 0.03,
    );
    items.push(
      { mesh: model.body, at: body, mat: { ...base, q: q(1) } },
      {
        mesh: model.body,
        at: compose(body, about(hinge, rotateY(open * 76 * DEG))),
        mat: { ...base, q: q(2) },
      },
    );
  } else items.push({ mesh: model.body, at: body, mat: { ...base, q: q(0) } });

  // Inside the shell: a dark lining, so arches and an open tailgate show a
  // cabin, not the ground on the far side.
  const lining: Material = {
    kind: CLAY,
    color: clay
      ? [paint[0] * 0.4, paint[1] * 0.4, paint[2] * 0.4]
      : [0.035, 0.035, 0.038],
    alpha: 1 - xray,
    faces: "inside",
  };
  if (xray < 0.98)
    items.push({
      mesh: model.body,
      at: compose(body, translate(0, 0, 0.03), scale(0.985, 0.7, 0.955)),
      mat: lining,
      cast: false,
    });

  const wheelMat = {
    kind: WHEEL,
    color: clay
      ? ([paint[0] * 0.86, paint[1] * 0.86, paint[2] * 0.86] as V3)
      : ALLOY,
    color2: clay
      ? ([paint[0] * 0.5, paint[1] * 0.5, paint[2] * 0.5] as V3)
      : RUBBER,
    p: [shape.rimR, 5, 0, clay],
  };
  for (const [s, front] of [
    [shape.frontAxle, true],
    [shape.rearAxle, false],
  ] as const)
    for (const side of [1, -1]) {
      const y = side * (shape.track / 2 - shape.tyreW / 2);
      items.push({
        mesh: model.wheel,
        at: compose(
          state.at,
          translate(model.nose - s, y, shape.wheelR),
          rotateZ((front ? (state.steer ?? 0) : 0) + (side < 0 ? Math.PI : 0)),
          rotateY(side * (state.roll ?? 0)),
        ),
        mat: wheelMat,
      });
      if (xray < 0.98)
        items.push({
          mesh: model.well,
          at: compose(
            body,
            translate(model.nose - s, 0, shape.wheelR),
            scale(1, side, 1),
          ),
          mat: { ...lining, faces: "both" },
          cast: false,
        });
    }

  // Mirrors swing in against the glass when the car is locked.
  const out = clamp(state.mirrors ?? 1);
  for (const side of [1, -1]) {
    const at = shape.cowl + 0.45;
    const root = carPoint(
      model,
      at,
      side * (curve(shape.waist)(at) - curve(shape.tuck)(at) - 0.03),
      curve(shape.shoulder)(at) + 0.02,
    );
    items.push({
      mesh: model.mirror,
      at: compose(
        body,
        translate(root[0], root[1], root[2]),
        rotateZ(side * (1 - out) * 62 * DEG),
        scale(1, side, 1),
      ),
      mat: clay
        ? { kind: CLAY, color: paint, ghost: xray, faces: "both" }
        : {
            kind: GLOSS,
            color: paint,
            p: [0.05, 0.3, 0, 0],
            ghost: xray,
            faces: "both",
          },
    });
  }
  return items;
}

/* ---------- Inside the shell ---------- */

/** Where each seat's hips are, by station and side, and whether it is a narrow one. */
function seatPlan(seats: number): [number, number, boolean][] {
  const front: [number, number, boolean][] = [
    [2.2, 0.39, false],
    [2.2, -0.39, false],
  ];
  if (seats <= 4) return [...front, [3.12, 0.42, false], [3.12, -0.42, false]];
  if (seats === 5)
    return [
      ...front,
      [3.12, 0.47, false],
      [3.14, 0, true],
      [3.12, -0.47, false],
    ];
  const third: [number, number, boolean][] = [
    [3.92, 0.34, true],
    [3.92, -0.34, true],
  ];
  if (seats === 6)
    return [...front, [3.02, 0.42, false], [3.02, -0.42, false], ...third];
  return [
    ...front,
    [3.0, 0.47, false],
    [3.02, 0, true],
    [3.0, -0.47, false],
    ...third,
  ];
}
/** How one seat is shown: its colour, and a glow in a second colour. */
export type SeatLook = { color?: V3; glow?: V3; amount?: number };
export type CabinState = {
  at: M4;
  seats?: number;
  seat?: (index: number, row: number) => SeatLook;
  /** The battery: how full, 0–1, and the colour of its charge. */
  pack?: { fill: number; colour: V3; glow?: number };
  /** The centre screen: how brightly lit, and in what colour. */
  screen?: { lit: number; colour: V3 };
  /** Whether the motor and the driver's controls are picked out. */
  drive?: { lit: number; colour: V3 };
};
const TRIM: V3 = [0.5, 0.5, 0.5],
  DARK: V3 = [0.2, 0.2, 0.21];
const parts = new Map<string, Mesh>();
const part = (name: string, make: () => Mesh) => {
  let mesh = parts.get(name);
  if (!mesh) parts.set(name, (mesh = make()));
  return mesh;
};
/** Where the centre screen is, in the car's own frame. */
export const SCREEN_AT = (model: CarModel): V3 => carPoint(model, 1.9, 0, 1.03);
/** Seats, battery, screen and motor: what shows when the shell turns to glass. */
export function cabinItems(model: CarModel, state: CabinState): Item[] {
  const { at } = state;
  const items: Item[] = [];
  const here = (s: number, y: number, z: number, ...more: M4[]) =>
    compose(at, translate(model.nose - s, y, z), ...more);
  const plain = (color: V3, glow?: V3, amount = 0): Material => ({
    kind: CLAY,
    color,
    color2: glow ?? color,
    p: [amount, 0.1, amount * 0.6, 0],
  });

  // The floor is the battery: a slab between the axles.
  const packFrom = model.shape.frontAxle + 0.42,
    packTo = model.shape.rearAxle - 0.36;
  const length = packTo - packFrom;
  const fill = clamp(state.pack?.fill ?? 0);
  const cell = { q: [0.29, 0, 0, 0] };
  if (fill < 0.995)
    items.push({
      mesh: part("pack", () => block(1, 1.44, 0.13, 0.02)),
      at: here(
        packFrom + (length * (1 - fill)) / 2,
        0,
        0.18,
        scale(length * (1 - fill), 1, 1),
      ),
      mat: { ...plain(TRIM), ...cell },
      cast: false,
    });
  if (fill > 0.005 && state.pack)
    items.push({
      mesh: part("pack", () => block(1, 1.44, 0.13, 0.02)),
      at: here(
        packTo - (length * fill) / 2,
        0,
        0.18,
        scale(length * fill, 1, 1.04),
      ),
      mat: {
        ...plain(state.pack.colour, state.pack.colour, state.pack.glow ?? 0.35),
        ...cell,
      },
      cast: false,
    });

  const plan = seatPlan(state.seats ?? 5);
  let row = -1,
    last = -1;
  plan.forEach(([s, y, slim], index) => {
    if (Math.abs(s - last) > 0.3) row += 1;
    last = s;
    const look = state.seat?.(index, row) ?? {};
    items.push({
      mesh: slim ? model.seatSlim : model.seat,
      at: here(s, y, row === 0 ? 0.4 : 0.43),
      mat: plain(look.color ?? TRIM, look.glow, look.amount ?? 0),
      cast: false,
    });
  });

  // Dashboard, the screen standing on it, and the wheel in front of the driver.
  items.push({
    mesh: part("dash", () => block(0.34, 1.4, 0.16, 0.06)),
    at: here(1.66, 0, 0.9),
    mat: plain(DARK),
    cast: false,
  });
  const screen = state.screen;
  items.push({
    mesh: part("screen", () => block(0.026, 0.4, 0.25, 0.012)),
    at: here(1.9, 0, 0.93, rotateY(-12 * DEG)),
    mat: plain(
      screen
        ? (screen.colour.map((c) => lerp(0.06, c, clamp(screen.lit))) as V3)
        : DARK,
      screen?.colour,
      (screen?.lit ?? 0) * 1.1,
    ),
    cast: false,
  });
  const drive = state.drive;
  items.push({
    mesh: part("wheel", () =>
      turned(
        [
          [0.15, 0],
          [0.172, -0.016],
          [0.19, 0],
          [0.172, 0.016],
          [0.15, 0],
        ],
        20,
      ),
    ),
    at: here(1.98, -0.39, 1.0, rotateY(-66 * DEG)),
    mat: plain(DARK, drive?.colour, drive?.lit ?? 0),
    cast: false,
  });
  // The motor, between the rear wheels.
  items.push({
    mesh: part("motor", () =>
      merge([
        [
          post(0.17, 0.52, 0.03, 16),
          compose(translate(0, -0.26, 0), rotateX(-90 * DEG)),
        ],
      ]),
    ),
    at: here(model.shape.rearAxle, 0, model.shape.wheelR),
    mat: plain(TRIM, drive?.colour, drive?.lit ?? 0),
    cast: false,
  });
  return items;
}
/** How many seats, and which row each is in: for scenes that count them. */
export const seatRows = (seats: number) => {
  const plan = seatPlan(seats);
  let row = -1,
    last = -1;
  return plan.map(([s]) => {
    if (Math.abs(s - last) > 0.3) row += 1;
    last = s;
    return row;
  });
};
/** Where a seat is in the world: its hips, at shoulder height. */
export const seatPoint = (
  model: CarModel,
  at: M4,
  seats: number,
  index: number,
): V3 => {
  const [s, y] = seatPlan(seats)[Math.min(index, seatPlan(seats).length - 1)];
  return transform(at, carPoint(model, s, y, 1.0));
};
