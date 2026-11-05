#!/usr/bin/env bash
# Create and verify the external archive copy of RoadmarkX/ and the two root
# handoff zips. See docs/ARCHIVE.md.
#
#   archive.sh manifest <src-repo-root> <out-sums-file>
#       Write "<sha256>  <relative path>" for every file under RoadmarkX/ and the
#       two root handoff zips (+ .sha256). Read-only.
#   archive.sh create   <src-repo-root> <dest-dir> <sums-file>
#       Copy those files into <dest-dir> (a new/empty directory), configure Git
#       LFS tracking, commit locally. Does NOT push. Refuses a non-empty dest.
#   archive.sh verify   <dir> <sums-file>
#       Re-hash <dir> and compare every file with <sums-file>. Exit 1 on any
#       missing, extra or differing file.
#   archive.sh push     <dest-dir> <owner/name>
#       Creates the PRIVATE GitHub repo and pushes. Requires the environment
#       variable OWNER_APPROVED_ARCHIVE_PUSH=yes (set only after the owner's
#       written go-ahead is recorded in docs/plan/STATUS.md).
set -euo pipefail

EXTRA=(ev-dot-handoff-2026-10-10.zip ev-dot-buyer-journeys-handoff-2026-10-11.zip ev-dot-buyer-journeys-handoff-2026-10-11.zip.sha256)
sha() { shasum -a 256 "$1" | awk '{print $1}'; }

list_files() { # <root>  -> sorted relative paths
  (cd "$1" && { find RoadmarkX -type f; for f in "${EXTRA[@]}"; do [ -f "$f" ] && echo "$f"; done; } | LC_ALL=C sort)
}

cmd=${1:-}; shift || true
case "$cmd" in
manifest)
  src=$1; out=$2
  : > "$out"
  list_files "$src" | while IFS= read -r p; do printf '%s  %s\n' "$(sha "$src/$p")" "$p" >> "$out"; done
  echo "wrote $(wc -l < "$out" | tr -d ' ') entries to $out"
  ;;
create)
  src=$1; dest=$2; sums=$3
  command -v git-lfs >/dev/null || { echo "git-lfs is not installed (brew install git-lfs)"; exit 2; }
  [ ! -e "$dest" ] || [ -z "$(ls -A "$dest")" ] || { echo "dest must be empty"; exit 2; }
  mkdir -p "$dest"
  while IFS= read -r line; do
    p=${line#*  }
    mkdir -p "$dest/$(dirname "$p")"
    cp -p "$src/$p" "$dest/$p"
  done < "$sums"
  cp "$sums" "$dest/ARCHIVE-SHA256.txt"
  (cd "$dest" && git init -q -b main && git lfs install --local >/dev/null \
    && git lfs track '*.xz' '*.zip' '*.docx' '*.pdf' '*.png' '*.jpg' '*.webp' '*.mp4' >/dev/null \
    && git add -A && git commit -q -m "Archive of RoadmarkX recovery files and handoff zips (verified against ARCHIVE-SHA256.txt)" \
    && git rev-parse HEAD)
  ;;
verify)
  dir=$1; sums=$2; fail=0; n=0
  while IFS= read -r line; do
    want=${line%%  *}; p=${line#*  }; n=$((n+1))
    if [ ! -f "$dir/$p" ]; then echo "MISSING $p"; fail=1
    elif [ "$(sha "$dir/$p")" != "$want" ]; then echo "DIFFERS $p"; fail=1; fi
  done < "$sums"
  extra=$(comm -13 <(awk '{ $1=""; print substr($0,3) }' "$sums" | LC_ALL=C sort) <(list_files "$dir") || true)
  [ -z "$extra" ] || { echo "EXTRA files not in sums:"; echo "$extra"; fail=1; }
  echo "verified $n files, status: $([ $fail = 0 ] && echo OK || echo FAILED)"
  exit $fail
  ;;
push)
  dest=$1; repo=$2
  [ "${OWNER_APPROVED_ARCHIVE_PUSH:-}" = yes ] || { echo "refusing: owner go-ahead not confirmed (see docs/ARCHIVE.md)"; exit 3; }
  (cd "$dest" && gh repo create "$repo" --private --source . --remote origin --push)
  ;;
*) sed -n '2,20p' "$0"; exit 2 ;;
esac
