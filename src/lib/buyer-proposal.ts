/** Server/build-only input. Never expose the expected ledger to client bundles. */
import fs from "node:fs";
import path from "node:path";
import { resolveBuyerProposal } from "./buyer-proposal-storage";
// Parse once per server/build process, avoiding enormous inferred JSON literal types.
// These fixed paths are also explicitly included in Next's output file tracing.
const stored: unknown = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/buyer-selling-points-2026-10-10.json"),
    "utf8",
  ),
);
const ledger: unknown = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), "data/buyer-identity-snapshots-2026-10-10.json"),
    "utf8",
  ),
);
export const buyerProposal = resolveBuyerProposal(stored, ledger);
