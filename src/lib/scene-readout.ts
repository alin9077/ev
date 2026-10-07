/**
 * What each chapter's scene shows about the cars the viewer has selected:
 * a few figures as text beside the animation, and the ones the animation
 * itself is drawn from. Every value comes from the same researched facts and
 * features as the comparison below it.
 */
import { formatFact } from "./compare";
import { statusLabels } from "./config";
import type { SceneCar, SceneSpec } from "./scenes/kit";
import type { Pack } from "./types";

/** Per chapter: the facts to quote, then features as [criterion, short label]. */
const SHOWN: Record<string, { facts: string[]; features: [string, string][] }> =
  {
    "01": { facts: ["price_aud"], features: [] },
    "02": {
      facts: [],
      features: [
        ["adas_optional", "Advanced assistance"],
        ["adas_standard", "Standard assistance"],
      ],
    },
    "03": { facts: ["range_km", "dc_peak_kw"], features: [] },
    "04": { facts: ["seats", "boot_l"], features: [] },
    "05": {
      facts: [],
      features: [
        ["phone_key", "Phone key"],
        ["walk_away_lock", "Walk-away lock"],
      ],
    },
    "06": {
      facts: ["zero_to_100_s"],
      features: [["front_ventilated_seats", "Ventilated front seats"]],
    },
    "07": {
      facts: [],
      features: [
        ["ota_capability_scope", "Software updates"],
        ["carplay_android_auto", "CarPlay / Android Auto"],
      ],
    },
  };

export type Readout = {
  /** Column headings: the baseline, then the alternative beside it. */
  cars: [string, string];
  rows: { label: string; values: [string, string] }[];
};

export function readoutFor(
  chapter: string,
  baseline: Pack,
  rival: Pack,
): Readout {
  const shown = SHOWN[chapter] ?? { facts: [], features: [] };
  const both = <T>(pick: (pack: Pack) => T): [T, T] => [
    pick(baseline),
    pick(rival),
  ];
  return {
    cars: both((p) => `${p.car.model} ${p.car.trim}`),
    rows: [
      ...shown.facts.map((key) => ({
        label: baseline.car.facts[key]?.label ?? key,
        values: both((p) => {
          const fact = p.car.facts[key];
          if (!fact) return "–";
          const text = formatFact(fact);
          return key === "range_km" && fact.basis
            ? `${text} ${fact.basis}`
            : text;
        }),
      })),
      ...shown.features.map(([key, label]) => ({
        label,
        values: both((p) => {
          const feature = p.features.find((f) => f.criterion === key);
          return feature ? statusLabels[feature.status] : "–";
        }),
      })),
    ],
  };
}

const numberOf = (pack: Pack, key: string) => {
  const value = pack.car.facts[key]?.value;
  return typeof value === "number" ? value : undefined;
};
/** The feature answers the B scenes quote in their labels. */
const QUOTED = [
  "driveaway_price",
  "adas_standard",
  "adas_optional",
  "safety_ancap",
  "phone_key",
  "passive_unlock",
  "walk_away_lock",
  "front_heated_seats",
  "rear_heated_seats",
  "front_ventilated_seats",
  "ota_capability_scope",
  "app_connectivity",
  "carplay_android_auto",
];
const sceneCar = (pack: Pack): SceneCar => ({
  name: pack.car.model,
  facts: Object.fromEntries(
    Object.entries(pack.car.facts).map(([key, fact]) => [
      key,
      typeof fact.value === "number" || typeof fact.value === "string"
        ? fact.value
        : undefined,
    ]),
  ),
  features: Object.fromEntries(
    QUOTED.map((key) => {
      const feature = pack.features.find((f) => f.criterion === key);
      return [
        key,
        feature && {
          status: feature.status,
          value: String(feature.value ?? ""),
        },
      ];
    }),
  ),
});
/** The figures a scene is drawn from. */
export const specFor = (baseline: Pack, rival: Pack): SceneSpec => ({
  cars: [sceneCar(baseline), sceneCar(rival)],
  seats: numberOf(baseline, "seats"),
  rangeKm: numberOf(baseline, "range_km"),
  rivalRangeKm: numberOf(rival, "range_km"),
  priceAud: numberOf(baseline, "price_aud"),
  bootL: numberOf(baseline, "boot_l"),
  dcPeakKw: numberOf(baseline, "dc_peak_kw"),
});
