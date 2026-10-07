/**
 * The scene that opens each chapter, by chapter number: one looping animation
 * in three labelled beats, drawn live on a canvas. See
 * `docs/SCENE_DIRECTION.md` for the art direction.
 */
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

/** What each B scene is announced as, for anyone who cannot see it. */
const ALT_B: Record<string, string> = {
  "01": "Animated illustration: the two selected cars stand in a row on a white studio floor. A stack of slabs rises under each, one slab for every ten thousand dollars of its listed price, lifting the car; a darker slab is added for on-road costs to give the drive-away price, with the difference between the two cars marked. The stacks then sink and a ten-year rule beside each car fills as far as its warranty lasts. Labels quote each figure.",
  "02": "Animated illustration: a champagne-coloured car drives slowly along a straight street in a white model town. First the lane ahead of it is tinted and it is steered back to the middle, labelled lane centring; then it follows a white car at a steady, marked gap, labelled adaptive cruise; then it stops short of a crossing while someone walks over it, labelled automatic emergency braking. Labels say whether each selected car includes the function as standard.",
  "03": "Animated illustration: a champagne-coloured car is reversed into a charging bay. A cable crosses from the charger and plugs in, with labels giving both selected cars' peak charging power. The car's shell turns to glass while the battery under its floor fills, with each car's 10 to 80 per cent charging time. The view then pulls back until the bay is a dot on a map, where a ring spreads to the car's claimed range and a dashed ring shows the alternative's.",
  "04": "Animated illustration: a champagne-coloured car on a white floor. Its shell turns to glass and its seats light one at a time, numbered, with the seat count of both selected cars. The tailgate lifts and the boot comes out as blocks of a hundred litres, stacked beside a white stack for the alternative, each labelled in litres. Then a ring closes round the car beneath a shield, with a star for each ANCAP star and both cars' ratings.",
  "05": "Animated illustration: a champagne-coloured car parked on a drive in front of a house, with a ring on the ground round it. A person stands at the kerb with a phone badge above them and a dotted line to the car. They walk to the car; as they cross the ring a padlock badge over the roof opens, the mirrors unfold and the lamps come on. They walk away; as they leave the ring the padlock closes, the mirrors fold and the lamps go out. Labels give both selected cars' answers.",
  "06": "Animated illustration: a champagne-coloured car seen through its shell. The seats it heats glow warm, then the seats it ventilates glow cool, each labelled for both selected cars. Then the two selected cars leave a line side by side and accelerate along a marked strip, each reaching 100 kilometres an hour in its own claimed time, so one draws ahead; labels count their speed and then give each time.",
  "07": "Animated illustration: a champagne-coloured car on a round plinth, seen through its shell, with its owner beside it. An update comes down a dotted line into the roof and the parts it can change light up. A dotted line then runs from the owner's phone to the car and the seats warm. Last, the view closes on the dashboard and the centre screen lights. Labels give both selected cars' answers on updates, the phone app and phone mirroring.",
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
