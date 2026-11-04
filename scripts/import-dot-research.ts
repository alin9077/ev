/**
 * Normalising import of "Dot" research into the app's own data layout.
 *
 *   node --import tsx scripts/import-dot-research.ts <export-dir> [--dry]
 *
 * <export-dir> holds catalogue-final.json (433 variants) and research-extra/ from Dot's export.
 * The script is re-runnable: it reads the app's own pre-import state (data.ts with the import overlay
 * switched off), reads Dot's catalogue, and rewrites
 *   data/research-import-2026-10-16.json   (the overlay data.ts loads: models, variants, graded facts, equipment, sources)
 *   data/research-archive/*                (everything that has no app slot, the change log, the mapping log, the report)
 * Nothing in the immutable base file or the earlier overlays is touched.
 *
 * Rules (details and counts are written to data/research-archive/IMPORT-REPORT.md):
 *  - Dot's 22 core fact keys are the app's 22 fact slots; values, units and formats are converted to the app's conventions.
 *  - Other fact keys go to the archive; a few are surfaced in existing slots (kerb weight, battery capacity) or in the
 *    variant record's existing scalar fields (power_kw, torque_nm, gvm_kg, battery_chemistry, top_speed_kmh, consumption_wh_km, drive).
 *  - The original 34 variants keep their values unless Dot has a confirmed/reported, sourced update; every divergence is logged.
 *  - Process provenance (grade reviews, hashes, capture paths, review chains) is dropped.
 */
import fs from "node:fs";
import path from "node:path";
import type {
  Eligibility,
  Fact,
  Feature,
  Grade,
  Source,
  Status,
  Variant,
  VehicleClass,
} from "../src/lib/types";
import {
  IMPORT_FILE,
  SKIP_IMPORT_ENV,
  type FactPatch,
  type FeatureDefault,
  type FeatureRow,
  type ResearchImport,
} from "../src/lib/research-import";
import {
  CONFIRMING_SOURCE_TYPES,
  normaliseSourceType,
} from "../src/lib/source-types";
import {
  cleanReaderText,
  limitQualification,
  readableLabel,
  type TextCleanupReport,
} from "../src/lib/reader-text";
import {
  GRADE_LABELS,
  VEHICLE_CLASSES,
  isHiddenFact,
  isVerifiedFact,
} from "../src/lib/verification";

/* ------------------------------------------------------------------ */
/* Dot's shapes (only what the importer reads)                         */
/* ------------------------------------------------------------------ */
type Json = null | boolean | number | string | Json[] | { [k: string]: Json };
type DotFact = {
  value?: unknown;
  unit?: string;
  basis?: string;
  comparisonBasis?: string;
  status?: string;
  sourceIds?: string[];
  date?: string;
  scope?: string;
  qualifications?: string[];
  buyerGrade?: string;
  resolvedElsewhere?: boolean;
  priceEvidence?: Json;
  validUntil?: string;
  modelYearChangedAt?: string;
  conditionExplanation?: string;
  roadsideFitment?: Json;
};
type DotFeature = {
  criterion: string;
  value?: unknown;
  status?: string;
  conditions?: string;
  source_ids?: string[];
  evidence_scope?: string;
  last_evidence_date?: string;
  reviewed_date?: string;
  verification_state?: string;
  condition_label?: string;
  usability_notes?: string[];
  confirmation_needed?: string;
  buyerGrade?: string;
  evidence_locator?: Json;
  validUntil?: string;
};
type DotVariant = {
  id: string;
  modelId: string;
  vehicleClass: string;
  brand: string;
  model: string;
  trim: string;
  generation?: string;
  year: number | string | null;
  availability: string;
  drive?: string;
  researchStage: string;
  tier: number;
  isTier1: boolean;
  isOnSale: boolean;
  isTier1OnSale: boolean;
  buyerAvailability: string;
  buyerAvailabilityLabel?: string;
  availabilityEvidence?: Json;
  buyerSummary?: Json;
  facts: Record<string, DotFact>;
  features: DotFeature[];
  eligibility: Eligibility;
  configurationEvidence?: Json;
};
type DotSource = Record<string, Json> & { id: string; url: string };
type Dot = {
  models: { id: string; brand: string; model: string; generation?: string }[];
  sources: DotSource[];
  variants: DotVariant[];
  criteria: { key: string }[];
};

/* ------------------------------------------------------------------ */
/* The app's slots                                                      */
/* ------------------------------------------------------------------ */
const AS_OF = "2026-10-16";
const SLOT_UNITS: Record<string, string> = {
  price_aud: "AUD",
  range_km: "km",
  seats: "",
  dc_charge_time_min: "min",
  ac_kw: "kW",
  dc_peak_kw: "kW",
  battery_kwh: "kWh",
  boot_l: "L",
  frunk_l: "L",
  max_total_cargo_l: "L",
  zero_to_100_s: "s",
  length_mm: "mm",
  width_mm: "mm",
  height_mm: "mm",
  wheelbase_mm: "mm",
  towing_braked_kg: "kg",
  warranty: "",
  battery_warranty: "",
  ground_clearance_mm: "mm",
  turning_circle_m: "m",
  kerb_weight_kg: "kg",
  towing_unbraked_kg: "kg",
};
const SLOTS = Object.keys(SLOT_UNITS);
/** Plausible ranges; outside them a value is reported in the mapping log (and kept, graded as Dot graded it). */
const BOUNDS: Record<string, [number, number]> = {
  price_aud: [1000, 3_000_000],
  range_km: [10, 2000],
  seats: [1, 90],
  dc_charge_time_min: [2, 900],
  ac_kw: [0.3, 60],
  dc_peak_kw: [1, 1500],
  battery_kwh: [0.5, 1000],
  boot_l: [0, 20000],
  frunk_l: [0, 1500],
  max_total_cargo_l: [0, 30000],
  zero_to_100_s: [1.5, 40],
  length_mm: [800, 14000],
  width_mm: [400, 3200],
  height_mm: [600, 4200],
  wheelbase_mm: [800, 8000],
  towing_braked_kg: [0, 12000],
  ground_clearance_mm: [50, 600],
  turning_circle_m: [3, 30],
  kerb_weight_kg: [50, 20000],
  towing_unbraked_kg: [0, 3500],
};
/** Dot unit text -> multiplier into the app's unit for the slot. */
const UNIT_FACTORS: Record<string, Record<string, number>> = {
  AUD: { AUD: 1, A$: 1, $: 1 },
  km: { km: 1 },
  min: { min: 1, mins: 1, minutes: 1, minute: 1, hours: 60, hour: 60, h: 60 },
  kW: { kw: 1, kW: 1 },
  kWh: { kwh: 1, kWh: 1 },
  L: { L: 1, l: 1, litres: 1, liters: 1, m3: 1000, "m³": 1000 },
  s: { s: 1, sec: 1, seconds: 1 },
  mm: { mm: 1, cm: 10, m: 1000 },
  kg: { kg: 1, t: 1000 },
  m: { m: 1, mm: 0.001 },
};
const VALID_STATUS = new Set<Status>([
  "standard",
  "conditional",
  "not_verified",
  "subjective",
  "unavailable",
  "optional",
  "not_applicable",
]);
const DOT_GRADES = new Set(["confirmed", "reported", "check", "not_published"]);
/** Fact keys surfaced in an existing slot when the slot is empty: slot -> Dot keys in preference order. */
const SLOT_FILL: Record<string, string[]> = {
  kerb_weight_kg: [
    "kerb_mass_kg",
    "tare_mass_kg",
    "tare_weight_kg",
    "unladen_mass_kg",
  ],
  battery_kwh: ["battery_usable_kwh", "battery_gross_kwh"],
};
/** Variant-record scalars the app's base file already has; Dot key(s) -> field, with a converter. */
const SCALAR_FIELDS: {
  field: string;
  keys: string[];
  kind: "number" | "text";
  factor?: Record<string, number>;
}[] = [
  { field: "power_kw", keys: ["power_kw"], kind: "number" },
  { field: "torque_nm", keys: ["torque_nm"], kind: "number" },
  { field: "gvm_kg", keys: ["gvm_kg"], kind: "number" },
  { field: "battery_chemistry", keys: ["battery_chemistry"], kind: "text" },
  {
    field: "top_speed_kmh",
    keys: ["top_speed_kmh", "top_speed_kph"],
    kind: "number",
  },
  {
    field: "consumption_wh_km",
    keys: ["energy_use_wh_km", "consumption_wh_km", "consumption_kwh_100km"],
    kind: "number",
    factor: { consumption_kwh_100km: 10 },
  },
];
const FEATURE_STATUS = VALID_STATUS;
/** Sentences written for Dot's researchers rather than readers. */
const INTERNAL_NOTE =
  /\bdo not\b|\bmust not\b|\bnot import\b|no value inferred|canonical (field|current)|use_bus_specific|\bkeep \d|retain explicit|no inferred addition|ranking eligib/i;

/* ------------------------------------------------------------------ */
/* Log (everything the report prints)                                   */
/* ------------------------------------------------------------------ */
type Change = {
  variant: string;
  kind: "fact" | "feature" | "variant";
  key: string;
  decision:
    | "adopted"
    | "filled"
    | "kept"
    | "kept_downgraded"
    | "kept_dot_empty"
    | "availability";
  old: unknown;
  new: unknown;
  oldStatus?: string;
  newStatus?: string;
  grade: string;
  dotGrade: string | null;
  sources: string[];
  note?: string;
};
const log = {
  changes: [] as Change[],
  unitConversions: new Map<string, number>(),
  slotFill: new Map<string, number>(),
  warnings: [] as string[],
  droppedText: 0,
  droppedQualifications: 0,
  strings: { rounded: 0, ranges: 0, firstNumber: 0, nulled: 0 },
  warrantyComplex: 0,
  keyDisposition: new Map<string, { count: number; disposition: string }>(),
  sourceTypeMap: new Map<string, string>(),
  confirmedDowngrades: [] as {
    variant: string;
    key: string;
    sourceTypes: string[];
  }[],
  priceLabelled: [] as { variant: string; kind: string }[],
};
/** Sections of the mapping log filled in by main(). */
const extraLog: Record<string, unknown> = {};
const bump = (m: Map<string, number>, k: string, by = 1) =>
  m.set(k, (m.get(k) ?? 0) + by);

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */
function must<T>(v: T | undefined | null, what: string): T {
  if (v === undefined || v === null) throw new Error(`Missing ${what}`);
  return v;
}
function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}
function writeJson(file: string, value: unknown, indent?: number) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, indent) + "\n");
}
function slugify(text: string, max = 56): string {
  const s = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return (
    (s.length > max ? s.slice(0, max).replace(/_[^_]*$/, "") : s) || "trim"
  );
}

/* ------------------------------------------------------------------ */
/* Names                                                                */
/* ------------------------------------------------------------------ */
const MONTHS =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
/**
 * The trim a reader sees. Dot's trim strings carry the advertisement or sheet they were read from
 * ("· MY25 residual New advertising", "· July 2026 AU sheet", "(advertised MY26 offer)"), a repeat of the model name
 * ("Taycan 4S" under Taycan) or nothing but the model ("Taycan" under Taycan). The model year lives in `model_year`.
 * Ids and slugs are built from Dot's raw trim, so they do not change.
 */
function cleanTrim(
  raw: string,
  model: string,
  drive: string,
): { trim: string; changed: string[] } {
  const changed: string[] = [];
  let t = raw.replace(/\s+/g, " ").trim();
  const step = (why: string, next: string) => {
    if (next !== t) changed.push(why);
    t = next.trim();
  };
  step(
    "sheet or advertisement source",
    t
      .replace(
        new RegExp(
          `\\s*[·—–-]\\s*(?:${MONTHS})\\s+\\d{4}(?:\\s+AU)?\\s+sheet\\s*$`,
          "i",
        ),
        "",
      )
      .replace(/\s*[·—–-]\s*[A-Za-z ]*advertised offer\s*$/i, "")
      .replace(/\s*\((?:[^)]*\b)?advertised[^)]*\)/gi, "")
      .replace(
        /\s*[·(—–-]*\s*\(?\s*MY\s?\d{2}(?:\.\d+)?\s+residual(?:\s+new)?(?:\s+advertising)?\s*\)?(?=\s|$)/gi,
        " ",
      )
      .replace(/\s*[—–-]\s*provisional(?:\s*\/\s*pre-delivery)?/gi, "")
      .replace(/;\s*driver inclusion and powertrain unresolved/i, "")
      .replace(/^(?:Listed|Advertised)\s+/i, ""),
  );
  step(
    "model year (kept in the model_year field)",
    t
      .replace(/\s*·\s*MY\s?\d{2}(?:\.\d+)?(?=\s*(?:·|$))/gi, "")
      .replace(/^MY\s?\d{2}(?:\.\d+)?\s+/i, "")
      .replace(/\s+MY\s?\d{2}(?:\.\d+)?$/i, "")
      .replace(/\s*\(MY\s?\d{2}(?:\.\d+)?\)\s*$/i, ""),
  );
  step(
    "leftover separator",
    t
      .replace(/^[·—–\-\s]+|[·—–\-\s]+$/g, "")
      .replace(/\s*·\s*·\s*/g, " · ")
      .replace(/\s{2,}/g, " "),
  );
  // The model name repeated at the front of the trim.
  const repeat = new RegExp(
    `^${model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s+(.+)$`,
    "i",
  );
  const m = t.match(repeat);
  if (m) {
    let rest = m[1].trim();
    const unwrapped = rest.match(/^\(([^()]+)\)$/);
    if (unwrapped) rest = unwrapped[1];
    step("model name repeated in the trim", rest);
    if (/^[a-z]/.test(t))
      step("capital first letter", t[0].toUpperCase() + t.slice(1));
  }
  step("kWh spacing", t.replace(/(\d)kWh\b/g, "$1 kWh"));
  if (!t || t.toLowerCase() === model.toLowerCase()) {
    step(
      "trim was only the model name",
      /^(FWD|RWD|AWD)$/.test(drive) ? `Base ${drive}` : "Base",
    );
  }
  return { trim: t, changed };
}
/** Model spellings the maker does not use. Everything else keeps the maker's Australian styling (BYD ATTO/DOLPHIN/SEAL, Hyundai IONIQ/KONA, smart #1, Cadillac LYRIQ). */
const MODEL_SPELLING: Record<string, string> = {
  "GLC electric": "GLC Electric",
};
const fixModelName = (model: string) => MODEL_SPELLING[model] ?? model;
/** "2027" -> 2027, "2025.5" -> 2025.5, "MY27" -> 2027, from the year field or the model id (my26, my25_5). */
function yearOf(year: number | string | null, ids: string[]): number | null {
  const n = typeof year === "number" ? year : Number(year);
  if (Number.isFinite(n) && n > 1990) return n;
  const my = String(year ?? "").match(/MY\s?(\d{2})(?:\.(\d+))?/i);
  if (my) return 2000 + Number(my[1]) + (my[2] ? Number(`0.${my[2]}`) : 0);
  for (const id of ids) {
    const x = id.match(/_my(\d{2})(?:_(\d+))?(?:_|$)/);
    if (x) return 2000 + Number(x[1]) + (x[2] ? Number(`0.${x[2]}`) : 0);
  }
  return null;
}
const myLabel = (y: number) =>
  `MY${String(Math.floor(y) % 100).padStart(2, "0")}${y % 1 ? `.${String(y).split(".")[1]}` : ""}`;

/** What the reader-text rules removed or rewrote, by rule (written to the mapping log). */
const textCleanup = new Map<string, { count: number; examples: string[] }>();
const reportText: TextCleanupReport = (kind, before, after) => {
  const e = textCleanup.get(kind) ?? { count: 0, examples: [] };
  e.count++;
  if (e.examples.length < 3)
    e.examples.push(
      `${before.slice(0, 140)}${before.length > 140 ? "…" : ""} -> ${after ? after.slice(0, 100) : "(dropped)"}`,
    );
  textCleanup.set(kind, e);
};
function cleanText(text: unknown, kind: "basis" | "sentence" = "sentence") {
  const s = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
  if (!s) return "";
  if (INTERNAL_NOTE.test(s)) {
    log.droppedText++;
    return "";
  }
  return cleanReaderText(s, { kind, report: reportText });
}
/** A qualification that only repeats the field's label ("Wheelbase", the basis, an API path's label) says nothing. */
function labelsIn(list: unknown[], basis: string[]): Set<string> {
  const labels = new Set(basis.map((b) => b.toLowerCase()).filter(Boolean));
  for (const item of list) {
    const raw = String(item ?? "");
    if (raw.includes("categories[id="))
      labels.add(raw.split(/;\s+/).slice(1).join("; ").trim().toLowerCase());
  }
  labels.delete("");
  return labels;
}
function cleanList(list: unknown, basis: string[] = []): string[] {
  if (!Array.isArray(list)) return [];
  const out: string[] = [];
  const labels = labelsIn(list, basis);
  for (const item of list) {
    const raw = String(item ?? "")
      .replace(/\s+/g, " ")
      .trim();
    if (!raw) continue;
    if (INTERNAL_NOTE.test(raw)) {
      log.droppedQualifications++;
      continue;
    }
    if (labels.has(raw.toLowerCase())) continue;
    const text = limitQualification(
      cleanReaderText(raw, { kind: "sentence", report: reportText }),
      reportText,
    );
    if (text && !out.includes(text)) out.push(text);
  }
  return out;
}
function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}
function stable(v: unknown): string {
  return JSON.stringify(v);
}
function sameValue(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number")
    return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(a));
  return stable(a) === stable(b);
}
function gradeOf(dot: string | undefined | null, fallback: Grade): Grade {
  return dot && DOT_GRADES.has(dot) ? (dot as Grade) : fallback;
}

/* ------------------------------------------------------------------ */
/* Sources: normalise, deduplicate by URL, remap ids                    */
/* ------------------------------------------------------------------ */
function normUrl(u: string): string {
  try {
    const x = new URL(u.trim());
    if (!/^https?:$/.test(x.protocol)) return u;
    x.hash = "";
    for (const k of [...x.searchParams.keys()])
      if (/^(utm_|fbclid|gclid)/.test(k)) x.searchParams.delete(k);
    return `${x.protocol}//${x.hostname.toLowerCase().replace(/^www\./, "")}${x.pathname.replace(/\/+$/, "")}${x.search}`;
  } catch {
    return u;
  }
}
function sourceType(raw: string, url?: string, title?: string): string {
  const out = normaliseSourceType(raw, url, title);
  log.sourceTypeMap.set(raw, out);
  return out;
}
function textOf(v: Json | undefined): string {
  if (Array.isArray(v)) return v.map(String).join("; ");
  return v === undefined || v === null ? "" : String(v);
}
function normaliseSource(s: DotSource): Source {
  const market = String(s.market ?? "");
  const out: Source = {
    id: s.id,
    url: String(s.url ?? ""),
    title: String(s.title ?? ""),
    publisher: String(s.publisher ?? ""),
    source_type: sourceType(
      String(s.source_type ?? ""),
      String(s.url ?? ""),
      String(s.title ?? ""),
    ),
    published_date: (s.published_date as string | null) ?? null,
    accessed_date: String(s.accessed_date ?? AS_OF),
    market: /^(AU|Australia)\b/i.test(market) ? "AU" : market,
    supports: cleanText(s.supports),
  };
  const note = cleanText(
    textOf(s.note) || textOf(s.notes) || textOf(s.qualifications),
  );
  if (note) out.note = note;
  for (const k of [
    "access_limitation",
    "audit_status",
    "original_accessed_date",
    "full_text_checked_date",
    "attempted_date",
  ])
    if (s[k]) out[k] = s[k];
  return out;
}

/* ------------------------------------------------------------------ */
/* Value normalisation for the 22 slots                                 */
/* ------------------------------------------------------------------ */
type Norm = {
  value: number | string | null;
  unit: string;
  extraQualifications: string[];
};
function unitFactor(slot: string, dotUnit: string | undefined): number {
  const target = SLOT_UNITS[slot];
  if (!dotUnit || !target) return 1;
  const table = UNIT_FACTORS[target];
  const f = table?.[dotUnit] ?? table?.[dotUnit.toLowerCase()];
  if (f === undefined) {
    if (!["seats", "people", "persons", "years, km"].includes(dotUnit))
      log.warnings.push(`Unexpected unit "${dotUnit}" for ${slot}`);
    return 1;
  }
  if (f !== 1)
    bump(log.unitConversions, `${slot}: ${dotUnit} -> ${target} (x${f})`);
  return f;
}
function tidyNumber(n: number, slot: string): number {
  if (slot === "price_aud") {
    const r = Math.round(n);
    if (r !== n) log.strings.rounded++;
    return r;
  }
  return Math.round(n * 1000) / 1000;
}
const RANGE = /^[<>≤≥~≈]?\s*(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)$/;
function normaliseNumeric(slot: string, d: DotFact): Norm {
  const extra: string[] = [];
  const factor = unitFactor(slot, d.unit);
  const v = d.value;
  if (v === null || v === undefined || v === "")
    return { value: null, unit: SLOT_UNITS[slot], extraQualifications: extra };
  if (typeof v === "number")
    return {
      value: tidyNumber(v * factor, slot),
      unit: SLOT_UNITS[slot],
      extraQualifications: extra,
    };
  if (typeof v === "object")
    throw new Error(`Structured ${slot} must be handled by caller`);
  const s = String(v).trim();
  // Charging times may be a published range or a ceiling; the app writes those as "24–28 min" with no unit.
  if (slot === "dc_charge_time_min") {
    const m = s.match(RANGE);
    if (m) {
      log.strings.ranges++;
      return {
        value: `${s.replace(/\s*[-—]\s*/, "–")} min`,
        unit: "",
        extraQualifications: extra,
      };
    }
    if (/^[<≤]\s*\d+(\.\d+)?$/.test(s)) {
      log.strings.ranges++;
      return { value: `${s} min`, unit: "", extraQualifications: extra };
    }
  }
  if (
    slot === "towing_braked_kg" &&
    /not (approved|rated|permitted).*tow/i.test(s)
  )
    return {
      value: 0,
      unit: "kg",
      extraQualifications: ["Published as not approved for towing."],
    };
  const m = s.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!m) {
    log.strings.nulled++;
    extra.push(`Published as: ${s}`);
    return { value: null, unit: SLOT_UNITS[slot], extraQualifications: extra };
  }
  log.strings.firstNumber++;
  extra.push(`Published as: ${s}`);
  return {
    value: tidyNumber(Number(m[0]) * factor, slot),
    unit: SLOT_UNITS[slot],
    extraQualifications: extra,
  };
}
function fmtKm(n: number) {
  return n.toLocaleString("en-AU");
}
/** "N years / unlimited km" or "N years / 160,000 km" - the form the app uses; the rest of the clause is kept as a qualification. */
function normaliseWarranty(d: DotFact): Norm {
  const extra: string[] = [];
  const v = d.value;
  if (v === null || v === undefined || v === "")
    return { value: null, unit: "", extraQualifications: extra };
  let years: number | null = null;
  let km: number | "unlimited" | null = null;
  let original = "";
  if (typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, unknown>;
    if (typeof o.years === "number") years = o.years;
    else if (typeof o.months === "number") years = o.months / 12;
    const k = o.kilometres ?? o.km;
    if (typeof k === "number") km = k;
    else if (k === "unlimited" || o.unlimited) km = "unlimited";
    original = typeof o.basis === "string" && o.basis ? `${o.basis}` : "";
    if (original) extra.push(`Warranty terms: ${original}`);
  } else {
    original = String(v).replace(/\s+/g, " ").trim();
    const y = original.match(/(\d+(?:\.\d+)?)\s*[- ]?\s*years?\b/i);
    if (y) years = Number(y[1]);
    if (/unlimited\s*(km|kilomet)/i.test(original)) km = "unlimited";
    else {
      const k = original.match(
        /(\d{1,3}(?:,\d{3})+|\d{5,7})\s*(?:km|kilomet)/i,
      );
      if (k) km = Number(k[1].replace(/,/g, ""));
    }
    const simple =
      /^\d+ years? ?\/ ?(unlimited (km|kilometres)|[\d,]+ ?(km|kilometres))$/i.test(
        original,
      );
    if (!simple) {
      log.warrantyComplex++;
      extra.push(`Warranty terms as published: ${original}`);
    }
  }
  if (years === null) {
    extra.push(`Published as: ${original || JSON.stringify(v)}`);
    return { value: null, unit: "", extraQualifications: extra };
  }
  const y = Number.isInteger(years) ? String(years) : years.toFixed(1);
  const dist =
    km === "unlimited"
      ? "unlimited km"
      : km
        ? `${fmtKm(km)} km`
        : "distance limit unconfirmed";
  return {
    value: `${y} year${years === 1 ? "" : "s"} / ${dist}`,
    unit: "",
    extraQualifications: extra,
  };
}
function normaliseGroundClearance(d: DotFact): Norm {
  const v = d.value;
  if (v && typeof v === "object" && !Array.isArray(v)) {
    const o = v as Record<string, number>;
    const nums = Object.values(o).filter((x) => typeof x === "number");
    const min = Math.min(...nums);
    return {
      value: min,
      unit: "mm",
      extraQualifications: [
        `Adjustable ride height: ${Object.entries(o)
          .map(([k, n]) => `${k} ${n} mm`)
          .join(", ")}; the lowest setting is shown.`,
      ],
    };
  }
  return normaliseNumeric("ground_clearance_mm", d);
}

/** Canonical comparison bases: only where Dot's wording is a recognisable spelling of the app's own label. */
function comparisonBasisFor(slot: string, d: DotFact, basis: string): string {
  const raw = `${d.comparisonBasis ?? ""} ${d.basis ?? ""}`;
  const fromDot = cleanText(d.comparisonBasis, "basis");
  switch (slot) {
    case "price_aud":
      if (/driveaway|drive-away|ride-?away/i.test(fromDot))
        return "Driveaway price";
      if (
        /before on-road|excluding on-road|excl.*on-?road|list price/i.test(raw)
      )
        return "List price before on-road costs";
      break;
    case "range_km":
      if (/WLTP/i.test(fromDot) && /target/i.test(fromDot))
        return "WLTP target";
      if (/WLTP/i.test(fromDot) && /max/i.test(fromDot)) return "WLTP maximum";
      if (/WLTP/i.test(fromDot) && /combined/i.test(fromDot))
        return "WLTP combined";
      if (/^WLTP\b/i.test(fromDot)) return "WLTP";
      if (/NEDC/i.test(fromDot)) return "NEDC combined";
      if (/ADR\s*81/i.test(fromDot)) return "ADR 81/02";
      break;
    case "seats":
      return "Seating positions";
    case "battery_kwh":
      if (
        /usable/i.test(raw) &&
        !/unspecified|not specified|gross\/usable/i.test(raw)
      )
        return "Usable capacity";
      if (
        /gross|nominal/i.test(raw) &&
        !/unspecified|not specified|gross\/usable/i.test(raw)
      )
        return "Gross capacity";
      return "Gross or usable not stated";
    case "dc_charge_time_min": {
      const w = raw.match(/(\d{1,2})\s*[–—-]\s*(\d{2,3})\s*%/);
      const kw = raw.match(/(\d{2,3})\s*kW/i);
      if (w) return `${w[1]}–${w[2]}%${kw ? ` on a ${kw[1]} kW charger` : ""}`;
      break;
    }
  }
  return fromDot || basis;
}
/** Value-less facts have nothing to compare: the basis text stands in. */

type NormFact = {
  patch: FactPatch;
  value: number | string | null;
  dotGrade: string | null;
  extras: {
    priceEvidence?: Json;
    validUntil?: string;
    modelYearChangedAt?: string;
  };
};
function normaliseFact(
  slot: string,
  d: DotFact | undefined,
  fallbackDate: string,
  fallbackScope: string,
): NormFact {
  const dot = d ?? { value: null };
  let n: Norm;
  if (slot === "warranty" || slot === "battery_warranty")
    n = normaliseWarranty(dot);
  else if (slot === "ground_clearance_mm") n = normaliseGroundClearance(dot);
  else n = normaliseNumeric(slot, dot);
  let status = String(dot.status ?? "not_verified") as Status;
  if (!VALID_STATUS.has(status)) status = "not_verified";
  if (n.value === null) status = "not_verified";
  else if (status === "not_verified") status = "conditional";
  if (slot === "towing_braked_kg" && n.value === 0 && status === "unavailable")
    status = "standard";
  const basisText =
    cleanText(dot.basis, "basis") || cleanText(dot.comparisonBasis, "basis");
  const basis =
    basisText || (n.value === null ? "Not established" : "Basis not stated");
  const [lo, hi] = BOUNDS[slot] ?? [-Infinity, Infinity];
  if (typeof n.value === "number" && (n.value < lo || n.value > hi))
    log.warnings.push(`Out-of-range ${slot}=${n.value} (${lo}..${hi})`);
  const dotGrade = dot.buyerGrade ?? null;
  const qualifications = cleanList(dot.qualifications, [
    String(dot.basis ?? ""),
    String(dot.comparisonBasis ?? ""),
  ]);
  for (const q of n.extraQualifications)
    if (!qualifications.includes(q)) qualifications.push(q);
  const patch: FactPatch = {
    value: n.value,
    unit: n.unit,
    basis,
    comparisonBasis:
      n.value === null ? basis : comparisonBasisFor(slot, dot, basis),
    status,
    sourceIds: uniq(dot.sourceIds ?? []),
    date: dot.date ?? fallbackDate,
    market: "AU",
    scope: readableLabel(cleanText(dot.scope)) || fallbackScope,
    qualifications,
    grade: gradeOf(dotGrade, n.value === null ? "not_published" : "unrated"),
  };
  if (dot.resolvedElsewhere) patch.resolvedElsewhere = true;
  return {
    patch,
    value: n.value,
    dotGrade,
    extras: {
      priceEvidence: dot.priceEvidence,
      validUntil: dot.validUntil,
      modelYearChangedAt: dot.modelYearChangedAt,
    },
  };
}

function normaliseDrive(raw: string | undefined): string {
  const s = String(raw ?? "").trim();
  if (/^(FWD|RWD|AWD)$/.test(s)) return s;
  if (/all.?wheel|4wd|awd|allgrip|4x4/i.test(s)) return "AWD";
  if (
    /rear.?wheel|rwd|rear driven|e-?axle|chain final/i.test(s) &&
    !/unverified|not independently/i.test(s)
  )
    return /chain final/i.test(s) ? "Unknown" : "RWD";
  if (/front.?wheel|fwd/i.test(s)) return "FWD";
  return "Unknown";
}

/* ------------------------------------------------------------------ */
/* Main                                                                 */
/* ------------------------------------------------------------------ */
type BaseFact = Fact;
type BaseFeature = Feature;

async function main() {
  const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const dry = process.argv.includes("--dry");
  const exportDir = args[0];
  if (
    !exportDir ||
    !fs.existsSync(path.join(exportDir, "catalogue-final.json"))
  )
    throw new Error(
      "usage: node --import tsx scripts/import-dot-research.ts <export-dir>   (export-dir contains catalogue-final.json)",
    );
  if (!fs.existsSync("data/au_ev_all_variants_2026-10-06.json"))
    throw new Error("Run from the repository root.");
  const t0 = Date.now();

  /* ---- the app's own state before the import ---- */
  process.env[SKIP_IMPORT_ENV] = "1";
  const app = await import("../src/lib/data");
  const baseResearch = app.research();
  const baseCars = new Map(app.catalogue().map((c) => [c.id, c]));
  const basePacks = new Map(
    [...baseCars.keys()].map((id) => [id, app.pack(id)]),
  );
  const baseSources = new Set(baseResearch.sources.map((s) => s.id));
  const baseVariants = new Map(baseResearch.variants.map((v) => [v.id, v]));
  const baseModels = new Map(baseResearch.models.map((m) => [m.id, m]));
  const criteriaKeys = baseResearch.criteria.map((c) => c.key);
  console.log(
    `baseline: ${baseCars.size} variants, ${baseResearch.sources.length} sources, ${criteriaKeys.length} criteria`,
  );

  /* ---- Dot ---- */
  const dot = readJson<Dot>(path.join(exportDir, "catalogue-final.json"));
  if (stable(dot.criteria.map((c) => c.key)) !== stable(criteriaKeys))
    throw new Error(
      "Dot's criteria differ from the app's; extend the importer before continuing.",
    );
  console.log(
    `dot: ${dot.variants.length} variants, ${dot.sources.length} sources`,
  );

  /* ---- sources ---- */
  const canonByUrl = new Map<string, string>();
  for (const s of baseResearch.sources) {
    const k = normUrl(s.url);
    if (!canonByUrl.has(k)) canonByUrl.set(k, s.id);
  }
  const sourceAlias = new Map<string, string>(); // dropped id -> canonical id
  const keptSources: Source[] = [];
  const keptById = new Map<string, Source>();
  for (const s of dot.sources) {
    if (baseSources.has(s.id)) continue; // identical to the app's record (checked below)
    const k = /^https?:/i.test(String(s.url))
      ? normUrl(String(s.url))
      : `id:${s.id}`;
    const canon = canonByUrl.get(k);
    if (canon) {
      sourceAlias.set(s.id, canon);
      const kept = keptById.get(canon);
      const incoming = String(s.accessed_date ?? "");
      if (kept && incoming > kept.accessed_date) kept.accessed_date = incoming;
      continue;
    }
    canonByUrl.set(k, s.id);
    const norm = normaliseSource(s);
    keptSources.push(norm);
    keptById.set(norm.id, norm);
  }
  for (const s of dot.sources)
    if (baseSources.has(s.id)) {
      const mine = baseResearch.sources.find((x) => x.id === s.id)!;
      if (mine.url !== s.url)
        log.warnings.push(
          `Source ${s.id} URL differs from the app's record; the app's is kept`,
        );
    }
  const src = (ids: string[] | undefined) =>
    uniq((ids ?? []).map((i) => sourceAlias.get(i) ?? i));

  const baseSourceType = new Map(
    baseResearch.sources.map((x) => [
      x.id,
      normaliseSourceType(x.source_type, x.url),
    ]),
  );
  const typeOfSource = (id: string) =>
    keptById.get(id)?.source_type ?? baseSourceType.get(id);

  /* ---- ids ---- */
  const idMap = new Map<string, string>(); // dot id -> app id
  const usedSlugs = new Map<string, Set<string>>(); // family -> slugs
  const familyOf = (modelId: string) =>
    modelId.startsWith("byd_atto_3")
      ? "byd-atto-3"
      : modelId.replaceAll("_", "-");
  const slugOf = (id: string) =>
    (id.split("__").length >= 3
      ? id.split("__").slice(1).join("-")
      : id
    ).replaceAll("_", "-");
  const counters = new Map<string, number>();
  for (const v of baseResearch.variants) {
    const fam = familyOf(v.model_id);
    if (!usedSlugs.has(fam)) usedSlugs.set(fam, new Set());
    usedSlugs.get(fam)!.add(slugOf(v.id));
    const n = Number(v.id.split("__")[2]);
    if (Number.isFinite(n))
      counters.set(v.model_id, Math.max(counters.get(v.model_id) ?? 0, n));
  }
  for (const v of dot.variants) {
    if (baseVariants.has(v.id)) {
      idMap.set(v.id, v.id);
      continue;
    }
    const fam = familyOf(v.modelId);
    if (!usedSlugs.has(fam)) usedSlugs.set(fam, new Set());
    const trim = slugify(v.trim);
    let n = counters.get(v.modelId) ?? 0;
    let id: string;
    do {
      n++;
      id = `${v.modelId}__${trim}__${n}`;
    } while (
      usedSlugs.get(fam)!.has(slugOf(id)) ||
      [...idMap.values()].includes(id)
    );
    counters.set(v.modelId, n);
    usedSlugs.get(fam)!.add(slugOf(id));
    idMap.set(v.id, id);
  }
  if (new Set(idMap.values()).size !== dot.variants.length)
    throw new Error("Duplicate variant ids");

  /* ---- manual corrections (data/manual-corrections.json) ---- */
  type Correction = {
    id: string;
    variant: string;
    field: string;
    value?: unknown;
    grade?: Grade;
    status?: Status;
    sources?: string[];
    qualification?: string;
    reason: string;
  };
  const fixFile = readJson<{
    checked: string;
    sources: (Partial<Source> & { id: string; url: string })[];
    corrections: Correction[];
  }>("data/manual-corrections.json");
  const fixSourceId = new Map<string, string>();
  for (const fsrc of fixFile.sources) {
    const k = normUrl(fsrc.url);
    const canon = canonByUrl.get(k);
    if (canon) {
      fixSourceId.set(fsrc.id, canon);
      continue;
    }
    const rec: Source = {
      id: fsrc.id,
      url: fsrc.url,
      title: fsrc.title ?? "",
      publisher: fsrc.publisher ?? "",
      source_type: normaliseSourceType(fsrc.source_type ?? "other", fsrc.url),
      published_date: fsrc.published_date ?? null,
      accessed_date: fixFile.checked,
      market: "AU",
      supports: fsrc.supports ?? "",
    };
    canonByUrl.set(k, rec.id);
    keptSources.push(rec);
    keptById.set(rec.id, rec);
    fixSourceId.set(fsrc.id, rec.id);
  }
  const appIds = new Set(idMap.values());
  const fixesFor = new Map<string, Correction[]>();
  for (const c of fixFile.corrections) {
    if (!appIds.has(c.variant))
      throw new Error(`Correction ${c.id}: unknown variant ${c.variant}`);
    for (const sid of c.sources ?? [])
      if (!fixSourceId.has(sid))
        throw new Error(`Correction ${c.id}: unknown source ${sid}`);
    const list = fixesFor.get(c.variant) ?? [];
    list.push(c);
    fixesFor.set(c.variant, list);
  }
  const appliedFixes: {
    id: string;
    variant: string;
    field: string;
    before: unknown;
    after: unknown;
    grade?: string;
    sources: string[];
    reason: string;
  }[] = [];
  const fixSources = (c: Correction) =>
    (c.sources ?? []).map((i) => fixSourceId.get(i)!);

  /* ---- record state: corrections, then superseded model years ---- */
  const byDotId = new Map(dot.variants.map((v) => [v.id, v]));
  const appToDot = new Map([...idMap].map(([d, a]) => [a, d]));
  const stateDecisions: {
    variant: string;
    from: string;
    to: string;
    kind: "correction" | "superseded_model_year";
    reason: string;
  }[] = [];
  for (const c of fixFile.corrections) {
    if (c.field !== "record_state") continue;
    const dv = byDotId.get(appToDot.get(c.variant)!)!;
    stateDecisions.push({
      variant: c.variant,
      from: dv.availability,
      to: String(c.value),
      kind: "correction",
      reason: c.reason,
    });
    dv.availability = String(c.value);
    appliedFixes.push({
      id: c.id,
      variant: c.variant,
      field: c.field,
      before: stateDecisions[stateDecisions.length - 1].from,
      after: c.value,
      sources: fixSources(c),
      reason: c.reason,
    });
  }
  // Display names (see cleanTrim); the originals keep the app's own.
  const trimOf = new Map<string, string>();
  const nameLog: Record<
    string,
    { variant: string; from: string; to: string }[]
  > = {};
  for (const dv of dot.variants) {
    const id = idMap.get(dv.id)!;
    if (baseVariants.has(id)) {
      trimOf.set(dv.id, dv.trim);
      continue;
    }
    const { trim, changed } = cleanTrim(
      dv.trim,
      dv.model,
      normaliseDrive(dv.drive),
    );
    trimOf.set(dv.id, trim);
    for (const why of changed)
      (nameLog[why] ??= []).push({ variant: id, from: dv.trim, to: trim });
  }
  const nameKey = (dv: DotVariant) =>
    [dv.brand, fixModelName(dv.model), trimOf.get(dv.id)!]
      .join("|")
      .toLowerCase()
      .replace(/[^a-z0-9|]+/g, "");
  const nameGroups = new Map<string, DotVariant[]>();
  for (const dv of dot.variants) {
    const k = nameKey(dv);
    nameGroups.set(k, [...(nameGroups.get(k) ?? []), dv]);
  }
  // A trim that states its own model year ("MY23.75 residual") is more exact than the year field.
  const rawMy = new Map<string, number>();
  for (const dv of dot.variants) {
    const m = dv.trim.match(/\bMY\s?(\d{2}(?:\.\d+)?)/i);
    if (m) rawMy.set(idMap.get(dv.id)!, 2000 + Number(m[1]));
  }
  const yearByDot = new Map(
    dot.variants.map((v) => [v.id, yearOf(v.year, [v.modelId, v.id])]),
  );
  const soldNew = (dv: DotVariant) => {
    const a = dv.availabilityEvidence as
      | {
          stockStatus?: string;
          qualifications?: string[];
          sourceIds?: string[];
        }
      | undefined;
    if (!a) return false;
    if (a.stockStatus === "new_stock_listed") return true;
    return (
      (a.sourceIds?.length ?? 0) > 0 &&
      (a.qualifications ?? []).some((q) =>
        /dealer[- ](?:advert|listing)|advertised[- ]new|new dealer advert/i.test(
          q,
        ),
      )
    );
  };
  const namedPairs: {
    group: string;
    members: { variant: string; year: number | null; state: string }[];
    decision: string;
  }[] = [];
  for (const [key, members] of nameGroups) {
    if (members.length < 2) continue;
    const decisions: string[] = [];
    for (const m of members) {
      const my = yearByDot.get(m.id);
      if (baseVariants.has(idMap.get(m.id)!)) continue;
      if (my == null || m.availability !== "current_or_order_listed") continue;
      const newer = members.some(
        (n) =>
          n !== m &&
          n.availability === "current_or_order_listed" &&
          (yearByDot.get(n.id) ?? -1) > my,
      );
      if (!newer) continue;
      const id = idMap.get(m.id)!;
      if (soldNew(m)) {
        decisions.push(`${id}: stays current, dealer-advertised as new stock`);
        continue;
      }
      stateDecisions.push({
        variant: id,
        from: m.availability,
        to: "outgoing",
        kind: "superseded_model_year",
        reason: `A newer model year of the same trim is current and no source shows this ${myLabel(my)} version still sold new.`,
      });
      m.availability = "outgoing";
      decisions.push(`${id}: set outgoing`);
    }
    namedPairs.push({
      group: key,
      members: members.map((m) => ({
        variant: idMap.get(m.id)!,
        year: yearByDot.get(m.id) ?? null,
        state: m.availability,
      })),
      decision: decisions.join("; ") || "no change",
    });
  }

  /* ---- per-variant normalisation ---- */
  const out: ResearchImport = {
    schema_version: "1.0.0",
    import_id: "dot-research-2026-10-16",
    as_of: AS_OF,
    models: [],
    variants: [],
    variant_patches: {},
    trim_equipment: [],
    eligibility: [],
    feature_defaults: {},
    features: {},
    feature_patches: {},
    facts: {},
    sources: [],
  };
  const archive = {
    strings: [] as string[],
    stringIndex: new Map<string, number>(),
    facts: {} as Record<string, Record<string, Json>>,
    featureExtras: {} as Record<string, Record<string, Json>>,
    variantMeta: {} as Record<string, Json>,
    priceEvidence: {} as Record<string, Json>,
    configurationEvidence: {} as Record<string, Json>,
  };
  const str = (s: string | undefined) => {
    if (!s) return null;
    let i = archive.stringIndex.get(s);
    if (i === undefined) {
      i = archive.strings.length;
      archive.strings.push(s);
      archive.stringIndex.set(s, i);
    }
    return i;
  };
  const sourceTable: string[] = [];
  const sourceTableIndex = new Map<string, number>();
  const sourceIndex = (id: string) => {
    let i = sourceTableIndex.get(id);
    if (i === undefined) {
      i = sourceTable.length;
      sourceTable.push(id);
      sourceTableIndex.set(id, i);
    }
    return i;
  };
  const usedModels = new Set<string>();
  const stats = {
    perClass: {} as Record<
      string,
      {
        variants: number;
        facts: number;
        visible: number;
        hidden: number;
        empty: number;
      }
    >,
    byGrade: {} as Record<string, number>,
    originalHidden: [] as {
      variant: string;
      key: string;
      value: unknown;
      grade: string;
      reason: string;
    }[],
    originalFacts: 0,
    originalVisible: 0,
    originalFeatureRows: 0,
    originalFeatureHidden: [] as { variant: string; criterion: string }[],
    scalarFilled: 0,
    slotFilled: 0,
    placeholderRows: 0,
    storedRows: 0,
    extraFacts: 0,
    extraKeys: new Set<string>(),
    featuresByGrade: {} as Record<string, number>,
  };
  const referencedBySlots = new Set<string>(); // source ids used by app-visible content
  const referencedByArchive = new Set<string>();
  const expiryRows: { id: string; criterion: string; until: string }[] = [];

  for (const dv of dot.variants) {
    const id = must(idMap.get(dv.id), "id");
    const original = baseVariants.has(id);
    const cls = (
      VEHICLE_CLASSES.includes(dv.vehicleClass as VehicleClass)
        ? dv.vehicleClass
        : "passenger"
    ) as VehicleClass;
    const baseCar = baseCars.get(id);
    const fallbackDate = dv.facts.price_aud?.date ?? AS_OF;
    const displayTrim = trimOf.get(dv.id)!;
    const displayModel = fixModelName(dv.model);
    const fallbackScope = `${dv.brand} ${displayModel} ${displayTrim}`;
    // Hand-checked corrections go in before anything is compared with the app's own record.
    for (const c of fixesFor.get(id) ?? []) {
      if (c.field === "record_state") continue;
      const slotFact = (dv.facts[c.field] ??= { value: null });
      const before = slotFact.value;
      if (c.value !== undefined) {
        slotFact.value = c.value;
        slotFact.sourceIds = fixSources(c);
        if (c.status) slotFact.status = c.status;
      }
      if (c.grade) slotFact.buyerGrade = c.grade;
      appliedFixes.push({
        id: c.id,
        variant: id,
        field: c.field,
        before,
        after: c.value ?? before,
        grade: c.grade,
        sources: fixSources(c),
        reason: c.reason,
      });
    }
    usedModels.add(dv.modelId);

    /* facts ----------------------------------------------------- */
    const factPatches: Record<string, FactPatch> = {};
    const normByKey = new Map<string, NormFact>();
    for (const slot of SLOTS) {
      const nf = normaliseFact(
        slot,
        dv.facts[slot],
        fallbackDate,
        fallbackScope,
      );
      normByKey.set(slot, nf);
    }
    // Fill empty slots from Dot's equivalent measurements.
    for (const [slot, aliases] of Object.entries(SLOT_FILL)) {
      const current = normByKey.get(slot)!;
      if (current.value !== null) continue;
      for (const key of aliases) {
        const alt = dv.facts[key];
        if (!alt || alt.value === null || alt.value === undefined) continue;
        const nf = normaliseFact(slot, alt, fallbackDate, fallbackScope);
        if (nf.value === null) continue;
        nf.patch.qualifications = uniq([
          ...nf.patch.qualifications!,
          `Taken from the ${key.replaceAll("_", " ")} measurement.`,
        ]);
        normByKey.set(slot, nf);
        stats.slotFilled++;
        bump(log.slotFill, `${slot} <- ${key}`);
        break;
      }
    }

    // The original 34: keep the app's value unless Dot has a better-graded, sourced update.
    for (const slot of SLOTS) {
      const nf = normByKey.get(slot)!;
      const baseFact: BaseFact | undefined = baseCar?.facts[slot];
      let patch = nf.patch;
      if (baseFact) {
        const dotGradeVisible =
          nf.dotGrade === "confirmed" || nf.dotGrade === "reported";
        const differs = !sameValue(baseFact.value, nf.value);
        const record = (
          decision: Change["decision"],
          grade: Grade,
          note?: string,
        ) =>
          log.changes.push({
            variant: id,
            kind: "fact",
            key: slot,
            decision,
            old: baseFact.value,
            new: nf.value,
            oldStatus: baseFact.status,
            newStatus: nf.patch.status,
            grade,
            dotGrade: nf.dotGrade,
            sources: src(nf.patch.sourceIds),
            note,
          });
        if (!differs) {
          // Same value: keep the app's record; carry Dot's grade only if it is a verified one.
          patch = {
            grade: dotGradeVisible ? (nf.dotGrade as Grade) : "established",
          };
        } else if (baseFact.value === null || baseFact.value === undefined) {
          record(
            "filled",
            nf.patch.grade,
            "The app had no value for this slot.",
          );
        } else if (nf.value === null) {
          record(
            "kept_dot_empty",
            "established",
            "Dot has no value for this slot; the app's value is kept.",
          );
          patch = { grade: "established" };
        } else if (dotGradeVisible && nf.patch.sourceIds!.length > 0) {
          record(
            "adopted",
            nf.patch.grade,
            "Dot's value is confirmed/reported with its own sources.",
          );
        } else if (nf.dotGrade === "check" && nf.patch.sourceIds!.length > 0) {
          record(
            "kept_downgraded",
            "check",
            "Dot's sourced figure conflicts with the app's value and is only graded Check: the app's value is kept but no longer treated as verified.",
          );
          patch = { grade: "check" };
        } else {
          record(
            "kept",
            "established",
            "Dot's value is not better graded than the app's: the app's value is kept.",
          );
          patch = { grade: "established" };
        }
      }
      factPatches[slot] = patch;
      const cited = src(patch.sourceIds ?? []);
      cited.forEach((s) => referencedBySlots.add(s));
      if (patch.sourceIds) patch.sourceIds = cited;
      if (nf.extras.priceEvidence && slot === "price_aud")
        archive.priceEvidence[id] = nf.extras.priceEvidence;
    }
    // Corrections: the qualification, sources and status that the "same value" path above would otherwise drop.
    for (const c of fixesFor.get(id) ?? []) {
      if (c.field === "record_state") continue;
      const patch = factPatches[c.field];
      const baseFact = baseCar?.facts[c.field];
      if (c.qualification)
        patch.qualifications = uniq([
          ...(patch.qualifications ?? baseFact?.qualifications ?? []),
          c.qualification,
        ]);
      if (c.value !== undefined && c.status) patch.status = c.status;
      const add = fixSources(c);
      if (add.length) {
        patch.sourceIds = uniq([
          ...(patch.sourceIds ?? baseFact?.sourceIds ?? []),
          ...add,
        ]);
        add.forEach((sid) => referencedBySlots.add(sid));
      }
    }
    // "Confirmed" means maker or regulator material (see verification.ts); anything else is Reported.
    for (const slot of SLOTS) {
      const patch = factPatches[slot];
      if (patch.grade !== "confirmed") continue;
      const baseFact = baseCar?.facts[slot];
      const ids = patch.sourceIds ?? baseFact?.sourceIds ?? [];
      const types = uniq(ids.map(typeOfSource).filter(Boolean) as string[]);
      if (
        !types.length ||
        types.some((t) =>
          (CONFIRMING_SOURCE_TYPES as readonly string[]).includes(t),
        )
      )
        continue;
      patch.grade = "reported";
      patch.qualifications = uniq([
        ...(patch.qualifications ?? baseFact?.qualifications ?? []),
        "The sources are retailer, database or press material rather than the maker or a regulator, so this is graded Reported.",
      ]);
      log.confirmedDowngrades.push({
        variant: id,
        key: slot,
        sourceTypes: types,
      });
    }
    // A price on a version that is not on sale yet, or is on its way out with no sign of stock, is not a current offer.
    {
      const patch = factPatches.price_aud;
      const baseFact = baseCar?.facts.price_aud;
      const priced = (patch.value ?? baseFact?.value ?? null) !== null;
      const kind =
        dv.availability === "announced_provisional"
          ? "announced"
          : dv.availability === "outgoing" &&
              dv.buyerAvailability === "not_confirmed"
            ? "last_listed"
            : null;
      if (priced && kind) {
        const before =
          patch.basis ?? baseFact?.basis ?? "Price basis not stated";
        const label = kind === "announced" ? "Announced" : "Last listed";
        patch.comparisonBasis ??= baseFact?.comparisonBasis ?? before;
        patch.basis = `${label} · ${before}`;
        patch.qualifications = uniq([
          ...(patch.qualifications ?? baseFact?.qualifications ?? []),
          kind === "announced"
            ? "Announced price: this version is not on sale yet, so it is not a current offer and may change before orders open."
            : "Last listed price: this version is outgoing and no source confirms it can still be ordered, so it is not a current offer.",
        ]);
        log.priceLabelled.push({ variant: id, kind });
      }
    }
    // New variants: facts that share the variant's scope/date are stored without them (data.ts defaults to the variant record).
    let modeScope = fallbackScope;
    let modeDate = fallbackDate;
    if (!original) {
      const mode = (xs: (string | undefined)[], d: string) => {
        const c = new Map<string, number>();
        for (const x of xs) if (x) c.set(x, (c.get(x) ?? 0) + 1);
        return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? d;
      };
      modeScope = mode(
        Object.values(factPatches).map((p) => p.scope),
        fallbackScope,
      );
      modeDate = mode(
        Object.values(factPatches).map((p) => p.date),
        fallbackDate,
      );
    }
    for (const p of Object.values(factPatches)) {
      if (!original) {
        if (p.scope === modeScope) delete p.scope;
        if (p.date === modeDate) delete p.date;
      }
      delete p.market;
      if (p.comparisonBasis !== undefined && p.comparisonBasis === p.basis)
        delete p.comparisonBasis;
    }
    out.facts[id] = factPatches;

    /* stats --------------------------------------------------- */
    const classStat = (stats.perClass[cls] ??= {
      variants: 0,
      facts: 0,
      visible: 0,
      hidden: 0,
      empty: 0,
    });
    classStat.variants++;
    for (const slot of SLOTS) {
      const effective: Pick<Fact, "value" | "status" | "grade"> = {
        value:
          original && factPatches[slot].value === undefined
            ? baseCar!.facts[slot].value
            : (factPatches[slot].value ?? null),
        status: (factPatches[slot].status ??
          baseCar?.facts[slot].status ??
          "not_verified") as Status,
        grade: factPatches[slot].grade,
      };
      if (effective.value === null || effective.value === undefined) {
        classStat.empty++;
        continue;
      }
      classStat.facts++;
      stats.byGrade[effective.grade ?? "unrated"] =
        (stats.byGrade[effective.grade ?? "unrated"] ?? 0) + 1;
      if (isVerifiedFact(effective)) classStat.visible++;
      else classStat.hidden++;
      if (original) {
        stats.originalFacts++;
        if (isVerifiedFact(effective)) stats.originalVisible++;
        else if (isHiddenFact(effective))
          stats.originalHidden.push({
            variant: id,
            key: slot,
            value: effective.value,
            grade: effective.grade ?? "unrated",
            reason:
              effective.grade === "check"
                ? "Dot found a sourced conflict and graded it Check"
                : `graded ${GRADE_LABELS[effective.grade ?? "unrated"]}`,
          });
      }
    }

    /* archive: every fact that has no slot ------------------------- */
    const extraFacts: Record<string, Json> = {};
    for (const [key, f] of Object.entries(dv.facts)) {
      if (SLOTS.includes(key)) continue;
      stats.extraKeys.add(key);
      stats.extraFacts++;
      const disposition = Object.entries(SLOT_FILL).some(([, a]) =>
        a.includes(key),
      )
        ? "archive (also used to fill an empty slot)"
        : SCALAR_FIELDS.some((s) => s.keys.includes(key))
          ? "archive (also copied to the variant record's existing field)"
          : "archive";
      const rec = log.keyDisposition.get(key) ?? { count: 0, disposition };
      rec.count++;
      log.keyDisposition.set(key, rec);
      const sources = src(f.sourceIds);
      sources.forEach((s) => referencedByArchive.add(s));
      const sourceRefs = sources.map((s) => sourceIndex(s));
      extraFacts[key] = [
        f.value as Json,
        f.unit ?? "",
        str(cleanText(f.basis, "basis") || undefined),
        f.status ?? "",
        gradeOf(
          f.buyerGrade,
          f.value === null || f.value === undefined
            ? "not_published"
            : "unrated",
        ),
        f.date ?? "",
        sourceRefs,
        cleanList(f.qualifications).map((q) => str(q) as number),
      ];
    }
    if (Object.keys(extraFacts).length) archive.facts[id] = extraFacts;

    /* equipment rows ---------------------------------------------- */
    const rows: DotFeature[] = dv.features;
    const gradeFor = (f: DotFeature): Grade =>
      gradeOf(
        f.buyerGrade,
        (f.status === "not_verified" ? "not_published" : "unrated") as Grade,
      );
    const toRow = (f: DotFeature): FeatureRow => {
      const status = (
        FEATURE_STATUS.has(f.status as Status) ? f.status : "not_verified"
      ) as Status;
      const row: FeatureRow = {
        criterion: f.criterion,
        status,
        value: String(f.value ?? "") || "Needs confirmation",
        conditions: cleanText(f.conditions),
        source_ids: src(f.source_ids),
        evidence_scope: String(f.evidence_scope ?? ""),
        last_evidence_date: String(f.last_evidence_date ?? AS_OF),
        reviewed_date: String(f.reviewed_date ?? f.last_evidence_date ?? AS_OF),
        verification_state: String(f.verification_state ?? ""),
        grade: gradeFor(f),
      };
      const label = cleanText(f.condition_label);
      if (label) row.condition_label = label;
      const notes = cleanList(f.usability_notes);
      if (notes.length) row.usability_notes = notes;
      const need = cleanText(f.confirmation_needed);
      if (need) row.confirmation_needed = need;
      return row;
    };
    const isPlaceholder = (r: FeatureRow) =>
      r.status === "not_verified" &&
      r.source_ids.length === 0 &&
      r.value === "Needs confirmation" &&
      /research pending|not yet been researched/i.test(r.conditions) &&
      !r.condition_label &&
      !r.usability_notes &&
      !r.confirmation_needed;
    for (const f of rows) {
      const extra: Record<string, Json> = {};
      if (f.evidence_locator) extra.evidence_locator = f.evidence_locator;
      if (f.validUntil) extra.validUntil = f.validUntil;
      if (Object.keys(extra).length)
        (archive.featureExtras[id] ??= {})[f.criterion] = extra;
    }
    expiryRows.push(
      ...rows
        .filter((f) => f.validUntil)
        .map((f) => ({ id, criterion: f.criterion, until: f.validUntil! })),
    );
    if (original) {
      // Grade the app's own rows; replace one only when Dot's is confirmed/reported, sourced and different in substance.
      const patches: Record<string, Partial<Feature>> = {};
      const mine = new Map(
        basePacks.get(id)!.features.map((f) => [f.criterion, f]),
      );
      for (const f of rows) {
        const base: BaseFeature = must(
          mine.get(f.criterion),
          `feature ${f.criterion}`,
        );
        const row = toRow(f);
        const dotVisible =
          row.grade === "confirmed" || row.grade === "reported";
        const differs = base.value !== row.value || base.status !== row.status;
        if (!differs) {
          const grade: Grade = dotVisible ? row.grade! : "established";
          const merged = dotVisible
            ? uniq([...base.source_ids, ...row.source_ids])
            : base.source_ids;
          const patch: Partial<Feature> = { grade };
          if (merged.length !== base.source_ids.length)
            patch.source_ids = merged;
          patches[f.criterion] = patch;
          merged.forEach((s) => referencedBySlots.add(s));
          continue;
        }
        const record = (
          decision: Change["decision"],
          grade: Grade,
          note: string,
        ) =>
          log.changes.push({
            variant: id,
            kind: "feature",
            key: f.criterion,
            decision,
            old: base.value,
            new: row.value,
            oldStatus: base.status,
            newStatus: row.status,
            grade,
            dotGrade: f.buyerGrade ?? null,
            sources: row.source_ids,
            note,
          });
        if (
          dotVisible &&
          row.source_ids.length > 0 &&
          row.status !== "not_verified"
        ) {
          const { criterion: _c, ...fields } = row;
          void _c;
          patches[f.criterion] = fields;
          row.source_ids.forEach((s) => referencedBySlots.add(s));
          record(
            "adopted",
            row.grade!,
            "Dot's row is confirmed/reported with its own sources.",
          );
        } else if (row.grade === "check" && row.source_ids.length > 0) {
          patches[f.criterion] = { grade: "check" };
          record(
            "kept_downgraded",
            "check",
            "Dot's sourced row conflicts and is graded Check: the app's row is kept but no longer treated as verified.",
          );
        } else {
          patches[f.criterion] = { grade: "established" };
          record(
            row.status === "not_verified" ? "kept_dot_empty" : "kept",
            "established",
            "Dot's row is not better graded than the app's: the app's row is kept.",
          );
        }
        base.source_ids.forEach((s) => referencedBySlots.add(s));
      }
      // Any app row Dot did not return stays established.
      for (const [crit] of mine) patches[crit] ??= { grade: "established" };
      out.feature_patches[id] = patches;
      for (const [crit, p] of Object.entries(patches)) {
        const b = mine.get(crit)!;
        const status = (p.status ?? b.status) as Status;
        stats.originalFeatureRows++;
        if (status === "not_verified") continue;
        if (
          !isVerifiedFact({ value: p.value ?? b.value, status, grade: p.grade })
        )
          stats.originalFeatureHidden.push({ variant: id, criterion: crit });
      }
      for (const p of Object.values(patches))
        stats.featuresByGrade[p.grade ?? "unrated"] =
          (stats.featuresByGrade[p.grade ?? "unrated"] ?? 0) + 1;
    } else {
      const mapped = rows.map(toRow);
      const placeholders = mapped.filter(isPlaceholder);
      const sig = (r: FeatureRow) =>
        stable([
          r.conditions,
          r.evidence_scope,
          r.last_evidence_date,
          r.reviewed_date,
          r.verification_state,
        ]);
      const common = new Map<string, number>();
      for (const r of placeholders)
        common.set(sig(r), (common.get(sig(r)) ?? 0) + 1);
      const best = [...common.entries()].sort((a, b) => b[1] - a[1])[0];
      const def = best
        ? placeholders.find((r) => sig(r) === best[0])!
        : undefined;
      const fallbackFeatureDate = def?.last_evidence_date ?? fallbackDate;
      const defaults: FeatureDefault = {
        value: "Needs confirmation",
        conditions:
          def?.conditions ?? "Exact-version equipment research pending.",
        evidence_scope:
          def?.evidence_scope ?? "AU exact version; research pending",
        verification_state: def?.verification_state ?? "unverified",
        date: fallbackFeatureDate,
      };
      out.feature_defaults[id] = defaults;
      const stored = mapped.filter(
        (r) => !(isPlaceholder(r) && sig(r) === best?.[0]),
      );
      stats.placeholderRows += mapped.length - stored.length;
      stats.storedRows += stored.length;
      out.features[id] = stored;
      for (const r of mapped)
        stats.featuresByGrade[r.grade ?? "unrated"] =
          (stats.featuresByGrade[r.grade ?? "unrated"] ?? 0) + 1;
      stored.forEach((r) =>
        r.source_ids.forEach((s) => referencedBySlots.add(s)),
      );
    }

    /* eligibility ---------------------------------------------- */
    const el = dv.eligibility;
    if (!original) {
      const isDefault =
        el.documented_family_minimum === null &&
        !el.exact_total &&
        (el.source_ids ?? []).length === 0 &&
        /No exact-trim software-update history/.test(el.scope);
      if (!isDefault) {
        out.eligibility.push({
          ...el,
          variant_id: id,
          source_ids: src(el.source_ids),
        });
        src(el.source_ids).forEach((s) => referencedBySlots.add(s));
      }
    }

    /* variant record -------------------------------------------- */
    const factValue = (k: string) => normByKey.get(k)!.value;
    if (original) {
      const patch: Partial<Variant> = {};
      const mine = baseVariants.get(id)!;
      const ev = dv.availabilityEvidence as
        { sourceIds?: string[]; checkedAt?: string } | undefined;
      if (dv.availability !== mine.record_state && ev?.sourceIds?.length) {
        patch.record_state = dv.availability;
        // The provisional label in the trim name goes with the provisional state.
        if (
          mine.record_state === "announced_provisional" &&
          /\(provisional\)/.test(mine.trim)
        )
          patch.trim = mine.trim.replace(/\s*\(provisional\)/, "");
        log.changes.push({
          variant: id,
          kind: "variant",
          key: "record_state",
          decision: "availability",
          old: mine.record_state,
          new: dv.availability,
          grade: "reported",
          dotGrade: null,
          sources: src(ev.sourceIds),
          note: `Availability checked ${ev.checkedAt}; Dot's order/stock status: ${(dv.availabilityEvidence as { orderStatus?: string }).orderStatus}.`,
        });
        src(ev.sourceIds).forEach((s) => referencedBySlots.add(s));
      }
      for (const sf of SCALAR_FIELDS) {
        if (mine[sf.field] !== undefined && mine[sf.field] !== null) continue;
        const hit = scalarFrom(dv, sf);
        if (hit !== undefined) {
          patch[sf.field] = hit.value;
          stats.scalarFilled++;
          log.changes.push({
            variant: id,
            kind: "variant",
            key: sf.field,
            decision: "filled",
            old: null,
            new: hit.value,
            grade: hit.grade,
            dotGrade: hit.grade,
            sources: hit.sources,
          });
        }
      }
      if (Object.keys(patch).length) out.variant_patches[id] = patch;
    } else {
      const model = dot.models.find((m) => m.id === dv.modelId)!;
      const variantSources = uniq([
        ...Object.values(factPatches).flatMap((p) => p.sourceIds ?? []),
        ...(out.features[id] ?? []).flatMap((r) => r.source_ids),
      ]);
      const v: Variant = {
        id,
        model_id: dv.modelId,
        brand: dv.brand,
        model: displayModel,
        trim: displayTrim,
        vehicle_class: cls,
        model_year: dv.year ?? "Model year unverified",
        record_state: dv.availability,
        drive: normaliseDrive(dv.drive),
        price_aud: factValue("price_aud") as number | null,
        price_basis: factPatches.price_aud.basis!,
        range_km: factValue("range_km") as number | null,
        range_cycle: factPatches.range_km.comparisonBasis!,
        seats: factValue("seats") as number,
        source_ids: variantSources,
        notes: [],
        variant_review_date:
          maxDate([
            modeDate,
            ...Object.values(factPatches).map((p) => p.date ?? ""),
          ]) || AS_OF,
        specification_evidence_date: modeDate,
        availability_scope: modeScope,
      };
      if (dv.generation && dv.generation !== model.generation)
        v.generation = dv.generation;
      for (const sf of SCALAR_FIELDS) {
        const hit = scalarFrom(dv, sf);
        if (hit && (hit.grade === "confirmed" || hit.grade === "reported")) {
          v[sf.field] = hit.value;
          stats.scalarFilled++;
        }
      }
      out.variants.push(v);
      out.trim_equipment.push({
        variant_id: id,
        source_ids: [],
        seats: factValue("seats"),
        evidence_date: v.variant_review_date,
      });
    }

    /* archive: variant meta ------------------------------------- */
    archive.variantMeta[id] = {
      dotId: dv.id,
      class: cls,
      researchStage: dv.researchStage,
      tier: dv.tier,
      isOnSale: dv.isOnSale,
      isTier1OnSale: dv.isTier1OnSale,
      buyerAvailability: dv.buyerAvailability,
      availability: stripEvidence(dv.availabilityEvidence, src),
      drive: dv.drive ?? null,
      summary: stripSummary(dv.buyerSummary, src),
    } as Json;
    if (dv.configurationEvidence)
      archive.configurationEvidence[id] = stripConfiguration(
        dv.configurationEvidence,
      ) as Json;
  }

  /* ---- models ---- */
  for (const m of dot.models) {
    if (!usedModels.has(m.id) || baseModels.has(m.id)) continue;
    const rec: {
      id: string;
      brand: string;
      model: string;
      generation?: string;
    } = { id: m.id, brand: m.brand, model: fixModelName(m.model) };
    if (m.generation) rec.generation = m.generation;
    out.models.push(rec);
  }

  /* ---- offers that carry an end date: the row records it, and the data layer stops counting it after that day ---- */
  for (const e of expiryRows) {
    const row =
      out.features[e.id]?.find((r) => r.criterion === e.criterion) ??
      out.feature_patches[e.id]?.[e.criterion];
    if (row) row.valid_until = e.until;
  }

  /* ---- names that are still identical: the model year tells them apart ---- */
  const sameName = new Map<string, Variant[]>();
  const nameOf = (v: { brand: string; model: string; trim: string }) =>
    [v.brand, v.model, v.trim]
      .join("|")
      .toLowerCase()
      .replace(/[^a-z0-9|]+/g, "");
  for (const v of baseResearch.variants)
    sameName.set(nameOf(v), [...(sameName.get(nameOf(v)) ?? []), v]);
  for (const v of out.variants)
    sameName.set(nameOf(v), [...(sameName.get(nameOf(v)) ?? []), v]);
  const renamedByYear: { variant: string; from: string; to: string }[] = [];
  for (const members of sameName.values()) {
    if (members.length < 2) continue;
    for (const v of members) {
      if (baseVariants.has(v.id)) continue;
      const y = rawMy.get(v.id) ?? yearOf(v.model_year, [v.model_id]);
      if (y == null) continue;
      const to = `${v.trim} (${myLabel(y)})`;
      renamedByYear.push({ variant: v.id, from: v.trim, to });
      v.trim = to;
    }
  }

  const countBy = <T>(xs: T[], f: (x: T) => string) =>
    Object.fromEntries(
      Object.entries(
        xs.reduce<Record<string, number>>((m, x) => {
          m[f(x)] = (m[f(x)] ?? 0) + 1;
          return m;
        }, {}),
      ).sort((a, b) => b[1] - a[1]),
    );
  extraLog.naming = {
    rule: "Trims lose the advertisement or sheet text they were read from, a repeat of the model name, and a model year that the model_year field already holds; a trim that was only the model name becomes 'Base' plus the drive. Model names keep the maker's Australian styling (BYD ATTO / DOLPHIN / SEAL, Hyundai IONIQ / KONA, Cadillac LYRIQ, smart #1); the original 34 keep their own spelling (e.g. Sealion 7). Only 'GLC electric' was respelled. Trims that are still identical for the same brand and model get '(MYnn)' from their model year. Ids and slugs are built from Dot's raw trim and do not change.",
    modelRespelled: MODEL_SPELLING,
    trimChanges: Object.fromEntries(
      Object.entries(nameLog).map(([why, rows]) => [
        why,
        { count: rows.length, examples: rows.slice(0, 5) },
      ]),
    ),
    renamedByModelYear: renamedByYear,
  };
  extraLog.recordStateDecisions = {
    rule: "A current version is set outgoing when a newer model year of the same brand, model and trim is current and nothing shows the older one still sold new (stockStatus new_stock_listed or a sourced dealer advertisement). Otherwise it stays current and the names carry the model year.",
    changed: stateDecisions,
    duplicateNameGroups: namedPairs,
  };
  extraLog.manualCorrections = {
    file: "data/manual-corrections.json",
    applied: appliedFixes,
  };
  extraLog.confirmedGradeRule = {
    rule: "Confirmed needs a maker, regulator or independent test-authority source (src/lib/source-types.ts CONFIRMING_SOURCE_TYPES); other confirmed facts become Reported.",
    downgraded: log.confirmedDowngrades.length,
    bySourceTypes: countBy(log.confirmedDowngrades, (d) =>
      d.sourceTypes.join("+"),
    ),
    facts: log.confirmedDowngrades,
  };
  extraLog.priceLabelled = {
    rule: "Prices on announced (not yet on sale) versions and on outgoing versions with no order confirmation say 'Announced' or 'Last listed' in their basis and carry a qualification.",
    count: log.priceLabelled.length,
    byKind: countBy(log.priceLabelled, (d) => d.kind),
    variants: log.priceLabelled,
  };
  extraLog.offersWithEndDate = {
    rule: "Rows with a validUntil date store it as valid_until; src/lib/verification.ts isExpiredOffer hides them from that date.",
    rows: expiryRows,
  };

  /* ---- sources: app vs archive ---- */
  out.sources = keptSources.filter((s) => referencedBySlots.has(s.id));
  const archiveSources = keptSources.filter(
    (s) => !referencedBySlots.has(s.id),
  );

  /* ---- checks ---- */
  const known = new Set([...baseSources, ...keptSources.map((s) => s.id)]);
  const missing = new Set<string>();
  const check = (ids: string[]) =>
    ids.forEach((i) => !known.has(i) && missing.add(i));
  for (const fs_ of Object.values(out.facts))
    for (const p of Object.values(fs_)) check(p.sourceIds ?? []);
  for (const rs of Object.values(out.features))
    for (const r of rs) check(r.source_ids);
  for (const ps of Object.values(out.feature_patches))
    for (const p of Object.values(ps)) check(p.source_ids ?? []);
  check(sourceTable);
  for (const e of out.eligibility) check(e.source_ids);
  for (const v of out.variants) check(v.source_ids);
  if (missing.size)
    throw new Error(
      `Unresolvable source ids: ${[...missing].slice(0, 10).join(", ")}`,
    );
  const appSourceIds = new Set([
    ...baseSources,
    ...out.sources.map((s) => s.id),
  ]);
  const archiveOnly = new Set(archiveSources.map((s) => s.id));
  // Anything in the app overlay must resolve inside the app's own source list.
  for (const fs_ of Object.values(out.facts))
    for (const p of Object.values(fs_))
      for (const i of p.sourceIds ?? [])
        if (!appSourceIds.has(i))
          throw new Error(`App content cites archive-only source ${i}`);
  for (const rs of Object.values(out.features))
    for (const r of rs)
      for (const i of r.source_ids)
        if (!appSourceIds.has(i))
          throw new Error(`App content cites archive-only source ${i}`);
  for (const v of out.variants)
    v.source_ids = v.source_ids.filter((i) => appSourceIds.has(i));

  /* ---- write ---- */
  const dir = "data/research-archive";
  const summary = buildSummary({
    dot,
    out,
    stats,
    archive,
    archiveSources,
    sourceAlias,
    keptSources,
    idMap,
    baseVariants,
  });
  if (dry) {
    console.log(JSON.stringify(summary.counts, null, 2));
    console.log("warnings:", log.warnings.length, log.warnings.slice(0, 15));
    return;
  }
  writeJson(IMPORT_FILE, out);
  writeJson(`${dir}/extra-facts.json`, {
    about:
      "Dot fact keys that have no slot in the app. variants[<app id>][<key>] = [value, unit, basis (index into strings), status, grade, date, sources (indexes into sourceIds), qualifications (indexes into strings)]. Source ids resolve in data/research-import-2026-10-16.json, the earlier data files or sources-archive.json.",
    columns: [
      "value",
      "unit",
      "basis",
      "status",
      "grade",
      "date",
      "sources",
      "qualifications",
    ],
    strings: archive.strings,
    sourceIds: sourceTable,
    variants: archive.facts,
  });
  writeJson(`${dir}/feature-extras.json`, {
    about:
      "Evidence locators and expiry dates attached to equipment rows: variant -> criterion -> fields.",
    rows: archive.featureExtras,
  });
  writeJson(`${dir}/variant-meta.json`, {
    about:
      "Per-variant research metadata with no app slot: Dot's id, tier and on-sale flags, availability evidence, buyer strength/trade-off.",
    variants: archive.variantMeta,
  });
  writeJson(`${dir}/price-evidence.json`, {
    about:
      "How each price was chosen (Dot's rung 1-6 ladder): variant -> evidence. Ranking flags are Dot's rules, not market facts.",
    variants: archive.priceEvidence,
  });
  writeJson(`${dir}/configuration-evidence.json`, {
    about:
      "Source-record identity and projection scope for variants built from a maker configuration record.",
    variants: archive.configurationEvidence,
  });
  writeJson(`${dir}/sources-archive.json`, {
    about:
      "Sources cited only by archived content (not by any value the app displays). Same format as the app's sources.",
    sources: archiveSources,
  });
  writeJson(`${dir}/id-map.json`, {
    about:
      "Dot variant id -> app variant id (identical for the original 34) and Dot source id -> canonical id for sources merged by URL.",
    variants: Object.fromEntries([...idMap].filter(([d, a]) => d !== a)),
    sources: Object.fromEntries(sourceAlias),
  });
  writeJson(`${dir}/change-log-original-34.json`, {
    about:
      "Every divergence between the app's values for its original 34 variants and Dot's, with the decision taken.",
    changes: log.changes,
  });
  writeJson(`${dir}/hidden-facts.json`, {
    about:
      "Facts that carry a value but are not verified (grade check, not_published, unrated), counted by class; plus the original 34 variants' hidden facts and equipment rows.",
    summary: summary.hidden,
    originalHidden: stats.originalHidden,
    originalHiddenEquipmentRows: stats.originalFeatureHidden,
  });
  writeJson(`${dir}/mapping-log.json`, summary.mappingLog);
  copyExtra(
    path.join(exportDir, "research-extra"),
    `${dir}/extra`,
    idMap,
    sourceAlias,
  );
  fs.writeFileSync(
    `${dir}/change-log-original-34.md`,
    changeLogMarkdown(log.changes, baseCars),
  );
  fs.writeFileSync(`${dir}/README.md`, archiveReadme());
  fs.writeFileSync(
    `${dir}/IMPORT-REPORT.md`,
    reportMarkdown(summary, exportDir, archiveOnly.size),
  );
  console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log(JSON.stringify(summary.counts, null, 2));
}

/* ------------------------------------------------------------------ */
/* Scalars, archive helpers                                             */
/* ------------------------------------------------------------------ */
function maxDate(ds: string[]): string {
  return ds.filter(Boolean).sort().at(-1) ?? "";
}
function scalarFrom(
  dv: DotVariant,
  sf: (typeof SCALAR_FIELDS)[number],
): { value: number | string; grade: Grade; sources: string[] } | undefined {
  for (const key of sf.keys) {
    const f = dv.facts[key];
    if (!f || f.value === null || f.value === undefined) continue;
    const grade = gradeOf(f.buyerGrade, "unrated");
    if (sf.kind === "text") {
      const t = cleanText(f.value);
      if (t) return { value: t, grade, sources: [...(f.sourceIds ?? [])] };
    } else {
      const m = String(f.value)
        .replace(/,/g, "")
        .match(/-?\d+(?:\.\d+)?/);
      if (m && typeof f.value !== "object")
        return {
          value: Math.round(Number(m[0]) * (sf.factor?.[key] ?? 1) * 100) / 100,
          grade,
          sources: [...(f.sourceIds ?? [])],
        };
    }
  }
  return undefined;
}
function stripEvidence(
  ev: Json | undefined,
  src: (ids: string[]) => string[],
): Json {
  if (!ev || typeof ev !== "object" || Array.isArray(ev)) return null;
  const o = ev as Record<string, Json>;
  return {
    checkedAt: o.checkedAt ?? null,
    orderStatus: o.orderStatus ?? null,
    stockStatus: o.stockStatus ?? null,
    physicalStockVerified: o.physicalStockVerified ?? null,
    factoryOrderAcceptanceVerified: o.factoryOrderAcceptanceVerified ?? null,
    qualifications: cleanList(o.qualifications),
    sourceIds: src((o.sourceIds as string[]) ?? []),
  };
}
function stripSummary(
  s: Json | undefined,
  src: (ids: string[]) => string[],
): Json {
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  const o = s as Record<string, Json>;
  const part = (p: Json | undefined) => {
    if (!p || typeof p !== "object" || Array.isArray(p)) return null;
    const x = p as Record<string, Json>;
    return {
      label: x.label ?? null,
      text: x.text ?? null,
      sourceIds: src((x.sourceIds as string[]) ?? []),
    };
  };
  return {
    strength: part(o.strength),
    tradeoff: part(o.tradeoff),
    conditions: Array.isArray(o.conditions) ? cleanList(o.conditions) : [],
  };
}
const PROVENANCE_KEYS =
  /sha256|hash|path|artifact|manifest|digest|frozen|capture|receipt|overlayId|gradeReview|sourceBoundary|anchors|ledger/i;
/** Machinery of Dot's projection (contracts, null guards, boundaries) is dropped; identity, scope and options stay. */
const CONFIGURATION_MACHINERY =
  /^(projectionContract|requiredNulls|availabilityEvidenceBoundaries|pricingBoundary|chargingBoundary|rankingEligible|completeVehicleCountEligible|countContribution|fullSourceAnchorRegistry|researchHoldMappings|fullOriginalFactRegistry|fullOriginalFields)$/;
function stripConfiguration(v: Json, top = true): Json {
  if (Array.isArray(v)) return v.map((x) => stripConfiguration(x, false));
  if (v && typeof v === "object") {
    const out: Record<string, Json> = {};
    for (const [k, x] of Object.entries(v)) {
      if (PROVENANCE_KEYS.test(k) || (top && CONFIGURATION_MACHINERY.test(k)))
        continue;
      out[k] = stripConfiguration(x, false);
    }
    return out;
  }
  return v;
}
function copyExtra(
  from: string,
  to: string,
  ids: Map<string, string>,
  sources: Map<string, string>,
) {
  const rewrite = (v: Json): Json => {
    if (typeof v === "string") return ids.get(v) ?? sources.get(v) ?? v;
    if (Array.isArray(v)) return v.map(rewrite);
    if (v && typeof v === "object") {
      const out: Record<string, Json> = {};
      for (const [k, x] of Object.entries(v)) {
        if (PROVENANCE_KEYS.test(k) && !/^(capturedAt|captureDate)$/.test(k))
          continue;
        out[ids.get(k) ?? k] = rewrite(x);
      }
      return out;
    }
    return v;
  };
  fs.rmSync(to, { recursive: true, force: true });
  fs.mkdirSync(to, { recursive: true });
  for (const f of fs.readdirSync(from)) {
    const p = path.join(from, f);
    // sources.json is replaced by the deduplicated source lists; the README is rewritten by the importer.
    // selling-points.json is the same text as variant-meta.json's summaries.
    if (
      f === "sources.json" ||
      f === "README.md" ||
      f === "selling-points.json"
    )
      continue;
    if (fs.statSync(p).isDirectory()) {
      fs.mkdirSync(path.join(to, f), { recursive: true });
      const combined: Record<string, Json> = {};
      for (const g of fs.readdirSync(p))
        combined[g.replace(/\.json$/, "")] = rewrite(
          readJson<Json>(path.join(p, g)),
        );
      writeJson(path.join(to, `${f}.json`), combined);
      fs.rmSync(path.join(to, f), { recursive: true, force: true });
    } else if (f.endsWith(".json")) {
      writeJson(path.join(to, f), rewrite(readJson<Json>(p)));
    }
  }
}

/* ------------------------------------------------------------------ */
/* Report                                                               */
/* ------------------------------------------------------------------ */
type Summary = ReturnType<typeof buildSummary>;
function buildSummary(a: {
  dot: Dot;
  out: ResearchImport;
  stats: {
    perClass: Record<
      string,
      {
        variants: number;
        facts: number;
        visible: number;
        hidden: number;
        empty: number;
      }
    >;
    byGrade: Record<string, number>;
    originalHidden: {
      variant: string;
      key: string;
      value: unknown;
      grade: string;
      reason: string;
    }[];
    originalFacts: number;
    originalVisible: number;
    originalFeatureRows: number;
    originalFeatureHidden: { variant: string; criterion: string }[];
    scalarFilled: number;
    slotFilled: number;
    placeholderRows: number;
    storedRows: number;
    extraFacts: number;
    extraKeys: Set<string>;
    featuresByGrade: Record<string, number>;
  };
  archive: { facts: Record<string, Record<string, Json>>; strings: string[] };
  archiveSources: Source[];
  sourceAlias: Map<string, string>;
  keptSources: Source[];
  idMap: Map<string, string>;
  baseVariants: Map<string, Variant>;
}) {
  const newVariants = a.out.variants.length;
  const byBrand = new Map<
    string,
    { n: number; noPrice: number; noRange: number }
  >();
  const priceOf = (v: Variant) => v.price_aud;
  for (const v of a.out.variants) {
    const b = byBrand.get(v.brand) ?? { n: 0, noPrice: 0, noRange: 0 };
    b.n++;
    if (priceOf(v) === null) b.noPrice++;
    if (v.range_km === null) b.noRange++;
    byBrand.set(v.brand, b);
  }
  const counts = {
    variantsTotal: a.baseVariants.size + newVariants,
    variantsOriginal: a.baseVariants.size,
    variantsNew: newVariants,
    modelsNew: a.out.models.length,
    factsStoredForSlots: Object.values(a.out.facts).reduce(
      (n, f) => n + Object.keys(f).length,
      0,
    ),
    extraFactsArchived: a.stats.extraFacts,
    extraFactKeys: a.stats.extraKeys.size,
    slotFilledFromAliases: a.stats.slotFilled,
    scalarFieldsFilled: a.stats.scalarFilled,
    equipmentRowsStored: a.stats.storedRows,
    equipmentRowsDefaulted: a.stats.placeholderRows,
    sourcesInApp: a.out.sources.length,
    sourcesInArchive: a.archiveSources.length,
    sourcesMergedByUrl: a.sourceAlias.size,
    changesLogged: log.changes.length,
  };
  const hidden = {
    perClass: a.stats.perClass,
    byGrade: a.stats.byGrade,
    original: {
      facts: a.stats.originalFacts,
      visible: a.stats.originalVisible,
      hidden: a.stats.originalHidden.length,
      equipmentRows: a.stats.originalFeatureRows,
      equipmentRowsHidden: a.stats.originalFeatureHidden.length,
    },
    featuresByGrade: a.stats.featuresByGrade,
  };
  const mappingLog = {
    about:
      "How Dot's data was mapped. keyDisposition lists every Dot fact key that has no slot (count of variants carrying it).",
    slots: SLOT_UNITS,
    slotFill: SLOT_FILL,
    variantScalars: SCALAR_FIELDS.map((s) => ({
      field: s.field,
      from: s.keys,
    })),
    unitConversions: Object.fromEntries(log.unitConversions),
    slotFilledFrom: Object.fromEntries(log.slotFill),
    strings: log.strings,
    warrantiesWithExtraTerms: log.warrantyComplex,
    droppedProcessSentences: {
      basisOrConditions: log.droppedText,
      qualifications: log.droppedQualifications,
    },
    ...extraLog,
    readerTextCleanup: {
      about:
        "Text removed or rewritten by src/lib/reader-text.ts (locators, API paths, JSON, snake_case field names, researcher instructions, long qualifications). Counts are occurrences processed, including archive text; examples are before -> after.",
      byRule: Object.fromEntries(textCleanup),
    },
    warnings: log.warnings,
    sourceTypeMap: Object.fromEntries([...log.sourceTypeMap].sort()),
    keyDisposition: Object.fromEntries(
      [...log.keyDisposition].sort((x, y) => y[1].count - x[1].count),
    ),
  };
  return {
    counts,
    hidden,
    mappingLog,
    byBrand,
    originalHidden: a.stats.originalHidden,
    originalFeatureHidden: a.stats.originalFeatureHidden,
  };
}
function changeLogMarkdown(
  changes: Change[],
  cars: Map<string, { brand: string; model: string; trim: string }>,
): string {
  const label = (id: string) => {
    const c = cars.get(id);
    return c ? `${c.brand} ${c.model} ${c.trim}` : id;
  };
  const delta = (c: Change) =>
    typeof c.old === "number" && typeof c.new === "number" && c.old !== 0
      ? ` (${c.new > c.old ? "+" : ""}${(((c.new - c.old) / c.old) * 100).toFixed(1)}%)`
      : "";
  const cell = (v: unknown) =>
    v === null || v === undefined
      ? "none"
      : String(typeof v === "object" ? JSON.stringify(v) : v)
          .replace(/\|/g, "/")
          .slice(0, 90);
  const decisions: Change["decision"][] = [
    "adopted",
    "filled",
    "kept_downgraded",
    "availability",
    "kept_dot_empty",
    "kept",
  ];
  let md =
    "# Changes to the original 34 variants\n\nGenerated by `scripts/import-dot-research.ts`. Decisions: `adopted` (Dot's value used: confirmed/reported and sourced), `filled` (the app had no value), `kept_downgraded` (the app's value kept, but Dot found a sourced conflict so it is graded Check and hidden), `kept` / `kept_dot_empty` (the app's value kept; Dot's was not better graded or empty), `availability` (record state updated).\n\n";
  for (const d of decisions) {
    const rows = changes.filter(
      (c) => c.decision === d && c.kind !== "feature",
    );
    const feats = changes.filter(
      (c) => c.decision === d && c.kind === "feature",
    );
    if (!rows.length && !feats.length) continue;
    md += `## ${d} (${rows.length} facts/fields, ${feats.length} equipment rows)\n\n| Variant | Slot | Old | New | Dot grade | Sources |\n|---|---|---|---|---|---|\n`;
    for (const c of [...rows, ...feats])
      md += `| ${label(c.variant)} | ${c.kind === "feature" ? "equipment: " : ""}${c.key} | ${cell(c.old)} | ${cell(c.new)}${delta(c)} | ${c.dotGrade ?? "-"} | ${c.sources.slice(0, 3).join(", ")}${c.sources.length > 3 ? ` +${c.sources.length - 3}` : ""} |\n`;
    md += "\n";
  }
  return md;
}
function archiveReadme(): string {
  return `# Research archive

Everything from the 2026-10-16 research import that has no slot in the app, plus the logs that show how the rest was mapped. Nothing here is read by the app at run time. Regenerate with \`node --import tsx scripts/import-dot-research.ts <export-dir>\`.

| File | Content |
|---|---|
| \`IMPORT-REPORT.md\` | Slot mapping table, counts, change log summary, hidden-fact statistics, open gaps. Start here. |
| \`change-log-original-34.md\` / \`.json\` | Every divergence on the original 34 variants (old -> new, grade, sources, decision). |
| \`hidden-facts.json\` | Facts with a value that the verification helper hides, by class, and the original 34 variants' hidden facts. |
| \`mapping-log.json\` | Unit conversions, text clean-up counts, warnings, source type mapping, naming, record-state and grade decisions, applied corrections, disposition of every unmapped fact key. |
| \`../manual-corrections.json\` | Hand-checked corrections applied by the importer (variant, field, value or grade, sources, reason). Not generated. |
| \`id-map.json\` | Dot id -> app id for variants; merged source ids -> canonical id. |
| \`extra-facts.json\` | Fact keys with no app slot (dimensions variants, equipment flags, charging detail, ...), per variant, graded, with sources. Tuple layout described inside the file. |
| \`feature-extras.json\`, \`variant-meta.json\`, \`price-evidence.json\`, \`configuration-evidence.json\` | Evidence locators, availability evidence and strength/trade-off text, the price ladder choice per variant, configuration identity. |
| \`sources-archive.json\` | Sources cited only by archived content (same format as the app's sources). Source ids anywhere in the archive resolve in the app's source list, the earlier data files, or this file. |
| \`extra/\` | Dot's market research around the catalogue (market inventory, missing models and leads, per-brand reconciliation, price ladder, vehicle census, selling points, glossary, coverage report, brand packets, raw lead evidence). Minified; variant ids use the app's ids, source ids the canonical ids. Not re-verified. Unknown means unknown. |

Cautions carried over from the research: whole-market completeness was never established; \`listed_unconfirmed\` means a maker page exists, not that the car is orderable; flags such as \`rankingEligible\` are Dot's ranking rules, not facts.
`;
}
function pct(a: number, b: number) {
  return b ? `${((100 * a) / b).toFixed(1)}%` : "-";
}
function reportMarkdown(
  s: Summary,
  exportDir: string,
  archiveOnlySources: number,
): string {
  const c = s.counts;
  const ml = s.mappingLog as unknown as {
    readerTextCleanup: { byRule: Record<string, { count: number }> };
    naming: { rule: string };
    recordStateDecisions: { rule: string };
    manualCorrections: { applied: unknown[] };
    confirmedGradeRule: { rule: string; downgraded: number };
    priceLabelled: { rule: string; count: number };
    offersWithEndDate: { rule: string };
  };
  const classRows = Object.entries(s.hidden.perClass)
    .sort((x, y) => y[1].variants - x[1].variants)
    .map(
      ([k, v]) =>
        `| ${k} | ${v.variants} | ${v.facts} | ${v.visible} (${pct(v.visible, v.facts)}) | ${v.hidden} (${pct(v.hidden, v.facts)}) | ${v.empty} |`,
    )
    .join("\n");
  const orig = log.changes;
  const dec = (d: string) => orig.filter((x) => x.decision === d);
  const decF = (d: string) => dec(d).filter((x) => x.kind === "fact").length;
  const decE = (d: string) => dec(d).filter((x) => x.kind === "feature").length;
  const hiddenOrig = s.originalHidden;
  const noPrice = [...s.byBrand]
    .filter(([, b]) => b.noPrice)
    .sort((x, y) => y[1].noPrice - x[1].noPrice)
    .map(([k, b]) => `${k} ${b.noPrice}/${b.n}`)
    .join(", ");
  const noRange = [...s.byBrand]
    .filter(([, b]) => b.noRange)
    .sort((x, y) => y[1].noRange - x[1].noRange)
    .map(([k, b]) => `${k} ${b.noRange}/${b.n}`)
    .join(", ");
  const hiddenList = s.originalHidden
    .map(
      (h) =>
        `- ${h.variant} / ${h.key} = ${JSON.stringify(h.value)} (${h.reason})`,
    )
    .join("\n");
  return `# Import report: Dot research into the app's data slots

Generated by \`scripts/import-dot-research.ts\` from \`${path.basename(exportDir)}\` (Dot's "Ford32" cut, evidence 2026-10-05 to 2026-10-16). Structural normalisation only: no value was re-verified.

## What was loaded

- ${c.variantsTotal} variants: the original ${c.variantsOriginal} plus ${c.variantsNew} new, in ${c.modelsNew} new model/generation records. The app's ids, slugs and routes are unchanged for the original 34; new ids follow \`<model_id>__<trim_slug>__<n>\` (Dot's date-suffixed and two-part ids are rewritten; the old ids are in \`id-map.json\`). No (family, slug) route repeats.
- ${c.factsStoredForSlots} facts in the app's 22 fact slots (every variant has all 22; unknown is null, never zero).
- ${c.equipmentRowsStored} stored equipment rows for the new variants; ${c.equipmentRowsDefaulted} rows that are still "needs confirmation" are not stored and expand from a per-variant default. Every variant has all 69 criteria.
- ${c.sourcesInApp} new sources in the app (deduplicated by URL: ${c.sourcesMergedByUrl} duplicate ids merged), ${c.sourcesInArchive} more in \`sources-archive.json\` (cited only by archived content). The original 424 sources are unchanged apart from \`source_type\`, which \`data.ts\` maps onto the eight-value vocabulary of \`src/lib/source-types.ts\`.
- ${c.extraFactsArchived} facts under ${c.extraFactKeys} further fact keys went to \`extra-facts.json\`; ${c.slotFilledFromAliases} of them also filled an empty slot, ${c.scalarFieldsFilled} filled an existing variant-record field.

## New slots (only two)

| Slot | Where | Values |
|---|---|---|
| Vehicle class | \`Variant.vehicle_class\`, \`Car.vehicleClass\` | passenger, ute, van, truck, bus, motorcycle (the original 34 are passenger) |
| Verification grade | \`Fact.grade\`, \`Feature.grade\` | confirmed, reported, established (original 34, not contradicted), check, not_published, unrated |

\`isVerifiedFact()\` in \`src/lib/verification.ts\` is the single definition of visible: a value, status not \`not_verified\`, and grade confirmed, reported or established.

## Slot mapping

| Dot field | App slot | Conversion |
|---|---|---|
| \`facts.price_aud\` | \`price_aud\` (AUD) | rounded to whole dollars (${log.strings.rounded} values had cents); comparison basis canonicalised to "List price before on-road costs" or "Driveaway price" |
| \`facts.range_km\` | \`range_km\` (km) | comparison basis canonicalised to WLTP / WLTP combined / WLTP target / NEDC combined / ADR 81/02 |
| \`facts.seats\` | \`seats\` | integer; basis "Seating positions" |
| \`facts.dc_charge_time_min\` | \`dc_charge_time_min\` (min) | hours x 60; published ranges kept as text ("25–30 min", unit empty) as the app already does; basis canonicalised to the SoC window and charger kW |
| \`facts.ac_kw\`, \`dc_peak_kw\` | same (kW) | multi-figure text ("205 (CarExpert); 206 (JATO)") keeps the first number and the original text as a qualification |
| \`facts.battery_kwh\` | \`battery_kwh\` (kWh) | basis canonicalised to Usable / Gross / Gross or usable not stated; empty slots filled from \`battery_usable_kwh\` / \`battery_gross_kwh\` |
| \`facts.boot_l\`, \`frunk_l\`, \`max_total_cargo_l\` | same (L) | none needed |
| \`facts.zero_to_100_s\` | \`zero_to_100_s\` (s) | none needed |
| \`facts.length_mm\`, \`width_mm\`, \`height_mm\`, \`wheelbase_mm\`, \`ground_clearance_mm\` | same (mm) | ground clearance given as high/medium/low keeps the lowest setting and the rest as a qualification |
| \`facts.towing_braked_kg\`, \`towing_unbraked_kg\`, \`kerb_weight_kg\` | same (kg) | "Not approved for towing" becomes 0 kg; empty kerb weight filled from \`kerb_mass_kg\` / \`tare_mass_kg\` / \`tare_weight_kg\` / \`unladen_mass_kg\` (basis stated) |
| \`facts.turning_circle_m\` | \`turning_circle_m\` (m) | none needed |
| \`facts.warranty\`, \`battery_warranty\` | same (text) | rewritten to "N years / unlimited km" or "N years / 160,000 km"; ${s.mappingLog.warrantiesWithExtraTerms} warranties with private/commercial or capacity clauses keep the full published wording as a qualification |
| fact \`status\` | \`Fact.status\` | value null forces not_verified; a value with not_verified becomes conditional |
| fact \`buyerGrade\` | \`Fact.grade\` | confirmed, reported, check, not_published kept; missing = unrated |
| \`drive\` | \`Variant.drive\` | FWD / RWD / AWD; "rear-wheel drive eAxle", "rear driven axle", "RWD e-Axle", "rear-wheel drive" -> RWD, "ALLGRIP-e 4WD" -> AWD, anything unverified or ambiguous ("2WD", "Unverified", "Unknown") -> Unknown |
| \`power_kw\`, \`torque_nm\`, \`gvm_kg\`, \`battery_chemistry\`, \`top_speed_kmh\`, \`consumption\` | the variant record's existing fields | only confirmed/reported values, and only where the app's record is empty |
| \`year\` | \`model_year\` | null -> "Model year unverified" |
| \`vehicleClass\` | \`vehicle_class\` | as is (new slot) |
| \`availability\` | \`record_state\` | already the app's enum; the 3 changes on original variants are listed below |
| \`features[69]\` | \`feature_evidence\` | same 69 criteria; \`buyerGrade\` -> \`grade\`; grade reviews and publication rules dropped |
| \`eligibility\` | \`update_eligibility\` | stored only where it holds content, otherwise the "research pending" default |
| \`sources\` | \`sources\` | source_type mapped onto the app's vocabulary (manufacturer, authorised_dealer, industry_reporting, regulator, independent_test, independent_database, firsthand_owner_report, other); market "Australia" -> "AU"; hashes, capture paths and retrieval machinery dropped; duplicates merged by URL |
| 28k+ other fact keys, \`buyerSummary\`, \`availabilityEvidence\`, \`priceEvidence\`, \`configurationEvidence\`, tier flags | archive | see \`README.md\` |
| \`gradeReview\`, \`sourceBoundary\`, hashes, receipts, review chains | not carried | process provenance |

Instruction-style sentences written for Dot's researchers ("Do not ...") were dropped from basis and qualification text: ${s.mappingLog.droppedProcessSentences.basisOrConditions} basis/condition texts and ${s.mappingLog.droppedProcessSentences.qualifications} qualifications. Unit conversions applied: ${
    Object.keys(s.mappingLog.unitConversions).length
      ? Object.entries(s.mappingLog.unitConversions)
          .map(([k, v]) => `${k} (${v})`)
          .join("; ")
      : "none were needed (Dot already used the app's units)"
  }.

## Original 34 variants: change log

Rule: keep the app's value unless Dot's is confirmed or reported and has its own sources. Full list: \`change-log-original-34.md\`.

| Decision | Facts and fields | Equipment rows |
|---|---|---|
| adopted (Dot's value used) | ${decF("adopted")} | ${decE("adopted")} |
| filled (the app had no value) | ${decF("filled")} | ${decE("filled")} |
| kept, downgraded to Check (Dot found a sourced conflict) | ${decF("kept_downgraded")} | ${decE("kept_downgraded")} |
| kept, Dot's value not better graded | ${decF("kept")} | ${decE("kept")} |
| kept, Dot has no value | ${decF("kept_dot_empty")} | ${decE("kept_dot_empty")} |
| availability updated | ${dec("availability").length} | - |

Largest numeric changes adopted (more than 10%; check these first): ${
    orig
      .filter(
        (x) =>
          x.decision === "adopted" &&
          x.kind === "fact" &&
          typeof x.old === "number" &&
          typeof x.new === "number" &&
          Math.abs(x.new - x.old) > 0.1 * Math.abs(x.old),
      )
      .map((x) => `${x.variant} / ${x.key} ${x.old} -> ${x.new}`)
      .join("; ") || "none"
  }.

## Hidden unverified facts

Counted over facts that carry a value in the 22 slots. Hidden = grade check, not_published or unrated.

| Class | Variants | Facts with a value | Visible | Hidden | Empty slots |
|---|---|---|---|---|---|
${classRows}

Dot graded only passenger cars and utes (its "Tier 1"). Vans, trucks, buses and motorcycles carry no grade, so every value on them is \`unrated\` and hidden until someone grades it; the values are kept in the data. Passenger cars and utes are hidden where Dot graded the fact Check or left it ungraded.

All classes: ${Object.entries(s.hidden.byGrade)
    .map(([g, n]) => `${g} ${n}`)
    .join(", ")}.

**Original 34 variants:** ${s.hidden.original.facts} facts with a value, ${s.hidden.original.visible} stay visible, ${hiddenOrig.length} become hidden.
${hiddenList || "- none"}

**Original 34 variants, equipment rows:** ${s.hidden.original.equipmentRows} rows, ${s.originalFeatureHidden.length} with content become hidden because Dot found a sourced difference and graded its row Check (by criterion: ${
    Object.entries(
      s.originalFeatureHidden.reduce(
        (m, r) => ({ ...m, [r.criterion]: (m[r.criterion] ?? 0) + 1 }),
        {} as Record<string, number>,
      ),
    )
      .sort((x, y) => y[1] - x[1])
      .map(([k, n]) => `${k} ${n}`)
      .join(", ") || "none"
  }). The rows are listed in \`hidden-facts.json\`.

Equipment rows (all variants) by grade: ${Object.entries(
    s.hidden.featuresByGrade,
  )
    .map(([g, n]) => `${g} ${n}`)
    .join(", ")}.

## Data-quality pass (4 November 2026)

Applied by the importer, so a re-run reproduces it. Details and examples are in \`mapping-log.json\`.

- **Reader text.** \`src/lib/reader-text.ts\` drops source locators, API paths, JSON/dict text, snake_case field names and researcher instructions from basis, comparison basis, scope and qualifications, rewrites a few recoverable ones into plain sentences, and cuts qualifications to 400 characters at a sentence boundary. Rule counts: ${Object.entries(
    ml.readerTextCleanup.byRule,
  )
    .map(([k, v]) => `${k.replaceAll("_", " ")} ${v.count}`)
    .join(", ")}.
- **Scope.** A fact without its own scope now falls back to the variant's scope, then the model generation, then nothing; the words "undefined" and "null" never reach a page.
- **Names.** ${ml.naming.rule}
- **Model years.** ${ml.recordStateDecisions.rule}
- **Corrections.** ${ml.manualCorrections.applied.length} entries from \`data/manual-corrections.json\` (EV3 GT-Line AWD price and towing, Model 3 grades and clearance, ID.5 outgoing).
- **Grades and source types.** Source types use eight values. ${ml.confirmedGradeRule.rule} ${ml.confirmedGradeRule.downgraded} facts were downgraded.
- **Labelled prices.** ${ml.priceLabelled.rule} ${ml.priceLabelled.count} prices are labelled.
- **Expired offers.** ${ml.offersWithEndDate.rule}

## Open data gaps

- No price (null) among the ${c.variantsNew} new variants, by brand: ${noPrice || "none"}.
- No claimed range, by brand: ${noRange || "none"}.
- ${log.warnings.length} normalisation warnings (unexpected units or out-of-range values) are listed in \`mapping-log.json\`.
- New variants are research stage "partial": most equipment rows read "Needs confirmation" and software-update history is "Research pending".
- Whole-market completeness was never established (see \`extra/missing-models-and-leads.json\`).
- Archive-only sources: ${archiveOnlySources}.
`;
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
