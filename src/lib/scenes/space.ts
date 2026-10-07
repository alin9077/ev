/**
 * Space & safety, by day. On a driveway the shell turns to glass and five
 * seats light in turn; the tailgate lifts and three bags load themselves into
 * the boot; then it shuts and a line closes round the car under a shield.
 * Nobody is drawn: the seats and the bags say it. No rating, dimension or child-seat claim is drawn.
 */
import {
  INK,
  WHITE,
  YELLOW,
  backdrop,
  beatAt,
  box,
  castShadows,
  clamp,
  easeInOut,
  easeOutBack,
  hex,
  iris,
  lerp,
  line,
  makeView,
  mix,
  mod,
  onGround,
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
  type Rgb,
  type SceneSpec,
  type Thing,
} from "./kit";
import {
  MM,
  carPoint,
  carShadow,
  drawCar,
  footprint,
  type Car,
} from "./model-y";
import { block, slab, tree } from "./props";

const LOOP = 11.5,
  WIPE = 0.875;
const STARTS = [0, 3.4, 7];
const PARKED = { x: 0, y: 0, heading: 0 };

/**
 * Each bag: where it waits on the drive, its place in the boot (millimetres
 * behind the nose and to the right), its length, width and height, and when
 * it is lifted.
 */
const BAGS: { from: Pt; slot: Pt; size: P3; colour: Rgb; at: number }[] = [
  {
    from: [33, 55],
    slot: [4170, -265],
    size: [560, 440, 430],
    colour: hex("#22323a"),
    at: 4.5,
  },
  {
    from: [42, 62],
    slot: [4170, 265],
    size: [520, 400, 540],
    colour: hex("#e8452c"),
    at: 5.3,
  },
  {
    from: [31, 67],
    slot: [4530, 0],
    size: [280, 720, 300],
    colour: hex("#f5f5f0"),
    at: 6.1,
  },
];

function frame(
  ctx: Ctx,
  width: number,
  height: number,
  unit: number,
  t: number,
  spec?: SceneSpec,
) {
  const fit = width / height > 1.3 ? 1 : 0.84;
  const cam = shoot(t, [
    { at: 0, x: 0, y: 2, z: 12, zoom: 2.3 * fit },
    { at: 0.5, x: 0, y: 2, z: 12, zoom: 2.3 * fit },
    // In over the glass roof while the seats are counted, creeping closer.
    { at: 1.7, x: 0, y: 2, z: 15, zoom: 3.3 * fit },
    { at: 3.1, x: 0, y: 4, z: 15, zoom: 3.45 * fit },
    { at: 4.4, x: 10, y: 40, z: 9, zoom: 2.6 * fit },
    { at: 6.9, x: 10, y: 40, z: 9, zoom: 2.72 * fit },
    { at: 8.2, x: 2, y: 8, z: 12, zoom: 1.75 * fit },
    // Wide while the line closes round the car, then in as the shield lands.
    { at: 9.2, x: 2, y: 8, z: 12, zoom: 1.78 * fit },
    { at: 10.3, x: 1, y: 4, z: 20, zoom: 2.35 * fit },
    { at: LOOP, x: 1, y: 4, z: 20, zoom: 2.45 * fit },
  ]);
  const view = makeView(width, height, unit, cam, { day: 1, accent: YELLOW });
  const { pal } = view;

  // Loaded and shut, the car wakes.
  const driverIn = ramp(8.7, 9.1, t);
  // A boot under 600 litres takes two of the three bags; the third stays.
  const fits = (spec?.bootL ?? 800) < 600 ? 2 : BAGS.length;
  const loading = BAGS.map((bag, i) =>
    i < fits ? clamp((t - bag.at) / 0.75) : 0,
  );
  const car: Car = {
    ...PARKED,
    lights: 0.3 + 0.5 * driverIn,
    xray: ramp(0.2, 0.9, t) * (1 - ramp(3.0, 3.6, t)) * 0.88,
    hatch: ramp(3.5, 4.3, t, easeInOut) * (1 - ramp(7.0, 7.8, t, easeInOut)),
    seatCount: spec?.seats,
    seats: (seat) => ({
      colour: YELLOW,
      strength:
        ramp(0.7 + seat * 0.42, 1.0 + seat * 0.42, t, easeOutBack) *
        (1 - ramp(2.9, 3.4, t)),
    }),
    cargo: BAGS.filter((_, i) => loading[i] >= 1).map((bag) => ({
      x: bag.slot[0],
      y: bag.slot[1],
      size: bag.size,
      colour: bag.colour,
    })),
  };
  const sealed = ramp(8.2, 9.4, t, easeInOut);
  const shield = ramp(9.3, 9.9, t, easeOutBack);

  backdrop(ctx, view);
  const things: Thing[] = [
    block(ctx, view, {
      x: -214,
      y: -150,
      w: 120,
      d: 150,
      h: 54,
      floors: 1,
      panel: YELLOW,
    }),
    block(ctx, view, {
      x: -214,
      y: -150,
      w: 70,
      d: 60,
      from: 54,
      h: 96,
      floors: 1,
    }),
    // A carport: a thin roof on four columns, ahead of the car.
    slab(ctx, view, box(-34, -150, 3, 3), 0, 46),
    slab(ctx, view, box(31, -150, 3, 3), 0, 46),
    slab(ctx, view, box(31, -92, 3, 3), 0, 46),
    slab(ctx, view, box(-94, -156, 134, 72), 46, 50),
    tree(ctx, view, { x: 96, y: -60 }),
    tree(ctx, view, { x: 122, y: 20, r: 13, h: 27 }),
    tree(ctx, view, { x: -150, y: 86, cone: true, r: 15 }),
    tree(ctx, view, { x: -98, y: 112, r: 14, h: 30 }),
    {
      depth: car.x + car.y,
      shadow: [carShadow(view, car)],
      draw: () => drawCar(ctx, view, car),
    },
  ];
  BAGS.forEach((bag, i) => {
    const f = loading[i];
    // Once it lands, a bag belongs to the car and is drawn inside it.
    if (f >= 1) return;
    const e = easeInOut(f);
    const to = carPoint(PARKED, bag.slot[0], bag.slot[1], 690);
    const w = bag.size[1] * MM,
      d = bag.size[0] * MM,
      h = bag.size[2] * MM;
    const x = lerp(bag.from[0], to[0], e),
      y = lerp(bag.from[1], to[1], e),
      // Up and over the sill, then down.
      z = lerp(0, to[2], e) + 15 * Math.sin(Math.PI * f);
    const base = box(x - w / 2, y - d / 2, w, d);
    things.push({
      depth: x + y + 4,
      shadow: [shadowOf(view, base, z, z + h)],
      draw: () => {
        prism(ctx, view, base, base, z, z + h, tonesOf(view, bag.colour));
        // A handle, so a box reads as a bag.
        line(
          ctx,
          view,
          [
            [x - 2, y, z + h],
            [x - 2, y, z + h + 1.6],
            [x + 2, y, z + h + 1.6],
            [x + 2, y, z + h],
          ],
          rgba(mix(bag.colour, INK, 0.5)),
          0.5,
        );
      },
    });
  });
  onGround(ctx, view, () => {
    // The plot: a drive in the chapter colour running under the carport.
    ctx.fillStyle = rgba(pal.paving);
    ctx.fillRect(-230, -166, 372, 290);
    ctx.fillStyle = rgba(pal.field);
    ctx.fillRect(-34, -150, 68, 274);
    ctx.fillStyle = rgba(pal.road);
    ctx.fillRect(-2000, 124, 4000, 86);
    ctx.strokeStyle = rgba(pal.mark);
    ctx.lineWidth = 2.2;
    ctx.setLineDash([15, 17]);
    ctx.beginPath();
    ctx.moveTo(-2000, 167);
    ctx.lineTo(2000, 167);
    ctx.stroke();
    ctx.setLineDash([]);
    castShadows(ctx, view, shadowsOf(things));
    // Protection: rings out from the car, then one line closed round it.
    for (let i = 0; i < 2; i++) {
      const f = clamp((t - 8.3 - i * 0.5) / 1.6);
      if (f > 0 && f < 1)
        ring(ctx, [car.x, car.y], 44 + 70 * f, rgba(INK, 0.3 * (1 - f)), 1.2);
    }
  });
  const guard: P3[] = footprint(car, 1.32).map(([x, y]): P3 => [x, y, 0.2]);
  guard.push(guard[0]);
  if (sealed > 0.01) {
    line(ctx, view, partial(guard, sealed, 70), rgba(WHITE, 0.9), 4.4);
    line(ctx, view, partial(guard, sealed, 70), rgba(INK), 1.1);
  }
  paint(things);
  shieldMark(
    ctx,
    view,
    [0, 0, 52 + 1.6 * Math.sin(t * 2.2)],
    10,
    INK,
    YELLOW,
    shield,
  );
}

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
  spec?: SceneSpec,
) {
  const t = mod(time, LOOP);
  if (t > LOOP - WIPE)
    iris(
      ctx,
      width,
      height,
      (t - (LOOP - WIPE)) / WIPE,
      YELLOW,
      [width / 2, height / 2],
      (incoming) =>
        frame(ctx, width, height, unit, incoming ? t - LOOP : t, spec),
    );
  else frame(ctx, width, height, unit, t, spec);
  return { ...beatAt(t, STARTS, LOOP), tone: "day" as const };
}

export const spaceScene: ChapterScene = {
  beats: ["Seats", "Storage", "Safety"],
  tone: "day",
  loop: LOOP,
  still: 9.95,
  draw,
};
