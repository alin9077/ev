#!/usr/bin/env python3
"""Verify and reproducibly package the separate one-time Roadmark history archive."""
from __future__ import annotations
import argparse
import hashlib
import json
import lzma
from pathlib import Path
import tarfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path, help="Unpacked historical archive directory")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--preset", type=int, choices=range(10), default=6, help="XZ compression preset; 6 uses less memory than 9")
    args = parser.parse_args()
    root = args.archive.resolve()
    manifest = json.loads((root / "ARCHIVE-MANIFEST.json").read_text())
    for record in manifest["files"]:
        path = root / record["archivePath"]
        content = path.read_bytes()
        if len(content) != record["bytes"] or hashlib.sha256(content).hexdigest() != record["sha256"]:
            raise SystemExit(f"Archive integrity failure: {record['archivePath']}")
    output = args.output or root.parent / (root.name + ".tar.xz")
    if output.resolve().is_relative_to(root):
        parser.error("Write the package outside the archive directory")
    with lzma.open(output, "wb", preset=args.preset) as compressed:
        with tarfile.open(fileobj=compressed, mode="w|") as archive:
            for path in sorted(root.rglob("*")):
                if not path.is_file():
                    continue
                name = "roadmark-103-archive/" + path.relative_to(root).as_posix()
                info = tarfile.TarInfo(name)
                info.size = path.stat().st_size
                info.mode = 0o644
                info.mtime = 1791849600
                with path.open("rb") as content:
                    archive.addfile(info, content)
    with tarfile.open(output, "r:xz") as archive:
        for member in archive:
            content = archive.extractfile(member)
            if content is None:
                raise SystemExit(f"Invalid archive member: {member.name}")
            while content.read(1024 * 1024):
                pass
    print(json.dumps({"path": str(output.resolve()), "bytes": output.stat().st_size, "sha256": hashlib.sha256(output.read_bytes()).hexdigest(), "preservedFiles": len(manifest["files"])}, indent=2))


if __name__ == "__main__":
    main()
