/**
 * Choreography for the automated-driving scene: a drive through a city grid
 * in left-hand traffic. Each loop the car goes through a roundabout, stops at
 * a stop sign and turns left, then waits for oncoming traffic before an
 * unprotected right turn. The city repeats every `SHIFT`, and one loop carries
 * the car exactly that far, so the drive never circles and never seams.
 * Conceptual illustration only; it models no manufacturer's system.
 */
export const LOOP = 10;

export type Pt = [number, number];
export type Pose = { x: number; y: number; heading: number; opacity: number };

/**
 * The grid, in scene units (about 16 per metre). East–west streets every
 * `DY`; north–south streets alternate between roundabout streets at
 * `x = n·DX` and junction streets at `x = n·DX + BX`.
 */
export const DX = 900,
  DY = 440,
  BX = 440;
/** How far one loop moves the car; the city is identical after this shift. */
export const SHIFT: Pt = [DX, -DY];
/** Roundabout circulating radius. */
const RING = 70;

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const mod = (v: number, m: number) => ((v % m) + m) % m;
/** Smooth 0→1 ramp between two edges. */
export const ramp = (from: number, to: number, v: number) => {
  const t = clamp((v - from) / (to - from));
  return t * t * (3 - 2 * t);
};

function linePts(a: Pt, b: Pt): Pt[] {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 2);
  return Array.from({ length: steps + 1 }, (_, i): Pt => [
    a[0] + ((b[0] - a[0]) * i) / steps,
    a[1] + ((b[1] - a[1]) * i) / steps,
  ]);
}
/** Angles run clockwise on screen from east, the way Australian roundabouts flow. */
function arcPts(c: Pt, r: number, from: number, to: number): Pt[] {
  const steps = Math.ceil((rad(Math.abs(to - from)) * r) / 2);
  return Array.from({ length: steps + 1 }, (_, i): Pt => {
    const a = rad(from + ((to - from) * i) / steps);
    return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)];
  });
}
function curvePts(p0: Pt, p1: Pt, p2: Pt, p3: Pt): Pt[] {
  return Array.from({ length: 33 }, (_, i): Pt => {
    const t = i / 32,
      u = 1 - t;
    const at = (k: 0 | 1) =>
      u * u * u * p0[k] +
      3 * u * u * t * p1[k] +
      3 * u * t * t * p2[k] +
      t * t * t * p3[k];
    return [at(0), at(1)];
  });
}
/** A point on the roundabout at the origin, `d` along its tangent. */
const ring = (a: number, d = 0): Pt => [
  RING * Math.cos(rad(a)) - Math.sin(rad(a)) * d,
  RING * Math.sin(rad(a)) + Math.cos(rad(a)) * d,
];

/** A path; with `repeats` it continues into the next copy of the city. */
function track(parts: Pt[][], repeats = false) {
  const pts: Pt[] = [],
    at: number[] = [],
    starts: number[] = [];
  let total = 0;
  for (const part of parts) {
    starts.push(total);
    for (const p of part) {
      const last = pts[pts.length - 1];
      if (last) {
        const d = Math.hypot(p[0] - last[0], p[1] - last[1]);
        if (d < 1e-6) continue;
        total += d;
      }
      pts.push(p);
      at.push(total);
    }
  }
  const point = (s: number): Pt => {
    const lap = repeats ? Math.floor(s / total) : 0;
    const d = repeats ? s - lap * total : Math.min(Math.max(s, 0), total);
    let lo = 0,
      hi = at.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (at[mid] <= d) lo = mid;
      else hi = mid;
    }
    const f = (d - at[lo]) / (at[hi] - at[lo] || 1);
    return [
      pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f + lap * SHIFT[0],
      pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f + lap * SHIFT[1],
    ];
  };
  /** Heading in degrees, clockwise from north (−y). */
  const pose = (s: number) => {
    const [x, y] = point(s),
      a = point(s - 3),
      b = point(s + 3);
    return { x, y, heading: deg(Math.atan2(b[0] - a[0], a[1] - b[1])) };
  };
  return { total, starts, point, pose };
}

/*
 * One loop of the route. East along a street and over the top of a
 * roundabout; on to a stop sign and left onto the cross street; north to the
 * lights and right across the oncoming lane; east again, one block up.
 */
const egoTrack = track(
  [
    linePts([-350, -25], [-130, -25]),
    curvePts([-130, -25], [-105, -25], ring(220, -20), ring(220)),
    arcPts([0, 0], RING, 220, 320),
    curvePts(ring(320), ring(320, 20), [105, -25], [130, -25]),
    linePts([130, -25], [BX - 50, -25]),
    arcPts([BX - 50, -50], 25, 90, 0),
    linePts([BX - 25, -50], [BX - 25, -DY + 50]),
    arcPts([BX + 50, -DY + 50], 75, 180, 270),
    linePts([BX + 50, -DY - 25], [-350 + DX, -DY - 25]),
  ],
  true,
);

/** Where the car slows for the roundabout, stops at the line, and waits to turn. */
const GIVE_WAY = egoTrack.starts[0] + 190,
  STOP = egoTrack.starts[4] + (BX - 95 - 130),
  TURN = egoTrack.starts[7] + 75 * rad(6);

/**
 * Speed along the route: cruise on straights, ease through curves, crawl
 * into the roundabout, and hold at the two stops. Cruise speed is solved so
 * one loop of the route takes exactly LOOP seconds.
 */
function schedule(cruise: number) {
  const ACC = 520,
    DEC = 600;
  const cells = Math.round(egoTrack.total),
    ds = egoTrack.total / cells;
  const limits = [0, 120, 135, 160, 0, 85, 0, 160, 0];
  const holds = new Map([
    [Math.round(STOP / ds), 0.65],
    [Math.round(TURN / ds), 0.75],
  ]);
  const cap = (s: number) => {
    let part = 0;
    while (part + 1 < egoTrack.starts.length && egoTrack.starts[part + 1] <= s)
      part += 1;
    if (part === 0 && s > egoTrack.starts[1] - 46) return 60;
    return limits[part] || cruise;
  };
  const env = Array.from({ length: cells + 1 }, (_, i) =>
    holds.has(i) ? 0 : Math.min(cruise, cap(i * ds)),
  );
  for (let i = cells - 1; i >= 0; i--)
    env[i] = Math.min(env[i], Math.sqrt(env[i + 1] ** 2 + 2 * DEC * ds));
  const v = [env[0]];
  for (let i = 1; i <= cells; i++)
    v[i] = Math.min(env[i], Math.sqrt(v[i - 1] ** 2 + 2 * ACC * ds));
  const arrive = [0],
    leave = [0];
  for (let i = 1; i <= cells; i++) {
    arrive[i] = leave[i - 1] + ds / Math.max((v[i - 1] + v[i]) / 2, 6);
    leave[i] = arrive[i] + (holds.get(i) || 0);
  }
  const timeAt = (s: number) => arrive[Math.round(s / ds)];
  const distanceAt = (t: number) => {
    let lo = 0,
      hi = cells;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (leave[mid] <= t) lo = mid;
      else hi = mid;
    }
    return (lo + clamp((t - leave[lo]) / (arrive[hi] - leave[lo]))) * ds;
  };
  return { lap: leave[cells], timeAt, distanceAt };
}
function solveSchedule() {
  let lo = 90,
    hi = 700;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (schedule(mid).lap > LOOP) lo = mid;
    else hi = mid;
  }
  return schedule(hi);
}
const ego = solveSchedule();
/** Distance along the route at any time, running on into later loops. */
const egoDistance = (t: number) =>
  Math.floor(t / LOOP) * egoTrack.total + ego.distanceAt(mod(t, LOOP));

/** Loop times at which the car reaches each decision point. */
const tGive = ego.timeAt(GIVE_WAY),
  tStop = ego.timeAt(STOP),
  tTurn = ego.timeAt(TURN);

/** The three moments the scene is about, as windows of loop time. */
export const acts = [
  { label: "Roundabout", from: tGive - 0.9, to: tGive + 1.7 },
  { label: "Stop sign", from: tStop - 0.8, to: tStop + 1.3 },
  { label: "Unprotected turn", from: tTurn - 0.9, to: tTurn + 1.5 },
];
/** The resting frame: waiting in the junction for the oncoming car to pass. */
export const STILL = tTurn + 0.28;

/* Other road users: each passes through once per loop at a steady pace. */
const circulatingTrack = track([
  linePts([-25, 320], [-25, 130]),
  curvePts([-25, 130], [-25, 105], ring(130, -14), ring(130)),
  arcPts([0, 0], RING, 130, 230),
  curvePts(ring(230), ring(230, 14), [-25, -105], [-25, -130]),
  linePts([-25, -130], [-25, -325]),
]);
const northboundTrack = track([linePts([BX - 25, 380], [BX - 25, -1100])]);
const southboundTrack = track([linePts([BX + 25, -1000], [BX + 25, 330])]);

/** `startAt` is the loop time at which the mover sets off. */
function mover(
  path: ReturnType<typeof track>,
  speed: number,
  startAt: number,
  fade = 0.3,
) {
  const duration = path.total / speed;
  return (t: number): Pose => {
    const k = mod(t - startAt, LOOP);
    if (k > duration) return { ...path.pose(0), opacity: 0 };
    return {
      ...path.pose(k * speed),
      opacity: clamp(Math.min(k, duration - k) / fade),
    };
  };
}
const walk = (from: Pt, to: Pt, startAt: number) =>
  mover(track([linePts(from, to)]), 22, startAt, 0.5);
const stand = (x: number, y: number, heading: number) => (): Pose => ({
  x,
  y,
  heading,
  opacity: 1,
});

export type Actor = Pose & {
  id: string;
  kind: "car" | "person" | "dog";
  /** 0–1: how firmly the car's perception has locked on. */
  seen: number;
  /** 0–1: this is the road user the car is currently giving way to. */
  focus: number;
  moving: boolean;
};

const RANGE = 330;
const cast: {
  id: string;
  kind: Actor["kind"];
  at: (t: number) => Pose;
  moving: boolean;
  /** Loop-time window in which the car is waiting on this road user. */
  yieldAt?: [number, number];
}[] = [
  {
    id: "circulating",
    kind: "car",
    moving: true,
    at: mover(
      circulatingTrack,
      200,
      tGive - 0.1 - (circulatingTrack.starts[2] + RING * rad(90)) / 200,
    ),
    yieldAt: [tGive - 1.0, tGive + 0.45],
  },
  {
    id: "crossing",
    kind: "car",
    moving: true,
    at: mover(northboundTrack, 250, tStop + 0.25 - 405 / 250),
    yieldAt: [tStop - 0.7, tStop + 0.55],
  },
  {
    id: "oncoming",
    kind: "car",
    moving: true,
    at: mover(southboundTrack, 250, tTurn + 0.35 - 560 / 250),
    yieldAt: [tTurn - 0.9, tTurn + 0.65],
  },
  {
    id: "walker",
    kind: "person",
    moving: true,
    at: walk([BX - 62, -DY - 84], [BX + 62, -DY - 84], tTurn + 0.4),
  },
  {
    id: "street",
    kind: "person",
    moving: true,
    at: walk([150, -62], [336, -62], tGive + 0.2),
  },
  {
    id: "uphill",
    kind: "person",
    moving: true,
    at: walk([BX - 62, -96], [BX - 62, -296], tStop + 0.2),
  },
  {
    id: "downhill",
    kind: "person",
    moving: true,
    at: walk([BX + 62, -330], [BX + 62, -130], tStop - 2),
  },
  {
    id: "couple-a",
    kind: "person",
    moving: false,
    at: stand(BX + 64, -66, 110),
  },
  {
    id: "couple-b",
    kind: "person",
    moving: false,
    at: stand(BX + 80, -58, 290),
  },
  {
    id: "waiting",
    kind: "person",
    moving: false,
    at: stand(BX - 66, -DY + 66, 20),
  },
  { id: "corner", kind: "person", moving: false, at: stand(-84, -86, 120) },
  { id: "kerb", kind: "person", moving: false, at: stand(92, -94, 220) },
];

export type Scene = {
  ego: Pose & {
    speed: number;
    /** Distance driven, for turning the wheels. */
    travelled: number;
    /** 0–1: slowing or stopped, so the brake lights show. */
    braking: number;
    /** 0–1: holding back for someone else. */
    hold: number;
    indicator: "left" | "right" | null;
  };
  actors: Actor[];
  /** The planned path ahead of the car. */
  route: Pt[];
  /** Where the car has just been, nearest first. */
  wake: Pt[];
  /** Index into `acts`, or −1 between them. */
  act: number;
  /** 0–1 progress through the current act. */
  actProgress: number;
};

const speedAt = (t: number) =>
  (egoDistance(t + 0.04) - egoDistance(t - 0.04)) / 0.08;
/** 0–1: the car is holding back for someone else. */
const holdAt = (t: number) => 1 - ramp(40, 150, speedAt(t));

/** What the camera follows: a smoothed car position, easing in while it waits. */
export function cameraAt(t: number) {
  let x = 0,
    y = 0,
    push = 0;
  for (let i = -4; i <= 4; i++) {
    const p = egoTrack.point(egoDistance(t + i * 0.14));
    x += p[0] / 9;
    y += p[1] / 9;
    push += holdAt(t + i * 0.2) / 9;
  }
  return { x, y, push };
}

/** Wheel turn per unit travelled, rounded so the spokes line up across the loop. */
export const WHEEL_TURN = (() => {
  const fifth = (Math.PI * 2) / 5;
  return (Math.round(egoTrack.total / 5.8 / fifth) * fifth) / egoTrack.total;
})();

export function sceneAt(time: number): Scene {
  const t = mod(time, LOOP);
  const s = ego.distanceAt(t);
  const speed = speedAt(t),
    before = speedAt(t - 0.12);
  const pose = egoTrack.pose(s);

  const within = (from: number, to: number) => s >= from && s <= to;
  const st = egoTrack.starts;
  const indicator =
    within(st[2] + 60, st[4] + 10) || within(STOP - 150, st[6] + 20)
      ? "left"
      : within(st[7] - 170, st[8] + 20)
        ? "right"
        : null;

  // The same cast plays in every copy of the city; keep the ones nearby.
  const actors: Actor[] = [];
  for (const member of cast) {
    const base = member.at(t);
    for (const lap of [-1, 0, 1]) {
      const x = base.x + lap * SHIFT[0],
        y = base.y + lap * SHIFT[1];
      const away = Math.hypot(x - pose.x, y - pose.y);
      if (away > 1000 || base.opacity <= 0) continue;
      // A copy one city ahead is the same road user, one loop later.
      const waiting = member.yieldAt,
        then = t - lap * LOOP;
      actors.push({
        ...base,
        x,
        y,
        id: lap ? `${member.id}${lap}` : member.id,
        kind: member.kind,
        moving: member.moving,
        seen: base.opacity * ramp(RANGE, RANGE - 70, away),
        focus: waiting
          ? ramp(waiting[0], waiting[0] + 0.3, then) *
            (1 - ramp(waiting[1], waiting[1] + 0.3, then))
          : 0,
      });
    }
  }

  const hold = holdAt(t);
  const reach = 70 + 190 * (1 - hold);
  const route: Pt[] = [];
  for (let d = 34; d <= reach; d += 10) route.push(egoTrack.point(s + d));
  const wake: Pt[] = [];
  for (let d = 38; d <= 38 + speed * 0.42; d += 8)
    wake.push(egoTrack.point(s - d));

  const act = acts.findIndex((a) => t >= a.from && t <= a.to);
  return {
    ego: {
      ...pose,
      opacity: 1,
      speed,
      travelled: s,
      braking: Math.max(ramp(15, 80, before - speed), 1 - ramp(4, 30, speed)),
      hold,
      indicator,
    },
    actors,
    route,
    wake,
    act,
    actProgress:
      act < 0 ? 0 : (t - acts[act].from) / (acts[act].to - acts[act].from),
  };
}
