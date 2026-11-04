/** Editorial buying order, not a survey or an overall vehicle score. */
export const chapters = [
  {
    n: "01",
    title: "Price & ownership",
    category: "Price",
    copy: "Start with the purchase price, then the costs that stay with you.",
    facts: ["price_aud", "warranty", "battery_warranty"],
    features: [
      "driveaway_price",
      "novated_fbt",
      "insurance_cost",
      "resale_value",
      "warranty_service",
      "service_network",
      "roadside_assistance",
      "referral_program",
    ],
    highlights: ["price_aud", "warranty"],
  },
  {
    n: "02",
    title: "Automated driving",
    category: "Automated driving",
    copy: "Full Self-Driving (Supervised), everyday assistance and parking. Compare the capabilities and the conditions.",
    facts: [],
    features: [
      "adas_optional",
      "adas_standard",
      "driver_alerts",
      "parking_cameras",
      "remote_summon",
      "auto_shift",
      "traffic_light_chime",
    ],
    highlights: ["adas_optional", "adas_standard"],
  },
  {
    n: "03",
    title: "Range & charging",
    category: "Range and charging",
    copy: "Enough range for your week. Easy charging when you travel.",
    facts: [
      "range_km",
      "dc_charge_time_min",
      "ac_kw",
      "dc_peak_kw",
      "battery_kwh",
    ],
    features: [
      "real_world_range",
      "energy_use",
      "battery_chemistry",
      "home_charging",
      "charging_cable",
      "navigation_route_planner",
      "battery_preconditioning_navigation",
      "supercharger_access",
      "charge_port_operation",
      "v2l",
      "bidirectional_v2g",
      "heat_pump",
      "battery_density",
    ],
    highlights: ["range_km", "dc_charge_time_min"],
  },
  {
    n: "04",
    title: "Space & safety",
    category: "Family space",
    copy: "Seats, storage and safety for the people who come with you.",
    facts: [
      "seats",
      "boot_l",
      "frunk_l",
      "max_total_cargo_l",
      "towing_braked_kg",
      "towing_unbraked_kg",
      "length_mm",
      "width_mm",
      "height_mm",
      "wheelbase_mm",
      "ground_clearance_mm",
      "turning_circle_m",
      "kerb_weight_kg",
    ],
    features: [
      "safety_ancap",
      "child_seats",
      "spare_tyre",
      "storage",
      "sentry_parked_recording",
      "dashcam",
    ],
    highlights: ["seats", "safety_ancap"],
  },
  {
    n: "05",
    title: "Daily convenience",
    category: "Daily convenience",
    copy: "The small routines you repeat every time you drive.",
    facts: [],
    features: [
      "phone_key",
      "passive_unlock",
      "walk_away_lock",
      "automatic_start",
      "automatic_shutdown",
      "driver_profiles_local",
      "cloud_profile_transfer",
      "folding_mirrors",
      "garage_integration",
      "power_tailgate",
    ],
    highlights: ["phone_key", "walk_away_lock"],
  },
  {
    n: "06",
    title: "Comfort & drive",
    category: "Comfort and performance",
    copy: "A comfortable cabin and a drive you enjoy. Try both on the road.",
    facts: ["zero_to_100_s"],
    features: [
      "front_ventilated_seats",
      "front_heated_seats",
      "rear_heated_seats",
      "heated_steering_wheel",
      "automatic_seat_climate",
      "remote_preconditioning",
      "pet_mode",
      "camp_utility_mode",
      "cabin_overheat_protection",
      "glass_roof",
      "ride_control_subjective",
      "interior_fit_finish_subjective",
      "style_refinement",
      "performance_rear_motor",
      "paint_options_quality",
    ],
    highlights: ["front_ventilated_seats", "pet_mode"],
  },
  {
    n: "07",
    title: "Software & tech",
    category: "Software",
    copy: "Useful apps, connectivity and improvements after delivery.",
    facts: [],
    features: [
      "ota_capability_scope",
      "carplay_android_auto",
      "app_connectivity",
      "voice_assistant",
      "media_resume",
      "phone_contacts",
      "screens_hud",
      "audio_system",
      "wireless_charging",
      "alert_sound_quality",
    ],
    highlights: ["ota_capability_scope", "carplay_android_auto"],
  },
];
export type Chapter = (typeof chapters)[number];

/** Price and driving lead the comparison; priorities reorder the remaining topics. */
export function orderChapters(priority: string) {
  return [
    chapters[0],
    chapters[1],
    ...chapters
      .slice(2)
      .sort(
        (a, b) =>
          Number(b.category === priority) - Number(a.category === priority),
      ),
  ];
}

/** Caveats that apply to a whole row are stated once here, not on every card. */
export const rowNotes: Record<string, string> = {
  warranty:
    "Private-use terms; whichever limit comes first. Component exclusions apply.",
  battery_warranty:
    "Every maker here guarantees at least 70% of the original capacity within the term.",
  range_km:
    "Laboratory-cycle figures, not real-world range. Most are WLTP; ADR, NEDC and WLTC figures are tagged and are not compared with WLTP.",
  driveaway_price:
    "Sydney figures. Stamp duty, registration and delivery differ by state and dealer; get a written quote.",
  novated_fbt:
    "Changes announced in the May 2026 Budget and not yet law. A lease keeps the treatment it started with.",
  insurance_cost:
    "A benchmark for one driver profile or a brand average, not a quote for you.",
  resale_value:
    "Past auction results do not predict what any car will be worth.",
  driver_alerts:
    "How the warnings behave matters as much as the feature list; try them on a test drive.",
  real_world_range:
    "On-road tests by the Australian Automobile Association, funded by the Commonwealth. One route and one car; your range will vary.",
  energy_use:
    "Label and WLTP figures include charging losses. Check the basis under each figure before comparing.",
  home_charging:
    "Most homes have single-phase power, which limits a wallbox to about 7 kW.",
  bidirectional_v2g:
    "Powering a house or the grid needs an approved bidirectional charger and the maker's warranty support.",
  child_seats:
    "Anchor points are not a fit guarantee; try your own seats in the car.",
  ground_clearance_mm:
    "Makers quote laden, unladen or minimum clearance; compare like with like.",
  dc_charge_time_min:
    "Check the charge window under each time: a 30–80% time is not comparable with 10–80%.",
  dc_peak_kw:
    "The highest rate the car accepts, not an average. A 350 kW charger does not make a car charge at 350 kW.",
  boot_l:
    "Makers measure differently (VDA or unstated), so treat small differences as a tie.",
  zero_to_100_s:
    "Manufacturer claims. Tesla's Performance times subtract a one-foot rollout, which reads quicker than a standing start.",
  safety_ancap:
    "Scores from different test years use different protocols and are not directly comparable.",
  supercharger_access:
    "Other brands need the Tesla app (4.2.3 or later): choose Charge Your EV, add payment, plug in and pick the stall.",
  v2l: "Vehicle-to-load powers appliances from the car. It is not home backup or grid export.",
  ride_control_subjective:
    "Hardware only. Ride comfort needs a test drive on roads you know.",
  interior_fit_finish_subjective:
    "Materials are listed; build quality needs an in-person look.",
  style_refinement: "Styling is a matter of taste; there is no score.",
  alert_sound_quality:
    "Whether the sounds are pleasant is a matter of taste; listen on a test drive.",
  paint_options_quality:
    "Colours are listed; paint finish needs an in-person look.",
};

/** Rows whose content is already shown by neighbouring rows on the homepage. */
export const summaryRows = ["storage"];

export const drivingLabels: Record<string, string> = {
  adas_optional: "Full Self-Driving & advanced assistance",
  adas_standard: "Standard driver assistance",
  remote_summon: "Remote parking & Summon",
  auto_shift: "Automatic gear selection",
  traffic_light_chime: "Traffic-light alerts",
};
