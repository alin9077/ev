"use client";
import { useId, useState } from "react";

export function CopyForAI({
  text,
  targetId,
}: {
  text?: string;
  targetId?: string;
}) {
  const id = useId();
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState("");
  async function copy() {
    const value =
      text ?? document.getElementById(targetId || "")?.textContent ?? "";
    if (!value) {
      setStatus(
        "The comparison could not be copied. Use the Markdown link below.",
      );
      return;
    }
    try {
      if (!navigator.clipboard?.writeText)
        throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setFallback("");
      setStatus("Copied with dates and sources.");
    } catch {
      setFallback(value);
      setStatus("Select and copy the text below.");
    }
  }
  return (
    <div className="copy-for-ai">
      <button className="button secondary" type="button" onClick={copy}>
        Copy for your AI assistant
      </button>
      <span role="status" aria-live="polite">
        {status}
      </span>
      {fallback && (
        <div>
          <label htmlFor={id}>Comparison with dates and sources</label>
          <textarea
            id={id}
            readOnly
            value={fallback}
            rows={10}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
    </div>
  );
}
