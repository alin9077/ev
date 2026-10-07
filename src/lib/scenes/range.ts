/**
 * Range & charging, by day. Someone plugs the car in and the camera goes right
 * up to the port; the shell turns to glass while the battery under the floor
 * fills; then the camera pulls back until the street is a map, and the range
 * spreads across it in rings with a route drawn through. No figure or brand.
 */
import {
  INK,
  PAPER,
  TAU,
  WHITE,
  along,
  backdrop,
  beatAt,
  box,
  castShadows,
  clamp,
  easeOut,
  easeOutBack,
  hang,
  hex,
  lerp,
  line,
  makeView,
  mix,
  mod,
  noise,
  onGround,
  paint,
  partial,
  pulse,
  ramp,
  rgba,
  ring,
  shadowsOf,
  shoot,
  type ChapterScene,
  type Ctx,
  type P3,
  type Pt,
  type SceneSpec,
  type Thing,
} from "./kit";
import { carPart, carShadow, drawCar, type Car } from "./model-y";
import { block, slab, tree } from "./props";

const LOOP = 12;
const STARTS = [0, 3.4, 6.9];
const LIME = hex("#bddb6a");

/** Parked nose-in, so the charge port at its left rear faces us. */
const PARKED = { x: 0, y: 0, heading: 270 };
const PORT = carPart(PARKED, "port");
/** The charger stands behind the car, clear of the port from where we look. */
const CHARGER: Pt = [64, -8];
const HOLSTER: P3 = [59.5, -4, 23],
  HEAD: P3 = [64, -4, 39];
/** The way out across the map, and the pins along it. */
const ROUTE: P3[] = [
  [128, 0, 0],
  [128, -620, 0],
  [900, -620, 0],
  [900, -1500, 0],
  [1900, -1500, 0],
  [1900, -2080, 0],
  [2620, -2080, 0],
];
const DESTINATION: Pt = [2620, -2080],
  STOP: Pt = [900, -1500];
const ROADS_X = [128, 900, 1900, 2620, -700, 3300],
  ROADS_Y = [-620, -1500, -2080, 240, 900, -2800];

function draw(
  ctx: Ctx,
  width: number,
  height: number,
  time: number,
  unit: number,
  spec?: SceneSpec,
) {
  const t = mod(time, LOOP);
  const wide = width / height > 1.3;
  const cam = shoot(t, [
    { at: 0, x: 24, y: 10, z: 12, zoom: 1.7 },
    { at: 1.7, x: PORT[0] + 3, y: PORT[1] + 3, z: PORT[2], zoom: 3.5 },
    { at: 2.7, x: PORT[0] + 3, y: PORT[1] + 3, z: PORT[2], zoom: 3.5 },
    { at: 4.1, x: 2, y: 4, z: 10, zoom: wide ? 2.5 : 2.1 },
    // Creeping in while the battery fills, and still easing out over the map.
    { at: 6.7, x: 2, y: 4, z: 10, zoom: wide ? 2.64 : 2.2 },
    { at: 9, x: 1310, y: -1040, z: 0, zoom: wide ? 0.089 : 0.119 },
    { at: 10.5, x: 1310, y: -1040, z: 0, zoom: wide ? 0.086 : 0.115 },
    { at: LOOP, x: 24, y: 10, z: 12, zoom: 1.7 },
  ]);
  const view = makeView(width, height, unit, cam, { day: 1, accent: LIME });
  const { k, pal } = view;
  /** 0 at street level, 1 once the street has become a map. */
  const map = 1 - ramp(0.16, 0.7, cam.zoom);

  // Plugging in: the plug leaves its holster and crosses to the port.
  const reset = 1 - ramp(10.6, 11.4, t);
  const carry = ramp(0.25, 1.75, t) * reset;
  const seated = ramp(1.5, 1.8, t, easeOutBack) * reset;
  const plug: P3 =
    seated > 0.02
      ? [
          lerp(PORT[0] + 1.5, PORT[0], seated),
          lerp(PORT[1] + 6, PORT[1] + 0.9, seated),
          lerp(PORT[2] + 1.5, PORT[2], seated),
        ]
      : [
          lerp(HOLSTER[0], PORT[0] + 1.5, carry),
          lerp(HOLSTER[1], PORT[1] + 6, carry),
          lerp(HOLSTER[2], PORT[2] + 1.5, carry) +
            5 * Math.sin(Math.PI * carry),
        ];
  // A higher peak charging power fills the battery sooner.
  const filled = 3.7 + 2.8 * clamp(175 / (spec?.dcPeakKw ?? 175), 0.5, 1.2);
  const charge = lerp(0.14, 1, ramp(3.7, filled, t)) * reset;
  const car: Car = {
    ...PARKED,
    lights: 0.25,
    port: clamp(ramp(0.5, 1.2, t) * reset),
    xray: pulse(3.5, 7.2, t, 0.8) * 0.9,
    battery: 1,
    charge,
    seatsShown: 0.22,
  };

  backdrop(ctx, view);
  const things: Thing[] = [];
  if (map < 0.98) {
    things.push(
      block(ctx, view, {
        x: -150,
        y: -128,
        w: 132,
        d: 62,
        h: 50,
        floors: 1,
        panel: LIME,
      }),
      block(ctx, view, {
        x: -150,
        y: -128,
        w: 46,
        d: 62,
        from: 50,
        h: 92,
        floors: 1,
      }),
      slab(ctx, view, box(-12, -124, 78, 54), 40, 44),
      slab(ctx, view, box(-10, -122, 3, 3), 0, 40),
      slab(ctx, view, box(61, -74, 3, 3), 0, 40),
      slab(
        ctx,
        view,
        box(CHARGER[0] - 9, CHARGER[1] - 9, 18, 18),
        0,
        2.2,
        mix(pal.kerb, WHITE, 0.4),
      ),
      slab(ctx, view, box(CHARGER[0] - 4.5, CHARGER[1] - 4, 9, 8), 2.2, 40),
      tree(ctx, view, { x: -86, y: 58 }),
      tree(ctx, view, { x: -128, y: 12, r: 13, h: 28 }),
      tree(ctx, view, { x: -40, y: 96, cone: true, r: 15 }),
      tree(ctx, view, { x: 44, y: -168, r: 15 }),
      {
        depth: car.x + car.y,
        shadow: [carShadow(view, car)],
        draw: () => drawCar(ctx, view, car),
      },
    );
    onGround(ctx, view, () => {
      // The street, the forecourt and its bays.
      ctx.fillStyle = rgba(pal.road);
      ctx.fillRect(84, -3000, 88, 6000);
      ctx.strokeStyle = rgba(pal.mark);
      ctx.lineWidth = 2.2;
      ctx.setLineDash([15, 17]);
      ctx.beginPath();
      ctx.moveTo(128, -3000);
      ctx.lineTo(128, 3000);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = rgba(pal.paving);
      ctx.fillRect(-64, -44, 148, 122);
      // While we look inside the car the bay fades back, so the charge is
      // the only green in the frame.
      ctx.fillStyle = rgba(mix(pal.field, pal.paving, 0.95 * (car.xray ?? 0)));
      ctx.fillRect(-56, -24, 140, 48);
      ctx.strokeStyle = rgba(pal.mark);
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (const y of [-24, 24, 72]) {
        ctx.moveTo(-56, y);
        ctx.lineTo(84, y);
      }
      ctx.stroke();
      castShadows(ctx, view, shadowsOf(things));
    });
    // Charger livery: one stripe of the chapter colour, and a lamp that follows the charge.
    things.push({
      depth: CHARGER[0] + CHARGER[1] + 8.2,
      draw: () => {
        line(
          ctx,
          view,
          [
            [CHARGER[0] - 4.5, CHARGER[1] + 4, 10],
            [CHARGER[0] - 4.5, CHARGER[1] + 4, 35],
          ],
          rgba(LIME),
          1.5,
        );
        const [lx, ly] = view.at(CHARGER[0], CHARGER[1] + 4, 36);
        ctx.fillStyle = rgba(mix(pal.kerb, LIME, 0.35 + 0.65 * seated));
        ctx.beginPath();
        ctx.arc(lx, ly, 1.3 * k, 0, TAU);
        ctx.fill();
      },
    });
    paint(things);

    // The cable hangs from the charger to wherever the plug is.
    const cable = hang(HEAD, plug, lerp(13, 7, carry));
    line(ctx, view, cable, rgba(INK), 1.05);
    const [px, py] = view.at(...plug);
    ctx.fillStyle = rgba(INK);
    ctx.beginPath();
    ctx.arc(px, py, 1.25 * k, 0, TAU);
    ctx.fill();
    ctx.fillStyle = rgba(mix(INK, LIME, seated));
    ctx.beginPath();
    ctx.arc(px, py, 0.6 * k, 0, TAU);
    ctx.fill();
    // Charge runs down the cable while it is connected.
    const flowing = seated * ramp(3.2, 3.8, t) * (1 - ramp(6.6, 7.2, t));
    if (flowing > 0.02)
      for (let i = 0; i < 4; i++) {
        const [fx, fy] = view.at(...along(cable, mod(t * 0.9 + i / 4, 1)));
        ctx.fillStyle = rgba(LIME, flowing);
        ctx.beginPath();
        ctx.arc(fx, fy, 0.75 * k, 0, TAU);
        ctx.fill();
      }
    // The click as it goes home.
    const click = clamp((t - 1.62) / 0.7);
    if (click > 0 && click < 1) {
      ctx.strokeStyle = rgba(INK, (1 - click) * 0.8);
      ctx.lineWidth = Math.max(unit, (1 - click) * 0.7 * k);
      ctx.beginPath();
      ctx.arc(px, py, (2 + easeOut(click) * 7) * k, 0, TAU);
      ctx.stroke();
    }
  }

  if (map > 0.01) {
    // The street becomes a map: paper, a grid of roads, blocks between them.
    ctx.fillStyle = rgba(PAPER, map);
    ctx.fillRect(0, 0, width, height);
    // The rings are drawn to the selected car's claimed range: 600 km fills
    // the map, and the alternative beside it gets a dashed ring of its own.
    const scaled = (km?: number) => clamp((km ?? 600) / 600, 0.45, 1.3);
    const reach = ramp(8.3, 10.2, t, easeOut) * scaled(spec?.rangeKm);
    const rival = spec?.rivalRangeKm
      ? ramp(8.3, 10.2, t, easeOut) * scaled(spec.rivalRangeKm)
      : 0;
    const fade = map * (1 - ramp(10.9, 11.5, t));
    onGround(ctx, view, () => {
      ctx.globalAlpha = fade;
      // How far a charge reaches: rings spreading from the car.
      ctx.fillStyle = rgba(LIME, 0.3);
      ctx.beginPath();
      ctx.arc(0, 0, 3460 * reach + 1, 0, TAU);
      ctx.fill();
      for (let i = 0; i < 40; i++) {
        const cx = (Math.floor(noise(i + 1) * 9) - 2) * 620 + 190,
          cy = (Math.floor(noise(i + 31) * 8) - 6) * 520 + 100;
        ctx.fillStyle = rgba(mix(pal.paving, INK, 0.06));
        ctx.fillRect(
          cx,
          cy,
          150 + noise(i + 61) * 260,
          130 + noise(i + 91) * 220,
        );
      }
      ctx.strokeStyle = rgba(WHITE);
      ctx.lineWidth = 46;
      ctx.beginPath();
      for (const x of ROADS_X) {
        ctx.moveTo(x, -4200);
        ctx.lineTo(x, 2600);
      }
      for (const y of ROADS_Y) {
        ctx.moveTo(-2400, y);
        ctx.lineTo(5200, y);
      }
      ctx.stroke();
      for (let i = 1; i <= 4; i++)
        ring(
          ctx,
          [0, 0],
          (3460 * reach * i) / 4,
          rgba(mix(LIME, INK, 0.3), i === 4 ? 0.9 : 0.5),
          i === 4 ? 22 : 9,
        );
      if (rival > 0) {
        ctx.setLineDash([70, 60]);
        ring(ctx, [0, 0], 3460 * rival, rgba(INK, 0.75), 16);
        ctx.setLineDash([]);
      }
      ctx.globalAlpha = 1;
    });
    // The route, drawing itself out to where you are going.
    const drawn = ramp(8.6, 10.3, t);
    line(
      ctx,
      view,
      partial(ROUTE, drawn, 60),
      rgba(INK, fade),
      4.5 / Math.max(k, 0.05),
    );
    const pin = ([x, y]: Pt, size: number, colour: string, show: number) => {
      if (show <= 0.01) return;
      const [sx, sy] = view.at(x, y, 0);
      const r = size * unit * easeOutBack(clamp(show));
      ctx.fillStyle = rgba(INK, fade);
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 0.48, 0, TAU);
      ctx.fill();
    };
    pin([0, 0], 9, rgba(LIME, fade), map);
    pin(STOP, 6, rgba(PAPER, fade), ramp(9.1, 9.4, t));
    pin(DESTINATION, 10, rgba(PAPER, fade), ramp(10.0, 10.3, t));
  }
  return { ...beatAt(t, STARTS, LOOP), tone: "day" as const };
}

export const rangeScene: ChapterScene = {
  beats: ["Plug in", "Charge", "Range"],
  tone: "day",
  loop: LOOP,
  still: 5.6,
  draw,
};
