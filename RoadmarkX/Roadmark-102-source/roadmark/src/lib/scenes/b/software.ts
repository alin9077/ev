/**
 * Software & tech, B: the car keeps gaining useful improvements. A ruler of
 * two years is laid out along the front of the drive, and a pin rises on it
 * for every documented Australian release, one row for each selected car.
 * Three of the pins then say what their release brought. Last, night falls,
 * an update comes down to the parked car, and by morning something new is
 * on its screen.
 */
import { SCREEN_AT, cabinItems, carItems, placed } from "./car";
import { answer, dotFor, has, hero, offset, pair } from "./common";
import { type Item } from "./gl";
import { homeLot } from "./home";
import {
  colour,
  compose,
  glide,
  ramp,
  scale,
  settle,
  span,
  track,
  transform,
  translate,
  type V2,
  type V3,
} from "./math";
import { ball, merge, post } from "./mesh";
import { badge, bloom, brief, caption, flow, pill, spot } from "./overlay";
import { evening } from "./props";
import { scene, type Plate } from "./stage";
import { PAINT, clay, gloss, ground, kept, ribbon } from "./world";
import type { SceneCar } from "../kit";

const STARTS: [number, number, number] = [0, 6, 12.4];
const LOOP = 19.2;
const AZ = -146,
  EL = 31;
const TEAL = colour("#27b3a7");
const CAR = placed(0, 0, Math.PI);
/** The ruler: where it starts, how long two years are, and each car's row. */
const FROM = -6.4,
  LONG = 12.8,
  RULE = -4.8,
  ROWS = [-4.25, -5.35];
const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

const day = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86400000;
/** How far through the research window a date falls: 0–1. */
const through = (date: string, window: [string, string]) =>
  (day(date) - day(window[0])) / (day(window[1]) - day(window[0]) || 1);
const dated = (date: string) =>
  `${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;
/** Three releases to open up: ones that changed navigation, charging or driving, spread over the window. */
function chosen(releases: { date: string; change: string }[]) {
  if (releases.length <= 3) return releases.map((_, i) => i);
  const useful = (text: string) =>
    /navigat|trip|route|charg|precondition|brak|driv/i.test(text) ? 1 : 0;
  const picks: number[] = [];
  for (let part = 0; part < 3; part++) {
    const from = Math.floor((releases.length * part) / 3),
      to = Math.floor((releases.length * (part + 1)) / 3);
    let best = from;
    for (let i = from; i < to; i++)
      if (useful(releases[i].change) > useful(releases[best].change)) best = i;
    picks.push(best);
  }
  return picks;
}
const count = (car: SceneCar) =>
  car.releaseMinimum === undefined
    ? "Release history not loaded"
    : car.releaseMinimum === null
      ? "No release count documented"
      : `At least ${car.releaseMinimum} documented release${car.releaseMinimum === 1 ? "" : "s"}`;

export const softwareSceneB = scene({
  beats: ["Release history", "What an update brings", "Overnight install"],
  starts: STARTS,
  loop: LOOP,
  still: 4.9,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const window = base.releaseWindow ?? ["2024-10-05", "2026-10-05"];
    const rows = [base.releases ?? [], rival.releases ?? []];
    const picks = chosen(rows[0]);

    // The cursor runs along the ruler; pins rise as it passes their dates.
    const swept = ramp(0.9, 4.8, t, (v) => v);
    const cleared = ramp(12.3, 13.2, t, glide);
    const night = span(12.6, 17.6, t, 1.2);
    const installing = ramp(14.4, 16.6, t, (v) => v);
    const done = ramp(16.6, 17.2, t, settle);
    const xray = 0.62 * span(13.4, LOOP - 0.6, t, 0.8);
    /** Which chosen release is open, and how far: each has two seconds. */
    const open = (k: number) => span(6.3 + k * 2, 8.2 + k * 2, t, 0.4);

    const across = track(t, [
      [0, wide ? 24 : 14.4],
      [5.8, wide ? 23 : 13.8],
      [12.2, wide ? 23 : 13.8],
      [14, wide ? 16.5 : 10],
      [LOOP, wide ? 16 : 9.8],
    ]);
    const focus: V3 = [
      track(t, [
        [0, -0.7],
        [12.2, -0.7],
        [14, 0],
        [LOOP, 0],
      ]),
      track(t, [
        [0, -3.5],
        [12.2, -3.5],
        [14, -0.3],
        [LOOP, -0.3],
      ]),
      0.6,
    ];
    const shot = {
      at: t,
      target: offset(focus, AZ, wide ? 1.0 : 0, wide ? 0.4 : -0.1),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.43 : across] as V2,
    };

    const screen = transform(CAR, SCREEN_AT(model));
    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...homeLot(),
      ...carItems(model, {
        at: CAR,
        paint: PAINT,
        xray,
        lamps: 0.1 + 0.5 * done,
        tail: 0.25,
      }),
    ];
    if (xray > 0.01)
      items.push(
        ...cabinItems(model, {
          at: CAR,
          seats: spec?.seats ?? 5,
          screen: { lit: 0.25 + 0.75 * done, colour: TEAL },
          drive: { lit: 0.5 * done, colour: TEAL },
        }),
      );

    // The ruler and its pins.
    if (cleared < 1) {
      items.push(
        ribbon(
          "ruler",
          [
            [FROM, RULE],
            [FROM + LONG * ramp(0.4, 1.3, t, glide), RULE],
          ],
          0.06,
          colour("#22272b"),
          0.6 * (1 - cleared),
          0.1,
        ),
      );
      const pin = kept("release pin", () =>
        merge([
          [post(0.022, 0.72, 0.005, 8)],
          [ball([0.105, 0.105, 0.105], 0, 1, 10, 14), translate(0, 0, 0.78)],
        ]),
      );
      rows.forEach((releases, row) =>
        releases.forEach((release, i) => {
          const f = through(release.date, window);
          const risen = ramp(f - 0.01, f + 0.05, swept, settle) * (1 - cleared);
          if (risen <= 0.01) return;
          const k = row ? -1 : picks.indexOf(i);
          const lifted = k >= 0 ? open(k) : 0;
          items.push({
            mesh: pin,
            at: compose(
              translate(FROM + f * LONG, ROWS[row], 0.07),
              scale(
                1 + 0.5 * lifted,
                1 + 0.5 * lifted,
                risen * (1 + 0.45 * lifted),
              ),
            ),
            mat: row
              ? clay(colour("#a9a7a2"))
              : lifted > 0.3
                ? gloss(TEAL, 0.08)
                : gloss(colour("#2d3136"), 0.06),
          });
        }),
      );
    }

    const labels = (plate: Plate) => {
      const { ctx } = plate;
      const u = plate.unit;
      const shown = (1 - cleared) * ramp(0.6, 1.4, t);
      // The ruler's quarters, and each new year by name.
      if (shown > 0.01) {
        ctx.save();
        ctx.globalAlpha = shown;
        ctx.strokeStyle = "rgba(34,39,43,0.5)";
        ctx.fillStyle = "#6c7177";
        ctx.lineWidth = u;
        ctx.font = `500 ${10.5 * u}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const first = Number(window[0].slice(0, 4));
        for (let m = 0; m <= 26; m += 3) {
          const month = (Number(window[0].slice(5, 7)) - 1 + m) % 12,
            year =
              first + Math.floor((Number(window[0].slice(5, 7)) - 1 + m) / 12);
          const f = through(
            `${year}-${String(month + 1).padStart(2, "0")}-01`,
            window as [string, string],
          );
          if (f < 0 || f > 1) continue;
          const x = FROM + f * LONG;
          const [ax, ay] = spot(plate, [x, RULE - 0.14, 0.1]),
            [bx, by] = spot(plate, [x, RULE + 0.14, 0.1]);
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
          if (month === 0) {
            const [tx, ty] = spot(plate, [x, ROWS[1] - 0.75, 0.1]);
            ctx.fillText(String(year), tx, ty);
          }
        }
        ctx.restore();
      }

      // Release history: how many, at the least, for each car.
      const counted = span(2.4, 5.8, t, 0.45);
      const end: V3 = [FROM + LONG, RULE, 0.9];
      const side = plate.wide
        ? ({ anchor: "left", dx: 18 } as const)
        : ({ anchor: "right", dx: 6 } as const);
      [base, rival].forEach((car, i) =>
        pill(plate, end, car.name, count(car), {
          tone: i ? "light" : "dark",
          alpha: counted,
          ...side,
          dy: (plate.wide ? -34 : -96) + i * 35,
        }),
      );
      caption(
        plate,
        `Documented Australian releases, ${dated(window[0])} to ${dated(window[1])}. These are minimums, not counts of what any one car installed.`,
        span(1.6, 12.2, t, 0.45),
      );

      // What an update brings: three releases, opened one at a time.
      picks.forEach((index, k) => {
        const release = rows[0][index];
        const lifted = open(k);
        if (!release || lifted <= 0.01) return;
        const x = FROM + through(release.date, window) * LONG;
        const top: V3 = [x, ROWS[0], 1.3];
        badge(plate, [x, ROWS[0], 2.1], "update", TEAL, {
          alpha: lifted,
          pop: 0.7 + 0.3 * lifted,
          stem: top,
          radius: 14,
        });
        const centre: V2 = [
          plate.width * (plate.wide ? 0.66 : 0.5),
          (plate.wide ? 0.13 : 0.2) * plate.height,
        ];
        pill(
          plate,
          centre,
          dated(release.date),
          brief(release.change.replace(/\.$/, ""), plate.wide ? 78 : 44),
          { tone: "dark", alpha: lifted },
        );
      });
      if (!rows[0].length)
        pill(
          plate,
          [plate.width * (plate.wide ? 0.66 : 0.5), 0.2 * plate.height],
          base.name,
          "No dated releases documented",
          { tone: "dark", alpha: span(6.3, 12.2, t, 0.4) },
        );

      // Overnight install: down to the roof while the car is parked.
      const roof = transform(CAR, [0, 0, 1.68]);
      const sky: V3 = [roof[0], roof[1], 3.7];
      const coming = span(13.6, 16.8, t, 0.4);
      flow(plate, [sky, roof], TEAL, {
        alpha: coming,
        drawn: ramp(13.6, 14.6, t),
        dash: [2, 7],
        nodes: [((t * 0.6) % 1) * 0.9 + 0.05],
      });
      badge(plate, sky, night > 0.5 && done < 0.5 ? "moon" : "check", TEAL, {
        alpha: ramp(13.2, 13.8, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t)),
        pop: ramp(13.2, 13.8, t, settle) + 0.15 * span(16.6, 17.4, t, 0.3),
        radius: 16,
      });
      bloom(
        plate,
        screen,
        0.55,
        TEAL,
        done * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t)),
      );
      const over: V3 = [roof[0], roof[1], 1.75];
      pill(
        plate,
        over,
        "Parked",
        done > 0.5 ? "New function ready" : "Installing",
        {
          tone: "light",
          alpha: span(14.2, 17.6, t, 0.4),
          anchor: plate.wide ? "left" : "centre",
          dx: plate.wide ? 60 : 0,
          dy: plate.wide ? -136 : -186,
          level: installing,
          bar: "#27b3a7",
        },
      );
      const scope = ramp(15.2, 15.9, t) * (1 - ramp(LOOP - 0.9, LOOP - 0.5, t));
      [base, rival].forEach((car, i) =>
        pill(
          plate,
          over,
          car.name,
          brief(answer(car, "ota_capability_scope"), 60),
          {
            tone: i ? "light" : "dark",
            alpha: scope,
            anchor: plate.wide ? "left" : "centre",
            dx: plate.wide ? 60 : 0,
            dy: (plate.wide ? -66 : -112) + i * 35,
            dot: dotFor(has(car, "ota_capability_scope")),
          },
        ),
      );
    };
    return { shot, items, labels, light: evening(0.82 * night) };
  },
});
