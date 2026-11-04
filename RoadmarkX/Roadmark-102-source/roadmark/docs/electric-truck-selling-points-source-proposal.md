# Electric truck buyer-strength and trade-off proposal

Checked 10 October 2026. Source-bound editorial draft; application integration and runtime guards are pending. No application files were edited.

Exactly 24 records / 48 clauses / 199 source dependencies. All original-source hashes, JSON pointers and arithmetic were verified.

## Scope and counting

- 14 exact Fuso chassis codes; their optional downratings stay inside each record
- One Hyundai 7,300 kg bare cab chassis; disputed lower rating and completed-body options excluded
- Three F3E body versions, four H9E brochure columns, and two current-linked T5 GVM configurations
- Six historical JAC records and three Foton family/future holds excluded
- Current-linked specification is not exact-epoch stock, a formal model year or a delivery promise

## Editorial pairs

### 1. Fuso eCanter e515 City Cab 2500 mm
Source record: `fuso-ecanter-feavkbrcsfad`

- Strength — 9.8 m turning diameter: With a 2,500 mm wheelbase, this cab chassis lists a 9.8 m kerb-to-kerb turning diameter and 4,716 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,920 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.

Claim dependencies and precise source locators:
- `fuso-ecanter-feavkbrcsfad.wheelbase` = 2500 mm; verified; Exact model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkbrcsfad.turningCircle` = 9.8 m; verified; Kerb-to-kerb diameter
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Performance / Turning Circle A; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkbrcsfad.lengthCabChassis` = 4716 mm; verified; source declaration
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Dimensions / A - Length Overall, A; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkbrcsfad.gvm` = 4495 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkbrcsfad.chassisMassEstimated` = 2575 kg; verified; Estimated cab-chassis total; PDF column A
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkbrcsfad.bodyAndPayloadAllowanceCalculated` = 1920 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- Checked calculation: fuso-ecanter-feavkbrcsfad.gvm (4495) − fuso-ecanter-feavkbrcsfad.chassisMassEstimated (2575) = 1920 kg

### 2. Fuso eCanter e515 City Cab 2800 mm
Source record: `fuso-ecanter-feavkcrcsfad`

- Strength — 10.8 m turning diameter: With a 2,800 mm wheelbase, this cab chassis lists a 10.8 m kerb-to-kerb turning diameter and 5,044 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,910 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.

Claim dependencies and precise source locators:
- `fuso-ecanter-feavkcrcsfad.wheelbase` = 2800 mm; verified; Exact model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkcrcsfad.turningCircle` = 10.8 m; verified; Kerb-to-kerb diameter
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Performance / Turning Circle B; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkcrcsfad.lengthCabChassis` = 5044 mm; verified; source declaration
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Dimensions / A - Length Overall, B; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkcrcsfad.gvm` = 4495 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkcrcsfad.chassisMassEstimated` = 2585 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkcrcsfad.bodyAndPayloadAllowanceCalculated` = 1910 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- Checked calculation: fuso-ecanter-feavkcrcsfad.gvm (4495) − fuso-ecanter-feavkcrcsfad.chassisMassEstimated (2585) = 1910 kg

### 3. Fuso eCanter e515 City Cab 3400 mm
Source record: `fuso-ecanter-feavkercsfad`

- Strength — 12.8 m turning diameter: With a 3,400 mm wheelbase, this cab chassis lists a 12.8 m kerb-to-kerb turning diameter and 5,790 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,885 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.

Claim dependencies and precise source locators:
- `fuso-ecanter-feavkercsfad.wheelbase` = 3400 mm; verified; Exact model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkercsfad.turningCircle` = 12.8 m; verified; Kerb-to-kerb diameter
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Performance / Turning Circle C; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkercsfad.lengthCabChassis` = 5790 mm; verified; source declaration
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Dimensions / A - Length Overall, C; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkercsfad.gvm` = 4495 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkercsfad.chassisMassEstimated` = 2610 kg; verified; Estimated cab-chassis total; PDF column C
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso-ecanter-feavkercsfad.bodyAndPayloadAllowanceCalculated` = 1885 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [fuso_e515_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- Checked calculation: fuso-ecanter-feavkercsfad.gvm (4495) − fuso-ecanter-feavkercsfad.chassisMassEstimated (2610) = 1885 kg

### 4. Fuso eCanter e515 Wide Cab 3400 mm
Source record: `fuso-ecanter-febvkercsfad`

- Strength — 12 m turning diameter: With a 3,400 mm wheelbase, this cab chassis lists a 12 m kerb-to-kerb turning diameter and 5,940 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,750 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.

Claim dependencies and precise source locators:
- `fuso-ecanter-febvkercsfad.wheelbase` = 3400 mm; verified; Exact model row
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso-ecanter-febvkercsfad.turningCircle` = 12 m; verified; Kerb-to-kerb diameter
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p3; Performance / Turning Circle ; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso-ecanter-febvkercsfad.lengthCabChassis` = 5940 mm; verified; source declaration
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p3; Dimensions / A - Length Overall, ; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso-ecanter-febvkercsfad.gvm` = 4495 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso-ecanter-febvkercsfad.chassisMassEstimated` = 2745 kg; verified; Estimated cab-chassis total; PDF column single
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p3; Mass estimated* / Total ; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso-ecanter-febvkercsfad.bodyAndPayloadAllowanceCalculated` = 1750 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
  - [fuso_e515_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — PDF p3; Mass estimated* / Total ; SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- Checked calculation: fuso-ecanter-febvkercsfad.gvm (4495) − fuso-ecanter-febvkercsfad.chassisMassEstimated (2745) = 1750 kg

### 5. Fuso eCanter e615 City Cab 3400 mm
Source record: `fuso-ecanter-feavkerdsfab`

- Strength — 22 kW AC and 104 kW DC: Up to 22 kW AC and 104 kW DC provide two charging options for fleets planning depot and on-route stops.
- Trade-off — Downrating reduces load allowance: Choosing the optional 4,495 kg GVM leaves an estimated 1,425 kg for body, people and load; check the completed truck before choosing that rating.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The lower GVM is an optional rating of this chassis code, not another factory trim. Published theoretical charging times have no stated SOC window.

Claim dependencies and precise source locators:
- `fuso-ecanter-feavkerdsfab.acChargePowerMax` = 22 kW; verified; Manufacturer vehicle charging capability, up to
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p2; High Voltage Battery / AC Charging; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso-ecanter-feavkerdsfab.dcChargePowerMax` = 104 kW; verified; Manufacturer vehicle charging capability, up to
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p2; High Voltage Battery / DC Charging; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso-ecanter-feavkerdsfab.gvm` = 6000 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso-ecanter-feavkerdsfab.bodyAndPayloadAllowanceCalculated` = 2930 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p3; Mass estimated* / Total ; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso-ecanter-feavkerdsfab.optionalGvm` = 4495 kg; verified; Only explicitly offered downrating; no inferred combinations
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso-ecanter-feavkerdsfab.chassisMassEstimated` = 3070 kg; verified; Estimated cab-chassis total; PDF column single
  - [fuso_e615_city_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — PDF p3; Mass estimated* / Total ; SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- Checked calculation: fuso-ecanter-feavkerdsfab.gvm (6000) − fuso-ecanter-feavkerdsfab.chassisMassEstimated (3070) = 2930 kg
- Checked calculation: fuso-ecanter-feavkerdsfab.optionalGvm (4495) − fuso-ecanter-feavkerdsfab.chassisMassEstimated (3070) = 1425 kg

### 6. Fuso eCanter e615 Wide Cab 3400 mm
Source record: `fuso-ecanter-febvkerdsfab`

- Strength — 22 kW AC and 104 kW DC: Up to 22 kW AC and 104 kW DC provide two charging options for fleets planning depot and on-route stops.
- Trade-off — Downrating reduces load allowance: Choosing the optional 4,495 kg GVM leaves an estimated 1,300 kg for body, people and load; check the completed truck before choosing that rating.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The lower GVM is an optional rating of this chassis code, not another factory trim. Published theoretical charging times have no stated SOC window.

Claim dependencies and precise source locators:
- `fuso-ecanter-febvkerdsfab.acChargePowerMax` = 22 kW; verified; Manufacturer vehicle charging capability, up to
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; High Voltage Battery / AC Charging; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkerdsfab.dcChargePowerMax` = 104 kW; verified; Manufacturer vehicle charging capability, up to
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; High Voltage Battery / DC Charging; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkerdsfab.gvm` = 6000 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkerdsfab.bodyAndPayloadAllowanceCalculated` = 2805 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkerdsfab.optionalGvm` = 4495 kg; verified; Only explicitly offered downrating; no inferred combinations
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkerdsfab.chassisMassEstimated` = 3195 kg; verified; Estimated cab-chassis total; PDF column A
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- Checked calculation: fuso-ecanter-febvkerdsfab.gvm (6000) − fuso-ecanter-febvkerdsfab.chassisMassEstimated (3195) = 2805 kg
- Checked calculation: fuso-ecanter-febvkerdsfab.optionalGvm (4495) − fuso-ecanter-febvkerdsfab.chassisMassEstimated (3195) = 1300 kg

### 7. Fuso eCanter e615 Wide Cab 3850 mm
Source record: `fuso-ecanter-febvkgrdsfab`

- Strength — 2,795 kg before body and load: At the standard 6,000 kg GVM, the 3,850 mm-wheelbase chassis leaves an estimated 2,795 kg for the chosen body, people and load.
- Trade-off — 89 km/h electronic limit: This long-wheelbase e615 Wide Cab is electronically limited to 89 km/h, a constraint to check against faster-road duties.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The optional 4,495 kg downrating reduces the same chassis allowance; it does not create a separate factory trim.

Claim dependencies and precise source locators:
- `fuso-ecanter-febvkgrdsfab.gvm` = 6000 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkgrdsfab.wheelbase` = 3850 mm; verified; Exact model row
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkgrdsfab.chassisMassEstimated` = 3205 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkgrdsfab.bodyAndPayloadAllowanceCalculated` = 2795 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso-ecanter-febvkgrdsfab.speedLimiter` = 89 km/h; verified; Electronic limit, exact A/B/C column
  - [fuso_e615_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — PDF p3; Performance / Electronically Speed Limited to B; SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- Checked calculation: fuso-ecanter-febvkgrdsfab.gvm (6000) − fuso-ecanter-febvkgrdsfab.chassisMassEstimated (3205) = 2795 kg

### 8. Fuso eCanter e818 Wide Cab 3400 mm
Source record: `fuso-ecanter-feb7kerdsfac`

- Strength — 4,265 kg before fit-out: The 3,400 mm-wheelbase chassis leaves an estimated 4,265 kg for body, people and load at its standard 7,500 kg GVM.
- Trade-off — Lower rating, lower allowance: The optional 6,000 kg downrating reduces that allowance to about 2,765 kg, before the body, people and cargo are accounted for.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Optional downratings stay within the same chassis-code record; confirm the supplied rating and plate.

Claim dependencies and precise source locators:
- `fuso-ecanter-feb7kerdsfac.wheelbase` = 3400 mm; verified; Exact model row
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kerdsfac.gvm` = 7500 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kerdsfac.chassisMassEstimated` = 3235 kg; verified; Estimated cab-chassis total; PDF column A
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kerdsfac.bodyAndPayloadAllowanceCalculated` = 4265 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kerdsfac.optionalGvm` = 6000 kg; verified; Only explicitly offered downrating; no inferred combinations
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- Checked calculation: fuso-ecanter-feb7kerdsfac.gvm (7500) − fuso-ecanter-feb7kerdsfac.chassisMassEstimated (3235) = 4265 kg
- Checked calculation: fuso-ecanter-feb7kerdsfac.gvm (7500) − fuso-ecanter-feb7kerdsfac.chassisMassEstimated (3235) = 4265 kg
- Checked calculation: fuso-ecanter-feb7kerdsfac.optionalGvm (6000) − fuso-ecanter-feb7kerdsfac.chassisMassEstimated (3235) = 2765 kg

### 9. Fuso eCanter e818 Wide Cab 3850 mm
Source record: `fuso-ecanter-feb7kgrdsfac`

- Strength — 4,250 kg before fit-out: The 3,850 mm-wheelbase chassis leaves an estimated 4,250 kg for body, people and load at its standard 7,500 kg GVM.
- Trade-off — Lower rating, lower allowance: The optional 6,000 kg downrating reduces that allowance to about 2,750 kg, before the body, people and cargo are accounted for.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Optional downratings stay within the same chassis-code record; confirm the supplied rating and plate.

Claim dependencies and precise source locators:
- `fuso-ecanter-feb7kgrdsfac.wheelbase` = 3850 mm; verified; Exact model row
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kgrdsfac.gvm` = 7500 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kgrdsfac.chassisMassEstimated` = 3250 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kgrdsfac.bodyAndPayloadAllowanceCalculated` = 4250 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso-ecanter-feb7kgrdsfac.optionalGvm` = 6000 kg; verified; Only explicitly offered downrating; no inferred combinations
  - [fuso_e818_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- Checked calculation: fuso-ecanter-feb7kgrdsfac.gvm (7500) − fuso-ecanter-feb7kgrdsfac.chassisMassEstimated (3250) = 4250 kg
- Checked calculation: fuso-ecanter-feb7kgrdsfac.gvm (7500) − fuso-ecanter-feb7kgrdsfac.chassisMassEstimated (3250) = 4250 kg
- Checked calculation: fuso-ecanter-feb7kgrdsfac.optionalGvm (6000) − fuso-ecanter-feb7kgrdsfac.chassisMassEstimated (3250) = 2750 kg

### 10. Fuso eCanter e918 Wide Cab 3850 mm
Source record: `fuso-ecanter-fecxkgrdsfac`

- Strength — 5,085 kg before fit-out: At 8,550 kg GVM, the 3,850 mm-wheelbase chassis leaves an estimated 5,085 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 14.6 m kerb-to-kerb turning diameter and 6,685 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.

Claim dependencies and precise source locators:
- `fuso-ecanter-fecxkgrdsfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkgrdsfac.wheelbase` = 3850 mm; verified; Exact model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkgrdsfac.chassisMassEstimated` = 3465 kg; verified; Estimated cab-chassis total; PDF column A
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkgrdsfac.bodyAndPayloadAllowanceCalculated` = 5085 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkgrdsfac.turningCircle` = 14.6 m; verified; Kerb-to-kerb diameter
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Performance / Turning Circle A; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkgrdsfac.lengthCabChassis` = 6685 mm; verified; source declaration
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Dimensions / A - Length Overall, A; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- Checked calculation: fuso-ecanter-fecxkgrdsfac.gvm (8550) − fuso-ecanter-fecxkgrdsfac.chassisMassEstimated (3465) = 5085 kg

### 11. Fuso eCanter e918 Wide Cab 4450 mm
Source record: `fuso-ecanter-fecxkhrdsfac`

- Strength — 5,055 kg before fit-out: At 8,550 kg GVM, the 4,450 mm-wheelbase chassis leaves an estimated 5,055 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 16.6 m kerb-to-kerb turning diameter and 7,185 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.

Claim dependencies and precise source locators:
- `fuso-ecanter-fecxkhrdsfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.wheelbase` = 4450 mm; verified; Exact model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.chassisMassEstimated` = 3495 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.bodyAndPayloadAllowanceCalculated` = 5055 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.turningCircle` = 16.6 m; verified; Kerb-to-kerb diameter
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Performance / Turning Circle B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.lengthCabChassis` = 7185 mm; verified; source declaration
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Dimensions / A - Length Overall, B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- Checked calculation: fuso-ecanter-fecxkhrdsfac.gvm (8550) − fuso-ecanter-fecxkhrdsfac.chassisMassEstimated (3495) = 5055 kg

### 12. Fuso eCanter e918 Wide Cab 4750 mm
Source record: `fuso-ecanter-fecxkkrdsfac`

- Strength — 5,040 kg before fit-out: At 8,550 kg GVM, the 4,750 mm-wheelbase chassis leaves an estimated 5,040 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 17.6 m kerb-to-kerb turning diameter and 7,735 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.

Claim dependencies and precise source locators:
- `fuso-ecanter-fecxkkrdsfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.wheelbase` = 4750 mm; verified; Exact model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.chassisMassEstimated` = 3510 kg; verified; Estimated cab-chassis total; PDF column C
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.bodyAndPayloadAllowanceCalculated` = 5040 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.turningCircle` = 17.6 m; verified; Kerb-to-kerb diameter
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Performance / Turning Circle C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.lengthCabChassis` = 7735 mm; verified; source declaration
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Dimensions / A - Length Overall, C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- Checked calculation: fuso-ecanter-fecxkkrdsfac.gvm (8550) − fuso-ecanter-fecxkkrdsfac.chassisMassEstimated (3510) = 5040 kg

### 13. Fuso eCanter e918 Wide Cab Long Range 4450 mm
Source record: `fuso-ecanter-fecxkhresfac`

- Strength — Three-pack battery option: Three packs provide 123.9 kWh of declared battery capacity on this 4,450 mm-wheelbase chassis, for buyers prioritising battery capacity.
- Trade-off — 465 kg less body-and-load allowance: At 8,550 kg GVM, its estimated 4,590 kg body-and-load allowance is 465 kg below the same-wheelbase two-pack e918; the fitted body and people still share that allowance.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact PDF rounds the three-pack capacity to 124 kWh; the Australian family page declares 123.9 kWh. No exact Australian route-range claim is established.

Claim dependencies and precise source locators:
- `fuso-ecanter-fecxkhresfac.batteryPackCount` = 3 packs; verified; source declaration
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkhresfac.batteryCapacityDeclared` = 123.9 kWh; verified; AU product page battery-size declaration; same small/medium/large pack mapped by exact group and PDF pack count
  - [fuso_electric](https://www.fuso.com.au/range/electric/) — Wheelbase battery options; SHA-256 `7fceeff2ffb02ad5c543c33869c1af02e910ae53705b0d98253c4a3d181614fe`
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [fuso_e918_longrange](https://www.fuso.com.au/range/electric/e918/wide-cab-long-range/) — Key Features / Available Configurations; SHA-256 `3af25543747f4c90e257bfeda45057307918ed06f94b556d9a266ee4e998c752`
- `fuso-ecanter-fecxkhresfac.wheelbase` = 4450 mm; verified; Exact model row
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkhresfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkhresfac.chassisMassEstimated` = 3960 kg; verified; Estimated cab-chassis total; PDF column A
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkhresfac.bodyAndPayloadAllowanceCalculated` = 4590 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p3; Mass estimated* / Total A; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkhrdsfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.wheelbase` = 4450 mm; verified; Exact model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.batteryPackCount` = 2 packs; verified; source declaration
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.chassisMassEstimated` = 3495 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkhrdsfac.bodyAndPayloadAllowanceCalculated` = 5055 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- Checked calculation: fuso-ecanter-fecxkhresfac.gvm (8550) − fuso-ecanter-fecxkhresfac.chassisMassEstimated (3960) = 4590 kg
- Checked calculation: fuso-ecanter-fecxkhrdsfac.gvm (8550) − fuso-ecanter-fecxkhrdsfac.chassisMassEstimated (3495) = 5055 kg
- Checked calculation: fuso-ecanter-fecxkhrdsfac.bodyAndPayloadAllowanceCalculated (5055) − fuso-ecanter-fecxkhresfac.bodyAndPayloadAllowanceCalculated (4590) = 465 kg

### 14. Fuso eCanter e918 Wide Cab Long Range 4750 mm
Source record: `fuso-ecanter-fecxkkresfac`

- Strength — Three-pack battery option: Three packs provide 123.9 kWh of declared battery capacity on this 4,750 mm-wheelbase chassis, for buyers prioritising battery capacity.
- Trade-off — 465 kg less body-and-load allowance: At 8,550 kg GVM, its estimated 4,575 kg body-and-load allowance is 465 kg below the same-wheelbase two-pack e918; the fitted body and people still share that allowance.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact PDF rounds the three-pack capacity to 124 kWh; the Australian family page declares 123.9 kWh. No exact Australian route-range claim is established.

Claim dependencies and precise source locators:
- `fuso-ecanter-fecxkkresfac.batteryPackCount` = 3 packs; verified; source declaration
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkkresfac.batteryCapacityDeclared` = 123.9 kWh; verified; AU product page battery-size declaration; same small/medium/large pack mapped by exact group and PDF pack count
  - [fuso_electric](https://www.fuso.com.au/range/electric/) — Wheelbase battery options; SHA-256 `7fceeff2ffb02ad5c543c33869c1af02e910ae53705b0d98253c4a3d181614fe`
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [fuso_e918_longrange](https://www.fuso.com.au/range/electric/e918/wide-cab-long-range/) — Key Features / Available Configurations; SHA-256 `3af25543747f4c90e257bfeda45057307918ed06f94b556d9a266ee4e998c752`
- `fuso-ecanter-fecxkkresfac.wheelbase` = 4750 mm; verified; Exact model row
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkkresfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkkresfac.chassisMassEstimated` = 3975 kg; verified; Estimated cab-chassis total; PDF column B
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkkresfac.bodyAndPayloadAllowanceCalculated` = 4575 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [fuso_e918_longrange_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — PDF p3; Mass estimated* / Total B; SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso-ecanter-fecxkkrdsfac.gvm` = 8550 kg; verified; Standard GVM, exact PDF model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.wheelbase` = 4750 mm; verified; Exact model row
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.batteryPackCount` = 2 packs; verified; source declaration
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; High Voltage Battery / Capacity; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.chassisMassEstimated` = 3510 kg; verified; Estimated cab-chassis total; PDF column C
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso-ecanter-fecxkkrdsfac.bodyAndPayloadAllowanceCalculated` = 5040 kg; calculated; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [fuso_e918_wide_pdf](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — PDF p3; Mass estimated* / Total C; SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- Checked calculation: fuso-ecanter-fecxkkresfac.gvm (8550) − fuso-ecanter-fecxkkresfac.chassisMassEstimated (3975) = 4575 kg
- Checked calculation: fuso-ecanter-fecxkkrdsfac.gvm (8550) − fuso-ecanter-fecxkkrdsfac.chassisMassEstimated (3510) = 5040 kg
- Checked calculation: fuso-ecanter-fecxkkrdsfac.bodyAndPayloadAllowanceCalculated (5040) − fuso-ecanter-fecxkkresfac.bodyAndPayloadAllowanceCalculated (4575) = 465 kg

### 15. Hyundai MIGHTY Electric Cab Chassis 3300 mm / 7,300 kg GVM
Source record: `hyundai-mighty-electric-cab-chassis-3300-7300`

- Strength — 4,050 kg before body and load: The 7,300 kg cab chassis leaves a calculated 4,050 kg for body, people and load, giving a starting point for a custom fit-out.
- Trade-off — Check DC charger voltage: The DC charger must support at least 569.4 V; 400 V DC infrastructure is incompatible, so check planned charging sites before committing.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- This record is only the 7,300 kg bare cab chassis. The lower-GVM 4,495/4,500 kg conflict and completed body variants remain separate holds.
- A compatible charger is described as 800 V infrastructure; this does not make the nominally 502 V battery an 800 V battery.
- Current linked equipment and older dealer stock may differ; exact delivered equipment epoch needs confirmation.

Claim dependencies and precise source locators:
- `hyundai-mighty-electric-cab-chassis-3300-7300.gvm` = 7300 kg; verified; Standard rating
  - [hyundai_mighty](https://www.hyundai.com/au/en/cars/ecv/mighty-electric) — Headline GVM / Weight & Dimensions; SHA-256 `05c991210f59f0f20008d25617d9d027cea113b9dbdc870a8a543735723c10d5`
  - [hyundai_linked_specs](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — PDF p2; Weight table / Gross Vehicle Mass (GVM) / Cab Chassis 7,300 kg subcolumn; SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
- `hyundai-mighty-electric-cab-chassis-3300-7300.kerbMassCabChassis` = 3250 kg; verified; Bare cab-chassis kerb mass; live page calls same value tare
  - [hyundai_linked_specs](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — PDF p2; Weight table / Kerb weight / Cab Chassis 7,300 kg subcolumn: 3,250 kg; SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
  - [hyundai_mighty](https://www.hyundai.com/au/en/cars/ecv/mighty-electric) — Performance table; SHA-256 `05c991210f59f0f20008d25617d9d027cea113b9dbdc870a8a543735723c10d5`
- `hyundai-mighty-electric-cab-chassis-3300-7300.bodyAndPayloadAllowance` = 4050 kg; verified; GVM minus bare cab-chassis mass; includes body
  - [hyundai_linked_specs](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — PDF p2; Weight table / Cab Chassis 7,300 kg subcolumn / GVM 7,300 minus kerb weight 3,250; bare-chassis calculation only; SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
  - [hyundai_launch](https://www.hyundai.com/au/en/news/vehicles/hyundai-confirms-pricing-servicing-warranty-and-dealer-details-for-mighty-electric-truck) — Weights / payload; SHA-256 `d6d3fcad4d33b45071f7ff56067bb093448d41b4f3767cbf17a7db742382c128`
- `hyundai-mighty-electric-cab-chassis-3300-7300.dcMinimumChargerVoltage` = 569.4 V; verified; Charger compatibility threshold, not nominal battery voltage
  - [hyundai_linked_specs](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — PDF p1; On-board DC fast charger / Charger compatibility: 569.4 V or above; not compatible with 400 V infrastructure; SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
- Checked calculation: hyundai-mighty-electric-cab-chassis-3300-7300.gvm (7300) − hyundai-mighty-electric-cab-chassis-3300-7300.kerbMassCabChassis (3250) = 4050 kg

### 16. Farizon F3E Cab Chassis 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Source record: `farizon-f3e-cab-chassis-72-8kwh`

- Strength — 3.3 kW power for equipment: The listed 3.3 kW, 240 V vehicle-to-load supply can power compatible equipment through the AC charge port; confirm the adapter and equipment requirements.
- Trade-off — Body uses the 1,705 kg allowance: The cab chassis has a published 1,705 kg body-and-load allowance; the chosen body, people and accessories reduce what remains for cargo.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- Adapter inclusion is not specified. The separate 10 kW high-voltage bodybuilder supply is not the 240 V V2L outlet.
- No range is published in the exact cab-chassis brochure column; do not inherit Tray or Cargo Box range.

Claim dependencies and precise source locators:
- `farizon-f3e-cab-chassis-72-8kwh.v2lKw` = 3.3 kW; declared; 240 V via AC charge port; adapter inclusion not specified
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cab Chassis column / Vehicle-to-Load (V2L); SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-cab-chassis-72-8kwh.payloadKg` = 1705 kg; declared; Cab-chassis gross body-plus-load allowance
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cab Chassis column / Payload; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-cab-chassis-72-8kwh.gvmKg` = 3495 kg; declared; Manufacturer GVW label; no separate Australian registration GVM independently verified
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cab Chassis column / Gross Vehicle Weight / GVW; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-cab-chassis-72-8kwh.kerbWeightKg` = 1790 kg; declared; Cab Chassis as advertised
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cab Chassis column / Kerb Weight; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- Checked calculation: farizon-f3e-cab-chassis-72-8kwh.gvmKg (3495) − farizon-f3e-cab-chassis-72-8kwh.kerbWeightKg (1790) = 1705 kg

### 17. Farizon F3E Tray 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Source record: `farizon-f3e-tray-72-8kwh`

- Strength — Published tray payload: The Tray has a published 1,440 kg payload, providing a body-specific starting point for load planning; confirm how occupants and accessories affect the delivered truck.
- Trade-off — Two seats and 90 km/h maximum: Two seats limit crew size, and the 90 km/h published maximum needs checking against routes that regularly use faster roads.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published tray payload is not a weighbridge result; the brochure does not state its treatment of occupants and accessories.
- The Tray range is 314 km WLTP with test payload unspecified; do not apply that number to the other bodies.

Claim dependencies and precise source locators:
- `farizon-f3e-tray-72-8kwh.payloadKg` = 1440 kg; declared; Tray body payload, published figure; occupants/accessories treatment unspecified
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Tray column / Payload; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-tray-72-8kwh.body` = "Tray" ; declared; Australian brochure declared
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Tray column / column heading; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-tray-72-8kwh.seats` = 2 seats; declared; Australian brochure declared
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Tray column / Seating Capacity; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-tray-72-8kwh.topSpeedKmh` = 90 km/h; declared; Australian brochure declared
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Tray column / Maximum Speed; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`

### 18. Farizon F3E Cargo Box 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Source record: `farizon-f3e-cargo-box-72-8kwh`

- Strength — 11.92 m³ advertised box volume: The Cargo Box offers 11.92 m³ of advertised cargo volume for buyers who need an enclosed body; check internal dimensions and the actual load.
- Trade-off — Lower brochure-rated range than Tray: Its brochure-rated range is 250 km WLTP, compared with 314 km for the Tray; neither figure states the test payload or guarantees a loaded route.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Cargo volume measurement method is unspecified. Volume alone does not establish cargo fit or allowable load.
- Range comparisons are limited to the two named F3E bodies and their brochure WLTP declarations; payload, weather, terrain and auxiliaries affect actual range.
- The Cargo Box publishes 1,190 kg payload, with occupant/accessory treatment unspecified; verify the supplied vehicle.

Claim dependencies and precise source locators:
- `farizon-f3e-cargo-box-72-8kwh.cargoVolumeM3` = 11.92 m3; declared; Declared cargo volume; measurement method unspecified
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cargo Box column / Cargo Volume; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-cargo-box-72-8kwh.body` = "Cargo Box" ; declared; Australian brochure declared
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cargo Box column / column heading; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-cargo-box-72-8kwh.rangeKm` = 250 km; declared; WLTP maximum; not loaded route prediction
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Cargo Box column / Maximum Range (km) WLTP; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon-f3e-tray-72-8kwh.rangeKm` = 314 km; declared; WLTP maximum; not loaded route prediction
  - [farizon-f3e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — PDF p2; p2 Tray column / Maximum Range (km) WLTP; SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`

### 19. Farizon H9E 4.5T 100 kWh
Source record: `farizon-h9e-4-5t`

- Strength — Three seats and a 360° camera: The listed three-seat cab and 360-degree camera suit buyers who need room for a three-person crew and camera views when positioning the truck.
- Trade-off — 90 km/h published maximum: The published 90 km/h maximum is a constraint for duties that regularly require faster-road running.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- The body is not named in this brochure column; do not label it a tray or assign a completed-body payload.
- AC charging power is unresolved: the 4.5T brochure says 22 kW and the current family page says 11 kW. Confirm delivered capability before specifying a depot charger.
- Listed equipment is subject to verification on the supplied truck.

Claim dependencies and precise source locators:
- `farizon-h9e-4-5t.seats` = 3 seats; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 4.5T column / Seats; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-4-5t.camera360` = true ; declared_standard; Published fitment, subject to delivered-vehicle verification
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 Safety / 360 degree Around View Camera / shared standard-fitment cell across all four named H9E columns; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-4-5t.topSpeedKmh` = 90 km/h; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 4.5T column / Speed limit; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 20. Farizon H9E 4.5T (Cargo Box) 100 kWh
Source record: `farizon-h9e-4-5t-cargo`

- Strength — Box body with a three-seat cab: The Cargo Box has a three-seat cab and a listed 360-degree camera, useful specifications for a crew working with an enclosed-body truck.
- Trade-off — Check 3.6 m height against routes: Its published 3,600 mm overall height makes loading-bay and route-clearance checks important before choosing this body.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Verify the actual delivered body height, accessories and site clearances.
- AC charging power is unresolved: the 4.5T brochure says 22 kW and the current family page says 11 kW. Confirm delivered capability before specifying a depot charger.
- Cargo Box range remains unknown because its exact brochure cell is blank while a separate range card claims 360 km.

Claim dependencies and precise source locators:
- `farizon-h9e-4-5t-cargo.body` = "Cargo Box" ; declared; Body description must not be inferred from images
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 4.5T (Cargo Box) column / column heading; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-4-5t-cargo.seats` = 3 seats; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 4.5T (Cargo Box) column / Seats; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-4-5t-cargo.camera360` = true ; declared_standard; Published fitment, subject to delivered-vehicle verification
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 Safety / 360 degree Around View Camera / shared standard-fitment cell across all four named H9E columns; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-4-5t-cargo.heightMm` = 3600 mm; declared; Published vehicle dimensions; body basis not independently specified
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 4.5T (Cargo Box) column / Length/Width/Height; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 21. Farizon H9E 8T SWB 107 kWh
Source record: `farizon-h9e-8t-swb`

- Strength — Shorter 8T wheelbase: Its 3,360 mm wheelbase is shorter than the 8T LWB’s 4,500 mm while retaining the same published 7,995 kg GVW.
- Trade-off — 90 km/h published maximum: The published 90 km/h maximum is a constraint for duties that regularly require faster-road running.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- The exact body is not named in this column; wheelbase alone does not establish cargo fit or a finished-body swept path.
- The brochure lists DC charging for 8T without an AC power figure; the family-page AC statement does not resolve exact capability. Unknown does not mean unsupported.
- Published payload needs delivered-body and actual-mass verification.

Claim dependencies and precise source locators:
- `farizon-h9e-8t-swb.wheelbaseMm` = 3360 mm; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T SWB column / Wheelbase; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-swb.gvmKg` = 7995 kg; declared; Manufacturer GVW label; registration GVM not independently checked
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T SWB column / Gross Vehicle Weight (GVW); SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-lwb.wheelbaseMm` = 4500 mm; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T LWB column / Wheelbase; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-lwb.gvmKg` = 7995 kg; declared; Manufacturer GVW label; registration GVM not independently checked
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T LWB column / Gross Vehicle Weight (GVW); SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-swb.topSpeedKmh` = 90 km/h; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T SWB column / Speed limit; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 22. Farizon H9E 8T LWB 162 kWh
Source record: `farizon-h9e-8t-lwb`

- Strength — Larger declared battery: The LWB lists 162 kWh of battery capacity versus 107 kWh for the 8T SWB, for buyers who prioritise battery capacity.
- Trade-off — 1,140 mm longer wheelbase: The 4,500 mm wheelbase is 1,140 mm longer than the 8T SWB, so check depot access and the finished body’s swept path.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact body is not named in this column; wheelbase alone does not establish cargo fit or a finished-body swept path.
- The brochure lists DC charging for 8T without an AC power figure; the family-page AC statement does not resolve exact capability. Unknown does not mean unsupported.

Claim dependencies and precise source locators:
- `farizon-h9e-8t-lwb.batteryDeclaredKwh` = 162 kWh; declared; Declared capacity; gross/usable split unspecified
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T LWB column / Capacity; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-swb.batteryDeclaredKwh` = 107 kWh; declared; Declared capacity; gross/usable split unspecified
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T SWB column / Capacity; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-lwb.wheelbaseMm` = 4500 mm; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T LWB column / Wheelbase; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon-h9e-8t-swb.wheelbaseMm` = 3360 mm; declared; Australian brochure declared
  - [farizon-h9e-brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — PDF p8; p8 H9E 8T SWB column / Wheelbase; SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- Checked calculation: farizon-h9e-8t-lwb.wheelbaseMm (4500) − farizon-h9e-8t-swb.wheelbaseMm (3360) = 1140 mm

### 23. Foton T5 Cab Chassis 4,495 kg GVM, 81.14 kWh, 3,360 mm WB
Source record: `foton-t5-4495-81-14kwh`

- Strength — 11 kW AC and 85 kW DC: The 2025 Production specification lists 11 kW AC and up to 85 kW DC, providing both depot and DC charging options.
- Trade-off — Body shares the 2,095 kg allowance: At 4,495 kg GVM, the calculated 2,095 kg allowance has to cover body, people and load; confirm the finished truck’s cargo capacity.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- 2025 Production is a specification epoch, not a formal model year. Named new stock has not been matched to this exact GVM/body/equipment epoch.
- The 22 kW supplied-cable rating is not the truck’s AC acceptance. Published charging times have no SOC window.
- The 200 km indicative range has no specified cycle or load and is not a loaded-route prediction.

Claim dependencies and precise source locators:
- `foton-t5-4495-81-14kwh.chargingAcMaxKw` = 11 kW; declared; Official Australian 2025 Production brochure; visually verified
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / AC Charging / Charging capacity (maximum); SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-4495-81-14kwh.chargingDcMaxKw` = 85 kW; declared; Official Australian 2025 Production brochure; visually verified
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / DC Charging / Charging capacity (maximum); SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-4495-81-14kwh.gvmKg` = 4495 kg; declared; Official Australian 2025 Production brochure; visually verified
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / GVM; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-4495-81-14kwh.kerbWeightKg` = 2400 kg; declared; 2025 Production cab chassis; distinct from older <2500 kg sheets
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / Kerb Weight; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-4495-81-14kwh.bodyAndPayloadAllowanceKg` = 2095 kg; derived; Derived GVM minus cab-chassis kerb; includes body and all load, not final cargo payload
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 GVM and Kerb Weight rows; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- Checked calculation: foton-t5-4495-81-14kwh.gvmKg (4495) − foton-t5-4495-81-14kwh.kerbWeightKg (2400) = 2095 kg

### 24. Foton T5 Cab Chassis 6,000 kg GVM, 81.14 kWh, 3,360 mm WB
Source record: `foton-t5-6000-81-14kwh`

- Strength — 3,600 kg before body and load: The 6,000 kg GVM cab chassis leaves a calculated 3,600 kg for body, people and load, providing a starting point for a chosen fit-out.
- Trade-off — 90 km/h published maximum: The 2025 Production specification lists a 90 km/h maximum, a constraint to check against faster-road duties.

Required context:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- 2025 Production is a specification epoch, not a formal model year. Named new stock has not been matched to this exact GVM/body/equipment epoch.
- The 200 km indicative range has no specified cycle or load and is not a loaded-route prediction.

Claim dependencies and precise source locators:
- `foton-t5-6000-81-14kwh.gvmKg` = 6000 kg; declared; Official Australian 2025 Production brochure; visually verified
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / GVM; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-6000-81-14kwh.kerbWeightKg` = 2400 kg; declared; 2025 Production cab chassis; distinct from older <2500 kg sheets
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / Kerb Weight; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-6000-81-14kwh.bodyAndPayloadAllowanceKg` = 3600 kg; derived; Derived GVM minus cab-chassis kerb; includes body and all load, not final cargo payload
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 GVM and Kerb Weight rows; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton-t5-6000-81-14kwh.topSpeedKmh` = 90 km/h; declared; Official Australian 2025 Production brochure; visually verified
  - [foton-t5-brochure-official](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — PDF p2; p2 table / Maximum speed; SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- Checked calculation: foton-t5-6000-81-14kwh.gvmKg (6000) − foton-t5-6000-81-14kwh.kerbWeightKg (2400) = 3600 kg

## Visual checks and conflict handling

- hyundai_linked_specs, PDF p1: Charger compatibility row: at least 569.4 V, 400 V infrastructure incompatible; 502 V battery remains a separate value. Original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`; render SHA-256 `3edc3d4a90a4ef2e2926cda4a6f04b31a261f3df12b8e6fbaa16f922760a8338`
- hyundai_linked_specs, PDF p2: Weight columns visibly repeat 4,050 kg across ratings and bodies. Only 7,300 minus 3,250 bare-chassis allowance used; no repeated pantech/low-GVM payload accepted. Original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`; render SHA-256 `58d02c676ffbf135f8c53fe1d50b7f3cd42b6cf07e47ce348dd37e35ded4ac0e`
- fuso_e515_city_pdf, PDF p3: Exact A/B/C codes, dimensions, turning and mass columns read visually. Original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`; render SHA-256 `0e1a585700411c1a433792dc9e25eb8877d636c1d599db80ab4f8dbc827bb5d2`
- fuso_e515_wide_pdf, PDF p3: Exact single code, 12 m turning and 2,745 kg estimated chassis mass read visually; disputed seat wording is not used. Original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`; render SHA-256 `453fc9853d4023d3d3772b9e2b82705836af049e618d1688c0a48872209ddba3`
- fuso_e615_city_pdf, PDF p2: Exact City Cab sheet confirms 22 kW AC and 104 kW DC maxima; no SOC window specified. Original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`; render SHA-256 `b02c74e2250f32c9caad856f3d20c401c29609cb1d2b31ebe54e0dfd9f71cb21`
- fuso_e615_city_pdf, PDF p3: 6,000/4,495 kg rating and 3,070 kg mass read visually. Original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`; render SHA-256 `d31e87c60160f2967f5414e5c2bcd875f581a7593bfd2bc345c103677dfe0abe`
- fuso_e615_wide_pdf, PDF p2: 22 kW AC and 104 kW DC maxima; charge times explicitly theoretical with no SOC window. Original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`; render SHA-256 `53508fb7a0eca548dc1bd80bb232ce18ecadfc2fb2e010121ce10fdb01fe4146`
- fuso_e615_wide_pdf, PDF p3: A/B columns distinguished: B long wheelbase explicitly 89 km/h, not A 100 km/h. Original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`; render SHA-256 `80e0836f16196b2a750b0024b610e2789aab4171671ddd6a41961d5af7162f1b`
- fuso_e818_wide_pdf, PDF p3: Standard/optional ratings and exact A/B estimated masses read visually. Original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`; render SHA-256 `66c81edf21e68525f3d628c869eb928bd3535e4282dc45d29ca6458cf4563d96`
- fuso_e918_wide_pdf, PDF p3: Exact A/B/C code, mass, length and turning columns read visually. Original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`; render SHA-256 `2045c2cfe9bdc6385c6e1f62425c4d5e205009d5512aa2cd378db62ba6d50417`
- fuso_e918_longrange_pdf, PDF p2: Three packs/124 kWh rounded PDF capacity; no gross/usable claim. Original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`; render SHA-256 `ef7d35320e654d7f827c255497b6929a93ca91a6147695c418222b0fb25b1b2d`
- fuso_e918_longrange_pdf, PDF p3: 4,450/4,750 mm columns and 3,960/3,975 kg estimated masses support like-wheelbase allowance comparison. Original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`; render SHA-256 `45d3306c627d5cbb5b2cf178d902b4dd60efda4f11b3592470f53e2158dd7590`
- farizon-f3e-brochure, PDF p2: Visual audit: Cab Chassis range dash; Tray 314 km WLTP/1,440 kg; Cargo Box 250 km WLTP/1,190 kg/11.92 m3. Two seats, 90 km/h and 3.3 kW 240 V V2L across exact columns. Original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`; render SHA-256 `b6a807b4b344f1eada906ba95e5c474ed8322beadf8606c9a1e475e997c94b13`
- farizon-h9e-brochure, PDF p8: PDF page 8, not page 3. Four exact columns; Cargo Box 3,600 mm height; 8T 3,360/4,500 mm WB, 107/162 kWh; AC omission is not no-AC proof. Original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`; render SHA-256 `774967ac590028f51ab3f0dcee4f7a8d46b6b848ae4e96505d13a9bc6156aaf7`
- foton-t5-brochure-official, PDF p2: Raster 2025 Production table visibly confirms 4,495/6,000 kg GVM, 2,400 kg cab-chassis, 11 kW AC/85 kW DC and 90 km/h. 22 kW cable is separate. Original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`; render SHA-256 `ef8308ccc7e16ad9f194baf60dfab066a18e7773328dd691da2ae3d76ff01267`
- jac-brochure, PDF p5: Read-only exclusion audit: hidden extracted draft model codes and AC marks differ from render. All six historical JAC records remain excluded. Original SHA-256 `bd80870f9d8987d09c20762acafb035901e376479985bf63820ac1b9a849a7e4`; render SHA-256 `696228bced8b5eb7b50a6c970195e13a51aa8dce30628eb1c57b628a2ccf85f2`

## Measurement and binding rules

- truck only; do not rank with passenger cars or vans
- Exact rating minus corresponding bare-chassis mass only. Estimated masses remain estimated. Published completed-body figures retain their stated and unknown treatment of occupants/accessories.
- No normalized cross-cycle comparison. Only F3E Tray/Cargo Box declared WLTP comparison is used in lead copy; test payload unspecified. JAC C-WTVC, Hyundai local loaded-tray test and Foton unspecified-cycle claims are separate.
- Declared capacity only; no usable/gross conversion or battery-to-range calculation.
- Only corresponding labelled wheelbase, cab-chassis length, body height and kerb-to-kerb diameter. No generic overall width or swept-path inference.
- Vehicle maximum kW distinct from station rating, cable rating and charge-time SOC window.

- Do not feed this source-level schema directly to buildBuyerSummaries: sourceRecordId values are not final application variant IDs.
- After integration, bind to the final effective pack() fact/feature rows, including value, status, unit, basis, comparison cohort, scope, conditions, source IDs and dates; do not bind merely to raw JSON rows.
- Bind exact chassis/body/rating/technical epoch and model-year wording separately; no formal MY is inferred from brochure or file dates.
- Preserve availability status/revision and visible exact-stock uncertainty. Family-level new stock must not promote an exact current-epoch record to verified in-stock.
- All factual dependencies of comparisons include both exact configurations, with arithmetic recorded. Context dependencies preserve unknowns/conflicts as restrictions, never as proof a feature is absent.
- If any fact used in either clause is missing, changes, conflicts or loses its qualifying conditions/source support, fail closed for that clause rather than filling gaps from family siblings.
- Unresolved context such as H9E AC power remains visible; do not invent a positive/negative capability merely to fit runtime guards.
- Run mutation tests for fact values, source IDs/date/access/conflicts, rating, body, technical epoch and comparison partner; verify each of 24 records has exactly one visible strength and tradeoff only when supported.

## Deliberately not claimed

- No market-best, cheapest, best-in-class or recommendation ranking claim.
- No licence eligibility, current transaction price, guaranteed order acceptance or delivery date.
- No cargo fit or completed-body payload inferred from GVM, chassis allowance or volume.
- No towing inferred from GCM and no trailer capability claim in lead copy.
- No unknown SOC window invented; no sustained peak-charge or charging-time superiority claim.
- No battery energy labelled usable/gross without source support; no true range advantage inferred from capacity.
- No JAC hidden draft values and no historical/future family records added to the current 24-record set.

## Verification

Source JSON: `electric-truck-selling-points-proposal.json` (SHA-256 `a4fdf674db62657d9f3e244348a7919d1fe910a2ac5d0164ce0e0d7305920e78`).
Its dependency registry includes complete original fact snapshots, exact source JSON pointers, original PDF/HTML hashes, page/row locators and checked arithmetic. Context restrictions include source unknowns rather than converting them to absence.

The application runtime has not been tested because final integrated IDs and the effective snapshot have not yet been supplied.
