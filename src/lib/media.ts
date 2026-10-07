export type ApprovedAsset = {
  id: string;
  src: string;
  owner: string;
  licenceEvidence: string;
  placements: string[];
  transformations: string[];
  credit: string;
  reviewer: string;
  reviewDate: string;
  expires: string | null;
  territory: string;
  modelIds: string[];
  width: number;
  height: number;
  production_allowed: boolean;
  technicalReview: boolean;
};
export function resolveAsset(
  assets: ApprovedAsset[],
  id: string,
  placement: string,
  modelId: string,
  now = new Date().toISOString().slice(0, 10),
) {
  const a = assets.find((a) => a.id === id);
  if (
    !a ||
    !a.production_allowed ||
    !a.owner ||
    !a.licenceEvidence ||
    !a.reviewer ||
    !a.reviewDate ||
    !a.technicalReview ||
    !a.territory ||
    !a.width ||
    !a.height ||
    !a.placements.includes(placement) ||
    !a.modelIds.includes(modelId) ||
    (a.expires !== null && a.expires < now) ||
    !a.src.startsWith("/media/") ||
    a.src.includes("..") ||
    a.src.includes("?")
  )
    return null;
  return a;
}
