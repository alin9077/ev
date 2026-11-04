import Link from "next/link";
import type { Pack, Research } from "@/lib/types";
import { formatYear } from "@/lib/compare";
import { seatsOf } from "@/lib/format";
import { featureFor } from "@/lib/verification";
import { BASELINE, CHALLENGER, site, availabilityLabels } from "@/lib/config";
import {
  FactValue,
  Issues,
  Notice,
  SeatingDiagram,
  SoftwareTimeline,
  FeatureValue,
} from "./ui";
export default function Detail({
  pack,
  criteria,
  children,
}: {
  pack: Pack;
  criteria: Research["criteria"];
  children?: React.ReactNode;
}) {
  const c = pack.car;
  return (
    <main id="main" className="container editorial-page">
      <p className="eyebrow">{c.brand} / Australian variant record</p>
      <div className="detail-title">
        <div>
          <h1>{c.model}</h1>
          <p className="lede">{c.trim}</p>
          <p>
            {formatYear(c.year)} · {availabilityLabels[c.availability]} ·{" "}
            {c.drive}
          </p>
          <p className="small muted">{c.generation}</p>
          <Link
            className="button primary"
            href={`/compare?cars=${c.modelId === "tesla_model_y" ? `${c.id},${CHALLENGER}` : `${BASELINE},${c.id}`}&data=${site.date}`}
          >
            Compare this variant
          </Link>
        </div>
        <SeatingDiagram seats={seatsOf(c)} />
      </div>
      {children}
      <Notice />
      <Issues issues={c.issues} />
      <h2>Essentials</h2>
      <div className="detail-facts">
        {Object.values(c.facts).map((f) => (
          <section key={f.key}>
            <h3>{f.label}</h3>
            <FactValue fact={f} />
          </section>
        ))}
      </div>
      <h2>Equipment</h2>
      <div className="detail-features">
        {criteria.map((criterion) => {
          const f = featureFor(pack, criterion.key);
          return (
            <details key={criterion.key}>
              <summary>{criterion.label}</summary>
              <FeatureValue feature={f} />
            </details>
          );
        })}
      </div>
      <SoftwareTimeline pack={pack} />
    </main>
  );
}
