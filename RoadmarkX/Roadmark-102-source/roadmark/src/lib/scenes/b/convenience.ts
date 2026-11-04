/**
 * Daily convenience, B: the car takes care of the small routines. Someone
 * comes up the drive with a shopping bag in each hand, phone in a pocket: the
 * car unlocks as they come within reach. The tailgate lifts for the bags;
 * at the driver's door the seat and mirrors go back to how they keep them.
 * Then they walk to the house, and the car locks itself behind them. A ring
 * on the ground marks how near is near enough.
 */
import { cabinItems, carItems, onCar, placed, seatPoint } from "./car";
import {
  answer,
  dotFor,
  faced,
  has,
  hero,
  hop,
  offset,
  paced,
  pair,
  walk,
} from "./common";
import { type Item } from "./gl";
import { homeLot } from "./home";
import {
  TAU,
  colour,
  compose,
  glide,
  ramp,
  rotateZ,
  settle,
  span,
  track,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, brief, pill } from "./overlay";
import { STORE, shoppingBag, stores } from "./props";
import { scene, type Plate } from "./stage";
import { PAINT, arc, ground, person, ribbon } from "./world";

const STARTS: [number, number, number] = [0, 5.2, 13.2];
const LOOP = 19;
const AZ = -146,
  EL = 31;
const ORANGE = colour("#ee8a3a"),
  BLUE = colour("#2f8fdc");
const CAR = placed(0, 0, 0);
/** How near the phone has to be, in metres from the middle of the car. */
const REACH = 3.7;
const PACE = 1.85;

/** Up the drive to the tail; round to the driver's door; then to the house. */
const ARRIVE = walk([
  [1.0, -7.6],
  [0.4, -4.6],
  [-3.2, -2.3],
  [-3.45, -0.75],
]);
const TO_DOOR = walk([
  [-3.45, -0.75],
  [-3.3, -1.9],
  [0.35, -1.85],
]);
const LEAVE = walk([
  [0.35, -1.85],
  [3.55, -1.95],
  [4.0, 0.9],
  [3.6, 2.5],
]);
const T_ARRIVE = 0.3,
  T_DOOR = 9.0,
  T_LEAVE = 13.4;

export const convenienceSceneB = scene({
  beats: ["Approach", "Load and settle", "Walk away"],
  starts: STARTS,
  loop: LOOP,
  still: 11.9,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);

    // Where the person is, on whichever leg of the walk they have reached,
    // and the way they stand before and after it.
    const leg =
      t < T_DOOR
        ? { path: ARRIVE, from: T_ARRIVE, before: 0, rest: [1.8, 0.2] }
        : t < T_LEAVE
          ? {
              path: TO_DOOR,
              from: T_DOOR,
              before: ARRIVE.total,
              rest: [0.2, Math.PI / 2],
            }
          : {
              path: LEAVE,
              from: T_LEAVE,
              before: ARRIVE.total + TO_DOOR.total,
              rest: [Math.PI / 2, 1.8],
            };
    const gone = paced(t - leg.from, PACE, leg.path.total);
    const who = leg.path.at(gone);
    const stride = ((leg.before + gone) / 1.45) * TAU;
    const facing = faced(who, gone, leg.path.total, leg.rest[0], leg.rest[1]);

    const near = Math.hypot(who.x, who.y) < REACH;
    // The moments the car answers: when they come inside the ring, and leave it.
    const tIn = T_ARRIVE + 6.25 / PACE + 0.22,
      tOut = T_LEAVE + 5.3 / PACE + 0.22;
    const awake = ramp(tIn, tIn + 0.5, t) * (1 - ramp(tOut, tOut + 0.5, t));
    const gate = ramp(5.3, 6.4, t, glide) * (1 - ramp(7.8, 8.9, t, glide));
    const settled = span(11.0, 13.3, t, 0.6);
    const xray = 0.62 * settled;

    const across = track(t, [
      [0, wide ? 20 : 12],
      [5, wide ? 18.4 : 10.6],
      [9, wide ? 17.6 : 10.2],
      [13.2, wide ? 17.6 : 10.2],
      [15.5, wide ? 20 : 11.6],
      [LOOP, wide ? 20 : 11.8],
    ]);
    const focus: V3 = [
      track(t, [
        [0, -0.6],
        [5, -1.5],
        [9, -1.3],
        [13.2, -0.4],
        [15.5, 0.6],
        [LOOP, 0.6],
      ]),
      track(t, [
        [0, -1.6],
        [5, -0.6],
        [13.2, -0.5],
        [15.5, 0.2],
        [LOOP, 0.2],
      ]),
      0.75,
    ];
    const shot = {
      at: t,
      target: offset(focus, AZ, wide ? 1.6 : 0, wide ? 0.5 : -0.1),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.43 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...homeLot(),
      ...carItems(model, {
        at: CAR,
        paint: PAINT,
        xray,
        lamps: 0.9 * awake,
        tail: 0.2 + 0.7 * awake,
        mirrors: awake,
        tailgate: gate,
      }),
      ...stores(model, { at: CAR }),
      ribbon(
        "reach",
        arc(0, 0, REACH, 0, 1, 120),
        0.07,
        ORANGE,
        0.3 + 0.5 * awake,
        0.03,
        true,
      ),
      ...person(
        compose(translate(who.x, who.y, 0), rotateZ(facing)),
        stride,
        who.moving,
      ),
    ];
    if (xray > 0.01)
      items.push(
        ...cabinItems(model, {
          at: CAR,
          seats: spec?.seats ?? 5,
          seat: (index) => ({
            glow: BLUE,
            amount: index === 1 ? 0.9 * settled : 0,
          }),
        }),
      );

    // The shopping: carried, then lifted into the boot.
    [1, -1].forEach((side, index) => {
      const loaded = ramp(6.4 + index * 0.45, 7.4 + index * 0.45, t, glide);
      const c = Math.cos(facing),
        s = Math.sin(facing);
      const swing =
        0.07 * who.moving * Math.sin(stride + (side > 0 ? Math.PI : 0));
      const hand: V3 = [
        who.x + c * (0.04 + swing) - s * side * 0.3,
        who.y + s * (0.04 + swing) + c * side * 0.3,
        0.26,
      ];
      const rest = onCar(model, CAR, 4.02, side * 0.24, STORE.boot.low);
      const at = loaded > 0 ? hop(hand, rest, loaded, 0.5) : hand;
      items.push(
        shoppingBag(
          compose(
            translate(at[0], at[1], at[2]),
            rotateZ(loaded > 0 ? Math.PI / 2 : facing),
          ),
        ),
      );
    });

    const labels = (plate: Plate) => {
      const roof: V3 = [0, 0, 1.75];
      const over: V3 = [0.3, 0, 2.45];
      const quote = (
        at: V3,
        key: string,
        alpha: number,
        tie?: V3,
        dy = -62,
      ) => {
        [base, rival].forEach((car, i) =>
          pill(plate, at, car.name, brief(answer(car, key), 34), {
            tone: i ? "light" : "dark",
            alpha,
            dy: dy + i * 35,
            dot: dotFor(has(car, key)),
            tie: i ? undefined : tie,
          }),
        );
      };

      // A padlock over the roof: open while the car is awake.
      const shown =
        ramp(0.8, 1.4, t) *
        (1 - ramp(LOOP - 0.9, LOOP - 0.5, t)) *
        (1 - span(5.6, 13.2, t, 0.4));
      badge(plate, over, awake > 0.5 ? "unlock" : "lock", ORANGE, {
        alpha: shown,
        pop:
          1 +
          0.18 *
            (span(tIn, tIn + 0.7, t, 0.3) + span(tOut, tOut + 0.7, t, 0.3)),
        stem: roof,
        radius: 17,
        off: awake < 0.5 && t < T_LEAVE,
      });
      // A phone over the person while they are within reach.
      badge(plate, [who.x, who.y, 2.45], "phone", ORANGE, {
        alpha: ramp(0.5, 1.1, t) * (1 - ramp(5.0, 5.5, t)),
        stem: [who.x, who.y, 1.8],
        radius: 13,
        off: !near,
      });

      // Approach: how each car lets its owner in.
      quote(
        over,
        "passive_unlock",
        span(tIn + 0.3, 5.5, t, 0.4),
        undefined,
        -66,
      );
      // Load: the tailgate.
      const tail = onCar(model, CAR, 4.5, 0, 1.2);
      quote([-2.7, 0, 2.3], "power_tailgate", span(5.9, 8.8, t, 0.4), tail);
      // Settle: the driver's own settings come back.
      const seat = seatPoint(model, CAR, spec?.seats ?? 5, 1);
      quote(over, "driver_profiles_local", span(11.2, 13.3, t, 0.4), seat, -62);
      badge(plate, [seat[0], seat[1], 2.25], "person", BLUE, {
        alpha: span(10.9, 13.3, t, 0.4),
        pop: ramp(10.9, 11.5, t, settle),
        radius: 13,
      });
      // Walk away: it locks itself.
      quote(
        over,
        "walk_away_lock",
        ramp(tOut + 0.3, tOut + 0.9, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t)),
        undefined,
        -66,
      );
    };
    return { shot, items, labels };
  },
});
