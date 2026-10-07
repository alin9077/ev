/**
 * Software & tech, from night into morning. While the street sleeps an update
 * arrives and a line of light scans the car from nose to tail. Day breaks;
 * a phone comes out, standing for its owner, and reaches the car, which wakes
 * and opens. Then a voice shows as a waveform over the roof, and is answered.
 * Nobody is drawn.
 * No interface or brand is drawn.
 */
import {
  INK,
  TAU,
  WARM,
  WHITE,
  YELLOW,
  backdrop,
  beatAt,
  box,
  castShadows,
  clamp,
  easeInOut,
  easeOutBack,
  glow,
  glowDot,
  glowLine,
  hang,
  hex,
  line,
  makeView,
  mix,
  mod,
  noise,
  onGround,
  paint,
  partial,
  pool,
  pulse,
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
import {
  carOnGround,
  carPart,
  carPoint,
  carSection,
  carShadow,
  drawCar,
  type Car,
} from "./model-y";
import { HANDSET_HIGH, block, handset, lamp, slab, tree } from "./props";

const LOOP = 12;
const STARTS = [0, 3.7, 7.2];
const TEAL = hex("#83c7c2");
const PARKED = { x: 30, y: 8, heading: 122 };
/** The aerial on the roof that the update comes from. */
const MAST: P3 = [-92, -96, 118];

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
) {
  const t = mod(time, LOOP);
  const fit = width / height > 1.3 ? 1 : 0.84;
  // Night, then dawn, a morning, and dusk again as the loop closes.
  const day = ramp(2.7, 4.5, t) * (1 - ramp(10.5, 11.9, t));
  const cam = shoot(t, [
    { at: 0, x: 16, y: 0, z: 14, zoom: 1.75 * fit },
    // A slow push while the update closes its ring, so the frame never rests.
    { at: 3.4, x: 18, y: 2, z: 14, zoom: 1.95 * fit },
    // Right in on the phone as it reaches for the car, then back along the
    // link to see the car answer.
    { at: 4.9, x: -32, y: 34, z: 18, zoom: 4.2 * fit },
    { at: 5.5, x: -30, y: 34, z: 18, zoom: 4.3 * fit },
    { at: 6.6, x: 18, y: 12, z: 13, zoom: 2.0 * fit },
    { at: 7.2, x: 18, y: 12, z: 13, zoom: 2.0 * fit },
    { at: 8.1, x: 30, y: 8, z: 27, zoom: 2.6 * fit },
    { at: 10.3, x: 30, y: 8, z: 27, zoom: 2.75 * fit },
    { at: LOOP, x: 16, y: 0, z: 14, zoom: 1.75 * fit },
  ]);
  const view = makeView(width, height, unit, cam, { day, accent: TEAL });
  const { k, pal, night } = view;

  const updating = pulse(0.3, 3.3, t, 0.4);
  const progress = ramp(0.5, 3.0, t);
  const done = clamp((t - 3.0) / 0.9);
  // The phone comes out, then goes round to the driver's door.
  const out = stroll(
    [
      [-52, -34],
      [-52, 30],
      [-34, 36],
    ],
    3.6,
    5.0,
    t,
  );
  const round = stroll(
    [
      [-34, 36],
      [8, 44],
      [34, 36],
    ],
    6.3,
    7.3,
    t,
  );
  const boarded = ramp(7.2, 7.6, t);
  const shown = ramp(3.5, 3.9, t) * (1 - boarded);
  // The phone stands for its owner, at hand height.
  const path = t > 6.3 ? round : out;
  const phone: P3 = [path.x, path.y, 15 + 0.7 * Math.sin(t * 2.6)];
  const linked = ramp(5.3, 5.9, t) * (1 - ramp(6.5, 7.0, t));
  const awake = ramp(5.8, 6.3, t) * (1 - ramp(10.6, 11.3, t));
  const speaking = pulse(7.9, 10.2, t, 0.3);
  const car: Car = {
    ...PARKED,
    mirrors:
      ramp(5.8, 6.4, t, easeInOut) * (1 - ramp(10.7, 11.3, t, easeInOut)),
    lights: Math.max(
      0.9 * awake,
      done > 0 && done < 1 ? Math.sin(done * Math.PI) : 0,
    ),
    hatch: 0.55 * pulse(5.9, 7.1, t, 0.6),
    cabin: Math.max(
      0.55 * updating,
      0.8 * ramp(7.3, 7.8, t) * (1 - ramp(10.4, 11, t)),
    ),
    cabinColour: mix(TEAL, WARM, ramp(7.2, 7.8, t)),
    xray: 0.42 * pulse(7.5, 10.4, t, 0.5),
  };

  backdrop(ctx, view);
  const things: Thing[] = [
    block(ctx, view, {
      x: -196,
      y: -168,
      w: 170,
      d: 126,
      h: 58,
      floors: 1,
      panel: TEAL,
      seed: 4.2,
    }),
    block(ctx, view, {
      x: -150,
      y: -168,
      w: 96,
      d: 72,
      from: 58,
      h: 104,
      floors: 1,
      seed: 1.7,
    }),
    slab(ctx, view, box(-93, -97, 2, 2), 104, 118),
    block(ctx, view, {
      x: 150,
      y: -190,
      w: 96,
      d: 96,
      h: 48,
      floors: 1,
      seed: 8.1,
    }),
    tree(ctx, view, { x: 112, y: -60 }),
    tree(ctx, view, { x: -150, y: 26, r: 13, h: 27 }),
    tree(ctx, view, { x: -108, y: 88, cone: true, r: 15 }),
    tree(ctx, view, { x: 176, y: 34, r: 15, h: 30 }),
    // Clear of where the phone stops, so the two never line up on screen.
    lamp(ctx, view, [
      [-64, 78],
      [-64, 62],
    ]),
    {
      depth: car.x + car.y,
      shadow: [carShadow(view, car)],
      draw: () => drawCar(ctx, view, car),
    },
  ];
  if (shown > 0.01) {
    things.push(handset(ctx, view, phone, TEAL, shown));
    // The phone reaches the car.
    if (linked > 0.02)
      things.push({
        depth: phone[0] + phone[1] + 1,
        draw: () => {
          const from: P3 = [phone[0], phone[1], phone[2] + HANDSET_HIGH + 0.6];
          const link = hang(from, carPart(car, "roof"), -18);
          line(
            ctx,
            view,
            partial(link, ramp(5.3, 5.8, t), 30),
            rgba(mix(TEAL, INK, 0.35), linked),
            0.55,
            [1.6, 1.8],
          );
          const [px, py] = view.at(...from);
          for (let i = 0; i < 2; i++) {
            const f = mod(t * 1.4 + i / 2, 1);
            ctx.strokeStyle = rgba(mix(TEAL, INK, 0.35), linked * (1 - f));
            ctx.lineWidth = Math.max(unit, 0.3 * k);
            ctx.beginPath();
            ctx.arc(px, py, (1.5 + 5 * f) * k, 0, TAU);
            ctx.stroke();
          }
        },
      });
  }

  onGround(ctx, view, () => {
    ctx.fillStyle = rgba(pal.road);
    ctx.fillRect(-2000, 84, 4000, 86);
    ctx.strokeStyle = rgba(pal.mark, 0.5 + 0.5 * day);
    ctx.lineWidth = 2.2;
    ctx.setLineDash([15, 17]);
    ctx.beginPath();
    ctx.moveTo(-2000, 127);
    ctx.lineTo(2000, 127);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = rgba(pal.paving);
    ctx.fillRect(-62, -42, 20, 86);
    ctx.fillRect(-62, 26, 54, 20);
    ctx.fillStyle = rgba(pal.field);
    ctx.fillRect(-16, -42, 100, 106);
    castShadows(ctx, view, shadowsOf(things));
    glow(ctx, () => {
      pool(ctx, [-64, 62], 120, WARM, 0.2 * night);
      // The update's progress: a ring that closes round the car.
      ring(ctx, [car.x, car.y], 58, rgba(TEAL, 0.14 * updating * night), 9);
      ring(
        ctx,
        [car.x, car.y],
        58,
        rgba(TEAL, 0.95 * updating * night),
        1.8,
        -0.25,
        -0.25 + progress,
      );
    });
    carOnGround(ctx, view, car, mix(TEAL, WHITE, 0.2));
    // Finished: one ring out from the car.
    if (done > 0 && done < 1)
      glow(ctx, () =>
        ring(
          ctx,
          [car.x, car.y],
          58 + 60 * done,
          rgba(TEAL, 0.8 * (1 - done) * night),
          2,
        ),
      );
  });
  paint(things);

  // The update itself: pulses down from the aerial, and a line scanning the body.
  if (updating > 0.02) {
    const feed = hang(MAST, carPart(car, "roof"), -26);
    line(ctx, view, feed, rgba(TEAL, 0.18 * updating), 0.35, [2, 2.4]);
    for (let i = 0; i < 3; i++) {
      const f = mod(t * 0.7 + i / 3, 1);
      const at = feed[Math.min(feed.length - 1, Math.floor(f * feed.length))];
      glowDot(ctx, view.at(...at), 1.3 * k, TEAL, updating * night);
    }
    const sweep = mod(progress * 2.2, 1);
    for (const [lag, strength] of [
      [0, 1],
      [0.05, 0.4],
      [0.1, 0.18],
    ])
      glowLine(
        ctx,
        view,
        carSection(car, 60 + clamp(sweep - lag) * 4660),
        mix(TEAL, WHITE, 0.3),
        updating * strength * (0.5 + 0.5 * Math.sin(sweep * Math.PI)),
        0.8,
      );
    const [mx, my] = view.at(...MAST);
    for (let i = 0; i < 2; i++) {
      const f = mod(t * 0.9 + i / 2, 1);
      ctx.strokeStyle = rgba(TEAL, 0.7 * updating * (1 - f));
      ctx.lineWidth = Math.max(unit, 0.35 * k);
      ctx.beginPath();
      ctx.arc(mx, my, (2 + 9 * f) * k, 0, TAU);
      ctx.stroke();
    }
  }
  // Voice: a waveform held over the roof, speaking and then answered.
  if (speaking > 0.02) {
    const bars = 13;
    const answered = ramp(9.1, 9.4, t);
    const grown = easeOutBack(clamp(speaking));
    const colour = mix(mix(INK, YELLOW, 0.1), mix(TEAL, INK, 0.45), answered);
    const stroke = rgba(mix(mix(colour, WHITE, 0.7 * night), colour, day));
    const roof = carPoint(car, 2440, 0, 1760),
      mid = roof[2] + 17;
    // A thread down to the cabin says whose voice it is.
    line(
      ctx,
      view,
      [roof, [roof[0], roof[1], mid - 3]],
      rgba(colour, 0.5 * speaking),
      0.4,
      [1, 1.4],
    );
    for (let i = 0; i < bars; i++) {
      // The bars run across the panel whichever way the car points.
      const across = (i - (bars - 1) / 2) * 2.5;
      // Syllables: a slow envelope over a quick flutter, different for each bar.
      const voice =
        (0.25 + 0.75 * Math.abs(Math.sin(t * 5.2 + i * 0.9))) *
        (0.35 + 0.65 * Math.abs(Math.sin(t * 2.1 + noise(i) * 6))) *
        (1 - ramp(8.9, 9.1, t));
      const reply =
        (0.3 + 0.7 * Math.abs(Math.sin(t * 4.1 + i * 1.3))) *
        answered *
        (1 - Math.abs(i - 6) / 9);
      // Sound is drawn about a centre line, loudest in the middle of the word.
      const swell = Math.sin((Math.PI * (i + 0.5)) / bars) ** 0.6;
      const half = (0.8 + 10 * Math.max(voice, reply) * swell) * grown;
      line(
        ctx,
        view,
        [
          [roof[0] + across, roof[1] - across, mid - half],
          [roof[0] + across, roof[1] - across, mid + half],
        ],
        stroke,
        1.6,
      );
    }
  }
  return {
    ...beatAt(t, STARTS, LOOP),
    tone: day > 0.5 ? ("day" as const) : ("night" as const),
  };
}

export const softwareScene: ChapterScene = {
  beats: ["Update", "Phone", "Voice"],
  // At rest the panel shows the update closing round the car at night.
  tone: "night",
  loop: LOOP,
  still: 2.625,
  draw,
};
