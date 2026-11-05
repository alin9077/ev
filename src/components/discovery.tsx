"use client";
import { australianEvidenceDate } from "@/lib/evidence-date";

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
  filterDiscoveryCars,
  type AttributeKey,
} from "@/lib/discovery";
import type { Car, Source } from "@/lib/types";
import { RoadmarkLogo } from "./roadmark-logo";
import { FootnoteRefs } from "./footnotes";
import {
  DEFAULT_VEHICLE_SCOPE,
  matchesVehicleScope,
  readVehicleScope,
  vehicleScopeOptions,
} from "@/lib/vehicle-scope";
import { FreshnessLabel } from "./freshness-label";
import { freshnessWindowDays } from "@/lib/freshness";
import { formatFact } from "@/lib/compare";
import { CatalogueCard } from "./catalogue-card";
import { buyerSummaryNeedsClock } from "@/lib/buyer-summary-timing";
import { cardModel, standingSentences } from "@/lib/catalogue-card";
import { brandCoverage, isOnSale, passengerEvCount } from "@/lib/on-sale";
import brandReviewStatus from "@/lib/generated/brand-review-status.json";
const urlFor = (c: Car) => `/cars/${c.family}/${c.slug}`;
export default function Discovery({
  cars,
  sources,
  embedded = false,
  initialVehicleScope = DEFAULT_VEHICLE_SCOPE,
}: {
  cars: Car[];
  sources: Source[];
  embedded?: boolean;
  initialVehicleScope?: string;
}) {
  const [mode, setMode] = useState<"vehicle" | "attribute">("vehicle");
  const [query, setQuery] = useState("");
  const [vehicleClass, setVehicleClass] = useState<string>(
    readVehicleScope(initialVehicleScope),
  );
  const [stockOnly, setStockOnly] = useState(false);
  const scopeOptions = vehicleScopeOptions(cars);
  const [limit, setLimit] = useState(12);
  const [unrankedLimit, setUnrankedLimit] = useState(12);
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
  // "on_sale" is the default view; "all" adds announced and withdrawn versions.
  const [listing, setListing] = useState<"on_sale" | "all">("on_sale");
  useEffect(() => {
    const gate = feedbackGate.current;
    const restore = () => {
      gate.invalidate();
      const q = new URLSearchParams(location.search);
      setVisibleFeedback(null);
      setFeedback("");
      setMode(q.get("mode") === "attribute" ? "attribute" : "vehicle");
      setQuery(q.get("q") || "");
      setVehicleClass(readVehicleScope(q.get("class")));
      setStockOnly(q.get("stock") === "new");
      setListing(q.get("show") === "all" ? "all" : "on_sale");
      setLimit(12);
      setUnrankedLimit(12);
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
  const policy = useMemo(() => ({ asOf }), [asOf]);
  const rankingPolicy = useMemo(
    () => ({ ...policy, asOf: clockReady ? asOf : "" }),
    [policy, clockReady, asOf],
  );
  const scopedCars = useMemo(
    () => cars.filter((car) => matchesVehicleScope(car, vehicleClass)),
    [cars, vehicleClass],
  );
  const rankings = useMemo(
    () => rankAttribute(scopedCars, sources, attribute, rankingPolicy),
    [scopedCars, sources, attribute, rankingPolicy],
  );
  const current = attributes.find((a) => a.key === attribute)!;
  const matching = filterDiscoveryCars(
    cars,
    query,
    vehicleClass,
    stockOnly,
    policy,
  );
  // Searching looks across every version we hold; browsing lists what is on sale.
  const listed = useMemo(
    () =>
      // Only the default Tier 1 browse is narrowed to what is on sale; an
      // explicit type filter or a search shows everything we hold.
      listing === "all" ||
      query.trim() ||
      vehicleClass !== DEFAULT_VEHICLE_SCOPE
        ? matching
        : matching.filter(isOnSale),
    [matching, listing, query, vehicleClass],
  );
  const standing = useMemo(
    () => standingSentences(cars, sources, policy),
    [cars, sources, policy],
  );
  const headlineCount = useMemo(() => passengerEvCount(cars), [cars]);
  const coverage = useMemo(
    () => brandCoverage(cars, brandReviewStatus),
    [cars],
  );
  function stateUrl(next: {
    mode?: typeof mode;
    q?: string;
    vehicleClass?: string;
    stockOnly?: boolean;
    listing?: "on_sale" | "all";
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
    u.searchParams.set("show", next.listing ?? listing);
    u.searchParams.set("attribute", next.attribute ?? attribute);
    u.searchParams.set("selected", (next.selected ?? selected).join(","));
    const push =
      next.mode !== undefined ||
      next.vehicleClass !== undefined ||
      next.stockOnly !== undefined ||
      next.listing !== undefined ||
      next.attribute !== undefined;
    history[push ? "pushState" : "replaceState"](history.state, "", u);
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
          {headlineCount} passenger EVs on sale in Australia
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
        <div className="discovery-filters">
          <label>
            Vehicle type
            <select
              value={vehicleClass}
              onChange={(e) => {
                setVehicleClass(e.target.value);
                setLimit(12);
                setUnrankedLimit(12);
                stateUrl({ vehicleClass: e.target.value });
              }}
            >
              {scopeOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
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
              <label>
                Show
                <select
                  value={stockOnly ? "new" : listing}
                  onChange={(e) => {
                    const next = e.target.value;
                    const nextListing = next === "all" ? "all" : "on_sale";
                    setListing(nextListing);
                    setStockOnly(next === "new");
                    setLimit(12);
                    stateUrl({
                      listing: nextListing,
                      stockOnly: next === "new",
                    });
                  }}
                >
                  <option value="on_sale">On sale now</option>
                  <option value="new">With a dealer new-stock advert</option>
                  <option value="all">Also announced or withdrawn</option>
                </select>
              </label>
            </div>
            <p role="status" className="small muted">
              {listed.length} {listed.length === 1 ? "car" : "cars"}
              {query.trim() ? " found across every version we hold" : ""}. “On
              sale” means listed by the maker or a dealer, not in stock.
            </p>
            <div className="discovery-cards catalogue-cards">
              {listed.slice(0, limit).map((c) => (
                <CatalogueCard
                  key={c.id}
                  car={c}
                  card={cardModel(
                    clockReady || !buyerSummaryNeedsClock(c.buyerSummary)
                      ? c
                      : { ...c, buyerSummary: undefined },
                    sources,
                    policy,
                    standing,
                  )}
                  selected={selected.includes(c.id)}
                  onToggle={() => toggle(c.id)}
                  feedback={
                    visibleFeedback?.kind === "selection" &&
                    visibleFeedback.carId === c.id
                      ? visibleFeedback.message
                      : undefined
                  }
                />
              ))}
            </div>
            {listed.length > limit && (
              <div className="discovery-more">
                <p>
                  Showing {Math.min(limit, listed.length)} of {listed.length}.
                  Search looks across every version we hold.
                </p>
                <button className="button" onClick={() => setLimit(limit + 12)}>
                  Show 12 more
                </button>
              </div>
            )}
            {!listed.length && (
              <div className="discovery-empty">
                <h3>No cars match</h3>
                <p>
                  The market audit is still growing. No result here doesn’t mean
                  the car isn’t sold in Australia.
                </p>
                <button
                  className="button"
                  onClick={() => {
                    setQuery("");
                    setVehicleClass(DEFAULT_VEHICLE_SCOPE);
                    setStockOnly(false);
                    setListing("on_sale");
                    setLimit(12);
                    stateUrl({
                      q: "",
                      vehicleClass: DEFAULT_VEHICLE_SCOPE,
                      stockOnly: false,
                      listing: "on_sale",
                    });
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
                    setUnrankedLimit(12);
                    stateUrl({ attribute: a.key });
                  }}
                >
                  {a.title}
                </button>
              ))}
            </div>
            <p className="discovery-rule">
              {current.note} Ranked within matching measurement groups only;
              single-car groups have no winner. These figures stay fresh for{" "}
              {freshnessWindowDays(attribute)} days. Availability dates are
              labelled separately. Older figures stay visible, without a rank.
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
                          <FreshnessLabel
                            checkedAt={e.fact.date}
                            factKey={e.fact.key}
                            modelYearChangedAt={e.fact.modelYearChangedAt}
                            asOf={asOf}
                          />{" "}
                          <FootnoteRefs ids={e.fact.sourceIds} />
                        </small>
                        {e.car.availabilityEvidence && (
                          <small>
                            <FreshnessLabel
                              checkedAt={e.car.availabilityEvidence.checkedAt}
                              factKey="availability"
                              asOf={asOf}
                              prefix="Availability checked on"
                            />
                          </small>
                        )}
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
            {rankings.unranked.length > 0 && (
              <section
                className="discovery-ranking discovery-unranked"
                aria-label="Published figures without a rank"
              >
                <h3>Published figures, without a rank</h3>
                <p className="small muted">
                  {rankings.unranked.length} figures shown alphabetically. Their
                  dates, availability or evidence need checking.
                </p>
                <ul>
                  {rankings.unranked.slice(0, unrankedLimit).map((entry) => (
                    <li key={entry.car.id}>
                      <span className="discovery-rank" aria-label="Unranked">
                        —
                      </span>
                      <div>
                        <Link href={urlFor(entry.car)} prefetch={false}>
                          <strong>
                            {entry.car.brand} {entry.car.model}
                          </strong>
                        </Link>
                        <span>{entry.car.trim}</span>
                        <small>
                          <FreshnessLabel
                            checkedAt={entry.fact.date}
                            factKey={entry.fact.key}
                            modelYearChangedAt={entry.fact.modelYearChangedAt}
                            asOf={clockReady ? asOf : ""}
                          />{" "}
                          <FootnoteRefs ids={entry.fact.sourceIds} />
                        </small>
                        {entry.car.availabilityEvidence && (
                          <small>
                            <FreshnessLabel
                              checkedAt={
                                entry.car.availabilityEvidence.checkedAt
                              }
                              factKey="availability"
                              asOf={clockReady ? asOf : ""}
                              prefix="Availability checked on"
                            />
                          </small>
                        )}
                        <small>Unranked · {entry.reason}</small>
                      </div>
                      <strong className="discovery-result-value">
                        {formatFact(entry.fact, asOf)}
                      </strong>
                      <button
                        aria-label={`${selected.includes(entry.car.id) ? "Remove" : "Compare"} ${entry.car.brand} ${entry.car.model} ${entry.car.trim}`}
                        aria-pressed={selected.includes(entry.car.id)}
                        onClick={() => toggle(entry.car.id)}
                      >
                        {selected.includes(entry.car.id)
                          ? "Remove"
                          : "Compare +"}
                      </button>
                      <VisualActionFeedback
                        message={
                          visibleFeedback?.kind === "selection" &&
                          visibleFeedback.carId === entry.car.id
                            ? visibleFeedback.message
                            : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
                {rankings.unranked.length > unrankedLimit && (
                  <button
                    className="button"
                    onClick={() => setUnrankedLimit(unrankedLimit + 12)}
                  >
                    Show 12 more unranked figures
                  </button>
                )}
              </section>
            )}
            {!rankings.groups.length && !rankings.unranked.length && (
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
      <p className="container discovery-coverage">
        Coverage: {coverage.fullyReviewed} brands fully reviewed,{" "}
        {coverage.partly} partly; see{" "}
        <Link href="/methodology">methodology</Link>.
      </p>
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
