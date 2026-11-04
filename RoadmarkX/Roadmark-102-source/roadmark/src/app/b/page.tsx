import { HERO_EVIDENCE_IDS, pageEvidenceSources } from "@/lib/page-evidence";
import { WithEvidence } from "@/components/with-evidence";
import FleetExperience from "@/components/fleet-experience";
import type { Query } from "@/lib/page-props";
import { catalogue, pack, research } from "@/lib/data";
import { fleetSelection, curatedFleetCars } from "@/lib/fleet";
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
  const cars = catalogue();
  const d = research();
  const snapshot = { cars, data: d };
  const packs = curatedFleetCars(cars).map((c) => pack(c.id, snapshot));
  const sources = pageEvidenceSources(d.sources, {
    packs,
    extraIds: HERO_EVIDENCE_IDS,
  });
  return (
    <WithEvidence sources={sources}>
      <FleetExperience
        allPacks={packs}
        totalCatalogueCount={cars.length}
        initial={fleetSelection(cars, query)}
        criteria={d.criteria}
        version="b"
      />
    </WithEvidence>
  );
}
