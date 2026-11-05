/** Server-only dated packet loader. Registry order is explicit, never regenerated. */
import fs from "node:fs";
import path from "node:path";
import type { BrandUpdatePacket } from "./brand-updates";
const directory = path.join(process.cwd(), "data/m1-brand-updates");
const registry = JSON.parse(
  fs.readFileSync(path.join(directory, "registry.json"), "utf8"),
) as { schemaVersion: number; packets: string[] };
if (
  registry.schemaVersion !== 1 ||
  !Array.isArray(registry.packets) ||
  new Set(registry.packets).size !== registry.packets.length ||
  registry.packets.some(
    (name) =>
      !/^[a-z0-9][a-z0-9-]*\.json$/.test(name) || name === "registry.json",
  )
)
  throw new Error("Invalid brand update registry");
export const brandUpdatePackets: BrandUpdatePacket[] = registry.packets.map(
  (name) =>
    JSON.parse(
      fs.readFileSync(path.join(directory, name), "utf8"),
    ) as BrandUpdatePacket,
);
