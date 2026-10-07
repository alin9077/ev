import type { Car } from "@/lib/types";

/**
 * Original side-profile drawings, one per model, each drawn to the listed
 * length, height and wheelbase. Points run front to rear as a share of length
 * and ground to roof as a share of height.
 */
type Pt = [number, number];
type Shape = {
  /** Front overhang and tyre diameter, mm. */
  overhang: number;
  tyre: number;
  /** Underside of the body. */
  sill: number;
  /** Leading edge of the bonnet. */
  nose: number;
  /** Base of the windscreen. */
  cowl: Pt;
  /** Top of the windscreen, then the highest point of the roof. */
  roofFrom: number;
  peak: number;
  /** Where the roof ends or starts to fall away. */
  roofTo: Pt;
  /** Tip of a roof spoiler, on upright tailgates. */
  spoiler?: Pt;
  /** Foot of the rear glass. */
  tail: Pt;
  /** End of a separate boot deck, on sedans. */
  deck?: Pt;
  /** Widest point of the rear. */
  rear: number;
  /** Side glass outline and the pillars that divide it. */
  glass: string;
  pillars: Pt[];
  cladding?: "thin" | "thick" | "square";
  rails?: Pt;
  wheel?: "block";
  /** Extra trim, such as a patterned rear pillar. */
  trim?: string;
};
const shapes: Record<string, Shape> = {
  tesla_model_y: {
    overhang: 880,
    tyre: 720,
    sill: 0.115,
    nose: 0.47,
    cowl: [0.27, 0.6],
    roofFrom: 0.44,
    peak: 0.53,
    roofTo: [0.63, 0.985],
    tail: [0.935, 0.745],
    rear: 0.52,
    glass:
      "M.305,.63 L.452,.925 Q.56,.965 .68,.9 Q.79,.83 .868,.7 L.855,.665 Z",
    pillars: [
      [0.53, 0.52],
      [0.7, 0.71],
    ],
  },
  tesla_model_3: {
    overhang: 850,
    tyre: 670,
    sill: 0.11,
    nose: 0.5,
    cowl: [0.28, 0.63],
    roofFrom: 0.46,
    peak: 0.53,
    roofTo: [0.61, 0.98],
    tail: [0.885, 0.765],
    deck: [0.975, 0.735],
    rear: 0.56,
    glass: "M.315,.66 L.472,.93 Q.56,.96 .66,.905 Q.76,.84 .835,.735 L.82,.7 Z",
    pillars: [
      [0.545, 0.535],
      [0.7, 0.715],
    ],
  },
  byd_sealion_7: {
    overhang: 900,
    tyre: 740,
    sill: 0.125,
    nose: 0.53,
    cowl: [0.27, 0.62],
    roofFrom: 0.45,
    peak: 0.54,
    roofTo: [0.66, 0.975],
    tail: [0.95, 0.725],
    rear: 0.55,
    glass:
      "M.3,.645 L.46,.925 Q.58,.96 .7,.9 Q.8,.84 .875,.76 L.8,.705 L.62,.67 Z",
    pillars: [
      [0.54, 0.53],
      [0.7, 0.715],
    ],
    cladding: "thin",
  },
  geely_ex5: {
    overhang: 880,
    tyre: 700,
    sill: 0.125,
    nose: 0.57,
    cowl: [0.26, 0.645],
    roofFrom: 0.42,
    peak: 0.55,
    roofTo: [0.82, 0.965],
    spoiler: [0.905, 0.925],
    tail: [0.955, 0.71],
    rear: 0.56,
    glass: "M.29,.665 L.43,.925 Q.6,.955 .8,.91 L.885,.865 L.86,.775 L.74,.7 Z",
    pillars: [
      [0.52, 0.51],
      [0.7, 0.71],
      [0.795, 0.81],
    ],
    cladding: "thin",
    rails: [0.47, 0.8],
  },
  zeekr_7x: {
    overhang: 870,
    tyre: 740,
    sill: 0.12,
    nose: 0.53,
    cowl: [0.26, 0.615],
    roofFrom: 0.43,
    peak: 0.53,
    roofTo: [0.78, 0.955],
    spoiler: [0.885, 0.905],
    tail: [0.95, 0.7],
    rear: 0.55,
    glass:
      "M.29,.635 L.44,.925 Q.58,.955 .76,.9 L.855,.845 L.825,.72 L.7,.68 Z",
    pillars: [
      [0.53, 0.52],
      [0.705, 0.715],
    ],
    cladding: "thin",
  },
  jaecoo_j5_ev: {
    overhang: 850,
    tyre: 690,
    sill: 0.125,
    nose: 0.61,
    cowl: [0.25, 0.685],
    roofFrom: 0.38,
    peak: 0.46,
    roofTo: [0.88, 0.935],
    spoiler: [0.935, 0.915],
    tail: [0.972, 0.73],
    rear: 0.56,
    glass: "M.28,.705 L.39,.925 Q.6,.95 .87,.88 L.92,.855 L.9,.79 L.7,.755 Z",
    pillars: [
      [0.5, 0.49],
      [0.68, 0.69],
      [0.8, 0.81],
    ],
    cladding: "thick",
  },
  byd_atto_2: {
    overhang: 830,
    tyre: 670,
    sill: 0.125,
    nose: 0.58,
    cowl: [0.25, 0.665],
    roofFrom: 0.4,
    peak: 0.5,
    roofTo: [0.84, 0.965],
    spoiler: [0.915, 0.94],
    tail: [0.958, 0.72],
    rear: 0.56,
    glass:
      "M.28,.685 L.41,.925 Q.6,.955 .84,.915 L.9,.885 L.872,.8 L.72,.705 Z",
    pillars: [
      [0.51, 0.5],
      [0.7, 0.71],
      [0.8, 0.81],
    ],
    cladding: "thick",
    rails: [0.45, 0.82],
  },
  kia_ev5: {
    overhang: 880,
    tyre: 720,
    sill: 0.125,
    nose: 0.62,
    cowl: [0.24, 0.685],
    roofFrom: 0.37,
    peak: 0.5,
    roofTo: [0.9, 0.975],
    spoiler: [0.955, 0.955],
    tail: [0.978, 0.73],
    rear: 0.52,
    glass: "M.27,.7 L.38,.925 Q.62,.95 .9,.92 L.94,.895 L.922,.745 L.7,.705 Z",
    pillars: [
      [0.5, 0.49],
      [0.69, 0.7],
      [0.83, 0.8],
    ],
    cladding: "square",
    rails: [0.43, 0.86],
    wheel: "block",
  },
  kia_ev3: {
    overhang: 810,
    tyre: 690,
    sill: 0.125,
    nose: 0.6,
    cowl: [0.25, 0.675],
    roofFrom: 0.39,
    peak: 0.5,
    roofTo: [0.86, 0.955],
    spoiler: [0.93, 0.93],
    tail: [0.968, 0.73],
    rear: 0.54,
    glass:
      "M.28,.69 L.4,.925 Q.6,.955 .85,.9 L.91,.868 L.888,.79 L.78,.765 L.66,.695 Z",
    pillars: [
      [0.51, 0.5],
      [0.69, 0.7],
      [0.81, 0.78],
    ],
    cladding: "square",
    wheel: "block",
  },
  byd_atto_3_evo: {
    overhang: 870,
    tyre: 690,
    sill: 0.125,
    nose: 0.56,
    cowl: [0.26, 0.645],
    roofFrom: 0.42,
    peak: 0.52,
    roofTo: [0.78, 0.955],
    spoiler: [0.895, 0.91],
    tail: [0.95, 0.7],
    rear: 0.56,
    glass: "M.29,.665 L.43,.925 Q.58,.955 .78,.9 L.855,.855 L.83,.79 L.72,.7 Z",
    pillars: [
      [0.52, 0.51],
      [0.7, 0.71],
    ],
    cladding: "thin",
    rails: [0.46, 0.76],
    trim: "M.868,.84 L.905,.74 M.885,.85 L.922,.75 M.902,.855 L.935,.765",
  },
};
shapes.byd_atto_3_legacy = shapes.byd_atto_3_evo;

const WIDTH = 96,
  HEIGHT = 38,
  GROUND = 36.5,
  SCALE = 90 / 4900;
const mm = (car: Car, key: string, fallback: number) => {
  const value = car.facts[key]?.value;
  return typeof value === "number" ? value : fallback;
};
const n = (v: number) => Math.round(v * 100) / 100;

export function CarAvatar({ car }: { car: Car }) {
  const s = shapes[car.modelId] ?? shapes.geely_ex5;
  const length = mm(car, "length_mm", 4600) * SCALE,
    height = mm(car, "height_mm", 1620) * SCALE,
    wheelbase = mm(car, "wheelbase_mm", 2750) * SCALE;
  const left = (WIDTH - length) / 2;
  const x = (f: number) => n(left + f * length),
    y = (f: number) => n(GROUND - f * height),
    at = (px: number, py: number) => `${x(px)} ${y(py)}`;
  /** Places a path written in shares of length and height. */
  const place = (d: string) =>
    d.replace(/(-?[\d.]+),(-?[\d.]+)/g, (_, px, py) => at(+px, +py));
  const sill = y(s.sill),
    wheel = (s.tyre * SCALE) / 2,
    arch = wheel + 1.1,
    axle = n(GROUND - wheel),
    front = n(left + s.overhang * SCALE),
    rear = n(front + wheelbase);
  // The axle sits above the sill, so each arch is more than a half circle.
  const drop = axle - sill,
    gap = Math.sqrt(arch * arch - drop * drop);
  const [cowlX, cowlY] = s.cowl,
    [roofX, roofY] = s.roofTo,
    [tailX, tailY] = s.tail;
  const body = [
    `M${x(0.04)} ${sill}`,
    `Q${x(0)} ${sill} ${at(0.003, 0.25)}`,
    `L${at(0.007, s.nose - 0.1)}`,
    `Q${at(0.01, s.nose)} ${at(0.075, s.nose + 0.035)}`,
    `Q${at((0.075 + cowlX) / 2, (s.nose + cowlY) / 2 + 0.04)} ${at(cowlX, cowlY)}`,
    `L${at(s.roofFrom, 0.975)}`,
    `Q${at((s.roofFrom + s.peak) / 2, 1.005)} ${at(s.peak, 1)}`,
    `Q${at((s.peak + roofX) / 2 + 0.03, 1)} ${at(roofX, roofY)}`,
    s.spoiler
      ? `L${at(...s.spoiler)}L${at(s.spoiler[0] - 0.004, s.spoiler[1] - 0.035)}L${at(tailX, tailY)}`
      : `Q${at((roofX + tailX) / 2 + 0.02, (roofY + tailY) / 2 + 0.07)} ${at(tailX, tailY)}`,
    s.deck ? `L${at(...s.deck)}` : "",
    `Q${at(1, (s.deck?.[1] ?? tailY) - 0.02)} ${at(0.998, s.rear)}`,
    `L${at(0.994, 0.27)}`,
    `Q${x(0.99)} ${sill} ${x(0.955)} ${sill}`,
    `H${n(rear + gap)}`,
    `A${n(arch)} ${n(arch)} 0 1 0 ${n(rear - gap)} ${sill}`,
    `H${n(front + gap)}`,
    `A${n(arch)} ${n(arch)} 0 1 0 ${n(front - gap)} ${sill}`,
    "Z",
  ].join("");
  const guard = (cx: number) => {
    if (s.cladding === "square") {
      const a = arch + 1.6;
      return `M${n(cx - a - 1)} ${sill}L${n(cx - a)} ${n(axle - a * 0.5)}L${n(cx - a * 0.55)} ${n(axle - a)}H${n(cx + a * 0.55)}L${n(cx + a)} ${n(axle - a * 0.5)}L${n(cx + a + 1)} ${sill}Z`;
    }
    const a = arch + (s.cladding === "thick" ? 1.7 : 0.9),
      reach = n(Math.sqrt(a * a - drop * drop));
    return `M${n(cx - reach)} ${sill}A${n(a)} ${n(a)} 0 1 1 ${n(cx + reach)} ${sill}Z`;
  };
  const band = s.cladding === "thin" ? 0.9 : 1.6;
  const spokes = [0, 1, 2, 3, 4].map((i) => {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2,
      r = wheel * 0.66;
    return [n(Math.cos(angle) * r), n(Math.sin(angle) * r)];
  });
  return (
    <svg
      className="car-avatar"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      aria-hidden="true"
      focusable="false"
    >
      <path className="car-avatar-body" d={body} />
      {s.cladding && (
        <path
          className="car-avatar-cladding"
          d={`${guard(front)}${guard(rear)}M${front} ${sill}H${rear}V${n(sill - band)}H${front}Z`}
        />
      )}
      <path className="car-avatar-glass" d={place(s.glass)} />
      {s.pillars.map(([top, foot]) => (
        <path
          key={top}
          className="car-avatar-pillar"
          d={`M${at(top, 0.97)}L${at(foot, cowlY)}`}
        />
      ))}
      {s.rails && (
        <path
          className="car-avatar-line"
          d={`M${at(s.rails[0], 1.035)}H${x(s.rails[1])}`}
        />
      )}
      {s.trim && <path className="car-avatar-line" d={place(s.trim)} />}
      <path
        className="car-avatar-line"
        d={`M${at(cowlX + 0.035, cowlY + 0.075)}h-2.2M${at(0.012, s.nose - 0.03)}L${at(0.07, s.nose + 0.005)}M${at(0.997, s.rear + 0.06)}L${at(0.945, s.rear + 0.085)}`}
      />
      {[front, rear].map((cx) => (
        <g key={cx} transform={`translate(${cx} ${axle})`}>
          <circle className="car-avatar-tyre" r={n(wheel)} />
          <circle className="car-avatar-rim" r={n(wheel * 0.66)} />
          {s.wheel === "block" ? (
            <path
              className="car-avatar-tyre"
              d={`M${n(-wheel * 0.36)} ${n(-wheel * 0.36)}h${n(wheel * 0.72)}v${n(wheel * 0.72)}h${n(-wheel * 0.72)}Z`}
            />
          ) : (
            <path
              className="car-avatar-spoke"
              d={spokes.map(([sx, sy]) => `M0 0L${sx} ${sy}`).join("")}
            />
          )}
        </g>
      ))}
    </svg>
  );
}
