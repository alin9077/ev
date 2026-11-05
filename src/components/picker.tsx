"use client";
import {
  matchesSearch,
  catalogueFilterOptions,
  driveFilterKey,
} from "@/lib/search";
import { useEffect, useRef, useState } from "react";
import {
  pickerPriceIsReported,
  type ComparisonPickerCar,
} from "@/lib/picker-car";
import { buyerGradeOf, gradeLabel } from "@/lib/evidence-grading";
import { FreshnessLabel } from "./freshness-label";
import type { Car } from "@/lib/types";
import {
  buyerAvailabilityLabels,
  buyerAvailabilityText,
  buyerAvailabilityCheckedAt,
  matchesBuyerAvailability,
} from "@/lib/buyer-availability";
import {
  DEFAULT_VEHICLE_SCOPE,
  matchesVehicleScope,
  vehicleScopeOptions,
} from "@/lib/vehicle-scope";
import { formatFact } from "@/lib/compare";
export function VariantPicker({
  cars,
  selected,
  exclude = [],
  baseline = false,
  onSelect,
  label,
}: {
  cars: (Car | ComparisonPickerCar)[];
  selected?: string;
  exclude?: string[];
  baseline?: boolean;
  onSelect: (id: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false),
    [q, setQ] = useState(""),
    [availability, setAvailability] = useState("on_sale_now"),
    [drive, setDrive] = useState("all"),
    [budget, setBudget] = useState(""),
    [range, setRange] = useState(""),
    [seats, setSeats] = useState("all"),
    [basis, setBasis] = useState("all");
  const [vehicleClass, setVehicleClass] = useState<string>(
    DEFAULT_VEHICLE_SCOPE,
  );
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const chosen = cars.find((c) => c.id === selected);
  const filterOptions = catalogueFilterOptions(cars);
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
      matchesVehicleScope(c, vehicleClass) &&
      (!baseline || c.modelId === "tesla_model_y") &&
      !exclude.includes(c.id) &&
      matchesSearch(`${c.brand} ${c.model} ${c.trim} ${c.generation}`, q) &&
      matchesBuyerAvailability(c, availability) &&
      (drive === "all" || driveFilterKey(c.drive) === drive) &&
      (seats === "all" || c.facts.seats.value === Number(seats)) &&
      (!budget ||
        c.facts.price_aud.value === null ||
        Number(c.facts.price_aud.value) <= Number(budget)) &&
      (!range ||
        c.facts.range_km.value === null ||
        Number(c.facts.range_km.value) >= Number(range)) &&
      (basis === "all" ||
        (basis === "reported"
          ? pickerPriceIsReported(c.facts.price_aud)
          : !pickerPriceIsReported(c.facts.price_aud))),
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
              Vehicle type
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value)}
              >
                {vehicleScopeOptions(cars).map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Availability
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
              >
                <option value="all">All research records</option>
                {Object.entries(buyerAvailabilityLabels).map(([v, l]) => (
                  <option value={v} key={v}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Drive
              <select value={drive} onChange={(e) => setDrive(e.target.value)}>
                {["all", ...filterOptions.drive].map((x) => (
                  <option value={x} key={x}>
                    {x === "all"
                      ? "Any drive"
                      : x === "unknown"
                        ? "Drive unverified"
                        : x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Maximum published AUD
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
                {filterOptions.seats.map((count) => (
                  <option key={count} value={count}>
                    {count} {count === 1 ? "seat" : "seats"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price evidence
              <select value={basis} onChange={(e) => setBasis(e.target.value)}>
                <option value="all">All published prices</option>
                <option value="manufacturer">Manufacturer listed</option>
                <option value="reported">Reported or dealer price</option>
              </select>
            </label>
          </div>
          <p className="small muted">
            Budget uses displayed published prices. Check the price basis and
            state; before-on-road and driveaway prices are different. Unknown
            numeric values stay in results for review.
          </p>
          <div className="picker-result-count">
            <p aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "variant" : "variants"}
            </p>
            <button
              className="text-button"
              onClick={() => {
                setQ("");
                setVehicleClass(DEFAULT_VEHICLE_SCOPE);
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
                          {buyerAvailabilityText(c)} · {c.drive} ·{" "}
                          {c.facts.seats.value === null
                            ? "Seats unverified"
                            : `${c.facts.seats.value} seats`}
                        </span>
                        <span className="small">
                          <FreshnessLabel
                            checkedAt={buyerAvailabilityCheckedAt(c)}
                            factKey="availability"
                            prefix="Availability checked on"
                          />
                        </span>
                      </span>
                      <span>
                        <span
                          className={
                            buyerGradeOf(c.facts.price_aud) === "reported"
                              ? "muted"
                              : undefined
                          }
                        >
                          {buyerGradeOf(c.facts.price_aud) === "not_published"
                            ? "Not published"
                            : formatFact(c.facts.price_aud)}
                        </span>
                        <span className="small">
                          {c.facts.price_aud.priceEvidence?.basisTag ||
                            c.facts.price_aud.basis}
                        </span>
                        <span className="small">
                          <FreshnessLabel
                            checkedAt={c.facts.price_aud.date}
                            factKey="price_aud"
                          />
                        </span>
                        {buyerGradeOf(c.facts.price_aud) === "reported" && (
                          <span className="small muted">
                            {gradeLabel("reported")} ·{" "}
                            {c.facts.price_aud.gradeReview?.sourceLabel ||
                              c.facts.price_aud.priceEvidence?.publisher ||
                              "see exact-version source"}
                          </span>
                        )}
                        {buyerGradeOf(c.facts.price_aud) === "check" && (
                          <span
                            className="small"
                            title={c.facts.price_aud.conditionExplanation}
                          >
                            ◇ {gradeLabel("check")}
                            {c.facts.price_aud.conditionExplanation
                              ? `: ${c.facts.price_aud.conditionExplanation}`
                              : " · see exact-version condition"}
                          </span>
                        )}
                        {!buyerGradeOf(c.facts.price_aud) &&
                          c.facts.price_aud.status === "conditional" && (
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
