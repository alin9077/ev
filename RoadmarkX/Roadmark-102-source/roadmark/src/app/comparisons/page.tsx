import Link from "next/link";
import { pairLinks } from "@/lib/pair-pages";
export const metadata = {
  title: "Model Y versus nine rivals",
  alternates: { canonical: "/comparisons" },
};
export default function Comparisons() {
  return (
    <main id="main" className="container editorial-page citable-page">
      <p className="eyebrow">One question, one comparison</p>
      <h1>Model Y versus nine rivals</h1>
      <p className="lede">
        Exact Australian trims, six key figures and answers with the date and
        source beside each claim.
      </p>
      <div className="pair-grid">
        {pairLinks().map((p) => (
          <Link className="pair-card" href={p.href} key={p.slug}>
            <h2>{p.label}</h2>
            <p>Model Y Premium RWD · {p.car.trim}</p>
            <span>Read the comparison →</span>
          </Link>
        ))}
      </div>
      <p>
        <Link href="/glossary">EV jargon explained</Link> ·{" "}
        <Link href="/methodology">How we check the evidence</Link>
      </p>
    </main>
  );
}
