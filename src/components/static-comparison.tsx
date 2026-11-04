"use client";
import { useEffect, useState } from "react";
import Experience from "./experience";
import type { Car, Pack, Research, Selection } from "@/lib/types";
import { parseSelection } from "@/lib/compare";
import { usePacks } from "./use-packs";
export function StaticComparison({
  cars,
  initialPacks,
  criteria,
  counts,
}: {
  cars: Car[];
  /** The packs of the opening pair; others are fetched when the link or the picker asks for them. */
  initialPacks: Pack[];
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
  // The last selection whose packs have all arrived stays on screen while a new one loads.
  const [shown, setShown] = useState(state);
  const { packs, want } = usePacks(initialPacks);
  useEffect(() => {
    const restore = () =>
      setState(parseSelection(new URLSearchParams(location.search), cars));
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [cars]);
  useEffect(() => want(state.ids), [want, state.ids]);
  const ready = state.ids.every((id) => packs.has(id));
  useEffect(() => {
    if (ready) queueMicrotask(() => setShown(state));
  }, [ready, state]);
  const current = ready ? state : shown;
  function change(next: Selection, url: string) {
    history.pushState(history.state, "", url);
    setState(next);
  }
  return (
    <Experience
      mode="compare"
      cars={cars}
      packs={current.ids.map((id) => packs.get(id)!)}
      state={current}
      criteria={criteria}
      counts={counts}
      onLocalChange={change}
    />
  );
}
