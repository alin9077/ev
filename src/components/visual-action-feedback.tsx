/** The parent supplies one live region; this local duplicate is for sighted readers. */
export function VisualActionFeedback({ message }: { message?: string }) {
  return message ? (
    <p className="discovery-action-feedback small muted" aria-hidden="true">
      {message}
    </p>
  ) : null;
}
