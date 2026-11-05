import fs from "node:fs";
import crypto from "node:crypto";
import { catalogueSnapshot, counts, pack } from "../src/lib/data";
import { safeUrl } from "../src/lib/config";
import { resolveAsset, type ApprovedAsset } from "../src/lib/media";
import { validateResearch } from "../src/lib/validate";
import { validateCatalogueIssues } from "../src/lib/validate-catalogue-issues";
const snapshot = catalogueSnapshot();
const d = snapshot.data;
const errors = validateResearch(d);
const original = fs.readFileSync("au_ev_all_variants_2026-10-06.json");
const copied = fs.readFileSync("data/au_ev_all_variants_2026-10-06.json");
if (!original.equals(copied))
  errors.push("Immutable research differs from original input.");
const assets = JSON.parse(
  fs.readFileSync("media/approved-assets.json", "utf8"),
) as ApprovedAsset[];
for (const a of assets) {
  if (!fs.existsSync(`public${a.src}`))
    errors.push(`Approved media file missing: ${a.id}`);
  for (const placement of a.placements || [])
    for (const modelId of a.modelIds || [])
      if (!resolveAsset(assets, a.id, placement, modelId))
        errors.push(`Asset blocked: ${a.id}`);
  if (!a.placements?.length || !a.modelIds?.length)
    errors.push(`Missing media scope: ${a.id}`);
}
for (const s of d.sources)
  if (!safeUrl(s.url)) errors.push(`Unsafe source URL ${s.id}`);
errors.push(...validateCatalogueIssues(snapshot.cars));
// Stop before pack/export consumers can dereference malformed issue objects.
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
for (const c of snapshot.cars) {
  const p = pack(c.id, snapshot);
  if (p.features.some((f) => typeof f.value !== "string"))
    errors.push(`Unsafe display value ${c.id}`);
  for (const f of p.features) {
    if (f.source_ids.some((id) => !d.sources.some((s) => s.id === id)))
      errors.push(
        `Missing source in display overlay: ${c.id} / ${f.criterion}`,
      );
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  JSON.stringify(
    {
      result: "PASS",
      counts: counts(snapshot),
      sourceReferences: d.sources.length,
      publicationIssues: d.publication_issues.length,
      sha256: crypto.createHash("sha256").update(copied).digest("hex"),
      approvedExternalAssets: assets.length,
      note: "Structural integrity, not independent factual verification.",
    },
    null,
    2,
  ),
);
