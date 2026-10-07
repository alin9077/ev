import { useSyncExternalStore } from "react";
const subscribe = (callback: () => void) => {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
};
export const useLocation = () =>
  useSyncExternalStore(
    subscribe,
    () => location.search,
    () => "",
  );
export function localUrl(href: string) {
  if (!href.startsWith("/")) return href;
  const url = new URL(href, "https://local.invalid");
  url.searchParams.set("page", url.pathname);
  return `${location.pathname}?${url.searchParams}${url.hash}`;
}
export function navigate(
  href: string,
  options?: { scroll?: boolean },
  replace = false,
) {
  const url = localUrl(href);
  history[replace ? "replaceState" : "pushState"](null, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
  if (options?.scroll !== false) window.scrollTo({ top: 0 });
}
const router = {
  push: navigate,
  replace: (href: string, opts?: { scroll?: boolean }) =>
    navigate(href, opts, true),
};
export const useRouter = () => router;
export const usePathname = () =>
  new URLSearchParams(useLocation()).get("page") || "/";
