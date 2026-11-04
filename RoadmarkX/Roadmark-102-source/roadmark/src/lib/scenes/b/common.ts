/**
 * What the B scenes share: the two selected cars as a scene reads them, the
 * car models, and the camera's usual place.
 */
import type { SceneCar, SceneSpec } from "../kit";
import { FASTBACK, SQUAREBACK, carModel } from "./car";
import { lerp, turn, type V2, type V3 } from "./math";

/** The fastback the page is about, and its meshes. */
export const hero = () => carModel(FASTBACK);
/**
 * A plainer, squarer SUV in white clay: it stands in for whichever
 * alternative is selected, and is not a drawing of any one of them.
 */
export const stand = () => carModel(SQUAREBACK);

const NOBODY: SceneCar = { name: "", facts: {}, features: {} };
/** The baseline and the alternative; empty until the page has a selection. */
export const pair = (spec?: SceneSpec): [SceneCar, SceneCar] =>
  spec?.cars ?? [
    { ...NOBODY, name: "This car" },
    { ...NOBODY, name: "Alternative" },
  ];
/** A figure for a car, if it has one that is a number. */
export const figure = (car: SceneCar, key: string) => {
  const value = car.facts[key];
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
};
/** A car's researched answer on a feature. */
export const answer = (car: SceneCar, key: string) =>
  car.features[key]?.value || undefined;
/** Whether a car has a feature: yes, no, or not known. */
export function has(car: SceneCar, key: string): boolean | undefined {
  const status = car.features[key]?.status;
  if (!status) return undefined;
  if (status === "unavailable" || status === "not_applicable") return false;
  return status === "standard" ||
    status === "optional" ||
    status === "conditional"
    ? true
    : undefined;
}
/** The first number in a piece of text: "A$63,963 in Sydney" gives 63963. */
export function numberIn(text: string | number | undefined) {
  if (typeof text === "number") return text;
  const found = text?.match(/\d[\d,]*(?:\.\d+)?/);
  return found ? Number(found[0].replace(/,/g, "")) : undefined;
}

/** Status dots on labels. */
export const YES = "#35c46a",
  NO = false as const;
/** The dot for a car's answer: green, hollow, or none where it is not known. */
export const dotFor = (state: boolean | undefined) =>
  state === undefined ? undefined : state ? YES : NO;

/** The camera's usual corner: south-east of the subject, looking down. */
export const VIEW = { az: -45, el: 31 };
/**
 * Moves a camera target so that `subject` sits `right` metres right of the
 * plate's centre, and `down` metres below it, for a camera at `az`.
 */
export function offset(subject: V3, az: number, right: number, down = 0): V3 {
  const a = (az * Math.PI) / 180;
  // Screen-right on the ground, and the ground direction that reads as "up".
  const rx = -Math.sin(a),
    ry = Math.cos(a);
  const ux = -Math.cos(a),
    uy = -Math.sin(a);
  return [
    subject[0] - rx * right + ux * down,
    subject[1] - ry * right + uy * down,
    subject[2],
  ];
}

/** Up and over from one place to another: f 0–1. */
export const hop = (from: V3, to: V3, f: number, height = 0.7): V3 => [
  lerp(from[0], to[0], f),
  lerp(from[1], to[1], f),
  lerp(from[2], to[2], f) + height * Math.sin(Math.PI * f),
];
/**
 * A walk along straight legs between points: where someone is after a given
 * distance, which way they face (turning over the last half metre of a leg),
 * and how long the whole walk is.
 */
export function walk(points: V2[]) {
  const legs = points.slice(1).map((p, i) => {
    const a = points[i];
    return {
      a,
      long: Math.hypot(p[0] - a[0], p[1] - a[1]),
      turn: Math.atan2(p[1] - a[1], p[0] - a[0]),
    };
  });
  const total = legs.reduce((sum, leg) => sum + leg.long, 0);
  return {
    total,
    at(distance: number) {
      let d = Math.min(Math.max(distance, 0), total);
      let i = 0;
      while (i < legs.length - 1 && d > legs[i].long) d -= legs[i++].long;
      const leg = legs[i];
      let heading = leg.turn;
      const next = legs[i + 1];
      if (next && leg.long - d < 0.5) {
        let swing = next.turn - leg.turn;
        while (swing > Math.PI) swing -= 2 * Math.PI;
        while (swing < -Math.PI) swing += 2 * Math.PI;
        heading += swing * (1 - (leg.long - d) / 0.5) * 0.5;
      } else if (i > 0 && d < 0.5) {
        let swing = leg.turn - legs[i - 1].turn;
        while (swing > Math.PI) swing -= 2 * Math.PI;
        while (swing < -Math.PI) swing += 2 * Math.PI;
        heading -= swing * (1 - d / 0.5) * 0.5;
      }
      return {
        x: leg.a[0] + Math.cos(leg.turn) * d,
        y: leg.a[1] + Math.sin(leg.turn) * d,
        heading,
        // The stride builds over the first steps and settles over the last.
        moving: Math.min(
          1,
          Math.max(0, Math.min(distance, total - distance) / 0.45),
        ),
      };
    },
  };
}

/**
 * How far someone has walked after `seconds` at a steady `pace`, picking the
 * pace up over the first moments and losing it over the last, so that they
 * neither set off nor stop dead.
 */
export function paced(
  seconds: number,
  pace: number,
  total: number,
  soft = 0.45,
) {
  const whole = total / pace + soft;
  if (seconds <= 0) return 0;
  if (seconds >= whole) return total;
  if (seconds < soft) return (pace * seconds * seconds) / (2 * soft);
  if (seconds > whole - soft)
    return total - (pace * (whole - seconds) ** 2) / (2 * soft);
  return pace * (seconds - soft / 2);
}
/**
 * Which way a walker faces: along the walk while walking, turning from the
 * way they stood before it and to the way they stand after.
 */
export const faced = (
  who: { heading: number; moving: number },
  gone: number,
  total: number,
  before: number,
  after: number,
) => turn(gone < total / 2 ? before : after, who.heading, who.moving);
