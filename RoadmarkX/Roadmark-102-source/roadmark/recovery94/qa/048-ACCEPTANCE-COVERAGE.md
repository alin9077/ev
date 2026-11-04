# Acceptance mapping and honest gaps

All listed tests are **authored, not run**. Root owns execution after freeze release and independent review.

| Design acceptance | Proposed coverage |
|---|---|
| 1 Exact fact/feature/availability and both actions | Six pure fixtures check bound identity, claim reference, pending/unverified/unsaved envelope |
| 2 Strict request/actions/text/bytes | Unknown/missing keys, forbidden actions, duplicate/escaped keys, flat value grammar, byte limits, preserved whitespace, label/reason limits, multibyte output |
| 3 Bound-only raw source | Forged marker, wrong ID, modified projected value, source ordering, metadata/null drift, missing binding, digest failure; model regressions retain full legacy/device/projection coverage |
| 4 Histories/predecessor/identity/chronology/bounds | Empty/nonempty, exact/stale/missing predecessor, broken chain/prefix, duplicate/colliding IDs, future/early times, corrupt newest, 1,000 old-event rejection, doubled context overflow |
| 5 Historical correction boundary | Retains old approved-shaped snapshot without current row context; new note is not linked and emits no old row or register label |
| 6 Snapshot/projection | Async callback mutates request/raw/history/dependency functions; resulting event is detached/frozen; full history >100 remains valid; full reason/label plus shortened preview |
| 7 Canonical hashes | Object order stable, meaningful history text drift changes anchors, exact prior canonical digest comparison |
| 8 Older explicit file >200 | Real isolated queue of 205 files selects exact first report, twice; only two open calls in injected test |
| 9 ID traversal | Slash/backslash/traversal/absolute/encoded/uppercase/noncanonical IDs rejected before opening |
| 10 Read failures | Real missing/directory/symlink/malformed/UTF8/oversize, real FIFO subprocess deadline, owner-mode denial when nonroot plus injected denial, unsupported flags |
| 11 Partial/growing/changed files and close | Injected partial reads, cap growth, shrink, descriptor all five metadata field drifts, read/close errors, bad JSON/UTF8 close; reads close before model and output |
| 12 Combined cap/no reset | 600-event multibyte fixture individually under 8 MiB but fails doubled model context; history missing/not-array fails; no retries |
| 13 Imports/IO | Fresh-process CLI import with application-data write/open and HTTP-server tripwires, empty private fixture tree, exact source scan; transitive public config read is disclosed |
| 14 Output/error | Actual CLI one complete JSON line; malformed request yields empty stdout and one safe stderr code; JSON control escaping; serialized byte cap; closed stdout pipe safe-error subprocess |
| 15 No input mutations | Real success/repeat/missing/invalid/nonregular cases compare file names+bytes around calls; FIFO names/type checked without reading it; no atime assertion |
| 16 Regressions/build | Exact root commands supplied; none run by worker |
| 17 No wiring/public leak | No wiring source edits; root must inspect final runtime/portable/public output and architecture after actual builds |
| 18 Registers/facts/rankings | Pins for unchanged registers/data pipeline; root must rerun regressions/aggregate and compare live register hashes |
| 19 Browser | No new browser acceptance claim; existing checkpoint93/browser/mobile gates stay separate |
| 20 Completion wording | “Added a local dry-run proposal preview for already-bound reports; it leaves reports pending and does not save proposals or change approved facts.” Only after root acceptance |

## Additional root review targets

- Confirm Node/tsx direct-invocation guard actually starts main, while import does not; do not assume ESM/CJS behavior from static inspection
- Confirm built-in module tripwires do not interfere with tsx module loading. Tighten the test if they do; do not weaken the application-data boundary
- Confirm the authored broken-stdout subprocess produces a safe `output_failed` code without an unhandled stream stack. It closes the pipe before any write, so it does not prove transactional output if a receiver accepts some bytes before failing
- Injected reader checks vary device, inode, size, mtime and ctime separately; real filesystem race behavior remains outside those deterministic fixture guarantees
- Real permission-denied coverage must not be represented as passed if skipped as root; the injected denial case is distinct
- Reader-level tests do not prove all network filesystems honor flags identically. No such guarantee is made
- No digest collision resistance proof, cryptographic signature, current-source verification or complete-history guarantee is supplied

Root must treat all of the original `report-adapter93/ACCEPTANCE.md` checks as the acceptance contract, including final-source aggregate tests/builds and unchanged existing UI/queue/register behavior. This matrix describes authored coverage; it does not replace that contract.
