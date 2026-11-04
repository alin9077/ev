export type Status =
  | "standard"
  | "conditional"
  | "not_verified"
  | "subjective"
  | "unavailable"
  | "optional"
  | "not_applicable";
/** Vehicle class: passenger cars are the original scope; the others arrive with the 2026-10-16 research import. */
export type VehicleClass =
  "passenger" | "ute" | "van" | "truck" | "bus" | "motorcycle";
/**
 * Per-fact verification grade.
 * confirmed / reported / check / not_published come from the importer's evidence grading;
 * established marks the original 34-variant values that were supplied with the app and not contradicted;
 * unrated marks facts that were never graded (hidden, like check and not_published).
 */
export type Grade =
  | "confirmed"
  | "reported"
  | "established"
  | "check"
  | "not_published"
  | "unrated";
export type Source = {
  id: string;
  url: string;
  title: string;
  publisher: string;
  source_type: string;
  published_date: string | null;
  accessed_date: string;
  market: string;
  supports: string;
  [key: string]: unknown;
};
export type Issue = {
  issue_id: string;
  title: string;
  priority: string;
  model_ids: string[];
  publication_action: string;
  source_ids: string[];
};
export type Feature = {
  variant_id: string;
  model_id: string;
  criterion: string;
  status: Status;
  value: string;
  conditions: string;
  source_ids: string[];
  evidence_scope: string;
  last_evidence_date: string;
  reviewed_date: string;
  verification_state: string;
  condition_label?: string;
  usability_notes?: string[];
  confirmation_needed?: string;
  /** Last day an offer holds (YYYY-MM-DD); after it the row stops counting as verified (see isExpiredOffer). */
  valid_until?: string;
  /** Verification grade; see isVerifiedFact in verification.ts. */
  grade?: Grade;
};
export type Variant = {
  id: string;
  model_id: string;
  brand: string;
  model: string;
  trim: string;
  model_year: number | string;
  /** Present on every variant after the research import; absent only in the immutable base file. */
  vehicle_class?: VehicleClass;
  record_state: string;
  price_aud: number | null;
  price_basis: string;
  range_km: number | null;
  range_cycle: string;
  seats: number;
  source_ids: string[];
  notes: string[];
  variant_review_date: string;
  [key: string]: unknown;
};
export type Eligibility = {
  variant_id: string;
  model_id: string;
  documented_family_minimum: number | null;
  exact_total_known: boolean;
  exact_total: number | null;
  scope: string;
  meaning: string;
  source_ids: string[];
  observation_window_start: string;
  observation_window_end: string;
};
export type UpdateEvent = {
  event_id: string;
  model_ids: string[];
  version: string | null;
  family_id: string;
  release_date: string | null;
  date_basis: string;
  delivery_method: string;
  category: string;
  changes: string[];
  source_ids: string[];
  notes: string;
  market: string;
  verification: string;
  variant_review_state: string;
  count_in_headline: boolean;
  unit: string;
  [key: string]: unknown;
};
export type Research = {
  schema_version: string;
  metadata: {
    as_of: string;
    baseline_variant_id: string;
    record_count: number;
    criterion_count: number;
    feature_row_count: number;
    [key: string]: unknown;
  };
  criteria: { key: string; label: string; group: string; definition: string }[];
  models: { id: string; brand: string; model: string; generation?: string }[];
  variants: Variant[];
  trim_equipment: {
    variant_id: string;
    source_ids: string[];
    [key: string]: unknown;
  }[];
  feature_evidence: Feature[];
  update_eligibility: Eligibility[];
  update_events: UpdateEvent[];
  configuration_history: {
    model_id: string;
    change: string;
    old: string;
    new: string;
    type: string;
    source_ids: string[];
  }[];
  sources: Source[];
  publication_issues: Issue[];
  prior_update_summary: unknown[];
};
export type Fact = {
  key: string;
  label: string;
  value: number | string | null;
  unit: string;
  basis: string;
  comparisonBasis: string;
  status: Status;
  sourceIds: string[];
  date: string;
  market: string;
  scope: string;
  qualifications: string[];
  issues: Issue[];
  /** Value resolved from a source other than the maker's Australian specification for this version. */
  resolvedElsewhere?: boolean;
  /** Verification grade; see isVerifiedFact in verification.ts. */
  grade?: Grade;
};
export type Car = {
  id: string;
  modelId: string;
  family: string;
  slug: string;
  brand: string;
  model: string;
  trim: string;
  generation: string;
  year: number | string;
  vehicleClass: VehicleClass;
  /** Set on selection-list entries whose specifications are all unverified (see coverage.ts). */
  unverified?: boolean;
  availability: string;
  drive: string;
  facts: Record<string, Fact>;
  issues: Issue[];
};
export type Pack = {
  car: Car;
  features: Feature[];
  eligibility: Eligibility;
  events: UpdateEvent[];
  configuration: Research["configuration_history"];
  sources: Source[];
};
export type Selection = {
  ids: string[];
  active: string;
  section: "overview" | "features" | "software";
  q: string;
  category: string;
  diff: boolean;
  priority: string;
  warning: string;
  dataset: string;
};
