import { WithEvidence } from "@/components/with-evidence";
import Software from "@/components/software";
import { catalogue, publicPack } from "@/lib/data";
import { pickerCars } from "@/lib/picker-cars";
import { BASELINE } from "@/lib/config";
import type { Query } from "@/lib/page-props";
export const metadata = {
  title: "Documented software changes",
  alternates: { canonical: "/software" },
};
export default async function SoftwarePage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const q = process.env.SITE_STATIC_EXPORT === "1" ? {} : await searchParams;
  const c = catalogue().find((c) => c.id === q.car);
  const pack = publicPack(c?.id || BASELINE);
  return (
    <WithEvidence sources={pack.sources}>
      <Software
        cars={pickerCars()}
        pack={pack}
        local={process.env.SITE_STATIC_EXPORT === "1"}
      />
    </WithEvidence>
  );
}
