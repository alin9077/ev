#!/usr/bin/env python3
"""Builds data/research-completion-2026-10-07.json.

Resolves the feature rows and specification cells that still read
"Needs confirmation" after the 6 October overlays, using the documents saved in
qa/research/2026-10-07 and the pages recorded as sources below. The original
research JSON is never modified. Run from the project root:

    python3 scripts/build-completion-overlay.py
"""
import json

DATE = "2026-10-07"
base = json.load(open("data/au_ev_all_variants_2026-10-06.json"))
refinement = json.load(open("data/research-refinement-2026-10-06.json"))
usability = json.load(open("data/research-usability-2026-10-06.json"))

prior = {}
for p in refinement["features"]:
    prior[(p["variant_id"], p["criterion"])] = p
for p in usability["features"]:
    prior[(p["variant_id"], p["criterion"])] = p
effective = {
    (f["variant_id"], f["criterion"]): {**f, **prior.get((f["variant_id"], f["criterion"]), {})}
    for f in base["feature_evidence"]
}
variants = {v["id"]: v for v in base["variants"]}
by_model = {}
for v in base["variants"]:
    by_model.setdefault(v["model_id"], []).append(v["id"])


def src(id, url, title, publisher, kind, supports, market="AU"):
    return {
        "id": id,
        "url": url,
        "title": title,
        "publisher": publisher,
        "source_type": kind,
        "published_date": None,
        "accessed_date": DATE,
        "market": market,
        "supports": supports,
        "fresh_check": True,
    }


P, I = "manufacturer_primary", "industry_reporting"
sources = [
    src("r6_kia_ev3_spec", "https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev3/kia-ev3-brochure.pdf", "Kia EV3 MY27 Australian specification sheet", "Kia", P, "Four FWD grades. Pack energy 58.3/81.4 kWh and battery weight 375/470 kg; boot 460 L, frunk 25 L; towing 500/1,000 kg braked; smart-key fob, no Digital Key, no rear seat heating, no heat pump, no Remote Smart Parking Assist row; Utility Mode, V2L and Lead Vehicle Departure Alert standard."),
    src("r6_kia_ev5_spec", "https://www.kia.com/content/dam/kwcms/au/en/images/pdf/ev5/kia-ev5-brochure.pdf", "Kia EV5 Australian specification sheet", "Kia", P, "Pack energy 64.2/88.1 kWh and battery weight 428/573/574 kg; cargo 513 L seats up and 1,714 L seats down (VDA); frunk 67 L; GT-Line-only Remote Smart Park Assist 2, heated rear seats and heated steering wheel; no factory dashcam, Digital Key or heat pump row."),
    src("r6_kia_ev3_manual", "https://www.kia.com/content/dam/kwcms/au/en/files/owners-manuals/ev3/Kia-EV3-SV-owners-manual-MY25.pdf", "Kia EV3 Australian owner's manual (737 pages, full-text search)", "Kia", P, "No walk-away locking, Pet Mode, cabin overheat protection, built-in camera recording, garage opener or traffic-light alert. Doors relock 30 seconds after an unused unlock. Digital Key 2, Approach Unlock and Remote Smart Parking Assist are marked 'if equipped'. Leading Vehicle Departure Alert p. 481; Utility Mode p. 25; Auto Comfort Control for the driver's seat p. 280 (if equipped)."),
    src("r6_kia_ev5_manual", "https://www.kia.com/content/dam/kwcms/au/en/files/owners-manuals/ev5/Kia-EV5-OVc-EV-owners-manual-MY25.pdf", "Kia EV5 Australian owner's manual (740 pages, full-text search)", "Kia", P, "No walk-away locking, Pet Mode, cabin overheat protection, built-in camera recording, garage opener or traffic-light alert. Leading Vehicle Departure Alert p. 467; Utility Mode p. 26; approach unlock with the smart key p. 188."),
    src("r6_kia_ev3_awd_goauto", "https://goauto.com.au/new-models/kia/ev3/gt-line/2026-07-13/99807.html", "Kia EV3 GT-Line AWD Australian launch report", "GoAuto", I, "A$66,490 plus on-road costs; September 2026; dual motor 195 kW/385 Nm; 0-100 km/h 6.6 s; 81.4 kWh; up to 559 km WLTP; larger brakes and Australian suspension tune."),
    src("r6_kia_ev3_awd_evcentral", "https://evcentral.com.au/more-grip-but-no-gt-kia-ev3-awd-confirmed-for-australia-with-195kw-559km-range-and-local-chassis-tune/", "Kia EV3 AWD confirmed for Australia", "EV Central", I, "GT-Line AWD equipment: 19-inch wheels, head-up display, heated and ventilated front seats, heated steering wheel, V2L, wireless phone projection, OTA updates, powered driver's seat and tailgate."),
    src("r6_evspec_ev3_awd", "https://www.evspecifications.com/en/model/3852510", "2027 Kia EV3 GT-Line AWD specification record", "EVSpecifications", "independent_database", "Kerb weight 1,995 kg; luggage 460 L; front compartment 25 L. Overseas database record, not a Kia Australia document.", "Global"),
    src("r6_evdb_ev3_lr", "https://ev-database.org/car/2212/Kia-EV3-Long-Range", "Kia EV3 Long Range", "EV Database", "independent_database", "Fast-charge peak 135 kW; cargo 460 L, 1,251 L maximum; 25 L front; 1,000 kg braked towing; heat pump optional by country. European record.", "EU"),
    src("r6_evdb_ev3_sr", "https://ev-database.org/car/2211/Kia-EV3-Standard-Range", "Kia EV3 Standard Range", "EV Database", "independent_database", "Fast-charge peak 100 kW; 10-80% about 30 minutes. European record.", "EU"),
    src("r6_carexpert_ev5", "https://www.carexpert.com.au/car-reviews/2026-kia-ev5-review-1", "2026 Kia EV5 review", "CarExpert", I, "Long Range maximum DC charge rate 140 kW; 513 L boot, 1,714 L folded, 67 L frunk; 7-year vehicle and 7-year/150,000 km battery warranty."),
    src("r6_carexpert_ev3", "https://www.carexpert.com.au/car-reviews/2025-kia-ev3-review-2", "2025 Kia EV3 review", "CarExpert", I, "Reports that no heat pump is available for Australia, even as an option."),
    src("r6_atto2_spec", "https://bydautomotive.com.au/brochures/BYD-ATTO-2-2025.pdf", "BYD ATTO 2 Australian specification sheet (visually inspected)", "BYD", P, "Boot 380 L, 1,320 L maximum; no front boot row; heat pump, NFC card key, BYD digital key and Bluetooth key standard on both grades; no heated steering wheel or rear seat heating row; 82 kW DC; no tow rating row."),
    src("r6_atto2_manual", "https://bydautomotive.com.au/brochures/BYD-ATTO-2-Owners-Handbook-2025.pdf", "BYD ATTO 2 Australian owner's handbook (210 pages, full-text search)", "BYD", P, "Towing 750 kg maximum with the towing function fitted (p. 94). No walk-away locking, Pet Mode, parked recording, cabin overheat protection, remote parking, garage opener, traffic-light alert, automatic seat climate or cloud driver profiles."),
    src("r6_evo_manual", "https://bydautomotive.com.au/brochures/BYD-ATTO-3-EVO-Premium-Owners-Handbook.pdf?v=1", "BYD ATTO 3 EVO Australian owner's handbooks, Premium and Dynamic (full-text search)", "BYD", P, "Towing table 1,500 kg braked (Premium, p. 102). No walk-away locking, Pet Mode, parked recording, cabin overheat protection, remote parking, garage opener, traffic-light alert, automatic seat climate or cloud driver profiles."),
    src("r6_atto3_spec", "https://bydautomotive.com.au/brochures/BYD-ATTO-3-2026.pdf", "BYD ATTO 3 Australian specification sheet", "BYD", P, "Luggage 440 L minimum, 1,340 L maximum; no front boot; 750 kg braked towing; heated front seats listed, no ventilation, rear seat heating or steering-wheel heating row; built-in dash camera row."),
    src("r6_atto3_manual", "https://bydautomotive.com.au/brochures/BYD-ATTO-3-Owners-Handbook-2025.pdf", "BYD ATTO 3 Australian owner's handbook (210 pages, full-text search)", "BYD", P, "START/STOP button operation; driving recorder with SD card (p. 146). No walk-away locking, Pet Mode, parked recording, cabin overheat protection, remote parking, garage opener, traffic-light alert or navigation-triggered battery conditioning."),
    src("r6_byd_sealion_global", "https://www.byd.com/iq/car/sealion-7", "BYD SEALION 7 overseas product page", "BYD", P, "Overseas figure of 1,789 L with the rear seats folded (520 L seats-up basis). BYD Australia publishes 500 L rear and 58 L front only.", "Global"),
    src("r6_byd_charging_guide", "https://www.byd.com/uk/electric-cars/guides/guide-to-electric-car-charging-times", "BYD guide to charging times", "BYD", P, "ATTO 3 60.48 kWh: 30-80% in about 29 minutes at up to 88 kW DC. UK publication.", "UK"),
    src("r6_byd_referral", "https://bydautomotive.com.au/referral-program", "BYD Australia referral program page", "BYD", P, "Page shows only the heading 'BYD Referral Program - Join the BYD Family'. No reward, eligibility or expiry terms are published."),
    src("r6_ancap_register", "https://www.ancap.com.au/safety-ratings?q=atto", "ANCAP safety ratings register search", "ANCAP", "independent_safety_assessment", "BYD entries: ATTO 1, ATTO 3, SEAL 6, SEALION 7, SHARK 6 and M9. No ATTO 2 entry. Jaecoo: J7 only, no J5 entry."),
    src("r6_ancap_atto3", "https://www.ancap.com.au/safety-ratings/byd/atto-3/e5634a", "BYD ATTO 3 ANCAP rating", "ANCAP", "independent_safety_assessment", "Five stars, 2022 datestamp, expires December 2028. 'Applies to: All Australian variants', build dates May 2022 onwards; the narrative names Standard Range and Extended Range variants. EVO is not named."),
    src("r6_geely_spec", "https://tddashboard.s3.ap-southeast-2.amazonaws.com/1773386427-geely-ex5-brochure.pdf", "Geely EX5 2026 Australian brochure and specification guide", "Geely", P, "Luggage 302 L (410 L expanded), 1,877 L second row down; no front storage listed; proximity key; first-row seat heating only; heated steering wheel; heat pump A/C; Camping Space; full driver-assistance suite standard on both grades; towing preparation harness."),
    src("r6_geely_tow", "https://zecar.com/reviews/geely-ex5-750kg-tow-rating-new-variant", "Geely EX5 tow-rating approval report", "Zecar", I, "Every EX5 variant on sale, including the three 68.39 kWh approvals, is rated 0 kg braked and unbraked. Two new towbar variants were filed (750 kg) but are not on sale."),
    src("r6_geely_dashcam", "https://dashcamguys.com.au/blogs/guides/best-dash-cam-for-the-geely-ex5-in-australia", "Geely EX5 dash cam guide", "Dashcam Guys", I, "Reports that overseas EX5s have a factory driving recorder and sentry mode, and that Australian-delivered cars arrived without them switched on."),
    src("r6_geely_review", "https://www.carexpert.com.au/car-reviews/2026-geely-ex5-review-1", "2026 Geely EX5 review", "CarExpert", I, "Heat pump standard; 302-410 L boot, 1,877 L folded; walk-away locking present but inconsistent; 100 kW DC, 30-80% in 20 minutes."),
    src("r6_zeekr_manual", "https://www.zeekr7xaustralia.com.au/info/Zeekr%207X%20User%20Manual%20Z7XA.pdf", "Zeekr 7X user manual, Australian owner mirror (429 pages, full-text search)", "Zeekr", "manufacturer_document_mirror", "Approach unlock and walk-away lock p. 44; Sentry Mode with recording pp. 317-319; Pet Mode p. 320; Camping Mode pp. 320-321; charging-point battery preheating p. 337; position memory for seats, mirrors, wheel and HUD p. 70, three driving positions per ZEEKR ID p. 185; auto-fold mirrors on lock p. 40; automatic steering-wheel heating p. 159. No driving recorder, garage opener, cabin overheat protection, automatic seat climate or traffic-light alert."),
    src("r6_zeekr_brochure", "https://www.datocms-assets.com/130529/1755670382-au-7x-brochure-200825-web.pdf", "Zeekr 7X Australian brochure - cargo", "Zeekr", P, "'Electric boot access with up to 1978L of space'; 62 L frunk, stated for the RWD version."),
    src("r6_zeekr_awd_review", "https://www.chasingcars.com.au/reviews/midsize-suvs/zeekr-7x-performance-awd-2026-review/", "Zeekr 7X Performance AWD 2026 review", "Chasing Cars", I, "Reported 42 L front storage on the dual-motor car, against 62 L on rear-drive versions."),
    src("r6_jaecoo_spec", "https://www.omodajaecoo.com.au/sites/default/files/2026-05/Spec25_Jaecoo_J5_Spec_Sheet_AU_BEV_v101_compressed_compressed.pdf", "Jaecoo J5 EV Australian specification sheet, edition 1.01", "Jaecoo", P, "Two proximity keys, passive entry and start, walk-away auto locking, remote start; heated and ventilated front seats only; no heated steering wheel, heat pump, dashcam, phone key, navigation or optional pack listed; luggage 384 L to cover, 480 L to roof."),
    src("r6_jaecoo_driven_aug", "https://thedriven.io/2026/08/13/jaecoo-j5-ev-review-whats-the-catch-at-36990-driveaway/", "Jaecoo J5 EV review", "The Driven", I, "Describes a dedicated Pet Mode that keeps climate control running for short periods and shows a message to people outside."),
    src("r6_jaecoo_driven_mar", "https://thedriven.io/2026/03/02/jaecoo-j5-ev-review-head-turning-electric-suv-from-36990-driveaway/", "Jaecoo J5 EV review", "The Driven", I, "480 L boot and a 35 L frunk with drain plug; a regenerative-braking fix was expected by OTA update."),
    src("r6_jaecoo_zecar", "https://zecar.com/reviews/2026-jaecoo-j5-ev-review", "2026 Jaecoo J5 EV review", "Zecar", I, "384 L boot, 1,180 L with the rear seats folded, 35 L front boot."),
    src("r6_jaecoo_beep", "https://thebeep.com.au/car-reviews/2026-jaecoo-j5-ev-review/", "2026 Jaecoo J5 EV review", "The Beep", I, "Reports that the Jaecoo app pre-conditions the cabin, shows charge status and schedules charging; proximity unlocking must be enabled in the multimedia system."),
    src("r6_jaecoo_ancap", "https://mynrma.com.au/open-road/car-reviews/jaecoo/2026-jaecoo-j5-ev-review", "2026 Jaecoo J5 EV review", "NRMA", I, "ANCAP: not tested."),
    src("r6_atto2_ancap", "https://www.mynrma.com.au/open-road/car-reviews/byd/2026-byd-atto-2-local-review", "2026 BYD ATTO 2 local review", "NRMA", I, "The ATTO 2 has not been crash-tested by ANCAP."),
    src("r6_tesla_y_tow", "https://www.tesla.com/ownersmanual/modely/en_au/GUID-F5C80FF5-8DE3-4750-8BAF-0DCC0CFA0C5C.html", "Model Y Australian manual - towing and accessories", "Tesla", P, "Five-seat and Performance: 1,588 kg. Six-seat: 3,500 lb with four or fewer occupants (printed as 1,558 kg; 3,500 lb is 1,588 kg), reducing to 1,043 kg with six occupants. Separate trailer brakes recommended above 750 kg."),
    src("r6_tesla_subsystems", "https://www.tesla.com/ownersmanual/modely/en_au/GUID-E414862C-CFA1-4A0B-9548-BE21C32CAA58.html", "Model Y and Model 3 Australian manuals - subsystems", "Tesla", P, "Rear motor: AC permanent-magnet synchronous. Front motor on AWD vehicles: AC induction. High-voltage battery: liquid-cooled lithium-ion, 345 V (Model Y) and 355 V (Model 3) nominal. No capacity, mass or motor output is published."),
    src("r6_tesla_3_dimensions", "https://www.tesla.com/ownersmanual/model3/en_au/GUID-56562137-FC31-4110-A13C-9A9FC6657BF0.html", "Model 3 Australian manual - dimensions and cargo", "Tesla", P, "Front trunk 88 L; behind second row 594 L; maximum total with five passengers 682 L. No folded-seat volume is published."),
    src("r6_tesla_3_tow", "https://shop.tesla.com/en_au/product/model-3-tow-package", "Model 3 Tow Package, Tesla Australia shop", "Tesla", P, "Up to 1,000 kg; 750 kg without a brake controller. 'Compatible with all non-performance Model 3 variants'."),
    src("r6_tesla_summon", "https://www.tesla.com/en_au/support/fsd", "Tesla Australia - FSD (Supervised) feature table", "Tesla", P, "Dumb Summon and Actually Smart Summon are both marked 'Upcoming' in Australia. The Australian manual says Summon may be inactive on vehicles built from about mid-February 2024 until a future update."),
    src("r6_tesla_3_design", "https://www.tesla.com/en_au/model3/design", "Tesla Model 3 Australian configurator - Rear-Wheel Drive feature list", "Tesla", P, "A$45,900, 572 km WLTP, 6.2 s. Interior list: textile and vegan leather seats, heated first-row seats, manual-folding second row. No heated steering wheel is listed."),
    src("r6_carexpert_tesla_y", "https://www.carexpert.com.au/tesla/model-y/2026-premium-long-range-suv-4x4-electric-jsfmmkko20260410", "Tesla Model Y 2026 price and specifications data", "CarExpert", "independent_database", "Industry data feed, not a Tesla publication: battery 60 kWh (Rear-Wheel Drive), 79 kWh (Premium Long Range and L), 84.7 kWh (Performance); front motor 158 kW; rear motor 220 kW (Premium Long Range), 208 kW (L), 303 kW (Performance)."),
    src("r6_evdb_tesla", "https://ev-database.org/car/3333/Tesla-Model-Y-Premium-AWD", "Tesla Model Y and Model 3 records", "EV Database", "independent_database", "European estimates: Model Y 10-80% in about 27-28 minutes; Model 3 RWD 60 kWh usable, 175 kW peak, about 24 minutes; Model 3 Long Range and Performance 79 kWh usable, about 28 minutes. Not Australian-build measurements.", "EU"),
    src("r6_tesla_3_battery", "https://www.chasingcars.com.au/news/new-car-prices/new-tesla-model-3-2026-long-range-rwd-drives-up-to-750km-on-a-single-charge-beating-byd-seal-and-polestar-2/", "Tesla Model 3 2026 Long Range RWD report", "Chasing Cars", I, "Reports a 78.4 kWh LG NMC pack for the 750 km Long Range RWD and a 62.5 kWh LFP pack for the 520 km RWD."),
]

sources += [
    src("r6_kia_offers", "https://www.kia.com/au/shopping-tools/offers.html", "Kia Australia offers page", "Kia", P, "No referral or refer-a-friend program appears on Kia Australia's offers page or home page."),
    src("r6_geely_offers", "https://www.geely.com.au/offers", "Geely Auto Australia offers page", "Geely", P, "No referral or refer-a-friend program appears on Geely Auto Australia's offers page."),
    src("r6_jaecoo_offers", "https://www.omodajaecoo.com.au/buying/offers", "Omoda Jaecoo Australia offers page", "Jaecoo", P, "No referral or refer-a-friend program appears on the offers page."),
]
features = []
facts = []


def readable(value):
    """Mirrors the site adapter's text for booleans and structured values."""
    if value is None:
        return None
    if isinstance(value, bool):
        return "Included" if value else "Not available in this specification"
    if isinstance(value, list):
        return ", ".join(str(readable(x)) for x in value)
    if isinstance(value, dict):
        return "; ".join(f"{k.replace('_', ' ')}: {readable(v) or 'not stated'}" for k, v in value.items())
    return str(value)

SHARED = "Australian document check, 7 October 2026"


def feat(ids, criterion, status, value, conditions, source_ids, scope=SHARED, force=False):
    for vid in ids:
        cur = effective[(vid, criterion)]
        needs = cur["status"] == "not_verified" or cur.get("confirmation_needed")
        if not (needs or force):
            continue
        features.append({
            "variant_id": vid,
            "criterion": criterion,
            "status": status,
            "value": value,
            "conditions": conditions,
            "source_ids": source_ids or cur["source_ids"],
            "evidence_scope": scope,
            "last_evidence_date": DATE,
            "reviewed_date": DATE,
            "verification_state": "resolved_2026-10-07",
        })


def fact(ids, key, value, status, source_ids, basis=None, unit=None):
    for vid in ids:
        row = {"variant_id": vid, "key": key, "value": value, "status": status, "date": DATE, "sourceIds": source_ids}
        if basis:
            row["basis"] = basis
        if unit is not None:
            row["unit"] = unit
        facts.append(row)


LATER = " A later software update could change this."
UNPUBLISHED = "Checked 7 October 2026: no pack mass or Wh/kg figure is published for this market, so a like-for-like pack density cannot be stated. Capacity divided by vehicle weight is not a valid substitute."
MEDIA = "Not documented by the manufacturer. Bluetooth and phone-projection playback is resumed by the phone; in-car streaming apps follow their own sign-in."

# ---------------------------------------------------------------- Kia EV3
ev3 = by_model["kia_ev3"]
ev3_fwd = [v for v in ev3 if "awd" not in v]
ev3_awd = [v for v in ev3 if "awd" in v]
K3 = ["r6_kia_ev3_spec", "r6_kia_ev3_manual"]
feat(ev3_fwd, "phone_key", "unavailable", "No phone key in Australia — smart-key fob", "The MY27 Australian equipment list has the smart key only. Digital Key 2 appears in the owner's manual marked 'if equipped' and is not on the Australian list. Kia Connect remote unlock is not a driving key.", K3)
feat(ev3_fwd, "passive_unlock", "standard", "Smart-key fob: touch the front door handle", "Keep the fob on you and touch the handle sensor. Phone-based Approach Unlock belongs to Digital Key 2, which is not fitted in Australia.", K3)
feat(ev3_fwd, "walk_away_lock", "unavailable", "Not offered — lock by handle, fob or app", "The owner's manual has no walk-away locking. Doors relock 30 seconds after an unlock if no door is opened, and lock above a set speed.", K3)
feat(ev3_fwd, "rear_heated_seats", "unavailable", "Not fitted on any Australian EV3 grade", "The Australian equipment list has heated front seats on Earth and GT-Line only.", ["r6_kia_ev3_spec"])
feat(ev3_fwd, "garage_integration", "unavailable", "No built-in garage-door opener", "Neither the equipment list nor the owner's manual includes HomeLink or a connected garage function.", K3)
feat(ev3_fwd, "adas_optional", "unavailable", "No optional packs — assistance is fixed by grade", "Kia Australia sells no paid driver-assistance package or subscription for EV3.", ["r6_kia_ev3_spec"])
feat(ev3_fwd, "sentry_parked_recording", "unavailable", "No parked video recording", "No camera recording function is in the Australian manual or equipment list. The alarm and Kia Connect alerts do not store video.", K3)
feat(ev3_fwd, "dashcam", "unavailable", "No built-in dashcam", "No factory driving recorder is listed. A dealer or aftermarket camera is a separate accessory.", K3)
feat(ev3_fwd, "pet_mode", "unavailable", "No Pet Mode — Utility Mode keeps climate running", "Utility Mode runs climate from the drive battery while parked, without a pet display or lock-out.", K3)
feat(ev3_fwd, "cabin_overheat_protection", "unavailable", "Not offered", "No automatic parked cabin-temperature protection is in the Australian manual. Remote climate through Kia Connect is manual.", K3)
feat(ev3_fwd, "remote_summon", "unavailable", "Not fitted on Australian EV3", "Remote Smart Parking Assist is in the manual as 'if equipped' and is absent from the Australian equipment list.", K3)
feat(ev3_fwd, "traffic_light_chime", "unavailable", "No green-light chime — Lead Vehicle Departure Alert instead", "The standard alert tells you when the vehicle ahead moves off. It does not read traffic lights.", K3)
feat([v for v in ev3_fwd if "standard_range" in v], "battery_density", "standard", "About 155 Wh/kg at pack level", "Calculated from Kia Australia's figures: 58.3 kWh pack energy and 375 kg battery weight.", ["r6_kia_ev3_spec"])
feat([v for v in ev3_fwd if "long_range" in v], "battery_density", "standard", "About 173 Wh/kg at pack level", "Calculated from Kia Australia's figures: 81.4 kWh pack energy and 470 kg battery weight.", ["r6_kia_ev3_spec"])
feat(ev3_fwd, "referral_program", "unavailable", "No national Kia referral program", "Kia Australia publishes no owner-referral reward. Dealer offers are separate and change.", ["r6_kia_offers"])
feat(ev3_fwd, "heat_pump", "unavailable", "No heat pump in Australia", "Not on the Australian equipment list; CarExpert reports it is not offered locally, even as an option.", ["r6_kia_ev3_spec", "r6_carexpert_ev3"])

AWD_SRC = ["r6_kia_ev3_spec", "r6_kia_ev3_awd_goauto", "r6_evspec_ev3_awd"]
AWD_BASIS = "GT-Line body and 81.4 kWh pack figures from Kia Australia's sheet, applied to the announced AWD version"
fact(ev3_awd, "length_mm", 4310, "conditional", AWD_SRC, AWD_BASIS)
fact(ev3_awd, "width_mm", 1850, "conditional", AWD_SRC, AWD_BASIS)
fact(ev3_awd, "height_mm", 1570, "conditional", AWD_SRC, AWD_BASIS)
fact(ev3_awd, "wheelbase_mm", 2680, "conditional", AWD_SRC, AWD_BASIS)
fact(ev3_awd, "boot_l", 460, "conditional", AWD_SRC, "VDA, five seats up; GT-Line figure, matched by an overseas AWD record")
fact(ev3_awd, "frunk_l", 25, "conditional", AWD_SRC, "GT-Line figure, matched by an overseas AWD record")
fact(ev3_awd, "ac_kw", 10.5, "conditional", AWD_SRC, "Three-phase onboard charger shared across the EV3 range")
fact(ev3_awd, "dc_charge_time_min", 31, "conditional", AWD_SRC, "10-80% on a 350 kW supply for the shared 81.4 kWh pack; not an AWD-specific Kia Australia figure")
fact(ev3_awd, "towing_braked_kg", 1000, "conditional", ["r6_kia_ev3_spec", "r6_evdb_ev3_lr"], "Long Range rating on Kia Australia's sheet; AWD-specific rating not yet published")
EVDB_BASIS = "Independent European figure; Kia Australia publishes charge times, not a vehicle peak"
fact([v for v in ev3 if "standard_range" in v], "dc_peak_kw", 100, "conditional", ["r6_evdb_ev3_sr"], EVDB_BASIS)
fact([v for v in ev3 if "long_range" in v], "dc_peak_kw", 135, "conditional", ["r6_evdb_ev3_lr"], EVDB_BASIS)
fact(ev3, "max_total_cargo_l", 1251, "conditional", ["r6_evdb_ev3_lr"], "VDA, rear seats folded; European figure — Kia Australia's sheet lists seats-up volume only")

# ---------------------------------------------------------------- Kia EV5
ev5 = by_model["kia_ev5"]
K5 = ["r6_kia_ev5_spec", "r6_kia_ev5_manual"]
feat(ev5, "walk_away_lock", "unavailable", "Not offered — lock by handle, fob or app", "The owner's manual has no walk-away locking. Doors relock 30 seconds after an unlock if no door is opened.", K5)
feat(ev5, "garage_integration", "unavailable", "No built-in garage-door opener", "Neither the equipment list nor the owner's manual includes HomeLink or a connected garage function.", K5)
feat(ev5, "sentry_parked_recording", "unavailable", "No parked video recording", "No camera recording function is in the Australian manual or equipment list.", K5)
feat(ev5, "dashcam", "unavailable", "No built-in dashcam", "No factory driving recorder is listed. A dealer or aftermarket camera is a separate accessory.", K5)
feat(ev5, "pet_mode", "unavailable", "No Pet Mode — Utility Mode keeps climate running", "Utility Mode runs climate from the drive battery while parked, without a pet display or lock-out.", K5)
feat(ev5, "cabin_overheat_protection", "unavailable", "Not offered", "No automatic parked cabin-temperature protection is in the Australian manual.", K5)
feat(ev5, "traffic_light_chime", "unavailable", "No green-light chime — Lead Vehicle Departure Alert instead", "The standard alert tells you when the vehicle ahead moves off. It does not read traffic lights.", K5)
feat([v for v in ev5 if "standard_range" in v], "battery_density", "standard", "About 150 Wh/kg at pack level", "Calculated from Kia Australia's figures: 64.2 kWh LFP pack and 428 kg battery weight.", ["r6_kia_ev5_spec"])
feat([v for v in ev5 if "long_range" in v], "battery_density", "standard", "About 154 Wh/kg at pack level", "Calculated from Kia Australia's figures: 88.1 kWh LFP pack and 573-574 kg battery weight.", ["r6_kia_ev5_spec"])
feat(ev5, "referral_program", "unavailable", "No national Kia referral program", "Kia Australia publishes no owner-referral reward. Dealer offers are separate and change.", ["r6_kia_offers"])
fact(ev5, "max_total_cargo_l", 1714, "standard", ["r6_kia_ev5_spec"], "VDA, rear seats down")
fact([v for v in ev5 if "long_range" in v], "dc_peak_kw", 140, "conditional", ["r6_carexpert_ev5"], "Maximum DC rate reported by CarExpert; Kia Australia's sheet gives charge times only")
fact([v for v in ev5 if "standard_range" in v], "dc_peak_kw", "Not published by Kia", "conditional", ["r6_kia_ev5_spec"], "Kia Australia gives 10-80% in about 36 minutes for the 64.2 kWh pack, an average near 75 kW (calculation)", "")

# ---------------------------------------------------------------- BYD
sea, at2, evo, leg = by_model["byd_sealion_7"], by_model["byd_atto_2"], by_model["byd_atto_3_evo"], by_model["byd_atto_3_legacy"]
for ids, manual, spec, name in [
    (sea, "r4_sealion_manual", "byd_sealion_spec", "SEALION 7"),
    (at2, "r6_atto2_manual", "r6_atto2_spec", "ATTO 2"),
    (evo, "r6_evo_manual", "r3_evo_spec", "ATTO 3 EVO"),
    (leg, "r6_atto3_manual", "r6_atto3_spec", "ATTO 3"),
]:
    B = [manual, spec]
    feat(ids, "cloud_profile_transfer", "unavailable", "No cloud driver profiles", f"The {name} handbook has no account-synced driver profile. BYD Cloud Service covers the app, digital keys and remote functions.", [manual])
    feat(ids, "media_resume", "conditional", "Depends on the audio source", MEDIA, [manual])
    feat(ids, "garage_integration", "unavailable", "No built-in garage-door opener", "Neither the specification sheet nor the handbook includes HomeLink or a connected garage function.", B)
    feat(ids, "adas_optional", "unavailable", "No optional packs — assistance is fixed by grade", "BYD Australia sells no paid driver-assistance package or subscription for this model.", [spec])
    feat(ids, "sentry_parked_recording", "unavailable", "No parked security recording", "The handbook has no parked-event recording mode. The driving recorder and surround cameras work with the car on.", B)
    feat(ids, "pet_mode", "unavailable", "No Pet Mode", "The Australian handbook has no pet or retained-climate mode. Remote A/C from the BYD app is a separate, timed function." + LATER, [manual])
    feat(ids, "cabin_overheat_protection", "unavailable", "Not offered", "No automatic parked cabin-temperature protection is in the handbook. Child Presence Detection, where fitted, is a different alert.", [manual])
    feat(ids, "traffic_light_chime", "unavailable", "No green-light chime", "No traffic-light or departure reminder is in the handbook.", [manual])
    feat(ids, "battery_density", "unavailable", "Not published by BYD Australia", UNPUBLISHED, [spec])
    feat(ids, "referral_program", "conditional", "Referral page is live; no reward terms published", "BYD Australia's referral page shows a heading only. Ask the dealer for the current reward, eligibility and expiry in writing.", ["r6_byd_referral"])
    feat(ids, "walk_away_lock", "unavailable", "Not offered — lock by handle button, fob, card or app", "The handbook has no walk-away locking. Doors relock on their own only after an unlock with no door opened.", [manual], force=ids is sea)
    feat(ids, "automatic_seat_climate", "unavailable", "Manual only — no automatic seat heating or ventilation", "Seat heating and ventilation are set on the touchscreen or by voice. The handbook has no temperature-linked automatic mode.", [manual], force=ids is sea)
    feat(ids, "automatic_start", "unavailable", "Press the brake and the START/STOP button", "The handbook's starting procedure uses the START/STOP button with a valid key inside.", [manual], force=ids is sea)
    feat(ids, "automatic_shutdown", "unavailable", "Press START/STOP to switch off", "The handbook has no exit- or lock-triggered shutdown. Switching off unlocks the doors.", [manual], force=ids is sea)
feat(sea, "remote_summon", "unavailable", "Not offered in Australia", "No remote parking is on the Australian specification sheet and the handbook has no operating section. Its warning-message table carries a generic 'remote drive' message only.", ["r4_sealion_manual", "byd_sealion_spec"])
feat(at2 + evo + leg, "remote_summon", "unavailable", "Not offered", "No remote parking or summon function is in the handbook or specification sheet.", None)
feat(at2 + leg, "battery_preconditioning_navigation", "unavailable", "No navigation-triggered battery conditioning", "The handbook has no charger-destination battery preparation.", None)
feat(at2, "rear_heated_seats", "unavailable", "Not fitted", "The Australian equipment list has heated and ventilated front seats on Premium only, and no rear seat heating.", ["r6_atto2_spec"])
feat(at2, "heated_steering_wheel", "unavailable", "Not fitted", "No steering-wheel heating is on the Australian equipment list.", ["r6_atto2_spec"])
feat(at2, "navigation_route_planner", "conditional", "Phone navigation by wireless CarPlay or Android Auto", "The specification sheet lists no built-in satellite navigation row, though its notes mention three years of map updates. No charge-aware route planner is documented.", ["r6_atto2_spec"])
feat(at2, "safety_ancap", "unavailable", "Unrated — not tested by ANCAP", "ANCAP's register has no ATTO 2 entry at 7 October 2026. Unrated is not a zero-star result; ATTO 1 and ATTO 3 ratings do not transfer.", ["r6_ancap_register", "r6_atto2_ancap"])
feat(evo, "rear_heated_seats", "unavailable", "Not fitted", "The Australian equipment list has heated and ventilated front seats only.", ["r3_evo_spec"])
feat(evo, "heated_steering_wheel", "unavailable", "Not listed for Australia", "No steering-wheel heating row is on the Australian sheet. The Premium handbook describes it as market-dependent equipment.", ["r3_evo_spec", "r6_evo_manual"])
feat(evo, "heat_pump", "unavailable", "Not listed for Australia", "BYD lists a heat pump on its ATTO 2 and SEALION 7 sheets, and none on the ATTO 3 EVO sheet or in its handbooks. Overseas EVO equipment does not establish Australian fitment.", ["r3_evo_spec", "r6_evo_manual"])
feat(evo, "safety_ancap", "conditional", "5 stars (2022 ATTO 3 rating); EVO not named", "ANCAP lists the 2022 rating for 'All Australian variants' built from May 2022 until December 2028, while its text names the Standard and Extended Range cars. Ask ANCAP or BYD to confirm the EVO's rear-drive and 800 V versions are covered.", ["r6_ancap_atto3"])
feat(leg, "front_ventilated_seats", "unavailable", "Not fitted", "The Australian equipment list has heated front seats on Premium and no ventilation.", ["r6_atto3_spec"])
feat(leg, "rear_heated_seats", "unavailable", "Not fitted", "No rear seat heating is on the Australian equipment list.", ["r6_atto3_spec"])
feat(leg, "heated_steering_wheel", "unavailable", "Not fitted", "No steering-wheel heating is on the Australian equipment list.", ["r6_atto3_spec"])
fact(sea, "max_total_cargo_l", 1789, "conditional", ["r6_byd_sealion_global"], "BYD overseas figure, rear seats folded; BYD Australia publishes 500 L rear and 58 L front only")
fact(at2, "max_total_cargo_l", 1320, "standard", ["r6_atto2_spec"], "BYD Australia maximum boot/load space")
fact(at2, "frunk_l", 0, "standard", ["r6_atto2_spec"], "No front boot on the Australian specification")
fact(at2, "towing_braked_kg", 750, "conditional", ["r6_atto2_manual"], "Handbook maximum with the towing function fitted; no tow rating on the specification sheet")
fact([v for v in evo if "dynamic" in v], "max_total_cargo_l", 1340, "standard", ["r3_evo_spec"], "BYD Australia maximum boot/load space")
fact([v for v in evo if "premium" in v], "max_total_cargo_l", 1360, "standard", ["r3_evo_spec"], "BYD Australia maximum boot/load space")
fact(leg, "max_total_cargo_l", 1340, "standard", ["r6_atto3_spec"], "BYD Australia maximum luggage capacity")
fact(leg, "frunk_l", 0, "standard", ["r6_atto3_spec"], "No front boot on the Australian specification")
fact([v for v in leg if "premium" in v], "dc_charge_time_min", 29, "conditional", ["r6_byd_charging_guide"], "30-80% for the 60.48 kWh pack at up to 88 kW; BYD UK figure, not on the Australian sheet")
fact([v for v in leg if "essential" in v], "dc_charge_time_min", "Not published by BYD Australia", "conditional", ["r6_atto3_spec"], "The Australian sheet gives a 70 kW peak for the 49.92 kWh pack and no charge time", "")

# ---------------------------------------------------------------- Geely
gee = by_model["geely_ex5"]
G = ["r6_geely_spec"]
feat(gee, "phone_key", "unavailable", "No phone key — proximity fob", "The specification has a hands-free proximity key. Unlocking from the Geely app is a remote command, not a driving key.", G)
feat(gee, "cloud_profile_transfer", "unavailable", "No cloud driver profiles", "Seat memory is in the car (Inspire). No account-synced profile is documented for Australia.", G)
feat(gee, "automatic_seat_climate", "unavailable", "Manual or app control only", "Seat heating, and Inspire ventilation, are switched on the screen or from the app. No temperature-linked automatic mode is documented.", G)
feat(gee, "rear_heated_seats", "unavailable", "Not fitted", "The Australian specification has first-row seat heating only.", G)
feat(gee, "media_resume", "conditional", "Depends on the audio source", MEDIA, G)
feat(gee, "garage_integration", "unavailable", "No built-in garage-door opener", "No HomeLink or connected garage function is in the Australian specification.", G)
feat(gee, "auto_shift", "unavailable", "Driver selects D or R on the column stalk", "The specification has a steering-column shifter and no predictive gear selection.", G)
feat(gee, "adas_optional", "unavailable", "No optional packs — full suite standard", "Both grades carry the same driver-assistance list, including Intelligent Cruise Control and Auto Lane Change. Nothing is sold as an extra.", G)
feat(gee, "sentry_parked_recording", "unavailable", "Not active on Australian cars", "Overseas EX5s have a sentry mode. Australian cars are reported to have been delivered without it switched on, and it is not in the Australian specification." + LATER, ["r6_geely_spec", "r6_geely_dashcam"])
feat(gee, "dashcam", "unavailable", "Not active on Australian cars", "Overseas EX5s have a factory driving recorder. Australian cars are reported to have been delivered without it switched on, and it is not in the Australian specification." + LATER, ["r6_geely_spec", "r6_geely_dashcam"])
feat(gee, "pet_mode", "unavailable", "No Pet Mode — Camping Space and app climate instead", "The specification lists Camping Space and remote climate from the Geely app, and no pet mode.", G)
feat(gee, "cabin_overheat_protection", "unavailable", "Not offered", "No automatic parked cabin-temperature protection is in the Australian specification. The app shows cabin temperature and starts climate manually.", G)
feat(gee, "remote_summon", "unavailable", "Not offered", "No remote parking or summon function is in the Australian specification.", G)
feat(gee, "traffic_light_chime", "unavailable", "No green-light chime", "Traffic Sign Information reads signs, not traffic lights.", G)
feat(gee, "battery_preconditioning_navigation", "unavailable", "Not documented", "Built-in navigation can plan a charging stop. No battery pre-heating or cooling for that stop is documented for Australia.", G)
feat(gee, "battery_density", "unavailable", "Not published by Geely Australia", UNPUBLISHED, G)
feat(gee, "referral_program", "unavailable", "No national Geely referral program", "Geely Auto Australia publishes no owner-referral reward. Dealer offers are separate and change.", ["r6_geely_offers"])
feat(gee, "heated_steering_wheel", "unavailable", "Not listed on the earlier 60.22 kWh cars", "The earlier brochure's steering-wheel row has multi-function and manual adjustment only. The current Extended Range brochure adds a heated wheel.", ["geely_brochure_old", "r6_geely_spec"])
fact(gee, "max_total_cargo_l", 1877, "standard", G, "Geely Australia luggage space, second row down")
fact(gee, "frunk_l", 0, "standard", G, "No front storage on the Australian specification")
fact([v for v in gee if "extended_range" in v], "towing_braked_kg", 0, "standard", ["r6_geely_tow"], "Not rated to tow: 0 kg on the Australian approval for the cars on sale")

# ---------------------------------------------------------------- Zeekr
zee = by_model["zeekr_7x"]
zee_regular = [v for v in zee if "black_special" not in v]
Z = ["r6_zeekr_manual"]
ZNOTE = " Taken from the Australian-market manual on an owner site; check the installed software."
feat(zee, "cloud_profile_transfer", "conditional", "ZEEKR ID stores up to 3 driving positions", "Seat, mirror, steering-wheel and head-up display positions are saved to the signed-in account. Transfer to another car is not documented." + ZNOTE, Z)
feat(zee, "automatic_seat_climate", "unavailable", "Manual or app control — only the steering wheel heats automatically", "The manual has automatic steering-wheel heating, and no automatic seat heating or ventilation." + ZNOTE, Z)
feat(zee, "media_resume", "conditional", "Depends on the audio source", MEDIA, Z)
feat(zee, "garage_integration", "unavailable", "No built-in garage-door opener", "The manual has no HomeLink or connected garage function.", Z)
feat(zee, "auto_shift", "unavailable", "Driver selects D or R on the column stalk", "The manual has no predictive gear selection.", Z)
feat(zee, "adas_optional", "unavailable", "No optional packs — lane centring and auto lane change included", "Zeekr Australia sells no paid driving package. Adaptive cruise, Lane Centering Control and Auto Lane Change are in the standard manual.", Z + ["zeekr_au_brochure_20250820"])
feat(zee, "dashcam", "unavailable", "No driving recorder — Sentry Mode records only when parked", "Sentry Mode stores clips to 8 GB of built-in storage or a USB drive while locked in Park. The manual has no continuous driving recorder." + ZNOTE, Z)
feat(zee, "cabin_overheat_protection", "unavailable", "Not offered — Pet Mode or app climate instead", "The manual has no automatic parked cabin-temperature protection.", Z)
feat(zee, "traffic_light_chime", "unavailable", "No green-light chime", "The manual has no traffic-light or departure reminder; with adaptive cruise active the car follows the vehicle ahead when it moves.", Z)
feat(zee, "battery_density", "unavailable", "Not published by Zeekr Australia", UNPUBLISHED, ["zeekr_au_brochure_20250820"])
feat(zee_regular, "driver_profiles_local", "standard", "Seat, mirror, steering-wheel and HUD memory · 3 positions per account", "Positions are stored against the signed-in ZEEKR ID." + ZNOTE, Z + ["zeekr_au_brochure_20250820"])
feat(zee_regular, "folding_mirrors", "standard", "Power-fold mirrors · fold on lock (can be switched off)", "Also memory and reverse tilt. No location-based folding is documented." + ZNOTE, Z + ["zeekr_au_brochure_20250820"])
fact(zee_regular, "max_total_cargo_l", 1978, "standard", ["r6_zeekr_brochure"], "Zeekr Australia brochure: 'up to 1978L of space'")
fact([v for v in zee if "black_special" in v], "max_total_cargo_l", 1978, "conditional", ["r6_zeekr_brochure"], "Zeekr Australia brochure figure for the 7X body; not restated for the Black Special Edition")
fact([v for v in zee if "awd" in v], "frunk_l", 42, "conditional", ["r6_zeekr_awd_review", "r6_zeekr_brochure"], "Reported for the dual-motor car; Zeekr's brochure gives 62 L for the RWD version only")

# ---------------------------------------------------------------- Jaecoo
jae = by_model["jaecoo_j5_ev"]
J = ["r6_jaecoo_spec"]
feat(jae, "phone_key", "unavailable", "No phone key — two proximity fobs", "The Australian specification has proximity keys with passive entry and start, and no digital key.", J)
feat(jae, "cloud_profile_transfer", "unavailable", "No cloud driver profiles", "No account-synced driver profile is documented for Australia.", J)
feat(jae, "automatic_seat_climate", "unavailable", "Manual, through the touchscreen", "Front seat heating and ventilation are standard and selected on screen. No automatic mode is documented.", J)
feat(jae, "rear_heated_seats", "unavailable", "Not fitted", "The Australian specification has heated and ventilated front seats only.", J)
feat(jae, "heated_steering_wheel", "unavailable", "Not fitted", "No steering-wheel heating is on the Australian specification.", J)
feat(jae, "media_resume", "conditional", "Depends on the audio source", MEDIA, J)
feat(jae, "garage_integration", "unavailable", "No built-in garage-door opener", "No HomeLink or connected garage function is in the Australian specification.", J)
feat(jae, "adas_optional", "unavailable", "No optional packs — one grade, full suite standard", "Jaecoo Australia sells a single Summit grade with no paid driver-assistance extra.", J)
feat(jae, "sentry_parked_recording", "unavailable", "No parked security recording", "The specification has a 360-degree parking camera and alarm, and no recording function.", J)
feat(jae, "dashcam", "unavailable", "No built-in dashcam", "No driving recorder is on the Australian specification.", J)
feat(jae, "pet_mode", "conditional", "Pet Mode reported: holds climate and shows a message", "The Driven (August 2026) describes a Pet Mode for short stops. It is not on Jaecoo's specification sheet and an earlier owner report found none, so it depends on the installed software.", ["r6_jaecoo_driven_aug", "r6_jaecoo_spec"])
feat(jae, "camp_utility_mode", "unavailable", "No camping mode", "No retained-climate camping or utility mode is on the Australian specification. V2L is separate.", J)
feat(jae, "cabin_overheat_protection", "unavailable", "Not offered", "No automatic parked cabin-temperature protection is documented.", J)
feat(jae, "remote_summon", "unavailable", "Not offered", "No remote parking or summon function is on the Australian specification.", J)
feat(jae, "traffic_light_chime", "unavailable", "No green-light chime", "No traffic-light alert is on the Australian specification.", J)
feat(jae, "ota_capability_scope", "conditional", "Updates installed by dealers so far; OTA fixes promised", "Owners report workshop-installed software. Reviewers were told a regenerative-braking fix would arrive by OTA; Jaecoo publishes no OTA release notes.", ["r6_jaecoo_driven_mar", "r6_jaecoo_spec"])
feat(jae, "battery_preconditioning_navigation", "unavailable", "None — no built-in navigation", "Without built-in navigation there is no route-triggered battery conditioning. No manual battery pre-heat control is documented.", J)
feat(jae, "safety_ancap", "unavailable", "Unrated — not tested by ANCAP", "ANCAP's register has no J5 entry at 7 October 2026. Unrated is not a zero-star result; the Jaecoo J7 rating does not transfer.", ["r6_ancap_register", "r6_jaecoo_ancap"])
feat(jae, "battery_density", "unavailable", "Not published by Jaecoo Australia", UNPUBLISHED, J)
feat(jae, "referral_program", "unavailable", "No national Jaecoo referral program", "Jaecoo Australia publishes no owner-referral reward. Launch and dealer offers are separate and change.", ["r6_jaecoo_offers"])
feat(jae, "app_connectivity", "conditional", "Jaecoo app reported: cabin pre-conditioning, charge status, scheduling", "One review reports these app functions; several owners report cars with no app connection. Jaecoo's specification sheet lists no connected service, so confirm on the delivered car.", ["r6_jaecoo_beep", "r6_jaecoo_spec"])
feat(jae, "heat_pump", "unavailable", "Not listed for Australia", "The Australian specification has dual-zone automatic air conditioning and no heat pump row; reviews do not report one.", J)
fact(jae, "max_total_cargo_l", 1180, "conditional", ["r6_jaecoo_zecar", "r6_jaecoo_spec"], "Reported with rear seats folded; Jaecoo's sheet gives 384 L to the cover and 480 L to the roof")

# ---------------------------------------------------------------- Tesla
ty, t3 = by_model["tesla_model_y"], by_model["tesla_model_3"]
feat(ty + t3, "remote_summon", "unavailable", "Not yet available — listed as Upcoming in Australia", "Tesla's Australian feature table marks both Dumb Summon and Actually Smart Summon as upcoming, subject to development and regulatory approval.", ["r6_tesla_summon"], force=True)
feat(ty + t3, "battery_density", "unavailable", "Not published by Tesla", UNPUBLISHED, ["r6_tesla_subsystems"])
MOTOR = "Motor types are from Tesla's Australian manual. Tesla does not publish motor outputs; any kW figures are industry data."
for vid in ty + t3:
    drive = variants[vid]["drive"]
    if "performance" in vid:
        value = "Performance drive unit: rear permanent-magnet motor plus front induction motor"
    elif drive == "AWD":
        value = "Rear permanent-magnet motor plus front induction motor"
    else:
        value = "Single rear permanent-magnet motor"
    feat([vid], "performance_rear_motor", "standard", value, MOTOR, ["r6_tesla_subsystems", "r6_carexpert_tesla_y"])
feat(t3, "heated_steering_wheel", "unavailable", "Not listed on the entry Rear-Wheel Drive", "Tesla's Australian feature list for this trim shows heated first-row seats and no heated steering wheel.", ["r6_tesla_3_design"])
TB = "Industry data; Tesla publishes no battery capacity for Australia"
TS = ["r6_carexpert_tesla_y", "r6_tesla_subsystems"]
fact(["tesla_model_y__premium_long_range_awd__1", "tesla_model_y__l_premium_awd__4"], "battery_kwh", 79, "conditional", TS, TB)
fact(["tesla_model_y__premium_rwd__2"], "battery_kwh", 60, "conditional", TS, TB)
fact(["tesla_model_y__performance_awd__3"], "battery_kwh", 84.7, "conditional", TS, TB)
fact(["tesla_model_3__premium_long_range_rwd__1"], "battery_kwh", 78.4, "conditional", ["r6_tesla_3_battery"], "Reported LG NMC pack; Tesla publishes no battery capacity for Australia")
fact(["tesla_model_3__premium_rwd__2"], "battery_kwh", 62.5, "conditional", ["r6_tesla_3_battery"], "Reported LFP pack; Tesla publishes no battery capacity for Australia")
fact(["tesla_model_3__performance_awd__4"], "battery_kwh", 79, "conditional", ["r6_evdb_tesla"], "Independent European usable-capacity estimate; Tesla publishes no battery capacity for Australia")
fact(["tesla_model_3__rear_wheel_drive__3"], "battery_kwh", "Not published by Tesla", "conditional", ["r6_tesla_3_design", "r6_tesla_subsystems"], "Tesla publishes no capacity for this trim and no independent Australian figure was found", "")
fact(ty + t3, "dc_charge_time_min", "Not published by Tesla", "conditional", ["r6_evdb_tesla"], "Tesla quotes range added in 15 minutes, not a 10-80% time. EV Database estimates about 24-28 minutes for European equivalents", "")
fact(["tesla_model_3__premium_rwd__2"], "dc_peak_kw", 250, "conditional", ["r6_tesla_3_battery"], "Reported for the 62.5 kWh pack; Tesla Australia does not list a peak for this trim")
fact(["tesla_model_3__rear_wheel_drive__3"], "dc_peak_kw", "Not published by Tesla", "conditional", ["r6_tesla_3_design"], "Tesla Australia lists no peak charging power for this trim", "")
fact(t3, "max_total_cargo_l", "Not published by Tesla", "conditional", ["r6_tesla_3_dimensions"], "Tesla's Australian manual gives 594 L behind the second row and 88 L in front, 682 L in total with five seated, and no folded-seat volume", "")
fact(["tesla_model_y__l_premium_awd__4"], "towing_braked_kg", 1588, "conditional", ["r6_tesla_y_tow"], "With four or fewer occupants and the tow package; falls to 1,043 kg with six occupants")
fact(["tesla_model_3__performance_awd__4"], "towing_braked_kg", 0, "standard", ["r6_tesla_3_tow"], "Not rated to tow: Tesla's tow package excludes Performance")


# ------------------------------------------------ gaps inside longer values
def keep(ids, criterion, value, conditions=None, source_ids=None, status=None):
    for vid in ids:
        cur = effective[(vid, criterion)]
        features.append({
            "variant_id": vid,
            "criterion": criterion,
            "status": status or cur["status"],
            "value": value,
            "conditions": conditions if conditions is not None else cur.get("conditions", ""),
            "source_ids": sorted(set((source_ids or []) + cur["source_ids"])),
            "evidence_scope": SHARED,
            "last_evidence_date": DATE,
            "reviewed_date": DATE,
            "verification_state": "resolved_2026-10-07",
        })


sources.append(src("r6_kia_ev3_paint", "https://www.cars24.com.au/car-news/2025-kia-ev3-pricing-and-specifications/", "2025 Kia EV3 Australian pricing and specifications", "Cars24", I, "All EV3 colours other than the standard white carry a A$550 premium."))
keep(t3, "storage", "594 L boot · 88 L front · 682 L in total with five seated", "Tesla's Australian manual publishes no folded-seat volume for Model 3. Manufacturer figures, not declared VDA.", ["r6_tesla_3_dimensions"])
keep(["tesla_model_3__rear_wheel_drive__3"], "driver_profiles_local", "Driver profiles linked to keys; seat memory not listed for this trim", None, ["r6_tesla_3_design"])
keep(ev5, "paint_options_quality", "Clear White, Magma Red, Tide Blue and Starry Night Black on every grade; pearl, metallic and two-tone paint costs extra", "Kia's sheet marks premium and two-tone paint 'at additional cost' without printing the amount; get it on the quote. Paint finish quality needs an in-person look.", ["r6_kia_ev5_spec"])
keep(ev3_fwd, "paint_options_quality", "Clear White standard; six premium colours at a reported A$550", "Snow White Pearl, Ivory Silver, Aurora Black Pearl, Shale Gray, Frost Blue and Matcha Green. Kia's sheet says 'at additional cost'; A$550 is the reported 2025 surcharge, so check the quote. Paint finish quality needs an in-person look.", ["r6_kia_ev3_spec", "r6_kia_ev3_paint"])
keep(ev3_fwd, "v2l", "Interior socket and exterior adaptor included · 3.68 kVA maximum", "About 3.6 kW. V2L stops at the discharge limit you set and if the load exceeds the rating.", ["r6_kia_ev3_spec", "r6_kia_ev3_manual"], "standard")
keep(gee, "warranty_service", "7 years / unlimited km vehicle · 8 years / unlimited km battery, 70% capacity · service every 12 months / 20,000 km", "Private-use terms. Prepaid servicing A$517 (3 years), A$1,190 (5 years) or A$1,642 (7 years). Commercial use has different limits.", ["r6_geely_spec"])
keep(gee, "v2l", "3.3 kW V2L · 6.6 kW vehicle-to-vehicle", "The V2L cable (10 A, three outlets) is a A$209 Geely accessory, not listed as included.", ["r6_geely_spec"])
keep(gee, "storage", "302 L boot (410 L expanded) · 1,877 L seats folded · no front storage", "Geely's figures; test method not stated by Geely.", ["r6_geely_spec"])
keep(gee, "paint_options_quality", "Arctic White standard; five optional colours at a reported A$600", "Shadow Black, Volcanic Grey, Moonlit Silver, Aquatic Green and Jungle Green. Paint finish quality needs an in-person look.", ["r6_geely_spec"])
keep(gee, "charge_port_operation", "CCS2 / Type 2 port; Geely does not describe the flap mechanism", "Charging is scheduled from the screen or app. Geely's Australian material does not say whether the flap is powered.", ["r6_geely_spec"], "conditional")
keep(gee, "app_connectivity", "Geely app with 2 years of 4G included (2 GB a month, Optus)", "Remote climate, seats, locks, windows, tailgate, location and charging schedule. One account per car. Geely says fees may apply after the trial and has not published the amount.", ["r6_geely_spec"])
keep(gee, "alert_sound_quality", "Three selectable low-speed alert tones (February 2026 update)", "A June 2025 update made the pedestrian alert less intrusive. Whether the sounds are pleasant is a matter of taste.")
keep(gee, "style_refinement", "Five-seat SUV with flush door handles; Inspire adds ambient lighting and an opening roof", "Styling is a personal preference; there is no objective score.", ["r6_geely_spec"])
keep(gee, "interior_fit_finish_subjective", "Reviewer judged assembly positively, with hard dashboard plastic noted", "One Australian review, not a matched inspection of every trim or of long-term durability.")
keep([v for v in gee if "inspire" in v], "driver_profiles_local", "First-row seat memory · one Drive Setup preset", "The Drive Setup preset stores drive mode, regeneration and assistance settings. No multi-driver profile system is documented.", ["r6_geely_spec"])
keep([v for v in gee if "complete" in v], "driver_profiles_local", "No seat memory · one Drive Setup preset", "The Drive Setup preset stores drive mode, regeneration and assistance settings. Seat memory is Inspire-only.", ["r6_geely_spec"])
keep([v for v in zee if "awd" in v], "storage", "539 L boot · 1,978 L maximum · 42 L front storage reported", "Zeekr's brochure gives the 62 L front figure for the RWD version only; 42 L is the reported dual-motor figure.", ["r6_zeekr_brochure", "r6_zeekr_awd_review"])
keep(at2, "storage", "380 L boot · 1,320 L maximum · no front boot", "BYD Australia's figures; measurement method not given.", ["r6_atto2_spec"])
keep(leg, "storage", "440 L boot · 1,340 L maximum · no front boot", "BYD Australia's figures; measurement method not given.", ["r6_atto3_spec"])
NOMEM = "No seat-memory or driver-profile row is on the Australian equipment list, and the handbook has none."
keep(at2, "driver_profiles_local", "No seat memory or driver profiles", NOMEM, ["r6_atto2_spec", "r6_atto2_manual"], "unavailable")
keep(evo, "driver_profiles_local", "No seat memory or driver profiles", NOMEM, ["r3_evo_spec", "r6_evo_manual"], "unavailable")
keep(leg, "driver_profiles_local", "No seat memory or driver profiles", NOMEM, ["r6_atto3_spec", "r6_atto3_manual"], "unavailable")
keep(jae, "driver_profiles_local", "No seat memory or driver profiles", "The Australian specification has six-way power seats without memory, and an owner reports no profiles.", ["r6_jaecoo_spec"], "unavailable")
keep(jae, "adas_standard", "AEB, adaptive cruise with traffic-jam and integrated cruise assist, lane keeping, blind-spot and rear cross-traffic braking, driver monitoring, 360-degree camera", "All standard on the single Summit grade. There is no navigation-linked highway pilot and no automatic lane change; Lane Change Assist is a warning function.", ["r6_jaecoo_spec"])
keep(jae, "v2l", "V2L available · 3.3 kW reported · adapter not included", "Jaecoo's sheet does not print the output or an adapter price; 3.3 kW is the reported figure.", ["r6_jaecoo_spec"])
keep(jae, "paint_options_quality", "Stone Grey standard; Arctic White, Carbon Black and Stormy Blue premium", "Premium paint is 'at additional cost' on Jaecoo's sheet; A$600 was the launch surcharge. Paint finish quality needs an in-person look.", ["r6_jaecoo_spec"])
keep(jae, "warranty_service", "8 years / unlimited km vehicle and battery (private use), 70% battery capacity · service every 12 months / 20,000 km", "Commercial use is limited to 8 years / 150,000 km. Capped services alternate A$155 and A$225, A$1,520 for the first eight.", ["r6_jaecoo_spec"])

# ------------------------------------------------ earlier "still to confirm" notes
def settle(ids, criterion, value=None, conditions=None, status=None, source_ids=None):
    """Replaces a 6 October row that carried a confirmation note, keeping its usage notes."""
    for vid in ids:
        cur = effective[(vid, criterion)]
        if not cur.get("confirmation_needed"):
            continue
        row = {
            "variant_id": vid,
            "criterion": criterion,
            "status": status or cur["status"],
            "value": value or cur["value"],
            "conditions": conditions or cur["conditions"],
            "source_ids": sorted(set((source_ids or []) + cur["source_ids"])),
            "evidence_scope": SHARED,
            "last_evidence_date": DATE,
            "reviewed_date": DATE,
            "verification_state": "resolved_2026-10-07",
        }
        if cur.get("usability_notes"):
            row["usability_notes"] = cur["usability_notes"]
        features.append(row)


settle(sea, "phone_key", "Phone NFC key (BYD digital key) standard; Bluetooth key not on the Australian list", "Tap the phone on the driver's mirror to unlock and place it on the interior reader to start. Check your handset against the supported-device list in the BYD app. The handbook marks the Bluetooth key as market-dependent and BYD Australia's sheet lists only the NFC card and digital key.", "standard", ["r4_sealion_manual", "byd_sealion_spec"])
settle(sea, "passive_unlock", "Fob in pocket: press the door-handle switch · phone needs an NFC tap", "The handbook has no hands-free approach unlocking for fob or phone.", "standard", ["r4_sealion_manual"])
settle(sea, "battery_preconditioning_navigation", "No navigation-triggered conditioning · scheduled pre-departure warming above 40% charge", "The handbook's battery preheating runs with scheduled charging or departure, not on the way to a DC charger.", "conditional", ["r4_sealion_manual"])
settle(sea, "carplay_android_auto", None, None, "standard")
settle(ty, "auto_shift")
settle(ty, "media_resume")
settle(zee, "v2l", "3.3 kW V2L · starts when the V2L plug is connected", "Keep the combined load within 3.3 kW. The manual does not give a minimum battery level or say whether the plug is supplied." + ZNOTE, "standard", Z)
settle(zee, "charge_port_operation", None, "Listed on all three regular trims. The manual does not describe automatic opening or closing triggers.")
settle(zee, "carplay_android_auto", None, "Listed on all three regular trims. Zeekr's brochure does not say whether the connection is wired or wireless.")
settle(zee, "supercharger_access", None, "Check the exact site in the Tesla app; the full Tesla network is not included. Zeekr publishes no 400 V charging figure, so do not expect the 420-450 kW headline rate at a Tesla site.")

# GT-Line AWD: Kia announced it as GT-Line equipment plus a second motor.
gt2 = "kia_ev3__gt_line_2wd_long_range__4"
patched = {(f["variant_id"], f["criterion"]): f for f in features}
AWD_NOTE = "GT-Line AWD is reported with GT-Line equipment plus a rear motor; Kia's downloadable sheet still lists the four FWD grades. "
for crit in [c["key"] for c in base["criteria"]]:
    ref = {**effective[(gt2, crit)], **patched.get((gt2, crit), {})}
    value = readable(ref["value"])
    if value is None:
        continue
    status = "conditional" if ref["status"] in ("standard", "optional") else ref["status"]
    conditions = AWD_NOTE + (ref.get("conditions") or "").replace("Family evidence is retained, but this trim has not been independently confirmed for this feature. ", "")
    feat(ev3_awd, crit, status, value, conditions, sorted(set(ref["source_ids"] + ["r6_kia_ev3_awd_goauto", "r6_kia_ev3_awd_evcentral"])), "GT-Line grade evidence applied to the announced AWD version")
feat(ev3_awd, "performance_rear_motor", "conditional", "Dual motor: added rear motor, 195 kW / 385 Nm combined", "Reported Australian launch figures. Individual motor outputs are not published.", ["r6_kia_ev3_awd_goauto"], force=True)
feat(ev3_awd, "ride_control_subjective", "subjective", "19-inch wheels, passive dampers, Australian-tuned AWD suspension reported", AWD_NOTE + "No adaptive or air suspension on any Australian EV3. Ride quality needs a matched road test.", ["r6_kia_ev3_spec", "r6_kia_ev3_awd_goauto"], force=True)
feat(ev3_awd, "safety_ancap", "conditional", "5 stars (2025) for the four FWD grades; AWD not yet listed", "ANCAP's 2025 EV3 report names the four front-drive grades. Ask Kia or ANCAP whether the rating has been extended to the AWD version.", ["kia_ev3_ancap", "kia_ev3_ancap_report"], force=True)
feat(ev3_awd, "storage", "conditional", "460 L boot · 25 L front · 1,251 L seats folded (European figure)", AWD_NOTE + "Boot and front figures are Kia Australia's GT-Line values, VDA.", ["r6_kia_ev3_spec", "r6_evdb_ev3_lr"], force=True)

# Later rows replace earlier ones for the same cell.
features = list({(f["variant_id"], f["criterion"]): f for f in features}.values())
out = {"date": DATE, "sources": sources, "features": features, "facts": facts}
json.dump(out, open("data/research-completion-2026-10-07.json", "w"), indent=1, ensure_ascii=False)
print(len(sources), "sources;", len(features), "feature rows;", len(facts), "fact rows")
