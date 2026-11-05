import type { Issue } from "./types";

const legacyChargingExample =
  "A 350 kW supply used in a Kia test does not establish a 350 kW vehicle peak.";

/** Reader wording only. Never change evidence issues, ranking holds or identity snapshots.
 * Match the known historical example exactly so revised warnings remain visible verbatim.
 */
export function issueReaderText(issue: Issue): string {
  if (
    issue.issue_id === "V2-13" &&
    issue.publication_action === legacyChargingExample
  )
    return "A charging station’s rated output does not establish this vehicle’s peak charging acceptance. Compare charging times only when charge windows and test conditions match.";
  return issue.publication_action;
}
