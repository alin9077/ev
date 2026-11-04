import { StaticComparison } from "@/components/static-comparison";
import { WithEvidence } from "@/components/with-evidence";
import {
  pickerCatalogue,
  publicCounts,
  publicPack,
  research,
} from "@/lib/data";
import Experience from "@/components/experience";
import { parseSelection } from "@/lib/compare";
import { experienceProps, type Query } from "@/lib/page-props";
export const metadata = {
  title: "Compare exact Australian variants",
  robots: { index: false, follow: true },
};
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  if (process.env.SITE_STATIC_EXPORT === "1") {
    // A static page cannot read the link, so it opens on the default pair and fetches the rest.
    const cars = pickerCatalogue();
    const initial = parseSelection(new URLSearchParams(), cars).ids.map(
      publicPack,
    );
    return (
      <WithEvidence sources={initial.flatMap((p) => p.sources)}>
        <StaticComparison
          cars={cars}
          initialPacks={initial}
          criteria={research().criteria}
          counts={publicCounts()}
        />
      </WithEvidence>
    );
  }
  const props = experienceProps(await searchParams);
  // Only the selected cars' sources are sent; the picker list carries no sources.
  const sources = [
    ...new Map(
      props.packs.flatMap((p) => p.sources).map((s) => [s.id, s]),
    ).values(),
  ];
  return (
    <WithEvidence sources={sources}>
      <Experience mode="compare" {...props} />
    </WithEvidence>
  );
}
