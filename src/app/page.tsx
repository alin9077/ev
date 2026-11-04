import { WithEvidence } from "@/components/with-evidence";
import FleetExperience from "@/components/fleet-experience";
import type { Query } from "@/lib/page-props";
import { fleetProps } from "@/lib/fleet-props";
export const metadata = {
  title: "Tesla Model Y vs Australia’s leading EVs.",
  alternates: { canonical: "/" },
};
export default async function Home({
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
  const { sources, ...props } = fleetProps(query);
  return (
    <WithEvidence sources={sources}>
      <FleetExperience {...props} version="b" />
    </WithEvidence>
  );
}
