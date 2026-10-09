/**
 * The white model town the driving scenes are set in: one street running
 * east, a cross street, a roundabout with a street north and south of it,
 * and a lay-by to park in. The town repeats, block after block, along the
 * street, so a drive down it can go on for ever.
 */
import { type Item } from "./gl";
import { DEG, clamp, compose, translate, turn, type V2 } from "./math";
import { post, turned } from "./mesh";
import { ASPHALT, WHITE, box, clay, hedge, house, kept, tree } from "./world";

/** Australia drives on the left: a lane's middle is this far left of the centre line. */
export const LANE = 1.75;
/** The roundabout: its middle, and the radius cars go round at. */
export const RING: V2 = [20, 0],
  ROUND = 5.5;
/** One block east of anything in the town is the same thing again. */
export const BLOCK = 58;
/** The lay-by: the middle of the space a car parks in, facing east. */
export const BAY: V2 = [-15, 4.62];
export const onRing = (degrees: number): V2 => [
  RING[0] + ROUND * Math.cos(degrees * DEG),
  RING[1] + ROUND * Math.sin(degrees * DEG),
];

/**
 * A line a car can drive: through the given points, then smoothed until its
 * bends come on and go off gradually, as a steering wheel is turned, and
 * kept as even samples with the heading and the tightness of the bend at
 * each. `passes` is how much it is smoothed; more cuts a corner further.
 * `STEP` is the metres between samples.
 */
export function route(points: V2[], passes = 60, STEP = 0.1) {
  // A first curve through the points.
  const rough: V2[] = [];
  const get = (i: number) => points[clamp(i, 0, points.length - 1)];
  for (let i = 0; i < points.length - 1; i++)
    for (let k = 0; k < 24; k++) {
      const t = k / 24;
      const [a, b, c, d] = [get(i - 1), get(i), get(i + 1), get(i + 2)];
      const at = (n: 0 | 1) =>
        0.5 *
        (2 * b[n] +
          (c[n] - a[n]) * t +
          (2 * a[n] - 5 * b[n] + 4 * c[n] - d[n]) * t * t +
          (3 * b[n] - a[n] - 3 * c[n] + d[n]) * t * t * t);
      rough.push([at(0), at(1)]);
    }
  rough.push(points[points.length - 1]);
  // The same curve in equal steps along its length, as near `STEP` as divides it.
  let h = STEP;
  const even = (line: V2[]): V2[] => {
    let long = 0;
    for (let i = 1; i < line.length; i++)
      long += Math.hypot(
        line[i][0] - line[i - 1][0],
        line[i][1] - line[i - 1][1],
      );
    const count = Math.max(2, Math.round(long / STEP));
    h = long / count;
    const out: V2[] = [line[0]];
    let need = h;
    for (let i = 1; i < line.length && out.length < count; i++) {
      let [ax, ay] = line[i - 1];
      const [bx, by] = line[i];
      let left = Math.hypot(bx - ax, by - ay);
      while (left >= need && out.length < count) {
        const f = need / left;
        ax += (bx - ax) * f;
        ay += (by - ay) * f;
        out.push([ax, ay]);
        left -= need;
        need = h;
      }
      need -= left;
    }
    out.push(line[line.length - 1]);
    return out;
  };
  let pts = even(rough);
  // Smoothed, with both ends and the direction it leaves them held.
  for (let pass = 0; pass < passes; pass++) {
    const next = pts.map((p) => [p[0], p[1]] as V2);
    for (let i = 6; i < pts.length - 6; i++)
      for (const n of [0, 1] as const)
        next[i][n] = (pts[i - 1][n] + 2 * pts[i][n] + pts[i + 1][n]) / 4;
    pts = next;
  }
  pts = even(pts);
  const n = pts.length;
  const total = (n - 1) * h;
  // Heading at each sample, unwound so that it never jumps a whole turn.
  const heading: number[] = [];
  for (let i = 0; i < n; i++) {
    const u = pts[Math.max(0, i - 1)],
      v = pts[Math.min(n - 1, i + 1)];
    const raw = Math.atan2(v[1] - u[1], v[0] - u[0]);
    heading.push(i ? turn(heading[i - 1], raw, 1) : raw);
  }
  // It leaves its first point and arrives at its last dead straight, in the
  // direction of the points given there, so two lines can be joined end to end.
  const HELD = Math.min(6, Math.floor(n / 3));
  const ends = [
    Math.atan2(points[1][1] - points[0][1], points[1][0] - points[0][0]),
    Math.atan2(
      points[points.length - 1][1] - points[points.length - 2][1],
      points[points.length - 1][0] - points[points.length - 2][0],
    ),
  ];
  for (let i = 0; i < HELD; i++) {
    heading[i] = turn(heading[HELD], ends[0], 1);
    heading[n - 1 - i] = turn(heading[n - 1 - HELD], ends[1], 1);
  }
  for (let pass = 0; pass < 12; pass++)
    for (let i = HELD; i < n - HELD; i++)
      heading[i] = (heading[i - 1] + 2 * heading[i] + heading[i + 1]) / 4;
  const bend = heading.map(
    (_, i) =>
      Math.abs(heading[Math.min(n - 1, i + 1)] - heading[Math.max(0, i - 1)]) /
      (2 * h),
  );
  return {
    total,
    step: h,
    /** How far along the line it passes nearest a point. */
    near(point: V2) {
      let best = 0,
        gap = Infinity;
      pts.forEach((p, i) => {
        const d = (p[0] - point[0]) ** 2 + (p[1] - point[1]) ** 2;
        if (d < gap) {
          gap = d;
          best = i;
        }
      });
      return best * h;
    },
    /** How tight the bend is a distance along it: one over its radius. */
    bend: (distance: number) => bend[clamp(Math.round(distance / h), 0, n - 1)],
    /** Position and heading a distance along it; beyond its end it runs straight on. */
    at(distance: number) {
      const d = clamp(distance, 0, total);
      const i = Math.min(n - 2, Math.floor(d / h));
      const f = d / h - i;
      const facing = heading[i] + (heading[i + 1] - heading[i]) * f;
      const over = Math.max(0, distance - total);
      return {
        x:
          pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f + Math.cos(facing) * over,
        y:
          pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f + Math.sin(facing) * over,
        heading: facing,
      };
    },
  };
}
export type Route = ReturnType<typeof route>;
/**
 * A sideways move as a car makes it: from a point, `long` metres on along x,
 * ending at height `to`. The wheel goes on gradually, comes back through
 * centre half-way, and is straight again at the end.
 */
export const sidle = (from: V2, long: number, to: number): V2[] =>
  Array.from({ length: 13 }, (_, i): V2 => {
    const u = i / 12;
    return [
      from[0] + long * u,
      from[1] +
        (to - from[1]) * (u - Math.sin(2 * Math.PI * u) / (2 * Math.PI)),
    ];
  });

/** How a car is driven: its top speed, and the most it will pull in a bend, speeding up, or braking. */
export type Manner = {
  cruise: number;
  bend: number;
  gain: number;
  brake: number;
  /** Places it stops on the way: how far along, and for how long. */
  stops?: { at: number; wait: number }[];
  /** Its speed as it joins the line and as it leaves it; it starts and ends at rest unless told. */
  enter?: number;
  leave?: number;
};
/**
 * When a car is where along a route, driven as a person would: slowing for
 * each bend by how tight it is, and never speeding up or braking harder than
 * its manner allows. Gives the distance covered after a time, the time a
 * distance is reached, and how long the whole drive takes.
 */
export function timetable(line: Route, manner: Manner) {
  const STEP = line.step;
  const n = Math.round(line.total / STEP) + 1;
  const limit: number[] = [];
  for (let i = 0; i < n; i++)
    limit.push(
      Math.min(
        manner.cruise,
        Math.sqrt(manner.bend / Math.max(1e-4, line.bend(i * STEP))),
      ),
    );
  const stops = (manner.stops ?? []).map((stop) => ({
    index: clamp(Math.round(stop.at / STEP), 1, n - 2),
    wait: stop.wait,
  }));
  for (const stop of stops) limit[stop.index] = 0;
  limit[0] = Math.min(limit[0], manner.enter ?? 0);
  limit[n - 1] = Math.min(limit[n - 1], manner.leave ?? 0);
  const speed = limit.slice();
  for (let i = 1; i < n; i++)
    speed[i] = Math.min(
      speed[i],
      Math.sqrt(speed[i - 1] ** 2 + 2 * manner.gain * STEP),
    );
  for (let i = n - 2; i >= 0; i--)
    speed[i] = Math.min(
      speed[i],
      Math.sqrt(speed[i + 1] ** 2 + 2 * manner.brake * STEP),
    );
  // It eases on and off the pedals: the speed is rounded where it changes,
  // but never where it is pulling away from rest or coming to it.
  for (let pass = 0; pass < 30; pass++) {
    const was = speed.slice();
    for (let i = 1; i < n - 1; i++)
      if (Math.min(was[i - 1], was[i + 1]) > 1.2)
        speed[i] = Math.min(
          speed[i],
          (was[i - 1] + 2 * was[i] + was[i + 1]) / 4,
        );
  }
  const when = [0];
  for (let i = 1; i < n; i++) {
    const stop = stops.find((s) => s.index === i - 1);
    when.push(
      when[i - 1] +
        (stop?.wait ?? 0) +
        (2 * STEP) / Math.max(0.05, speed[i - 1] + speed[i]),
    );
  }
  const duration = when[n - 1];
  return {
    duration,
    /** Distance covered after `seconds`. */
    at(seconds: number) {
      if (seconds <= 0) return 0;
      if (seconds >= duration) return line.total;
      let lo = 0,
        hi = n - 1;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (when[mid] <= seconds) lo = mid;
        else hi = mid;
      }
      // Standing at a stop, it has not left it. Once moving, it covers the
      // step gathering or shedding speed evenly, not at one flat speed.
      const waited = stops.find((s) => s.index === lo)?.wait ?? 0;
      const moving = Math.max(0, seconds - when[lo] - waited);
      const taken = when[hi] - when[lo] - waited;
      const v0 = speed[lo],
        v1 = speed[hi];
      const covered = v0 * moving + ((v1 - v0) * moving * moving) / (2 * taken);
      const whole = ((v0 + v1) * taken) / 2;
      return (lo + clamp(covered / (whole || 1))) * STEP;
    },
    /** Seconds until a distance along is reached. */
    until(distance: number) {
      const at = clamp(distance / STEP, 0, n - 1);
      const i = Math.min(n - 2, Math.floor(at));
      return when[i] + (when[i + 1] - when[i]) * (at - i);
    },
  };
}

/** One block of the town, which never changes: built once, then set down wherever it is needed. */
let block: Item[] | undefined;
function streets(): Item[] {
  if (block) return block;
  const tar = clay(ASPHALT);
  const line = clay(WHITE);
  const items: Item[] = [
    // The street west of the roundabout and east of it, the cross street,
    // and the street through the roundabout.
    box([BLOCK, 7, 0.02], [RING[0] - BLOCK / 2, 0, 0], tar, 0.004, false),
    box([7, 70, 0.02], [0, 0, 0.001], tar, 0.004, false),
    box([7, 70, 0.02], [RING[0], 0, 0.0005], tar, 0.004, false),
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
    // The lay-by, its kerb, and the lines of the space in it.
    box([9.6, 2.5, 0.02], [BAY[0], 4.7, 0.0008], tar, 0.004, false),
    box([9.6, 0.24, 0.13], [BAY[0], 6.07, 0], clay(), 0.04),
    box([0.11, 1.0, 0.012], [BAY[0] - 3.1, 5.25, 0.024], line, 0.003, false),
    box([0.11, 1.0, 0.012], [BAY[0] + 3.1, 5.25, 0.024], line, 0.003, false),
    // A bin at the kerb, a bench and a hedge behind the lay-by.
    box([0.6, 0.7, 1.05], [BAY[0] + 5.6, 6.3, 0], clay(), 0.06),
    box([1.7, 0.5, 0.45], [BAY[0] - 1.2, 7.0, 0], clay(), 0.05),
    hedge([BAY[0] + 2.4, 7.1, 0], 3.4, 0.8, 0.7),
    // Give-way lines where each street meets the roundabout.
    box([0.3, 3.3, 0.012], [RING[0] - 9.3, LANE, 0.022], line, 0.003, false),
    box([0.3, 3.3, 0.012], [RING[0] + 9.3, -LANE, 0.022], line, 0.003, false),
    box([3.3, 0.3, 0.012], [RING[0] - LANE, -9.3, 0.022], line, 0.003, false),
    box([3.3, 0.3, 0.012], [RING[0] + LANE, 9.3, 0.022], line, 0.003, false),
  ];
  // Centre-line dashes on the straights, clear of the junctions.
  for (const [from, to] of [
    [RING[0] + 11 - BLOCK, -17.5],
    [5, 10],
  ])
    for (let x = from; x + 2.4 <= to; x += 6)
      items.push(
        box([2.4, 0.13, 0.012], [x + 1.2, 0, 0.022], line, 0.003, false),
      );
  for (const x of [0, RING[0]])
    for (const [from, to] of [
      [-34, -11],
      [11, 34],
    ])
      for (let y = from; y + 2.4 <= to; y += 6)
        items.push(
          box([0.13, 2.4, 0.012], [x, y + 1.2, 0.022], line, 0.003, false),
        );
  for (const [x, y, w, upper] of [
    [-13, 11.8, 11, false],
    [-28.5, 11.6, 9, true],
    [-28.5, -11.2, 9, false],
    [9.8, 11.6, 9, true],
    [9.8, -11, 9, false],
    [-12.5, -11.2, 10, true],
    [-13, 26, 10, true],
    [9.8, 26, 9, false],
    [-12, -26, 10, false],
    [9.8, -26, 9, true],
  ] as const)
    items.push(...house([x, y, 0], w, 7.5, upper));
  [
    [-5.6, 6.8],
    [-22.4, 7],
    [6.2, 5.6],
    [14.2, 6.6],
    [-7.5, -5.8],
    [7, -5.6],
    [-18, -5.6],
    [14.6, -6.2],
    [25.6, 11],
    [26.4, -10.4],
    [25.8, 20],
    [-5.6, 18],
    [4.6, 19],
    [14.6, 19.5],
    [-5.4, -18.5],
    [25.6, -21],
    [-20, 19.5],
    [-21, -19],
  ].forEach(([x, y], i) =>
    items.push(...tree([x, y, 0], 3.8 + ((i * 7) % 5) * 0.4, i)),
  );
  return (block = items);
}
const moved = new Map<number, Item[]>();
/** The block, set down `k` blocks east of the one the scene is in. */
export function townBlock(k: number): Item[] {
  let items = moved.get(k);
  if (!items) {
    const shift = translate(BLOCK * k, 0, 0);
    items = streets().map((item) => ({ ...item, at: compose(shift, item.at) }));
    moved.set(k, items);
  }
  return items;
}
