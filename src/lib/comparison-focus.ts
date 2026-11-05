/** One-shot intent to focus the third selector after adding or removing a car. */
export type ComparisonFocusRequest = {
  ids: string[];
  active: string;
};

export function comparisonFocusOutcome(
  request: ComparisonFocusRequest,
  current: {
    pending: boolean;
    mode: "home" | "compare";
    committedIds: string[];
    selectedIds: string[];
    packIds: string[];
    active: string;
    canRestoreFocus: boolean;
  },
): "wait" | "focus" | "discard" {
  if (current.mode !== "compare") return "discard";
  if (current.pending) return "wait";
  if (!current.canRestoreFocus) return "discard";
  const expected = request.ids;
  if (
    ![2, 3].includes(expected.length) ||
    new Set(expected).size !== expected.length ||
    expected.some((id) => !id) ||
    request.active !== expected.at(-1) ||
    current.active !== request.active
  )
    return "discard";
  const matches = (ids: string[]) =>
    ids.length === expected.length && ids.every((id, i) => id === expected[i]);
  return [current.committedIds, current.selectedIds, current.packIds].every(
    matches,
  )
    ? "focus"
    : "discard";
}
