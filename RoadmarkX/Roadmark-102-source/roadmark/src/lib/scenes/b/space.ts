/**
 * Space & safety, B: more useful storage throughout the car. One car on a
 * drive, to scale throughout. The bonnet lifts on the front trunk and a bag
 * goes in; the camera comes round to the tail, the tailgate rises and the
 * luggage waiting on the drive is loaded; then the rear of the boot floor
 * lifts on the well beneath it, and the shell turns to glass to show all
 * three spaces at once.
 */
import { cabinItems, carItems, onCar, placed } from "./car";
import {
  answer,
  faced,
  figure,
  hero,
  hop,
  offset,
  paced,
  pair,
  walk,
} from "./common";
import { homeLot } from "./home";
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
  span,
  track,
  transform,
  translate,
  type V2,
  type V3,
} from "./math";
import { caption, pill } from "./overlay";
import { STORE, TAN, holdall, stores, suitcase } from "./props";
import { scene, type Plate } from "./stage";
import { PAINT, STONE, clay, ground, person } from "./world";

const STARTS: [number, number, number] = [0, 5.8, 11.6];
const LOOP = 18;
const EL = 31;
const AMBER = colour("#e9ad1f");
const CAR = placed(0, 0, 0);
/** Along the far side of the car, from its nose to its tail. */
const ROUND = walk([
  [3.7, 2.0],
  [-3.9, 1.75],
]);

export const spaceSceneB = scene({
  beats: ["Front trunk", "Boot", "Under the floor"],
  starts: STARTS,
  loop: LOOP,
  still: 10.4,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);

    const bonnet = ramp(0.9, 2.1, t, glide) * (1 - ramp(4.8, 5.8, t, glide));
    const gate =
      ramp(6.9, 8.0, t, glide) * (1 - ramp(LOOP - 1.3, LOOP - 0.5, t));
    const lid = ramp(11.9, 12.9, t, glide) * (1 - ramp(14.1, 14.9, t, glide));
    const xray = span(14.6, LOOP - 0.4, t, 0.9);

    // The camera starts off the nose and comes round the kerb side to the tail.
    const round = ramp(5.0, 7.3, t, glide);
    const az = lerp(-34, -146, round);
    const focus: V3 = [
      track(t, [
        [0, 1.25],
        [5, 1.25],
        [7.3, -1.7],
        [14.4, -1.7],
        [16, -0.6],
        [LOOP, -0.5],
      ]),
      -0.2,
      0.75,
    ];
    const across = track(t, [
      [0, wide ? 17.6 : 10.4],
      [4.8, wide ? 16.6 : 9.8],
      [7.3, wide ? 18 : 10.6],
      [11.4, wide ? 17 : 10],
      [14.2, wide ? 16.4 : 9.6],
      [16, wide ? 19 : 11],
      [LOOP, wide ? 18.6 : 10.8],
    ]);
    const shot = {
      at: t,
      target: offset(
        focus,
        az,
        wide ? lerp(1.4, 1.8, round) : 0,
        wide ? 0.5 : -0.2,
      ),
      az,
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
        lamps: 0.15,
        tail: 0.25,
        bonnet,
        tailgate: gate,
      }),
      ...stores(model, {
        at: CAR,
        floor: lid,
        frunk: xray,
        boot: xray,
        well: xray,
        tint: AMBER,
      }),
    ];
    if (xray > 0.01)
      items.push(...cabinItems(model, { at: CAR, seats: spec?.seats ?? 5 }));

    // The front trunk takes a soft bag.
    const tub = transform(CAR, [
      model.nose - (STORE.frunk.from + STORE.frunk.to) / 2,
      0,
      STORE.frunk.low + 0.03,
    ]);
    const bagAt = hop([3.9, -1.5, 0], tub, ramp(2.2, 3.3, t, glide), 0.9);
    items.push(
      ...holdall(
        compose(translate(bagAt[0], bagAt[1], bagAt[2]), rotateZ(90 * DEG)),
        clay(TAN),
      ),
    );

    // The boot takes two cases, stood against the seats.
    const loaded = (index: number) =>
      ramp(8.2 + index * 0.75, 9.3 + index * 0.75, t, glide);
    const cases: [V3, number, V3][] = [
      [[-4.1, -1.25, 0], -0.25, [0.46, 0.26, 0.66]],
      [[-4.3, -0.45, 0], 0.26, [0.44, 0.24, 0.56]],
    ];
    cases.forEach(([from, y, size], index) => {
      const to = onCar(model, CAR, 4.02, y, STORE.boot.low);
      const f = loaded(index);
      const at = hop(from, to, f, 0.75);
      items.push(
        ...suitcase(
          compose(
            translate(at[0], at[1], at[2]),
            rotateZ(lerp(index ? 0.5 : -0.3, Math.PI / 2, f)),
          ),
          size,
          clay(index ? STONE : TAN),
        ),
      );
    });
    // The well under the floor takes one more.
    const well = onCar(
      model,
      CAR,
      (STORE.well.from + STORE.well.to) / 2,
      0,
      STORE.well.low + 0.03,
    );
    const lastAt = hop([-4.9, 0.5, 0], well, ramp(12.7, 13.8, t, glide), 1.0);
    items.push(
      ...holdall(
        compose(translate(lastAt[0], lastAt[1], lastAt[2]), rotateZ(90 * DEG)),
      ),
    );

    // Someone walks along the far side from the nose to the tail as the camera does.
    const walked = paced(t - 4.3, 1.9, ROUND.total);
    const walker = ROUND.at(walked);
    items.push(
      ...person(
        compose(
          translate(walker.x, walker.y, 0),
          rotateZ(faced(walker, walked, ROUND.total, -120 * DEG, -40 * DEG)),
        ),
        (walked / 1.45) * TAU,
        walker.moving,
      ),
    );

    const labels = (plate: Plate) => {
      const litres = (n: number | undefined, what: string) =>
        n ? `${n.toLocaleString("en-AU")} L ${what}` : `No ${what}`;
      // The front trunk: how much, for both. Labels stand clear of the raised panel.
      const front = span(2.5, 5.0, t, 0.45);
      const overNose: V3 = [1.7, 0, 1.9];
      pill(
        plate,
        overNose,
        base.name,
        litres(figure(base, "frunk_l"), "front trunk"),
        {
          tone: "dark",
          alpha: front,
          dy: -62,
          tie: [tub[0], tub[1], STORE.frunk.high],
        },
      );
      pill(
        plate,
        overNose,
        rival.name,
        litres(figure(rival, "frunk_l"), "front trunk"),
        {
          alpha: front,
          dy: -27,
        },
      );

      // The boot.
      const rear = span(9.0, 11.4, t, 0.45);
      const overTail: V3 = [-2.7, 0, 2.3];
      const mouth = onCar(model, CAR, 4.4, 0, 0.95);
      pill(plate, overTail, base.name, litres(figure(base, "boot_l"), "boot"), {
        tone: "dark",
        alpha: rear,
        dy: -62,
        tie: mouth,
      });
      pill(
        plate,
        overTail,
        rival.name,
        litres(figure(rival, "boot_l"), "boot"),
        {
          alpha: rear,
          dy: -27,
        },
      );

      // The well.
      const under = span(12.6, 14.4, t, 0.45);
      pill(plate, overTail, base.name, "A well under the boot floor", {
        tone: "dark",
        alpha: under,
        dy: -45,
        tie: well,
      });

      // All three at once, as each maker states them.
      const all = ramp(15.4, 16.1, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
      const roof: V3 = [0, 0, 1.75];
      pill(plate, roof, base.name, answer(base, "storage") ?? "Not stated", {
        tone: "dark",
        alpha: all,
        dy: -84,
        tie: roof,
      });
      pill(plate, roof, rival.name, answer(rival, "storage") ?? "Not stated", {
        alpha: all,
        dy: -49,
      });
      caption(
        plate,
        "Makers' figures. The well under the floor is shown for the Model Y only; some alternatives have one too.",
        all,
      );
    };
    return { shot, items, labels };
  },
});
