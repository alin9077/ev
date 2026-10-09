/**
 * Automated driving, B. One ten-second lap through a white model town, after
 * the A scene's three tests: a stop sign, a roundabout and an unprotected
 * turn. The town repeats block after block, so the lap has no join. The
 * camera travels with the car. What the car's cameras take in is
 * shown quietly: pale fans of view on the road, and a ring and corner marks
 * on each person, vehicle and obstacle as it comes into range.
 */
import { carItems, placed } from "./car";
import { answer, dotFor, has, hero, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  TAU,
  clamp,
  colour,
  compose,
  curve,
  ramp,
  rotateY,
  rotateZ,
  translate,
  type V2,
  type V3,
} from "./math";
import { merge, post, turned } from "./mesh";
import { brief, pill, spot } from "./overlay";
import { scene, type Plate } from "./stage";
import {
  ASPHALT,
  PAINT,
  WHITE,
  arc,
  box,
  clay,
  decal,
  gloss,
  ground,
  house,
  kept,
  person,
  ribbon,
  tree,
} from "./world";

const STARTS: [number, number, number] = [0, 3.3, 6.7];
const LOOP = 10;
const AZ = -58,
  EL = 36;
const BLUE = colour("#2f8fdc");
/** Australia drives on the left: the car's lane is this far left of the centre line. */
const LANE = 1.75;
/** The roundabout: its middle, and the radius the car goes round at. */
const RING: V2 = [20, 0],
  ROUND = 5.5;
/**
 * The town repeats: one block east and one street north of each stop sign is
 * the next. The car ends a lap exactly one block on from where it began,
 * heading the same way, so the loop has no join.
 */
const BLOCK: V2 = [46, 22];
const onRing = (degrees: number): V2 => [
  RING[0] + ROUND * Math.cos(degrees * DEG),
  RING[1] + ROUND * Math.sin(degrees * DEG),
];

/** A smooth line through points, sampled finely, with its length at each sample. */
const PER = 24;
function route(points: V2[]) {
  const pts: V2[] = [];
  const get = (i: number) => points[clamp(i, 0, points.length - 1)];
  for (let i = 0; i < points.length - 1; i++)
    for (let k = 0; k < PER; k++) {
      const t = k / PER;
      const [a, b, c, d] = [get(i - 1), get(i), get(i + 1), get(i + 2)];
      const at = (n: 0 | 1) =>
        0.5 *
        (2 * b[n] +
          (c[n] - a[n]) * t +
          (2 * a[n] - 5 * b[n] + 4 * c[n] - d[n]) * t * t +
          (3 * b[n] - a[n] - 3 * c[n] + d[n]) * t * t * t);
      pts.push([at(0), at(1)]);
    }
  pts.push(points[points.length - 1]);
  const length = [0];
  for (let i = 1; i < pts.length; i++)
    length.push(
      length[i - 1] +
        Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]),
    );
  const total = length[length.length - 1];
  return {
    total,
    /** How far along the line a given control point is. */
    mark: (index: number) => length[index * PER],
    /** Position and heading a distance along it; beyond its end it runs straight on. */
    at(distance: number) {
      const d = clamp(distance, 0, total - 0.001);
      let i = 1;
      while (length[i] < d) i += 1;
      const f = (d - length[i - 1]) / (length[i] - length[i - 1] || 1);
      const [p, q] = [pts[i - 1], pts[i]];
      const [u, v] = [
        pts[Math.max(0, i - 3)],
        pts[Math.min(pts.length - 1, i + 2)],
      ];
      const heading = Math.atan2(v[1] - u[1], v[0] - u[0]);
      const over = distance - d;
      return {
        x: p[0] + (q[0] - p[0]) * f + Math.cos(heading) * Math.max(0, over),
        y: p[1] + (q[1] - p[1]) * f + Math.sin(heading) * Math.max(0, over),
        heading,
      };
    },
  };
}
/**
 * The car's way: up to the stop line, a quarter of the roundabout to its
 * north arm, then right across the oncoming lane into the next street.
 */
const NORTH = RING[0] - LANE;
const WAY = route([
  [-13, LANE],
  [-6.84, LANE],
  [5, LANE],
  [12, LANE],
  onRing(160),
  onRing(135),
  onRing(112),
  [NORTH, 9],
  [NORTH, 16],
  [NORTH, 19.2],
  [NORTH + 0.64, 21.38],
  [NORTH + 2.38, 23.11],
  [NORTH + 4.75, BLOCK[1] + LANE],
  [NORTH + 9.75, BLOCK[1] + LANE],
  [-13 + BLOCK[0], BLOCK[1] + LANE],
]);
/** Where the car is at each moment: it stops, goes, slows to give way, and turns. */
const GONE = curve([
  [0, 0],
  [0.3, 2.1],
  [1.3, WAY.mark(1)],
  [1.8, WAY.mark(1)],
  [3.9, WAY.mark(3)],
  [5.1, WAY.mark(7)],
  [6.5, WAY.mark(9) - 0.5],
  [7.4, WAY.mark(9) + 0.4],
  [LOOP - 0.3, WAY.total - 2.1],
  [LOOP, WAY.total],
]);
/** Another car comes in from the east, round the roundabout and away north ahead of ours. */
const AHEAD = route([
  [BLOCK[0], -LANE],
  [30, -LANE],
  onRing(-20),
  onRing(-60),
  onRing(-100),
  onRing(-140),
  onRing(180),
  onRing(135),
  onRing(112),
  [NORTH, 9],
  [NORTH, 30],
  [NORTH, 48],
]);

/** One block of the town, which never changes: built once, then set down wherever it is needed. */
let block: Item[] | undefined;
function streets(): Item[] {
  if (block) return block;
  const tar = clay(ASPHALT);
  const items: Item[] = [
    // The street the car starts on, the roundabout's east arm, the cross
    // street with the stop sign, and the roundabout's north arm.
    box([46, 7, 0.02], [-6.5, 0, 0], tar, 0.004, false),
    box([21, 7, 0.02], [RING[0] + 15.5, 0, 0], tar, 0.004, false),
    box([7, 62, 0.02], [0, 9, 0.001], tar, 0.004, false),
    box([7, 41, 0.02], [RING[0], 28.5, 0.0005], tar, 0.004, false),
    {
      mesh: kept("ring road", () =>
        turned(
          [
            [0, 0],
            [9.1, 0],
            [9.1, 0.022],
            [0, 0.022],
          ],
          64,
        ),
      ),
      at: translate(RING[0], RING[1], 0),
      mat: tar,
      cast: false,
    },
    {
      mesh: kept("island", () => post(2.9, 0.17, 0.05, 48)),
      at: translate(RING[0], RING[1], 0.02),
      mat: clay(),
    },
    ...tree([RING[0], RING[1], 0.17], 3.6, 4),
    // The stop line, and the sign beside it: a plain red octagon on a post.
    box([0.35, 3.3, 0.012], [-4.3, LANE, 0.022], clay(WHITE), 0.003, false),
    {
      mesh: kept("sign post", () => post(0.045, 2.2, 0.01, 10)),
      at: translate(-4.4, 4.5, 0),
      mat: clay(),
    },
    {
      mesh: kept("sign", () =>
        merge([
          [
            turned(
              [
                [0, 0],
                [0.4, 0],
                [0.4, 0.035],
                [0, 0.035],
              ],
              8,
            ),
            compose(rotateY(-90 * DEG), rotateZ(22.5 * DEG)),
          ],
        ]),
      ),
      at: translate(-4.46, 4.5, 2.05),
      mat: gloss(colour("#c8342b"), 0.04),
    },
    // A bin left at the kerb.
    box([0.6, 0.7, 1.05], [-9.4, 4.7, 0], clay(), 0.06),
  ];
  // Centre-line dashes on the straights, clear of the junctions.
  for (const [from, to] of [
    [-22, -6],
    [5, 10],
    [31, 41],
  ])
    for (let x = from; x + 2.4 <= to; x += 6)
      items.push(
        box([2.4, 0.13, 0.012], [x + 1.2, 0, 0.022], clay(WHITE), 0.003, false),
      );
  for (const [x, y, w, upper] of [
    [10, 11.5, 9, true],
    [-13, 11, 11, false],
    [10, -11, 9, false],
    [33, 11, 11, true],
    [33, -11, 10, true],
  ] as const)
    items.push(...house([x, y, 0], w, 7.5, upper));
  [
    [-8, 6.6],
    [-19, 5.8],
    [6.5, 5.6],
    [31, 6.4],
    [39, 5.6],
    [-7.5, -5.8],
    [7, -5.6],
    [30.5, -6.2],
    [40.5, -5.8],
    [25.5, 17],
    [12.5, 18],
    [-6, 18],
  ].forEach(([x, y], i) =>
    items.push(...tree([x, y, 0], 3.8 + ((i * 7) % 5) * 0.4, i)),
  );
  return (block = items);
}
const moved = new Map<number, Item[]>();
/** The block, set down `k` blocks along from the one the car is in. */
function blockAt(k: number): Item[] {
  let items = moved.get(k);
  if (!items) {
    const shift = translate(BLOCK[0] * k, BLOCK[1] * k, 0);
    items = streets().map((item) => ({ ...item, at: compose(shift, item.at) }));
    moved.set(k, items);
  }
  return items;
}

type Seen = { at: V3; wide: number; tall: number };

export const driveSceneB = scene({
  beats: ["Stop sign", "Roundabout", "Unprotected turn"],
  starts: STARTS,
  loop: LOOP,
  still: 4.9,
  seamless: true,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const gone = GONE(t);
    const car = WAY.at(gone);
    const slowing =
      (GONE(t + 0.25) - 2 * gone + GONE(t - 0.25)) / 0.0625 < -1.2;

    // Everyone else on the road. Each block runs the same events on its own
    // clock, one lap ahead of the block behind it, so they carry across the join.
    const others: (Seen & { draw: Item[] })[] = [];
    for (const k of [-1, 0, 1]) {
      const tau = t - LOOP * k;
      const [ox, oy] = [BLOCK[0] * k, BLOCK[1] * k];
      const vehicle = (x: number, y: number, heading: number, rolled: number) =>
        others.push({
          at: [x + ox, y + oy, 0],
          wide: 2.6,
          tall: 1.6,
          draw: carItems(stand(), {
            at: placed(x + ox, y + oy, heading),
            paint: WHITE,
            clay: true,
            roll: rolled / 0.37,
          }),
        });
      // Crossing ahead of the stop line.
      const crossing = -22 + 15 * (tau - 0.1);
      if (crossing > -22 && crossing < 40)
        vehicle(-LANE, crossing, 90 * DEG, crossing);
      // Round the roundabout ahead of the car, and away north.
      const run = 9 * (tau + 0.7);
      if (run > 0 && run < AHEAD.total) {
        const p = AHEAD.at(run);
        vehicle(p.x, p.y, p.heading, run);
      }
      // Coming south towards the turn, then on round the roundabout's east side.
      const south = 48 - 10 * (tau - 4.3);
      if (south < 48 && south > 9.5)
        vehicle(RING[0] + LANE, south, -90 * DEG, -south);
      // Parked beside the north arm.
      vehicle(RING[0] + 4.9, 33, 90 * DEG, 0);
      const strolled = 4 + 0.7 * tau;
      for (const [x, y, facing, walks] of [
        [-5.2, 5.4, 200, 0],
        [strolled, 5.5, 0, 1],
        [RING[0] - 8.6, 8.4, 290, 0],
        [RING[0] - 5, 18.6, 30, 0],
        [RING[0] + 4.6, 26.4, 250, 0],
      ] as const)
        others.push({
          at: [x + ox, y + oy, 0],
          wide: 0.45,
          tall: 1.78,
          draw: person(
            compose(translate(x + ox, y + oy, 0), rotateZ(facing * DEG)),
            (strolled / 1.45) * TAU,
            walks,
          ),
        });
      others.push({
        at: [-9.4 + ox, 4.7 + oy, 0],
        wide: 0.5,
        tall: 1.05,
        draw: [],
      });
    }

    // The camera rides with the car, a little ahead of it.
    const lead = WAY.at(gone + 5);
    const across = wide ? 37 : 25;
    const shot = {
      at: t,
      target: offset(
        [(car.x + lead.x) / 2, (car.y + lead.y) / 2, 0.5],
        AZ,
        wide ? 1.2 : 0,
        wide ? 0.6 : 0,
      ),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.04),
      ...blockAt(-1),
      ...blockAt(0),
      ...blockAt(1),
      ...carItems(model, {
        at: placed(car.x, car.y, car.heading),
        paint: PAINT,
        lamps: 0.7,
        tail: slowing || (t > 1.2 && t < 1.85) ? 1 : 0.25,
        roll: gone / model.shape.wheelR,
        steer: (WAY.at(gone + 1.6).heading - car.heading) * 1.2,
      }),
    ];
    for (const other of others) items.push(...other.draw);

    // What the cameras cover: a long fan ahead, short ones to each side and behind.
    const shown = 1;
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
        decal(name, [start, ...rim], BLUE, alpha * shown, 0.03, [
          0.15,
          ...rim.map(() => 1),
        ]),
      );
    };
    fan("ahead", 0, 26 * DEG, 24, 0.16);
    fan("left", 90 * DEG, 34 * DEG, 9, 0.1);
    fan("right", -90 * DEG, 34 * DEG, 9, 0.1);
    fan("behind", 180 * DEG, 24 * DEG, 11, 0.08);

    // What they pick out: anything near enough and not behind the car.
    const noticed = others.map((other) => {
      const dx = other.at[0] - car.x,
        dy = other.at[1] - car.y;
      const far = Math.hypot(dx, dy);
      const forward =
        (dx * Math.cos(car.heading) + dy * Math.sin(car.heading)) / (far || 1);
      return {
        ...other,
        seen: (1 - ramp(17, 24, far)) * ramp(-0.75, -0.35, forward) * shown,
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
      // Who offers this kind of driving, as researched.
      const roof: V3 = [car.x, car.y, 1.75];
      [base, rival].forEach((who, i) =>
        pill(plate, roof, who.name, brief(answer(who, "adas_optional"), 30), {
          tone: i ? "light" : "dark",
          dy: i ? -39 : -74,
          dot: dotFor(has(who, "adas_optional")),
          tie: i ? undefined : roof,
        }),
      );
    };
    return { shot, items, labels };
  },
});
