/**
 * Daily convenience, B. No floating phone: a person, with the phone in their
 * pocket. They stand at the kerb; they walk to the car and it wakes as they
 * come within reach; they walk away and it locks behind them. The car's own
 * answer is its lamps and mirrors; a ring on the ground marks how near is
 * near enough.
 */
import { carItems, onCar, placed } from "./car";
import { answer, dotFor, has, hero, offset, pair } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  TAU,
  colour,
  compose,
  glide,
  lerp,
  ramp,
  rotateZ,
  settle,
  span,
  track,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, brief, flow, pill } from "./overlay";
import { scene, type Plate } from "./stage";
import {
  PAINT,
  STONE,
  WHITE,
  arc,
  box,
  clay,
  decal,
  ground,
  house,
  person,
  ribbon,
  tree,
  surroundings,
} from "./world";

const STARTS: [number, number, number] = [0, 5.4, 11.2];
const LOOP = 17.2;
const AZ = -45,
  EL = 31;
const ORANGE = colour("#ee8a3a");
const CAR = placed(0, 0, 0);
/** How near the phone has to be, in metres from the middle of the car. */
const REACH = 3.6;
const KERB = -7.3,
  DOOR = -1.85;

export const convenienceSceneB = scene({
  beats: ["Phone key", "Unlocks as you arrive", "Locks as you leave"],
  starts: STARTS,
  loop: LOOP,
  still: 9.6,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);

    // One walk in, one walk out.
    const y = track(
      t,
      [
        [0, KERB],
        [5.9, KERB],
        [9.6, DOOR],
        [11.9, DOOR],
        [15.6, KERB],
        [LOOP, KERB],
      ],
      (v) => v * v * (3 - 2 * v),
    );
    const walking =
      ramp(5.9, 6.3, t) * (1 - ramp(9.3, 9.7, t)) +
      ramp(11.9, 12.3, t) * (1 - ramp(15.3, 15.7, t));
    const facing = lerp(90, -90, ramp(11.3, 11.95, t, glide));
    const arrive = 5.9 + 3.7 * 0.52,
      leave = 11.9 + 3.7 * 0.36;
    const unlocked =
      ramp(arrive, arrive + 0.25, t) * (1 - ramp(leave, leave + 0.25, t));
    const mirrors =
      ramp(arrive, arrive + 0.9, t, glide) *
      (1 - ramp(leave, leave + 0.9, t, glide));
    const wink =
      Math.sin(Math.PI * ramp(arrive, arrive + 0.5, t)) +
      Math.sin(Math.PI * ramp(leave, leave + 0.25, t)) +
      Math.sin(Math.PI * ramp(leave + 0.3, leave + 0.55, t));

    const across = wide ? 21.5 : 13.6;
    const shot = {
      at: t,
      target: offset([0.2, -2.9, 0.7], AZ, wide ? 1.3 : 0.3, wide ? 1.0 : 1.7),
      az: AZ + 2.5 * ramp(0, LOOP, t, (v) => v),
      el: EL,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };
    const who: V3 = [0.15, y, 0];

    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...surroundings([0, 0, 0], AZ, 7.5, 2, false),
      box([7.2, 3.5, 0.03], [0.2, 0, 0], clay(STONE), 0.012, false),
      box([2.2, 6.4, 0.03], [0.15, -4.9, 0], clay(STONE), 0.012, false),
      ...house([-2.6, 8.4, 0], 12.5, 7.4),
      box(
        [0.75, 4.6, 0.7],
        [-6.4, 0.6, 0],
        clay(WHITE, { p: [0, 0, 0, 0.22] }),
        0.16,
      ),
      ...tree([8.4, 5.6, 0], 5.2, 5),
      ...carItems(model, {
        at: CAR,
        paint: PAINT,
        lamps: 0.75 * unlocked + 0.9 * wink,
        tail: 0.3 * unlocked + 0.7 * wink,
        mirrors,
      }),
      ...person(
        compose(translate(who[0], who[1], 0.03), rotateZ(facing * DEG)),
        (Math.abs(y - KERB) / 1.45) * TAU,
        Math.min(1, walking),
      ),
      // How near is near enough.
      decal(
        "reach",
        arc(0, 0, REACH, 0, 1, 64),
        ORANGE,
        0.05 + 0.05 * unlocked,
        0.036,
      ),
      ribbon(
        "reach edge",
        arc(0, 0, REACH),
        0.07,
        ORANGE,
        0.55 + 0.35 * unlocked,
        0.04,
        true,
      ),
    ];
    for (const [at, grows] of [
      [arrive, 1],
      [leave, -1],
    ]) {
      const pulse = ramp(at, at + 1.1, t);
      if (pulse > 0 && pulse < 1)
        items.push(
          ribbon(
            `pulse ${grows}`,
            arc(0, 0, REACH + grows * 1.1 * pulse),
            0.09,
            ORANGE,
            0.8 * (1 - pulse),
            0.042,
            true,
          ),
        );
    }

    const labels = (plate: Plate) => {
      const roof: V3 = [0, 0, 1.7];
      const pocket: V3 = [who[0], who[1], 0.95];
      const handle = onCar(model, CAR, 2.4, -0.94, 0.98);
      // The phone is the key: a line from pocket to door.
      const keyed = span(0.9, 5.3, t, 0.45);
      flow(
        plate,
        [pocket, [who[0], lerp(who[1], handle[1], 0.5), 1.25], handle],
        ORANGE,
        {
          alpha: keyed,
          dash: [2, 7],
          drawn: ramp(1.4, 2.7, t, glide),
          width: 2.4,
        },
      );
      badge(plate, [who[0], who[1], 2.55], "phone", ORANGE, {
        alpha: keyed,
        pop: ramp(0.9, 1.5, t, settle),
        stem: [who[0], who[1], 1.82],
        radius: 16,
      });
      // The car's state, over its roof.
      const shut = 1 - unlocked;
      const steady = 1 - ramp(LOOP - 0.9, LOOP - 0.5, t);
      badge(plate, [0, 0, 2.6], "lock", ORANGE, {
        alpha: shut * steady * ramp(0.6, 1.1, t),
        pop: 0.85 + 0.15 * shut,
        stem: roof,
      });
      badge(plate, [0, 0, 2.6], "unlock", ORANGE, {
        alpha: unlocked,
        pop: lerp(0.8, 1, ramp(arrive, arrive + 0.5, t, settle)),
        stem: roof,
      });

      const rows: [number, string, number][] = [
        [span(2.4, 5.3, t, 0.45), "phone_key", 30],
        [span(arrive + 0.5, 11.1, t, 0.45), "passive_unlock", 34],
        [ramp(leave + 0.5, leave + 0.95, t) * steady, "walk_away_lock", 30],
      ];
      for (const [alpha, key, limit] of rows) {
        if (alpha <= 0.01) continue;
        [base, rival].forEach((car, i) =>
          pill(plate, [0, 0, 2.6], car.name, brief(answer(car, key), limit), {
            tone: i ? "light" : "dark",
            alpha,
            anchor: plate.wide ? "left" : "right",
            dx: plate.wide ? 34 : 38,
            dy: plate.wide ? (i ? 17 : -18) : i ? -42 : -77,
            dot: dotFor(has(car, key)),
          }),
        );
      }
    };
    return { shot, items, labels };
  },
});
