"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Car, Pack } from "@/lib/types";
import { EvidenceDrawer, Notice, SoftwareTimeline, type Evidence } from "./ui";
import { VariantPicker } from "./picker";
export default function Software({
  cars,
  pack: initialPack,
  allPacks,
}: {
  cars: Car[];
  pack: Pack;
  allPacks?: Pack[];
}) {
  const [selected, setSelected] = useState(initialPack.car.id);
  const pack = allPacks?.find((p) => p.car.id === selected) || initialPack;
  useEffect(() => {
    if (!allPacks) return;
    const restore = () =>
      setSelected(
        new URLSearchParams(location.search).get("car") || initialPack.car.id,
      );
    queueMicrotask(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [allPacks, initialPack.car.id]);
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
          if (allPacks) {
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
