import Link from "next/link";
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
          10 remained inaccessible. The source audit records corrections and
          access failures. Unsupported claims are withheld. This was a targeted
          audit, not a new check of every specification.{" "}
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
          verification dates. Prices are base/list or reported figures, not
          postcode-specific driveaway quotes; fees, options and on-road costs
          can differ.
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
        <h2>Status labels</h2>
        <p>
          <strong>Standard</strong> means the supplied record supports
          availability with its stated scope. <strong>Conditional</strong> means
          build, option, software or conflicting evidence matters.{" "}
          <strong>Optional</strong> may require an extra purchase.{" "}
          <strong>Needs confirmation</strong> is unknown, not a “no”.{" "}
          <strong>Subjective</strong> is an impression without matched testing.
          Unavailable and not applicable remain separate.
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
