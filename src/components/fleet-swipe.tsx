"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Swipe = {
  index: number;
  count: number;
  register: (el: HTMLDivElement) => () => void;
  move: (index: number, origin?: HTMLDivElement) => void;
};
const Context = createContext<Swipe | null>(null);
export function SwipeProvider({
  children,
  count,
  initialIndex,
  onChange,
}: {
  children: React.ReactNode;
  count: number;
  initialIndex: number;
  onChange: (index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const current = useRef(initialIndex),
    tracks = useRef(new Set<HTMLDivElement>()),
    change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);
  const align = useCallback((el: HTMLDivElement, next: number) => {
    const card = el.children[next] as HTMLElement | undefined;
    if (card) {
      const target =
        card.offsetLeft - (el.firstElementChild as HTMLElement).offsetLeft;
      if (Math.abs(el.scrollLeft - target) > 1) el.scrollLeft = target;
    }
  }, []);
  const move = useCallback(
    (next: number, origin?: HTMLDivElement) => {
      if (!Number.isFinite(next)) return;
      next = Math.max(0, Math.min(count - 1, next));
      const changed = current.current !== next;
      if (!changed && origin) return;
      current.current = next;
      if (changed) {
        setIndex(next);
        change.current(next);
      }
      tracks.current.forEach((el) => {
        if (el !== origin) align(el, next);
      });
    },
    [align, count],
  );
  const register = useCallback(
    (el: HTMLDivElement) => {
      tracks.current.add(el);
      align(el, current.current);
      let width = el.clientWidth;
      const resize = new ResizeObserver(() => {
        if (el.clientWidth !== width) {
          width = el.clientWidth;
          align(el, current.current);
        }
      });
      resize.observe(el);
      return () => {
        tracks.current.delete(el);
        resize.disconnect();
      };
    },
    [align],
  );
  useEffect(() => {
    move(initialIndex);
  }, [initialIndex, move]);
  return (
    <Context.Provider value={{ index, count, register, move }}>
      {children}
    </Context.Provider>
  );
}
export function useSwipe() {
  return useContext(Context)!;
}
export function SwipeTrack({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode[];
}) {
  const { index, register, move } = useSwipe();
  const [visibleCount, setVisibleCount] = useState(1);
  const ref = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  useEffect(() => {
    if (ref.current) return register(ref.current);
  }, [register]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = new ResizeObserver(() => {
      const first = el.children[0] as HTMLElement;
      const second = el.children[1] as HTMLElement;
      const step = second.offsetLeft - first.offsetLeft;
      if (step) setVisibleCount(Math.max(1, Math.ceil(el.clientWidth / step)));
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  function nearest(el: HTMLDivElement) {
    const first = el.children[0] as HTMLElement,
      second = el.children[1] as HTMLElement;
    const step = second.offsetLeft - first.offsetLeft;
    // Print lays every card vertically, so there is no horizontal step.
    if (step <= 0) return index;
    return Math.max(
      0,
      Math.min(children.length - 1, Math.round(el.scrollLeft / step)),
    );
  }
  return (
    <div
      ref={ref}
      className="swipe-track"
      tabIndex={0}
      role="group"
      aria-label={`${label}. Swipe or use left and right arrow keys.`}
      onScroll={(e) => {
        const next = nearest(e.currentTarget);
        if (next !== index) move(next, e.currentTarget);
      }}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
          e.preventDefault();
          move(
            e.key === "Home"
              ? 0
              : e.key === "End"
                ? children.length - 1
                : index + (e.key === "ArrowLeft" ? -1 : 1),
          );
        }
      }}
      onPointerDown={(e) => {
        if (
          e.pointerType !== "mouse" ||
          e.button !== 0 ||
          (e.target as HTMLElement).closest("a,button,select,input,label")
        )
          return;
        drag.current = {
          x: e.clientX,
          left: e.currentTarget.scrollLeft,
          moved: false,
        };
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        if (Math.abs(e.clientX - d.x) > 6) {
          d.moved = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          e.currentTarget.classList.add("is-dragging");
          e.currentTarget.scrollLeft = d.left + d.x - e.clientX;
        }
      }}
      onPointerUp={(e) => {
        if (!drag.current) return;
        const moved = drag.current.moved;
        drag.current = null;
        e.currentTarget.classList.remove("is-dragging");
        if (e.currentTarget.hasPointerCapture(e.pointerId))
          e.currentTarget.releasePointerCapture(e.pointerId);
        if (moved) move(nearest(e.currentTarget));
      }}
      onPointerCancel={(e) => {
        drag.current = null;
        e.currentTarget.classList.remove("is-dragging");
      }}
      onClickCapture={(e) => {
        if (drag.current?.moved) e.preventDefault();
      }}
    >
      {children.map((child, i) => (
        <div
          className="swipe-card"
          key={i}
          data-index={i}
          inert={i < index || i >= index + visibleCount}
          aria-hidden={i < index || i >= index + visibleCount}
        >
          {child}
        </div>
      ))}
      <div className="swipe-tail" aria-hidden="true" />
    </div>
  );
}
