/** Presentation only. Never feed these strings back into evidence or identity guards. */
const replacements: readonly {
  id: string;
  field: string;
  before: string;
  after: string;
}[] = [
  {
    "id": "fonz_z_series_sr_forza_aranciata_black_vegan__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Bounded named advertised selection only; separate root admission required",
    "after": "Only this named advertised selection is covered; further review is required before treating it as a fully verified configuration."
  },
  {
    "id": "fonz_z_series_lr_forza_aranciata_black_vegan__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Bounded named advertised selection only; separate root admission required",
    "after": "Only this named advertised selection is covered; further review is required before treating it as a fully verified configuration."
  },
  {
    "id": "surron_ultra_bee_hp_t_carbon_black_ebmx_19851__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Bounded exact advertised New MY26 EBMX offer only, pending separate root admission",
    "after": "Only this exact advertised New MY26 EBMX offer is covered; further review is required before treating it as a fully verified configuration."
  },
  {
    "id": "surron_ultra_bee_hp_t_desert_brown_ebmx_19852__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Bounded exact advertised New MY26 EBMX offer only, pending separate root admission",
    "after": "Only this exact advertised New MY26 EBMX offer is covered; further review is required before treating it as a fully verified configuration."
  },
  {
    "id": "surron_ultra_bee_hp_r_carbon_black_ebmx_19849__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Bounded exact advertised New MY26 EBMX offer only, pending separate root admission",
    "after": "Only this exact advertised New MY26 EBMX offer is covered; further review is required before treating it as a fully verified configuration."
  },
  {
    "id": "kawasaki_ninja_e1_my26_nx011atfnn_brisbane_kaw_ne1_my26_1__20261010",
    "field": "configurationEvidence.projectionScope",
    "before": "Brisbane Motorcycles advertised New Ninja e-1 (LAMS) (MY26), NX011ATFNN, catalogue KAW-NE1-MY26_1; not a closed factory build; unpublished source-only proposal pending separate root admission",
    "after": "Brisbane Motorcycles advertised New Ninja e-1 (LAMS) (MY26), NX011ATFNN, catalogue KAW-NE1-MY26_1. The advertisement is recorded, but a complete factory build is not verified; detailed specifications still require separate review."
  },
  {
    "id": "mazda-cx-6e",
    "field": "limitations[4]",
    "before": "The root visually inspected brochure pages 5, 7 and 14, confirming grade table headings, cargo measurement basis and the publication footer/code. This limited visual check does not approve the separate detailed technical candidate; no technical epoch or specification is admitted by this market record.",
    "after": "Brochure pages 5, 7 and 14 were visually checked for grade-table headings, cargo measurement basis and the publication footer/code. This limited check does not verify the detailed technical information, applicable specification version or vehicle specifications in this market record."
  },
  {
    "id": "mazda-cx-6e",
    "field": "evidenceNote",
    "before": "Current Mazda Australia HTML names GT and Azami. The manufacturer retains preorder/almost-here advertising and links to dealer enquiry. Its current driveaway offer separately identifies E35 GT. Melville Mazda advertises one New E35 Azami GR, stock 11397703/VIN LVRHDCEK6TN551337, with public in_stock/reserved=false/preorder=false metadata last updated 6 October 2026. These seller fields do not establish present unsold physical availability. No detailed specification or brochure-to-VIN applicability is admitted.",
    "after": "Current Mazda Australia HTML names GT and Azami. The manufacturer retains preorder/almost-here advertising and links to dealer enquiry. Its current driveaway offer separately identifies E35 GT. Melville Mazda advertises one New E35 Azami GR, stock 11397703/VIN LVRHDCEK6TN551337, with public in_stock/reserved=false/preorder=false metadata last updated 6 October 2026. These seller fields do not establish present unsold physical availability. This market record does not verify detailed specifications or whether the brochure applies to that VIN."
  },
  {
    "id": "lexus-es-bev",
    "field": "limitations[0]",
    "before": "Newly discovered current Australian market-audit candidate: absent from starting inventory; main should add family audit and detailed configuration together without duplicating hybrids.",
    "after": "This Australian battery-electric ES entry was added after the initial inventory. Its market and detailed configuration records cover the BEV models; hybrid ES models are separate."
  },
  {
    "id": "bci-mini-bus-ev",
    "field": "limitations[1]",
    "before": "Admission is sales-sheet-scoped only. If the UI cannot keep this scope and the technical conflicts visible, retain the family in audit/search instead of publishing a falsely exact build.",
    "after": "This entry is limited to the sales sheet. Unresolved technical conflicts mean it must not be treated as a verified exact build."
  }
];

/** An unknown record, field or revised source string always keeps its original text. */
export function buyerDisplayCopy(
  id: string,
  field: string,
  original: string,
): string {
  return (
    replacements.find(
      (entry) =>
        entry.id === id && entry.field === field && entry.before === original,
    )?.after ?? original
  );
}
