"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Fact } from "@/lib/types";
import { makeIssueDraft } from "@/lib/corrections";
import { makeDeviceIssueDraft } from "@/lib/device-issue-drafts";
import {
  createClaimBinding,
  reportClaimContextKey,
  supportsBoundReporting,
} from "@/lib/report-claim-binding";
import {
  ReportSubmissionGate,
  type ReportSubmissionToken,
} from "@/lib/report-submission-state";
import { submitBoundIssueReport } from "@/lib/report-submission-client";
let reportingPromise: Promise<boolean> | undefined;
function hasLocalInbox() {
  reportingPromise ??= fetch("/api/reporting")
    .then((r) => (r.ok ? r.json() : null))
    .then(supportsBoundReporting)
    .catch(() => false);
  return reportingPromise;
}
export function ClaimReport({
  variantId,
  fact,
}: {
  variantId: string;
  fact: Fact;
}) {
  // Recompute from complete values, not object identity. Equivalent replacement props keep the lock.
  const context = reportClaimContextKey(variantId, fact);
  const [draft, setDraft] = useState({ context, text: "" });
  const [feedback, setFeedback] = useState({ context, text: "" });
  const [pendingToken, setPendingToken] = useState<ReportSubmissionToken>();
  const [localInbox, setLocalInbox] = useState(false);
  const gateRef = useRef<ReportSubmissionGate | null>(null);
  if (!gateRef.current) gateRef.current = new ReportSubmissionGate(context);
  const gate = gateRef.current;
  const description = draft.context === context ? draft.text : "";
  const message = feedback.context === context ? feedback.text : "";
  const sending =
    !!pendingToken &&
    pendingToken.context === context &&
    gate.isCurrent(pendingToken);
  useLayoutEffect(() => {
    gate.activate(context);
    return () => gate.dispose();
  }, [gate, context]);
  useEffect(() => {
    let active = true;
    hasLocalInbox().then((enabled) => {
      if (active) setLocalInbox(enabled);
    });
    return () => {
      active = false;
    };
  }, []);
  async function submit() {
    const token = gate.begin(context, description);
    if (!token) return;
    setPendingToken(token);
    try {
      makeIssueDraft(
        variantId,
        fact,
        description,
        new Date().toISOString(),
        "validate",
      );
      const factKey = fact.key;
      const binding = await createClaimBinding(variantId, fact);
      // A context switch before POST must not send a report from the abandoned screen.
      if (!gate.isCurrent(token)) return;
      const result = await submitBoundIssueReport({
        variantId,
        factKey,
        description,
        claimBinding: binding,
      });
      setFeedback((previous) =>
        gate.canPublishFeedback(token)
          ? {
              context,
              text: `Saved to the local editorial review queue. Reference ${result.id}. The complete claim matched the service snapshot. No fact has been changed.`,
            }
          : previous,
      );
      setDraft((previous) =>
        gate.canClear(token, previous.context, previous.text)
          ? { context, text: "" }
          : previous,
      );
    } catch (error) {
      setFeedback((previous) =>
        gate.canPublishFeedback(token)
          ? {
              context,
              text:
                error instanceof Error
                  ? error.message
                  : "Could not confirm the save. Your description is still here; check the local queue before retrying.",
            }
          : previous,
      );
    } finally {
      if (gate.finish(token))
        setPendingToken((previous) =>
          previous?.operation === token.operation ? undefined : previous,
        );
    }
  }
  function save() {
    if (gate.hasActive(context)) return;
    gate.noteEdit(context);
    try {
      const saved = makeDeviceIssueDraft(
        variantId,
        fact,
        description,
        new Date().toISOString(),
        crypto.randomUUID(),
      );
      const existing: unknown = JSON.parse(
        localStorage.getItem("roadmark-issue-drafts") || "[]",
      );
      if (!Array.isArray(existing))
        throw new Error("Stored draft queue could not be read.");
      localStorage.setItem(
        "roadmark-issue-drafts",
        JSON.stringify([...existing, saved]),
      );
      setFeedback({
        context,
        text: "Saved on this device with a snapshot of this claim. Not sent to Roadmark. Export it below for editorial review.",
      });
      setDraft({ context, text: "" });
    } catch (error) {
      setFeedback({
        context,
        text:
          error instanceof Error
            ? error.message
            : "Could not save on this device.",
      });
    }
  }
  function download() {
    if (gate.hasActive(context)) return;
    gate.noteEdit(context);
    try {
      const data = localStorage.getItem("roadmark-issue-drafts") || "[]";
      const url = URL.createObjectURL(
        new Blob([data], { type: "application/json" }),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "roadmark-issue-drafts.json";
      a.click();
      URL.revokeObjectURL(url);
      setFeedback({
        context,
        text: "Draft queue exported. It has not been submitted automatically.",
      });
    } catch {
      setFeedback({
        context,
        text: "Export unavailable on this device. Copy your issue description instead.",
      });
    }
  }
  return (
    <details className="claim-report">
      <summary>Report an issue with {fact.label}</summary>
      <p className="small muted">
        This report is tied to this exact trim and claim.{" "}
        {localInbox
          ? "You can send it to this preview’s durable local editorial queue. No public reporting service is connected."
          : "This preview saves drafts on this device only; no shared inbox is connected."}
      </p>
      <label>
        What needs correcting?
        <textarea
          value={description}
          minLength={10}
          maxLength={2000}
          rows={3}
          onChange={(e) => {
            gate.noteEdit(context);
            setDraft({ context, text: e.target.value });
            setFeedback({ context, text: "" });
          }}
        />
      </label>
      <div className="claim-report-actions">
        {localInbox && (
          <button type="button" disabled={sending} onClick={submit}>
            {sending ? "Saving report…" : "Send to local review queue"}
          </button>
        )}
        <button type="button" disabled={sending} onClick={save}>
          Save issue draft
        </button>
        <button type="button" disabled={sending} onClick={download}>
          Export saved drafts
        </button>
      </div>
      <p role="status" className="small">
        {message}
      </p>
    </details>
  );
}
