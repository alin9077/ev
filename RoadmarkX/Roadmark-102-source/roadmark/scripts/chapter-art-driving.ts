/**
 * Automated-driving artwork: one looping plan-view scene in left-hand traffic.
 * The car gives way at a roundabout, stops at a stop sign, then waits for
 * oncoming traffic before an unprotected right turn, always tethered to a
 * driver's hands. Motion is sampled into CSS keyframes, so the SVG animates
 * as a plain image: offline, without script.
 */
import {
  DEEP,
  GREEN,
  INK,
  ORANGE,
  PAPER,
  SKY,
  brackets,
  carTop,
  ruler,
} from "./chapter-art-kit";

type Pt = [number, number];

const LOOP = 10,
  FRAMES = 120,
  STEP = LOOP / FRAMES;
/** Roundabout centre and circulating radius. */
const HUB: Pt = [330, 250],
  RING = 70;
/** Where the supervising driver sits, inside the block the route encloses. */
const DRIVER: Pt = [535, 450];
/** Objects closer than this are linked to the car by a perception line. */
const RANGE = 320;
const CAR = 0.56;

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const clamp = (v: number) => Math.min(1, Math.max(0, v));
const mod = (v: number, m: number) => ((v % m) + m) % m;
const n = (v: number, d = 1) => String(Number(v.toFixed(d)));

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
const ring = (a: number): Pt => [
  HUB[0] + RING * Math.cos(rad(a)),
  HUB[1] + RING * Math.sin(rad(a)),
];
/** A point `d` further round the ring's tangent at angle `a`. */
const tangent = (a: number, d: number): Pt => [
  ring(a)[0] - Math.sin(rad(a)) * d,
  ring(a)[1] + Math.cos(rad(a)) * d,
];

function track(parts: Pt[][], closed = false) {
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
    const d = closed ? mod(s, total) : Math.min(Math.max(s, 0), total);
    let lo = 0,
      hi = at.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (at[mid] <= d) lo = mid;
      else hi = mid;
    }
    const f = (d - at[lo]) / (at[hi] - at[lo] || 1);
    return [
      pts[lo][0] + (pts[hi][0] - pts[lo][0]) * f,
      pts[lo][1] + (pts[hi][1] - pts[lo][1]) * f,
    ];
  };
  /** Heading is the rotation that points a nose-up sprite along the track. */
  const pose = (s: number) => {
    const [x, y] = point(s),
      a = point(s - 3),
      b = point(s + 3);
    return { x, y, heading: deg(Math.atan2(b[0] - a[0], a[1] - b[1])) };
  };
  return { total, starts, pose };
}

/* The car's circuit: outer lane, clockwise, so every corner is a right turn. */
const egoTrack = track(
  [
    linePts([560, 675], [410, 675]),
    arcPts([410, 570], 105, 90, 180),
    linePts([305, 570], [305, 372]),
    curvePts([305, 372], [305, 352], tangent(125, -15), ring(125)),
    arcPts(HUB, RING, 125, 325),
    curvePts(ring(325), tangent(325, 15), [425, 225], [440, 225]),
    linePts([440, 225], [690, 225]),
    arcPts([690, 300], 75, 270, 360),
    linePts([765, 300], [765, 600]),
    arcPts([690, 600], 75, 0, 90),
    linePts([690, 675], [560, 675]),
  ],
  true,
);
const route = `M560 675H410A105 105 0 0 1 305 570V372C305 352 ${tangent(
  125,
  -15,
)
  .map((v) => n(v))
  .join(" ")} ${ring(125)
  .map((v) => n(v))
  .join(" ")}A${RING} ${RING} 0 1 1 ${ring(325)
  .map((v) => n(v))
  .join(" ")}C${tangent(325, 15)
  .map((v) => n(v))
  .join(" ")} 425 225 440 225H690A75 75 0 0 1 765 300V600A75 75 0 0 1 690 675Z`;

/** Where the car slows for the roundabout, stops at the line, and waits to turn. */
const GIVE_WAY = egoTrack.starts[2] + (570 - 402),
  STOP = egoTrack.starts[6] + (638 - 440),
  TURN = egoTrack.starts[9] + 75 * rad(6);

/**
 * Speed along the circuit: cruise on straights, ease through curves, crawl
 * into the roundabout, and hold at the two stops. Cruise speed is solved so
 * one lap takes exactly LOOP seconds and the loop has no seam.
 */
function schedule(cruise: number) {
  const ACC = 560,
    DEC = 640;
  const cells = Math.round(egoTrack.total),
    ds = egoTrack.total / cells;
  const limits = [0, 270, 0, 160, 200, 190, 0, 175, 0, 175, 0];
  const holds = new Map([
    [Math.round(STOP / ds), 0.6],
    [Math.round(TURN / ds), 0.7],
  ]);
  const cap = (s: number) => {
    let part = 0;
    while (part + 1 < egoTrack.starts.length && egoTrack.starts[part + 1] <= s)
      part += 1;
    if (part === 2 && s > egoTrack.starts[3] - 40) return 70;
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
  let lo = 120,
    hi = 700;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (schedule(mid).lap > LOOP) lo = mid;
    else hi = mid;
  }
  return schedule(hi);
}
const ego = solveSchedule();

/* Other road users: each crosses the scene once per loop at a steady pace. */
const roundaboutTrack = track([
  linePts([355, -330], [355, 150]),
  curvePts([355, 150], [355, 170], tangent(305, -12), ring(305)),
  arcPts(HUB, RING, 305, 505),
  curvePts(ring(145), tangent(145, 14), [238, 275], [222, 275]),
  linePts([222, 275], [-340, 275]),
]);
const northboundTrack = track([linePts([715, 1010], [715, -330])]);
const walkTrack = track([linePts([850, 586], [850, 714])]);

type Pose = { x: number; y: number; heading: number; opacity: number };
/** `startAt` is the loop time at which the mover sets off; windows snap to frames. */
function mover(path: ReturnType<typeof track>, speed: number, startAt: number) {
  const first = Math.round(startAt / STEP),
    frames = Math.ceil(path.total / speed / STEP),
    fade = 3;
  return (frame: number): Pose => {
    const k = mod(frame - first, FRAMES);
    if (k > frames) return { ...path.pose(0), opacity: 0 };
    return {
      ...path.pose(Math.min(k * STEP * speed, path.total)),
      opacity: clamp(Math.min(k, frames - k) / fade),
    };
  };
}
const fixed = (x: number, y: number) => (): Pose => ({
  x,
  y,
  heading: 0,
  opacity: 1,
});

const tStop = ego.timeAt(STOP),
  tTurn = ego.timeAt(TURN);
const circulating = mover(
  roundaboutTrack,
  190,
  ego.timeAt(GIVE_WAY) - (roundaboutTrack.starts[2] + RING * Math.PI) / 190,
);
const crossing = mover(northboundTrack, 250, tStop + 0.3 - 760 / 250);
const oncoming = mover(northboundTrack, 250, tTurn + 0.4 - 370 / 250);
const walker = mover(walkTrack, 128 / 6, tTurn - 2.5);

/** Everything the car perceives: a line to it, and corner marks around it. */
const targets: { id: string; at: (frame: number) => Pose }[] = [
  { id: "circulating", at: circulating },
  { id: "crossing", at: crossing },
  { id: "oncoming", at: oncoming },
  { id: "walker", at: walker },
  { id: "couple", at: fixed(821, 186) },
  { id: "bystander", at: fixed(228, 372) },
  { id: "waiting", at: fixed(640, 332) },
  { id: "stop-sign", at: fixed(668, 172) },
  { id: "signal", at: fixed(665, 558) },
];

/** The resting frame: stopped at the line while cross traffic passes. */
const STILL = Math.round((tStop + 0.3) / STEP);

type Channel = {
  id: string;
  /** CSS declarations per frame, for the keyframes. */
  css: string[];
  /** Presentation attributes for the resting frame. */
  attrs: string;
  hidden?: boolean[];
};
function keyframes(name: string, channel: Channel) {
  const { css, hidden } = channel;
  let out = "";
  css.forEach((decl, i) => {
    const flat = hidden
      ? hidden[i - 1] && hidden[i] && hidden[i + 1]
      : css[i - 1] === decl && css[i + 1] === decl;
    if (i === 0 || i === FRAMES || !flat)
      out += `${n((i / FRAMES) * 100, 2)}%{${decl}}`;
  });
  return `@keyframes ${name}{${out}}#${channel.id}{animation:${name} ${LOOP}s linear infinite}`;
}
/** Keeps a rotation continuous from frame to frame. */
function unwrap(angles: number[]) {
  for (let i = 1; i < angles.length; i++)
    angles[i] += Math.round((angles[i - 1] - angles[i]) / 360) * 360;
  return angles;
}
const frames = Array.from({ length: FRAMES + 1 }, (_, i) => i);

function placed(id: string, poses: Pose[], fades: boolean): Channel {
  const turn = unwrap(poses.map((p) => p.heading));
  return {
    id,
    css: poses.map(
      (p, i) =>
        `transform:translate(${n(p.x)}px,${n(p.y)}px) rotate(${n(turn[i])}deg)${fades ? `;opacity:${n(p.opacity, 2)}` : ""}`,
    ),
    attrs: `transform="translate(${n(poses[STILL].x)} ${n(poses[STILL].y)}) rotate(${n(turn[STILL])})"${fades ? ` opacity="${n(poses[STILL].opacity, 2)}"` : ""}`,
    hidden: fades ? poses.map((p) => p.opacity === 0) : undefined,
  };
}
/** A unit-length bar stretched from `from` to `to` on every frame. */
function link(id: string, from: Pt[], to: Pt[], opacity?: number[]): Channel {
  const turn = unwrap(
      from.map((a, i) => deg(Math.atan2(to[i][1] - a[1], to[i][0] - a[0]))),
    ),
    reach = from.map((a, i) =>
      Math.max(1, Math.hypot(to[i][0] - a[0], to[i][1] - a[1])),
    );
  return {
    id,
    css: from.map(
      (a, i) =>
        `transform:translate(${n(a[0])}px,${n(a[1])}px) rotate(${n(turn[i])}deg) scaleX(${n(reach[i])})${opacity ? `;opacity:${n(opacity[i], 2)}` : ""}`,
    ),
    attrs: `transform="translate(${n(from[STILL][0])} ${n(from[STILL][1])}) rotate(${n(turn[STILL])}) scale(${n(reach[STILL])} 1)"${opacity ? ` opacity="${n(opacity[STILL], 2)}"` : ""}`,
    hidden: opacity?.map((o) => o === 0),
  };
}
function faded(id: string, opacity: number[]): Channel {
  return {
    id,
    css: opacity.map((o) => `opacity:${n(o, 2)}`),
    attrs: `opacity="${n(opacity[STILL], 2)}"`,
  };
}

const person = (x: number, y: number) =>
  `<circle cx="${x}" cy="${y}" r="8" fill="${INK}"/>`;

/** `frame` is the canvas edge in scene units; the streets run off it. */
export function automatedDriving(
  _format: "desktop" | "mobile",
  frame: { left: number; top: number; right: number; bottom: number },
) {
  const { left, top, right, bottom } = frame;

  const egoPoses = frames.map((i): Pose => ({
    ...egoTrack.pose(ego.distanceAt(i * STEP)),
    opacity: 1,
  }));
  const egoAt = egoPoses.map((p): Pt => [p.x, p.y]);
  const channels: Channel[] = [placed("vehicle", egoPoses, false)];
  channels.push(
    link(
      "tether",
      frames.map(() => DRIVER),
      egoAt,
    ),
  );
  const marks: Record<string, string> = {};
  let lines = "";
  for (const target of targets) {
    const poses = frames.map(target.at);
    const seen = poses.map((p, i) =>
      clamp((RANGE - Math.hypot(p.x - egoAt[i][0], p.y - egoAt[i][1])) / 60),
    );
    const beam = link(
      `line-${target.id}`,
      egoAt,
      poses.map((p): Pt => [p.x, p.y]),
      seen.map((s, i) => s * poses[i].opacity),
    );
    const mark = faded(`seen-${target.id}`, seen);
    channels.push(beam, mark);
    lines += `<rect id="${beam.id}" y="-1.75" width="1" height="3.5" ${beam.attrs}/>`;
    marks[target.id] = mark.attrs;
  }
  const movers = {
    circulating: placed("circulating", frames.map(circulating), true),
    crossing: placed("crossing", frames.map(crossing), true),
    oncoming: placed("oncoming", frames.map(oncoming), true),
    walker: placed("walker", frames.map(walker), true),
  };
  channels.push(...Object.values(movers));

  const otherCar = (id: keyof typeof movers) =>
    `<g id="${id}" ${movers[id].attrs}>
      ${carTop(0, 0, 0, CAR, DEEP, SKY)}
      <g id="seen-${id}" ${marks[id]}>${brackets(-23, -42, 46, 84, 10)}</g>
    </g>`;
  const fan = (r: number) =>
    `M${n(-r * 0.574)} ${n(-30 - r * 0.819)}A${r} ${r} 0 0 1 ${n(r * 0.574)} ${n(-30 - r * 0.819)}`;
  let zebra = "";
  for (let y = 606; y <= 686; y += 16)
    zebra += `<rect x="828" y="${y}" width="44" height="8" fill="${SKY}"/>`;
  const octagon = Array.from({ length: 8 }, (_, i) => {
    const a = rad(22.5 + i * 45);
    return `${n(668 + 20 * Math.cos(a))} ${n(172 + 20 * Math.sin(a))}`;
  }).join(" ");

  const body = `
  <g transform="translate(0 ${bottom - 900})">${ruler(left + 30, right - 30, 0.55)}</g>
  <g id="road-network" fill="none" stroke="${PAPER}" stroke-width="100">
    <path d="M330 250V570A80 80 0 0 0 410 650H${right}"/>
    <path d="M330 250H740M740 ${top}V${bottom}M330 ${top}V250M${left} 250H330"/>
  </g>
  <g id="lane-marks" fill="none" stroke="${SKY}" stroke-width="3" stroke-dasharray="16 20">
    <path d="M330 372V570A80 80 0 0 0 410 650H690M436 250H690M740 200V${top}M740 300V600M740 700V${bottom}M790 650H${right}M330 140V${top}M222 250H${left}"/>
  </g>
  <g id="roundabout">
    <circle cx="${HUB[0]}" cy="${HUB[1]}" r="105" fill="${PAPER}"/>
    <circle cx="${HUB[0]}" cy="${HUB[1]}" r="36" fill="${SKY}"/>
    <circle cx="${HUB[0]}" cy="${HUB[1]}" r="15" fill="${GREEN}"/>
    <path d="M282 360H328" stroke="${INK}" stroke-width="4" stroke-dasharray="8 6"/>
  </g>
  <g id="stop-sign">
    <path d="M680 200V250" stroke="${INK}" stroke-width="6"/>
    <polygon points="${octagon}" fill="${ORANGE}" stroke="${INK}" stroke-width="3"/>
    <g id="seen-stop-sign" ${marks["stop-sign"]}>${brackets(640, 144, 56, 56, 9)}</g>
  </g>
  <g id="signalised-turn">
    <path d="M740 592H790M690 708H740" stroke="${INK}" stroke-width="5"/>
    <rect x="650" y="522" width="30" height="72" rx="15" fill="${INK}"/>
    <circle cx="665" cy="540" r="6.5" fill="${DEEP}"/>
    <circle cx="665" cy="558" r="6.5" fill="${DEEP}"/>
    <circle cx="665" cy="576" r="6.5" fill="${GREEN}"/>
    <g id="seen-signal" ${marks.signal}>${brackets(640, 512, 50, 92, 9)}</g>
  </g>
  <g id="crossing">${zebra}</g>
  <path id="route" d="${route}" fill="none" stroke="${INK}" stroke-width="3"/>
  <g id="perception" fill="${DEEP}">${lines}</g>
  <rect id="tether" y="-2" width="1" height="4" fill="${INK}" ${channels[1].attrs}/>
  <g id="people">
    ${person(812, 182)}${person(831, 191)}
    <g id="seen-couple" ${marks.couple}>${brackets(796, 166, 51, 41, 8)}</g>
    ${person(228, 372)}
    <g id="seen-bystander" ${marks.bystander}>${brackets(212, 356, 32, 32, 8)}</g>
    ${person(640, 332)}
    <g id="seen-waiting" ${marks.waiting}>${brackets(624, 316, 32, 32, 8)}</g>
    <g id="walker" ${movers.walker.attrs}>
      <path d="M4 6 16 12" stroke="${INK}" stroke-width="2"/>
      ${person(0, 0)}
      <ellipse cx="18" cy="16" rx="4.5" ry="9" fill="${INK}"/>
      <circle cx="18" cy="27" r="4" fill="${INK}"/>
      <g id="seen-walker" ${marks.walker}>${brackets(-15, -15, 46, 54, 8)}</g>
    </g>
  </g>
  <g id="other-road-users">
    ${otherCar("circulating")}${otherCar("crossing")}${otherCar("oncoming")}
  </g>
  <g id="vehicle" ${channels[0].attrs}>
    <path d="${fan(30)}${fan(46)}" fill="none" stroke="${INK}" stroke-width="2.5"/>
    ${carTop(0, 0, 0, CAR, INK, SKY)}
  </g>
  <g id="driver-supervision" transform="translate(${DRIVER[0]} ${DRIVER[1]})">
    <circle r="84" fill="${PAPER}"/>
    <circle r="46" fill="none" stroke="${DEEP}" stroke-width="11"/>
    <path d="M-44 6H44M0 6V42" stroke="${DEEP}" stroke-width="9"/>
    <circle cy="4" r="13" fill="${DEEP}"/>
    <path d="M21.6-40.6A46 46 0 0 1 36.2-28.3M-21.6-40.6A46 46 0 0 0-36.2-28.3" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
  </g>`;

  // No reduced-motion rule in here: as an image the SVG cannot read the
  // viewer's preference reliably, so the page swaps in the still file instead.
  const style = channels
    .map((channel, i) => keyframes(`k${i}`, channel))
    .join("");
  return { body, style };
}
