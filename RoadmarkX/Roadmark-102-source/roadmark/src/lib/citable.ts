import { factReaderLabel } from "./fact-presentation";
import { sourcePresentation } from "./source-presentation";
import { issueReaderText } from "./issue-presentation";
import { factConditions } from "./corrections";
import { availabilityReportClaim } from "./availability-corrections";
import type { Car, Fact, Pack, Source, Status } from "./types";
import { safeUrl, site, statusLabels } from "./config";
import { formatFact } from "./compare";

export const PAGE_UPDATED = "2026-10-10";
export const keyMeasurements = [
  "price_aud",
  "range_km",
  "dc_charge_time_min",
  "boot_l",
  "towing_braked_kg",
  "warranty",
];
/** Scooter key facts retain their own battery, speed, luggage and charging definitions. */
export function keyMeasurementsFor(car: Car) {
  if (car.vehicleClass === "bus") {
    // A bus's seated passengers, standing passengers and driver are separate
    // source declarations. Never turn their sum into a passenger-car seat count.
    return [
      "seated_passengers",
      "standing_passengers",
      "driver_seats",
      "length_mm",
      "gvm_kg",
      "battery_kwh",
      "warranty",
    ].filter((key) => !!car.facts[key]);
  }
  if (["van", "ute", "truck"].includes(car.vehicleClass || "")) {
    const offer =
      [
        "price_aud",
        "recommended_driveaway_aud",
        "promotional_driveaway_aud",
        "advertised_dealer_offer_aud",
      ].find((key) => car.facts[key]?.value != null) || "price_aud";
    const load =
      ["cargo_volume_l", "tub_volume_l", "payload_kg"].find(
        (key) => car.facts[key]?.value != null,
      ) || "boot_l";
    return [
      offer,
      "range_km",
      "dc_charge_time_min",
      load,
      "towing_braked_kg",
      "warranty",
    ].filter((key) => !!car.facts[key]);
  }
  if (car.vehicleClass !== "motorcycle") return keyMeasurements;
  const charge = [
    "charge_time_20_80_hours",
    "charge_time_to_80_hours",
    "charge_time_0_100_hours",
    "charge_time_to_100_hours",
  ].find((key) => car.facts[key]);
  return [
    "advertised_dealer_offer_aud",
    "battery_pack_count_included",
    "maximum_speed_kmh",
    "under_seat_storage_l",
    "range_km",
    charge,
  ].filter((key): key is string => !!key && !!car.facts[key]);
}
/** Keep the established passenger overview; specialist rows retain their own measurement keys. */
export function comparisonOverviewKeys(cars: Car[]): string[] {
  if (
    !cars.some((car) => !!car.vehicleClass && car.vehicleClass !== "passenger")
  )
    return [
      "price_aud",
      "range_km",
      "seats",
      "dc_charge_time_min",
      "boot_l",
      "warranty",
    ];
  return [
    ...new Set(
      cars.flatMap((car) => [
        ...keyMeasurementsFor(car),
        ...(["motorcycle", "bus"].includes(car.vehicleClass || "")
          ? []
          : ["seats"]),
      ]),
    ),
  ];
}
export const carName = (car: Car) => `${car.brand} ${car.model} ${car.trim}`;
export const carPath = (car: Car) => `/cars/${car.family}/${car.slug}`;
export type Citation = Pick<
  Source,
  | "id"
  | "title"
  | "url"
  | "publisher"
  | "accessed_date"
  | "published_date"
  | "market"
> & {
  limitation?: string;
  checked?: string;
  /** Separate presentation fields; title remains captured source metadata. */
  displayTitle?: string;
  displayTitleNote?: string;
};
export type Claim = {
  key: string;
  label: string;
  carId: string;
  car: string;
  value: string;
  basis: string;
  evidenceDate: string;
  status: Status;
  sentence: string;
  qualifications: string[];
  sources: Citation[];
};
export type Question = {
  id: string;
  question: string;
  answer: string;
  claims: Claim[];
};
export type CitableReport = {
  title: string;
  path: string;
  url: string;
  dateModified: string;
  cars: {
    id: string;
    name: string;
    brand: string;
    model: string;
    trim: string;
    year: string;
    generation: string;
    vehicleClass?: string;
    url: string;
  }[];
  summary: string;
  keyFacts: Claim[];
  availability: Claim[];
  questions: Question[];
};

function citations(pack: Pack, ids: string[]): Citation[] {
  return [...new Set(ids)].map((id) => {
    const source = pack.sources.find((s) => s.id === id);
    const presentation = source ? sourcePresentation(source) : undefined;
    return source
      ? {
          id,
          title: source.title,
          ...(presentation?.note
            ? {
                displayTitle: presentation.title,
                displayTitleNote: presentation.note,
              }
            : {}),
          url: safeUrl(source.url) || "",
          publisher: source.publisher,
          accessed_date: source.accessed_date,
          published_date: source.published_date,
          market: source.market,
          limitation: source.access_limitation
            ? String(source.access_limitation)
            : undefined,
          checked: source.full_text_checked_date
            ? String(source.full_text_checked_date)
            : undefined,
        }
      : {
          id,
          title: "Source needs confirmation",
          url: "",
          publisher: "Unknown",
          accessed_date: "Unknown",
          published_date: null,
          market: "Unknown",
          limitation: "Source unavailable",
        };
  });
}
function clean(text: string) {
  return text.replace(/\s+/g, " ").trim();
}
function finish(
  pack: Pack,
  claim: Omit<Claim, "sentence" | "car" | "carId">,
): Claim {
  const name = carName(pack.car);
  const qualifications = [
    ...new Set(claim.qualifications.map(clean).filter(Boolean)),
  ];
  const sentence = `${name}: ${claim.label.toLowerCase()} — ${claim.value}; basis: ${clean(claim.basis)}; evidence checked ${claim.evidenceDate}; ${statusLabels[claim.status].toLowerCase()}.${qualifications.length ? ` ${qualifications.join(" ")}` : ""}`;
  return { ...claim, car: name, carId: pack.car.id, qualifications, sentence };
}
export function factClaim(pack: Pack, fact: Fact): Claim {
  return finish(pack, {
    key: fact.key,
    label: factReaderLabel(fact.key, fact.label),
    value: formatFact(fact),
    basis: fact.basis,
    evidenceDate: fact.date,
    status: fact.status,
    sources: citations(pack, fact.sourceIds),
    qualifications: [
      ...factConditions(fact),
      ...(fact.validUntil
        ? [
            `Offer deadline: ${fact.validUntil}; verify eligibility and earlier stock exhaustion.`,
          ]
        : []),
      ...fact.issues.map(issueReaderText),
    ],
  });
}
export function featureClaim(
  pack: Pack,
  key: string,
  label: string,
): Claim | undefined {
  const feature = pack.features.find((f) => f.criterion === key);
  if (!feature) return undefined;
  return finish(pack, {
    key,
    label,
    value: String(feature.value),
    basis:
      feature.condition_label || "Australian variant research; see conditions",
    evidenceDate: feature.last_evidence_date,
    status: feature.status,
    sources: citations(pack, feature.source_ids),
    qualifications: [
      feature.conditions,
      ...(feature.usability_notes || []),
      feature.confirmation_needed || "",
    ],
  });
}
const questions = [
  {
    key: "carplay_android_auto",
    label: "Apple CarPlay and Android Auto",
    ask: (names: string) =>
      `Does ${names} have Apple CarPlay and Android Auto?`,
  },
  {
    key: "real_world_range",
    label: "Independent road-test range",
    ask: (names: string) =>
      `What real-world range has been measured for ${names}?`,
  },
  {
    key: "insurance_cost",
    label: "Insurance benchmark",
    ask: () => "Which is cheaper to insure?",
    answer:
      "These benchmarks do not establish the cheaper car for you; check the driver profile, date and tested version before comparing, then obtain quotes for the same cover.",
  },
  {
    key: "driveaway_price",
    label: "Driveaway price",
    ask: (names: string) => `What is the driveaway price of ${names}?`,
  },
  {
    key: "home_charging",
    label: "Home charging",
    ask: (names: string) => `How long does ${names} take to charge at home?`,
  },
  {
    key: "battery_chemistry",
    label: "Battery chemistry",
    ask: (names: string) => `Does ${names} use an LFP battery?`,
  },
  {
    key: "v2l",
    label: "Vehicle-to-load power",
    ask: (names: string) => `Can ${names} power appliances with V2L?`,
  },
  {
    key: "novated_fbt",
    label: "FBT eligibility",
    ask: () => "Can this EV qualify for the electric-car FBT exemption?",
    answer:
      "Eligibility depends on the vehicle, acquisition and employer arrangement; a listed price alone does not confirm an exemption.",
  },
];
export function makeReport(packs: Pack[], path: string): CitableReport {
  const title = packs.map((p) => carName(p.car)).join(" vs ");
  const hasSpecialist = packs.some(
    (p) => !!p.car.vehicleClass && p.car.vehicleClass !== "passenger",
  );
  const onlyScooters =
    packs.length > 0 && packs.every((p) => p.car.vehicleClass === "motorcycle");
  const keyFacts = hasSpecialist
    ? packs.flatMap((p) =>
        keyMeasurementsFor(p.car).map((key) => factClaim(p, p.car.facts[key])),
      )
    : keyMeasurements.flatMap((key) =>
        packs.map((p) => factClaim(p, p.car.facts[key])),
      );
  const names = packs.map((p) => `${p.car.brand} ${p.car.model}`).join(" or ");
  const rows = questions
    .filter(
      (q) =>
        !onlyScooters ||
        !["carplay_android_auto", "v2l", "novated_fbt"].includes(q.key),
    )
    .map((q): Question => {
      const claims = packs
        .map((p) => featureClaim(p, q.key, q.label))
        .filter((c): c is Claim => !!c);
      return {
        id: q.key,
        question:
          q.key === "insurance_cost" && packs.length === 1
            ? `How much does ${names} cost to insure?`
            : q.ask(names),
        answer:
          (hasSpecialist
            ? q.answer?.replace("cheaper car", "cheaper vehicle")
            : q.answer) ||
          claims
            .map(
              (c) =>
                `${c.car}: ${c.value} (${statusLabels[c.status].toLowerCase()})`,
            )
            .join("; ") + ".",
        claims,
      };
    });
  const dates = [...new Set(keyFacts.map((c) => c.evidenceDate))].sort();
  return {
    title,
    path,
    url: `${site.origin}${path}`,
    dateModified: PAGE_UPDATED,
    cars: packs.map(({ car: c }) => ({
      id: c.id,
      name: carName(c),
      brand: c.brand,
      model: c.model,
      trim: c.trim,
      year: c.year == null ? "Model year unverified" : String(c.year),
      generation: c.generation,
      vehicleClass: c.vehicleClass || "passenger",
      url: `${site.origin}${carPath(c)}`,
    })),
    summary: hasSpecialist
      ? `${title}, Australian specifications. Selected figures retain each vehicle’s own offer, capacity, load-space and charging definitions. Advertised prices and range tests need their stated conditions; different vehicle types are not automatically comparable. Evidence checked ${dates.join(" / ")}.`
      : `${title}, Australian specifications. The six figures below cover listed price, claimed range, DC charging time, cargo space, braked towing and vehicle warranty. Evidence checked ${dates.join(" / ")}; measurement bases and conditions are shown beside each figure.`,
    keyFacts,
    availability: packs.map((p) =>
      factClaim(p, availabilityReportClaim(p.car)),
    ),
    questions: rows,
  };
}
export function citationText(source: Citation) {
  return `${source.publisher} (${source.market}): ${source.url || "URL unavailable"} (accessed ${source.accessed_date}${source.published_date ? `; published ${source.published_date}` : ""}${source.checked ? `; full text checked ${source.checked}` : ""}${source.limitation ? `; ${source.limitation}` : ""})`;
}
export function claimText(claim: Claim) {
  return `${claim.sentence}\nSource: ${claim.sources.map(citationText).join(" | ")}`;
}
export function reportMarkdown(report: CitableReport) {
  const origin = new URL(report.url).origin;
  return `# ${report.title}\n\n${report.url}\nPage updated: ${report.dateModified}. Individual evidence dates below are retained.\n\n${report.summary}\n\n## Availability\n\n${report.availability.map(claimText).join("\n\n")}\n\n## Key facts\n\n${report.keyFacts.map(claimText).join("\n\n")}\n\n${report.questions.map((q) => `## ${q.question}\n\n${q.answer}\n\n${q.claims.map(claimText).join("\n\n")}`).join("\n\n")}\n\nMethodology: ${origin}/methodology\nGlossary: ${origin}/glossary\n`;
}
export function reportSchema(report: CitableReport) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": report.url,
        url: report.url,
        name: report.title,
        description: report.summary,
        dateModified: report.dateModified,
        inLanguage: "en-AU",
        about: report.cars.map((c) => ({ "@id": `${c.url}#car` })),
      },
      ...report.cars.map((c) => ({
        "@type":
          c.vehicleClass === "motorcycle"
            ? "Motorcycle"
            : c.vehicleClass && c.vehicleClass !== "passenger"
              ? "Vehicle"
              : "Car",
        "@id": `${c.url}#car`,
        name: c.name,
        brand: { "@type": "Brand", name: c.brand },
        model: c.model,
        vehicleConfiguration: `${c.trim}; ${c.generation}`,
        // Manufacturer phase labels such as MY26.50 are not calendar dates.
        // Keep them in the report/configuration text without inventing a year.
        ...(/^\d{4}$/.test(c.year) ? { vehicleModelDate: c.year } : {}),
        url: c.url,
      })),
      {
        "@type": "FAQPage",
        "@id": `${report.url}#questions`,
        dateModified: report.dateModified,
        mainEntity: report.questions.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: `${q.answer}\n${q.claims.map(claimText).join("\n")}`,
          },
        })),
      },
    ],
  };
}
