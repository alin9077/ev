/** A small JSON Schema validator for the keywords data/changes/schema.json uses. No dependencies. */
export type Schema = {
  type?: string | string[];
  enum?: unknown[];
  const?: unknown;
  pattern?: string;
  minimum?: number;
  minLength?: number;
  required?: string[];
  properties?: Record<string, Schema>;
  additionalProperties?: boolean | Schema;
  items?: Schema;
  uniqueItems?: boolean;
  $ref?: string;
  $defs?: Record<string, Schema>;
  [annotation: string]: unknown;
};
const typeOf = (value: unknown) =>
  value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
const matchesType = (value: unknown, type: string) =>
  type === "integer"
    ? Number.isInteger(value)
    : type === "number"
      ? typeof value === "number" && Number.isFinite(value)
      : typeOf(value) === type;
export function validateAgainstSchema(
  value: unknown,
  schema: Schema,
  root: Schema = schema,
  at = "$",
): string[] {
  if (schema.$ref) {
    const name = schema.$ref.replace("#/$defs/", "");
    const target = root.$defs?.[name];
    return target
      ? validateAgainstSchema(value, target, root, at)
      : [`${at}: unresolved $ref ${schema.$ref}`];
  }
  const errors: string[] = [];
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesType(value, type)))
      return [`${at}: expected ${types.join("|")}, got ${typeOf(value)}`];
  }
  if (schema.const !== undefined && value !== schema.const)
    errors.push(`${at}: must be ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value))
    errors.push(`${at}: ${JSON.stringify(value)} is not one of ${schema.enum.join(", ")}`);
  if (typeof value === "string") {
    if (schema.pattern && !new RegExp(schema.pattern).test(value))
      errors.push(`${at}: does not match ${schema.pattern}`);
    if (schema.minLength !== undefined && value.length < schema.minLength)
      errors.push(`${at}: shorter than ${schema.minLength}`);
  }
  if (typeof value === "number" && schema.minimum !== undefined && value < schema.minimum)
    errors.push(`${at}: below ${schema.minimum}`);
  if (Array.isArray(value)) {
    if (schema.items)
      value.forEach((item, i) =>
        errors.push(...validateAgainstSchema(item, schema.items!, root, `${at}[${i}]`)),
      );
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length)
      errors.push(`${at}: items must be unique`);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const object = value as Record<string, unknown>;
    for (const key of schema.required ?? [])
      if (!(key in object)) errors.push(`${at}: missing "${key}"`);
    for (const [key, child] of Object.entries(object)) {
      const rule = schema.properties?.[key];
      if (rule) errors.push(...validateAgainstSchema(child, rule, root, `${at}.${key}`));
      else if (schema.additionalProperties === false)
        errors.push(`${at}: unexpected property "${key}"`);
      else if (typeof schema.additionalProperties === "object")
        errors.push(...validateAgainstSchema(child, schema.additionalProperties, root, `${at}.${key}`));
    }
  }
  return errors;
}
