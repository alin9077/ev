import { pageEvidenceSources } from "@/lib/page-evidence";
import { discoveryCars } from "@/lib/discovery";
import Discovery from "@/components/discovery";
import { WithEvidence } from "@/components/with-evidence";
import { catalogue, research } from "@/lib/data";
export const metadata = {
  title: "Discover exact EV strengths",
  alternates: { canonical: "/discover" },
};
export default function Discover() {
  const cars = discoveryCars(catalogue());
  const sources = pageEvidenceSources(research().sources, { cars });
  return (
    <WithEvidence sources={sources}>
      <Discovery cars={cars} sources={sources} />
    </WithEvidence>
  );
}
