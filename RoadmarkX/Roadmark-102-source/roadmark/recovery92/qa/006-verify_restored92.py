#!/usr/bin/env python3
"""Fail-closed source92 proof launcher. ROOT EXECUTION ONLY, after frozen QA.

The root must independently inspect and SHA-pin its seal, QA receipt and review.
No network, application writes, build output writes, or browser operations.
The only compilation is an in-memory esbuild parity rebuild in runtime-proof.cjs.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import zipfile
from proof_inventory import (
    ALIASES, CHANGES, PROOF_FILES, DESIGN_REFERENCES, artifact_path, digest,
    inventory, qa_path, runtime_path, safe_file,
)

SOURCE_SHA = "9065baad3a398de0341c450d305f595cf201e01f74c19ae1dd4d83a27832b265"
PREVIEW_SHA = "c4ee5a966a51931bf1f5ed14e33f86469dd8c663f7366e050b854b9d11395633"
HTML_SHA = "ae6e9aaa1196fc47ecd4f6d9fb63dd9e7a783f6a045a60a5b0efee59488b03a6"
DATA_SHA = "991d90161e5f6f80f30fa8cbf2e15902db174db983e47f7d30fe5aa1bc519920"
SHA = re.compile(r"[a-f0-9]{64}\Z")
STAGES = {"non_http_tests", "local_http_tests", "typecheck", "lint", "validation", "production_build", "portable_build"}

def expect(ok, why):
    if not ok:
        raise AssertionError(why)

def strict_json(path):
    def pairs(items):
        result = {}
        for key, value in items:
            expect(key not in result, f"Duplicate JSON key {key} in {path}")
            result[key] = value
        return result
    return json.loads(Path(path).read_text(), object_pairs_hook=pairs,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError(value)))

def keys(value, required, where):
    expect(isinstance(value, dict) and set(value) == set(required), f"Wrong fields at {where}: {list(value) if isinstance(value, dict) else type(value)}")

def sha(value, where):
    expect(isinstance(value, str) and bool(SHA.fullmatch(value)), f"Missing/faulty SHA256 at {where}")

def ref(workspace, value):
    keys(value, {"path", "sha256"}, "file reference")
    sha(value["sha256"], value["path"])
    path = safe_file(workspace, value["path"])
    expect(digest(path) == value["sha256"], f"Pin mismatch: {path}")
    return path

def load_pins(workspace, app, value, predicate):
    pins = strict_json(ref(workspace, value))
    expect(isinstance(pins, dict) and pins, "Pins must be a nonempty path/hash object")
    for name, expected in pins.items():
        sha(expected, name)
        safe_file(app, name)
    actual = inventory(app, predicate)
    expect(actual == pins, f"Exact inventory differs for {value['path']}; missing/extra/changed files are not allowed")
    return pins

def archive_index(archive):
    names = archive.namelist()
    expect(len(names) == len(set(names)), "Duplicate ZIP entries")
    result = {}
    for info in archive.infolist():
        if info.is_dir():
            continue
        name = info.filename
        expect(name.startswith("roadmark/") and "\\" not in name, f"Unexpected ZIP member {name}")
        rel = name[len("roadmark/"):]
        expect(rel and all(p not in {".", ".."} for p in Path(rel).parts), "Unsafe archive entry")
        expect(((info.external_attr >> 16) & 0o170000) != 0o120000, "ZIP symlink rejected")
        result[rel] = info
    return result

def hash_member(archive, info):
    h = hashlib.sha256()
    with archive.open(info) as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()

def portable_parts(text):
    pattern = r'\A(.*?<script id="ev-data" type="application/json">)(.*?)(</script><script>)(.*?)(</script></body></html>)\Z'
    match = re.match(pattern, text, re.S)
    expect(match is not None, "Portable framing changed")
    prefix, data, middle, javascript, suffix = match.groups()
    expect(javascript.startswith("window.__EV_B=true;"), "Original hero flag is absent")
    expect('<noscript>This interactive comparison needs JavaScript enabled.</noscript>' in prefix, "Portable no-JS notice changed")
    expect(prefix.count("<script") == 1 and "</script" not in javascript, "Unexpected script topology")
    return prefix, data, middle, javascript, suffix

def validate_qa(workspace, seal, frozen_digest):
    stages = seal["qaStages"]
    keys(stages, STAGES, "QA stages")
    total_tests = 0
    evidence = {}
    for name in sorted(STAGES):
        terminal = strict_json(ref(workspace, stages[name]))
        required = {"schema", "checkpoint", "stage", "startedAtUTC", "finishedAtUTC", "command", "cwd", "exitCode", "frozenInputManifestSHA256", "frozenInputDigestBefore", "frozenInputDigestAfter", "log"}
        expect(isinstance(terminal, dict) and required <= set(terminal), name + " terminal fields missing")
        expect(terminal["schema"] == "roadmark-stage92-receipt-v1" and terminal["checkpoint"] == 92, "Wrong root QA receipt")
        expect(terminal["stage"] == name and type(terminal["exitCode"]) is int and terminal["exitCode"] == 0, name + " did not finish successfully")
        expect(isinstance(terminal["command"], list) and terminal["command"] and all(isinstance(x, str) and x for x in terminal["command"]), "Missing literal QA command")
        expect(Path(terminal["cwd"]).resolve() == (workspace / seal["appRoot"]).resolve(), "QA ran in another app")
        expect(terminal["frozenInputManifestSHA256"] == seal["frozenInputs"]["sha256"], "QA did not use this frozen manifest")
        expect(terminal["frozenInputDigestBefore"] == frozen_digest == terminal["frozenInputDigestAfter"], "QA input digest drift")
        keys(terminal["log"], {"path", "sha256", "bytes"}, "stage log")
        log_path = ref(workspace, {k: terminal["log"][k] for k in ("path", "sha256")})
        expect(type(terminal["log"]["bytes"]) is int and log_path.stat().st_size == terminal["log"]["bytes"], "Log byte count differs")
        start = dt.datetime.fromisoformat(terminal["startedAtUTC"].replace("Z", "+00:00"))
        end = dt.datetime.fromisoformat(terminal["finishedAtUTC"].replace("Z", "+00:00"))
        expect(start.tzinfo is not None and end.tzinfo is not None and start <= end, "Invalid QA times")
        log = log_path.read_text()
        if name in {"non_http_tests", "local_http_tests"}:
            tallies = {}
            for metric in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
                found = re.findall(r"^(?:#|ℹ) " + metric + r" (\d+)\s*$", log, re.M)
                expect(len(found) == 1, f"Expected one complete Node TAP/spec {metric} summary in {name}")
                tallies[metric] = int(found[0])
            expect(tallies["tests"] == tallies["pass"] > 0 and not any(tallies[k] for k in ("fail", "cancelled", "skipped", "todo")), name + " incomplete or failing")
            total_tests += tallies["pass"]
            evidence[name] = tallies
        if name == "production_build":
            expect(re.search(r"Generating static pages[^\n]*\(389/389\)", log) is not None, "Complete389-page production build not recorded")
            expect(re.search(r"ƒ\s+/sources(?:\s|$)", log, re.M) is not None, "Dynamic /sources production route not recorded")
        evidence[name + "ReceiptSHA256"] = stages[name]["sha256"]
    evidence["testsPassed"] = total_tests
    return evidence

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--seal", required=True, help="Workspace-relative independently reviewed root seal")
    parser.add_argument("--seal-sha256", required=True, help="Exact externally supplied root seal hash")
    parser.add_argument("--output", required=True, help="New output directory, outside the application")
    args = parser.parse_args()
    workspace = Path(args.workspace).resolve()
    seal_file = safe_file(workspace, args.seal)
    sha(args.seal_sha256, "root seal")
    expect(digest(seal_file) == args.seal_sha256, "Root seal mismatch")
    seal = strict_json(seal_file)
    keys(seal, {"schemaVersion", "appRoot", "sourceArchive", "previewArchive", "frozenInputs", "artifactPins", "qaStages", "independentReview", "reviewedChanges", "proofInputs", "policyDate"}, "root seal")
    expect(seal["schemaVersion"] == "roadmark.restored92-proof-seal.v1", "Wrong seal schema")
    app = (workspace / seal["appRoot"]).resolve()
    expect(app.is_dir() and app.is_relative_to(workspace), "Application must be inside workspace")
    expect(re.fullmatch(r"\d{4}-\d{2}-\d{2}", seal["policyDate"]) and dt.date.fromisoformat(seal["policyDate"]).isoformat() == seal["policyDate"], "Invalid explicit evidence date")
    proof_dir = Path(__file__).resolve().parent
    keys(seal["proofInputs"], PROOF_FILES, "proof inputs")
    for name, expected in seal["proofInputs"].items():
        sha(expected, name)
        expect(digest(proof_dir / name) == expected, f"Unreviewed verifier file {name}")
    source = ref(workspace, seal["sourceArchive"])
    preview = ref(workspace, seal["previewArchive"])
    expect(seal["sourceArchive"]["sha256"] == SOURCE_SHA and seal["previewArchive"]["sha256"] == PREVIEW_SHA, "Immutable91 archive anchor changed")
    frozen = strict_json(ref(workspace, seal["frozenInputs"]))
    expect(isinstance(frozen, dict) and frozen, "Frozen inputs must be a nonempty path/hash map")
    for name, expected in frozen.items():
        sha(expected, name)
        expect(digest(safe_file(app, name)) == expected, "Frozen input mismatch: " + name)
    frozen_digest = hashlib.sha256(json.dumps(frozen, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    runtime_pins = {name: expected for name, expected in frozen.items() if runtime_path(name)}
    qa_pins = {name: expected for name, expected in frozen.items() if qa_path(name)}
    expect(inventory(app, runtime_path) == runtime_pins, "Runtime inputs missing from frozen manifest or unexpectedly added")
    expect(inventory(app, qa_path) == qa_pins, "QA inputs missing from frozen manifest or unexpectedly added")
    artifact_pins = load_pins(workspace, app, seal["artifactPins"], artifact_path)
    keys(seal["reviewedChanges"], CHANGES, "exact11-file change allowlist")
    for name, item in seal["reviewedChanges"].items():
        keys(item, {"beforeSHA256", "afterSHA256"}, name)
        sha(item["afterSHA256"], name)
        expect(runtime_pins[name] == item["afterSHA256"], "Applied candidate differs from reviewed hash: " + name)
    review = strict_json(ref(workspace, seal["independentReview"]))
    keys(review, {"schemaVersion", "reviewer", "approved", "blockingFindings", "reviewedChanges", "proofInputs"}, "independent review")
    expect(review["schemaVersion"] == "roadmark.restored92-independent-review.v1" and isinstance(review["reviewer"], str) and bool(review["reviewer"].strip()), "Review identity/schema missing")
    expect(review["approved"] is True and review["blockingFindings"] == [], "Independent review is not clear")
    expect(review["reviewedChanges"] == seal["reviewedChanges"] and review["proofInputs"] == seal["proofInputs"], "Review did not cover these exact candidate/verifier bytes")
    qa_result = validate_qa(workspace, seal, frozen_digest)
    build_id = (app / ".next/BUILD_ID").read_text().strip()
    expect(build_id, "Missing emitted production build ID")
    output = Path(args.output).resolve()
    expect(output.is_relative_to(workspace) and not output.is_relative_to(app) and not output.exists(), "Use a new output directory outside app")
    output.mkdir(parents=True)
    changed = []
    with zipfile.ZipFile(source) as archive, zipfile.ZipFile(preview) as preview_archive:
        prior = archive_index(archive)
        preview_index = archive_index(preview_archive)
        manifest = json.loads(archive.read(prior["CHECKPOINT-SOURCE-MANIFEST.json"]))
        manifest_paths = {item["path"].removeprefix("roadmark/") for item in manifest["files"]}
        expect(len(manifest_paths) == len(manifest["files"]), "Duplicate source manifest paths")
        expected_frozen = (manifest_paths - set(ALIASES)) | CHANGES
        expect(set(frozen) == expected_frozen, "Frozen inventory must contain every original manifest file except4portable aliases plus exact reviewed additions")
        for name in sorted(set(frozen)):
            before = hash_member(archive, prior[name]) if name in prior else None
            after = frozen[name]
            if name in CHANGES:
                expect(seal["reviewedChanges"][name]["beforeSHA256"] == before, "Allowlist baseline mismatch: " + name)
                expect(before != after, "Declared change has no byte delta: " + name)
                changed.append(name)
            else:
                expect(before == after, "Protected91 input changed: " + name)
        for name in sorted(name for name in prior if qa_path(name)):
            expect(name in qa_pins and qa_pins[name] == hash_member(archive, prior[name]), "Restored QA/design reference changed: " + name)
        for name in DESIGN_REFERENCES:
            expect(name in prior and name in qa_pins, "Missing original design reference")
        expect(hash_member(preview_archive, preview_index["index.html"]) == HTML_SHA, "Preview91 HTML anchor mismatch")
        baseline_html = preview_archive.read(preview_index["index.html"]).decode()
        current_html = (app / "index.html").read_text()
        baseline = portable_parts(baseline_html)
        current = portable_parts(current_html)
        expect(hashlib.sha256(baseline[1].encode()).hexdigest() == DATA_SHA, "Baseline embedded data hash differs from restored proof")
        expect(current[1] == baseline[1], "Entire encoded portable payload must remain byte-identical to91")
        expect((current[0], current[2], current[4]) == (baseline[0], baseline[2], baseline[4]), "Portable CSS/HTML shell changed")
        for name in ALIASES:
            expect(artifact_pins[name] == artifact_pins["index.html"], "Four freshly built aliases must be identical")
        (output / "baseline-citable.ts").write_bytes(archive.read(prior["src/lib/citable.ts"]))
        (output / "embedded-data.json").write_text(current[1])
        (output / "emitted-javascript.txt").write_text(current[3][len("window.__EV_B=true;"):])
        del baseline_html, current_html, baseline, current
    execution = {"appRoot": str(app), "proofOutput": str(output), "policyDate": seal["policyDate"], "productionBuildId": build_id}
    execution_file = output / "execution.json"
    execution_file.write_text(json.dumps(execution, indent=2))
    env = dict(os.environ)
    env.update({"NODE_ENV": "production", "NEXT_PUBLIC_SITE_URL": "", "TZ": "UTC", "TSX_TSCONFIG_PATH": str(app / "tsconfig.json")})
    env.pop("NODE_OPTIONS", None)
    command = ["node", "--expose-gc", "--max-old-space-size=1280", "--max-semi-space-size=8", str(proof_dir / "runtime-proof.cjs"), str(execution_file)]
    for mode in ("accessors", "main"):
        with (output / (mode + ".log")).open("w") as log:
            result = subprocess.run(command + [mode], cwd=app, env=env, stdout=log, stderr=subprocess.STDOUT, check=False)
        expect(result.returncode == 0, f"{mode} proof failed ({result.returncode}); inspect {output / (mode + '.log')}")
    runtime = strict_json(output / "runtime-result.json")
    accessors = strict_json(output / "accessor-result.json")
    # Recheck the complete inventories and all root evidence after execution.
    expect(inventory(app, runtime_path) == runtime_pins, "Runtime inputs changed during proof")
    expect(inventory(app, qa_path) == qa_pins, "QA inputs changed during proof")
    expect(inventory(app, artifact_path) == artifact_pins, "Emitted artifacts changed during proof")
    expect(digest(seal_file) == args.seal_sha256, "Seal changed during proof")
    for field in ("sourceArchive", "previewArchive", "frozenInputs", "artifactPins", "independentReview"):
        ref(workspace, seal[field])
    for name, expected in frozen.items():
        expect(digest(safe_file(app, name)) == expected, "Frozen file changed during proof: " + name)
    for name, expected in seal["proofInputs"].items():
        expect(digest(proof_dir / name) == expected, "Verifier input changed during proof: " + name)
    validate_qa(workspace, seal, frozen_digest)
    result = {
        "schemaVersion": "roadmark.restored92-emitted-proof.v1", "passed": True,
        "checkedAtUTC": dt.datetime.now(dt.timezone.utc).isoformat(),
        "sealSHA256": args.seal_sha256, "sourceArchiveSHA256": SOURCE_SHA,
        "previewArchiveSHA256": PREVIEW_SHA, "baselinePortableSHA256": HTML_SHA,
        "portableSHA256": artifact_pins["index.html"], "encodedPortableDataSHA256": DATA_SHA,
        "exactReviewedChanges": changed, "protectedRuntimeInputs": len(runtime_pins),
        "pinnedQaInputs": len(qa_pins), "pinnedEmittedArtifacts": len(artifact_pins),
        "completePortablePayloadByteIdenticalTo91": True, "htmlShellAndCSSUnchanged": True,
        "fourAliasesByteIdentical": True, "allShippedAssetsAndOriginalDesignReferencesUnchanged": True,
        "qa": qa_result, "runtime": runtime, "accessors": accessors,
        "ordinaryNodeReactSemantics": True, "catalogueConstructions": 4,
        "researchArchivesRestored": False, "missingRawCapturesIndependentlyVerified": False,
        "browserExecuted": False, "liveWebGLTested": False, "realPhonesTested": False,
        "sustainedBrowserStability": "unresolved", "releaseApproved": False,
    }
    (output / "proof.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"PROOF FAILED: {type(error).__name__}: {error}", file=sys.stderr)
        raise
