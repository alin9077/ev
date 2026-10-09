import Link from "next/link";
import { site } from "@/lib/config";
import type { Source } from "@/lib/types";
import { FootnoteProvider } from "./footnotes";
export function SiteShell({
  sources = [],
  children,
}: {
  sources?: Source[];
  children: React.ReactNode;
}) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {sources.length ? (
        <FootnoteProvider sources={sources}>{children}</FootnoteProvider>
      ) : (
        children
      )}
      <footer className="site-footer container">
        <div>
          <Link className="brand" href="/">
            EV Side by Side
          </Link>
          <p>
            An independent Australian EV comparison.
            <br />
            No manufacturer affiliation. No paid placements.
          </p>
        </div>
        <div>
          <Link href="/methodology">Methodology</Link>
          <Link href="/sources">Sources & corrections</Link>
          <Link href="/comparisons">Nine Model Y comparisons</Link>
          <Link href="/glossary">EV glossary</Link>
        </div>
        <p className="footer-note">
          Research snapshot: {site.dateLabel}. Prices and availability need
          confirmation. Working brand, subject to name clearance. No behavioural
          analytics or vehicle data collection.
        </p>
      </footer>
    </>
  );
}
