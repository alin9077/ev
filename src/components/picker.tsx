"use client";
import { useEffect, useRef, useState } from "react";
import type { Car } from "@/lib/types";
import { availabilityLabels } from "@/lib/config";
import { formatFact } from "@/lib/compare";
export function VariantPicker({
  cars,
  selected,
  exclude = [],
  baseline = false,
  onSelect,
  label,
}: {
  cars: Car[];
  selected?: string;
  exclude?: string[];
  baseline?: boolean;
  onSelect: (id: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false),
    [q, setQ] = useState(""),
    [availability, setAvailability] = useState("current_or_order_listed"),
    [drive, setDrive] = useState("all"),
    [budget, setBudget] = useState(""),
    [range, setRange] = useState(""),
    [seats, setSeats] = useState("all"),
    [basis, setBasis] = useState("all");
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const chosen = cars.find((c) => c.id === selected);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else {
      dialog.current?.close();
    }
  }, [open]);
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  const filtered = cars.filter(
    (c) =>
      (!baseline || c.modelId === "tesla_model_y") &&
      !exclude.includes(c.id) &&
      `${c.brand} ${c.model} ${c.trim} ${c.generation}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (availability === "all" || c.availability === availability) &&
      (drive === "all" || c.drive === drive) &&
      (seats === "all" || c.facts.seats.value === Number(seats)) &&
      (!budget ||
        c.facts.price_aud.value === null ||
        Number(c.facts.price_aud.value) <= Number(budget)) &&
      (!range ||
        c.facts.range_km.value === null ||
        Number(c.facts.range_km.value) >= Number(range)) &&
      (basis === "all" ||
        (basis === "reported"
          ? c.facts.price_aud.basis.toLowerCase().includes("reported")
          : !c.facts.price_aud.basis.toLowerCase().includes("reported"))),
  );
  const groups = [...new Set(filtered.map((c) => c.family))];
  return (
    <>
      <button
        ref={trigger}
        className="picker-trigger"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <span className="small">{label}</span>
        <strong>
          {chosen ? `${chosen.brand} ${chosen.model}` : "Add a vehicle"}
        </strong>
        <span>{chosen?.trim || "Search the researched shortlist"}</span>
        <span className="picker-symbol" aria-hidden="true">
          ⌄
        </span>
      </button>
      {open && (
        <dialog
          ref={dialog}
          className="picker-dialog"
          aria-label={label}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="drawer-heading">
            <div>
              <span className="eyebrow">Exact Australian variants</span>
              <h2>{label}</h2>
            </div>
            <button
              className="icon-button"
              onClick={close}
              aria-label="Close vehicle picker"
            >
              ×
            </button>
          </div>
          <label>
            Search by model, trim or generation
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Try EV3, Performance or Extended Range"
            />
          </label>
          <div className="picker-filters">
            <label>
              Availability
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="all">All research records</option>
                {Object.entries(availabilityLabels).map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Drive
              <select value={drive} onChange={(e) => setDrive(e.target.value)}>
                {["all", "AWD", "RWD", "FWD", "2WD"].map((x) => (
                  <option value={x} key={x}>
                    {x === "all" ? "Any drive" : x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Maximum listed AUD
              <input
                inputMode="numeric"
                type="number"
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Any budget"
              />
            </label>
            <label>
              Minimum claimed km
              <input
                inputMode="numeric"
                type="number"
                min="0"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="Any range"
              />
            </label>
            <label>
              Seats
              <select value={seats} onChange={(e) => setSeats(e.target.value)}>
                <option value="all">Any seats</option>
                <option value="5">5 seats</option>
                <option value="6">6 seats</option>
              </select>
            </label>
            <label>
              Price evidence
              <select value={basis} onChange={(e) => setBasis(e.target.value)}>
                <option value="all">All list/base records</option>
                <option value="manufacturer">Manufacturer listed</option>
                <option value="reported">Reported price</option>
              </select>
            </label>
          </div>
          <p className="small muted">
            Budget uses dated base/list prices, not driveaway quotes. Unknown
            numeric values stay in results for review.
          </p>
          <div className="picker-result-count">
            <p aria-live="polite">{filtered.length} variants</p>
            <button
              className="text-button"
              onClick={() => {
                setQ("");
                setAvailability("all");
                setDrive("all");
                setBudget("");
                setRange("");
                setSeats("all");
                setBasis("all");
              }}
            >
              Reset filters
            </button>
          </div>
          <div className="picker-results">
            {groups.map((group) => (
              <section key={group}>
                <h3>
                  {filtered.find((c) => c.family === group)?.brand}{" "}
                  {group === "byd-atto-3"
                    ? "Atto 3 family"
                    : filtered.find((c) => c.family === group)?.model}
                </h3>
                {filtered
                  .filter((c) => c.family === group)
                  .map((c) => (
                    <button
                      key={c.id}
                      className="picker-option"
                      onClick={() => {
                        onSelect(c.id);
                        close();
                      }}
                    >
                      <span>
                        <strong>{c.trim}</strong>
                        <span className="small">{c.generation}</span>
                        <span className="small">
                          {availabilityLabels[c.availability]} · {c.drive} ·{" "}
                          {c.facts.seats.value} seats
                        </span>
                      </span>
                      <span>
                        {formatFact(c.facts.price_aud)}
                        <span className="small">Dated list/base</span>
                        {c.facts.price_aud.status === "conditional" && (
                          <span className="small">Needs confirmation</span>
                        )}
                      </span>
                    </button>
                  ))}
              </section>
            ))}
            {!filtered.length && (
              <p>No matching variants. Try widening your filters.</p>
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
