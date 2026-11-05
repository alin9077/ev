import test from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogue, research } from "../src/lib/data";
import {
  buyerAvailability,
  buyerAvailabilityLabels,
  buyerAvailabilityText,
  buyerAvailabilityCheckedAt,
  matchesBuyerAvailability,
  statedArrivalTiming,
} from "../src/lib/buyer-availability";
import {
  DEFAULT_VEHICLE_SCOPE,
  matchesVehicleScope,
  readVehicleScope,
  vehicleScopeOptions,
} from "../src/lib/vehicle-scope";
import {
  clearExplorerFilters,
  explorerFilterUrl,
  readExplorerFilters,
} from "../src/lib/explorer-state";
import { filterDiscoveryCars } from "../src/lib/discovery";
import { comparisonPickerCars } from "../src/lib/picker-car";
import { compiledSource, elementNodes } from "./helpers/compiled-source";

const cars = catalogue();
const sourceIds = ["maker"];
const evidence = {
  checkedAt: "2026-10-10",
  orderStatus: "listed_unconfirmed",
  stockStatus: "unverified",
  sourceIds,
  qualifications: [],
  physicalStockVerified: false,
  factoryOrderAcceptanceVerified: false,
};

test("three buyer availability states preserve internal states and stock limits", () => {
  assert.deepEqual(Object.values(buyerAvailabilityLabels), [
    "On sale now",
    "Order open or arriving",
    "Not confirmed",
  ]);
  const current = {
    availability: "current_or_order_listed",
    availabilityEvidence: evidence,
  };
  const before = structuredClone(current);
  assert.equal(buyerAvailabilityText(current), "On sale now");
  assert.deepEqual(current, before);
  assert.equal(
    buyerAvailability({ ...current, availability: "outgoing" }),
    "not_confirmed",
  );
  assert.equal(
    buyerAvailability({ ...current, availability: "announced_provisional" }),
    "not_confirmed",
  );
  assert.equal(
    buyerAvailability({
      ...current,
      availability: "not_current",
      availabilityEvidence: { ...evidence, stockStatus: "new_stock_listed" },
    }),
    "not_confirmed",
  );
  const advertised = {
    availability: "outgoing",
    availabilityEvidence: { ...evidence, stockStatus: "new_stock_listed" },
  };
  assert.equal(buyerAvailabilityText(advertised), "On sale now");
  assert.equal(advertised.availabilityEvidence.physicalStockVerified, false);
  assert.equal(
    buyerAvailability({
      ...advertised,
      availabilityEvidence: {
        ...advertised.availabilityEvidence,
        sourceIds: [],
      },
    }),
    "not_confirmed",
  );
  assert.equal(matchesBuyerAvailability(advertised, "on_sale_now"), true);
  assert.equal(matchesBuyerAvailability(advertised, "outgoing"), true);
  assert.equal(
    matchesBuyerAvailability(advertised, "current_or_order_listed"),
    false,
  );
});

test("order-open and pre-order labels do not invent timing or accepted allocations", () => {
  for (const orderStatus of [
    "accepting_orders",
    "accepting_orders_advertised",
    "preorder",
  ]) {
    const car = {
      availability: "announced_provisional",
      availabilityEvidence: { ...evidence, orderStatus },
    };
    assert.equal(buyerAvailabilityText(car), "Order open or arriving");
    assert.equal(
      car.availabilityEvidence.factoryOrderAcceptanceVerified,
      false,
    );
  }
  const provisional = {
    availability: "announced_provisional",
    availabilityEvidence: {
      ...evidence,
      qualifications: [
        "MY27; checked October 2026",
        "No first customer deliveries expected from November 2026 have been verified.",
      ],
    },
  };
  assert.equal(statedArrivalTiming(provisional), undefined);
  assert.equal(buyerAvailabilityText(provisional), "Not confirmed");
  const arrival = {
    ...provisional,
    availabilityEvidence: {
      ...evidence,
      qualifications: [
        "First customer deliveries expected from November 2026; not observed delivery.",
      ],
    },
  };
  assert.equal(
    buyerAvailabilityText(arrival),
    "Order open or arriving · expected from November 2026",
  );
  assert.equal(
    statedArrivalTiming({
      ...arrival,
      availabilityEvidence: { ...arrival.availabilityEvidence, sourceIds: [] },
    }),
    undefined,
  );
});

test("real catalogue arrival wording and dealer stock evidence remain conservative", () => {
  const city = cars.find((car) => car.id.startsWith("ford_transit_city"))!;
  assert.equal(
    buyerAvailabilityText(city),
    "Order open or arriving · expected from November 2026",
  );
  assert.equal(city.availability, "announced_provisional");
  assert.equal(city.availabilityEvidence?.stockStatus, "unverified");
  const cx6e = cars.filter((car) => car.id.startsWith("mazda_cx6e"));
  for (const car of cx6e) {
    assert.equal(buyerAvailabilityText(car), "Order open or arriving");
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
  }
  for (const car of cars.filter((car) => car.id.startsWith("kia_ev4_my27"))) {
    // Current maker configuration/pricing establishes an advertised offer,
    // while neither an allocated order nor a physical unit is inferred.
    assert.equal(buyerAvailabilityText(car), "On sale now");
    assert.equal(car.availabilityEvidence?.physicalStockVerified, false);
    assert.equal(
      car.availabilityEvidence?.factoryOrderAcceptanceVerified,
      false,
    );
    assert.equal(car.availabilityEvidence?.stockStatus, "unverified");
    assert.equal(statedArrivalTiming(car), undefined);
    assert.ok(car.availabilityEvidence?.sourceIds.length);
  }
});

test("default scope selects Tier 1 without dropping any records or changing evidence", () => {
  const before = JSON.stringify(cars);
  const expected = cars.filter(
    (car) =>
      !car.vehicleClass || ["passenger", "ute"].includes(car.vehicleClass),
  );
  assert.deepEqual(
    cars.filter((car) => matchesVehicleScope(car)),
    expected,
  );
  assert.ok(expected.some((car) => car.vehicleClass === "ute"));
  assert.equal(
    cars.filter((car) => matchesVehicleScope(car, "all")).length,
    cars.length,
  );
  for (const scope of ["van", "truck", "bus", "motorcycle", "other"])
    assert.ok(
      cars
        .filter((car) => matchesVehicleScope(car, scope))
        .every((car) => car.vehicleClass === scope),
    );
  assert.equal(readVehicleScope(null), DEFAULT_VEHICLE_SCOPE);
  assert.equal(readVehicleScope(""), DEFAULT_VEHICLE_SCOPE);
  assert.equal(readVehicleScope("not-a-type"), DEFAULT_VEHICLE_SCOPE);
  assert.equal(JSON.stringify(cars), before);
  assert.ok(vehicleScopeOptions(cars).some((option) => option.value === "van"));
});

test("discovery default and explicit scope preserve search and stock filters", () => {
  const policy = { asOf: "2026-10-13" };
  const selected = filterDiscoveryCars(cars, "", "", false, policy);
  assert.deepEqual(
    selected,
    cars.filter((car) => matchesVehicleScope(car)),
  );
  assert.equal(
    filterDiscoveryCars(cars, "", "all", false, policy).length,
    cars.length,
  );
  const vans = filterDiscoveryCars(cars, "Kangoo", "van", false, policy);
  assert.ok(vans.length > 0);
  assert.ok(vans.every((car) => car.vehicleClass === "van"));
  assert.equal(
    filterDiscoveryCars(cars, "Kangoo", "tier1", false, policy).length,
    0,
  );
  assert.ok(
    filterDiscoveryCars(cars, "", "all", true, policy).every(
      (car) => car.availabilityEvidence?.stockStatus === "new_stock_listed",
    ),
  );
});

test("Explorer scope round trips in hosted and portable URLs and reset returns Tier 1", () => {
  for (const scope of ["van", "truck", "all", "tier1"]) {
    const filters = readExplorerFilters({ class: scope, availability: "all" });
    for (const location of [
      { pathname: "/cars", protocol: "https:", search: "" },
      {
        pathname: "/review/index.html",
        protocol: "file:",
        search: "?page=/cars",
      },
    ]) {
      const url = new URL(
        explorerFilterUrl(filters, location),
        "https://roadmark.invalid",
      );
      assert.equal(readExplorerFilters(url.searchParams).class, scope);
    }
  }
  assert.equal(readExplorerFilters(new URLSearchParams()).class, "tier1");
  assert.equal(clearExplorerFilters().class, "tier1");
});

function componentHarness(
  path: string,
  overrides: Record<string, unknown> = {},
) {
  const states: unknown[] = [];
  const refs: { current: unknown }[] = [];
  const effects: (() => unknown)[] = [];
  let stateIndex = 0,
    refIndex = 0,
    mounted = false;
  const hooks = {
    ...React,
    useState: (initial: unknown) => {
      const i = stateIndex++;
      if (!(i in states))
        states[i] = typeof initial === "function" ? initial() : initial;
      return [
        states[i],
        (value: unknown) => {
          states[i] = typeof value === "function" ? value(states[i]) : value;
        },
      ];
    },
    useRef: (initial: unknown) =>
      refs[refIndex++] ?? (refs[refIndex - 1] = { current: initial }),
    useEffect: (effect: () => unknown) => {
      if (!mounted) effects.push(effect);
    },
    useMemo: (get: () => unknown) => get(),
  };
  const compiled = compiledSource(path, { react: hooks, ...overrides });
  const Component = (compiled.default ?? compiled.VariantPicker) as (
    props: unknown,
  ) => React.ReactNode;
  return {
    states,
    mountEffects: () => {
      for (const effect of effects) effect();
    },
    render: (props: unknown) => {
      stateIndex = 0;
      refIndex = 0;
      const tree = Component(props);
      mounted = true;
      return tree;
    },
  };
}

function browserHarness(initial: string) {
  const original = Object.fromEntries(
    ["window", "location", "history"].map((key) => [
      key,
      Object.getOwnPropertyDescriptor(globalThis, key),
    ]),
  );
  let location = new URL(initial, "https://roadmark.invalid");
  const events = new Map<string, () => void>();
  const writes: string[] = [];
  const history = {
    state: { kept: true },
    pushState: (_state: unknown, _title: string, url: string) => {
      location = new URL(url, location);
      writes.push(location.href);
    },
    replaceState: (_state: unknown, _title: string, url: string) => {
      location = new URL(url, location);
    },
  };
  const window = {
    get location() {
      return location;
    },
    history,
    addEventListener: (name: string, fn: () => void) => events.set(name, fn),
    removeEventListener: (name: string) => events.delete(name),
    setInterval: () => 0,
  };
  Object.defineProperties(globalThis, {
    window: { configurable: true, value: window },
    location: { configurable: true, get: () => location },
    history: { configurable: true, value: history },
  });
  return {
    writes,
    get location() {
      return location;
    },
    navigate: (url: string) => {
      location = new URL(url, location);
      events.get("popstate")?.();
    },
    close: () => {
      for (const key of Object.keys(original)) {
        const value = original[key];
        if (value) Object.defineProperty(globalThis, key, value);
        else Reflect.deleteProperty(globalThis, key);
      }
    },
  };
}

test("discovery vehicle and attribute modes respect scope and restore URLs without losing selected vehicles", () => {
  const passenger = cars.find(
    (car) => (car.vehicleClass || "passenger") === "passenger",
  )!;
  const van = cars.find((car) => car.vehicleClass === "van")!;
  const subset = [passenger, van];
  const browser = browserHarness(`/discover?selected=${van.id}&class=van`);
  try {
    const harness = componentHarness("src/components/discovery.tsx");
    const props = { cars: subset, sources: research().sources };
    const initial = harness.render(props);
    const cards = (tree: unknown) =>
      elementNodes(tree).filter(
        (node) => node.props.className === "discovery-car",
      );
    assert.equal(cards(initial).length, 1);
    assert.match(renderToStaticMarkup(initial), new RegExp(passenger.model));
    harness.mountEffects();
    let tree = harness.render(props);
    assert.equal(cards(tree).length, 1);
    assert.deepEqual(harness.states[7], [van.id]);
    const control = elementNodes(tree).find(
      (node) => node.type === "select" && node.props.value === "van",
    )!;
    control.props.onChange!({ target: { value: "tier1" } });
    assert.equal(browser.location.searchParams.get("class"), "tier1");
    assert.equal(browser.location.searchParams.get("selected"), van.id);
    browser.navigate(`/discover?mode=attribute&class=van&selected=${van.id}`);
    tree = harness.render(props);
    assert.equal(harness.states[0], "attribute");
    assert.equal(harness.states[2], "van");
    assert.deepEqual(harness.states[7], [van.id]);
    const html = renderToStaticMarkup(tree);
    assert.ok(html.includes(van.model));
    assert.ok(!html.includes(`${passenger.brand} ${passenger.model}</strong>`));
    browser.navigate("/discover");
    harness.render(props);
    assert.equal(harness.states[2], "tier1");
  } finally {
    browser.close();
  }
});

test("picker default and reset show Tier 1, explicit vans work, and chosen comparison is not cleared", () => {
  const passenger = cars.find(
    (car) => (car.vehicleClass || "passenger") === "passenger",
  )!;
  const van = cars.find(
    (car) =>
      car.vehicleClass === "van" &&
      car.availability === "current_or_order_listed",
  )!;
  const projected = comparisonPickerCars([passenger, van]);
  assert.equal(projected[1].vehicleClass, "van");
  assert.equal(buyerAvailabilityText(projected[1]), buyerAvailabilityText(van));
  assert.equal(
    buyerAvailabilityCheckedAt(projected[1]),
    van.availabilityEvidence!.checkedAt,
  );
  let chosen: string | undefined;
  const harness = componentHarness("src/components/picker.tsx");
  const props = {
    cars: projected,
    selected: van.id,
    onSelect: (id: string) => {
      chosen = id;
    },
    label: "Choose vehicle",
  };
  let tree = harness.render(props);
  const trigger = elementNodes(tree).find(
    (node) => node.props.className === "picker-trigger",
  )!;
  trigger.props.onClick!();
  tree = harness.render(props);
  const options = (value: unknown) =>
    elementNodes(value).filter(
      (node) => node.props.className === "picker-option",
    );
  assert.equal(options(tree).length, 1);
  assert.ok(
    renderToStaticMarkup(
      options(tree)[0] as unknown as React.ReactElement,
    ).includes(passenger.trim),
  );
  elementNodes(tree).find(
    (node) => node.type === "select" && node.props.value === "tier1",
  )!.props.onChange!({ target: { value: "van" } });
  tree = harness.render(props);
  assert.equal(options(tree).length, 1);
  assert.ok(
    renderToStaticMarkup(
      options(tree)[0] as unknown as React.ReactElement,
    ).includes(van.trim),
  );
  elementNodes(tree).find(
    (node) => node.type === "button" && node.props.children === "Reset filters",
  )!.props.onClick!();
  tree = harness.render(props);
  assert.equal(options(tree).length, 1);
  assert.equal(chosen, undefined);
  assert.ok(renderToStaticMarkup(tree).includes(van.model));
});

test("Explorer restores explicit classes on history and reset without discarding comparison choices", async () => {
  const passenger = cars.find(
    (car) => (car.vehicleClass || "passenger") === "passenger",
  )!;
  const van = cars.find(
    (car) =>
      car.vehicleClass === "van" &&
      car.availability === "current_or_order_listed",
  )!;
  const browser = browserHarness("/cars?class=van&availability=all");
  try {
    const harness = componentHarness("src/components/explorer.tsx", {
      "next/navigation": { useRouter: () => ({ push: () => {} }) },
      "./ui": { Notice: () => null, VehicleCard: () => null },
    });
    const props = {
      cars: [passenger, van],
      initial: { class: "van", availability: "all" },
      equipment: {},
    };
    harness.render(props);
    harness.mountEffects();
    await Promise.resolve();
    let tree = harness.render(props);
    const selected = harness.states[2];
    const scopeControl = () =>
      elementNodes(tree).find(
        (node) => node.type === "select" && node.props.value === "van",
      )!;
    scopeControl().props.onChange!({ target: { value: "all" } });
    assert.equal(browser.location.searchParams.get("class"), "all");
    assert.deepEqual(harness.states[2], selected);
    browser.navigate("/cars?class=truck&availability=all");
    tree = harness.render(props);
    assert.equal((harness.states[0] as { class: string }).class, "truck");
    const clear = elementNodes(tree).find(
      (node) =>
        node.type === "button" && node.props.children === "Clear all filters",
    )!;
    clear.props.onClick!();
    assert.equal(browser.location.searchParams.get("class"), "tier1");
    assert.deepEqual(harness.states[2], selected);
    browser.navigate("/cars?class=van&availability=all");
    harness.render(props);
    assert.equal((harness.states[0] as { class: string }).class, "van");
    assert.deepEqual(harness.states[2], selected);
  } finally {
    browser.close();
  }
});

test("market directory also defaults to Tier 1 with other classes one filter away", () => {
  const records = ["passenger", "ute", "van", "truck", undefined].map(
    (vehicleClass, index) => ({
      id: `scope-${index}`,
      vehicleClass,
      brand: "Example",
      model: `Model ${index}`,
      trims: [],
      orderStatus: "listed_unconfirmed",
      stockStatus: "unverified",
      checkedAt: "2026-10-13",
      trimCoverage: "not_verified",
      evidenceNote: "",
      sourceUrls: [],
      limitations: [],
    }),
  );
  const harness = componentHarness("src/components/market-audit.tsx", {
    "@/lib/market-view-data": {
      __esModule: true,
      default: {
        records,
        checkedAt: "2026-10-13",
        statusDefinitions: {},
        notes: [],
        scope: "Directory",
      },
    },
  });
  let tree = harness.render({});
  const articles = (value: unknown) =>
    elementNodes(value).filter((node) => node.type === "article");
  assert.equal(articles(tree).length, 2);
  const control = elementNodes(tree).find(
    (node) => node.type === "select" && node.props.value === "tier1",
  )!;
  control.props.onChange!({ target: { value: "all" } });
  tree = harness.render({});
  assert.equal(articles(tree).length, records.length);
  elementNodes(tree).find(
    (node) => node.type === "select" && node.props.value === "all",
  )!.props.onChange!({ target: { value: "van" } });
  tree = harness.render({});
  assert.equal(articles(tree).length, 1);
  assert.ok(renderToStaticMarkup(tree).includes("Model 2"));
});

test("picker price display keeps ladder basis, checked date and earned grades in its compact projection", () => {
  for (const grade of [
    "confirmed",
    "check",
    "reported",
    "not_published",
    undefined,
  ] as const) {
    const car = structuredClone(cars[0]);
    const price = car.facts.price_aud;
    price.value =
      grade === "not_published" || grade === undefined ? null : 50000;
    price.buyerGrade = grade;
    price.status = grade === "confirmed" ? "standard" : "conditional";
    price.date = "2026-10-02";
    price.basis = "Legacy maker basis";
    price.conditionExplanation = "Price applies with the named wheel option.";
    price.priceEvidence = {
      rung: 5,
      basisTag: "Reported by Example publication",
      publisher: "Example publication",
      sourceKey: "price_aud",
      sourcePointer: "synthetic-test",
      originalBasis: price.basis,
      rankingEligible: false,
    };
    price.gradeReview = {
      reviewedAt: "2026-10-13",
      overlayId: "test",
      reason: "Test display",
      evidenceScope: "secondary_or_sibling",
      sourceIds: ["test"],
      sourceLabel: "Example publication",
    };
    const [projected] = comparisonPickerCars([car]);
    assert.equal(projected.facts.price_aud.buyerGrade, grade);
    assert.equal(projected.facts.price_aud.date, "2026-10-02");
    assert.ok(!("sourceIds" in projected.facts.price_aud));
    assert.ok(!("sourcePointer" in projected.facts.price_aud.priceEvidence!));
    const harness = componentHarness("src/components/picker.tsx");
    const props = {
      cars: [projected],
      onSelect: () => {},
      label: "Choose a car",
    };
    harness.render(props);
    harness.states[0] = true;
    const html = renderToStaticMarkup(harness.render(props));
    assert.ok(html.includes("Reported by Example publication"));
    assert.ok(html.includes("2026-10-02"));
    assert.ok(html.includes("Availability checked on"));
    assert.equal(
      buyerAvailabilityCheckedAt(projected),
      car.availabilityEvidence!.checkedAt,
    );
    assert.ok(!html.includes("Dated list/base"));
    if (grade === "reported") {
      assert.ok(html.includes('class="muted">A$50,000'));
      assert.ok(html.includes("Example publication"));
    }
    if (grade === "check")
      assert.ok(html.includes("Price applies with the named wheel option."));
    if (grade === "not_published") assert.ok(html.includes("Not published"));
    if (grade === undefined) assert.ok(!html.includes("Not published"));
  }
});
