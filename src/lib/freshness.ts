/** Evidence age changes labels and ranking eligibility, never the stored value. */
export type FreshnessWindow = 45 | 180 | 365;
const day = 86_400_000;
export function evidenceDateValue(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
  const parsed = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(parsed) &&
    new Date(parsed).toISOString().slice(0, 10) === value
    ? parsed
    : NaN;
}

/** Source-history fields use the same subject window as their public fact. */
export function freshnessWindowDays(key: string): FreshnessWindow {
  const name = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  if (
    /(^|_)(price|offer|offers|availability|stock|order_status|driveaway|rrp|msrp|mlp|mrlp)(_|$)/.test(
      name,
    )
  )
    return 45;
  if (/(^|_)equipment(_|$)/.test(name)) return 180;
  // Published cargo-volume bases often omit their unit from the key. These
  // measurement families deliberately do not include covers, lights or hooks.
  if (
    /(^|_)(cargo_(openluggagecompartmenttoseattop|largestluggagecompartment|behind_(first|second|third)_row|(rear|front|total)_vda|seats_(up|down|folded)|minimum|maximum|method|measurement)|luggage_(minimum|maximum)|passenger_volume|euro_pallet_capacity)(_|$)/.test(
      name,
    )
  )
    return 365;
  if (
    /(^|_)(overhang|front_track|rear_track|track_mm|head_?room|leg_?room|shoulder_?room|hip_?room|road_clearance|trail|between_wheelarches|floor_to_roof)(_|$)/.test(
      name,
    )
  )
    return 365;
  if (
    /(^|_)(seated_count|seating_layout|fit_seating|technical_seating_claim)(_|$)/.test(
      name,
    )
  )
    return 365;
  if (
    /^(source_.*|option_\d+)_seats$/.test(name) &&
    !/(^|_)(heated|ventilated|power|powered|relaxation|massage|memory|leather|cloth)(_|$)/.test(
      name,
    )
  )
    return 365;
  // Capacity measurements remain distinct from equipment such as heated seats,
  // cargo lamps or storage-box fitment, which keep the 180-day equipment window.
  if (
    /(^|_)(cargo|boot|frunk|luggage|storage|tub)(_|$)/.test(name) &&
    /(^|_)(volume|litres|liters|l|m3)(_|$)/.test(name)
  )
    return 365;
  if (
    /(^|_)(seat_count|seating_capacity|seating_positions|passenger_capacity|seated_passengers|standing_passengers|driver_seats|passenger_seats)(_|$)/.test(
      name,
    )
  )
    return 365;
  if (
    /(warranty|roadside|dimension|wheelbase|towball|towing|(^|_)tow(_|$))/.test(
      name,
    )
  )
    return 365;
  if (
    /(^|_)(length|width|height|depth|ground_clearance|turning_circle|turning_radius|turning_diameter|track_front|track_rear|boot|frunk|cargo_volume|cargo_capacity|luggage_volume|storage_litres)(_|$)/.test(
      name,
    )
  )
    return 365;
  if (
    /^(source_)?(seats|seat_count|seating_capacity|seating_positions|passenger_capacity|model_year|year)(_|$)/.test(
      name,
    )
  )
    return 365;
  return 180;
}

export function evidenceAgeDays(
  checkedAt: string,
  asOf: string,
): number | null {
  const age = (evidenceDateValue(asOf) - evidenceDateValue(checkedAt)) / day;
  return Number.isFinite(age) ? age : null;
}

/** A date is fresh through day N. Day N + 1 is the first stale day.
 * A known model-year change invalidates the longer-lived specification window. */
export function evidenceFreshness(
  checkedAt: string,
  key: string,
  asOf: string,
  modelYearChanged = false,
) {
  const windowDays = freshnessWindowDays(key);
  const ageDays = evidenceAgeDays(checkedAt, asOf);
  const date = evidenceDateValue(checkedAt);
  const fresh =
    ageDays !== null &&
    ageDays >= 0 &&
    ageDays <= windowDays &&
    !(windowDays === 365 && modelYearChanged);
  return {
    fresh,
    ageDays,
    windowDays,
    expiresOn: Number.isFinite(date)
      ? new Date(date + windowDays * day).toISOString().slice(0, 10)
      : null,
    staleOn: Number.isFinite(date)
      ? new Date(date + (windowDays + 1) * day).toISOString().slice(0, 10)
      : null,
  };
}

/** Unknown model years do not manufacture a change or a new verification date. */
export function modelYearChangedSince(
  checkedAt: string,
  changedAt: string | undefined,
  asOf: string,
) {
  if (changedAt === undefined) return false;
  const change = evidenceDateValue(changedAt);
  if (!Number.isFinite(change)) return true;
  return (
    change > evidenceDateValue(checkedAt) && change <= evidenceDateValue(asOf)
  );
}
export function factFreshness(
  fact: { date: string; key: string; modelYearChangedAt?: string },
  asOf: string,
) {
  return evidenceFreshness(
    fact.date,
    fact.key,
    asOf,
    modelYearChangedSince(fact.date, fact.modelYearChangedAt, asOf),
  );
}
