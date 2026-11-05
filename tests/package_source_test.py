"""Behavioural archive checks against a tiny synthetic working-source tree."""
import hashlib
import importlib.util
import json
import lzma
import os
from pathlib import Path, PurePosixPath
import shutil
import stat
import subprocess
import sys
import tarfile
import tempfile
import unittest
import warnings
from unittest import mock
import zipfile

SCRIPT = Path(__file__).resolve().parents[1] / "scripts/package-source.py"
spec = importlib.util.spec_from_file_location("package_source", SCRIPT)
packager = importlib.util.module_from_spec(spec)
spec.loader.exec_module(packager)


class SourcePackagingTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.directory = Path(self.temporary.name)
        self.root = self.directory / "working"
        self.root.mkdir()
        self.expected = {
            "README.md": b"A synthetic source fixture.\n",
            "src/example.ts": b"export const answer = 42;\n",
            "data/original.json": b'{"immutable": true}\n',
            "original.json": b'{"immutable": true}\n',
            "data/active-snapshots.json": b'{"runtime": "required"}\n',
            "tests/behaviour.test.ts": b'readFile("../qa/active.json");\n',
            "qa/active.json": b'{"behavioural": true}\n',
            "public/media/binary.bin": bytes(range(256)),
            "docs/" + "long-path-" * 15 + "/caf\u00e9.md": b"Long UTF-8 path\n",
            ".env.example": b"PUBLIC_EXAMPLE=placeholder\n",
        }
        self.excluded = {
            "node_modules/dependency.js", ".git/config", ".next/cache.bin",
            "out/output.html", "dist/bundle.js", ".pnpm-store/store.bin",
            "test-results/result.json", "playwright-report/index.html",
            ".roadmark/private.json", ".claude/settings.json",
            ".openai/settings.json", "__pycache__/cached.pyc",
            "backups/source.json", "evidence-snapshots/historical.json",
            "recovery-checkpoint/old.json", ".sites-checkout-123/old.json",
            "index.html", "index-b.html", "SOURCE-FILE-MANIFEST.json",
            "cache.tsbuildinfo", "debug.log", "old.zip", "old.tar.xz",
            "module.pyc", ".env", ".env.local", "qa/generated-report.json",
            "src/nested/node_modules/dependency.js",
        }
        for name, content in self.expected.items():
            self.write(name, content)
        for name in self.excluded:
            self.write(name, b"Excluded generated or private material\n")
        (self.root / "source-link").symlink_to(self.root / "README.md")
        (self.root / "folder-link").symlink_to(self.root / "data")

    def write(self, name, content):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)

    def package(self, archive_format, name="source"):
        output = self.directory / f"{name}.{archive_format}"
        result = packager.package_source(self.root, output, archive_format)
        return output, result

    def read_manifest(self, output, archive_format):
        if archive_format == "zip":
            with zipfile.ZipFile(output) as archive:
                return json.loads(archive.read(packager.MANIFEST_NAME))
        with tarfile.open(output, "r:xz") as archive:
            return json.load(archive.extractfile(packager.MANIFEST_NAME))

    def extract_regular_files(self, output, archive_format, destination):
        # Use only Python 3.9 APIs, without trusting archive paths or link types.
        destination.mkdir()

        def restore(name, source):
            relative = PurePosixPath(name)
            if relative.is_absolute() or ".." in relative.parts or "\\" in name:
                raise ValueError(f"Unsafe archive path: {name}")
            target = destination.joinpath(*relative.parts)
            if not target.resolve().is_relative_to(destination.resolve()):
                raise ValueError(f"Archive path leaves destination: {name}")
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as restored:
                shutil.copyfileobj(source, restored)

        if archive_format == "zip":
            with zipfile.ZipFile(output) as archive:
                for member in archive.infolist():
                    if not stat.S_ISREG(member.external_attr >> 16):
                        raise ValueError(f"Non-regular ZIP member: {member.filename}")
                    with archive.open(member) as source:
                        restore(member.filename, source)
        else:
            with tarfile.open(output, "r:xz") as archive:
                for member in archive:
                    if not member.isfile():
                        raise ValueError(f"Non-regular tar member: {member.name}")
                    with archive.extractfile(member) as source:
                        restore(member.name, source)

    def test_standard_extraction_restores_source_bytes_and_manifest(self):
        for archive_format in packager.FORMATS:
            with self.subTest(archive_format=archive_format):
                output, result = self.package(archive_format)
                destination = self.directory / f"extract-{archive_format}"
                self.extract_regular_files(output, archive_format, destination)
                restored = destination / "roadmark"
                manifest = json.loads(
                    (restored / "SOURCE-FILE-MANIFEST.json").read_text()
                )
                self.assertEqual(manifest["schemaVersion"], 1)
                self.assertEqual(manifest["root"], "roadmark")
                self.assertEqual(
                    [record["path"] for record in manifest["files"]],
                    sorted(self.expected)
                )
                for record in manifest["files"]:
                    content = (restored / record["path"]).read_bytes()
                    self.assertEqual(content, self.expected[record["path"]])
                    self.assertEqual(record["bytes"], len(content))
                    self.assertEqual(
                        record["sha256"], hashlib.sha256(content).hexdigest()
                    )
                self.assertEqual(result["format"], archive_format)
                self.assertEqual(result["bytes"], output.stat().st_size)
                self.assertEqual(result["files"], len(self.expected))
                self.assertEqual(
                    result["sha256"],
                    hashlib.sha256(output.read_bytes()).hexdigest()
                )
                self.assertEqual(
                    {path.relative_to(restored).as_posix()
                     for path in restored.rglob("*") if path.is_file()},
                    set(self.expected) | {"SOURCE-FILE-MANIFEST.json"}
                )
                # Packaging never rewrites included or excluded source bytes.
                for name, content in self.expected.items():
                    self.assertEqual((self.root / name).read_bytes(), content)
                for name in self.excluded:
                    self.assertEqual(
                        (self.root / name).read_bytes(),
                        b"Excluded generated or private material\n"
                    )

    def test_fixture_extraction_rejects_traversal_links_and_duplicates(self):
        unsafe = ["../escape", "/absolute", "roadmark/../../escape",
                  "roadmark\\..\\escape", "symlink", "duplicate"]
        for archive_format in packager.FORMATS:
            for index, name in enumerate(unsafe):
                with self.subTest(format=archive_format, name=name):
                    output = self.directory / f"unsafe-{index}.{archive_format}"
                    if archive_format == "zip":
                        archive = zipfile.ZipFile(output, "w")
                    else:
                        archive = tarfile.open(output, "w:xz", preset=0)
                    with archive:
                        if name == "symlink":
                            if archive_format == "zip":
                                info = zipfile.ZipInfo("roadmark/link")
                                info.create_system = 3
                                info.external_attr = (stat.S_IFLNK | 0o777) << 16
                                archive.writestr(info, "../outside")
                            else:
                                info = tarfile.TarInfo("roadmark/link")
                                info.type = tarfile.SYMTYPE
                                info.linkname = "../outside"
                                archive.addfile(info)
                        else:
                            packager.write_member(archive, name, b"Unsafe")
                            if name == "duplicate":
                                with warnings.catch_warnings():
                                    warnings.simplefilter("ignore", UserWarning)
                                    packager.write_member(archive, name, b"Again")
                    destination = self.directory / f"reject-{index}-{archive_format}"
                    with self.assertRaises((ValueError, FileExistsError)):
                        self.extract_regular_files(output, archive_format, destination)
        self.assertFalse((self.directory / "escape").exists())

    def test_deterministic_despite_source_metadata_changes(self):
        for index, archive_format in enumerate(packager.FORMATS):
            with self.subTest(archive_format=archive_format):
                first, _ = self.package(archive_format, "first")
                for name in self.expected:
                    path = self.root / name
                    stamp = 1000000000 + index * 1000
                    os.utime(path, (stamp, stamp))
                    path.chmod(0o755 if index == 0 else 0o644)
                second, _ = self.package(archive_format, "second")
                self.assertEqual(first.read_bytes(), second.read_bytes())

    def test_strict_size_gate_keeps_prior_output_and_cleans_partial(self):
        self.assertEqual(packager.MAX_SOURCE_BYTES, 15_000_000)
        for archive_format in packager.FORMATS:
            with self.subTest(archive_format=archive_format):
                output, result = self.package(archive_format)
                existing = output.read_bytes()
                with mock.patch.object(
                    packager, "MAX_SOURCE_BYTES", result["bytes"]
                ):
                    with self.assertRaisesRegex(ValueError, "strict 15 MB"):
                        packager.package_source(self.root, output, archive_format)
                self.assertEqual(output.read_bytes(), existing)
                self.assertFalse(list(self.directory.glob("*.partial-*")))
                with mock.patch.object(
                    packager, "MAX_SOURCE_BYTES", result["bytes"] + 1
                ):
                    packager.package_source(self.root, output, archive_format)

    def test_integrity_rejects_missing_extra_and_changed_source_members(self):
        for archive_format in packager.FORMATS:
            output, _ = self.package(archive_format)
            manifest = self.read_manifest(output, archive_format)
            for mutation in ("missing", "extra", "changed", "manifest", "duplicate"):
                with self.subTest(format=archive_format, mutation=mutation):
                    damaged = self.directory / f"{mutation}.{archive_format}"
                    if archive_format == "zip":
                        archive = zipfile.ZipFile(damaged, "w")
                    else:
                        archive = tarfile.open(damaged, "w:xz", preset=0)
                    with archive:
                        for name, content in sorted(self.expected.items()):
                            if name == "README.md" and mutation == "missing":
                                continue
                            if name == "README.md" and mutation == "changed":
                                content = b"Source was changed\n"
                            packager.write_member(archive, "roadmark/" + name, content)
                        if mutation == "extra":
                            packager.write_member(archive, "roadmark/extra", b"Extra")
                        elif mutation == "duplicate":
                            with warnings.catch_warnings():
                                warnings.simplefilter("ignore", UserWarning)
                                packager.write_member(
                                    archive, "roadmark/README.md", b"Duplicate"
                                )
                        embedded = {} if mutation == "manifest" else manifest
                        packager.write_member(
                            archive, packager.MANIFEST_NAME,
                            json.dumps(embedded).encode()
                        )
                    with self.assertRaises(ValueError):
                        packager.verify_package(damaged, archive_format, manifest)

    def test_truncated_compression_stream_is_rejected(self):
        for archive_format in packager.FORMATS:
            with self.subTest(archive_format=archive_format):
                output, _ = self.package(archive_format)
                manifest = self.read_manifest(output, archive_format)
                output.write_bytes(output.read_bytes()[:-12])
                with self.assertRaises((EOFError, lzma.LZMAError, zipfile.BadZipFile)):
                    packager.verify_package(output, archive_format, manifest)

    def test_output_cannot_be_inside_source_tree(self):
        for archive_format in packager.FORMATS:
            with self.assertRaisesRegex(ValueError, "outside the source tree"):
                packager.package_source(
                    self.root, self.root / f"self.{archive_format}", archive_format
                )

    def test_cli_defaults_suffix_inference_and_explicit_format(self):
        self.write("scripts/package-source.py", SCRIPT.read_bytes())
        copied = self.root / "scripts/package-source.py"
        cases = [
            ([], "tar.xz", self.directory / "working-source.tar.xz"),
            (["--format", "zip"], "zip", self.directory / "working-source.zip"),
            (["--output", str(self.directory / "named.zip")], "zip",
             self.directory / "named.zip"),
            (["--output", str(self.directory / "named.tar.xz")], "tar.xz",
             self.directory / "named.tar.xz"),
            (["--format", "tar.xz", "--output",
              str(self.directory / "explicit.tar.xz")],
             "tar.xz", self.directory / "explicit.tar.xz"),
        ]
        for arguments, archive_format, output in cases:
            with self.subTest(arguments=arguments):
                completed = subprocess.run(
                    [sys.executable, str(copied), *arguments],
                    check=True, capture_output=True, text=True, timeout=15
                )
                result = json.loads(completed.stdout)
                self.assertEqual(result["format"], archive_format)
                self.assertEqual(result["path"], str(output))
                self.assertTrue(output.is_file())
        for arguments in (
            ["--output", str(self.directory / "wrong.tar.gz")],
            ["--format", "zip", "--output", str(self.directory / "mismatch.tar.xz")],
        ):
            completed = subprocess.run(
                [sys.executable, str(copied), *arguments],
                capture_output=True, text=True, timeout=15
            )
            self.assertNotEqual(completed.returncode, 0)
        self.assertFalse((self.directory / "wrong.tar.gz").exists())
        self.assertFalse((self.directory / "mismatch.tar.xz").exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
