/**
 * Daily convenience, on a bright morning. A phone leaves the house, standing
 * for its owner; as it comes near, the car wakes, unfolds its mirrors and
 * unlocks. The camera goes in to the door as it opens, then lets the car pull
 * away. Nobody is drawn.
 * No interface or brand is drawn.
 */
import {
  INK,
  TAU,
  backdrop,
  beatAt,
  box,
  castShadows,
  clamp,
  easeInOut,
  easeOutBack,
  hang,
  hex,
  iris,
  lerp,
  line,
  lockMark,
  makeView,
  mix,
  mod,
  onGround,
  paint,
  ramp,
  rgba,
  ring,
  shadowsOf,
  shoot,
  type ChapterScene,
  type Ctx,
  type P3,
  type Thing,
} from "./kit";
import { stroll } from "./figure";
import { carPart, carShadow, drawCar, type Car } from "./model-y";
import { HANDSET_HIGH, block, handset, slab, tree } from "./props";

const LOOP = 11.5,
  WIPE = 0.875;
const STARTS = [0, 4.4, 7.4];
const ORANGE = hex("#eca266");
/** Parked nose to the right, so the driver's door (right-hand drive) faces us. */
const PARKED = { x: 48, y: 12, heading: 90 };
const HANDLE = carPart(PARKED, "handle");

function frame(
  ctx: Ctx,
  width: number,
  height: number,
  unit: number,
  t: number,
) {
  const fit = width / height > 1.3 ? 1 : 0.84;
  const away = t > 8.1 ? 34 * (t - 8.1) ** 2 : 0;
  const walk = stroll(
    [
      [-40, -30],
      [-40, 40],
      [36, 40],
      [46.5, 33.5],
    ],
    -1.1,
    4.5,
    t,
  );
  const shot = shoot(t, [
    { at: 0, x: -6, y: 24, z: 12, zoom: 2.2 * fit },
    { at: 3.3, x: 20, y: 30, z: 10, zoom: 1.85 * fit },
    { at: 4.9, x: 46, y: 26, z: 13, zoom: 3 * fit },
    { at: 7.1, x: 46, y: 26, z: 13, zoom: 3.15 * fit },
    { at: 8.5, x: 66, y: 16, z: 10, zoom: 1.7 * fit },
    { at: LOOP, x: 150, y: 16, z: 10, zoom: 1.45 * fit },
  ]);
  // The camera walks with the phone, a little ahead of it, until the car
  // answers; then it lets go and makes for the door.
  const led = 1 - ramp(2.3, 3.5, t, easeInOut);
  const cam = {
    ...shot,
    x: lerp(shot.x, walk.x + 14, led),
    y: lerp(shot.y, walk.y + 4, led),
  };
  // A low sun: long shadows across the drive.
  const view = makeView(width, height, unit, cam, {
    day: 1,
    accent: ORANGE,
    sun: [1.35, -0.52],
  });
  const { k, pal } = view;

  // The phone stands for its owner: it comes down the path at hand height,
  // goes to the door handle, and is gone once the door has opened.
  const reach = ramp(4.5, 5.2, t, easeInOut);
  const gone = ramp(5.7, 6.2, t);
  const phone: P3 = [
    lerp(walk.x, HANDLE[0], reach),
    lerp(walk.y, HANDLE[1] + 4, reach),
    lerp(15, HANDLE[2] - 2, reach) + 0.7 * Math.sin(t * 2.6),
  ];
  // The car notices the phone, wakes, and is opened.
  const awake = ramp(3.0, 3.6, t);
  const door =
    ramp(5.2, 5.9, t, easeInOut) * (1 - ramp(6.6, 7.2, t, easeInOut));
  const car: Car = {
    ...PARKED,
    x: PARKED.x + away,
    travelled: away,
    mirrors: ramp(3.1, 3.7, t, easeInOut),
    lights: 0.9 * awake,
    indicator: t > 3.0 && t < 3.84 ? "both" : null,
    blink: mod((t - 3.0) * 2.4, 1) < 0.5 ? 1 : 0,
    doors: [0, door * 0.82, 0, 0],
    cabin: ramp(5.6, 6.2, t),
    pitch: 0.0035 * ramp(8.1, 8.5, t) * (1 - ramp(9.2, 10, t)),
  };
  const unlocked = ramp(3.1, 3.5, t);
  const lockShown = ramp(2.5, 2.9, t) * (1 - ramp(4.3, 4.9, t));

  backdrop(ctx, view);
  const things: Thing[] = [
    block(ctx, view, { x: -196, y: -150, w: 180, d: 112, h: 56, floors: 1 }),
    block(ctx, view, {
      x: -196,
      y: -150,
      w: 74,
      d: 60,
      from: 56,
      h: 98,
      floors: 1,
    }),
    // The front door, and the step in front of it.
    {
      depth: -40 - 38 + 0.5,
      draw: () => {
        const door0 = [
          view.at(-48, -38, 0),
          view.at(-32, -38, 0),
          view.at(-32, -38, 35),
          view.at(-48, -38, 35),
        ];
        ctx.fillStyle = rgba(ORANGE);
        ctx.beginPath();
        for (const [x, y] of door0) ctx.lineTo(x, y);
        ctx.fill();
        const [hx, hy] = view.at(-35, -38, 17);
        ctx.fillStyle = rgba(INK);
        ctx.beginPath();
        ctx.arc(hx, hy, 0.6 * k, 0, TAU);
        ctx.fill();
      },
    },
    slab(ctx, view, box(-52, -38, 24, 8), 0, 1.6, undefined, false),
    block(ctx, view, { x: 150, y: -160, w: 90, d: 96, h: 44, floors: 1 }),
    slab(ctx, view, box(-4, -40, 3, 80), 0, 9),
    tree(ctx, view, { x: -150, y: 22 }),
    tree(ctx, view, { x: -96, y: 58, r: 13, h: 27 }),
    tree(ctx, view, { x: 96, y: -76, cone: true, r: 15 }),
    tree(ctx, view, { x: 214, y: -40, r: 15, h: 30 }),
    {
      depth: car.x + car.y,
      shadow: [carShadow(view, car)],
      draw: () => drawCar(ctx, view, car),
    },
    handset(ctx, view, phone, ORANGE, 1 - gone),
  ];
  // The phone finds the car: a link from one to the other.
  const linked = ramp(2.8, 3.1, t) * (1 - ramp(3.9, 4.3, t));
  if (linked > 0.02)
    things.push({
      depth: phone[0] + phone[1] + 1,
      draw: () =>
        line(
          ctx,
          view,
          hang(
            [phone[0], phone[1], phone[2] + HANDSET_HIGH + 0.6],
            carPart(car, "roof"),
            -16,
          ),
          rgba(mix(ORANGE, INK, 0.25), linked),
          0.5,
          [1.6, 1.8],
        ),
    });

  onGround(ctx, view, () => {
    ctx.fillStyle = rgba(pal.road);
    ctx.fillRect(-2000, 70, 4000, 86);
    ctx.strokeStyle = rgba(pal.mark);
    ctx.lineWidth = 2.2;
    ctx.setLineDash([15, 17]);
    ctx.beginPath();
    ctx.moveTo(-2000, 113);
    ctx.lineTo(2000, 113);
    ctx.stroke();
    ctx.setLineDash([]);
    // The path from the door, and the drive in the chapter colour.
    ctx.fillStyle = rgba(pal.paving);
    ctx.fillRect(-50, -38, 20, 88);
    ctx.fillRect(-50, 30, 60, 20);
    ctx.fillStyle = rgba(pal.field);
    ctx.fillRect(0, -18, 2000, 68);
    castShadows(ctx, view, shadowsOf(things));
    // The phone's reach, going out as it comes.
    if (gone < 1)
      for (let i = 0; i < 2; i++) {
        const f = mod(t * 0.8 + i / 2, 1);
        ring(
          ctx,
          [phone[0], phone[1]],
          6 + 46 * f,
          rgba(mix(ORANGE, INK, 0.3), 0.5 * (1 - f) * (1 - ramp(4.2, 4.8, t))),
          1.1,
        );
      }
    // And the car answering.
    const answer = clamp((t - 3.05) / 0.9);
    if (answer > 0 && answer < 1)
      ring(
        ctx,
        [car.x, car.y],
        40 + 46 * answer,
        rgba(INK, 0.5 * (1 - answer)),
        1.3,
      );
  });
  paint(things);
  lockMark(
    ctx,
    view,
    [car.x, car.y, 50 + 1.4 * Math.sin(t * 2.4)],
    11 * (0.9 + 0.1 * easeOutBack(clamp(unlocked))),
    mix(INK, mix(ORANGE, INK, 0.45), unlocked),
    unlocked,
    lockShown,
  );
}

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
) {
  const t = mod(time, LOOP);
  if (t > LOOP - WIPE)
    iris(
      ctx,
      width,
      height,
      (t - (LOOP - WIPE)) / WIPE,
      ORANGE,
      [width / 2, height / 2],
      (incoming) => frame(ctx, width, height, unit, incoming ? t - LOOP : t),
    );
  else frame(ctx, width, height, unit, t);
  return { ...beatAt(t, STARTS, LOOP), tone: "day" as const };
}

export const convenienceScene: ChapterScene = {
  beats: ["Approach", "Unlock", "Ready"],
  tone: "day",
  loop: LOOP,
  still: 5.75,
  draw,
};
