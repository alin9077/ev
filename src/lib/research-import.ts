import fs from "node:fs";
import path from "node:path";
import type {
  Eligibility,
  Fact,
  Grade,
  Feature,
  Research,
  Source,
  Variant,
} from "./types";

/** File written by scripts/import-dot-research.ts; the app reads it as one more overlay. */
export const IMPORT_FILE = "data/research-import-2026-10-16.json";
/** Set to load only the supplied base data and the earlier overlays (used by the importer to read its baseline). */
export const SKIP_IMPORT_ENV = "EV_SKIP_RESEARCH_IMPORT";

/** Fields of a Fact the import may set; `grade` is always present. */
export type FactPatch = Partial<
  Omit<Fact, "key" | "label" | "issues" | "grade">
> & { grade: Grade };
export type FeatureRow = Omit<Feature, "variant_id" | "model_id">;
export type FeatureDefault = {
  value: string;
  conditions: string;
  evidence_scope: string;
  verification_state: string;
  date: string;
};
export type ResearchImport = {
  schema_version: string;
  import_id: string;
  as_of: string;
  /** New model/generation records (original 11 are unchanged). */
  models: Research["models"];
  /** The new variants, in the app's Variant schema. */
  variants: Variant[];
  /** Sourced updates to the original 34 variant records (availability only). */
  variant_patches: Record<string, Partial<Variant>>;
  trim_equipment: Research["trim_equipment"];
  /** Only the software-update records that hold content; the rest use the "research pending" default. */
  eligibility: Eligibility[];
  /** Equipment rows that are still "needs confirmation" are not stored; this is the row they expand to. */
  feature_defaults: Record<string, FeatureDefault>;
  /** New variants: stored equipment rows keyed variant id -> rows. */
  features: Record<string, FeatureRow[]>;
  /** Original 34 variants: variant id -> criterion -> fields that replace or grade the existing row. */
  feature_patches: Record<string, Record<string, Partial<Feature>>>;
  /** Every variant: variant id -> fact key -> fields that replace or grade the existing fact. */
  facts: Record<string, Record<string, FactPatch>>;
  sources: Source[];
};

let loaded: ResearchImport | null | undefined;
/** The research import overlay, or null when absent or disabled. */
export function loadImport(): ResearchImport | null {
  if (loaded !== undefined) return loaded;
  const file = path.join(process.cwd(), IMPORT_FILE);
  loaded =
    process.env[SKIP_IMPORT_ENV] || !fs.existsSync(file)
      ? null
      : (JSON.parse(fs.readFileSync(file, "utf8")) as ResearchImport);
  return loaded;
}
