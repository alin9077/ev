# Revision 2: independent static re-review

Reviewed on 2026-10-12 UTC, after the author supplied frozen revision-2 pins.

## Result

**Source-review gate cleared. Both requested changes are resolved; no additional static blocker was found.** This is not runtime approval or authorization to change the application. Root still owns syntax checks, synthetic acceptance tests, server launch, browser checks, measurement, and the eventual prefetch decision.

The initial review in `REVIEW.md` remains intact as the review of the initial candidate. Its general limitations, run-sheet clarifications, preservation requirements, and acceptance matrix continue to apply. Its R1/R2 requests are superseded by the resolutions below for these exact revision-2 bytes only.

## Verified inputs

Directory: `/workspace/scratch/586427eef9f2/roadmark-research/mobile-performance96-assessment/measurement-candidate/revision-2`

| File | SHA-256 |
| --- | --- |
| `loopback-access-logger.mjs` | `5181ad081108ffc6c236eca5086de5b262ad0e24b7173fe3f17ac35c27f37512` |
| `README.md` | `c9d0a290b158384fbad7de10214a63dc7cc17662325f09ff2fa91926e21915b4` |
| `REVISION.json` | `261a892e9cd662f4fabeef3212d208e7d92b03804355c0f7f781ba3f8b894caa` |
| `SHA256SUMS` | `db17c2da54bdb753766311cf50d07ab529ee272c1c5a257cf62da82a2af0bf88` |

I independently hashed all four files, inspected the complete diff against the already reviewed original, and read the revision record. The original logger, README, and hash manifest still matched their initial pins at the re-review boundary. The revision record's preimage/postimage hashes match the reviewed files.

## R1 resolved: protocol socket teardown

- A new `ownedSockets` set tracks every accepted TCP connection independently of ordinary active HTTP requests
- Each socket removes itself on close; a connection arriving while shutdown is in progress is immediately destroyed
- CONNECT/Upgrade rejection still returns 405 and never reaches the fixed upstream
- A protocol socket is destroyed after the rejection write callback, with a separate 250 ms destruction timer as fallback; the timer is cleared when the socket closes
- Shutdown destroys every tracked socket in addition to the existing ordinary-stream cleanup and `closeAllConnections`
- The recipe explicitly tests half-open CONNECT and Upgrade clients that keep their write side open, immediate SIGTERM with an open socket, listener release, and log finalization

The README correctly calls 250 ms a timer target subject to event-loop scheduling, not a hard real-time promise. Root must still establish the actual behavior using the trusted runtime. No such runtime test was performed by this reviewer.

## R2 resolved: framework prefetch classification

- The logger now preserves only the finite values `0`, `1`, `2`, `3`; arbitrary unexpected values remain `other`
- The recipe identifies `1`/`2`/`3` as positive framework prefetch markers and keeps absent/`0`/`other` separate
- It explicitly warns that the Full strategy can omit the marker, so absence is not proof of a demand request
- No-click phase/timestamp evidence is retained as a separate basis for describing pre-click detail traffic; `_rsc` alone remains insufficient
- Fixture acceptance now covers unmodified forwarding and distinct JSONL recording for the finite markers, an unknown sentinel, and the same privacy checks with each flag

The change does not log router-state contents, query values, cookies, authorization, or bodies. It does not alter request headers delivered to Next.

## Unchanged important properties

The diff does not change the fixed `127.0.0.1:8766` upstream, loopback-only listening, allowed methods, target/Host/body restrictions, response streaming, compression semantics, application content, byte definition, exclusive log creation, or unchanged-baseline requirement.

The revised command points to the revision-2 helper. Its `logs/` directory is therefore separate from the original candidate's log directory. Root must use the reviewed revision and a fresh filename/origin, rather than accidentally launching the initial helper.

The Model Y hero, all nine reason targets, illustrations, application data, Discovery links, and portable adapter are not modified by this helper revision. None of the source review implies that disabling prefetch is warranted. That still depends on successful baseline measurement and an acceptable observed navigation tradeoff.

## Scope of verification

- Performed: source reads, file hashes, textual diffs, this written review
- Not performed: candidate/application import or execution, syntax checking, fixture tests, builds, server launch, network requests, browser actions, uploads, Git operations, or Codex tasks
- Next required evidence: root's full synthetic acceptance matrix, including R1/R2 cases, followed by a production baseline smoke and supported UI/log measurement without DevTools or policy bypasses

Any subsequent source change requires a new pin and review of the changed behavior. An interrupted, errored, empty, or incomplete run must not be reported as zero speculative traffic.
