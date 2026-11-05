# Archive of the Roadmark recovery files

**Status: pending the owner's go-ahead (decision D0.1).** On this branch `RoadmarkX/` (3,132 files, about 1.8 GB) and the two root handoff zips are still in the working tree. Nothing has been moved, deleted or pushed. The source of truth for day-to-day work is now the tracked tree at the repository root; the archives are history.

Planned destination (default D0.1a): a new **private** repository `alin9077/ev-archive`, using Git LFS. Commit SHA of the archive repo: _not yet created_ (to be written here once it exists).

The old live-site source is available without the archive: `git checkout ev-side-by-side-2026-11-04`.

## What is archived

- everything under `RoadmarkX/` (3,132 files)
- `ev-dot-handoff-2026-10-10.zip`
- `ev-dot-buyer-journeys-handoff-2026-10-11.zip` and its `.sha256`

## Verification method (nothing is removed from this repository until all four steps pass)

All commands run from the repository root. `<scratch>` is any directory outside the repo. Git LFS must be installed (`brew install git-lfs`).

1. **Record the SHA-256 of every source file** (read-only):

   ```bash
   scripts/archive/archive.sh manifest . <scratch>/ARCHIVE-SHA256.txt
   ```

2. **Cross-check against the manifests that ship in the archive.** This verifies the payload archive against `RoadmarkX/Roadmark-102-all-in-one/CONTENTS-MANIFEST.json` and every hash that the `Roadmark-RECOVERY-MANIFEST-*.json` files give for a file that exists in `RoadmarkX/`:

   ```bash
   python3 -I scripts/archive/crosscheck.py .
   ```

3. **Create the local archive repository** (copies, sets LFS tracking, commits; does not push; refuses a non-empty directory), then verify the copy file by file against step 1:

   ```bash
   scripts/archive/archive.sh create . <scratch>/ev-archive <scratch>/ARCHIVE-SHA256.txt
   scripts/archive/archive.sh verify <scratch>/ev-archive <scratch>/ARCHIVE-SHA256.txt
   ```

4. **After the owner approves**, create the private repo and push (the script refuses without the approval variable), then clone it fresh with LFS and verify again:

   ```bash
   OWNER_APPROVED_ARCHIVE_PUSH=yes scripts/archive/archive.sh push <scratch>/ev-archive alin9077/ev-archive
   git clone git@github.com:alin9077/ev-archive.git <scratch>/ev-archive-clone
   scripts/archive/archive.sh verify <scratch>/ev-archive-clone <scratch>/ARCHIVE-SHA256.txt
   ```

   Then copy `ARCHIVE-SHA256.txt` and the archive commit SHA into this file, and only then remove `RoadmarkX/` and the two zips from the tree (a separate commit).

`verify` fails on any missing file, any differing hash and any extra file not in the list.

## Cost of history

Even after the archives leave the tree, existing clones of `main` still carry about 1.2 GB of history. D0.2 (history rewrite) defaults to **no**. Clone with `git clone --depth 1 --filter=blob:none <url>`.
