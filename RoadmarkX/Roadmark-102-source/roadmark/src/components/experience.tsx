"use client";
import { issueReaderText } from "@/lib/issue-presentation";
import { sourcePresentation } from "@/lib/source-presentation";
import { matchesSearch } from "@/lib/search";
import { comparisonOverviewKeys } from "@/lib/citable";
import { busComparisonContext, boundedComparisonContext } from "@/lib/comparison-context";
import { SelectedCopy } from "./selected-copy";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { comparisonFocusOutcome, type ComparisonFocusRequest } from "@/lib/comparison-focus";
import type { Car, Pack, Research, Selection } from "@/lib/types";
import type { ComparisonPickerCar } from "@/lib/picker-car";
import {
  formatFact,
  selectionUrl,
  factsDiffer,
  featuresDiffer,
  compareFacts,
  comparisonFactLabel,
} from "@/lib/compare";
import { priorities, site, availabilityLabels } from "@/lib/config";
import {
  FactValue,
  Notice,
  MediaRenderer,
  ShareButton,
  SoftwareTimeline,
  FeatureValue,
  VehicleCard,
} from "./ui";
import { VariantPicker } from "./picker";
import { orderChapters, type Chapter } from "@/lib/chapters";
import { FootnoteRefs } from "./footnotes";

type SharedProps = {
  packs: Pack[];
  state: Selection;
  criteria: Research["criteria"];
  counts: {
    families: number;
    variants: number;
    criteria: number;
    evidence: number;
    current: number;
    outgoing: number;
    provisional: number;
  };
  onLocalChange?: (state: Selection, url: string) => void;
};
type Props = SharedProps &
  (
    | { mode: "home"; cars: Car[] }
    | { mode: "compare"; cars: (Car | ComparisonPickerCar)[] }
  );

export default function Experience({
  cars,
  packs,
  state: serverState,
  criteria,
  counts,
  mode,
  onLocalChange,
}: Props) {
  const [state, updateOptimistic] = useOptimistic(
    serverState,
    (current: Selection, patch: Partial<Selection>) => ({
      ...current,
      ...patch,
    }),
  );
  const router = useRouter(),
    pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const comparisonSelectors = useRef<HTMLDivElement>(null);
  const requestedSelectorFocus = useRef<ComparisonFocusRequest | null>(null);
  useEffect(() => {
    const request = requestedSelectorFocus.current;
    if (!request) return;
    const outcome = comparisonFocusOutcome(request, {
      pending, mode, committedIds: serverState.ids, selectedIds: state.ids,
      packIds: packs.map((pack) => pack.car.id), active: state.active,
      canRestoreFocus: !document.activeElement || document.activeElement === document.body,
    });
    if (outcome === "wait") return;
    requestedSelectorFocus.current = null;
    if (outcome === "focus") {
      comparisonSelectors.current
        ?.querySelectorAll<HTMLButtonElement>(".picker-trigger")[2]?.focus();
    }
  }, [pending, mode, serverState.ids, state.ids, state.active, packs]);
  const [saveMessage, setSaveMessage] = useState("");
  const [trayVisible, setTrayVisible] = useState(false);
  useEffect(() => {
    const update = () => setTrayVisible(window.scrollY > 540);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  function change(patch: Partial<Selection>, path = pathname, focusThirdControl = false) {
    const next = { ...state, ...patch };
    // Newer navigation or selection intent cancels an earlier focus request.
    requestedSelectorFocus.current = focusThirdControl
      ? { ids: [...next.ids], active: next.active }
      : null;
    startTransition(() => {
      updateOptimistic(patch);
      if (onLocalChange) {
        onLocalChange(
          { ...state, ...patch },
          selectionUrl({ ...state, ...patch }, path),
        );
        return;
      }
      router.push(selectionUrl({ ...state, ...patch }, path), {
        scroll: false,
      });
    });
  }
  function select(id: string, index: number) {
    const ids = [...state.ids];
    ids[index] = id;
    change({ ids, active: index > 0 ? id : state.active });
  }
  const activePack = packs.find((p) => p.car.id === state.active) || packs[1];
  const pair = [packs[0], activePack];
  function showFact(_pack: Pack, key: string) {
    const target = document.getElementById(`detail-${key}`);
    target?.scrollIntoView({ behavior: "instant", block: "start" });
    target?.focus({ preventScroll: true });
  }
  const comparedRange = compareFacts(
    pair[0].car.facts.range_km,
    pair[1].car.facts.range_km,
  );
  const orderedChapters = orderChapters(state.priority);
  const categories = [
    "All categories",
    ...new Set(criteria.map((c) => c.group)),
  ];
  const filteredCriteria = criteria.filter(
    (c) =>
      (state.category === "All categories" || c.group === state.category) &&
      matchesSearch(
        `${c.label} ${c.definition} ${packs
          .flatMap((p) => {
            const f = p.features.find((f) => f.criterion === c.key);
            return f
              ? [
                  f.value,
                  f.status,
                  f.conditions,
                  f.condition_label || "",
                  ...(f.usability_notes || []),
                  f.confirmation_needed || "",
                ]
              : [];
          })
          .join(" ")}`,
        state.q,
      ) &&
      (!state.diff ||
        featuresDiffer(
          packs.map((p) => p.features.find((f) => f.criterion === c.key)!),
        )),
  );
  function save() {
    try {
      localStorage.setItem("ev-shortlist", JSON.stringify(state.ids));
      setSaveMessage("Saved on this device.");
    } catch {
      setSaveMessage(
        "Device storage is unavailable. Use the comparison link instead.",
      );
    }
  }
  return (
    <>
      <main
        id="main"
        aria-busy={pending}
        className={mode === "compare" ? "workbench" : "home"}
      >
        {mode === "home" ? (
          <section className="hero container">
            <div className="hero-intro">
              <p className="eyebrow">An independent Australian EV guide</p>
              <h1>
                Model Y.
                <br />
                <span>Meet your alternatives.</span>
              </h1>
              <p className="hero-description">
                Different cars. Different strengths.
                <br className="desktop-break" /> Find the differences that
                matter to you.
              </p>
            </div>
            <div className="hero-controls">
              <VariantPicker
                cars={cars}
                selected={state.ids[0]}
                exclude={state.ids.slice(1)}
                baseline
                label="Your Model Y"
                onSelect={(id) => select(id, 0)}
              />
              <span className="versus" aria-hidden="true">
                vs
              </span>
              <VariantPicker
                cars={cars}
                selected={state.ids[1]}
                exclude={[state.ids[0]]}
                label="Your challenger"
                onSelect={(id) => select(id, 1)}
              />
              <Link className="button primary" href={selectionUrl(state)}>
                Compare these cars
              </Link>
            </div>
            <div className="hero-stage">
              {pair.map((p, i) => (
                <div className={`stage-car stage-${i}`} key={p.car.id}>
                  <div className="stage-label">
                    <span className="eyebrow">
                      {i === 0
                        ? "Your starting point"
                        : "A researched alternative"}
                    </span>
                    <span className="small">
                      {p.car.year ?? "MY unverified"} · {p.car.drive}
                    </span>
                  </div>
                  <div className="stage-identity">
                    <div>
                      <span className="stage-brand">{p.car.brand}</span>
                      <h2>{p.car.model}</h2>
                      <p>{p.car.trim}</p>
                    </div>
                    <MediaRenderer car={p.car} placement="hero" />
                  </div>
                  <div className="stage-stats">
                    {[
                      "price_aud",
                      "range_km",
                      "seats",
                      "dc_charge_time_min",
                    ].map((key) => (
                      <div key={key}>
                        <span className="small">{p.car.facts[key].label}</span>
                        <button
                          className="stat-button"
                          onClickCapture={(e) => e.currentTarget.focus()}
                          onClick={() => showFact(p, key)}
                        >
                          {formatFact(p.car.facts[key])}
                        </button>
                        <FootnoteRefs ids={p.car.facts[key].sourceIds} />
                        <span className="small muted">
                          {key === "price_aud"
                            ? "Dated base/list · not driveaway"
                            : key === "range_km"
                              ? p.car.facts[key].basis
                              : key === "seats"
                                ? "Occupied positions"
                                : p.car.facts[key].value === null
                                  ? "Comparable window not supplied"
                                  : p.car.facts[key].basis}
                        </span>
                        {p.car.facts[key].status === "conditional" && (
                          <span className="small">Needs confirmation</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="hero-footnote">
              <span>
                Original seating schematics · not to scale or child-seat
                guidance
              </span>
              <Link href="/model-y">Explore all four Model Y variants</Link>
            </div>
            <Notice />
          </section>
        ) : (
          <section className="container compare-intro">
            <p className="eyebrow">The differences, with the details</p>
            <div className="title-row">
              <h1>Side by side.</h1>
              <ShareButton />
              <SelectedCopy packs={pair} />
            </div>
            <p>Exact variants. Australian evidence. Your priorities.</p>
            <Notice />
          </section>
        )}
        {state.warning && (
          <div className="container">
            <p role="status" className="notice">
              {state.warning}
            </p>
          </div>
        )}
        {mode === "compare" && (
          <div className="container">
            <div className="compare-selectors" ref={comparisonSelectors}>
              {packs.map((p, i) => (
                <div
                  key={i}
                  className={
                    i > 0 && p.car.id !== state.active ? "inactive-mobile" : ""
                  }
                >
                  <VariantPicker
                    cars={cars}
                    selected={p.car.id}
                    exclude={state.ids.filter((_, j) => i !== j)}
                    label={i === 0 ? "First vehicle" : `Vehicle ${i + 1}`}
                    onSelect={(id) => select(id, i)}
                  />
                  {i === 2 && (
                    <button
                      onClickCapture={(event) => event.currentTarget.focus()}
                      className="text-button"
                      onClick={() =>
                        change({
                          ids: state.ids.slice(0, 2),
                          active: state.ids[1],
                        }, pathname, true)
                      }
                    >
                      Remove third vehicle
                    </button>
                  )}
                </div>
              ))}
              {packs.length < 3 && (
                <VariantPicker
                  cars={cars}
                  exclude={state.ids}
                  label="Add a third vehicle"
                  onSelect={(id) =>
                    change({ ids: [...state.ids, id], active: id }, pathname, true)
                  }
                />
              )}
            </div>
            {packs.length === 3 && (
              <div className="mobile-challengers">
                <span className="small">
                  Active challenger · both saved in your link
                </span>
                {packs.slice(1).map((p) => (
                  <button
                    key={p.car.id}
                    aria-pressed={state.active === p.car.id}
                    onClick={() => change({ active: p.car.id })}
                  >
                    {p.car.brand} {p.car.model} · {p.car.trim}
                  </button>
                ))}
              </div>
            )}
            <div className="comparison-toolbar">
              <div className="segmented" aria-label="Comparison section">
                {(["overview", "features", "software"] as const).map((t) => (
                  <button
                    key={t}
                    aria-pressed={state.section === t}
                    onClick={() => change({ section: t })}
                  >
                    {t === "features"
                      ? "All features"
                      : t === "software"
                        ? "Software"
                        : "Overview"}
                  </button>
                ))}
              </div>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={state.diff}
                  onChange={(e) => change({ diff: e.target.checked })}
                />
                Differences only
              </label>
              <button
                onClickCapture={(event) => event.currentTarget.focus()}
                className="text-button"
                onClick={() =>
                  change({
                    q: "",
                    category: "All categories",
                    diff: false,
                    priority: "",
                    section: "overview",
                  })
                }
              >
                Reset view
              </button>
            </div>
            <div
              className="compact-identity"
              style={{ "--cars": packs.length } as React.CSSProperties}
            >
              <span className="identity-label">Selected variants</span>
              {packs.map((p, i) => (
                <div
                  key={p.car.id}
                  className={
                    i > 0 && p.car.id !== state.active ? "inactive-mobile" : ""
                  }
                >
                  <strong>
                    {p.car.brand} {p.car.model}
                  </strong>
                  <span>{p.car.trim}</span>
                  <span className="small">
                    {availabilityLabels[p.car.availability]}
                  </span>
                </div>
              ))}
            </div>
            {state.section === "overview" && (
              <>
                <div className="difference-summary">
                  <span className="eyebrow">A useful starting point</span>
                  <p>
                    {busComparisonContext(packs.map((p) => p.car)) || boundedComparisonContext(packs.map((p) => p.car)) || (
                      <>
                        {comparedRange.state === "comparable" &&
                        comparedRange.delta !== 0
                          ? `${Math.abs(comparedRange.delta!)} km difference in the ${pair[0].car.facts.range_km.basis} claims. Check the wheel and variant conditions below.`
                          : "Range needs a closer look at the applicable conditions."}{" "}
                        {pair.some((p) => p.car.facts.seats.value === null)
                          ? "Seat count needs confirmation for one or both versions."
                          : pair[0].car.facts.seats.value !==
                              pair[1].car.facts.seats.value
                            ? `${pair[0].car.facts.seats.value} seats versus ${pair[1].car.facts.seats.value}.`
                            : `Both selected vehicles have ${pair[0].car.facts.seats.value} seats.`}{" "}
                      </>
                    )}{" "}
                    No overall winner score.
                  </p>
                </div>
                <ChapterLinks chapters={orderedChapters} />
                <ComparisonTable
                  packs={packs}
                  active={state.active}
                  id="overview"
                  rows={comparisonOverviewKeys(packs.map((p) => p.car))
                    .filter(
                      (key) =>
                        !state.diff ||
                        new Set(
                          packs.map((p) =>
                            JSON.stringify(p.car.facts[key] ?? null),
                          ),
                        ).size > 1,
                    )
                    .map((key) => ({
                      key,
                      label: comparisonFactLabel(
                        key,
                        packs.map((p) => p.car.facts[key]),
                      ),
                      cells: packs.map((p) =>
                        p.car.facts[key] ? (
                          <FactValue
                            key={p.car.id}
                            compact
                            fact={p.car.facts[key]}
                            onEvidence={() => showFact(p, key)}
                          />
                        ) : (
                          <span key={p.car.id} className="muted">
                            Not established for this configuration
                          </span>
                        ),
                      ),
                    }))}
                />
                {packs.some(
                  (p) =>
                    p.car.vehicleClass && p.car.vehicleClass !== "passenger",
                ) && (
                  <section
                    className="inline-chapter"
                    aria-label="Commercial load and body details"
                  >
                    <header className="inline-chapter-heading">
                      <div>
                        <h2>Load and body details</h2>
                        <p>
                          Check the exact body, equipment and combined-mass
                          limits. Published payload is not spare capacity after
                          occupants, accessories and trailer load.
                        </p>
                      </div>
                    </header>
                    <ComparisonTable
                      packs={packs}
                      active={state.active}
                      id="commercial"
                      rows={[
                        "body_configuration",
                        "payload_kg",
                        "gvm_kg",
                        "gcm_kg",
                        "cargo_volume_m3",
                        "cargo_length_mm",
                        "cargo_height_mm",
                        "cargo_width_mm",
                        "wheelarch_width_mm",
                        "retail_driveaway_from_aud",
                        "abn_driveaway_from_aud",
                        "warranty_years",
                        "warranty_km",
                        "battery_warranty_years",
                        "battery_warranty_km",
                      ]
                        .filter(
                          (key) =>
                            packs.some((p) => p.car.facts[key]) &&
                            (!state.diff ||
                              new Set(
                                packs.map((p) =>
                                  JSON.stringify(p.car.facts[key] ?? null),
                                ),
                              ).size > 1),
                        )
                        .map((key) => ({
                          key,
                          label: comparisonFactLabel(
                            key,
                            packs.map((p) => p.car.facts[key]),
                          ),
                          cells: packs.map((p) =>
                            p.car.facts[key] ? (
                              <FactValue
                                key={p.car.id}
                                fact={p.car.facts[key]}
                              />
                            ) : (
                              <span key={p.car.id} className="muted">
                                Not researched for this configuration
                              </span>
                            ),
                          ),
                        }))}
                    />
                  </section>
                )}
                <InlineChapters
                  chapters={orderedChapters}
                  packs={packs}
                  criteria={criteria}
                  active={state.active}
                  differences={state.diff}
                />
              </>
            )}
            {state.section === "features" && (
              <>
                <div className="feature-filters">
                  <label>
                    Find a feature
                    <input
                      type="search"
                      placeholder="Phone key, needs confirmation, CarPlay…"
                      value={state.q}
                      onChange={(e) => change({ q: e.target.value })}
                    />
                  </label>
                  <label>
                    Category
                    <select
                      value={state.category}
                      onChange={(e) => change({ category: e.target.value })}
                    >
                      {categories.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p role="status" className="small">
                  {filteredCriteria.length} features. Differences include
                  conditions and evidence states.
                </p>
                {categories.slice(1).map((group) => {
                  const rows = filteredCriteria.filter(
                    (c) => c.group === group,
                  );
                  return (
                    !!rows.length && (
                      <details open key={group} className="feature-group">
                        <summary>
                          {group}
                          <span>{rows.length} features</span>
                        </summary>
                        <ComparisonTable
                          id={group.replaceAll(" ", "-")}
                          packs={packs}
                          active={state.active}
                          rows={rows.map((c) => ({
                            key: c.key,
                            label: c.label,
                            cells: packs.map((p) => {
                              const f = p.features.find(
                                (f) => f.criterion === c.key,
                              )!;
                              return (
                                <FeatureValue key={p.car.id} feature={f} />
                              );
                            }),
                          }))}
                        />
                      </details>
                    )
                  );
                })}
                {!filteredCriteria.length && (
                  <Notice>
                    No matching features. Clear the search or category to see
                    the full evidence.
                  </Notice>
                )}
              </>
            )}
            {state.section === "software" && (
              <div className="software-panels">
                {packs.map((p, i) => (
                  <div
                    className={
                      i > 0 && p.car.id !== state.active
                        ? "inactive-mobile"
                        : ""
                    }
                    key={p.car.id}
                  >
                    <SoftwareTimeline pack={p} />
                  </div>
                ))}
              </div>
            )}
            <div className="comparison-end">
              <ShareButton />
              <button className="button secondary" onClick={save}>
                Save shortlist on this device
              </button>
              <button
                onClickCapture={(event) => event.currentTarget.focus()}
                className="text-button"
                onClick={() => window.print()}
              >
                Print comparison
              </button>
              <p role="status" className="small">
                {saveMessage}
              </p>
            </div>
            <div className="print-notes">
              <h2>Research qualifications</h2>
              {packs.map((p) => (
                <section key={p.car.id}>
                  <h3>
                    {p.car.brand} {p.car.model} · {p.car.trim}
                  </h3>
                  {p.car.issues.map((i) => (
                    <p key={i.issue_id}>{issueReaderText(i)}</p>
                  ))}
                  <h4>Evidence references</h4>
                  {p.sources.map((s) => {
                    const presentation = sourcePresentation(s);
                    return (
                      <p key={s.id}>
                        {s.id}: {presentation.title} — {s.url} (accessed {s.accessed_date})
                        {presentation.note && <> · {presentation.note}</>}
                      </p>
                    );
                  })}
                </section>
              ))}
            </div>
          </div>
        )}
        {mode === "home" && (
          <>
            <section className="container priorities">
              <div>
                <p className="eyebrow">Your comparison, your priorities</p>
                <h2>What matters to you?</h2>
                <p>Choose what comes first. Every detail is on this page.</p>
              </div>
              <div className="chips">
                {priorities.map((p) => (
                  <button
                    key={p}
                    aria-pressed={state.priority === p}
                    onClick={() =>
                      change({ priority: state.priority === p ? "" : p })
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </section>
            <div className="container">
              <ChapterLinks chapters={orderedChapters} />
            </div>
            <InlineChapters
              chapters={orderedChapters}
              packs={pair}
              criteria={criteria}
              active={pair[1].car.id}
            />
            <section className="container range-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    One family. Four different choices.
                  </span>
                  <h2>Model Y range</h2>
                </div>
                <Link className="text-link" href="/model-y">
                  Explore the range
                </Link>
              </div>
              <div className="vehicle-grid four">
                {cars
                  .filter((c) => c.modelId === "tesla_model_y")
                  .map((c) => (
                    <VehicleCard
                      car={c}
                      key={c.id}
                      action={
                        <Link
                          className="button secondary"
                          href={selectionUrl({
                            ...state,
                            ids: [
                              c.id,
                              ...state.ids.filter(
                                (id) => id !== c.id && id !== state.ids[0],
                              ),
                            ].slice(0, 2),
                          })}
                        >
                          Compare this Model Y
                        </Link>
                      }
                    />
                  ))}
              </div>
            </section>
            <section className="container research-section">
              <span className="eyebrow">A shortlist, with substance</span>
              <h2>{counts.families} EV families</h2>
              <div className="research-stats">
                <div>
                  <strong>{counts.variants}</strong>
                  <span>researched variants</span>
                </div>
                <div>
                  <strong>{counts.criteria}</strong>
                  <span>feature criteria</span>
                </div>
                <div>
                  <strong>{counts.evidence.toLocaleString()}</strong>
                  <span>evidence records, not independent tests</span>
                </div>
              </div>
              <p>
                {counts.current} current/order-listed · {counts.outgoing}{" "}
                outgoing · {counts.provisional} provisional. This is our
                researched shortlist, not a current national sales ranking.
              </p>
              <div className="family-links">
                {Array.from(
                  new Map(cars.map((c) => [c.family, c])).values(),
                ).map((c) => (
                  <Link key={c.family} href={`/cars?family=${c.family}`}>
                    {c.brand} {c.family === "byd-atto-3" ? "Atto 3" : c.model}
                  </Link>
                ))}
              </div>
              <Link className="button secondary" href="/cars">
                Explore all variants
              </Link>
            </section>
            <section className="container final-cta">
              <p className="eyebrow">Know what you’re comparing</p>
              <h2>Your shortlist</h2>
              <Link className="button primary" href={selectionUrl(state)}>
                Build your comparison
              </Link>
              <Link className="text-link" href="/methodology">
                Read our methodology
              </Link>
            </section>
          </>
        )}
      </main>
      {mode === "home" && trayVisible && (
        <div className="compare-tray">
          {" "}
          <div>
            <strong>
              {pair[0].car.model} <span>vs</span> {pair[1].car.model}
            </strong>
            <span className="small">
              Your selected variants · {site.dateLabel}
            </span>
          </div>
          <Link className="button primary" href={selectionUrl(state)}>
            Compare
          </Link>
        </div>
      )}
    </>
  );
}
export function ComparisonTable({
  packs,
  active,
  rows,
  id,
  visibleHead = false,
  columnId = id,
}: {
  packs: Pack[];
  active: string;
  rows: { key: string; label: string; cells: React.ReactNode[] }[];
  id: string;
  visibleHead?: boolean;
  columnId?: string;
}) {
  return (
    <table className="comparison-table">
      <caption className="sr-only">Selected variant comparison: {id}</caption>
      <colgroup>
        <col style={{ width: "24%" }} />
        {packs.map((p) => (
          <col key={p.car.id} style={{ width: `${76 / packs.length}%` }} />
        ))}
      </colgroup>
      <thead className={visibleHead ? "detail-column-heads" : "sr-only"}>
        <tr>
          <th scope="col">Criterion</th>
          {packs.map((p, i) => (
            <th
              scope="col"
              id={`${columnId}-${p.car.id}`}
              key={p.car.id}
              className={i > 0 && p.car.id !== active ? "inactive-mobile" : ""}
            >
              {p.car.brand} {p.car.model} {p.car.trim}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <th scope="row" tabIndex={-1} id={`${id}-${row.key}`}>
              {row.label}
            </th>
            {row.cells.map((cell, i) => (
              <td
                key={packs[i].car.id}
                data-vehicle={`${packs[i].car.brand} ${packs[i].car.model} · ${packs[i].car.trim}`}
                headers={`${id}-${row.key} ${columnId}-${packs[i].car.id}`}
                className={
                  i > 0 && packs[i].car.id !== active ? "inactive-mobile" : ""
                }
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ChapterLinks({ chapters: ordered }: { chapters: Chapter[] }) {
  return (
    <nav className="comparison-chapters" aria-label="Comparison chapters">
      {ordered.map((ch, rank) => (
        <a key={ch.n} className="button secondary" href={`#chapter-${ch.n}`}>
          <span>
            <span className="chapter-link-number">
              {String(rank + 1).padStart(2, "0")}
            </span>{" "}
            {ch.title}
          </span>
          <span aria-hidden="true">↓</span>
        </a>
      ))}
    </nav>
  );
}
function InlineChapters({
  chapters: ordered,
  packs,
  criteria,
  active,
  differences = false,
}: {
  chapters: Chapter[];
  packs: Pack[];
  criteria: Research["criteria"];
  active: string;
  differences?: boolean;
}) {
  return (
    <div className="inline-chapters">
      {ordered.map((ch, rank) => {
        const keys = [...ch.facts, ...ch.features].filter(
          (key) =>
            !differences ||
            (packs[0].car.facts[key]
              ? factsDiffer(packs.map((p) => p.car.facts[key]))
              : featuresDiffer(
                  packs.map((p) =>
                    p.features.find((f) => f.criterion === key)!,
                  ),
                )),
        );
        return (
          <section
            key={ch.n}
            id={`chapter-${ch.n}`}
            className="inline-chapter"
            aria-labelledby={`chapter-title-${ch.n}`}
          >
            <div className="container">
              <header className="inline-chapter-heading">
                <span className="chapter-number" aria-hidden="true">
                  {String(rank + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 id={`chapter-title-${ch.n}`}>{ch.title}</h2>
                  <p>{ch.copy}</p>
                </div>
                <a href="#main" className="text-link back-to-top">
                  Back to top ↑
                </a>
              </header>
              {keys.length ? (
                <ComparisonTable
                  id="detail"
                  columnId={`chapter-${ch.n}`}
                  packs={packs}
                  active={active}
                  visibleHead
                  rows={keys.map((key) => ({
                    key,
                    label: comparisonFactLabel(
                      key,
                      packs.map((p) => p.car.facts[key]),
                      criteria.find((c) => c.key === key)?.label || key,
                    ),
                    cells: packs.map((p) =>
                      p.car.facts[key] ? (
                        <FactValue key={p.car.id} fact={p.car.facts[key]} />
                      ) : (
                        <FeatureValue
                          key={p.car.id}
                          feature={p.features.find((f) => f.criterion === key)!}
                        />
                      ),
                    ),
                  }))}
                />
              ) : (
                <p className="muted">
                  No differences in the recorded details for this chapter.
                </p>
              )}
              {ch.category === "Software" && (
                <section
                  className="inline-history"
                  aria-label="Software update history"
                >
                  <h3>Update history</h3>
                  <div className="software-panels">
                    {packs.map((p, i) => (
                      <div
                        key={p.car.id}
                        className={
                          i > 0 && p.car.id !== active ? "inactive-mobile" : ""
                        }
                      >
                        <SoftwareTimeline pack={p} />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
