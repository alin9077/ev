/**
 * Automated driving, B: how much help does it actually give me? One
 * run down a street in a white model town, with a driver
 * supervising throughout. The car leaves a lay-by and holds its distance
 * behind the car ahead; gives way at a roundabout and goes through it; then
 * finds the next lay-by and parks in it. The town repeats block after block
 * and the car ends as it began, parked, so the run has no join. The camera
 * travels with the car. What the car's cameras take in is shown quietly:
 * pale fans of view on the road, and a ring and corner marks on each person,
 * vehicle and obstacle as it comes into range.
 */
import { carItems, placed } from "./car";
import { answer, dotFor, has, hero, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  TAU,
  colour,
  compose,
  glide,
  lerp,
  ramp,
  rotateZ,
  span,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, caption, measure, pill, spot } from "./overlay";
import { scene, type Plate } from "./stage";
import {
  BAY,
  BLOCK,
  LANE,
  RING,
  route,
  sidle,
  timetable,
  townBlock,
} from "./town";
import { PAINT, WHITE, arc, decal, ground, person, ribbon } from "./world";
import type { SceneCar } from "../kit";

const AZ = -58,
  EL = 36;
const BLUE = colour("#2f8fdc");
const NORTH = RING[0] - LANE;
const NEXT = BAY[0] + BLOCK;

/**
 * Lines through the roundabout, as a driver takes them: easing out round the
 * island and back, never turning hard. Each is given for a car arriving from
 * the west, and turned about the roundabout's middle for any other arm.
 */
const about = (points: V2[], degrees: number): V2[] => {
  const c = Math.cos(degrees * DEG),
    k = Math.sin(degrees * DEG);
  return points.map(([x, y]) => [
    RING[0] + x * c - y * k,
    RING[1] + x * k + y * c,
  ]);
};
/** Straight on: out round the island in one long swell, and back to the lane. */
const SWELL = 11,
  CLEAR = 2.55;
const through = (degrees: number) =>
  about(
    [-11, -8.5, -6, -3.5, -1.5, 0, 1.5, 3.5, 6, 8.5, 11].map((x): V2 => [
      x,
      LANE + (CLEAR * (1 + Math.cos((Math.PI * x) / SWELL))) / 2,
    ]),
    degrees,
  );
/** The first exit, to the left: a quarter of a wide circle from one arm to the next. */
const SWEEP = 6.5;
const left = (degrees: number) =>
  about(
    [
      [-12, LANE],
      ...[-90, -72, -54, -36, -18, 0].map((a): V2 => [
        -LANE - SWEEP + SWEEP * Math.cos(a * DEG),
        LANE + SWEEP + SWEEP * Math.sin(a * DEG),
      ]),
      [-LANE, 12],
    ],
    degrees,
  );

/** How far past the space it pulls up to reverse in, and where: a little out from the kerb line. */
const REACH = 8.5;
const PAST: V2 = [NEXT + 0.5 + REACH + 0.5, 2.1];
/** The car's way: out of the lay-by, through the roundabout, and up past the next lay-by. */
const WAY = route([
  BAY,
  // Out of the lay-by in one long S, no tighter than a car can turn.
  ...sidle([BAY[0] + 0.6, BAY[1]], 10, LANE),
  [5, LANE],
  ...through(0),
  [NEXT - 3, LANE + 0.1],
  [NEXT + 3, 2.05],
  [PAST[0] - 1.6, PAST[1]],
  [PAST[0] - 0.8, PAST[1]],
  PAST,
]);
/** Back into the space: the tail swings in to the kerb, and the car straightens up. */
const IN = route([
  PAST,
  // One long S, no tighter than a car can turn.
  ...sidle([NEXT + 0.5, BAY[1]], REACH, PAST[1]).reverse(),
  [NEXT, BAY[1]],
]);
/** Where it waits for the roundabout to clear. */
const GIVE_WAY = WAY.near([8.3, LANE]);
/**
 * The car is driven, not animated: it slows for each bend by how tight the
 * bend is, and gathers and sheds speed no faster than a calm driver would.
 */
const DRIVEN = timetable(WAY, {
  cruise: 9,
  bend: 3.2,
  gain: 3.4,
  brake: 3.6,
  stops: [{ at: GIVE_WAY, wait: 0.9 }],
});
const BACKED = timetable(IN, { cruise: 3.6, bend: 2.4, gain: 2.2, brake: 2.4 });
/** When it sets off, pulls up past the space, starts back, and is in. */
const T_GO = 0.4,
  T_STOP = T_GO + DRIVEN.duration,
  T_BACK = T_STOP + 0.4,
  T_IN = T_BACK + BACKED.duration;
const LOOP = Math.ceil((T_IN + 0.4) * 10) / 10;
const gone = (t: number) => DRIVEN.at(t - T_GO);
/** The moments the story turns on: in lane behind the car ahead, stopped at the roundabout, and clear of it. */
const T_LANE = T_GO + DRIVEN.until(WAY.near([BAY[0] + 10.6, LANE])),
  T_WAIT = T_GO + DRIVEN.until(GIVE_WAY),
  T_CLEAR = T_GO + DRIVEN.until(WAY.near([NEXT - 3, LANE]));
const STARTS: [number, number, number] = [
  0,
  T_GO + DRIVEN.until(WAY.near([4, LANE])),
  T_CLEAR,
];

/** The car ahead turns into the street from the north, and leaves by the roundabout's north arm. */
const AHEAD = route([
  [LANE, 34],
  [LANE, 12],
  ...[180, 200, 225, 250, 270].map((a): V2 => [
    LANE + 3.6 + 3.6 * Math.cos(a * DEG),
    LANE + 3.6 + 3.6 * Math.sin(a * DEG),
  ]),
  [8, LANE],
  ...left(0),
  [NORTH, 40],
]);
/** The car the roundabout is given to: up from the south, round, and away north. */
const ROUND_CAR = route([[NORTH, -40], ...through(90), [NORTH, 40]]);
/** One coming the other way: in from the east, and off to the south. */
const OPPOSITE = route([
  [RING[0] + 45, -LANE],
  ...left(180),
  [RING[0] + LANE, -40],
]);
const CALM = {
  cruise: 8.5,
  bend: 3,
  gain: 3,
  brake: 3.2,
  enter: 7,
  leave: 8.5,
};
/** The other cars, each with the moment on the car's clock that it sets out. */
const TRAFFIC = [
  // Eleven metres ahead as the car comes into the lane behind it.
  {
    line: AHEAD,
    plan: timetable(AHEAD, CALM),
    from: (plan: Timetable) => T_LANE - plan.until(AHEAD.near([8, LANE])),
    lead: true,
  },
  // Across the mouth of the street just after the car has stopped for it.
  {
    line: ROUND_CAR,
    plan: timetable(ROUND_CAR, CALM),
    from: (plan: Timetable) =>
      T_WAIT + 0.5 - plan.until(ROUND_CAR.near([RING[0] - LANE - CLEAR, 0])),
    lead: false,
  },
  {
    line: OPPOSITE,
    plan: timetable(OPPOSITE, CALM),
    from: () => T_WAIT - 2.5,
    lead: false,
  },
].map((car) => ({ ...car, start: car.from(car.plan) }));

/** Where the car is and which way it points at a moment of the run. */
export function drivePose(t: number) {
  if (t <= T_BACK) return WAY.at(gone(t));
  // Backing in, it faces the way it came.
  const p = IN.at(BACKED.at(t - T_BACK));
  return { ...p, heading: p.heading + Math.PI };
}
export const DRIVE_LOOP = LOOP;
/** The moments of the run, for checking it. */
export const DRIVE_TIMES = {
  T_GO,
  T_LANE,
  T_WAIT,
  T_CLEAR,
  T_STOP,
  T_BACK,
  T_IN,
};

type Timetable = ReturnType<typeof timetable>;
type Seen = { at: V3; wide: number; tall: number };
/** A car's equipment answer, with what it costs made plain. */
const stated = (car: SceneCar, key: string) => {
  const feature = car.features[key];
  // As many clauses of the answer as a label has room for, in order.
  const parts = (answer(car, key) ?? "Not stated").split(/ · | — /);
  let text = parts[0];
  for (const part of parts.slice(1)) {
    if (`${text} · ${part}`.length > 48) break;
    text = `${text} · ${part}`;
  }
  if (!feature) return text;
  return feature.status === "standard"
    ? `Standard · ${text}`
    : feature.status === "optional"
      ? `Paid option · ${text}`
      : text;
};

export const driveSceneB = scene({
  beats: ["Following traffic", "Supervised junction", "Parking"],
  starts: STARTS,
  loop: LOOP,
  still: STARTS[1] + 1.6,
  seamless: true,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const driven = gone(t);
    // Forwards along its way, then backwards along the way into the space.
    const backed = BACKED.at(t - T_BACK);
    const reversing = t > T_BACK;
    const car = drivePose(t);
    const speed = (gone(t + 0.1) - gone(t - 0.1)) / 0.2;
    // Brake lamps come up as it slows, and stay on while it stands.
    const braking = Math.max(
      ramp(0.6, 2.2, -(gone(t + 0.25) - 2 * driven + gone(t - 0.25)) / 0.0625),
      1 - ramp(0.2, 0.9, speed + (reversing ? 1 : 0)),
    );

    // Everyone else on the road. Each block runs the same events on its own
    // clock, one lap ahead of the block behind it, so they carry across the join.
    const others: (Seen & { draw: Item[]; lead?: boolean })[] = [];
    // The blocks in view: the one the car is in and its neighbours. Half-way
    // down the street the set moves on by one, where neither end is in view.
    const first = car.x > 13 ? 0 : -1;
    const blocks = [first, first + 1, first + 2];
    for (const k of blocks) {
      const tau = t - LOOP * k;
      const ox = BLOCK * k;
      const vehicle = (
        x: number,
        y: number,
        heading: number,
        rolled: number,
        lead = false,
      ) =>
        others.push({
          at: [x + ox, y, 0],
          wide: 2.6,
          tall: 1.6,
          lead,
          draw: carItems(stand(), {
            at: placed(x + ox, y, heading),
            paint: WHITE,
            clay: true,
            roll: rolled / 0.37,
          }),
        });
      for (const other of TRAFFIC) {
        const since = tau - other.start;
        if (since <= 0 || since >= other.plan.duration) continue;
        const run = other.plan.at(since);
        const p = other.line.at(run);
        vehicle(p.x, p.y, p.heading, run, other.lead);
      }
      // Parked on the cross street.
      vehicle(-2.5, 21, 90 * DEG, 0);
      const strolled = BAY[0] + 9 + 0.7 * tau;
      for (const [x, y, facing, walks] of [
        [BAY[0] - 1.6, 7.9, 250, 0],
        [strolled, 5.4, 0, 1],
        [RING[0] - 8.6, 8.4, 290, 0],
        [RING[0] + 9.4, 8.2, 200, 0],
        [RING[0] + 8.8, -8.6, 120, 0],
        [-5.4, -5.6, 60, 0],
      ] as const)
        others.push({
          at: [x + ox, y, 0],
          wide: 0.45,
          tall: 1.78,
          draw: person(
            compose(translate(x + ox, y, 0), rotateZ(facing * DEG)),
            (strolled / 1.45) * TAU,
            walks,
          ),
        });
      others.push({
        at: [BAY[0] + 5.6 + ox, 6.3, 0],
        wide: 0.5,
        tall: 1.05,
        draw: [],
      });
    }

    // The camera looks a little ahead of the car. As the car backs into the
    // space, that look-ahead settles to where the next lap's will begin.
    const settle = ramp(T_BACK - 0.3, T_IN + 0.1, t, glide);
    const onward = WAY.at(driven + 5),
      next = WAY.at(5);
    const lead = {
      x: lerp(onward.x, next.x + BLOCK, settle),
      y: lerp(onward.y, next.y, settle),
    };
    const across = wide ? 37 : 25;
    const shot = {
      at: t,
      target: offset(
        [(car.x + lead.x) / 2, (car.y + lead.y) / 2, 0.5],
        AZ,
        wide ? 3.2 : 0,
        wide ? 0.6 : 0,
      ),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.04),
      ...blocks.flatMap(townBlock),
      ...carItems(model, {
        at: placed(car.x, car.y, car.heading),
        paint: PAINT,
        lamps: 0.7,
        tail: 0.25 + 0.75 * braking,
        roll: (driven - backed) / model.shape.wheelR,
        // The front wheels lead the car into a bend; backing, they steer it from behind.
        steer: reversing
          ? -(IN.at(backed + 1.6).heading - IN.at(backed).heading) * 1.6
          : (WAY.at(driven + 1.6).heading - car.heading) * 1.5,
      }),
    ];
    for (const other of others) items.push(...other.draw);

    // What the cameras cover: a long fan ahead, short ones to each side and behind.
    const fan = (
      name: string,
      turn: number,
      half: number,
      reach: number,
      alpha: number,
    ) => {
      const from = car.heading + turn;
      const start: [number, number] = [
        car.x + Math.cos(from) * 1.6,
        car.y + Math.sin(from) * 1.6,
      ];
      const rim = Array.from({ length: 9 }, (_, i): [number, number] => {
        const a = from - half + (2 * half * i) / 8;
        return [car.x + Math.cos(a) * reach, car.y + Math.sin(a) * reach];
      });
      items.push(
        decal(name, [start, ...rim], BLUE, alpha, 0.03, [
          0.15,
          ...rim.map(() => 1),
        ]),
      );
    };
    fan("ahead", 0, 26 * DEG, 24, 0.16);
    fan("left", 90 * DEG, 34 * DEG, 9, 0.1);
    fan("right", -90 * DEG, 34 * DEG, 9, 0.1);
    fan("behind", 180 * DEG, 24 * DEG, 11, reversing ? 0.16 : 0.08);

    // What they pick out: anything near enough and not behind the car.
    const noticed = others.map((other) => {
      const dx = other.at[0] - car.x,
        dy = other.at[1] - car.y;
      const far = Math.hypot(dx, dy);
      const forward =
        (dx * Math.cos(car.heading) + dy * Math.sin(car.heading)) / (far || 1);
      return {
        ...other,
        far,
        seen: (1 - ramp(17, 24, far)) * ramp(-0.75, -0.35, forward),
      };
    });
    noticed.forEach((other, i) => {
      if (other.seen > 0.02)
        items.push(
          ribbon(
            `seen ${i}`,
            arc(other.at[0], other.at[1], other.wide * 0.62 + 0.25, 0, 1, 40),
            0.06,
            BLUE,
            0.6 * other.seen,
            0.04,
            true,
          ),
        );
    });

    // Parking: the space the cameras have found, and the way into it.
    const parking =
      ramp(T_CLEAR - 0.2, T_CLEAR + 0.4, t) * (1 - ramp(T_IN, LOOP, t));
    if (parking > 0.01) {
      const [bx, by] = [NEXT, BAY[1]];
      items.push(
        ribbon(
          "space",
          [
            [bx - 2.75, by - 1.02],
            [bx + 2.75, by - 1.02],
            [bx + 2.75, by + 1.02],
            [bx - 2.75, by + 1.02],
          ],
          0.09,
          BLUE,
          0.85 * parking,
          0.035,
          true,
        ),
      );
      // The way in: back from where the car pulls up, along the reversing line.
      const ahead: [number, number][] = [];
      for (let d = backed + 2.4; d < IN.total - 0.3; d += 0.4) {
        const p = IN.at(d);
        ahead.push([p.x, p.y]);
      }
      if (ahead.length > 2)
        items.push(
          ribbon(
            "way in",
            ahead,
            0.16,
            BLUE,
            0.4 * parking * ramp(T_STOP - 0.8, T_STOP, t),
            0.034,
          ),
        );
    }

    const labels = (plate: Plate) => {
      const { ctx } = plate;
      const u = plate.unit;
      // Corner marks round each thing seen, as a camera's box would sit on it.
      for (const other of noticed) {
        if (other.seen <= 0.02) continue;
        let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
        for (const sx of [-1, 1])
          for (const sy of [-1, 1])
            for (const z of [0, other.tall]) {
              const [px, py] = spot(plate, [
                other.at[0] + (sx * other.wide) / 2,
                other.at[1] + (sy * other.wide) / 2,
                z,
              ]);
              x0 = Math.min(x0, px);
              x1 = Math.max(x1, px);
              y0 = Math.min(y0, py);
              y1 = Math.max(y1, py);
            }
        const tick = Math.min(9 * u, (x1 - x0) / 3);
        ctx.save();
        ctx.globalAlpha = 0.75 * other.seen;
        ctx.strokeStyle = "#1f7fd0";
        ctx.lineWidth = 1.3 * u;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (const [cx, cy, dx, dy] of [
          [x0, y0, 1, 1],
          [x1, y0, -1, 1],
          [x0, y1, 1, -1],
          [x1, y1, -1, -1],
        ]) {
          ctx.moveTo(cx + dx * tick, cy);
          ctx.lineTo(cx, cy);
          ctx.lineTo(cx, cy + dy * tick);
        }
        ctx.stroke();
        ctx.restore();
      }

      // The distance held to the car ahead.
      const ahead = noticed.find(
        (o) => o.lead && o.far < 16 && Math.abs(o.at[1] - car.y) < 3.2,
      );
      const held = span(T_LANE - 0.4, T_WAIT, t, 0.35);
      if (ahead && held > 0.01) {
        const dx = (ahead.at[0] - car.x) / ahead.far,
          dy = (ahead.at[1] - car.y) / ahead.far;
        const a: V3 = [car.x + dx * 2.6, car.y + dy * 2.6, 0.05],
          b: V3 = [ahead.at[0] - dx * 2.5, ahead.at[1] - dy * 2.5, 0.05];
        measure(plate, a, b, "#1f7fd0", held);
        pill(
          plate,
          [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.05],
          "",
          "Gap held",
          { alpha: held, dy: 22 },
        );
      }
      if (parking > 0.01)
        badge(plate, [NEXT, BAY[1] + 0.2, 2.2], "park", BLUE, {
          alpha: parking,
          stem: [NEXT, BAY[1] + 0.2, 0.1],
          radius: 13,
        });

      // What gives this help, for each car: standard equipment or a paid option.
      const roof: V3 = [car.x, car.y, 1.75];
      const beats: [string, number][] = [
        ["adas_standard", 1 - ramp(STARTS[1] - 0.2, STARTS[1] + 0.2, t)],
        ["adas_optional", span(STARTS[1], STARTS[2] + 0.2, t, 0.3)],
        ["parking_cameras", ramp(STARTS[2], STARTS[2] + 0.4, t)],
      ];
      // The loop's first and last labels differ, so both fade at the join.
      const join = ramp(0, 0.4, t) * (1 - ramp(LOOP - 0.4, LOOP, t));
      for (const [key, alpha] of beats)
        [base, rival].forEach((who, i) =>
          pill(plate, roof, who.name, stated(who, key), {
            tone: i ? "light" : "dark",
            alpha: alpha * join,
            dy: i ? -42 : -77,
            dot: dotFor(has(who, key)),
            tie: i ? undefined : roof,
          }),
        );
      caption(
        plate,
        "The driver supervises throughout. What each car can do depends on its equipment and the options bought.",
      );
    };
    return { shot, items, labels };
  },
});
