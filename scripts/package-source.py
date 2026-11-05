#!/usr/bin/env python3
"""Package working source as deterministic tar.xz (default) or ZIP under 15 MB."""
from __future__ import annotations

import argparse
import calendar
import hashlib
import io
import json
import lzma
import os
from pathlib import Path
import re
import tarfile
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OMIT_DIRS = {
    "node_modules", ".git", ".next", "out", "dist", ".pnpm-store",
    "test-results", "playwright-report", ".roadmark", ".claude", ".openai",
    "__pycache__", "backups", "evidence-snapshots",
}
OMIT_FILES = {"index.html", "index-b.html", "SOURCE-FILE-MANIFEST.json"}
STAMP = (2026, 10, 13, 0, 0, 0)
MAX_SOURCE_BYTES = 15_000_000
FORMATS = ("tar.xz", "zip")
MANIFEST_NAME = "roadmark/SOURCE-FILE-MANIFEST.json"


def active_qa_inputs(root: Path):
    references = set()
    for path in (root / "tests").rglob("*"):
        if path.is_file() and path.suffix in {".ts", ".tsx", ".mjs"}:
            references.update(re.findall(
                r"(?:\.\./)+(qa/[^\"'`\s]+)", path.read_text()
            ))
    return references


def source_files(root: Path):
    qa_inputs = active_qa_inputs(root)
    for directory, folders, names in os.walk(root):
        folders[:] = sorted(
            name for name in folders
            if name not in OMIT_DIRS
            and not name.startswith(("recovery", ".sites-checkout"))
        )
        for name in sorted(names):
            path = Path(directory) / name
            relative = path.relative_to(root)
            if path.is_symlink() or not path.is_file():
                continue
            if name in OMIT_FILES or name.endswith((
                ".tsbuildinfo", ".log", ".zip", ".tar.xz", ".pyc"
            )):
                continue
            if name.startswith(".env") and name != ".env.example":
                continue
            if relative.parts[0] == "qa" and relative.as_posix() not in qa_inputs:
                continue
            yield relative, path


def write_member(archive, name, content):
    if isinstance(archive, zipfile.ZipFile):
        info = zipfile.ZipInfo(name, STAMP)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        archive.writestr(info, content, compresslevel=9)
    else:
        info = tarfile.TarInfo(name)
        info.size = len(content)
        info.mode = 0o644
        info.mtime = calendar.timegm(STAMP)
        # TarInfo defaults fix ownership to 0/0 with empty user/group names.
        archive.addfile(info, io.BytesIO(content))


def verify_package(output: Path, archive_format: str, manifest):
    """Read every extracted member and check paths, sizes, and SHA-256 hashes."""
    expected = {"roadmark/" + item["path"]: item for item in manifest["files"]}
    if len(expected) != len(manifest["files"]) or MANIFEST_NAME in expected:
        raise ValueError("Invalid or duplicate source manifest paths")
    seen = set()

    def verify_member(name, content):
        if name in seen:
            raise ValueError(f"Duplicate archive member: {name}")
        seen.add(name)
        if name == MANIFEST_NAME:
            if json.load(content) != manifest:
                raise ValueError("Embedded source manifest differs from source")
            return
        if name not in expected:
            raise ValueError(f"Unexpected archive member: {name}")
        digest = hashlib.sha256()
        size = 0
        while chunk := content.read(1024 * 1024):
            size += len(chunk)
            digest.update(chunk)
        record = expected[name]
        if size != record["bytes"] or digest.hexdigest() != record["sha256"]:
            raise ValueError(f"Source integrity verification failed: {name}")

    if archive_format == "zip":
        with zipfile.ZipFile(output) as archive:
            for member in archive.infolist():
                with archive.open(member) as content:
                    verify_member(member.filename, content)
    elif archive_format == "tar.xz":
        with lzma.open(output, "rb") as stream:
            with tarfile.open(fileobj=stream, mode="r|") as archive:
                for member in archive:
                    if not member.isfile():
                        raise ValueError(f"Non-file archive member: {member.name}")
                    with archive.extractfile(member) as content:
                        verify_member(member.name, content)
            # Tar ends before its padding; finish XZ to check the stream footer.
            while stream.read(1024 * 1024):
                pass
    else:
        raise ValueError(f"Unsupported archive format: {archive_format}")
    if seen != set(expected) | {MANIFEST_NAME}:
        raise ValueError("Archive is missing source files or its manifest")


def package_source(root: Path, output: Path, archive_format: str = "tar.xz"):
    root, output = root.resolve(), output.resolve()
    if output.is_relative_to(root):
        raise ValueError("Write the source archive outside the source tree")
    if archive_format not in FORMATS:
        raise ValueError(f"Unsupported archive format: {archive_format}")
    files = sorted(source_files(root))
    manifest = {"schemaVersion": 1, "root": "roadmark", "files": []}
    output.parent.mkdir(parents=True, exist_ok=True)
    # An oversized or failed trial must not replace a verified existing package.
    with tempfile.NamedTemporaryFile(
        prefix=output.name + ".partial-", dir=output.parent, delete=False
    ) as temporary:
        temporary_path = Path(temporary.name)
    try:
        if archive_format == "zip":
            archive = zipfile.ZipFile(
                temporary_path, "w", compression=zipfile.ZIP_DEFLATED,
                compresslevel=9
            )
        else:
            # Standard XZ preset 6 uses an 8 MiB dictionary; no extreme preset.
            archive = tarfile.open(
                temporary_path, "w:xz", format=tarfile.PAX_FORMAT, preset=6
            )
        with archive:
            for relative, path in files:
                content = path.read_bytes()
                name = relative.as_posix()
                manifest["files"].append({
                    "path": name,
                    "bytes": len(content),
                    "sha256": hashlib.sha256(content).hexdigest(),
                })
                write_member(archive, "roadmark/" + name, content)
            write_member(archive, MANIFEST_NAME, (
                json.dumps(manifest, indent=2) + "\n"
            ).encode())
        size = temporary_path.stat().st_size
        if size >= MAX_SOURCE_BYTES:
            raise ValueError(
                "Source package exceeds the strict 15 MB limit: "
                f"{size:,} bytes at {output}"
            )
        verify_package(temporary_path, archive_format, manifest)
        digest = hashlib.sha256(temporary_path.read_bytes()).hexdigest()
        temporary_path.replace(output)
    finally:
        temporary_path.unlink(missing_ok=True)
    return {
        "path": str(output), "format": archive_format, "bytes": size,
        "files": len(files), "sha256": digest,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--format", choices=FORMATS,
        help="Archive format; inferred from --output, otherwise tar.xz"
    )
    parser.add_argument(
        "--output", type=Path,
        help="Output outside the source tree, ending in .tar.xz or .zip"
    )
    args = parser.parse_args()
    archive_format = args.format
    if args.output:
        suffix_format = next((
            kind for kind in FORMATS if args.output.name.endswith("." + kind)
        ), None)
        if not suffix_format:
            parser.error("Output must end in .tar.xz or .zip")
        if archive_format and archive_format != suffix_format:
            parser.error("Output suffix must match --format")
        archive_format = suffix_format
    archive_format = archive_format or "tar.xz"
    output = args.output or ROOT.parent / f"{ROOT.name}-source.{archive_format}"
    try:
        result = package_source(ROOT, output, archive_format)
    except ValueError as error:
        parser.exit(1, f"{error}\n")
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
