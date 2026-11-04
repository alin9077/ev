# Electric truck buyer-strength and trade-off proposal

Bound to the final supplied effective snapshot on 10 October 2026. Actual runtime and fail-closed mutation validation passed. No application files were changed.

Exactly 24 records / 48 clauses / 196 executable dependencies. 27 source-less unknowns remain audit-only. All 31 dependency and availability sources have exact expected-source snapshots.

## Binding and scope

- Exact Car identity, technical epoch, null formal model year and structured availability evidence are guarded
- All source-backed condition facts guard both clauses; source omissions remain restrictions, never feature-absence claims
- Comparisons also guard the identity and availability of the other exact truck
- Every effective fact includes its full expected row plus value, status, unit, basis, cohort, scope, conditions, sources and date
- No app data, ranking eligibility, stock status or model years were changed

## Bound editorial pairs

### 1. Fuso eCanter e515 City Cab 2500 mm
Integrated ID: `fuso_ecanter_feavkbrcsfad__20261010`
Source record: `fuso-ecanter-feavkbrcsfad`

- Strength — 9.8 m turning diameter: With a 2,500 mm wheelbase, this cab chassis lists a 9.8 m kerb-to-kerb turning diameter and 4,716 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,920 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Exact published configuration: Australian Fuso eCanter e515 City Cab 2500 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e515_city, r10_truck_fuso_e515_city_pdf

Lead-claim evidence:
- `fuso_ecanter_feavkbrcsfad__20261010.wheelbase_mm` = 2500 mm; conditional; Exact model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkbrcsfad__20261010.turning_circle_m` = 9.8 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle A; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkbrcsfad__20261010.length_mm` = 4716 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, A; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkbrcsfad__20261010.gvm_kg` = 4495 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkbrcsfad__20261010.chassis_mass_estimated_kg` = 2575 kg; conditional; Estimated cab-chassis total; PDF column A
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkbrcsfad__20261010.body_and_payload_allowance_calculated_kg` = 1920 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEAVKBRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`

### 2. Fuso eCanter e515 City Cab 2800 mm
Integrated ID: `fuso_ecanter_feavkcrcsfad__20261010`
Source record: `fuso-ecanter-feavkcrcsfad`

- Strength — 10.8 m turning diameter: With a 2,800 mm wheelbase, this cab chassis lists a 10.8 m kerb-to-kerb turning diameter and 5,044 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,910 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Exact published configuration: Australian Fuso eCanter e515 City Cab 2800 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e515_city, r10_truck_fuso_e515_city_pdf

Lead-claim evidence:
- `fuso_ecanter_feavkcrcsfad__20261010.wheelbase_mm` = 2800 mm; conditional; Exact model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkcrcsfad__20261010.turning_circle_m` = 10.8 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle B; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkcrcsfad__20261010.length_mm` = 5044 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, B; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkcrcsfad__20261010.gvm_kg` = 4495 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkcrcsfad__20261010.chassis_mass_estimated_kg` = 2585 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkcrcsfad__20261010.body_and_payload_allowance_calculated_kg` = 1910 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEAVKCRCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`

### 3. Fuso eCanter e515 City Cab 3400 mm
Integrated ID: `fuso_ecanter_feavkercsfad__20261010`
Source record: `fuso-ecanter-feavkercsfad`

- Strength — 12.8 m turning diameter: With a 3,400 mm wheelbase, this cab chassis lists a 12.8 m kerb-to-kerb turning diameter and 5,790 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,885 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Exact published configuration: Australian Fuso eCanter e515 City Cab 3400 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e515_city, r10_truck_fuso_e515_city_pdf

Lead-claim evidence:
- `fuso_ecanter_feavkercsfad__20261010.wheelbase_mm` = 3400 mm; conditional; Exact model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkercsfad__20261010.turning_circle_m` = 12.8 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle C; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkercsfad__20261010.length_mm` = 5790 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, C; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkercsfad__20261010.gvm_kg` = 4495 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkercsfad__20261010.chassis_mass_estimated_kg` = 2610 kg; conditional; Estimated cab-chassis total; PDF column C
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
- `fuso_ecanter_feavkercsfad__20261010.body_and_payload_allowance_calculated_kg` = 1885 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FEAVKERCSFAD; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`
  - [Fuso eCanter e515 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2D05AFC2.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `8a1013e4e35bd03fcdfd666abee77e6a207769a844d60d06b1eb7cb279a35028`

### 4. Fuso eCanter e515 Wide Cab 3400 mm
Integrated ID: `fuso_ecanter_febvkercsfad__20261010`
Source record: `fuso-ecanter-febvkercsfad`

- Strength — 12 m turning diameter: With a 3,400 mm wheelbase, this cab chassis lists a 12 m kerb-to-kerb turning diameter and 5,940 mm length for depot-access planning.
- Trade-off — Body shares the load allowance: At 4,495 kg GVM, the estimated 1,750 kg allowance must cover the fitted body, people and load, so cargo capacity depends on the completed truck.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Exact published configuration: Australian Fuso eCanter e515 Wide Cab 3400 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e515_wide, r10_truck_fuso_e515_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_febvkercsfad__20261010.wheelbase_mm` = 3400 mm; conditional; Exact model row
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso_ecanter_febvkercsfad__20261010.turning_circle_m` = 12 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle ; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso_ecanter_febvkercsfad__20261010.length_mm` = 5940 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, ; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso_ecanter_febvkercsfad__20261010.gvm_kg` = 4495 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso_ecanter_febvkercsfad__20261010.chassis_mass_estimated_kg` = 2745 kg; conditional; Estimated cab-chassis total; PDF column single
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total ; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
- `fuso_ecanter_febvkercsfad__20261010.body_and_payload_allowance_calculated_kg` = 1750 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEBVKERCSFAD; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`
  - [Fuso eCanter e515 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/01B7D02A.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total ; original SHA-256 `efc64f6ae2445cd37adc078e21fb74d005f80514b741d5c6806468a7e8a41d45`

### 5. Fuso eCanter e615 City Cab 3400 mm
Integrated ID: `fuso_ecanter_feavkerdsfab__20261010`
Source record: `fuso-ecanter-feavkerdsfab`

- Strength — 22 kW AC and 104 kW DC: Up to 22 kW AC and 104 kW DC provide two charging options for fleets planning depot and on-route stops.
- Trade-off — Downrating reduces load allowance: Choosing the optional 4,495 kg GVM leaves an estimated 1,425 kg for body, people and load; check the completed truck before choosing that rating.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The lower GVM is an optional rating of this chassis code, not another factory trim. Published theoretical charging times have no stated SOC window.
- Exact published configuration: Australian Fuso eCanter e615 City Cab 3400 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e615_city, r10_truck_fuso_e615_city_pdf

Lead-claim evidence:
- `fuso_ecanter_feavkerdsfab__20261010.ac_kw` = 22 kW; conditional; Manufacturer vehicle charging capability, up to
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / AC Charging; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso_ecanter_feavkerdsfab__20261010.dc_peak_kw` = 104 kW; conditional; Manufacturer vehicle charging capability, up to
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / DC Charging; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso_ecanter_feavkerdsfab__20261010.gvm_kg` = 6000 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso_ecanter_feavkerdsfab__20261010.body_and_payload_allowance_calculated_kg` = 2930 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total ; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso_ecanter_feavkerdsfab__20261010.optional_gvm_kg` = 4495 kg; conditional; Only explicitly offered downrating; no inferred combinations
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / single row: FEAVKERDSFAB; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`
- `fuso_ecanter_feavkerdsfab__20261010.chassis_mass_estimated_kg` = 3070 kg; conditional; Estimated cab-chassis total; PDF column single
  - [Fuso eCanter e615 City Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/5F283C47.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total ; original SHA-256 `a18e8b581582641688c4ace589df690d443c1c530a0555f1334d889d3a4b11bd`

### 6. Fuso eCanter e615 Wide Cab 3400 mm
Integrated ID: `fuso_ecanter_febvkerdsfab__20261010`
Source record: `fuso-ecanter-febvkerdsfab`

- Strength — 22 kW AC and 104 kW DC: Up to 22 kW AC and 104 kW DC provide two charging options for fleets planning depot and on-route stops.
- Trade-off — Downrating reduces load allowance: Choosing the optional 4,495 kg GVM leaves an estimated 1,300 kg for body, people and load; check the completed truck before choosing that rating.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The lower GVM is an optional rating of this chassis code, not another factory trim. Published theoretical charging times have no stated SOC window.
- Exact published configuration: Australian Fuso eCanter e615 Wide Cab 3400 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e615_wide, r10_truck_fuso_e615_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_febvkerdsfab__20261010.ac_kw` = 22 kW; conditional; Manufacturer vehicle charging capability, up to
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / AC Charging; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkerdsfab__20261010.dc_peak_kw` = 104 kW; conditional; Manufacturer vehicle charging capability, up to
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / DC Charging; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkerdsfab__20261010.gvm_kg` = 6000 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkerdsfab__20261010.body_and_payload_allowance_calculated_kg` = 2805 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkerdsfab__20261010.optional_gvm_kg` = 4495 kg; conditional; Only explicitly offered downrating; no inferred combinations
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEBVKERDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkerdsfab__20261010.chassis_mass_estimated_kg` = 3195 kg; conditional; Estimated cab-chassis total; PDF column A
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`

### 7. Fuso eCanter e615 Wide Cab 3850 mm
Integrated ID: `fuso_ecanter_febvkgrdsfab__20261010`
Source record: `fuso-ecanter-febvkgrdsfab`

- Strength — 2,795 kg before body and load: At the standard 6,000 kg GVM, the 3,850 mm-wheelbase chassis leaves an estimated 2,795 kg for the chosen body, people and load.
- Trade-off — 89 km/h electronic limit: This long-wheelbase e615 Wide Cab is electronically limited to 89 km/h, a constraint to check against faster-road duties.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- The optional 4,495 kg downrating reduces the same chassis allowance; it does not create a separate factory trim.
- Exact published configuration: Australian Fuso eCanter e615 Wide Cab 3850 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e615_wide, r10_truck_fuso_e615_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_febvkgrdsfab__20261010.gvm_kg` = 6000 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkgrdsfab__20261010.wheelbase_mm` = 3850 mm; conditional; Exact model row
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkgrdsfab__20261010.chassis_mass_estimated_kg` = 3205 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkgrdsfab__20261010.body_and_payload_allowance_calculated_kg` = 2795 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEBVKGRDSFAB; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`
- `fuso_ecanter_febvkgrdsfab__20261010.speed_limiter` = 89 km/h; conditional; Electronic limit, exact A/B/C column
  - [Fuso eCanter e615 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/2591AF41.pdf) — Fuso Trucks Australia; PDF p3; Performance / Electronically Speed Limited to B; original SHA-256 `bd7420440103db1d775d8e813c8b1ac5b17f2d73453dcdeb035268ffeb7c3fae`

### 8. Fuso eCanter e818 Wide Cab 3400 mm
Integrated ID: `fuso_ecanter_feb7kerdsfac__20261010`
Source record: `fuso-ecanter-feb7kerdsfac`

- Strength — 4,265 kg before fit-out: The 3,400 mm-wheelbase chassis leaves an estimated 4,265 kg for body, people and load at its standard 7,500 kg GVM.
- Trade-off — Lower rating, lower allowance: The optional 6,000 kg downrating reduces that allowance to about 2,765 kg, before the body, people and cargo are accounted for.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Optional downratings stay within the same chassis-code record; confirm the supplied rating and plate.
- Exact published configuration: Australian Fuso eCanter e818 Wide Cab 3400 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e818_wide, r10_truck_fuso_e818_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_feb7kerdsfac__20261010.wheelbase_mm` = 3400 mm; conditional; Exact model row
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kerdsfac__20261010.gvm_kg` = 7500 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kerdsfac__20261010.chassis_mass_estimated_kg` = 3235 kg; conditional; Estimated cab-chassis total; PDF column A
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kerdsfac__20261010.body_and_payload_allowance_calculated_kg` = 4265 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kerdsfac__20261010.optional_gvm_kg` = 6000 kg; conditional; Only explicitly offered downrating; no inferred combinations
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FEB7KERDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`

### 9. Fuso eCanter e818 Wide Cab 3850 mm
Integrated ID: `fuso_ecanter_feb7kgrdsfac__20261010`
Source record: `fuso-ecanter-feb7kgrdsfac`

- Strength — 4,250 kg before fit-out: The 3,850 mm-wheelbase chassis leaves an estimated 4,250 kg for body, people and load at its standard 7,500 kg GVM.
- Trade-off — Lower rating, lower allowance: The optional 6,000 kg downrating reduces that allowance to about 2,750 kg, before the body, people and cargo are accounted for.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Optional downratings stay within the same chassis-code record; confirm the supplied rating and plate.
- Exact published configuration: Australian Fuso eCanter e818 Wide Cab 3850 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e818_wide, r10_truck_fuso_e818_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_feb7kgrdsfac__20261010.wheelbase_mm` = 3850 mm; conditional; Exact model row
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kgrdsfac__20261010.gvm_kg` = 7500 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kgrdsfac__20261010.chassis_mass_estimated_kg` = 3250 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kgrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 4250 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`
- `fuso_ecanter_feb7kgrdsfac__20261010.optional_gvm_kg` = 6000 kg; conditional; Only explicitly offered downrating; no inferred combinations
  - [Fuso eCanter e818 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/9315381B.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FEB7KGRDSFAC; original SHA-256 `522e81449f3a8237beb1f32118580c21e3d33a84e2ad0e1efbcc0e51d49f3040`

### 10. Fuso eCanter e918 Wide Cab 3850 mm
Integrated ID: `fuso_ecanter_fecxkgrdsfac__20261010`
Source record: `fuso-ecanter-fecxkgrdsfac`

- Strength — 5,085 kg before fit-out: At 8,550 kg GVM, the 3,850 mm-wheelbase chassis leaves an estimated 5,085 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 14.6 m kerb-to-kerb turning diameter and 6,685 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.
- Exact published configuration: Australian Fuso eCanter e918 Wide Cab 3850 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e918_wide, r10_truck_fuso_e918_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_fecxkgrdsfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkgrdsfac__20261010.wheelbase_mm` = 3850 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkgrdsfac__20261010.chassis_mass_estimated_kg` = 3465 kg; conditional; Estimated cab-chassis total; PDF column A
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkgrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 5085 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKGRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkgrdsfac__20261010.turning_circle_m` = 14.6 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle A; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkgrdsfac__20261010.length_mm` = 6685 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, A; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`

### 11. Fuso eCanter e918 Wide Cab 4450 mm
Integrated ID: `fuso_ecanter_fecxkhrdsfac__20261010`
Source record: `fuso-ecanter-fecxkhrdsfac`

- Strength — 5,055 kg before fit-out: At 8,550 kg GVM, the 4,450 mm-wheelbase chassis leaves an estimated 5,055 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 16.6 m kerb-to-kerb turning diameter and 7,185 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.
- Exact published configuration: Australian Fuso eCanter e918 Wide Cab 4450 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e918_wide, r10_truck_fuso_e918_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_fecxkhrdsfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.wheelbase_mm` = 4450 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.chassis_mass_estimated_kg` = 3495 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 5055 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.turning_circle_m` = 16.6 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.length_mm` = 7185 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`

### 12. Fuso eCanter e918 Wide Cab 4750 mm
Integrated ID: `fuso_ecanter_fecxkkrdsfac__20261010`
Source record: `fuso-ecanter-fecxkkrdsfac`

- Strength — 5,040 kg before fit-out: At 8,550 kg GVM, the 4,750 mm-wheelbase chassis leaves an estimated 5,040 kg to share between the body, people and load.
- Trade-off — Check manoeuvring space: Its 17.6 m kerb-to-kerb turning diameter and 7,735 mm cab-chassis length warrant a route-access and finished-body swept-path check.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Published cab-chassis dimensions and kerb-to-kerb turning diameter do not establish finished-body clearance or swept path.
- The optional 7,000 kg downrating reduces allowance; the figures in the strength use the standard 8,550 kg rating.
- Exact published configuration: Australian Fuso eCanter e918 Wide Cab 4750 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_fuso_e918_wide, r10_truck_fuso_e918_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_fecxkkrdsfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.wheelbase_mm` = 4750 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.chassis_mass_estimated_kg` = 3510 kg; conditional; Estimated cab-chassis total; PDF column C
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 5040 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.turning_circle_m` = 17.6 m; conditional; Kerb-to-kerb diameter
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Performance / Turning Circle C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.length_mm` = 7735 mm; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Dimensions / A - Length Overall, C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`

### 13. Fuso eCanter e918 Wide Cab Long Range 4450 mm
Integrated ID: `fuso_ecanter_fecxkhresfac__20261010`
Source record: `fuso-ecanter-fecxkhresfac`

- Strength — Three-pack battery option: Three packs provide 123.9 kWh of declared battery capacity on this 4,450 mm-wheelbase chassis, for buyers prioritising battery capacity.
- Trade-off — 465 kg less body-and-load allowance: At 8,550 kg GVM, its estimated 4,590 kg body-and-load allowance is 465 kg below the same-wheelbase two-pack e918; the fitted body and people still share that allowance.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact PDF rounds the three-pack capacity to 124 kWh; the Australian family page declares 123.9 kWh. No exact Australian route-range claim is established.
- Exact published configuration: Australian Fuso eCanter e918 Wide Cab Long Range 4450 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: fuso_ecanter_fecxkhrdsfac__20261010
Availability sources: r10_truck_fuso_e918_longrange, r10_truck_fuso_e918_longrange_pdf, r10_truck_fuso_e918_wide, r10_truck_fuso_e918_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_fecxkhresfac__20261010.battery_pack_count` = 3 packs; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkhresfac__20261010.battery_kwh` = 123.9 kWh; conditional; AU product page battery-size declaration; same small/medium/large pack mapped by exact group and PDF pack count
  - [Fuso eCanter Australian range](https://www.fuso.com.au/range/electric/) — Fuso Trucks Australia; Wheelbase battery options; original SHA-256 `7fceeff2ffb02ad5c543c33869c1af02e910ae53705b0d98253c4a3d181614fe`
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [Fuso eCanter e918 Wide Cab Long Range Australian model page](https://www.fuso.com.au/range/electric/e918/wide-cab-long-range/) — Fuso Trucks Australia; Key Features / Available Configurations; original SHA-256 `3af25543747f4c90e257bfeda45057307918ed06f94b556d9a266ee4e998c752`
- `fuso_ecanter_fecxkhresfac__20261010.wheelbase_mm` = 4450 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkhresfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkhresfac__20261010.chassis_mass_estimated_kg` = 3960 kg; conditional; Estimated cab-chassis total; PDF column A
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkhresfac__20261010.body_and_payload_allowance_calculated_kg` = 4590 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / A: FECXKHRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total A; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkhrdsfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.wheelbase_mm` = 4450 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.battery_pack_count` = 2 packs; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.chassis_mass_estimated_kg` = 3495 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkhrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 5055 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKHRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`

### 14. Fuso eCanter e918 Wide Cab Long Range 4750 mm
Integrated ID: `fuso_ecanter_fecxkkresfac__20261010`
Source record: `fuso-ecanter-fecxkkresfac`

- Strength — Three-pack battery option: Three packs provide 123.9 kWh of declared battery capacity on this 4,750 mm-wheelbase chassis, for buyers prioritising battery capacity.
- Trade-off — 465 kg less body-and-load allowance: At 8,550 kg GVM, its estimated 4,575 kg body-and-load allowance is 465 kg below the same-wheelbase two-pack e918; the fitted body and people still share that allowance.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Fuso chassis masses are estimates with a stated ±3.5% variation. Body, occupants, accessories and load share the allowance; verify finished-vehicle mass and axle limits.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact PDF rounds the three-pack capacity to 124 kWh; the Australian family page declares 123.9 kWh. No exact Australian route-range claim is established.
- Exact published configuration: Australian Fuso eCanter e918 Wide Cab Long Range 4750 mm; Australian next-generation eCanter; exact model code from current-linked PDF valid from 20-Jun-23; formal model year unverified

Guarded comparison partners: fuso_ecanter_fecxkkrdsfac__20261010
Availability sources: r10_truck_fuso_e918_longrange, r10_truck_fuso_e918_longrange_pdf, r10_truck_fuso_e918_wide, r10_truck_fuso_e918_wide_pdf

Lead-claim evidence:
- `fuso_ecanter_fecxkkresfac__20261010.battery_pack_count` = 3 packs; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkkresfac__20261010.battery_kwh` = 123.9 kWh; conditional; AU product page battery-size declaration; same small/medium/large pack mapped by exact group and PDF pack count
  - [Fuso eCanter Australian range](https://www.fuso.com.au/range/electric/) — Fuso Trucks Australia; Wheelbase battery options; original SHA-256 `7fceeff2ffb02ad5c543c33869c1af02e910ae53705b0d98253c4a3d181614fe`
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [Fuso eCanter e918 Wide Cab Long Range Australian model page](https://www.fuso.com.au/range/electric/e918/wide-cab-long-range/) — Fuso Trucks Australia; Key Features / Available Configurations; original SHA-256 `3af25543747f4c90e257bfeda45057307918ed06f94b556d9a266ee4e998c752`
- `fuso_ecanter_fecxkkresfac__20261010.wheelbase_mm` = 4750 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkkresfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkkresfac__20261010.chassis_mass_estimated_kg` = 3975 kg; conditional; Estimated cab-chassis total; PDF column B
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkkresfac__20261010.body_and_payload_allowance_calculated_kg` = 4575 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / B: FECXKKRESFAC; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
  - [Fuso eCanter e918 Wide Cab Long Range Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/CACAFD5F.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total B; original SHA-256 `35d38640753135b7f3b5b4ff6bbbeb03bcae7d1c6de5129cb9cc08b1b8bb9d3a`
- `fuso_ecanter_fecxkkrdsfac__20261010.gvm_kg` = 8550 kg; conditional; Standard GVM, exact PDF model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.wheelbase_mm` = 4750 mm; conditional; Exact model row
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.battery_pack_count` = 2 packs; conditional; Exact published Australian configuration
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; High Voltage Battery / Capacity; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.chassis_mass_estimated_kg` = 3510 kg; conditional; Estimated cab-chassis total; PDF column C
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
- `fuso_ecanter_fecxkkrdsfac__20261010.body_and_payload_allowance_calculated_kg` = 5040 kg; conditional; Standard GVM minus estimated cab-chassis mass; NOT finished vehicle payload
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p2; ECANTER SPECIFICATIONS model matrix / C: FECXKKRDSFAC; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`
  - [Fuso eCanter e918 Wide Cab Australian specification sheet](https://daimleradsmart.com/au/fuso/specsheets/specs/B13D05F4.pdf) — Fuso Trucks Australia; PDF p3; Mass estimated* / Total C; original SHA-256 `9640b2ba1a0ebd70d607c5307831fcf1cefdc795db89dd8a38418d46473c4a28`

### 15. Hyundai MIGHTY Electric Cab Chassis 3300 mm / 7,300 kg GVM
Integrated ID: `hyundai_mighty_electric_cab_chassis_3300_7300__20261010`
Source record: `hyundai-mighty-electric-cab-chassis-3300-7300`

- Strength — 4,050 kg before body and load: The 7,300 kg cab chassis leaves a calculated 4,050 kg for body, people and load, giving a starting point for a custom fit-out.
- Trade-off — Check DC charger voltage: The DC charger must support at least 569.4 V; 400 V DC infrastructure is incompatible, so check planned charging sites before committing.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- This record is only the 7,300 kg bare cab chassis. The lower-GVM 4,495/4,500 kg conflict and completed body variants remain separate holds.
- A compatible charger is described as 800 V infrastructure; this does not make the nominally 502 V battery an 800 V battery.
- Current linked equipment and older dealer stock may differ; exact delivered equipment epoch needs confirmation.
- Exact published configuration: Australian Hyundai MIGHTY Electric Cab Chassis 3300 mm / 7,300 kg GVM; Current AU offering; current-linked multi-body equipment sheet differs from older 7-inch page/brochure; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_hyundai_models, r10_truck_hyundai_mighty

Lead-claim evidence:
- `hyundai_mighty_electric_cab_chassis_3300_7300__20261010.gvm_kg` = 7300 kg; conditional; Standard rating
  - [Hyundai MIGHTY Electric Australian model page](https://www.hyundai.com/au/en/cars/ecv/mighty-electric) — Hyundai Motor Company Australia; Headline GVM / Weight & Dimensions; original SHA-256 `05c991210f59f0f20008d25617d9d027cea113b9dbdc870a8a543735723c10d5`
  - [Hyundai MIGHTY Electric specification and body-option sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — Hyundai Motor Company Australia; PDF p2; Weight table / Gross Vehicle Mass (GVM) / Cab Chassis 7,300 kg subcolumn; original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
- `hyundai_mighty_electric_cab_chassis_3300_7300__20261010.kerb_mass_kg` = 3250 kg; conditional; Bare cab-chassis kerb mass; live page calls same value tare
  - [Hyundai MIGHTY Electric specification and body-option sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — Hyundai Motor Company Australia; PDF p2; Weight table / Kerb weight / Cab Chassis 7,300 kg subcolumn: 3,250 kg; original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
  - [Hyundai MIGHTY Electric Australian model page](https://www.hyundai.com/au/en/cars/ecv/mighty-electric) — Hyundai Motor Company Australia; Performance table; original SHA-256 `05c991210f59f0f20008d25617d9d027cea113b9dbdc870a8a543735723c10d5`
- `hyundai_mighty_electric_cab_chassis_3300_7300__20261010.body_and_payload_allowance_kg` = 4050 kg; conditional; GVM minus bare cab-chassis mass; includes body
  - [Hyundai MIGHTY Electric specification and body-option sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — Hyundai Motor Company Australia; PDF p2; Weight table / Cab Chassis 7,300 kg subcolumn / GVM 7,300 minus kerb weight 3,250; bare-chassis calculation only; original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`
  - [Hyundai MIGHTY Electric Australian launch announcement](https://www.hyundai.com/au/en/news/vehicles/hyundai-confirms-pricing-servicing-warranty-and-dealer-details-for-mighty-electric-truck) — Hyundai Motor Company Australia; Weights / payload; original SHA-256 `d6d3fcad4d33b45071f7ff56067bb093448d41b4f3767cbf17a7db742382c128`
- `hyundai_mighty_electric_cab_chassis_3300_7300__20261010.dc_minimum_charger_voltage_v` = 569.4 V; conditional; Charger compatibility threshold, not nominal battery voltage
  - [Hyundai MIGHTY Electric specification and body-option sheet](https://www.hyundai.com/content/dam/hyundai/au/en/models/ev-mighty-truck/documents/Mighty_Electric_Specification_Brochure_Sheet.pdf) — Hyundai Motor Company Australia; PDF p1; On-board DC fast charger / Charger compatibility: 569.4 V or above; not compatible with 400 V infrastructure; original SHA-256 `31f2a2f5f0fa9591fd7ec4ab60c88c3a71cd313721d0ea6ef713b96e9359029e`

### 16. Farizon F3E Cab Chassis 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Integrated ID: `farizon_f3e_cab_chassis_72_8kwh__20261010`
Source record: `farizon-f3e-cab-chassis-72-8kwh`

- Strength — 3.3 kW power for equipment: The listed 3.3 kW, 240 V vehicle-to-load supply can power compatible equipment through the AC charge port; confirm the adapter and equipment requirements.
- Trade-off — Body uses the 1,705 kg allowance: The cab chassis has a published 1,705 kg body-and-load allowance; the chosen body, people and accessories reduce what remains for cargo.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- Adapter inclusion is not specified. The separate 10 kW high-voltage bodybuilder supply is not the 240 V V2L outlet.
- No range is published in the exact cab-chassis brochure column; do not inherit Tray or Cargo Box range.
- Exact published configuration: Australian Farizon F3E Cab Chassis 72.8 kWh, 3,495 kg GVW, 3,700 mm WB; Current-linked brochure; footer 2026-03-03; July 2026 Australian launch; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_farizon_f3e, r10_truck_farizon_f3e_launch

Lead-claim evidence:
- `farizon_f3e_cab_chassis_72_8kwh__20261010.v2l_kw` = 3.3 kW; conditional; 240 V via AC charge port; adapter inclusion not specified
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cab Chassis column / Vehicle-to-Load (V2L); original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_cab_chassis_72_8kwh__20261010.published_payload_kg` = 1705 kg; conditional; Cab-chassis gross body-plus-load allowance
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cab Chassis column / Payload; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_cab_chassis_72_8kwh__20261010.gvm_kg` = 3495 kg; conditional; Manufacturer GVW label; no separate Australian registration GVM independently verified
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cab Chassis column / Gross Vehicle Weight / GVW; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_cab_chassis_72_8kwh__20261010.kerb_mass_kg` = 1790 kg; conditional; Cab Chassis as advertised
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cab Chassis column / Kerb Weight; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`

### 17. Farizon F3E Tray 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Integrated ID: `farizon_f3e_tray_72_8kwh__20261010`
Source record: `farizon-f3e-tray-72-8kwh`

- Strength — Published tray payload: The Tray has a published 1,440 kg payload, providing a body-specific starting point for load planning; confirm how occupants and accessories affect the delivered truck.
- Trade-off — Two seats and 90 km/h maximum: Two seats limit crew size, and the 90 km/h published maximum needs checking against routes that regularly use faster roads.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Published tray payload is not a weighbridge result; the brochure does not state its treatment of occupants and accessories.
- The Tray range is 314 km WLTP with test payload unspecified; do not apply that number to the other bodies.
- Exact published configuration: Australian Farizon F3E Tray 72.8 kWh, 3,495 kg GVW, 3,700 mm WB; Current-linked brochure; footer 2026-03-03; July 2026 Australian launch; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_farizon_f3e, r10_truck_farizon_f3e_launch

Lead-claim evidence:
- `farizon_f3e_tray_72_8kwh__20261010.published_payload_kg` = 1440 kg; conditional; Tray body payload, published figure; occupants/accessories treatment unspecified
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Tray column / Payload; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_tray_72_8kwh__20261010.body` = "Tray" ; conditional; Australian brochure declared
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Tray column / column heading; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_tray_72_8kwh__20261010.seats` = 2 seats; conditional; Australian brochure declared
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Tray column / Seating Capacity; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_tray_72_8kwh__20261010.top_speed_kmh` = 90 km/h; conditional; Australian brochure declared
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Tray column / Maximum Speed; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`

### 18. Farizon F3E Cargo Box 72.8 kWh, 3,495 kg GVW, 3,700 mm WB
Integrated ID: `farizon_f3e_cargo_box_72_8kwh__20261010`
Source record: `farizon-f3e-cargo-box-72-8kwh`

- Strength — 11.92 m³ advertised box volume: The Cargo Box offers 11.92 m³ of advertised cargo volume for buyers who need an enclosed body; check internal dimensions and the actual load.
- Trade-off — Lower brochure-rated range than Tray: Its brochure-rated range is 250 km WLTP, compared with 314 km for the Tray; neither figure states the test payload or guarantees a loaded route.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Cargo volume measurement method is unspecified. Volume alone does not establish cargo fit or allowable load.
- Range comparisons are limited to the two named F3E bodies and their brochure WLTP declarations; payload, weather, terrain and auxiliaries affect actual range.
- The Cargo Box publishes 1,190 kg payload, with occupant/accessory treatment unspecified; verify the supplied vehicle.
- Exact published configuration: Australian Farizon F3E Cargo Box 72.8 kWh, 3,495 kg GVW, 3,700 mm WB; Current-linked brochure; footer 2026-03-03; July 2026 Australian launch; formal model year unverified

Guarded comparison partners: farizon_f3e_tray_72_8kwh__20261010
Availability sources: r10_truck_farizon_f3e, r10_truck_farizon_f3e_launch

Lead-claim evidence:
- `farizon_f3e_cargo_box_72_8kwh__20261010.cargo_volume_m3` = 11.92 m3; conditional; Declared cargo volume; measurement method unspecified
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cargo Box column / Cargo Volume; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_cargo_box_72_8kwh__20261010.body` = "Cargo Box" ; conditional; Australian brochure declared
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cargo Box column / column heading; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_cargo_box_72_8kwh__20261010.range_km` = 250 km; conditional; WLTP maximum; not loaded route prediction
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Cargo Box column / Maximum Range (km) WLTP; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`
- `farizon_f3e_tray_72_8kwh__20261010.range_km` = 314 km; conditional; WLTP maximum; not loaded route prediction
  - [Farizon F3E Australian specification brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_F3_E_Brochure_20260703_6b49020a8e.pdf) — Farizon Auto Australia; PDF p2; p2 Tray column / Maximum Range (km) WLTP; original SHA-256 `c8eeb4bb3a6532b7d5dc1d30e09153a4ebb29730198cc4dcb3990d2fed239b97`

### 19. Farizon H9E 4.5T 100 kWh
Integrated ID: `farizon_h9e_4_5t__20261010`
Source record: `farizon-h9e-4-5t`

- Strength — Three seats and a 360° camera: The listed three-seat cab and 360-degree camera suit buyers who need room for a three-person crew and camera views when positioning the truck.
- Trade-off — 90 km/h published maximum: The published 90 km/h maximum is a constraint for duties that regularly require faster-road running.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- The body is not named in this brochure column; do not label it a tray or assign a completed-body payload.
- AC charging power is unresolved: the 4.5T brochure says 22 kW and the current family page says 11 kW. Confirm delivered capability before specifying a depot charger.
- Listed equipment is subject to verification on the supplied truck.
- Exact published configuration: Australian Farizon H9E 4.5T 100 kWh; Brochure current as at 2025-04-03; current official listing/configurator; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_farizon_range, r10_truck_farizon_h9e

Lead-claim evidence:
- `farizon_h9e_4_5t__20261010.seats` = 3 seats; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 4.5T column / Seats; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_4_5t__20261010.equipment_camera360` = true ; conditional; Published fitment, subject to delivered-vehicle verification
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 Safety / 360 degree Around View Camera / shared standard-fitment cell across all four named H9E columns; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_4_5t__20261010.top_speed_kmh` = 90 km/h; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 4.5T column / Speed limit; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 20. Farizon H9E 4.5T (Cargo Box) 100 kWh
Integrated ID: `farizon_h9e_4_5t_cargo__20261010`
Source record: `farizon-h9e-4-5t-cargo`

- Strength — Box body with a three-seat cab: The Cargo Box has a three-seat cab and a listed 360-degree camera, useful specifications for a crew working with an enclosed-body truck.
- Trade-off — Check 3.6 m height against routes: Its published 3,600 mm overall height makes loading-bay and route-clearance checks important before choosing this body.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Verify the actual delivered body height, accessories and site clearances.
- AC charging power is unresolved: the 4.5T brochure says 22 kW and the current family page says 11 kW. Confirm delivered capability before specifying a depot charger.
- Cargo Box range remains unknown because its exact brochure cell is blank while a separate range card claims 360 km.
- Exact published configuration: Australian Farizon H9E 4.5T (Cargo Box) 100 kWh; Brochure current as at 2025-04-03; current official listing/configurator; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_farizon_range, r10_truck_farizon_h9e, r10_truck_farizon_h9e_config

Lead-claim evidence:
- `farizon_h9e_4_5t_cargo__20261010.body` = "Cargo Box" ; conditional; Body description must not be inferred from images
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 4.5T (Cargo Box) column / column heading; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_4_5t_cargo__20261010.seats` = 3 seats; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 4.5T (Cargo Box) column / Seats; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_4_5t_cargo__20261010.equipment_camera360` = true ; conditional; Published fitment, subject to delivered-vehicle verification
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 Safety / 360 degree Around View Camera / shared standard-fitment cell across all four named H9E columns; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_4_5t_cargo__20261010.height_mm` = 3600 mm; conditional; Published vehicle dimensions; body basis not independently specified
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 4.5T (Cargo Box) column / Length/Width/Height; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 21. Farizon H9E 8T SWB 107 kWh
Integrated ID: `farizon_h9e_8t_swb__20261010`
Source record: `farizon-h9e-8t-swb`

- Strength — Shorter 8T wheelbase: Its 3,360 mm wheelbase is shorter than the 8T LWB’s 4,500 mm while retaining the same published 7,995 kg GVW.
- Trade-off — 90 km/h published maximum: The published 90 km/h maximum is a constraint for duties that regularly require faster-road running.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- The exact body is not named in this column; wheelbase alone does not establish cargo fit or a finished-body swept path.
- The brochure lists DC charging for 8T without an AC power figure; the family-page AC statement does not resolve exact capability. Unknown does not mean unsupported.
- Published payload needs delivered-body and actual-mass verification.
- Exact published configuration: Australian Farizon H9E 8T SWB 107 kWh; Brochure current as at 2025-04-03; current official listing/configurator; formal model year unverified

Guarded comparison partners: farizon_h9e_8t_lwb__20261010
Availability sources: r10_truck_farizon_range, r10_truck_farizon_h9e, r10_truck_farizon_h9e_config

Lead-claim evidence:
- `farizon_h9e_8t_swb__20261010.wheelbase_mm` = 3360 mm; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T SWB column / Wheelbase; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_swb__20261010.gvm_kg` = 7995 kg; conditional; Manufacturer GVW label; registration GVM not independently checked
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T SWB column / Gross Vehicle Weight (GVW); original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_lwb__20261010.wheelbase_mm` = 4500 mm; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T LWB column / Wheelbase; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_lwb__20261010.gvm_kg` = 7995 kg; conditional; Manufacturer GVW label; registration GVM not independently checked
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T LWB column / Gross Vehicle Weight (GVW); original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_swb__20261010.top_speed_kmh` = 90 km/h; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T SWB column / Speed limit; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 22. Farizon H9E 8T LWB 162 kWh
Integrated ID: `farizon_h9e_8t_lwb__20261010`
Source record: `farizon-h9e-8t-lwb`

- Strength — Larger declared battery: The LWB lists 162 kWh of battery capacity versus 107 kWh for the 8T SWB, for buyers who prioritise battery capacity.
- Trade-off — 1,140 mm longer wheelbase: The 4,500 mm wheelbase is 1,140 mm longer than the 8T SWB, so check depot access and the finished body’s swept path.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Battery capacity is manufacturer-declared; Australian evidence does not establish gross versus usable energy, and capacity is not a route-range prediction.
- The exact body is not named in this column; wheelbase alone does not establish cargo fit or a finished-body swept path.
- The brochure lists DC charging for 8T without an AC power figure; the family-page AC statement does not resolve exact capability. Unknown does not mean unsupported.
- Exact published configuration: Australian Farizon H9E 8T LWB 162 kWh; Brochure current as at 2025-04-03; current official listing/configurator; formal model year unverified

Guarded comparison partners: farizon_h9e_8t_swb__20261010
Availability sources: r10_truck_farizon_range, r10_truck_farizon_h9e, r10_truck_farizon_h9e_config

Lead-claim evidence:
- `farizon_h9e_8t_lwb__20261010.battery_kwh` = 162 kWh; conditional; Declared capacity; gross/usable split unspecified
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T LWB column / Capacity; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_swb__20261010.battery_kwh` = 107 kWh; conditional; Declared capacity; gross/usable split unspecified
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T SWB column / Capacity; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_lwb__20261010.wheelbase_mm` = 4500 mm; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T LWB column / Wheelbase; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`
- `farizon_h9e_8t_swb__20261010.wheelbase_mm` = 3360 mm; conditional; Australian brochure declared
  - [Farizon H9E Australian brochure](https://d2e4u25u6oksl8.cloudfront.net/farizonau/Farizon_H9_E_Brochure_Web_6e8bdf192f.pdf) — Farizon Auto Australia; PDF p8; p8 H9E 8T SWB column / Wheelbase; original SHA-256 `d8f2b341708072939fface3b17bcac15fddbf5850caeff110ab5928bbe0f9fdd`

### 23. Foton T5 Cab Chassis 4,495 kg GVM, 81.14 kWh, 3,360 mm WB
Integrated ID: `foton_t5_4495_81_14kwh__20261010`
Source record: `foton-t5-4495-81-14kwh`

- Strength — 11 kW AC and 85 kW DC: The 2025 Production specification lists 11 kW AC and up to 85 kW DC, providing both depot and DC charging options.
- Trade-off — Body shares the 2,095 kg allowance: At 4,495 kg GVM, the calculated 2,095 kg allowance has to cover body, people and load; confirm the finished truck’s cargo capacity.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- Charging power is a vehicle maximum, not a sustained rate or guaranteed time. Confirm site supply and compatibility.
- 2025 Production is a specification epoch, not a formal model year. Named new stock has not been matched to this exact GVM/body/equipment epoch.
- The 22 kW supplied-cable rating is not the truck’s AC acceptance. Published charging times have no SOC window.
- The 200 km indicative range has no specified cycle or load and is not a loaded-route prediction.
- Exact published configuration: Australian Foton T5 Cab Chassis 4,495 kg GVM, 81.14 kWh, 3,360 mm WB; 2025 Production brochure currently linked from importer T5 tipper page; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_foton_range, r10_truck_foton_t5_tipper

Lead-claim evidence:
- `foton_t5_4495_81_14kwh__20261010.ac_kw` = 11 kW; conditional; Official Australian 2025 Production brochure; visually verified
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / AC Charging / Charging capacity (maximum); original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_4495_81_14kwh__20261010.dc_peak_kw` = 85 kW; conditional; Official Australian 2025 Production brochure; visually verified
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / DC Charging / Charging capacity (maximum); original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_4495_81_14kwh__20261010.gvm_kg` = 4495 kg; conditional; Official Australian 2025 Production brochure; visually verified
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / GVM; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_4495_81_14kwh__20261010.kerb_mass_kg` = 2400 kg; conditional; 2025 Production cab chassis; distinct from older <2500 kg sheets
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / Kerb Weight; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_4495_81_14kwh__20261010.body_and_payload_allowance_calculated_kg` = 2095 kg; conditional; Derived GVM minus cab-chassis kerb; includes body and all load, not final cargo payload
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 GVM and Kerb Weight rows; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`

### 24. Foton T5 Cab Chassis 6,000 kg GVM, 81.14 kWh, 3,360 mm WB
Integrated ID: `foton_t5_6000_81_14kwh__20261010`
Source record: `foton-t5-6000-81-14kwh`

- Strength — 3,600 kg before body and load: The 6,000 kg GVM cab chassis leaves a calculated 3,600 kg for body, people and load, providing a starting point for a chosen fit-out.
- Trade-off — 90 km/h published maximum: The 2025 Production specification lists a 90 km/h maximum, a constraint to check against faster-road duties.

Required visible conditions:
- Australian truck configuration only. Confirm the delivered chassis code, rating, body and specification epoch with the seller.
- Current official listing does not establish exact-configuration physical stock, acceptance of a factory order or delivery timing.
- Body-plus-load allowance is not finished-vehicle cargo payload. Deduct the fitted body, occupants and accessories, and verify actual mass and axle limits.
- 2025 Production is a specification epoch, not a formal model year. Named new stock has not been matched to this exact GVM/body/equipment epoch.
- The 200 km indicative range has no specified cycle or load and is not a loaded-route prediction.
- Exact published configuration: Australian Foton T5 Cab Chassis 6,000 kg GVM, 81.14 kWh, 3,360 mm WB; 2025 Production brochure currently linked from importer T5 tipper page; formal model year unverified

Guarded comparison partners: none
Availability sources: r10_truck_foton_range, r10_truck_foton_t5_tipper

Lead-claim evidence:
- `foton_t5_6000_81_14kwh__20261010.gvm_kg` = 6000 kg; conditional; Official Australian 2025 Production brochure; visually verified
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / GVM; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_6000_81_14kwh__20261010.kerb_mass_kg` = 2400 kg; conditional; 2025 Production cab chassis; distinct from older <2500 kg sheets
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / Kerb Weight; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_6000_81_14kwh__20261010.body_and_payload_allowance_calculated_kg` = 3600 kg; conditional; Derived GVM minus cab-chassis kerb; includes body and all load, not final cargo payload
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 GVM and Kerb Weight rows; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`
- `foton_t5_6000_81_14kwh__20261010.top_speed_kmh` = 90 km/h; conditional; Official Australian 2025 Production brochure; visually verified
  - [Foton T5 EV Australian brochure, 2025 Production](https://www.fotonmobility.com.au/_files/ugd/1a32d3_3cdfb174f146409980373b4c5e510217.pdf) — Foton Mobility Distribution Australia; PDF p2; p2 table / Maximum speed; original SHA-256 `8abcbb0b39162ef66fbd0d4b4788feefa99c0cc4039c7a9959078434e6efeb34`

## Exclusions and source review

The source-stage proposal is retained as `electric-truck-selling-points-source-proposal.json` and `.md`. It contains the complete 16-page visual audit, source matrices, original fact pointers and verified arithmetic. The bound JSON carries that provenance forward alongside the effective row guards.

Excluded: Hyundai disputed lower-GVM version and unfinished body options; all six historical JAC records; the three Foton family/future holds. Fourteen Fuso chassis codes retain downratings as options, not additional trims.

Only truck cohorts apply. Bare-chassis allowances include bodies and people. Declared battery capacities have no invented usable/gross basis. No towing, licence, market-best or real-world route claim is introduced. F3E declared WLTP comparison stays specific to Tray and Cargo Box.

## Validation status

Static binding passed: all 122 lead dependencies retain source values; the sole context transformation is the intended Hyundai disputed-GVM observation object to unknown, with observations preserved. Actual runtime validation passed: 4756 mutation checks, all 24 truck pairs visible, and an in-memory catalogue merge from 222 to 246 complete summaries with unrelated summaries unchanged.

Validation report: `electric-truck-selling-points-validation.json`. No application files were written.
