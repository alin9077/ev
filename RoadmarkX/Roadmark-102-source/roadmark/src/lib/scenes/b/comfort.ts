/**
 * Comfort & drive, B: a quiet cabin, ready before you arrive. The car is
 * parked in a lay-by on a street with traffic. The noise of each passing car
 * spreads across the road and thins to almost nothing where it meets the
 * car's glass. Then its owner, still over by the houses, sets the climate
 * from a phone and the cabin goes from warm to cool. Last, they walk over,
 * get in, and the car pulls away without a fuss.
 */
import { cabinItems, carItems, placed } from "./car";
import {
  answer,
  dotFor,
  faced,
  figure,
  has,
  hero,
  offset,
  paced,
  pair,
  stand,
  walk,
} from "./common";
import { type Item } from "./gl";
import {
  TAU,
  colour,
  compose,
  curve,
  mix3,
  ramp,
  rotateZ,
  scale,
  settle,
  span,
  track,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, brief, caption, flow, pill, ripples } from "./overlay";
import { scene, type Plate } from "./stage";
import { BAY, BLOCK, LANE, route, sidle, townBlock } from "./town";
import { PAINT, WHITE, ground, person, ribbon } from "./world";

const STARTS: [number, number, number] = [0, 6, 12];
const LOOP = 19.4;
const AZ = -58,
  EL = 35;
const BLUE = colour("#2f8fdc"),
  AMBER = colour("#ee8a3a"),
  GREY = colour("#6c7177");
const PACE = 1.85;
/** From the bench by the houses, round the nose, to the driver's door. */
const TO_CAR = walk([
  [BAY[0] + 4.9, 7.4],
  [BAY[0] + 4.6, 5.3],
  [BAY[0] + 3.1, 3.3],
  [BAY[0] - 0.3, 3.3],
]);
const T_WALK = 12.1,
  T_IN = T_WALK + TO_CAR.total / PACE + 0.45,
  T_GO = T_IN + 0.5;
/** Out of the lay-by and into the lane. */
const AWAY = route([
  BAY,
  ...sidle([BAY[0] + 0.6, BAY[1]], 10, LANE),
  [BAY[0] + 40, LANE],
]);
const AWAY_GONE = curve([
  [T_GO, 0],
  [T_GO + 1.2, 1.5],
  [LOOP, 9.5],
  [LOOP + 2, 22],
]);
/** The traffic: lane, the moment each car is level with the lay-by, and its speed. */
const PASSING: [number, number, number][] = [
  [1, 1.9, 8],
  [-1, 3.3, 8.5],
  [1, 4.9, 7.5],
  [-1, 8.4, 8],
  [-1, 11.2, 8.5],
  [1, 12.6, 8],
];

export const comfortSceneB = scene({
  beats: ["Quiet cabin", "Climate before you arrive", "Smooth away"],
  starts: STARTS,
  loop: LOOP,
  still: 9.6,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);

    const gone = t > T_GO ? AWAY_GONE(t) : 0;
    const car = AWAY.at(gone);
    const xray = 0.6 * span(0.9, T_IN - 0.4, t, 0.8);
    /** 0 warm – 1 cool: the cabin as the climate works. */
    const cooled = ramp(7.6, 10.6, t);
    const climate = span(6.3, 11.8, t, 0.6);

    const across = track(t, [
      [0, wide ? 23 : 13.5],
      [5.8, wide ? 21.5 : 12.8],
      [11.8, wide ? 21.5 : 12.8],
      [T_GO, wide ? 23 : 13.6],
      [LOOP, wide ? 25 : 14.4],
    ]);
    const shot = {
      at: t,
      target: offset(
        [BAY[0] + 0.6 + gone * 0.45, 3.4, 0.6],
        AZ,
        wide ? 1.8 : 0,
        wide ? 0.6 : 0,
      ),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.04),
      ...townBlock(-1),
      ...townBlock(0),
      ...carItems(model, {
        at: placed(car.x, car.y, car.heading),
        paint: PAINT,
        xray,
        lamps: t > T_IN ? 0.8 : 0.1,
        tail: 0.25,
        roll: gone / model.shape.wheelR,
        steer: (AWAY.at(gone + 1.6).heading - car.heading) * 1.2,
      }),
    ];
    if (xray > 0.01)
      items.push(
        ...cabinItems(model, {
          at: placed(car.x, car.y, car.heading),
          seats: spec?.seats ?? 5,
          seat: () => ({
            glow: mix3(AMBER, BLUE, cooled),
            amount: 0.75 * climate,
          }),
        }),
      );

    // Passing traffic, and where each one is: the sources of the noise.
    const sources: V3[] = [];
    for (const [side, level, speed] of PASSING) {
      const x = BAY[0] + side * speed * (t - level);
      if (Math.abs(x - BAY[0]) > 34) continue;
      const y = side * LANE;
      items.push(
        ...carItems(stand(), {
          at: placed(x, y, side > 0 ? 0 : Math.PI),
          paint: WHITE,
          clay: true,
          roll: (side * x) / 0.37,
        }),
      );
      if (t < 6.4) sources.push([x, y, 0.05]);
    }
    // A parked car further up, and a couple of people on the street.
    items.push(
      ...carItems(stand(), {
        at: placed(-2.5, 19, Math.PI / 2),
        paint: WHITE,
        clay: true,
      }),
    );
    for (const [x, y, facing] of [
      [BAY[0] - 6.5, 7.6, 0.4],
      [BAY[0] - 7.3, 7.9, 3.4],
      [-5.6, -5.4, 1.2],
      [BAY[0] - 2, -5.8, 1.9],
    ] as const)
      items.push(...person(compose(translate(x, y, 0), rotateZ(facing))));

    // The owner: by the bench, then walking over, then in the car.
    const walked = paced(t - T_WALK, PACE, TO_CAR.total);
    const who = TO_CAR.at(walked);
    if (t < T_IN)
      items.push(
        ...person(
          compose(
            translate(who.x, who.y, 0),
            rotateZ(faced(who, walked, TO_CAR.total, -1.9, Math.PI / 2)),
            // Getting in: they are gone from beside the car in a moment.
            scale(1 - ramp(T_IN - 0.35, T_IN, t)),
          ),
          (walked / 1.45) * TAU,
          who.moving,
        ),
      );

    // The line of the glass, which the noise does not get through.
    const quiet = span(0.9, 6.2, t, 0.6);
    const shell: [number, number][] = [];
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * TAU;
      const c = Math.cos(a),
        s = Math.sin(a);
      // A rounded rectangle about the car's plan.
      const r = 1 / (Math.abs(c / 2.5) ** 4 + Math.abs(s / 1.02) ** 4) ** 0.25;
      shell.push([BAY[0] + c * r, BAY[1] + s * r]);
    }
    if (quiet > 0.01)
      items.push(ribbon("glass", shell, 0.07, BLUE, 0.8 * quiet, 0.03, true));

    const labels = (plate: Plate) => {
      const roof: V3 = [car.x, car.y, 1.75];
      // Noise from each passing car, thinning where it meets the glass.
      const inside = (p: V3) =>
        Math.abs((p[0] - BAY[0]) / 2.5) ** 4 +
          Math.abs((p[1] - BAY[1]) / 1.02) ** 4 <
        1
          ? 0.1
          : 1;
      for (const source of sources) {
        const near = 1 - ramp(9, 26, Math.abs(source[0] - BAY[0]));
        ripples(plate, source, 8.5, t * 0.75, GREY, {
          alpha: 0.75 * near * quiet,
          rings: 5,
          stop: inside,
        });
      }
      badge(plate, [car.x, car.y, 2.6], "sound", BLUE, {
        alpha: quiet,
        pop: ramp(0.9, 1.5, t, settle),
        stem: roof,
        radius: 15,
      });
      const hush = span(1.5, 5.8, t, 0.45);
      pill(
        plate,
        roof,
        base.name,
        "Acoustic glass and sound-damping materials",
        {
          tone: "dark",
          alpha: hush,
          dy: -120,
        },
      );
      pill(plate, roof, rival.name, "Cabin noise is not compared here", {
        alpha: hush,
        dy: -85,
      });
      caption(
        plate,
        "As Tesla describes the Model Y. No measured cabin-noise comparison is recorded for these cars.",
        hush,
      );

      // Climate, set from a phone before anyone gets in.
      const sent = ramp(6.4, 7.4, t);
      const hand: V3 = [who.x, who.y, 1.2];
      flow(
        plate,
        [hand, [who.x, who.y, 2.6], [car.x, car.y, 2.6], roof],
        BLUE,
        {
          alpha: climate * (1 - ramp(9.4, 10.2, t)),
          drawn: sent,
          dash: [2, 7],
          width: 2,
        },
      );
      badge(plate, [who.x, who.y, 2.5], "phone", BLUE, {
        alpha: climate,
        pop: ramp(6.2, 6.8, t, settle),
        stem: [who.x, who.y, 1.8],
        radius: 13,
      });
      badge(
        plate,
        [car.x, car.y, 2.6],
        cooled > 0.5 ? "snow" : "heat",
        mix3(AMBER, BLUE, cooled),
        {
          alpha: span(7.2, 11.8, t, 0.4),
          pop: ramp(7.2, 7.8, t, settle),
          stem: roof,
          radius: 15,
        },
      );
      const remote = span(7.6, 11.7, t, 0.45);
      [base, rival].forEach((who2, i) =>
        pill(
          plate,
          roof,
          who2.name,
          brief(answer(who2, "remote_preconditioning"), 36),
          {
            tone: i ? "light" : "dark",
            alpha: remote,
            dy: i ? -85 : -120,
            dot: dotFor(has(who2, "remote_preconditioning")),
            level: i ? undefined : cooled,
            bar: "#2f8fdc",
          },
        ),
      );

      // Getting in and going: the seats, then how briskly each car gets away.
      const seats = (who2: typeof base) => {
        const heated = has(who2, "front_heated_seats"),
          aired = has(who2, "front_ventilated_seats");
        return heated === undefined && aired === undefined
          ? "Seat comfort not stated"
          : `Front seats ${heated ? "heated" : "not heated"}, ${aired ? "ventilated" : "not ventilated"}`;
      };
      const settled = span(12.6, T_GO + 0.2, t, 0.45);
      [base, rival].forEach((who2, i) =>
        pill(plate, roof, who2.name, seats(who2), {
          tone: i ? "light" : "dark",
          alpha: settled,
          dy: i ? -50 : -85,
          tie: i ? undefined : roof,
        }),
      );
      const away =
        ramp(T_GO + 0.4, T_GO + 0.9, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
      [base, rival].forEach((who2, i) => {
        const s = figure(who2, "zero_to_100_s");
        pill(
          plate,
          roof,
          who2.name,
          s ? `0–100 km/h in ${s} s` : "0–100 km/h not stated",
          {
            tone: i ? "light" : "dark",
            alpha: away,
            dy: i ? -50 : -85,
            tie: i ? undefined : roof,
          },
        );
      });
    };
    return { shot, items, labels };
  },
});
// The town repeats every BLOCK metres; this scene stays in one block of it.
void BLOCK;
