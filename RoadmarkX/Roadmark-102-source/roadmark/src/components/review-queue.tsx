"use client";
import { matchesSearch } from "@/lib/search";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RoadmarkLogo } from "./roadmark-logo";
import {
  REPORT_LIST_CONTENT_TYPE,
  type ReportListEntry,
} from "@/lib/report-queue-projection";
import { isReportListEnvelope } from "@/lib/report-queue-reader";
type Report = ReportListEntry;
export default function ReviewQueue() {
  const [reports, setReports] = useState<Report[]>([]),
    [state, setState] = useState<"loading" | "ready" | "error">("loading"),
    [query, setQuery] = useState(""),
    [total, setTotal] = useState(0);
  const [unreadable, setUnreadable] = useState(0);
  const [loaded, setLoaded] = useState(0);
  const [inaccessible, setInaccessible] = useState(0);
  const requestSequence = useRef({ value: 0 });
  async function refresh() {
    const request = ++requestSequence.current.value;
    setState("loading");
    try {
      const res = await fetch("/api/issues", {
        headers: { accept: REPORT_LIST_CONTENT_TYPE },
      });
      if (
        !res.ok ||
        res.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
          REPORT_LIST_CONTENT_TYPE
      )
        throw new Error();
      const data = await res.json();
      if (!isReportListEnvelope(data)) throw new Error();
      if (request !== requestSequence.current.value) return;
      setReports(data.reports);
      setTotal(data.totalRecognizedFiles);
      setLoaded(data.loadedFiles);
      setUnreadable(data.unreadableFiles);
      setInaccessible(data.inaccessibleNames);
      setState("ready");
    } catch {
      if (request !== requestSequence.current.value) return;
      setState("error");
    }
  }
  useEffect(() => {
    void refresh();
    const sequence = requestSequence.current;
    return () => {
      sequence.value++;
    };
  }, []);
  const matching = reports.filter((r) =>
    matchesSearch(`${r.vehicleLabel} ${r.claimLabel} ${r.description}`, query),
  );
  return (
    <main id="main" className="roadmark-discovery">
      <header className="container discovery-hero">
        <RoadmarkLogo />
        <p className="eyebrow">Local editorial workspace</p>
        <h1>
          Check the claim.
          <br />
          <span>Keep the evidence.</span>
        </h1>
        <p className="lede">
          Reports are leads for review. They never change a vehicle’s facts or
          rankings automatically.
        </p>
        <Link href="/">← Back to discovery</Link>
      </header>
      <section className="container discovery-content">
        <div className="discovery-section-head">
          <h2>Pending reports</h2>
          <button className="button" onClick={refresh}>
            Refresh queue
          </button>
        </div>
        {state === "loading" ? (
          <p role="status">Loading the local review queue…</p>
        ) : state === "error" ? (
          <div className="discovery-empty" role="status">
            <h3>The local inbox isn’t connected</h3>
            <p>
              This page needs the local review preview service. Browser-saved
              drafts remain on the device where they were created; they aren’t
              submitted reports.
            </p>
            <button className="button" onClick={refresh}>
              Try again
            </button>
          </div>
        ) : (
          <>
            <label className="discovery-search">
              Find a report
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Vehicle, claim or report text"
              />
            </label>
            <p role="status">
              {matching.length} matching reports from {loaded} recent files
              checked; {total} recognized regular queue files.{" "}
              {unreadable > 0 &&
                `${unreadable} recent files could not be read or validated and were left untouched. `}
              {inaccessible > 0 &&
                `${inaccessible} additional queue names were inaccessible or not regular files and were left untouched. `}
              Read-only review; verify the exact-trim sources before approving
              any correction.
            </p>
            {!matching.length && (
              <div className="discovery-empty">
                <h3>No matching reports</h3>
                <p>
                  {reports.length
                    ? "Try a different search."
                    : "Reports submitted through the local preview will appear here."}
                </p>
              </div>
            )}
            <div className="market-records">
              {matching.map((r) => (
                <article key={r.queueFile}>
                  <p className="eyebrow">{r.status}</p>
                  <h2>{r.vehicleLabel}</h2>
                  <h3>{r.claimLabel}</h3>
                  <p className="small muted">
                    Observed value: {r.observedValuePreview} · {r.createdAt}
                  </p>
                  <p className="small muted">
                    {r.bindingState === "bound_snapshot"
                      ? "Recorded claim snapshot matches its saved binding. This does not verify source freshness or approve a correction."
                      : r.bindingState === "legacy_unbound"
                        ? "Legacy report: the complete displayed claim was not bound at submission."
                        : r.bindingState === "verification_unavailable"
                          ? "Snapshot verification is temporarily unavailable. The saved record has not been changed."
                          : "Snapshot binding could not be validated. Review the original saved record before using it."}
                    {r.labelProvenance === "current_catalogue_or_identifier" &&
                      " Labels are from the current catalogue or saved identifiers, not a verified historical snapshot."}
                    {r.fieldsTruncated &&
                      " Display text is shortened; the saved original remains unchanged."}
                  </p>
                  {r.observedStatus && (
                    <p className="small muted">
                      Observed status: {r.observedStatus}.{" "}
                      {r.observedConditions}
                    </p>
                  )}
                  <p
                    style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                  >
                    {r.description}
                  </p>
                  <details>
                    <summary>Claim reference</summary>
                    <p className="small" style={{ overflowWrap: "anywhere" }}>
                      {r.id}
                      <br />
                      {r.variantId} / {r.factKey}
                    </p>
                    <p className="small">
                      Source IDs:{" "}
                      {r.sourceIds.join(", ") ||
                        "No supporting source recorded"}
                      {r.omittedSourceCount > 0 &&
                        ` (${r.omittedSourceCount} additional source IDs omitted from this bounded preview)`}
                    </p>
                  </details>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
