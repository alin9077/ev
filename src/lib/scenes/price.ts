/**
 * Price & ownership, by day. The camera starts on a blank price ticket, then
 * draws back to the car turning on a showroom plinth. Further back still, a
 * year goes round it like a clock and each month hands over a coin; then a
 * ring and a shield close over the car. No price or figure is drawn.
 */
import {
  INK,
  SKY,
  TAU,
  WHITE,
  YELLOW,
  backdrop,
  beatAt,
  box,
  castShadows,
  clamp,
  disc,
  easeInOut,
  easeOutBack,
  hex,
  lerp,
  line,
  makeView,
  mix,
  mod,
  onGround,
  onWall,
  paint,
  partial,
  prism,
  ramp,
  rgba,
  ring,
  shadowOf,
  shadowsOf,
  shieldMark,
  shoot,
  tonesOf,
  type ChapterScene,
  type Ctx,
  type P3,
  type Pt,
  type SceneSpec,
  type Thing,
} from "./kit";
import { carPart, carShadow, drawCar, type Car } from "./model-y";
import { block, slab, tree } from "./props";

const LOOP = 12;
const STARTS = [0, 3.6, 7.6];
const SILVER = hex("#c5cbd0");
/** The ticket stand, the coin stack beside it, and the ring of months. */
const TICKET: P3 = [92, 34, 27],
  STACK: Pt = [112, 62],
  YEAR = 118,
  MONTHS = 12;
const monthAt = (i: number): Pt => {
  const a = (i / MONTHS) * TAU - 0.9;
  return [YEAR * Math.cos(a), YEAR * Math.sin(a)];
};
const coinAt = (i: number) => 4.0 + i * 0.27;

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
  spec?: SceneSpec,
) {
  const t = mod(time, LOOP);
  const fit = width / height > 1.3 ? 1 : 0.8;
  const cam = shoot(t, [
    { at: 0, x: TICKET[0] - 6, y: TICKET[1] - 4, z: 24, zoom: 3.3 * fit },
    { at: 1.1, x: TICKET[0] - 6, y: TICKET[1] - 4, z: 24, zoom: 3.3 * fit },
    { at: 3.3, x: 26, y: 12, z: 14, zoom: 1.8 * fit },
    { at: 5, x: 6, y: 6, z: 6, zoom: 1.12 * fit },
    { at: 7.4, x: 6, y: 6, z: 6, zoom: 1.12 * fit },
    { at: 8.8, x: 22, y: 20, z: 27, zoom: 1.42 * fit },
    { at: 10.8, x: 22, y: 20, z: 27, zoom: 1.5 * fit },
    { at: LOOP, x: TICKET[0] - 6, y: TICKET[1] - 4, z: 24, zoom: 3.3 * fit },
  ]);
  const view = makeView(width, height, unit, cam, { day: 1, accent: SILVER });
  const { k, pal } = view;
  const gone = ramp(10.9, 11.6, t);
  // One slow turn of the plinth per loop shows the car from every side.
  const car: Car = {
    x: 0,
    y: 0,
    z: 3,
    heading: 128 + (360 * t) / LOOP,
    lights: 0.5,
  };
  const written = ramp(0.25, 1.0, t) * (1 - gone);
  const tied = ramp(1.5, 2.9, t) * (1 - gone);
  const hand = ramp(3.9, 7.3, t);
  const cover = ramp(7.9, 9.3, t, easeInOut) * (1 - gone);
  const shield = ramp(8.9, 9.5, t, easeOutBack) * (1 - gone);

  backdrop(ctx, view);
  const things: Thing[] = [
    block(ctx, view, {
      x: -250,
      y: -262,
      w: 190,
      d: 84,
      h: 56,
      floors: 1,
      panel: SILVER,
    }),
    block(ctx, view, {
      x: -118,
      y: -262,
      w: 58,
      d: 84,
      from: 56,
      h: 100,
      floors: 1,
    }),
    block(ctx, view, { x: 96, y: -250, w: 86, d: 70, h: 40, floors: 1 }),
    tree(ctx, view, { x: -176, y: -92 }),
    tree(ctx, view, { x: -212, y: -30, r: 13, h: 27 }),
    tree(ctx, view, { x: -96, y: 172, cone: true, r: 15 }),
    tree(ctx, view, { x: 206, y: -70, r: 15, h: 30 }),
    // The plinth sits under the car, so it is painted before it.
    { ...slab(ctx, view, disc(0, 0, 58, 40), 0, 3), depth: -90 },
    {
      depth: car.x + car.y,
      shadow: [carShadow(view, car)],
      draw: () => drawCar(ctx, view, car),
    },
    // The ticket on its stand: a blank card, ruled where a price would be.
    {
      depth: TICKET[0] + TICKET[1],
      shadow: [
        shadowOf(view, box(TICKET[0] - 0.6, TICKET[1] - 0.6, 1.2, 1.2), 0, 20),
        shadowOf(view, box(TICKET[0] - 11, TICKET[1] - 0.4, 22, 0.8), 20, 35),
      ],
      draw: () => {
        line(
          ctx,
          view,
          [
            [TICKET[0], TICKET[1], 0],
            [TICKET[0], TICKET[1], 20],
          ],
          rgba(INK),
          0.9,
        );
        onWall(ctx, view, "x", TICKET[1], () => {
          ctx.fillStyle = rgba(WHITE);
          ctx.strokeStyle = rgba(INK);
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.roundRect(TICKET[0] - 11, 20, 22, 15, 1.4);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = rgba(INK);
          ctx.beginPath();
          ctx.arc(TICKET[0] - 8, 31.6, 1, 0, TAU);
          ctx.fill();
          // Three rules write themselves across it; the first is the price.
          ctx.fillRect(TICKET[0] - 4.5, 29.4, 13 * ramp(0, 0.45, written), 3);
          ctx.fillStyle = rgba(INK, 0.45);
          ctx.fillRect(
            TICKET[0] - 8.5,
            25.6,
            17 * ramp(0.35, 0.75, written),
            1.3,
          );
          ctx.fillRect(TICKET[0] - 8.5, 22.8, 11 * ramp(0.6, 1, written), 1.3);
        });
      },
    },
  ];
  // The coins: each leaves its month and lands on the stack. A dearer car
  // stacks thicker coins, so the pile stands in proportion to its price.
  const thick = 1.5 * clamp((spec?.priceAud ?? 60000) / 60000, 0.6, 1.6);
  let landed = 0;
  for (let i = 0; i < MONTHS; i++) {
    const f = clamp((t - coinAt(i)) / 0.6);
    if (f <= 0 || gone >= 1) continue;
    const from = monthAt(i),
      rest = i * thick;
    if (f >= 1) {
      landed = i + 1;
      continue;
    }
    const e = easeInOut(f);
    const x = lerp(from[0], STACK[0], e),
      y = lerp(from[1], STACK[1], e),
      z = lerp(0, rest, e) + 30 * Math.sin(Math.PI * f);
    const coin = disc(x, y, 5.2, 18);
    things.push({
      depth: x + y + 6,
      shadow: [shadowOf(view, coin, z, z + thick - 0.1)],
      draw: () =>
        prism(ctx, view, coin, coin, z, z + thick - 0.1, tonesOf(view, YELLOW)),
    });
  }
  if (landed > 0) {
    const sink = gone * landed * thick;
    const pile = disc(STACK[0], STACK[1], 5.2, 18);
    things.push({
      depth: STACK[0] + STACK[1] + 6,
      shadow: [shadowOf(view, pile, 0, Math.max(0, landed * thick - sink))],
      draw: () => {
        for (let i = 0; i < landed; i++) {
          const z = i * thick - sink;
          if (z < 0) continue;
          prism(
            ctx,
            view,
            pile,
            pile,
            z,
            z + thick - 0.2,
            tonesOf(view, i % 2 ? mix(YELLOW, WHITE, 0.14) : YELLOW),
          );
        }
      },
    });
  }

  onGround(ctx, view, () => {
    // The forecourt: one disc of the chapter colour, ruled like a dial.
    ctx.fillStyle = rgba(pal.field);
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, TAU);
    ctx.fill();
    ring(ctx, [0, 0], 86, rgba(WHITE, 0.7), 1.2);
    ring(ctx, [0, 0], YEAR, rgba(WHITE, 0.9), 1.2);
    castShadows(ctx, view, shadowsOf(things));
    // The year: twelve marks, and a hand that goes round once.
    const swept = hand * MONTHS;
    for (let i = 0; i < MONTHS; i++) {
      const [x, y] = monthAt(i);
      const on = clamp(swept - i + 0.4) * (1 - gone);
      ctx.fillStyle = rgba(mix(WHITE, INK, on));
      ctx.beginPath();
      ctx.arc(x, y, 3.2 + 1.6 * on * (1 - clamp((swept - i) / 2)), 0, TAU);
      ctx.fill();
    }
    const showHand = ramp(3.7, 4.0, t) * (1 - ramp(7.3, 7.7, t));
    if (showHand > 0.01) {
      const a = ((swept - 0.4) / MONTHS) * TAU - 0.9;
      ctx.strokeStyle = rgba(INK, showHand);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(64 * Math.cos(a), 64 * Math.sin(a));
      ctx.lineTo((YEAR + 8) * Math.cos(a), (YEAR + 8) * Math.sin(a));
      ctx.stroke();
      ring(ctx, [0, 0], YEAR, rgba(INK, showHand), 2.6, -0.9 / TAU, a / TAU);
    }
    // Cover: a ring that closes round the plinth.
    ring(ctx, [0, 0], 70, rgba(SKY, 0.35 * cover), 13, -0.25, -0.25 + cover);
    ring(ctx, [0, 0], 70, rgba(mix(SKY, INK, 0.25)), 2.6, -0.25, -0.25 + cover);
  });
  paint(things);

  // A leader from the ticket to the car it prices.
  const roof = carPart(car, "roof");
  if (tied > 0.01) {
    line(
      ctx,
      view,
      partial(
        [
          [TICKET[0] - 11, TICKET[1], 27],
          [roof[0], roof[1], roof[2] + 2],
        ],
        tied,
        24,
      ),
      rgba(INK),
      0.45,
      [2.2, 2.2],
    );
    const [rx, ry] = view.at(roof[0], roof[1], roof[2] + 2);
    ctx.fillStyle = rgba(INK, ramp(0.9, 1, tied));
    ctx.beginPath();
    ctx.arc(rx, ry, 1.1 * k, 0, TAU);
    ctx.fill();
  }
  shieldMark(
    ctx,
    view,
    [0, 0, 62 + 2 * Math.sin(t * 2)],
    11,
    mix(SKY, INK, 0.25),
    WHITE,
    shield,
  );
  return { ...beatAt(t, STARTS, LOOP), tone: "day" as const };
}

export const priceScene: ChapterScene = {
  beats: ["Price", "Running costs", "Warranty"],
  tone: "day",
  loop: LOOP,
  still: 9.9,
  draw,
};
