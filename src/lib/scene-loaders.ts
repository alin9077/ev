import type { ChapterScene } from "./scenes/kit";

/** What each B scene is announced as, for anyone who cannot see it. */
export const ALT_B: Record<string, string> = {
  "01": "Animated illustration: the two selected cars stand side by side on a white forecourt. A line of tiles runs out from each, one tile for every ten thousand dollars of its published price. Basis and checked date are stated in the text below; tile lengths with different or unconfirmed bases are not like-for-like. The tiles go, and two batteries take the same fifty kilowatt-hours, one from a home charger off-peak and one from a public fast charger, while a short and a tall stack of coins show what each costs. Then two bands run out from each car along a ruler of years, for its vehicle warranty and its battery warranty. Labels quote each figure.",
  "02": "Animated illustration: a black car makes one unbroken run down a street in a white model town while the view travels with it, a driver supervising throughout. It leaves a lay-by and holds its distance behind the car ahead, gives way to a car on a roundabout and then goes through it, then pulls up just past the next lay-by and reverses into it, parallel to the kerb. Pale blue fans on the road show what its cameras cover, and a ring and corner marks appear on each person, vehicle and obstacle it picks out. Labels say, for both selected cars, what is standard equipment and what is a paid option.",
  "03": "Animated illustration: day breaks over a black car that has charged overnight on the drive of a house, with both selected cars' home charging times. The view pulls back until the street is a dot on a sketch map, where a planned route runs from home to a destination through three fast-charging stops, with labels on route planning and on access to the Supercharger network for both cars. The view then comes down on one stop, a row of chargers beside a café, where the car plugs in and its battery fills, with each car's 10 to 80 per cent charging time, before it pulls away.",
  "04": "Animated illustration: a black car on the drive of a house. Its bonnet lifts on a front trunk and a soft bag goes in, with the front trunk volume of both selected cars. The view comes round to the tail, the tailgate rises and two cases waiting on the drive are loaded, with both cars' boot volumes. The rear of the boot floor then lifts on a well beneath it, which takes another bag, and the shell turns to glass to show all three spaces at once, with each maker's stated volumes.",
  "05": "Animated illustration: a black car parked on a drive, with a ring on the ground round it. A person walks up the drive with a shopping bag in each hand; as they cross the ring a padlock badge over the roof opens, the mirrors unfold and the lamps come on. The tailgate lifts and the bags go into the boot. At the driver's door the shell turns to glass and the driver's seat lights as their settings return. They walk to the house; as they leave the ring the padlock closes, the mirrors fold and the lamps go out. Labels give both selected cars' answers at each step.",
  "06": "Animated illustration: a black car parked in a lay-by on a street, seen through its shell. Cars pass, and the noise of each spreads across the road as rings that thin to almost nothing where they meet the car's glass. Then a person standing by the houses sets the climate from a phone, a dotted line runs to the car, and the seats go from a warm glow to a cool one. The person walks over and gets in, and the car pulls smoothly out into the street. Labels give both selected cars' answers on remote climate, seat heating and ventilation, and 0 to 100 kilometres an hour.",
  "07": "Animated illustration: a black car on the drive of a house, with a two-year ruler laid along the front of the drive. A pin rises on the ruler for every documented Australian software release, one row for each selected car, with the least number documented for each. Three of the first car's pins then light in turn and a label says what that release brought. Night falls, a dotted line brings an update down to the parked car, a bar fills, and the centre screen lights as day returns. Labels give both selected cars' answers on what updates can change.",
};

export type SceneLoader = () => Promise<ChapterScene>;

/** Explicit imports let the hosted site fetch only the approaching chapter. */
export const sceneLoaders: Record<string, SceneLoader> = {
  "01": () => import("./scenes/price").then((m) => m.priceScene),
  "02": () => import("./scenes/drive").then((m) => m.driveScene),
  "03": () => import("./scenes/range").then((m) => m.rangeScene),
  "04": () => import("./scenes/space").then((m) => m.spaceScene),
  "05": () => import("./scenes/convenience").then((m) => m.convenienceScene),
  "06": () => import("./scenes/comfort").then((m) => m.comfortScene),
  "07": () => import("./scenes/software").then((m) => m.softwareScene),
};

export const sceneLoadersB: Record<string, SceneLoader> = {
  "01": () => import("./scenes/b/price").then((m) => m.priceSceneB),
  "02": () => import("./scenes/b/drive").then((m) => m.driveSceneB),
  "03": () => import("./scenes/b/range").then((m) => m.rangeSceneB),
  "04": () => import("./scenes/b/space").then((m) => m.spaceSceneB),
  "05": () => import("./scenes/b/convenience").then((m) => m.convenienceSceneB),
  "06": () => import("./scenes/b/comfort").then((m) => m.comfortSceneB),
  "07": () => import("./scenes/b/software").then((m) => m.softwareSceneB),
};
