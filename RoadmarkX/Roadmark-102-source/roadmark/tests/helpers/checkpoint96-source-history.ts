import assert from "node:assert/strict";
import { createHash } from "node:crypto";

// Exact reviewed checkpoint96 delta. Historical fixtures keep their original pins.
// Both whole current files must match before any reverse substitution is allowed.
const sourceDeltas = [
  {
    "file": "src/components/discovery.tsx",
    "approvedSHA256": "02be90e98919418e433a853ae6019adfdb833b1a0e86a7d9d2d3564da9afecb8",
    "previousSHA256": "c382047506d1881d4483e6478757dca41fc6d8011855e151027df027f689aa6f",
    "previousBytes": 26192,
    "replacements": [
      {
        "before": "<Link href={urlFor(c)}>{c.model}</Link>",
        "after": "<Link href={urlFor(c)} prefetch={false}>\n                        {c.model}\n                      </Link>"
      },
      {
        "before": "<Link href={urlFor(c)}>Exact trim & evidence →</Link>",
        "after": "<Link href={urlFor(c)} prefetch={false}>\n                        Exact trim & evidence →\n                      </Link>"
      },
      {
        "before": "<Link href={urlFor(e.car)}>",
        "after": "<Link href={urlFor(e.car)} prefetch={false}>"
      },
      {
        "before": "<Link href={urlFor(c)}>\n                        {c.brand} {c.model} {c.trim}",
        "after": "<Link href={urlFor(c)} prefetch={false}>\n                        {c.brand} {c.model} {c.trim}"
      }
    ]
  },
  {
    "file": "src/portable/link.tsx",
    "approvedSHA256": "31140de06908d3d089d6a0ae025e6cb37864334d4d2e642d7c39e029c506963b",
    "previousSHA256": "0add93ac8b2209b4cba733f805d3bfb7f9252fd3d33bd0d9b3da65c95a8ecfe6",
    "previousBytes": 647,
    "replacements": [
      {
        "before": "import type { ComponentProps } from \"react\";\nimport { localUrl, navigate } from \"./navigation\";\nexport default function Link({\n  href,\n  onClick,\n  ...props\n}: ComponentProps<\"a\"> & { href: string }) {\n",
        "after": "import type { ComponentProps } from \"react\";\nimport { localUrl, navigate } from \"./navigation\";\nexport default function Link({\n  href,\n  onClick,\n  prefetch,\n  ...props\n}: ComponentProps<\"a\"> & {\n  href: string;\n  prefetch?: boolean | \"auto\" | null;\n}) {\n  // The self-contained portable app has no route prefetching.\n  void prefetch;\n"
      }
    ]
  }
] as const;

const sha = (bytes: Uint8Array) =>
  createHash("sha256").update(bytes).digest("hex");

/** Reconstruct bytes, never substitute a digest or accept an already-old source. */
export function sourceBeforeCheckpoint96(
  file: string,
  current: Uint8Array,
): Buffer {
  const spec = sourceDeltas.find((entry) => entry.file === file);
  assert.ok(spec, `No checkpoint96 source delta for ${file}`);
  assert.equal(
    sha(current),
    spec.approvedSHA256,
    `Unapproved checkpoint96 source: ${file}`,
  );
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

/** Validate the complete two-file delta before serving any historical input. */
export function createCheckpoint96SourceReader(
  readCurrent: (file: string) => Buffer,
): (file: string) => Buffer {
  const current = sourceDeltas.map(({ file, approvedSHA256 }) => {
    const bytes = Buffer.from(readCurrent(file));
    assert.equal(
      sha(bytes),
      approvedSHA256,
      `Unapproved checkpoint96 source: ${file}`,
    );
    return { file, bytes };
  });
  const previous = new Map<string, Buffer>();
  for (const { file, bytes } of current)
    previous.set(file, sourceBeforeCheckpoint96(file, bytes));
  return (file) => {
    const bytes = previous.get(file);
    // Do not expose cached buffers to mutation; every other input remains raw.
    return bytes ? Buffer.from(bytes) : readCurrent(file);
  };
}
