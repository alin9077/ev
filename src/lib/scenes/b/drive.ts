/**
 * Automated driving, B. One car, one straight street, one thing at a time,
 * and slowly. The camera travels with the car while it shows the three things
 * its standard assistance does: holds the middle of its lane, holds its
 * distance to the car ahead, and stops for someone on a crossing.
 */
import { carItems, placed } from "./car";
import { answer, dotFor, hero, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  TAU,
  colour,
  compose,
  glide,
  hash,
  lerp,
  ramp,
  rotateZ,
  span,
  track,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, measure, pill } from "./overlay";
import { scene, type Plate } from "./stage";
import {
  CHAMPAGNE,
  WHITE,
  arc,
  box,
  clay,
  decal,
  ground,
  house,
  person,
  ribbon,
  road,
  tree,
} from "./world";

const STARTS: [number, number, number] = [0, 5.6, 11.2];
const LOOP = 17.2;
const AZ = -66,
  EL = 29;
const BLUE = colour("#2f8fdc");
/** The middle of the lane the car keeps: Australia drives on the left. */
const LANE = 1.75;
/** Metres a second, at moments through the loop: steady, easing off, to a stop. */
const SPEED: V2[] = [
  [0, 8],
  [5.8, 8],
  [8, 6.4],
  [12.3, 6.4],
  [14.6, 0],
  [LOOP, 0],
];
/** How far the car has gone by `t`: the speeds above, added up. */
function gone(t: number) {
  let distance = 0;
  for (let i = 1; i < SPEED.length; i++) {
    const [t0, v0] = SPEED[i - 1],
      [t1, v1] = SPEED[i];
    if (t <= t0) break;
    const end = Math.min(t, t1);
    const v = lerp(v0, v1, (end - t0) / (t1 - t0));
    distance += ((v0 + v) / 2) * (end - t0);
  }
  return distance;
}
const STOP = gone(LOOP);
/** The crossing lies a little beyond where the car's nose comes to rest. */
const CROSSING = STOP + 2.34 + 1.3 + 1.5;

export const driveSceneB = scene({
  beats: ["Keeps its lane", "Keeps its distance", "Stops for people"],
  starts: STARTS,
  loop: LOOP,
  still: 8.8,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const x = gone(t);
    const speed = (gone(t + 0.05) - gone(t - 0.05)) / 0.1;

    // Lane keeping: the car wanders towards the line and is brought back.
    const wander = (at: number) =>
      -0.42 * Math.sin(Math.PI * ramp(1.2, 4.6, at)) ** 2;
    const y = LANE + wander(t);
    const yaw = Math.atan2(
      (wander(t + 0.1) - wander(t - 0.1)) / 0.2,
      Math.max(speed, 1),
    );

    // The car ahead: caught up with, followed, then gone.
    const gap = track(t, [
      [5.6, 40],
      [8.2, 10.5],
      [10.3, 10.5],
      [11.8, 46],
    ]);
    const lead = x + gap + 4.79;

    // Someone waits at the crossing, then walks over it.
    const walked = Math.max(0, t - 12.0) * 1.3 * ramp(12.0, 12.5, t, (v) => v);
    const walker: V3 = [
      CROSSING,
      -4.75 + walked,
      0.13 * (walked < 1.2 || walked > 8.3 ? 1 : 0),
    ];

    const ahead = wide ? 4.6 : 4.2;
    const across = track(t, [
      [0, wide ? 25 : 17],
      [5.6, wide ? 25 : 17],
      [8, wide ? 31 : 20],
      [10.6, wide ? 31 : 20],
      [12.6, wide ? 26 : 17.5],
      [LOOP, wide ? 24.5 : 17],
    ]);
    const shot = {
      at: t,
      target: offset([x + ahead, 0.4, 0.5], AZ, 0, wide ? 0.9 : 0.4),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.4 : across] as V2,
    };
    const cx = shot.target[0];

    const items: Item[] = [
      ground(shot.target, across, 0.04),
      ...road([cx, 0, 0], 120, 7),
      ...carItems(model, {
        at: placed(x, y, yaw),
        paint: CHAMPAGNE,
        lamps: 0.7,
        tail:
          0.25 +
          0.75 *
            ramp(
              0.4,
              1.6,
              -(gone(t + 0.3) - 2 * gone(t) + gone(t - 0.3)) / 0.09,
            ),
        roll: x / model.shape.wheelR,
        steer: yaw * 3,
        pitch: -0.012 * ramp(12.4, 13.2, t) * (1 - ramp(14.4, 14.9, t)),
      }),
    ];
    if (lead < cx + 70 && t > 5.6 && t < 11.9)
      items.push(
        ...carItems(stand(), {
          at: placed(lead, LANE, 0),
          paint: WHITE,
          clay: true,
          roll: lead / model.shape.wheelR,
        }),
      );
    // The far side of the street: trees and houses, widely spaced.
    for (let k = Math.floor((cx - 50) / 17); k <= (cx + 50) / 17; k++) {
      const at = k * 17 + 5 * hash(k + 0.3);
      if (Math.abs(at - CROSSING) > 4)
        items.push(
          ...tree([at, 8.2 + 1.2 * hash(k + 0.6), 0], 4.4 + 1.4 * hash(k), k),
        );
    }
    for (let k = Math.floor((cx - 60) / 38); k <= (cx + 60) / 38; k++)
      items.push(
        ...house([k * 38 + 12, 16.5, 0], 11 + 2 * hash(k), 7.5, k % 2 === 0),
      );

    // The crossing: bars across the carriageway, and whoever is on it.
    if (Math.abs(CROSSING - cx) < 60) {
      for (let k = -3; k <= 3; k++)
        items.push(
          box(
            [3, 0.5, 0.012],
            [CROSSING, k * 1, 0.02],
            clay(WHITE),
            0.003,
            false,
          ),
        );
      items.push(
        ...person(
          compose(
            translate(walker[0], walker[1], walker[2]),
            rotateZ(90 * DEG),
          ),
          (walked / 1.45) * TAU,
          ramp(12.0, 12.5, t),
        ),
      );
    }

    // What the car is watching, laid on the road in one colour.
    const keeping = span(0.7, 5.5, t, 0.5);
    if (keeping > 0.01) {
      const from = x + 2.9,
        to = x + 19;
      items.push(
        decal(
          "lane",
          [
            [from, LANE - 1.45],
            [to, LANE - 1.45],
            [to, LANE + 1.45],
            [from, LANE + 1.45],
          ],
          BLUE,
          0.2 * keeping,
          0.03,
          [0, 1, 1, 0],
        ),
      );
      for (const side of [-1, 1])
        items.push(
          ribbon(
            `edge ${side}`,
            [
              [from, LANE + side * 1.45],
              [lerp(from, to, 0.6), LANE + side * 1.45],
            ],
            0.09,
            BLUE,
            0.9 * keeping,
            0.034,
          ),
        );
    }
    const following = span(7.6, 11.1, t, 0.5);
    if (following > 0.01)
      items.push(
        decal(
          "gap",
          [
            [x + 2.7, LANE - 1.2],
            [lead - 2.8, LANE - 1.2],
            [lead - 2.8, LANE + 1.2],
            [x + 2.7, LANE + 1.2],
          ],
          BLUE,
          0.2 * following,
          0.03,
        ),
      );
    const seen = ramp(12.2, 12.6, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
    if (seen > 0.01) {
      items.push(
        ribbon(
          "seen",
          arc(walker[0], walker[1], 0.62),
          0.07,
          BLUE,
          0.9 * seen,
          0.05 + walker[2],
          true,
        ),
        decal(
          "stop",
          [
            [x + 2.7, LANE - 1.2],
            [CROSSING - 1.8, LANE - 1.2],
            [CROSSING - 1.8, LANE + 1.2],
            [x + 2.7, LANE + 1.2],
          ],
          BLUE,
          0.2 * seen,
          0.03,
        ),
      );
    }

    const labels = (plate: Plate) => {
      const standard = (car: typeof base) => answer(car, "adas_standard");
      const rows: [number, string, RegExp][] = [
        [keeping, "Lane centring", /lane cent/i],
        [following, "Adaptive cruise", /adaptive cruise/i],
        [seen, "Automatic emergency braking", /aeb|emergency brak/i],
      ];
      const roof: V3 = [x, y, 1.72];
      for (const [alpha, name, test] of rows) {
        if (alpha <= 0.01) continue;
        [base, rival].forEach((car, i) => {
          const text = standard(car);
          const included = text === undefined ? undefined : test.test(text);
          pill(
            plate,
            roof,
            car.name,
            included === false ? "Not listed as standard" : name,
            {
              tone: i ? "light" : "dark",
              alpha,
              dy: i ? -37 : -72,
              dot: dotFor(included),
              tie: i ? undefined : roof,
            },
          );
        });
      }
      if (following > 0.01)
        measure(
          plate,
          [x + 2.7, LANE - 1.45, 0.03],
          [lead - 2.8, LANE - 1.45, 0.03],
          "#1f6fb0",
          following,
        );
      badge(plate, [walker[0], walker[1], 2.5], "person", BLUE, {
        alpha: seen,
        pop: ramp(12.2, 12.7, t, glide) * 1.0,
        stem: [walker[0], walker[1], 1.85],
        radius: 15,
      });
    };
    return { shot, items, labels };
  },
});
