import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChapterScene } from "@/lib/scenes/kit";
import type { SceneLoader } from "@/lib/scene-loaders";
import type { Readout } from "@/lib/scene-readout";
import { setCovered, type SceneSpec } from "@/lib/scenes/kit";

const REDUCED = "(prefers-reduced-motion: reduce)";
function watchReducedMotion(notify: () => void) {
  const query = window.matchMedia(REDUCED);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
}

/**
 * A chapter's scene, rendered live on a canvas. It only runs while on screen;
 * viewers who prefer reduced motion start on its resting frame and can choose
 * to play it, and anyone can pause it. `wheel` leaves room beside the labels
 * for the steering wheel the automated-driving scene draws in its corner.
 */
export function SceneCanvas({
  loadScene,
  alt,
  wheel = false,
  spec,
  readout,
  look,
}: {
  loadScene: SceneLoader;
  alt: string;
  wheel?: boolean;
  /** The selected cars' figures: what the scene is drawn from, and quoted. */
  spec?: SceneSpec;
  readout?: Readout;
  /** The B scenes sit in a larger, rounder plate with the figures beside them. */
  look?: "b";
}) {
  const panel = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLOListElement>(null);
  const [scene, setScene] = useState<ChapterScene>();
  const [loadFailed, setLoadFailed] = useState(false);
  const retry = useRef<() => void>(undefined);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let cancelled = false;
    let pending = false;
    const load = () => {
      if (pending) return;
      pending = true;
      setLoadFailed(false);
      loadScene().then(
        (loaded) => {
          if (!cancelled) setScene(loaded);
        },
        () => {
          pending = false;
          if (!cancelled) setLoadFailed(true);
        },
      );
    };
    retry.current = load;
    // About one screen of lead time, bounded so long pages stay inexpensive.
    // This primes the first frame but never advances the scene's clock.
    const lead = Math.round(Math.min(1000, Math.max(400, window.innerHeight)));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        load();
      },
      { rootMargin: `${lead}px 0px` },
    );
    observer.observe(el);
    return () => {
      cancelled = true;
      retry.current = undefined;
      observer.disconnect();
    };
  }, [loadScene]);

  /** Scene time in seconds; kept across pauses so play resumes where it stopped. */
  const clock = useRef(0);
  /** The latest selection, read on every frame, and a way to redraw for it. */
  const drawn = useRef(spec);
  const repaint = useRef<() => void>(undefined);
  const specKey = JSON.stringify(spec ?? null);
  useEffect(() => {
    drawn.current = spec;
    repaint.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specKey]);
  /** Until it has played, a paused scene shows its resting frame. */
  const played = useRef(false);
  const reduced = useSyncExternalStore(
    watchReducedMotion,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
  // null until the viewer presses the button; their choice then wins.
  const [choice, setChoice] = useState<boolean | null>(null);
  const paused = choice ?? reduced;

  useEffect(() => {
    if (!scene) return;
    const el = canvas.current,
      ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    if (!played.current) clock.current = paused ? scene.still : 0;
    let frame = 0,
      last = 0,
      onScreen = false;
    /** How far down the panel the table of figures reaches, as a fraction. */
    let cover = 0;
    const measure = () => {
      const table = panel.current?.querySelector<HTMLElement>(".scene-readout");
      cover =
        look !== "b" && table && el.clientHeight
          ? (table.offsetTop + table.offsetHeight) / el.clientHeight
          : 0;
    };
    measure();
    const paint = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.round(el.clientWidth * scale),
        height = Math.round(el.clientHeight * scale);
      if (!width || !height) return;
      if (el.width !== width || el.height !== height) {
        el.width = width;
        el.height = height;
      }
      // The scene frames its subject below whatever lies over the panel's top.
      setCovered(cover);
      const shown = scene.draw(
        ctx,
        width,
        height,
        clock.current,
        scale,
        drawn.current,
      );
      // The labels sit over the scene, so they follow it from dark to light.
      if (panel.current && panel.current.dataset.tone !== shown.tone)
        panel.current.dataset.tone = shown.tone;
      Array.from(labels.current?.children ?? []).forEach((item, i) => {
        const active = shown.beat === i;
        item.toggleAttribute("data-active", active);
        (item as HTMLElement).style.setProperty(
          "--progress",
          String(active ? shown.progress : 0),
        );
      });
    };
    repaint.current = () => {
      measure();
      if (onScreen && !document.hidden) paint();
    };
    /** Smoothed milliseconds to draw a frame, and whether to draw every other one. */
    let cost = 0,
      halved = false,
      skip = false;
    const tick = (now: number) => {
      if (!onScreen || document.hidden) return;
      // Long gaps (a hidden tab) should not jump the scene forward.
      clock.current += Math.min((now - (last || now)) / 1000, 0.1);
      played.current ||= last > 0;
      last = now;
      // A device that cannot draw a frame in time gets an even half rate,
      // which looks steadier than frames dropped at random.
      skip = halved && !skip;
      if (!skip) {
        const began = performance.now();
        paint();
        cost += (performance.now() - began - cost) * 0.1;
        halved = cost > (halved ? 7 : 12);
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      last = 0;
      if (onScreen && !document.hidden) {
        if (!paused) frame = requestAnimationFrame(tick);
        else paint();
      }
    };
    const resize = new ResizeObserver(() => {
      measure();
      if (onScreen && !document.hidden) paint();
    });
    resize.observe(el);
    const watch = new IntersectionObserver(
      ([entry]) => {
        // Wait until a meaningful slice is visible; works for tall mobile scenes.
        onScreen = entry.isIntersecting && entry.intersectionRatio >= 0.15;
        sync();
      },
      { threshold: [0, 0.15] },
    );
    watch.observe(el);
    document.addEventListener("visibilitychange", sync);
    // One prepared frame removes first-entry drawing latency without autoplay.
    if (!document.hidden) paint();
    // Checks can hold the scene at a moment: a `scene-seek` event carrying seconds.
    const seek = (event: Event) => {
      clock.current = Number((event as CustomEvent).detail) || 0;
      played.current = true;
      paint();
    };
    el.addEventListener("scene-seek", seek);
    return () => {
      el.removeEventListener("scene-seek", seek);
      cancelAnimationFrame(frame);
      repaint.current = undefined;
      document.removeEventListener("visibilitychange", sync);
      resize.disconnect();
      watch.disconnect();
    };
  }, [paused, scene, look]);

  return (
    <div
      ref={panel}
      className={`chapter-art driving-scene${wheel ? "" : " loop-scene"}${look === "b" ? " scene-b" : ""}`}
      data-tone={scene?.tone ?? "day"}
      data-scene-state={scene ? "ready" : loadFailed ? "error" : "pending"}
    >
      <canvas ref={canvas} role="img" aria-label={alt} />
      <span className="driving-scene-note">Conceptual illustration</span>
      {readout && readout.rows.length > 0 && (
        <table className="scene-readout">
          <thead>
            <tr>
              <td />
              <th scope="col">{readout.cars[0]}</th>
              <th scope="col">{readout.cars[1]}</th>
            </tr>
          </thead>
          <tbody>
            {readout.rows.map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.values[0]}</td>
                <td>{row.values[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ol className="driving-scene-acts" ref={labels} aria-hidden="true">
        {scene?.beats.map((beat) => (
          <li key={beat}>
            <span>{beat}</span>
            <i />
          </li>
        ))}
      </ol>
      <button
        type="button"
        className="chapter-art-toggle"
        disabled={!scene && !loadFailed}
        aria-label={
          loadFailed
            ? "Retry animation"
            : !scene
              ? "Loading animation"
              : paused
                ? "Play animation"
                : "Pause animation"
        }
        onClick={() => (loadFailed ? retry.current?.() : setChoice(!paused))}
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
