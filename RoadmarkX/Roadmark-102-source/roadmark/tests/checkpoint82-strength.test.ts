import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  carsBeforeCheckpoint84 as catalogue,
  researchBeforeCheckpoint84 as research,
} from "./helpers/checkpoint84-runtime";
import { buyerProposal } from "../src/lib/buyer-proposal";
import {
  buildBuyerSummaries,
  currentBuyerSummary,
  type SellingPointProposal,
} from "../src/lib/selling-points";
import { buyerSummaryNeedsClock } from "../src/lib/buyer-summary-timing";
import Discovery from "../src/components/discovery";
import { BuyerSummary } from "../src/components/buyer-summary";
import { resolveBuyerProposal } from "../src/lib/buyer-proposal-storage";
import type { Car, Source } from "../src/lib/types";
const fixture = JSON.parse(
  readFileSync(
    new URL("../qa/checkpoint82-summary-fixture.json", import.meta.url),
    "utf8",
  ),
);
const id: string = fixture.id,
  cars = catalogue(),
  data = research(),
  target = cars.find((c) => c.id === id)!;
const policy = { asOf: "2026-10-11", maxAgeDays: 30 };
const proposal: SellingPointProposal = {
  ...buyerProposal,
  records: buyerProposal.records.filter((r) => r.variantId === id),
  dependencies: buyerProposal.dependencies.filter((d) => d.variantId === id),
};
const sourceIds = proposal.records[0].availabilityGuardSourceIds!;
const sources = data.sources.filter((s) => sourceIds.includes(s.id));
const keys = proposal.dependencies
  .filter((d) => d.kind === "fact")
  .map((d) => d.key);
const hash = (v: unknown) =>
  createHash("sha256").update(JSON.stringify(v)).digest("hex");
const build = (
  car: Car = structuredClone(target),
  ss: Source[] = structuredClone(sources),
  pp = proposal,
  asOf = policy.asOf,
) => buildBuyerSummaries([car], [], ss, pp, { ...policy, asOf }).get(id);
function mutateCar(fn: (car: Car) => void) {
  const car = structuredClone(target);
  fn(car);
  assert.equal(build(car), undefined);
}
function change(v: unknown): unknown {
  return typeof v === "string"
    ? v + " changed"
    : typeof v === "number"
      ? v + 1
      : typeof v === "boolean"
        ? !v
        : v === null
          ? "changed"
          : Array.isArray(v)
            ? [...v, "changed"]
            : { ...(v as object), changed: true };
}

test("one exact source-attributed strength preserves all prior329 summaries and every other car", () => {
  assert.equal(cars.length, 342);
  assert.equal(cars.filter((c) => c.buyerSummary).length, 330);
  for (const car of cars) {
    if (car.id !== id)
      assert.equal(hash(car), fixture.previousCarHashes[car.id], car.id);
    if (fixture.previousSummaryHashes[car.id])
      assert.equal(
        hash(car.buyerSummary),
        fixture.previousSummaryHashes[car.id],
        car.id,
      );
  }
  assert.deepEqual(build(), target.buyerSummary);
  assert.equal(
    build()!.strength!.label,
    "Removable battery and adjustable regeneration",
  );
  assert.deepEqual(build()!.strength!.sourceIds, [
    "r10_surron_hp_s01_importer_my26",
  ]);
  assert.equal(build()!.tradeoff, undefined);
  assert.equal(Object.hasOwn(proposal.records[0], "tradeoff"), false);
  assert.equal(build()!.conditions.length, 8);
  assert.equal(target.availabilityEvidence!.stockStatus, "unverified");
  assert.equal(Object.keys(target.facts).length, 215);
  assert.equal(
    Object.values(target.facts).filter((f) => f.value === null).length,
    79,
  );
  assert.equal(
    Object.values(target.facts).filter((f) => f.issues.length).length,
    135,
  );
  assert.equal(buildBuyerSummaries([], [], sources, proposal, policy).size, 0);
});

test("full identity and every direct Fact field remain exact guards", () => {
  for (const key of keys) {
    mutateCar((c) => {
      delete c.facts[key];
    });
    for (const field of Object.keys(target.facts[key]))
      mutateCar((c) => {
        const f = c.facts[key] as unknown as Record<string, unknown>;
        f[field] = change(f[field]);
      });
    mutateCar((c) => {
      (c.facts[key] as unknown as Record<string, unknown>).added =
        "not approved";
    });
    for (const invalid of [null, {}, "", undefined])
      mutateCar((c) => {
        Object.assign(c.facts[key], { issues: invalid });
      });
    for (const deadline of ["", "invalid", "2026-10-09", "2026-12-31"])
      mutateCar((c) => {
        c.facts[key].validUntil = deadline;
      });
  }
});

test("every retained null and unrelated issue-bearing Fact is guarded independently", () => {
  for (const [key, fact] of Object.entries(target.facts)) {
    if (fact.value === null) {
      mutateCar((c) => {
        c.facts[key].value = 123;
      });
      mutateCar((c) => {
        delete c.facts[key];
      });
      mutateCar((c) => {
        c.facts[key].qualifications = [];
      });
    }
    if (fact.issues.length) {
      mutateCar((c) => {
        c.facts[key].issues = [];
      });
      mutateCar((c) => {
        c.facts[key].issues[0].title += " changed";
      });
    }
  }
  mutateCar((c) => {
    c.facts.extra = structuredClone(c.facts[keys[0]]);
  });
});

test("all identity, configuration, availability fields and provenance fail closed on changes", () => {
  for (const key of [
    "id",
    "modelId",
    "modelFamily",
    "brand",
    "model",
    "trim",
    "year",
    "vehicleClass",
    "researchStage",
    "family",
    "slug",
    "generation",
    "drive",
  ])
    mutateCar((c) => {
      const r = c as unknown as Record<string, unknown>;
      r[key] = change(r[key]);
    });
  for (const key of Object.keys(target.configurationEvidence!)) {
    mutateCar((c) => {
      const r = c.configurationEvidence as Record<string, unknown>;
      r[key] = change(r[key]);
    });
    mutateCar((c) => {
      delete (c.configurationEvidence as Record<string, unknown>)[key];
    });
  }
  for (const key of Object.keys(
    target.configurationEvidence!.sourceIdentity as object,
  ))
    mutateCar((c) => {
      const r = c.configurationEvidence!.sourceIdentity as Record<
        string,
        unknown
      >;
      r[key] = change(r[key]);
    });
  mutateCar((c) => {
    delete c.configurationEvidence;
  });
  for (const key of Object.keys(target.availabilityEvidence!))
    mutateCar((c) => {
      const r = c.availabilityEvidence as unknown as Record<string, unknown>;
      r[key] = change(r[key]);
    });
  mutateCar((c) => {
    delete c.availabilityEvidence;
  });
  mutateCar((c) => {
    c.availabilityRevision = "changed";
  });
  for (const availability of [
    "outgoing",
    "announced_provisional",
    "not_current",
    "unknown",
  ])
    mutateCar((c) => {
      Object.assign(c, { availability });
    });
});

test("all21 sources reject deletion, each field mutation and every access/conflict/publication hold", () => {
  assert.equal(sources.length, 21);
  for (const source of sources) {
    assert.equal(
      build(
        structuredClone(target),
        sources.filter((s) => s.id !== source.id),
      ),
      undefined,
    );
    for (const key of [
      ...Object.keys(source),
      "access_limitation",
      "conflict",
      "publication_hold",
    ]) {
      const ss = structuredClone(sources),
        actual = ss.find((s) => s.id === source.id)! as unknown as Record<
          string,
          unknown
        >;
      actual[key] = change(actual[key]);
      assert.equal(
        build(structuredClone(target), ss),
        undefined,
        `${source.id}:${key}`,
      );
      assert.equal(
        currentBuyerSummary(target.buyerSummary, ss, policy),
        undefined,
        `${source.id}:${key}:presentation`,
      );
    }
  }
});

test("freshness accepts day30 and suppresses day31, invalid and future evidence", () => {
  assert.ok(build(undefined, undefined, undefined, "2026-11-09"));
  for (const date of ["2026-11-10", "bad", "", "2026-10-09"]) {
    assert.equal(build(undefined, undefined, undefined, date), undefined, date);
    assert.equal(
      currentBuyerSummary(target.buyerSummary, sources, {
        ...policy,
        asOf: date,
      }),
      undefined,
      date,
    );
  }
  for (const date of ["bad", "", "2026-10-12", "2026-08-01"]) {
    const p = structuredClone(proposal);
    p.records[0].checkedAt = date;
    assert.equal(build(undefined, undefined, p), undefined);
    for (let i = 0; i < p.dependencies.length; i++) {
      const q = structuredClone(proposal);
      q.dependencies[i].checkedAt = date;
      assert.equal(build(undefined, undefined, q), undefined);
    }
  }
});

test("all eight conditions and their order remain required at evaluation and presentation", () => {
  for (let i = 0; i < 8; i++) {
    for (const mode of ["remove", "blank", "replace"]) {
      const p = structuredClone(proposal);
      if (mode === "remove")
        p.records[0].requiredVisibleConditions.splice(i, 1);
      else
        p.records[0].requiredVisibleConditions[i] =
          mode === "blank" ? "" : "changed";
      assert.equal(build(undefined, undefined, p), undefined);
      const summary = structuredClone(target.buyerSummary!);
      summary.conditions = p.records[0].requiredVisibleConditions;
      assert.equal(currentBuyerSummary(summary, sources, policy), undefined);
    }
  }
  const p = structuredClone(proposal);
  p.records[0].requiredVisibleConditions.reverse();
  assert.equal(build(undefined, undefined, p), undefined);
});

test("omitted and ineligible clauses are distinct from malformed present tradeoffs", () => {
  for (const invalid of [
    null,
    undefined,
    {},
    [],
    "",
    { label: "", text: "", dependencyIds: [] },
    { label: "x", text: "y", dependencyIds: [] },
    { label: "x", text: "y", dependencyIds: "bad" },
    { label: "x", text: "y", dependencyIds: [42] },
    { label: "x", text: "y", dependencyIds: ["missing"], derivations: [null] },
  ]) {
    const p = structuredClone(proposal);
    Object.assign(p.records[0], { tradeoff: invalid });
    assert.equal(build(undefined, undefined, p), undefined);
  }
  const p = structuredClone(proposal);
  p.records[0].tradeoff = {
    label: "Conditional tradeoff",
    text: "Must not render",
    dependencyIds: ["missing"],
  };
  assert.ok(build(undefined, undefined, p)?.strength);
  assert.equal(build(undefined, undefined, p)?.tradeoff, undefined);
  p.records[0].strength.dependencyIds = ["missing"];
  assert.equal(build(undefined, undefined, p), undefined);
});

test("normalized snapshot storage rejects wrong, missing, mixed and corrupt target references", () => {
  const read = (name: string) =>
    JSON.parse(
      readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"),
    );
  const stored = read("buyer-selling-points-2026-10-10.json"),
    ledger = read("buyer-identity-snapshots-2026-10-10.json");
  for (const ref of [undefined, "i_" + "0".repeat(64), "bad"]) {
    const p = structuredClone(stored);
    p.records.find(
      (r: { variantId: string }) => r.variantId === id,
    ).expectedIdentityRef = ref;
    assert.throws(() => resolveBuyerProposal(p, ledger));
  }
  const mixed = structuredClone(stored);
  mixed.records.find(
    (r: { variantId: string }) => r.variantId === id,
  ).expectedIdentity = { id };
  assert.throws(() => resolveBuyerProposal(mixed, ledger));
  const bad = structuredClone(ledger),
    ref = stored.records.find(
      (r: { variantId: string }) => r.variantId === id,
    ).expectedIdentityRef;
  bad.snapshots[ref].trim = "changed";
  assert.throws(() => resolveBuyerProposal(stored, bad));
  assert.equal(
    new Set(stored.records.map((r: { variantId: string }) => r.variantId)).size,
    stored.records.length,
  );
  assert.equal(
    new Set(stored.dependencies.map((r: { id: string }) => r.id)).size,
    stored.dependencies.length,
  );
  assert.equal(
    new Set(stored.expectedSourceSnapshots.map((r: { id: string }) => r.id))
      .size,
    stored.expectedSourceSnapshots.length,
  );
});

test("static and no-JavaScript buyer sections await a real date for untimed and timed summaries", () => {
  for (const summary of [
    target.buyerSummary!,
    { ...target.buyerSummary!, checkedAt: "invalid" },
    {
      ...target.buyerSummary!,
      strength: { ...target.buyerSummary!.strength!, validUntil: "2026-10-31" },
    },
  ]) {
    assert.equal(buyerSummaryNeedsClock(summary), true);
    assert.equal(
      renderToStaticMarkup(
        createElement(BuyerSummary, {
          car: { buyerSummary: summary },
          sources,
        }),
      ),
      "",
    );
  }
  assert.equal(buyerSummaryNeedsClock(undefined), false);
  assert.equal(
    renderToStaticMarkup(
      createElement(BuyerSummary, {
        car: { buyerSummary: undefined },
        sources,
      }),
    ),
    "",
  );
  assert.ok(
    currentBuyerSummary(target.buyerSummary, sources, {
      ...policy,
      asOf: "2026-11-09",
    }),
  );
  assert.equal(
    currentBuyerSummary(target.buyerSummary, sources, {
      ...policy,
      asOf: "2026-11-10",
    }),
    undefined,
  );
});

test("cached discovery never shows the new age-limited strength before its date check", () => {
  for (const checkedAt of ["2026-10-10", "invalid", "2026-08-01"]) {
    const car = structuredClone(target);
    car.buyerSummary!.checkedAt = checkedAt;
    const html = renderToStaticMarkup(
      createElement(Discovery, { cars: [car], sources }),
    );
    assert.ok(!html.includes("Removable battery and adjustable regeneration"));
    assert.ok(!html.includes("The Australian MY26 model page lists"));
  }
});

test("actual hydrated components show strength only, keep conditions, and suppress stale copy", async () => {
  const React = await import("react");
  const { compiledSource } = await import("./helpers/compiled-source");
  const render = (
    kind: "detail" | "discovery",
    car: Car,
    asOf: string,
    ready = true,
  ) => {
    let position = 0;
    const hooks = {
      ...React,
      useEffect: () => {},
      useMemo: (fn: () => unknown) => fn(),
      useRef: (value: unknown) => ({ current: value }),
      useState: (initial: unknown) => {
        const index = position++,
          clockIndex = kind === "detail" ? 0 : 9,
          dateIndex = kind === "detail" ? 1 : 10;
        return [
          index === clockIndex ? ready : index === dateIndex ? asOf : initial,
          () => {},
        ];
      },
    };
    const mod = compiledSource(
      kind === "detail"
        ? "src/components/buyer-summary.tsx"
        : "src/components/discovery.tsx",
      { react: hooks },
    );
    const Component = (kind === "detail" ? mod.BuyerSummary : mod.default) as (
      props: unknown,
    ) => React.ReactNode;
    return renderToStaticMarkup(
      Component(
        kind === "detail" ? { car, sources } : { cars: [car], sources },
      ),
    );
  };
  for (const kind of ["detail", "discovery"] as const) {
    const html = render(kind, target, "2026-11-09");
    assert.ok(
      html.includes("Removable battery and adjustable regeneration"),
      kind,
    );
    assert.ok(!html.includes("Keep in mind"), kind);
    assert.ok(html.includes("Evidence &amp; conditions"), kind);
    for (const condition of target.buyerSummary!.conditions)
      assert.ok(
        html.includes(
          condition
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#x27;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;"),
        ),
        kind,
      );
    for (const [date, ready] of [
      ["2026-11-10", true],
      ["2026-11-09", false],
      ["invalid", true],
    ] as const)
      assert.ok(
        !render(kind, target, date, ready).includes(
          "Removable battery and adjustable regeneration",
        ),
        `${kind}:${date}:${ready}`,
      );
    const invalid = structuredClone(target);
    invalid.buyerSummary = undefined;
    assert.ok(
      !render(kind, invalid, "2026-10-11").includes(
        "Removable battery and adjustable regeneration",
      ),
    );
  }
  // Existing paired copy stays intact after hydration; no-summary cards retain fallback.
  const paired = cars.find(
    (c) => c.buyerSummary?.strength && c.buyerSummary.tradeoff,
  )!;
  const pairedHtml = render("discovery", paired, "2026-10-11");
  assert.ok(pairedHtml.includes("Keep in mind"));
  const none = structuredClone(target);
  none.buyerSummary = undefined;
  assert.ok(render("discovery", none, "2026-10-11").includes("Keep in mind"));
});
