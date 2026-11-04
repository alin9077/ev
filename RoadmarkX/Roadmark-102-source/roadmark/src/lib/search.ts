import type { Fact } from "./types";
/** Match common plain-keyboard spellings without changing displayed brand names. */
export function searchKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}
export function matchesSearch(value: string, query: string): boolean {
  const haystack = searchKey(value);
  if (haystack.includes(searchKey(query))) return true;
  // Buyers commonly combine a model and trim, skipping the intervening badge.
  // Require every word so an extra unmatched term cannot broaden the results.
  const words = query.trim().split(/\s+/).map(searchKey).filter(Boolean);
  return words.length > 0 && words.every((word) => haystack.includes(word));
}

/** Equivalent drive labels share a filter without changing the displayed sourced description. */
export function driveFilterKey(drive: string): string {
  const value = drive.trim();
  if (!value || /^(unknown|unverified)$/i.test(value)) return "unknown";
  if (/^(RWD|rear[- ]wheel drive|rear driven axle)(?:\b|$)/i.test(value))
    return "RWD";
  if (/^(AWD|FWD|2WD)$/i.test(value)) return value.toUpperCase();
  return value;
}

/** Options reflect the supplied catalogue without treating unknown or invalid counts as seats. */
export function catalogueFilterOptions(
  cars: readonly { drive: string; facts: { seats?: Pick<Fact, "value"> } }[],
) {
  const seats = [
    ...new Set(
      cars
        .map((car) => car.facts.seats?.value)
        .filter(
          (value): value is number =>
            typeof value === "number" && Number.isInteger(value) && value > 0,
        ),
    ),
  ].sort((a, b) => a - b);
  const drive = [...new Set(cars.map((car) => driveFilterKey(car.drive)))].sort(
    (a, b) => a.localeCompare(b),
  );
  return { seats, drive };
}
