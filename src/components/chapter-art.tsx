import { useState, useSyncExternalStore } from "react";
import { chapterArt } from "@/lib/chapter-art";
import { artSrc } from "@/lib/chapter-art-src";
import { chapterScenes, chapterScenesB } from "@/lib/chapter-scenes";
import { readoutFor, specFor } from "@/lib/scene-readout";
import type { Pack } from "@/lib/types";
import { SceneCanvas } from "./scene-canvas";

type Props = {
  chapter: string;
  eager?: boolean;
  /** The selected baseline and the alternative beside it, for the scene. */
  baseline?: Pack;
  rival?: Pack;
  /** The B site draws its own set of scenes. */
  version?: "b";
};

/** Chapter illustration: landscape composition, with a portrait one for phones. */
export function ChapterArt({
  chapter,
  eager = false,
  baseline,
  rival,
  version,
}: Props) {
  const art = chapterArt[chapter];
  if (!art) return null;
  const sceneB = version === "b" ? chapterScenesB[chapter] : undefined;
  if (sceneB)
    return (
      <SceneCanvas
        scene={sceneB.scene}
        alt={sceneB.alt}
        look="b"
        spec={baseline && rival ? specFor(baseline, rival) : undefined}
        readout={
          baseline && rival ? readoutFor(chapter, baseline, rival) : undefined
        }
      />
    );
  const scene = chapterScenes[chapter];
  if (art.scene && scene)
    return (
      <SceneCanvas
        scene={scene}
        alt={art.sceneAlt ?? art.alt}
        wheel={chapter === "02"}
        spec={baseline && rival ? specFor(baseline, rival) : undefined}
        readout={
          baseline && rival ? readoutFor(chapter, baseline, rival) : undefined
        }
      />
    );
  if (art.animated) return <AnimatedArt chapter={chapter} eager={eager} />;
  return (
    <picture className="chapter-art">
      <source
        media="(max-width: 767px)"
        srcSet={artSrc(`${art.file}-mobile`)}
        width={960}
        height={1200}
      />
      <img
        src={artSrc(`${art.file}-desktop`)}
        alt={art.alt}
        width={1600}
        height={900}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </picture>
  );
}

const REDUCED = "(prefers-reduced-motion: reduce)";
function watchReducedMotion(notify: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

/**
 * A looping illustration. Viewers who prefer reduced motion start on its
 * resting frame and can choose to play it; anyone can pause it.
 */
function AnimatedArt({ chapter, eager }: Props) {
  const reduced = useSyncExternalStore(
    watchReducedMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  // null until the viewer presses the button; their choice then wins.
  const [choice, setPaused] = useState<boolean | null>(null);
  const paused = choice ?? reduced;
  const art = chapterArt[chapter];
  const moving = (format: string) => artSrc(`${art.file}-${format}`),
    still = (format: string) => artSrc(`${art.file}-${format}-still`);
  return (
    <div className="chapter-art chapter-art-animated">
      <picture>
        {/* Before any choice, the still frame holds even without script. */}
        {choice === null && (
          <>
            <source
              media="(max-width: 767px) and (prefers-reduced-motion: reduce)"
              srcSet={still("mobile")}
              width={960}
              height={1200}
            />
            <source
              media="(prefers-reduced-motion: reduce)"
              srcSet={still("desktop")}
            />
          </>
        )}
        <source
          media="(max-width: 767px)"
          srcSet={paused ? still("mobile") : moving("mobile")}
          width={960}
          height={1200}
        />
        <img
          src={paused ? still("desktop") : moving("desktop")}
          alt={art.alt}
          width={1600}
          height={900}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      </picture>
      <button
        type="button"
        className="chapter-art-toggle"
        aria-label={paused ? "Play animation" : "Pause animation"}
        onClick={() => setPaused(!paused)}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path
            d={paused ? "M3 1.5v9l7-4.5Z" : "M2.5 2H5v8H2.5ZM7 2h2.5v8H7Z"}
          />
        </svg>
      </button>
    </div>
  );
}
