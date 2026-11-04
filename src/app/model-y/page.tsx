import { WithEvidence } from "@/components/with-evidence";
import Link from "next/link";
import { publicPack, publicCatalogue } from "@/lib/data";
import { CHALLENGER, site } from "@/lib/config";
import { Notice, VehicleCard } from "@/components/ui";
export const metadata = {
  title: "The four Model Y variants",
  alternates: { canonical: "/model-y" },
};
export default function ModelY() {
  const cars = publicCatalogue().filter((c) => c.modelId === "tesla_model_y");
  const sources = cars.flatMap((c) => publicPack(c.id).sources);
  return (
    <WithEvidence sources={sources}>
      <main id="main" className="container editorial-page">
        <p className="eyebrow">The Model Y range</p>
        <h1>Model Y range</h1>
        <p className="lede">
          Start with the layout and equipment you need. Then compare the exact
          Australian configuration.
        </p>
        <Notice />
        <div className="vehicle-grid two">
          {cars.map((c) => (
            <VehicleCard
              key={c.id}
              car={c}
              action={
                <Link
                  className="button secondary"
                  href={`/compare?cars=${c.id},${CHALLENGER}&data=${site.date}`}
                >
                  Compare this variant
                </Link>
              }
            />
          ))}
        </div>
        <section className="editorial-text">
          <h2>Model Y L</h2>
          <p>
            Its six-seat layout, ANCAP applicability and software eligibility
            are separate from the five-seat variants. A nameplate-wide software
            count does not describe updates installed on a Model Y L.
          </p>
          <Link
            href={`/cars/${cars[2].family}/${cars[2].slug}`}
            className="text-link"
          >
            Explore Model Y L
          </Link>
          <h2>Build differences</h2>
          <p>
            Current-order screens, battery specifications and acceleration
            claims must not be presented as upgrades delivered over the air to
            older cars. Check the generation, evidence date and conditions
            beside each figure.
          </p>
        </section>
      </main>
    </WithEvidence>
  );
}
