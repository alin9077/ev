"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
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
/**
 * The distance between neighbouring cards in a track, from two drawn ones (or one and the gap).
 * Zero where cards are not laid out in a row, as in print.
 */
function stepOf(el: HTMLElement) {
  const cards = el.querySelectorAll<HTMLElement>(":scope > .swipe-card");
  if (!cards.length) return 0;
  const [first, second] = [cards[0].getBoundingClientRect(), cards[1]];
  if (second) return second.getBoundingClientRect().left - first.left;
  return first.width + (parseFloat(getComputedStyle(el).columnGap) || 0);
}
/** A run of undrawn cards: it takes the room they would, gaps included. */
function Spacer({ cards }: { cards: number }) {
  return (
    <div
      className="swipe-spacer"
      aria-hidden="true"
      style={{
        flex: `0 0 calc(${cards} * (var(--swipe-card-width) + var(--swipe-gap)) - var(--swipe-gap))`,
      }}
    />
  );
}
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
  // A track draws only the cards near the reader and stands spacers in for the rest, so a card is
  // found by arithmetic (its index times the step), not by looking it up among the children.
  const align = useCallback(
    (els: Iterable<HTMLDivElement>, next: number, except?: HTMLDivElement) => {
      // Every track is measured before any is moved: with dozens of rows, interleaving the two
      // would lay the page out again for each one.
      const steps = [...els]
        .filter((el) => el !== except)
        .map((el) => [el, stepOf(el)] as const);
      for (const [el, step] of steps)
        if (step > 0 && Math.abs(el.scrollLeft - next * step) > 1)
          el.scrollLeft = next * step;
    },
    [],
  );
  const origin = useRef<HTMLDivElement | undefined>(undefined);
  const move = useCallback(
    (next: number, from?: HTMLDivElement) => {
      if (!Number.isFinite(next)) return;
      next = Math.max(0, Math.min(count - 1, next));
      const changed = current.current !== next;
      if (!changed && from) return;
      current.current = next;
      if (changed) {
        origin.current = from;
        setIndex(next);
        change.current(next);
      } else align(tracks.current, next, from);
    },
    [align, count],
  );
  // The other tracks follow once the cards around the new place are drawn: a jump far from the old
  // place would otherwise land on a spacer, which scroll snapping would pull to the nearest card.
  useLayoutEffect(() => {
    const from = origin.current;
    origin.current = undefined;
    align(tracks.current, index, from);
  }, [index, align]);
  // A new list (the type or search changed) starts every track at its opening place at once. Left to
  // an effect, the browser first clamps each track's old offset to the shorter list and reports that.
  const listLength = useRef(count);
  useLayoutEffect(() => {
    if (listLength.current === count) return;
    listLength.current = count;
    current.current = initialIndex;
    origin.current = undefined;
    setIndex(initialIndex);
    align(tracks.current, initialIndex);
  }, [count, initialIndex, align]);
  const register = useCallback(
    (el: HTMLDivElement) => {
      tracks.current.add(el);
      align([el], current.current);
      let width = el.clientWidth;
      const resize = new ResizeObserver(() => {
        if (el.clientWidth !== width) {
          width = el.clientWidth;
          align([el], current.current);
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
  const touch = useRef<{ x: number; y: number; index: number } | null>(null);
  useEffect(() => {
    if (ref.current) return register(ref.current);
  }, [register]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = new ResizeObserver(() => {
      const step = stepOf(el);
      if (step > 0)
        setVisibleCount(Math.max(1, Math.ceil(el.clientWidth / step)));
    });
    resize.observe(el);
    return () => resize.disconnect();
  }, []);
  function nearest(el: HTMLDivElement) {
    const step = stepOf(el);
    // Print lays every card vertically, so there is no horizontal step.
    if (step <= 0) return index;
    return Math.max(
      0,
      Math.min(children.length - 1, Math.round(el.scrollLeft / step)),
    );
  }
  return (
    <div className="swipe-viewport">
      <div
        ref={ref}
        className="swipe-track"
        tabIndex={0}
        role="group"
        aria-label={`${label}. Swipe or use left and right arrow keys.`}
        onTouchStart={(e) => {
          if (e.touches.length !== 1) {
            touch.current = null;
            return;
          }
          touch.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            index,
          };
        }}
        onTouchEnd={(e) => {
          const start = touch.current;
          touch.current = null;
          if (!start || !e.changedTouches.length) return;
          const dx = e.changedTouches[0].clientX - start.x;
          const dy = e.changedTouches[0].clientY - start.y;
          if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy) * 1.5)
            move(start.index + (dx < 0 ? 1 : -1));
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
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
        {slots(children, (child, i) => (
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
      <div className="fleet-progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
/** Draws the cards that have content and one spacer for each run of those that do not. */
function slots(
  children: React.ReactNode[],
  card: (child: React.ReactNode, i: number) => React.ReactNode,
) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < children.length;) {
    if (children[i]) out.push(card(children[i], i++));
    else {
      const from = i;
      while (i < children.length && !children[i]) i++;
      out.push(<Spacer key={`gap-${from}`} cards={i - from} />);
    }
  }
  return out;
}
