/** The B site's scenes, by chapter number. */
import type { ChapterScene } from "../kit";
import { comfortSceneB } from "./comfort";
import { convenienceSceneB } from "./convenience";
import { driveSceneB } from "./drive";
import { priceSceneB } from "./price";
import { rangeSceneB } from "./range";
import { softwareSceneB } from "./software";
import { spaceSceneB } from "./space";

export const scenesB: Record<string, ChapterScene> = {
  "01": priceSceneB,
  "02": driveSceneB,
  "03": rangeSceneB,
  "04": spaceSceneB,
  "05": convenienceSceneB,
  "06": comfortSceneB,
  "07": softwareSceneB,
};
