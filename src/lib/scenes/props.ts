/**
 * Set dressing for the chapter scenes: modernist blocks, model-maker's trees,
 * street lamps, other traffic and street furniture. Everything is a solid in
 * three flat tones, with a cast shadow by day and its own light by night.
 */
import {
  AMBER,
  RED,
  TAU,
  WARM,
  WHITE,
  YELLOW,
  box,
  clamp,
  direction,
  disc,
  glowDot,
  hull,
  lit,
  mix,
  noise,
  onWall,
  prism,
  rgba,
  shadowOf,
  tonesOf,
  trace,
  wallTones,
  type Ctx,
  type Pt,
  type Rgb,
  type Thing,
  type View,
} from "./kit";

const depthOf = (base: Pt[]) =>
  Math.max(...base.map(([x, y]) => x + y)) - 0.01 * base.length;

export type Block = {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
  /** Height it starts from: a storey on a podium, or a roof on columns. */
  from?: number;
  /** Storeys of ribbon window; 0 leaves the walls blank. */
  floors?: number;
  /** A wall colour other than white. */
  colour?: Rgb;
  /** One coloured panel on the wall facing left. */
  panel?: Rgb;
  seed?: number;
};
/** A flat-roofed block with ribbon windows on the two walls we can see. */
export function block(ctx: Ctx, view: View, b: Block): Thing {
  const base = box(b.x, b.y, b.w, b.d),
    from = b.from ?? 0;
  return {
    depth: depthOf(base),
    shadow: [shadowOf(view, base, from, b.h)],
    draw: () => {
      const tones = b.colour ? tonesOf(view, b.colour) : wallTones(view);
      prism(ctx, view, base, base, from, b.h, tones);
      const floors = b.floors ?? Math.max(1, Math.round((b.h - from) / 30));
      const seed = b.seed ?? b.x * 0.013 + b.y * 0.007;
      if (floors > 0) {
        const storey = (b.h - from) / floors;
        const band = storey * 0.42,
          sill = storey * 0.34;
        // By night some rooms are lit; by day the glass is one cool band.
        const windows = (
          along: "x" | "y",
          at: number,
          start: number,
          length: number,
          salt: number,
        ) =>
          onWall(ctx, view, along, at, () => {
            const bays = Math.max(2, Math.round(length / 15));
            const gap = Math.min(7, length * 0.08),
              bay = (length - gap * 2) / bays;
            const daylit = lit(view.pal.glass, along === "x" ? 1 : 0.86);
            // A wall has two colours of window, so each is filled as one
            // path: a city block is thousands of panes every frame.
            const rooms: number[] = [];
            ctx.fillStyle = rgba(mix(view.pal.glass, daylit, view.day));
            ctx.beginPath();
            for (let f = 0; f < floors; f++)
              for (let i = 0; i < bays; i++) {
                const x = start + gap + i * bay + 0.6,
                  z = from + f * storey + sill;
                if (
                  noise(seed * 37 + f * 5.3 + i * 1.7 + salt) >
                  0.62 + 0.2 * view.day
                )
                  rooms.push(x, z);
                else ctx.rect(x, z, bay - 1.2, band);
              }
            ctx.fill();
            if (!rooms.length) return;
            ctx.fillStyle = rgba(mix(mix(YELLOW, WARM, 0.4), daylit, view.day));
            ctx.beginPath();
            for (let i = 0; i < rooms.length; i += 2)
              ctx.rect(rooms[i], rooms[i + 1], bay - 1.2, band);
            ctx.fill();
          });
        windows("x", b.y + b.d, b.x, b.w, 1);
        windows("y", b.x + b.w, b.y, b.d, 2);
      }
      if (b.panel)
        onWall(ctx, view, "x", b.y + b.d, () => {
          ctx.fillStyle = rgba(
            mix(mix(b.panel!, view.pal.ground, 0.45), b.panel!, view.day),
          );
          ctx.fillRect(
            b.x + b.w * 0.08,
            from,
            Math.min(16, b.w * 0.22),
            Math.min(34, (b.h - from) * 0.8),
          );
        });
      // A roof with an upstand: the line that makes a flat roof read as one.
      ctx.strokeStyle = rgba(mix(tones.top, tones.shade, 0.55));
      ctx.lineWidth = Math.max(0.6 * view.unit, 0.5 * view.k);
      trace(
        ctx,
        box(b.x + 3, b.y + 3, b.w - 6, b.d - 6).map(([x, y]) =>
          view.at(x, y, b.h),
        ),
      );
      ctx.stroke();
    },
  };
}
/** A thin slab: a canopy, a plinth, a kerb or a step. */
export function slab(
  ctx: Ctx,
  view: View,
  base: Pt[],
  from: number,
  to: number,
  colour?: Rgb,
  shadow = true,
): Thing {
  return {
    depth: depthOf(base),
    shadow: shadow ? [shadowOf(view, base, from, to)] : [],
    draw: () =>
      prism(
        ctx,
        view,
        base,
        base,
        from,
        to,
        colour ? tonesOf(view, colour) : wallTones(view),
      ),
  };
}

export type Tree = {
  x: number;
  y: number;
  r?: number;
  h?: number;
  cone?: boolean;
};
/** An architect's-model tree: a ball or a cone on a stem. */
export function tree(ctx: Ctx, view: View, t: Tree): Thing {
  const r = t.r ?? 17,
    h = t.h ?? 34;
  const [sx, sy] = view.sun;
  return {
    depth: t.x + t.y + 2,
    shadow: [
      t.cone
        ? hull([
            ...disc(t.x, t.y, r * 0.7, 10),
            [t.x + sx * (h + r * 2.2), t.y + sy * (h + r * 2.2)],
          ])
        : disc(t.x + sx * h, t.y + sy * h, r * 0.96, 20),
      hull([
        [t.x - 1, t.y],
        [t.x + 1, t.y],
        [t.x + sx * h + 1, t.y + sy * h],
        [t.x + sx * h - 1, t.y + sy * h],
      ]),
    ],
    draw: () => {
      const { k, pal } = view;
      const [bx, by] = view.at(t.x, t.y, 0),
        [cx, cy] = view.at(t.x, t.y, h);
      ctx.strokeStyle = rgba(pal.stem);
      ctx.lineWidth = Math.max(view.unit, 1.6 * k);
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(cx, cy);
      ctx.stroke();
      if (t.cone) {
        const [ax, ay] = view.at(t.x, t.y, h + r * 2.4);
        const w = r * 0.72 * k,
          baseY = cy - r * 0.1 * k;
        ctx.fillStyle = rgba(pal.leafShade);
        ctx.beginPath();
        ctx.moveTo(cx - w, baseY);
        ctx.quadraticCurveTo(cx, baseY + w * 0.7, cx + w, baseY);
        ctx.lineTo(ax, ay);
        ctx.fill();
        ctx.fillStyle = rgba(pal.leaf);
        ctx.beginPath();
        ctx.moveTo(cx - w, baseY);
        ctx.quadraticCurveTo(
          cx - w * 0.3,
          baseY + w * 0.62,
          cx + w * 0.12,
          baseY + w * 0.5,
        );
        ctx.lineTo(ax, ay);
        ctx.fill();
        return;
      }
      // A ball, lit from the upper left: shade, then light, then a highlight.
      ctx.fillStyle = rgba(pal.leafShade);
      ctx.beginPath();
      ctx.arc(cx, cy, r * k, 0, TAU);
      ctx.fill();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r * k, 0, TAU);
      ctx.clip();
      ctx.fillStyle = rgba(pal.leaf);
      ctx.beginPath();
      ctx.arc(cx - r * 0.3 * k, cy - r * 0.32 * k, r * 0.98 * k, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(mix(pal.leaf, WHITE, 0.2 * view.day + 0.06));
      ctx.beginPath();
      ctx.arc(cx - r * 0.52 * k, cy - r * 0.56 * k, r * 0.56 * k, 0, TAU);
      ctx.fill();
      ctx.restore();
    },
  };
}

/** Pole position, then where the lamp head hangs. */
export type Lamp = [Pt, Pt];
export function lamp(
  ctx: Ctx,
  view: View,
  [pole, head]: Lamp,
  height = 48,
): Thing {
  const [sx, sy] = view.sun;
  return {
    depth: pole[0] + pole[1] + 1,
    shadow: [
      hull([
        [pole[0] - 0.7, pole[1]],
        [pole[0] + 0.7, pole[1]],
        [pole[0] + sx * height + 0.7, pole[1] + sy * height],
        [pole[0] + sx * height - 0.7, pole[1] + sy * height],
        [head[0] + sx * height, head[1] + sy * height],
      ]),
    ],
    draw: () => {
      ctx.strokeStyle = rgba(view.pal.metal);
      ctx.lineWidth = Math.max(view.unit, 1.1 * view.k);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(...view.at(pole[0], pole[1], 0));
      ctx.lineTo(...view.at(pole[0], pole[1], height));
      ctx.lineTo(...view.at(head[0], head[1], height));
      ctx.stroke();
      ctx.lineCap = "butt";
      const at = view.at(head[0], head[1], height - 1);
      ctx.fillStyle = rgba(mix(WARM, view.pal.metal, view.day));
      ctx.beginPath();
      ctx.arc(at[0], at[1], 1.5 * view.k, 0, TAU);
      ctx.fill();
      glowDot(ctx, at, 2.4 * view.k, WARM, 0.95 * view.night);
    },
  };
}

/** A car that is not the Model Y: deliberately generic. */
export type Traffic = {
  x: number;
  y: number;
  heading: number;
  colour?: Rgb;
  opacity?: number;
  /** Traced in light once noticed, in this colour. */
  seen?: number;
  seenColour?: Rgb;
  braking?: number;
};
function carOutline(
  pose: { x: number; y: number; heading: number },
  back: number,
  front: number,
  half: number,
  chamfer: number,
): Pt[] {
  const [dx, dy] = direction(pose.heading);
  const local: Pt[] = [
    [back + chamfer, -half],
    [front - chamfer * 1.5, -half],
    [front, -half + chamfer * 1.3],
    [front, half - chamfer * 1.3],
    [front - chamfer * 1.5, half],
    [back + chamfer, half],
    [back, half - chamfer],
    [back, -half + chamfer],
  ];
  return local.map(([u, v]): Pt => [
    pose.x + dx * u - dy * v,
    pose.y + dy * u + dx * v,
  ]);
}
export function trafficShadow(view: View, car: Traffic): Pt[] {
  return shadowOf(view, carOutline(car, -36, 36, 16, 6), 4, 22);
}
export function traffic(ctx: Ctx, view: View, car: Traffic): Thing {
  const body = carOutline(car, -36, 36, 16.4, 6);
  return {
    depth: car.x + car.y,
    shadow: [trafficShadow(view, car)],
    draw: () => {
      const { k, day, night } = view;
      const opacity = clamp(car.opacity ?? 1);
      if (opacity <= 0.01) return;
      const paint = mix(
        mix(car.colour ?? [200, 206, 208], [46, 72, 98], 0.72),
        car.colour ?? [200, 206, 208],
        day,
      );
      ctx.globalAlpha = opacity;
      for (const [back, front] of [
        [-27, -13],
        [14, 28],
      ]) {
        const wheels = carOutline(car, back, front, 17.2, 2);
        prism(
          ctx,
          view,
          wheels,
          wheels,
          0,
          9,
          tonesOf(view, mix([8, 12, 18], [34, 38, 41], day)),
          opacity,
        );
      }
      prism(ctx, view, body, body, 5, 17, tonesOf(view, paint), opacity);
      prism(
        ctx,
        view,
        carOutline(car, -26, 13, 14.4, 4),
        carOutline(car, -20, 5, 12, 3),
        17,
        26.5,
        tonesOf(view, mix([14, 26, 38], [58, 78, 90], day)),
        opacity,
      );
      // A roof in the body colour, so the dark band reads as windows.
      const roof = carOutline(car, -19.4, 4.4, 11.6, 3);
      prism(ctx, view, roof, roof, 26.5, 28, tonesOf(view, paint), opacity);
      ctx.globalAlpha = opacity;
      const [dx, dy] = direction(car.heading);
      const at = (u: number, v: number, z: number) =>
        view.at(car.x + dx * u - dy * v, car.y + dy * u + dx * v, z);
      const seen = clamp(car.seen ?? 0);
      if (seen > 0.02) {
        ctx.globalCompositeOperation = "lighter";
        for (const [width, alpha] of [
          [5, 0.25],
          [1.6, 0.95],
        ]) {
          ctx.strokeStyle = rgba(
            car.seenColour ?? [119, 185, 213],
            alpha * seen,
          );
          ctx.lineWidth = width * k;
          trace(
            ctx,
            body.map(([x, y]) => view.at(x, y, 17)),
          );
          ctx.stroke();
        }
        ctx.globalCompositeOperation = "source-over";
      }
      if (dx + dy > -0.25)
        for (const v of [-11, 11]) {
          const p = at(36.4, v, 12);
          ctx.fillStyle = rgba(mix(WARM, WHITE, 0.5));
          ctx.beginPath();
          ctx.arc(p[0], p[1], 0.9 * k, 0, TAU);
          ctx.fill();
          glowDot(ctx, p, 2.6 * k, WARM, 0.95 * night * opacity);
        }
      if (dx + dy < 0.25)
        for (const v of [-11, 11]) {
          const p = at(-36.4, v, 13);
          ctx.fillStyle = rgba(RED);
          ctx.beginPath();
          ctx.arc(p[0], p[1], 0.9 * k, 0, TAU);
          ctx.fill();
          glowDot(
            ctx,
            p,
            2.2 * k,
            RED,
            (0.5 + 0.4 * (car.braking ?? 0)) * night * opacity,
          );
        }
      ctx.globalAlpha = 1;
    },
  };
}

/** An octagonal stop sign on a post. No lettering: the shape and colour say it. */
export function stopSign(ctx: Ctx, view: View, [x, y]: Pt): Thing {
  return {
    depth: x + y + 1,
    shadow: [
      hull([
        [x - 0.6, y],
        [x + 0.6, y],
        [x + view.sun[0] * 40, y + view.sun[1] * 40],
        ...disc(x + view.sun[0] * 40, y + view.sun[1] * 40, 5, 8),
      ]),
    ],
    draw: () => {
      const { k } = view;
      ctx.strokeStyle = rgba(view.pal.metal);
      ctx.lineWidth = Math.max(view.unit, 1.1 * k);
      ctx.beginPath();
      ctx.moveTo(...view.at(x, y, 0));
      ctx.lineTo(...view.at(x, y, 34));
      ctx.stroke();
      const [cx, cy] = view.at(x, y, 40);
      const face = (r: number, colour: string) => {
        ctx.fillStyle = colour;
        ctx.beginPath();
        for (let i = 0; i < 8; i++)
          ctx.lineTo(
            cx + r * k * Math.cos(((i + 0.5) / 8) * TAU),
            cy + r * k * Math.sin(((i + 0.5) / 8) * TAU),
          );
        ctx.closePath();
        ctx.fill();
      };
      face(7.4, rgba(mix([226, 232, 234], WHITE, view.day)));
      face(6.2, rgba(mix(lit(RED, 0.82), RED, view.day)));
    },
  };
}
/** Traffic lights; `go` 0–1 moves from red through amber to green. */
export function signal(ctx: Ctx, view: View, [x, y]: Pt, go = 1): Thing {
  return {
    depth: x + y + 1,
    shadow: [
      hull([
        [x - 0.6, y],
        [x + 0.6, y],
        [x + view.sun[0] * 44 + 2, y + view.sun[1] * 44],
        [x + view.sun[0] * 44 - 2, y + view.sun[1] * 44],
        [x + view.sun[0] * 30 - 2, y + view.sun[1] * 30],
      ]),
    ],
    draw: () => {
      const { k } = view;
      ctx.strokeStyle = rgba(view.pal.metal);
      ctx.lineWidth = Math.max(view.unit, 1.1 * k);
      ctx.beginPath();
      ctx.moveTo(...view.at(x, y, 0));
      ctx.lineTo(...view.at(x, y, 30));
      ctx.stroke();
      const [cx, cy] = view.at(x, y, 37);
      ctx.fillStyle = rgba(mix([6, 12, 18], [34, 42, 46], view.day));
      ctx.beginPath();
      ctx.roundRect(cx - 2.6 * k, cy - 7.4 * k, 5.2 * k, 14.8 * k, 1.6 * k);
      ctx.fill();
      const lamps: [Rgb, number][] = [
        [RED, clamp(1 - go * 2.5)],
        [AMBER, clamp(1 - Math.abs(go - 0.45) * 5)],
        [[120, 220, 140], clamp(go * 2.5 - 1.2)],
      ];
      lamps.forEach(([colour, on], i) => {
        const py = cy + (i - 1) * 4.6 * k;
        ctx.fillStyle = rgba(mix(lit(colour, 0.22), colour, on));
        ctx.beginPath();
        ctx.arc(cx, py, 1.5 * k, 0, TAU);
        ctx.fill();
        glowDot(ctx, [cx, py], 1.7 * k, colour, 0.9 * on * view.night);
      });
    },
  };
}

/** How tall the phone stands, in scene units. */
export const HANDSET_HIGH = 11;
/**
 * A phone, hanging in the air where a hand would hold it: it stands for its
 * owner, so a scene about the car needs no figure. Drawn large enough to read.
 */
export function handset(
  ctx: Ctx,
  view: View,
  [x, y, z]: [number, number, number],
  screen: Rgb,
  opacity = 1,
): Thing {
  // Half as big again as it first was: it is the actor, and has to carry.
  const s = HANDSET_HIGH / 7.4;
  const base = box(x - 2.1 * s, y - 0.45 * s, 4.2 * s, 0.9 * s);
  return {
    depth: x + y,
    shadow: opacity > 0.5 ? [shadowOf(view, base, z, z + HANDSET_HIGH)] : [],
    draw: () => {
      if (opacity <= 0.01) return;
      ctx.globalAlpha = opacity;
      prism(
        ctx,
        view,
        base,
        base,
        z,
        z + HANDSET_HIGH,
        tonesOf(view, [28, 38, 44]),
      );
      ctx.fillStyle = rgba(screen);
      trace(ctx, [
        view.at(x - 1.6 * s, y + 0.46 * s, z + 0.9 * s),
        view.at(x + 1.6 * s, y + 0.46 * s, z + 0.9 * s),
        view.at(x + 1.6 * s, y + 0.46 * s, z + 6.5 * s),
        view.at(x - 1.6 * s, y + 0.46 * s, z + 6.5 * s),
      ]);
      ctx.fill();
      ctx.globalAlpha = 1;
    },
  };
}
