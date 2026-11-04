"""Static inventory definitions shared by the root-only proof launcher.

This helper never imports Roadmark. Run only after independent review.
"""
from pathlib import Path
import hashlib
import json
import sys

CHANGES = frozenset({
    "data/source-citation-label-92.json",
    "src/components/citable-report.tsx", "src/components/experience.tsx",
    "src/components/footnotes.tsx", "src/components/source-registry.tsx",
    "src/components/ui.tsx", "src/lib/citable.ts",
    "src/lib/source-presentation.ts", "tests/source-citation-label92.test.ts",
    "src/lib/report-review-proposal.ts", "tests/report-review-proposal.test.ts",
})
ROOT_INPUTS = frozenset({
    "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json",
    "next.config.ts", "next-env.d.ts", "eslint.config.mjs", "playwright.config.ts",
    "CODEX_MASTER_PROMPT.md", "TESLA_MEDIA_AUDIT.md",
    "au_ev_all_variants_2026-10-06.json",
    "Australian_EV_All_Variants_2026-10-06.xlsx",
    "Australian_EV_All_Variants_Report_2026-10-06.pdf",
})
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
PROOF_FILES = ("proof_inventory.py", "verify_restored92.py", "runtime-proof.cjs")
QA_SUFFIXES = frozenset({".json", ".cjs", ".mjs", ".ts", ".tsx", ".js", ".py", ".sha256"})
DESIGN_REFERENCES = frozenset({"qa/scenes-b-new-brief.png", "qa/car-rear-views.png"})

def runtime_path(name):
    return name in ROOT_INPUTS or name.startswith(("src/", "data/", "scripts/", "tests/", "media/", "backups/")) or (name.startswith("public/") and name not in ALIASES)

def qa_path(name):
    return name in DESIGN_REFERENCES or (name.startswith("qa/") and Path(name).suffix in QA_SUFFIXES)

def artifact_path(name):
    return name in ALIASES or name in {".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json"} or name.startswith((".next/server/app/", ".next/static/"))

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def safe_file(root, rel):
    assert isinstance(rel, str) and rel and "\\" not in rel, f"Unsafe path: {rel!r}"
    parts = Path(rel).parts
    assert not Path(rel).is_absolute() and all(p not in {".", ".."} for p in parts), f"Unsafe path: {rel}"
    result = root / rel
    assert result.is_file(), f"Missing file: {result}"
    assert not any((root.joinpath(*parts[:i])).is_symlink() for i in range(1, len(parts) + 1)), f"Symlink rejected: {result}"
    assert result.resolve().is_relative_to(root.resolve()), f"Escaped root: {result}"
    return result

def list_scope(root, predicate):
    # Prune dependencies/cache; do not follow symlinks. Artifact .next traversal is deliberate.
    import os
    result = []
    for directory, children, files in os.walk(root, followlinks=False):
        children[:] = [child for child in children if child not in {"node_modules", ".git"}]
        for filename in files:
            rel = (Path(directory) / filename).relative_to(root).as_posix()
            if predicate(rel):
                safe_file(root, rel)
                result.append(rel)
    return sorted(result)

def inventory(root, predicate):
    return {rel: digest(safe_file(root, rel)) for rel in list_scope(root, predicate)}

if __name__ == "__main__":
    assert len(sys.argv) == 3 and sys.argv[2] in {"runtime", "qa", "artifacts"}, "Usage: python proof_inventory.py APP_ROOT runtime|qa|artifacts"
    root = Path(sys.argv[1]).resolve()
    predicate = {"runtime": runtime_path, "qa": qa_path, "artifacts": artifact_path}[sys.argv[2]]
    print(json.dumps(inventory(root, predicate), indent=2, sort_keys=True))
