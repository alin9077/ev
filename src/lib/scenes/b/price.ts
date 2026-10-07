/**
 * Price & ownership, B. The two selected cars stand in a row and their prices
 * lift them: a stack of slabs rises under each, one slab for every A$10,000
 * listed, so the dearer car ends higher by exactly its difference. On-road
 * costs then add a darker slab for the drive-away price. Last, the stacks
 * sink and a ten-year rule runs out beside each car, filled as far as its
 * warranty lasts.
 */
import { carItems, placed } from "./car";
import { answer, hero, numberIn, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  colour,
  compose,
  glide,
  lerp,
  ramp,
  scale,
  span,
  translate,
  type V3,
} from "./math";
import { dollars, measure, pill } from "./overlay";
import { scene, type Plate } from "./stage";
import { CHAMPAGNE, WHITE, box, clay, decal, ground, kept } from "./world";
import { block } from "./mesh";

const STARTS: [number, number, number] = [0, 5.6, 11.2];
const LOOP = 17.2;
const AZ = -66,
  EL = 27;
/** One slab is A$10,000, and this many metres tall. */
const SLAB = 0.4;
const PRICE = colour("#e3d6c1"),
  ON_ROAD = colour("#c9b89e"),
  RULE = colour("#b9a98c");
const GAP = 6.9;

/** The slabs under one car, risen to `height` metres, in two tones. */
function stack(x: number, y: number, height: number, listed: number): Item[] {
  const items: Item[] = [];
  const slab = kept("slab", () => block(5.25, 2.5, 1, 0.045));
  for (let k = 0; k * SLAB < height - 0.001; k++) {
    const from = k * SLAB,
      to = Math.min(height, from + SLAB);
    // A slab that straddles the listed price is split where on-road costs begin.
    for (const [a, b, color] of [
      [from, Math.min(to, listed), PRICE],
      [Math.max(from, listed), to, ON_ROAD],
    ] as const) {
      const tall = b - a - (b === to && to - from >= SLAB - 0.001 ? 0.03 : 0);
      if (tall <= 0.004) continue;
      items.push({
        mesh: slab,
        at: compose(translate(x, y, a), scale(1, 1, tall)),
        mat: clay(color),
      });
    }
  }
  return items;
}

export const priceSceneB = scene({
  beats: ["Listed price", "Drive-away", "Warranty"],
  starts: STARTS,
  loop: LOOP,
  still: 9.4,
  moment({ t, spec, wide }) {
    const model = hero();
    const cars = pair(spec);
    const listed = cars.map(
      (car) => numberIn(car.facts.price_aud) ?? spec?.priceAud ?? 0,
    );
    const driveAway = cars.map((car, i) =>
      Math.max(listed[i], numberIn(answer(car, "driveaway_price")) ?? 0),
    );
    const metres = (aud: number) => (aud / 10000) * SLAB;

    const rise = ramp(0.9, 3.4, t, glide),
      more = ramp(6.1, 7.7, t, glide),
      sink = ramp(11.4, 12.9, t, glide);
    const shown = cars.map((_, i) =>
      lerp(lerp(0, listed[i], rise), driveAway[i], more),
    );
    // Counting, figures tick in tens; once settled they are exact.
    const quoted = shown.map((aud, i) =>
      more >= 1
        ? driveAway[i]
        : rise >= 1 && more <= 0
          ? listed[i]
          : Math.round(aud / 10) * 10,
    );
    const height = shown.map((aud) => metres(aud) * (1 - sink));
    const xs = [-GAP / 2, GAP / 2];

    const tallest = metres(Math.max(...driveAway, 30000));
    const lift = (1 - sink) * (0.25 + 0.75 * rise);
    const subject: V3 = [0, -0.6 * sink, lerp(0.9, 0.7 + tallest * 0.52, lift)];
    const across = wide ? 17.5 + tallest * 0.9 : 13.4;
    const shot = {
      at: t,
      target: offset(subject, AZ, wide ? 1.3 : 0, wide ? -0.15 : -0.2),
      az: AZ + 3 * ramp(0, LOOP, t, (v) => v),
      el: EL,
      fit: [across, wide ? 6.4 + tallest * 0.55 : 10.5 + tallest * 0.5] as [
        number,
        number,
      ],
    };

    const items: Item[] = [ground(shot.target, across, 0.05)];
    cars.forEach((car, i) => {
      const x = xs[i];
      items.push(
        ...stack(x, 0, height[i], metres(listed[i]) * (1 - sink)),
        ...carItems(i ? stand() : model, {
          at: compose(translate(0, 0, height[i]), placed(x, 0, 0)),
          paint: i ? WHITE : CHAMPAGNE,
          clay: i === 1,
          lamps: i ? 0 : 0.4,
          tail: 0.2,
        }),
      );
      // A bay under each stack, so the cars have somewhere to come back to.
      items.push(box([5.6, 2.85, 0.025], [x, 0, 0], clay(WHITE), 0.01, false));
    });

    // Warranty: a ten-year rule beside each car, a tick a year.
    const years = cars.map((car) => numberIn(car.facts.warranty) ?? 0);
    const battery = cars.map(
      (car) => numberIn(car.facts.battery_warranty) ?? 0,
    );
    const ruled = ramp(12.9, 13.7, t),
      filled = ramp(13.5, 15.1, t, glide);
    const RULE_Y = -2.15,
      YEAR = 0.5;
    if (ruled > 0.01)
      cars.forEach((_, i) => {
        const x0 = xs[i] - 2.5;
        items.push(
          decal(
            `rule ${i}`,
            [
              [x0, RULE_Y - 0.17],
              [x0 + 10 * YEAR * ruled, RULE_Y - 0.17],
              [x0 + 10 * YEAR * ruled, RULE_Y + 0.17],
              [x0, RULE_Y + 0.17],
            ],
            WHITE,
            0.95,
          ),
        );
        for (let year = 0; year <= 10 * ruled; year++)
          items.push(
            decal(
              `tick ${i} ${year}`,
              [
                [x0 + year * YEAR - 0.012, RULE_Y - 0.3],
                [x0 + year * YEAR + 0.012, RULE_Y - 0.3],
                [x0 + year * YEAR + 0.012, RULE_Y + 0.17],
                [x0 + year * YEAR - 0.012, RULE_Y + 0.17],
              ],
              colour("#8f9296"),
              0.8,
              0.016,
            ),
          );
        const cover = Math.min(years[i], 10) * YEAR * filled,
          pack = Math.min(battery[i], 10) * YEAR * filled;
        if (pack > 0.01)
          items.push(
            decal(
              `battery ${i}`,
              [
                [x0, RULE_Y - 0.17],
                [x0 + pack, RULE_Y - 0.17],
                [x0 + pack, RULE_Y - 0.06],
                [x0, RULE_Y - 0.06],
              ],
              RULE,
              0.55,
              0.018,
            ),
          );
        if (cover > 0.01)
          items.push(
            box(
              [1, 0.2, 0.05],
              compose(
                translate(x0 + cover / 2, RULE_Y + 0.05, 0.012),
                scale(cover, 1, 1),
              ),
              clay(RULE),
              0.012,
            ),
          );
      });

    const labels = (plate: Plate) => {
      const priced = span(1.2, 11.2, t, 0.45);
      cars.forEach((car, i) => {
        const roof: V3 = [xs[i], 0, height[i] + 1.72];
        const estimate = /about|approx/i.test(
          answer(car, "driveaway_price") ?? "",
        );
        const value =
          more > 0.02
            ? driveAway[i] > listed[i]
              ? `${estimate && more > 0.98 ? "about " : ""}${dollars(quoted[i])} drive-away`
              : "Drive-away not stated"
            : dollars(quoted[i]);
        pill(plate, roof, car.name, value, {
          tone: i ? "light" : "dark",
          alpha: priced,
          dy: -34,
          tie: roof,
        });
      });
      // What separates them, once both are counted.
      const apart = Math.abs(quoted[0] - quoted[1]);
      const told =
        (span(3.6, 5.5, t, 0.4) + span(7.9, 11.1, t, 0.4)) *
        (listed[0] && listed[1] ? 1 : 0);
      if (told > 0.01) {
        const level = Math.max(height[0], height[1]),
          lower = Math.min(height[0], height[1]);
        const edge =
          xs[height[0] >= height[1] ? 0 : 1] +
          (height[0] >= height[1] ? 2.63 : -2.63);
        measure(
          plate,
          [edge, -1.25, lower],
          [edge, -1.25, level],
          "#22272b",
          told,
        );
        pill(
          plate,
          [edge, -1.25, (level + lower) / 2],
          "",
          `${dollars(apart)} apart`,
          {
            alpha: told,
            anchor: height[0] >= height[1] ? "left" : "right",
            dx: height[0] >= height[1] ? 12 : -12,
          },
        );
      }
      // Warranty, quoted as researched, over each car.
      const covered = span(13.8, LOOP - 0.5, t, 0.45);
      cars.forEach((car, i) => {
        const roof: V3 = [xs[i], 0, 1.72];
        pill(
          plate,
          roof,
          car.name,
          String(car.facts.warranty ?? "Not stated"),
          {
            tone: i ? "light" : "dark",
            alpha: covered,
            dy: -68,
            tie: roof,
          },
        );
        if (battery[i])
          pill(plate, roof, "Battery", String(car.facts.battery_warranty), {
            alpha: covered,
            dy: -33,
          });
      });
    };
    return { shot, items, labels };
  },
});
