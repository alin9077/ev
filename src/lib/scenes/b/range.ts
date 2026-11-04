/**
 * Range & charging, B: easy charging at home, and confidence on longer
 * trips. Day breaks over a car that has charged on the drive overnight. The
 * camera pulls back until the street is a dot on a map, where a planned
 * route runs out through fast-charging stops; then it comes down on one of
 * them, a row of chargers beside a café, where the car tops up during a
 * break. The map is a sketch, not a real place.
 */
import { cabinItems, carItems, onCar, placed } from "./car";
import {
  answer,
  dotFor,
  has,
  hero,
  numberIn,
  offset,
  pair,
  stand,
} from "./common";
import { type Item } from "./gl";
import { homeLot } from "./home";
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
  settle,
  span,
  translate,
  type V2,
  type V3,
} from "./math";
import { badge, bloom, brief, caption, pill, spot } from "./overlay";
import { cafe, chargingSite, evening, wallbox, wallboxHolster } from "./props";
import { scene, shoot, type Plate, type Shot } from "./stage";
import { route } from "./town";
import {
  PAINT,
  WHITE,
  box,
  cable,
  chargerHolster,
  gloss,
  ground,
  hedge,
  mass,
  person,
  road,
  tree,
} from "./world";

const GREEN = colour("#2fbf5b"),
  GREEN_CSS = "#2fbf5b",
  RED = colour("#d8433b");
const STARTS: [number, number, number] = [0, 5.6, 12.4];
const LOOP = 19.2;
const AZ = -146;

/** At home: nose to the street's left, so the charge port at the left rear faces us. */
const HOME = placed(0, 0, Math.PI);
const BOX: V3 = [2.75, -2.62, 0];
const BOX_TURN = 120 * DEG;

/** The sketch map: the way from home to a destination, and the stops on it. */
const STOPS: V2[] = [
  [650, -700],
  [900, -1500],
  [1700, -2300],
];
const WAY = route(
  [
    [0, -0],
    [120, -250],
    [480, -520],
    STOPS[0],
    [640, -1050],
    STOPS[1],
    [1180, -1820],
    [1600, -2050],
    STOPS[2],
    [1720, -2650],
    [1900, -2900],
  ],
  4,
  5,
);
const STOP_AT = STOPS.map((stop) => WAY.near(stop));
/** Other sites of the network, off the route. */
const ELSEWHERE: V2[] = [
  [700, 500],
  [1500, -300],
  [-300, -1100],
  [300, -1900],
  [700, -2700],
  [1900, -900],
  [1300, -3300],
  [2300, -1700],
  [-600, 300],
  [2500, -3500],
  [-400, -2500],
];
const ROADS: V2[][] = [
  [
    [300, 1800],
    [500, 400],
    [650, -700],
    [300, -1900],
    [-300, -3400],
    [-500, -4800],
  ],
  [
    [-1700, -300],
    [480, -520],
    [1500, -300],
    [3200, 200],
  ],
  [
    [-1600, -1100],
    [900, -1500],
    [2300, -1700],
    [3600, -2100],
  ],
  [
    [2500, 900],
    [1900, -900],
    [1700, -2300],
    [1300, -3300],
    [1500, -4700],
  ],
];

/** The stop the camera comes down on: the car's bay, and the row of posts at its tail. */
const SITE: V2 = STOPS[1];
const ROW: V3 = [SITE[0] - 9.3, SITE[1] - 3.35, 0];
const BAY = placed(SITE[0], SITE[1], 90 * DEG);
const POST: V3 = [SITE[0], ROW[1], 0];

let site: Item[] | undefined;
function stop(): Item[] {
  if (site) return site;
  const [x, y] = SITE;
  const items: Item[] = [
    ...chargingSite(ROW, 7),
    ...cafe([x + 2, y + 15.4, 0], 13),
    ...road([x, y - 9.5, 0], 120, 7),
    hedge([x - 15.4, y + 3, 0], 0.9, 6, 0.8),
    hedge([x + 15.6, y + 3, 0], 0.9, 6, 0.8),
    ...mass([x - 22, y + 20, 0], [12, 10, 7]),
    ...mass([x + 24, y + 22, 0], [13, 11, 8]),
    // Others charging, and one driving past.
    ...carItems(stand(), {
      at: placed(x - 9.3, y + 0.1, 90 * DEG),
      paint: WHITE,
      clay: true,
    }),
    ...carItems(stand(), {
      at: placed(x + 9.3, y + 0.2, 90 * DEG),
      paint: WHITE,
      clay: true,
    }),
    ...carItems(stand(), {
      at: placed(x + 14, y - 7.8, 0),
      paint: WHITE,
      clay: true,
    }),
  ];
  for (const [dx, dy, h] of [
    [-17.5, 8, 4.6],
    [17.6, 8.6, 4.8],
    [-9, 19.5, 5],
    [12.5, 20, 4.4],
    [-19, -3.6, 4.2],
    [19.5, -3.2, 4.4],
    [-27, 6, 5],
    [28, 5, 4.6],
  ] as const)
    items.push(...tree([x + dx, y + dy, 0], h, dx + 30));
  for (const [dx, dy, facing] of [
    [-1.2, 11.4, 80],
    [-2.7, 11.1, 20],
    [4.6, 11.2, 200],
    [8.2, 11.4, 180],
    [-10.9, 2.4, -90],
  ] as const)
    items.push(
      ...person(compose(translate(x + dx, y + dy, 0), rotateZ(facing * DEG))),
    );
  return (site = items);
}
/** Blocks of town out beyond a street: only there to shrink as the camera leaves. */
function beyond(cx: number, cy: number, seed: number): Item[] {
  const items: Item[] = [];
  for (let i = 0; i < 22; i++) {
    const a = hash(i * 3.3 + seed) * TAU,
      r = 44 + hash(i * 7.1 + seed) * 150;
    items.push(
      ...mass(
        [cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0],
        [8 + hash(i + 0.4) * 12, 8 + hash(i + 0.7) * 10, 4 + hash(i + 0.2) * 9],
      ),
    );
  }
  return items;
}

export const rangeSceneB = scene({
  beats: ["Home, charged", "Supercharger route", "Plug in and go"],
  starts: STARTS,
  loop: LOOP,
  still: 10.6,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);

    // Camera: on the drive, away to the map, and down on the stop.
    const near = (at: V3, across: number): Omit<Shot, "at"> => ({
      target: at,
      az: AZ,
      el: 31,
      fit: wide ? [across, across * 0.43] : [across * 0.58, across * 0.58],
    });
    const map: Omit<Shot, "at"> = {
      target: [1000, -1500, 0],
      az: AZ,
      el: 50,
      fit: wide ? [5200, 2240] : [4300, 4300],
    };
    const homeAt = offset([0.2, -0.4, 0.7], AZ, wide ? 2.4 : 0, wide ? 0.5 : 0);
    const shot = shoot(t, [
      { at: 0, ...near(homeAt, 18.5) },
      { at: 4.4, ...near(homeAt, 17.5) },
      { at: 7.4, ...map },
      { at: 11.2, ...map, fit: [map.fit[0] * 0.96, map.fit[1] * 0.96] },
      {
        at: 13.6,
        ...near([SITE[0] + 0.4, SITE[1] + (wide ? 3.6 : 1.4), 0.7], 26),
      },
      {
        at: LOOP,
        ...near([SITE[0] + 0.4, SITE[1] + (wide ? 3.8 : 1.6), 0.7], 25),
      },
    ]);
    const fit = shot.fit;
    /** 0 on a street, 1 once it has become a map. */
    const away = ramp(Math.log(70), Math.log(1500), Math.log(fit[0]));
    const atHome = t < 9;

    const items: Item[] = [
      ground(shot.target, fit[0], 0.05, [fit[0] / 34, 0.2 * away]),
    ];

    // Home: the cable goes back to the box once the night is over.
    const port = onCar(model, HOME, 4.5, 0.83, 1.07);
    const holster = wallboxHolster(BOX, BOX_TURN);
    const freed = ramp(3.0, 4.1, t, glide);
    const plug: V3 = [
      lerp(port[0], holster[0], freed),
      lerp(port[1] - 0.06, holster[1], freed),
      lerp(port[2], holster[2], freed) + 0.2 * Math.sin(Math.PI * freed),
    ];
    const homeGlass = span(0.8, 4.3, t, 0.8) * 0.85;

    // The stop: both cars' 10–80% times, each at its own pace.
    const unpaced = !!spec?.incomparable?.includes("dc_charge_time_min");
    const minutes = [base, rival].map(
      (car) => numberIn(car.facts.dc_charge_time_min) ?? 0,
    );
    const slowest = Math.max(minutes[0], minutes[1], 1);
    // Times over different charge windows are not raced against each other: both bars fill at one pace.
    const level = (m: number) =>
      m
        ? 0.1 +
          0.7 *
            ramp(14.4, 14.4 + 2.9 * (unpaced ? 1 : m / slowest), t, (v) => v)
        : 0.1;
    const sitePort = onCar(model, BAY, 4.5, 0.83, 1.07);
    const siteHolster = chargerHolster(POST, 90 * DEG);
    const plugged =
      ramp(13.3, 14.2, t, glide) * (1 - ramp(17.6, 18.3, t, glide));
    const sitePlug: V3 = [
      lerp(siteHolster[0], sitePort[0] - 0.06, plugged),
      lerp(siteHolster[1], sitePort[1], plugged),
      lerp(siteHolster[2], sitePort[2], plugged) +
        0.18 * Math.sin(Math.PI * plugged),
    ];
    const siteGlass = span(13.9, 17.7, t, 0.8) * 0.9;
    const leaving = 5.5 * ramp(18.2, LOOP + 0.6, t, (v) => v * v);

    if (away < 0.995) {
      if (atHome) {
        items.push(
          ...homeLot(),
          ...wallbox(BOX, BOX_TURN),
          ...carItems(model, {
            at: HOME,
            paint: PAINT,
            xray: homeGlass,
            lamps: 0.15,
            tail: 0.25,
          }),
          cable("lead", holster, plug, 0.32 - 0.1 * freed),
          box(
            [0.07, 0.16, 0.07],
            [plug[0], plug[1] - 0.02, plug[2] - 0.035],
            gloss(colour("#2a2d31"), 0.05),
            0.02,
          ),
        );
        if (homeGlass > 0.01)
          items.push(
            ...cabinItems(model, {
              at: HOME,
              seats: spec?.seats ?? 5,
              pack: { fill: 1, colour: GREEN, glow: 0.5 },
            }),
          );
        if (fit[0] > 30) items.push(...beyond(0, 0, 1));
      } else {
        const here = compose(translate(0, leaving, 0), BAY);
        items.push(
          ...stop(),
          ...carItems(model, {
            at: here,
            paint: PAINT,
            xray: siteGlass,
            lamps: t > 18 ? 0.8 : 0.15,
            tail: 0.25 + 0.5 * plugged,
            roll: leaving / model.shape.wheelR,
          }),
          cable("lead", siteHolster, sitePlug, 0.22 + 0.2 * (1 - plugged)),
          box(
            [0.16, 0.07, 0.07],
            [sitePlug[0] + 0.02, sitePlug[1], sitePlug[2] - 0.035],
            gloss(colour("#2a2d31"), 0.05),
            0.02,
          ),
        );
        if (siteGlass > 0.01)
          items.push(
            ...cabinItems(model, {
              at: here,
              seats: spec?.seats ?? 5,
              pack: { fill: level(minutes[0]), colour: GREEN, glow: 0.5 },
            }),
          );
        // The driver, over at the café while it charges.
        items.push(
          ...person(
            compose(translate(SITE[0] + 2.2, SITE[1] + 10.9, 0), rotateZ(-1.2)),
          ),
        );
        if (fit[0] > 30) items.push(...beyond(SITE[0], SITE[1], 9));
      }
    }

    const labels = (plate: Plate) => {
      const { ctx } = plate;
      const u = plate.unit;
      const both = (
        at: V3 | V2,
        key: string,
        alpha: number,
        dy: number,
        tie?: V3,
        limit = 44,
      ) =>
        [base, rival].forEach((car, i) =>
          pill(plate, at, car.name, brief(answer(car, key), limit), {
            tone: i ? "light" : "dark",
            alpha,
            dy: dy + i * 35,
            dot: dotFor(has(car, key)),
            tie: i ? undefined : tie,
          }),
        );

      // Home: charged overnight.
      const night = 1 - ramp(0.8, 3.2, t);
      const roof: V3 = [0, 0, 1.75];
      const home = span(1.0, 4.5, t, 0.45);
      both(roof, "home_charging", home, -128, undefined, 54);
      badge(plate, [0, 0, 2.6], night > 0.5 ? "moon" : "bolt", GREEN, {
        alpha: home,
        pop: ramp(1.0, 1.6, t, settle),
        stem: roof,
        radius: 15,
      });
      bloom(
        plate,
        port,
        0.5,
        GREEN,
        (1 - freed) * (1 - away) * (atHome ? 0.6 : 0),
      );

      // The map: roads, the network's other sites, the route and its stops.
      const mapped = ramp(0.55, 0.9, away);
      if (mapped > 0.01) {
        const line = (points: V2[], upTo = 1) => {
          ctx.beginPath();
          const n = Math.max(2, Math.ceil(points.length * upTo));
          points.slice(0, n).forEach((p, k) => {
            const [x, y] = spot(plate, [p[0], p[1], 0]);
            if (k) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
          });
        };
        ctx.save();
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.globalAlpha = 0.9 * mapped;
        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 5 * u;
        for (const r of ROADS) {
          line(r);
          ctx.stroke();
        }
        ctx.strokeStyle = "rgba(34,39,43,0.1)";
        ctx.lineWidth = 1 * u;
        for (const r of ROADS) {
          line(r);
          ctx.stroke();
        }
        // The rest of the network, quietly.
        ctx.globalAlpha = 0.7 * mapped * ramp(6.6, 7.6, t);
        for (const p of ELSEWHERE) {
          const [x, y] = spot(plate, [p[0], p[1], 0]);
          ctx.fillStyle = "#d8433b";
          ctx.beginPath();
          ctx.arc(x, y, 3.4 * u, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.4 * u;
          ctx.stroke();
        }
        // The route, drawn out from home.
        const drawn = ramp(6.6, 9.2, t, glide);
        const sampled: V2[] = [];
        for (let k = 0; k <= 160; k++) {
          const p = WAY.at((WAY.total * drawn * k) / 160);
          sampled.push([p.x, p.y]);
        }
        ctx.globalAlpha = mapped;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 6.4 * u;
        line(sampled);
        ctx.stroke();
        ctx.strokeStyle = GREEN_CSS;
        ctx.lineWidth = 3.2 * u;
        line(sampled);
        ctx.stroke();
        // Home, and the car on its way to the second stop.
        const gone = STOP_AT[1] * ramp(8.6, 11.9, t, glide);
        const car = WAY.at(gone);
        for (const [p, r, fill] of [
          [[0, 0], 5, "#22272b"],
          [[car.x, car.y], 6.5, GREEN_CSS],
        ] as const) {
          const [x, y] = spot(plate, [p[0], p[1], 0]);
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(x, y, r * u, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 2 * u;
          ctx.stroke();
        }
        ctx.restore();

        STOPS.forEach((p, k) => {
          const reached = ramp(
            (STOP_AT[k] / WAY.total) * 0.98,
            (STOP_AT[k] / WAY.total) * 0.98 + 0.04,
            drawn,
          );
          badge(plate, [p[0], p[1], 0], "bolt", RED, {
            alpha: mapped * reached,
            pop: lerp(0.6, 1, reached),
            radius: 13,
          });
        });
        const end = WAY.at(WAY.total);
        badge(plate, [end.x, end.y, 0], "pin", colour("#22272b"), {
          alpha: mapped * ramp(0.96, 1, drawn),
          radius: 13,
        });
        const named = mapped * span(7.2, 12.3, t, 0.4);
        pill(plate, [0, 0, 0], "", "Home", { alpha: named, dy: 24 });
        pill(plate, [end.x, end.y, 0], "", "Destination", {
          alpha: named * ramp(0.96, 1, drawn),
          dy: 30,
        });
        pill(
          plate,
          [STOPS[1][0], STOPS[1][1], 0],
          "",
          "Charge during a break",
          {
            alpha: named * ramp(10.2, 10.8, t),
            dy: 32,
          },
        );
        const head: V2 = [
          plate.width / 2,
          (plate.wide ? 0.2 : 0.14) * plate.height,
        ];
        both(
          head,
          "navigation_route_planner",
          mapped * span(7.0, 9.6, t, 0.4),
          -17,
        );
        both(
          head,
          "supercharger_access",
          mapped * span(9.7, 12.3, t, 0.4),
          -17,
        );
        caption(
          plate,
          "An extensive, integrated fast-charging network. The map, route and sites are a sketch, not real places.",
          mapped * span(6.8, 12.3, t, 0.4),
        );
      }

      // The stop: plug in, and each car's time to charge.
      const charging = span(14.3, 17.7, t, 0.45);
      const over: V3 = [SITE[0], SITE[1] + leaving, 1.75];
      const time = (car: typeof base, m: number) => {
        const value = car.facts.dc_charge_time_min;
        return typeof value === "string"
          ? value
          : m
            ? `${m} min`
            : "Not stated";
      };
      const claim = (car: typeof base, m: number) =>
        `${car.bases?.dc_charge_time_min ?? "Charge window not stated"} in ${time(car, m)}`;
      pill(plate, over, base.name, claim(base, minutes[0]), {
        tone: "dark",
        alpha: charging,
        dy: -92,
        level: (level(minutes[0]) - 0.1) / 0.7,
        bar: GREEN_CSS,
        tie: over,
      });
      pill(plate, over, rival.name, claim(rival, minutes[1]), {
        alpha: charging,
        dy: -57,
        level: (level(minutes[1]) - 0.1) / 0.7,
        bar: GREEN_CSS,
      });
      bloom(
        plate,
        sitePort,
        0.5,
        GREEN,
        plugged * (1 - away) * (atHome ? 0 : 0.7),
      );
      badge(plate, [POST[0], POST[1], 2.75], "bolt", RED, {
        alpha:
          (1 - away) * (atHome ? 0 : 1) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t)),
        stem: [POST[0], POST[1], 2.05],
        radius: 13,
      });
    };
    return {
      shot,
      items,
      labels,
      light: evening(0.8 * (1 - ramp(0.8, 3.2, t)) * (atHome ? 1 : 0)),
    };
  },
});
