"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Car, Pack } from "@/lib/types";
import { EvidenceDrawer, Notice, SoftwareTimeline, type Evidence } from "./ui";
import { VariantPicker } from "./picker";
import { usePacks } from "./use-packs";
export default function Software({
  cars,
  pack: initialPack,
  local = false,
}: {
  cars: Car[];
  pack: Pack;
  /** A static page cannot render a chosen car on the server, so it fetches the pack and updates the link itself. */
  local?: boolean;
}) {
  const [selected, setSelected] = useState(initialPack.car.id);
  const { packs, want } = usePacks([initialPack]);
  const pack = (local && packs.get(selected)) || initialPack;
  useEffect(() => {
    if (!local) return;
    const restore = () =>
      setSelected(
        new URLSearchParams(location.search).get("car") || initialPack.car.id,
      );
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [local, initialPack.car.id]);
  useEffect(() => {
    if (local) want([selected]);
  }, [local, want, selected]);
  const router = useRouter();
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  return (
    <main id="main" className="container editorial-page software-page">
      <p className="eyebrow">Beyond the day you drive away</p>
      <h1>Software updates</h1>
      <p className="lede">
        Explore what was documented, when it happened and which vehicles may be
        eligible.
      </p>
      <Notice>
        Fixed observation window: 5 October 2024 to 5 October 2026. Variant
        review: 6 October 2026. Public release records are not individual
        vehicle histories.
      </Notice>
      <VariantPicker
        cars={cars}
        selected={pack.car.id}
        label="Choose a variant for eligibility"
        onSelect={(id) => {
          if (local) {
            history.pushState(history.state, "", `/software?car=${id}`);
            setSelected(id);
          } else router.push(`/software?car=${id}`, { scroll: false });
        }}
      />
      <SoftwareTimeline pack={pack} onEvidence={setEvidence} />
      <EvidenceDrawer
        evidence={evidence}
        sources={pack.sources}
        onClose={() => setEvidence(null)}
      />
    </main>
  );
}
