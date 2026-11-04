/** Server/build-only data input. Keep the large evidence ledger out of TypeScript's literal-type graph. */
import fs from "node:fs";
import path from "node:path";
import type { Fact, Feature, Research, Variant } from "./types";
type CatalogueAdditions = {
  checkedAt: string;
  models: Research["models"];
  variants: Variant[];
  facts: (Fact & { variantId: string })[];
  features: Feature[];
  sources: Research["sources"];
};
const raw: unknown = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/catalogue-additions-2026-10-10.json"),
    "utf8",
  ),
);
if (!raw || typeof raw !== "object" || Array.isArray(raw))
  throw new Error("Invalid catalogue additions root");
const value = raw as Record<string, unknown>;
if (
  typeof value.checkedAt !== "string" ||
  !["models", "variants", "facts", "features", "sources"].every((key) =>
    Array.isArray(value[key]),
  )
)
  throw new Error("Invalid catalogue additions containers");
// Existing full catalogue validation and exact snapshot tests validate row contents.
export const catalogueAdditions = raw as CatalogueAdditions;
