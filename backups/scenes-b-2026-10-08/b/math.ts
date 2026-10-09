/**
 * Numbers for the B scenes: easing, vectors and 4×4 matrices. The world is in
 * metres, z up; a car's own frame has x forward and y to its left.
 */
export type V2 = [number, number];
export type V3 = [number, number, number];
/** Column-major, as WebGL reads it. */
export type M4 = Float32Array;

export const TAU = Math.PI * 2;
export const DEG = Math.PI / 180;
export const clamp = (v: number, lo = 0, hi = 1) =>
  Math.min(hi, Math.max(lo, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mod = (v: number, m: number) => ((v % m) + m) % m;
/** Stable pseudo-random 0–1 for a seed. */
export const hash = (seed: number) => {
  const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/* ---------- Easing: nothing moves at constant speed ---------- */

export type Ease = (t: number) => number;
export const linear: Ease = (t) => t;
export const smooth: Ease = (t) => t * t * (3 - 2 * t);
/** Slow in, slow out, with more rest at both ends than `smooth`. */
export const glide: Ease = (t) => t * t * t * (t * (t * 6 - 15) + 10);
export const easeOut: Ease = (t) => 1 - (1 - t) ** 3;
export const easeIn: Ease = (t) => t * t * t;
/** Arrives a touch past its mark and settles back: for things that click home. */
export const settle: Ease = (t) => 1 + 2.2 * (t - 1) ** 3 + 1.2 * (t - 1) ** 2;
/** 0→1 between two moments. */
export const ramp = (from: number, to: number, v: number, e: Ease = smooth) =>
  e(clamp((v - from) / (to - from || 1)));
/** Up after `from`, down before `to`: present for one stretch of time. */
export const span = (from: number, to: number, v: number, soft = 0.4) =>
  ramp(from, from + soft, v) * (1 - ramp(to - soft, to, v));
/** A value along keyframes of [time, value]. */
export function track(t: number, keys: V2[], e: Ease = glide) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (t <= keys[i][0]) {
      const [t0, a] = keys[i - 1],
        [t1, b] = keys[i];
      return lerp(a, b, e((t - t0) / (t1 - t0 || 1)));
    }
  return keys[keys.length - 1][1];
}
/**
 * A smooth curve through points of [x, y] that never overshoots them: the
 * car's profiles are drawn through measured stations this way.
 */
export function curve(points: V2[]) {
  const n = points.length;
  const slope: number[] = [],
    tangent: number[] = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++)
    slope.push(
      (points[i + 1][1] - points[i][1]) /
        (points[i + 1][0] - points[i][0] || 1e-9),
    );
  tangent[0] = slope[0];
  tangent[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++) {
    if (slope[i - 1] * slope[i] <= 0) continue;
    const a = points[i][0] - points[i - 1][0],
      b = points[i + 1][0] - points[i][0];
    // Harmonic mean, weighted by the spans either side.
    tangent[i] =
      (3 * (a + b)) / ((2 * b + a) / slope[i - 1] + (b + 2 * a) / slope[i]);
  }
  return (x: number) => {
    if (x <= points[0][0]) return points[0][1];
    if (x >= points[n - 1][0]) return points[n - 1][1];
    let i = 0;
    while (x > points[i + 1][0]) i += 1;
    const h = points[i + 1][0] - points[i][0];
    const t = (x - points[i][0]) / h;
    const t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * points[i][1] +
      (t3 - 2 * t2 + t) * h * tangent[i] +
      (-2 * t3 + 3 * t2) * points[i + 1][1] +
      (t3 - t2) * h * tangent[i + 1]
    );
  };
}

/* ---------- Vectors ---------- */

export const add = (a: V3, b: V3): V3 => [
  a[0] + b[0],
  a[1] + b[1],
  a[2] + b[2],
];
export const sub = (a: V3, b: V3): V3 => [
  a[0] - b[0],
  a[1] - b[1],
  a[2] - b[2],
];
export const mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
export const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a: V3): V3 => mul(a, 1 / (len(a) || 1));
export const mix3 = (a: V3, b: V3, t: number): V3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];
/** A colour from "#rrggbb", as linear-light 0–1 so it can be lit. */
export const colour = (hex: string): V3 => {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return [channel(1), channel(3), channel(5)];
};
/** Linear light back to a display value 0–255. */
export const display = (v: number) => {
  const c = clamp(v);
  return Math.round(
    255 * (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055),
  );
};
export const css = (c: V3, alpha = 1) =>
  `rgba(${display(c[0])},${display(c[1])},${display(c[2])},${clamp(alpha).toFixed(3)})`;

/* ---------- Matrices ---------- */

export function identity(): M4 {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}
export function multiply(a: M4, b: M4): M4 {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      o[c * 4 + r] =
        a[r] * b[c * 4] +
        a[4 + r] * b[c * 4 + 1] +
        a[8 + r] * b[c * 4 + 2] +
        a[12 + r] * b[c * 4 + 3];
  return o;
}
/** Applies right to left: `compose(a, b, c)` does c first. */
export const compose = (...list: M4[]) => list.reduce(multiply);
export function translate(x: number, y: number, z: number): M4 {
  const m = identity();
  m[12] = x;
  m[13] = y;
  m[14] = z;
  return m;
}
export function scale(x: number, y = x, z = x): M4 {
  const m = identity();
  m[0] = x;
  m[5] = y;
  m[10] = z;
  return m;
}
export function rotateX(a: number): M4 {
  const m = identity(),
    c = Math.cos(a),
    s = Math.sin(a);
  m[5] = c;
  m[6] = s;
  m[9] = -s;
  m[10] = c;
  return m;
}
export function rotateY(a: number): M4 {
  const m = identity(),
    c = Math.cos(a),
    s = Math.sin(a);
  m[0] = c;
  m[2] = -s;
  m[8] = s;
  m[10] = c;
  return m;
}
export function rotateZ(a: number): M4 {
  const m = identity(),
    c = Math.cos(a),
    s = Math.sin(a);
  m[0] = c;
  m[1] = s;
  m[4] = -s;
  m[5] = c;
  return m;
}
/** Turns about an axis through `pivot`. */
export const about = (pivot: V3, turn: M4) =>
  compose(
    translate(pivot[0], pivot[1], pivot[2]),
    turn,
    translate(-pivot[0], -pivot[1], -pivot[2]),
  );
export function perspective(
  fovY: number,
  aspect: number,
  near: number,
  far: number,
): M4 {
  const f = 1 / Math.tan(fovY / 2),
    m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}
export function orthographic(
  halfWidth: number,
  halfHeight: number,
  near: number,
  far: number,
): M4 {
  const m = identity();
  m[0] = 1 / halfWidth;
  m[5] = 1 / halfHeight;
  m[10] = -2 / (far - near);
  m[14] = -(far + near) / (far - near);
  return m;
}
export function lookAt(eye: V3, target: V3, up: V3 = [0, 0, 1]): M4 {
  const f = unit(sub(target, eye));
  const s = unit(cross(f, up));
  const u = cross(s, f);
  const m = identity();
  m[0] = s[0];
  m[4] = s[1];
  m[8] = s[2];
  m[1] = u[0];
  m[5] = u[1];
  m[9] = u[2];
  m[2] = -f[0];
  m[6] = -f[1];
  m[10] = -f[2];
  m[12] = -dot(s, eye);
  m[13] = -dot(u, eye);
  m[14] = dot(f, eye);
  return m;
}
/** A point through a matrix, divided through by w. */
export function transform(m: M4, p: V3): V3 {
  const w = m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15] || 1;
  return [
    (m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / w,
    (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / w,
    (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) / w,
  ];
}
/** A direction through a matrix: no translation. */
export const direct = (m: M4, d: V3): V3 => [
  m[0] * d[0] + m[4] * d[1] + m[8] * d[2],
  m[1] * d[0] + m[5] * d[1] + m[9] * d[2],
  m[2] * d[0] + m[6] * d[1] + m[10] * d[2],
];
/** The 3×3 that carries normals: the inverse transpose of the upper-left. */
export function normalMatrix(m: M4): Float32Array {
  const a = m[0],
    b = m[1],
    c = m[2],
    d = m[4],
    e = m[5],
    f = m[6],
    g = m[8],
    h = m[9],
    i = m[10];
  const A = e * i - f * h,
    B = f * g - d * i,
    C = d * h - e * g;
  const det = a * A + b * B + c * C || 1;
  return new Float32Array([
    A / det,
    B / det,
    C / det,
    (c * h - b * i) / det,
    (a * i - c * g) / det,
    (b * g - a * h) / det,
    (b * f - c * e) / det,
    (c * d - a * f) / det,
    (a * e - b * d) / det,
  ]);
}
