/**
 * Comfort & drive, B. Two calm looks inside, then one thing that moves. Seen
 * through its shell, the car warms the seats it heats, then cools the seats
 * it ventilates. Then both selected cars leave a line together and reach
 * 100 km/h in their own claimed times, so the gap between them is the
 * difference, to scale.
 */
import { cabinItems, carItems, placed, seatRows } from "./car";
import { dotFor, figure, has, hero, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  clamp,
  colour,
  glide,
  hash,
  ramp,
  settle,
  span,
  track,
  type V2,
  type V3,
} from "./math";
import { badge, pill } from "./overlay";
import { scene, type Plate } from "./stage";
import { PAINT, WHITE, decal, ground, house, road, tree } from "./world";

/** Trees and houses along the far side of the strip, wherever the camera is. */
function roadside(cx: number, y: number): Item[] {
  const items: Item[] = [];
  for (let k = Math.floor((cx - 60) / 15); k <= (cx + 60) / 15; k++)
    items.push(
      ...tree(
        [k * 15 + 4 * hash(k + 0.3), y + 2 * hash(k + 0.6), 0],
        4.2 + 1.6 * hash(k),
        k,
      ),
    );
  for (let k = Math.floor((cx - 70) / 34); k <= (cx + 70) / 34; k++)
    items.push(
      ...house([k * 34 + 9, y + 9, 0], 11 + 2 * hash(k), 7.5, k % 2 === 0),
    );
  return items;
}

const STARTS: [number, number, number] = [0, 5.2, 10.4];
const LOOP = 19;
const HEAT = colour("#ff7436"),
  COOL = colour("#4f9dff");
/** The moment both cars go, and the lane the alternative runs in. */
const GO = 11.8,
  LANE = 5;
/** 100 km/h, in metres a second. */
const TOP = 100 / 3.6;

export const comfortSceneB = scene({
  beats: ["Heated seats", "Ventilated seats", "0–100 km/h"],
  starts: STARTS,
  loop: LOOP,
  still: 7.6,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const seats = clamp(figure(base, "seats") ?? spec?.seats ?? 5, 2, 7);
    const rows = seatRows(seats);
    const times = [base, rival].map((car) => figure(car, "zero_to_100_s"));

    // Real seconds, unless the slower car would run past the end of the beat.
    const slowest = Math.max(times[0] ?? 0, times[1] ?? 0, 1);
    const pace = Math.min(1, 6.1 / slowest);
    const clock = Math.max(0, t - GO) / pace;
    const run = (seconds: number | undefined) => {
      if (!seconds) return { x: 0, kmh: 0, done: false };
      const moving = Math.min(clock, seconds);
      return {
        x:
          0.5 * (TOP / seconds) * moving * moving +
          TOP * Math.max(0, clock - seconds),
        kmh: Math.min(100, (100 * clock) / seconds),
        done: clock >= seconds,
      };
    };
    const [mine, theirs] = [run(times[0]), run(times[1])];
    const lined = ramp(10.5, 11.6, t, glide);

    const xray = span(0.6, 10.5, t, 0.9);
    const warm = span(1.1, 5.2, t, 0.8),
      cool = span(5.6, 10.3, t, 0.8);
    const heated = (row: number) =>
      has(base, row === 0 ? "front_heated_seats" : "rear_heated_seats") ===
      true;
    const aired = (row: number) =>
      row === 0 && has(base, "front_ventilated_seats") === true;

    // Close on the cabin, then out and round to the side for the run.
    const out = ramp(10.4, 11.7, t, glide);
    const across = track(t, [
      [0, wide ? 14.4 : 9.2],
      [10.3, wide ? 13.7 : 8.8],
      [11.7, wide ? 29 : 19],
      [LOOP, wide ? 31 : 20],
    ]);
    const az = -45 - 23 * out,
      el = 38 - 11 * out;
    const lead = wide ? 2.5 : 1.2;
    const shot = {
      at: t,
      target: offset(
        [mine.x - lead * out, 0.2 + 1.5 * out, 0.8],
        az,
        (wide ? 1.3 : 0) * (1 - out) + (wide ? 2.4 : 0) * out,
        (wide ? 0.55 : 0) * (1 - out) + (wide ? 0.4 : 0) * out,
      ),
      az,
      el,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };
    const cx = shot.target[0];

    const squat = (seconds: number | undefined, state: { done: boolean }) =>
      seconds && clock > 0 && !state.done ? 0.016 * ramp(0, 0.35, clock) : 0;
    const items: Item[] = [
      ground(shot.target, across, 0.04),
      ...road([cx, LANE / 2, 0], 200, 10.4),
      ...roadside(cx, LANE + 6.8),
      ...carItems(model, {
        at: placed(mine.x, 0, 0),
        paint: PAINT,
        xray,
        lamps: 0.6,
        tail: 0.2,
        roll: mine.x / model.shape.wheelR,
        pitch: squat(times[0], mine),
      }),
    ];
    if (xray > 0.01)
      items.push(
        ...cabinItems(model, {
          at: placed(mine.x, 0, 0),
          seats,
          seat: (index) => {
            const row = rows[index];
            const hot = heated(row) ? warm : 0,
              cold = aired(row) ? cool : 0;
            return {
              color: [0.5, 0.5, 0.5],
              glow: hot >= cold ? HEAT : COOL,
              amount: 0.95 * Math.max(hot, cold) * xray,
            };
          },
        }),
      );
    if (lined > 0.001 && times[1]) {
      const arrived = -22 * (1 - lined) + theirs.x;
      items.push(
        ...carItems(stand(), {
          at: placed(arrived, LANE, 0),
          paint: WHITE,
          clay: true,
          roll: arrived / model.shape.wheelR,
          pitch: squat(times[1], theirs),
        }),
      );
    }
    // The line they leave from, and a mark every ten metres after it.
    if (out > 0.01)
      for (
        let k = Math.max(0, Math.floor((cx - 40) / 10));
        k * 10 < cx + 40;
        k++
      ) {
        const at = k * 10 + 2.6,
          wide_ = k ? 0.07 : 0.2;
        items.push(
          decal(
            `mark ${k % 12}`,
            [
              [at - wide_, -2.4],
              [at + wide_, -2.4],
              [at + wide_, LANE + 2.4],
              [at - wide_, LANE + 2.4],
            ],
            WHITE,
            0.95 * out,
            0.024,
          ),
        );
      }

    const labels = (plate: Plate) => {
      const roof: V3 = [mine.x, 0, 1.7];
      const fitted = (car: typeof base, kind: "heat" | "air") => {
        const front = has(
            car,
            kind === "heat" ? "front_heated_seats" : "front_ventilated_seats",
          ),
          rear = kind === "heat" ? has(car, "rear_heated_seats") : false;
        if (front === undefined && !rear)
          return { text: "Not stated", state: undefined };
        const what = kind === "heat" ? "Heated" : "Ventilated";
        if (front && rear)
          return { text: `${what} front and rear`, state: true };
        if (front) return { text: `${what} front seats`, state: true };
        if (rear) return { text: `${what} rear seats`, state: true };
        return { text: `${what} seats not fitted`, state: false };
      };
      for (const [alpha, kind, colour_] of [
        [span(1.6, 5.1, t, 0.45), "heat", HEAT],
        [span(6.1, 10.2, t, 0.45), "air", COOL],
      ] as const) {
        if (alpha <= 0.01) continue;
        badge(plate, [0, 0, 2.5], kind, colour_, {
          alpha,
          stem: roof,
          radius: 17,
        });
        [base, rival].forEach((car, i) => {
          const { text, state } = fitted(car, kind);
          pill(plate, [0, 0, 2.5], car.name, text, {
            tone: i ? "light" : "dark",
            alpha,
            anchor: plate.wide ? "left" : "centre",
            dx: plate.wide ? 32 : 0,
            dy: plate.wide ? (i ? 17 : -18) : i ? -40 : -75,
            dot: dotFor(state),
          });
        });
      }
      // The run: speed as it builds, then the time it took.
      const racing = ramp(11.5, 12, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
      if (racing > 0.01)
        [
          [base, mine, 0, roof] as const,
          [rival, theirs, 1, [theirs.x, LANE, 1.7] as V3] as const,
        ].forEach(([car, state, i, at]) => {
          const seconds = times[i];
          if (i && !seconds) return;
          pill(
            plate,
            at,
            car.name,
            !seconds
              ? "0–100 not stated"
              : state.done
                ? `100 km/h in ${seconds} s`
                : `${Math.round(state.kmh)} km/h`,
            {
              tone: i ? "light" : "dark",
              alpha: racing * (i ? ramp(11.6, 12, t) : 1),
              dy: -40,
              tie: at,
              pop: state.done
                ? settle(clamp((clock - (seconds ?? 0)) / 0.4)) * 0.08 + 0.92
                : 1,
            },
          );
        });
    };
    return { shot, items, labels };
  },
});
