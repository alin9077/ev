#!/usr/bin/env python3
"""Offline Roadmark recovery. Verify exact archives, safely restore, then hash every file.

Requires Python 3.9 or later; no third-party packages, network, or source-code execution.
Output must be a new directory. Existing backups and source files are never changed.
"""
import argparse
import hashlib
import json
import pathlib
import shutil
import tarfile

def require(condition, message):
    if not condition:
        raise ValueError(message)

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for b in iter(lambda: f.read(1024 * 1024), b''):
            h.update(b)
    return h.hexdigest()

def safe_relative(name):
    p = pathlib.PurePosixPath(name)
    require(name and not p.is_absolute() and '..' not in p.parts and '\\' not in name,
            'Unsafe member or manifest path: ' + name)
    return p

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--manifest', required=True, type=pathlib.Path)
    ap.add_argument('--archives', required=True, type=pathlib.Path)
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument('--output', type=pathlib.Path, help='New restore directory')
    group.add_argument('--check-restored', type=pathlib.Path,
                       help='Read-only verification of an existing restored tree')
    args = ap.parse_args()
    manifest = json.loads(args.manifest.read_text())
    archives = manifest['archivesInRestoreOrder']
    files = manifest['files']
    require(archives and files, 'Empty archive or file manifest')
    require([a['restoreOrder'] for a in archives] == list(range(1, len(archives) + 1)),
            'Archive order is not consecutive')
    require(len({a['filename'] for a in archives}) == len(archives),
            'Duplicate archive filenames')
    banned = {a['library_file_id'] for a in manifest.get('cleanupCandidatesExcludedFromRestore', [])}
    require(not banned & {a['library_file_id'] for a in archives},
            'An excluded Library ID appears in restore inputs')
    archive_paths = []
    for a in archives:
        name = safe_relative(a['filename'])
        require(len(name.parts) == 1, 'Archive filename must be a basename')
        path = args.archives / str(name)
        require(path.is_file(), 'Missing archive: ' + a['filename'])
        require(path.stat().st_size == a['bytes'] and digest(path) == a['sha256'],
                'Archive hash or size mismatch: ' + a['filename'])
        archive_paths.append(path)
    root = (args.output or args.check_restored).resolve()
    if args.output:
        require(not root.exists(), 'Output already exists; choose a new empty destination')
        # Validate all member names and types before writing any output.
        for path in archive_paths:
            with tarfile.open(path, 'r:xz') as tar:
                seen = set()
                for member in tar:
                    safe_relative(member.name)
                    require(member.isfile() and member.name not in seen,
                            'Non-regular or duplicate archive member: ' + member.name)
                    seen.add(member.name)
        root.mkdir(parents=True)
        for path in archive_paths:
            with tarfile.open(path, 'r:xz') as tar:
                for member in tar:
                    relative = safe_relative(member.name)
                    dest = root.joinpath(*relative.parts)
                    dest.parent.mkdir(parents=True, exist_ok=True)
                    with tar.extractfile(member) as source, dest.open('wb') as out:
                        shutil.copyfileobj(source, out)
    require(root.is_dir(), 'Restored tree is missing')
    expected = {f['path']: f for f in files}
    require(len(expected) == len(files), 'Duplicate restored paths in manifest')
    for name in expected:
        safe_relative(name)
    actual = set()
    for path in root.rglob('*'):
        require(not path.is_symlink(), 'Symlink found in restored tree')
        if path.is_file():
            actual.add(path.relative_to(root).as_posix())
    require(actual == set(expected),
            'Restored membership mismatch: missing=%d extra=%d' %
            (len(set(expected) - actual), len(actual - set(expected))))
    for name, f in expected.items():
        path = root / name
        require(path.stat().st_size == f['bytes'] and digest(path) == f['sha256'],
                'Restored file hash or size mismatch: ' + name)
    print(json.dumps({'result': 'PASS', 'archivesVerified': len(archives),
                      'restoredFilesVerified': len(files),
                      'restoredBytes': sum(f['bytes'] for f in files.values())
                      if isinstance(files, dict) else sum(f['bytes'] for f in files)}))

if __name__ == '__main__':
    main()
