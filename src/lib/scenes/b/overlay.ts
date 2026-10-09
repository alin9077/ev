/**
 * What is drawn over a B scene once the model is down: round-ended labels
 * that quote the selected cars, icon badges on hairline stems, and the thin
 * lines that tie them to the thing they describe. All sizes are in CSS
 * pixels, so a label reads the same on any screen.
 */
import { TAU, clamp, css, lerp, type V2, type V3 } from "./math";
import type { Plate } from "./stage";

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
export const INK_CSS = "#22272b";
const MUTED = "#6c7177";

/** A world point in device pixels. */
export const spot = (plate: Plate, p: V3): V2 => {
  const s = plate.cam.project(p);
  return [s[0], s[1]];
};
/** Labels are a little smaller on a phone's plate. */
const size = (plate: Plate) => (plate.wide ? 1 : 0.86) * plate.unit;

export type PillOptions = {
  /** Dark for the car the page is about, light for the alternative. */
  tone?: "dark" | "light";
  alpha?: number;
  /** Which part of the pill sits on the point. */
  anchor?: "centre" | "left" | "right";
  /** Offset from the point, in CSS pixels. */
  dx?: number;
  dy?: number;
  /** A point in the world the pill is tied to by a hairline. */
  tie?: V3;
  /** A dot before the text: a colour, or false for a hollow "not offered". */
  dot?: string | false;
  /** 0–1: a short bar after the text, filled this far, in `bar` colour. */
  level?: number;
  bar?: string;
  /** Grows from its anchor as it appears: 0–1. */
  pop?: number;
};
/** A round-ended label: a quiet name, then the figure that matters. */
export function pill(
  plate: Plate,
  at: V3 | V2,
  name: string,
  value: string,
  options: PillOptions = {},
) {
  const { ctx } = plate;
  const alpha = clamp(options.alpha ?? 1);
  if (alpha <= 0.01) return;
  const u = size(plate);
  const [px, py] = at.length === 3 ? spot(plate, at) : at;
  const dark = (options.tone ?? "light") === "dark";
  const height = 30 * u,
    pad = 13 * u,
    gap = 7 * u;
  ctx.font = `400 ${12.5 * u}px ${FONT}`;
  const nameWidth = name ? ctx.measureText(name).width : 0;
  ctx.font = `600 ${12.5 * u}px ${FONT}`;
  const valueWidth = value ? ctx.measureText(value).width : 0;
  const dot = options.dot === undefined ? 0 : 7 * u + gap;
  const meter = options.level === undefined ? 0 : 34 * u + gap;
  const width =
    pad * 2 + dot + nameWidth + (name && value ? gap : 0) + valueWidth + meter;
  const anchor = options.anchor ?? "centre";
  const grow = options.pop === undefined ? 1 : clamp(options.pop, 0, 1.2);
  const x0 =
    px +
    (options.dx ?? 0) * u -
    (anchor === "centre" ? width / 2 : anchor === "right" ? width : 0);
  const y0 = py + (options.dy ?? 0) * u - height / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  if (options.tie) {
    const [tx, ty] = spot(plate, options.tie);
    const fx = clamp(tx, x0 + height / 2, x0 + width - height / 2),
      fy = ty > y0 + height / 2 ? y0 + height : y0;
    ctx.strokeStyle = dark ? "rgba(34,39,43,0.55)" : "rgba(34,39,43,0.4)";
    ctx.lineWidth = Math.max(1, u);
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.fillStyle = dark ? INK_CSS : "#ffffff";
    ctx.beginPath();
    ctx.arc(tx, ty, 3 * u, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  if (grow !== 1) {
    const cx = x0 + width / 2,
      cy = y0 + height / 2;
    ctx.translate(cx, cy);
    ctx.scale(grow, grow);
    ctx.translate(-cx, -cy);
  }
  /** The label itself, with its top-left corner at a point. */
  const paint = (to: CanvasRenderingContext2D, left: number, top: number) => {
    to.shadowColor = "rgba(34,39,43,0.16)";
    to.shadowBlur = 14 * u;
    to.shadowOffsetY = 4 * u;
    to.fillStyle = dark ? INK_CSS : "rgba(255,255,255,0.96)";
    to.beginPath();
    to.roundRect(left, top, width, height, height / 2);
    to.fill();
    to.shadowColor = "rgba(0,0,0,0)";
    to.shadowBlur = 0;
    to.shadowOffsetY = 0;

    let x = left + pad;
    const mid = top + height / 2;
    if (options.dot !== undefined) {
      to.beginPath();
      to.arc(x + 3.5 * u, mid, 3.5 * u, 0, TAU);
      if (options.dot) {
        to.fillStyle = options.dot;
        to.fill();
      } else {
        to.strokeStyle = dark ? "rgba(255,255,255,0.6)" : "rgba(34,39,43,0.45)";
        to.lineWidth = 1.2 * u;
        to.stroke();
      }
      x += dot;
    }
    to.textBaseline = "middle";
    to.textAlign = "left";
    if (name) {
      to.font = `400 ${12.5 * u}px ${FONT}`;
      to.fillStyle = dark ? "rgba(255,255,255,0.72)" : MUTED;
      to.fillText(name, x, mid + 0.5 * u);
      x += nameWidth + (value ? gap : 0);
    }
    if (value) {
      to.font = `600 ${12.5 * u}px ${FONT}`;
      to.fillStyle = dark ? "#ffffff" : INK_CSS;
      to.fillText(value, x, mid + 0.5 * u);
      x += valueWidth;
    }
    if (options.level !== undefined) {
      x += gap;
      to.fillStyle = dark ? "rgba(255,255,255,0.22)" : "rgba(34,39,43,0.14)";
      to.beginPath();
      to.roundRect(x, mid - 2 * u, 34 * u, 4 * u, 2 * u);
      to.fill();
      to.fillStyle = options.bar ?? "#35c46a";
      to.beginPath();
      to.roundRect(
        x,
        mid - 2 * u,
        Math.max(4 * u, 34 * u * clamp(options.level)),
        4 * u,
        2 * u,
      );
      to.fill();
    }
  };
  // A browser sets canvas text on whole pixels, so words drawn straight on
  // the plate would hop inside a label that drifts. The label is painted
  // once on a sheet of its own and that sheet is laid down wherever it falls.
  const sheet = sheetFor(
    [
      name,
      value,
      dark,
      u,
      options.dot,
      options.level === undefined ? "" : Math.round(clamp(options.level) * 68),
      options.bar,
    ].join("|"),
    width,
    height,
    u,
    paint,
  );
  if (sheet) ctx.drawImage(sheet.canvas, x0 - sheet.margin, y0 - sheet.margin);
  else paint(ctx, x0, y0);
  ctx.restore();
}

type Sheet = { canvas: HTMLCanvasElement; margin: number };
const sheets = new Map<string, Sheet>();
/** A label painted on its own small canvas, kept until it changes. */
function sheetFor(
  key: string,
  width: number,
  height: number,
  u: number,
  paint: (to: CanvasRenderingContext2D, left: number, top: number) => void,
): Sheet | undefined {
  if (typeof document === "undefined") return undefined;
  let sheet = sheets.get(key);
  if (!sheet) {
    const margin = Math.ceil(24 * u);
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width) + margin * 2;
    canvas.height = Math.ceil(height) + margin * 2;
    const to = canvas.getContext("2d");
    if (!to) return undefined;
    paint(to, margin, margin);
    if (sheets.size > 160) sheets.clear();
    sheets.set(key, (sheet = { canvas, margin }));
  }
  return sheet;
}

export type Glyph =
  | "lock"
  | "unlock"
  | "phone"
  | "bolt"
  | "shield"
  | "update"
  | "screen"
  | "heat"
  | "air"
  | "eye"
  | "person"
  | "check"
  | "sound"
  | "snow"
  | "moon"
  | "park"
  | "bag"
  | "pin";
/** Icons, drawn in a box from −1 to 1. */
function glyph(ctx: CanvasRenderingContext2D, name: Glyph) {
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 0.17;
  ctx.beginPath();
  if (name === "lock" || name === "unlock") {
    ctx.roundRect(-0.52, -0.08, 1.04, 0.82, 0.14);
    ctx.fill();
    ctx.beginPath();
    if (name === "lock") {
      ctx.moveTo(-0.3, -0.08);
      ctx.lineTo(-0.3, -0.36);
      ctx.arc(0, -0.36, 0.3, Math.PI, 0);
      ctx.lineTo(0.3, -0.08);
    } else {
      ctx.moveTo(-0.3, -0.08);
      ctx.lineTo(-0.3, -0.42);
      ctx.arc(0, -0.42, 0.3, Math.PI, -0.35);
    }
    ctx.stroke();
  } else if (name === "phone") {
    ctx.roundRect(-0.36, -0.7, 0.72, 1.4, 0.14);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.1, 0.46);
    ctx.lineTo(0.1, 0.46);
    ctx.stroke();
  } else if (name === "bolt") {
    ctx.moveTo(0.14, -0.74);
    ctx.lineTo(-0.4, 0.1);
    ctx.lineTo(-0.02, 0.1);
    ctx.lineTo(-0.14, 0.74);
    ctx.lineTo(0.4, -0.1);
    ctx.lineTo(0.02, -0.1);
    ctx.closePath();
    ctx.fill();
  } else if (name === "shield") {
    ctx.moveTo(0, -0.74);
    ctx.lineTo(0.58, -0.5);
    ctx.quadraticCurveTo(0.62, 0.34, 0, 0.76);
    ctx.quadraticCurveTo(-0.62, 0.34, -0.58, -0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.24, 0.02);
    ctx.lineTo(-0.04, 0.24);
    ctx.lineTo(0.28, -0.2);
    ctx.stroke();
  } else if (name === "update") {
    ctx.moveTo(0, -0.66);
    ctx.lineTo(0, 0.22);
    ctx.moveTo(-0.34, -0.1);
    ctx.lineTo(0, 0.24);
    ctx.lineTo(0.34, -0.1);
    ctx.moveTo(-0.5, 0.64);
    ctx.lineTo(0.5, 0.64);
    ctx.stroke();
  } else if (name === "screen") {
    ctx.roundRect(-0.7, -0.48, 1.4, 0.92, 0.12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.26, 0.7);
    ctx.lineTo(0.26, 0.7);
    ctx.stroke();
  } else if (name === "heat") {
    for (const x of [-0.42, 0, 0.42]) {
      ctx.moveTo(x, 0.6);
      ctx.bezierCurveTo(x - 0.26, 0.2, x + 0.26, -0.2, x, -0.6);
    }
    ctx.stroke();
  } else if (name === "air") {
    for (const y of [-0.4, 0, 0.4]) {
      ctx.moveTo(-0.62, y);
      ctx.lineTo(y === 0 ? 0.62 : 0.3, y);
    }
    ctx.stroke();
  } else if (name === "eye") {
    ctx.moveTo(-0.74, 0);
    ctx.quadraticCurveTo(0, -0.7, 0.74, 0);
    ctx.quadraticCurveTo(0, 0.7, -0.74, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, 0.2, 0, TAU);
    ctx.fill();
  } else if (name === "person") {
    ctx.arc(0, -0.44, 0.24, 0, TAU);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-0.46, 0.7);
    ctx.quadraticCurveTo(-0.46, -0.02, 0, -0.02);
    ctx.quadraticCurveTo(0.46, -0.02, 0.46, 0.7);
    ctx.closePath();
    ctx.fill();
  } else if (name === "sound") {
    ctx.moveTo(-0.66, -0.2);
    ctx.lineTo(-0.36, -0.2);
    ctx.lineTo(-0.02, -0.52);
    ctx.lineTo(-0.02, 0.52);
    ctx.lineTo(-0.36, 0.2);
    ctx.lineTo(-0.66, 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-0.02, 0, 0.34, -0.8, 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-0.02, 0, 0.64, -0.8, 0.8);
    ctx.stroke();
  } else if (name === "snow") {
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3;
      ctx.moveTo(-0.68 * Math.cos(a), -0.68 * Math.sin(a));
      ctx.lineTo(0.68 * Math.cos(a), 0.68 * Math.sin(a));
    }
    ctx.stroke();
  } else if (name === "moon") {
    ctx.arc(0, 0, 0.62, 0.9, 0.9 + Math.PI * 1.5);
    ctx.quadraticCurveTo(0.1, 0.1, 0.39, 0.49);
    ctx.fill();
  } else if (name === "park") {
    ctx.moveTo(-0.26, 0.62);
    ctx.lineTo(-0.26, -0.58);
    ctx.lineTo(0.08, -0.58);
    ctx.arc(0.08, -0.26, 0.32, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(-0.26, 0.06);
    ctx.stroke();
  } else if (name === "bag") {
    ctx.roundRect(-0.5, -0.2, 1.0, 0.86, 0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -0.2, 0.26, Math.PI, 0);
    ctx.stroke();
  } else if (name === "pin") {
    ctx.arc(0, -0.2, 0.42, Math.PI * 0.85, Math.PI * 0.15);
    ctx.lineTo(0, 0.74);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -0.2, 0.13, 0, TAU);
    ctx.fill();
  } else {
    ctx.moveTo(-0.44, 0.02);
    ctx.lineTo(-0.12, 0.36);
    ctx.lineTo(0.48, -0.36);
    ctx.stroke();
  }
}

export type BadgeOptions = {
  alpha?: number;
  /** 0–1.2 as it lands: it grows from nothing and settles. */
  pop?: number;
  /** A point below, joined to the badge by a hairline stem. */
  stem?: V3;
  /** Radius in CSS pixels. */
  radius?: number;
  /** Greyed out: what the badge stands for is not offered. */
  off?: boolean;
};
/** A round icon badge standing over a point: what a thing does, in one mark. */
export function badge(
  plate: Plate,
  at: V3,
  icon: Glyph,
  colour: V3,
  options: BadgeOptions = {},
) {
  const { ctx } = plate;
  const alpha = clamp(options.alpha ?? 1);
  if (alpha <= 0.01) return;
  const u = size(plate);
  const [x, y] = spot(plate, at);
  const r = (options.radius ?? 19) * u * clamp(options.pop ?? 1, 0, 1.25);
  ctx.save();
  ctx.globalAlpha = alpha;
  const tint = options.off ? "#b9bbbd" : css(colour);
  if (options.stem) {
    const [sx, sy] = spot(plate, options.stem);
    const line = ctx.createLinearGradient(x, y, sx, sy);
    line.addColorStop(0, tint);
    line.addColorStop(1, options.off ? "rgba(150,152,155,0)" : css(colour, 0));
    ctx.strokeStyle = line;
    ctx.lineWidth = 1.6 * u;
    ctx.beginPath();
    ctx.moveTo(x, y + r);
    ctx.lineTo(sx, sy);
    ctx.stroke();
  }
  ctx.shadowColor = options.off ? "rgba(34,39,43,0.16)" : css(colour, 0.4);
  ctx.shadowBlur = 16 * u;
  ctx.shadowOffsetY = 5 * u;
  const body = ctx.createLinearGradient(x, y - r, x, y + r);
  body.addColorStop(0, options.off ? "#f2f2f1" : "#ffffff");
  body.addColorStop(1, options.off ? "#dcdcda" : css(colour, 0.34));
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
  ctx.shadowColor = "rgba(0,0,0,0)";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = options.off ? "rgba(34,39,43,0.12)" : css(colour, 0.7);
  ctx.lineWidth = 1.2 * u;
  ctx.stroke();
  ctx.translate(x, y);
  ctx.scale(r * 0.56, r * 0.56);
  ctx.fillStyle = options.off ? "#8d9093" : css(mixInk(colour));
  ctx.strokeStyle = ctx.fillStyle;
  glyph(ctx, icon);
  ctx.restore();
}
/** An accent, darkened until it can carry an icon on a pale disc. */
const mixInk = (c: V3): V3 => [c[0] * 0.5, c[1] * 0.5, c[2] * 0.5];

export type LineOptions = {
  alpha?: number;
  width?: number;
  /** Dash and gap in CSS pixels. */
  dash?: [number, number];
  /** Draw only this far along: 0–1. */
  drawn?: number;
  /** Fractions along the line where a round arrow node rides. */
  nodes?: number[];
};
/** The point a fraction of the way along a polyline, and its direction. */
function along(points: V2[], f: number): { p: V2; angle: number } {
  const lengths = points.map((p, i) =>
    i ? Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) : 0,
  );
  const total = lengths.reduce((a, b) => a + b, 0);
  let d = clamp(f) * total;
  for (let i = 1; i < points.length; i++) {
    if (d <= lengths[i] || i === points.length - 1) {
      const g = lengths[i] ? clamp(d / lengths[i]) : 0;
      const a = points[i - 1],
        b = points[i];
      return {
        p: [lerp(a[0], b[0], g), lerp(a[1], b[1], g)],
        angle: Math.atan2(b[1] - a[1], b[0] - a[0]),
      };
    }
    d -= lengths[i];
  }
  return { p: points[0], angle: 0 };
}
/** A line through points in the world: a flow of energy, a signal, a route. */
export function flow(
  plate: Plate,
  path: V3[],
  colour: V3,
  options: LineOptions = {},
) {
  const { ctx } = plate;
  const alpha = clamp(options.alpha ?? 1),
    drawn = clamp(options.drawn ?? 1);
  if (alpha <= 0.01 || drawn <= 0.001 || path.length < 2) return;
  const u = size(plate);
  const points = path.map((p) => spot(plate, p));
  const steps = 48;
  const shown: V2[] = [];
  for (let i = 0; i <= steps; i++)
    shown.push(along(points, (i / steps) * drawn).p);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = css(colour);
  ctx.lineWidth = (options.width ?? 2.2) * u;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (options.dash) ctx.setLineDash(options.dash.map((d) => d * u));
  ctx.beginPath();
  shown.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.setLineDash([]);
  for (const f of options.nodes ?? []) {
    if (f < 0 || f > drawn) continue;
    const { p, angle } = along(points, f);
    const r = 8 * u;
    ctx.fillStyle = css(colour);
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, TAU);
    ctx.fill();
    ctx.translate(p[0], p[1]);
    ctx.rotate(angle);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.7 * u;
    ctx.beginPath();
    ctx.moveTo(-3.4 * u, 0);
    ctx.lineTo(3.4 * u, 0);
    ctx.moveTo(0.4 * u, -3 * u);
    ctx.lineTo(3.4 * u, 0);
    ctx.lineTo(0.4 * u, 3 * u);
    ctx.stroke();
    ctx.rotate(-angle);
    ctx.translate(-p[0], -p[1]);
    ctx.strokeStyle = css(colour);
  }
  ctx.restore();
}
/** A measure between two points in the world: a line with a stop at each end. */
export function measure(
  plate: Plate,
  a: V3,
  b: V3,
  colour: string = INK_CSS,
  alpha = 1,
) {
  const { ctx } = plate;
  if (alpha <= 0.01) return;
  const u = size(plate);
  const [ax, ay] = spot(plate, a),
    [bx, by] = spot(plate, b);
  const l = Math.hypot(bx - ax, by - ay) || 1;
  const nx = (-(by - ay) / l) * 5 * u,
    ny = ((bx - ax) / l) * 5 * u;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1.3 * u;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.moveTo(ax - nx, ay - ny);
  ctx.lineTo(ax + nx, ay + ny);
  ctx.moveTo(bx - nx, by - ny);
  ctx.lineTo(bx + nx, by + ny);
  ctx.stroke();
  ctx.restore();
}
/** A soft round bloom of light at a point in the world: a lamp, a screen. */
export function bloom(
  plate: Plate,
  at: V3,
  radius: number,
  colour: V3,
  strength: number,
) {
  if (strength <= 0.01) return;
  const { ctx } = plate;
  const [x, y] = spot(plate, at);
  const r = radius * plate.cam.scale;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, css(colour, 0.55 * clamp(strength)));
  g.addColorStop(1, css(colour, 0));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

/** A$58,900. */
export const dollars = (n: number) =>
  `A$${Math.round(n).toLocaleString("en-AU")}`;
/** The first clause of a researched answer, short enough for a label. */
export function brief(text: string | undefined, limit = 34) {
  if (!text) return "Not stated";
  const first = text.split(/ — | · /)[0].trim();
  return first.length > limit
    ? `${first.slice(0, limit - 1).trimEnd()}…`
    : first;
}

/**
 * A line of small print along the foot of the plate: the basis of a figure,
 * or a condition the picture cannot show.
 */
export function caption(plate: Plate, text: string, alpha = 1) {
  const a = clamp(alpha);
  if (a <= 0.01 || !text) return;
  const { ctx } = plate;
  const u = size(plate);
  ctx.save();
  ctx.globalAlpha = a;
  let px = 11.5 * u;
  ctx.font = `400 ${px}px ${FONT}`;
  // A long condition shrinks to the plate before it is ever cut.
  const room = plate.width - 40 * u;
  const wide = ctx.measureText(text).width + 26 * u;
  if (wide > room) {
    px *= room / wide;
    ctx.font = `400 ${px}px ${FONT}`;
  }
  const width = Math.min(room, ctx.measureText(text).width + 26 * u),
    height = 25 * u;
  // The page lays its beat names over the plate's bottom left, and over the
  // foot of a phone's plate: the small print keeps clear of both.
  const x0 = plate.wide
      ? plate.width - width - 22 * u
      : (plate.width - width) / 2,
    y0 = plate.wide
      ? plate.height - height - 16 * u
      : plate.height * 0.845 - height;
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.beginPath();
  ctx.roundRect(x0, y0, width, height, height / 2);
  ctx.fill();
  ctx.fillStyle = MUTED;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(text, x0 + 13 * u, y0 + height / 2 + 0.5 * u);
  ctx.restore();
}
/**
 * Arcs spreading from a point in the world, as a sound or a signal would:
 * `phase` 0–1 moves them outward. They are drawn on the ground plane.
 */
export function ripples(
  plate: Plate,
  at: V3,
  reach: number,
  phase: number,
  colour: V3,
  options: {
    alpha?: number;
    from?: number;
    to?: number;
    rings?: number;
    stop?: (p: V3) => number;
  } = {},
) {
  const alpha = clamp(options.alpha ?? 1);
  if (alpha <= 0.01) return;
  const { ctx } = plate;
  const u = size(plate);
  const rings = options.rings ?? 4;
  const from = options.from ?? 0,
    to = options.to ?? TAU;
  ctx.save();
  ctx.lineCap = "round";
  for (let k = 0; k < rings; k++) {
    const f = (k + (((phase % 1) + 1) % 1)) / rings;
    const r = reach * f;
    const steps = 40;
    for (let i = 0; i < steps; i++) {
      const a0 = from + ((to - from) * i) / steps,
        a1 = from + ((to - from) * (i + 1)) / steps;
      const p0: V3 = [
          at[0] + Math.cos(a0) * r,
          at[1] + Math.sin(a0) * r,
          at[2],
        ],
        p1: V3 = [at[0] + Math.cos(a1) * r, at[1] + Math.sin(a1) * r, at[2]];
      const kept = options.stop ? options.stop(p0) : 1;
      const strength =
        alpha * kept * Math.sin(Math.PI * f) ** 0.7 * (1 - 0.55 * f);
      if (strength <= 0.01) continue;
      const [x0, y0] = spot(plate, p0),
        [x1, y1] = spot(plate, p1);
      ctx.globalAlpha = strength;
      ctx.strokeStyle = css(colour);
      ctx.lineWidth = (1.1 + 1.3 * kept) * u;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  }
  ctx.restore();
}
