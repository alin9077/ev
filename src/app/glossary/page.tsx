import Link from "next/link";
import { site } from "@/lib/config";
// Advance only when the definitions themselves have been reviewed.
const DEFINITIONS_REVIEWED = "2026-10-10";
export const metadata = {
  title: "EV glossary: WLTP, LFP, V2L, FBT and driveaway",
  alternates: { canonical: "/glossary" },
};
const definitions = [
  {
    id: "wltp",
    term: "WLTP",
    text: "Worldwide harmonised Light vehicles Test Procedure: a standard laboratory testing procedure used for vehicle consumption and range figures. A claimed WLTP range is not a promise of the distance you will drive on a charge.",
    row: "fact-range_km",
    source:
      "https://greenvehicleguide.gov.au/pages/UnderstandingEmissions/VehicleEmissions",
    publisher: "Australian Government — Green Vehicle Guide",
  },
  {
    id: "lfp",
    term: "LFP",
    text: "Lithium iron phosphate: a type of lithium-ion battery chemistry. Chemistry alone does not determine a car's range or its recommended charge limit; follow the instructions for the battery fitted to your vehicle.",
    row: "question-battery_chemistry",
    source:
      "https://arpa-e.energy.gov/programs-and-initiatives/search-all-projects/alloy-containing-low-cost-abundant-metals-replace-copper-lithium-ion-batteries",
    publisher: "US Department of Energy — ARPA-E",
  },
  {
    id: "v2l",
    term: "V2L",
    text: "Vehicle-to-load: using a compatible car's traction battery to supply electrical appliances through an approved outlet or adapter. Output limits and equipment vary by car; V2L does not by itself establish permission or capability to supply a house or export to the grid.",
    row: "question-v2l",
    source: "https://shop.tesla.com/en_au/product/tesla-outlet-adapter",
    publisher: "Tesla Australia — V2L adapter",
  },
  {
    id: "fbt",
    term: "FBT",
    text: "Fringe benefits tax: a tax employers may pay on non-cash benefits provided to employees, including private use of a work car. Electric-car exemptions have eligibility conditions; this glossary does not establish eligibility for a particular lease.",
    row: "question-novated_fbt",
    source: "https://www.ato.gov.au/Business/Fringe-benefits-tax/",
    publisher: "Australian Taxation Office",
  },
  {
    id: "driveaway",
    term: "Driveaway",
    text: "The total price to put a car on the road for the stated location, typically including delivery, registration, compulsory third-party insurance and stamp duty. It is different from a base price before on-road costs. Check inclusions, options, postcode and offer expiry in a written quote.",
    row: "question-driveaway_price",
    source: "https://www.accc.gov.au/consumers/pricing/price-displays",
    publisher: "ACCC — total-price displays",
  },
];
export default function Glossary() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Australian EV glossary",
    url: `${site.origin}/glossary`,
    dateModified: DEFINITIONS_REVIEWED,
    hasDefinedTerm: definitions.map((d) => ({
      "@type": "DefinedTerm",
      "@id": `${site.origin}/glossary#${d.id}`,
      name: d.term,
      description: d.text,
    })),
  };
  return (
    <main id="main" className="container editorial-page citable-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <p className="eyebrow">EV words, plainly explained</p>
      <h1>A small EV glossary</h1>
      <p className="lede">Five terms that change how you read a comparison.</p>
      <p>
        Definitions reviewed{" "}
        <time dateTime={DEFINITIONS_REVIEWED}>{DEFINITIONS_REVIEWED}</time>.
      </p>
      <nav className="glossary-index" aria-label="Glossary terms">
        {definitions.map((d) => (
          <a key={d.id} href={`#${d.id}`}>
            {d.term}
          </a>
        ))}
      </nav>
      {definitions.map((d) => (
        <section className="answer-row" id={d.id} key={d.id}>
          <h2>{d.term}</h2>
          <p>{d.text}</p>
          <p className="small">
            Reference: <a href={d.source}>{d.publisher}</a> · Definition
            reviewed {DEFINITIONS_REVIEWED}.
          </p>
          <Link href={`/compare/model-y-vs-sealion-7#${d.row}`}>
            See the relevant Model Y and Sealion 7 comparison row →
          </Link>
        </section>
      ))}
      <Link href="/comparisons">Browse all nine comparisons</Link>
    </main>
  );
}
