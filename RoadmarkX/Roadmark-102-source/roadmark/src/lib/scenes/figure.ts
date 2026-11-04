/**
 * People and a dog for the chapter scenes: jointed figures built in three
 * dimensions and projected like everything else, so they turn, walk and reach
 * correctly from any side. Pictograms with enough detail to read as people:
 * hair that shows which way they face, sleeves, hands, shoes and a stride.
 */
import {
  TAU,
  clamp,
  direction,
  hex,
  hull,
  lerp,
  mix,
  noise,
  rgba,
  type Ctx,
  type P3,
  type Pt,
  type Rgb,
  type View,
} from "./kit";

export type Look = {
  skin: Rgb;
  hair: Rgb;
  top: Rgb;
  bottom: Rgb;
  shoes?: Rgb;
  /** 1 is an adult about 1.7 m tall. */
  scale?: number;
  hairStyle?: "short" | "long" | "bun" | "cap";
  sleeves?: "long" | "short";
  legs?: "long" | "short" | "skirt";
  /** A backpack, in this colour. */
  pack?: Rgb;
};
export type Person = {
  x: number;
  y: number;
  /** Degrees clockwise from north (−y). */
  heading: number;
  z?: number;
  look: Look;
  /** Distance walked so far, which drives the stride so feet do not slide. */
  walked?: number;
  /** 0 standing – 1 walking. */
  pace?: number;
  /** Seconds, for breathing and small shifts of weight. */
  time?: number;
  /** Where a hand should be, in the world; otherwise it hangs or swings. */
  reachRight?: P3;
  reachLeft?: P3;
  /** What the right hand holds. */
  holds?: "phone" | "bag" | null;
  holdColour?: Rgb;
  /** 0–1: the right arm raised in a wave. */
  wave?: number;
  opacity?: number;
};

const SKIN = ["#f0c8a0", "#d9a273", "#b97d54", "#8a5a3c", "#5f3d2b"].map(hex),
  HAIR = ["#1d1a19", "#3b2a20", "#6b4a2f", "#a8793f", "#8d9296"].map(hex),
  TOPS = ["#e8452c", "#f1cf50", "#2f6f8f", "#f5f5f0", "#3d6b56", "#eca266"].map(
    hex,
  ),
  BOTTOMS = ["#22323a", "#3a4a66", "#6b6f72", "#c8b89a", "#172326"].map(hex);
/** A varied, repeatable person for a seed: the crowd in a street. */
export function lookFor(seed: number, scale = 1): Look {
  const pick = <T>(list: T[], salt: number) =>
    list[Math.floor(noise(seed * 7.13 + salt) * list.length) % list.length];
  return {
    skin: pick(SKIN, 1),
    hair: pick(HAIR, 2),
    top: pick(TOPS, 3),
    bottom: pick(BOTTOMS, 4),
    scale: scale * (0.94 + 0.12 * noise(seed + 5)),
    hairStyle: pick(["short", "long", "bun", "short", "cap"] as const, 6),
    sleeves: noise(seed + 7) > 0.5 ? "short" : "long",
    legs: pick(["long", "long", "short", "skirt"] as const, 8),
  };
}

/** Turns from one heading to another the short way round. */
export const turn = (from: number, to: number, f: number) =>
  from + (((((to - from) % 360) + 540) % 360) - 180) * f;
/**
 * Someone walking a path between two moments: where they are, which way they
 * face, and how far they have come, so their stride matches the ground.
 */
export function stroll(points: Pt[], from: number, to: number, t: number) {
  const u = clamp((t - from) / (to - from || 1));
  // Mostly a steady pace, with a soft start and stop.
  const f = 0.6 * u + 0.4 * u * u * (3 - 2 * u);
  const lengths = points.map((p, i) =>
    i ? Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) : 0,
  );
  const total = lengths.reduce((a, b) => a + b, 0);
  const at = (g: number): Pt => {
    let d = clamp(g) * total;
    for (let i = 1; i < points.length; i++) {
      if (d <= lengths[i] || i === points.length - 1) {
        const h = lengths[i] ? clamp(d / lengths[i]) : 0;
        return [
          lerp(points[i - 1][0], points[i][0], h),
          lerp(points[i - 1][1], points[i][1], h),
        ];
      }
      d -= lengths[i];
    }
    return points[0];
  };
  const [x, y] = at(f),
    a = at(f - 0.03),
    b = at(f + 0.03);
  return {
    x,
    y,
    heading: (Math.atan2(b[0] - a[0], a[1] - b[1]) * 180) / Math.PI,
    walked: total * f,
    pace: clamp(u / 0.1) * clamp((1 - u) / 0.1),
  };
}

/** Proportions, in scene units for an adult: about 16 to the metre. */
const THIGH = 6.6,
  SHIN = 6,
  TORSO = 8.6,
  SHOULDER = 3.3;
/** Ground covered by one full stride, left foot to left foot. */
export const STRIDE = 14.4;

type Joints = {
  hips: P3[];
  knees: P3[];
  ankles: P3[];
  toes: P3[];
  shoulders: P3[];
  elbows: P3[];
  wrists: P3[];
  neck: P3;
  head: P3;
  /** The person's own axes on the ground: forwards, and to their right. */
  forward: Pt;
  right: Pt;
  scale: number;
};

const add = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const times = (a: P3, f: number): P3 => [a[0] * f, a[1] * f, a[2] * f];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: P3): P3 => times(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

/** Index 0 is the right side, 1 the left. */
function skeleton(person: Person): Joints {
  const s = person.look.scale ?? 1;
  const [dx, dy] = direction(person.heading);
  const base = person.z ?? 0;
  const pace = clamp(person.pace ?? (person.walked === undefined ? 0 : 1));
  const phase = ((person.walked ?? 0) / (STRIDE * s)) * TAU;
  const time = person.time ?? 0,
    seed = noise(person.x * 0.37 + person.y * 0.11);
  // Standing still, a person still breathes and shifts their weight.
  const sway = (1 - pace) * 0.28 * Math.sin(time * 0.9 + seed * 6) * s,
    breath = (1 - pace) * 0.1 * Math.sin(time * 1.7 + seed * 9) * s;
  /** Forwards, to the right, up: the figure's own space. */
  const world = (f: number, r: number, z: number): P3 => [
    person.x + dx * f - dy * r,
    person.y + dy * f + dx * r,
    base + z,
  ];
  const legs = [0, 1].map((i) => {
    const angle = phase + (i ? Math.PI : 0);
    const swing = 0.29 * pace * Math.sin(angle);
    const bend =
      0.04 + pace * (0.03 + 0.62 * Math.max(0, Math.cos(angle + 0.55)) ** 1.5);
    return {
      swing,
      bend,
      reach: THIGH * Math.cos(swing) + SHIN * Math.cos(swing - bend),
    };
  });
  // The planted foot sets the height of the hips: that is the bob in a walk.
  const hipZ = (1.3 + Math.max(legs[0].reach, legs[1].reach)) * s;
  const hipTwist = -0.1 * pace * Math.sin(phase),
    twist = 0.22 * pace * Math.sin(phase),
    lean = 0.05 * pace;
  const joints: Joints = {
    hips: [],
    knees: [],
    ankles: [],
    toes: [],
    shoulders: [],
    elbows: [],
    wrists: [],
    neck: [0, 0, 0],
    head: [0, 0, 0],
    forward: [dx, dy],
    right: [-dy, dx],
    scale: s,
  };
  legs.forEach(({ swing, bend }, i) => {
    const side = i ? -1 : 1;
    const hf = -side * 1.75 * s * Math.sin(hipTwist),
      hr = side * 1.75 * s * Math.cos(hipTwist) + sway * 0.5;
    const kf = hf + THIGH * s * Math.sin(swing),
      kz = hipZ - THIGH * s * Math.cos(swing);
    const af = kf + SHIN * s * Math.sin(swing - bend),
      az = kz - SHIN * s * Math.cos(swing - bend);
    const pitch = clamp(bend * 0.7 - Math.max(0, swing) * 0.5, -0.25, 0.8);
    joints.hips.push(world(hf, hr, hipZ));
    joints.knees.push(world(kf, hr + side * 0.15 * s, kz));
    joints.ankles.push(world(af, hr, az));
    joints.toes.push(
      world(
        af + 2.3 * s * Math.cos(pitch),
        hr + side * 0.25 * s,
        Math.max(0.45 * s, az - 2.3 * s * Math.sin(pitch) - 0.5 * s),
      ),
    );
  });
  const chestF = TORSO * s * Math.sin(lean),
    chestZ = hipZ + TORSO * s * Math.cos(lean) + breath;
  const reaches = [person.reachRight, person.reachLeft];
  for (const i of [0, 1]) {
    const side = i ? -1 : 1;
    const shoulder = world(
      chestF - side * SHOULDER * s * Math.sin(twist),
      side * SHOULDER * s * Math.cos(twist) + sway,
      chestZ,
    );
    joints.shoulders.push(shoulder);
    const upper = 4.7 * s,
      fore = 4.4 * s;
    const target = reaches[i];
    if (target) {
      // Two bones to a point: the elbow drops below and behind the line.
      const to = sub(target, shoulder);
      const far = clamp(
        Math.hypot(...to),
        Math.abs(upper - fore) + 0.05,
        upper + fore - 0.05,
      );
      const aim = unit(to);
      const bendAt = Math.acos(
        clamp(
          (upper * upper + far * far - fore * fore) / (2 * upper * far),
          -1,
          1,
        ),
      );
      const pole: P3 = [
        -dx * 0.4 - dy * side * 0.3,
        -dy * 0.4 + dx * side * 0.3,
        -1,
      ];
      const off = unit(sub(pole, times(aim, dot(pole, aim))));
      joints.elbows.push(
        add(
          shoulder,
          add(
            times(aim, Math.cos(bendAt) * upper),
            times(off, Math.sin(bendAt) * upper),
          ),
        ),
      );
      joints.wrists.push(add(shoulder, times(aim, far)));
      continue;
    }
    const angle = phase + (i ? 0 : Math.PI);
    const wave = i ? 0 : clamp(person.wave ?? 0);
    const swing = lerp(0.36 * pace * Math.sin(angle), 2.6, wave),
      bend =
        lerp(0.2 + 0.3 * pace * (0.5 + 0.5 * Math.sin(angle)), 0.5, wave) +
        wave * 0.35 * Math.sin(time * 9);
    const sf = chestF - side * SHOULDER * s * Math.sin(twist),
      sr = side * SHOULDER * s * Math.cos(twist) + sway;
    const ef = sf + upper * Math.sin(swing),
      ez = chestZ - upper * Math.cos(swing);
    joints.elbows.push(world(ef, sr + side * (0.55 + 0.8 * wave) * s, ez));
    joints.wrists.push(
      world(
        ef + fore * Math.sin(swing + bend),
        sr + side * (0.75 + 1.2 * wave) * s,
        ez - fore * Math.cos(swing + bend),
      ),
    );
  }
  joints.neck = world(chestF + 0.15 * s, sway, chestZ + 1.1 * s);
  joints.head = world(chestF + 0.45 * s, sway, chestZ + 3.55 * s);
  return joints;
}

/** Where a person's shadow falls. */
export function personShadow(view: View, person: Person): Pt[] {
  const j = skeleton(person);
  const [sx, sy] = view.sun;
  const r = 0.8 * j.scale;
  const points: Pt[] = [];
  for (const [x, y, z] of [
    ...j.toes,
    ...j.ankles,
    ...j.hips,
    ...j.shoulders,
    ...j.wrists,
    add(j.head, [0, 0, 1.6 * j.scale]),
  ])
    for (const [ox, oy] of [
      [r, 0],
      [-r, 0],
      [0, r],
      [0, -r],
    ])
      points.push([x + sx * z + ox, y + sy * z + oy]);
  return hull(points);
}

/**
 * Paints a person and reports where their hands and head ended up, so a scene
 * can put a lead, a phone's signal or a bag there.
 */
export function drawPerson(ctx: Ctx, view: View, person: Person) {
  const j = skeleton(person);
  const { look } = person;
  const { k, day } = view;
  const s = j.scale;
  const at = (p: P3) => view.at(p[0], p[1], p[2]);
  // By night, colour drains towards moonlit blue-grey.
  const tone = (c: Rgb, f = 1): Rgb =>
    mix(mix(c, [140, 168, 190], 0.42), c, day).map(
      (v) => v * f * (0.86 + 0.14 * day),
    ) as Rgb;
  const [fx, fy] = j.forward,
    [rx, ry] = j.right;
  /** Index of the side nearer the viewer. */
  const near = rx + ry > 0 ? 0 : 1,
    far = 1 - near;
  const towards = fx + fy > 0;
  ctx.globalAlpha = clamp(person.opacity ?? 1);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const limb = (a: P3, b: P3, width: number, colour: Rgb) => {
    ctx.strokeStyle = rgba(colour);
    ctx.lineWidth = Math.max(view.unit, width * s * k);
    ctx.beginPath();
    ctx.moveTo(...at(a));
    ctx.lineTo(...at(b));
    ctx.stroke();
  };
  const dotAt = (p: P3, r: number, colour: Rgb) => {
    const [x, y] = at(p);
    ctx.fillStyle = rgba(colour);
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5 * view.unit, r * s * k), 0, TAU);
    ctx.fill();
  };
  const skin = tone(look.skin),
    top = tone(look.top),
    bottom = tone(look.bottom),
    shoes = tone(look.shoes ?? [28, 32, 36]);
  const arm = (i: number, shade: number) => {
    const sleeve = lit(top, shade),
      bare = lit(skin, shade);
    limb(j.shoulders[i], j.elbows[i], 2.05, sleeve);
    limb(
      j.elbows[i],
      j.wrists[i],
      1.6,
      look.sleeves === "short" ? bare : sleeve,
    );
    dotAt(j.wrists[i], 1.05, bare);
  };
  const leg = (i: number, shade: number) => {
    const cloth = lit(bottom, shade),
      bare = lit(skin, shade);
    const shorts = look.legs === "short" || look.legs === "skirt";
    limb(j.ankles[i], j.toes[i], 1.85, lit(shoes, shade));
    limb(j.knees[i], j.ankles[i], 2.1, shorts ? bare : cloth);
    limb(j.hips[i], j.knees[i], 2.75, look.legs === "skirt" ? bare : cloth);
  };
  const pack = () => {
    if (!look.pack) return;
    const mid = (a: P3, b: P3, f: number): P3 => [
      lerp(a[0], b[0], f),
      lerp(a[1], b[1], f),
      lerp(a[2], b[2], f),
    ];
    const back = (p: P3): P3 => [
      p[0] - fx * 1.9 * s,
      p[1] - fy * 1.9 * s,
      p[2],
    ];
    const upper = back(mid(j.shoulders[0], j.shoulders[1], 0.5)),
      lower = back(mid(j.hips[0], j.hips[1], 0.5));
    limb(
      [upper[0], upper[1], upper[2] - 0.8 * s],
      [lower[0], lower[1], lower[2] + 1.6 * s],
      4.3,
      tone(look.pack),
    );
  };

  arm(far, 0.84);
  leg(far, 0.84);
  leg(near, 1);
  if (towards) pack();
  // The torso: shoulders to hips, with rounded corners.
  ctx.fillStyle = rgba(top);
  ctx.strokeStyle = rgba(top);
  ctx.lineWidth = Math.max(view.unit, 2.6 * s * k);
  ctx.beginPath();
  for (const p of [j.shoulders[0], j.shoulders[1], j.hips[1], j.hips[0]])
    ctx.lineTo(...at(p));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (look.legs === "skirt") {
    // A skirt hangs from the hips to just above the knee.
    ctx.fillStyle = rgba(bottom);
    ctx.strokeStyle = rgba(bottom);
    ctx.lineWidth = Math.max(view.unit, 1.6 * s * k);
    const hem = (i: number): P3 => [
      lerp(j.hips[i][0], j.knees[i][0], 0.72) +
        j.right[0] * (i ? -0.9 : 0.9) * s,
      lerp(j.hips[i][1], j.knees[i][1], 0.72) +
        j.right[1] * (i ? -0.9 : 0.9) * s,
      lerp(j.hips[i][2], j.knees[i][2], 0.72),
    ];
    ctx.beginPath();
    for (const p of [j.hips[0], j.hips[1], hem(1), hem(0)])
      ctx.lineTo(...at(p));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // A belt line where the two colours meet.
    limb(j.hips[0], j.hips[1], 2.75, bottom);
  }
  if (!towards) pack();

  if (towards) {
    // An open collar: a notch of skin below the neck.
    const mid: P3 = [
      (j.shoulders[0][0] + j.shoulders[1][0]) / 2,
      (j.shoulders[0][1] + j.shoulders[1][1]) / 2,
      j.shoulders[0][2],
    ];
    const [cx, cy] = at(mid);
    ctx.fillStyle = rgba(skin);
    ctx.beginPath();
    ctx.moveTo(cx - 1.1 * s * k, cy - 0.9 * s * k);
    ctx.lineTo(cx + 1.1 * s * k, cy - 0.9 * s * k);
    ctx.lineTo(cx, cy + 1.3 * s * k);
    ctx.fill();
  }
  // Head: hair behind and above, the face towards where they look.
  limb(j.neck, j.head, 1.5, skin);
  const child = s < 0.8 ? 1.22 : 1;
  const r = 2.3 * child;
  const [hx, hy] = at(j.head);
  const faceX = (fx - fy) * 0.5,
    faceY = (fx + fy) * 0.3;
  const hair = tone(look.hair);
  const disc = (ox: number, oy: number, radius: number, colour: Rgb) => {
    ctx.fillStyle = rgba(colour);
    ctx.beginPath();
    ctx.arc(hx + ox * s * k, hy + oy * s * k, radius * s * k, 0, TAU);
    ctx.fill();
  };
  if (look.hairStyle === "long")
    limb(
      [j.head[0] - fx * 1.1 * s, j.head[1] - fy * 1.1 * s, j.head[2]],
      [j.neck[0] - fx * 1.5 * s, j.neck[1] - fy * 1.5 * s, j.neck[2] - 0.6 * s],
      2.6,
      hair,
    );
  if (towards) {
    disc(-faceX * 0.5, -faceY * 0.6 - 0.35, r * 1.04, hair);
    disc(faceX * 0.55, faceY * 0.7 + 0.3, r * 0.86, skin);
  } else {
    disc(faceX * 0.7, faceY * 0.8 + 0.1, r * 0.9, skin);
    disc(-faceX * 0.25, -faceY * 0.4 - 0.25, r * 1.04, hair);
  }
  if (fx + fy > 0.55 && r * s * k > 6 * view.unit) {
    // Close enough to see: two eyes, set across the way they face.
    const ax = (rx - ry) * 0.42,
      ay = (rx + ry) * 0.24;
    ctx.fillStyle = rgba(tone([32, 28, 30]));
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        hx + (faceX * 0.95 + side * ax * 1.9) * s * k,
        hy + (faceY * 1.1 + 0.35 + side * ay * 1.9) * s * k,
        0.24 * s * k,
        0,
        TAU,
      );
      ctx.fill();
    }
  }
  if (look.hairStyle === "bun")
    disc(-faceX * 1.5, -faceY * 1.2 - 1.9, r * 0.5, hair);
  if (look.hairStyle === "cap") {
    // A cap: crown, then a peak out over the face.
    disc(0, -0.75, r * 0.98, top);
    limb(
      [
        j.head[0] + fx * 0.6 * s,
        j.head[1] + fy * 0.6 * s,
        j.head[2] + 0.75 * s,
      ],
      [j.head[0] + fx * 3 * s, j.head[1] + fy * 3 * s, j.head[2] + 0.55 * s],
      1.1,
      top,
    );
  }

  arm(near, 1);
  // What the right hand holds.
  const hand = j.wrists[0];
  if (person.holds === "phone") {
    const [px, py] = at([
      hand[0] + fx * 0.6 * s,
      hand[1] + fy * 0.6 * s,
      hand[2] + 1.2 * s,
    ]);
    const w = 1.5 * s * k,
      h = 2.9 * s * k;
    ctx.fillStyle = rgba(tone([24, 30, 34]));
    ctx.beginPath();
    ctx.roundRect(px - w / 2, py - h / 2, w, h, 0.3 * s * k);
    ctx.fill();
    ctx.fillStyle = rgba(
      mix(person.holdColour ?? [220, 232, 238], [255, 255, 255], 0.3),
    );
    ctx.beginPath();
    ctx.roundRect(px - w * 0.36, py - h * 0.4, w * 0.72, h * 0.8, 0.2 * s * k);
    ctx.fill();
  }
  if (person.holds === "bag") {
    const colour = tone(person.holdColour ?? [236, 162, 102]);
    const low: P3 = [hand[0], hand[1], hand[2] - 5.2 * s];
    limb(hand, [hand[0], hand[1], hand[2] - 1.8 * s], 0.5, lit(colour, 0.7));
    limb([low[0], low[1], low[2] + 2.9 * s], low, 4.2, colour);
  }
  ctx.lineCap = "butt";
  ctx.globalAlpha = 1;
  return { head: j.head, right: j.wrists[0], left: j.wrists[1], scale: s };
}
const lit = (c: Rgb, f: number): Rgb => [c[0] * f, c[1] * f, c[2] * f];

export type Dog = {
  x: number;
  y: number;
  heading: number;
  walked?: number;
  pace?: number;
  time?: number;
  colour?: Rgb;
  opacity?: number;
};
export function dogShadow(view: View, dog: Dog): Pt[] {
  const [dx, dy] = direction(dog.heading);
  const [sx, sy] = view.sun;
  return hull(
    [
      [6.5, 2, 0],
      [6.5, -2, 0],
      [-6, 2, 0],
      [-6, -2, 0],
      [7, 0, 9],
      [-5, 0, 7],
    ].map(([f, r, z]): Pt => [
      dog.x + dx * f - dy * r + sx * z,
      dog.y + dy * f + dx * r + sy * z,
    ]),
  );
}
/** A dog at a trot; returns where its collar is, for the lead. */
export function drawDog(ctx: Ctx, view: View, dog: Dog): P3 {
  const [dx, dy] = direction(dog.heading);
  const { k, day } = view;
  const pace = clamp(dog.pace ?? (dog.walked === undefined ? 0 : 1));
  const phase = ((dog.walked ?? 0) / 11) * TAU,
    time = dog.time ?? 0;
  const world = (f: number, r: number, z: number): P3 => [
    dog.x + dx * f - dy * r,
    dog.y + dy * f + dx * r,
    z,
  ];
  const at = (p: P3) => view.at(p[0], p[1], p[2]);
  const base = dog.colour ?? [176, 132, 92];
  const coat = (f: number): Rgb =>
    mix(mix(base, [112, 142, 166], 0.5), base, day).map(
      (v) => v * f * (0.66 + 0.34 * day),
    ) as Rgb;
  const near = dx - dy > 0 ? 1 : -1;
  ctx.globalAlpha = clamp(dog.opacity ?? 1);
  ctx.lineCap = "round";
  const limb = (a: P3, b: P3, width: number, colour: Rgb) => {
    ctx.strokeStyle = rgba(colour);
    ctx.lineWidth = Math.max(view.unit, width * k);
    ctx.beginPath();
    ctx.moveTo(...at(a));
    ctx.lineTo(...at(b));
    ctx.stroke();
  };
  const bob = 0.35 * pace * Math.sin(phase * 2);
  const leg = (f: number, side: number, offset: number, shade: number) => {
    // A trot: diagonal pairs move together.
    const swing = 0.55 * pace * Math.sin(phase + offset);
    const lift = pace * Math.max(0, Math.cos(phase + offset)) * 1.1;
    const knee = world(f + Math.sin(swing) * 1.6, side * 1.5, 3 + lift * 0.5);
    limb(world(f, side * 1.5, 5.6 + bob), knee, 1.5, coat(shade));
    limb(
      knee,
      world(f + Math.sin(swing) * 3.4, side * 1.5, 0.6 + lift),
      1.2,
      coat(shade),
    );
  };
  leg(4.2, -near, 0, 0.78);
  leg(-4, -near, Math.PI, 0.78);
  // Tail, wagging.
  limb(
    world(-5.2, 0, 7 + bob),
    world(-7.6, Math.sin(time * 9) * 1.3, 9.6 + bob),
    1.1,
    coat(0.92),
  );
  limb(world(-4.4, 0, 6.6 + bob), world(4.6, 0, 6.9 + bob), 4.6, coat(1));
  leg(4.2, near, Math.PI, 1);
  leg(-4, near, 0, 1);
  // Neck, head, muzzle and an ear.
  const head = world(7.3, 0, 9.6 + bob);
  limb(world(4.8, 0, 7.6 + bob), head, 2.7, coat(1));
  limb(head, world(9.6, 0, 8.9 + bob), 1.9, coat(0.94));
  limb(
    world(6.9, near * 1.1, 10.6 + bob),
    world(6.3, near * 1.5, 8.6 + bob),
    1.2,
    coat(0.7),
  );
  const [nx, ny] = at(world(10.4, 0, 8.9 + bob));
  ctx.fillStyle = rgba(coat(0.3));
  ctx.beginPath();
  ctx.arc(nx, ny, 0.5 * k, 0, TAU);
  ctx.fill();
  const collar = world(5.6, 0, 8.6 + bob);
  limb(
    world(5.5, -1.2, 8.3 + bob),
    world(5.5, 1.2, 8.3 + bob),
    0.8,
    [232, 69, 44],
  );
  ctx.lineCap = "butt";
  ctx.globalAlpha = 1;
  return collar;
}

/**
 * A person as a plain pictogram: a round head over one tapering body, with no
 * limbs to animate. Used wherever someone only needs to be there, such as the
 * people a car must notice; walking is a gentle bob.
 */
export type Token = {
  x: number;
  y: number;
  /** Body colour; the head takes a paler tint of it. */
  colour: Rgb;
  /** 1 is an adult about 1.7 m tall. */
  scale?: number;
  /** Seconds, and whether they are walking. */
  time?: number;
  moving?: boolean;
  opacity?: number;
};
export function drawToken(ctx: Ctx, view: View, token: Token) {
  const opacity = clamp(token.opacity ?? 1);
  if (opacity <= 0.01) return;
  const s = token.scale ?? 1,
    { k, night } = view;
  const bob = token.moving
    ? 0.5 * Math.abs(Math.sin((token.time ?? 0) * 5.4 + token.x * 0.3))
    : 0;
  const [fx, fy] = view.at(token.x, token.y, 0),
    [, sy] = view.at(token.x, token.y, (19.5 + bob) * s),
    [, hy] = view.at(token.x, token.y, (24.6 + bob) * s);
  // By night, colour drains towards moonlit blue-grey.
  const body = mix(token.colour, [96, 124, 146], 0.5 * night),
    head = mix(
      mix(token.colour, [245, 245, 240], 0.55),
      [150, 176, 194],
      0.4 * night,
    );
  const foot = 2.5 * s * k,
    shoulder = 3.7 * s * k;
  ctx.globalAlpha = opacity;
  // Where they stand.
  ctx.fillStyle = `rgba(8,14,20,${(0.14 + 0.2 * night).toFixed(3)})`;
  ctx.beginPath();
  ctx.ellipse(fx, fy, foot * 1.5, foot * 0.75, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = rgba(body);
  ctx.beginPath();
  ctx.moveTo(fx - foot, fy);
  ctx.quadraticCurveTo(
    fx - shoulder,
    (fy + sy) / 2,
    fx - shoulder,
    sy + shoulder * 0.4,
  );
  ctx.arc(fx, sy + shoulder * 0.4, shoulder, Math.PI, 0);
  ctx.quadraticCurveTo(fx + shoulder, (fy + sy) / 2, fx + foot, fy);
  ctx.ellipse(fx, fy, foot, foot * 0.5, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = rgba(head);
  ctx.beginPath();
  ctx.arc(fx, hy, 3.1 * s * k, 0, TAU);
  ctx.fill();
  ctx.globalAlpha = 1;
}
