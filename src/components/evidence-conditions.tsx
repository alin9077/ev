import { plainWords } from "@/lib/plain-words";
/** Native disclosure keeps all qualifications available without burying the next vehicle. */
export function EvidenceConditions({
  conditions,
  label = "Evidence & conditions",
}: {
  conditions: string[];
  label?: string;
}) {
  if (!conditions.length) return null;
  return (
    <details className="evidence-conditions">
      <summary>
        {label} <span className="muted">({conditions.length})</span>
      </summary>
      <p className="small muted">
        Read these limits before comparing claims or choosing a version.
      </p>
      <ul className="small muted">
        {conditions.map((condition) => (
          <li key={condition}>{plainWords(condition)}</li>
        ))}
      </ul>
    </details>
  );
}
