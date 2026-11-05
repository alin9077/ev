/**
 * Original side-profile drawings, one per model, each drawn to the listed
 * length, height and wheelbase. Points run front to rear as a share of length
 * and ground to roof as a share of height.
 */
type Pt = [number, number];
type Shape = {
  /** Front overhang and tyre diameter, mm. */
  overhang: number;
  tyre: number;
  /** Underside of the body. */
  sill: number;
  /** Leading edge of the bonnet. */
  nose: number;
  /** Base of the windscreen. */
  cowl: Pt;
  /** Top of the windscreen, then the highest point of the roof. */
  roofFrom: number;
  peak: number;
  /** Where the roof ends or starts to fall away. */
  roofTo: Pt;
  /** Tip of a roof spoiler, on upright tailgates. */
  spoiler?: Pt;
  /** Foot of the rear glass. */
  tail: Pt;
  /** End of a separate boot deck, on sedans. */
  deck?: Pt;
  /** Widest point of the rear. */
  rear: number;
  /** Side glass outline and the pillars that divide it. */
  glass: string;
  pillars: Pt[];
  cladding?: "thin" | "thick" | "square";
  rails?: Pt;
  wheel?: "block";
  /** Extra trim, such as a patterned rear pillar. */
  trim?: string;
};
const shapes: Record<string, Shape> = {
  tesla_model_y: {
    overhang: 880,
    tyre: 720,
    sill: 0.115,
    nose: 0.47,
    cowl: [0.27, 0.6],
    roofFrom: 0.44,
    peak: 0.53,
    roofTo: [0.63, 0.985],
    tail: [0.935, 0.745],
    rear: 0.52,
    glass:
      "M.305,.63 L.452,.925 Q.56,.965 .68,.9 Q.79,.83 .868,.7 L.855,.665 Z",
    pillars: [
      [0.53, 0.52],
      [0.7, 0.71],
    ],
  },
  tesla_model_3: {
    overhang: 850,
    tyre: 670,
    sill: 0.11,
    nose: 0.5,
    cowl: [0.28, 0.63],
    roofFrom: 0.46,
    peak: 0.53,
    roofTo: [0.61, 0.98],
    tail: [0.885, 0.765],
    deck: [0.975, 0.735],
    rear: 0.56,
    glass: "M.315,.66 L.472,.93 Q.56,.96 .66,.905 Q.76,.84 .835,.735 L.82,.7 Z",
    pillars: [
      [0.545, 0.535],
      [0.7, 0.715],
    ],
  },
  byd_sealion_7: {
    overhang: 900,
    tyre: 740,
    sill: 0.125,
    nose: 0.53,
    cowl: [0.27, 0.62],
    roofFrom: 0.45,
    peak: 0.54,
    roofTo: [0.66, 0.975],
    tail: [0.95, 0.725],
    rear: 0.55,
    glass:
      "M.3,.645 L.46,.925 Q.58,.96 .7,.9 Q.8,.84 .875,.76 L.8,.705 L.62,.67 Z",
    pillars: [
      [0.54, 0.53],
      [0.7, 0.715],
    ],
    cladding: "thin",
  },
  geely_ex5: {
    overhang: 880,
    tyre: 700,
    sill: 0.125,
    nose: 0.57,
    cowl: [0.26, 0.645],
    roofFrom: 0.42,
    peak: 0.55,
    roofTo: [0.82, 0.965],
    spoiler: [0.905, 0.925],
    tail: [0.955, 0.71],
    rear: 0.56,
    glass: "M.29,.665 L.43,.925 Q.6,.955 .8,.91 L.885,.865 L.86,.775 L.74,.7 Z",
    pillars: [
      [0.52, 0.51],
      [0.7, 0.71],
      [0.795, 0.81],
    ],
    cladding: "thin",
    rails: [0.47, 0.8],
  },
  zeekr_7x: {
    overhang: 870,
    tyre: 740,
    sill: 0.12,
    nose: 0.53,
    cowl: [0.26, 0.615],
    roofFrom: 0.43,
    peak: 0.53,
    roofTo: [0.78, 0.955],
    spoiler: [0.885, 0.905],
    tail: [0.95, 0.7],
    rear: 0.55,
    glass:
      "M.29,.635 L.44,.925 Q.58,.955 .76,.9 L.855,.845 L.825,.72 L.7,.68 Z",
    pillars: [
      [0.53, 0.52],
      [0.705, 0.715],
    ],
    cladding: "thin",
  },
  jaecoo_j5_ev: {
    overhang: 850,
    tyre: 690,
    sill: 0.125,
    nose: 0.61,
    cowl: [0.25, 0.685],
    roofFrom: 0.38,
    peak: 0.46,
    roofTo: [0.88, 0.935],
    spoiler: [0.935, 0.915],
    tail: [0.972, 0.73],
    rear: 0.56,
    glass: "M.28,.705 L.39,.925 Q.6,.95 .87,.88 L.92,.855 L.9,.79 L.7,.755 Z",
    pillars: [
      [0.5, 0.49],
      [0.68, 0.69],
      [0.8, 0.81],
    ],
    cladding: "thick",
  },
  byd_atto_2: {
    overhang: 830,
    tyre: 670,
    sill: 0.125,
    nose: 0.58,
    cowl: [0.25, 0.665],
    roofFrom: 0.4,
    peak: 0.5,
    roofTo: [0.84, 0.965],
    spoiler: [0.915, 0.94],
    tail: [0.958, 0.72],
    rear: 0.56,
    glass:
      "M.28,.685 L.41,.925 Q.6,.955 .84,.915 L.9,.885 L.872,.8 L.72,.705 Z",
    pillars: [
      [0.51, 0.5],
      [0.7, 0.71],
      [0.8, 0.81],
    ],
    cladding: "thick",
    rails: [0.45, 0.82],
  },
  kia_ev5: {
    overhang: 880,
    tyre: 720,
    sill: 0.125,
    nose: 0.62,
    cowl: [0.24, 0.685],
    roofFrom: 0.37,
    peak: 0.5,
    roofTo: [0.9, 0.975],
    spoiler: [0.955, 0.955],
    tail: [0.978, 0.73],
    rear: 0.52,
    glass: "M.27,.7 L.38,.925 Q.62,.95 .9,.92 L.94,.895 L.922,.745 L.7,.705 Z",
    pillars: [
      [0.5, 0.49],
      [0.69, 0.7],
      [0.83, 0.8],
    ],
    cladding: "square",
    rails: [0.43, 0.86],
    wheel: "block",
  },
  kia_ev3: {
    overhang: 810,
    tyre: 690,
    sill: 0.125,
    nose: 0.6,
    cowl: [0.25, 0.675],
    roofFrom: 0.39,
    peak: 0.5,
    roofTo: [0.86, 0.955],
    spoiler: [0.93, 0.93],
    tail: [0.968, 0.73],
    rear: 0.54,
    glass:
      "M.28,.69 L.4,.925 Q.6,.955 .85,.9 L.91,.868 L.888,.79 L.78,.765 L.66,.695 Z",
    pillars: [
      [0.51, 0.5],
      [0.69, 0.7],
      [0.81, 0.78],
    ],
    cladding: "square",
    wheel: "block",
  },
  byd_atto_3_evo: {
    overhang: 870,
    tyre: 690,
    sill: 0.125,
    nose: 0.56,
    cowl: [0.26, 0.645],
    roofFrom: 0.42,
    peak: 0.52,
    roofTo: [0.78, 0.955],
    spoiler: [0.895, 0.91],
    tail: [0.95, 0.7],
    rear: 0.56,
    glass: "M.29,.665 L.43,.925 Q.58,.955 .78,.9 L.855,.855 L.83,.79 L.72,.7 Z",
    pillars: [
      [0.52, 0.51],
      [0.7, 0.71],
    ],
    cladding: "thin",
    rails: [0.46, 0.76],
    trim: "M.868,.84 L.905,.74 M.885,.85 L.922,.75 M.902,.855 L.935,.765",
  },
};
shapes.byd_atto_3_legacy = shapes.byd_atto_3_evo;


/** Shared lookup: discovery must retain dimensions whenever the renderer has a drawing. */
export function carAvatarShape(modelId: string): Shape | undefined {
  return shapes[modelId];
}
export function hasCarAvatarShape(modelId: string): boolean {
  return carAvatarShape(modelId) !== undefined;
}
