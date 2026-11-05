import { research } from "@/lib/data";
import { FootnoteProvider } from "./footnotes";
import type { Source } from "@/lib/types";
export function WithEvidence({
  children,
  sources = research().sources,
}: {
  children: React.ReactNode;
  sources?: Source[];
}) {
  return <FootnoteProvider sources={sources}>{children}</FootnoteProvider>;
}
