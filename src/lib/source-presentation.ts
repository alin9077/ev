import correction from "../../data/source-citation-label-92.json";
import type { Source } from "./types";

export type SourcePresentation = { title: string; note?: string };
const expectedSourceJSON = JSON.stringify(correction.expectedSource);

/** A reader label only. Never return or mutate a replacement Source.
 * Match the exact ID, exact URL, and full retained source object. Any metadata
 * drift withdraws this label; existing source and summary guards stay separate.
 * Keep field-order-sensitive equality aligned with the retained summary guards.
 */
export function sourcePresentation(source: Source): SourcePresentation {
  if (
    source.id !== correction.sourceId ||
    source.url !== correction.url ||
    JSON.stringify(source) !== expectedSourceJSON
  )
    return { title: source.title };
  return { title: correction.displayTitle, note: correction.displayNote };
}
