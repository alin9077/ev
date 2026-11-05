import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Avoid retaining large source maps while generating the expanded catalogue.
  enablePrerenderSourceMaps: false,
  outputFileTracingIncludes: {
    "/*": [
      "./data/catalogue-additions-2026-10-10.json",
      "./data/buyer-selling-points-2026-10-10.json",
      "./data/buyer-identity-snapshots-2026-10-10.json",
      "./data/m1-evidence-regrading-2026-10-13.json",
      "./data/m1-retained-fact-fills-2026-10-13.json",
      "./data/m1-brand-updates/*.json",
    ],
  },
  // Bound per-process catalogue duplication as exact-version pages grow.
  experimental: { cpus: 1, staticGenerationMaxConcurrency: 1 },
  ...(process.env.SITE_STATIC_EXPORT === "1"
    ? { output: "export" as const, images: { unoptimized: true } }
    : {}),
  async headers() {
    if (process.env.SITE_STATIC_EXPORT === "1") return [];
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'" +
              (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "") +
              "; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
