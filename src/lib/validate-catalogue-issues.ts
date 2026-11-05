/** Check runtime JSON before display/export; TypeScript assertions do not validate it. */
export function validateCatalogueIssues(input: unknown): string[] {
  const errors: string[] = [];
  const record = (value: unknown): value is Record<string, unknown> =>
    value !== null && typeof value === "object" && !Array.isArray(value);
  const text = (value: unknown): value is string =>
    typeof value === "string" && value.trim().length > 0;
  if (!Array.isArray(input)) return ["Catalogue must be an array"];
  for (const [carIndex, car] of input.entries()) {
    const carPath = `Catalogue[${carIndex}]`;
    if (!record(car)) {
      errors.push(`${carPath} must be an object`);
      continue;
    }
    const context = text(car.id) ? `${carPath} (${car.id})` : carPath;
    if (!record(car.facts)) {
      errors.push(`${context}.facts must be an object`);
      continue;
    }
    for (const [key, fact] of Object.entries(car.facts)) {
      const path = `${context}.facts.${key}`;
      if (!record(fact)) {
        errors.push(`${path} must be an object`);
        continue;
      }
      if (!Array.isArray(fact.issues)) {
        errors.push(`${path}.issues must be an array`);
        continue;
      }
      for (const [index, issue] of fact.issues.entries()) {
        const issuePath = `${path}.issues[${index}]`;
        if (!record(issue)) {
          errors.push(`${issuePath} must be an Issue object`);
          continue;
        }
        for (const field of [
          "issue_id",
          "title",
          "priority",
          "publication_action",
        ]) {
          if (!text(issue[field]))
            errors.push(`${issuePath}.${field} must be a non-empty string`);
        }
        for (const field of ["model_ids", "source_ids"]) {
          const ids = issue[field];
          if (!Array.isArray(ids) || !Array.from(ids).every(text))
            errors.push(
              `${issuePath}.${field} must be an array of non-empty strings`,
            );
        }
      }
    }
  }
  return errors;
}
