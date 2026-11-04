import { HERO_EVIDENCE_IDS, pageEvidenceSources } from "@/lib/page-evidence";
import { discoveryCars } from "@/lib/discovery";
import FleetExperience from "@/components/fleet-experience";
import { fleetSelection, curatedFleetCars } from "@/lib/fleet";
import Discovery from "@/components/discovery";
import { WithEvidence } from "@/components/with-evidence";
import { catalogue, pack, research } from "@/lib/data";
export const metadata = {
  title: "Find what your next EV does best",
  alternates: { canonical: "/" },
};
export default function Home() {
  const cars = catalogue();
  const d = research();
  const snapshot = { cars, data: d };
  const packs = curatedFleetCars(cars).map((c) => pack(c.id, snapshot));
  const discovery = discoveryCars(cars);
  const sources = pageEvidenceSources(d.sources, {
    packs,
    extraIds: HERO_EVIDENCE_IDS,
    cars: discovery,
  });
  return (
    <WithEvidence sources={sources}>
      <FleetExperience
        allPacks={packs}
        totalCatalogueCount={cars.length}
        initial={fleetSelection(cars, new URLSearchParams())}
        criteria={d.criteria}
        version="b"
        afterHero={<Discovery cars={discovery} sources={sources} embedded />}
      />
    </WithEvidence>
  );
}
