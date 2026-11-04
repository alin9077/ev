"use client";
import { matchesSearch } from "@/lib/search";
import { buyerDisplayCopy } from "@/lib/buyer-display-copy";
import { useState } from "react";
import Link from "next/link";
import inventory from "@/lib/market-view-data";
import { RoadmarkLogo } from "./roadmark-logo";
const labels: Record<string, string> = {
  accepting_orders: "Accepting orders · advertised",
  accepting_order_requests_advertised:
    "Order requests advertised · confirm acceptance",
  preorder: "Pre-order",
  listed_unconfirmed: "Listed · ordering unconfirmed",
  not_current: "Not verified as current",
  unverified: "Stock not verified",
  new_stock_listed: "New stock advertised · confirm exact vehicle",
  verified_new_stock: "Specific new stock verified",
};
export default function MarketAudit() {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState("all"),
    [vehicleClass, setVehicleClass] = useState("all"),
    [limit, setLimit] = useState(24);
  const typedRecords =
    inventory.records as ((typeof inventory.records)[number] & {
      vehicleClass?: string;
    })[];
  const classLabels: Record<string, string> = {
    passenger: "Cars, SUVs & people movers",
    van: "Vans",
    ute: "Utes",
    truck: "Trucks",
    bus: "Buses",
    motorcycle: "Motorcycles, scooters & road trikes",
    other: "Other / class to verify",
  };
  const records = typedRecords.filter(
    (r) =>
      matchesSearch(
        [r.brand, r.model, ...r.trims, ...(r.aliases ?? []), ...(r.modelAliases ?? [])].join(" "),
        q,
      ) &&
      (status === "all" || r.orderStatus === status) &&
      (vehicleClass === "all" || (r.vehicleClass || "other") === vehicleClass),
  );
  return (
    <main id="main" className="roadmark-discovery market-audit">
      <header className="container discovery-hero">
        <RoadmarkLogo />
        <p className="eyebrow">The market, with the gaps visible.</p>
        <h1>
          More choice.
          <br />
          <span>Less guesswork.</span>
        </h1>
        <p className="lede">
          A growing Australian new-EV audit beyond the original ten-family
          shortlist. A listing, an open order book and a car on a dealer’s
          forecourt are three different things.
        </p>
        <p className="discovery-scope">
          Checked {inventory.checkedAt} · {inventory.records.length} additional
          model records · Audit incomplete
        </p>
        <p className="small muted">
          Audit counts include uncertain, future-delivery and withdrawn
          listings. They are not a count of vehicles available to buy today.
          Motorcycles, scooters and road trikes with cited road-use evidence are included; their full
          market coverage and specialist imports remain open.
        </p>
        <Link href="/">← Discover researched strengths</Link>
      </header>
      <section className="container discovery-content">
        <div className="market-filters">
          <label>
            Search the wider market
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(24);
              }}
              placeholder="Brand, model or trim"
            />
          </label>
          <label>
            Vehicle type
            <select
              value={vehicleClass}
              onChange={(e) => {
                setVehicleClass(e.target.value);
                setLimit(24);
              }}
            >
              <option value="all">All vehicle types</option>
              {[...new Set(typedRecords.map((r) => r.vehicleClass || "other"))]
                .sort()
                .map((key) => (
                  <option key={key} value={key}>
                    {classLabels[key] || key}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Order evidence
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setLimit(24);
              }}
            >
              <option value="all">All evidence states</option>
              {Object.entries(inventory.statusDefinitions).map(([key]) => (
                <option key={key} value={key}>
                  {labels[key]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p role="status">
          {records.length} model records. Exact-trim fact coverage varies;
          unverified measurements stay out of rankings.
        </p>
        <div className="market-records">
          {records.slice(0, limit).map((r) => (
            <article key={r.id}>
              <div className="discovery-car-top">
                <p className="eyebrow">{r.brand}</p>
                <span className="small muted">Checked {r.checkedAt}</span>
              </div>
              <p className="small muted">
                {classLabels[r.vehicleClass || "other"]}
              </p>
              <h2>{r.model}</h2>
              <p className="market-status">
                <strong>{labels[r.orderStatus] || r.orderStatus}</strong>
                <span>
                  {labels[r.stockStatus] || r.stockStatus.replaceAll("_", " ")}
                </span>
              </p>
              <h3>Named Australian configurations</h3>
              {r.trims.length ? (
                <ul>
                  {r.trims.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              ) : (
                <p>Exact trim names still need verification.</p>
              )}
              <p className="small muted">
                {r.trimCoverage.replaceAll("_", " ")}
              </p>
              <p>{buyerDisplayCopy(r.id, "evidenceNote", r.evidenceNote)}</p>
              <details>
                <summary>Evidence & limitations</summary>
                <ul>
                  {r.sourceUrls.map((u, i) => (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer">
                        Source {i + 1} · {new URL(u).hostname} ↗
                      </a>
                    </li>
                  ))}
                </ul>
                <ul>
                  {r.limitations.map((l, i) => (
                    <li key={i}>{buyerDisplayCopy(r.id, `limitations[${i}]`, l)}</li>
                  ))}
                </ul>
              </details>
            </article>
          ))}
        </div>
        {!records.length && (
          <div className="discovery-empty">
            <h2>No matching audited records</h2>
            <p>
              This audit is incomplete; an empty result does not establish that
              a vehicle is unavailable.
            </p>
            <button
              className="button"
              onClick={() => {
                setQ("");
                setStatus("all");
                setVehicleClass("all");
                setLimit(24);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        {records.length > limit && (
          <div className="discovery-more">
            <p>
              Showing {limit} of {records.length} matching model records.
              Filters search the whole audit.
            </p>
            <button className="button" onClick={() => setLimit(limit + 24)}>
              Show 24 more records
            </button>
          </div>
        )}
        <section className="market-method">
          <h2>What this audit does and doesn’t establish</h2>
          <p>{inventory.scope}</p>
          <ul>
            {inventory.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p>
            The growing detailed catalogue is available in discovery.
            Market-audit records alone do not enter rankings until their
            exact-trim measurements, comparable bases and supporting evidence
            pass review.
          </p>
          <h3>Reading availability</h3>
          <dl>
            {Object.entries(inventory.statusDefinitions).map(([key, note]) => (
              <div key={key}>
                <dt>{labels[key]}</dt>
                <dd>{note}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>
    </main>
  );
}
