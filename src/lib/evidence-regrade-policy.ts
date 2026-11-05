/** Reviewed M1 rules used to prepare the dated, guarded regrading ledger.
 * This module never changes a value, source record or evidence checked date.
 */
import type { BuyerGrade, Fact, Feature, GradeReview, Source } from "./types";

export type GradeDecision = {
  grade: BuyerGrade;
  evidenceScope: GradeReview["evidenceScope"];
  reason: string;
  qualifications?: string[];
  conditionExplanation?: string;
};
export const standingEvidenceNote =
  "Specifications describe the named Australian version. Model year and the delivered build should be confirmed before signing; laboratory figures are not a promise of real-world results.";

/** Mixed source-type labels were reviewed by their retained URL, not treated as authority. */
const makerExceptions = new Set([
  "r10_lng_genesis_g80ev_configuration",
  "r10_lng_genesis_g80ev_price_example_nsw",
  "r10_lng_genesis_gv60_configuration",
  "r10_lng_genesis_gv60_price_example_nsw",
  "r10_lng_genesis_gv60magma_configuration",
  "r10_lng_genesis_gv60magma_price_example_nsw",
  "r10_lng_genesis_gv70ev_configuration",
  "r10_lng_genesis_gv70ev_price_example_nsw",
  "r10_mg_mg4_product",
  "r10_mg_urban_product",
  "r10_mg_mg4_brochure",
  "r10_mg_urban_brochure",
  "r10_mg_offers",
  "r10_mg_mg4_config",
  "r10_mg_urban_config",
  "r10_mgremaining_mgs5_ev_page",
  "r10_mgremaining_cyberster_page",
  "r10_mgremaining_mgs5_ev_config",
  "r10_mgremaining_mgs6_ev_config",
  "r10_mgremaining_cyberster_config",
  "r10_mgremaining_im5_config",
  "r10_mgremaining_im6_config",
  "r10_mgremaining_mgs5_ev_brochure",
  "r10_mgremaining_mgs6_ev_brochure",
  "r10_mgremaining_cyberster_brochure",
  "r10_mgremaining_im5_brochure",
  "r10_mgremaining_im6_brochure",
  "r10_dgs_denza_d9_model",
  "r10_dgs_denza_d9_current_spec",
  "r10_dgs_denza_warranty_book",
  "r10_ldc_leap_c10_regular_brochure_new",
  "r10_atto1_atto1_config_essential",
  "r10_atto1_atto1_config_premium",
]);
export function isRetainedAUMakerSource(source: Source): boolean {
  if (
    !/^(AU|Australia|AU\/NZ)$/.test(source.market) ||
    source.access_limitation ||
    source.conflict ||
    source.publication_hold
  )
    return false;
  if (makerExceptions.has(source.id)) return true;
  const kind = source.source_type;
  if (
    /secondary|reported|report_of|firsthand|owner|community|independent|regulator|assessment|assessor|government|dealer.*advert|dealer.*listing|stock|inventory| or |_or_|mirror_not|unverified|legacy|older/i.test(
      kind,
    )
  )
    return false;
  return /manufacturer|primary_warranty|official_configurator|official_Australian_distributor/i.test(
    kind,
  );
}

/** Drop only generic statements; substantive clauses in mixed sentences survive. */
export function withoutStandingCaveats(text: string): string {
  const scoped = text
    .replace(
      /Current Australian storefront grade; manufacturer model year not stated/gi,
      "",
    )
    .replace(
      /Manufacturer model year (?:is )?(?:unconfirmed|unverified|not stated)[.;]?/gi,
      "",
    )
    .replace(
      /(?:a |the )?dealer.advertised MY does not establish this specification[’']s model year[.;]?/gi,
      "",
    )
    .replace(
      /applicability to a separately advertised MY\d+ vehicle is unconfirmed[.;]?/gi,
      "",
    )
    .replace(
      /Vehicle rating; achieved power, charging curve and duration at maximum depend on supply and operating conditions[.;]?/gi,
      "",
    )
    .replace(
      /those unknowns do not invalidate accurately scoped catalogue facts[.;]?/gi,
      "",
    )
    .replace(
      /Exact named Australian configuration; preserve cited source epoch and measurement conditions/gi,
      "Exact named Australian configuration",
    )
    .replace(/Per.VIN warranty start is not verified[.;]?/gi, "");
  return scoped
    .split(/(?<=[.!?])\s+|;\s+/)
    .filter((part) => {
      const s = part.trim();
      if (!s) return false;
      if (
        /^(?:formal )?(?:manufacturer )?model year(?:,| and| |$)/i.test(s) &&
        !/MY\d+|chang|conflict|disagree|provisional|option|wheel/i.test(s)
      )
        return false;
      if (
        /^(?:exact New stock|accepted orders|physical stock|VIN\/build specification|delivered.build applicability)/i.test(
          s,
        ) &&
        /unverified|unconfirmed|unknown/i.test(s)
      )
        return false;
      if (
        /^specifications, features and availability may vary by state and change without notice|^confirm current information with .* before ordering/i.test(
          s,
        )
      )
        return false;
      // A claim-specific option, version conflict or measurement condition is never a generic caveat.
      if (
        /optional|option pack|wheel.*(?:not|unknown|unconfirm|differ)|conflict|provisional|preliminary|target|standard versus optional|standard\/optional|not expressly|not specified|not stated|not established|service.?activ|boost|rollout|not compatible|not included|excludes (?:Queensland|Northern)|different.*(?:method|configuration)/i.test(
          s,
        )
      )
        return true;
      if (
        /^(?:claimed )?laboratory (?:or advertised model maximum|WLTP|range|claim)|^manufacturer laboratory claim|^laboratory or advertised/i.test(
          s,
        ) &&
        !/wheel|option|maximum|target|test.*condition|[0-9].*(?:kW|°|%)/i.test(
          s,
        )
      )
        return false;
      if (
        /^(?:claimed )?laboratory (?:range|claim).*real.world|^real.world (?:range|results) var|^not (?:a )?(?:guaranteed )?real.world/i.test(
          s,
        )
      )
        return false;
      if (
        /^(?:manufacturer )?model year (?:is )?(?:unconfirmed|unverified|not stated)|^manufacturer MY, (?:production|exact)|^current Australian storefront grade|^applicability to (?:a|the) (?:separately advertised|delivered)|^a dealer.advertised MY does not|^manufacturer model year and applicability|^exact (?:delivered |VIN\/factory.build )?(?:model year|build|VIN).*unverified/i.test(
          s,
        )
      )
        return false;
      if (
        /^Australian manufacturer specification may differ by market and actual delivered vehicle|^model configuration can change|^equipment is manufacturer.published;? verify the ordered build specification|^equipment applies only to the cited model year and grade|^only this technical epoch and source equipment column|^observed \d{4}-\d{2}-\d{2};? exact MY|^no MY\d+ technical inheritance|^no ranking or complete.record promotion|^figures are conditional source declarations and are not used for rankings/i.test(
          s,
        )
      )
        return false;
      if (
        /^factory.order acceptance, delivery timing and physical possession unconfirmed|^physical stock and accepted factory order are unverified|^exact dealer New advertisement is weaker|^MY\d+ and MY\d+ specifications and stock advertisements apply separately|^model year is explicit source identity|^current named.grade catalogue evidence is established/i.test(
          s,
        )
      )
        return false;
      if (
        /^specifications(?:, equipment)? (?:and availability )?(?:may|can) change|^a catalogue identity does not certify|^this is not factory.verified fitment|^neither verifies a particular vehicle/i.test(
          s,
        )
      )
        return false;
      return true;
    })
    .join("; ")
    .replace(/; ([.!?])/g, "$1")
    .trim();
}
const BODY_KEYS =
  /^(length_mm|width_mm|height_mm|wheelbase_mm|seats|boot_l|max_total_cargo_l|frunk_l)$/;
const WARRANTY_KEYS = /warranty|roadside/;
function siblingEvidence(fact: Fact, text: string): boolean {
  if (
    fact.resolvedElsewhere &&
    !/handbook maximum with the towing function|with four or fewer occupants/.test(
      fact.basis,
    )
  )
    return true;
  if (
    /inner stale model codes|stale inner.page|inner standard.equipment page code|not confirmed current.code|BASIC_LINE API scope does not verify the current exact style/i.test(
      text,
    )
  )
    return true;
  const affirmative = text.replace(
    /(?:do not|never|no) (?:substitute|infer|import|transfer|backfill)[^.]+/gi,
    "",
  );
  return /carried (?:over|from)|inherited from|sibling (?:version|trim|grade)|applied to (?:the announced|this) (?:AWD |)version|matched by an overseas|not restated for|reported (?:by|for|with)|independent (?:European|database)|EV Database|industry data|overseas figure|powertrain\/model.level data; exact trim.option dimensions not separately given/i.test(
    affirmative,
  );
}
function substantiveCondition(fact: Fact): string | undefined {
  const key = fact.key;
  const content = [
    withoutStandingCaveats(fact.basis),
    ...fact.qualifications.map(withoutStandingCaveats),
    withoutStandingCaveats(fact.conditionExplanation || ""),
  ]
    .filter(Boolean)
    .join(" ");
  if (/^option_/.test(key))
    return "This is an explicitly selected option configuration, not the base version.";
  if (
    /weight|mass|payload|unladen/.test(key) &&
    /options may increase|depends on (?:the )?(?:options|equipment)|selected equipment/i.test(
      content,
    )
  )
    return "The published mass changes with the selected options or equipment.";
  if (
    /towing/.test(key) &&
    /fitment scheduled|towbar pre.orders?|not confirmed available|requires? .*(?:towing kit|towbar)|with .*(?:accessory|genuine) towbar/i.test(
      content,
    )
  )
    return "The towing figure requires the stated towbar or kit; check its availability and fitment.";
  if (
    /digital_key|v2l.*output/.test(key) &&
    /compatible|adapter|adaptor|device|inclusion|service conditions|operating conditions/i.test(
      content,
    )
  )
    return "The function needs the stated compatible device, adapter or service conditions.";
  if (
    /price|_aud$|promotion|offer/.test(key) &&
    /indicative|postcode|state.specific|historical_unverified|historical.*price|current production\/option equivalence|current.*(?:not verified|unverified)|eligibility|not combinable|while stocks last/i.test(
      content,
    )
  )
    return "The published amount is limited to its stated date, location, selected configuration or offer eligibility.";
  if (
    /future.dated|dated (?:into|in) (?:the )?future|dated.{0,30}after this check|not corroborated|lacks? separate corroboration/i.test(
      content,
    )
  )
    return "The maker document is future-dated and this field lacks separate dated corroboration.";
  // An unresolved source conflict survives even when the maker is one of the sources.
  if (
    fact.issues.length ||
    /conflicting|conflict|provisional|preliminary|target figure|target claim|necessary inspections pending/i.test(
      content,
    )
  )
    return "The cited claim has a specific source conflict or provisional specification; read the retained conditions.";
  if (
    fact.status === "optional" ||
    /(?:optional (?:extra|pack|equipment|configuration)|option pack|requires? (?:an? )?(?:adapter|towbar|package|subscription)|needs the optional|with (?:the )?tow(?:ing)? (?:function|package)|with four or fewer occupants|falls to .*occupants|standard versus optional|standard\/optional fitment|not expressly stated|not classified as standard|unclassified|not necessarily standard)/i.test(
      content,
    )
  )
    return "An option, equipment or usage condition changes what is included; read the retained conditions.";
  if (WARRANTY_KEYS.test(key)) {
    if (
      /up to (?:7|10|15|seven|ten|fifteen)|service.activated|subject to (?:annual|scheduled).*servic|seven years is conditional|with qualifying servic|conditionalYears/i.test(
        JSON.stringify(fact.value) + " " + fact.basis,
      )
    )
      return "The extended cover depends on service or eligibility requirements stated in the policy.";
    return undefined;
  }
  if (
    /battery.*kwh|battery_kwh/.test(key) &&
    /(?:gross.{0,20}usable|usable.{0,20}gross).{0,50}(?:unspecified|not (?:stated|specified|declared|established))|basis (?:not stated|unspecified)/i.test(
      content,
    )
  )
    return "The maker does not identify whether this battery capacity is gross or usable.";
  if (
    key === "range_km" &&
    /up to|maximum|target|wheel.{0,55}(?:unconfirm|unknown|not (?:provided|specified|established))|selected (?:wheel|equipment)|var(?:y|ies) (?:according to|by|with)/i.test(
      content,
    )
  )
    return "The published range depends on the stated wheel, option or maximum-range configuration.";
  if (
    key === "boot_l" &&
    /(?:method|VDA|SAE|load.height|seat.*boundary).{0,65}(?:not (?:stated|established|specified)|unspecified|unknown)|assumed|range endpoints|open bed|underfloor|roof.height/i.test(
      content,
    )
  )
    return "The loading layout or measurement method needs checking before comparing boot volumes.";
  if (
    key === "width_mm" &&
    /mirror.{0,35}(?:not stated|unspecified|unverified)|excluding mirrors.*including mirrors/i.test(
      content,
    )
  )
    return "Mirror inclusion is not specified for this published width.";
  if (
    /power|zero_to_100|torque|acceleration/.test(key) &&
    /boost|launch|rollout|overboost|mode|activation|default.{0,35}unconfirmed|protocol not (?:fully )?established/i.test(
      content,
    )
  )
    return "The stated output or acceleration depends on its published test or activation method.";
  if (
    /dc_charge_time/.test(key) &&
    /(?:[<>≥]|temperature|°[Cc]|(?:350|320|400|800)\s*kW|window.*(?:not|unconfirm)|station rating.*not established|protocol.*not|10.{0,3}70|30.{0,3}80|20.{0,3}80)/i.test(
      content,
    )
  )
    return "Keep the stated state-of-charge window and charger/test conditions when comparing this time.";
  if (
    /charging|dc_peak|ac_kw/.test(key) &&
    /optional|selected equipment|different.*(?:rating|condition)|source.*conflict/i.test(
      content,
    )
  )
    return "The charging figure depends on the stated equipment or configuration.";
  if (
    key === "price_aud" &&
    (fact.priceEvidence?.state ||
      /offer|campaign|promotion|postcode|state.specific|indicative|estimate|selected (?:paint|equipment)/i.test(
        content,
      ))
  )
    return "The advertised price is subject to the stated location, configuration or offer conditions.";
  if (
    /software|connect|v2l|v2g|remote|autopilot|driver|adas|charge.*network|auto_shift/.test(
      key,
    ) &&
    /subscription|activat|hardware|software|compatib|adapter|beta|requires|depends|market|third.party|availability/i.test(
      content,
    )
  )
    return "Functionality depends on the stated equipment, software, service or compatibility conditions.";
  if (
    fact.status === "conditional" &&
    /requires|depends|subject to|only with|not yet|not fully|not verified|not established|not specified|not stated|unconfirmed|unknown|may (?:vary|differ)|can (?:vary|differ)/i.test(
      content,
    )
  ) {
    // Retain unclassified specific uncertainty rather than use a missing regex as promotion evidence.
    const explanation = withoutStandingCaveats(fact.conditionExplanation || "");
    const cleaned =
      explanation ||
      [
        ...new Set(
          fact.qualifications.map(withoutStandingCaveats).filter(Boolean),
        ),
      ].join(" ");
    if (/^(length_mm|height_mm|wheelbase_mm|seats)$/.test(key)) {
      const relevant = cleaned
        .split(/(?<=[.!?])\s+|;\s+/)
        .filter(
          (sentence) =>
            /length|height|dimension|wheelbase|seat|tray|roof|bumper|bracket|suspension|conflict|provisional|dated.*after|lack.*corroboration/i.test(
              sentence,
            ) &&
            /depends|subject to|unconfirmed|not established|not verified|differ|conflict|provisional|dated.*after|lack.*corroboration/i.test(
              sentence,
            ),
        );
      return relevant.length ? relevant.join("; ") : undefined;
    }
    if (cleaned) return cleaned;
  }
  return undefined;
}
export function decideRetainedFactGrade(
  fact: Fact,
  sourceIndex: Map<string, Source>,
): GradeDecision | undefined {
  if (
    /^qualified_derived_price/.test(fact.key) ||
    fact.value === null ||
    fact.value === undefined ||
    !fact.sourceIds.length ||
    (fact.status === "not_verified" && !fact.priceEvidence) ||
    fact.status === "subjective" ||
    (typeof fact.value === "string" &&
      /^(?:needs confirmation|not (?:verified|published|established)|unknown|unverified)$/i.test(
        fact.value.trim(),
      ))
  )
    return;
  const cited = fact.sourceIds.map((id) => sourceIndex.get(id));
  if (
    cited.some(
      (source) =>
        !source || source.access_limitation || source.publication_hold,
    )
  )
    return;
  const text = [
    fact.basis,
    fact.conditionExplanation || "",
    ...fact.qualifications,
  ].join(" ");
  const qualifications = fact.qualifications
    .map(withoutStandingCaveats)
    .filter(Boolean);
  const primary = cited.some(
    (source) => source && isRetainedAUMakerSource(source),
  );
  const mixedAuthority = cited.some(
    (source) => source && !isRetainedAUMakerSource(source),
  );
  if (
    (fact.priceEvidence?.rung && fact.priceEvidence.rung >= 5) ||
    siblingEvidence(fact, text) ||
    !primary ||
    mixedAuthority ||
    fact.market !== "AU"
  )
    return {
      grade: "reported",
      evidenceScope: "secondary_or_sibling",
      reason:
        "Retained evidence is secondary, non-Australian or carried from a sibling; it remains visible but unranked.",
      qualifications,
      conditionExplanation: withoutStandingCaveats(
        fact.conditionExplanation || "",
      ),
    };
  let evidenceScope: GradeReview["evidenceScope"] = "exact_au_version";
  if (
    WARRANTY_KEYS.test(fact.key) &&
    cited.some(
      (source) =>
        source &&
        isRetainedAUMakerSource(source) &&
        /warranty|roadside/i.test(source.id + " " + source.title),
    )
  )
    evidenceScope = "brand_au_terms";
  else if (
    BODY_KEYS.test(fact.key) &&
    /range.wide|whole range|all (?:versions|variants|grades)|shared (?:row|cell|two.grade)|merged.*(?:both|all)|for the .* body/i.test(
      text,
    )
  )
    evidenceScope = "explicit_au_range";
  const conditionExplanation = substantiveCondition(fact);
  return conditionExplanation
    ? {
        grade: "check",
        evidenceScope,
        reason:
          "Maker evidence supports the named Australian claim, with a specific retained option, measurement or eligibility condition.",
        qualifications,
        conditionExplanation,
      }
    : {
        grade: "confirmed",
        evidenceScope,
        reason:
          evidenceScope === "brand_au_terms"
            ? "The maker's Australian terms establish this published cover; individual commencement and exclusions remain in the cited policy."
            : evidenceScope === "explicit_au_range"
              ? "The maker explicitly supplies this body measurement across the applicable Australian range."
              : "Retained maker material supports the named Australian version; generic model-year/build or laboratory disclaimers do not reduce its grade.",
        qualifications,
        conditionExplanation: "",
      };
}
export function featureAsFact(feature: Feature): Fact {
  return {
    ...(feature.validUntil === undefined ? {} : { validUntil: feature.validUntil }),
    key: feature.criterion,
    label: feature.criterion,
    value: feature.status === "not_verified" ? null : feature.value,
    status: feature.status,
    unit: "",
    basis: feature.evidence_scope,
    comparisonBasis: "",
    sourceIds: feature.source_ids,
    date: feature.last_evidence_date,
    market: "AU",
    scope: feature.evidence_scope,
    qualifications: feature.conditions ? [feature.conditions] : [],
    issues: [],
    conditionExplanation: feature.conditions,
  };
}
