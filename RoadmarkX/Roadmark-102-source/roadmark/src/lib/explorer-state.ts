/** Complete URL state shared by live changes, reset, reload and history navigation. */
export const EXPLORER_DEFAULT_FILTERS = {
  q: "",
  family: "all",
  availability: "current_or_order_listed",
  budget: "",
  range: "",
  drive: "all",
  seats: "all",
  equipment: "all",
} as const;
export type ExplorerFilters = {
  [K in keyof typeof EXPLORER_DEFAULT_FILTERS]: string;
};
export function readExplorerFilters(
  input: URLSearchParams | Record<string, string | undefined>,
): ExplorerFilters {
  return Object.fromEntries(
    Object.entries(EXPLORER_DEFAULT_FILTERS).map(([key, fallback]) => {
      const value =
        input instanceof URLSearchParams ? input.get(key) : input[key];
      return [key, value || fallback];
    }),
  ) as ExplorerFilters;
}
export function clearExplorerFilters(): ExplorerFilters {
  return { ...EXPLORER_DEFAULT_FILTERS, availability: "all" };
}
export function explorerFilterUrl(
  filters: ExplorerFilters,
  location: {
    pathname: string;
    protocol: string;
    search: string;
    hash?: string;
  },
): string {
  const query = new URLSearchParams(filters);
  const portable =
    location.protocol === "file:" ||
    /\.html$/i.test(location.pathname) ||
    new URLSearchParams(location.search).has("page");
  if (portable) query.set("page", "/cars");
  return `${portable ? location.pathname : "/cars"}?${query}${location.hash || ""}`;
}
