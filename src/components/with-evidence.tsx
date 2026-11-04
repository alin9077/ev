import type { Source } from "@/lib/types";
import { FootnoteProvider } from "./footnotes";
/** The page's footnotes. Pass only the sources the page cites; cars loaded later add their own. */
export function WithEvidence({
  sources,
  children,
}: {
  sources: Source[];
  children: React.ReactNode;
}) {
  return <FootnoteProvider sources={sources}>{children}</FootnoteProvider>;
}
