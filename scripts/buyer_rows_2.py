# Rows for build-buyer-overlay.py, part 2: range, charging, family fit, cabin, measurements.

src("b7_tesla_wltp", "https://www.tesla.com/en_eu/support/power-consumption", "Vehicle power consumption", "Tesla (Europe)", P, "WLTP combined, kWh/100 km. Model Y: Premium RWD 13.9; Premium Long Range AWD 15.6; Performance AWD 16.2. Model 3: Rear-Wheel Drive 12.2; Premium RWD 13.8; Premium Long Range RWD 13.6; Performance AWD 16.5. No Model Y L is listed.", market="EU")
src("b7_zeekr_electrive", "https://www.electrive.com/2026/04/01/zeekr-7x-review-late-to-the-party-but-still-convincing/", "Zeekr 7X review", "electrive", I, "European WLTP consumption: 17.7 to 17.8 kWh/100 km for the rear-drive versions and 19.9 kWh/100 km for the all-wheel-drive version.", market="EU")
src("b7_evkx_j5", "https://evkx.net/models/jaecoo/j5/j5_ev/rangeandconsumption/", "Jaecoo J5 EV range and consumption", "EVKX", D, "WLTP consumption 14.76 kWh/100 km. European record.", market="EU")
src("b7_zecar_j5", "https://zecar.com/electric-vehicles/jaecoo/j5/bev", "Jaecoo J5 BEV", "Zecar", D, "Ground clearance 150 mm; turning circle 10.4 m; kerb weight 1,710 kg; towing 750 kg unbraked, 1,250 kg braked; V2L 3.3 kW; no V2G or V2H.")
src("b7_zecar_atto2", "https://zecar.com/electric-vehicles/byd/atto-2", "BYD Atto 2", "Zecar", D, "Towing 750 kg unbraked and braked; ground clearance 150 mm; turning circle 10.5 m; no V2G or V2H.")
src("b7_zecar_7x", "https://zecar.com/electric-vehicles/zeekr/7x", "Zeekr 7X", "Zecar", D, "Towing 750 kg unbraked, 2,000 kg braked; V2L 3.3 kW; no V2G or V2H.")
src("b7_driven_7x_tow", "https://thedriven.io/2025/08/29/zeekr-7x-electric-suv-approved-in-australia-offers-2-tonne-towing/", "Zeekr 7X approved in Australia, offers 2-tonne towing", "The Driven", I, "Australian approval lists 2,000 kg braked and 750 kg unbraked towing.", published="2025-08-29")
src("b7_gridly_chem", "https://www.gridly.com.au/blog/lfp-vs-nmc-battery-australia", "LFP vs NMC battery: which to choose in Australia", "Gridly", I, "LFP cars can be charged to 100% routinely; Tesla's Australian guidance for LFP cars is a 100% limit and a full charge at least weekly. NMC cars are best kept near 80% for daily use.")
src("b7_carsguide_y_batt", "https://carsguide.com.au/car-news/2026-tesla-model-y-battery-boost-pushes-range-to-new-benchmark-electric-car-suv-king-now", "2026 Tesla Model Y battery boost", "CarsGuide", I, "Reports LFP cells in the rear-wheel-drive Model Y and NMC cells in Long Range versions, including the six-seat L.")
src("b7_driven_m3_perf", "https://thedriven.io/2026/05/08/new-faster-cheaper-tesla-model-to-come-with-new-lfp-battery-pack/", "New Tesla Model 3 battery packs", "The Driven", I, "Reports the current Model 3 Performance uses an NMC pack and the entry rear-drive car an LFP pack.", published="2026-05-08")
src("b7_tesla_cable", "https://thedriven.io/2022/07/11/tesla-removes-charging-cable-from-new-car-inclusions-but-offers-discount", "Tesla removes charging cable from new car inclusions", "The Driven", I, "From July 2022 new Australian Teslas no longer include the Mobile Connector; it is sold separately.", published="2022-07-11")
src("b7_gridly_cable", "https://www.gridly.com.au/blog/ev-charging-cable-australia", "EV charging cable guide Australia", "Gridly", I, "Tesla includes no cable; inclusions vary by brand, model and sometimes dealer, and almost none include a Type 2 to Type 2 cable.")
src("b7_zeekr_inclusions", "https://thedriven.io/2025/08/08/zeekr-announces-lower-than-expected-pricing-of-australias-fastest-charging-ev/", "Zeekr announces pricing of the 7X", "The Driven", I, "Orders after 17 August 2025 include a Type 2 cable and a portable home charger; the first 1,000 buyers also received a 7 kW home charger.", published="2025-08-08")
src("b7_amber_v2g", "https://www.carexpert.com.au/car-news/byd-sealion-7-joins-ambers-vehicle-to-grid-program", "BYD Sealion 7 joins Amber's vehicle-to-grid program", "CarExpert", I, "Eligible: BYD Atto 3 EVO (Dynamic, Premium) and Sealion 7 (Premium, Performance). Participants keep BYD battery warranty support for V2G use; that support is for the program, not every bidirectional installation. More than 50 sites operating, expanding toward 1,000 households with ARENA backing.", published="2026-09-18")
src("b7_agl_v2g", "https://www.carsguide.com.au/car-news/game-changing-new-ev-tech-finally-arrives-99671", "Vehicle-to-grid trial with AGL", "CarsGuide", I, "AGL trial names Kia EV3, EV6 and EV9, Hyundai Ioniq 5, 6 and 9, and a modified BYD Atto 3; Zeekr is taking part but which models is unclear. Tesla and Geely are not mentioned.", published="2025-09-24")
src("b7_tesla_powershare", "https://driveteslacanada.ca/news/tesla-cybertruck-powershare-powerwall-delay/", "Tesla Cybertruck Powershare update", "Drive Tesla Canada", I, "Powershare home backup is a Cybertruck feature. The Cybertruck is not sold in Australia.", market="Global")
src("b7_ancap_y_l", "https://www.ancap.com.au/safety-ratings/tesla/model-y-l/eaecda", "Tesla Model Y L safety rating", "ANCAP", T, "Many child restraints could not be correctly installed in the second row because of top-tether routing; in the third row convertible restraints could not be easily installed with ISOFIX.")
src("b7_zecar_y_l", "https://zecar.com/reviews/tesla-model-y-l-child-seat-safety-tether-issue-2026", "Tesla Model Y L child seat tether issue", "Zecar", I, "Infasecure and Maxi Cosi advised that top tethers can slip off the second-row captain's chairs. Tesla demonstrated that most seats fit with a split or V-shaped tether, some with an extension strap.")
src("b7_spare_guide", "https://chasingcars.com.au/guides/which-evs-have-a-spare-tyre-and-spare-wheel", "Which EVs have a spare tyre?", "Chasing Cars", I, "Tesla Model 3 and Model Y have no spare wheel; Tesla sells a tyre repair kit as an accessory. Few EVs sold in Australia carry a spare.")


# ---- Real-world range ----
AAA_T = "Australian Automobile Association test over a 93 km route around Geelong. "
NO_AAA = "No result in AAA's Real-World Testing Program as at 7 October 2026."
feat(Y_RWD, "real_world_range", "standard", "450 km on the road, 3% under the lab figure", AAA_T + "23-24 October 2025; 14.8 kWh/100 km measured.", ["b7_aaa_my_rwd"], "AAA tested")
feat(Y_LR, "real_world_range", "standard", "559 km on the road, 7% under the lab figure", AAA_T + "30 April-5 May 2026; 15.1 kWh/100 km measured.", ["b7_aaa_my_lr"], "AAA tested")
feat([Y_L, Y_P], "real_world_range", "unavailable", "Not yet tested by AAA", "AAA has tested the Model Y RWD (450 km, 3% under) and Long Range AWD (559 km, 7% under), not this version.", ["b7_aaa_results", "b7_aaa_my_rwd", "b7_aaa_my_lr"], "Not tested")
feat(M3_PR, "real_world_range", "conditional", "441 km for the 2024 RWD, 14% under its lab figure", AAA_T + "14-15 April 2025 on a December 2023 car rated at 513 km; today's Premium RWD is rated at 520 km and has not been retested.", ["b7_aaa_m3"], "Earlier build")
feat([M3_LR, M3_RWD, M3_P], "real_world_range", "unavailable", "Not yet tested by AAA", "AAA's only Model 3 result is the 2024 RWD: 441 km, 14% under its 513 km lab figure.", ["b7_aaa_results", "b7_aaa_m3"], "Not tested")
feat(S7_PR, "real_world_range", "standard", "469 km on the road, 3% under the WLTP claim", AAA_T + "10-18 March 2026; 19.9 kWh/100 km measured. AAA reports it as 17% under the 567 km on the car's Australian energy label, which uses an older test cycle than the 482 km WLTP claim.", ["b7_aaa_sealion7"], "AAA tested")
feat(S7_PF, "real_world_range", "unavailable", "Not yet tested by AAA", "AAA tested the Premium: 469 km on the road against a 482 km WLTP claim.", ["b7_aaa_results", "b7_aaa_sealion7"], "Not tested")
feat(EX5 + ZEEKR + [J5] + ATTO2 + EVO, "real_world_range", "unavailable", "Not yet tested by AAA", NO_AAA, ["b7_aaa_results"], "Not tested")
feat(EV5_AL, "real_world_range", "standard", "537 km on the road, 3% under the lab figure", AAA_T + "30-31 March 2026; 18.5 kWh/100 km measured.", ["b7_aaa_ev5"], "AAA tested")
feat(EV5_E, "real_world_range", "standard", "446 km on the road, 11% under the lab figure", AAA_T + "18-28 May 2026; 21.9 kWh/100 km measured.", ["b7_aaa_ev5_awd"], "AAA tested")
feat([EV5_AS, EV5_G], "real_world_range", "unavailable", "Not yet tested by AAA", "AAA has tested the Air Long Range (537 km, 3% under) and Earth AWD (446 km, 11% under), not this version.", ["b7_aaa_results", "b7_aaa_ev5", "b7_aaa_ev5_awd"], "Not tested")
feat(EV3_AL, "real_world_range", "standard", "537 km on the road, 11% under the lab figure", AAA_T + "6-14 November 2025; 16.4 kWh/100 km measured.", ["b7_aaa_ev3"], "AAA tested")
feat([EV3_AS, EV3_E, EV3_G, EV3_GA], "real_world_range", "unavailable", "Not yet tested by AAA", "AAA has tested the Air Long Range (537 km, 11% under its 604 km figure), not this version.", ["b7_aaa_results", "b7_aaa_ev3"], "Not tested")
feat(A3_E, "real_world_range", "standard", "328 km on the road, 5% under the WLTP claim", AAA_T + "16-20 April 2026; 17.1 kWh/100 km measured. AAA reports it as 20% under the 410 km on the car's Australian energy label, which uses an older test cycle than the 345 km WLTP claim.", ["b7_aaa_atto3"], "AAA tested")
feat(A3_P, "real_world_range", "standard", "369 km on the road, 12% under the WLTP claim", AAA_T + "4-7 April 2025 on a 2023 Extended Range car with the same 60.48 kWh battery; 18.0 kWh/100 km measured. AAA reports it as 23% under the 480 km label figure.", ["b7_aaa_atto3_2023"], "AAA tested")

# ---- Energy use ----
def yearly(kwh):
    return f"About A${round(kwh * 150 * 0.30 / 5) * 5:,} a year at 15,000 km on a 30c/kWh home tariff."


def energy(vids, kwh, status, basis, sources, label):
    feat(vids, "energy_use", status, f"{kwh:.1f} kWh/100 km", basis + " " + yearly(kwh), sources, label)


LABEL = "Australian energy label, as recorded by AAA."
EU = "Tesla's European WLTP figure; no Australian figure is published for this version."
SHEET = "WLTP, from the maker's Australian specification sheet."
energy(Y_RWD, 15.3, "standard", LABEL + " AAA measured 14.8 on the road; Tesla's European WLTP figure is 13.9.", ["b7_aaa_my_rwd", "b7_tesla_wltp"], "Label figure")
energy(Y_LR, 15.9, "standard", LABEL + " AAA measured 15.1 on the road; Tesla's European WLTP figure is 15.6.", ["b7_aaa_my_lr", "b7_tesla_wltp"], "Label figure")
energy(Y_P, 16.2, "conditional", EU, ["b7_tesla_wltp"], "European figure")
feat(Y_L, "energy_use", "unavailable", "Not published for the six-seat version", "Tesla's consumption table has no Model Y L and AAA has not tested one. The five-seat Long Range AWD is 15.9 kWh/100 km on its Australian label.", ["b7_tesla_wltp", "b7_aaa_my_lr"], "Not published")
energy(M3_RWD, 12.2, "conditional", EU, ["b7_tesla_wltp"], "European figure")
energy(M3_PR, 13.8, "conditional", EU + " AAA measured 14.0 on the road in the 2024 RWD.", ["b7_tesla_wltp", "b7_aaa_m3"], "European figure")
energy(M3_LR, 13.6, "conditional", EU, ["b7_tesla_wltp"], "European figure")
energy(M3_P, 16.5, "conditional", EU, ["b7_tesla_wltp"], "European figure")
feat(S7_PR, "energy_use", "standard", "17.0 kWh/100 km on the label · 19.9 measured", LABEL + " The label uses an older test cycle; AAA measured 19.9 on the road. About A$765 a year on the label figure, A$895 on AAA's, at 15,000 km on a 30c/kWh home tariff.", ["b7_aaa_sealion7"], "Label figure")
feat(S7_PF, "energy_use", "unavailable", "Not published in Australia", "BYD's Australian sheet gives no consumption figure and AAA tested only the Premium (19.9 kWh/100 km on the road). The Performance is 115 kg heavier with a second motor and 26 km less claimed range.", ["byd_sealion_spec", "b7_aaa_sealion7"], "Not published")
energy(EX5_C, 16.0, "standard", SHEET, ["r6_geely_spec"], "WLTP")
energy(EX5_I, 16.9, "standard", SHEET, ["r6_geely_spec"], "WLTP")
energy(EX5_CO, 15.8, "standard", SHEET, ["geely_brochure_old"], "WLTP")
energy(EX5_IO, 16.6, "standard", SHEET, ["geely_brochure_old"], "WLTP")
ZE = "European WLTP figure for the matching version; Zeekr's Australian sheet gives none."
feat([Z_RWD, Z_LR], "energy_use", "conditional", "17.7-17.8 kWh/100 km", ZE + " About A$800 a year at 15,000 km on a 30c/kWh home tariff.", ["b7_zeekr_electrive"], "European figure")
energy([Z_P, Z_B], 19.9, "conditional", ZE, ["b7_zeekr_electrive"], "European figure")
energy(J5, 14.8, "conditional", "European WLTP figure; Jaecoo's Australian sheet gives none.", ["b7_evkx_j5"], "European figure")
feat(ATTO2, "energy_use", "unavailable", "Not published in Australia", "BYD's Australian sheet gives range only, and AAA has not tested the Atto 2.", ["r6_atto2_spec", "b7_aaa_results"], "Not published")
energy(EV5_AS, 18.2, "standard", SHEET, ["r6_kia_ev5_spec"], "WLTP")
energy(EV5_AL, 18.0, "standard", SHEET + " AAA measured 18.5 on the road.", ["r6_kia_ev5_spec", "b7_aaa_ev5"], "WLTP")
energy(EV5_E, 20.1, "standard", SHEET + " AAA measured 21.9 on the road.", ["r6_kia_ev5_spec", "b7_aaa_ev5_awd"], "WLTP")
energy(EV5_G, 21.0, "standard", SHEET, ["r6_kia_ev5_spec"], "WLTP")
energy(EV3_AS, 14.9, "standard", SHEET, ["r6_kia_ev3_spec"], "WLTP")
energy(EV3_AL, 14.9, "standard", SHEET + " AAA measured 16.4 on the road.", ["r6_kia_ev3_spec", "b7_aaa_ev3"], "WLTP")
energy([EV3_E, EV3_G], 16.2, "standard", SHEET, ["r6_kia_ev3_spec"], "WLTP")
feat(EV3_GA, "energy_use", "unavailable", "Not yet published for the AWD", "Kia's sheet covers the four front-drive grades; the GT-Line 2WD is 16.2 kWh/100 km.", ["r6_kia_ev3_spec", "r6_kia_ev3_awd_goauto"], "Not published")
energy(EVO_D, 16.0, "standard", SHEET, ["byd_evo_spec"], "WLTP")
energy(EVO_P, 16.4, "standard", SHEET, ["byd_evo_spec"], "WLTP")
feat(A3_E, "energy_use", "standard", "14.8 kWh/100 km on the label · 17.1 measured", LABEL + " The label uses an older test cycle; AAA measured 17.1 on the road, about A$770 a year at 15,000 km on a 30c/kWh home tariff.", ["b7_aaa_atto3"], "Label figure")
feat(A3_P, "energy_use", "standard", "14.9 kWh/100 km on the label · 18.0 measured", LABEL + " The label uses an older test cycle; AAA measured 18.0 on the road in a 2023 car, about A$810 a year at 15,000 km on a 30c/kWh home tariff.", ["b7_aaa_atto3_2023"], "Label figure")

# ---- Battery chemistry ----
LFP_NOTE = " LFP cells tolerate regular charging to 100%."
NMC_NOTE = " Makers generally advise a daily limit near 80% for NMC cells."
feat(Y_RWD, "battery_chemistry", "conditional", "LFP (lithium iron phosphate)", "Tesla does not publish cell chemistry; reported for the rear-wheel-drive car. Tesla's guidance for LFP cars is a 100% limit and a full charge at least weekly.", ["b7_carsguide_y_batt", "b7_gridly_chem"], "Reported")
feat([Y_LR, Y_L, Y_P], "battery_chemistry", "conditional", "NMC (nickel manganese cobalt)", "Tesla does not publish cell chemistry; reported for Long Range versions." + NMC_NOTE, ["b7_carsguide_y_batt", "b7_gridly_chem"], "Reported")
feat([M3_RWD, M3_PR], "battery_chemistry", "conditional", "LFP (lithium iron phosphate)", "Tesla does not publish cell chemistry; reported for the rear-drive cars. Tesla's guidance for LFP cars is a 100% limit and a full charge at least weekly.", ["r6_tesla_3_battery", "b7_driven_m3_perf", "b7_gridly_chem"], "Reported")
feat([M3_LR, M3_P], "battery_chemistry", "conditional", "NMC (nickel manganese cobalt)", "Tesla does not publish cell chemistry; reported for the Long Range and Performance cars." + NMC_NOTE, ["r6_tesla_3_battery", "b7_driven_m3_perf", "b7_gridly_chem"], "Reported")
feat(SEALION, "battery_chemistry", "standard", "LFP (BYD Blade)", "Stated on BYD's Australian sheet." + LFP_NOTE, ["byd_sealion_spec", "b7_gridly_chem"])
feat(ATTO2, "battery_chemistry", "standard", "LFP (BYD Blade)", "Stated on BYD's Australian sheet." + LFP_NOTE, ["r6_atto2_spec", "b7_gridly_chem"])
feat(EVO, "battery_chemistry", "standard", "LFP (BYD Blade)", "Stated on BYD's Australian sheet." + LFP_NOTE, ["byd_evo_spec", "b7_gridly_chem"])
feat(ATTO3, "battery_chemistry", "standard", "LFP (BYD Blade)", "Stated on BYD's Australian sheet." + LFP_NOTE, ["r6_atto3_spec", "b7_gridly_chem"])
feat([EX5_C, EX5_I], "battery_chemistry", "standard", "LFP (lithium iron phosphate)", "Stated on Geely's Australian sheet." + LFP_NOTE, ["r6_geely_spec", "b7_gridly_chem"])
feat([EX5_CO, EX5_IO], "battery_chemistry", "standard", "LFP (lithium iron phosphate)", "Stated on Geely's Australian sheet." + LFP_NOTE, ["geely_brochure_old", "b7_gridly_chem"])
feat(Z_RWD, "battery_chemistry", "standard", "LFP (lithium iron phosphate)", "Stated on Zeekr's Australian sheet for the 75 kWh car." + LFP_NOTE, ["zeekr_au_brochure_20250820", "b7_gridly_chem"])
feat([Z_LR, Z_P], "battery_chemistry", "standard", "NCM (nickel cobalt manganese)", "Stated on Zeekr's Australian sheet for the 100 kWh cars." + NMC_NOTE, ["zeekr_au_brochure_20250820", "b7_gridly_chem"])
feat(J5, "battery_chemistry", "standard", "LFP (lithium iron phosphate)", "Stated on Jaecoo's Australian sheet." + LFP_NOTE, ["r6_jaecoo_spec", "b7_gridly_chem"])
feat(EV5, "battery_chemistry", "standard", "LFP (lithium iron phosphate)", "Stated on Kia's Australian sheet." + LFP_NOTE, ["r6_kia_ev5_spec", "b7_gridly_chem"])
feat(EV3, "battery_chemistry", "conditional", "NMC (nickel manganese cobalt)", "Kia's Australian sheet says only 'lithium-ion'; NMC is reported for both EV3 batteries." + NMC_NOTE, ["r6_kia_ev3_spec", "r6_carexpert_ev3", "b7_gridly_chem"], "Reported")

# ---- Home charging time ----
def hours(x):
    whole, half = divmod(round(x * 2), 2)
    return f"{whole}.5" if half else str(whole)


def home(vid, kwh, single, three=None, source=None, published=None):
    """10% to full: capacity divided by rate, which matches Kia's published EV5 figure."""
    if published:
        value, label = f"{published} from 10% to full on a 7 kW wallbox", "Published"
    else:
        value, label = f"About {hours(kwh / single)} hours from 10% to full on a 7 kW wallbox", "Estimate"
    note = "" if published else "Estimate: battery capacity divided by the charge rate, a method that matches Kia's published 10-100% time for the EV5. "
    if single < 7:
        note += f"The car's own charger limits single-phase charging to {single} kW. "
    note += "Most Australian homes have single-phase power. "
    note += f"On three-phase power the car accepts {three[0]} kW: {three[1]}." if three else "Three-phase power makes no difference: the car's charger tops out at 7 kW."
    feat(vid, "home_charging", "standard", value, note, source, label)


def est(kwh, rate):
    return f"about {hours(kwh / rate)} hours"


TY, T3 = ["b7_ce_my"], ["b7_ce_m3"]
home(Y_RWD, 60, 7, (11, est(60, 11)), TY)
home(Y_LR, 79, 7, (11, est(79, 11)), TY)
home(Y_L, 79, 7, (11, est(79, 11)), TY)
home(Y_P, 84.7, 7, (11, est(84.7, 11)), TY)
home(M3_RWD, 60, 7, (11, est(60, 11)), T3)
home(M3_PR, 62.5, 7, (11, est(62.5, 11)), T3)
home(M3_LR, 78.4, 7, (11, est(78.4, 11)), T3)
home(M3_P, 79, 7, (11, est(79, 11)), T3)
for vid in SEALION:
    home(vid, 82.56, 7, (11, est(82.56, 11)), ["byd_sealion_spec", "b7_ce_s7"])
for vid in [EX5_C, EX5_I]:
    home(vid, 68.39, 7, (11, est(68.39, 11)), ["r6_geely_spec"])
for vid in [EX5_CO, EX5_IO]:
    home(vid, 60.22, 7, (11, est(60.22, 11)), ["geely_brochure_old"])
home(Z_RWD, 75, 7, (22, est(75, 22)), ["zeekr_au_brochure_20250820", "b7_ce_7x"])
for vid in [Z_LR, Z_P]:
    home(vid, 100, 7, (22, est(100, 22)), ["zeekr_au_brochure_20250820", "b7_ce_7x"])
home(J5, 58.9, 6.6, (10.3, est(58.9, 10.3)), ["r6_jaecoo_spec"])
for vid in ATTO2:
    home(vid, 51.13, 7, None, ["r6_atto2_spec"])
home(EV5_AS, 64.2, 6.6, None, ["r6_kia_ev5_spec"], published="9 h 43 min")
features[(EV5_AS, "home_charging")]["conditions"] = "Kia's published time. The Standard Range car's charger is limited to 6.6 kW, single-phase, so three-phase power makes no difference. Most Australian homes have single-phase power."
for vid in [EV5_AL, EV5_E, EV5_G]:
    home(vid, 88.1, 7, (11, "8 h 10 min by Kia's figure"), ["r6_kia_ev5_spec"])
home(EV3_AS, 58.3, 6.9, (10.5, "5 h 20 min by Kia's figure"), ["r6_kia_ev3_spec"])
for vid in [EV3_AL, EV3_E, EV3_G]:
    home(vid, 81.4, 6.9, (10.5, "7 h 15 min by Kia's figure"), ["r6_kia_ev3_spec"])
home(EVO_D, 60.48, 7, None, ["byd_evo_spec"])
home(EVO_P, 74.88, 7, (11, est(74.88, 11)), ["byd_evo_spec"])
home(A3_E, 49.92, 7, None, ["r6_atto3_spec"])
home(A3_P, 60.48, 7, None, ["r6_atto3_spec"])

# ---- Charging cables included ----
feat(TESLA, "charging_cable", "unavailable", "No cable or portable charger included", "Tesla stopped including its Mobile Connector with new Australian cars in July 2022; it is sold separately, as is a Type 2 cable for public AC chargers.", ["b7_tesla_cable", "b7_gridly_cable"], "Not included")
BYD_CABLE = "Both are standard on BYD's Australian sheet. A Type 2 cable for public AC chargers is not listed."
feat(SEALION, "charging_cable", "standard", "Portable charger (Mode 2) and V2L adapter included", BYD_CABLE, ["byd_sealion_spec"])
feat(ATTO2, "charging_cable", "standard", "Portable charger (Mode 2) and V2L adapter included", BYD_CABLE, ["r6_atto2_spec"])
feat(EVO, "charging_cable", "standard", "Portable charger (Mode 2) and V2L adapter included", BYD_CABLE, ["byd_evo_spec"])
feat(ATTO3, "charging_cable", "standard", "Portable charger (Mode 2) included", "Listed on BYD's Australian sheet, which also lists a V2L adapter. A Type 2 cable for public AC chargers is not listed.", ["r6_atto3_spec"])
feat(EX5, "charging_cable", "standard", "Portable 2 kW charger (Mode 2) included", "Geely sells a Type 2 cable for A$269.50 and a 7 kW wall charger for A$829.99 plus installation.", ["r6_geely_spec"])
feat([Z_RWD, Z_LR, Z_P], "charging_cable", "conditional", "Portable charger and Type 2 cable in Zeekr's order offer", "Reported for orders placed after 17 August 2025; the first 1,000 buyers also received a 7 kW home charger. Not on the specification sheet, so confirm it on your order.", ["b7_zeekr_inclusions"], "Offer")
feat(J5, "charging_cable", "conditional", "No cable on Jaecoo's specification sheet", "The Australian sheet lists the charge ports only. Ask the dealer to write any portable charger or cable into the contract.", ["r6_jaecoo_spec", "b7_gridly_cable"], "Ask the dealer")
KIA_CABLE = "Kia's Australian sheet lists the V2L adaptor but no charging cable; the owner's manual describes a portable charger. Ask the dealer to write any cable into the contract."
feat(EV5, "charging_cable", "conditional", "No charging cable on Kia's equipment list", KIA_CABLE, ["r6_kia_ev5_spec", "r6_kia_ev5_manual", "b7_gridly_cable"], "Ask the dealer")
feat(EV3, "charging_cable", "conditional", "No charging cable on Kia's equipment list", KIA_CABLE, ["r6_kia_ev3_spec", "r6_kia_ev3_manual", "b7_gridly_cable"], "Ask the dealer")

# ---- Home and grid power ----
NO_V2G = "Not in any Australian vehicle-to-grid program found as at October 2026, and no home-backup function is listed. Vehicle-to-load is covered in its own row."
feat(TESLA, "bidirectional_v2g", "unavailable", "No home or grid power from the car", "Tesla's Powershare home backup is a Cybertruck feature, and the Cybertruck is not sold in Australia. No Model Y or Model 3 is named in an Australian vehicle-to-grid program.", ["b7_tesla_powershare", "b7_agl_v2g", "b7_amber_v2g"], "Not offered")
AMBER = "Announced in September 2026. BYD's battery warranty support covers participants in Amber's ARENA-backed program, not other bidirectional installations. Needs an approved bidirectional charger."
feat(SEALION + EVO, "bidirectional_v2g", "conditional", "Vehicle-to-grid through Amber's program, with warranty support", AMBER, ["b7_amber_v2g"], "Program only")
feat(ATTO3, "bidirectional_v2g", "conditional", "Used in trials · not approved for private installations", "A modified Atto 3 was named for AGL's vehicle-to-grid trial. Amber's program with BYD warranty support covers the Atto 3 EVO and Sealion 7, not this earlier car.", ["b7_agl_v2g", "b7_amber_v2g"], "Trials only")
feat(ATTO2, "bidirectional_v2g", "unavailable", "Not offered", "The Atto 2 is not among the BYD models eligible for Amber's program. " + NO_V2G, ["b7_amber_v2g", "b7_zecar_atto2"], "Not offered")
feat(EV3, "bidirectional_v2g", "conditional", "Named for AGL's vehicle-to-grid trial", "CarsGuide, September 2025: the EV3, EV6 and EV9 were to join AGL's trial. Kia has not announced general approval or battery warranty terms for vehicle-to-grid use.", ["b7_agl_v2g"], "Trial only")
feat(EV5, "bidirectional_v2g", "unavailable", "Not offered", "The EV5 was not among the Kia models named for AGL's trial. " + NO_V2G, ["b7_agl_v2g"], "Not offered")
feat(ZEEKR, "bidirectional_v2g", "conditional", "Zeekr is in AGL's trial · 7X not confirmed", "CarsGuide, September 2025: Zeekr joined AGL's vehicle-to-grid trial, but it was unclear which models can take part. No home-backup function is listed.", ["b7_agl_v2g", "b7_zecar_7x"], "Unconfirmed")
feat(EX5, "bidirectional_v2g", "unavailable", "Not offered", NO_V2G + " The EX5 can charge another EV at 6.6 kW.", ["r6_geely_spec", "b7_agl_v2g"], "Not offered")
feat(J5, "bidirectional_v2g", "unavailable", "Not offered", NO_V2G, ["b7_zecar_j5", "b7_agl_v2g"], "Not offered")

# ---- Child-seat anchor points ----
TESLA_SEATS = "The centre rear seat has a top tether but no ISOFIX; a child seat there is held by the seat belt."
feat([Y_RWD, Y_LR, Y_P], "child_seats", "standard", "2 ISOFIX (outer rear) · 3 top tethers", TESLA_SEATS, ["tesla_y_manual"])
feat(TESLA_3, "child_seats", "standard", "2 ISOFIX (outer rear) · 3 top tethers", TESLA_SEATS, ["tesla_3_manual"])
feat(Y_L, "child_seats", "conditional", "ISOFIX and top tethers on all four rear seats · fitting problems reported", "ANCAP found many child seats could not be fitted correctly in the second row because of top-tether routing, and convertible seats were hard to fit by ISOFIX in the third row. Infasecure and Maxi Cosi advised against some second-row fitments; Tesla says most seats fit with a split or V-shaped tether. Test your own seats before ordering.", ["b7_ancap_y_l", "b7_zecar_y_l"], "Fitting limits")
feat(SEALION, "child_seats", "standard", "2 ISOFIX/i-Size (outer rear) · top tethers on the outer rear seats", "The 2025 handbook describes top tethers for the outboard rear seats only; ask about the centre position.", ["byd_sealion_manual"])
feat(ATTO2, "child_seats", "standard", "2 ISOFIX (outer rear) with top tethers", "", ["r6_atto2_spec", "byd_atto2_manual"])
feat(EVO, "child_seats", "standard", "2 ISOFIX · 3 top tethers", "", ["byd_evo_spec"])
feat(ATTO3, "child_seats", "standard", "ISOFIX/i-Size anchors with top tethers", "BYD's sheet lists the anchors without a count; the handbook shows them on the rear seats.", ["r6_atto3_spec", "byd_atto3_manual"])
feat([EX5_C, EX5_I], "child_seats", "standard", "2 ISOFIX (outer rear) · top tethers across the rear row", "", ["r6_geely_spec"])
feat([EX5_CO, EX5_IO], "child_seats", "standard", "2 ISOFIX (outer rear) · top tethers across the rear row", "", ["geely_brochure_old"])
feat(ZEEKR, "child_seats", "conditional", "ISOFIX on the rear seats and the front passenger seat, with top tethers", "From the Australian-market manual hosted on an owner site, which does not give a count for each row.", ["r6_zeekr_manual"], "Count not stated")
feat(J5, "child_seats", "standard", "2 ISOFIX · 3 top tethers", "", ["r6_jaecoo_spec"])
feat(EV5, "child_seats", "standard", "2 ISOFIX · 3 top tethers", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E, EV3_G], "child_seats", "standard", "2 ISOFIX · 3 top tethers", "", ["r6_kia_ev3_spec"])

# ---- Spare tyre ----
feat(TESLA, "spare_tyre", "unavailable", "No spare and no repair kit included", "Tesla sells a tyre repair kit as an accessory and relies on roadside assistance for punctures.", ["b7_spare_guide"], "None")
KIT = "A sealant-and-compressor kit seals small tread punctures only; a damaged sidewall needs a tow."
feat(SEALION, "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["byd_sealion_spec"], "No spare")
feat(ATTO2, "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["r6_atto2_spec"], "No spare")
feat(ATTO3, "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["r6_atto3_spec"], "No spare")
feat(EVO, "spare_tyre", "conditional", "Tyre repair kit expected, no spare wheel", "The first page of BYD's EVO sheet has no tyre row; the Atto 3 it replaces and every other BYD here carry a repair kit. " + KIT, ["byd_evo_spec", "r6_atto3_spec"], "Not itemised")
feat([EX5_C, EX5_I], "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["r6_geely_spec"], "No spare")
feat([EX5_CO, EX5_IO], "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["geely_brochure_old"], "No spare")
feat(ZEEKR, "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", "Stowed under the boot floor, per the Australian-market manual. " + KIT, ["r6_zeekr_manual"], "No spare")
feat(J5, "spare_tyre", "unavailable", "Tyre repair kit, no spare wheel", KIT, ["r6_jaecoo_spec"], "No spare")
feat(EV5, "spare_tyre", "unavailable", "Tyre Mobility Kit, no spare wheel", KIT, ["r6_kia_ev5_spec"], "No spare")
feat(EV3, "spare_tyre", "unavailable", "Tyre Mobility Kit, no spare wheel", KIT, ["r6_kia_ev3_spec"], "No spare")

# ---- Screens and head-up display ----
feat(TESLA_Y, "screens_hud", "standard", "16-inch centre screen · 8-inch rear screen · no driver display or head-up display", "Speed and warnings appear on the centre screen.", ["b7_ce_my"])
# Tesla's configurator lists 16 inches for the current car; older industry data still says 15.4.
feat([M3_PR, M3_LR, M3_P], "screens_hud", "standard", "16-inch centre screen · 8-inch rear screen · no driver display or head-up display", "Speed and warnings appear on the centre screen.", ["tesla_3_config", "tesla_3_manual"])
feat(M3_RWD, "screens_hud", "standard", "16-inch centre screen · no rear screen, driver display or head-up display", "The entry version drops the rear touchscreen.", ["tesla_3_config", "r6_tesla_3_design"])
feat(SEALION, "screens_hud", "standard", "15.6-inch rotating screen · 10.25-inch driver display · head-up display", "", ["byd_sealion_spec"])
feat([EX5_C, EX5_CO], "screens_hud", "standard", "15.4-inch screen · 10.2-inch driver display · no head-up display", "The head-up display comes with Inspire.", ["r6_geely_spec"])
feat([EX5_I, EX5_IO], "screens_hud", "standard", "15.4-inch screen · 10.2-inch driver display · head-up display", "", ["r6_geely_spec"])
feat(Z_RWD, "screens_hud", "standard", "16-inch screen · 13-inch driver display · no head-up display", "The head-up display comes with Long Range and Performance.", ["zeekr_au_brochure_20250820"])
feat([Z_LR, Z_P], "screens_hud", "standard", "16-inch screen · 13-inch driver display · 36-inch head-up display", "", ["zeekr_au_brochure_20250820"])
feat(J5, "screens_hud", "standard", "13.2-inch screen · 8.88-inch driver display · no head-up display", "", ["r6_jaecoo_spec"])
feat(A2_D, "screens_hud", "standard", "10.1-inch screen · 8.8-inch driver display · no head-up display", "", ["r6_atto2_spec"])
feat(A2_P, "screens_hud", "standard", "12.8-inch screen · 8.8-inch driver display · no head-up display", "", ["r6_atto2_spec"])
KIA_SCREEN = "12.3-inch screen · 12.3-inch driver display · 5-inch climate panel"
feat([EV5_AS, EV5_AL, EV5_E], "screens_hud", "standard", KIA_SCREEN + " · no head-up display", "The head-up display comes with GT-Line.", ["r6_kia_ev5_spec"])
feat(EV5_G, "screens_hud", "standard", KIA_SCREEN + " · head-up display", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E], "screens_hud", "standard", KIA_SCREEN + " · no head-up display", "The head-up display comes with GT-Line.", ["r6_kia_ev3_spec"])
feat(EV3_G, "screens_hud", "standard", KIA_SCREEN + " · head-up display", "", ["r6_kia_ev3_spec"])
feat(EVO, "screens_hud", "standard", "15.6-inch screen · 8.8-inch driver display · no head-up display", "", ["byd_evo_spec"])
feat(A3_E, "screens_hud", "standard", "12.8-inch rotating screen · 5-inch driver display · no head-up display", "", ["r6_atto3_spec"])
feat(A3_P, "screens_hud", "standard", "15.6-inch rotating screen · 5-inch driver display · no head-up display", "", ["r6_atto3_spec"])

# ---- Sound system ----
JATO = "Industry data; Tesla's Australian pages do not itemise the speaker count."
feat(Y_RWD, "audio_system", "standard", "9 speakers", JATO, ["b7_ce_my"])
feat([Y_LR, Y_P], "audio_system", "standard", "16 speakers, including a subwoofer", JATO, ["b7_ce_my"])
feat(Y_L, "audio_system", "standard", "19 speakers, including a subwoofer", JATO, ["b7_ce_my"])
feat(M3_RWD, "audio_system", "conditional", "7 speakers", "Reported for the A$45,900 entry version at launch; industry data lists 9 for the other rear-drive cars.", ["r6_tesla_3_design", "b7_ce_m3"], "Reported")
feat([M3_PR, M3_LR], "audio_system", "standard", "9 speakers", JATO, ["b7_ce_m3"])
feat(M3_P, "audio_system", "standard", "17 speakers", JATO, ["b7_ce_m3"])
feat(SEALION, "audio_system", "standard", "12 speakers, Dynaudio", "", ["byd_sealion_spec"])
feat([EX5_C, EX5_CO], "audio_system", "standard", "6 speakers", "", ["r6_geely_spec"])
feat([EX5_I, EX5_IO], "audio_system", "standard", "16 speakers, 1,000 W Flyme Sound", "", ["r6_geely_spec"])
feat(Z_RWD, "audio_system", "standard", "10 speakers", "", ["zeekr_au_brochure_20250820"])
feat([Z_LR, Z_P], "audio_system", "standard", "21 speakers, Zeekr Sound Pro", "", ["zeekr_au_brochure_20250820"])
feat(J5, "audio_system", "standard", "8 speakers", "", ["r6_jaecoo_spec"])
feat(A2_D, "audio_system", "standard", "4 speakers", "", ["r6_atto2_spec"])
feat(A2_P, "audio_system", "standard", "8 speakers", "", ["r6_atto2_spec"])
feat([EV5_AS, EV5_AL, EV5_E], "audio_system", "standard", "6 speakers", "", ["r6_kia_ev5_spec"])
feat(EV5_G, "audio_system", "standard", "8 speakers, Harman Kardon", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E], "audio_system", "standard", "6 speakers", "", ["r6_kia_ev3_spec"])
feat(EV3_G, "audio_system", "standard", "8 speakers, Harman Kardon", "", ["r6_kia_ev3_spec"])
feat(EVO, "audio_system", "standard", "8 speakers", "", ["byd_evo_spec"])
feat(A3_P, "audio_system", "standard", "8 speakers, Dirac HD", "", ["r6_atto3_spec"])
feat(A3_E, "audio_system", "conditional", "8 speakers listed for the range", "BYD's sheet lists Dirac HD sound with 8 speakers; the per-trim marks could not be read for Essential.", ["r6_atto3_spec"], "Trim not confirmed")

# ---- Glass roof and shade ----
feat(TESLA_Y, "glass_roof", "standard", "Fixed glass roof · no blind", "Tinted glass with no factory sunshade.", ["tesla_y_manual"])
feat(TESLA_3, "glass_roof", "standard", "Fixed glass roof · no blind", "Tinted glass with no factory sunshade.", ["tesla_3_manual", "r6_tesla_3_design"])
feat(SEALION, "glass_roof", "standard", "Fixed panoramic glass roof · powered blind", "", ["byd_sealion_spec"])
feat([EX5_C, EX5_CO], "glass_roof", "unavailable", "No glass roof", "The opening panoramic sunroof comes with Inspire.", ["r6_geely_spec"], "Not fitted")
feat([EX5_I, EX5_IO], "glass_roof", "standard", "Opening panoramic sunroof · powered blind", "", ["r6_geely_spec"])
feat([Z_RWD, Z_LR], "glass_roof", "standard", "Fixed panoramic glass roof · powered blind", "", ["zeekr_au_brochure_20250820"])
feat(Z_P, "glass_roof", "standard", "Fixed panoramic glass roof · powered blind · powered rear side-window blinds", "", ["zeekr_au_brochure_20250820"])
feat(J5, "glass_roof", "standard", "Fixed glass roof · powered blind", "", ["r6_jaecoo_spec"])
feat(A2_D, "glass_roof", "unavailable", "No glass roof", "The panoramic glass roof comes with Premium.", ["r6_atto2_spec"], "Not fitted")
feat(A2_P, "glass_roof", "standard", "Fixed panoramic glass roof with blind", "", ["r6_atto2_spec"])
feat([EV5_AS, EV5_AL, EV5_E], "glass_roof", "unavailable", "No glass roof", "The panoramic sunroof comes with GT-Line.", ["r6_kia_ev5_spec"], "Not fitted")
feat(EV5_G, "glass_roof", "standard", "Panoramic sunroof", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E], "glass_roof", "unavailable", "No glass roof", "The sunroof comes with GT-Line.", ["r6_kia_ev3_spec"], "Not fitted")
feat(EV3_G, "glass_roof", "standard", "Wide sunroof", "", ["r6_kia_ev3_spec"])
feat(EVO, "glass_roof", "standard", "Panoramic sunroof · powered blind", "", ["byd_evo_spec"])
feat(A3_P, "glass_roof", "standard", "Opening panoramic sunroof", "", ["r6_atto3_spec"])
feat(A3_E, "glass_roof", "conditional", "Panoramic sunroof listed for the range", "BYD's sheet lists an opening panoramic sunroof; the per-trim marks could not be read for Essential.", ["r6_atto3_spec"], "Trim not confirmed")

# ---- Powered tailgate ----
feat(TESLA_Y, "power_tailgate", "standard", "Powered tailgate", "", ["tesla_y_manual"])
feat(TESLA_3, "power_tailgate", "standard", "Powered boot lid", "", ["tesla_3_manual"])
feat(SEALION, "power_tailgate", "standard", "Powered tailgate", "", ["byd_sealion_spec"])
feat([EX5_C, EX5_CO], "power_tailgate", "unavailable", "Manual tailgate", "Powered on Inspire.", ["r6_geely_spec"], "Not fitted")
feat([EX5_I, EX5_IO], "power_tailgate", "standard", "Powered tailgate", "", ["r6_geely_spec"])
feat([Z_RWD, Z_LR, Z_P], "power_tailgate", "standard", "Powered tailgate with height memory", "", ["zeekr_au_brochure_20250820"])
feat(J5, "power_tailgate", "standard", "Powered tailgate", "", ["r6_jaecoo_spec"])
feat(ATTO2, "power_tailgate", "unavailable", "Manual tailgate", "Electric release, opened by hand.", ["r6_atto2_spec"], "Not fitted")
feat([EV5_AS, EV5_AL], "power_tailgate", "unavailable", "Manual tailgate", "Powered from Earth up.", ["r6_kia_ev5_spec"], "Not fitted")
feat([EV5_E, EV5_G], "power_tailgate", "standard", "Powered tailgate, height adjustable", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL], "power_tailgate", "unavailable", "Manual tailgate", "Powered from Earth up.", ["r6_kia_ev3_spec"], "Not fitted")
feat([EV3_E, EV3_G], "power_tailgate", "standard", "Powered tailgate, height adjustable", "", ["r6_kia_ev3_spec"])
feat(EV3_GA, "power_tailgate", "standard", "Powered tailgate", "Reported in the AWD's Australian equipment list.", ["r6_kia_ev3_awd_evcentral"])
feat(EVO, "power_tailgate", "standard", "Powered tailgate", "", ["byd_evo_spec"])
feat(A3_P, "power_tailgate", "standard", "Powered tailgate", "", ["r6_atto3_spec"])
feat(A3_E, "power_tailgate", "unavailable", "Manual tailgate", "Electric release, opened by hand.", ["r6_atto3_spec"], "Not fitted")

# ---- Wireless phone charging ----
feat(TESLA_Y, "wireless_charging", "standard", "Two wireless charging pads", "", ["tesla_y_manual"])
feat([M3_PR, M3_LR, M3_P], "wireless_charging", "standard", "Two wireless charging pads", "", ["tesla_3_manual"])
feat(M3_RWD, "wireless_charging", "conditional", "Two wireless charging pads on other Model 3s", "Tesla's page for the entry version does not itemise the phone chargers.", ["r6_tesla_3_design", "tesla_3_manual"], "Not itemised")
feat(SEALION, "wireless_charging", "standard", "One wireless charging pad", "", ["byd_sealion_spec"])
feat(EX5, "wireless_charging", "standard", "One 15 W pad", "", ["r6_geely_spec"])
feat([Z_RWD, Z_LR, Z_P], "wireless_charging", "standard", "Two 50 W pads", "", ["zeekr_au_brochure_20250820"])
feat(J5, "wireless_charging", "standard", "One 50 W pad", "", ["r6_jaecoo_spec"])
feat(A2_D, "wireless_charging", "unavailable", "Not fitted", "A 50 W pad comes with Premium.", ["r6_atto2_spec"], "Not fitted")
feat(A2_P, "wireless_charging", "standard", "One 50 W pad", "", ["r6_atto2_spec"])
feat([EV5_AS, EV5_AL, EV5_E], "wireless_charging", "unavailable", "Not fitted", "A Qi pad comes with GT-Line.", ["r6_kia_ev5_spec"], "Not fitted")
feat(EV5_G, "wireless_charging", "standard", "One Qi pad", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E, EV3_G], "wireless_charging", "standard", "One Qi pad", "", ["r6_kia_ev3_spec"])
feat(EVO, "wireless_charging", "standard", "One 50 W pad", "", ["byd_evo_spec"])
feat(A3_P, "wireless_charging", "standard", "One wireless charging pad", "", ["r6_atto3_spec"])
feat(A3_E, "wireless_charging", "conditional", "Wireless pad listed for the range", "BYD's sheet lists a wireless phone charger; the per-trim marks could not be read for Essential.", ["r6_atto3_spec"], "Trim not confirmed")

# ---- Versions the makers' sheets do not itemise ----
BLACK = "Zeekr's sheet does not itemise the Black Special Edition; shown as the Performance AWD it is built on."
for key in ["parking_cameras", "battery_chemistry", "home_charging", "charging_cable", "screens_hud", "audio_system", "glass_roof", "power_tailgate", "wireless_charging"]:
    base_row = features[(Z_P, key)]
    feat(Z_B, key, "conditional", base_row["value"], (BLACK + " " + base_row["conditions"]).strip(), base_row["source_ids"], "As Performance")
AWD = "Kia has not published an AWD sheet; shown as the GT-Line 2WD, whose equipment the AWD is reported to share."
for key in ["parking_cameras", "home_charging", "child_seats", "screens_hud", "audio_system", "glass_roof", "wireless_charging"]:
    base_row = features[(EV3_G, key)]
    feat(EV3_GA, key, "conditional", base_row["value"], (AWD + " " + base_row["conditions"]).strip(), base_row["source_ids"] + ["r6_kia_ev3_awd_evcentral"], "As GT-Line")

# ---- Measurements ----
J = "Industry data (JATO)"
fact([Y_RWD, Y_LR], "ground_clearance_mm", 167, "Unladen", ["b7_ce_my"])
fact(Y_L, "ground_clearance_mm", 169, "Unladen", ["b7_ce_my"])
fact(Y_P, "ground_clearance_mm", 151, "Unladen", ["b7_ce_my"])
fact([M3_RWD, M3_PR, M3_LR], "ground_clearance_mm", 138, "Unladen", ["b7_ce_m3"])
fact(M3_P, "ground_clearance_mm", 115, "Unladen", ["b7_ce_m3"])
fact(SEALION, "ground_clearance_mm", 140, "Unladen", ["b7_ce_s7"])
fact([EX5_C, EX5_CO], "ground_clearance_mm", 148, "Maker figure; load not stated", ["r6_geely_spec"])
fact([EX5_I, EX5_IO], "ground_clearance_mm", 168, "Maker figure; load not stated", ["r6_geely_spec"])
fact([Z_RWD, Z_LR, Z_P], "ground_clearance_mm", 172, "Minimum", ["zeekr_au_brochure_20250820"], qualifications=["173 mm at the front, 172 mm at the rear."])
fact(Z_B, "ground_clearance_mm", 172, "Minimum", ["b7_ce_7x"])
fact(J5, "ground_clearance_mm", 150, "Reported; not on Jaecoo's Australian sheet", ["b7_zecar_j5"], status="conditional")
fact(ATTO2, "ground_clearance_mm", 150, "Laden", ["r6_atto2_spec"])
fact(EV5_AS, "ground_clearance_mm", 175, "Minimum", ["r6_kia_ev5_spec"])
fact(EV5_AL, "ground_clearance_mm", 161, "Minimum", ["r6_kia_ev5_spec"])
fact([EV5_E, EV5_G], "ground_clearance_mm", 166, "Minimum", ["r6_kia_ev5_spec"])
fact([EV3_AS, EV3_AL, EV3_E, EV3_G], "ground_clearance_mm", 140, "Minimum", ["r6_kia_ev3_spec"])
fact(EV3_GA, "ground_clearance_mm", 140, "Minimum; front-drive figure applied to the announced AWD", ["r6_kia_ev3_spec"], status="conditional")
fact(EVO + ATTO3, "ground_clearance_mm", 175, "Unladen", ["byd_evo_spec", "r6_atto3_spec"], qualifications=["150 mm laden."])

KK = "Kerb to kerb"
fact([Y_RWD, Y_LR, Y_P], "turning_circle_m", 12.1, KK, ["b7_ce_my"])
fact(Y_L, "turning_circle_m", 12.5, KK, ["b7_ce_my"])
fact(TESLA_3, "turning_circle_m", 11.6, KK, ["b7_ce_m3"])
fact(SEALION, "turning_circle_m", 11.7, KK, ["byd_sealion_spec", "b7_ce_s7"])
fact([EX5_C, EX5_I], "turning_circle_m", 10.8, KK, ["r6_geely_spec", "b7_ce_ex5"])
fact([EX5_CO, EX5_IO], "turning_circle_m", 10.8, KK, ["geely_brochure_old", "b7_ce_ex5_26"])
fact([Z_RWD, Z_LR, Z_P], "turning_circle_m", 11.6, KK, ["zeekr_au_brochure_20250820"])
fact(Z_B, "turning_circle_m", 11.6, KK, ["b7_ce_7x"])
fact(J5, "turning_circle_m", 10.4, "Reported; not on Jaecoo's Australian sheet", ["b7_zecar_j5"], status="conditional")
fact(ATTO2, "turning_circle_m", 10.5, "Twice the minimum turning radius on BYD's sheet", ["r6_atto2_spec"])
fact(EV5, "turning_circle_m", 11.7, KK, ["r6_kia_ev5_spec"])
fact(EV3, "turning_circle_m", 10.4, "Maker figure; method not stated", ["r6_kia_ev3_spec"])
fact(EVO_D, "turning_circle_m", 10.7, "Twice the minimum turning radius on BYD's sheet", ["byd_evo_spec"])
fact(EVO_P, "turning_circle_m", 10.9, "Twice the minimum turning radius on BYD's sheet", ["byd_evo_spec"])
fact(ATTO3, "turning_circle_m", 10.7, "Wall to wall", ["b7_ce_atto3"])

KW = "Kerb or tare weight"
for vid, kg, source in [
    (Y_RWD, 1921, "b7_ce_my"), (Y_LR, 1992, "b7_ce_my"), (Y_L, 2088, "b7_ce_my"), (Y_P, 2033, "b7_ce_my"),
    (M3_RWD, 1761, "b7_ce_m3"), (M3_PR, 1761, "b7_ce_m3"), (M3_LR, 1747, "b7_ce_m3"), (M3_P, 1854, "b7_ce_m3"),
    (S7_PR, 2225, "byd_sealion_spec"), (S7_PF, 2340, "byd_sealion_spec"),
    (EX5_C, 1766, "r6_geely_spec"), (EX5_I, 1815, "r6_geely_spec"), (EX5_CO, 1715, "b7_ce_ex5_26"), (EX5_IO, 1765, "b7_ce_ex5_26"),
    (J5, 1710, "r6_jaecoo_spec"), (A2_D, 1555, "r6_atto2_spec"), (A2_P, 1590, "r6_atto2_spec"),
    (EV5_AS, 1910, "r6_kia_ev5_spec"), (EV5_AL, 2054, "r6_kia_ev5_spec"), (EV5_E, 2198, "r6_kia_ev5_spec"), (EV5_G, 2229, "r6_kia_ev5_spec"),
    (EV3_AS, 1845, "r6_kia_ev3_spec"), (EV3_AL, 1930, "r6_kia_ev3_spec"), (EV3_E, 1930, "r6_kia_ev3_spec"), (EV3_G, 1930, "r6_kia_ev3_spec"),
    (EVO_D, 1750, "byd_evo_spec"), (EVO_P, 1880, "byd_evo_spec"), (A3_E, 1680, "r6_atto3_spec"), (A3_P, 1750, "r6_atto3_spec"),
]:
    fact(vid, "kerb_weight_kg", kg, KW, [source])
ZW = "Industry data; Zeekr's Australian sheet gives no weight"
fact(Z_RWD, "kerb_weight_kg", 2320, ZW, ["b7_ce_7x"], status="conditional")
fact(Z_LR, "kerb_weight_kg", 2340, ZW, ["b7_ce_7x"], status="conditional")
fact([Z_P, Z_B], "kerb_weight_kg", 2460, ZW, ["b7_ce_7x"], status="conditional")
fact(EV3_GA, "kerb_weight_kg", 1995, "Overseas database record for the AWD", ["r6_evspec_ev3_awd"], status="conditional")

TR = "Maker rating"
fact(TESLA_Y, "towing_unbraked_kg", 750, TR, ["b7_ce_my", "r6_tesla_y_tow"], qualifications=["Needs the optional tow package."])
fact([M3_RWD, M3_PR, M3_LR], "towing_unbraked_kg", 750, TR, ["r6_tesla_3_tow"], qualifications=["Needs the optional tow package."])
fact(M3_P, "towing_unbraked_kg", 0, "Not rated to tow", ["r6_tesla_3_tow", "b7_ce_m3"])
fact(SEALION, "towing_unbraked_kg", 750, TR, ["b7_ce_s7"])
fact(EX5, "towing_unbraked_kg", 0, "Not rated to tow", ["r6_geely_tow"], qualifications=["Two towbar-equipped versions rated at 750 kg have been filed but are not on sale."])
fact(ZEEKR, "towing_unbraked_kg", 750, TR, ["b7_driven_7x_tow"])
fact(J5, "towing_unbraked_kg", 750, TR, ["r6_jaecoo_spec"])
fact(ATTO2, "towing_unbraked_kg", 750, "Reported rating; not on BYD's Australian sheet", ["b7_zecar_atto2"], status="conditional")
fact(EV5_AS, "towing_unbraked_kg", 300, TR, ["r6_kia_ev5_spec"])
fact([EV5_AL, EV5_E, EV5_G], "towing_unbraked_kg", 750, TR, ["r6_kia_ev5_spec"])
fact(EV3_AS, "towing_unbraked_kg", 500, TR, ["r6_kia_ev3_spec"])
fact([EV3_AL, EV3_E, EV3_G], "towing_unbraked_kg", 750, TR, ["r6_kia_ev3_spec"])
fact(EV3_GA, "towing_unbraked_kg", 750, "Long Range front-drive rating applied to the announced AWD", ["r6_kia_ev3_spec"], status="conditional")
fact(EVO + ATTO3, "towing_unbraked_kg", 750, TR, ["byd_evo_spec", "r6_atto3_spec"])
