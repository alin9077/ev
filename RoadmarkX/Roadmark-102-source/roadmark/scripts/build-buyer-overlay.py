#!/usr/bin/env python3
"""Builds data/research-buyer-2026-10-07.json.

Adds the rows buyers compare that the supplied 48 criteria did not cover:
cost of ownership, battery, real-world range, home charging, support,
driver-assistance behaviour, family fit and cabin equipment. The original
research JSON is never modified. Run from the project root:

    python3 scripts/build-buyer-overlay.py

Every variant must end with a value for every row; the script lists any cell
still open and exits non-zero so `pnpm audit:content` cannot pass by omission.
"""
import json
import sys

DATE = "2026-10-07"
base = json.load(open("data/au_ev_all_variants_2026-10-06.json"))
variants = {v["id"]: v for v in base["variants"]}
equipment = {t["variant_id"]: t for t in base["trim_equipment"]}
existing_sources = {s["id"] for s in base["sources"]}
for name in ("refinement-2026-10-06", "usability-2026-10-06", "sales-2026-10-06", "completion-2026-10-07", "editorial-2026-10-07"):
    existing_sources |= {s["id"] for s in json.load(open(f"data/research-{name}.json"))["sources"]}


def ids(prefix):
    return [v for v in variants if v.startswith(prefix)]


Y_RWD, Y_LR, Y_L, Y_P = "tesla_model_y__premium_rwd__2", "tesla_model_y__premium_long_range_awd__1", "tesla_model_y__l_premium_awd__4", "tesla_model_y__performance_awd__3"
M3_LR, M3_PR, M3_RWD, M3_P = "tesla_model_3__premium_long_range_rwd__1", "tesla_model_3__premium_rwd__2", "tesla_model_3__rear_wheel_drive__3", "tesla_model_3__performance_awd__4"
S7_PR, S7_PF = "byd_sealion_7__premium_rwd__1", "byd_sealion_7__performance_awd__2"
EX5_C, EX5_I, EX5_CO, EX5_IO = "geely_ex5__complete_extended_range__1", "geely_ex5__inspire_extended_range__2", "geely_ex5__complete__3", "geely_ex5__inspire__4"
Z_RWD, Z_LR, Z_P, Z_B = "zeekr_7x__rwd__1", "zeekr_7x__long_range_rwd__2", "zeekr_7x__performance_awd__3", "zeekr_7x__black_special_edition_awd__4"
J5 = "jaecoo_j5_ev__ev_summit__1"
A2_D, A2_P = "byd_atto_2__dynamic__1", "byd_atto_2__premium__2"
EV5_AS, EV5_AL, EV5_E, EV5_G = "kia_ev5__air_2wd_standard_range__1", "kia_ev5__air_2wd_long_range__2", "kia_ev5__earth_awd_long_range__3", "kia_ev5__gt_line_awd_long_range__4"
EV3_AS, EV3_AL, EV3_E, EV3_G, EV3_GA = "kia_ev3__air_2wd_standard_range__1", "kia_ev3__air_2wd_long_range__2", "kia_ev3__earth_2wd_long_range__3", "kia_ev3__gt_line_2wd_long_range__4", "kia_ev3__gt_line_awd_long_range__5"
EVO_D, EVO_P = "byd_atto_3_evo__dynamic_fwd__1", "byd_atto_3_evo__premium_rwd__2"
A3_E, A3_P = "byd_atto_3_legacy__essential_fwd__1", "byd_atto_3_legacy__premium_fwd__2"

TESLA_Y, TESLA_3 = ids("tesla_model_y"), ids("tesla_model_3")
TESLA = TESLA_Y + TESLA_3
SEALION, EX5, ZEEKR, ATTO2 = ids("byd_sealion_7"), ids("geely_ex5"), ids("zeekr_7x"), ids("byd_atto_2")
EV5, EV3, EVO, ATTO3 = ids("kia_ev5"), ids("kia_ev3"), ids("byd_atto_3_evo"), ids("byd_atto_3_legacy")
BYD = SEALION + ATTO2 + EVO + ATTO3
KIA = EV5 + EV3
EVERY = list(variants)

sources = []


def src(id, url, title, publisher, kind, supports, market="AU", published=None):
    sources.append({
        "id": id,
        "url": url,
        "title": title,
        "publisher": publisher,
        "source_type": kind,
        "published_date": published,
        "accessed_date": DATE,
        "market": market,
        "supports": supports,
        "fresh_check": True,
    })


P, I, G, D = "manufacturer_primary", "industry_reporting", "government_primary", "independent_database"

# key, label, group, definition
criteria = [
    ("driveaway_price", "Driveaway price", "Cost of ownership", "Published or estimated price including delivery, stamp duty, registration and compulsory insurance, with the state named."),
    ("novated_fbt", "Novated lease and FBT", "Cost of ownership", "Fringe benefits tax treatment for a salary-packaged car now and under the changes legislated from 1 April 2027."),
    ("insurance_cost", "Insurance cost", "Cost of ownership", "Published comprehensive premium benchmarks with the driver profile named; not a personal quote."),
    ("resale_value", "Resale value", "Cost of ownership", "Guaranteed future value programs and published retained-value evidence; forecasts are not guarantees."),
    ("roadside_assistance", "Roadside assistance", "Cost of ownership", "Length and conditions of the maker's roadside cover."),
    ("service_network", "Service network", "Cost of ownership", "Australian service locations and mobile servicing, dated."),
    ("driver_alerts", "Driver-monitoring and speed alerts", "Driving and safety", "How attention and speed-limit warnings behave, whether they can be quietened and whether the setting survives a restart."),
    ("parking_cameras", "Parking cameras and sensors", "Driving and safety", "Reversing or 360-degree camera and parking sensors on the selected trim."),
    ("real_world_range", "Real-world range", "Charging and energy", "Independent on-road range results, with the tester and protocol named; not a laboratory figure."),
    ("energy_use", "Energy use", "Charging and energy", "Official energy consumption with its test basis, and a yearly cost at stated assumptions."),
    ("battery_chemistry", "Battery chemistry", "Charging and energy", "Cell chemistry and the maker's everyday charge-limit advice."),
    ("home_charging", "Home charging time", "Charging and energy", "Time to charge on a single-phase 7 kW wallbox, the usual Australian home set-up."),
    ("charging_cable", "Charging cables included", "Charging and energy", "Portable charger and cables supplied with the car."),
    ("bidirectional_v2g", "Home and grid power (V2H/V2G)", "Charging and energy", "Whether the car can power a house or export to the grid in Australia; vehicle-to-load is a separate row."),
    ("child_seats", "Child-seat anchor points", "Space and ownership", "ISOFIX and top-tether positions, and known fitting limits."),
    ("spare_tyre", "Spare tyre", "Space and ownership", "Spare wheel, repair kit or neither."),
    ("screens_hud", "Screens and head-up display", "Digital experience", "Centre screen, driver display, rear screen and head-up display on the selected trim."),
    ("audio_system", "Sound system", "Digital experience", "Speaker count and branded audio on the selected trim."),
    ("glass_roof", "Glass roof and shade", "Climate and comfort", "Fixed or opening glass roof and whether a blind is fitted."),
    ("power_tailgate", "Powered tailgate", "Access and automation", "Powered opening and closing on the selected trim."),
    ("wireless_charging", "Wireless phone charging", "Digital experience", "Wireless charging pads and their rated output."),
]
# key, label, unit
fact_meta = {
    "ground_clearance_mm": ("Ground clearance", "mm"),
    "turning_circle_m": ("Turning circle", "m"),
    "kerb_weight_kg": ("Kerb weight", "kg"),
    "towing_unbraked_kg": ("Unbraked towing", "kg"),
}

features = {}
facts = {}
SCOPE = "Buyer-question check, 7 October 2026"


def feat(vids, criterion, status, value, conditions, source_ids, label=""):
    assert criterion in {c[0] for c in criteria}, criterion
    for vid in vids if isinstance(vids, list) else [vids]:
        features[(vid, criterion)] = {
            "variant_id": vid,
            "model_id": variants[vid]["model_id"],
            "criterion": criterion,
            "status": status,
            "value": value,
            "conditions": conditions,
            "condition_label": label,
            "source_ids": source_ids,
            "evidence_scope": SCOPE,
            "last_evidence_date": DATE,
            "reviewed_date": DATE,
            "verification_state": "buyer_check_2026-10-07",
        }


def fact(vids, key, value, basis, source_ids, status="standard", qualifications=None):
    label, unit = fact_meta[key]
    for vid in vids if isinstance(vids, list) else [vids]:
        facts[(vid, key)] = {
            "variant_id": vid,
            "key": key,
            "label": label,
            "value": value,
            "unit": unit,
            "basis": basis,
            "status": status,
            "date": DATE,
            "sourceIds": source_ids,
            "qualifications": qualifications or [],
        }


# Rows live beside this script: sources and cost of ownership first, then the car itself.
exec(open("scripts/buyer_rows.py").read())
exec(open("scripts/buyer_rows_2.py").read())

# Publishers that refused a direct fetch, or pages reached only through a search result, were
# read as search summaries. The reader is told, and the pages need opening before publication.
SUMMARY_ONLY = {
    "b7_pwc_fbt", "b7_ato_lct", "b7_zecar_fbt", "b7_tesla_gfv", "b7_kia_gfv", "b7_datium_resale", "b7_tesla_warranty",
    "b7_geely_launch", "b7_tesla_centres", "b7_tesla_mobile", "b7_byd_network", "b7_zeekr_network", "b7_oj_network",
    "b7_kia_million", "b7_tesla_speed", "b7_kia_isla", "b7_kia_adas", "b7_geely_ota", "b7_geely_driven", "b7_jaecoo_driven",
    "b7_zeekr_electrive", "b7_evkx_j5", "b7_driven_7x_tow", "b7_gridly_chem", "b7_carsguide_y_batt", "b7_driven_m3_perf",
    "b7_tesla_cable", "b7_gridly_cable", "b7_zeekr_inclusions", "b7_tesla_powershare", "b7_ancap_y_l", "b7_zecar_y_l",
}
assert SUMMARY_ONLY <= {s["id"] for s in sources}
for s in sources:
    if s["id"] in SUMMARY_ONLY:
        s["access_limitation"] = "Read through a search summary on 7 October 2026; the page itself was not opened."

# OUTPUT
used = {i for f in features.values() for i in f["source_ids"]} | {i for f in facts.values() for i in f["sourceIds"]}
new_ids = {s["id"] for s in sources}
unknown = sorted(used - new_ids - existing_sources)
if unknown:
    sys.exit(f"Unknown source ids: {unknown}")
missing = [(v, c[0]) for v in variants for c in criteria if (v, c[0]) not in features]
missing += [(v, k) for v in variants for k in fact_meta if (v, k) not in facts]
for vid, key in missing:
    # A visible gap, never a silent one: the audit script reports these cells as open.
    if key in fact_meta:
        fact(vid, key, None, "Not yet researched", [], status="not_verified")
    else:
        feat(vid, key, "not_verified", "Needs confirmation", "", [])
out = {
    "date": DATE,
    "note": "Rows added on 7 October 2026 for questions buyers ask that the supplied criteria did not cover. Desk research; no matched road test.",
    "sources": [s for s in sources if s["id"] in used],
    "criteria": [{"key": k, "label": l, "group": g, "definition": d} for k, l, g, d in criteria],
    "features": [features[(v, c[0])] for v in variants for c in criteria],
    "facts": [facts[(v, k)] for v in variants for k in fact_meta],
}
json.dump(out, open("data/research-buyer-2026-10-07.json", "w"), indent=1, ensure_ascii=False)
print(f"{len(out['features'])} feature rows, {len(out['facts'])} facts, {len(out['sources'])} sources; {len(missing)} cells open")
for vid, key in missing:
    print("OPEN", vid, key)
sys.exit(1 if missing else 0)
