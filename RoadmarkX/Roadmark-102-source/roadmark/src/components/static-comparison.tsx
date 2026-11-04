"use client";
import { useEffect, useState } from "react";
import Experience from "./experience";
import type { Car, Pack, Research, Selection } from "@/lib/types";
import { parseSelection } from "@/lib/compare";
export function StaticComparison({
  cars,
  allPacks,
  criteria,
  counts,
}: {
  cars: Car[];
  allPacks: Pack[];
  criteria: Research["criteria"];
  counts: {
    families: number;
    variants: number;
    criteria: number;
    evidence: number;
    current: number;
    outgoing: number;
    provisional: number;
  };
}) {
  const [state, setState] = useState(() =>
    parseSelection(new URLSearchParams(), cars),
  );
  useEffect(() => {
    const restore = () =>
      setState(parseSelection(new URLSearchParams(location.search), cars));
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [cars]);
  function change(next: Selection, url: string) {
    history.pushState(history.state, "", url);
    setState(next);
  }
  return (
    <Experience
      mode="compare"
      cars={cars}
      packs={state.ids.map((id) => allPacks.find((p) => p.car.id === id)!)}
      state={state}
      criteria={criteria}
      counts={counts}
      onLocalChange={change}
    />
  );
}
