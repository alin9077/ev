import type { Car } from "@/lib/types";
import { avatarProfile, WHEELBASE_SHARE } from "@/lib/car-avatar-shapes";

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
  const profile = avatarProfile(car);
  const s = profile.kind === "class" ? undefined : profile.shape;
  if (!s)
    return (
      <svg
        className="car-avatar"
        viewBox="0 0 96 38"
        aria-hidden="true"
        focusable="false"
      >
        <rect
          x="1"
          y="5"
          width="94"
          height="28"
          rx="14"
          fill="none"
          stroke="currentColor"
          opacity=".35"
        />
        <path d="M21 9 14 20h6l-3 10 12-15h-7l4-6Z" fill="currentColor" />
        <text x="39" y="25" fill="currentColor" fontSize="14" letterSpacing="3">
          EV
        </text>
      </svg>
    );
  const lengthMm = mm(car, "length_mm", 4600);
  const length = lengthMm * SCALE,
    height = mm(car, "height_mm", 1620) * SCALE,
    wheelbase = mm(car, "wheelbase_mm", lengthMm * WHEELBASE_SHARE) * SCALE;
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
