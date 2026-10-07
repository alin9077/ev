/**
 * What every B scene stands on: a camera that frames a patch of ground from
 * above, the studio's light, and the loop that turns a scene's description of
 * a moment into a picture with labels over it. See `docs/SCENE_DIRECTION_B.md`.
 */
import type { ChapterScene, SceneFrame, SceneSpec } from "../kit";
import { flat } from "./flat";
import { render, type Frame, type Item, type Lighting } from "./gl";
import {
  DEG,
  clamp,
  colour,
  compose,
  css,
  glide,
  lerp,
  lookAt,
  mod,
  perspective,
  ramp,
  transform,
  unit,
  type Ease,
  type M4,
  type V2,
  type V3,
} from "./math";

/** Where the camera is at a moment: what it looks at, from where, how wide. */
export type Shot = {
  at: number;
  target: V3;
  /** Compass angle the camera stands at, and how high it looks down from. */
  az: number;
  el: number;
  /** Metres that must fit in the plate: across, then down. */
  fit: V2;
  /** The lens, in degrees: narrow by default, so the model reads as a plan. */
  fov?: number;
};
export type Camera = {
  viewProj: M4;
  eye: V3;
  target: V3;
  /** Device pixels for one metre at the target. */
  scale: number;
  /** How far from the target anything in view can be, in metres. */
  reach: number;
  /** A point in the world to device pixels, with its depth 0–1. */
  project: (p: V3) => V3;
};

const FOV = 13 * DEG;
/** The camera at `t` along a list of shots; it eases between each pair. */
export function shoot(t: number, shots: Shot[], e: Ease = glide): Shot {
  let i = 1;
  while (i < shots.length - 1 && t > shots[i].at) i += 1;
  const a = shots[i - 1],
    b = shots[Math.min(i, shots.length - 1)];
  const f = e(clamp((t - a.at) / (b.at - a.at || 1)));
  // Width changes by ratio, so a long pull-back keeps an even pace.
  const wide = (k: 0 | 1) =>
    Math.exp(lerp(Math.log(a.fit[k]), Math.log(b.fit[k]), f));
  const zoomed = Math.abs(a.fit[0] - b.fit[0]) > 1e-6;
  // The target moves in step with the width, so the thing being left stays
  // in frame while it shrinks.
  const g = zoomed ? (wide(0) - a.fit[0]) / (b.fit[0] - a.fit[0]) : f;
  return {
    at: t,
    target: [
      lerp(a.target[0], b.target[0], g),
      lerp(a.target[1], b.target[1], g),
      lerp(a.target[2], b.target[2], g),
    ],
    az: lerp(a.az, b.az, f),
    el: lerp(a.el, b.el, f),
    fit: [wide(0), wide(1)],
  };
}
export function camera(shot: Shot, width: number, height: number): Camera {
  const aspect = width / height;
  const tall = Math.max(shot.fit[1], shot.fit[0] / aspect);
  const fov = shot.fov ? shot.fov * DEG : FOV;
  const distance = tall / (2 * Math.tan(fov / 2));
  const az = shot.az * DEG,
    el = shot.el * DEG;
  const eye: V3 = [
    shot.target[0] + distance * Math.cos(el) * Math.cos(az),
    shot.target[1] + distance * Math.cos(el) * Math.sin(az),
    shot.target[2] + distance * Math.sin(el),
  ];
  const depth = Math.max(80, tall * 4);
  const viewProj = compose(
    perspective(fov, aspect, Math.max(1, distance - depth), distance + depth),
    lookAt(eye, shot.target),
  );
  return {
    viewProj,
    eye,
    target: shot.target,
    scale: height / tall,
    reach: 0.62 * Math.hypot(tall * aspect, tall / Math.sin(el)) + 3,
    project: (p) => {
      const c = transform(viewProj, p);
      return [(c[0] * 0.5 + 0.5) * width, (0.5 - c[1] * 0.5) * height, c[2]];
    },
  };
}

/** The floor of every scene, and the plate colour the page shows round it. */
export const FLOOR = colour("#d9d8d5");
export const DAYLIGHT: Lighting = {
  sun: unit([-0.75, -0.66, 1.25]),
  sunColour: [0.6, 0.57, 0.53],
  sky: [0.74, 0.75, 0.78],
  bounce: [0.58, 0.57, 0.56],
  ground: FLOOR,
  soft: 0.26,
  shade: [1.15, 1.05],
  grain: 0.012,
};

/** What a scene hands back for one moment. */
export type Moment = {
  shot: Shot;
  items: Item[];
  light?: Lighting;
  /** Draws the labels, once the picture is down. */
  labels?: (view: Plate) => void;
};
/** The plate a scene is drawn on, as its labels see it. */
export type Plate = {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  /** Device pixels per CSS pixel. */
  unit: number;
  /** Wider than it is tall: a desktop plate, not a phone's square one. */
  wide: boolean;
  cam: Camera;
};
export type Brief = {
  t: number;
  spec?: SceneSpec;
  wide: boolean;
  aspect: number;
};
export type SceneDef = {
  beats: [string, string, string];
  /** When each beat starts, in seconds; the loop ends after the last. */
  starts: [number, number, number];
  loop: number;
  still: number;
  moment: (brief: Brief) => Moment;
};

/** Seconds the plate takes to clear and return where a loop joins. */
const SEAM = 0.55;
export function scene(def: SceneDef): ChapterScene {
  return {
    beats: def.beats,
    loop: def.loop,
    still: def.still,
    tone: "day",
    draw(ctx, width, height, time, unit, spec): SceneFrame {
      const t = mod(time, def.loop);
      const aspect = width / height;
      const wide = aspect > 1.25;
      const moment = def.moment({ t, spec, wide, aspect });
      const cam = camera(moment.shot, width, height);
      const light = moment.light ?? DAYLIGHT;
      const frame: Frame = {
        width,
        height,
        viewProj: cam.viewProj,
        eye: cam.eye,
        focus: [cam.target[0], cam.target[1], 0],
        reach: cam.reach,
        light,
        items: moment.items,
      };
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      const picture = render(frame);
      if (picture)
        ctx.drawImage(picture, 0, 0, width, height, 0, 0, width, height);
      else flat(ctx, frame, cam);
      moment.labels?.({ ctx, width, height, unit, wide, cam });
      // Where the loop joins, the plate clears to the floor and comes back.
      const wash = Math.max(
        1 - ramp(0, SEAM, t),
        ramp(def.loop - SEAM, def.loop, t),
      );
      if (wash > 0.003) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = 1;
        ctx.fillStyle = css(light.ground, wash);
        ctx.fillRect(0, 0, width, height);
      }
      let beat = 0;
      while (beat < 2 && t >= def.starts[beat + 1]) beat += 1;
      const end = beat < 2 ? def.starts[beat + 1] : def.loop;
      return {
        beat,
        progress: clamp((t - def.starts[beat]) / (end - def.starts[beat])),
        tone: "day",
      };
    },
  };
}
