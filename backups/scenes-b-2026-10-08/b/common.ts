/**
 * What the B scenes share: the two selected cars as a scene reads them, the
 * car models, and the camera's usual place.
 */
import type { SceneCar, SceneSpec } from "../kit";
import { FASTBACK, SQUAREBACK, carModel } from "./car";
import type { V3 } from "./math";

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
