import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Verify the complete reviewed display-only delta before recovering checkpoint96.
// No fixture pins or checkpoint96 adapter semantics are changed.
const sourceDeltas = [
  {
    "file": "src/components/discovery.tsx",
    "replacements": [
      {
        "before": "import { australianEvidenceDate } from \"@/lib/evidence-date\";\n",
        "after": "import { australianEvidenceDate } from \"@/lib/evidence-date\";\nimport { buyerDisplayCopy } from \"@/lib/buyer-display-copy\";\n"
      },
      {
        "before": "<p>{c.configurationEvidence.projectionScope}</p>",
        "after": "<p>\n                          {buyerDisplayCopy(\n                            c.id,\n                            \"configurationEvidence.projectionScope\",\n                            c.configurationEvidence.projectionScope,\n                          )}\n                        </p>"
      }
    ],
    "approvedSHA256": "5769cee0feddf21dcf532d39fe65aa752bf8d920891a0ad951e1f6adc7ce3480",
    "previousSHA256": "02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8",
    "previousBytes": 26356
  },
  {
    "file": "src/components/detail.tsx",
    "replacements": [
      {
        "before": "import { EvidenceConditions } from \"./evidence-conditions\";\n",
        "after": "import { EvidenceConditions } from \"./evidence-conditions\";\nimport { buyerDisplayCopy } from \"@/lib/buyer-display-copy\";\n"
      },
      {
        "before": "{c.configurationEvidence.projectionScope}",
        "after": "{buyerDisplayCopy(\n                c.id,\n                \"configurationEvidence.projectionScope\",\n                c.configurationEvidence.projectionScope,\n              )}"
      }
    ],
    "approvedSHA256": "421556c025400b37aeb513411e6b319597101885fdc1bc5b7de2be87510a20ec",
    "previousSHA256": "978ab14e0eda23a2369b46348195d1d82a67bb229533a340c5051ccd735505db",
    "previousBytes": 6759
  },
  {
    "file": "src/components/market-audit.tsx",
    "replacements": [
      {
        "before": "import { matchesSearch } from \"@/lib/search\";\n",
        "after": "import { matchesSearch } from \"@/lib/search\";\nimport { buyerDisplayCopy } from \"@/lib/buyer-display-copy\";\n"
      },
      {
        "before": "<p>{r.evidenceNote}</p>",
        "after": "<p>{buyerDisplayCopy(r.id, \"evidenceNote\", r.evidenceNote)}</p>"
      },
      {
        "before": "<li key={i}>{l}</li>",
        "after": "<li key={i}>{buyerDisplayCopy(r.id, `limitations[${i}]`, l)}</li>"
      }
    ],
    "approvedSHA256": "6062cb777b0943c09aeed8bb457b279ac9ab510509e39773d3aa77c34ecacfc1",
    "previousSHA256": "6b52fec78d11617b6bd1f74142765186c6b647a72fbe3dc928afdc07336401cf",
    "previousBytes": 8323
  }
] as const;
const introducedFiles = [
  {
    "file": "src/lib/buyer-display-copy.ts",
    "approvedSHA256": "2d977241a95d6f83d25cee03c58cab1eb406042d3956e5133e0670f1da4f17be"
  }
] as const;
const sha = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

/** Recover exact bytes; reject unknown, previous, mixed or otherwise changed sources. */
export function sourceBeforeCheckpoint97(
  file: string,
  current: Uint8Array,
): Buffer {
  const spec = sourceDeltas.find((entry) => entry.file === file);
  assert.ok(spec, `No checkpoint97 source delta for ${file}`);
  assert.equal(sha(current), spec.approvedSHA256, `Unapproved checkpoint97 source: ${file}`);
  let previous = Buffer.from(current).toString("utf8");
  for (const replacement of spec.replacements) {
    assert.equal(
      previous.split(replacement.after).length,
      2,
      `Expected exactly one reviewed source replacement: ${file}`,
    );
    previous = previous.replace(replacement.after, replacement.before);
  }
  const bytes = Buffer.from(previous, "utf8");
  assert.equal(bytes.length, spec.previousBytes, `Predecessor length: ${file}`);
  assert.equal(sha(bytes), spec.previousSHA256, `Exact predecessor source: ${file}`);
  return bytes;
}

/** Check all three components and the new display helper before serving old inputs. */
export function createCheckpoint97SourceReader(
  readCurrent: (file: string) => Buffer,
): (file: string) => Buffer {
  const current = [...sourceDeltas, ...introducedFiles].map(({ file, approvedSHA256 }) => {
    const bytes = Buffer.from(readCurrent(file));
    assert.equal(sha(bytes), approvedSHA256, `Unapproved checkpoint97 source: ${file}`);
    return { file, bytes };
  });
  const previous = new Map<string, Buffer>();
  for (const { file, bytes } of current) {
    if (sourceDeltas.some((entry) => entry.file === file))
      previous.set(file, sourceBeforeCheckpoint97(file, bytes));
  }
  return (file) => {
    assert.ok(
      !introducedFiles.some((entry) => entry.file === file),
      `No checkpoint96 predecessor file: ${file}`,
    );
    const bytes = previous.get(file);
    return bytes ? Buffer.from(bytes) : readCurrent(file);
  };
}
