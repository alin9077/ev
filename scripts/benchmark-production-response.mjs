/** Local server/body baseline only; this does not measure real-device browser performance. */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
const output = process.argv[2] || "qa/production-response-check-latest.json";
const original = JSON.parse(
  readFileSync("data/au_ev_all_variants_2026-10-06.json", "utf8"),
);
const additions = JSON.parse(
  readFileSync("data/catalogue-additions-2026-10-10.json", "utf8"),
);
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3317",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
let logs = "";
server.stdout.on("data", (data) => (logs += data));
server.stderr.on("data", (data) => (logs += data));
try {
  await new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(() => {
      if (/Ready in/.test(logs)) {
        clearInterval(timer);
        resolve();
      } else if (server.exitCode !== null || Date.now() - start > 30000) {
        clearInterval(timer);
        reject(new Error(logs || "Server did not become ready"));
      }
    }, 100);
    server.once("error", (error) => {
      clearInterval(timer);
      reject(error);
    });
  });
  const routes = [
    "/",
    "/discover",
    "/cars/geely-ex5/inspire-extended-range-2",
    "/compare?cars=byd_atto_3_legacy__essential_fwd__1%2Cgeely_ex5__inspire_extended_range__2",
  ];
  const results = [];
  for (const route of routes) {
    let text = "";
    const samples = [];
    for (let i = 0; i < 4; i++) {
      const start = performance.now();
      const response = await fetch("http://127.0.0.1:3317" + route, {
        headers: { "Accept-Encoding": "identity" },
      });
      text = await response.text();
      if (response.status !== 200)
        throw new Error(route + " " + response.status);
      samples.push(performance.now() - start);
    }
    results.push({
      route,
      responseBytes: Buffer.byteLength(text),
      estimatedGzipBytes: gzipSync(text).length,
      coldMs: samples[0],
      warmMs: samples.slice(1),
      meanWarmMs: samples.slice(1).reduce((a, b) => a + b, 0) / 3,
    });
  }
  const report = {
    checkedAtUTC: new Date().toISOString(),
    catalogueVersions: original.variants.length + additions.variants.length,
    method:
      "Own VM production Next.js server, loopback requests; cold then 3 warm samples. Gzip byte counts are estimates from local compression. Not browser rendering, actual mobile, network throughput, LCP or INP.",
    results,
  };
  writeFileSync(output, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  server.kill("SIGTERM");
}
