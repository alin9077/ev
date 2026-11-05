import Link from "next/link";
import { genericEvidenceNote } from "@/lib/evidence-display";
import { counts, research } from "@/lib/data";
export const metadata = {
  title: "Methodology & limitations",
  alternates: { canonical: "/methodology" },
};
export default function Methodology() {
  const c = counts();
  return (
    <main id="main" className="container editorial-page">
      <p className="eyebrow">How to read the evidence</p>
      <h1>Methodology</h1>
      <p className="lede">
        This is independent desk research. We make the measurement basis,
        uncertainty and original source part of the comparison.
      </p>
      <div className="editorial-text">
        <h2>Buyer priorities</h2>
        <p>
          Price and ownership lead this guide, followed by automated driving,
          including Full Self-Driving (Supervised), standard assistance and
          parking. Range, space, convenience, comfort and software follow.
          Select a priority to reorder these remaining topics. The default
          baseline is Tesla Model Y Premium RWD; shared links retain their
          selected variant.
        </p>
        <h2>Fresh checks</h2>
        <p>
          The 6 October refinement adds targeted primary-source checks for Tesla
          software, garage integration and V2L, Sealion 7 digital keys and
          motors, and ATTO 3 EVO technical figures. It does not reverify the
          entire catalogue. Source footnotes distinguish these checks from the
          supplied research.
        </p>
        <h2>Shortlist</h2>
        <p>
          {c.variants} Australian variant records across {c.families} model
          families and {c.generations} generation-level records. {c.current} are
          current/order-listed in the snapshot, {c.outgoing} are outgoing and{" "}
          {c.provisional} is announced/provisional. Outgoing Atto 3 and Atto 3
          EVO remain distinct.
        </p>
        <p>
          “Australia’s leading EVs” describes our researched shortlist. It is
          not a verified current national top-ten sales ranking or the entire
          market. A separately verified sales period and methodology would be
          required before claiming that ranking.
        </p>
        <h2>Dates & prices</h2>
        <p>
          On 8 October 2026, all 32 buyer sources previously marked as
          search-summary-only were attempted: 22 returned readable articles and
          10 remained inaccessible. The source check logs corrections and
          access failures. Figures without support remain unknown; supported
          secondary figures are labelled Reported. This was a targeted audit,
          not a new check of every specification.{" "}
          <Link href="/sources#source-audit">Read the source audit</Link>.
        </p>
        <p>
          The page update date describes an editorial change, not the age of
          every fact. Key facts, answers, copy text and machine-readable exports
          share the same claim formatter. Prices, charging windows, test cars
          and measured cargo volumes retain their own basis.{" "}
          <Link href="/glossary">Read the glossary</Link>.
        </p>
        <p>
          The original catalogue review is dated 6 October 2026; later additions
          and corrections carry their own verification dates. Some
          specifications retain older evidence. A rebuild never changes
          verification dates. Prices follow a source ladder: maker list price
          before on-road costs, national driveaway, a named-version configurator
          or from-price, state-specific driveaway, reputable Australian
          reporting, then a dealer advertisement. State, source and conditions
          stay attached. Before-on-road and driveaway prices are never converted
          into one another.
        </p>
        <p>
          Date-only offer deadlines are inclusive. Where a source does not state
          a timezone, Roadmark uses the Australia/Sydney calendar as a
          conservative mainland-Australian reference, rather than waiting for
          UTC midnight. This is our display policy, not a claim about the
          seller’s terms. Explicit seller closing times and conditions remain
          authoritative. Time-limited buyer summaries wait for a current-date
          check in your browser.
        </p>
        <h2>How evidence ages</h2>
        <p>
          Published figures and vehicle cards stay visible as they age. Prices,
          offers and availability are fresh for 45 days. Range, battery,
          charging, performance and equipment are fresh for 180 days.
          Dimensions, seats, cargo volume, towing and warranty terms are fresh
          for 365 days, or until a known model-year change.
        </p>
        <p>
          Older evidence shows its checked date in amber and is left out of
          rankings for that fact. An older availability check is labelled
          separately; it does not remove fresh technical figures for a
          current/order-listed version. Outgoing stock-only versions still need
          a fresh stock check. Strengths and trade-offs stay visible while their
          own supporting facts remain fresh; an unrelated old price does not
          remove a range or equipment reason. Explicit offer deadlines still
          apply.
        </p>
        <h2>Measurement basis</h2>
        <ul>
          <li>
            Range claims retain their WLTP, EPA or NEDC basis, variant and wheel
            conditions. They are not our road tests.
          </li>
          <li>
            Charging windows such as 10–80%, 30–80% and 0–80% are distinct.
            Charger supply is not vehicle acceptance. No peak-power-to-stop-time
            conversion is made.
          </li>
          <li>
            Usable and gross battery capacity stay separate. Unknown battery
            capacity stays unknown.
          </li>
          <li>
            Occupied-seat cargo, front storage and maximum folded cargo are
            different measurements. VDA and manufacturer volume are not
            interchangeable.
          </li>
          <li>
            Rollout-subtracted acceleration is labelled. An uncertain timing
            protocol does not earn a numeric comparison badge.
          </li>
        </ul>
        <h2>How sure are we?</h2>
        <p>
          <strong>Confirmed</strong> means current Australian maker material
          supports this version. <strong>Check</strong> means a specific option,
          wheel choice or measurement condition matters; open the mark beside
          the figure to read it. <strong>Reported</strong> means a secondary
          source or a sibling version, with its source retained.
          <strong> Not published</strong> means a documented search did not find
          the figure. An unreviewed gap remains “Needs confirmation”.
        </p>
        <p>{genericEvidenceNote}</p>
        <p>
          A generic model-year or laboratory disclaimer does not reduce a fact’s
          grade. Maker terms explicitly applying across a brand can be
          inherited; range-wide dimensions, seats and boot figures can apply
          across the stated body. Specific exclusions, dates and options still
          matter. Regrading does not change the source’s checked date.
        </p>
        <p>
          Confirmed and Check figures can rank when their measurement bases
          match. Reported figures remain visible but unranked. Coverage is
          incomplete, so no claim of “best in Australia” is made.
        </p>
        <p>
          {c.evidence.toLocaleString()} feature evidence rows across{" "}
          {c.criteria} criteria are not {c.evidence.toLocaleString()}{" "}
          independent tests. Some evidence is inherited from a model-wide manual
          and may need trim or build confirmation. Detail cards retain the
          scope; numbered footnotes link to original sources.
        </p>
        <h2>Software scope</h2>
        <p>
          The observation window is fixed at 5 October 2024 to 5 October 2026.
          Nameplate histories, current model years and individual installations
          are separate. We show documented minimums and explicitly state when
          the total is unknown. Release families, maintenance builds, dealer
          work, map/app notices and announcements have different units.
        </p>
        <p>
          EV3 has six reverified notices and two older records pending
          reverification. Model Y L does not inherit the five-seat or
          whole-nameplate count. Larger batteries, screens and configuration
          changes are not OTA upgrades.
        </p>
        <h2>Safety & assistance</h2>
        <p>
          Model Y L has separate ANCAP applicability and child-restraint
          cautions. Atto 3 EVO does not inherit the outgoing model’s rating.
          Driver assistance remains subject to Australian build, package,
          supervision and operating conditions; this site does not describe it
          as autonomous driving.
        </p>
        <h2>Privacy & independence</h2>
        <p>
          No accounts, vehicle login, VIN collection, third-party behavioural
          analytics or embedded video requests. Optional shortlist storage stays
          on your device. Shared links take precedence. All current diagrams are
          original schematics, not exact dimensional or child-restraint models.
          Manufacturer media candidates are blocked until rights and
          applicability are recorded.
        </p>
        <h2>Known publication issues</h2>
        {research().publication_issues.map((i) => (
          <section key={i.issue_id}>
            <h3>{i.title}</h3>
            <p>{i.publication_action}</p>
          </section>
        ))}
        <h2>Corrections</h2>
        <p>
          For a correction, retain the variant, claim, source URL, source date
          and Australian build applicability. A public correction inbox has not
          yet been provided by the owner. No form transmits information.
        </p>
        <Link className="button secondary" href="/sources">
          Browse original sources
        </Link>
      </div>
    </main>
  );
}
