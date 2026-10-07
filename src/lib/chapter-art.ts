/** Original chapter artwork in public/media/chapters; conceptual, not specification evidence. */
export const chapterArt: Record<
  string,
  {
    file: string;
    alt: string;
    animated?: boolean;
    /** Rendered live on a canvas instead (`SceneCanvas`, from `chapter-scenes.ts`); the files remain as the flat version. */
    scene?: boolean;
    sceneAlt?: string;
  }
> = {
  "02": {
    file: "a-automated-driving-hero",
    animated: true,
    scene: true,
    sceneAlt:
      "Animated night-time city scene: a black Tesla Model Y, its driver's hands on the wheel, drives through a roundabout, stops at a stop sign and turns left, then waits for oncoming traffic before turning right. The view closes in at each decision and the street dims around the road user it is giving way to; lines of light link the car to what it has noticed.",
    alt: "Animated plan-view illustration: a car, linked to a steering wheel held by two hands, gives way at a roundabout, stops at a stop sign, then waits for oncoming traffic before turning right.",
  },
  "01": {
    file: "b-price-ownership",
    scene: true,
    sceneAlt:
      "Animated daytime scene: the view starts on a blank price ticket, then draws back to a black Tesla Model Y turning on a showroom plinth. A year goes round it like a clock hand, each month handing over a coin to a growing stack, then a ring closes round the plinth beneath a shield.",
    alt: "Illustration linking a car to a blank price tag, a calendar and a warranty shield.",
  },
  "03": {
    file: "c-range-charging",
    scene: true,
    sceneAlt:
      "Animated daytime scene: a charging cable crosses to a black Tesla Model Y and plugs in as the view closes in on the port. The car's shell turns transparent while the battery under its floor fills, then the view pulls back until the street is a map, where rings spread from the car and a route is drawn to a destination.",
    alt: "Illustration of a route from a house through a charging stop to a destination, beside a part-charged battery.",
  },
  "04": {
    file: "d-space-safety",
    scene: true,
    sceneAlt:
      "Animated daytime scene: a family and their dog on a driveway beside a black Tesla Model Y. Its shell turns transparent and five seats light in turn; the tailgate lifts and three bags are loaded into the boot; then a line closes round the car beneath a shield.",
    alt: "Top-down illustration of a car cabin with five seats and stacked luggage inside a protective outline.",
  },
  "05": {
    file: "e-daily-convenience",
    scene: true,
    sceneAlt:
      "Animated morning scene: a phone, standing for its owner, leaves a house and travels to a parked black Tesla Model Y, with the view following it. As it comes near, a padlock above the car opens, its mirrors unfold and its lights flash; the view closes in as the driver's door opens, then the car pulls away.",
    alt: "Illustration of a phone showing a key signalling a car as it arrives at a garage.",
  },
  "06": {
    file: "f-comfort-drive",
    scene: true,
    sceneAlt:
      "Animated night-time scene following a black Tesla Model Y along a street. Its shell turns transparent as cool air streams back through the cabin, then its seats glow warm; then the view drops to a front wheel riding over speed humps while a level line beside the cabin stays flat.",
    alt: "Illustration of a ventilated car seat with airflow lines, rising warmth and a gently rolling road.",
  },
  "07": {
    file: "g-software-tech",
    scene: true,
    sceneAlt:
      "Animated scene that passes from night to morning: a parked black Tesla Model Y receives an update from an aerial as a ring fills around it and a line of light scans it from nose to tail. At dawn a phone, standing for its owner, comes out and links to the car, which wakes and opens its tailgate; then a voice waveform rises over its roof and is answered.",
    alt: "Illustration of an abstract car display receiving an update and connected to a phone, media and voice.",
  },
};
