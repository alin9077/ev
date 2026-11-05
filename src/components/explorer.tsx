"use client";
import {
  matchesSearch,
  catalogueFilterOptions,
  driveFilterKey,
} from "@/lib/search";
import { useEffect, useRef, useState } from "react";
import {
  readExplorerFilters,
  clearExplorerFilters,
  explorerFilterUrl,
  type ExplorerFilters,
} from "@/lib/explorer-state";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { BASELINE, CHALLENGER, site } from "@/lib/config";
import {
  buyerAvailabilityLabels,
  matchesBuyerAvailability,
} from "@/lib/buyer-availability";
import { matchesVehicleScope, vehicleScopeOptions } from "@/lib/vehicle-scope";
import { Notice, VehicleCard } from "./ui";
export default function Explorer({
  cars,
  initial,
  equipment,
}: {
  cars: Car[];
  initial: Record<string, string>;
  equipment: Record<string, Record<string, boolean | null>>;
}) {
  const router = useRouter();
  const filterOptions = catalogueFilterOptions(cars);
  const [filters, setFilters] = useState(() => readExplorerFilters(initial));
  const [limit, setLimit] = useState(12);
  const grid = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<number | null>(null);
  useEffect(() => {
    if (pendingFocus.current === null) return;
    const heading =
      grid.current?.children[pendingFocus.current]?.querySelector("h3");
    pendingFocus.current = null;
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1;
      heading.focus();
    }
  }, [limit]);
  const familyCount = new Set(cars.map((car) => car.modelFamily || car.family))
    .size;
  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(location.search);
      setFilters(readExplorerFilters(query));
      setLimit(12);
      pendingFocus.current = null;
    };
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const [selected, setSelected] = useState<string[]>([BASELINE]),
    [message, setMessage] = useState("");
  function updateFilters(next: ExplorerFilters, push = false) {
    setFilters(next);
    setLimit(12);
    pendingFocus.current = null;
    window.history[push ? "pushState" : "replaceState"](
      window.history.state,
      "",
      explorerFilterUrl(next, window.location),
    );
  }
  function change(k: keyof ExplorerFilters, v: string) {
    updateFilters(
      { ...filters, [k]: v },
      !["q", "budget", "range"].includes(k),
    );
  }
  const filtered = cars.filter(
    (c) =>
      matchesVehicleScope(c, filters.class) &&
      (filters.family === "all" || c.family === filters.family) &&
      matchesSearch(`${c.brand} ${c.model} ${c.trim}`, filters.q) &&
      matchesBuyerAvailability(c, filters.availability) &&
      (!filters.budget ||
        c.facts.price_aud.value === null ||
        Number(c.facts.price_aud.value) <= Number(filters.budget)) &&
      (!filters.range ||
        c.facts.range_km.value === null ||
        Number(c.facts.range_km.value) >= Number(filters.range)) &&
      (filters.drive === "all" || driveFilterKey(c.drive) === filters.drive) &&
      (filters.seats === "all" ||
        Number(c.facts.seats.value) === Number(filters.seats)) &&
      (filters.equipment === "all" ||
        equipment[c.id]?.[filters.equipment] !== false),
  );
  function add(id: string) {
    if (selected.includes(id)) {
      if (id !== selected[0]) setSelected(selected.filter((x) => x !== id));
      return;
    }
    if (selected.length === 3) {
      setMessage(
        "Three vehicles selected. Remove a challenger to choose another.",
      );
      return;
    }
    setSelected([...selected, id]);
    setMessage("Added to your comparison.");
  }
  return (
    <main id="main" className="container editorial-page">
      <p className="eyebrow">Our researched shortlist</p>
      <h1>Explore cars</h1>
      <p className="lede">
        Explore current records, outgoing generations and announced variants
        across {familyCount} model {familyCount === 1 ? "family" : "families"}.
      </p>
      <Notice />
      <div className="explorer-filters">
        <label>
          Search cars
          <input
            type="search"
            value={filters.q}
            onChange={(e) => change("q", e.target.value)}
            placeholder="Model or trim"
          />
        </label>
        <label>
          Vehicle type
          <select
            value={filters.class}
            onChange={(e) => change("class", e.target.value)}
          >
            {vehicleScopeOptions(cars).map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Model family
          <select
            value={filters.family}
            onChange={(e) => change("family", e.target.value)}
          >
            <option value="all">All families</option>
            {Array.from(new Map(cars.map((c) => [c.family, c])).values()).map(
              (c) => (
                <option key={c.family} value={c.family}>
                  {c.brand} {c.family === "byd-atto-3" ? "Atto 3" : c.model}
                </option>
              ),
            )}
          </select>
        </label>
        <label>
          Availability
          <select
            value={filters.availability}
            onChange={(e) => change("availability", e.target.value)}
          >
            <option value="all">All records</option>
            {!Object.hasOwn(buyerAvailabilityLabels, filters.availability) &&
              filters.availability !== "all" && (
                <option value={filters.availability}>
                  Saved availability filter
                </option>
              )}
            {Object.entries(buyerAvailabilityLabels).map(([key, val]) => (
              <option key={key} value={key}>
                {val}
              </option>
            ))}
          </select>
        </label>
        <label>
          Maximum published AUD
          <input
            type="number"
            min="0"
            value={filters.budget}
            placeholder="Any budget"
            onChange={(e) => change("budget", e.target.value)}
          />
        </label>
        <label>
          Minimum claimed km
          <input
            type="number"
            min="0"
            value={filters.range}
            placeholder="Any range"
            onChange={(e) => change("range", e.target.value)}
          />
        </label>
        <label>
          Drive
          <select
            value={filters.drive}
            onChange={(e) => change("drive", e.target.value)}
          >
            {["all", ...filterOptions.drive].map((v) => (
              <option key={v} value={v}>
                {v === "all"
                  ? "Any drive"
                  : v === "unknown"
                    ? "Drive unverified"
                    : v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Seats
          <select
            value={filters.seats}
            onChange={(e) => change("seats", e.target.value)}
          >
            <option value="all">Any seats</option>
            {filterOptions.seats.map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "seat" : "seats"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Equipment
          <select
            value={filters.equipment}
            onChange={(e) => change("equipment", e.target.value)}
          >
            <option value="all">Any equipment</option>
            <option value="front_ventilated">Ventilated front seats</option>
            <option value="hud">Head-up display</option>
            <option value="adaptive_damping">Adaptive damping</option>
            <option value="power_roof_shade">Power roof shade</option>
          </select>
        </label>
      </div>
      <p className="small muted">
        Budget filters use published amounts with their stated basis.
        Before-on-road and driveaway prices are not like-for-like, and a listed
        amount is not a final quote. Unknown numeric and equipment records stay
        visible for review. A selectable listing is not a stock guarantee.
      </p>
      <div className="section-heading">
        <p role="status">
          Showing {Math.min(limit, filtered.length)} of {filtered.length}{" "}
          matching variants. Search checks the whole catalogue.
        </p>
        <button
          className="text-button"
          onClick={() => updateFilters(clearExplorerFilters(), true)}
        >
          Clear all filters
        </button>
        <button
          className="text-button"
          onClick={() => {
            try {
              const saved = JSON.parse(
                localStorage.getItem("ev-shortlist") || "[]",
              );
              if (!Array.isArray(saved) || !saved.length) {
                setMessage("No saved shortlist on this device.");
                return;
              }
              router.push(
                `/compare?cars=${saved.filter((id) => cars.some((c) => c.id === id)).join(",")}&data=${site.date}`,
              );
            } catch {
              setMessage("Saved shortlist is unavailable.");
            }
          }}
        >
          Open saved shortlist
        </button>
      </div>
      <p role="status" className="small">
        {message}
      </p>
      <div className="vehicle-grid three" ref={grid}>
        {filtered.slice(0, limit).map((c) => (
          <VehicleCard
            key={c.id}
            car={c}
            action={
              <>
                <button
                  className="button secondary"
                  aria-pressed={selected.includes(c.id)}
                  onClick={() => add(c.id)}
                >
                  {selected.includes(c.id)
                    ? c.id === selected[0]
                      ? "Model Y baseline"
                      : "Remove challenger"
                    : "Add to comparison"}
                </button>
                {filters.equipment !== "all" && (
                  <p className="small">
                    Filtered equipment:{" "}
                    {equipment[c.id]?.[filters.equipment] === true
                      ? "Listed in trim record; see evidence"
                      : "Needs confirmation"}
                  </p>
                )}
              </>
            }
          />
        ))}
      </div>
      {limit < filtered.length && (
        <button
          className="button secondary"
          onClick={() => {
            pendingFocus.current = limit;
            setLimit((current) => Math.min(current + 12, filtered.length));
          }}
        >
          Show {Math.min(12, filtered.length - limit)} more variants
        </button>
      )}
      {!filtered.length && (
        <Notice>No matching records. Broaden your filters to continue.</Notice>
      )}
      <div className="compare-tray">
        <div>
          <strong>{selected.length} selected</strong>
          <span className="small">
            {selected
              .map((id) => cars.find((c) => c.id === id)?.model)
              .join(" / ")}
          </span>
        </div>
        <Link
          className="button primary"
          href={`/compare?cars=${(selected.length === 1 ? [...selected, CHALLENGER] : selected).join(",")}&data=${site.date}`}
        >
          Compare
        </Link>
      </div>
    </main>
  );
}
