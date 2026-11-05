/** Reader labels only: evidence keys, values, units and guard snapshots stay untouched. */
const rawKeyLabels: Record<string, string> = {
  price_aud: "Published price",
  range_km: "Published range",
  dc_charge_time_min: "Published DC charging duration",
  boot_l: "Published load space",
  towing_braked_kg: "Braked towing",
};
export function factReaderLabel(key: string, label: string): string {
  const raw = key.replaceAll("_", " ").toLowerCase();
  return label.toLowerCase() === raw || label.toLowerCase() === key.toLowerCase()
    ? rawKeyLabels[key] || label
    : label;
}
