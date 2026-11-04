import { StaticComparison } from "@/components/static-comparison";
import { WithEvidence } from "@/components/with-evidence";
import { catalogue, pack, research, counts, pickerCatalogue } from "@/lib/data";
import Experience from "@/components/experience";
import {
  experienceProps,
  selectedPackSources,
  type Query,
} from "@/lib/page-props";
export const metadata = {
  title: "Compare exact Australian variants",
  robots: { index: false, follow: true },
};
export default async function Compare({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  if (process.env.SITE_STATIC_EXPORT === "1")
    return (
      <WithEvidence>
        <StaticComparison
          cars={pickerCatalogue()}
          allPacks={catalogue().map((c) => pack(c.id))}
          criteria={research().criteria}
          counts={counts()}
        />
      </WithEvidence>
    );
  const props = experienceProps(await searchParams);
  return (
    <WithEvidence
      sources={selectedPackSources(props.packs, research().sources)}
    >
      <Experience mode="compare" {...props} />
    </WithEvidence>
  );
}
