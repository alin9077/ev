import { carItems, placed } from "./car";
import { stand } from "./common";
import { type Item } from "./gl";
import { DEG, compose, rotateZ, translate } from "./math";
import {
  ASPHALT,
  STONE,
  WHITE,
  box,
  clay,
  hedge,
  house,
  mass,
  person,
  road,
  tree,
} from "./world";

/**
 * A house on a quiet street, with a car's width of drive in front of it. The
 * car stands at the origin, nose to +x; the house is behind it (+y) and the
 * street in front (−y). Built once, and shared by the scenes set at home.
 */
let town: Item[] | undefined;
export function homeLot(): Item[] {
  if (town) return town;
  const items: Item[] = [
    // The drive and the path to the door, between two raised beds of lawn.
    box([10.4, 4.8, 0.02], [0, 0, 0], clay(ASPHALT), 0.004, false),
    box([4.8, 4.4, 0.02], [0.4, -4.6, 0], clay(ASPHALT), 0.004, false),
    box([5.2, 3.6, 0.07], [-5.6, -4.6, 0], clay(WHITE), 0.03),
    box([6.4, 3.6, 0.07], [6.4, -4.6, 0], clay(WHITE), 0.03),
    box([1.3, 1.6, 0.03], [3.6, 3.2, 0], clay(STONE), 0.01, false),
    // The house behind, with planters under its windows, and its neighbours.
    ...house([-1, 8.2, 0], 15, 7.5, true),
    ...house([17.5, 7.4, 0], 10, 7.5, false),
    ...house([-19.5, 7.8, 0], 10, 7.5, true),
    hedge([-4.6, 3.75, 0], 5.6, 0.7, 0.55),
    hedge([6.6, 3.75, 0], 3.2, 0.7, 0.55),
    box([0.5, 0.5, 0.6], [2.5, 3.6, 0], clay(), 0.06),
    box([0.5, 0.5, 0.6], [4.7, 3.6, 0], clay(), 0.06),
    ...mass([4, 31, 0], [15, 11, 9]),
    ...mass([-24, 30, 0], [12, 10, 7]),
    ...mass([27, 28, 0], [12, 10, 6]),
    // A low wall along the footpath, a letterbox, two bins, and the street.
    box([5.4, 0.3, 0.55], [-5.6, -6.75, 0], clay(), 0.05),
    box([6.6, 0.3, 0.55], [6.5, -6.75, 0], clay(), 0.05),
    box([0.34, 0.3, 1.05], [-2.55, -6.75, 0], clay(), 0.05),
    box([0.58, 0.66, 1.02], [-6.6, 2.7, 0], clay(STONE), 0.07),
    box([0.58, 0.66, 1.02], [-7.35, 2.7, 0], clay(), 0.07),
    ...road([0, -12.1, 0], 90, 7),
    hedge([-7.3, -3.5, 0], 1.5, 1.1, 0.75),
    hedge([8.6, -3.5, 0], 1.7, 1.2, 0.8),
    // A neighbour's car at the kerb, and one on the next drive.
    ...carItems(stand(), {
      at: placed(-13, -10.3, 0),
      paint: WHITE,
      clay: true,
    }),
    ...carItems(stand(), {
      at: placed(17, 1.2, Math.PI),
      paint: WHITE,
      clay: true,
    }),
  ];
  (
    [
      [-12.4, 4.6, 4.2],
      [9.2, 2.6, 4.4],
      [11.2, 3.2, 4.6],
      [-12.6, -5.2, 4.8],
      [13.4, -5.6, 4.4],
      [22, 2, 5],
      [-25, 2, 4.8],
      [5, -17.4, 4.6],
      [-9, -17.8, 5],
      [21, -17.2, 4.4],
      [-23, -17, 4.6],
    ] as const
  ).forEach(([x, y, h], i) => items.push(...tree([x, y, 0], h, i + 2)));
  for (const [x, y, facing] of [
    [9.5, -8.6, 200],
    [10.2, -8.9, 20],
    [-12, -8.4, 0],
    [-8.2, 1.9, -30],
  ] as const)
    items.push(
      ...person(compose(translate(x, y, 0.13), rotateZ(facing * DEG))),
    );
  return (town = items);
}
