import { WithEvidence } from "@/components/with-evidence";
import Software from "@/components/software";
import { catalogue, pickerCatalogue, pack } from "@/lib/data";
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
  return (
    <WithEvidence>
      <Software
        cars={pickerCatalogue()}
        pack={pack(c?.id || BASELINE)}
        allPacks={
          process.env.SITE_STATIC_EXPORT === "1"
            ? catalogue().map((c) => pack(c.id))
            : undefined
        }
      />
    </WithEvidence>
  );
}
