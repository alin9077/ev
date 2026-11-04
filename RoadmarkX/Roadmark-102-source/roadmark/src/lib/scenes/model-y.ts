/**
 * The car every scene follows: an original model of the 2025 Tesla Model Y,
 * lofted from cross-sections in millimetres and drawn as flat-shaded panels.
 * Built from the car's published length, width, height and wheelbase, with
 * public photographs as reference for its shape. Right-hand drive. No Tesla
 * media, badge or wordmark is used.
 */
import {
  AMBER,
  RED,
  SKY,
  TAU,
  WARM,
  WHITE,
  clamp,
  direction,
  facing,
  glow,
  glowDot,
  hull,
  lerp,
  mix,
  pool,
  rgba,
  trace,
  type Ctx,
  type P3,
  type Pt,
  type Rgb,
  type View,
} from "./kit";

/** Scene units per millimetre: 4,790 mm is drawn 78 long, about 16 a metre. */
export const MM = 78 / 4790;
/** The nose sits this far ahead of the car's centre. */
const NOSE = 39;
/** Axles 870 mm and 3,760 mm behind the nose: a 2,890 mm wheelbase. */
const AXLES = [870, 3760];
/** 255/45 R19: 712 mm across, on a 1,636 mm track. */
const TYRE_R = 356,
  RIM_R = 248,
  TYRE_W = 255,
  TYRE_OUT = 946;

/** A smooth curve through control points that never overshoots them. */
function curve(points: Pt[]) {
  const n = points.length;
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++)
    slope.push(
      (points[i + 1][1] - points[i][1]) / (points[i + 1][0] - points[i][0]),
    );
  const tangent = points.map((_, i) =>
    i === 0
      ? slope[0]
      : i === n - 1
        ? slope[n - 2]
        : slope[i - 1] * slope[i] <= 0
          ? 0
          : (2 * slope[i - 1] * slope[i]) / (slope[i - 1] + slope[i]),
  );
  return (x: number) => {
    if (x <= points[0][0]) return points[0][1];
    if (x >= points[n - 1][0]) return points[n - 1][1];
    let i = 0;
    while (points[i + 1][0] < x) i += 1;
    const h = points[i + 1][0] - points[i][0],
      t = (x - points[i][0]) / h;
    return (
      (2 * t ** 3 - 3 * t * t + 1) * points[i][1] +
      (t ** 3 - 2 * t * t + t) * h * tangent[i] +
      (-2 * t ** 3 + 3 * t * t) * points[i + 1][1] +
      (t ** 3 - t * t) * h * tangent[i + 1]
    );
  };
}

/**
 * The body, nose to tail, in millimetres. Each row: distance behind the nose;
 * heights of the centre line, the roof rail (bonnet edge ahead of the
 * windscreen), the beltline (wing top ahead of it), the shoulder and the
 * sill; then half-widths at the shoulder, the beltline and the rail.
 */
const BODY = [
  // The bumper's foremost point, where every line of the section meets,
  // then the face rolling up to the bonnet's leading edge and down under.
  [0, 575, 570, 562, 552, 540, 700, 690, 676],
  [3, 640, 632, 612, 585, 505, 735, 722, 704],
  [10, 712, 702, 672, 610, 450, 770, 752, 728],
  [24, 775, 764, 728, 628, 390, 805, 780, 748],
  [45, 808, 797, 760, 640, 330, 838, 808, 770],
  [70, 828, 817, 780, 650, 272, 858, 825, 782],
  [100, 848, 838, 802, 664, 236, 878, 844, 796],
  [170, 876, 866, 832, 690, 220, 905, 868, 815],
  [280, 912, 903, 870, 728, 215, 930, 892, 834],
  [420, 948, 940, 908, 756, 214, 945, 905, 846],
  [600, 985, 978, 948, 775, 215, 955, 912, 852],
  [870, 1035, 1028, 1002, 790, 210, 960, 918, 858],
  [1050, 1065, 1058, 1035, 800, 205, 960, 922, 862],
  // The cowl: the windscreen starts here and the rail becomes the pillar.
  [1230, 1095, 1088, 1065, 808, 200, 960, 925, 868],
  [1330, 1150, 1098, 1078, 812, 200, 960, 925, 850],
  [1500, 1248, 1185, 1095, 818, 200, 960, 924, 806],
  [1700, 1362, 1305, 1110, 825, 200, 960, 922, 754],
  [1900, 1468, 1420, 1122, 832, 200, 960, 920, 708],
  [2050, 1540, 1498, 1130, 838, 200, 960, 919, 680],
  [2300, 1602, 1556, 1145, 845, 200, 960, 917, 652],
  // The roof peaks over the front seats, just ahead of the centre pillar.
  [2520, 1624, 1576, 1160, 852, 200, 960, 916, 640],
  [2620, 1624, 1576, 1166, 855, 200, 960, 916, 638],
  [2800, 1620, 1572, 1178, 860, 200, 960, 915, 636],
  [3100, 1600, 1552, 1198, 868, 200, 960, 914, 634],
  [3350, 1572, 1524, 1215, 875, 205, 960, 912, 634],
  [3550, 1540, 1494, 1232, 880, 210, 960, 910, 636],
  [3760, 1500, 1456, 1250, 884, 220, 960, 908, 644],
  [3900, 1458, 1416, 1258, 885, 240, 958, 905, 656],
  [4050, 1402, 1362, 1262, 884, 260, 952, 900, 672],
  [4200, 1340, 1304, 1255, 880, 280, 944, 893, 696],
  [4350, 1272, 1240, 1228, 872, 300, 934, 884, 724],
  [4480, 1215, 1188, 1175, 860, 320, 922, 872, 752],
  // The ducktail runs back to a sharp lip; the tailgate drops away under it.
  [4530, 1206, 1181, 1152, 852, 322, 916, 866, 762],
  [4580, 1200, 1176, 1124, 846, 325, 908, 858, 772],
  [4612, 1196, 1172, 1100, 838, 330, 900, 852, 778],
  [4632, 1150, 1130, 1062, 826, 336, 894, 848, 780],
  [4650, 1090, 1072, 1024, 812, 342, 888, 842, 778],
  [4690, 1010, 994, 958, 780, 356, 868, 826, 768],
  // The bumper rolls round to its rearmost point and tucks under: every
  // line of the section meets there.
  [4730, 915, 900, 862, 730, 395, 836, 800, 748],
  [4760, 800, 787, 750, 660, 455, 790, 762, 726],
  [4780, 680, 670, 640, 590, 515, 722, 704, 684],
  [4788, 615, 608, 592, 566, 540, 672, 660, 646],
  [4790, 575, 571, 564, 556, 548, 650, 640, 628],
];
const column = (i: number) => curve(BODY.map((row): Pt => [row[0], row[i]]));
/** A soft 0→1→0 swell between two stations, easing over `soft` mm at each end. */
const swell = (x: number, from: number, to: number, soft: number) =>
  clamp((x - from) / soft) ** 2 *
  (3 - 2 * clamp((x - from) / soft)) *
  clamp((to - x) / soft) ** 2 *
  (3 - 2 * clamp((to - x) / soft));
/**
 * The table gives the car its dimensions; these give it its roundness. The
 * bonnet domes between the wings, the roof crowns between its rails, the
 * glasshouse leans in over the shoulders, and the doors sit in from the arches.
 */
const dome = (x: number) =>
    36 * swell(x, 40, 1260, 320) + 24 * swell(x, 1700, 4450, 500),
  lean = (x: number) => swell(x, 1150, 4600, 600),
  /** Over the rear wheels the glasshouse steps in from the wings: the haunches. */
  haunch = (x: number) => swell(x, 3150, 4680, 520);
/** The table's own curves, built once. */
const railHeight = column(2),
  beltHeight = column(3),
  widest = column(6),
  beltWidth = column(7),
  railWidth = column(8);
const zTop = column(1),
  zRail = (x: number) => railHeight(x) - dome(x),
  zBelt = (x: number) => beltHeight(x) - 0.7 * dome(x) * (x < 1300 ? 1 : 0.2),
  zShoulder = column(4),
  zSill = column(5),
  /** Between the axles the doors sit in from the arches. */
  waist = (x: number) => swell(x, 1450, 3250, 450),
  yMax = (x: number) => widest(x) - 30 * waist(x),
  yBelt = (x: number) =>
    beltWidth(x) - 24 * lean(x) - 74 * haunch(x) - 12 * waist(x),
  yRail = (x: number) => railWidth(x) - 22 * lean(x) - 52 * haunch(x);

/** Where the body changes: cowl, windscreen header, centre pillar, and so on. */
const COWL = 1230,
  DOOR_FRONT = 1330,
  HEADER = 2050,
  PILLAR = 2620,
  ROOF_END = 3550,
  HINGE = 3760,
  GLASS_END = 4480;

/** How far the glass edge sits inboard of the rail, and above it. */
const pillar = curve([
  [0, 30],
  [COWL, 40],
  [DOOR_FRONT, 80],
  [HEADER, 72],
  [PILLAR, 60],
  [ROOF_END, 64],
  [3900, 110],
  [4350, 120],
  [4580, 70],
  [4790, 50],
]);
const crown = curve([
  [0, 6],
  [COWL, 5],
  [DOOR_FRONT, 8],
  [1500, 16],
  [PILLAR, 26],
  [ROOF_END, 24],
  [4350, 18],
  [4580, 14],
  [4790, 6],
]);

/**
 * Half a cross-section `x` mm behind the nose, as [half-width, height]: floor
 * centre, sill, rocker, shoulder, beltline, rail, glass edge, crown, centre.
 */
const sections = new Map<number, Pt[]>();
function section(x: number): Pt[] {
  const known = sections.get(x);
  if (known) return known;
  const top = zTop(x),
    rail = zRail(x),
    wide = yMax(x),
    sill = zSill(x);
  const edge: Pt = [
    Math.max(40, yRail(x) - pillar(x)),
    Math.min(top - 2, rail + crown(x)),
  ];
  const points: Pt[] = [
    [0, sill],
    [wide - 60, sill],
    [wide - 12, sill + 85],
    [wide, zShoulder(x)],
    [yBelt(x), zBelt(x)],
    [yRail(x), rail],
    edge,
    [edge[0] * 0.5, top - (top - edge[1]) * 0.24],
    [0, top],
  ];
  if (sections.size < 4000) sections.set(x, points);
  return points;
}
/** A point on the body's skin, in the car's own space: `s` runs up the section. */
function skin(x: number, s: number, side: number): P3 {
  const points = section(x);
  const last = points.length - 1;
  const i = Math.min(last - 1, Math.floor(s)),
    f = s - i;
  // The section is a smooth curve through its control points, mirrored
  // across the centre line so the floor and the roof crown stay level there.
  const at = (j: number): Pt =>
    j < 0
      ? [-points[1][0], points[1][1]]
      : j > last
        ? [-points[last - 1][0], points[last - 1][1]]
        : points[j];
  const through = (k: 0 | 1) => {
    const a = at(i - 1)[k],
      b = at(i)[k],
      c = at(i + 1)[k],
      d = at(i + 2)[k];
    return (
      0.5 *
      (2 * b +
        (c - a) * f +
        (2 * a - 5 * b + 4 * c - d) * f * f +
        (3 * b - a - 3 * c + d) * f ** 3)
    );
  };
  return [NOSE - x * MM, side * Math.max(0, through(0)) * MM, through(1) * MM];
}

/**
 * The tail light bar, as [distance behind the nose, place up the section]:
 * the line the skin makes at one height, from the wing round the corner to
 * the centre of the tailgate.
 */
const TAIL_WEDGE = 4385;
const CORNER_STEPS = 16;
/**
 * A line round one end of the car at a given height, as [distance behind
 * the nose, place up the section]: along the wing from `start`, round the
 * corner, and across to the centre line. The height may change with the
 * distance behind the nose and out from the centre line, both in millimetres.
 */
function endLine(
  end: "nose" | "tail",
  height: number | ((x: number, y: number) => number),
  start: number,
): Pt[] {
  const nose = end === "nose";
  /** Where the wing gives way to the corner, and the very end of the car. */
  const turn = nose ? 190 : 4600,
    tip = nose ? 0 : 4790;
  /** How far the skin sits above the line at this place. */
  const above = (x: number, t: number) => {
    const [, v, z] = skin(x, t, 1);
    return z - (typeof height === "number" ? height : height(x, v / MM)) * MM;
  };
  /** Finds where `rising` crosses zero between two values. */
  const solve = (from: number, to: number, rising: (v: number) => number) => {
    let lo = from,
      hi = to;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (rising(mid) < 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const line: Pt[] = [];
  // Along the wing and into the corner the line holds its height by sliding
  // up the section, in steps that shorten as the body turns in...
  const steps: number[] = [];
  for (let x = start; nose ? x >= turn : x <= turn; x += nose ? -30 : 30)
    steps.push(x);
  for (const d of [160, 140, 125, 110, 95, 80, 65, 50, 35, 22, 12, 5, 1.5])
    steps.push(nose ? tip + d * (turn / 190) : tip - d);
  for (const x of steps) {
    if (above(x, 5) < 0) break;
    line.push([x, solve(1.2, 5, (t) => above(x, t))]);
  }
  // ...then, past the roof rail's line, it runs across the end of the car.
  const [reach, from] = line[line.length - 1];
  for (let i = 1; i <= CORNER_STEPS; i++) {
    const t = from + ((8 - from) * i) / CORNER_STEPS;
    line.push([solve(tip, reach, (x) => above(x, t)), t]);
  }
  return line;
}
const tailLine = (
  height: number | ((x: number, y: number) => number),
  start: number,
) => endLine("tail", height, start);
/** How far along one of these lines the flank ends and the end of the car begins. */
const wingOf = (line: Pt[]) => line.length - CORNER_STEPS;
/** How far along the wing the lamp housing has grown from its point. */
const wedge = (x: number) => clamp((x - TAIL_WEDGE) / (4640 - TAIL_WEDGE));
/** The lamp sits high in its housing and spills light down the panel below. */
const TAIL_BAR = tailLine(1062, 4440),
  TAIL_SPILL = tailLine(1012, 4600),
  TAIL_REFLECTOR = tailLine(612, 4600),
  TAIL_SHUT = tailLine(668, 4600),
  /**
   * The gloss housing of the tail lamp: a band under the lip that deepens at
   * each corner and tapers forward along the wing to a point.
   */
  HOUSING_TOP = tailLine(
    (x) => (x > 4640 ? 1092 : lerp(1066, 1092, wedge(x))),
    TAIL_WEDGE + 5,
  ),
  HOUSING_FOOT = tailLine(
    (x, y) =>
      x > 4640 ? 1000 - 45 * clamp((y - 620) / 230) : lerp(1062, 955, wedge(x)),
    TAIL_WEDGE + 5,
  ),
  /** The black lower bumper, climbing at the corners to meet the arches. */
  BUMPER_TOP = tailLine(
    (x, y) =>
      x > 4680
        ? 640 + 80 * clamp((y - 560) / 300)
        : lerp(560, 720, (x - 4250) / 430),
    4270,
  );
/** The light bar's housing swells round each corner, then thins to a point on the wing. */
const NOSE_BAR_END = 330;
const blade = (x: number) =>
  x < 90
    ? 40
    : x < 200
      ? lerp(40, 56, (x - 90) / 110)
      : lerp(56, 3, clamp((x - 200) / (NOSE_BAR_END - 200)));
/** How far out along a headlamp pod a point sits: the pods are wedges pointing inwards. */
const pod = (y: number) => clamp((Math.abs(y) - 690) / 210);
const NOSE_BAR = endLine("nose", 772, NOSE_BAR_END - 20),
  NOSE_HOUSING_TOP = endLine("nose", (x) => 772 + blade(x) * 0.5, NOSE_BAR_END),
  NOSE_HOUSING_FOOT = endLine(
    "nose",
    (x) => 772 - blade(x) * 0.5,
    NOSE_BAR_END,
  ),
  /** Headlamps sit low, in dark pods at the corners. */
  POD_TOP = endLine("nose", (x, y) => 598 + 24 * pod(y), 190),
  POD_FOOT = endLine("nose", (x, y) => 598 - 32 * pod(y), 190),
  POD_LAMP = endLine("nose", 598, 190);
/** Where the under-bumper passes a height, in millimetres behind the nose. */
const underNose = (z: number) => {
  let lo = 0,
    hi = 400;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (zSill(mid) > z) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};
// Finding those lines tries thousands of sections that are never used again.
sections.clear();
/** Where the tailgate's cut runs down each side, as a place up the section. */
const TAIL_CUT = 5.3;

type Material = "body" | "glass" | "trim" | "slot";
/** Moving panels; 0 is the fixed shell. */
const HATCH = 1,
  BONNET = 2,
  DOOR_FL = 3,
  DOOR_FR = 4,
  DOOR_RL = 5,
  DOOR_RR = 6;
type Face = {
  points: P3[];
  normal: P3;
  material: Material;
  part: number;
};

const normalise = ([x, y, z]: P3): P3 => {
  const len = Math.hypot(x, y, z) || 1;
  return [x / len, y / len, z / len];
};
const normalOf = (p: P3[]): P3 => {
  const a = p[0],
    b = p[Math.floor(p.length / 3)],
    c = p[Math.floor((p.length * 2) / 3)];
  return normalise([
    (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]),
    (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]),
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]),
  ]);
};
const centreOf = (p: P3[]): P3 => {
  const c: P3 = [0, 0, 0];
  for (const q of p) for (let i = 0; i < 3; i++) c[i] += q[i] / p.length;
  return c;
};
const doorOf = (x: number, side: number) =>
  x > DOOR_FRONT && x < PILLAR
    ? side > 0
      ? DOOR_FR
      : DOOR_FL
    : x > PILLAR && x < ROOF_END
      ? side > 0
        ? DOOR_RR
        : DOOR_RL
      : 0;

/**
 * How each band of the cross-section is cut into strips, as places up the
 * section: more where it turns tightly (shoulder, roof rail), fewer where it
 * runs nearly flat. This is what makes the body round.
 */
const STRIPS = [1, 2, 3, 3, 2, 3, 2, 2].flatMap((count, band) =>
  Array.from({ length: count }, (_, j): Pt => [
    band + j / count,
    band + (j + 1) / count,
  ]),
);
const shell = (() => {
  // Stations: every row of the table, with long gaps split so curves stay round.
  const stations: number[] = [];
  for (let i = 0; i + 1 < BODY.length; i++) {
    const from = BODY[i][0],
      to = BODY[i + 1][0];
    const steps = Math.ceil(
      (to - from) / (from >= 4250 || to <= 420 ? 60 : 125),
    );
    for (let j = 0; j < steps; j++)
      stations.push(from + ((to - from) * j) / steps);
  }
  stations.push(BODY[BODY.length - 1][0]);

  const material = (x: number, band: number): Material => {
    if (band >= 6) {
      return (x > COWL && x < ROOF_END) || (x > HINGE && x < GLASS_END)
        ? "glass"
        : "body";
    }
    // Under the nose the bumper stays painted down to the intake.
    if (band === 0) return x < 95 ? "body" : "trim";
    if (band === 1) return (x > 1300 && x < 3450) || x > 4300 ? "trim" : "body";
    return "body";
  };
  const partOf = (x: number, band: number, side: number) => {
    if (band >= 6 && x > HINGE && x < 4750) return HATCH;
    if (band >= 6 && x > 42 && x < COWL) return BONNET;
    return band >= 2 && band <= 4 ? doorOf(x, side) : 0;
  };

  const faces: Face[] = [];
  for (let i = 0; i + 1 < stations.length; i++) {
    const a = stations[i],
      b = stations[i + 1],
      mid = (a + b) / 2;
    for (const side of [1, -1])
      for (const [s0, s1] of STRIPS) {
        const band = Math.floor(s0);
        // The floor only shows where it sweeps up into the bumpers.
        if (band === 0 && mid >= 420 && mid <= 4250) continue;
        const points = [
          skin(a, s0, side),
          skin(a, s1, side),
          skin(b, s1, side),
          skin(b, s0, side),
        ];
        // Normals point away from the car's own axis: the middle of the
        // section, taken a little towards the centre of the car so the faces
        // that close the nose and tail point outwards too.
        let normal = normalOf(points);
        const c = centreOf(points);
        const inboard = mid + (mid > 2400 ? -220 : 220);
        if (
          normal[0] * (c[0] - (NOSE - inboard * MM)) +
            normal[1] * c[1] +
            normal[2] * (c[2] - ((zSill(mid) + zTop(mid)) / 2) * MM) <
          0
        )
          normal = [-normal[0], -normal[1], -normal[2]];
        faces.push({
          points,
          normal,
          material: material(mid, band),
          part: partOf(mid, band, side),
        });
      }
  }
  // The two ends: the bumper faces.
  for (const [x, mat] of [
    [0, "body"],
    [4790, "trim"],
  ] as const) {
    const ring: P3[] = [];
    for (let s = 1; s <= 8; s += 0.5) ring.push(skin(x, s, 1));
    for (let s = 7.5; s >= 1; s -= 0.5) ring.push(skin(x, s, -1));
    faces.push({
      points: ring,
      normal: [x ? -1 : 1, 0, 0],
      material: mat,
      part: 0,
    });
  }
  /** Points that give the car its outline on the ground, for its shadow. */
  const silhouette: P3[] = [];
  for (let i = 0; i < stations.length; i += 2)
    for (const side of [1, -1])
      for (const s of [1, 3, 5, 8]) silhouette.push(skin(stations[i], s, side));
  return { faces, silhouette };
})();

/** Seat centres in millimetres behind the nose and to the right: driver first. */
const SEATS: Pt[] = [
  [2380, 370],
  [2380, -370],
  [3260, 450],
  [3260, 0],
  [3260, -450],
];
/** The six-seat cabin: two, two and two. Shown in the same shell. */
const SIX_SEATS: Pt[] = [
  [2380, 370],
  [2380, -370],
  [3180, 400],
  [3180, -400],
  [3880, 340],
  [3880, -340],
];
const seatsOf = (car: Car) => (car.seatCount === 6 ? SIX_SEATS : SEATS);

export type Car = {
  x: number;
  y: number;
  /** Degrees clockwise from north (−y). */
  heading: number;
  /** Rides this far above the ground: a plinth, or a lift. */
  z?: number;
  /** Distance driven, for turning the wheels. */
  travelled?: number;
  /** Front wheels turned, in degrees to the right. */
  steer?: number;
  /** 0–1 brightness of the lamps; a parked, sleeping car shows none. */
  lights?: number;
  braking?: number;
  indicator?: "left" | "right" | "both" | null;
  /** 0–1: where the indicator is in its flash. */
  blink?: number;
  /** 1 with the mirrors out, 0 folded against the glass. */
  mirrors?: number;
  /** 0–1 open: charge door, tailgate, bonnet, and the doors (front left, front right, rear left, rear right). */
  port?: number;
  hatch?: number;
  bonnet?: number;
  doors?: [number, number, number, number];
  /** 0–1: the shell fades to a ghost, showing what is inside. */
  xray?: number;
  /** 0–1 light inside the cabin, and its colour. */
  cabin?: number;
  cabinColour?: Rgb;
  /** Body motion: rise in scene units, then nose-up pitch and roll to the right per unit. */
  heave?: number;
  pitch?: number;
  roll?: number;
  /** Each wheel's rise over the road: front left, front right, rear left, rear right. */
  bump?: [number, number, number, number];
  /** How many seats the cabin has: five unless this says six. */
  seatCount?: number;
  /** Seats to pick out, driver first: a colour and 0–1 strength each. */
  seats?: (seat: number) => { colour: Rgb; strength: number } | null;
  /** 0–1: how solid the seats are; fade them when the idea is elsewhere. */
  seatsShown?: number;
  /** Bags in the boot: millimetres behind the nose and to the right, then length, width, height. */
  cargo?: { x: number; y: number; size: P3; colour: Rgb }[];
  /** Seats with someone in them. */
  people?: number[];
  /** 0–1: how much of the floor battery shows, and how full it is. */
  battery?: number;
  charge?: number;
  paint?: Rgb;
};

const BLACK: Rgb = [22, 28, 32];
const TO_VIEWER = normalise([1, 1, 1]);
/** What black paint mirrors at night: sky overhead, city glow, the lit road. */
const ZENITH: Rgb = [5, 9, 16],
  HORIZON: Rgb = [46, 70, 92],
  ROAD: Rgb = [92, 150, 178];
/**
 * Where the light sits: a panel turned towards either lamp catches the most.
 * Both are on the viewer's side, one down each axis of the street grid, so a
 * highlight runs along the shoulder and roof rail of whichever flank faces
 * us, and across the glass that slopes our way.
 */
const LAMP_A = normalise([0.5, 0, 0.866]),
  LAMP_B = normalise([0, 0.5, 0.866]);

/** The car's own space onto the ground: forwards, to its right, up. */
function frame(car: Car) {
  const [dx, dy] = direction(car.heading);
  const lift = car.z ?? 0,
    heave = car.heave ?? 0,
    pitch = car.pitch ?? 0,
    roll = car.roll ?? 0;
  return ([u, v, z]: P3): P3 => [
    car.x + dx * u - dy * v,
    car.y + dy * u + dx * v,
    lift + z + heave + u * pitch - v * roll,
  ];
}
const mm = (x: number, y: number, z: number): P3 => [
  NOSE - x * MM,
  y * MM,
  z * MM,
];
/** A place on the car, in millimetres behind the nose, to the right, and up. */
export function carPoint(car: Car, x: number, y: number, z: number): P3 {
  return frame(car)(mm(x, y, z));
}
/** Named places that scenes attach things to. */
export const carParts = {
  port: [4510, -888, 1044],
  handle: [2415, 962, 1035],
  roof: [2520, 0, 1624],
  screen: [1960, 0, 1120],
  boot: [4250, 0, 760],
  tail: [4790, 0, 560],
  nose: [0, 0, 560],
  frontWheel: [870, 946, 356],
  rearWheel: [3760, 946, 356],
  driver: [2380, 370, 1180],
} satisfies Record<string, P3>;
export const carPart = (car: Car, part: keyof typeof carParts) =>
  carPoint(car, ...carParts[part]);
/** The loop round the body `x` mm behind the nose: a line that scans the car. */
export function carSection(car: Car, x: number): P3[] {
  const place = frame(car);
  const ring: P3[] = [];
  for (let s = 1; s <= 8; s++) ring.push(place(skin(x, s, 1)));
  for (let s = 7; s >= 1; s--) ring.push(place(skin(x, s, -1)));
  return ring;
}
/** Where a seat is, at cushion height. */
export const seatPoint = (car: Car, seat: number, z = 620) =>
  carPoint(car, seatsOf(car)[seat][0], seatsOf(car)[seat][1], z);

/** Moves a point with its panel, when that panel is open. */
function swing(car: Car) {
  const hatch = (car.hatch ?? 0) * 1.28,
    bonnet = (car.bonnet ?? 0) * 0.9;
  const doors = car.doors ?? [0, 0, 0, 0];
  const hu = NOSE - HINGE * MM,
    hz = zTop(HINGE) * MM,
    bu = NOSE - COWL * MM,
    bz = zTop(COWL) * MM;
  const door = (p: P3, x: number, side: number, open: number): P3 => {
    if (open <= 0) return p;
    const a = -side * open * 1.05,
      pu = NOSE - x * MM,
      pv = side * 950 * MM;
    const du = p[0] - pu,
      dv = p[1] - pv;
    return [
      pu + du * Math.cos(a) - dv * Math.sin(a),
      pv + du * Math.sin(a) + dv * Math.cos(a),
      p[2],
    ];
  };
  return (p: P3, part: number): P3 => {
    if (part === HATCH && hatch > 0) {
      const du = p[0] - hu,
        dz = p[2] - hz;
      return [
        hu + du * Math.cos(hatch) + dz * Math.sin(hatch),
        p[1],
        hz - du * Math.sin(hatch) + dz * Math.cos(hatch),
      ];
    }
    if (part === BONNET && bonnet > 0) {
      const du = p[0] - bu,
        dz = p[2] - bz;
      return [
        bu + du * Math.cos(bonnet) - dz * Math.sin(bonnet),
        p[1],
        bz + du * Math.sin(bonnet) + dz * Math.cos(bonnet),
      ];
    }
    if (part === DOOR_FL) return door(p, DOOR_FRONT, -1, doors[0]);
    if (part === DOOR_FR) return door(p, DOOR_FRONT, 1, doors[1]);
    if (part === DOOR_RL) return door(p, PILLAR, -1, doors[2]);
    if (part === DOOR_RR) return door(p, PILLAR, 1, doors[3]);
    return p;
  };
}
const openness = (car: Car, part: number) =>
  part === HATCH
    ? (car.hatch ?? 0)
    : part === BONNET
      ? (car.bonnet ?? 0)
      : part >= DOOR_FL
        ? (car.doors?.[part - DOOR_FL] ?? 0)
        : 0;

/** The outline the car makes on the ground under the sun: its cast shadow. */
export function carShadow(view: View, car: Car): Pt[] {
  const place = frame(car);
  const [sx, sy] = view.sun;
  return hull(
    shell.silhouette.map((p): Pt => {
      const [x, y, z] = place(p);
      return [x + sx * z, y + sy * z];
    }),
  );
}
/** The car's plan outline, grown: its contact shadow at night, or a line drawn round it. */
export function footprint(car: Car, grow: number): Pt[] {
  const place = frame({ ...car, z: 0, heave: 0, pitch: 0, roll: 0 });
  return hull(
    shell.silhouette.map((p): Pt => {
      const [x, y] = place([p[0] * grow, p[1] * grow, 0]);
      return [x, y];
    }),
  );
}
/**
 * What the car puts on the ground at night: a pool of light so black paint
 * still reads, a contact shadow, headlight beams and the brake glow behind.
 * Call inside `onGround`.
 */
export function carOnGround(ctx: Ctx, view: View, car: Car, underglow?: Rgb) {
  if (view.night < 0.02) return;
  const [dx, dy] = direction(car.heading);
  const lights = clamp(car.lights ?? 1) * view.night;
  if (underglow)
    glow(ctx, () =>
      pool(ctx, [car.x, car.y], 140, underglow, 0.32 * view.night),
    );
  ctx.fillStyle = `rgba(2,6,11,${(0.7 * view.night).toFixed(3)})`;
  trace(ctx, footprint(car, 1.06));
  ctx.fill();
  if (lights < 0.02) return;
  glow(ctx, () => {
    const fx = car.x + dx * 37,
      fy = car.y + dy * 37;
    const beam = ctx.createLinearGradient(fx, fy, fx + dx * 190, fy + dy * 190);
    beam.addColorStop(0, rgba(WARM, 0.32 * lights));
    beam.addColorStop(1, rgba(WARM, 0));
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(fx - dy * 13, fy + dx * 13);
    ctx.lineTo(fx + dx * 190 - dy * 74, fy + dy * 190 + dx * 74);
    ctx.lineTo(fx + dx * 190 + dy * 74, fy + dy * 190 - dx * 74);
    ctx.lineTo(fx + dy * 13, fy - dx * 13);
    ctx.fill();
    pool(
      ctx,
      [car.x - dx * 46, car.y - dy * 46],
      56,
      RED,
      (0.12 + 0.3 * clamp(car.braking ?? 0)) * lights,
    );
  });
}

/** Paints the car. Call with the other upright things, in depth order. */
export function drawCar(ctx: Ctx, view: View, car: Car) {
  const { k, day, night } = view;
  const place = frame(car);
  const move = swing(car);
  const [dx, dy] = direction(car.heading);
  const at = (p: P3) => {
    const [x, y, z] = place(p);
    return view.at(x, y, z);
  };
  const path = (points: P3[], close = true) =>
    trace(ctx, points.map(at), close);
  /** +1 when the car's right side faces us, −1 for its left. */
  const near = dx - dy > 0 ? 1 : -1;
  const frontShows = dx + dy > -0.25,
    rearShows = dx + dy < 0.25;
  const xray = clamp(car.xray ?? 0);
  const paint = car.paint ?? BLACK;
  const lights = clamp(car.lights ?? 1),
    braking = clamp(car.braking ?? 0);
  const edge = mix(SKY, view.pal.line, day);
  const hair = Math.max(0.6 * view.unit, 0.3 * k);
  /** X-ray fades a colour towards the ground it stands on. */
  const ghost = (c: Rgb, amount = 0.88) =>
    mix(c, view.pal.ground, amount * xray);
  const anyOpen =
    (car.hatch ?? 0) > 0 ||
    (car.bonnet ?? 0) > 0 ||
    (car.doors ?? []).some((d) => d > 0);

  /* ----- Wheels ----- */
  const bump = car.bump ?? [0, 0, 0, 0];
  const steer = ((car.steer ?? 0) * Math.PI) / 180;
  const spin = (car.travelled ?? 0) / (TYRE_R * MM);
  const wheel = (index: number, shown: boolean) => {
    const front = index < 2,
      side = index % 2 ? 1 : -1;
    const axle = AXLES[front ? 0 : 1];
    const turn = front ? steer : 0;
    const cu = NOSE - axle * MM,
      cz = TYRE_R * MM + bump[index];
    /** A point on a disc `out` mm from the car's centre line. */
    const rim = (out: number, r: number, a: number): P3 => {
      const along = Math.cos(a) * r * MM,
        centre = side * (TYRE_OUT - TYRE_W / 2) * MM,
        off = side * (out - (TYRE_OUT - TYRE_W / 2)) * MM;
      return [
        cu + along * Math.cos(turn) - off * Math.sin(turn),
        centre + along * Math.sin(turn) + off * Math.cos(turn),
        cz + Math.sin(a) * r * MM,
      ];
    };
    const circle = (out: number, r: number, steps = 28) =>
      Array.from({ length: steps + 1 }, (_, i) =>
        rim(out, r, (i / steps) * TAU),
      );
    const tyre = ghost(mix([4, 5, 7], [24, 28, 31], day), 0.7);
    if (!shown) {
      // The far wheels: only what shows beneath the car.
      ctx.fillStyle = rgba(tyre);
      trace(
        ctx,
        hull([
          ...circle(TYRE_OUT, TYRE_R).map(at),
          ...circle(TYRE_OUT - TYRE_W, TYRE_R).map(at),
        ]),
      );
      ctx.fill();
      return;
    }
    // The arch: a dark well, then its matt trim.
    const arch = (r: number, from: number, to: number) =>
      Array.from({ length: 25 }, (_, i): P3 => {
        const a = (from + ((to - from) * i) / 24) * TAU;
        return [
          NOSE - axle * MM + Math.cos(a) * r * MM,
          side * (yMax(axle) + 2) * MM,
          Math.max(215 * MM, TYRE_R * MM + Math.sin(a) * r * MM),
        ];
      });
    ctx.fillStyle = rgba(ghost(mix([1, 2, 3], [9, 12, 14], day)));
    path(arch(408, -0.06, 0.56));
    ctx.fill();
    ctx.strokeStyle = rgba(ghost(mix([38, 60, 78], [62, 70, 74], day), 0.6));
    ctx.lineWidth = Math.max(hair, 0.9 * k);
    ctx.lineCap = "round";
    path(arch(428, 0.02, 0.48), false);
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = rgba(tyre);
    path(circle(TYRE_OUT, TYRE_R));
    ctx.fill();
    // The aero cover: a dark disc with five swept blades.
    ctx.fillStyle = rgba(ghost(mix([14, 19, 25], [52, 60, 66], day), 0.6));
    path(circle(TYRE_OUT + 4, RIM_R));
    ctx.fill();
    ctx.strokeStyle = rgba(
      ghost(mix([104, 130, 148], [124, 134, 140], day), 0.4),
    );
    ctx.lineWidth = Math.max(hair, 0.85 * k);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (side > 0 ? -spin : spin) + (i / 5) * TAU;
      ctx.moveTo(...at(rim(TYRE_OUT + 6, 62, a)));
      ctx.lineTo(...at(rim(TYRE_OUT + 6, 150, a + 0.3)));
      ctx.lineTo(...at(rim(TYRE_OUT + 6, 228, a + 0.52)));
    }
    ctx.stroke();
    ctx.lineCap = "butt";
    ctx.fillStyle = rgba(ghost(mix([30, 40, 50], [30, 36, 40], day), 0.6));
    path(circle(TYRE_OUT + 8, 46, 12));
    ctx.fill();
  };
  for (const index of [0, 1, 2, 3])
    if ((index % 2 ? 1 : -1) !== near) wheel(index, false);

  /* ----- Mirrors ----- */
  const mirror = (side: number) => {
    const out = clamp(car.mirrors ?? 1);
    const part = side > 0 ? DOOR_FR : DOOR_FL;
    // Folded, the pod swings back flat against the door glass.
    const pod = (x: number, y: number, z: number) =>
      move(mm(x + 150 * (1 - out), side * lerp(968, y, out), z), part);
    // A rounded pod: widest through its middle, drawn in to a smaller cap.
    const plan: Pt[] = [
      [1532, 950],
      [1544, 1004],
      [1578, 1042],
      [1640, 1054],
      [1700, 1040],
      [1730, 1000],
      [1738, 950],
    ];
    const level = (z: number, grow: number) =>
      plan.map(([x, y]) =>
        pod(1636 + (x - 1636) * grow, 950 + (y - 950) * grow, z),
      );
    const cap = level(1222, 0.72);
    // One solid shape with the foot that carries it, so it never floats.
    ctx.fillStyle = rgba(
      ghost(mix([8, 12, 17], mix(paint, [70, 82, 90], 0.35), day)),
    );
    trace(
      ctx,
      hull(
        [
          ...level(1122, 0.8),
          ...level(1168, 1),
          ...cap,
          move(mm(1510, side * 924, 1090), part),
          move(mm(1720, side * 924, 1098), part),
        ].map(at),
      ),
    );
    ctx.fill();
    ctx.fillStyle = rgba(
      ghost(mix([30, 48, 62], mix(paint, [128, 146, 156], 0.5), day)),
    );
    path(cap);
    ctx.fill();
  };
  mirror(-near);

  /* ----- Panels ----- */
  type Panel = { depth: number; shape: Pt[]; colour: string };
  const back: Panel[] = [],
    panels: Panel[] = [];
  // The two sweeps of glass overhead, each as one outline: windscreen into
  // roof, and the tailgate's, which lifts with it.
  const sweepOf = (from: number, to: number, part: number): Pt[] => {
    const edge = (side: number) =>
      Array.from({ length: 13 }, (_, i) => {
        const p = skin(from + ((to - from) * i) / 12, 6, side);
        return at(part ? move(p, part) : p);
      });
    return [...edge(-1), ...edge(1).reverse()];
  };
  const topGlass = [
    sweepOf(COWL, ROOF_END, 0),
    sweepOf(HINGE, GLASS_END, HATCH),
  ];
  for (const face of shell.faces) {
    const open = face.part > 0 && openness(car, face.part) > 0;
    const local = open
      ? face.points.map((p) => move(p, face.part))
      : face.points;
    let [nu, nv, nz] = face.normal;
    if (open) {
      // A swung panel keeps the side it showed when shut.
      const moved = normalOf(local);
      const origin = centreOf(face.points),
        tip: P3 = [origin[0] + nu, origin[1] + nv, origin[2] + nz];
      const a = move(origin, face.part),
        b = move(tip, face.part);
      const same =
        moved[0] * (b[0] - a[0]) +
          moved[1] * (b[1] - a[1]) +
          moved[2] * (b[2] - a[2]) >
        0;
      [nu, nv, nz] = same ? moved : [-moved[0], -moved[1], -moved[2]];
    }
    const normal: P3 = [dx * nu - dy * nv, dy * nu + dx * nv, nz];
    const towards =
      normal[0] * TO_VIEWER[0] +
      normal[1] * TO_VIEWER[1] +
      normal[2] * TO_VIEWER[2];
    // Panels turned away only matter when something is open to show them.
    if (towards <= 0 && !anyOpen) continue;
    const world = local.map(place);
    const centre = centreOf(world);
    const depth = centre[0] + centre[1] + centre[2];
    const shape = world.map(([x, y, z]) => view.at(x, y, z));
    if (towards <= 0) {
      // Seen from inside: the lining, which shows when something is open.
      if (anyOpen)
        back.push({
          depth,
          shape,
          colour: rgba(ghost(mix([6, 10, 14], [38, 44, 48], day))),
        });
      continue;
    }
    const up = Math.max(0, normal[2]),
      sun = facing(view, normal[0], normal[1], normal[2]),
      rimLight = (1 - towards) ** 3;
    // What the panel mirrors: follow the line of sight off the surface. Up
    // into a dark sky, out to the glow of the city at the horizon, or down
    // onto the lit road beside the car.
    const bounce = 2 * towards * normal[2] - TO_VIEWER[2];
    const mirrored: Rgb =
      bounce >= 0
        ? mix(HORIZON, ZENITH, bounce ** 0.55)
        : mix(HORIZON, ROAD, clamp(-bounce * 2.4));
    const gloss = 0.1 + 1.25 * (0.05 + 0.95 * (1 - towards) ** 4);
    // A broad sheen and, inside it, a tight glint: together they travel over
    // every curve, which is what tells the eye the surface is round.
    const lobe = Math.max(
      0,
      normal[0] * LAMP_A[0] + normal[2] * LAMP_A[2],
      normal[1] * LAMP_B[1] + normal[2] * LAMP_B[2],
    );
    const sheen = lobe ** 3,
      glint = lobe ** 30;
    let dayTone: Rgb, nightTone: Rgb;
    if (face.material === "glass") {
      dayTone = [
        11 + 12 * up + 9 * sun + 22 * rimLight,
        17 + 16 * up + 11 * sun + 26 * rimLight,
        23 + 18 * up + 13 * sun + 30 * rimLight,
      ];
      nightTone = [
        2 + mirrored[0] * gloss * 1.35 + 6 * sheen + 44 * glint,
        4 + mirrored[1] * gloss * 1.35 + 10 * sheen + 60 * glint,
        7 + mirrored[2] * gloss * 1.35 + 14 * sheen + 72 * glint,
      ];
    } else if (face.material === "trim") {
      dayTone = [30 + 16 * sun, 35 + 18 * sun, 38 + 19 * sun];
      nightTone = [5 + rimLight * 12, 7 + rimLight * 18, 9 + rimLight * 24];
    } else if (face.material === "slot") {
      dayTone = [9, 12, 14];
      nightTone = [2, 3, 5];
    } else {
      const light = 0.55 + 0.9 * sun;
      dayTone = [
        paint[0] * light +
          26 * up * up +
          40 * rimLight +
          16 * sheen +
          56 * glint,
        paint[1] * light +
          31 * up * up +
          46 * rimLight +
          18 * sheen +
          62 * glint,
        paint[2] * light +
          34 * up * up +
          50 * rimLight +
          19 * sheen +
          66 * glint,
      ];
      nightTone = [
        6 + mirrored[0] * gloss + 10 * sheen + 56 * glint,
        7 + mirrored[1] * gloss + 16 * sheen + 80 * glint,
        9 + mirrored[2] * gloss + 22 * sheen + 98 * glint,
      ];
    }
    panels.push({
      depth,
      shape,
      colour: rgba(
        ghost(
          mix(nightTone, dayTone, day),
          face.material === "glass" ? 0.8 : 0.9,
        ),
      ),
    });
  }
  /**
   * A panel's outline, grown by a fraction of a pixel so that it laps over
   * its neighbours and no seam shows between them, and wound one way round
   * so that panels sharing a path never cancel where they overlap.
   */
  const lapped = (shape: Pt[]): Pt[] => {
    const grow = 0.4 * view.unit;
    let cx = 0,
      cy = 0,
      area = 0;
    shape.forEach(([x, y], i) => {
      const [nx, ny] = shape[(i + 1) % shape.length];
      cx += x / shape.length;
      cy += y / shape.length;
      area += x * ny - nx * y;
    });
    const grown = shape.map(([x, y]): Pt => {
      const reach = Math.hypot(x - cx, y - cy) || 1;
      return [x + ((x - cx) / reach) * grow, y + ((y - cy) / reach) * grow];
    });
    return area < 0 ? grown.reverse() : grown;
  };
  const outline = (shape: Pt[]) => {
    ctx.moveTo(shape[0][0], shape[0][1]);
    for (let i = 1; i < shape.length; i++) ctx.lineTo(shape[i][0], shape[i][1]);
    ctx.closePath();
  };
  const fill = (list: Panel[], ordered: boolean) => {
    if (ordered) {
      // Something is open, so panels can hide one another: furthest first.
      list.sort((p, q) => p.depth - q.depth);
      for (const { shape, colour } of list) {
        ctx.fillStyle = colour;
        ctx.beginPath();
        outline(lapped(shape));
        ctx.fill();
      }
      return;
    }
    // Otherwise nothing overlaps from above, and the panels of each colour
    // are painted together, in any order.
    const batches = new Map<string, Pt[][]>();
    for (const { shape, colour } of list) {
      const batch = batches.get(colour);
      if (batch) batch.push(lapped(shape));
      else batches.set(colour, [lapped(shape)]);
    }
    for (const [colour, shapes] of batches) {
      ctx.fillStyle = colour;
      ctx.beginPath();
      for (const shape of shapes) outline(shape);
      ctx.fill();
    }
  };

  /* ----- Inside: battery, seats, people, screen ----- */
  const depthAt = (x: number, y: number, z: number) => {
    const [wx, wy, wz] = place(mm(x, y, z));
    return wx + wy + wz;
  };
  const block = (
    x0: number,
    x1: number,
    y0: number,
    y1: number,
    z0: number,
    z1: number,
    colour: Rgb,
    lean = 0,
  ) => {
    const corner = (x: number, y: number, z: number, shift: number) =>
      at(mm(x + shift, y, z));
    const quad = (points: Pt[], f: number) => {
      ctx.fillStyle = rgba(colour.map((c) => c * f) as Rgb);
      trace(ctx, points);
      ctx.fill();
    };
    // Whichever two sides face us, then the top.
    const xs = dx + dy > 0 ? x0 : x1,
      ys = near > 0 ? y1 : y0;
    quad(
      [
        corner(xs, y0, z0, 0),
        corner(xs, y1, z0, 0),
        corner(xs, y1, z1, lean),
        corner(xs, y0, z1, lean),
      ],
      0.8,
    );
    quad(
      [
        corner(x0, ys, z0, 0),
        corner(x1, ys, z0, 0),
        corner(x1, ys, z1, lean),
        corner(x0, ys, z1, lean),
      ],
      0.66,
    );
    quad(
      [
        corner(x0, y0, z1, lean),
        corner(x1, y0, z1, lean),
        corner(x1, y1, z1, lean),
        corner(x0, y1, z1, lean),
      ],
      1,
    );
  };
  const cabin = clamp(car.cabin ?? 0);
  const battery = clamp(car.battery ?? 0);
  const seatBase = mix([104, 122, 138], [92, 100, 105], day);
  const inside = (alpha: number) => {
    if (alpha <= 0.01) return;
    const items: { depth: number; draw: () => void }[] = [];
    if (battery > 0.02) {
      const cells = 6,
        charge = clamp(car.charge ?? 0);
      const empty = mix(view.pal.ground, view.pal.line, 0.16 + 0.1 * night);
      items.push({
        depth: depthAt(2400, 0, 200) - 60,
        draw: () => {
          ctx.globalAlpha = alpha * battery;
          block(
            1290,
            3540,
            -770,
            770,
            180,
            300,
            mix(view.pal.ground, view.pal.line, 0.3),
          );
          for (let i = 0; i < cells; i++) {
            // Cells fill from the charge port forwards.
            const x1 = 3500 - (i * 2170) / cells,
              x0 = x1 - 2170 / cells + 50;
            const full = clamp(charge * cells - i);
            for (const [y0, y1] of [
              [-715, -26],
              [26, 715],
            ])
              block(
                x0,
                x1,
                y0,
                y1,
                300,
                322,
                mix(empty, view.pal.accent, full),
              );
          }
          ctx.globalAlpha = alpha;
        },
      });
    }
    const seatsShown = clamp(car.seatsShown ?? 1);
    seatsOf(car).forEach(([sx, sy], seat) => {
      if (seatsShown <= 0.01) return;
      const style = car.seats?.(seat);
      const colour = style
        ? mix(seatBase, style.colour, style.strength)
        : seatBase;
      const half = seat < 2 ? 235 : 215;
      items.push({
        depth: depthAt(sx, sy, 700),
        draw: () => {
          ctx.globalAlpha = alpha * seatsShown;
          block(sx - 250, sx + 230, sy - half, sy + half, 520, 640, colour);
          block(
            sx + 190,
            sx + 300,
            sy - half,
            sy + half,
            600,
            1130,
            colour,
            90,
          );
          block(sx + 320, sx + 400, sy - 120, sy + 120, 1150, 1290, colour, 20);
          if (style && style.strength > 0.05)
            glowDot(
              ctx,
              at(mm(sx, sy, 700)),
              3.2 * k,
              style.colour,
              0.5 * style.strength * night,
            );
          ctx.globalAlpha = alpha;
        },
      });
    });
    for (const bag of car.cargo ?? [])
      items.push({
        depth: depthAt(bag.x, bag.y, 690 + bag.size[2]) + 3,
        draw: () =>
          block(
            bag.x - bag.size[0] / 2,
            bag.x + bag.size[0] / 2,
            bag.y - bag.size[1] / 2,
            bag.y + bag.size[1] / 2,
            690,
            690 + bag.size[2],
            bag.colour,
          ),
      });
    for (const seat of car.people ?? []) {
      const [sx, sy] = seatsOf(car)[seat];
      items.push({
        depth: depthAt(sx, sy, 1100) + 2,
        draw: () => {
          // Shoulders and a head, seen through the glass.
          block(
            sx - 60,
            sx + 150,
            sy - 205,
            sy + 205,
            900,
            1130,
            mix([44, 60, 76], [70, 92, 112], day),
          );
          const [hx, hy] = at(mm(sx + 20, sy, 1275));
          ctx.fillStyle = rgba(mix([92, 70, 56], [196, 150, 118], day));
          ctx.beginPath();
          ctx.arc(hx, hy, 1.75 * k, 0, TAU);
          ctx.fill();
          ctx.fillStyle = rgba(mix([24, 20, 20], [52, 40, 34], day));
          ctx.beginPath();
          ctx.arc(hx - dx * 0.5 * k, hy - 0.7 * k, 1.5 * k, Math.PI, TAU);
          ctx.fill();
          if (seat === 0) {
            // Hands on the wheel.
            ctx.strokeStyle = rgba(mix([120, 150, 168], [40, 48, 52], day));
            ctx.lineWidth = Math.max(hair, 0.5 * k);
            path(
              Array.from({ length: 17 }, (_, i) => {
                const a = (i / 16) * TAU;
                return mm(
                  1960 + Math.sin(a) * 60,
                  sy + Math.cos(a) * 185,
                  1040 + Math.sin(a) * 150,
                );
              }),
            );
            ctx.stroke();
          }
        },
      });
    }
    items.push({
      depth: depthAt(1960, 0, 1100),
      draw: () => {
        // The centre screen: a blank slab, lit when the cabin is awake.
        ctx.fillStyle = rgba(
          mix(
            mix([10, 16, 22], SKY, 0.85 * cabin),
            mix([30, 36, 40], WHITE, 0.7 * cabin),
            day,
          ),
        );
        path([
          mm(1950, -190, 1040),
          mm(1950, 190, 1040),
          mm(1985, 190, 1245),
          mm(1985, -190, 1245),
        ]);
        ctx.fill();
        glowDot(ctx, at(mm(1965, 0, 1140)), 2.6 * k, SKY, 0.7 * cabin * night);
      },
    });
    const floor = (points: P3[], depth: number) =>
      items.push({
        depth,
        draw: () => {
          ctx.fillStyle = rgba(mix([14, 22, 30], [64, 70, 72], day));
          path(points);
          ctx.fill();
        },
      });
    if ((car.hatch ?? 0) > 0.02)
      floor(
        [
          mm(3780, -560, 690),
          mm(3780, 560, 690),
          mm(4700, 520, 690),
          mm(4700, -520, 690),
        ],
        depthAt(4200, 0, 690) - 40,
      );
    if ((car.bonnet ?? 0) > 0.02)
      floor(
        [
          mm(200, -520, 640),
          mm(200, 520, 640),
          mm(1100, 600, 720),
          mm(1100, -600, 720),
        ],
        depthAt(600, 0, 640) - 40,
      );
    ctx.globalAlpha = alpha;
    items.sort((a, b) => a.depth - b.depth).forEach((item) => item.draw());
    ctx.globalAlpha = 1;
  };

  // Painted in the order they are built: lining, cabin, then the shell.
  if (anyOpen) {
    fill(back, false);
    inside(1);
  }
  fill(panels, anyOpen);

  // The cabin again, as seen through the glass roof, and in full for X-ray.
  const through = (0.09 + 0.17 * day + 0.4 * cabin) * (1 - xray);
  if (through > 0.02) {
    ctx.save();
    ctx.beginPath();
    for (const shape of topGlass) {
      shape.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath();
    }
    ctx.clip();
    inside(through);
    ctx.restore();
  }
  inside(xray);
  if (cabin > 0.03 && night > 0.03)
    glow(ctx, () => {
      for (const x of [2300, 3200])
        pool(
          ctx,
          at(mm(x, 0, 1200)),
          15 * k,
          car.cabinColour ?? WARM,
          0.5 * cabin * night,
        );
    });

  /* ----- Glass, shut lines and trim ----- */
  const onSkin = (x: number, s: number, side: number, part = 0) =>
    part ? move(skin(x, s, side), part) : skin(x, s, side);
  const run = (from: number, to: number, s: number, steps = 8): Pt[] =>
    Array.from({ length: steps + 1 }, (_, i): Pt => [
      from + ((to - from) * i) / steps,
      s,
    ]);
  if (day > 0.2 && xray < 0.6) {
    // Sky across the windscreen: what makes glass read as glass.
    ctx.fillStyle = rgba([156, 182, 196], 0.1 * day * (1 - xray));
    path([
      onSkin(1440, 6.1, near),
      onSkin(1640, 6.1, near),
      onSkin(1990, 6.1, -near),
      onSkin(1790, 6.1, -near),
    ]);
    ctx.fill();
  }
  const glassTone = rgba(ghost(mix([4, 7, 11], [20, 29, 36], day), 0.8));
  const pane = (edges: Pt[], side: number, part: number) => {
    ctx.fillStyle = glassTone;
    path(edges.map(([x, s]) => onSkin(x, s, side, part)));
    ctx.fill();
    ctx.strokeStyle = rgba(edge, 0.2 + 0.06 * night + 0.4 * xray);
    ctx.lineWidth = hair;
    ctx.stroke();
  };
  const flank = (side: number) => {
    const front = doorOf(2000, side),
      rear = doorOf(3000, side);
    pane([...run(1440, 2570, 4.08), ...run(2570, 1440, 4.9)], side, front);
    pane([...run(2670, 3340, 4.08, 5), ...run(3340, 2670, 4.9, 5)], side, rear);
    // The quarter light, drawn up to a point behind the rear door: half of it
    // is in the door, half in the body.
    pane(
      [
        [3385, 4.08],
        [3500, 4.2],
        [3548, 4.32],
        [3548, 4.9],
        [3385, 4.9],
      ],
      side,
      rear,
    );
    pane(
      [
        [3552, 4.33],
        [3640, 4.56],
        [3730, 4.86],
        [3640, 4.9],
        [3552, 4.9],
      ],
      side,
      0,
    );
    // Shut lines.
    ctx.strokeStyle = rgba(edge, (0.2 - 0.04 * night) * (1 - 0.4 * xray));
    ctx.lineWidth = hair;
    for (const [cut, part] of [
      [
        [
          [1350, 2],
          [1335, 3],
          [1332, 4],
        ],
        front,
      ],
      [
        [
          [2618, 2],
          [2618, 3],
          [2618, 4.9],
        ],
        front,
      ],
      [
        [
          [3300, 2],
          [3360, 2.6],
          [3480, 3.2],
          [3548, 4],
        ],
        rear,
      ],
    ] as [Pt[], number][]) {
      path(
        cut.map(([x, s]) => onSkin(x, s, side, part)),
        false,
      );
      ctx.stroke();
    }
    // Flush handles.
    ctx.fillStyle = rgba(ghost(mix([2, 4, 6], [8, 11, 13], day), 0.6));
    for (const [from, to] of [
      [2320, 2510],
      [3290, 3460],
    ]) {
      path(
        [
          [from, 3.56],
          [to, 3.56],
          [to, 3.7],
          [from, 3.7],
        ].map(([x, s]) => onSkin(x, s, side, doorOf(from, side))),
      );
      ctx.fill();
    }
    // Light along the shoulder and the roof rail: what makes paint read as paint.
    ctx.lineCap = "round";
    ctx.strokeStyle = rgba(
      mix(SKY, [206, 220, 226], day),
      (0.26 - 0.12 * night) * (1 - 0.3 * xray),
    );
    ctx.lineWidth = Math.max(hair, 0.34 * k);
    path(
      run(330, 4420, 3, 26).map(([x, s]) =>
        onSkin(x, s, side, doorOf(x, side)),
      ),
      false,
    );
    ctx.stroke();
    ctx.strokeStyle = rgba(
      mix(SKY, [226, 236, 240], day),
      (0.4 - 0.16 * night) * (1 - 0.3 * xray),
    );
    path(
      run(1400, 4480, 5.5, 22).map(([x, s]) => skin(x, s, side)),
      false,
    );
    ctx.stroke();
    ctx.lineCap = "butt";
    if (night > 0.05 || xray > 0.05) {
      // The sill, picked out by the light under the car.
      ctx.strokeStyle = rgba(edge, 0.3 * night + 0.4 * xray);
      ctx.lineWidth = hair;
      path(
        run(60, 4700, 1, 26).map(([x, s]) => skin(x, s, side)),
        false,
      );
      ctx.stroke();
    }
  };
  flank(near);

  // Bonnet edges, and the lines across the glass.
  ctx.strokeStyle = rgba(edge, (0.16 - 0.02 * night) * (1 - 0.4 * xray));
  ctx.lineWidth = hair;
  for (const side of [1, -1]) {
    path(
      run(60, COWL, 6, 10).map(([x, s]) => onSkin(x, s, side, BONNET)),
      false,
    );
    ctx.stroke();
  }
  for (const x of [COWL, HEADER, ROOF_END, HINGE, GLASS_END]) {
    const part = x > HINGE ? HATCH : 0;
    path(
      [6, 7, 8, 7, 6].map((s, i) => onSkin(x, s, i < 3 ? near : -near, part)),
      false,
    );
    ctx.stroke();
  }
  // X-ray: the outline of the shell, so its shape stays readable.
  if (xray > 0.05) {
    ctx.strokeStyle = rgba(edge, 0.7 * xray);
    ctx.lineWidth = Math.max(hair, 0.26 * k);
    for (const side of [1, -1])
      for (const s of [3, 5, 8]) {
        path(
          run(0, 4790, s, 40).map(([x, t]) => skin(x, t, side)),
          false,
        );
        ctx.stroke();
      }
  }

  for (const index of [0, 1, 2, 3])
    if ((index % 2 ? 1 : -1) === near) wheel(index, true);
  mirror(near);

  /* ----- Lamps ----- */
  const strip = (points: P3[], width: number, colour: string) => {
    ctx.strokeStyle = colour;
    ctx.lineWidth = Math.max(hair, width * k);
    path(points, false);
    ctx.stroke();
  };
  /** A point of the tail bar; where it crosses the tailgate it lifts with it. */
  const onTail = (x: number, t: number, side: number) =>
    onSkin(x, t, side, t >= 6 && x < 4750 ? HATCH : 0);
  const blink = !!car.indicator && (car.blink ?? 1) > 0.5;
  const flashes = (side: number) =>
    blink &&
    (car.indicator === "both" ||
      (car.indicator === "right" ? side > 0 : side < 0));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (frontShows) {
    /** A nose line from the near wing, across the nose, to the far corner. */
    const wrap = (line: Pt[]): P3[] => [
      ...line.map(([x, t]) => onSkin(x, t, near)),
      ...line
        .slice(wingOf(line))
        .reverse()
        .map(([x, t]) => onSkin(x, t, -near)),
    ];
    const gloss = rgba(ghost(mix([2, 3, 5], [10, 13, 15], day), 0.6));
    // The intake, low in the bumper where it rolls under.
    const high = underNose(352),
      low = underNose(246);
    if (dx + dy > 0.45) {
      // It faces down and forward, so it only shows from ahead.
      ctx.fillStyle = gloss;
      path([
        skin(high, 0.64, -1),
        skin(high, 0.64, 1),
        skin(low, 0.74, 1),
        skin(low, 0.74, -1),
      ]);
      ctx.fill();
    }
    // A blank number plate above it.
    ctx.fillStyle = rgba(
      ghost(mix([150, 166, 176], [244, 244, 240], day), 0.5),
    );
    path([
      mm(-2, -186, 548),
      mm(-2, 186, 548),
      mm(underNose(432) - 2, 186, 432),
      mm(underNose(432) - 2, -186, 432),
    ]);
    ctx.fill();
    for (const side of [near, -near]) {
      // On the side turned away, only what has come round the corner shows.
      const seen = (line: Pt[]) =>
        side === near ? line : line.slice(wingOf(line));
      // An upright slot at each outer edge of the bumper.
      if (side === near || dx + dy > 0.8) {
        ctx.fillStyle = gloss;
        path([
          skin(56, 1.35, side),
          skin(56, 2.7, side),
          skin(84, 2.66, side),
          skin(84, 1.3, side),
        ]);
        ctx.fill();
      }
      // Headlamps: dark pods at the corners, wedges pointing inwards.
      // The far pod only shows once the nose is turned well towards us.
      if (side !== near && dx + dy < 0.8) continue;
      const within = ([x, t]: Pt) => x <= 150 && skin(x, t, 1)[1] / MM >= 690;
      ctx.fillStyle = gloss;
      path([
        ...seen(POD_TOP)
          .filter(within)
          .map(([x, t]) => onSkin(x, t, side)),
        ...seen(POD_FOOT)
          .filter(within)
          .reverse()
          .map(([x, t]) => onSkin(x, t, side)),
      ]);
      ctx.fill();
      const lamp = seen(POD_LAMP)
        .filter(([x, t]) => {
          const y = skin(x, t, 1)[1] / MM;
          return x <= 110 && y >= 745 && y <= 915;
        })
        .map(([x, t]) => onSkin(x, t, side));
      if (lamp.length > 1) {
        strip(lamp, 0.3, rgba(mix([60, 70, 76], WHITE, lights)));
        glowDot(
          ctx,
          at(lamp[Math.floor(lamp.length / 2)]),
          1.7 * k,
          WARM,
          0.85 * lights * night,
        );
      }
    }
    // One unbroken bar of light across the nose, in a slim dark housing
    // that swells round each corner and thins to a point on the wing.
    ctx.fillStyle = gloss;
    path([...wrap(NOSE_HOUSING_TOP), ...wrap(NOSE_HOUSING_FOOT).reverse()]);
    ctx.fill();
    const bar = wrap(NOSE_BAR);
    strip(
      bar,
      0.24,
      rgba(mix([44, 52, 58], mix(WARM, WHITE, 0.7), 0.25 + 0.75 * lights)),
    );
    if (night > 0.03)
      glow(ctx, () => {
        strip(bar, 2.6, rgba(WARM, 0.2 * lights * night));
        strip(bar, 0.7, rgba(WHITE, 0.9 * lights * night));
      });
    for (const side of [-1, 1])
      if (flashes(side)) {
        // On the wing where we can see it, at the corner where we cannot.
        const from = side === near ? 0 : wingOf(NOSE_BAR) - 3;
        const flash = NOSE_BAR.slice(from, from + 4).map(([x, t]) =>
          onSkin(x, t, side),
        );
        strip(flash, 0.55, rgba(AMBER));
        glowDot(ctx, at(flash[1]), 1.9 * k, AMBER, 0.5 + 0.5 * night);
      }
  }
  if (rearShows) {
    // A blank number plate on the tailgate, and two low reflectors.
    ctx.fillStyle = rgba(
      ghost(mix([150, 166, 176], [244, 244, 240], day), 0.5),
    );
    path([
      mm(4791, -186, 590),
      mm(4791, 186, 590),
      mm(4780, 186, 484),
      mm(4780, -186, 484),
    ]);
    ctx.fill();
    // Lines round the tail run from the near wing, across the tailgate, to
    // the far corner, where the body hides the rest.
    const round = (line: Pt[]): P3[] => [
      ...line.map(([x, t]) => onTail(x, t, near)),
      ...line
        .slice(wingOf(line))
        .reverse()
        .map(([x, t]) => onTail(x, t, -near)),
    ];
    // With the tailgate up, only what stays on the wings is drawn here.
    const shut = (car.hatch ?? 0) < 0.02;
    const sweep = (line: Pt[]): P3[] =>
      shut
        ? round(line)
        : line.slice(0, wingOf(line)).map(([x, t]) => onSkin(x, t, near));
    ctx.fillStyle = rgba(ghost(mix([5, 7, 9], [33, 38, 41], day), 0.7));
    path([
      ...sweep(BUMPER_TOP),
      ...sweep(BUMPER_TOP.map(([x]): Pt => [x, 1])).reverse(),
    ]);
    ctx.fill();
    ctx.fillStyle = rgba(ghost(mix([2, 3, 5], [10, 13, 15], day), 0.6));
    path([...sweep(HOUSING_TOP), ...sweep(HOUSING_FOOT).reverse()]);
    ctx.fill();
    // The spoiler's trailing edge catches the light.
    ctx.strokeStyle = rgba(
      mix(SKY, [226, 236, 240], day),
      (0.36 - 0.08 * night) * (1 - 0.3 * xray),
    );
    ctx.lineWidth = Math.max(hair, 0.3 * k);
    const lip = [4.7, 5, 5.5, 6, 6.5, 7, 7.5, 8].filter((t) => shut || t >= 6);
    path(
      [
        ...lip.map((t) => onTail(4614, t, near)),
        ...[...lip].reverse().map((t) => onTail(4614, t, -near)),
      ],
      false,
    );
    ctx.stroke();
    const bar = round(TAIL_BAR);
    const strength = (0.5 + 0.5 * braking) * lights;
    // The tailgate's cut: down each side of the panel and across its foot.
    ctx.strokeStyle = rgba(edge, (0.2 - 0.04 * night) * (1 - 0.4 * xray));
    ctx.lineWidth = hair;
    const foot = TAIL_SHUT.filter(([, t]) => t >= TAIL_CUT);
    path(
      [
        ...TAIL_SPILL.filter(([, t]) => t >= TAIL_CUT)
          .slice(0, 1)
          .map(([x]) => onSkin(x, TAIL_CUT, -1)),
        ...foot.map(([x, t]) => onSkin(x, t, -1)),
        ...[...foot].reverse().map(([x, t]) => onSkin(x, t, 1)),
        ...TAIL_SPILL.filter(([, t]) => t >= TAIL_CUT)
          .slice(0, 1)
          .map(([x]) => onSkin(x, TAIL_CUT, 1)),
      ],
      false,
    );
    ctx.stroke();
    // Slim reflectors, high in the black bumper towards each corner.
    for (const side of [-1, 1])
      strip(
        TAIL_REFLECTOR.filter(([, t]) => t > 4.3 && t < 6.1).map(([x, t]) =>
          onSkin(x, t, side),
        ),
        0.3,
        rgba(ghost(mix([84, 20, 18], [172, 40, 30], day), 0.5)),
      );
    strip(
      bar,
      0.42 + 0.2 * braking,
      rgba(
        mix([84, 24, 20], mix(RED, WHITE, 0.2 * braking), 0.3 + 0.7 * strength),
      ),
    );
    if (night > 0.03)
      glow(ctx, () => {
        strip(round(TAIL_SPILL), 2.6, rgba(RED, 0.13 * strength * night));
        strip(bar, 3.2, rgba(RED, 0.24 * strength * night));
        strip(bar, 0.8, rgba(RED, strength * night));
      });
    if (braking > 0.05) {
      // The high brake lamp, at the top of the tailgate glass.
      const lamp = [-250, 250].map((y) =>
        move(mm(3810, y, zTop(3810) + 4), HATCH),
      );
      strip(lamp, 0.34, rgba(RED, braking));
      if (night > 0.03)
        glow(ctx, () => strip(lamp, 1.6, rgba(RED, 0.4 * braking * night)));
    }
    for (const side of [-1, 1]) {
      glowDot(
        ctx,
        at(onTail(...TAIL_BAR[wingOf(TAIL_BAR) - 2], side)),
        (1.5 + 0.9 * braking) * k,
        RED,
        (0.3 + 0.6 * braking) * lights * night,
      );
      if (flashes(side)) {
        strip(
          [skin(4470, 3.66, side), skin(4610, 3.66, side)],
          0.55,
          rgba(AMBER),
        );
        glowDot(
          ctx,
          at(skin(4540, 3.66, side)),
          1.9 * k,
          AMBER,
          0.5 + 0.5 * night,
        );
      }
    }
  }
  ctx.lineCap = "butt";

  // The charge door, hinged up from the left tail lamp, and the socket behind it.
  const port = clamp(car.port ?? 0);
  if (port > 0.02 && near < 0) {
    // It is the forward part of the lamp housing on the wing.
    const on = (line: Pt[], i: number) => skin(line[i][0], line[i][1], -1);
    const a = on(HOUSING_FOOT, 2),
      b = on(HOUSING_FOOT, 6),
      c = on(HOUSING_TOP, 6),
      d = on(HOUSING_TOP, 2);
    ctx.fillStyle = rgba(mix([2, 3, 5], [7, 9, 11], day));
    path([a, b, c, d]);
    ctx.fill();
    // The door swings up and out about its top edge.
    const lifted = (low: P3, high: P3): P3 => [
      high[0],
      high[1] - Math.sin(port * 1.5) * 1.5,
      high[2] + (high[2] - low[2]) * Math.sin(port * 1.5),
    ];
    ctx.fillStyle = rgba(mix([34, 50, 64], [58, 66, 70], day));
    path([d, c, lifted(b, c), lifted(a, d)]);
    ctx.fill();
    const socket = on(HOUSING_FOOT, 4),
      over = on(HOUSING_TOP, 4);
    const [sx, sy] = at([
      socket[0],
      (socket[1] + over[1]) / 2,
      (socket[2] + over[2]) / 2,
    ]);
    ctx.fillStyle = rgba(mix(view.pal.accent, WHITE, 0.35));
    ctx.beginPath();
    ctx.arc(sx, sy, 0.62 * k, 0, TAU);
    ctx.fill();
    glowDot(ctx, [sx, sy], 1.2 * k, view.pal.accent, 0.7 * port * night);
  }
}
