"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { BASELINE, CHALLENGER, site, availabilityLabels } from "@/lib/config";
import {
  DEFAULT_TYPE,
  inVehicleType,
  unverifiedSuffix,
  vehicleType,
  vehicleTypes,
} from "@/lib/fleet";
import { Notice, VehicleCard } from "./ui";
/** Cards drawn at a time: the catalogue is hundreds of variants. */
const PAGE = 48;
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
  const [filters, setFilters] = useState({
    q: initial.q || "",
    // A link to one family should show it whatever its type.
    type: (initial.type || initial.family
      ? vehicleType(initial.type || "all").value
      : DEFAULT_TYPE) as string,
    family: initial.family || "all",
    availability: initial.availability || "current_or_order_listed",
    budget: initial.budget || "",
    range: initial.range || "",
    drive: initial.drive || "all",
    seats: initial.seats || "all",
    equipment: initial.equipment || "all",
  });
  useEffect(() => {
    const restore = () => {
      const query = new URLSearchParams(location.search);
      setFilters(
        (f) =>
          Object.fromEntries(
            Object.entries(f).map(([k, v]) => [k, query.get(k) || v]),
          ) as typeof f,
      );
    };
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, []);
  const [selected, setSelected] = useState<string[]>([BASELINE]),
    [message, setMessage] = useState(""),
    [limit, setLimit] = useState(PAGE);
  function change(k: string, v: string) {
    const f = { ...filters, [k]: v };
    setFilters(f);
    setLimit(PAGE);
    const q = new URLSearchParams(f);
    window.history.replaceState(
      null,
      "",
      window.location.pathname.endsWith("index.html") ||
        window.location.protocol === "file:"
        ? `${window.location.pathname}?${q}&page=/cars`
        : `/cars?${q}`,
    );
  }
  const filtered = cars.filter(
    (c) =>
      inVehicleType(c, filters.type) &&
      (filters.family === "all" || c.family === filters.family) &&
      `${c.brand} ${c.model} ${c.trim}`
        .toLowerCase()
        .includes(filters.q.toLowerCase()) &&
      (filters.availability === "all" ||
        c.availability === filters.availability) &&
      (!filters.budget ||
        c.facts.price_aud.value === null ||
        Number(c.facts.price_aud.value) <= Number(filters.budget)) &&
      (!filters.range ||
        c.facts.range_km.value === null ||
        Number(c.facts.range_km.value) >= Number(filters.range)) &&
      (filters.drive === "all" || c.drive === filters.drive) &&
      (filters.seats === "all" ||
        Number(c.facts.seats.value) === Number(filters.seats)) &&
      (filters.equipment === "all" ||
        equipment[c.id]?.[filters.equipment] !== false),
  );
  // The family menu follows the vehicle type, grouped by brand.
  const families = [
    ...new Map(
      cars
        .filter((c) => inVehicleType(c, filters.type))
        .map((c) => [c.family, c]),
    ).values(),
  ]
    .sort(
      (a, b) =>
        a.brand.localeCompare(b.brand, "en") ||
        a.model.localeCompare(b.model, "en", { numeric: true }),
    )
    .reduce<[string, Car[]][]>((groups, c) => {
      const last = groups[groups.length - 1];
      if (last?.[0] === c.brand) last[1].push(c);
      else groups.push([c.brand, [c]]);
      return groups;
    }, []);
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
        {new Set(cars.map((c) => c.family)).size} model families and{" "}
        {cars.length} variants, including Model Y. Explore current records,
        outgoing generations and announced variants. Figures that are not yet
        confirmed read “Needs confirmation”.
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
            value={filters.type}
            onChange={(e) => change("type", e.target.value)}
          >
            {vehicleTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
                {unverifiedSuffix(cars, t.value)}
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
            {families.map(([brand, list]) => (
              <optgroup key={brand} label={brand}>
                {list.map((c) => (
                  <option key={c.family} value={c.family}>
                    {c.brand} {c.family === "byd-atto-3" ? "Atto 3" : c.model}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label>
          Availability
          <select
            value={filters.availability}
            onChange={(e) => change("availability", e.target.value)}
          >
            <option value="all">All records</option>
            {Object.entries(availabilityLabels).map(([key, val]) => (
              <option key={key} value={key}>
                {val}
              </option>
            ))}
          </select>
        </label>
        <label>
          Maximum listed AUD
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
            {["all", "AWD", "RWD", "FWD", "2WD"].map((v) => (
              <option key={v} value={v}>
                {v === "all" ? "Any drive" : v}
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
            <option value="5">5 seats</option>
            <option value="6">6 seats</option>
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
        Budget filters use dated list/base prices. Unknown numeric and equipment
        records stay visible for review. A selectable listing is not a stock
        guarantee.
      </p>
      <div className="section-heading">
        <p role="status">{filtered.length} matching variants</p>
        <button
          className="text-button"
          onClick={() => {
            setFilters({
              q: "",
              type: DEFAULT_TYPE,
              family: "all",
              availability: "all",
              budget: "",
              range: "",
              drive: "all",
              seats: "all",
              equipment: "all",
            });
            window.history.replaceState(null, "", "/cars");
          }}
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
      <div className="vehicle-grid three">
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
      {filtered.length > limit && (
        <p>
          <button
            className="button secondary"
            onClick={() => setLimit(limit + PAGE)}
          >
            Show {Math.min(PAGE, filtered.length - limit)} more of{" "}
            {filtered.length - limit} remaining
          </button>
        </p>
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
