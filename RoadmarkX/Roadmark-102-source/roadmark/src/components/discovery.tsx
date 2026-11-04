"use client";
import { australianEvidenceDate } from "@/lib/evidence-date";
import { buyerDisplayCopy } from "@/lib/buyer-display-copy";

import { EvidenceConditions } from "./evidence-conditions";
import { VisualActionFeedback } from "./visual-action-feedback";
import {
  createActionFeedbackGate,
  shareViewFeedback,
} from "@/lib/action-feedback";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  attributes,
  rankAttribute,
  buildStrengthsIndex,
  filterDiscoveryCars,
  type AttributeKey,
} from "@/lib/discovery";
import { currentBuyerSummary } from "@/lib/selling-points";
import { buyerSummaryNeedsClock } from "@/lib/buyer-summary-timing";
import type { Car, Source } from "@/lib/types";
import { RoadmarkLogo } from "./roadmark-logo";
import { CarAvatar } from "./car-avatar";
import { FootnoteRefs } from "./footnotes";
import { availabilityLabels } from "@/lib/config";
const urlFor = (c: Car) => `/cars/${c.family}/${c.slug}`;
export default function Discovery({
  cars,
  sources,
  embedded = false,
}: {
  cars: Car[];
  sources: Source[];
  embedded?: boolean;
}) {
  const [mode, setMode] = useState<"vehicle" | "attribute">("vehicle");
  const [query, setQuery] = useState("");
  const [vehicleClass, setVehicleClass] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const classes = [
    ...new Set(cars.map((c) => c.vehicleClass || "passenger")),
  ].sort();
  const [limit, setLimit] = useState(12);
  const [attribute, setAttribute] = useState<AttributeKey>("range_km");
  const [selected, setSelected] = useState<string[]>([]);
  const selectedRef = useRef<string[]>([]);
  const [feedback, setFeedback] = useState("");
  const feedbackGate = useRef(createActionFeedbackGate());
  const [visibleFeedback, setVisibleFeedback] = useState<
    | { kind: "share"; message: string }
    | { kind: "selection"; carId: string; message: string }
    | null
  >(null);
  function announceSelection(carId: string, message: string) {
    setFeedback(message);
    setVisibleFeedback({ kind: "selection", carId, message });
  }
  function announceShare(message: string) {
    setFeedback(message);
    setVisibleFeedback({ kind: "share", message });
  }
  const [clockReady, setClockReady] = useState(false);
  const [asOf, setAsOf] = useState("2026-10-10");
  useEffect(() => {
    const gate = feedbackGate.current;
    const restore = () => {
      gate.invalidate();
      const q = new URLSearchParams(location.search);
      setVisibleFeedback(null);
      setFeedback("");
      setMode(q.get("mode") === "attribute" ? "attribute" : "vehicle");
      setQuery(q.get("q") || "");
      const requestedClass = q.get("class") || "";
      setVehicleClass(
        cars.some((c) => (c.vehicleClass || "passenger") === requestedClass)
          ? requestedClass
          : "",
      );
      setStockOnly(q.get("stock") === "new");
      setLimit(12);
      const key = q.get("attribute");
      setAttribute(
        attributes.some((a) => a.key === key)
          ? (key as AttributeKey)
          : "range_km",
      );
      const restoredSelection = [
        ...new Set((q.get("selected") || "").split(",")),
      ]
        .filter((id) => cars.some((c) => c.id === id))
        .slice(0, 3);
      selectedRef.current = restoredSelection;
      setSelected(restoredSelection);
    };
    restore();
    setAsOf(australianEvidenceDate());
    setClockReady(true);
    window.addEventListener("popstate", restore);
    const timer = window.setInterval(
      () => setAsOf(australianEvidenceDate()),
      60000,
    );
    return () => {
      gate.invalidate();
      window.removeEventListener("popstate", restore);
      clearInterval(timer);
    };
  }, [cars]);
  const policy = useMemo(() => ({ asOf, maxAgeDays: 30 }), [asOf]);
  const rankingPolicy = useMemo(
    () => ({ ...policy, asOf: clockReady ? asOf : "" }),
    [policy, clockReady, asOf],
  );
  const rankings = useMemo(
    () => rankAttribute(cars, sources, attribute, rankingPolicy),
    [cars, sources, attribute, rankingPolicy],
  );
  const strengthsIndex = useMemo(
    () => buildStrengthsIndex(cars, sources, rankingPolicy),
    [cars, sources, rankingPolicy],
  );
  const current = attributes.find((a) => a.key === attribute)!;
  const matching = filterDiscoveryCars(
    cars,
    query,
    vehicleClass,
    stockOnly,
    policy,
  );
  function stateUrl(next: {
    mode?: typeof mode;
    q?: string;
    vehicleClass?: string;
    stockOnly?: boolean;
    attribute?: AttributeKey;
    selected?: string[];
  }) {
    feedbackGate.current.invalidate();
    setVisibleFeedback(null);
    const u = new URL(location.href);
    u.searchParams.set("mode", next.mode ?? mode);
    u.searchParams.set("q", next.q ?? query);
    u.searchParams.set("class", next.vehicleClass ?? vehicleClass);
    u.searchParams.set("stock", (next.stockOnly ?? stockOnly) ? "new" : "all");
    u.searchParams.set("attribute", next.attribute ?? attribute);
    u.searchParams.set("selected", (next.selected ?? selected).join(","));
    history.replaceState(history.state, "", u);
  }
  function toggle(id: string) {
    feedbackGate.current.invalidate();
    const previous = selectedRef.current;
    const next = previous.includes(id)
      ? previous.filter((x) => x !== id)
      : previous.length < 3
        ? [...previous, id]
        : previous;
    if (next === previous) {
      announceSelection(
        id,
        "Choose up to three exact trims. Remove one to add another.",
      );
      return;
    }
    selectedRef.current = next;
    setSelected(next);
    stateUrl({ selected: next });
    announceSelection(
      id,
      previous.includes(id)
        ? "Removed from comparison."
        : "Added to comparison.",
    );
  }
  function share() {
    return shareViewFeedback({
      gate: feedbackGate.current,
      href: location.href,
      currentHref: () => location.href,
      writeText: (text) => navigator.clipboard.writeText(text),
      publish: announceShare,
    });
  }
  const Container = embedded ? "section" : "main";
  const Heading = embedded ? "h2" : "h1";
  return (
    <Container
      id={embedded ? "discover" : "main"}
      className="roadmark-discovery"
    >
      <header className="discovery-hero container">
        {!embedded && <RoadmarkLogo />}
        <p className="eyebrow">Find your kind of electric.</p>
        <Heading className="discovery-title">
          Every EV has a reason.
          <br />
          <span>Find yours.</span>
        </Heading>
        <p className="lede">
          Start with a vehicle you like, or the thing you need it to do best.
          Exact trims. Clear trade-offs. Evidence you can follow.
        </p>
        <div className="discovery-starts" aria-label="Choose a starting point">
          <button
            aria-pressed={mode === "vehicle"}
            onClick={() => {
              setMode("vehicle");
              stateUrl({ mode: "vehicle" });
            }}
          >
            01 <strong>Show me a vehicle’s strengths</strong>
            <span>Explore the vehicles →</span>
          </button>
          <button
            aria-pressed={mode === "attribute"}
            onClick={() => {
              setMode("attribute");
              stateUrl({ mode: "attribute" });
            }}
          >
            02 <strong>Find vehicles for an attribute</strong>
            <span>See like-for-like results →</span>
          </button>
        </div>
        <div className="discovery-scope">
          <span className="discovery-dot" />
          Research shortlist ·{" "}
          {new Set(cars.map((c) => c.modelFamily || c.family)).size} families ·{" "}
          {cars.length} exact versions
          <span>
            Market-wide audit in progress. No Australian-market “best” badges
            yet.
          </span>
        </div>
      </header>
      <section
        className="container discovery-content"
        aria-labelledby="discovery-results"
      >
        <div className="discovery-section-head">
          <div>
            <p className="eyebrow">
              {mode === "vehicle"
                ? "Know the version. Know the difference."
                : "A fair comparison starts with the same measure."}
            </p>
            <h2 id="discovery-results">
              {mode === "vehicle"
                ? "What makes it worth a look?"
                : current.title}
            </h2>
          </div>
          <div className="discovery-share">
            <button className="text-button" onClick={share}>
              Share this view ↗
            </button>
            <VisualActionFeedback
              message={
                visibleFeedback?.kind === "share"
                  ? visibleFeedback.message
                  : undefined
              }
            />
          </div>
        </div>
        {mode === "vehicle" ? (
          <>
            <label className="discovery-search">
              Find a model or exact trim
              <input
                type="search"
                value={query}
                placeholder="Try Kia, Model 3 or Long Range"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(12);
                  stateUrl({ q: e.target.value });
                }}
              />
            </label>
            <div className="discovery-filters">
              {classes.length > 1 && (
                <label>
                  Vehicle type
                  <select
                    value={vehicleClass}
                    onChange={(e) => {
                      setVehicleClass(e.target.value);
                      setLimit(12);
                      stateUrl({ vehicleClass: e.target.value });
                    }}
                  >
                    <option value="">All vehicle types</option>
                    {classes.map((value) => (
                      <option key={value} value={value}>
                        {value === "passenger"
                          ? "Passenger vehicles"
                          : value === "motorcycle"
                            ? "Motorcycles & scooters"
                            : value[0].toUpperCase() + value.slice(1)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <label>
                Stock evidence
                <select
                  value={stockOnly ? "new" : "all"}
                  onChange={(e) => {
                    const next = e.target.value === "new";
                    setStockOnly(next);
                    setLimit(12);
                    stateUrl({ stockOnly: next });
                  }}
                >
                  <option value="all">All researched trims</option>
                  <option value="new">Fresh new-stock advertisements</option>
                </select>
              </label>
            </div>
            <p role="status" className="small muted">
              {matching.length} version{" "}
              {matching.length === 1 ? "record" : "records"}. Stock and order
              availability need separate confirmation.
            </p>
            <div className="discovery-cards">
              {matching.slice(0, limit).map((c) => {
                const strengths = strengthsIndex.get(c.id) || [];
                const buyer = currentBuyerSummary(
                  clockReady || !buyerSummaryNeedsClock(c.buyerSummary)
                    ? c.buyerSummary
                    : undefined,
                  sources,
                  policy,
                );
                const best = strengths.find((s) => s.percentile > 0.5);
                const tradeoff = [...strengths]
                  .reverse()
                  .find(
                    (s) =>
                      s.attribute.key !== best?.attribute.key &&
                      s.percentile < 0.5,
                  );
                return (
                  <article className="discovery-car" key={c.id}>
                    <div className="discovery-car-top">
                      <span className="eyebrow">{c.brand}</span>
                      <span className="small muted">
                        {c.year ?? "MY unverified"}
                      </span>
                    </div>
                    <h3>
                      <Link href={urlFor(c)} prefetch={false}>
                        {c.model}
                      </Link>
                    </h3>
                    <p className="discovery-trim">{c.trim}</p>
                    {c.configurationEvidence && (
                      <div className="small muted">
                        <p>
                          Captured configuration · specifications incomplete
                        </p>
                        <p>
                          {buyerDisplayCopy(
                            c.id,
                            "configurationEvidence.projectionScope",
                            c.configurationEvidence.projectionScope,
                          )}
                        </p>
                      </div>
                    )}
                    <CarAvatar car={c} />
                    <p className="discovery-state">
                      {availabilityLabels[c.availability] || c.availability} ·
                      {c.availabilityEvidence?.stockStatus ===
                      "new_stock_listed"
                        ? "New stock advertised"
                        : "Stock not verified"}
                      {c.availabilityEvidence && (
                        <> · Checked {c.availabilityEvidence.checkedAt}</>
                      )}
                      {c.availabilityEvidence?.stockStatus ===
                        "new_stock_listed" && (
                        <FootnoteRefs ids={c.availabilityEvidence.sourceIds} />
                      )}
                    </p>
                    <div className="discovery-strength">
                      <p className="eyebrow">
                        {buyer?.strength
                          ? "Why consider it"
                          : best
                            ? "A relative strength"
                            : "Evidence first"}
                      </p>
                      <h4>
                        {buyer?.strength
                          ? buyer.strength.label
                          : best
                            ? best.attribute.title
                            : "Worth checking in detail"}
                      </h4>
                      <p>
                        {buyer?.strength ? (
                          <>
                            {buyer.strength.text}{" "}
                            <FootnoteRefs ids={buyer.strength.sourceIds} />
                          </>
                        ) : best ? (
                          <>
                            <strong>
                              {Number(best.fact.value).toLocaleString("en-AU")}{" "}
                              {best.fact.unit}
                            </strong>{" "}
                            · {best.tied ? "Joint " : ""}#{best.rank} of{" "}
                            {best.compared} compatible shortlist trims.{" "}
                            <FootnoteRefs ids={best.fact.sourceIds} />
                          </>
                        ) : strengths.length ? (
                          "No clear numerical advantage stands out in the verified shortlist. Explore this exact trim’s figures and trade-offs."
                        ) : (
                          "Comparable evidence is still incomplete. Open the exact-trim record for its verified facts and remaining gaps."
                        )}
                      </p>
                      {buyer?.strength && (
                        <p className="small muted">
                          Evidence {buyer.checkedAt} · Buyer-use interpretation,
                          not a market-leading claim.
                        </p>
                      )}
                      {!buyer?.strength && best && (
                        <p className="small muted">
                          {best.basis} · Evidence {best.fact.date}. A shortlist
                          result, not a market-wide award.
                        </p>
                      )}
                    </div>
                    {(!buyer?.strength || buyer.tradeoff) && (
                      <p className="discovery-tradeoff">
                        <strong>Keep in mind</strong>{" "}
                        {buyer?.tradeoff ? (
                          <>
                            {buyer.tradeoff.text}{" "}
                            <FootnoteRefs ids={buyer.tradeoff.sourceIds} />
                          </>
                        ) : tradeoff ? (
                          <>
                            {tradeoff.attribute.label}:{" "}
                            {Number(tradeoff.fact.value).toLocaleString(
                              "en-AU",
                            )}{" "}
                            {tradeoff.fact.unit};{" "}
                            {tradeoff.tied ? "Joint " : ""}#{tradeoff.rank} of{" "}
                            {tradeoff.compared} comparable trims.{" "}
                            <FootnoteRefs ids={tradeoff.fact.sourceIds} />
                          </>
                        ) : best ? (
                          best.attribute.note
                        ) : (
                          "Availability and the evidence gaps still need checking before a buying decision."
                        )}
                      </p>
                    )}
                    {buyer && (
                      <EvidenceConditions conditions={buyer.conditions} />
                    )}
                    <div className="discovery-card-actions">
                      <Link href={urlFor(c)} prefetch={false}>
                        Exact trim & evidence →
                      </Link>
                      <button
                        aria-pressed={selected.includes(c.id)}
                        onClick={() => toggle(c.id)}
                      >
                        {selected.includes(c.id) ? "Remove" : "Compare +"}
                      </button>
                    </div>
                    <VisualActionFeedback
                      message={
                        visibleFeedback?.kind === "selection" &&
                        visibleFeedback.carId === c.id
                          ? visibleFeedback.message
                          : undefined
                      }
                    />
                  </article>
                );
              })}
            </div>
            {matching.length > limit && (
              <div className="discovery-more">
                <p>
                  Showing {limit} of {matching.length} matching trims. Search
                  checks the whole researched catalogue.
                </p>
                <button className="button" onClick={() => setLimit(limit + 12)}>
                  Show 12 more trims
                </button>
              </div>
            )}
            {!matching.length && (
              <div className="discovery-empty">
                <h3>No matching trims in this shortlist</h3>
                <p>
                  The market audit is still growing. No result here doesn’t mean
                  the car isn’t sold in Australia.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setQuery("");
                    setVehicleClass("");
                    setStockOnly(false);
                    setLimit(12);
                    stateUrl({ q: "", vehicleClass: "", stockOnly: false });
                  }}
                >
                  Clear search and filters
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="discovery-attributes" aria-label="Attributes">
              {attributes.map((a) => (
                <button
                  key={a.key}
                  aria-pressed={attribute === a.key}
                  onClick={() => {
                    setAttribute(a.key);
                    stateUrl({ attribute: a.key });
                  }}
                >
                  {a.title}
                </button>
              ))}
            </div>
            <p className="discovery-rule">
              {current.note} Ranked within matching measurement groups only;
              single-car groups have no winner. Evidence expires after 30 days.
            </p>
            {rankings.groups.map((g) => (
              <section
                className="discovery-ranking"
                key={`${g.vehicleClass}-${g.basis}-${g.unit}`}
              >
                <h3>
                  {g.vehicleClass === "passenger"
                    ? "Passenger vehicles"
                    : g.vehicleClass}{" "}
                  · {g.basis}
                </h3>
                <p className="small muted">
                  {g.entries.length} comparable shortlist trims ·{" "}
                  {g.entries.length < 2
                    ? "No ranking: one eligible trim"
                    : "Equal published values share a rank"}{" "}
                  · Not the whole Australian market
                </p>
                <ol>
                  {g.entries.map((e) => (
                    <li key={e.car.id}>
                      <span className="discovery-rank">
                        {g.entries.length < 2
                          ? "—"
                          : `${e.tied ? "=" : ""}${e.rank}`}
                      </span>
                      <div>
                        <Link href={urlFor(e.car)} prefetch={false}>
                          <strong>
                            {e.car.brand} {e.car.model}
                          </strong>
                        </Link>
                        <span>{e.car.trim}</span>
                        <small>
                          Evidence {e.fact.date}{" "}
                          <FootnoteRefs ids={e.fact.sourceIds} />
                        </small>
                      </div>
                      <strong className="discovery-result-value">
                        {Number(e.fact.value).toLocaleString("en-AU")}{" "}
                        <small>{e.fact.unit}</small>
                      </strong>
                      <button
                        aria-label={`${selected.includes(e.car.id) ? "Remove" : "Compare"} ${e.car.brand} ${e.car.model} ${e.car.trim}`}
                        aria-pressed={selected.includes(e.car.id)}
                        onClick={() => toggle(e.car.id)}
                      >
                        {selected.includes(e.car.id) ? "Remove" : "Compare +"}
                      </button>
                      <VisualActionFeedback
                        message={
                          visibleFeedback?.kind === "selection" &&
                          visibleFeedback.carId === e.car.id
                            ? visibleFeedback.message
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            {!rankings.groups.length && (
              <div className="discovery-empty">
                <h3>No supported ranking yet</h3>
                <p>
                  These records have missing evidence, unresolved qualifications
                  or incompatible measurements. We’d rather explain the gap than
                  invent a winner.
                </p>
              </div>
            )}
            <details className="discovery-exclusions">
              <summary>
                Why {rankings.excluded.length} records aren’t ranked
              </summary>
              <ul>
                {rankings.excluded.map((e) => {
                  const c = cars.find((c) => c.id === e.carId)!;
                  return (
                    <li key={e.carId}>
                      <Link href={urlFor(c)} prefetch={false}>
                        {c.brand} {c.model} {c.trim}
                      </Link>
                      : {e.reason}
                    </li>
                  );
                })}
              </ul>
            </details>
          </>
        )}
      </section>
      <aside
        className={`discovery-compare ${selected.length ? "has-selection" : ""}`}
        aria-label="Your comparison"
      >
        <div className="container">
          <div>
            <strong>{selected.length}/3 selected</strong>
            <details className="discovery-selected-names">
              <summary>View selected trims</summary>
              <p>
                {selected.length
                  ? selected
                      .map((id) => {
                        const c = cars.find((c) => c.id === id)!;
                        return `${c.brand} ${c.model} ${c.trim}`;
                      })
                      .join(" · ")
                  : "Choose the exact trims that matter to you."}
              </p>
            </details>
          </div>
          {selected.length > 0 && (
            <button
              className="discovery-clear"
              type="button"
              onClick={() => {
                selectedRef.current = [];
                setSelected([]);
                stateUrl({ selected: [] });
                setFeedback("Selection cleared.");
              }}
            >
              Clear selection
            </button>
          )}
          {selected.length >= 2 ? (
            <Link
              className="button primary"
              href={`/compare?cars=${selected.join(",")}`}
            >
              Compare selected →
            </Link>
          ) : (
            <span className="small muted">Select at least two</span>
          )}
        </div>
        <p className="sr-only" role="status">
          {feedback}
        </p>
      </aside>
      <div className="container discovery-legacy">
        <Link href="/b">
          Explore the original illustrated Model Y comparison →
        </Link>
        <Link href="/market">Explore the wider market audit →</Link>
        <Link href="/sources">Sources & corrections</Link>
      </div>
    </Container>
  );
}
