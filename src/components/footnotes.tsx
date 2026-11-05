"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Source } from "@/lib/types";
import { safeUrl } from "@/lib/config";
import { sourcePresentation } from "@/lib/source-presentation";
type Group = { ids: string[]; number: number; count: number };
const Context = createContext<{
  prefix: string;
  groups: Record<string, Group>;
  register: (key: string, delta: number) => void;
  remember: (number: number, el: HTMLElement) => void;
}>({ prefix: "notes", groups: {}, register: () => {}, remember: () => {} });
export function FootnoteProvider({
  sources,
  children,
  prefix = "notes",
}: {
  sources: Source[];
  children: React.ReactNode;
  prefix?: string;
}) {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const sourceIndex = useMemo(() => {
    const index = new Map<string, Source>();
    for (const source of sources)
      if (!index.has(source.id)) index.set(source.id, source);
    return index;
  }, [sources]);
  const origins = useRef(new Map<number, HTMLElement>());
  useEffect(() => {
    // Keep citation numbers, but release origins removed from the document.
    for (const [number, origin] of origins.current) {
      if (!origin.isConnected) origins.current.delete(number);
    }
  }, [groups]);
  const register = useCallback(
    (key: string, delta: number) =>
      setGroups((current) => {
        if (!key) return current;
        const existing = current[key];
        return {
          ...current,
          [key]: {
            ids: key.split("|"),
            number:
              existing?.number ||
              Math.max(0, ...Object.values(current).map((g) => g.number)) + 1,
            count: Math.max(0, (existing?.count || 0) + delta),
          },
        };
      }),
    [],
  );
  const remember = useCallback((number: number, el: HTMLElement) => {
    origins.current.set(number, el);
  }, []);
  const context = useMemo(
    () => ({ prefix, groups, register, remember }),
    [prefix, groups, register, remember],
  );
  const active = Object.values(groups)
    .filter((g) => g.count > 0)
    .sort((a, b) => a.number - b.number);
  return (
    <Context.Provider value={context}>
      {children}
      <section className="footnotes container" aria-label="Footnotes">
        <details>
          <summary>
            Footnotes <span className="small">{active.length} notes</span>
          </summary>
          <p className="small muted">
            Fresh checks are labelled. Other sources retain their original
            research date.
          </p>
          <ol>
            {active.map((group) => (
              <li
                tabIndex={-1}
                id={`${prefix}-${group.number}`}
                key={group.number}
                value={group.number}
              >
                {group.ids.map((id) => {
                  const s = sourceIndex.get(id);
                  const presentation = s ? sourcePresentation(s) : undefined;
                  return s ? (
                    <div className="footnote-source" key={id}>
                      <a
                        href={safeUrl(s.url) || undefined}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {presentation?.title ?? s.title}
                        <span className="sr-only"> (new tab)</span>
                      </a>
                      {presentation?.note && (
                        <p className="small">{presentation.note}</p>
                      )}
                      <p>
                        {s.publisher} · {s.market} · Checked {s.accessed_date}
                        {s.fresh_check
                          ? " · Fresh check"
                          : " · Supplied research"}
                      </p>
                      <p>{s.supports}</p>
                      {["qualification", "access_limitation", "conflict"].map(
                        (k) => (s[k] ? <p key={k}>{String(s[k])}</p> : null),
                      )}
                    </div>
                  ) : (
                    <p key={id}>Source {id} needs confirmation.</p>
                  );
                })}
                <a
                  className="footnote-back"
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    const target = origins.current.get(group.number);
                    if (!target) return;
                    if (!target.isConnected) {
                      origins.current.delete(group.number);
                      return;
                    }
                    target.focus();
                    target.scrollIntoView({ block: "center" });
                  }}
                >
                  Back to reference ↑
                </a>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </Context.Provider>
  );
}
export function FootnoteRefs({ ids }: { ids: string[] }) {
  const { prefix, groups, register, remember } = useContext(Context);
  const instance = useId();
  const key = [...new Set(ids)].sort().join("|");
  useEffect(() => {
    register(key, 1);
    return () => register(key, -1);
  }, [key, register]);
  const group = groups[key];
  if (!group) return null;
  return (
    <sup className="footnote-refs">
      <a
        id={`${instance}-reference`}
        href={`#${prefix}-${group.number}`}
        aria-label={`Footnote ${group.number}`}
        onClick={(e) => {
          const target = document.getElementById(`${prefix}-${group.number}`);
          if (!target) return;
          e.preventDefault();
          remember(group.number, e.currentTarget);
          const details = target.closest("details");
          if (details) details.open = true;
          target.scrollIntoView({
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
            block: "start",
          });
          target.focus({ preventScroll: true });
        }}
      >
        {group.number}
      </a>
    </sup>
  );
}
