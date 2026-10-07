"use client";
import Link from "next/link";
import Image from "next/image";
import approvedManifest from "../../media/approved-assets.json";
import { resolveAsset, type ApprovedAsset } from "@/lib/media";
import { useEffect, useRef, useState } from "react";
import type { Car, Fact, Feature, Issue, Pack, Source } from "@/lib/types";
import { availabilityLabels, safeUrl, site, statusLabels } from "@/lib/config";
import { formatFact } from "@/lib/compare";
import { FootnoteRefs } from "./footnotes";
import { featureCondition, factCondition } from "@/lib/fleet";

export function Status({
  status,
  label,
}: {
  status: Feature["status"];
  label?: string;
}) {
  return (
    <span className={`status ${status}`}>
      <span aria-hidden="true">
        {status === "standard"
          ? "✓"
          : status === "not_verified"
            ? "?"
            : status === "conditional"
              ? "◇"
              : "·"}
      </span>{" "}
      {label || statusLabels[status]}
    </span>
  );
}
function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      });
}
export function FeatureValue({ feature: f }: { feature: Feature }) {
  return (
    <div className="feature-value">
      <Status
        status={f.status}
        label={
          f.status === "conditional" && f.condition_label
            ? `Conditional · ${f.condition_label}`
            : f.condition_label
        }
      />
      <p className="feature-answer">{f.value}</p>
      {f.status === "conditional" ? (
        <div className="conditional-context">
          <strong>Why conditional</strong>
          <p>{featureCondition(f)}</p>
        </div>
      ) : (
        f.conditions && <p className="qualification">{f.conditions}</p>
      )}
      {!!f.usability_notes?.length && (
        <ul className="usability-notes">
          {f.usability_notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}
      {f.confirmation_needed && (
        <p className="confirmation-note">
          <strong>Still to confirm:</strong> {f.confirmation_needed}
        </p>
      )}
      <p className="feature-source small muted">
        Checked {shortDate(f.last_evidence_date)}
        <FootnoteRefs ids={f.source_ids} />
      </p>
    </div>
  );
}
export function Notice({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="notice">
      {children || (
        <>
          Dated Australian research · {site.dateLabel}. Manufacturer claims,
          with conditions. Prices are not driveaway quotes.{" "}
          <Link href="/methodology">How to read this comparison</Link>
        </>
      )}
    </aside>
  );
}
export function Issues({ issues }: { issues: Issue[] }) {
  if (!issues.length) return null;
  return (
    <details className="issues">
      <summary>
        {issues.length} research qualification{issues.length === 1 ? "" : "s"}
      </summary>
      {issues.map((i) => (
        <p key={i.issue_id}>
          <strong>{i.title}. </strong>
          {i.publication_action}
        </p>
      ))}
    </details>
  );
}
export type Evidence = {
  title: string;
  value: string;
  conditions: string;
  scope: string;
  date: string;
  sourceIds: string[];
  issues?: Issue[];
  status?: Feature["status"];
};
export function factEvidence(f: Fact): Evidence {
  return {
    title: f.label,
    value: formatFact(f),
    conditions: [f.basis, ...f.qualifications].join(" "),
    scope: `${f.market} · ${f.scope}. Source lineage is variant-level unless the source states a narrower scope.`,
    date: f.date,
    sourceIds: f.sourceIds,
    issues: f.issues,
    status: f.status,
  };
}
export function featureEvidence(
  f: Feature,
  label: string,
  issues: Issue[] = [],
): Evidence {
  return {
    title: label,
    value: f.value,
    conditions: f.conditions,
    scope: `AU · ${f.evidence_scope} · ${f.verification_state}`,
    date: f.last_evidence_date,
    sourceIds: f.source_ids,
    issues,
    status: f.status,
  };
}
export function EvidenceDrawer({
  evidence,
  sources,
  onClose,
}: {
  evidence: Evidence | null;
  sources: Source[];
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!evidence) return;
    const active = document.activeElement as HTMLElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      requestAnimationFrame(() => active?.focus());
    };
  }, [evidence]);
  if (!evidence) return null;
  return (
    <dialog
      ref={ref}
      className="evidence-drawer"
      aria-labelledby="evidence-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="drawer-inner">
        <div className="drawer-heading">
          <span className="eyebrow">Behind the claim</span>
          <button
            aria-label="Close evidence"
            onClick={onClose}
            className="icon-button"
          >
            ×
          </button>
        </div>
        <h2 id="evidence-title">{evidence.title}</h2>
        <p className="evidence-value">{evidence.value}</p>
        {evidence.status && <Status status={evidence.status} />}
        <h3>Conditions & measurement</h3>
        <p>{evidence.conditions || "No additional conditions recorded."}</p>
        <h3>Applicability</h3>
        <p>{evidence.scope}</p>
        <p className="muted">
          Evidence date: {evidence.date}. Variant review: {site.date}. A review
          date does not reverify every underlying claim.
        </p>
        <Issues issues={evidence.issues || []} />
        <h3>Original sources</h3>
        <p className="small">
          Source references are retained from the supplied research. This is not
          independent road testing.
        </p>
        <ul className="source-list">
          {evidence.sourceIds.map((id) => {
            const s = sources.find((s) => s.id === id);
            return (
              <li key={id}>
                {s ? (
                  <>
                    <a
                      href={safeUrl(s.url) || "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    <p>
                      {s.publisher} · {s.source_type.replaceAll("_", " ")} ·{" "}
                      {s.market}
                    </p>
                    <p>
                      Published: {s.published_date || "Not supplied"} ·
                      Accessed: {s.accessed_date}
                    </p>
                    <p>{s.supports}</p>
                    {[
                      "access_limitation",
                      "qualification",
                      "caution",
                      "conflict",
                      "evidence_limit",
                      "variant_review_status",
                    ].map((k) =>
                      s[k] ? (
                        <p className="small" key={k}>
                          {String(s[k]).replaceAll("_", " ")}
                        </p>
                      ) : null,
                    )}
                    <code>{id}</code>
                  </>
                ) : (
                  <span>Reference {id} needs confirmation.</span>
                )}
              </li>
            );
          })}
        </ul>
        <button className="button" onClick={onClose}>
          Close evidence
        </button>
      </div>
    </dialog>
  );
}
export function FactValue({
  fact,
  compact = false,
}: {
  fact: Fact;
  onEvidence?: () => void;
  compact?: boolean;
}) {
  return (
    <div className="fact-value">
      <strong>{formatFact(fact)}</strong>
      {fact.status !== "standard" && <Status status={fact.status} />}
      {fact.status === "conditional" && (
        <div className="conditional-context">
          <strong>Why conditional</strong>
          <p>{factCondition(fact)}</p>
        </div>
      )}
      <span className="fact-basis">
        {fact.basis} · {shortDate(fact.date)}
      </span>
      {!compact &&
        fact.qualifications.map((q) => (
          <span className="qualification" key={q}>
            {q}
          </span>
        ))}
      <FootnoteRefs ids={fact.sourceIds} />
    </div>
  );
}
export function SeatingDiagram({ seats }: { seats: number }) {
  const rows = seats === 6 ? [2, 2, 2] : [2, 3];
  return (
    <svg
      className="seating"
      viewBox="0 0 160 160"
      role="img"
      aria-label={`${seats} seating positions. Schematic only, not dimensions or child-seat suitability.`}
    >
      <rect
        x="25"
        y="8"
        width="110"
        height="142"
        rx="35"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".3"
      />
      {rows.flatMap((n, r) =>
        Array.from({ length: n }, (_, i) => (
          <rect
            key={`${r}-${i}`}
            x={n === 2 ? 46 + i * 40 : 37 + i * 31}
            y={28 + r * (seats === 6 ? 37 : 52)}
            width={n === 2 ? 28 : 24}
            height="26"
            rx="7"
            fill="currentColor"
            opacity={r === 0 ? 0.8 : 0.42}
          />
        )),
      )}
      <path d="M52 139h56" stroke="currentColor" opacity=".4" />
    </svg>
  );
}
export function MediaRenderer({
  car,
  placement = "card",
}: {
  car: Car;
  placement?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const asset = resolveAsset(
    approvedManifest as ApprovedAsset[],
    `vehicle-${car.id}`,
    placement,
    car.modelId,
  );
  if (!asset || failedSrc === asset.src)
    return <SeatingDiagram seats={Number(car.facts.seats.value)} />;
  return (
    <figure className="approved-media">
      <Image
        src={asset.src}
        alt={`${car.brand} ${car.model} ${car.trim}; approved build-specific photograph`}
        width={asset.width}
        height={asset.height}
        sizes="(max-width: 767px) 45vw, 300px"
        onError={() => setFailedSrc(asset.src)}
      />
      {asset.credit && <figcaption>{asset.credit}</figcaption>}
    </figure>
  );
}
export function VehicleCard({
  car,
  action,
  onEvidence,
}: {
  car: Car;
  action?: React.ReactNode;
  onEvidence?: (f: Fact) => void;
}) {
  return (
    <article className="vehicle-card">
      <div className="card-top">
        <span className="eyebrow">{car.brand}</span>
        <span className="small">{car.year}</span>
      </div>
      <div className="vehicle-title">
        <h3>{car.model}</h3>
        <MediaRenderer car={car} />
      </div>
      <p className="trim">{car.trim}</p>
      <p className="small muted">{availabilityLabels[car.availability]}</p>
      <div className="card-facts">
        <div>
          <span className="small">Dated listed price</span>
          <FactValue
            fact={car.facts.price_aud}
            compact
            onEvidence={
              onEvidence ? () => onEvidence(car.facts.price_aud) : undefined
            }
          />
        </div>
        <div>
          <span className="small">{car.facts.range_km.basis} claim</span>
          <FactValue
            fact={car.facts.range_km}
            compact
            onEvidence={
              onEvidence ? () => onEvidence(car.facts.range_km) : undefined
            }
          />
        </div>
      </div>
      {action}
      <Link className="text-link" href={`/cars/${car.family}/${car.slug}`}>
        Explore this variant
      </Link>
    </article>
  );
}
export function SoftwareTimeline({
  pack,
}: {
  pack: Pack;
  onEvidence?: (e: Evidence) => void;
}) {
  const [filter, setFilter] = useState("All events");
  const e = pack.eligibility;
  const isL = pack.car.id.includes("tesla_model_y__l_");
  const isKia = pack.car.brand === "Kia";
  const events = pack.events.filter(
    (e) =>
      filter === "All events" ||
      (filter === "Pending evidence"
        ? e.variant_review_state.startsWith("pending")
        : filter === "Dealer delivery"
          ? /dealer/i.test(e.delivery_method)
          : filter === "Fixes & security"
            ? /fix|security|improv|stability|remedy|recall/i.test(
                e.changes.join(" "),
              )
            : filter === "Announcements"
              ? /announcement/i.test(e.category)
              : filter === "Manufacturer evidence"
                ? /manufacturer|OEM/i.test(e.verification)
                : !/maintenance|map_update|announcement/.test(e.category)),
  );
  return (
    <section className="software-timeline">
      <span className="eyebrow">
        {pack.car.brand} {pack.car.model} · {pack.car.trim}
      </span>
      <h2>
        {e.documented_family_minimum === null
          ? "No release count documented for this version"
          : `At least ${e.documented_family_minimum} ${isKia ? "update notices" : "software releases"} documented`}
      </h2>
      {pack.car.modelId === "kia_ev3" && (
        <p className="notice">
          Six reverified notices + two older records pending renewed evidence.
          Eight is not a verified total.
        </p>
      )}
      <p>{e.scope}</p>
      <p className="small muted">
        Recorded from {shortDate(e.observation_window_start)} to{" "}
        {shortDate(e.observation_window_end)}.{" "}
        {e.exact_total_known
          ? `Exact total: ${e.exact_total}.`
          : "The exact total is not published."}
      </p>
      <FootnoteRefs ids={e.source_ids} />
      {isL && (
        <p className="notice">
          The timeline below is Model Y nameplate context. Eligibility for Model
          Y L has not been established; these events are not a count for this
          variant.
        </p>
      )}
      <label className="filter-label">
        Show events
        <select value={filter} onChange={(ev) => setFilter(ev.target.value)}>
          {[
            "All events",
            "Meaningful features",
            "Fixes & security",
            "Dealer delivery",
            "Manufacturer evidence",
            "Pending evidence",
            "Announcements",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </label>
      <p className="small" aria-live="polite">
        {events.length} {events.length === 1 ? "entry" : "entries"} shown.
      </p>
      <ol className="timeline">
        {events.map((event) => (
          <li
            key={event.event_id}
            className={
              event.variant_review_state.startsWith("pending") ? "pending" : ""
            }
          >
            <div className="event-date">
              {event.release_date ||
                String(event.observed_by_date || "Date not established")}
              <span>{event.delivery_method}</span>
            </div>
            <div>
              <div className="event-meta">
                {String(event.category_label)}
                {event.variant_review_state.startsWith("pending") && (
                  <span className="status conditional">
                    Pending reverification
                  </span>
                )}
              </div>
              <h3>
                {event.version || event.family_id || "Documented update notice"}
              </h3>
              <ul>
                {event.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <p className="small muted">{String(event.evidence_label)}</p>
              {event.notes && <p className="small">{event.notes}</p>}
              <FootnoteRefs ids={event.source_ids} />
            </div>
          </li>
        ))}
      </ol>
      {!events.length && (
        <Notice>
          No matching documented events. This does not mean no updates were
          delivered.
        </Notice>
      )}
      {!!pack.configuration.length && (
        <div className="configuration">
          <h3>Configuration changes, separately recorded</h3>
          <p>These are not delivered OTA releases.</p>
          {pack.configuration.map((c, i) => (
            <div key={i}>
              <strong>{c.change}</strong>
              <p>
                {c.old} → {c.new}
              </p>
              <FootnoteRefs ids={c.source_ids} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
export function ShareButton() {
  const [message, setMessage] = useState("");
  const [fallback, setFallback] = useState("");
  return (
    <div className="share-control">
      <button
        className="button secondary"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            setMessage("Comparison link copied.");
          } catch {
            setFallback(location.href);
            setMessage("Copy the link below.");
          }
        }}
      >
        Copy comparison link
      </button>
      <span className="small" role="status">
        {message}
      </span>
      {fallback && (
        <div>
          <label>
            Comparison link
            <input
              readOnly
              value={fallback}
              onFocus={(e) => e.target.select()}
            />
          </label>
          <a href={fallback}>Open comparison link</a>
        </div>
      )}
    </div>
  );
}

export function ChargeWindowDiagram({ fact }: { fact: Fact }) {
  const window = fact.basis.match(/(\d+)[–-](\d+)%/);
  if (!window)
    return (
      <div className="charge-window">
        <span>Comparable charging window</span>
        <strong>Not established</strong>
        <p className="small">Peak kW is not a charging time.</p>
      </div>
    );
  const start = Number(window[1]),
    end = Number(window[2]);
  return (
    <figure className="charge-window">
      <figcaption>
        {start}–{end}% state of charge
      </figcaption>
      <svg
        viewBox="0 0 240 46"
        role="img"
        aria-label={`Published charging window from ${start} to ${end} percent; not a charging curve`}
      >
        <rect
          x="0"
          y="12"
          width="240"
          height="18"
          rx="5"
          fill="currentColor"
          opacity=".12"
        />
        <rect
          x={start * 2.4}
          y="12"
          width={(end - start) * 2.4}
          height="18"
          rx="5"
          fill="currentColor"
          opacity=".7"
        />
      </svg>
      <span className="small">Published window · not a charging curve</span>
    </figure>
  );
}

export function SoftwareExcerpt({
  pack,
}: {
  pack: Pack;
  onEvidence?: (e: Evidence) => void;
}) {
  const scope = pack.eligibility;
  const unknown = scope.documented_family_minimum === null;
  const event = unknown
    ? undefined
    : pack.events.find(
        (e) =>
          e.count_in_headline &&
          e.release_date &&
          e.release_date >= scope.observation_window_start &&
          e.release_date <= scope.observation_window_end &&
          e.changes.length,
      );
  return (
    <div className="software-excerpt">
      <span className="event-date">
        {event
          ? `${event.release_date} · ${event.delivery_method}`
          : "No dated Australian release documented"}
      </span>
      <h4>
        {event?.changes[0] ||
          "No documented over-the-air release for this version"}
      </h4>
      <p className="small">
        {unknown
          ? "No release count documented; that is not a finding of zero updates."
          : `At least ${scope.documented_family_minimum} documented ${pack.car.brand === "Kia" ? "Australian notices" : "nameplate release families"}. Exact total not established.`}
      </p>
      <p className="small">{scope.scope}</p>
      <p className="small">
        5 Oct 2024 – 5 Oct 2026 · Not individual installations
      </p>
      <FootnoteRefs ids={event ? event.source_ids : scope.source_ids} />
    </div>
  );
}
