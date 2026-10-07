"use client";
import type { Pack } from "@/lib/types";
import { makeReport, reportMarkdown } from "@/lib/citable";
import { CopyForAI } from "./copy-for-ai";
export function SelectedCopy({ packs }: { packs: Pack[] }) {
  const path = `/compare?cars=${packs.map((p) => p.car.id).join(",")}`;
  return <CopyForAI text={reportMarkdown(makeReport(packs, path))} />;
}
