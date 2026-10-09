/**
 * Range & charging, B. The choreography the A scene was liked for, rebuilt:
 * the plug crosses to the port; the shell turns to glass while the battery
 * fills, each car's charging time racing on its label; then the camera pulls
 * back until the street is a dot on a map and each car's claimed range
 * spreads over it as a ring, to scale with the other.
 */
import { cabinItems, carItems, onCar, placed } from "./car";
import { figure, hero, numberIn, offset, pair } from "./common";
import { type Item } from "./gl";
import {
  TAU,
  clamp,
  colour,
  css,
  glide,
  hash,
  lerp,
  ramp,
  settle,
  span,
  type V2,
  type V3,
} from "./math";
import { bloom, brief, pill, spot } from "./overlay";
import { scene, type Plate, type Shot } from "./stage";
import {
  PAINT,
  WHITE,
  box,
  cable,
  charger,
  chargerHolster,
  clay,
  gloss,
  ground,
  mass,
  ribbon,
  surroundings,
} from "./world";

const GREEN = colour("#2fbf5b"),
  GREEN_CSS = "#2fbf5b";
const STARTS: [number, number, number] = [0, 5.4, 11];
const LOOP = 17;
const AZ = -45;

/** Reversed into the bay, so the charge port at its left rear faces us. */
const CAR = placed(0, 0, Math.PI);
const POST: V3 = [3.75, -1.45, 0];
const POST_TURN = 150 * (Math.PI / 180);

/** The town round the charging bay: only there to shrink as the camera leaves. */
function town(): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < 26; i++) {
    const a = hash(i * 3.3) * TAU,
      r = 26 + hash(i * 7.1) * 150;
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    if (Math.abs(x - 14) < 6) continue;
    items.push(
      ...mass(
        [x, y, 0],
        [8 + hash(i + 0.4) * 12, 8 + hash(i + 0.7) * 10, 4 + hash(i + 0.2) * 9],
      ),
    );
  }
  return items;
}

export const rangeSceneB = scene({
  beats: ["Plug in", "Charge", "Range"],
  starts: STARTS,
  loop: LOOP,
  still: 8.6,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const baseKm = figure(base, "range_km") ?? spec?.rangeKm ?? 480,
      rivalKm = figure(rival, "range_km") ?? spec?.rivalRangeKm;
    const far = Math.max(baseKm, rivalKm ?? 0) * 1000;

    // Camera: on the bay, closer for the battery, then away to the map.
    const subject: V3 = [1.3, -0.5, 0.75];
    const near = (right: number, fit: V2): Omit<Shot, "at"> => ({
      target: offset(subject, AZ, wide ? right : 0.2, wide ? 0.45 : 0.45),
      az: AZ,
      el: 31,
      fit,
    });
    const map: Omit<Shot, "at"> = {
      target: [0, 0, 0],
      az: AZ,
      el: 46,
      fit: wide ? [far * 3.3, far * 1.72] : [far * 2.5, far * 2.2],
    };
    const shots: Shot[] = [
      { at: 0, ...near(1.5, wide ? [13.92, 6.0] : [10.08, 10.08]) },
      { at: 5.2, ...near(1.4, wide ? [13.2, 5.7] : [9.74, 9.74]) },
      { at: 6.9, ...near(0.9, wide ? [13.44, 5.76] : [9.18, 9.18]) },
      { at: 10.9, ...near(0.9, wide ? [12.96, 5.58] : [8.96, 8.96]) },
      { at: 14.3, ...map },
      { at: LOOP, ...map, fit: [map.fit[0] * 1.05, map.fit[1] * 1.05] },
    ];
    let i = 1;
    while (i < shots.length - 1 && t > shots[i].at) i += 1;
    const a = shots[i - 1],
      b = shots[i];
    const f = glide(clamp((t - a.at) / (b.at - a.at)));
    const fit: V2 = [
      Math.exp(lerp(Math.log(a.fit[0]), Math.log(b.fit[0]), f)),
      Math.exp(lerp(Math.log(a.fit[1]), Math.log(b.fit[1]), f)),
    ];
    // The target keeps pace with the width, so the bay stays in frame as it shrinks.
    const g =
      Math.abs(a.fit[0] - b.fit[0]) > 1e-6
        ? (fit[0] - a.fit[0]) / (b.fit[0] - a.fit[0])
        : f;
    const shot: Shot = {
      at: t,
      target: [
        lerp(a.target[0], b.target[0], g),
        lerp(a.target[1], b.target[1], g),
        lerp(a.target[2], b.target[2], g),
      ],
      az: AZ,
      el: lerp(a.el, b.el, f),
      fit,
    };
    /** 0 on the street, 1 once it has become a map. */
    const away = ramp(Math.log(60), Math.log(4000), Math.log(fit[0]));

    // Plugging in: the plug leaves the post and crosses to the port.
    const port = onCar(model, CAR, 4.5, 0.83, 1.07);
    const holster = chargerHolster(POST, POST_TURN);
    const carried = ramp(0.9, 2.7, t, glide);
    const seated = ramp(2.55, 2.95, t, settle);
    const reach: V3 = [port[0] + 0.05, port[1] - 0.34, port[2] + 0.04];
    const plug: V3 =
      seated > 0
        ? [
            lerp(reach[0], port[0], seated),
            lerp(reach[1], port[1] - 0.06, seated),
            lerp(reach[2], port[2], seated),
          ]
        : [
            lerp(holster[0], reach[0], carried),
            lerp(holster[1], reach[1], carried),
            lerp(holster[2], reach[2], carried) +
              0.22 * Math.sin(Math.PI * carried),
          ];

    // Charging: both cars' 10–80% times, each at its own pace.
    const minutes = [base, rival].map(
      (car) => numberIn(car.facts.dc_charge_time_min) ?? 0,
    );
    const slowest = Math.max(minutes[0], minutes[1], 1);
    const level = (m: number) =>
      m ? 0.1 + 0.7 * ramp(6.6, 6.6 + 3.5 * (m / slowest), t, (v) => v) : 0.1;
    const xray = span(5.5, 11, t, 0.9);

    const items: Item[] = [
      ground(shot.target, fit[0], 0.05, [fit[0] / 34, 0.2 * away]),
    ];
    if (away < 0.995) {
      items.push(
        ...carItems(model, {
          at: CAR,
          paint: PAINT,
          xray,
          lamps: 0.15,
          tail: 0.25 + 0.5 * seated * (1 - ramp(4, 5, t)),
        }),
      );
      if (xray > 0.01)
        items.push(
          ...cabinItems(model, {
            at: CAR,
            seats: spec?.seats ?? 5,
            pack: { fill: level(minutes[0]), colour: GREEN, glow: 0.5 },
          }),
        );
      // The bay: lines, a wheel stop, and the kerb the posts stand on.
      for (const y of [-1.45, 1.45])
        items.push(
          ribbon(
            `bay ${y}`,
            [
              [-2.9, y],
              [3.05, y],
            ],
            0.12,
            WHITE,
            0.95,
          ),
        );
      items.push(
        box([0.2, 1.9, 0.1], [-2.7, 0, 0], clay(), 0.04),
        box([1.5, 9, 0.13], [4.05, 0.6, 0], clay(), 0.04),
        ...charger(POST, POST_TURN),
        ...charger([3.75, 1.45, 0], POST_TURN),
        box(
          [0.95, 8, 0.85],
          [5.6, 0.6, 0],
          clay(WHITE, { p: [0, 0, 0, 0.22] }),
          0.17,
        ),
        cable("lead", holster, plug, 0.3 + 0.25 * (1 - carried)),
        box(
          [0.07, 0.16, 0.07],
          [plug[0], plug[1] - 0.02, plug[2] - 0.035],
          gloss(colour("#2a2d31"), 0.05),
          0.02,
        ),
      );
      items.push(...surroundings([0.5, 0, 0], AZ, 6, 5));
      if (fit[0] > 30) items.push(...town());
    }

    const labels = (plate: Plate) => {
      const { ctx } = plate;
      const side = plate.wide ? "left" : "centre";
      // Plug in: peak charging power, for both.
      const power = span(3, 5.25, t, 0.45);
      const top: V3 = [POST[0], POST[1], 2.02];
      const kw = (car: typeof base) => {
        const value = car.facts.dc_peak_kw;
        return typeof value === "number"
          ? `${value} kW peak`
          : brief(String(value ?? ""), 22);
      };
      pill(plate, top, base.name, kw(base), {
        tone: "dark",
        alpha: power,
        anchor: side,
        dx: plate.wide ? 16 : 0,
        dy: -62,
        tie: top,
      });
      pill(plate, top, rival.name, kw(rival), {
        alpha: power,
        anchor: side,
        dx: plate.wide ? 16 : 0,
        dy: -27,
      });
      bloom(plate, port, 0.5, GREEN, seated * (1 - away) * (0.5 + 0.3 * xray));

      // Charge: 10–80%, with each car's bar filling at its own rate.
      const charging = span(6.2, 10.9, t, 0.45);
      const roof: V3 = [0, 0, 1.75];
      const time = (car: typeof base, m: number) => {
        const value = car.facts.dc_charge_time_min;
        return typeof value === "string"
          ? value
          : m
            ? `${m} min`
            : "Not stated";
      };
      pill(plate, roof, base.name, `10–80% in ${time(base, minutes[0])}`, {
        tone: "dark",
        alpha: charging,
        dy: -74,
        level: (level(minutes[0]) - 0.1) / 0.7,
        bar: GREEN_CSS,
        tie: roof,
      });
      pill(plate, roof, rival.name, time(rival, minutes[1]), {
        alpha: charging,
        dy: -39,
        level: (level(minutes[1]) - 0.1) / 0.7,
        bar: GREEN_CSS,
      });

      // Range: a ring for each car, to scale with the other.
      const spread = ramp(12.6, 15.2, t, glide);
      if (spread > 0.001) {
        const circle = (km: number, grown: number) =>
          Array.from({ length: 121 }, (_, k): V2 => {
            const angle = (k / 120) * TAU;
            return spot(plate, [
              Math.cos(angle) * km * 1000 * grown,
              Math.sin(angle) * km * 1000 * grown,
              0,
            ]);
          });
        const draw = (points: V2[]) => {
          ctx.beginPath();
          points.forEach(([x, y], k) =>
            k ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
          );
          ctx.closePath();
        };
        ctx.save();
        ctx.lineJoin = "round";
        // Every hundred kilometres, faintly.
        ctx.strokeStyle = "rgba(34,39,43,0.1)";
        ctx.lineWidth = plate.unit;
        for (let km = 100; km < Math.max(baseKm, rivalKm ?? 0); km += 100) {
          draw(circle(km, ramp(0, 0.6, spread)));
          ctx.globalAlpha = ramp(0.1, 0.5, spread);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        draw(circle(baseKm, spread));
        ctx.fillStyle = css(GREEN, 0.07 * spread);
        ctx.fill();
        ctx.strokeStyle = GREEN_CSS;
        ctx.lineWidth = 2.6 * plate.unit;
        ctx.stroke();
        if (rivalKm) {
          draw(circle(rivalKm, ramp(0.25, 1, spread)));
          ctx.setLineDash([7 * plate.unit, 6 * plate.unit]);
          ctx.strokeStyle = "rgba(34,39,43,0.7)";
          ctx.lineWidth = 1.8 * plate.unit;
          ctx.globalAlpha = ramp(0.25, 0.6, spread);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        // Where it started.
        const [cx, cy] = spot(plate, [0, 0, 0]);
        ctx.globalAlpha = ramp(0, 0.3, spread);
        ctx.fillStyle = GREEN_CSS;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5 * plate.unit, 0, TAU);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6 * plate.unit;
        ctx.stroke();
        ctx.restore();

        const named =
          ramp(14.2, 14.9, t) * (1 - ramp(LOOP - 0.8, LOOP - 0.5, t));
        const edge = (km: number, angle: number): V3 => [
          Math.cos(angle) * km * 1000,
          Math.sin(angle) * km * 1000,
          0,
        ];
        const basis = (car: typeof base) =>
          String(car.facts.range_km ?? "") && "claimed";
        pill(
          plate,
          edge(baseKm, Math.PI / 4),
          base.name,
          `${baseKm} km ${basis(base)}`,
          {
            tone: "dark",
            alpha: named,
            anchor: "right",
            dx: -14,
            pop: lerp(0.9, 1, named),
          },
        );
        if (rivalKm)
          pill(
            plate,
            edge(rivalKm, (-3 * Math.PI) / 4),
            rival.name,
            `${rivalKm} km`,
            {
              alpha: named,
              anchor: "left",
              dx: 14,
              pop: lerp(0.9, 1, named),
            },
          );
      }
    };
    return { shot, items, labels };
  },
});
