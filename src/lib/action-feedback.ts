export type FeedbackAttempt = Readonly<{ context: string }>;
/** Identity tokens prevent old work winning after navigation, newer actions or A→B→A. */
export function createActionFeedbackGate() {
  let latest: FeedbackAttempt | null = null;
  return {
    begin(context: string): FeedbackAttempt {
      const attempt = Object.freeze({ context });
      latest = attempt;
      return attempt;
    },
    invalidate() {
      latest = null;
    },
    accepts(attempt: FeedbackAttempt, context: string) {
      return latest === attempt && attempt.context === context;
    },
  };
}
export async function shareViewFeedback({
  gate,
  href,
  currentHref,
  writeText,
  publish,
}: {
  gate: ReturnType<typeof createActionFeedbackGate>;
  href: string;
  currentHref: () => string;
  writeText: (text: string) => Promise<void>;
  publish: (message: string) => void;
}): Promise<void> {
  const attempt = gate.begin(href);
  let message: string;
  try {
    await writeText(href);
    message =
      "Link copied, including the filters and trims in the view you shared.";
  } catch {
    message = "Copy the address from your browser to share this view.";
  }
  if (gate.accepts(attempt, currentHref())) publish(message);
}
