/**
 * pnpm refresh:build — findings -> dated packet (+ optional registration).
 * The packet is only left in place if the real catalogue loader accepts it.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { catalogueSnapshot } from "../../src/lib/data";
import { brandUpdatePackets } from "../../src/lib/brand-update-registry";
import type { BrandSummaryUpdate } from "../../src/lib/brand-updates";
import { buildPacket } from "./packet";
import type { Findings } from "./findings";

const registryPath = "data/m1-brand-updates/registry.json";
function main() {
  const args = process.argv.slice(2);
  let findingsPath = "", out = "", register = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--findings") findingsPath = args[++i] ?? "";
    else if (args[i] === "--out") out = args[++i] ?? "";
    else if (args[i] === "--register") register = true;
    else if (args[i] === "--help") {
      console.log("pnpm refresh:build --findings PATH --out data/m1-brand-updates/<brand>-<date>.json [--register]\nBuilds a guarded packet from a completed findings file, verifies the catalogue loads with it, and prints an account of every claim. Leaves nothing behind if the loader rejects it.");
      return;
    } else throw new Error(`Unknown option ${args[i]}; use --help`);
  }
  if (!findingsPath || !out) throw new Error("--findings and --out are required");
  if (!/^[a-z0-9][a-z0-9-]*\.json$/.test(path.basename(out)) || path.dirname(out) !== "data/m1-brand-updates")
    throw new Error("--out must be data/m1-brand-updates/<lowercase-name>.json");
  if (fs.existsSync(out)) throw new Error(`${out} exists; packets are never overwritten`);
  const findings = JSON.parse(fs.readFileSync(findingsPath, "utf8")) as Findings;
  const { data, cars } = catalogueSnapshot();
  const priorSummaries = new Map<string, BrandSummaryUpdate>();
  for (const packet of brandUpdatePackets)
    for (const row of packet.summaries) priorSummaries.set(row.variantId, row);
  const lastPacketDate = brandUpdatePackets.map((p) => p.reviewedAt).sort().at(-1) ?? "";
  const result = buildPacket(findings, { cars, sources: data.sources, priorSummaries, lastPacketDate });
  const tally = (o: string) => result.accounts.filter((a) => a.outcome === o).length;
  console.log(`Packet ${result.packet.id}: ${result.packet.facts.length} facts, ${result.packet.availability.length} availability records, ${result.packet.summaries.length} summaries re-issued, ${result.packet.sources.length} source snapshots.`);
  console.log(`Claims: ${tally("unchanged")} rechecked unchanged, ${tally("changed")} changed, ${tally("unavailable")} source unavailable (value retained, date unchanged), ${tally("blocked")} blocked, ${tally("pending")} not checked.`);
  for (const a of result.accounts.filter((x) => x.outcome === "changed" || x.outcome === "unavailable" || x.outcome === "blocked"))
    console.log(`  ${a.outcome}: ${a.vehicle} · ${a.key}: ${a.detail}`);
  for (const s of result.summariesNotReissued) console.log(`  summary not re-issued: ${s.variantId}: ${s.reason}`);
  if (!result.packet.facts.length && !result.packet.availability.length) {
    console.log("Nothing was rechecked; no packet written.");
    return;
  }
  const registryText = fs.readFileSync(registryPath, "utf8");
  fs.writeFileSync(out, `${JSON.stringify(result.packet, null, 2)}\n`, { flag: "wx" });
  const registry = JSON.parse(registryText) as { packets: string[] };
  registry.packets.push(path.basename(out));
  fs.writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
  const check = spawnSync(process.execPath, ["--import", "tsx", "-e", "import('./src/lib/data').then((m)=>{const s=m.catalogueSnapshot();console.log('loader accepted '+s.cars.length+' versions')})"], { encoding: "utf8", env: { ...process.env, NODE_OPTIONS: process.env.NODE_OPTIONS ?? "--max-old-space-size=6144" } });
  if (check.status !== 0) {
    fs.rmSync(out);
    fs.writeFileSync(registryPath, registryText);
    throw new Error(`The catalogue loader rejected the packet; it was removed and the registry restored.\n${(check.stderr || check.stdout).split("\n").slice(0, 6).join("\n")}`);
  }
  console.log(check.stdout.trim());
  if (!register) {
    fs.writeFileSync(registryPath, registryText);
    console.log(`Packet written to ${out}. Not registered (add --register to append it to ${registryPath}).`);
  } else console.log(`Packet written to ${out} and registered.`);
}
try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
