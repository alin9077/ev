/**
 * Findings -> a complete, guarded brand packet. Pure: no file or network access.
 * Anything not positively rechecked is left out of the packet, so its value and date stay as they were.
 */
import {
  availabilitySnapshot,
  type AvailabilityCorrection,
} from "../../src/lib/availability-corrections";
import {
  brandVersionSnapshot,
  type BrandSummaryClause,
  type BrandSummaryUpdate,
  type BrandUpdatePacket,
} from "../../src/lib/brand-updates";
import { sameReviewedState } from "../../src/lib/correction-guards";
import { hasEarnedBuyerGrade } from "../../src/lib/evidence-grading";
import type { BuyerGrade, Car, Fact, Source } from "../../src/lib/types";
import { hasValue } from "../reporting/reports";
import {
  FINDINGS_SCHEMA,
  RETAINING_OUTCOMES,
  type Outcome,
} from "./findings-schema";
import type { FieldFinding, Findings } from "./findings";
import { brandSlug } from "./brands";

export type PacketContext = {
  cars: Car[];
  /** Every effective source, used to check grades and to re-snapshot cited sources. */
  sources: Source[];
  /** Latest summary row per version across registered packets, for re-issue. */
  priorSummaries: Map<string, BrandSummaryUpdate>;
  /** reviewedAt of the last registered packet; the registry must stay chronological. */
  lastPacketDate: string;
};
export type ClaimAccount = {
  variantId: string;
  vehicle: string;
  key: string;
  outcome: Outcome | "invalid";
  detail: string;
};
export type PacketResult = {
  packet: BrandUpdatePacket;
  accounts: ClaimAccount[];
  summariesReissued: string[];
  summariesNotReissued: { variantId: string; reason: string }[];
};
const fail = (message: string): never => {
  throw new Error(`Refresh packet: ${message}`);
};
const dateOk = (value: unknown): value is string =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export const packetId = (brand: string, reviewedAt: string) =>
  `refresh-${brandSlug(brand)}-${reviewedAt}`;
/** Facts the loader holds to the price ladder; companion copies without ladder evidence follow ordinary fact rules. */
const LADDER_KEYS = ["price_aud", "promotional_driveaway_aud", "published_driveaway_aud"];
const statusFor = (grade: BuyerGrade): Fact["status"] =>
  grade === "confirmed"
    ? "standard"
    : grade === "not_published"
      ? "not_verified"
      : "conditional";
function checkedDate(finding: { checkedAt?: string; sourceIds?: string[] }, sources: Map<string, Source>, reviewedAt: string, where: string) {
  const ids = finding.sourceIds ?? [];
  if (!ids.length) fail(`${where}: sourceIds required`);
  const dates = ids.map((id) => sources.get(id)?.accessed_date);
  if (dates.some((d) => !dateOk(d))) fail(`${where}: a cited source is not listed in sources[]`);
  const latest = (dates as string[]).sort().at(-1)!;
  const date = finding.checkedAt ?? latest;
  if (!dateOk(date) || date > reviewedAt)
    fail(`${where}: check date ${date} must be a real date on or before reviewedAt`);
  if (date < (dates as string[]).sort()[0] ) fail(`${where}: check date precedes its source access date`);
  return date;
}
function rebuildFact(
  before: Fact | null,
  f: FieldFinding,
  ctx: { id: string; reviewedAt: string; sources: Map<string, Source>; where: string },
): Fact {
  const date = checkedDate(f, ctx.sources, ctx.reviewedAt, ctx.where);
  const ids = [...f.sourceIds!];
  const label = ctx.sources.get(ids[0])?.publisher;
  if (f.outcome === "unchanged") {
    if (!before || !hasValue(before.value))
      fail(`${ctx.where}: "unchanged" needs an existing value; use "changed"`);
    if (!before!.gradeReview || !before!.buyerGrade)
      fail(`${ctx.where}: existing value has no earned grade to carry forward; use "changed" with buyerGrade`);
  }
  if (
    f.outcome === "unchanged" &&
    ((f.value !== undefined && !sameReviewedState(f.value, before?.value)) ||
      (f.basis !== undefined && f.basis !== before?.basis) ||
      (f.comparisonBasis !== undefined && f.comparisonBasis !== before?.comparisonBasis))
  )
    fail(`${ctx.where}: "unchanged" but the finding states a different value or basis; use "changed"`);
  const base: Fact = structuredClone(
    before ?? {
      key: f.key,
      label: f.label,
      value: null,
      unit: f.unit ?? "",
      basis: f.basis ?? "",
      comparisonBasis: f.comparisonBasis ?? "",
      status: "not_verified",
      sourceIds: [],
      date,
      market: "AU",
      scope: "",
      qualifications: [],
      issues: [],
    },
  );
  delete base.gradeReviewStatus;
  const next: Fact = base;
  if (f.outcome === "changed") {
    if (f.value === undefined) fail(`${ctx.where}: "changed" needs value (null only with buyerGrade "not_published")`);
    next.value = f.value as Fact["value"];
    if (f.unit !== undefined) next.unit = f.unit;
    if (f.basis !== undefined) next.basis = f.basis;
    if (f.comparisonBasis !== undefined) next.comparisonBasis = f.comparisonBasis;
    if (f.qualifications) next.qualifications = [...f.qualifications];
    if (f.conditionExplanation !== undefined) next.conditionExplanation = f.conditionExplanation;
    if (f.validUntil !== undefined) next.validUntil = f.validUntil;
    else if (before?.validUntil !== undefined) delete next.validUntil;
  }
  const grade: BuyerGrade =
    f.buyerGrade ??
    (f.value === null && f.outcome === "changed"
      ? "not_published"
      : (before?.buyerGrade as BuyerGrade));
  if (!grade) fail(`${ctx.where}: buyerGrade required`);
  if (grade === "not_published") {
    if (f.outcome !== "changed" || f.value !== null)
      fail(`${ctx.where}: "not_published" is a changed outcome with value null`);
    const distinct = new Set(ids.map((id) => ctx.sources.get(id)!.url.replace(/#.*$/, "")));
    if (distinct.size < 2) fail(`${ctx.where}: "Not published" needs two distinct sources searched`);
  }
  next.buyerGrade = grade;
  next.status = statusFor(grade);
  if (grade === "reported") next.resolvedElsewhere = true;
  else delete next.resolvedElsewhere;
  if (grade !== "check") delete next.conditionExplanation;
  else if (!next.conditionExplanation?.trim())
    fail(`${ctx.where}: a Check value needs conditionExplanation`);
  next.sourceIds = ids;
  next.date = date;
  const scope =
    grade === "not_published"
      ? "searched_not_found"
      : grade === "reported"
        ? "secondary_or_sibling"
        : before?.gradeReview?.evidenceScope &&
            !["secondary_or_sibling", "searched_not_found"].includes(before.gradeReview.evidenceScope)
          ? before.gradeReview.evidenceScope
          : "exact_au_version";
  next.gradeReview = {
    reviewedAt: ctx.reviewedAt,
    overlayId: ctx.id,
    reason:
      f.reason ??
      (f.outcome === "unchanged"
        ? `Rechecked ${date} against the cited page: unchanged. ${f.note ?? ""}`.trim()
        : `Rechecked ${date} against the cited page: ${f.note ?? "value updated"}`.trim()),
    evidenceScope: scope,
    sourceIds: ids,
    ...(label ? { sourceLabel: label } : {}),
  };
  if (next.priceEvidence) {
    next.priceEvidence = {
      ...next.priceEvidence,
      sourcePointer: ctx.sources.get(ids[0])!.url,
      ...(f.priceRung ? { rung: f.priceRung } : {}),
      ...(f.priceBasisTag ? { basisTag: f.priceBasisTag } : {}),
      ...(f.priceState ? { state: f.priceState } : {}),
      ...(f.publisher ? { publisher: f.publisher } : {}),
    };
    if (f.outcome === "changed" && f.basis !== undefined)
      next.priceEvidence.originalBasis = f.basis;
  } else if (f.outcome === "changed" && LADDER_KEYS.includes(f.key) && f.value !== null)
    fail(`${ctx.where}: a changed price needs an existing priceEvidence ladder entry to update (add via a normal brand update)`);
  return next;
}
export function buildPacket(findings: Findings, ctx: PacketContext): PacketResult {
  if (findings.schema !== FINDINGS_SCHEMA) fail(`schema must be ${FINDINGS_SCHEMA}`);
  if (!dateOk(findings.reviewedAt)) fail("reviewedAt must be a real date");
  if (findings.reviewedAt < ctx.lastPacketDate)
    fail(`reviewedAt ${findings.reviewedAt} is earlier than the last registered packet (${ctx.lastPacketDate}); the registry must stay chronological`);
  if (!findings.reviewedBy?.trim()) fail("reviewedBy required");
  const id = packetId(findings.brand, findings.reviewedAt);
  const sourceIndex = new Map(ctx.sources.map((s) => [s.id, s]));
  const newSources: Source[] = [];
  for (const source of findings.sources) {
    if (sourceIndex.has(source.id)) {
      if (!sameReviewedState(sourceIndex.get(source.id), source))
        fail(`source ${source.id} already exists with different content`);
      continue;
    }
    if (!dateOk(source.accessed_date) || source.accessed_date > findings.reviewedAt)
      fail(`source ${source.id}: accessed_date must be a real date on or before reviewedAt`);
    newSources.push(structuredClone(source));
  }
  const allSources = new Map(sourceIndex);
  for (const s of newSources) allSources.set(s.id, s);

  const accounts: ClaimAccount[] = [];
  const facts: BrandUpdatePacket["facts"] = [];
  const availability: AvailabilityCorrection[] = [];
  const touched = new Map<string, Map<string, { before: Fact | null; after: Fact }>>();
  for (const version of findings.versions) {
    const car = ctx.cars.find((c) => c.id === version.variantId);
    if (!car) fail(`unknown version ${version.variantId}`);
    if (car!.brand.toLowerCase() !== findings.brand.toLowerCase())
      fail(`${version.variantId} belongs to ${car!.brand}, not ${findings.brand}`);
    for (const f of version.fields) {
      const where = `${version.variantId}/${f.key}`;
      if (RETAINING_OUTCOMES.includes(f.outcome)) {
        accounts.push({
          variantId: version.variantId, vehicle: version.vehicle, key: f.key, outcome: f.outcome,
          detail: f.outcome === "pending"
            ? "not checked; value and date unchanged"
            : `source unavailable, value retained, date unchanged${f.note ? ` (${f.note})` : ""}`,
        });
        continue;
      }
      if (f.outcome !== "unchanged" && f.outcome !== "changed") fail(`${where}: unknown outcome ${String(f.outcome)}`);
      const before = car!.facts[f.key] ?? null;
      const after = rebuildFact(before, f, { id, reviewedAt: findings.reviewedAt, sources: allSources, where });
      if (!hasEarnedBuyerGrade(after, [...ctx.sources, ...newSources], findings.reviewedAt))
        fail(`${where}: the cited sources do not earn grade "${after.buyerGrade}" (a Confirmed value needs maker Australian sources; Reported needs secondary_or_sibling scope; Not published needs two distinct pages)`);
      facts.push({ variantId: version.variantId, before: before ? structuredClone(before) : null, after });
      const per = touched.get(version.variantId) ?? new Map();
      per.set(f.key, { before, after });
      touched.set(version.variantId, per);
      accounts.push({
        variantId: version.variantId, vehicle: version.vehicle, key: f.key, outcome: f.outcome,
        detail: f.outcome === "unchanged"
          ? `rechecked ${after.date}, unchanged`
          : `${show(before)} -> ${show(after)}`,
      });
    }
    const a = version.availability;
    if (a && !RETAINING_OUTCOMES.includes(a.outcome)) {
      const where = `${version.variantId}/availability`;
      if (a.outcome !== "unchanged" && a.outcome !== "changed") fail(`${where}: unknown outcome`);
      const date = checkedDate(a, allSources, findings.reviewedAt, where);
      const snap = availabilitySnapshot(car!);
      const nextState = a.outcome === "changed" ? (a.availability ?? fail(`${where}: changed needs availability`)) : snap.availability;
      const evidence = {
        ...structuredClone(snap.evidence),
        checkedAt: date,
        sourceIds: [...a.sourceIds!],
        orderStatus: a.outcome === "changed" ? (a.orderStatus ?? snap.evidence.orderStatus) : snap.evidence.orderStatus,
        stockStatus: a.outcome === "changed" ? (a.stockStatus ?? snap.evidence.stockStatus) : snap.evidence.stockStatus,
        qualifications: a.qualifications?.length ? [...a.qualifications] : snap.evidence.qualifications?.length ? [...snap.evidence.qualifications] : ["Order listing only; allocation, physical stock and delivery were not confirmed."],
      };
      availability.push({
        id: `${id}-availability-${version.variantId}`,
        variantId: version.variantId,
        before: snap,
        after: { availability: nextState, evidence },
        status: "approved",
        reviewedBy: findings.reviewedBy,
        reviewedAt: findings.reviewedAt,
        evidenceDate: date,
        reason: `Rechecked ${date}: ${a.outcome === "unchanged" ? "availability unchanged" : (a.note ?? "availability changed")}`,
      });
      accounts.push({
        variantId: version.variantId, vehicle: version.vehicle, key: "availability", outcome: a.outcome,
        detail: a.outcome === "unchanged" ? `rechecked ${date}, unchanged` : `${snap.availability}/${snap.evidence.orderStatus} -> ${nextState}/${evidence.orderStatus}`,
      });
    } else if (a)
      accounts.push({ variantId: version.variantId, vehicle: version.vehicle, key: "availability", outcome: a.outcome,
        detail: a.outcome === "pending" ? "not checked; value and date unchanged" : `source unavailable, value retained, date unchanged${a.note ? ` (${a.note})` : ""}` });
  }
  // Summaries: re-issue only where a clause depends on a fact this packet re-dates.
  const summaries: BrandSummaryUpdate[] = [];
  const reissued: string[] = [];
  const skipped: { variantId: string; reason: string }[] = [];
  for (const [variantId, per] of touched) {
    const prior = ctx.priorSummaries.get(variantId);
    const car = ctx.cars.find((c) => c.id === variantId)!;
    if (!prior) continue;
    const depends = [prior.strength, prior.tradeoff].some((clause) => clause.dependencies.some((d) => per.has(d.key)));
    if (!depends) continue;
    const rows: Record<"strength" | "tradeoff", BrandSummaryClause> = {} as never;
    let reason = "";
    for (const name of ["strength", "tradeoff"] as const) {
      const clause = prior[name];
      const override = findings.summaryOverrides?.[variantId]?.[name];
      const valueMoved = clause.dependencies.some((d) => {
        const t = per.get(d.key);
        return !!t && !sameReviewedState(t.before?.value, t.after.value);
      });
      if (valueMoved && !override) reason = `${name} depends on a value that changed; supply summaryOverrides.${variantId}.${name}`;
      const deps = clause.dependencies.map((d) => ({
        key: d.key,
        expected: per.get(d.key)?.after ?? car.facts[d.key],
      }));
      if (deps.some((d) => !d.expected)) reason = reason || `${name}: dependency missing from the catalogue`;
      rows[name] = { label: override?.label ?? clause.label, text: override?.text ?? clause.text, dependencies: deps as BrandSummaryClause["dependencies"] };
    }
    if (reason) {
      if (reason.includes("supply summaryOverrides")) fail(reason);
      skipped.push({ variantId, reason });
      continue;
    }
    if (!car.buyerSummary?.strength || !car.buyerSummary?.tradeoff) {
      skipped.push({ variantId, reason: "summary was already invalid before this refresh; cannot be re-issued without new wording" });
      continue;
    }
    summaries.push({ variantId, conditions: prior.conditions ?? [], strength: rows.strength, tradeoff: rows.tradeoff });
    reissued.push(variantId);
  }
  // Packet source snapshots: new sources, plus every existing source a re-issued summary cites.
  const cited = new Set<string>();
  for (const s of summaries) for (const c of [s.strength, s.tradeoff]) for (const d of c.dependencies) d.expected.sourceIds.forEach((x) => cited.add(x));
  for (const f of facts) f.after.sourceIds.forEach((x) => cited.add(x));
  for (const a of availability) a.after.evidence.sourceIds.forEach((x) => cited.add(x));
  const packetSources = [...newSources];
  for (const sid of [...cited].sort())
    if (!packetSources.some((s) => s.id === sid)) {
      const existing = sourceIndex.get(sid);
      if (!existing) fail(`cited source ${sid} is not in the catalogue or sources[]`);
      packetSources.push(structuredClone(existing!));
    }
  const guarded = new Set([...touched.keys(), ...availability.map((a) => a.variantId)]);
  const packet: BrandUpdatePacket = {
    schemaVersion: 1,
    id,
    brand: ctx.cars.find((c) => guarded.has(c.id))?.brand ?? findings.brand,
    reviewedAt: findings.reviewedAt,
    reviewedBy: findings.reviewedBy,
    sources: packetSources,
    models: [],
    variants: [],
    versionGuards: [...guarded].sort().map((variantId) => ({
      variantId,
      before: brandVersionSnapshot(ctx.cars.find((c) => c.id === variantId)!),
    })),
    versionUpdates: [],
    facts,
    availability,
    summaries,
  };
  return { packet, accounts, summariesReissued: reissued, summariesNotReissued: skipped };
}
function show(fact: Fact | null) {
  return fact && hasValue(fact.value) ? `${String(fact.value)}${fact.unit ? " " + fact.unit : ""} [${fact.comparisonBasis || fact.basis}]` : "Not published";
}
