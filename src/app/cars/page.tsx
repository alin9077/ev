import { WithEvidence } from "@/components/with-evidence";
import Explorer from "@/components/explorer";
import { publicEquipment } from "@/lib/data";
import { pickerCars } from "@/lib/picker-cars";
import type { Query } from "@/lib/page-props";
export const metadata = {
  title: "Explore the Australian EV shortlist",
  alternates: { canonical: "/cars" },
};
export default async function Cars({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const query =
    process.env.SITE_STATIC_EXPORT === "1" ? {} : await searchParams;
  const initial = Object.fromEntries(
    Object.entries(query).filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;
  return (
    <WithEvidence sources={[]}>
      <Explorer
        cars={pickerCars()}
        initial={initial}
        equipment={publicEquipment()}
      />
    </WithEvidence>
  );
}
