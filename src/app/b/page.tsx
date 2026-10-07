import { WithEvidence } from "@/components/with-evidence";
import FleetExperience from "@/components/fleet-experience";
import type { Query } from "@/lib/page-props";
import { catalogue, pack, research } from "@/lib/data";
import { fleetSelection } from "@/lib/fleet";
/** The B version of the homepage: the same comparison in the second look. */
export const metadata = {
  title: "Tesla Model Y vs Australia’s leading EVs. (B)",
  alternates: { canonical: "/" },
  robots: { index: false },
};
export default async function HomeB({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const params =
    process.env.SITE_STATIC_EXPORT === "1" ? {} : await searchParams;
  const query = new URLSearchParams(
    Object.entries(params).filter(
      (e): e is [string, string] => typeof e[1] === "string",
    ),
  );
  return (
    <WithEvidence>
      <FleetExperience
        allPacks={catalogue().map((c) => pack(c.id))}
        initial={fleetSelection(catalogue(), query)}
        criteria={research().criteria}
        version="b"
      />
    </WithEvidence>
  );
}
