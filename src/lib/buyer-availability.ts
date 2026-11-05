import type { Car } from "./types";

/** Buyer labels are a presentation layer. The underlying evidence remains intact. */
export const buyerAvailabilityLabels = {
  on_sale_now: "On sale now",
  order_open_or_arriving: "Order open or arriving",
  not_confirmed: "Not confirmed",
} as const;
export type BuyerAvailability = keyof typeof buyerAvailabilityLabels;
export type AvailabilityCar = Pick<
  Car,
  "availability" | "availabilityEvidence"
> & {
  /** Small, precomputed selection-only projection; full evidence lives on the pack. */
  buyerAvailabilityDisplay?: {
    state: BuyerAvailability;
    timing?: string;
    checkedAt?: string;
  };
};

/**
 * Read a stated market arrival window verbatim, never a model year, check date,
 * dealer stock badge or an individual delivery promise. Existing evidence uses
 * explicit first-delivery statements; unrecognised prose stays in full details.
 */
export function statedArrivalTiming(car: AvailabilityCar): string | undefined {
  if (car.buyerAvailabilityDisplay) return car.buyerAvailabilityDisplay.timing;
  if (!car.availabilityEvidence?.sourceIds.length) return undefined;
  const month =
    "(?:January|February|March|April|May|June|July|August|September|October|November|December)";
  const date = `(?:${month} \\d{4}|Q[1-4] \\d{4}|\\d{4} Q[1-4])`;
  const pattern = new RegExp(
    `^First (?:customer )?deliveries (expected(?: from)? ${date})(?=[.;,]|$)`,
    "i",
  );
  for (const qualification of car.availabilityEvidence.qualifications ?? []) {
    const match = qualification.trim().match(pattern);
    if (match) return match[1];
  }
  return undefined;
}

export function buyerAvailability(car: AvailabilityCar): BuyerAvailability {
  if (car.buyerAvailabilityDisplay) return car.buyerAvailabilityDisplay.state;
  const evidence = car.availabilityEvidence;
  const supported = Boolean(evidence?.sourceIds.length);
  // A retained "not current" decision must never be promoted by a stray badge.
  if (car.availability === "not_current") return "not_confirmed";
  if (
    supported &&
    (evidence?.orderStatus === "preorder" ||
      (car.availability === "announced_provisional" &&
        (["accepting_orders", "accepting_orders_advertised"].includes(
          evidence?.orderStatus ?? "",
        ) ||
          statedArrivalTiming(car))))
  )
    return "order_open_or_arriving";
  // "On sale" means an advertised current version, never physical possession,
  // accepted factory allocation, immediate delivery or an unsold dealer unit.
  if (car.availability === "current_or_order_listed") return "on_sale_now";
  if (supported && evidence?.stockStatus === "new_stock_listed")
    return "on_sale_now";
  if (
    supported &&
    ["accepting_orders", "accepting_orders_advertised"].includes(
      evidence?.orderStatus ?? "",
    )
  )
    return "order_open_or_arriving";
  return "not_confirmed";
}

export function buyerAvailabilityText(car: AvailabilityCar): string {
  const state = buyerAvailability(car);
  const timing = state === "order_open_or_arriving" && statedArrivalTiming(car);
  return `${buyerAvailabilityLabels[state]}${timing ? ` · ${timing}` : ""}`;
}

/** Old shared URLs remain exact filters; new controls use the three buyer states. */
export function matchesBuyerAvailability(car: AvailabilityCar, value: string) {
  return (
    value === "all" ||
    (Object.hasOwn(buyerAvailabilityLabels, value)
      ? buyerAvailability(car) === value
      : car.availability === value)
  );
}

/** A display projection keeps the original check date, never the render date. */
export function buyerAvailabilityCheckedAt(car: AvailabilityCar): string {
  return (
    car.buyerAvailabilityDisplay?.checkedAt ??
    car.availabilityEvidence?.checkedAt ??
    ""
  );
}
