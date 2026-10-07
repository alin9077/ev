/**
 * Comfort & drive, at night. The camera rides with the car: cool air runs
 * back through the cabin, then the seats warm, then the camera drops to a
 * wheel as it works over speed humps while a level line beside the cabin
 * stays flat. Illustrates the chapter's subject, not any car's equipment.
 */
import {
  AMBER,
  SKY,
  WARM,
  WHITE,
  along,
  backdrop,
  beatAt,
  box,
  clamp,
  glow,
  glowLine,
  hex,
  lerp,
  line,
  makeView,
  mix,
  mod,
  onGround,
  paint,
  pool,
  prism,
  pulse,
  ramp,
  rgba,
  shoot,
  tonesOf,
  type ChapterScene,
  type Ctx,
  type P3,
  type SceneSpec,
  type Thing,
} from "./kit";
import {
  carOnGround,
  carPart,
  carPoint,
  drawCar,
  seatPoint,
  type Car,
} from "./model-y";
import { block, lamp, tree } from "./props";

const LOOP = 10.5;
const STARTS = [0, 3.4, 6.8];
const LAVENDER = hex("#adb2d6");
/** The street repeats every `PERIOD`; one loop covers seven of them exactly. */
const PERIOD = 240,
  SPEED = (7 * PERIOD) / LOOP,
  LANE = -22;
/** Speed humps, placed where the car will be late in the loop. */
const HUMPS = [8.0, 8.55, 9.1].map((at) => SPEED * at);
const HUMP_HIGH = 2.3,
  HUMP_WIDE = 9;
/** How far the road lifts a wheel at `x`. */
const lift = (x: number) => {
  let rise = 0;
  for (const hump of HUMPS) {
    const d =
      (mod(x - hump + (SPEED * LOOP) / 2, SPEED * LOOP) - (SPEED * LOOP) / 2) /
      HUMP_WIDE;
    if (Math.abs(d) < 1) rise = Math.max(rise, HUMP_HIGH * (1 - d * d) ** 1.5);
  }
  return rise;
};
/** A stretch of a path, between two fractions of its length. */
const stretch = (path: P3[], from: number, to: number, steps = 10): P3[] =>
  Array.from({ length: steps + 1 }, (_, i) =>
    along(path, clamp(lerp(from, to, i / steps))),
  );

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
  spec?: SceneSpec,
) {
  const t = mod(time, LOOP);
  const fit = width / height > 1.3 ? 1 : 0.86;
  const x = SPEED * t;
  const wheels = [870, 870, 3760, 3760].map((axle) =>
    lift(x + 39 - axle * (78 / 4790)),
  );
  const car: Car = {
    x,
    y: LANE,
    heading: 90,
    travelled: x,
    lights: 1,
    xray:
      (ramp(0.2, 0.9, t) * (1 - ramp(6.6, 7.4, t)) +
        0.3 * pulse(7.2, 10, t, 0.6)) *
      0.86,
    bump: [wheels[0], wheels[0], wheels[2], wheels[2]],
    // The body rides on its springs: it takes a little of what the wheels take.
    heave: 0.14 * (wheels[0] + wheels[2]),
    pitch: 0.0018 * (wheels[0] - wheels[2]),
    seatCount: spec?.seats,
    seats: (seat) => {
      const cool = pulse(0.5 + seat * 0.1, 3.5, t, 0.5) * (seat < 2 ? 1 : 0),
        warm = pulse(3.7 + seat * 0.22, 6.9, t, 0.5);
      return cool > warm
        ? { colour: mix(SKY, LAVENDER, 0.4), strength: 0.85 * cool }
        : { colour: AMBER, strength: 0.9 * warm };
    },
    cabin: 0.3,
  };
  const wheel = carPart(car, "frontWheel");
  const cam = shoot(t, [
    { at: 0, x: 2, y: -10, z: 12, zoom: 2.3 * fit },
    { at: 0.7, x: 2, y: -10, z: 12, zoom: 2.3 * fit },
    // In on the front seats as they cool, then back along the cabin as the
    // warmth reaches the rear.
    { at: 2.3, x: 5, y: LANE + 3, z: 17, zoom: 3.3 * fit },
    { at: 3.6, x: 4, y: LANE + 3, z: 17, zoom: 3.4 * fit },
    { at: 6.7, x: -4, y: LANE + 3, z: 17, zoom: 3.4 * fit },
    { at: 7.9, x: wheel[0] - x - 10, y: wheel[1] + 6, z: 9, zoom: 4.1 * fit },
    { at: 9.2, x: wheel[0] - x - 10, y: wheel[1] + 6, z: 9, zoom: 4.1 * fit },
    { at: LOOP, x: 2, y: -10, z: 12, zoom: 2.3 * fit },
  ]);
  // The camera travels with the car, so the street streams past.
  const view = makeView(
    width,
    height,
    unit,
    { ...cam, x: cam.x + x },
    { day: 0, accent: LAVENDER },
  );
  const { k, pal } = view;

  backdrop(ctx, view);
  const things: Thing[] = [];
  const lamps: [number, number][] = [];
  for (
    let n = Math.floor(view.x0 / PERIOD) - 1;
    n <= Math.ceil(view.x1 / PERIOD);
    n++
  ) {
    const o = n * PERIOD;
    things.push(
      block(ctx, view, {
        x: o + 16,
        y: -214,
        w: 132,
        d: 96,
        h: 60,
        floors: 2,
        seed: mod(n, 7) + 1,
      }),
      block(ctx, view, {
        x: o + 160,
        y: -196,
        w: 62,
        d: 70,
        h: 104,
        floors: 3,
        seed: mod(n, 7) + 3.3,
      }),
      tree(ctx, view, { x: o + 60, y: -84, r: 15, h: 31 }),
      tree(ctx, view, { x: o + 184, y: -90, cone: true, r: 14 }),
      lamp(ctx, view, [
        [o + 120, -62],
        [o + 120, -46],
      ]),
    );
    lamps.push([o + 120, -46]);
  }
  for (const hump of HUMPS)
    for (const turn of [-1, 0, 1]) {
      const hx = hump + turn * SPEED * LOOP;
      if (hx < view.x0 - 20 || hx > view.x1 + 20) continue;
      const base = box(hx - HUMP_WIDE, -43, HUMP_WIDE * 2, 86);
      things.push({
        depth: hx - 60,
        draw: () =>
          prism(
            ctx,
            view,
            base,
            box(hx - HUMP_WIDE * 0.55, -43, HUMP_WIDE * 1.1, 86),
            0,
            HUMP_HIGH,
            tonesOf(view, mix(pal.road, LAVENDER, 0.42)),
          ),
      });
    }
  things.push({ depth: car.x + car.y, draw: () => drawCar(ctx, view, car) });

  onGround(ctx, view, () => {
    ctx.fillStyle = rgba(pal.paving);
    ctx.fillRect(view.x0, -70, view.x1 - view.x0, 140);
    ctx.fillStyle = rgba(pal.kerb);
    ctx.fillRect(view.x0, -47, view.x1 - view.x0, 94);
    ctx.fillStyle = rgba(pal.road);
    ctx.fillRect(view.x0, -44, view.x1 - view.x0, 88);
    ctx.strokeStyle = rgba(pal.mark, 0.55);
    ctx.lineWidth = 2.2;
    ctx.setLineDash([15, 15]);
    ctx.beginPath();
    const start = Math.floor(view.x0 / 30) * 30;
    ctx.moveTo(start, 0);
    ctx.lineTo(view.x1, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    glow(ctx, () => {
      for (const head of lamps) pool(ctx, head, 130, WARM, 0.2);
    });
    carOnGround(ctx, view, car, mix(SKY, LAVENDER, 0.5));
  });
  paint(things);

  // Cool: air runs back from the dash, over the front seats and through the cabin.
  const cool = pulse(0.4, 3.6, t, 0.5);
  if (cool > 0.02)
    for (let i = 0; i < 4; i++) {
      const y = [-520, -210, 210, 520][i];
      const path: P3[] = [
        carPoint(car, 1700, y * 0.7, 1080),
        carPoint(car, 2050, y, 1210),
        carPoint(car, 2500, y, 1160),
        carPoint(car, 2900, y * 0.9, 1010),
        carPoint(car, 3300, y, 1120),
        carPoint(car, 3800, y * 0.8, 1010),
      ];
      line(ctx, view, path, rgba(SKY, 0.16 * cool), 0.35);
      for (let j = 0; j < 2; j++) {
        const f = mod(t * 0.75 + i * 0.19 + j * 0.5, 1) * 1.25 - 0.12;
        glowLine(
          ctx,
          view,
          stretch(path, f - 0.2, f),
          mix(SKY, WHITE, 0.3),
          0.9 * cool,
          0.5,
        );
      }
    }
  // Warm: heat lifts off every seat.
  const warm = pulse(3.8, 6.9, t, 0.6);
  if (warm > 0.02)
    for (let seat = 0; seat < 5; seat++)
      for (let j = 0; j < 2; j++) {
        const base = seatPoint(car, seat, 780);
        const f = mod(t * 0.55 + seat * 0.23 + j * 0.5, 1);
        const wisp: P3[] = Array.from({ length: 9 }, (_, i): P3 => {
          const u = f * 0.6 + (i / 8) * 0.42;
          return [
            base[0] + (j ? 2.6 : -2.6) + 1.3 * Math.sin(u * 13 + seat),
            base[1],
            base[2] + u * 21,
          ];
        });
        glowLine(
          ctx,
          view,
          wisp,
          mix(AMBER, WARM, 0.3),
          warm * (1 - f) * 0.9 * clamp(f * 5),
          0.45,
        );
      }
  // Smooth: the road's shape at the wheels, and a level line that does not follow it.
  const smooth = pulse(7.0, 10.1, t, 0.6);
  if (smooth > 0.02) {
    const side = LANE + 17.5;
    const road: P3[] = Array.from({ length: 61 }, (_, i): P3 => {
      const px = x - 62 + i * 2.2;
      return [px, side, 0.4 + lift(px)];
    });
    glowLine(ctx, view, road, LAVENDER, 0.75 * smooth, 0.5);
    const level: P3[] = [
      [x - 46, side, 21.5 + (car.heave ?? 0)],
      [x + 46, side, 21.5 + (car.heave ?? 0)],
    ];
    glowLine(ctx, view, level, WHITE, 0.9 * smooth, 0.55);
    // Ticks along it, like a rule.
    for (let i = -4; i <= 4; i++)
      line(
        ctx,
        view,
        [
          [x + i * 11.5, side, 21.5 + (car.heave ?? 0)],
          [x + i * 11.5, side, 19.9 + (car.heave ?? 0)],
        ],
        rgba(WHITE, 0.7 * smooth),
        0.3,
      );
    // Each wheel's travel, as a mark that rides the hump.
    for (const [index, axle] of [
      [1, 870],
      [3, 3760],
    ]) {
      const hub = carPoint(car, axle, 1010, 356);
      const [hx, hy] = view.at(
        hub[0],
        hub[1],
        hub[2] - (car.heave ?? 0) + (car.bump?.[index] ?? 0),
      );
      ctx.strokeStyle = rgba(LAVENDER, smooth);
      ctx.lineWidth = Math.max(unit, 0.4 * k);
      ctx.beginPath();
      ctx.arc(hx, hy, 1.5 * k, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  return { ...beatAt(t, STARTS, LOOP), tone: "night" as const };
}

export const comfortScene: ChapterScene = {
  beats: ["Cool", "Warm", "Smooth"],
  tone: "night",
  loop: LOOP,
  still: 5.2,
  draw,
};
