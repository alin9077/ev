#!/usr/bin/env python3
"""Reassemble source99 parts after verifying every wrapper and payload hash.

Extract the recovery kit into a folder containing all numbered part ZIPs.
This program creates only the source ZIP; it never extracts or executes the app.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import stat
import sys
import zipfile


def need(ok, message):
    if not ok:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def filename(name):
    need(type(name) is str and name and name not in {'.', '..'} and name == Path(name).name and '/' not in name and '\\' not in name, 'Unsafe filename')
    return name


def unique(pairs):
    result = {}
    for key, value in pairs:
        need(key not in result, 'Duplicate JSON key')
        result[key] = value
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--parts-directory', type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument('--output-directory', type=Path)
    args = parser.parse_args()
    root = args.parts_directory.resolve()
    output = args.output_directory.resolve() if args.output_directory else root
    need(root.is_dir() and output.is_dir(), 'Both directories must exist')
    manifest_path = root / 'source-parts.json'
    need(not manifest_path.is_symlink(), 'Manifest symlink rejected')
    manifest = json.loads(manifest_path.read_bytes(), object_pairs_hook=unique)
    need(manifest['schemaVersion'] == 'roadmark99.source-parts.v1' and manifest['applicationCheckpoint'] == 99 and manifest['chunkBytes'] == 16 * 1024 * 1024, 'Wrong parts contract')
    need(re.fullmatch('[0-9a-f]{64}', manifest['originalSHA256']) and type(manifest['originalBytes']) is int and manifest['originalBytes'] > 0, 'Invalid original identity')
    need(manifest['originalFilename'] == 'Roadmark-recovered-99-source.zip', 'Unexpected output name')
    target = output / filename(manifest['originalFilename'])
    need(not target.exists() and not target.is_symlink(), 'Output exists; no overwrite')
    parts = manifest['parts']
    need(type(parts) is list and parts, 'No parts')
    chunks = []
    for number, part in enumerate(parts, 1):
        name = filename(part['filename'])
        need(name == 'Roadmark-source-99-chat-part-%d.zip' % number, 'Unexpected part name/order')
        member = 'roadmark-source-99.part%02d.bin' % number
        need(part['member'] == member, 'Wrong part member')
        path = root / name
        need(not path.is_symlink() and path.is_file(), 'Missing/unsafe part')
        raw = path.read_bytes()
        need(len(raw) == part['bytes'] and sha(raw) == part['sha256'], 'Part wrapper hash/size mismatch: ' + name)
        with zipfile.ZipFile(path) as archive:
            need(archive.namelist() == [member], 'Unexpected ZIP members')
            item = archive.infolist()[0]
            need(stat.S_IFMT(item.external_attr >> 16) == stat.S_IFREG and not item.flag_bits & 1 and item.compress_type == zipfile.ZIP_STORED, 'Invalid part member kind')
            need(0 < item.file_size <= manifest['chunkBytes'] and (number == len(parts) or item.file_size == manifest['chunkBytes']), 'Invalid part length')
            chunk = archive.read(member)
        need(len(chunk) == part['payloadBytes'] and sha(chunk) == part['payloadSHA256'], 'Part payload hash/size mismatch')
        chunks.append(chunk)
    result = b''.join(chunks)
    need(len(result) == manifest['originalBytes'] and sha(result) == manifest['originalSHA256'], 'Reconstructed source mismatch')
    with target.open('xb') as destination:
        destination.write(result)
    need(sha(target.read_bytes()) == manifest['originalSHA256'] and target.stat().st_size == len(result), 'Written source mismatch')
    print(json.dumps({'schemaVersion': 'roadmark99.joiner-result.v1', 'status': 'reassembled_and_verified', 'pairId': manifest['pairId'], 'filename': target.name, 'bytes': len(result), 'sha256': sha(result), 'applicationExecuted': False}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
