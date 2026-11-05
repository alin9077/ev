#!/usr/bin/env python3
"""Cross-check the archive files against the manifests that ship inside them.

Usage: python3 -I crosscheck.py <dir-containing-RoadmarkX> [--sums FILE]

1. Roadmark-102-all-in-one/CONTENTS-MANIFEST.json: the payload archive's
   bytes and sha256 must match the file on disk.
2. Every RoadmarkX/Roadmark-RECOVERY-MANIFEST-*.json: walk the JSON; any object
   that names a file (key name/path/file/archive ending in .tar.xz/.zip/.json/.md)
   and carries a sha256 (key sha256/SHA256/sha256Hex) is compared against the
   file of that basename found under RoadmarkX/. Counts are printed for
   matched, mismatched and not-present; mismatches are listed.
Exit status 1 on any mismatch in (1) or (2).
"""
import hashlib, json, os, sys

root = sys.argv[1]
rx = os.path.join(root, "RoadmarkX")
cache = {}

def sha(path):
    if path not in cache:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        cache[path] = h.hexdigest()
    return cache[path]

by_name = {}
for d, _, fs in os.walk(rx):
    for n in fs:
        by_name.setdefault(n, []).append(os.path.join(d, n))

fail = 0
cm = json.load(open(os.path.join(rx, "Roadmark-102-all-in-one", "CONTENTS-MANIFEST.json")))
pa = cm["payloadArchive"]
p = os.path.join(rx, "Roadmark-102-all-in-one", pa["name"])
ok = os.path.getsize(p) == pa["bytes"] and sha(p) == pa["sha256"]
print(f"CONTENTS-MANIFEST payload {pa['name']}: {'OK' if ok else 'MISMATCH'}")
fail += 0 if ok else 1

NAMEKEYS = ("name", "path", "file", "archive", "filename")
HASHKEYS = ("sha256", "SHA256", "sha256Hex", "sha-256")
EXT = (".tar.xz", ".zip", ".json", ".md", ".txt", ".py")
matched = mismatched = absent = 0
bad = []

def walk(o, src):
    global matched, mismatched, absent
    if isinstance(o, dict):
        nk = next((k for k in NAMEKEYS if isinstance(o.get(k), str) and o[k].endswith(EXT)), None)
        hk = next((k for k in HASHKEYS if isinstance(o.get(k), str) and len(o[k]) == 64), None)
        if nk and hk:
            base = os.path.basename(o[nk])
            paths = by_name.get(base)
            if not paths:
                absent += 1
            elif any(sha(x) == o[hk] for x in paths):
                matched += 1
            else:
                mismatched += 1
                bad.append((src, o[nk]))
        for v in o.values():
            walk(v, src)
    elif isinstance(o, list):
        for v in o:
            walk(v, src)

for n in sorted(by_name):
    if n.startswith("Roadmark-RECOVERY-MANIFEST-") and n.endswith(".json"):
        walk(json.load(open(by_name[n][0])), n)
print(f"recovery-manifest entries: matched={matched} mismatched={mismatched} not-present-in-RoadmarkX={absent}")
for s, f in bad:
    print(f"  MISMATCH {s}: {f}")
fail += mismatched
sys.exit(1 if fail else 0)
