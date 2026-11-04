#!/usr/bin/env python3
"""Builds data/research-editorial-2026-10-07.json.

Editorial pass over every comparison cell: one wording pattern per row so the
ten families read like for like, no raw research structures, no caveat repeated
in every cell. Facts come from the existing research and overlays; the few new
figures are recorded as sources below. The earlier JSON files are not modified.
Run from the project root:

    python3 scripts/build-editorial-overlay.py
"""
import json

DATE = "2026-10-07"
base = json.load(open("data/au_ev_all_variants_2026-10-06.json"))

FAMILY = {
    "tesla_model_y": "TY",
    "byd_sealion_7": "S7",
    "geely_ex5": "GX",
    "zeekr_7x": "ZX",
    "jaecoo_j5_ev": "J5",
    "byd_atto_2": "A2",
    "tesla_model_3": "T3",
    "kia_ev5": "K5",
    "kia_ev3": "K3",
    "byd_atto_3_evo": "A3E",
    "byd_atto_3_legacy": "A3L",
}
# Short code = family code + the variant's own index, e.g. TY2 is Model Y Premium RWD.
CODE = {v["id"]: FAMILY[v["model_id"]] + v["id"].rsplit("__", 1)[1] for v in base["variants"]}
BY_CODE = {c: i for i, c in CODE.items()}
ALL = "TY* S7* GX* ZX* J5* A2* T3* K5* K3* A3E* A3L*"
PROVISIONAL = "K35"
PROVISIONAL_NOTE = "Based on GT-Line equipment; Kia has not yet published an AWD sheet."


def expand(selector):
    out = []
    for token in selector.split():
        if token.endswith("*"):
            fam = token[:-1]
            out += [c for c in BY_CODE if c[: len(fam)] == fam and c[len(fam) :].isdigit()]
        else:
            assert token in BY_CODE, token
            out.append(token)
    return out


S, U, C, O, J = "standard", "unavailable", "conditional", "optional", "subjective"
rows = {}


def row(criterion, *cells):
    """Later cells override earlier ones, so a family default can precede a trim exception."""
    resolved = {}
    for selector, status, value, note in cells:
        for code in expand(selector):
            resolved[code] = (status, value, note, selector)
    missing = set(BY_CODE) - set(resolved)
    assert not missing, (criterion, sorted(missing))
    rows[criterion] = resolved


# ── Price & ownership ────────────────────────────────────────────────────────
row(
    "warranty_service",
    ("TY* T3*", S, "No fixed schedule — serviced by condition", "Tesla lists item-by-item checks, such as brake fluid and cabin filters, in place of annual services. It is not maintenance-free."),
    ("S7* A2* A3E* A3L*", S, "Every 12 months / 20,000 km", "BYD publishes no lifetime service total; ask for an itemised cost over the years you plan to keep the car."),
    ("GX*", S, "Every 12 months / 20,000 km · prepaid A$517 for 3 years", "Prepaid plans: A$517 (3 years), A$1,190 (5 years) or A$1,642 (7 years)."),
    ("ZX*", C, "Interval not confirmed — annual or every 24 months", "Zeekr's booklet shows a 24-month / 40,000 km main schedule with optional annual checks, while reviews quote annual / 20,000 km. No service prices are published."),
    ("J5*", S, "Every 12 months / 20,000 km · capped A$155–A$225 a visit", "Capped services alternate A$155 and A$225, A$1,520 for the first eight."),
    ("K5*", S, "Every 12 months / 15,000 km · prepaid A$1,517 for 3 years", "Prepaid plans: A$1,517 (3 years), A$2,389 (5 years) or A$3,667 (7 years)."),
    ("K51 K52", S, "Every 12 months / 15,000 km · prepaid A$1,185 for 3 years", "Prepaid plans for Air: A$1,185 (3 years), A$1,839 (5 years) or A$2,892 (7 years)."),
    ("K3*", S, "Every 12 months / 15,000 km · prepaid A$695 for 3 years", "Prepaid plans: A$695 (3 years), A$1,320 (5 years) or A$1,946 (7 years)."),
)
row(
    "referral_program",
    ("TY*", C, "Referrer rewards only — no buyer discount listed", "Tesla's Australian page lists Model Y for referrer benefits and only Model 3 for buyer benefits. A referral must be applied before ordering."),
    ("T3*", C, "Buyer and referrer benefits — amount changes", "Tesla's Australian page lists Model 3 for both. Apply the referral before ordering and check the current offer in the app."),
    ("S7* A2* A3E* A3L*", C, "Program page exists — no reward terms published", "BYD Australia's referral page shows a heading only. Ask the dealer for the reward, eligibility and expiry in writing."),
    ("ZX*", C, "Invite and Earn — points after a referred friend takes delivery", "Announced 6 July 2026 in the Zeekr app. No cash value for the points is published."),
    ("GX* J5* K5* K3*", U, "Not offered", "No national owner-referral reward is published. Dealer offers are separate and change."),
)

# ── Automated driving ────────────────────────────────────────────────────────
row(
    "adas_optional",
    ("TY*", O, "FSD (Supervised) · A$149/month", "Requires an attentive driver. FSD is currently HW4-only and compatible software may arrive after delivery. From Enhanced Autopilot the upgrade is A$75/month."),
    ("T3*", O, "FSD (Supervised) · A$149/month", "Requires an attentive driver and current hardware; rollout can be staged after delivery."),
    ("S7* A2* A3E* A3L* GX* ZX* J5* K3*", U, "Not offered — nothing sold as an extra", "Driver assistance is fixed by grade; there is no paid package or subscription."),
    ("K5*", U, "Not offered — nothing sold as an extra", "Remote parking and the 360° camera come with GT-Line; they are not sold separately."),
)
row(
    "adas_standard",
    ("TY* T3*", S, "Adaptive cruise · lane centring (Autosteer) · AEB", "Sold as Autopilot. Supervised: keep your hands on the wheel and eyes on the road."),
    ("S7*", S, "Adaptive cruise · lane centring · AEB", "Adaptive cruise follows traffic from 0 to 150 km/h. Lane centring is part of Intelligent Cruise Control."),
    ("GX*", S, "Adaptive cruise · lane centring · AEB · blind-spot · rear cross-traffic braking · assisted lane change", "The same list on both grades."),
    ("ZX*", S, "Adaptive cruise · lane centring · AEB · assisted lane change · parking assist · 360° camera", "All supervised. The brochure's 'autonomous parking' is a parking aid."),
    ("J5*", S, "Adaptive cruise · lane centring · AEB · blind-spot · rear cross-traffic braking · 360° camera", "No assisted lane change; Lane Change Assist is a warning only."),
    ("A21", S, "Adaptive cruise · lane centring · AEB · blind-spot · rear cross-traffic", "Dynamic has a reversing camera; Premium adds a 360° camera and front parking sensors."),
    ("A22", S, "Adaptive cruise · lane centring · AEB · blind-spot · rear cross-traffic · 360° camera", "The 360° camera and front parking sensors are Premium-only."),
    ("K5*", S, "Adaptive cruise · lane centring · AEB · Highway Driving Assist 2", "GT-Line adds a 360° camera, blind-spot view and parking collision avoidance."),
    ("K54", S, "Adaptive cruise · lane centring · AEB · Highway Driving Assist 2 · 360° camera", "The 360° camera, blind-spot view and parking collision avoidance are GT-Line-only."),
    ("K3*", S, "Adaptive cruise · lane centring · AEB", "Highway Driving Assist 2 is not on the current Australian brochure."),
    ("A3E1", S, "Adaptive cruise · lane centring · AEB · blind-spot · rear cross-traffic · 360° camera", "Front cross-traffic braking is Premium-only."),
    ("A3E2", S, "Adaptive cruise · lane centring · AEB · blind-spot · front and rear cross-traffic · 360° camera", "Front cross-traffic alert and braking are Premium-only."),
    ("A3L*", S, "Adaptive cruise · lane keeping · AEB · blind-spot · rear cross-traffic · 360° camera", "Lane centring is in the manual 'where equipped' and is not on the current trim list."),
)
row(
    "remote_summon",
    ("TY* T3*", U, "Not yet available — listed as Upcoming in Australia", "Tesla's Australian feature table marks both Summon functions as upcoming, subject to regulatory approval."),
    ("S7* GX* J5* A2* A3E* A3L*", U, "Not offered", "No remote parking or summon function is in the Australian specification."),
    ("ZX*", S, "Remote parking — straight in and out, from an iPhone", "Added by the June 2026 update. It does not drive to you through a car park, and Android support is not confirmed."),
    ("K5*", U, "Not offered — GT-Line only", "Remote Smart Parking Assist 2 is fitted to GT-Line."),
    ("K54", S, "Remote parking — straight in and out, from the key fob", "Remote Smart Parking Assist 2. It does not drive to you through a car park."),
    ("K3*", U, "Not offered", "Remote Smart Parking Assist is in the manual as 'if equipped' and is not on the Australian equipment list."),
)
row(
    "auto_shift",
    ("TY* T3*", C, "Auto Shift (Beta) · off by default", "Chooses Drive or Reverse from Park when switched on in Controls → Dynamics; depends on configuration and software. Check the direction shown before accelerating."),
    ("S7* A2* A3E* A3L*", U, "Not offered — driver selects Drive or Reverse", "Automatic Park when you leave the seat is a separate safety function."),
    ("GX* ZX* J5* K5* K3*", U, "Not offered — driver selects Drive or Reverse", "Selected on the steering-column stalk."),
)
row(
    "traffic_light_chime",
    ("TY* T3*", S, "Green-light chime", "Turn on Traffic Light Chime in Controls → Self-Driving. It is an alert only; check the road before moving."),
    ("S7* GX* ZX* J5* A2* A3E* A3L*", U, "Not offered", "No traffic-light or departure reminder is documented."),
    ("K5* K3*", U, "Not offered — alerts when the car ahead moves off", "Lead Vehicle Departure Alert is standard. It does not read traffic lights."),
)

# ── Range & charging ─────────────────────────────────────────────────────────
row(
    "navigation_route_planner",
    ("TY* T3*", S, "Plans charging stops and predicts arrival charge", "Built-in Trip Planner with live Supercharger availability."),
    ("GX*", S, "Plans routes around charging needs", "Built-in navigation; a June 2025 update improved the predicted charge at chargers and the destination."),
    ("K5* K3*", C, "Suggests chargers when the destination is out of range", "Built-in navigation. Fully automatic multi-stop planning is not confirmed for Australian cars."),
    ("S7* ZX* A3E* A3L*", C, "Built-in navigation — charging-stop planning not confirmed", "No Australian document describes automatic charging stops or arrival-charge prediction."),
    ("A2*", C, "Built-in navigation not listed — use phone projection", "The specification sheet has no satellite-navigation row, though its notes mention map updates."),
    ("J5*", U, "Not offered — no built-in navigation", "Use phone navigation through Apple CarPlay or Android Auto."),
)
row(
    "battery_preconditioning_navigation",
    ("TY* T3*", S, "Automatic on the way to a Supercharger", "Preconditioning for other networks depends on the charger and software."),
    ("ZX*", S, "Automatic on the way to a charger set in the built-in navigation", "A setting in the manual; phone-projection navigation does not trigger it."),
    ("K5* K3*", C, "Automatic on the way to a DC charger, where a battery heater is fitted", "The charger must be the navigation destination. Kia's Australian sheet does not say which grades have the battery heater."),
    ("S7*", U, "Not navigation-triggered · scheduled pre-departure warming above 40% charge", "Battery warming runs with scheduled charging or departure, not on the way to a charger."),
    ("A3E1", C, "Not confirmed — scheduled departure only", "The Dynamic handbook could not be rechecked; do not assume the Premium's manual preheat."),
    ("A3E2", C, "Manual battery preheat before DC charging", "Described in the Premium handbook. A navigation trigger is not confirmed."),
    ("GX* A2* A3L*", U, "Not offered", "No battery preparation for a charging stop is documented."),
    ("J5*", U, "Not offered — no built-in navigation", "No manual battery preheat control is documented either."),
)
row(
    "supercharger_access",
    ("TY* T3*", S, "Whole network — plug in and charge", "Routing, billing and battery preparation are built in."),
    ("S7* GX* J5* A2* K5* K3* A3E* A3L*", C, "Selected sites only — start and pay in the Tesla app", "Check each site in the Tesla app before you rely on it; rates vary by site and a membership lowers them."),
    ("ZX*", C, "Selected sites only — start and pay in the Tesla app", "Tesla sites are 400 V, so expect well below the Zeekr's 420–450 kW headline rate."),
)
row(
    "charge_port_operation",
    ("TY* T3*", S, "Powered flap · closes itself", "Opens from the connector button, the app, the screen or a press when unlocked."),
    ("ZX* J5*", S, "Powered flap", "Automatic opening or closing triggers are not described."),
    ("K5*", S, "Powered flap · closes itself", "Opens from an exterior button, cabin control or voice."),
    ("S7* A2* A3E* A3L* K3*", S, "Manual flap · push to open, close by hand", "The connector locks electronically while charging."),
    ("GX*", C, "Flap type not published", "Geely's Australian material does not say whether the flap is powered. The port is CCS2."),
)
row(
    "v2l",
    ("TY1 TY2 TY3", C, "Five-seat V2L needs build and adapter confirmation", "Tesla's Australian shop lists its V2L adapter for Model Y L only. Confirm V2L on the ordered VIN and build before relying on it."),
    ("TY4", O, "Up to 3.45 kW · adapter A$145", "3.45 kW on a 15 A outlet or 2.3 kW on 10 A. The adapter is sold separately."),
    ("T3*", C, "Needs build and adapter confirmation", "The order page advertises V2L, while Tesla's Australian shop lists its A$145 adapter for Model Y L only. Confirm on the ordered VIN."),
    ("S7*", S, "3.3 kW V2L · at least 15% charge to start", "Adapter included. It powers appliances; it is not home backup."),
    ("GX*", S, "3.3 kW · adapter A$209", "The V2L cable is a Geely accessory. The car can also charge another EV at 6.6 kW."),
    ("ZX*", S, "3.3 kW · adapter not listed as included", "Starts when the V2L plug is connected. Zeekr does not say whether the plug is included."),
    ("J5*", C, "3.3 kW reported · adapter not included", "Jaecoo's sheet lists V2L without an output figure; 3.3 kW is the reported value."),
    ("A2* A3L*", S, "Output not published · adapter included", "Listed on the Australian sheet with a discharge adapter."),
    ("A3E*", S, "3.3 kW · adapter included", "On both grades."),
    ("K51 K52", S, "Interior socket · exterior adapter not included", "The exterior adapter comes with Earth and GT-Line."),
    ("K53 K54", S, "Interior socket · exterior adapter included", "Air has the interior socket only."),
    ("K3*", S, "3.68 kVA · interior socket and exterior adapter included", "Stops at the discharge limit you set."),
)
row(
    "heat_pump",
    ("TY* T3* S7* GX* ZX* A2*", S, "Included", ""),
    ("J5* K5* K3* A3E*", U, "Not fitted", "Not on the Australian equipment list."),
    ("A3L*", C, "In the original brochure — missing from the current sheet", "The MY25/MY26 brochure has no heat-pump row. Ask BYD whether current stock still has it."),
)
row(
    "battery_density",
    ("TY* S7* GX* ZX* J5* A2* T3* A3E* A3L*", U, "Not published", "The maker gives no pack weight or Wh/kg figure for Australia."),
    ("K51", S, "About 150 Wh/kg", "64.2 kWh pack weighing 428 kg, from Kia Australia's sheet (calculation)."),
    ("K52 K53 K54", S, "About 154 Wh/kg", "88.1 kWh pack weighing 573–574 kg, from Kia Australia's sheet (calculation)."),
    ("K31", S, "About 155 Wh/kg", "58.3 kWh pack weighing 375 kg, from Kia Australia's sheet (calculation)."),
    ("K32 K33 K34 K35", S, "About 173 Wh/kg", "81.4 kWh pack weighing 470 kg, from Kia Australia's sheet (calculation)."),
)

# ── Space & safety ───────────────────────────────────────────────────────────
ANCAP = "5 stars ({}) · adult {}% · child {}% · road users {}% · safety assist {}%"
row(
    "safety_ancap",
    ("TY*", S, ANCAP.format(2025, 91, 95, 86, 92), "Covers the five-seat range."),
    ("TY4", S, ANCAP.format(2025, 91, 84, 86, 92), "A separate rating for the six-seater. ANCAP notes child-restraint fitting difficulties in rows two and three."),
    ("S7*", S, ANCAP.format(2025, 87, 93, 76, 78), "All variants built from January 2025."),
    ("GX*", S, ANCAP.format(2025, 86, 87, 83, 85), "All variants."),
    ("ZX*", S, ANCAP.format(2025, 91, 87, 78, 78), "All variants built from August 2025."),
    ("T3*", S, ANCAP.format(2025, 90, 95, 89, 88), "Cars built from September 2023."),
    ("K5*", S, ANCAP.format(2024, 88, 86, 74, 82), "All Australian variants."),
    ("K3*", S, ANCAP.format(2025, 83, 86, 78, 81), "The four front-drive grades."),
    ("K35", C, "5 stars (2025) for the front-drive grades — AWD not yet listed", "ANCAP's EV3 report names the four front-drive grades. Ask Kia whether the rating extends to the AWD version."),
    ("A3L*", S, ANCAP.format(2022, 91, 84, 69, 80), "The original ATTO 3 rating; it expires in December 2028."),
    ("A3E*", C, "5 stars (2022 ATTO 3 rating) — EVO coverage not confirmed", "ANCAP lists the rating for all Australian variants built from May 2022, but its report names only the earlier Standard and Extended Range cars."),
    ("J5* A2*", U, "Not rated by ANCAP", "Not tested. Unrated is not a zero-star result, and a sibling model's rating does not transfer."),
)
row("storage", (ALL, S, "", ""))  # filled from the cargo facts below
row(
    "sentry_parked_recording",
    ("TY* T3*", S, "Records events while parked (Sentry Mode)", "Needs USB storage. Viewing the cameras live needs Premium Connectivity."),
    ("ZX*", S, "Records events while parked (Sentry Mode)", "Saves to built-in memory or USB. Needs enough battery and re-arming after a drive."),
    ("GX*", U, "Not offered — not active on Australian cars", "Overseas cars have a sentry mode. A later update could add it."),
    ("S7* J5* A2* K5* K3* A3E* A3L*", U, "Not offered", "The cameras do not record while the car is parked and locked."),
)
row(
    "dashcam",
    ("TY* T3*", S, "Built-in · records to USB", ""),
    ("A3L*", S, "Built-in · records to a memory card", "Front-facing recorder on both grades."),
    ("S7* A2* A3E*", O, "Dealer-fit dash camera accessory", "No factory recorder is listed for this model."),
    ("GX*", U, "Not offered — not active on Australian cars", "Overseas cars have a factory recorder. A later update could add it."),
    ("ZX*", U, "Not offered — recording is parked-only", "Sentry Mode records when parked; there is no driving recorder."),
    ("J5* K5* K3*", U, "Not offered", "A dealer or aftermarket camera is a separate purchase."),
)

# ── Daily convenience ────────────────────────────────────────────────────────
row(
    "phone_key",
    ("TY* T3*", S, "Bluetooth phone key", "Unlocks and starts the car from your pocket once set up in the Tesla app."),
    ("ZX*", S, "Bluetooth phone key · Apple Wallet key since June 2026", "Needs the Zeekr app and a compatible phone. A fob and an NFC card are also supplied."),
    ("S7*", S, "NFC phone key — tap to unlock", "Tap the phone on the driver's mirror, then place it on the reader to start. A Bluetooth key is not on the Australian list."),
    ("A2* A3E* A3L*", S, "NFC phone key — tap to unlock", "Works with compatible iPhone, Samsung and Pixel phones after setup in the BYD app."),
    ("GX* J5*", U, "Not offered — key fob only", "Unlocking from the app is a remote command, not a driving key."),
    ("K5*", U, "Not offered — key fob only", "Kia Australia confirmed no Digital Key at launch. Kia Connect remote unlock is not a driving key."),
    ("K3*", U, "Not offered — key fob only", "Digital Key 2 is in the manual as 'if equipped' and is not on the Australian equipment list."),
)
row(
    "passive_unlock",
    ("TY* T3*", S, "Phone in pocket — pull the handle", "A key-card tap is not passive entry."),
    ("ZX*", S, "Phone or fob in pocket — unlocks as you approach", "Approach unlock needs the phone key enabled."),
    ("GX*", S, "Fob in pocket — handles present as you approach", "Works with the key fob only."),
    ("J5*", S, "Fob in pocket — unlocks as you approach", "Works with the key fob only."),
    ("S7* A2* A3E* A3L*", S, "Fob in pocket — press the door-handle button", "The phone key needs a tap; it does not unlock from a pocket."),
    ("K5*", S, "Fob in pocket — press the door-handle button", "Approach unlock with self-presenting handles is GT-Line-only."),
    ("K54", S, "Fob in pocket — unlocks as you approach", "The flush handles present automatically on GT-Line."),
    ("K3*", S, "Fob in pocket — touch the door-handle sensor", "Works with the key fob only."),
)
row(
    "walk_away_lock",
    ("TY* T3*", S, "Locks when you walk away", "Needs the setting on. An open door or a key left inside stops it; home can be excluded."),
    ("ZX*", S, "Locks when you walk away", "Needs the setting on, doors closed and a connected phone key or fob."),
    ("J5*", S, "Locks when you walk away", "Listed on the Australian specification; works with the key fob."),
    ("GX*", C, "Locks when you walk away (reported)", "Seen on a 2025 Australian road test, where it was inconsistent. Geely's Australian documents do not describe it."),
    ("S7* A2* A3E* A3L*", U, "Not offered — lock by handle button, fob, card or app", "Doors relock on their own only after an unlock with no door opened."),
    ("K5* K3*", U, "Not offered — lock by handle, fob or app", "Doors relock 30 seconds after an unlock if no door is opened."),
)
row(
    "automatic_start",
    ("TY* T3*", S, "No start button — press the brake and select a gear", ""),
    ("ZX*", S, "No start button — wakes when you open the driver's door", "Press the brake and select a gear to drive."),
    ("J5*", S, "No start button — press the brake and select Drive", "The seatbelt must be fastened for the parking brake to release itself."),
    ("GX*", C, "No start button — press the brake and select Drive (reported)", "Described in a 2025 Australian road test of the earlier car. Both current grades are specified with hands-free start."),
    ("A2* A3E*", C, "Optional setting — wakes when the driver's door opens", "Auto Power On/Off is off by default; otherwise press the brake with a valid key. Check the setting is present on the delivered car."),
    ("S7* A3L*", U, "Not offered — press the brake and the START/STOP button", ""),
    ("K5* K3*", U, "Not offered — press the brake and the start button", ""),
)
row(
    "automatic_shutdown",
    ("TY* T3*", S, "Switches off when you leave", "Camp, Pet and Sentry modes keep systems running by design."),
    ("ZX*", S, "Switches off when you leave and lock", "Parking Comfort can keep power and climate on."),
    ("GX*", C, "Switches off when you walk away (reported)", "Seen on a 2025 Australian road test of the earlier car. Geely's Australian documents do not describe it."),
    ("J5*", C, "Switches off when you leave and lock (reported)", "Described by an Australian tester; not detailed on the specification sheet."),
    ("A2* A3E*", C, "Optional setting — switches off when you select Park and lock", "Locking from the BYD app alone does not switch the car off."),
    ("S7* A3L*", U, "Not offered — press START/STOP to switch off", ""),
    ("K5* K3*", U, "Not offered — select Park and press the start button", ""),
)
row(
    "driver_profiles_local",
    ("TY*", S, "Up to 10 driver profiles", "Each saves seat, steering-wheel and mirror positions plus supported preferences, and can be linked to a key."),
    ("T3*", S, "Driver profiles linked to keys", "Each saves seat, mirror and supported preferences."),
    ("T33", C, "Driver profiles linked to keys — seat memory not listed", "The entry grade has manual steering adjustment, and Tesla does not list seat memory for it."),
    ("S7*", S, "2 seat-and-mirror memory positions", "Position presets only; no navigation, media or climate profile."),
    ("ZX*", S, "3 memory positions per Zeekr account", "Seat and mirror positions; Long Range and Performance also store steering-wheel and head-up display positions."),
    ("GX1 GX3", S, "One Drive Setup preset · no seat memory", "The preset stores drive mode, regeneration and assistance settings. Seat memory is Inspire-only."),
    ("GX2 GX4", S, "One Drive Setup preset · front-seat memory", "The preset stores drive mode, regeneration and assistance settings."),
    ("K5* K3*", S, "2 infotainment profiles plus guest · no seat memory", "Driver's seat memory is GT-Line-only."),
    ("K54 K34 K35", S, "2 infotainment profiles plus guest · 2 seat memory positions", "Driver's seat memory is GT-Line-only."),
    ("J5* A2* A3E* A3L*", U, "Not offered", "No seat memory or driver profiles on the Australian equipment list."),
)
row(
    "cloud_profile_transfer",
    ("TY* T3*", S, "Profiles follow your account to other Teslas", "Needs software 2022.24 or later. Some settings transfer only between similar models."),
    ("K5* K3*", S, "Settings backup can be applied to another Kia", "Through Kia Connect, with compatible software. Not every seat or display setting transfers."),
    ("ZX*", C, "Positions saved to your Zeekr account", "Up to three driving positions per account. Transfer to another car is not documented."),
    ("S7* GX* J5* A2* A3E* A3L*", U, "Not offered", "No account-synced driver profile is documented for Australia."),
)
row(
    "folding_mirrors",
    ("TY* T3*", S, "Power-folding · fold on lock and at saved locations", ""),
    ("S7* ZX*", S, "Power-folding · fold on lock", ""),
    ("GX* J5* A3E* K5* K3*", S, "Power-folding", "Automatic folding on lock is not confirmed."),
    ("A22 A3L2", S, "Power-folding", "Premium-only."),
    ("A21 A3L1", U, "Not fitted", "Power-folding mirrors are Premium-only."),
)
row(
    "garage_integration",
    ("TY*", O, "HomeLink accessory", "Needs a compatible opener. The myQ connected service is US and Canada only."),
    ("T3*", O, "HomeLink accessory · A$575 installed", "Needs a compatible opener. The myQ connected service is not confirmed for Australia."),
    ("S7* GX* ZX* J5* A2* K5* K3* A3E* A3L*", U, "Not offered", ""),
)

# ── Comfort & drive ──────────────────────────────────────────────────────────
row(
    "front_heated_seats",
    ("TY* S7* GX* ZX* J5* T3* K5* A3E*", S, "Included", ""),
    ("A22 A3L2", S, "Included", "Premium-only."),
    ("K33 K34 K35", S, "Included", "Earth and GT-Line only."),
    ("A21 A3L1", U, "Not fitted", "Premium-only."),
    ("K31 K32", U, "Not fitted", "Earth and GT-Line only."),
)
row(
    "front_ventilated_seats",
    ("TY* S7* J5* A3E*", S, "Included", ""),
    ("T31 T32 T34", S, "Included", "Not on the entry Rear-Wheel Drive."),
    ("T33", U, "Not fitted", "Premium and Performance only."),
    ("GX2 GX4", S, "Included", "Inspire-only."),
    ("GX1 GX3", U, "Not fitted", "Inspire-only."),
    ("ZX2 ZX3 ZX4", S, "Included", "Not on the base RWD."),
    ("ZX1", U, "Not fitted", "Long Range and Performance only."),
    ("A22", S, "Included", "Premium-only."),
    ("A21", U, "Not fitted", "Premium-only."),
    ("K54", S, "Included", "GT-Line-only."),
    ("K51 K52 K53", U, "Not fitted", "GT-Line-only."),
    ("K33 K34 K35", S, "Included", "Earth and GT-Line only."),
    ("K31 K32", U, "Not fitted", "Earth and GT-Line only."),
    ("A3L*", U, "Not fitted", ""),
)
row(
    "rear_heated_seats",
    ("TY* ZX*", S, "Included", ""),
    ("TY4", S, "Included", "All six seats are heated."),
    ("T31 T32 T34", S, "Included", "Not on the entry Rear-Wheel Drive."),
    ("T33", U, "Not fitted", "Premium and Performance only."),
    ("S72", S, "Included", "Outer rear seats; Performance-only."),
    ("S71", U, "Not fitted", "Performance-only."),
    ("K54", S, "Included", "GT-Line-only."),
    ("K51 K52 K53", U, "Not fitted", "GT-Line-only."),
    ("GX* J5* A2* K3* A3E* A3L*", U, "Not fitted", ""),
)
row(
    "heated_steering_wheel",
    ("TY* ZX*", S, "Included", ""),
    ("T31 T32 T34", S, "Included", "Not on the entry Rear-Wheel Drive."),
    ("T33", U, "Not fitted", "Premium and Performance only."),
    ("S72", S, "Included", "Performance-only."),
    ("S71", U, "Not fitted", "Performance-only."),
    ("GX1 GX2", S, "Included", "Added with the Extended Range update."),
    ("GX3 GX4", U, "Not fitted", "Added with the later Extended Range cars."),
    ("K54", S, "Included", "GT-Line-only."),
    ("K51 K52 K53", U, "Not fitted", "GT-Line-only."),
    ("K33 K34 K35", S, "Included", "Earth and GT-Line only."),
    ("K31 K32", U, "Not fitted", "Earth and GT-Line only."),
    ("J5* A2* A3E* A3L*", U, "Not fitted", ""),
)
row(
    "automatic_seat_climate",
    ("TY* T3*", S, "Front seats and steering wheel follow the climate setting", "Heats or ventilates automatically when set to Auto."),
    ("T33", C, "Front seat heating only — automatic control not confirmed", "The entry grade has no seat ventilation or heated steering wheel."),
    ("K5*", C, "Driver's seat heating follows the climate setting", "Auto Comfort Control is in the Australian manual as 'if equipped'. The passenger seat is manual."),
    ("K54", C, "Driver's seat heating and ventilation follow the climate setting", "Auto Comfort Control is in the Australian manual as 'if equipped'. The passenger seat is manual."),
    ("K33 K34 K35", C, "Driver's seat heating and ventilation follow the climate setting", "Auto Comfort Control is in the Australian manual as 'if equipped'. The passenger seat is manual."),
    ("K31 K32", U, "Not offered — no heated or ventilated seats", "Seat heating and ventilation start at Earth."),
    ("ZX*", U, "Not offered — only the steering wheel heats automatically", "Seats are set on the screen or in the app."),
    ("S7* GX* J5* A2* A3E* A3L*", U, "Not offered — set on the touchscreen", "No temperature-linked automatic mode is documented."),
    ("A21 A3L1", U, "Not offered — no heated or ventilated seats", "Seat heating is Premium-only."),
)
row(
    "remote_preconditioning",
    ("TY* T3*", S, "From the app, or on a schedule", ""),
    ("K5* K3*", S, "From the app, or on a schedule", "Needs an active Kia Connect account and mobile coverage."),
    ("S7* A2* A3E* A3L*", S, "From the app or key fob", "Needs an activated BYD account and a data connection."),
    ("GX* ZX*", S, "From the app", "Needs the maker's app and vehicle connectivity."),
    ("J5*", C, "From the key fob — app control not confirmed", "The specification lists remote start; owners report climate from the fob within radio range."),
)
row(
    "pet_mode",
    ("TY* T3*", S, "Holds cabin temperature and shows a screen message", "Stops when the battery runs low."),
    ("ZX*", S, "Holds cabin temperature and shows a screen message", "Needs a minimum battery level."),
    ("J5*", C, "Reported — holds climate and shows a message", "Described in an August 2026 review. It is not on Jaecoo's specification sheet, so it depends on installed software."),
    ("S7* A2* A3E* A3L*", U, "Not offered", "Timed air conditioning from the BYD app is the nearest function."),
    ("GX*", U, "Not offered", "Camping Space and app climate are the nearest functions."),
    ("K5* K3*", U, "Not offered", "Utility Mode keeps climate running, without a pet display."),
)
row(
    "camp_utility_mode",
    ("TY* T3*", S, "Camp Mode — keeps climate and power on", "Sentry, the alarm and walk-away locking are off while it runs."),
    ("ZX*", S, "Camp Mode — keeps climate and power on", "A separate Parking Comfort function covers shorter stops."),
    ("K5* K3*", S, "Utility Mode — runs climate, audio and lights from the drive battery", "The car must be in Park."),
    ("GX1 GX3", S, "Camping Space mode", "Run time and minimum charge are not published."),
    ("GX2 GX4", S, "Camping Space and Rest Space modes", "Rest Space is Inspire-only. Run time and minimum charge are not published."),
    ("S7*", C, "Nap and Camping scenes (owner-reported)", "Reported by Australian owners after software V3.1.0. BYD's Australian documents do not describe them."),
    ("J5* A2* A3E* A3L*", U, "Not offered", "No retained-climate mode is documented. V2L is separate."),
)
row(
    "cabin_overheat_protection",
    ("TY* T3*", S, "Included", "Limits cabin temperature for a set time after parking, battery permitting."),
    ("S7* GX* J5* A2* K5* K3* A3E* A3L*", U, "Not offered", "Remote climate from the app is manual."),
    ("ZX*", U, "Not offered", "Pet Mode or app climate are the alternatives."),
)
WHEELS = {v["variant_id"]: v for v in base["trim_equipment"]}


def ride(code):
    t = WHEELS[BY_CODE[code]]
    if t["wheel_in"] is None:
        return "19-inch wheels · passive dampers"
    dampers = (
        "adaptive dampers and air suspension"
        if t["air_suspension"]
        else "adaptive dampers"
        if t["adaptive_damping"]
        else "passive dampers"
    )
    return f"{t['wheel_in']}-inch wheels · {dampers}"


row("ride_control_subjective", *[(c, J, ride(c), "") for c in BY_CODE])
row(
    "interior_fit_finish_subjective",
    ("TY* K5* K3*", J, "No independent assessment recorded", ""),
    ("S7*", J, "Leather upholstery · a reviewer praised the soft materials", ""),
    ("GX*", J, "A reviewer rated assembly well and noted hard dashboard plastic", ""),
    ("ZX1 ZX2", J, "Synthetic leather trim", "Nappa leather is Performance-only."),
    ("ZX3 ZX4", J, "Nappa leather trim", ""),
    ("J5*", J, "Reviewers liked the soft-touch trim and criticised glossy controls", ""),
    ("A2* A3L*", J, "Synthetic leather seats", ""),
    ("T3*", J, "Soft-touch trim and acoustic glass", ""),
    ("T33", J, "Textile-insert seats", "Premium grades have full synthetic leather."),
    ("A3E*", J, "Synthetic leather · 15.6-inch touchscreen", ""),
)
row(
    "style_refinement",
    ("TY*", J, "Mid-size SUV · refreshed 2025 design", ""),
    ("TY4", J, "Longer six-seat SUV · refreshed 2025 design", ""),
    ("S7*", J, "Mid-size SUV with a sloping roofline", ""),
    ("GX1 GX3", J, "Mid-size SUV with flush door handles", ""),
    ("GX2 GX4", J, "Mid-size SUV with flush door handles · opening roof", "Inspire adds ambient lighting and the opening roof."),
    ("ZX*", J, "Mid-size SUV with frameless doors", ""),
    ("ZX3 ZX4", J, "Mid-size SUV with frameless, powered doors", "Powered doors and rear side shades are Performance-only."),
    ("J5*", J, "Boxy compact SUV", ""),
    ("A2*", J, "Upright compact SUV", ""),
    ("T3*", J, "Sedan · MY27 detail changes", ""),
    ("K5*", J, "Upright mid-size SUV", ""),
    ("K3*", J, "Compact SUV", ""),
    ("A3E*", J, "Compact SUV · revised lights and a calmer cabin", ""),
    ("A3L*", J, "Compact SUV · original gym-inspired cabin", ""),
)
row(
    "performance_rear_motor",
    ("TY1 TY4", S, "Dual motor, all-wheel drive · output not published", ""),
    ("TY2 T31 T32 T33", S, "Single rear motor · output not published", ""),
    ("TY3 T34", S, "Performance dual motor, all-wheel drive · output not published", ""),
    ("S71", S, "Single rear motor · 230 kW / 380 Nm", ""),
    ("S72", S, "Dual motor, all-wheel drive · 390 kW combined", "230 kW rear and 160 kW front."),
    ("ZX1 ZX2", S, "Single rear motor · 310 kW / 440 Nm", ""),
    ("ZX3 ZX4", S, "Dual motor, all-wheel drive · 475 kW / 710 Nm combined", ""),
    ("K51 K52", S, "Single front motor · 160 kW / 310 Nm", ""),
    ("K53 K54", S, "Dual motor, all-wheel drive · 230 kW / 480 Nm combined", "160 kW front and 70 kW rear."),
    ("K31 K32 K33 K34 GX* J5* A2* A3L*", S, "Single front motor", ""),
    ("K35", C, "Dual motor, all-wheel drive · 195 kW / 385 Nm combined", "Reported Australian launch figures."),
    ("A3E1", S, "Single front motor · 150 kW / 310 Nm", ""),
    ("A3E2", S, "Single rear motor · 230 kW / 380 Nm", ""),
)
row(
    "paint_options_quality",
    ("TY* T3*", S, "Several colours · surcharge depends on the colour", ""),
    ("S7*", S, "Aurora White standard · 3 optional colours", "Atlantis Grey, Cosmos Black and Shark Grey."),
    ("GX*", S, "Arctic White standard · 5 optional colours, A$600 reported", "Shadow Black, Volcanic Grey, Moonlit Silver, Aquatic Green and Jungle Green."),
    ("ZX*", S, "Onyx Black standard · 3 optional colours", "Crystal White, Tech Grey and Forest Green. Brook Blue with a silver roof is offered on Long Range and Performance."),
    ("J5*", S, "Stone Grey standard · 3 optional colours, A$600 at launch", "Arctic White, Carbon Black and Stormy Blue."),
    ("A2*", S, "Ski White standard · 3 optional colours", "Mist Grey, Harbour Grey and Cosmos Black."),
    ("K5*", S, "4 standard colours · premium and two-tone paint extra", "Clear White, Magma Red, Tide Blue and Starry Night Black. Kia's sheet does not print the surcharge."),
    ("K3*", S, "Clear White standard · 6 optional colours, A$550 reported", "Snow White Pearl, Ivory Silver, Aurora Black Pearl, Shale Gray, Frost Blue and Matcha Green."),
    ("A3E1 A3L1", S, "Ski White standard · 2 optional colours", "Harbour Grey and Cosmos Black."),
    ("A3E2 A3L2", S, "Ski White standard · 3 optional colours", "Harbour Grey, Cosmos Black and Atlantis Grey."),
)

# ── Software & tech ──────────────────────────────────────────────────────────
row(
    "ota_capability_scope",
    ("TY* T3*", S, "Whole car — interface, controls, media and driver assistance", "Staged rollouts; features vary by hardware and market."),
    ("ZX*", S, "Whole car — digital key, remote parking, CarPlay and sounds so far", "One substantial Australian release is documented, in June 2026."),
    ("K5* K3*", S, "Infotainment, navigation and selected vehicle controls", "Depends on model year and a Kia Connect connection."),
    ("GX*", S, "Infotainment and interface, released in phases", "Delivered so far: phone projection, navigation estimates, alert tones and Drive Setup."),
    ("S7* A2* A3E* A3L*", S, "Infotainment — wider scope depends on the release", "Install from System → Version, parked with a stable connection."),
    ("J5*", C, "Dealer-installed so far — over-the-air promised", "Jaecoo publishes no release notes. Reviewers were told a braking fix would arrive over the air."),
)
row(
    "carplay_android_auto",
    ("TY* T3*", U, "Not offered", "Tesla's own apps and Bluetooth only."),
    ("S7* A2* A3E* A3L*", S, "Wireless Apple CarPlay and Android Auto", ""),
    ("GX* J5* K5* K3*", S, "Wired and wireless Apple CarPlay and Android Auto", ""),
    ("GX3 GX4", S, "Wired and wireless Apple CarPlay and Android Auto", "Added to earlier cars by updates in August 2025 and February 2026."),
    ("ZX*", S, "Apple CarPlay and Android Auto", "Zeekr does not say whether the connection is wired or wireless."),
)
row(
    "app_connectivity",
    ("TY* T3*", S, "Tesla app — key, climate, charging, location and service", "Some functions need Premium Connectivity."),
    ("S7* A3E* A3L*", S, "BYD app — status, locks and climate", "Needs a dealer-activated account and a data connection."),
    ("A2*", S, "BYD app — status, locks and climate", "The complimentary data plan is marked unavailable on the ATTO 2 sheet; confirm the connectivity terms."),
    ("GX*", S, "Geely app — climate, locks, location and charge schedule · 2 years of data included", "2 GB a month. Geely has not published the fee after the trial."),
    ("ZX*", S, "Zeekr app — locks, windows, climate, location and send-to-car navigation", ""),
    ("K5* K3*", S, "Kia Connect — locks, climate, status and send-to-car navigation · 7 years included", "The seven years run from the warranty start and do not restart on resale."),
    ("J5*", C, "Jaecoo app reported — climate, charge status and scheduling", "Several owners report cars with no app connection, and the specification sheet lists no connected service."),
)
row(
    "voice_assistant",
    ("TY* T3*", S, "Voice commands · Grok assistant (Beta)", "Grok needs AMD infotainment, software 2026.2.6 or later and Premium Connectivity or Wi-Fi."),
    ("S7* A2* A3E* A3L*", S, "Voice commands for navigation, calls, media and climate", "Wake with 'Hi, BYD'."),
    ("K5* K3*", S, "Voice commands for navigation, calls, media and climate", "No generative assistant is confirmed for Australian cars."),
    ("GX*", S, "Voice commands · over 200 claimed", "Online queries need connectivity."),
    ("ZX*", S, "Voice commands from all four seats", ""),
    ("J5*", S, "Voice commands — 'Hello Jaecoo'", "The supported command list is not published."),
)
row(
    "media_resume",
    ("TY* T3*", S, "Resumes the last source", "Streaming needs Wi-Fi or Premium Connectivity."),
    ("K5* K3*", S, "Your choice — resume media or start muted", "Two settings: Media Off at Vehicle Startup and Maintain Media when the vehicle is turned off."),
    ("A3L*", S, "Returns to the last source, radio as fallback", ""),
    ("S7* GX* ZX* J5* A2* A3E*", C, "Not documented — follows your phone", "Bluetooth and phone-projection playback is resumed by the phone."),
)
row(
    "phone_contacts",
    ("TY* T3* S7* ZX* A2* K5* K3* A3E* A3L*", S, "Bluetooth contacts and calls", "Needs phone pairing and permission to share contacts."),
    ("GX* J5*", C, "Bluetooth calls — contact sync not confirmed", "Contacts are available through Apple CarPlay or Android Auto."),
)
row(
    "alert_sound_quality",
    ("TY* T3* S7* A2* A3E* A3L*", J, "No sound options documented", ""),
    ("GX*", J, "Three selectable low-speed alert tones", "Added in February 2026; a June 2025 update made the pedestrian alert less intrusive."),
    ("ZX*", J, "Alert tones revised by the June 2026 update", "Zeekr's stated aim was to make them less intrusive."),
    ("J5*", J, "One tester found few intrusive chimes", "Many disabled alerts stayed off between drives in an April 2026 test."),
    ("K5* K3*", J, "Adjustable alert volume and haptics", ""),
)

# ── Specification cells ──────────────────────────────────────────────────────
facts = []


def fact(selector, key, **patch):
    for code in expand(selector):
        facts.append({"variant_id": BY_CODE[code], "key": key, **patch})


fact("TY* T3*", "warranty", value="5 years / unlimited km")
fact("ZX*", "warranty", value="5 years / unlimited km")
fact("S7* A2* A3E* A3L*", "warranty", value="6 years / 150,000 km")
fact("GX*", "warranty", value="7 years / unlimited km")
fact("K5* K3*", "warranty", value="7 years / unlimited km")
fact("J5*", "warranty", value="8 years / unlimited km")
fact("TY1 TY3 TY4 T31 T34", "battery_warranty", value="8 years / 192,000 km")
fact("TY2 T32 T33", "battery_warranty", value="8 years / 160,000 km")
fact("S7* A2* A3E* A3L* ZX* K3*", "battery_warranty", value="8 years / 160,000 km")
fact("GX* J5*", "battery_warranty", value="8 years / unlimited km")
fact("K5*", "battery_warranty", value="7 years / 150,000 km", qualifications=["MY2026 terms; later model years differ."])
fact("K3*", "battery_warranty", qualifications=["MY2027 terms; earlier cars have 7 years / 150,000 km."])
fact("GX* J5* K5* K3*", "warranty", qualifications=["Commercial use is capped at 150,000 km."])

EVDB = "10–80%, EV Database estimate; Tesla publishes range added in 15 minutes instead"
fact("TY2", "dc_charge_time_min", value=24, unit="min", basis=EVDB, status=C, sourceIds=["r7_evdb_model_y_rwd"], date=DATE)
fact("TY1", "dc_charge_time_min", value=27, unit="min", basis=EVDB, status=C, sourceIds=["r7_evdb_model_y_lr_awd"], date=DATE)
fact("T33", "dc_charge_time_min", value=24, unit="min", basis=EVDB, status=C, sourceIds=["r7_evdb_model_3_rwd"], date=DATE)
fact("TY3 TY4 T31 T32 T34", "dc_charge_time_min", value="24–28 min", unit="", basis="10–80%, EV Database range for comparable European versions; Tesla publishes range added in 15 minutes instead", status=C)
fact("T33", "battery_kwh", value=60, unit="kWh", basis="Usable capacity, EV Database estimate; Tesla publishes no battery capacity for Australia", status=C, sourceIds=["r7_evdb_model_3_rwd"], date=DATE)
fact("T33", "dc_peak_kw", value=175, unit="kW", basis="EV Database figure; Tesla Australia lists no peak for this grade", status=C, sourceIds=["r7_evdb_model_3_rwd"], date=DATE)
fact("T3*", "max_total_cargo_l", value=977, unit="L", basis="EV Database figure, seats folded; Tesla publishes no folded volume", status=C, sourceIds=["r7_evdb_model_3_rwd"], date=DATE)
fact("TY1 TY2 TY3 T31 T32 T33", "towing_braked_kg", qualifications=["Needs the optional A$1,970 tow package."])
fact("TY4", "seats", qualifications=["2+2+2 layout."])
fact("GX3 GX4", "battery_kwh", qualifications=["Earlier 60.22 kWh cars; current stock has 68.39 kWh."])

# One label per measurement basis, so equal bases read the same on every card.
BASIS = {
    "Manufacturer claim; supplied Australian variant record": "Manufacturer figure",
    "Manufacturer claim; timing protocol not fully established": "Manufacturer claim",
    "Manufacturer claim; rollout subtracted": "Manufacturer claim, one-foot rollout subtracted",
    "Occupied seating positions": "Seating positions",
    "Manufacturer-stated energy; gross/usable basis not labelled": "Manufacturer figure; gross or usable not stated",
    "Manufacturer-stated capacity; gross/net distinction not specified in cited AU brochure": "Manufacturer figure; gross or usable not stated",
    "Manufacturer capacity; usable versus gross not specified in AU brochure": "Manufacturer figure; gross or usable not stated",
    "Manufacturer-stated nominal/nameplate pack capacity; usable/net energy not established by primary Australian source": "Manufacturer figure; gross or usable not stated",
    "Capacity stated by manufacturer; gross versus usable not specified": "Manufacturer figure; gross or usable not stated",
    "Advertised base vehicle price; excludes A$1,400 delivery, A$400 order fee and state on-road costs": "Base price before A$1,400 delivery, A$400 order fee and on-road costs",
    "Australian base vehicle list price before on-road costs; no postcode-dependent drive-away quote": "List price before on-road costs",
    "AUD list price before on-road costs, standard paint; not drive-away": "List price before on-road costs, standard paint",
    "AUD manufacturer list price before on-road costs, as reported; not a current dealer drive-away quote": "List price before on-road costs, as reported",
    "Reported Australian list price before on-road costs, CarExpert 2026-07-09; current manufacturer quote not independently exposed.": "List price before on-road costs, reported by CarExpert",
    "Reported Australian list price before on-road costs, CarExpert 2026-08-21; current manufacturer quote not independently exposed.": "List price before on-road costs, reported by CarExpert",
    "Manufacturer recommended retail price, excluding registration, CTP, stamp duty and dealer delivery; quoted in current OEM novated-lease terms": "Recommended retail price before on-road costs and dealer delivery",
    "WLTP claim/target in AU brochure; verify exact wheels": "WLTP",
    "10-80% on a 350 kW supply; 350 kW is charger rating, not vehicle peak": "10–80% on a 350 kW charger",
    "10-80% on a 350 kW supply for the shared 81.4 kWh pack; not an AWD-specific Kia Australia figure": "10–80% on a 350 kW charger; figure for the shared 81.4 kWh pack",
    "10–80% SOC": "10–80%",
    "body excluding mirrors": "Body width, mirrors excluded",
    "Body width, diagram excludes mirrors": "Body width, mirrors excluded",
    "Body width; brochure does not specify mirrors; AEVA describes edge of doors, excluding mirrors": "Body width, mirrors excluded",
    "Manufacturer overall width; mirror basis not explicit in brochure": "Overall width; mirrors not stated",
    "Manufacturer overall width; mirror inclusion not explicitly stated": "Overall width; mirrors not stated",
    "Manufacturer width; mirror basis not explicitly stated": "Overall width; mirrors not stated",
    "Manufacturer minimum luggage volume; measurement protocol unspecified": "Manufacturer figure, seats up; method not stated",
    "Manufacturer rear cargo volumes; seats-up/folded respectively. Manufacturer page does not state the common testing method or whether every ancillary cavity is included. Do not compare directly to Tesla total cargo without normalising.": "Manufacturer figure, seats up; method not stated",
    "Manufacturer: second row up; 410 L expanded and 1,877 L second row down reported separately; test method not stated": "Manufacturer figure, seats up; 410 L with the floor lowered",
    "Tesla manufacturer rear cargo volume, not declared VDA": "Tesla figure, seats up; not VDA",
    "Tesla manufacturer cargo behind second row, not declared VDA": "Tesla figure behind the second row; not VDA",
    "Tesla rear volume behind third row with all six seats in use; not declared VDA": "Tesla figure behind the third row, six seats in use; not VDA",
    "VDA rear seats up": "VDA, seats up",
    "VDA to cargo cover, rear seats in use": "VDA to the cargo cover, seats up",
    "VDA, rear seats down": "VDA, seats folded",
    "AU owner manual, excluding number-plate bracket; prior retail snapshot4792mm retained in source history": "Australian owner's manual, number-plate bracket excluded",
}

sources = [
    {"id": "r7_evdb_model_y_rwd", "url": "https://ev-database.org/car/3362/Tesla-Model-Y-RWD", "title": "Tesla Model Y RWD (Juniper)", "publisher": "EV Database", "source_type": "independent_database", "published_date": None, "accessed_date": DATE, "market": "EU", "supports": "60 kWh usable; 175 kW DC peak; 10-80% in 24 minutes. European record, independent estimate."},
    {"id": "r7_evdb_model_y_lr_awd", "url": "https://ev-database.org/car/3104/Tesla-Model-Y-Long-Range-AWD", "title": "Tesla Model Y Long Range AWD (Juniper)", "publisher": "EV Database", "source_type": "independent_database", "published_date": None, "accessed_date": DATE, "market": "EU", "supports": "10-80% in 27 minutes. European record, independent estimate; read from a search summary of the page."},
    {"id": "r7_evdb_model_3_rwd", "url": "https://ev-database.org/car/3740/Tesla-Model-3-RWD", "title": "Tesla Model 3 RWD (Highland)", "publisher": "EV Database", "source_type": "independent_database", "published_date": None, "accessed_date": DATE, "market": "EU", "supports": "572 km WLTP; 60 kWh usable; 175 kW DC peak; 10-80% in 24 minutes; 594 L boot, 977 L seats folded, 88 L front. European record, independent estimate."},
    {"id": "r7_ancap_zeekr_7x", "url": "https://www.ancap.com.au/safety-ratings/zeekr/7x/6ec0ef", "title": "Zeekr 7X ANCAP safety rating", "publisher": "ANCAP", "source_type": "independent_safety_assessment", "published_date": None, "accessed_date": DATE, "market": "AU", "supports": "Five stars, 2025: adult 91%, child 87%, vulnerable road users 78%, safety assist 78%. All variants built from August 2025; valid to December 2031."},
]
EXTRA_SOURCES = {("safety_ancap", "ZX"): ["r7_ancap_zeekr_7x"]}

# The storage summary restates the three cargo cells, using the values after every overlay.
completion = json.load(open("data/research-completion-2026-10-07.json"))
refinement = json.load(open("data/research-refinement-2026-10-06.json"))
cargo = {v["id"]: {k: v.get(k) for k in ("boot_l", "frunk_l", "max_total_cargo_l")} for v in base["variants"]}
for layer in (refinement["facts"], completion["facts"], facts):
    for p in layer:
        if p["key"] in ("boot_l", "frunk_l", "max_total_cargo_l") and "value" in p:
            cargo[p["variant_id"]][p["key"]] = p["value"]


def litres(n):
    return f"{n:,} L" if isinstance(n, (int, float)) else None


def storage(code):
    c = cargo[BY_CODE[code]]
    boot = "behind the third row" if code == "TY4" else "boot"
    parts = [f"{litres(c['boot_l'])} {boot}"]
    parts.append(f"{litres(c['frunk_l'])} front" if c["frunk_l"] else "no front storage")
    if litres(c["max_total_cargo_l"]):
        parts.append(f"{litres(c['max_total_cargo_l'])} seats folded")
    return " · ".join(parts)


features = []
for criterion, cells in rows.items():
    for code, (status, value, note, selector) in cells.items():
        if criterion == "storage":
            value = storage(code)
        if code == PROVISIONAL and PROVISIONAL not in selector.split():
            note = f"{note} {PROVISIONAL_NOTE}".strip()
        entry = {
            "variant_id": BY_CODE[code],
            "criterion": criterion,
            "status": status,
            "value": value,
            "conditions": note,
            "condition_label": "",
            "usability_notes": [],
        }
        family = code.rstrip("0123456789")
        if (criterion, family) in EXTRA_SOURCES:
            entry["add_source_ids"] = EXTRA_SOURCES[(criterion, family)]
        features.append(entry)

# ── Software update history ──────────────────────────────────────────────────
eligibility = []


def scope(selector, text):
    for code in expand(selector):
        eligibility.append({"variant_id": BY_CODE[code], "scope": text})


scope("TY*", "At least 15 software releases reached the Model Y in Australia in this period, about 10 of them since the 2025 refresh. A car bought today has received only the ones issued after it was built.")
scope("TY4", "Model Y L went on sale in March 2026. Which Model Y releases it has received is not documented. June 2026 reports describe a hold on FSD v14 for this version.")
scope("T3*", "At least 15 software releases reached the Model 3 in Australia in this period. A car bought today has received only the ones issued after it was built.")
scope("S7*", "Australian owners report two releases, V3.0.0 and V3.1.0. BYD publishes no release list, so this is a minimum.")
scope("GX1 GX2", "Geely Australia has published three releases, all before the 68.39 kWh Extended Range cars arrived. None is documented yet for the current cars.")
scope("GX3 GX4", "Geely Australia has published three releases for these earlier 60.22 kWh cars.")
scope("ZX*", "Zeekr Australia has announced one substantial release, in June 2026.")
scope("J5*", "One dealer-installed update, v3.06, is documented. No over-the-air release has been confirmed; the total is unknown, not zero.")
scope("A2* A3E*", "No Australian over-the-air release has been confirmed for this model. The total is unknown, not zero.")
scope("A3L*", "Owners report at least two releases, V1.10 and V1.11, for the outgoing ATTO 3. They do not apply to the EVO.")
scope("K5*", "Kia Australia lists three update notices: one names MY26 cars and two concern MY25.")
scope("K3*", "Kia Australia's notice index lists six updates. Two older records, from 13 July and 2 September, could not be rechecked. Notices for a sunroof apply only to cars that have one.")

# Same order as configuration_history in the research file.
configuration = [
    {"change": "Premium Long Range AWD acceleration, October 2026 order page", "old": "4.8 s", "new": "4.3 s"},
    {"change": "Model Y L acceleration, launch to October order page", "old": "5.0 s at launch", "new": "4.5 s reported"},
    {"change": "Performance price and range, October", "old": "A$89,400 reported", "new": "A$84,900 · 580 km"},
    {"change": "Entry Rear-Wheel Drive added below Premium RWD", "old": "Premium RWD only: A$54,900 · 520 km", "new": "Rear-Wheel Drive: A$45,900 · 572 km"},
    {"change": "Extended Range battery", "old": "60.22 kWh", "new": "68.39 kWh"},
    {"change": "ATTO 3 replaced by ATTO 3 EVO", "old": "Essential and Premium FWD · 49.92 / 60.48 kWh", "new": "Dynamic FWD 60.48 kWh · Premium RWD 74.88 kWh"},
    {"change": "Black Special Edition", "old": "Performance AWD", "new": "Performance AWD base with 20-inch wheels (reported)"},
    {"change": "GT-Line AWD announced", "old": "Four front-drive grades", "new": "AWD version added (reported, provisional)"},
]
assert len(configuration) == len(base["configuration_history"])

expected = len(base["variants"]) * len(base["criteria"])
assert len(features) == expected, (len(features), expected)
assert set(rows) == {c["key"] for c in base["criteria"]}
json.dump(
    {
        "date": DATE,
        "sources": sources,
        "basis": BASIS,
        "features": features,
        "facts": facts,
        "eligibility": eligibility,
        "configuration": configuration,
    },
    open("data/research-editorial-2026-10-07.json", "w"),
    indent=1,
    ensure_ascii=False,
)
print(f"{len(features)} feature cells, {len(facts)} fact patches, {len(BASIS)} basis labels")
