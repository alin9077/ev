"use client";
import { ModelYVerdict } from "./model-y-verdict";
import Link from "next/link";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Fact, Pack, Research } from "@/lib/types";
import { availabilityLabels, priorities } from "@/lib/config";
import { fleetSelection } from "@/lib/fleet";
import { compareFacts } from "@/lib/compare";
import {
  chapters,
  orderChapters,
  drivingLabels,
  rowNotes,
  summaryRows,
  type Chapter,
} from "@/lib/chapters";
import { FootnoteRefs } from "./footnotes";
import { FactValue, FeatureValue, Notice, SoftwareTimeline } from "./ui";
import { SwipeProvider, SwipeTrack, useSwipe } from "./fleet-swipe";
import { ComparisonSymbol } from "./comparison-symbol";
import { ChapterArt } from "./chapter-art";
import { CarAvatar } from "./car-avatar";

type Selection = ReturnType<typeof fleetSelection>;
export default function FleetExperience({
  allPacks,
  initial,
  criteria,
  version,
  afterHero,
  totalCatalogueCount = allPacks.length,
}: {
  allPacks: Pack[];
  initial: Selection;
  criteria: Research["criteria"];
  /** The B site: the same comparison in the second look, with its own scenes. */
  version?: "b";
  afterHero?: React.ReactNode;
  totalCatalogueCount?: number;
}) {
  const [selected, setSelected] = useState(initial);
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      setSelected(
        fleetSelection(
          allPacks.map((p) => p.car),
          new URLSearchParams(location.search),
        ),
      );
      setRestored(true);
    });
  }, [allPacks]);
  const find = (id: string) => allPacks.find((p) => p.car.id === id)!;
  const baseline = find(selected.baseline),
    alternatives = selected.ids.map(find);
  const ordered = orderChapters(selected.priority);
  // Phones show one rival, so rows change height with it; hold the reader's place.
  const anchor = useRef<{ el: Element; top: number } | null>(null);
  const changeIndex = useCallback((index: number) => {
    if (matchMedia("(max-width: 767px)").matches) {
      const bar =
        document.querySelector(".fleet-controls")?.getBoundingClientRect()
          .bottom ?? 0;
      const el = [...document.querySelectorAll(".fleet-detail")].find(
        (d) => d.getBoundingClientRect().bottom > bar,
      );
      anchor.current = el ? { el, top: el.getBoundingClientRect().top } : null;
    }
    setSelected((s) => (s.index === index ? s : { ...s, index }));
  }, []);
  useLayoutEffect(() => {
    const held = anchor.current;
    anchor.current = null;
    if (held)
      scrollBy({
        top: held.el.getBoundingClientRect().top - held.top,
        behavior: "instant",
      });
  }, [selected.index]);
  useEffect(() => {
    if (!restored) return;
    const url = new URL(location.href);
    url.searchParams.set("baseline", selected.baseline);
    url.searchParams.set("fleet", selected.ids.join(","));
    url.searchParams.set(
      "focus",
      allPacks.find((p) => p.car.id === selected.ids[selected.index])!.car
        .family,
    );
    if (selected.priority) url.searchParams.set("priority", selected.priority);
    else url.searchParams.delete("priority");
    history.replaceState(history.state, "", url);
  }, [selected, allPacks, restored]);
  useEffect(() => {
    const restore = () =>
      setSelected(
        fleetSelection(
          allPacks.map((p) => p.car),
          new URLSearchParams(location.search),
        ),
      );
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [allPacks]);
  function trim(id: string, index?: number) {
    setSelected((s) =>
      index === undefined
        ? { ...s, baseline: id }
        : { ...s, ids: s.ids.map((old, i) => (i === index ? id : old)) },
    );
  }
  const overview = (
    <DetailSection
      id="price_aud"
      label="Listed price"
      className="fleet-detail fleet-overview-row"
    >
      <div className="fleet-row fleet-hero-row">
        <article className="baseline-card fleet-vehicle-card">
          <div className="fleet-vehicle-index">
            <span className="baseline-badge">Fixed baseline</span>
            <span aria-hidden="true">Y</span>
          </div>
          <VehicleHeading pack={baseline} />
          <label className="fleet-trim">
            Tesla baseline
            <select
              value={baseline.car.id}
              onChange={(e) => trim(e.target.value)}
            >
              {allPacks
                .filter((p) => p.car.modelId === "tesla_model_y")
                .map((p) => (
                  <option key={p.car.id} value={p.car.id}>
                    {p.car.trim}
                  </option>
                ))}
            </select>
          </label>
          <div className="fleet-overview-summary">
            <FactValue fact={baseline.car.facts.price_aud} />
          </div>
        </article>
        <SwipeTrack label="EV family cards">
          {alternatives.map((p, i) => (
            <article key={p.car.id} className="fleet-vehicle-card">
              <div className="fleet-vehicle-index">
                <span>Alternative</span>
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <VehicleHeading pack={p} />
              <label className="fleet-trim">
                {p.car.brand} {p.car.model} trim
                <select
                  value={p.car.id}
                  onChange={(e) => trim(e.target.value, i)}
                >
                  {allPacks
                    .filter((c) => c.car.family === p.car.family)
                    .map((c) => (
                      <option key={c.car.id} value={c.car.id}>
                        {c.car.trim}
                        {c.car.availability === "current_or_order_listed"
                          ? ""
                          : ` · ${availabilityLabels[c.car.availability]}`}
                      </option>
                    ))}
                </select>
              </label>
              <div className="fleet-overview-summary">
                <FactValue fact={p.car.facts.price_aud} />
                <FactDelta
                  fact={p.car.facts.price_aud}
                  against={baseline.car.facts.price_aud}
                />
              </div>
            </article>
          ))}
        </SwipeTrack>
      </div>
      <div className="fleet-research-note">
        <p className="small muted">
          Starts with the lowest listed current trim in each alternative family.
          The catalogue covers nine of Australia’s ten best-selling EVs for
          January–September 2026, plus the BYD Atto 3. The tenth-ranked Atto 1
          is covered in discovery, outside this original ten-family comparison.
          <FootnoteRefs ids={["r5_au_ev_sales_sep2026"]} />
          <span className="fleet-swipe-hint">
            Swiping any row moves every chapter together.
          </span>
        </p>
        <Notice>
          Prices are dated Australian list or base figures, not driveaway
          quotes. Check delivery fees, options and state on-road costs.
        </Notice>
      </div>
    </DetailSection>
  );
  function renderChapter(ch: Chapter) {
    return (
      <section
        key={ch.n}
        id={`chapter-${ch.n}`}
        tabIndex={-1}
        className={`inline-chapter fleet-chapter${ch.n === "01" ? " fleet-lead-chapter" : ""}`}
        data-chapter={ch.n}
        aria-labelledby={`chapter-title-${ch.n}`}
      >
        <div className="container">
          <div className="chapter-opening chapter-opening-art">
            <header className="inline-chapter-heading">
              <span className="chapter-number" aria-hidden="true">
                {String.fromCharCode(64 + Number(ch.n))}
              </span>
              <div>
                <span className="chapter-kicker">
                  Chapter {ch.n} / {String(chapters.length).padStart(2, "0")}
                </span>
                <h2 id={`chapter-title-${ch.n}`}>{ch.title}</h2>
                <p>{ch.copy}</p>
                {ch.category === "Automated driving" && (
                  <p className="driving-supervision">
                    Tesla FSD requires active driver supervision.
                    <FootnoteRefs ids={["r3_tesla_fsd"]} />
                  </p>
                )}
              </div>
              <ComparisonSymbol chapter={ch.n} />
              <a href="#main" className="text-link back-to-top">
                Back to top ↑
              </a>
            </header>
            <ChapterArt
              chapter={ch.n}
              eager={ch.n === "01"}
              baseline={baseline}
              rival={alternatives[selected.index] ?? alternatives[0]}
              version={version}
            />
          </div>
          {ch.n === "01" && overview}
          {[...ch.facts, ...ch.features]
            .filter((key) => key !== "price_aud" && !summaryRows.includes(key))
            .map((key) => {
              const label =
                drivingLabels[key] ||
                baseline.car.facts[key]?.label ||
                criteria.find((c) => c.key === key)?.label ||
                key;
              return (
                <DetailSection key={key} id={key} label={label}>
                  {rowNotes[key] && (
                    <p className="fleet-row-note small muted">
                      {rowNotes[key]}
                    </p>
                  )}
                  <div className="fleet-row">
                    <DetailCard pack={baseline} criterion={key} baseline />
                    <SwipeTrack label={`${label}: alternatives`}>
                      {alternatives.map((p) => (
                        <DetailCard
                          key={p.car.id}
                          pack={p}
                          criterion={key}
                          against={baseline.car.facts[key]}
                        />
                      ))}
                    </SwipeTrack>
                  </div>
                </DetailSection>
              );
            })}
          {ch.category === "Software" && (
            <section
              className="inline-history"
              aria-label="Software update history"
            >
              <h3>Update history</h3>
              <div className="fleet-row">
                <div className="baseline-card">
                  <SoftwareTimeline pack={baseline} />
                </div>
                <SwipeTrack label="Software update history: alternatives">
                  {alternatives.map((p) => (
                    <div key={p.car.id} className="fleet-history-card">
                      <SoftwareTimeline pack={p} />
                    </div>
                  ))}
                </SwipeTrack>
              </div>
            </section>
          )}
        </div>
      </section>
    );
  }
  return (
    <SwipeProvider
      count={alternatives.length}
      initialIndex={selected.index}
      onChange={changeIndex}
    >
      <main id="main" className="fleet-page" data-version={version}>
        <header className="fleet-intro">
          <div className="container">
            <ModelYVerdict />
            <div className="fleet-intro-footer">
              <p>
                Nine of Australia’s top ten EVs by sales · Jan–Sep 2026.
                <FootnoteRefs ids={["r5_au_ev_sales_sep2026"]} />
              </p>
              <span>
                10 families <i /> 34 variants <i />{" "}
                <a href="#chapters">All {chapters.length} chapters ↓</a>
              </span>
            </div>
          </div>
        </header>
        {afterHero}
        <FleetControls
          baseline={baseline}
          alternatives={alternatives}
          chapters={ordered}
        />
        {renderChapter(ordered[0])}
        <section id="chapters" className="container fleet-priorities">
          <div className="fleet-section-heading">
            <h2>The full picture.</h2>
            <p>Price, automated driving and everyday ownership.</p>
          </div>
          <div className="fleet-priority-bar">
            <span>Prioritise the remaining topics</span>
            <div className="chips">
              {priorities
                .filter((p) => p !== "Price")
                .map((p) => (
                  <button
                    key={p}
                    aria-pressed={selected.priority === p}
                    onClick={() =>
                      setSelected((s) => ({
                        ...s,
                        priority: s.priority === p ? "" : p,
                      }))
                    }
                  >
                    {p}
                  </button>
                ))}
            </div>
          </div>
          <nav className="comparison-chapters" aria-label="Comparison chapters">
            {ordered.map((ch) => (
              <a
                key={ch.n}
                className="chapter-wayfinding"
                data-chapter={ch.n}
                href={`#chapter-${ch.n}`}
              >
                <span className="chapter-wayfinding-sign" aria-hidden="true">
                  <span>{String.fromCharCode(64 + Number(ch.n))}</span>
                  <ComparisonSymbol chapter={ch.n} />
                </span>
                <span className="chapter-wayfinding-title">
                  {ch.title}
                  <span aria-hidden="true">↓</span>
                </span>
              </a>
            ))}
          </nav>
        </section>
        <div className="fleet-chapters">
          {ordered.slice(1).map(renderChapter)}
        </div>
        <section className="container fleet-end">
          <h2>Find your next EV.</h2>
          <Link className="button secondary" href="/cars">
            Explore all {totalCatalogueCount} variants
          </Link>
          <Link className="text-link" href="/methodology">
            How this guide is researched
          </Link>
        </section>
      </main>
    </SwipeProvider>
  );
}
/** One comparison row. On phones its conditions and sources open on tap. */
function DetailSection({
  id,
  label,
  className = "fleet-detail",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section
      className={open ? `${className} is-open` : className}
      aria-labelledby={`detail-${id}`}
    >
      <h3 id={`detail-${id}`} tabIndex={-1}>
        {label}
      </h3>
      <button
        type="button"
        className="fleet-row-toggle"
        aria-expanded={open}
        aria-label={`Details: ${label}`}
        onClick={() => setOpen(!open)}
      >
        {open ? "Hide" : "Details"}
      </button>
      {children}
    </section>
  );
}
/** Shown only where both figures share a unit and basis and neither is conditional. */
function FactDelta({ fact, against }: { fact: Fact; against: Fact }) {
  const { delta } = compareFacts(against, fact);
  if (!delta) return null;
  const size = Number(Math.abs(delta).toFixed(2)).toLocaleString("en-AU");
  return (
    <span className="fact-delta">
      {fact.unit === "AUD"
        ? `A$${size} ${delta < 0 ? "less" : "more"}`
        : `${delta < 0 ? "−" : "+"}${size}${fact.unit ? ` ${fact.unit}` : ""}`}
      <span className="sr-only"> compared with Model Y</span>
    </span>
  );
}
function VehicleHeading({ pack }: { pack: Pack }) {
  return (
    <div className="fleet-vehicle-heading">
      <span className="small">{pack.car.brand}</span>
      <h2>{pack.car.model}</h2>
      <p>{pack.car.trim}</p>
      <span className="small muted">
        {pack.car.year ?? "MY unverified"} · {pack.car.drive}
      </span>
    </div>
  );
}
const DetailCard = memo(function DetailCard({
  pack,
  criterion,
  baseline = false,
  against,
}: {
  pack: Pack;
  criterion: string;
  baseline?: boolean;
  against?: Fact;
}) {
  return (
    <article
      className={
        baseline ? "baseline-card fleet-detail-card" : "fleet-detail-card"
      }
      data-vehicle={pack.car.id}
    >
      {/* The sticky bar names each column; this stays for print and readers. */}
      <p className="fleet-card-identity">
        {baseline && <span className="baseline-badge">Baseline</span>}
        <strong>
          {pack.car.brand} {pack.car.model}
        </strong>
        <span>{pack.car.trim}</span>
      </p>
      {pack.car.facts[criterion] ? (
        <>
          <FactValue fact={pack.car.facts[criterion]} />
          {against && (
            <FactDelta fact={pack.car.facts[criterion]} against={against} />
          )}
        </>
      ) : (
        <FeatureValue
          feature={pack.features.find((f) => f.criterion === criterion)!}
        />
      )}
    </article>
  );
});
function FleetControls({
  baseline,
  alternatives,
  chapters: ordered,
}: {
  baseline: Pack;
  alternatives: Pack[];
  chapters: Chapter[];
}) {
  const { index, move, count } = useSwipe();
  const active = alternatives[index];
  return (
    <div className="fleet-controls">
      <ChapterNav chapters={ordered} />
      <div className="container fleet-controls-inner">
        <div className="fleet-anchor-label fleet-identity">
          <CarAvatar car={baseline.car} />
          <strong>Tesla {baseline.car.model}</strong>
          <span className="small">{baseline.car.trim}</span>
        </div>
        <span className="baseline-badge fleet-anchor-badge">
          Fixed baseline
        </span>
        <SwipeTrack label="EV names">
          {alternatives.map((p) => (
            <div key={p.car.id} className="fleet-identity">
              <CarAvatar car={p.car} />
              <strong>
                {p.car.brand} {p.car.model}
              </strong>
              <span className="small">{p.car.trim}</span>
            </div>
          ))}
        </SwipeTrack>
        <div className="fleet-browse-controls">
          <label className="fleet-jump">
            <span className="sr-only">Jump to EV</span>
            <select
              value={index}
              onChange={(e) => move(Number(e.target.value))}
            >
              {alternatives.map((p, i) => (
                <option key={p.car.family} value={i}>
                  {i + 1}. {p.car.brand} {p.car.model}
                </option>
              ))}
            </select>
          </label>
          <div className="fleet-arrows">
            <button
              className="icon-button"
              aria-label="Previous EV"
              disabled={index === 0}
              onClick={() => move(index - 1)}
            >
              ←
            </button>
            <span className="fleet-position">
              {index + 1} / {count}
            </span>
            <button
              className="icon-button"
              aria-label="Next EV"
              disabled={index === count - 1}
              onClick={() => move(index + 1)}
            >
              →
            </button>
          </div>
          <Link
            className="text-link fleet-focused-link"
            href={`/compare?cars=${baseline.car.id},${active.car.id}`}
          >
            Compare these cars
          </Link>
          <span className="sr-only" role="status" aria-live="polite">
            {active.car.brand} {active.car.model}, alternative {index + 1} of{" "}
            {count}. Tesla remains the baseline.
          </span>
        </div>
      </div>
    </div>
  );
}
/** Stays with the sticky bar: step through the chapters or jump to one. */
function ChapterNav({ chapters: ordered }: { chapters: Chapter[] }) {
  const [current, setCurrent] = useState("");
  // While a jump is under way its target is the chapter shown, so repeated steps add up.
  const [jump, setJump] = useState("");
  const pending = useRef<(() => void) | undefined>(undefined);
  // The target of a jump that has landed and is waiting for the position to be read.
  const landed = useRef("");
  const refresh = useRef(() => {});
  useEffect(() => {
    let frame = 0;
    const root = document.documentElement;
    const update = () => {
      frame = 0;
      const bar = document.querySelector<HTMLElement>(".fleet-controls");
      if (!bar) return;
      // Anchors land below the bar whatever its height at this width.
      root.style.setProperty("--fleet-bar", `${bar.offsetHeight}px`);
      // A chapter is current once its heading is in the top third below the bar.
      const top = Math.max(bar.getBoundingClientRect().bottom, 0);
      const edge = top + (innerHeight - top) * 0.35;
      let active = "";
      for (const el of document.querySelectorAll<HTMLElement>(".fleet-chapter"))
        if (el.getBoundingClientRect().top <= edge)
          active = el.dataset.chapter || "";
      setCurrent(active);
      // Hand over from the jump target only once the position agrees with it.
      if (landed.current && landed.current === active) {
        landed.current = "";
        setJump("");
      }
    };
    const queue = () => {
      frame ||= requestAnimationFrame(update);
    };
    refresh.current = queue;
    update();
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    // Rows that load late move the chapters without a scroll event.
    const layout = new ResizeObserver(queue);
    layout.observe(document.body);
    return () => {
      removeEventListener("scroll", queue);
      removeEventListener("resize", queue);
      layout.disconnect();
      cancelAnimationFrame(frame);
      root.style.removeProperty("--fleet-bar");
      pending.current?.();
    };
  }, [ordered]);
  // Jumps are instant: rows above load as they come into view, and a smooth scroll
  // across them stops short. The chapter is held in place while that settles.
  const hold = (n: string) => {
    pending.current?.();
    landed.current = "";
    setJump(n);
    const target = document.getElementById(`chapter-${n}`);
    let quiet: ReturnType<typeof setTimeout>;
    // Put it back each time the page grows, until it has been still for a moment.
    const layout = new ResizeObserver(() => {
      target?.scrollIntoView({ block: "start", behavior: "instant" });
      clearTimeout(quiet);
      quiet = setTimeout(release, 500);
    });
    layout.observe(document.body);
    const inputs = ["wheel", "touchstart", "pointerdown", "keydown"];
    const stop = () => {
      clearTimeout(quiet);
      clearTimeout(limit);
      layout.disconnect();
      for (const type of inputs) removeEventListener(type, interrupted);
      pending.current = undefined;
    };
    // The reader took over; a press inside the navigator is the next step instead.
    const interrupted = (event: Event) => {
      if (
        event.target instanceof Element &&
        event.target.closest(".fleet-chapter-nav")
      )
        return;
      stop();
      setJump("");
    };
    const release = () => {
      stop();
      landed.current = n;
      refresh.current();
      // If the position never agrees, stop holding the target.
      setTimeout(() => {
        if (landed.current !== n) return;
        landed.current = "";
        setJump((held) => (held === n ? "" : held));
      }, 800);
    };
    const limit = setTimeout(release, 4000);
    for (const type of inputs)
      addEventListener(type, interrupted, { passive: true });
    pending.current = stop;
  };
  // Not left to the link: a native fragment jump fires popstate, which re-reads the
  // whole selection and lets a slow history update undo the next step.
  const go = (event: React.MouseEvent, n: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    history.replaceState(history.state, "", `#chapter-${n}`);
    hold(n);
  };
  const shown = jump || current;
  const at = ordered.findIndex((ch) => ch.n === shown);
  const step = (to: Chapter | undefined, label: string, glyph: string) =>
    to ? (
      <a
        className="fleet-chapter-step"
        href={`#chapter-${to.n}`}
        aria-label={`${label}: ${to.title}`}
        onClick={(event) => go(event, to.n)}
      >
        {glyph}
      </a>
    ) : (
      <span className="fleet-chapter-step" aria-hidden="true">
        {glyph}
      </span>
    );
  return (
    <nav className="fleet-chapter-nav" aria-label="Jump to chapter">
      <div className="container fleet-chapter-nav-inner">
        <span className="fleet-chapter-label" aria-hidden="true">
          Chapters
        </span>
        {step(at > 0 ? ordered[at - 1] : undefined, "Previous chapter", "‹")}
        {ordered.map((ch) => (
          <a
            key={ch.n}
            className="fleet-chapter-chip"
            data-chapter={ch.n}
            href={`#chapter-${ch.n}`}
            aria-current={ch.n === shown ? "true" : undefined}
            aria-label={`Chapter ${String.fromCharCode(64 + Number(ch.n))}: ${ch.title}`}
            title={ch.title}
            onClick={(event) => go(event, ch.n)}
          >
            {String.fromCharCode(64 + Number(ch.n))}
          </a>
        ))}
        {step(ordered[at + 1], "Next chapter", "›")}
        {/* Named beside the row so the letters never shift under the pointer. */}
        <span className="fleet-chapter-title" aria-hidden="true">
          {ordered[at]?.title}
        </span>
      </div>
    </nav>
  );
}
