/**
 * Price & ownership, B: what does it cost to buy and charge? The two
 * selected cars stand on a forecourt. A line of tiles runs out from each,
 * one for every A$10,000 of its listed price. The tiles go and two batteries
 * take the same fifty kilowatt-hours, one from a home charger off-peak and
 * one from a public fast charger, while the coins each costs stack up beside
 * it. Last, two bands run out from each car along a ruler of years: its
 * vehicle warranty, and its battery warranty.
 */
import { carItems, placed } from "./car";
import { answer, figure, hero, offset, pair, stand } from "./common";
import { type Item } from "./gl";
import {
  DEG,
  colour,
  compose,
  glide,
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
import { block } from "./mesh";
import { brief, caption, dollars, pill, spot } from "./overlay";
import { coins, wallbox, wallboxHolster } from "./props";
import { scene, type Plate } from "./stage";
import {
  ASPHALT,
  GRAPHITE,
  PAINT,
  STONE,
  WHITE,
  box,
  cable,
  charger,
  chargerHolster,
  clay,
  ground,
  hedge,
  house,
  kept,
  mass,
  person,
  ribbon,
  road,
  tree,
} from "./world";
import { post } from "./mesh";

const STARTS: [number, number, number] = [0, 5.6, 12.2];
const LOOP = 19;
const AZ = -40,
  EL = 31;
const GREEN = colour("#2fbf5b"),
  BLUE = colour("#2f8fdc");
/** The two cars, nose to +x: the one the page is about nearer the camera. */
const ROWS = [-1.85, 1.85];
/** Where things laid out in front of the cars begin, and a year or a tile's length. */
const FRONT = 3.5,
  TILE = 0.9,
  YEAR = 0.72;

/** The forecourt and the street it is on: built once. */
let lot: Item[] | undefined;
function forecourt(): Item[] {
  if (lot) return lot;
  const items: Item[] = [
    box([24, 12.4, 0.02], [3.6, 0, 0], clay(ASPHALT), 0.004, false),
    // The showroom behind, its neighbours, and the street in front.
    ...house([2, 11, 0], 22, 8, true),
    ...house([-17, 8, 0], 9, 7.5, false),
    ...mass([24, 12, 0], [9, 9, 6]),
    ...mass([6, 33, 0], [16, 11, 9]),
    ...mass([-20, 30, 0], [12, 10, 7]),
    ...road([0, -11.6, 0], 90, 7),
    hedge([-6.5, -6.6, 0], 5, 0.9, 0.7),
    hedge([13, -6.6, 0], 5, 0.9, 0.7),
    hedge([-9.2, 2, 0], 0.9, 7, 0.8),
    box([0.5, 0.5, 0.6], [-3.6, 6.2, 0], clay(), 0.06),
    box([0.5, 0.5, 0.6], [7.2, 6.2, 0], clay(), 0.06),
    // Another car for sale, further along, and one passing.
    ...carItems(stand(), {
      at: placed(-5.4, 3.6, 0),
      paint: WHITE,
      clay: true,
    }),
    ...carItems(stand(), {
      at: placed(-12, -9.9, 0),
      paint: WHITE,
      clay: true,
    }),
  ];
  // A row of flagpoles along the back of the forecourt.
  for (const x of [-7.4, -7.4, -7.4].map((v, i) => v + 0 * i))
    for (const y of [-4.6, -3.2, -1.8])
      items.push({
        mesh: kept("flagpole", () => post(0.04, 4.2, 0.01, 10)),
        at: translate(x, y, 0),
        mat: clay(),
      });
  for (const [x, y, h] of [
    [-11.5, 4.5, 4.6],
    [-12.5, -4.6, 4.8],
    [17.5, 6.6, 4.4],
    [19, -4, 4.2],
    [-22, -5, 5],
    [8, -17, 4.8],
    [-8, -17.4, 5],
    [24, -17, 4.4],
  ] as const)
    items.push(...tree([x, y, 0], h, x + 40));
  for (const [x, y, facing] of [
    [1.2, 5.6, -100],
    [2.1, 5.9, 200],
    [-2.6, -4.4, 40],
    [10.5, 5.4, -70],
  ] as const)
    items.push(...person(compose(translate(x, y, 0), rotateZ(facing * DEG))));
  return (lot = items);
}

/** The first number of years in a warranty, as stated. */
const years = (text: number | string | undefined) => {
  const found = String(text ?? "").match(/(\d+)\s*year/i);
  return found ? Number(found[1]) : undefined;
};

export const priceSceneB = scene({
  beats: ["Retail price", "Charging cost", "Warranty"],
  starts: STARTS,
  loop: LOOP,
  still: 3.9,
  moment({ t, spec, wide }) {
    const [base, rival] = pair(spec);
    const cars = [base, rival];
    const prices = cars.map((car) => figure(car, "price_aud"));

    const across = track(t, [
      [0, wide ? 22 : 14],
      [5.4, wide ? 21 : 13.4],
      [7, wide ? 21.6 : 13.6],
      [12, wide ? 21 : 13.2],
      [13.6, wide ? 25 : 16],
      [LOOP, wide ? 24.4 : 15.6],
    ]);
    const focus: V3 = [
      track(t, [
        [0, 3.6],
        [5.4, 3.8],
        [7, 4.8],
        [12, 4.8],
        [13.6, wide ? 5.6 : 5.2],
        [LOOP, wide ? 5.6 : 5.2],
      ]),
      0,
      0.6,
    ];
    const shot = {
      at: t,
      target: offset(focus, AZ, wide ? 2.4 : 0, wide ? 0.9 : -0.2),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.43 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...forecourt(),
      ...carItems(hero(), {
        at: placed(0, ROWS[0], 0),
        paint: PAINT,
        lamps: 0.5,
        tail: 0.2,
      }),
      ...carItems(stand(), {
        at: placed(0, ROWS[1], 0),
        paint: WHITE,
        clay: true,
      }),
    ];

    // Retail price: a tile for every A$10,000, laid out from each car's nose.
    const cleared = ramp(5.0, 5.9, t, glide);
    const tile = kept("price tile", () => block(TILE - 0.1, 1.5, 0.07, 0.03));
    prices.forEach((price, row) => {
      const count = (price ?? 0) / 10000;
      for (let k = 0; k < count; k++) {
        const part = Math.min(1, count - k);
        const laid = ramp(
          1.0 + k * 0.3 + row * 0.12,
          1.5 + k * 0.3 + row * 0.12,
          t,
          settle,
        );
        if (laid <= 0 || cleared > 0.995) continue;
        // Cleared, a tile flattens and takes the colour of the floor under it.
        items.push({
          mesh: tile,
          at: compose(
            translate(
              FRONT + k * TILE + (TILE * part) / 2 - 0.05,
              ROWS[row],
              0.02,
            ),
            scale(
              part * Math.min(1, laid),
              Math.min(1, laid),
              laid * (1 - cleared),
            ),
          ),
          mat: clay(mix3(row ? WHITE : GRAPHITE, ASPHALT, cleared)),
        });
      }
    });

    // Charging cost: the same energy into two batteries, and what each costs.
    const shown = ramp(6.0, 6.9, t, glide) * (1 - ramp(11.7, 12.5, t, glide));
    const filled = ramp(7.3, 10.4, t, (v) => v);
    const PACK = 5.6;
    const sources = [
      { y: -2.5, coins: 3, post: [8.3, -3.2, 0] as V3, turn: 170 * DEG },
      { y: 1.6, coins: 25, post: [8.3, 0.9, 0] as V3, turn: 170 * DEG },
    ];
    if (shown > 0.01)
      sources.forEach((source, k) => {
        // Everything here rises out of the floor and flattens back into it,
        // taking the floor's colour as it goes.
        const tone = ramp(0, 0.5, shown);
        const stood = (x: number, y: number, z: number) =>
          compose(translate(x, y, 0.02 + z * shown), scale(1, 1, shown));
        const full = 2.5 * 0.86 * filled;
        items.push(
          box(
            [2.9, 1.7, 0.34],
            stood(PACK, source.y, 0),
            clay(mix3(ASPHALT, WHITE, tone)),
            0.04,
          ),
          box(
            [2.5 - full, 1.36, 0.2],
            stood(PACK - 1.25 + (2.5 - full) / 2, source.y, 0.34),
            clay(mix3(ASPHALT, STONE, tone), { q: [0.29, 0, 0, 0] }),
            0.02,
          ),
        );
        if (filled > 0.01)
          items.push(
            box(
              [full, 1.36, 0.21],
              stood(PACK + 1.25 - full / 2, source.y, 0.34),
              {
                ...clay(mix3(ASPHALT, GREEN, tone), { q: [0.29, 0, 0, 0] }),
                color2: GREEN,
                p: [0.45 * tone, 0.1, 0.3 * tone, 0],
              },
              0.02,
            ),
          );
        const at = source.post;
        const from = k
          ? chargerHolster(at, source.turn)
          : wallboxHolster(at, source.turn);
        const flat = compose(translate(0, 0, 0.02), scale(1, 1, shown));
        items.push(
          ...(k ? charger(at, source.turn) : wallbox(at, source.turn)).map(
            (item) => ({ ...item, at: compose(flat, item.at) }),
          ),
          cable(
            `feed ${k}`,
            [from[0], from[1], 0.02 + from[2] * shown],
            [PACK + 1.3, source.y, 0.02 + 0.46 * shown],
            0.3 * shown,
          ),
          ...coins([PACK - 2.2, source.y, 0.02], source.coins * filled * shown),
        );
      });

    // Warranty: two bands from each car along a ruler of years.
    const ruled =
      ramp(12.6, 13.4, t, glide) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
    const terms = cars.map((car) => [
      years(car.facts.warranty),
      years(car.facts.battery_warranty),
    ]);
    if (ruled > 0.01) {
      const grown = ramp(13.2, 15.8, t, glide);
      items.push(
        ribbon(
          "years",
          [
            [FRONT, 0],
            [FRONT + 10 * YEAR * ruled, 0],
          ],
          0.05,
          colour("#22272b"),
          0.55 * ruled,
          0.036,
        ),
      );
      terms.forEach((pair2, row) =>
        pair2.forEach((term, k) => {
          if (!term) return;
          const y = ROWS[row] + (k ? 0.42 : -0.42);
          items.push(
            ribbon(
              `term ${row} ${k}`,
              [
                [FRONT, y],
                [FRONT + Math.max(0.05, Math.min(term, 10 * grown) * YEAR), y],
              ],
              0.52,
              k ? GREEN : BLUE,
              0.9 * ruled,
              0.034,
            ),
          );
        }),
      );
    }

    const labels = (plate: Plate) => {
      const { ctx } = plate;
      // Retail price.
      const priced = span(1.4, 5.3, t, 0.45);
      cars.forEach((car, row) => {
        const roof: V3 = [0, ROWS[row], 1.75];
        pill(
          plate,
          roof,
          car.name,
          prices[row]
            ? `${dollars(prices[row]!)}${car.bases?.price_aud ? ` · ${car.bases.price_aud}` : ""}`
            : "Price not stated",
          {
            tone: row ? "light" : "dark",
            alpha: priced,
            dy: -46,
            tie: roof,
          },
        );
      });
      caption(
        plate,
        spec?.incomparable?.includes("price_aud")
          ? `These prices are quoted on different bases (${base.bases?.price_aud ?? "unclear"} vs ${rival.bases?.price_aud ?? "unclear"}), so they are not directly comparable. Each tile is A$10,000.`
          : "Price for the selected version on the basis shown, before on-road costs unless marked Driveaway. Each tile is A$10,000.",
        priced,
      );

      // Charging cost.
      const costed = span(7.0, 11.8, t, 0.45);
      const names = ["At home, off-peak", "At a Supercharger"];
      const cost = (k: number) =>
        k
          ? `about ${dollars(25 * filled)}`
          : `${dollars(2 * filled)}–${Math.round(4 * filled)}`;
      [0, 1].forEach((k) => {
        const over: V3 = [PACK, sources[k].y, 0.6];
        pill(plate, over, names[k], `50 kWh · ${cost(k)}`, {
          tone: "light",
          alpha: costed,
          dy: k ? -150 : -64,
          tie: over,
          level: filled,
          bar: "#2fbf5b",
        });
      });
      caption(
        plate,
        "4–8c per kWh on an off-peak EV plan, against an example 50c at a Supercharger. Plans, eligibility and site prices vary.",
        costed,
      );

      // Warranty: the years along the ruler, and each car's terms as stated.
      if (ruled > 0.01) {
        ctx.save();
        ctx.globalAlpha = ruled;
        ctx.fillStyle = "#6c7177";
        ctx.strokeStyle = "rgba(34,39,43,0.55)";
        ctx.lineWidth = plate.unit;
        ctx.font = `500 ${10.5 * plate.unit}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (let y = 0; y <= 10; y++) {
          const [ax, ay] = spot(plate, [FRONT + y * YEAR, -0.16, 0.02]),
            [bx, by] = spot(plate, [FRONT + y * YEAR, 0.16, 0.02]);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          if (y % 5 === 0 && y) {
            const [tx, ty] = spot(plate, [FRONT + y * YEAR, -0.62, 0.02]);
            ctx.fillText(`${y} yr`, tx, ty);
          }
        }
        ctx.restore();
      }
      const stated = ramp(14.2, 14.9, t) * ruled;
      cars.forEach((car, row) => {
        const longest = Math.max(terms[row][0] ?? 0, terms[row][1] ?? 0, 2);
        // Beside the end of the bands on a wide plate; over or under them on a square one.
        const end: V3 = plate.wide
          ? [FRONT + longest * YEAR, ROWS[row], 0.02]
          : [FRONT + (longest * YEAR) / 2, ROWS[row], 0.02];
        const dy = plate.wide ? (row ? -34 : -6) : row ? -84 : 44;
        const side = plate.wide
          ? ({ anchor: "left", dx: 14 } as const)
          : ({ anchor: "centre", dx: 0 } as const);
        pill(
          plate,
          end,
          `${car.name} vehicle`,
          String(car.facts.warranty ?? "Not stated"),
          {
            tone: row ? "light" : "dark",
            alpha: stated,
            ...side,
            dy,
            dot: "#2f8fdc",
          },
        );
        pill(
          plate,
          end,
          "Battery",
          String(car.facts.battery_warranty ?? "Not stated"),
          {
            tone: row ? "light" : "dark",
            alpha: stated,
            ...side,
            dy: dy + 35,
            dot: "#2fbf5b",
          },
        );
      });
      const service = (car: typeof base) =>
        `${car.name}: ${brief(answer(car, "warranty_service"), 46).toLowerCase()}`;
      caption(plate, `Servicing. ${service(base)}. ${service(rival)}.`, stated);
    };
    return { shot, items, labels };
  },
});
