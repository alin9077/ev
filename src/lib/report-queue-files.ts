const uuid = "[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}";
const boundFile = new RegExp(`^bound-v2-${uuid}\\.json$`);
const exactUuid = new RegExp(`^${uuid}$`);
const legacyFile = /^[a-f0-9-]+\.json$/;
export const isReportId = (value: unknown): value is string =>
  typeof value === "string" && exactUuid.test(value);
/** Preserve the old filename family; never rename or migrate historical records. */
export function reportFileKind(
  name: string,
): "bound-v2" | "legacy" | undefined {
  if (boundFile.test(name)) return "bound-v2";
  if (legacyFile.test(name)) return "legacy";
  return undefined;
}
export function boundReportFilename(id: string): string {
  if (!isReportId(id)) throw new Error("A canonical report UUID is required.");
  return `bound-v2-${id}.json`;
}
