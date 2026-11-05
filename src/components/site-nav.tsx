"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

/** One slim bar on every page; the hero below it is untouched. */
export const SITE_NAV_ITEMS = [
  { label: "Find by need", href: "/discover?mode=attribute", match: "mode" },
  { label: "Explore", href: "/discover", match: "/discover" },
  { label: "Compare", href: "/compare", match: "/compare" },
  { label: "Shortlist", href: "/compare", match: "shortlist" },
  { label: "Model Y pick", href: "/", match: "/" },
] as const;

/** The saved shortlist is a list of version IDs kept on this device only. */
export function savedShortlist(raw: string | null): string[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string").slice(0, 3)
      : [];
  } catch {
    return [];
  }
}
/** Where Shortlist goes: the saved comparison, or the list to build one. */
export function shortlistHref(ids: string[]): string {
  return ids.length >= 2
    ? `/compare?cars=${ids.join(",")}`
    : "/discover#discover";
}

export function SiteNav() {
  const path = usePathname() || "/";
  const router = useRouter();
  const current = (item: (typeof SITE_NAV_ITEMS)[number]) =>
    item.match === "/"
      ? path === "/"
      : item.match === "mode" || item.match === "shortlist"
        ? false
        : path === item.match || path.startsWith(`${item.match}/`);
  return (
    <nav className="site-nav" aria-label="Main">
      <ul>
        {SITE_NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={current(item) ? "page" : undefined}
              onClick={(event) => {
                if (item.match !== "shortlist") return;
                let ids: string[] = [];
                try {
                  ids = savedShortlist(localStorage.getItem("ev-shortlist"));
                } catch {
                  // Device storage can be unavailable; the list still works.
                }
                event.preventDefault();
                router.push(shortlistHref(ids));
              }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
