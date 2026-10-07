/**
 * Automated driving, at night: a drive through a city grid in left-hand
 * traffic, choreographed in `driving-sim.ts`. The camera follows the car and
 * closes in each time it has a decision to make; the street dims around
 * whatever it is giving way to. Lines of light show what it has noticed.
 * Conceptual illustration only; it models no manufacturer's system.
 */
import {
  BX,
  DX,
  DY,
  LOOP,
  STILL,
  acts,
  cameraAt,
  mod as wrap,
  ramp as easeBetween,
  sceneAt,
  type Actor,
  type Scene,
} from "../driving-sim";
import {
  PAPER,
  RED,
  SKY,
  TAU,
  WARM,
  YELLOW,
  backdrop,
  castShadows,
  clamp,
  direction,
  disc,
  focusOn,
  glow,
  hex,
  makeView,
  mix,
  noise,
  onGround,
  paint,
  pool,
  rgba,
  shadowsOf,
  trace,
  type ChapterScene,
  type Ctx,
  type Pt,
  type SceneFrame,
  type Thing,
  type View,
} from "./kit";
import { drawToken, lookFor, type Look } from "./figure";
import { carOnGround, drawCar, footprint, type Car } from "./model-y";
import {
  block,
  lamp,
  signal,
  slab,
  stopSign,
  traffic,
  tree,
  type Block,
  type Lamp,
} from "./props";

const BLUE = hex("#77b9d5");

/* ---------- The city, generated block by block ---------- */

type Plot = {
  plaza: [number, number, number, number];
  podium: Block;
  tower: Block | null;
  trees: Pt[];
  lamps: Lamp[];
};
const plots = new Map<string, Plot>();
/**
 * Blocks on the same diagonal are identical, which is what lets the drive
 * loop. Buildings hug the south-east corner and stay lower than their
 * distance from the streets behind them, so they never hide the road.
 */
function plotAt(n: number, m: number, wide: 0 | 1): Plot {
  const id = `${n},${m},${wide}`;
  const known = plots.get(id);
  if (known) return known;
  const seed = (n + m) * 2 + wide;
  const rnd = (i: number) => noise(seed * 91.7 + i * 13.1);
  const x0 = n * DX + (wide ? BX : 0) + 72,
    x1 = n * DX + (wide ? DX : BX) - 72,
    y0 = m * DY + 72,
    y1 = (m + 1) * DY - 72;
  // The wide block's corner faces a roundabout, so it steps back from it.
  const inset = wide ? 44 : 6;
  const w = 150 + rnd(1) * 40,
    d = 130 + rnd(2) * 40,
    h = 36 + rnd(3) * 22;
  const tw = 70 + rnd(4) * 30,
    td = 70 + rnd(5) * 30;
  const room = Math.min(x1 - inset - tw - x0, y1 - inset - td - y0) - 12;
  const high = Math.min(110 + rnd(6) * 90, room);
  const trees: Pt[] = [];
  [40, 130, 220].forEach((x, i) => {
    if (rnd(10 + i) > 0.2) trees.push([x0 + x + rnd(20 + i) * 16, y0 + 40]);
  });
  [140, 232].forEach((y, i) => {
    if (rnd(14 + i) > 0.2) trees.push([x0 + 40, y0 + y + rnd(24 + i) * 16]);
  });
  const plot: Plot = {
    plaza: [x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20],
    podium: { x: x1 - inset - w, y: y1 - inset - d, w, d, h, floors: 2, seed },
    tower:
      high > h + 30
        ? {
            x: x1 - inset - tw,
            y: y1 - inset - td,
            w: tw,
            d: td,
            from: h,
            h: high,
            floors: Math.max(2, Math.round((high - h) / 26)),
            seed: seed + 0.5,
          }
        : null,
    trees,
    lamps: [
      [
        [(x0 + x1) / 2, y0 - 9],
        [(x0 + x1) / 2, y0 - 27],
      ],
      [
        [x0 - 9, (y0 + y1) / 2],
        [x0 - 27, (y0 + y1) / 2],
      ],
    ],
  };
  plots.set(id, plot);
  return plot;
}
/** Junction streets alternate between stop signs and traffic lights. */
const hasSignals = (n: number, m: number) => wrap(n + m, 2) === 1;

/* ---------- The cast ---------- */

const looks = new Map<string, Look>();
function lookOf(id: string): Look {
  const name = id.replace(/-?\d+$/, "");
  let look = looks.get(name);
  if (!look) {
    let seed = 0;
    for (const letter of name) seed = seed * 31 + letter.charCodeAt(0);
    look = lookFor(seed % 97, name === "couple-b" ? 0.94 : 1);
    looks.set(name, look);
  }
  return look;
}
const PAINTS = ["#c9ced0", "#e8452c", "#f5f5f0", "#2f6f8f", "#f1cf50"].map(hex);

/** The supervising driver: hands on the wheel, tethered to the car. */
function supervision(ctx: Ctx, view: View, scene: Scene) {
  const { unit, height } = view;
  const r = 25 * unit,
    cx = 16 * unit + r,
    cy = height - 16 * unit - r;
  // Right-hand drive: the tether meets the roof above the driver's seat.
  const [hx, hy] = direction(scene.ego.heading);
  const [ex, ey] = view.at(
    scene.ego.x + hx * 3 - hy * 6,
    scene.ego.y + hy * 3 + hx * 6,
    26.6,
  );
  const len = Math.hypot(ex - cx, ey - cy) || 1;
  ctx.strokeStyle = rgba(PAPER, 0.5);
  ctx.lineWidth = unit;
  ctx.setLineDash([3 * unit, 4 * unit]);
  ctx.beginPath();
  ctx.moveTo(cx + ((ex - cx) / len) * r, cy + ((ey - cy) / len) * r);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = rgba(PAPER, 0.9);
  ctx.beginPath();
  ctx.arc(ex, ey, 2.2 * unit, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "rgba(8,17,27,0.86)";
  ctx.strokeStyle = rgba(PAPER, 0.55);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, TAU);
  ctx.fill();
  ctx.stroke();
  const wheel = 13 * unit;
  ctx.strokeStyle = rgba(BLUE);
  ctx.lineWidth = 3 * unit;
  ctx.beginPath();
  ctx.arc(cx, cy, wheel, 0, TAU);
  ctx.moveTo(cx - wheel, cy + 2 * unit);
  ctx.lineTo(cx + wheel, cy + 2 * unit);
  ctx.moveTo(cx, cy + 2 * unit);
  ctx.lineTo(cx, cy + wheel);
  ctx.stroke();
  ctx.fillStyle = rgba(BLUE);
  ctx.beginPath();
  ctx.arc(cx, cy + 1.5 * unit, 3.6 * unit, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = rgba(PAPER);
  ctx.lineWidth = 6.4 * unit;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(
      cx,
      cy,
      wheel,
      -Math.PI / 2 + side * 0.62,
      -Math.PI / 2 + side * 1.0,
      side < 0,
    );
    ctx.stroke();
  }
  ctx.lineCap = "butt";
}

/** Paints one frame and reports which act it is in. */
function draw(
  ctx: Ctx,
  width: number,
  height: number,
  clock: number,
  unit: number,
): SceneFrame {
  // The city repeats, so wrapping the clock closes the loop exactly.
  const time = wrap(clock, LOOP);
  const scene = sceneAt(time);
  const { ego } = scene;
  const follow = cameraAt(time);
  const wide = width / height > 1.3;
  // Wide while it cruises; in close while it decides.
  const view = makeView(
    width,
    height,
    unit,
    {
      x: follow.x,
      y: follow.y,
      zoom: (wide ? 0.84 : 1.02) * Math.exp(0.46 * follow.push),
    },
    { day: 0, accent: BLUE, frame: [520, 300], centre: [0.5, 0.55] },
  );
  const { pal } = view;
  const ns: number[] = [],
    ms: number[] = [];
  for (
    let n = Math.floor((view.x0 - 20) / DX) - 1;
    n <= Math.ceil((view.x1 + 240) / DX);
    n++
  )
    ns.push(n);
  for (
    let m = Math.floor((view.y0 - 20) / DY) - 1;
    m <= Math.ceil((view.y1 + 240) / DY);
    m++
  )
    ms.push(m);
  const town: Plot[] = [],
    hubs: Pt[] = [],
    stops: Pt[] = [],
    signals: Pt[] = [];
  for (const n of ns)
    for (const m of ms) {
      town.push(plotAt(n, m, 0), plotAt(n, m, 1));
      hubs.push([n * DX, m * DY]);
      const x = n * DX + BX,
        y = m * DY;
      if (hasSignals(n, m))
        signals.push([x - 60, y - 60], [x + 60, y - 60], [x - 60, y + 60]);
      else stops.push([x - 60, y - 64], [x + 60, y + 64]);
    }
  const lampHeads = town.flatMap((plot) => plot.lamps.map(([, head]) => head));
  const others = scene.actors.filter((a) => a.kind === "car" && a.opacity > 0);
  const waitingOn = scene.actors.reduce<Actor | null>(
    (best, a) => (a.focus > (best?.focus ?? 0.02) ? a : best),
    null,
  );
  // How hard the front wheels are turned, from how fast the heading is changing.
  const turning =
    ((sceneAt(time + 0.1).ego.heading - sceneAt(time - 0.1).ego.heading + 540) %
      360) -
    180;
  const car: Car = {
    x: ego.x,
    y: ego.y,
    heading: ego.heading,
    travelled: ego.travelled,
    braking: ego.braking,
    indicator: ego.indicator,
    blink: wrap(time * 1.5, 1) < 0.5 ? 1 : 0,
    steer: clamp(turning * 0.9, -32, 32),
    lights: 1,
    people: [0],
  };

  backdrop(ctx, view);
  const things: Thing[] = [];
  for (const plot of town) {
    things.push(block(ctx, view, plot.podium));
    if (plot.tower)
      things.push({
        ...block(ctx, view, plot.tower),
        depth: plot.tower.x + plot.tower.w + plot.tower.y + plot.tower.d + 1,
      });
    for (const [x, y] of plot.trees)
      things.push(tree(ctx, view, { x, y, r: 15, h: 30 }));
    for (const post of plot.lamps) things.push(lamp(ctx, view, post));
  }
  for (const hub of hubs) {
    things.push(
      {
        ...slab(
          ctx,
          view,
          disc(hub[0], hub[1], 35, 24),
          0,
          6,
          mix(pal.paving, pal.leaf, 0.5),
        ),
        depth: hub[0] + hub[1],
      },
      {
        ...tree(ctx, view, { x: hub[0], y: hub[1], r: 13, h: 30 }),
        depth: hub[0] + hub[1] + 1,
      },
    );
  }
  for (const at of signals) things.push(signal(ctx, view, at));
  for (const at of stops) things.push(stopSign(ctx, view, at));
  for (const actor of scene.actors) {
    if (actor.opacity <= 0) continue;
    if (actor.kind === "car") {
      things.push(
        traffic(ctx, view, {
          ...actor,
          colour: PAINTS[actor.id.length % PAINTS.length],
          seen: actor.seen,
          seenColour: mix(SKY, YELLOW, actor.focus),
        }),
      );
      continue;
    }
    if (actor.kind === "dog") continue;
    const look = lookOf(actor.id);
    things.push({
      depth: actor.x + actor.y,
      draw: () =>
        drawToken(ctx, view, {
          ...actor,
          colour: look.top,
          scale: look.scale,
          time,
        }),
    });
  }
  things.push({ depth: ego.x + ego.y, draw: () => drawCar(ctx, view, car) });

  onGround(ctx, view, () => {
    const { x0, x1, y0, y1 } = view;
    ctx.fillStyle = rgba(pal.paving);
    for (const plot of town) {
      ctx.beginPath();
      ctx.roundRect(...plot.plaza, 22);
      ctx.fill();
    }
    const streets = (width: number, colour: string, hub: number) => {
      ctx.fillStyle = colour;
      for (const m of ms) ctx.fillRect(x0, m * DY - width / 2, x1 - x0, width);
      for (const n of ns) {
        ctx.fillRect(n * DX - width / 2, y0, width, y1 - y0);
        ctx.fillRect(n * DX + BX - width / 2, y0, width, y1 - y0);
      }
      ctx.beginPath();
      for (const [x, y] of hubs) {
        ctx.moveTo(x + hub, y);
        ctx.arc(x, y, hub, 0, TAU);
      }
      ctx.fill();
    };
    streets(144, rgba(mix(pal.ground, pal.paving, 0.5)), 128);
    streets(105, rgba(pal.kerb), 107.5);
    streets(100, rgba(pal.road), 105);

    // Lane lines run between junctions; give-way and stop lines guard them.
    const rule = (
      lines: number[][],
      width: number,
      alpha: number,
      dash: number[],
    ) => {
      ctx.strokeStyle = rgba(pal.mark, alpha);
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      for (const [ax, ay, bx, by] of lines) {
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    const lanes: number[][] = [],
      giveWay: number[][] = [],
      stopLines: number[][] = [];
    ctx.fillStyle = rgba(pal.mark, 0.5);
    for (const n of ns)
      for (const m of ms) {
        const ax = n * DX,
          bx = ax + BX,
          y = m * DY;
        lanes.push(
          [ax + 114, y, bx - 54, y],
          [bx + 54, y, ax + DX - 114, y],
          [ax, y + 114, ax, y + DY - 114],
          [bx, y + 54, bx, y + DY - 54],
        );
        giveWay.push(
          [ax - 112, y - 48, ax - 112, y - 2],
          [ax + 112, y + 2, ax + 112, y + 48],
          [ax - 48, y + 112, ax - 2, y + 112],
          [ax + 2, y - 112, ax + 48, y - 112],
        );
        stopLines.push(
          [bx - 53, y - 48, bx - 53, y - 2],
          [bx + 53, y + 2, bx + 53, y + 48],
        );
        if (hasSignals(n, m)) {
          stopLines.push(
            [bx - 48, y + 53, bx - 2, y + 53],
            [bx + 2, y - 53, bx + 48, y - 53],
          );
          // A crossing on the far arm.
          for (let x = bx - 44; x <= bx + 36; x += 16)
            ctx.fillRect(x, y - 104, 8, 40);
        }
      }
    rule(lanes, 2.5, 0.36, [16, 20]);
    rule(giveWay, 3.5, 0.6, [8, 6]);
    rule(stopLines, 5, 0.85, []);
    castShadows(ctx, view, shadowsOf(things));

    glow(ctx, () => {
      for (const head of lampHeads) pool(ctx, head, 130, WARM, 0.2);
    });
    // Contact shadows keep the cars on the road.
    for (const other of others) {
      ctx.fillStyle = `rgba(2,6,11,${(0.5 * other.opacity).toFixed(3)})`;
      trace(ctx, footprint(other, 0.98));
      ctx.fill();
    }

    const tone = mix(SKY, YELLOW, ego.hold);
    glow(ctx, () => {
      // Perception sweeps out from the car in rings.
      for (let i = 0; i < 3; i++) {
        const f = wrap(time / 1.25 + i / 3, 1);
        ctx.strokeStyle = rgba(SKY, 0.3 * (1 - f) ** 1.6);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(ego.x, ego.y, 40 + f * 290, 0, TAU);
        ctx.stroke();
      }
      // The planned path: bright near the car, fading ahead, yellow while it waits.
      const { route } = scene;
      ctx.lineCap = "round";
      for (let i = 1; i < route.length; i++) {
        const fade = (1 - i / route.length) ** 1.1;
        for (const [stroke, alpha] of [
          [22, 0.07],
          [8, 0.3],
          [2.6, 0.9],
        ]) {
          ctx.strokeStyle = rgba(tone, alpha * fade);
          ctx.lineWidth = stroke;
          ctx.beginPath();
          ctx.moveTo(...route[i - 1]);
          ctx.lineTo(...route[i]);
          ctx.stroke();
        }
      }
      if (route.length > 2) {
        const flow = (route.length - 1) * 10;
        for (let j = 0; j < 3; j++) {
          const d = wrap(time * 150 + (j * flow) / 3, flow) / 10;
          const i = Math.min(Math.floor(d), route.length - 2),
            f = d - i;
          ctx.fillStyle = rgba(PAPER, 0.8 * (1 - d / (route.length - 1)));
          ctx.beginPath();
          ctx.arc(
            route[i][0] + (route[i + 1][0] - route[i][0]) * f,
            route[i][1] + (route[i + 1][1] - route[i][1]) * f,
            3.2,
            0,
            TAU,
          );
          ctx.fill();
        }
        // A bar across the lane where it will not yet go.
        const end = route[route.length - 1],
          prev = route[route.length - 2];
        const len = Math.hypot(end[0] - prev[0], end[1] - prev[1]) || 1;
        const nx = -(end[1] - prev[1]) / len,
          ny = (end[0] - prev[0]) / len;
        for (const [stroke, alpha] of [
          [12, 0.22],
          [4, 0.95],
        ]) {
          ctx.strokeStyle = rgba(YELLOW, alpha * ego.hold);
          ctx.lineWidth = stroke;
          ctx.beginPath();
          ctx.moveTo(end[0] - nx * 21, end[1] - ny * 21);
          ctx.lineTo(end[0] + nx * 21, end[1] + ny * 21);
          ctx.stroke();
        }
      }
      ctx.lineCap = "butt";
      // Tail lights smear into trails at speed, like a long exposure.
      const { wake } = scene;
      for (let i = 1; i < wake.length; i++) {
        const [ax, ay] = wake[i - 1],
          [bx, by] = wake[i];
        const len = Math.hypot(bx - ax, by - ay) || 1;
        const nx = (-(by - ay) / len) * 11,
          ny = ((bx - ax) / len) * 11;
        ctx.strokeStyle = rgba(RED, 0.5 * (1 - i / wake.length) ** 1.5);
        ctx.lineWidth = 2.2;
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(ax + nx * side, ay + ny * side);
          ctx.lineTo(bx + nx * side, by + ny * side);
          ctx.stroke();
        }
      }
      // Headlights of the other cars.
      for (const other of others) {
        const [dx, dy] = direction(other.heading);
        const fx = other.x + dx * 37,
          fy = other.y + dy * 37;
        const beam = ctx.createLinearGradient(
          fx,
          fy,
          fx + dx * 170,
          fy + dy * 170,
        );
        beam.addColorStop(0, rgba(WARM, 0.16 * other.opacity));
        beam.addColorStop(1, rgba(WARM, 0));
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(fx - dy * 13, fy + dx * 13);
        ctx.lineTo(fx + dx * 170 - dy * 66, fy + dy * 170 + dx * 66);
        ctx.lineTo(fx + dx * 170 + dy * 66, fy + dy * 170 - dx * 66);
        ctx.lineTo(fx + dy * 13, fy - dx * 13);
        ctx.fill();
      }
      // Lines of sight to everything it has noticed: faint, except the one it is waiting on.
      const noticed = scene.actors.map((a, i) => ({
        x: a.x,
        y: a.y,
        seen: a.seen,
        focus: a.focus,
        r: a.kind === "car" ? 50 : a.kind === "dog" ? 11 : 15,
        seed: i,
      }));
      [...stops, ...signals].forEach(([x, y], i) => {
        const seen = easeBetween(300, 230, Math.hypot(x - ego.x, y - ego.y));
        noticed.push({ x, y, seen, focus: 0, r: 13, seed: 40 + i });
      });
      for (const o of noticed) {
        if (o.seen < 0.02) continue;
        const colour = mix(SKY, YELLOW, o.focus);
        const ex = o.x + (o.x - ego.x) * 0.2,
          ey = o.y + (o.y - ego.y) * 0.2;
        for (const [stroke, alpha] of [
          [9, 0.16 * o.focus],
          [1.3 + 1.6 * o.focus, 0.42 + 0.5 * o.focus],
        ]) {
          if (alpha <= 0.01) continue;
          const g = ctx.createLinearGradient(ego.x, ego.y, ex, ey);
          g.addColorStop(0, rgba(colour, alpha * o.seen));
          g.addColorStop(0.8, rgba(colour, alpha * o.seen));
          g.addColorStop(1, rgba(colour, 0));
          ctx.strokeStyle = g;
          ctx.lineWidth = stroke;
          ctx.beginPath();
          ctx.moveTo(ego.x, ego.y);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
        const u = wrap(time * 1.6 + noise(o.seed), 1);
        ctx.fillStyle = rgba(PAPER, 0.8 * o.seen * (1 - u * 0.5));
        ctx.beginPath();
        ctx.arc(
          ego.x + (o.x - ego.x) * u,
          ego.y + (o.y - ego.y) * u,
          2.6,
          0,
          TAU,
        );
        ctx.fill();
        // The lock ring tightens onto the object as it is picked up.
        ctx.strokeStyle = rgba(colour, 0.85 * o.seen);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * (1 + (1 - o.seen) * 1.3), 0, TAU);
        ctx.stroke();
        if (o.focus > 0.02) {
          ctx.strokeStyle = rgba(YELLOW, 0.55 * o.focus);
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(
            o.x,
            o.y,
            o.r * (1.22 + 0.1 * Math.sin(time * Math.PI * 4)),
            0,
            TAU,
          );
          ctx.stroke();
        }
      }
    });
    carOnGround(ctx, view, car, SKY);
  });
  paint(things);

  // Focus: while it waits, the street dims around the car and what it waits for.
  if (waitingOn) {
    focusOn(
      ctx,
      view,
      [(ego.x + waitingOn.x) / 2, (ego.y + waitingOn.y) / 2, 10],
      Math.max(
        110,
        Math.hypot(ego.x - waitingOn.x, ego.y - waitingOn.y) * 0.72,
      ),
      waitingOn.focus * 0.62,
    );
  }
  // Darkened corners pull the eye to the car.
  const vignette = ctx.createRadialGradient(
    width / 2,
    height * 0.55,
    Math.min(width, height) * 0.4,
    width / 2,
    height * 0.55,
    Math.hypot(width, height) * 0.62,
  );
  vignette.addColorStop(0, "rgba(4,9,15,0)");
  vignette.addColorStop(1, "rgba(4,9,15,0.72)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
  supervision(ctx, view, scene);
  return { beat: scene.act, progress: scene.actProgress, tone: "night" };
}

export const driveScene: ChapterScene = {
  beats: [acts[0].label, acts[1].label, acts[2].label],
  loop: LOOP,
  still: STILL,
  tone: "night",
  draw,
};
