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
type Group = { ids: string[]; number: number; count: number };
const Context = createContext<{
  prefix: string;
  groups: Record<string, Group>;
  register: (key: string, delta: number) => void;
  remember: (number: number, el: HTMLElement) => void;
  addSources: (sources: Source[]) => void;
}>({
  prefix: "notes",
  groups: {},
  register: () => {},
  remember: () => {},
  addSources: () => {},
});
/** Lets a page that loads cars later add the sources those cars cite. */
export function useAddSources() {
  return useContext(Context).addSources;
}
export function FootnoteProvider({
  sources: initialSources,
  children,
  prefix = "notes",
}: {
  sources: Source[];
  children: React.ReactNode;
  prefix?: string;
}) {
  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [extra, setExtra] = useState<Source[]>([]);
  const sources = useMemo(
    () => (extra.length ? [...initialSources, ...extra] : initialSources),
    [initialSources, extra],
  );
  const addSources = useCallback(
    (list: Source[]) =>
      setExtra((old) => {
        const known = new Set(old.map((s) => s.id));
        const fresh = list.filter((s) => !known.has(s.id));
        return fresh.length ? [...old, ...fresh] : old;
      }),
    [],
  );
  const origins = useRef(new Map<number, HTMLElement>());
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
    () => ({ prefix, groups, register, remember, addSources }),
    [prefix, groups, register, remember, addSources],
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
                  const s = sources.find((source) => source.id === id);
                  return s ? (
                    <div className="footnote-source" key={id}>
                      <a
                        href={safeUrl(s.url) || undefined}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.title}
                        <span className="sr-only"> (new tab)</span>
                      </a>
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
                    target?.focus();
                    target?.scrollIntoView({ block: "center" });
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
