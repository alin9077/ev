"use client";
import { useState } from "react";
import type { Source } from "@/lib/types";
import { safeUrl } from "@/lib/config";
export default function SourceRegistry({ sources }: { sources: Source[] }) {
  const [q, setQ] = useState("");
  const rows = sources.filter((s) =>
    `${s.publisher} ${s.title} ${s.id} ${s.source_type}`
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div className="source-registry">
      <label>
        Search sources
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Publisher, model, topic or source ID"
        />
      </label>
      <p role="status" className="small">
        {rows.length} source records
      </p>
      {rows.map((s) => (
        <details key={s.id}>
          <summary>
            {s.title}
            <span>
              {s.publisher} · {s.source_type.replaceAll("_", " ")} · {s.market}
            </span>
          </summary>
          <div>
            <p>{s.supports}</p>
            <p className="small">
              Published: {s.published_date || "Not supplied"} · Accessed:{" "}
              {s.accessed_date}
            </p>
            {safeUrl(s.url) && (
              <a href={safeUrl(s.url)!} target="_blank" rel="noreferrer">
                Open original source<span className="sr-only"> (new tab)</span>
              </a>
            )}
            {[
              "access_limitation",
              "qualification",
              "caution",
              "conflict",
              "evidence_limit",
              "variant_review_status",
            ].map((k) =>
              s[k] ? (
                <p key={k} className="small">
                  {String(s[k]).replaceAll("_", " ")}
                </p>
              ) : null,
            )}
            <p>
              <code>{s.id}</code>
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}
