/**
 * The scene that opens each chapter, by chapter number: one looping animation
 * in three labelled beats, drawn live on a canvas. See
 * `docs/SCENE_DIRECTION.md` for the art direction.
 */
import { ALT_B } from "./scene-loaders";
import { scenesB } from "./scenes/b";
import { comfortScene } from "./scenes/comfort";
import { convenienceScene } from "./scenes/convenience";
import { driveScene } from "./scenes/drive";
import type { ChapterScene } from "./scenes/kit";
import { priceScene } from "./scenes/price";
import { rangeScene } from "./scenes/range";
import { softwareScene } from "./scenes/software";
import { spaceScene } from "./scenes/space";

export type { ChapterScene, SceneFrame } from "./scenes/kit";

export const chapterScenes: Record<string, ChapterScene> = {
  "01": priceScene,
  "02": driveScene,
  "03": rangeScene,
  "04": spaceScene,
  "05": convenienceScene,
  "06": comfortScene,
  "07": softwareScene,
};

/**
 * The B site's scenes, with the description each is announced by. See
 * `docs/SCENE_DIRECTION_B.md`.
 */
export const chapterScenesB: Record<
  string,
  { scene: ChapterScene; alt: string }
> = Object.fromEntries(
  Object.entries(scenesB).map(([n, scene]) => [n, { scene, alt: ALT_B[n] }]),
);
