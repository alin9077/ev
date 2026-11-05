/** Vocabulary shared by the refresh scaffold, packet builder and runbook. */
export const OUTCOMES = [
  "pending",
  "unchanged",
  "changed",
  "unavailable",
  "blocked",
] as const;
export type Outcome = (typeof OUTCOMES)[number];
/** Outcomes that leave a value and its check date exactly as they were. */
export const RETAINING_OUTCOMES: readonly Outcome[] = [
  "pending",
  "unavailable",
  "blocked",
];
export const FINDINGS_SCHEMA = "roadmark-refresh-findings-v1";
export const CHANGE_TYPES = [
  "price_changed",
  "price_added",
  "price_removed",
  "version_added",
  "version_withdrawn",
  "availability_changed",
  "range_changed",
  "warranty_changed",
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number];
export const REFRESH_PACKAGE_SCRIPTS = [
  "refresh:plan",
  "refresh:scaffold",
  "refresh:build",
  "refresh:snapshot",
  "refresh:diff",
] as const;
