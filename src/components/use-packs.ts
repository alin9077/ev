"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Pack } from "@/lib/types";
import { fetchPack } from "@/lib/pack-source";
import { useAddSources } from "./footnotes";

/**
 * The packs a page holds. It starts with those the server sent and fetches others as they are asked for
 * (`want`), so a page with hundreds of variants ships only the ones in view.
 */
export function usePacks(initial: Pack[]) {
  const [packs, setPacks] = useState(
    () => new Map(initial.map((p) => [p.car.id, p])),
  );
  const asked = useRef(new Set(initial.map((p) => p.car.id)));
  const addSources = useAddSources();
  const add = useCallback(
    (list: Pack[]) => {
      setPacks((old) => {
        const next = new Map(old);
        for (const p of list) next.set(p.car.id, p);
        return next;
      });
      addSources(list.flatMap((p) => p.sources));
    },
    [addSources],
  );
  useEffect(() => add(initial), [initial, add]);
  const want = useCallback(
    (ids: string[]) => {
      const missing = [...new Set(ids)].filter((id) => !asked.current.has(id));
      for (const id of missing) asked.current.add(id);
      if (!missing.length) return;
      // One update for the lot: each arrival would redraw every row of the page.
      Promise.allSettled(missing.map(fetchPack)).then((results) => {
        const loaded: Pack[] = [];
        results.forEach((r, i) => {
          if (r.status === "fulfilled") loaded.push(r.value);
          else asked.current.delete(missing[i]);
        });
        if (loaded.length) add(loaded);
      });
    },
    [add],
  );
  return { packs, want };
}
