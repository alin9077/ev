import { createCheckpoint101SourceReader } from "./checkpoint101-source-history";
import { createCheckpoint99SourceReader, researchBeforeCheckpoint99, carsBeforeCheckpoint99 } from "./checkpoint99-history";
import { createRequire } from "node:module";
import { createCheckpoint96SourceReader } from "./checkpoint96-source-history";
import { createCheckpoint97SourceReader } from "./checkpoint97-source-history";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import { catalogue, research } from "../../src/lib/data";
import { resolveBuyerProposal } from "../../src/lib/buyer-proposal-storage";
import type { SellingPointProposal } from "../../src/lib/selling-points";
import type { Car } from "../../src/lib/types";
const require = createRequire(import.meta.url);
const H = require("../../qa/checkpoint91/checkpoint91-harness.cjs");
const core = require("../../qa/checkpoint91/checkpoint91-history-core.cjs");
const dir = fileURLToPath(new URL("../../qa/checkpoint91/", import.meta.url));
const fixture = core.readRuntimeFixture(dir);
const f = H.loadFixtures(dir);
const readBefore99 = createCheckpoint99SourceReader((file) => readFileSync(new URL("../../" + file, import.meta.url)));
const read = (name: string) => JSON.parse(readBefore99(name).toString("utf8"));
// Verify97 first, then let the unchanged96 reader verify and recover its predecessors.
const readSourceBefore97 = createCheckpoint97SourceReader(createCheckpoint101SourceReader(readBefore99));
const readSourceBefore96 = createCheckpoint96SourceReader(readSourceBefore97);
// One input verification per test module instance; never accept post91 drift as a baseline.
for (const [file, pin] of Object.entries(f.pins) as [string, { sha256: string }][]) {
  if (file !== H.PROPOSAL_FILE && file !== H.LEDGER_FILE)
    assert.equal(H.sha(readSourceBefore96(file)), pin.sha256, file);
}
const previousStorage = H.freeze(core.previousStorage(read(H.PROPOSAL_FILE), read(H.LEDGER_FILE), fixture, f));
core.checkResearch(researchBeforeCheckpoint99(research()), fixture);
/** Verifies the complete approved+1 delta before any historical reconstruction. */
export function carsBeforeCheckpoint91(cars: Car[] = catalogue()): Car[] {
  return core.previousCars(carsBeforeCheckpoint99(cars), fixture) as Car[];
}
/** Removes only the exactly verified coordinated proposal+ledger append. */
export function dataBeforeCheckpoint91(file: string): Record<string, unknown> {
  if (file !== H.PROPOSAL_FILE && file !== H.LEDGER_FILE) return read(file);
  return structuredClone(file === H.PROPOSAL_FILE ? previousStorage.stored : previousStorage.ledger) as Record<string, unknown>;
}
/** Keep old policy-date counts on their exact historical proposal, never by changing328 to329. */
export function buyerProposalBeforeCheckpoint91(): SellingPointProposal {
  return resolveBuyerProposal(structuredClone(previousStorage.stored), structuredClone(previousStorage.ledger));
}
