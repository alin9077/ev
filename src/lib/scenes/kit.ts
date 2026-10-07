/**
 * Drawing kit for the chapter scenes: an isometric world of flat-shaded
 * solids, lit anywhere between night (0) and day (1), seen through a camera
 * that can travel and zoom. See `docs/SCENE_DIRECTION.md`. Conceptual
 * illustration only; no manufacturer interface, badge or media is drawn.
 */
export type Rgb = [number, number, number];
export type Pt = [number, number];
export type P3 = [number, number, number];
export type Ctx = CanvasRenderingContext2D;

export const TAU = Math.PI * 2;
export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, v));
export const mod = (v: number, m: number) => ((v % m) + m) % m;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Stable pseudo-random 0–1 for a seed. */
export const noise = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/* ---------- Easing: nothing in a scene moves at constant speed ---------- */

export const smooth = (t: number) => t * t * (3 - 2 * t);
export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const easeIn = (t: number) => t * t * t;
/** Overshoots a little before settling: for things that land or click home. */
export const easeOutBack = (t: number, over = 1.5) =>
  1 + (over + 1) * (t - 1) ** 3 + over * (t - 1) ** 2;
type Ease = (t: number) => number;
/** 0→1 between two moments, eased. */
export const ramp = (from: number, to: number, v: number, e: Ease = smooth) =>
  e(clamp((v - from) / (to - from || 1)));
/** Rises after `from`, falls before `to`: one beat of emphasis. */
export const pulse = (from: number, to: number, v: number, soft = 0.3) =>
  ramp(from, from + soft, v) * (1 - ramp(to - soft, to, v));
/** A value along keyframes of [time, value], eased between each pair. */
export function key(t: number, frames: Pt[], e: Ease = easeInOut) {
  if (t <= frames[0][0]) return frames[0][1];
  for (let i = 1; i < frames.length; i++)
    if (t <= frames[i][0])
      return lerp(
        frames[i - 1][1],
        frames[i][1],
        e((t - frames[i - 1][0]) / (frames[i][0] - frames[i - 1][0] || 1)),
      );
  return frames[frames.length - 1][1];
}

/* ---------- Colour ---------- */

export const hex = (h: string): Rgb => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
export const rgba = (c: Rgb, a = 1) =>
  `rgba(${clamp(c[0], 0, 255) | 0},${clamp(c[1], 0, 255) | 0},${clamp(c[2], 0, 255) | 0},${clamp(a).toFixed(3)})`;
export const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
export const lit = (c: Rgb, f: number): Rgb => [c[0] * f, c[1] * f, c[2] * f];

export const PAPER = hex("#f5f5f0"),
  INK = hex("#172326"),
  WHITE: Rgb = [255, 255, 255],
  NAVY = hex("#0a1622"),
  SKY = hex("#77b9d5"),
  YELLOW = hex("#f1cf50"),
  RED = hex("#e8452c"),
  AMBER = hex("#ffaa3c"),
  WARM = hex("#fff0cd");

const DAWN = hex("#e8b7a2");
/** Every material has a night and a day colour; the light picks between. */
const TONES = {
  ground: ["#0a1622", "#f5f5f0"],
  paving: ["#0f2334", "#e9ebe5"],
  road: ["#1b3348", "#cbd0ce"],
  kerb: ["#2e4d64", "#b2bab8"],
  mark: ["#9fb4bf", "#ffffff"],
  roof: ["#27465e", "#ffffff"],
  wall: ["#1c364c", "#eceee9"],
  wallShade: ["#11273a", "#cbd3d1"],
  glass: ["#0b1a27", "#6f8c98"],
  leaf: ["#1a4450", "#a3c492"],
  leafShade: ["#113342", "#84ab7a"],
  stem: ["#0c1b28", "#56646a"],
  metal: ["#35566e", "#8d9a9d"],
  /** The colour that draws on the ground: light at night, ink by day. */
  line: ["#f5f5f0", "#172326"],
} as const;
type ToneName = keyof typeof TONES;
export type Palette = Record<ToneName, Rgb> & {
  /** The chapter's own colour, and a ground-hugging version of it. */
  accent: Rgb;
  field: Rgb;
};
const TONE_PAIRS = (Object.keys(TONES) as ToneName[]).map(
  (name) => [name, hex(TONES[name][0]), hex(TONES[name][1])] as const,
);
export function palette(day: number, accent: Rgb): Palette {
  const tones = {} as Record<ToneName, Rgb>;
  // Between night and day the light passes through a warm dawn, not grey.
  const dawn = 0.34 * Math.sin(Math.PI * clamp(day)) ** 1.4;
  for (const [name, night, dayTone] of TONE_PAIRS)
    tones[name] = mix(mix(night, dayTone, day), DAWN, dawn);
  return {
    ...tones,
    accent,
    field: mix(mix(tones.ground, accent, 0.2), accent, day),
  };
}

/* ---------- Camera and projection ---------- */

export const COS = Math.cos(Math.PI / 6),
  SIN = 0.5;

/** What the camera centres on, and how close: zoom 1 fits the scene's frame. */
export type Camera = { x: number; y: number; z?: number; zoom: number };
export type Shot = Camera & { at: number };
/**
 * The camera at `t` along a list of shots. Zoom moves exponentially, and the
 * camera travels in step with it, so whatever it is leaving stays in frame
 * while it shrinks instead of sliding out of the side.
 */
export function shoot(t: number, shots: Shot[], e: Ease = easeInOut): Camera {
  let i = 1;
  while (i < shots.length - 1 && t > shots[i].at) i += 1;
  const a = shots[i - 1],
    b = shots[i];
  const f = e(clamp((t - a.at) / (b.at - a.at || 1)));
  const zoom = Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), f));
  const g =
    Math.abs(a.zoom - b.zoom) < 1e-6
      ? f
      : (1 / zoom - 1 / a.zoom) / (1 / b.zoom - 1 / a.zoom);
  return {
    x: lerp(a.x, b.x, g),
    y: lerp(a.y, b.y, g),
    z: lerp(a.z ?? 0, b.z ?? 0, g),
    zoom,
  };
}

export type View = {
  width: number;
  height: number;
  /** Device pixels per CSS pixel: the width of a hairline. */
  unit: number;
  /** Device pixels per scene unit (about 16 scene units per metre). */
  k: number;
  ox: number;
  oy: number;
  at: (x: number, y: number, z?: number) => Pt;
  /** 0 at night, 1 by day; `night` is how much lamps and glow show. */
  day: number;
  night: number;
  pal: Palette;
  /** How far a shadow falls across the ground per unit of height. */
  sun: Pt;
  /** The patch of ground that could show, with a margin. */
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};
export type Stage = {
  day: number;
  accent: Rgb;
  /** Scene units that must fit at zoom 1: across, then down the panel. */
  frame?: Pt;
  sun?: Pt;
  /** Where the camera's subject sits in the panel, as fractions of it. */
  centre?: Pt;
};
/**
 * How much of the panel's top the page has laid something over (its table of
 * figures), as a fraction of the height. Scenes are framed in what is left.
 */
let covered = 0;
export function setCovered(fraction: number) {
  covered = clamp(fraction, 0, 0.5);
}
export function makeView(
  width: number,
  height: number,
  unit: number,
  cam: Camera,
  stage: Stage,
): View {
  const [fw, fh] = stage.frame ?? [560, 330];
  // The subject sits lower when the top of the panel is covered, so it stays
  // in the middle of what can be seen between the table and the labels.
  const [cx, mid] = stage.centre ?? [0.5, 0.5];
  const cy = mid + 0.3 * covered;
  const k = Math.max(1e-3, Math.min(width / fw, height / fh) * cam.zoom);
  const ox = width * cx - (cam.x - cam.y) * COS * k,
    oy = height * cy - ((cam.x + cam.y) * SIN - (cam.z ?? 0)) * k;
  let x0 = Infinity,
    x1 = -Infinity,
    y0 = Infinity,
    y1 = -Infinity;
  for (const [sx, sy] of [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ]) {
    const across = (sx - ox) / (COS * k),
      down = (sy - oy) / (SIN * k);
    x0 = Math.min(x0, (across + down) / 2);
    x1 = Math.max(x1, (across + down) / 2);
    y0 = Math.min(y0, (down - across) / 2);
    y1 = Math.max(y1, (down - across) / 2);
  }
  const day = clamp(stage.day);
  return {
    width,
    height,
    unit,
    k,
    ox,
    oy,
    at: (x, y, z = 0) => [
      ox + (x - y) * COS * k,
      oy + (x + y) * SIN * k - z * k,
    ],
    day,
    night: (1 - day) ** 2,
    pal: palette(day, stage.accent),
    sun: stage.sun ?? [0.78, -0.3],
    x0: x0 - 40,
    x1: x1 + 40,
    y0: y0 - 40,
    y1: y1 + 40,
  };
}

/** Clears the panel to the ground colour. */
export function backdrop(ctx: Ctx, view: View) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.setLineDash([]);
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  ctx.fillStyle = rgba(view.pal.ground);
  ctx.fillRect(0, 0, view.width, view.height);
}
/** Runs `draw` in ground coordinates, on the plane `z` above the ground. */
export function onGround(ctx: Ctx, view: View, draw: () => void, z = 0) {
  const { k } = view;
  ctx.setTransform(
    COS * k,
    SIN * k,
    -COS * k,
    SIN * k,
    view.ox,
    view.oy - z * k,
  );
  draw();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
/**
 * Runs `draw` on an upright wall: one running along x (at y = `at`) or along
 * y (at x = `at`). Its coordinates are distance along the wall, then height.
 */
export function onWall(
  ctx: Ctx,
  view: View,
  along: "x" | "y",
  at: number,
  draw: () => void,
) {
  const { k } = view;
  if (along === "x")
    ctx.setTransform(
      COS * k,
      SIN * k,
      0,
      -k,
      view.ox - at * COS * k,
      view.oy + at * SIN * k,
    );
  else
    ctx.setTransform(
      -COS * k,
      SIN * k,
      0,
      -k,
      view.ox + at * COS * k,
      view.oy + at * SIN * k,
    );
  draw();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
/** Runs `draw` with light adding to what is already there. */
export function glow(ctx: Ctx, draw: () => void) {
  ctx.globalCompositeOperation = "lighter";
  draw();
  ctx.globalCompositeOperation = "source-over";
}

/* ---------- Shapes ---------- */

export const box = (x: number, y: number, w: number, d: number): Pt[] => [
  [x, y],
  [x + w, y],
  [x + w, y + d],
  [x, y + d],
];
export const disc = (cx: number, cy: number, r: number, sides = 32): Pt[] =>
  Array.from({ length: sides }, (_, i): Pt => [
    cx + r * Math.cos((i / sides) * TAU),
    cy + r * Math.sin((i / sides) * TAU),
  ]);
/** Unit vector for a heading in degrees clockwise from north (−y). */
export const direction = (heading: number): Pt => [
  Math.sin((heading * Math.PI) / 180),
  -Math.cos((heading * Math.PI) / 180),
];
/** The convex outline around a set of points. */
export function hull(points: Pt[]): Pt[] {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (p.length < 3) return p;
  const cross = (o: Pt, a: Pt, b: Pt) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const q of list) {
      while (
        out.length >= 2 &&
        cross(out[out.length - 2], out[out.length - 1], q) <= 0
      )
        out.pop();
      out.push(q);
    }
    out.pop();
    return out;
  };
  return [...half(p), ...half(p.reverse())];
}
export function trace(ctx: Ctx, points: Pt[], close = true) {
  ctx.beginPath();
  for (const [x, y] of points) ctx.lineTo(x, y);
  if (close) ctx.closePath();
}
/** Fills a flat shape lying in space. */
export function plate(ctx: Ctx, view: View, points: P3[], colour: string) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (const [x, y, z] of points) ctx.lineTo(...view.at(x, y, z));
  ctx.closePath();
  ctx.fill();
}

/** Towards the sun, for shading a face by the way it points. */
function sunward(view: View): P3 {
  const [sx, sy] = view.sun;
  const len = Math.hypot(sx, sy, 1);
  return [-sx / len, -sy / len, 1 / len];
}
/** How brightly a face is lit, 0–1, from its normal. */
export function facing(view: View, nx: number, ny: number, nz: number) {
  const [sx, sy, sz] = sunward(view);
  return clamp(0.5 + 0.62 * (nx * sx + ny * sy + nz * sz));
}

export type Tones = { top: Rgb; lit: Rgb; shade: Rgb };
/** The three tones of a white building under the current light. */
export const wallTones = (view: View): Tones => ({
  top: view.pal.roof,
  lit: view.pal.wall,
  shade: view.pal.wallShade,
});
/** Three tones of one colour: for anything that is not a white wall. */
export const tonesOf = (view: View, colour: Rgb): Tones => ({
  top: mix(colour, WHITE, 0.16 * view.day + 0.05),
  lit: colour,
  shade: lit(colour, 0.72),
});
/** Which beat of a scene a moment falls in, given where each beat starts. */
export function beatAt(t: number, starts: number[], loop: number) {
  let beat = 0;
  while (beat + 1 < starts.length && t >= starts[beat + 1]) beat += 1;
  const end = beat + 1 < starts.length ? starts[beat + 1] : loop;
  return { beat, progress: clamp((t - starts[beat]) / (end - starts[beat])) };
}
/**
 * A solid between two matching outlines. Only faces turned towards the viewer
 * are painted: the top, a lit side and a shaded side, with no outline.
 */
export function prism(
  ctx: Ctx,
  view: View,
  bottom: Pt[],
  top: Pt[],
  z0: number,
  z1: number,
  tones: Tones,
  alpha = 1,
) {
  let area = 0;
  for (let i = 0; i < bottom.length; i++) {
    const a = bottom[i],
      b = bottom[(i + 1) % bottom.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  const sign = area > 0 ? 1 : -1;
  const sides: { depth: number; i: number; light: number }[] = [];
  for (let i = 0; i < bottom.length; i++) {
    const j = (i + 1) % bottom.length;
    const ex = bottom[j][0] - bottom[i][0],
      ey = bottom[j][1] - bottom[i][1];
    const len = Math.hypot(ex, ey) || 1;
    const nx = (sign * ey) / len,
      ny = (-sign * ex) / len;
    if (nx + ny <= 0.02) continue;
    sides.push({
      depth: bottom[i][0] + bottom[i][1] + bottom[j][0] + bottom[j][1],
      i,
      light: facing(view, nx, ny, 0),
    });
  }
  sides.sort((a, b) => a.depth - b.depth);
  ctx.globalAlpha = alpha;
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(0.5, 0.5 * view.unit);
  const face = (points: Pt[], colour: string) => {
    ctx.fillStyle = colour;
    ctx.strokeStyle = colour;
    trace(ctx, points);
    ctx.fill();
    // A hairline in the same colour closes the seams between faces.
    if (alpha === 1) ctx.stroke();
  };
  for (const { i, light } of sides) {
    const j = (i + 1) % bottom.length;
    face(
      [
        view.at(bottom[i][0], bottom[i][1], z0),
        view.at(bottom[j][0], bottom[j][1], z0),
        view.at(top[j][0], top[j][1], z1),
        view.at(top[i][0], top[i][1], z1),
      ],
      rgba(mix(tones.shade, tones.lit, smooth(clamp((light - 0.2) / 0.5)))),
    );
  }
  face(
    top.map(([x, y]) => view.at(x, y, z1)),
    rgba(tones.top),
  );
  ctx.globalAlpha = 1;
}
/** The ground shadow of a solid, as an outline in ground coordinates. */
export function shadowOf(view: View, base: Pt[], z0: number, z1: number) {
  const [sx, sy] = view.sun;
  return hull([
    ...base.map(([x, y]): Pt => [x + sx * z0, y + sy * z0]),
    ...base.map(([x, y]): Pt => [x + sx * z1, y + sy * z1]),
  ]);
}
/**
 * Paints cast shadows as one flat shape, so overlaps do not darken twice.
 * Call inside `onGround`. They fade out with the daylight.
 */
export function castShadows(ctx: Ctx, view: View, shadows: Pt[][]) {
  if (view.day < 0.03) return;
  ctx.fillStyle = rgba(mix(INK, view.pal.accent, 0.12), 0.17 * view.day);
  ctx.beginPath();
  for (const shape of shadows) {
    shape.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
  }
  ctx.fill("nonzero");
}

/** Upright things are painted back to front; each may cast a shadow. */
export type Thing = { depth: number; draw: () => void; shadow?: Pt[][] };
export const paint = (things: Thing[]) =>
  [...things].sort((a, b) => a.depth - b.depth).forEach((t) => t.draw());
export const shadowsOf = (things: Thing[]) =>
  things.flatMap((thing) => thing.shadow ?? []);

/* ---------- Light ---------- */

/** A light source: a hard core inside a soft additive bloom. */
export function glowDot(
  ctx: Ctx,
  [x, y]: Pt,
  r: number,
  colour: Rgb,
  strength: number,
) {
  if (strength <= 0.01 || r <= 0) return;
  ctx.globalCompositeOperation = "lighter";
  const bloom = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
  bloom.addColorStop(0, rgba(colour, 0.55 * strength));
  bloom.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = bloom;
  ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  ctx.fillStyle = rgba(mix(colour, WHITE, 0.5), strength);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.55, 0, TAU);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}
/** A soft round patch of light on the ground. Call inside `onGround` + `glow`. */
export function pool(
  ctx: Ctx,
  [x, y]: Pt,
  r: number,
  colour: Rgb,
  strength: number,
) {
  if (strength <= 0.005) return;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(colour, strength));
  g.addColorStop(1, rgba(colour, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}
/** A line through space. Width is in scene units, so it scales with the zoom. */
export function line(
  ctx: Ctx,
  view: View,
  points: P3[],
  colour: string,
  width: number,
  dash?: number[],
) {
  if (points.length < 2) return;
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(0.6 * view.unit, width * view.k);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (dash) ctx.setLineDash(dash.map((d) => d * view.k));
  ctx.beginPath();
  for (const [x, y, z] of points) ctx.lineTo(...view.at(x, y, z));
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
  ctx.lineCap = "butt";
}
/** A line of light through space: a bright core inside a wider halo. */
export function glowLine(
  ctx: Ctx,
  view: View,
  points: P3[],
  colour: Rgb,
  strength: number,
  width = 1,
) {
  if (strength <= 0.01) return;
  glow(ctx, () => {
    line(ctx, view, points, rgba(colour, 0.2 * strength), width * 4.5);
    line(ctx, view, points, rgba(colour, 0.95 * strength), width);
  });
}
/** The point a fraction `f` of the way along a path, by length. */
export function along(points: P3[], f: number): P3 {
  const lengths = points.map((p, i) =>
    i
      ? Math.hypot(
          p[0] - points[i - 1][0],
          p[1] - points[i - 1][1],
          p[2] - points[i - 1][2],
        )
      : 0,
  );
  const total = lengths.reduce((a, b) => a + b, 0);
  let d = clamp(f) * total;
  for (let i = 1; i < points.length; i++) {
    if (d <= lengths[i] || i === points.length - 1) {
      const g = lengths[i] ? clamp(d / lengths[i]) : 0;
      const a = points[i - 1],
        b = points[i];
      return [lerp(a[0], b[0], g), lerp(a[1], b[1], g), lerp(a[2], b[2], g)];
    }
    d -= lengths[i];
  }
  return points[0];
}
/** The first `f` of a path, for a line that draws itself. */
export function partial(points: P3[], f: number, steps = 40): P3[] {
  const n = Math.max(1, Math.ceil(steps * clamp(f)));
  return Array.from({ length: n + 1 }, (_, i) =>
    along(points, (i / n) * clamp(f)),
  );
}
/** A cable hanging between two points. */
export function hang(a: P3, b: P3, sag: number, steps = 16): P3[] {
  return Array.from({ length: steps + 1 }, (_, i): P3 => {
    const f = i / steps;
    return [
      lerp(a[0], b[0], f),
      lerp(a[1], b[1], f),
      lerp(a[2], b[2], f) - sag * 4 * f * (1 - f),
    ];
  });
}
/** A ring on the ground. Call inside `onGround`. */
export function ring(
  ctx: Ctx,
  [x, y]: Pt,
  r: number,
  colour: string,
  width: number,
  from = 0,
  to = 1,
  dash?: number[],
) {
  if (r <= 0 || to <= from) return;
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.arc(x, y, r, from * TAU, to * TAU);
  ctx.stroke();
  if (dash) ctx.setLineDash([]);
}

/* ---------- Focus ---------- */

/**
 * Tonal focus: washes everything towards the ground colour except a circle
 * around `centre`, so the eye goes where the beat is. `radius` is in scene
 * units; `amount` 0–1.
 */
export function focusOn(
  ctx: Ctx,
  view: View,
  centre: P3,
  radius: number,
  amount: number,
) {
  if (amount <= 0.01) return;
  const [x, y] = view.at(...centre);
  const r = radius * view.k;
  const far = Math.hypot(view.width, view.height);
  const wash = ctx.createRadialGradient(x, y, r * 0.7, x, y, r * 1.9);
  const colour = view.pal.ground;
  wash.addColorStop(0, rgba(colour, 0));
  wash.addColorStop(1, rgba(colour, (0.62 + 0.14 * view.night) * amount));
  ctx.fillStyle = wash;
  ctx.fillRect(x - far, y - far, far * 2, far * 2);
}
/**
 * Hands the end of a loop to its start through a closing and opening iris in
 * the chapter colour. `f` runs 0→1 across the hand-over; `paint` is called
 * with false for the outgoing frame and true for the incoming one.
 */
export function iris(
  ctx: Ctx,
  width: number,
  height: number,
  f: number,
  colour: Rgb,
  centre: Pt,
  paintFrame: (incoming: boolean) => void,
) {
  const far = Math.hypot(
    Math.max(centre[0], width - centre[0]),
    Math.max(centre[1], height - centre[1]),
  );
  const closing = f < 0.5;
  paintFrame(!closing);
  // The disc grows from the centre to cover the old frame, then a hole opens
  // in it onto the new one.
  const r = closing
    ? easeIn(f * 2) * far * 1.02
    : easeOut(f * 2 - 1) * far * 1.02;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = rgba(colour);
  ctx.beginPath();
  if (closing) ctx.arc(centre[0], centre[1], Math.max(0, r), 0, TAU);
  else {
    ctx.rect(0, 0, width, height);
    ctx.arc(centre[0], centre[1], Math.max(0, r), 0, TAU, true);
  }
  ctx.fill("evenodd");
}

/* ---------- Scenes ---------- */

export type SceneFrame = {
  /** Which beat is playing, and how far through it. */
  beat: number;
  progress: number;
  /** Whether the panel is light or dark just now, for the labels over it. */
  tone: "day" | "night";
};
export type ChapterScene = {
  /** One label per beat. */
  beats: [string, string, string];
  /** Seconds in one loop. */
  loop: number;
  /** The resting frame, shown when paused or for reduced motion, and its tone. */
  still: number;
  tone: "day" | "night";
  /** Paints one frame; `width` and `height` are device pixels, `unit` one CSS pixel. */
  draw: (
    ctx: Ctx,
    width: number,
    height: number,
    time: number,
    unit: number,
    spec?: SceneSpec,
  ) => SceneFrame;
};
/**
 * What the viewer has selected, where a scene can show it: the baseline's own
 * figures, and the alternative currently beside it.
 */
export type SceneSpec = {
  seats?: number;
  rangeKm?: number;
  rivalRangeKm?: number;
  priceAud?: number;
  bootL?: number;
  dcPeakKw?: number;
  /** For the B scenes: the baseline, then the alternative, in full. */
  cars?: [SceneCar, SceneCar];
};
/** One selected car as a scene can quote it: its figures and feature answers. */
export type SceneCar = {
  name: string;
  facts: Record<string, number | string | undefined>;
  features: Record<string, { status: string; value: string } | undefined>;
};

/** A shield with a tick, standing at a point in space: protection, without words. */
export function shieldMark(
  ctx: Ctx,
  view: View,
  centre: P3,
  size: number,
  colour: Rgb,
  tick: Rgb,
  amount = 1,
) {
  if (amount <= 0.01) return;
  const [x, y] = view.at(...centre);
  const u = size * view.k * amount;
  ctx.fillStyle = rgba(colour);
  ctx.beginPath();
  ctx.moveTo(x, y - u);
  ctx.lineTo(x + u * 0.82, y - u * 0.68);
  ctx.quadraticCurveTo(x + u * 0.86, y + u * 0.42, x, y + u);
  ctx.quadraticCurveTo(x - u * 0.86, y + u * 0.42, x - u * 0.82, y - u * 0.68);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = rgba(tick);
  ctx.lineWidth = u * 0.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(x - u * 0.36, y + u * 0.02);
  ctx.lineTo(x - u * 0.08, y + u * 0.32);
  ctx.lineTo(x + u * 0.4, y - u * 0.3);
  ctx.stroke();
  ctx.lineCap = "butt";
}
/** A padlock standing at a point in space; `open` 0–1 lifts and swings its shackle. */
export function lockMark(
  ctx: Ctx,
  view: View,
  centre: P3,
  size: number,
  colour: Rgb,
  open: number,
  amount = 1,
) {
  if (amount <= 0.01) return;
  const [x, y] = view.at(...centre);
  const u = size * view.k * amount;
  ctx.strokeStyle = rgba(colour);
  ctx.lineWidth = u * 0.24;
  ctx.lineCap = "round";
  ctx.beginPath();
  // The shackle: fixed on the left, free on the right once open.
  ctx.moveTo(x - u * 0.42, y - u * 0.1);
  ctx.lineTo(x - u * 0.42, y - u * (0.5 + 0.22 * open));
  ctx.arc(x, y - u * (0.5 + 0.22 * open), u * 0.42, Math.PI, TAU - 0.9 * open);
  if (open < 0.5) ctx.lineTo(x + u * 0.42, y - u * 0.1);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.fillStyle = rgba(colour);
  ctx.beginPath();
  ctx.roundRect(x - u * 0.7, y - u * 0.12, u * 1.4, u * 1.05, u * 0.16);
  ctx.fill();
}
