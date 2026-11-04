# Root-owned acceptance commands

**Do not execute until independent review is approved, checkpoint93 is saved, and root explicitly releases its application freeze.** No commands in this document were run by the candidate worker except static file inspection/hash generation. No Git, uploads, servers, browser or external task is required by this candidate.

## 1. Verify handoff and preimages (workspace root)

```sh
set -eu
cd /workspace/scratch/586427eef9f2
C=roadmark-research/report-preview94-candidate
A=roadmark-work/roadmark
sha256sum -c "$C/SOURCE-PINS.sha256"
sha256sum -c "$C/CANDIDATE-PINS.sha256"
cmp "$C/preimages/docs/REVIEW_WORKFLOW.md" "$A/docs/REVIEW_WORKFLOW.md"
for f in src/lib/report-review-dry-run.ts scripts/preview-report-review.ts tests/helpers/report-preview-fixture.ts tests/report-review-dry-run.test.ts tests/report-review-cli.test.ts; do
  test ! -e "$A/$f"
  test ! -L "$A/$f"
done
```

Stop on any drift. Review it and recapture a new candidate rather than overwriting. Source pins intentionally include configuration, pure dependencies, existing tests, data pipeline and approval registers; they are not merely a patch-context check. New files require absent preimages, including no dangling symlink.

## 2. Copy only the reviewed files, after freeze release

Run in the same shell only when phase 1 passes and authority to apply is confirmed:

```sh
for f in src/lib/report-review-dry-run.ts scripts/preview-report-review.ts tests/helpers/report-preview-fixture.ts tests/report-review-dry-run.test.ts tests/report-review-cli.test.ts; do
  cp --no-clobber "$C/files/$f" "$A/$f"
  cmp "$C/files/$f" "$A/$f"
done
cmp "$C/preimages/docs/REVIEW_WORKFLOW.md" "$A/docs/REVIEW_WORKFLOW.md"
cp "$C/files/docs/REVIEW_WORKFLOW.md" "$A/docs/REVIEW_WORKFLOW.md"
```

No directory creation in the app is needed: `src/lib`, `scripts`, `tests/helpers` and `docs` already exist. Do not copy the research packet into a public artifact. Do not modify the live queue/history/registers as fixtures. Stop instead of replacing an unexpected new file.

## 3. Execute focused acceptance and regressions

```sh
cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark
node --import tsx --test --test-concurrency=2 tests/report-review-dry-run.test.ts tests/report-review-cli.test.ts
node --import tsx --test --test-concurrency=2 tests/report-review-proposal.test.ts tests/report-binding.test.ts tests/report-queue-reader.test.ts tests/local-report-store.test.ts tests/corrections.test.ts tests/feature-corrections.test.ts tests/availability-corrections.test.ts tests/correction-guard-parity.test.ts
pnpm typecheck
pnpm lint
pnpm validate
pnpm test
pnpm build
pnpm build:public
```

These commands create their usual build/typecheck outputs only after root releases the freeze. New tests use OS temporary directories, synthetic claims and isolated stdout captures. The CLI itself does not launch a process, but its tests launch isolated child processes and the standard Linux `mkfifo` fixture tool. No production queue, private real report or real approval is read by these tests. The fixture FIFO subprocess has a timeout so a regression fails instead of hanging the suite.

Do not run `pnpm format` on the full app. If root reformats candidate files, capture the changed candidate/preimage pins and rerun final-source checks. A focused pass does not waive aggregate/build acceptance. No acceptance result should be claimed before examining actual outputs.

## 4. Verify exact applied postimages and unchanged registers

From workspace root, use `MANIFEST.json` to compare the six declared postimages against app bytes. Recheck all source pins except the intentionally changed workflow doc:

```sh
cd /workspace/scratch/586427eef9f2
C=roadmark-research/report-preview94-candidate
python - <<'PY'
import hashlib, json
from pathlib import Path
root = Path('/workspace/scratch/586427eef9f2')
candidate = root / 'roadmark-research/report-preview94-candidate'
manifest = json.loads((candidate / 'MANIFEST.json').read_text())
for item in manifest['changes']:
    destination = root / 'roadmark-work/roadmark' / item['target']
    assert hashlib.sha256(destination.read_bytes()).hexdigest() == item['postimageSha256'], item['target']
for line in (candidate / 'SOURCE-PINS.sha256').read_text().splitlines():
    sha, relative = line.split('  ', 1)
    if relative == 'roadmark-work/roadmark/docs/REVIEW_WORKFLOW.md':
        continue
    assert hashlib.sha256((root / relative).read_bytes()).hexdigest() == sha, relative
for name in ['approved-corrections', 'approved-feature-corrections', 'approved-availability-corrections']:
    value = json.loads((root / 'roadmark-work/roadmark/data' / (name + '.json')).read_text())
    assert value == [], name
print('Reviewed candidate postimages and unchanged source/register pins match')
PY
```

If builds change pinned application sources or a concurrent edit occurs, stop and inspect; do not blindly restore from preimages or say no changes occurred. Hashes establish exact compared file content, not atime or whole-filesystem invariance.

## 5. Release review

- Re-read full design acceptance in `report-adapter93/ACCEPTANCE.md`
- Inspect new runtime imports: no routes/components/server/build data imports the CLI/pure adapter
- Inspect generated server/portable/public artifacts for private queue/history material and accidental new preview wiring. Do not confuse existing pure model test strings with active production authority
- Confirm existing vendor MIME/receipt protocol, 200-file list behavior, facts/rankings/correction history and all three empty registers remain unchanged
- Record actual tests, skips, errors and build results. No browser/mobile gate is newly claimed; preserve existing checkpoint93 evidence and requirements
- Report only an unsaved local proposal preview. Production identity, editorial authority, durable proposal storage, approvals, application and publication remain open
