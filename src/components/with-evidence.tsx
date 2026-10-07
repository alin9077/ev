import { research } from "@/lib/data";
import { FootnoteProvider } from "./footnotes";
export function WithEvidence({ children }: { children: React.ReactNode }) {
  return (
    <FootnoteProvider sources={research().sources}>{children}</FootnoteProvider>
  );
}
