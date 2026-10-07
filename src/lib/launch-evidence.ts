import audit from "../../data/source-audit-2026-10-08.json";
import type { Fact, Feature, Source } from "./types";
const date = audit.date;
const holds = new Set(
  audit.sources
    .filter((s) => ["unavailable", "unsupported"].includes(s.status))
    .map((s) => s.source_id),
);
export function auditedSource(source: Source): Source {
  const check = audit.sources.find((s) => s.source_id === source.id);
  if (!check) {
    if (
      [
        "r7_evdb_model_y_lr_awd",
        "b7_ctm_insurance",
        "b7_choice_insurance",
      ].includes(source.id)
    )
      return {
        ...source,
        full_text_checked_date: date,
        supports: source.supports.replace(
          "; read from a search summary of the page",
          "",
        ),
        access_limitation: "",
      };
    if (source.id === "b7_aaa_my_rwd")
      return {
        ...source,
        attempted_date: date,
        access_limitation:
          "The result page did not expose readable text on 8 October 2026. The earlier supplied test result is retained with build-applicability qualifications.",
      };
    return source;
  }
  return {
    ...source,
    url: check.url,
    supports: check.note,
    audit_status: check.status,
    attempted_date: date,
    ...(check.status === "unavailable"
      ? { access_limitation: check.note }
      : {
          full_text_checked_date: date,
          access_limitation: check.status === "checked" ? "" : check.note,
        }),
  };
}
export function auditedFact(fact: Fact): Fact {
  const licensing =
    fact.key === "kerb_weight_kg" &&
    fact.sourceIds.some((s) => s.startsWith("b7_ce_"));
  if (!licensing && !fact.sourceIds.some((s) => holds.has(s))) return fact;
  return {
    ...fact,
    value: null,
    status: "not_verified",
    date,
    qualifications: [
      licensing
        ? "Weight is withheld pending a manufacturer source or permission to reuse the licensed industry data."
        : "A supporting source could not be verified from its full text; the earlier figure is withheld.",
    ],
  };
}
export function auditedFeature(feature: Feature): Feature {
  const f = { ...feature };
  const patch = (
    value: string,
    conditions: string,
    status: Feature["status"] = "conditional",
  ) => ({
    ...f,
    value,
    conditions,
    status,
    condition_label: "Source audit",
    last_evidence_date: date,
    reviewed_date: date,
    verification_state: "full_text_audit_2026-10-08",
    usability_notes: [],
    confirmation_needed: undefined,
  });
  if (
    f.criterion === "driveaway_price" &&
    f.source_ids.some((s) => s.startsWith("b7_ce_"))
  )
    return patch(
      "Request a current driveaway quote",
      "The previous third-party estimate is withheld pending a manufacturer source or permission to reuse the licensed industry data. Ask for a written quote naming the state, delivery fees, registration, compulsory insurance and stamp duty.",
      "not_verified",
    );
  if (f.criterion === "novated_fbt")
    return patch(
      "Exact eligibility needs confirmation",
      "The listed price alone does not establish FBT eligibility. The May 2026 announcement described proposed changes from April 2027 and April 2029; this audit has not established that those proposals are law. Confirm the current rules, acquisition conditions and taxable value with the ATO and your adviser.",
      "not_verified",
    );
  if (f.criterion === "service_network" && f.model_id.startsWith("tesla_"))
    return {
      ...patch(
        "21 Australian service centres in the August 2026 count",
        "ScrapeHero location count dated 21 August 2026; not a live directory or a measure of local appointment availability.",
      ),
      source_ids: ["b7_tesla_centres"],
    };
  if (f.criterion === "driver_alerts" && f.model_id === "jaecoo_j5_ev")
    return {
      ...patch(
        "Reviewer reports relatively quiet alerts",
        "The Driven's August 2026 review describes less intrusive warnings. It does not confirm that disabled alerts stay off after a restart; check the ordered car.",
        "subjective",
      ),
      source_ids: ["b7_jaecoo_driven"],
    };
  if (f.criterion === "driver_alerts" && f.model_id === "geely_ex5")
    return {
      ...patch(
        "Saved driving profile with a recall shortcut",
        "EV Central's February 2026 report describes a steering-wheel or swipe-down shortcut to recall a profile after start-up. Persistence of disabled alerts without recall is not established.",
      ),
      source_ids: ["b7_geely_ota"],
    };
  if (
    f.criterion === "battery_chemistry" &&
    f.variant_id.includes("tesla_model_y__l_")
  )
    return patch(
      "Battery chemistry needs a source for this six-seat build",
      "The cited CarsGuide article covers five-seat Model Y versions. The Model Y L chemistry and charge-limit guidance are not established by that article.",
      "not_verified",
    );
  if (f.criterion === "charging_cable" && f.model_id === "zeekr_7x")
    return {
      ...patch(
        "Current cable inclusions need confirmation",
        "The cited August 2025 article describes a launch offer for the first thousand customers. It does not establish later-order inclusions; check the order contract.",
        "not_verified",
      ),
      source_ids: ["b7_zeekr_inclusions"],
    };
  if (
    f.criterion === "child_seats" &&
    f.variant_id.includes("tesla_model_y__l_")
  )
    return {
      ...patch(
        "Fitment cautions for second and third rows",
        "ANCAP reports second-row top-tether routing difficulties and difficult third-row ISOFIX installation for convertible restraints. Check compatibility with the restraint manufacturer and a qualified fitter; an expo demonstration does not establish compatibility.",
      ),
      source_ids: ["b7_ancap_y_l"],
    };
  if (f.source_ids.some((s) => holds.has(s)))
    return patch(
      "Not confirmed from an opened source",
      "A supporting article could not be retrieved, or its full text did not support the earlier claim. The earlier value is withheld until replacement evidence is checked.",
      "not_verified",
    );
  // The AAA test belongs to an April 2025 build, not every later Premium RWD car.
  if (
    f.criterion === "real_world_range" &&
    f.source_ids.includes("b7_aaa_my_rwd")
  )
    return patch(
      "450 km in an earlier Model Y RWD test; current-trim applicability unconfirmed",
      "The supplied AAA record describes an April 2025 build tested on 23–24 October 2025 over a 93 km route near Geelong. It is not a test of every current Premium RWD build. The source page did not expose readable result text during the 8 October recheck.",
      "conditional",
    );
  return f;
}
