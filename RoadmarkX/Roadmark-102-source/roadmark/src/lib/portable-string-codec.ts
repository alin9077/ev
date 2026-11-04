/** Lossless string-value interning for a self-contained portable JSON document. */
export const PORTABLE_STRING_FORMAT = "roadmark-string-table-v1";
const PREFIX = "~";
type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };
type JsonContainer = JsonValue[] | JsonObject;
const ownValues = (container: JsonContainer) => container as JsonObject;

/** Accept the existing JSON serialization, preserving its normalization semantics. */
export function encodePortableJson(originalJson: string, minUtf8Bytes = 64) {
  if (!Number.isSafeInteger(minUtf8Bytes) || minUtf8Bytes < 1)
    throw new Error("Invalid portable string threshold");
  const data = JSON.parse(originalJson) as JsonValue;
  const counts = new Map<string, number>();
  const pending: JsonValue[] = [data];
  while (pending.length) {
    const value = pending.pop()!;
    if (typeof value === "string")
      counts.set(value, (counts.get(value) ?? 0) + 1);
    else if (value !== null && typeof value === "object") {
      // Reverse stack insertion preserves ordinary first-occurrence JSON key order.
      const keys = Object.keys(value);
      for (let i = keys.length - 1; i >= 0; i--)
        pending.push(ownValues(value)[keys[i]]);
    }
  }
  const utf8 = new TextEncoder();
  const strings = [...counts]
    .filter(([value, count]) => count > 1 && utf8.encode(value).length >= minUtf8Bytes)
    .map(([value]) => value);
  const ids = new Map(strings.map((value, index) => [value, index]));
  const encoded = JSON.stringify(data, (_key, value: unknown) => {
    if (typeof value !== "string") return value;
    const index = ids.get(value);
    if (index !== undefined) return PREFIX + index.toString(36);
    return value.startsWith(PREFIX) ? PREFIX + value : value;
  });
  // Dictionary strings are original values, never passed through the replacer.
  const envelope = `{"format":${JSON.stringify(PORTABLE_STRING_FORMAT)},"strings":${JSON.stringify(strings)},"data":${encoded}}`;
  return {
    json: envelope.replaceAll("<", "\\u003c").replaceAll("\u2028", "\\u2028").replaceAll("\u2029", "\\u2029"),
    dictionaryValues: strings.length,
    replacedOccurrences: strings.reduce((sum, value) => sum + counts.get(value)!, 0),
  };
}

/** Decode only our versioned envelope; malformed references fail before use. */
export function parsePortableData(text: string): unknown {
  const envelope: unknown = JSON.parse(text);
  if (!envelope || Array.isArray(envelope) || typeof envelope !== "object")
    throw new Error("Invalid portable string-table envelope");
  const record = envelope as Record<string, unknown>;
  if (
    Object.keys(record).length !== 3 ||
    !Object.hasOwn(record, "format") ||
    !Object.hasOwn(record, "strings") ||
    !Object.hasOwn(record, "data") ||
    record.format !== PORTABLE_STRING_FORMAT ||
    !Array.isArray(record.strings) ||
    !record.strings.every((value) => typeof value === "string")
  ) throw new Error("Invalid portable string-table envelope");
  const strings = record.strings as string[];
  const references = new Map<string, string>();
  for (let i = 0; i < strings.length; i++)
    references.set(PREFIX + i.toString(36), strings[i]);
  const decodeString = (value: string): string => {
    if (!value.startsWith(PREFIX)) return value;
    if (value.startsWith(PREFIX + PREFIX)) return value.slice(1);
    const decoded = references.get(value);
    if (decoded === undefined)
      throw new Error("Invalid portable string-table reference");
    // A dictionary string beginning with the prefix is still a literal, not a token.
    return decoded;
  };
  const data = record.data as JsonValue;
  if (typeof data === "string") return decodeString(data);
  if (data === null || typeof data !== "object") return data;
  const pending: JsonContainer[] = [data];
  while (pending.length) {
    const container = ownValues(pending.pop()!);
    for (const key of Object.keys(container)) {
      const value = container[key];
      if (typeof value === "string") {
        // JSON.parse created this own data property, including an own __proto__.
        // Update it in place without rebuilding, merging or sharing object containers.
        if (value.startsWith(PREFIX)) container[key] = decodeString(value);
      } else if (value !== null && typeof value === "object") pending.push(value);
    }
  }
  return data;
}
