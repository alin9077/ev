/**
 * Space & safety, B. One car, to scale throughout. Its shell turns to glass
 * and the seats light one at a time; the tailgate lifts and the boot comes
 * out as blocks of a hundred litres, stacked beside the alternative's; then
 * a ring closes round the car under a shield, with a star for each ANCAP star.
 */
import { cabinItems, carItems, onCar, placed, seatPoint } from "./car";
import { answer, figure, hero, numberIn, offset, pair } from "./common";
import { type Item } from "./gl";
import {
  TAU,
  clamp,
  colour,
  compose,
  glide,
  lerp,
  ramp,
  scale,
  settle,
  span,
  track,
  translate,
  type V2,
  type V3,
} from "./math";
import { block } from "./mesh";
import { badge, brief, pill, spot } from "./overlay";
import { scene, type Plate } from "./stage";
import { CHAMPAGNE, WHITE, arc, clay, ground, kept, ribbon } from "./world";

const STARTS: [number, number, number] = [0, 5.4, 11.2];
const LOOP = 17.2;
const AZ = -45,
  EL = 31;
const AMBER = colour("#e9ad1f"),
  BLOCK = colour("#e3d6c1");
/** Tail towards us, so the boot opens into view. */
const CAR = placed(0, 0, Math.PI);
/** A block is 100 litres: a metre by half a metre, 20 cm deep. */
const DEEP = 0.2;
const STACKS: V2[] = [
  [4.1, -1.0],
  [4.1, 0.55],
];
const RING = 3.15;

export const spaceSceneB = scene({
  beats: ["Seats", "Boot", "Safety rating"],
  starts: STARTS,
  loop: LOOP,
  still: 10.1,
  moment({ t, spec, wide }) {
    const model = hero();
    const [base, rival] = pair(spec);
    const seats = clamp(figure(base, "seats") ?? spec?.seats ?? 5, 2, 7);
    const litres = [base, rival].map((car) => figure(car, "boot_l") ?? 0);

    const xray = span(0.7, 5.5, t, 0.9);
    const open = ramp(5.6, 6.7, t, glide) * (1 - ramp(10.7, 11.5, t, glide));
    const gone = ramp(10.5, 11.3, t, glide);

    const subject: V3 = [
      track(t, [
        [0, 0],
        [5.4, 0],
        [7, 2.0],
        [10.6, 2.0],
        [12, 0],
      ]),
      -0.1,
      0.8,
    ];
    const across = track(t, [
      [0, wide ? 11 : 8],
      [5.2, wide ? 10.4 : 7.7],
      [7, wide ? 13.4 : 9.6],
      [10.6, wide ? 13 : 9.4],
      [12.2, wide ? 15 : 9.8],
      [LOOP, wide ? 14.4 : 9.6],
    ]);
    const shot = {
      at: t,
      target: offset(subject, AZ, wide ? 1.2 : 0, wide ? 0.25 : -0.3),
      az: AZ,
      el: EL,
      fit: [across, wide ? across * 0.43 : across] as V2,
    };

    const items: Item[] = [
      ground(shot.target, across, 0.05),
      ...carItems(model, {
        at: CAR,
        paint: CHAMPAGNE,
        xray,
        tail: 0.25,
        tailgate: open,
      }),
    ];
    const counted = (index: number) =>
      ramp(1.3 + index * 0.42, 1.75 + index * 0.42, t, settle);
    if (xray > 0.01 || open > 0.01)
      items.push(
        ...cabinItems(model, {
          at: CAR,
          seats,
          seat: (index) => ({
            color: [0.5, 0.5, 0.5],
            glow: AMBER,
            amount: 0.75 * clamp(counted(index)) * xray,
          }),
        }),
      );

    // The boot, a hundred litres at a time, from the opening to the stack.
    const slab = kept("litres", () => block(0.5, 1, DEEP, 0.025));
    const mouth: V3 = onCar(model, CAR, 4.2, 0, 0.78);
    const blocks = litres[0] / 100;
    for (let k = 0; k < blocks; k++) {
      const part = Math.min(1, blocks - k);
      const out = ramp(6.7 + k * 0.27, 7.6 + k * 0.27, t, glide);
      if (out <= 0 || gone >= 1) continue;
      const rest: V3 = [STACKS[0][0], STACKS[0][1], k * DEEP];
      items.push({
        mesh: slab,
        at: compose(
          translate(
            lerp(mouth[0], rest[0], out),
            lerp(mouth[1], rest[1], out),
            lerp(mouth[2], rest[2], out) +
              0.5 * Math.sin(Math.PI * out) -
              2.2 * gone * gone,
          ),
          scale(1, 1, part * lerp(0.6, 1, out)),
        ),
        mat: clay(BLOCK),
      });
    }
    // The alternative's boot stands beside it, in white.
    const beside = ramp(8.9, 9.8, t, glide) * (1 - gone);
    const other = litres[1] / 100;
    for (let k = 0; k < other && beside > 0.01; k++)
      items.push({
        mesh: slab,
        at: compose(
          translate(STACKS[1][0], STACKS[1][1], k * DEEP * beside),
          scale(1, 1, Math.min(1, other - k) * beside),
        ),
        mat: clay(WHITE),
      });

    // Safety: a ring closing round the car.
    const ringed = ramp(11.9, 13.5, t, glide);
    const kept2 = 1 - ramp(LOOP - 0.9, LOOP - 0.5, t);
    if (ringed > 0.01)
      items.push(
        ribbon(
          "ring",
          arc(0, 0, RING, -0.125, -0.125 + ringed),
          0.09,
          AMBER,
          0.95 * kept2,
          0.02,
        ),
      );

    const labels = (plate: Plate) => {
      // Seats: how many, for both.
      const seated = span(1.4, 5.3, t, 0.45);
      const roof: V3 = [0, 0, 1.75];
      const count = (car: typeof base) => {
        const n = figure(car, "seats");
        return n ? `${n} seats` : "Not stated";
      };
      pill(plate, roof, base.name, count(base), {
        tone: "dark",
        alpha: seated,
        dy: -72,
        tie: roof,
      });
      pill(plate, roof, rival.name, count(rival), { alpha: seated, dy: -37 });
      for (let index = 0; index < seats; index++) {
        const lit = clamp(counted(index)) * seated;
        if (lit <= 0.01) continue;
        const [sx, sy] = spot(plate, seatPoint(model, CAR, seats, index));
        plate.ctx.save();
        plate.ctx.globalAlpha = lit;
        plate.ctx.fillStyle = "#22272b";
        plate.ctx.beginPath();
        plate.ctx.arc(sx, sy, 9 * plate.unit, 0, TAU);
        plate.ctx.fill();
        plate.ctx.fillStyle = "#ffffff";
        plate.ctx.font = `600 ${10.5 * plate.unit}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
        plate.ctx.textAlign = "center";
        plate.ctx.textBaseline = "middle";
        plate.ctx.fillText(String(index + 1), sx, sy + 0.5 * plate.unit);
        plate.ctx.restore();
      }

      // Boot: litres, on top of each stack.
      const stacked = span(8.2, 10.6, t, 0.4);
      const volume = (n: number) => (n ? `${n} L` : "Not stated");
      const topA: V3 = [STACKS[0][0], STACKS[0][1], blocks * DEEP];
      const topB: V3 = [STACKS[1][0], STACKS[1][1], other * DEEP];
      pill(plate, topA, base.name, volume(litres[0]), {
        tone: "dark",
        alpha: stacked,
        anchor: plate.wide ? "right" : "centre",
        dx: plate.wide ? -20 : -34,
        dy: plate.wide ? -30 : -70,
        tie: topA,
      });
      pill(plate, topB, rival.name, volume(litres[1]), {
        alpha: stacked * ramp(9.4, 9.9, t),
        anchor: plate.wide ? "left" : "centre",
        dx: plate.wide ? 20 : 10,
        dy: plate.wide ? -30 : -34,
        tie: topB,
      });

      // Safety: the rating as researched, and a star for each star.
      const rated = ramp(13.2, 13.8, t) * kept2;
      const rating = (car: typeof base) =>
        brief(answer(car, "safety_ancap"), 30);
      const over: V3 = [0, 0, 2.55];
      const beside = plate.wide
        ? ({ anchor: "left", dx: 32 } as const)
        : ({ anchor: "centre", dx: 0 } as const);
      pill(plate, over, `${base.name} · ANCAP`, rating(base), {
        tone: "dark",
        alpha: rated,
        ...beside,
        dy: plate.wide ? -18 : -76,
      });
      pill(plate, over, rival.name, rating(rival), {
        alpha: rated,
        ...beside,
        dy: plate.wide ? 17 : -41,
      });
      badge(plate, over, "shield", AMBER, {
        alpha: ramp(12, 12.5, t) * kept2,
        pop: ramp(12, 12.6, t, settle),
        stem: roof,
        radius: 17,
      });
      const text = answer(base, "safety_ancap") ?? "";
      const stars = /star/i.test(text) ? clamp(numberIn(text) ?? 0, 0, 5) : 0;
      for (let k = 0; k < 5; k++) {
        const angle = (-0.125 - 0.116 + k * 0.058) * TAU;
        const lit = ramp(12.3 + k * 0.22, 12.7 + k * 0.22, t, settle) * kept2;
        if (lit <= 0.01) continue;
        const [sx, sy] = spot(plate, [
          Math.cos(angle) * RING,
          Math.sin(angle) * RING,
          0.02,
        ]);
        const { ctx } = plate;
        const r = 12 * plate.unit * lit;
        ctx.save();
        ctx.beginPath();
        for (let p = 0; p < 10; p++) {
          const a = -Math.PI / 2 + (p * Math.PI) / 5,
            d = p % 2 ? r * 0.46 : r;
          ctx.lineTo(sx + Math.cos(a) * d, sy + Math.sin(a) * d);
        }
        ctx.closePath();
        ctx.fillStyle = k < stars ? "#e9ad1f" : "#ffffff";
        ctx.strokeStyle = k < stars ? "#ffffff" : "rgba(34,39,43,0.35)";
        ctx.lineWidth = 1.6 * plate.unit;
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.fill();
        ctx.restore();
      }
    };
    return { shot, items, labels };
  },
});
