/**
 * Software & tech, B. The car stays put, seen through its shell, and three
 * things reach it in turn. An update comes down from above and lights
 * whatever it can change; a phone at arm's length warms the cabin; and the
 * screen shows whether it will mirror that phone.
 */
import { SCREEN_AT, cabinItems, carItems, onCar, placed } from "./car";
import { answer, dotFor, figure, has, hero, offset, pair } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  clamp,
  colour,
  compose,
  glide,
  lerp,
  ramp,
  rotateZ,
  settle,
  span,
  track,
  transform,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, bloom, brief, flow, pill } from "./overlay";
import { scene, type Plate } from "./stage";
import {
  PAINT,
  WHITE,
  clay,
  ground,
  kept,
  person,
  surroundings,
} from "./world";
import { turned } from "./mesh";

const STARTS: [number, number, number] = [0, 5.6, 11.2];
const LOOP = 17.2;
const TEAL = colour("#27b3a7"),
  WARMTH = colour("#ff9a52");
/** Tail and driver's side towards us, so the screen faces the camera. */
const CAR = compose(translate(0, 0, 0.08), placed(0, 0, 100 * DEG));
const OWNER: V3 = [3.3, -1.7, 0.08];
const OWNER_FACES = 152 * DEG;

export const softwareSceneB = scene({
  beats: ["Updates over the air", "Phone app", "Phone mirroring"],
  starts: STARTS,
  loop: LOOP,
  still: 3.9,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const seats = clamp(figure(base, "seats") ?? spec?.seats ?? 5, 2, 7);
    const scope = answer(base, "ota_capability_scope") ?? "";
    const whole = /whole car/i.test(scope);
    const updates = has(base, "ota_capability_scope") !== false;
    const mirrors = has(base, "carplay_android_auto") === true;

    const xray = span(0.7, LOOP - 0.3, t, 0.9);
    const arriving = ramp(1.3, 2.6, t, glide);
    const beat1 = span(1.1, 5.5, t, 0.5);
    const lit = (from: number) =>
      ramp(from, from + 0.6, t, settle) * beat1 * (updates ? 1 : 0);
    const warming = span(7.4, 11, t, 0.9);
    const showing = ramp(12.6, 13.4, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));

    // Whole car, then in to the dashboard.
    const close = ramp(11.3, 12.9, t, glide);
    const screen = transform(CAR, SCREEN_AT(model));
    const across = track(t, [
      [0, wide ? 18.0 : 11.0],
      [11.2, wide ? 17.3 : 10.5],
      [12.9, wide ? 6.6 : 4.6],
      [LOOP, wide ? 6.2 : 4.4],
    ]);
    const az = -45 + 4 * ramp(0, LOOP, t, (v) => v);
    const subject: V3 = [
      lerp(0.5, screen[0] + 0.25, close),
      lerp(-0.4, screen[1] - 0.25, close),
      lerp(1.35, 1.05, close),
    ];
    const shot = {
      at: t,
      target: offset(
        subject,
        az,
        (wide ? 1.3 : 0) * (1 - close) + (wide ? 0.6 : 0) * close,
        (wide ? -0.45 : 0.55) * (1 - close),
      ),
      az,
      el: 31 + 5 * close,
      fit: [across, wide ? across * 0.42 : across] as V2,
    };

    const screenLit = Math.max(
      lit(2.4),
      0.5 * warming,
      showing * (mirrors ? 1 : 0.35),
    );
    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...surroundings([0.6, -0.3, 0], -45, 5.6, 4),
      // A low round plinth: this is a look at the car, not a place.
      {
        mesh: kept("plinth", () =>
          turned(
            [
              [0, 0],
              [3.8, 0],
              [3.8, 0.05],
              [3.74, 0.08],
              [0, 0.08],
            ],
            72,
          ),
        ),
        at: translate(0.6, -0.3, 0),
        mat: clay(WHITE),
      },
      ...carItems(model, {
        at: CAR,
        paint: PAINT,
        xray,
        lamps: 0.35 + 0.6 * Math.sin(Math.PI * ramp(7.2, 7.9, t)),
        tail: 0.2,
      }),
      ...cabinItems(model, {
        at: CAR,
        seats,
        seat: () => ({
          color: [0.5, 0.5, 0.5],
          glow: WARMTH,
          amount: 0.7 * warming,
        }),
        screen: {
          lit: screenLit,
          colour: mirrors || showing < 0.5 ? TEAL : [0.75, 0.77, 0.8],
        },
        drive: { lit: whole ? Math.max(lit(3.0), 0) * 0.9 : 0, colour: TEAL },
        pack: whole ? { fill: lit(3.5), colour: TEAL, glow: 0.3 } : undefined,
      }),
      ...person(
        compose(translate(OWNER[0], OWNER[1], OWNER[2]), rotateZ(OWNER_FACES)),
        0,
        0,
      ),
    ];

    const labels = (plate: Plate) => {
      const roof: V3 = [0, 0, 1.86];
      const sky: V3 = [0, 0, 3.55];
      // The update, coming down.
      flow(plate, [sky, roof], TEAL, {
        alpha: beat1,
        dash: [2, 7],
        drawn: arriving,
        nodes: [arriving * 0.92],
        width: 2.4,
      });
      badge(plate, sky, "update", TEAL, {
        alpha: beat1,
        pop: ramp(1.1, 1.7, t, settle),
        radius: 18,
        off: !updates,
      });
      const side = plate.wide ? "left" : "centre";
      const stack = (i: number) =>
        plate.wide ? (i ? 17 : -18) : i ? -40 : -75;
      [base, rival].forEach((car, i) =>
        pill(
          plate,
          sky,
          car.name,
          brief(answer(car, "ota_capability_scope"), 36),
          {
            tone: i ? "light" : "dark",
            alpha: span(2.6, 5.5, t, 0.45),
            anchor: plate.wide ? "left" : "right",
            dx: plate.wide ? 34 : 44,
            dy: stack(i),
            dot: dotFor(has(car, "ota_capability_scope")),
          },
        ),
      );
      bloom(plate, screen, 0.5, TEAL, 0.6 * lit(2.4));

      // The app: from the phone in the owner's hand to the car.
      const hand: V3 = [
        OWNER[0] + 0.3 * Math.cos(OWNER_FACES),
        OWNER[1] + 0.3 * Math.sin(OWNER_FACES),
        1.2,
      ];
      const door = onCar(model, CAR, 2.4, -0.95, 1.02);
      const apped = span(6.0, 11, t, 0.5);
      const sent = ramp(6.5, 7.6, t, glide);
      const between: V3 = [
        (hand[0] + door[0]) / 2,
        (hand[1] + door[1]) / 2,
        1.5,
      ];
      flow(plate, [hand, between, door], TEAL, {
        alpha: apped,
        dash: [2, 7],
        drawn: sent,
        nodes: [sent * 0.95],
        width: 2.4,
      });
      const over: V3 = [OWNER[0], OWNER[1], 2.6];
      badge(plate, over, "phone", TEAL, {
        alpha: apped,
        pop: ramp(6.0, 6.6, t, settle),
        stem: [OWNER[0], OWNER[1], 1.92],
        radius: 16,
      });
      const app = (car: typeof base) => {
        const [name, does] = (answer(car, "app_connectivity") ?? "").split(
          " — ",
        );
        return { name: name || car.name, does: brief(does ?? name, 38) };
      };
      [base, rival].forEach((car, i) => {
        const { name, does } = app(car);
        pill(plate, roof, name, does, {
          tone: i ? "light" : "dark",
          alpha: span(7.6, 11, t, 0.45),
          dy: i ? -44 : -79,
          dot: dotFor(has(car, "app_connectivity")),
          tie: i ? undefined : roof,
        });
      });

      // The screen: does it mirror the phone?
      bloom(
        plate,
        screen,
        0.42,
        mirrors ? TEAL : [0.9, 0.9, 0.9],
        0.5 * showing,
      );
      const above: V3 = [screen[0], screen[1], screen[2] + 0.62];
      badge(plate, above, "screen", TEAL, {
        alpha: showing,
        pop: ramp(12.6, 13.2, t, settle),
        stem: [screen[0], screen[1], screen[2] + 0.14],
        radius: 17,
        off: !mirrors,
      });
      [base, rival].forEach((car, i) =>
        pill(
          plate,
          above,
          car.name,
          brief(answer(car, "carplay_android_auto"), 38),
          {
            tone: i ? "light" : "dark",
            alpha: showing * ramp(13.2, 13.7, t),
            anchor: side,
            dx: plate.wide ? 32 : 0,
            dy: plate.wide ? (i ? 17 : -18) : i ? -40 : -75,
            dot: dotFor(has(car, "carplay_android_auto")),
          },
        ),
      );
    };
    return { shot, items, labels };
  },
});
