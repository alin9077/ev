// Live HTTP integration: intentionally excluded until explicit browser/localhost permission.
import { createHash } from "node:crypto";
import { catalogue, research, effectiveFeatures } from "../src/lib/data";
import { featureReportClaim } from "../src/lib/corrections";
import { availabilityReportClaim } from "../src/lib/availability-corrections";
import {
  createClaimBinding,
  REPORT_CONTENT_TYPE,
} from "../src/lib/report-claim-binding";
import { REPORT_LIST_CONTENT_TYPE } from "../src/lib/report-queue-projection";
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
test("local review service persists exact claims and rejects foreign origins", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "roadmark-review-test-"));
  const child = spawn(
    process.execPath,
    ["--import", "tsx", "scripts/serve-roadmark.ts"],
    {
      cwd: process.cwd(),
      env: { ...process.env, PORT: "0", ROADMARK_REVIEW_DIR: directory },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  try {
    const origin = await new Promise<string>((resolve, reject) => {
      let output = "",
        errors = "";
      const timer = setTimeout(
        () => reject(new Error(`Startup timeout: ${errors}`)),
        15000,
      );
      child.stderr.on("data", (chunk) => (errors += chunk));
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = output.match(/http:\/\/127\.0\.0\.1:\d+/);
        if (match) {
          clearTimeout(timer);
          resolve(match[0]);
        }
      });
      child.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`Server exited ${code}: ${errors}`));
      });
    });
    const cars = catalogue(),
      researchData = research();
    async function boundBody(input: {
      variantId: string;
      factKey: string;
      description: string;
    }) {
      const car = cars.find((c) => c.id === input.variantId)!;
      const feature = effectiveFeatures(car, researchData).find(
        (f) => `feature:${f.criterion}` === input.factKey,
      );
      const fact =
        car.facts[input.factKey] ||
        (input.factKey === "availability:exact_version"
          ? availabilityReportClaim(car)
          : feature
            ? featureReportClaim(
                feature,
                researchData.criteria.find((c) => c.key === feature.criterion)
                  ?.label || feature.criterion,
              )
            : undefined);
      assert.ok(fact);
      return JSON.stringify({
        ...input,
        claimBinding: await createClaimBinding(car.id, fact, async (s) =>
          createHash("sha256").update(s).digest("hex"),
        ),
      });
    }
    const body = await boundBody({
      variantId: "byd_dolphin__essential_fwd__20261010",
      factKey: "range_km",
      description: "QA test: verify exact-claim identity and persistence.",
    });
    const foreign = await fetch(`${origin}/api/issues`, {
      method: "POST",
      headers: {
        origin: "https://example.com",
        "content-type": REPORT_CONTENT_TYPE,
      },
      body,
    });
    assert.equal(foreign.status, 403);
    assert.equal((await readdir(directory)).length, 0);
    const accepted = await fetch(`${origin}/api/issues`, {
      method: "POST",
      headers: { origin, "content-type": REPORT_CONTENT_TYPE },
      body,
    });
    assert.equal(accepted.status, 201);
    const data = await (
      await fetch(`${origin}/api/issues`, {
        headers: { accept: REPORT_LIST_CONTENT_TYPE },
      })
    ).json();
    assert.equal(data.totalRecognizedFiles, 1);
    assert.equal(data.reports[0].observedValuePreview, "340");
    assert.equal(data.reports[0].status, "pending");
    assert.equal(data.reports[0].vehicleLabel, "BYD DOLPHIN Essential FWD");
    const equipment = await fetch(`${origin}/api/issues`, {
      method: "POST",
      headers: { origin, "content-type": REPORT_CONTENT_TYPE },
      body: await boundBody({
        variantId: "byd_dolphin__premium_fwd__20261010",
        factKey: "feature:front_heated_seats",
        description: "QA test: verify exact equipment report persistence.",
      }),
    });
    assert.equal(equipment.status, 201);
    const updated = await (
      await fetch(`${origin}/api/issues`, {
        headers: { accept: REPORT_LIST_CONTENT_TYPE },
      })
    ).json();
    assert.equal(updated.totalRecognizedFiles, 2);
    const report = updated.reports.find(
      (r: { claimKind?: string }) => r.claimKind === "feature",
    );
    assert.equal(report.factKey, "feature:front_heated_seats");
    assert.equal(report.observedStatus, "standard");
    assert.ok(report.observedConditions.length > 0);
    const availability = await fetch(`${origin}/api/issues`, {
      method: "POST",
      headers: { origin, "content-type": REPORT_CONTENT_TYPE },
      body: await boundBody({
        variantId: "byd_dolphin__essential_fwd__20261010",
        factKey: "availability:exact_version",
        description: "QA test: verify exact version availability report.",
      }),
    });
    assert.equal(availability.status, 201);
    const latest = await (
      await fetch(`${origin}/api/issues`, {
        headers: { accept: REPORT_LIST_CONTENT_TYPE },
      })
    ).json();
    assert.equal(latest.totalRecognizedFiles, 3);
    const availabilityReport = latest.reports.find(
      (r: { claimKind?: string }) => r.claimKind === "availability",
    );
    assert.equal(
      availabilityReport.claimLabel,
      "Availability of this exact version",
    );
    assert.match(availabilityReport.observedValuePreview, /stock:/);
    assert.equal(availabilityReport.status, "pending");
    assert.equal((await fetch(`${origin}/.roadmark/review-queue`)).status, 404);
  } finally {
    child.kill();
    await new Promise<void>((resolve) =>
      child.exitCode !== null ? resolve() : child.once("exit", () => resolve()),
    );
    await rm(directory, { recursive: true, force: true });
  }
});
