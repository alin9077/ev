import {
  buyerSummaryCar,
  softwareTimelinePack,
} from "@/lib/detail-client-props";
import { EvidenceConditions } from "./evidence-conditions";
import {
  availabilityReportClaim,
  orderEvidenceText,
} from "@/lib/availability-corrections";
import { FootnoteRefs } from "./footnotes";
import { featureReportClaim } from "@/lib/corrections";
import { BuyerSummary } from "./buyer-summary";
import Link from "next/link";
import { ClaimReport } from "./claim-report";
import type { Pack, Research } from "@/lib/types";
import { availabilityLabels } from "@/lib/config";
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
  const allFacts = Object.values(c.facts);
  const equipmentDetails = allFacts.filter((f) =>
    f.key.startsWith("equipment_"),
  );
  const warrantyDetails = allFacts.filter((f) => f.key.startsWith("warranty_"));
  const sourceHistory = allFacts.filter((f) => f.key.startsWith("source_"));
  const essentials = allFacts.filter(
    (f) =>
      !f.key.startsWith("equipment_") &&
      !f.key.startsWith("warranty_") &&
      !f.key.startsWith("source_"),
  );
  const factCard = (f: (typeof allFacts)[number]) => (
    <section key={f.key}>
      <h3>{f.label}</h3>
      <FactValue fact={f} />
      <ClaimReport variantId={c.id} fact={f} />
    </section>
  );
  return (
    <main id="main" className="container editorial-page">
      <p className="eyebrow">{c.brand} / Australian variant record</p>
      <div className="detail-title">
        <div>
          <h1>{c.model}</h1>
          <p className="lede">{c.trim}</p>
          <p>
            {c.year ?? "MY unverified"} · {availabilityLabels[c.availability]} ·{" "}
            {c.drive}
          </p>
          <p className="small muted">{c.generation}</p>
          {c.configurationEvidence && (
            <p className="small muted">
              <strong>
                Captured configuration · specifications incomplete.
              </strong>{" "}
              {c.configurationEvidence.projectionScope}
            </p>
          )}
          <Link
            className="button primary"
            href={`/discover?selected=${encodeURIComponent(c.id)}&class=${encodeURIComponent(c.vehicleClass || "passenger")}`}
          >
            Choose vehicles to compare
          </Link>
        </div>
        <SeatingDiagram seats={Number(c.facts.seats.value)} />
      </div>
      {c.vehicleClass && c.vehicleClass !== "passenger" && (
        <BuyerSummary car={buyerSummaryCar(c)} sources={pack.sources} />
      )}
      {children}
      {c.availabilityEvidence && (
        <section className="buyer-summary" aria-label="Availability evidence">
          <h2>Availability evidence</h2>
          <p>
            <strong>
              {c.availabilityEvidence.stockStatus === "new_stock_listed"
                ? "New stock advertised"
                : "Exact new stock not verified"}
            </strong>
            . {orderEvidenceText(c.availabilityEvidence.orderStatus)}
          </p>
          <p className="small muted">
            Checked {c.availabilityEvidence.checkedAt}. An advertisement is not
            confirmation of physical stock, reservation or delivery timing.{" "}
            <FootnoteRefs ids={c.availabilityEvidence.sourceIds} />
          </p>
          {!!c.availabilityEvidence.qualifications?.length && (
            <EvidenceConditions
              conditions={c.availabilityEvidence.qualifications}
              label="Availability details"
            />
          )}
          <ClaimReport variantId={c.id} fact={availabilityReportClaim(c)} />
        </section>
      )}
      {(!c.vehicleClass || c.vehicleClass === "passenger") && (
        <BuyerSummary car={buyerSummaryCar(c)} sources={pack.sources} />
      )}
      <Notice />
      <Issues issues={c.issues} />
      <h2>Essentials</h2>
      <div className="detail-facts">{essentials.map(factCard)}</div>
      {(equipmentDetails.length > 0 ||
        warrantyDetails.length > 0 ||
        sourceHistory.length > 0) && (
        <div className="detail-features detail-supplementary">
          {sourceHistory.length > 0 && (
            <details>
              <summary>
                Source history and original declarations ({sourceHistory.length}
                )
              </summary>
              <p className="small muted">
                Original source declarations are retained for verification.
                Their model-year, measurement and availability limits still
                apply; they are not extra comparable specifications.
              </p>
              <div className="detail-facts">{sourceHistory.map(factCard)}</div>
            </details>
          )}
          {equipmentDetails.length > 0 && (
            <details>
              <summary>
                Published equipment details ({equipmentDetails.length})
              </summary>
              <p className="small muted">
                Exact manufacturer observations, including optional and
                unverified fields. A missing value does not mean a feature is
                absent.
              </p>
              <div className="detail-facts">
                {equipmentDetails.map(factCard)}
              </div>
            </details>
          )}
          {warrantyDetails.length > 0 && (
            <details>
              <summary>
                Warranty conditions and separate cover ({warrantyDetails.length}
                )
              </summary>
              <p className="small muted">
                Base cover, extensions, battery capacity and component
                exceptions have separate conditions. Read the source terms for
                your use and vehicle.
              </p>
              <div className="detail-facts">
                {warrantyDetails.map(factCard)}
              </div>
            </details>
          )}
        </div>
      )}
      <h2>Equipment</h2>
      <div className="detail-features">
        {criteria.map((criterion) => {
          const f = pack.features.find((f) => f.criterion === criterion.key)!;
          return (
            <details key={criterion.key}>
              <summary>{criterion.label}</summary>
              <FeatureValue feature={f} />
              <ClaimReport
                variantId={c.id}
                fact={featureReportClaim(f, criterion.label)}
              />
            </details>
          );
        })}
      </div>
      <SoftwareTimeline pack={softwareTimelinePack(pack)} />
    </main>
  );
}
