# Rows for build-buyer-overlay.py, part 1: sources, cost of ownership, driving.
# Executed by the builder; uses its helpers (src, feat, fact) and variant lists.

T = "independent_test"
AAA = "Australian Automobile Association"
RW = "https://realworld.org.au/vehicles/"
src("b7_aaa_results", "https://realworld.org.au/results/", "Real-World Testing Program: all results", AAA, T, "Commonwealth-funded on-road tests over a 93 km route around Geelong. Battery EVs listed on 7 October 2026 include Tesla Model Y RWD and Long Range AWD, Tesla Model 3 RWD, BYD Sealion 7 Premium, BYD Atto 3, Kia EV3 Air Long Range, and Kia EV5 Air Long Range and Earth AWD. No Geely EX5, Zeekr 7X, Jaecoo J5, BYD Atto 2 or Atto 3 EVO result is listed.")
src("b7_aaa_my_rwd", RW + "2025-tesla-model-y/", "2025 Tesla Model Y RWD: real-world result", AAA, T, "Tested 23-24 October 2025 (April 2025 build): 450 km on the road against a 466 km laboratory figure (-3%); 148 Wh/km on the road against 153 Wh/km on the label.")
src("b7_aaa_my_lr", RW + "2025-tesla-model-y-lr/", "2025 Tesla Model Y Long Range AWD: real-world result", AAA, T, "Tested 30 April-5 May 2026: 559 km on the road against 600 km (-7%); 151 Wh/km on the road against 159 Wh/km on the label.")
src("b7_aaa_m3", RW + "2024-tesla-model-3/", "2024 Tesla Model 3 RWD: real-world result", AAA, T, "Tested 14-15 April 2025 (December 2023 build): 441 km on the road against 513 km (-14%); 140 Wh/km on the road against 132 Wh/km on the label.")
src("b7_aaa_sealion7", RW + "2025-byd-sealion-7/", "2025 BYD Sealion 7 Premium: real-world result", AAA, T, "Tested 10-18 March 2026: 469 km on the road against a 567 km laboratory figure (-17%); 199 Wh/km on the road against 170 Wh/km on the label.")
src("b7_aaa_ev5", RW + "2025-kia-ev5/", "2025 Kia EV5 Air 2WD Long Range: real-world result", AAA, T, "Tested 30-31 March 2026: 537 km on the road against 555 km (-3%); 185 Wh/km on the road against 180 Wh/km on the label.")
src("b7_aaa_ev5_awd", RW + "2025-kia-ev5-lr/", "2025 Kia EV5 Earth AWD Long Range: real-world result", AAA, T, "Tested 18-28 May 2026: 446 km on the road against 500 km (-11%); 219 Wh/km on the road against 201 Wh/km on the label.")
src("b7_aaa_ev3", RW + "2025-kia-ev3/", "2025 Kia EV3 Air Long Range: real-world result", AAA, T, "Tested 6-14 November 2025: 537 km on the road against 604 km (-11%); 164 Wh/km on the road against 149 Wh/km on the label.")
src("b7_aaa_atto3", RW + "2025-byd-atto-3/", "2025 BYD Atto 3 Essential: real-world result", AAA, T, "Tested 16-20 April 2026: 328 km on the road against a 410 km laboratory figure (-20%); 171 Wh/km on the road against 148 Wh/km on the label.")
src("b7_aaa_atto3_2023", RW + "2023-byd-atto-3/", "2023 BYD Atto 3 Extended Range: real-world result", AAA, T, "Tested 4-7 April 2025: 369 km on the road against a 480 km laboratory figure (-23%); 180 Wh/km on the road against 149 Wh/km on the label.")

CE = "CarExpert (JATO Dynamics data)"
CEN = "Drive-away figures include delivery, registration, plates and road taxes for a Sydney location."
src("b7_ce_my", "https://www.carexpert.com.au/tesla/model-y/2026", "2026 Tesla Model Y: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Premium RWD $63,963; Premium Long Range $74,463; L Premium Long Range $80,763; Performance $95,988 (on an $89,400 list price). " + CEN + " Tables: kerb weight 1,921 / 1,992 / 2,088 (L) / 2,033 kg; ground clearance unladen 167 mm (L 169, Performance 151); kerb-to-kerb turning circle 12.1 m (L 12.5); unbraked towing 750 kg; speakers 9 (RWD), 16 (Long Range, Performance), 19 (L); 16-inch centre and 8-inch rear screens.")
src("b7_ce_m3", "https://www.carexpert.com.au/tesla/model-3/2026", "2026 Tesla Model 3: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Premium RWD $59,648; Premium Long Range RWD $67,113; Performance $86,948. " + CEN + " Tables: kerb weight 1,761 (RWD) / 1,747 (Long Range RWD) / 1,854 kg (Performance); ground clearance 138 mm (Performance 115); turning circle 11.6 m; unbraked towing 750 kg (Performance 0); speakers 9 (17 Performance); 8-inch rear screen.")
src("b7_ce_s7", "https://www.carexpert.com.au/byd/sealion-7/2025", "BYD Sealion 7: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Premium $59,857 (list $54,990); Performance $69,307. " + CEN + " Tables: ground clearance unladen 140 mm; kerb-to-kerb turning circle 11.7 m; kerb weight 2,225 / 2,340 kg; unbraked towing 750 kg.")
src("b7_ce_ex5", "https://www.carexpert.com.au/geely/ex5/2027", "2027 Geely EX5: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Complete $46,267; Inspire $50,407. " + CEN + " Tables: kerb weight 1,766 / 1,815 kg; ground clearance 148 / 168 mm; turning circle 10.8 m; towing 0 kg.")
src("b7_ce_ex5_26", "https://www.carexpert.com.au/geely/ex5/2026", "2026 Geely EX5: variants and drive-away prices", CE, D, "Sydney drive-away from: Complete $45,156; Inspire $49,276. " + CEN + " Tables: kerb weight 1,715 (Complete) / 1,765 kg (Inspire) for the 60.22 kWh cars.")
src("b7_ce_7x", "https://www.carexpert.com.au/zeekr/7x/2026", "2026 Zeekr 7X: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Base $62,913; Long Range $69,213; Performance $78,663; Black Edition $81,813. " + CEN + " Tables: kerb weight 2,320 / 2,340 / 2,460 / 2,460 kg; ground clearance 172 mm; turning circle 11.6 m; speakers 10 (Base) and 21.")
src("b7_ce_ev5", "https://www.carexpert.com.au/kia/ev5/2026", "2026 Kia EV5: variants and drive-away prices", CE, D, "Sydney drive-away from: Air $61,611; Earth $70,011; GT-Line $77,361. " + CEN)
src("b7_ce_ev3", "https://www.carexpert.com.au/kia/ev3/2026", "2026 Kia EV3: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Air $52,098; Earth $63,648; GT-Line $69,265. " + CEN + " Tables: ground clearance 140 mm (GT-Line 147); kerb weight 1,845 / 1,930 kg.")
src("b7_ce_atto3", "https://www.carexpert.com.au/byd/atto-3/2026", "BYD Atto 3: variants, drive-away prices and specification tables", CE, D, "Sydney drive-away from: Essential $44,092 (list $39,990); Premium $49,242 (list $44,990). " + CEN + " Tables: ground clearance 175 mm; kerb weight 1,680 / 1,750 kg; wall-to-wall turning circle 10.7 m; unbraked towing 750 kg.")
src("b7_revenue_nsw", "https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/motor-vehicle-duty", "Motor vehicle duty", "Revenue NSW", G, "New passenger vehicles: $3 per $100 up to $44,999; $1,350 plus $5 per $100 above $45,000, on the price paid including GST.")
src("b7_jaecoo_driven", "https://thedriven.io/2026/08/13/jaecoo-j5-ev-review-whats-the-catch-at-36990-driveaway/", "Jaecoo J5 EV review: what's the catch at $36,990 driveaway?", "The Driven", I, "Reviews the J5 EV at its A$36,990 national driveaway offer. Fewer alert sounds than most rivals; most switch off from a drop-down menu and stay off; the driver-attention monitor can chime more than needed.", published="2026-08-13")

src("b7_pwc_fbt", "https://www.pwc.com.au/tax/tax-alerts/government-announces-phased-changes-to-the-FBT-electric-car-exemption.html", "Government announces phased changes to the FBT electric car exemption", "PwC Australia", I, "Announced 5 May 2026. To 31 March 2027: full exemption continues. 1 April 2027 to 1 April 2029: full exemption only for eligible cars valued at $75,000 or less; a 25% discount above that, up to the fuel-efficient luxury car tax threshold. From 1 April 2029: a 25% discount for all eligible cars. Existing arrangements keep their treatment.")
src("b7_pitcher_fbt", "https://www.pitcher.com.au/insights/federal-budget-2026-27-fringe-benefits-tax-exemption-for-electric-vehicles/", "Federal Budget 2026-27: FBT exemption for electric vehicles", "Pitcher Partners", I, "The 25% discount is delivered through a 15% statutory formula rate in place of 20%. Arrangements keep the rate that applied when they began. Described as announced, not legislated.")
src("b7_ato_lct", "https://www.ato.gov.au/tax-rates-and-codes/luxury-car-tax-rate-and-thresholds", "Luxury car tax rate and thresholds", "Australian Taxation Office", G, "2026-27 thresholds: $91,661 for fuel-efficient vehicles; $80,809 for other vehicles.")
src("b7_zecar_fbt", "https://zecar.com/finance/guides/electric-car-discount-fbt-exemption-everything-you-need-to-know", "Electric car FBT exemption explained (2026)", "Zecar", I, "The value tested against the thresholds includes the base price, GST, options and dealer delivery.")
src("b7_ctm_insurance", "https://www.comparethemarket.com.au/news/ev-insurance-up-in-12-months/", "EV insurance prices up 10% in 12 months", "Compare the Market", I, "Quotes at 5 March 2026 for a 34-year-old man in Alderley, Brisbane, clean record, $900 excess, 15,000 km a year: Tesla Model Y RWD $3,203; Tesla Model 3 RWD $3,356; Kia EV5 Standard Range $1,921; BYD Sealion 7 Premium $1,795; Zeekr X RWD $2,271; ten-model EV average $2,306.")
src("b7_choice_insurance", "https://www.choice.com.au/money/insurance/car/articles/the-cost-of-insuring-electric-vehicles", "The cost of insuring electric vehicles", "CHOICE", I, "More than 16,000 EV quotes collected in January 2026. Brand averages for new cars: Tesla $2,985 (dearest); BYD $2,220; Kia $1,774; Geely $1,622 (cheapest); all EVs $2,440. Newer EVs cost about 30%, or $575, more a year to insure than petrol cars.", published="2026-03-25")
src("b7_tesla_gfv", "https://www.carexpert.com.au/car-news/tesla-launches-guaranteed-future-value-program-for-model-y-and-model-3", "Tesla launches guaranteed future value program for Model Y and Model 3", "CarExpert", I, "From July 2026, through finance partner Driva: a guaranteed minimum value at the end of a financed term for Model 3 and Model Y, subject to distance and condition; not available to rideshare drivers.")
src("b7_kia_gfv", "https://www.kia.com/au/shopping-tools/kia-renew-guaranteed-future-value.html", "Kia Renew guaranteed future value", "Kia Australia", P, "A minimum future value set by Kia Finance in the contract; at the end of the term the owner can trade in, return or keep the car.")
src("b7_datium_resale", "https://thenightly.com.au/australia/why-evs-have-really-poor-resale-value-in-australia-tesla-byd-and-mg-prices-are-falling-faster-than-rivals-c-20112843", "Why EVs have really poor resale value in Australia", "The Nightly", I, "Pickles and Datium Insights auction data, September 2025: two-year-old Tesla Model Y kept 58% of its new price, Tesla Model 3 54%, BYD Atto 3 54%.")
src("b7_nrma_resale", "https://www.insurancebusinessmag.com/au/news/auto-motor/ev-appetite-rises-as-confidence-in-resale-value-collapses-588328.aspx", "EV appetite rises as confidence in resale value collapses", "Insurance Business (NRMA Insurance 'Changing Gears')", I, "Owner confidence in EV resale value fell from 76% in 2024 to 56% in 2026; 57% of respondents worry about finding trained mechanics.", published="2026-09-02")
src("b7_tesla_warranty", "https://thedriven.io/2026/01/09/tesla-ups-warranty-to-5-year-unlimited-km-in-australia-a-world-first/", "Tesla ups warranty to 5 year unlimited km in Australia", "The Driven", I, "From January 2026: five-year, unlimited-kilometre vehicle warranty with five years of 24-hour roadside assistance.", published="2026-01-09")
src("b7_byd_service", "https://bydautomotive.com.au/service-and-warranty", "Servicing and warranty", "BYD Australia", P, "12 months of complimentary roadside assistance from delivery for vehicles delivered on or after 22 July 2025. Service every 12 months or 20,000 km; no service prices on the page.")
src("b7_kia_roadside", "https://www.kia.com/au/owners/roadside-assist.html", "Kia Roadside Assist", "Kia Australia", P, "12 months complimentary; each scheduled service at an authorised Kia dealer adds 12 months, for up to eight years.")
src("b7_geely_launch", "https://www.mynrma.com.au/open-road/news/2025/geely-ex5-launches", "Geely EX5 launches", "NRMA Open Road", I, "Seven-year, unlimited-kilometre warranty and up to seven years of roadside assistance when the car is serviced within the Geely dealer network.")
src("b7_zeekr_service", "https://www.zeekrlife.com/en-au/service", "Zeekr service", "Zeekr Australia", P, "Five years of complimentary 24-hour roadside assistance; servicing through Zeekr Authorised Partners.")
src("b7_tesla_centres", "https://www.scrapehero.com/location-reports/Tesla%20Service%20Centers-Australia/", "Tesla Service Center locations in Australia", "ScrapeHero", D, "17 Tesla service centres at 2 April 2025: Queensland 5, NSW 4, Victoria 3, Western Australia 2, and one each in South Australia, the ACT and Tasmania.")
src("b7_tesla_mobile", "https://whichcar.com.au/car-news/tesla-expands-mobile-servicing-australia-wide", "Tesla expands mobile servicing Australia-wide", "WhichCar", I, "Tesla sends mobile technicians to owners' homes or workplaces for many repairs.")
src("b7_byd_network", "https://www.mynrma.com.au/open-road/news/2026/byd-targets-shorter-service-waits", "BYD targets shorter service waits", "NRMA Open Road", I, "About 120 sales and service sites, about 30 more planned by the end of 2026 and roughly 200 by early 2027; service waits targeted at four to five days; a 20,000 square metre parts warehouse being built in Melbourne.")
src("b7_geely_network", "https://www.carsguide.com.au/car-news/number-one-chinese-brand-geely-wont-flood-the-australian-market-with-new-models-but-plans", "Geely won't flood the Australian market with new models", "CarsGuide", I, "Up to 48 Geely locations in Australia with more than 80 planned; parts distribution centres aiming to fill orders within 24 hours.", published="2026-05-20")
src("b7_zeekr_network", "https://premium.goauto.com.au/zeekr-opens-new-gold-coast-dealership/", "Zeekr opens new Gold Coast dealership", "GoAutoNews Premium", I, "Zeekr's seventeenth Australian dealership, July 2026; the fifth in Queensland.")
src("b7_oj_network", "https://zecar.com/reviews/omoda-jaecoo-opens-50th-australian-dealership-in-major-milestone", "Omoda Jaecoo opens 50th Australian dealership", "Zecar", I, "50 Omoda Jaecoo dealerships nationwide in January 2026, less than a year after launch.")
src("b7_kia_million", "https://www.hyundaimotorgroup.com/en/news/kia-celebrates-millionth-sale-in-australia-underscoring-strong-market-growth", "Kia celebrates millionth sale in Australia", "Hyundai Motor Group", P, "Kia passed one million Australian sales in 2025 through its national dealer network. No dealer count is given.")
src("b7_tesla_speed", "https://www.tesla.com/ownersmanual/modely/en_au/GUID-5D3D4014-4E98-45D7-8BBC-F76BCA9CEC05.html", "Speed Assist (Model Y owner's manual)", "Tesla", P, "Speed Limit Warning can be set to Off (no display, no chime), Display or Chime.")
src("b7_kia_isla", "https://tynan.com.au/blog/kia-australia-responds-to-customer-feedback-with-new-speed-limit-warning-feature", "Kia Australia responds to customer feedback with new speed limit warning feature", "Tynan Motors (Kia dealer)", I, "A long press of the steering-wheel mute button silences the overspeed chime; delivered by over-the-air update, first to the Sorento and EV9.")
src("b7_kia_adas", "https://web1.goauto.com.au/kia/kia-says-it-won-t-adjust-adas-stance/2025-04-11/96137.html", "Kia says it won't adjust ADAS stance", "GoAuto", I, "Kia says the speed-limit warning must default to on at each start to keep a five-star ANCAP rating under 2023-and-later protocols.", published="2025-04-11")
src("b7_geely_ota", "https://evcentral.com.au/geely-ex5-silences-the-bing-bongs-electric-suvs-ota-update-addresses-one-of-our-key-annoyances/", "Geely EX5 silences the bing-bongs", "EV Central", I, "A February 2026 over-the-air update adds a one-touch drop-down control and a saved profile to disable lane keeping, driver-fatigue detection and speed-limit alerts.")
src("b7_geely_driven", "https://thedriven.io/2025/08/07/geely-ex5-review-electric-suv-is-great-value-for-money-and-not-just-a-distraction", "Geely EX5 review", "The Driven", I, "The driver monitor warned 'driver distraction detected' while the driver watched the road and failed to detect a face behind reflective sunglasses.", published="2025-08-07")


# ---- Driveaway price ----
CE_NOTE = "CarExpert's Sydney figure for this grade: delivery, registration, plates and NSW stamp duty included. Other states and dealers differ; ask for a written quote."


def driveaway(vid, amount, source, estimate=None):
    if estimate:
        feat(vid, "driveaway_price", "conditional", f"About A${amount:,} in Sydney", estimate, [source, "b7_revenue_nsw"], "Estimate")
    else:
        feat(vid, "driveaway_price", "standard", f"A${amount:,} in Sydney", CE_NOTE, [source], "Published estimate")


TESLA_EST = "CarExpert has no Sydney figure at this list price. Estimated with the costs it applies to other trims: Tesla's A$1,800 delivery and order fees, registration, and NSW stamp duty."
driveaway(Y_RWD, 63963, "b7_ce_my")
driveaway(Y_LR, 74463, "b7_ce_my")
driveaway(Y_L, 80763, "b7_ce_my")
driveaway(Y_P, 91300, "b7_ce_my", "CarExpert's A$95,988 uses an earlier A$89,400 list price. " + TESLA_EST)
driveaway(M3_PR, 59648, "b7_ce_m3")
driveaway(M3_LR, 67113, "b7_ce_m3")
driveaway(M3_P, 86948, "b7_ce_m3")
driveaway(M3_RWD, 50200, "b7_ce_m3", TESLA_EST)
driveaway(S7_PR, 59857, "b7_ce_s7")
driveaway(S7_PF, 69307, "b7_ce_s7")
driveaway(EX5_C, 46267, "b7_ce_ex5")
driveaway(EX5_I, 50407, "b7_ce_ex5")
driveaway(EX5_CO, 45156, "b7_ce_ex5_26")
driveaway(EX5_IO, 49276, "b7_ce_ex5_26")
driveaway(Z_RWD, 62913, "b7_ce_7x")
driveaway(Z_LR, 69213, "b7_ce_7x")
driveaway(Z_P, 78663, "b7_ce_7x")
driveaway(Z_B, 81813, "b7_ce_7x")
feat(J5, "driveaway_price", "standard", "A$36,990 driveaway, nationally", "Jaecoo's national driveaway offer, reviewed by The Driven in August 2026 and still listed in October. Offers can end; confirm before ordering.", ["b7_jaecoo_driven", "jaecoo_spec_apr2026"], "Maker offer")
BYD_EST = "CarExpert lists no Sydney figure for this model. Estimated from the listed price with NSW stamp duty and the roughly A$2,900 of delivery and registration costs it applies to the BYD Atto 3."
driveaway(A2_D, 35900, "b7_ce_atto3", BYD_EST)
driveaway(A2_P, 40000, "b7_ce_atto3", BYD_EST)
driveaway(EVO_D, 46200, "b7_ce_atto3", BYD_EST)
driveaway(EVO_P, 51300, "b7_ce_atto3", BYD_EST)
driveaway(A3_E, 44092, "b7_ce_atto3")
driveaway(A3_P, 49242, "b7_ce_atto3")
KIA_EST = "CarExpert prices this grade from its cheaper battery. Estimated by adding the same on-road costs, with NSW stamp duty on the higher price."
driveaway(EV5_AS, 61611, "b7_ce_ev5")
driveaway(EV5_AL, 66200, "b7_ce_ev5", KIA_EST)
driveaway(EV5_E, 70011, "b7_ce_ev5")
driveaway(EV5_G, 77361, "b7_ce_ev5")
driveaway(EV3_AS, 52098, "b7_ce_ev3")
driveaway(EV3_AL, 58100, "b7_ce_ev3", KIA_EST)
driveaway(EV3_E, 63648, "b7_ce_ev3")
driveaway(EV3_G, 69265, "b7_ce_ev3")
driveaway(EV3_GA, 71900, "b7_ce_ev3", "Announced version, not yet on CarExpert. Estimated from the reported list price with GT-Line on-road costs and NSW stamp duty.")

# ---- Novated lease and FBT ----
FBT = ["b7_pwc_fbt", "b7_pitcher_fbt", "b7_ato_lct", "b7_zecar_fbt"]
FBT_TAIL = " Announced in the May 2026 Budget and not yet law. From 1 April 2029 the exemption becomes a 25% discount for every eligible EV; a lease keeps the treatment it started with."
for vid, v in variants.items():
    price = v["price_aud"]
    fees = 1800 if v["brand"] == "Tesla" else 0
    if price > 75000:
        feat(vid, "novated_fbt", "conditional", "FBT-exempt now · 25% discount only for leases from April 2027", f"Listed at A${price:,}, above the A$75,000 cap that applies to new leases from 1 April 2027 and below the A$91,661 luxury car tax threshold." + FBT_TAIL, FBT, "Changes in 2027")
    elif price + fees > 75000 or price >= 71000:
        over = f"Tesla's A$1,800 delivery and order fees take the listed A${price:,} to A${price + fees:,}, over the cap." if fees else f"Listed at A${price:,}; dealer delivery and options count toward the cap and could take it over."
        feat(vid, "novated_fbt", "conditional", "FBT-exempt now · at the edge of the 2027 cap", "From 1 April 2027 the full exemption stops at a value of A$75,000, counted with GST, delivery and options. " + over + FBT_TAIL, FBT, "Near the cap")
    else:
        feat(vid, "novated_fbt", "standard", "FBT-exempt now and under the 2027 cap", f"Listed at A${price:,}, under the A$75,000 cap that applies to new leases from 1 April 2027, with room for delivery charges." + FBT_TAIL, FBT, "Exempt")

# ---- Insurance ----
CTM = "Compare the Market, March 2026: a 34-year-old Brisbane driver with a clean record and a A$900 excess. "
CHOICE = "CHOICE's sample of more than 16,000 EV quotes, January 2026, new cars. "
NOT_QUOTE = " Not a quote; yours depends on your address, age and record."
feat(Y_RWD, "insurance_cost", "standard", "A$3,203 a year in a benchmark quote", CTM + "The Tesla brand average in CHOICE's January 2026 sample was A$2,985, the highest of the EV brands it priced." + NOT_QUOTE, ["b7_ctm_insurance", "b7_choice_insurance"], "Benchmark")
feat([Y_LR, Y_L, Y_P], "insurance_cost", "conditional", "About A$2,985 a year (Tesla average)", CHOICE + "No benchmark is published for this version; the Model Y RWD benchmark from Compare the Market was A$3,203." + NOT_QUOTE, ["b7_choice_insurance", "b7_ctm_insurance"], "Brand average")
feat(M3_PR, "insurance_cost", "standard", "A$3,356 a year in a benchmark quote", CTM + "Quoted for the Model 3 RWD on sale in March 2026. Tesla's brand average in CHOICE's sample was A$2,985." + NOT_QUOTE, ["b7_ctm_insurance", "b7_choice_insurance"], "Benchmark")
feat([M3_LR, M3_RWD, M3_P], "insurance_cost", "conditional", "About A$2,985 a year (Tesla average)", CHOICE + "No benchmark is published for this version; the Model 3 RWD benchmark from Compare the Market was A$3,356." + NOT_QUOTE, ["b7_choice_insurance", "b7_ctm_insurance"], "Brand average")
feat(S7_PR, "insurance_cost", "standard", "A$1,795 a year in a benchmark quote", CTM + "BYD's brand average in CHOICE's January 2026 sample was A$2,220." + NOT_QUOTE, ["b7_ctm_insurance", "b7_choice_insurance"], "Benchmark")
feat(S7_PF, "insurance_cost", "conditional", "About A$2,220 a year (BYD average)", CHOICE + "No benchmark is published for the Performance; the Sealion 7 Premium benchmark from Compare the Market was A$1,795." + NOT_QUOTE, ["b7_choice_insurance", "b7_ctm_insurance"], "Brand average")
feat(ATTO2 + EVO + ATTO3, "insurance_cost", "conditional", "About A$2,220 a year (BYD average)", CHOICE + "No model-level benchmark is published for this car." + NOT_QUOTE, ["b7_choice_insurance"], "Brand average")
feat(EX5, "insurance_cost", "conditional", "About A$1,622 a year (Geely average)", CHOICE + "Geely was the cheapest EV brand to insure in the sample. No model-level benchmark is published." + NOT_QUOTE, ["b7_choice_insurance"], "Brand average")
feat(EV5_AS, "insurance_cost", "standard", "A$1,921 a year in a benchmark quote", CTM + "Kia's brand average in CHOICE's January 2026 sample was A$1,774." + NOT_QUOTE, ["b7_ctm_insurance", "b7_choice_insurance"], "Benchmark")
feat([EV5_AL, EV5_E, EV5_G] + EV3, "insurance_cost", "conditional", "About A$1,774 a year (Kia average)", CHOICE + "No benchmark is published for this version; the EV5 Standard Range benchmark from Compare the Market was A$1,921." + NOT_QUOTE, ["b7_choice_insurance", "b7_ctm_insurance"], "Brand average")
feat(ZEEKR, "insurance_cost", "conditional", "No 7X benchmark · Zeekr X quoted A$2,271", "Neither index prices the 7X. " + CTM + "That quote is for the smaller Zeekr X RWD, up 19% in a year. The all-EV average in CHOICE's sample was A$2,440." + NOT_QUOTE, ["b7_ctm_insurance", "b7_choice_insurance"], "Different model")
feat(J5, "insurance_cost", "unavailable", "No published benchmark yet", "Neither Compare the Market's March 2026 index nor CHOICE's January 2026 sample prices the J5 EV or the Jaecoo brand. The all-EV average in CHOICE's sample was A$2,440 for new cars.", ["b7_ctm_insurance", "b7_choice_insurance"], "Not published")

# ---- Resale ----
GFV_T = "Tesla's program, through Driva since July 2026, sets a minimum value at the end of a financed term, subject to distance and condition; not for rideshare use. "
feat([Y_RWD, Y_LR, Y_P], "resale_value", "standard", "Guaranteed future value on finance · Model Y kept 58% after two years", GFV_T + "Pickles and Datium auction data, September 2025: two-year-old Model Ys averaged 58% of their new price.", ["b7_tesla_gfv", "b7_datium_resale"], "Guarantee offered")
feat(Y_L, "resale_value", "standard", "Guaranteed future value on finance · no resale history yet", GFV_T + "The six-seat version went on sale in 2026, so no auction average exists; two-year-old five-seat Model Ys averaged 58% in September 2025.", ["b7_tesla_gfv", "b7_datium_resale"], "Guarantee offered")
feat(TESLA_3, "resale_value", "standard", "Guaranteed future value on finance · Model 3 kept 54% after two years", GFV_T + "Pickles and Datium auction data, September 2025: two-year-old Model 3s averaged 54% of their new price.", ["b7_tesla_gfv", "b7_datium_resale"], "Guarantee offered")
feat(KIA, "resale_value", "conditional", "Kia Renew guaranteed future value on Kia finance", "Kia Finance sets a minimum future value in the contract; confirm this model and term are eligible. Too new for two-year auction averages.", ["b7_kia_gfv"], "Check eligibility")
NO_GFV = "No guaranteed future value program is listed by the maker as at 7 October 2026. NRMA Insurance found owner confidence in EV resale fell from 76% to 56% between 2024 and 2026."
feat(ATTO3 + EVO, "resale_value", "unavailable", "No guarantee · Atto 3 kept 54% after two years", NO_GFV + " Pickles and Datium auction data, September 2025, for the Atto 3 before the EVO update.", ["b7_datium_resale", "b7_nrma_resale"], "No guarantee")
feat(SEALION + ATTO2 + EX5 + ZEEKR + [J5], "resale_value", "unavailable", "No guarantee · too new for auction data", NO_GFV + " On sale since 2025 or later, so no two-year auction average exists.", ["b7_nrma_resale", "b7_datium_resale"], "No guarantee")

# ---- Roadside assistance ----
feat(TESLA, "roadside_assistance", "standard", "5 years, 24 hours a day", "Runs with the five-year, unlimited-kilometre warranty introduced in January 2026.", ["b7_tesla_warranty"])
feat(BYD, "roadside_assistance", "standard", "12 months", "Complimentary from delivery for cars delivered on or after 22 July 2025.", ["b7_byd_service"])
feat(KIA, "roadside_assistance", "standard", "1 year, renewable to 8", "Each scheduled service at a Kia dealer adds 12 months, up to eight years.", ["b7_kia_roadside"])
feat(EX5, "roadside_assistance", "standard", "Up to 7 years", "Applies while the car is serviced within the Geely dealer network.", ["b7_geely_launch"])
feat(ZEEKR, "roadside_assistance", "standard", "5 years, 24 hours a day", "Complimentary for new owners.", ["b7_zeekr_service"])
feat(J5, "roadside_assistance", "standard", "1 year, renewable to 8", "Each scheduled service at a Jaecoo dealer adds 12 months, up to eight years.", ["r6_jaecoo_spec"])

# ---- Service network ----
feat(TESLA, "service_network", "standard", "17 service centres plus mobile servicing", "Independent count at April 2025: Queensland 5, NSW 4, Victoria 3, WA 2, and one each in SA, the ACT and Tasmania; none in the Northern Territory. Tesla sends mobile technicians for many repairs.", ["b7_tesla_centres", "b7_tesla_mobile"])
feat(BYD, "service_network", "standard", "About 120 sales and service sites", "As reported in 2026, with about 30 more due by the end of the year and roughly 200 planned by early 2027. BYD is targeting service waits of four to five days.", ["b7_byd_network"])
feat(KIA, "service_network", "conditional", "National dealer network · count not published", "Kia has sold more than a million cars in Australia through a long-established dealer network. It publishes a dealer locator, not a count.", ["b7_kia_million", "b7_kia_roadside"], "Count not published")
feat(EX5, "service_network", "standard", "Up to 48 locations", "As at May 2026, with more than 80 planned.", ["b7_geely_network"])
feat(ZEEKR, "service_network", "standard", "17 dealerships", "As at July 2026, five of them in Queensland. Service is through these authorised partners.", ["b7_zeekr_network", "b7_zeekr_service"])
feat(J5, "service_network", "standard", "50 Omoda Jaecoo dealerships", "As at January 2026, less than a year after the brand launched.", ["b7_oj_network"])

# ---- Driver-monitoring and speed alerts ----
feat(TESLA_Y, "driver_alerts", "standard", "Speed-limit warning: off, display only, or chime", "Set under Controls > Autopilot. A cabin camera checks the driver's attention while Autosteer or FSD (Supervised) is in use.", ["b7_tesla_speed", "tesla_y_manual"], "Adjustable")
feat(TESLA_3, "driver_alerts", "standard", "Speed-limit warning: off, display only, or chime", "Set under Controls > Autopilot. A cabin camera checks the driver's attention while Autosteer or FSD (Supervised) is in use.", ["b7_tesla_speed", "tesla_3_manual"], "Adjustable")
KIA_ALERT = "Kia says the speed-limit warning must default to on to keep a five-star ANCAP rating, and its manual says attention warnings turn on at every restart. An update lets a long press of the steering-wheel mute button silence the overspeed chime; check the car you drive has it."
feat(EV5, "driver_alerts", "conditional", "Warnings switch back on at every start", KIA_ALERT, ["r6_kia_ev5_manual", "b7_kia_adas", "b7_kia_isla"], "Resets each drive")
feat(EV3, "driver_alerts", "conditional", "Warnings switch back on at every start", KIA_ALERT, ["r6_kia_ev3_manual", "b7_kia_adas", "b7_kia_isla"], "Resets each drive")
feat(EX5, "driver_alerts", "standard", "One-touch menu switches the alerts off", "Added by an over-the-air update in February 2026: a drop-down control and a saved profile cover lane keeping, driver-fatigue detection and speed-limit alerts. An earlier review found the monitor warned an attentive driver and could not see past reflective sunglasses.", ["b7_geely_ota", "b7_geely_driven"], "One-touch off")
feat(J5, "driver_alerts", "standard", "Alerts switch off from a menu and mostly stay off", "The Driven's August 2026 review found fewer chimes than most rivals; the driver-attention monitor can still chime more than needed.", ["b7_jaecoo_driven"], "Settings stick")
BYD_ALERT = "Fatigue and distraction warnings are on from the factory; the switch is under Vehicle > Cabin Perception on the touchscreen. The handbook does not say whether the choice survives a restart."
feat(SEALION, "driver_alerts", "standard", "Can be switched off · steering-wheel button pauses them for 15 minutes", BYD_ALERT, ["byd_sealion_manual"], "Adjustable")
feat(ATTO2, "driver_alerts", "standard", "Can be switched off in the Cabin Perception menu", BYD_ALERT + " The 15-minute pause is described in the Sealion 7 handbook.", ["byd_atto2_manual", "byd_sealion_manual"], "Adjustable")
feat(EVO, "driver_alerts", "standard", "Can be switched off in the Cabin Perception menu", BYD_ALERT + " The 15-minute pause is described in the Sealion 7 handbook.", ["byd_evo_manual", "byd_sealion_manual"], "Adjustable")
feat(ATTO3, "driver_alerts", "standard", "Can be switched off in the Cabin Perception menu", BYD_ALERT, ["byd_atto3_manual"], "Adjustable")
feat(ZEEKR, "driver_alerts", "standard", "Fatigue and distraction alerts each have a switch · overspeed shown as a red ring", "From the Australian-market manual hosted on an owner site: the overspeed alert is a red ring around the speed sign on the driver display. Check the installed software.", ["r6_zeekr_manual"], "Adjustable")

# ---- Parking cameras and sensors ----
feat(TESLA_Y, "parking_cameras", "standard", "Cameras all round with a rendered 3D view · no ultrasonic sensors", "Tesla's Park Assist estimates distances from cameras. There are no parking sensors in the bumpers.", ["tesla_y_manual"])
feat(TESLA_3, "parking_cameras", "standard", "Cameras all round with a rendered 3D view · no ultrasonic sensors", "Tesla's Park Assist estimates distances from cameras. There are no parking sensors in the bumpers.", ["tesla_3_manual"])
feat(SEALION, "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["byd_sealion_spec"])
feat([EX5_C, EX5_CO], "parking_cameras", "standard", "360° camera · rear sensors only", "Front sensors are added on Inspire.", ["r6_geely_spec"])
feat([EX5_I, EX5_IO], "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["r6_geely_spec"])
feat([Z_RWD, Z_LR, Z_P], "parking_cameras", "standard", "360° camera · automatic parking assist", "", ["zeekr_au_brochure_20250820"])
feat(J5, "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["r6_jaecoo_spec"])
feat(A2_D, "parking_cameras", "standard", "Reversing camera · rear sensors only", "The 360° camera and front sensors come with Premium.", ["r6_atto2_spec"])
feat(A2_P, "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["r6_atto2_spec"])
feat([EV5_AS, EV5_AL, EV5_E], "parking_cameras", "standard", "Reversing camera · front and rear sensors", "The 360° camera and blind-spot view come with GT-Line.", ["r6_kia_ev5_spec"])
feat(EV5_G, "parking_cameras", "standard", "360° camera · blind-spot view · front and rear sensors", "", ["r6_kia_ev5_spec"])
feat([EV3_AS, EV3_AL, EV3_E, EV3_G], "parking_cameras", "standard", "Reversing camera · front and rear sensors", "Kia's MY27 sheet for the four front-drive grades lists no 360° camera.", ["r6_kia_ev3_spec"])
feat(EVO, "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["byd_evo_spec"])
feat(ATTO3, "parking_cameras", "standard", "360° camera · front and rear sensors", "", ["r6_atto3_spec"])
