import { handleBoundReportIntake } from "../src/lib/local-report-intake";
import {
  REPORT_CLAIM_SCHEMA,
  REPORT_SUBMISSION_PROTOCOL,
} from "../src/lib/report-claim-binding";
import { reportFileKind } from "../src/lib/report-queue-files";
import { persistLocalReport } from "../src/lib/local-report-store";
import { REPORT_LIST_CONTENT_TYPE } from "../src/lib/report-queue-projection";
import {
  loadReportQueue,
  MAX_REPORT_FILE_BYTES,
} from "../src/lib/report-queue-reader";
import { availabilityReportClaim } from "../src/lib/availability-corrections";
/** Local-only preview + durable issue inbox. Never a production hosting substitute. */
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID, createHash } from "node:crypto";
import { catalogue, research, effectiveFeatures } from "../src/lib/data";
import { featureReportClaim } from "../src/lib/corrections";
let port = Number(process.env.PORT || 3013);
const host = "127.0.0.1";
const root = process.cwd();
const cars = catalogue();
const data = research();
const equipmentClaims = new Map(
  cars.flatMap((car) =>
    effectiveFeatures(car, data).map((f) => {
      const claim = featureReportClaim(
        f,
        data.criteria.find((c) => c.key === f.criterion)?.label || f.criterion,
      );
      return [`${car.id}:${claim.key}`, claim] as const;
    }),
  ),
);
const availabilityClaims = new Map(
  cars.map((c) => [
    `${c.id}:availability:exact_version`,
    availabilityReportClaim(c),
  ]),
);
const getClaim = (variantId: string, key: string) =>
  cars.find((c) => c.id === variantId)?.facts[key] ||
  equipmentClaims.get(`${variantId}:${key}`) ||
  availabilityClaims.get(`${variantId}:${key}`);
const queue =
  process.env.ROADMARK_REVIEW_DIR ||
  path.join(root, ".roadmark", "review-queue");

const digest = async (canonical: string) =>
  createHash("sha256").update(canonical).digest("hex");
function reply(
  res: http.ServerResponse,
  status: number,
  data: unknown,
  contentType = "application/json",
) {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  res.end(JSON.stringify(data));
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${host}:${port}`);
    if (
      url.pathname.startsWith("/api/") &&
      req.headers.host !== `${host}:${port}` &&
      req.headers.host !== `localhost:${port}`
    ) {
      reply(res, 403, { error: "Invalid host" });
      return;
    }
    if (url.pathname === "/api/issues" && req.method === "GET") {
      if (req.headers.accept !== REPORT_LIST_CONTENT_TYPE) {
        reply(res, 426, {
          error: "Reload the paired current preview and review service.",
        });
        return;
      }
      const names = (await fs.readdir(queue)).filter((name) =>
        reportFileKind(name),
      );
      const files = [];
      let inaccessibleNames = 0;
      for (const name of names) {
        try {
          const stat = await fs.lstat(path.join(queue, name));
          if (stat.isFile() && !stat.isSymbolicLink())
            files.push({ name, mtime: stat.mtimeMs });
          else inaccessibleNames++;
        } catch {
          inaccessibleNames++;
        }
      }
      const result = await loadReportQueue({
        files,
        digest,
        read: async (name) => {
          const file = await fs.open(
            path.join(queue, name),
            fs.constants.O_RDONLY |
              fs.constants.O_NOFOLLOW |
              fs.constants.O_NONBLOCK,
          );
          try {
            const stat = await file.stat();
            if (!stat.isFile() || stat.size > MAX_REPORT_FILE_BYTES)
              throw new Error("Invalid queue file");
            const bytes = new Uint8Array(MAX_REPORT_FILE_BYTES + 1);
            let bytesRead = 0;
            while (bytesRead < bytes.length) {
              const part = await file.read(
                bytes,
                bytesRead,
                bytes.length - bytesRead,
                bytesRead,
              );
              if (!part.bytesRead) break;
              bytesRead += part.bytesRead;
            }
            if (bytesRead > MAX_REPORT_FILE_BYTES)
              throw new Error("Oversized queue file");
            return new TextDecoder("utf-8", { fatal: true }).decode(
              bytes.subarray(0, bytesRead),
            );
          } finally {
            await file.close();
          }
        },
        labels: (variantId, factKey) => {
          const car = cars.find((c) => c.id === variantId);
          return {
            vehicleLabel: car
              ? `${car.brand} ${car.model} ${car.trim}`
              : variantId,
            claimLabel: getClaim(variantId, factKey)?.label || factKey,
          };
        },
      });
      reply(
        res,
        200,
        { ...result, inaccessibleNames },
        REPORT_LIST_CONTENT_TYPE,
      );
      return;
    }
    if (url.pathname === "/api/reporting" && req.method === "GET") {
      reply(res, 200, {
        mode: "local",
        enabled: true,
        submissionProtocol: REPORT_SUBMISSION_PROTOCOL,
        claimSchema: REPORT_CLAIM_SCHEMA,
      });
      return;
    }
    if (url.pathname === "/api/issues" && req.method === "POST") {
      const result = await handleBoundReportIntake(
        {
          host: req.headers.host,
          origin: req.headers.origin,
          contentType: req.headers["content-type"],
          chunks: req,
        },
        {
          port,
          digest,
          now: () => new Date().toISOString(),
          id: randomUUID,
          resolveClaim: (variantId, factKey) => {
            const car = cars.find((c) => c.id === variantId),
              fact = getClaim(variantId, factKey);
            return car && fact
              ? { fact, vehicleLabel: `${car.brand} ${car.model} ${car.trim}` }
              : undefined;
          },
          persist: (report) => persistLocalReport(report, {
            directory: queue,
            onCleanupError: () => console.warn(
              "Local report staging cleanup was incomplete. Private staging files remain excluded from the review list; inspect them before manual recovery.",
            ),
          }),
        },
      );
      reply(res, result.status, result.body);
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      reply(res, 405, { error: "Method not allowed" });
      return;
    }
    // Serve only the portable app and its explicitly public assets, never the inbox or source files.
    let file: string;
    if (url.pathname === "/" || url.pathname === "/index.html")
      file = path.join(root, "index.html");
    else if (url.pathname.startsWith("/media/")) {
      file = path.resolve(
        root,
        "public",
        `.${decodeURIComponent(url.pathname)}`,
      );
      if (!file.startsWith(path.join(root, "public", "media") + path.sep)) {
        reply(res, 404, { error: "Not found" });
        return;
      }
    } else {
      reply(res, 404, { error: "Not found" });
      return;
    }
    const ext = path.extname(file);
    const types: Record<string, string> = {
      ".html": "text/html; charset=utf-8",
      ".svg": "image/svg+xml",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".webp": "image/webp",
    };
    const data = await fs.readFile(file);
    res.writeHead(200, {
      "content-type": types[ext] || "application/octet-stream",
      "x-content-type-options": "nosniff",
      "cache-control": "no-store",
      "referrer-policy": "no-referrer",
    });
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    reply(res, 500, {
      error:
        "The local request could not be completed. No automatic retry was made.",
    });
  }
});
fs.mkdir(queue, { recursive: true })
  .then(() => {
    server.listen(port, host, () => {
      const address = server.address();
      if (address && typeof address !== "string") port = address.port;
      console.log(
        `Roadmark local preview: http://${host}:${port}/index.html\nReports persist in the local review queue; no external submission or publication.`,
      );
    });
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
