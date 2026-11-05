# Environment and commands

Measured on 5 November 2026 on the machine below. Every figure is a single run; none is an estimate.

| | |
|---|---|
| Machine | Apple M3 Max, 16 cores, 48 GB RAM, macOS (Darwin 27.0.0) |
| Node | v24.22.0 (the plan asks for Node 22; **Node 22 was not tested**) |
| pnpm | 11.19.0 (declared in `package.json`) |
| Heap | `NODE_OPTIONS=--max-old-space-size=6144` for `typecheck` and `test` |
| Install | `CI=true pnpm install --frozen-lockfile` (CI=true stops pnpm asking to purge an existing `node_modules` when there is no terminal) |

Minimum RAM is **not established**: the highest resident set measured was 3.27 GB (build), on a machine with 48 GB. A 4 GB heap or less was not tried. The earlier 16 GB / 4-core Linux container baseline typechecked in 21 s.

## Commands and measured durations

| Command | Result | Wall time | Max RSS (`/usr/bin/time -l`) |
|---|---|---|---|
| `pnpm validate` | PASS | 68.6 s | 1.28 GB |
| `NODE_OPTIONS=--max-old-space-size=6144 pnpm typecheck` | exit 0 | 8.4 s | 1.14 GB |
| `pnpm lint` | exit 0 | 7.0 s | 1.11 GB |
| `NODE_OPTIONS=--max-old-space-size=6144 pnpm test` | **8 failed** of 1299 (see `docs/plan/STATUS.md`) | 1,653 s (27.6 min) | 3.19 GB |
| `pnpm report:coverage --as-of 2026-10-16` | exit 0 | 84.3 s | 1.73 GB |
| `pnpm build` (validate, `next build`, then `build:portable`) | exit 0 | 4,526 s (75.4 min); static generation alone 72.1 min | 3.27 GB |

`pnpm build` is slow because Next.js ran static generation with 1 worker (`cpus: 1`, `staticGenerationMaxConcurrency: 1`). `build:portable` is part of `pnpm build`; its output was `index.html` of 50,646,106 bytes (reported as 50.65 MB), also written to `index-b.html` and `public/`. `.next` was 813 MB.

## Generated files

`index.html`, `index-b.html`, `public/index.html` and `public/index-b.html` are build outputs and are not tracked. Do not commit them, `.next`, `out` or `node_modules`.

## Recovery

Git is the recovery mechanism. The old live-site source is at tag `ev-side-by-side-2026-11-04`. The recovery archives are described in `docs/ARCHIVE.md`.
