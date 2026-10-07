import { WithEvidence } from "@/components/with-evidence";
import Explorer from "@/components/explorer";
import { pickerCatalogue, research } from "@/lib/data";
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
  const equipment = Object.fromEntries(
    research().trim_equipment.map((e) => [
      e.variant_id,
      Object.fromEntries(
        ["front_ventilated", "hud", "adaptive_damping", "power_roof_shade"].map(
          (k) => [k, typeof e[k] === "boolean" ? e[k] : null],
        ),
      ),
    ]),
  );
  return (
    <WithEvidence>
      <Explorer
        cars={pickerCatalogue()}
        initial={initial}
        equipment={equipment}
      />
    </WithEvidence>
  );
}
