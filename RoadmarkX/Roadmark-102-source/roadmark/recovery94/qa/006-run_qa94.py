#!/usr/bin/env python3
"""Reviewed ROOT ONLY: serial checkpoint94 QA and in-process output capture.

This file has no import-time side effects. The read-only verifier may import this
externally pinned file for shared filesystem/schema helpers, never the app.
"""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import time
import traceback

APP = "roadmark-work/roadmark"
BASE_INPUT = "roadmark-research/applied93/expected-inputs-after-type-fix.json"
BASE_INPUT_SHA = "e8161ffb02c560a482c4dbf4fbde2fd3d908a0cd8e9f47585e092fc22411d5ad"
BASE_ARTIFACTS = "roadmark-research/applied93/emitted-output-proof-attempt1/artifact-pins.json"
BASE_ARTIFACTS_SHA = "f12a19e96fac3791df357c8bf33a71f1580c06649162a25dab126029853937a0"
BASE_PROOF = "roadmark-research/applied93/emitted-output-proof-attempt1/proof.json"
BASE_PROOF_SHA = "0176e86646090889896efca1f12e995e5aa00a7cf767ad49830741cf097f6023"
BASE_HTML = "roadmark-restoration/browser92/current93.html"
PORTABLE_SHA = "da97acddcc6319fb1e0185a835870f52325a98b4eeb74750935da732c11997e9"
PORTABLE_BYTES = 36889206
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
METADATA = {"CHECKPOINT-PREVIEW-MANIFEST.json", "CHECKPOINT-SOURCE-MANIFEST.json", "OPEN-PORTABLE-PREVIEW.txt"}
DOC = "docs/REVIEW_WORKFLOW.md"
ADDITIONS = {"scripts/preview-report-review.ts", "src/lib/report-review-dry-run.ts", "tests/helpers/report-preview-fixture.ts", "tests/report-review-cli.test.ts", "tests/report-review-dry-run.test.ts"}
CHANGES = ADDITIONS | {DOC}
REGISTERS = ("data/approved-corrections.json", "data/approved-feature-corrections.json", "data/approved-availability-corrections.json")
STAGES = ("non_http_tests", "local_http_tests", "typecheck", "lint", "validation", "production_build", "portable_build")
CORE = (".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json", ".next/server/app/index.html", ".next/server/app/market.html", ".next/server/app/market/page.js")
HEX = re.compile(r"[0-9a-f]{64}\Z")
ENV = {"NODE_OPTIONS": "--max-old-space-size=1280 --max-semi-space-size=8", "NEXT_TELEMETRY_DISABLED": "1"}
# These must be absent rather than inherited into a different build mode/origin.
ABSENT_ENV = ("SITE_STATIC_EXPORT", "NEXT_PUBLIC_SITE_URL", "NODE_ENV")


def need(value, reason):
    if not value:
        raise AssertionError(reason)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def stamp(value):
    result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    need(result.tzinfo is not None, "Timestamp missing timezone")
    return result.timestamp()


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()


def digest(value):
    return hashlib.sha256(canonical(value)).hexdigest()


def load(path):
    def unique(pairs):
        obj = {}
        for key, value in pairs:
            need(key not in obj, "Duplicate JSON key")
            obj[key] = value
        return obj
    def invalid(value):
        raise ValueError("Invalid JSON constant: " + value)
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique, parse_constant=invalid)


def write(path, value):
    with path.open("x", encoding="utf-8") as target:
        json.dump(value, target, sort_keys=True, indent=2, allow_nan=False)
        target.write("\n")


def safe(root, name, directory=False):
    need(type(name) is str and name and not Path(name).is_absolute() and "\\" not in name and all(p not in {"", ".", ".."} for p in name.split("/")), "Unsafe relative path")
    p = root / name
    need(not any(root.joinpath(*Path(name).parts[:i]).is_symlink() for i in range(1, len(Path(name).parts) + 1)), "Symlink rejected: " + name)
    need(p.is_dir() if directory else p.is_file(), "Missing path: " + name)
    return p


def metadata(path):
    before = path.stat()
    result = {"sha256": sha(path), "bytes": before.st_size, "mtimeNs": before.st_mtime_ns}
    after = path.stat()
    need((before.st_size, before.st_mtime_ns, before.st_ino) == (after.st_size, after.st_mtime_ns, after.st_ino), "File changed while hashing: " + str(path))
    return result


def ref(workspace, path):
    value = metadata(path)
    return {"path": path.relative_to(workspace).as_posix(), "sha256": value["sha256"], "bytes": value["bytes"]}


def pinned(workspace, name, pin):
    need(type(pin) is str and HEX.fullmatch(pin), "Invalid external SHA256")
    path = safe(workspace, name)
    need(sha(path) == pin, "Pinned file drift: " + name)
    return path


def names(app, predicate):
    out = []
    for directory, children, files in os.walk(app, followlinks=False):
        children[:] = [n for n in children if n not in {"node_modules", ".git"}]
        for child in children:
            need(not (Path(directory) / child).is_symlink(), "Symlinked directory in app")
        for name in files:
            rel = (Path(directory) / name).relative_to(app).as_posix()
            if predicate(rel):
                safe(app, rel)
                out.append(rel)
    return sorted(out)


def input_name(name):
    return not name.startswith(".next/") and name not in set(ALIASES) | METADATA | {"tsconfig.tsbuildinfo"}


def production_name(name):
    return name in {".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json"} or name.startswith((".next/server/app/", ".next/static/"))


def capture(app, kind):
    selected = ALIASES if kind == "portable" else names(app, production_name)
    if kind == "all":
        selected = sorted(set(selected) | set(ALIASES))
    return {n: metadata(safe(app, n)) for n in selected}


def inputs(app, expected):
    need(set(names(app, input_name)) == set(expected), "Unmanifested/missing application input")
    actual = {n: sha(safe(app, n)) for n in expected}
    need(actual == expected, "Frozen application input drift")
    return digest(actual)


def check_configuration(workspace, config):
    """Read-only: check pinned manifest chain and exact protected-source delta."""
    app = safe(workspace, APP, directory=True)
    base = load(pinned(workspace, BASE_INPUT, BASE_INPUT_SHA))
    proof = load(pinned(workspace, BASE_PROOF, BASE_PROOF_SHA))
    artifacts = load(pinned(workspace, BASE_ARTIFACTS, BASE_ARTIFACTS_SHA))
    baseline = pinned(workspace, BASE_HTML, PORTABLE_SHA)
    need(baseline.stat().st_size == PORTABLE_BYTES and proof["passed"] is True and proof["checkpoint"] == 93 and proof["portableSHA256"] == PORTABLE_SHA, "Invalid verified93 anchor")
    expected = load(pinned(workspace, config["expectedInputs"]["path"], config["expectedInputs"]["sha256"]))
    manifest = load(pinned(workspace, config["candidate"]["path"], config["candidate"]["sha256"]))
    rows = manifest["changes"]
    need(len(rows) == 6 and {r["target"] for r in rows} == CHANGES, "Initial manifest is not exact six-file delta")
    final = {}
    for row in rows:
        n = row["target"]
        need(row["preimageSha256"] == base.get(n), "Candidate preimage differs from93")
        need(row["operation"] == ("replace_exact_preimage" if n == DOC else "create_only_if_absent"), "Unexpected candidate operation")
        final[n] = row["postimageSha256"]
    for item in config["revisions"]:
        revision = load(pinned(workspace, item["path"], item["sha256"]))
        need(revision["originalCandidateManifestSha256"] == config["candidate"]["sha256"], "Revision belongs to different initial candidate")
        revisions = revision["changes"]
        need(revisions and len({r["target"] for r in revisions}) == len(revisions), "Duplicate/empty revision")
        for row in revisions:
            n = row["target"]
            need(n in CHANGES and row["operation"] == "replace_exact_preimage" and row["preimageSha256"] == final[n], "Broken reviewed revision chain")
            final[n] = row["postimageSha256"]
    need(len(base) == 1650 and len(expected) == 1655 and set(expected) == set(base) | ADDITIONS and not set(base) & ADDITIONS, "Wrong complete source membership")
    for n, pin in expected.items():
        need(type(pin) is str and HEX.fullmatch(pin), "Malformed input hash")
        need(pin == (final[n] if n in CHANGES else base[n]), "Unapproved protected input change: " + n)
    need(expected[DOC] != base[DOC], "Missing reviewed documentation change")
    fixed = inputs(app, expected)
    for n in REGISTERS:
        need(type(load(app / n)) is list and load(app / n) == [] and expected[n] == base[n], "Approval register changed/nonempty")
    # Old runtime/build sources are all hash-identical; also reject literal new
    # entrypoint references in the protected source/build/config graph.
    for n in base:
        if (n.startswith(("src/", "scripts/")) or "/" not in n) and Path(n).suffix in {".ts", ".tsx", ".js", ".mjs", ".cjs", ".json"}:
            text = (app / n).read_text(encoding="utf-8")
            need("preview-report-review" not in text and "report-review-dry-run" not in text, "New CLI module reference in protected runtime/build input: " + n)
    return expected, fixed, final, artifacts, proof


def commands(expected):
    tests = sorted(n for n in expected if re.fullmatch(r"tests/[^/]+\.test\.ts", n) and n != "tests/local-review.test.ts")
    need({"tests/report-review-cli.test.ts", "tests/report-review-dry-run.test.ts"} <= set(tests), "New runtime tests omitted")
    return {
        "non_http_tests": ["node", "--import", "tsx", "--test", "--test-concurrency=1", *tests],
        "local_http_tests": ["node", "--import", "tsx", "--test", "tests/local-review.test.ts"],
        "typecheck": ["node", "node_modules/typescript/bin/tsc", "--noEmit"],
        "lint": ["node", "node_modules/eslint/bin/eslint.js", "src", "tests", "scripts"],
        "validation": ["node", "--import", "tsx", "scripts/validate.ts"],
        "production_build": ["node", "node_modules/next/dist/bin/next", "build"],
        "portable_build": ["node", "--import", "tsx", "scripts/build-portable.ts"],
    }


def stage_mtimes(outputs, required, receipt):
    for name in required:
        row = outputs[name]
        need(type(row["mtimeNs"]) is int and stamp(receipt["startedAtUTC"]) - 2 <= row["mtimeNs"] / 1e9 <= stamp(receipt["finishedAtUTC"]) + 2, "Output outside producer interval: " + name)


def new_output(workspace, name):
    need(name and not Path(name).is_absolute() and "\\" not in name and all(p not in {"", ".", ".."} for p in name.split("/")), "Unsafe output directory")
    output = workspace / name
    need(not output.exists() and not output.is_symlink() and not output.resolve().is_relative_to(workspace / APP), "Use a new external evidence directory")
    safe(workspace, output.parent.relative_to(workspace).as_posix(), directory=True)
    output.mkdir()
    return output


def run(workspace, output, config, approved_sha):
    app = workspace / APP
    # Advisory exclusivity coordinates other instances of this exact runner.
    # Root must separately keep other writers/builds/servers stopped.
    lock = os.open(app, os.O_RDONLY | os.O_DIRECTORY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        expected, fixed, changes, baseline_artifacts, baseline_proof = check_configuration(workspace, config)
        for key in ABSENT_ENV:
            need(key not in os.environ, "Unset environment override before ordinary QA: " + key)
        initial_metadata = {n: metadata(safe(app, n)) for n in sorted(METADATA)}
        write(output / "frozen-inputs.json", expected)
        write(output / "freeze-receipt.json", {"atUTC": now(), "checkpoint": 94, "fileCount": len(expected), "canonicalDigest": fixed, "frozenInputManifestSHA256": sha(output / "frozen-inputs.json"), "approvedInputMap": config["expectedInputs"], "changedOrAddedFiles": changes, "checkpointMetadata": initial_metadata})
        pre_start = now()
        pre = capture(app, "all")
        pre_end = now()
        need({n: v["sha256"] for n, v in pre.items()} == baseline_artifacts, "Prebuild outputs are not the actual verified93 artifact set")
        old_build_id = safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip()
        need(old_build_id == baseline_proof["actual93ProductionBuildID"], "Prebuild BUILD_ID differs from verified93")
        write(output / "prebuild-observation.json", {"captureStartedAtUTC": pre_start, "captureFinishedAtUTC": pre_end, "buildID": old_build_id, "artifacts": pre, "runnerSHA256": approved_sha, "productionStageNotStarted": True})
        env = {**os.environ, **ENV}
        receipts, observations = {}, {}
        for stage, argv in commands(expected).items():
            before = inputs(app, expected)
            need({n: metadata(safe(app, n)) for n in sorted(METADATA)} == initial_metadata, "Historical checkpoint metadata drifted")
            start = now()
            clock_start = time.monotonic_ns()
            print("START", stage, start, flush=True)
            error = None
            with (output / (stage + ".log")).open("xb") as log:
                process = subprocess.Popen(argv, cwd=app, env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
                try:
                    exit_code = process.wait()
                except BaseException as interrupted:
                    error = interrupted
                    try:
                        os.killpg(process.pid, signal.SIGTERM)
                    except ProcessLookupError:
                        pass
                    try:
                        exit_code = process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        try:
                            os.killpg(process.pid, signal.SIGKILL)
                        except ProcessLookupError:
                            pass
                        exit_code = process.wait()
            finish = now()
            elapsed = time.monotonic_ns() - clock_start
            # This capture is part of the actual producer runner, immediately
            # after process termination and before the next stage can start.
            write(output / (stage + "-process-terminal.json"), {"stage": stage, "command": argv, "cwd": str(app), "processId": process.pid, "startedAtUTC": start, "finishedAtUTC": finish, "durationNs": elapsed, "exitCode": exit_code, "interrupted": error is not None, "log": ref(workspace, output / (stage + ".log"))})
            observation = None
            capture_error = None
            if stage in {"production_build", "portable_build"}:
                try:
                    capture_start = now()
                    artifacts = capture(app, "production" if stage == "production_build" else "portable")
                    capture_end = now()
                    observation = {"schemaVersion": "roadmark94.producer-output-observation.v1", "stage": stage, "command": argv, "processId": process.pid, "exitCode": exit_code, "producerStartedAtUTC": start, "producerFinishedAtUTC": finish, "captureStartedAtUTC": capture_start, "captureFinishedAtUTC": capture_end, "artifacts": artifacts}
                    write(output / (stage + "-outputs.json"), observation)
                    observations[stage] = ref(workspace, output / (stage + "-outputs.json"))
                except BaseException as caught:
                    capture_error = {"errorType": type(caught).__name__, "error": str(caught), "traceback": traceback.format_exc()}
            after = None
            drift_error = None
            try:
                after = inputs(app, expected)
            except BaseException as caught:
                drift_error = str(caught)
            result = {"schemaVersion": "roadmark94.stage-receipt.v1", "processTerminal": ref(workspace, output / (stage + "-process-terminal.json")), "checkpoint": 94, "stage": stage, "startedAtUTC": start, "finishedAtUTC": finish, "durationNs": elapsed, "processId": process.pid, "command": argv, "cwd": str(app), "environmentOverrides": ENV, "requiredAbsentEnvironment": list(ABSENT_ENV), "exitCode": exit_code, "interrupted": error is not None, "inputDriftError": drift_error, "captureError": capture_error, "frozenInputManifestSHA256": sha(output / "frozen-inputs.json"), "frozenInputDigestBefore": before, "frozenInputDigestAfter": after, "log": ref(workspace, output / (stage + ".log")), "outputObservation": observations.get(stage)}
            write(output / (stage + ".json"), result)
            receipts[stage] = ref(workspace, output / (stage + ".json"))
            print("END", stage, exit_code, finish, flush=True)
            if error is not None:
                raise error
            need(exit_code == 0 and before == after == fixed and capture_error is None, "Stage failed, inputs changed or output capture failed: " + stage)
            if observation:
                stage_mtimes(observation["artifacts"], CORE if stage == "production_build" else ALIASES, result)
                if stage == "production_build":
                    need(safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip() != old_build_id, "Production BUILD_ID did not change")
                else:
                    need(all(v["sha256"] == PORTABLE_SHA and v["bytes"] == PORTABLE_BYTES for v in observation["artifacts"].values()), "Portable aliases differ from exact saved93 bytes")
        produced = load(output / "production_build-outputs.json")["artifacts"]
        portable = load(output / "portable_build-outputs.json")["artifacts"]
        final = capture(app, "all")
        need(final == {**produced, **portable}, "Output drift after producer capture")
        check_configuration(workspace, config)
        need({n: metadata(safe(app, n)) for n in sorted(METADATA)} == initial_metadata, "Checkpoint metadata changed")
        need(sha(Path(__file__).resolve()) == approved_sha, "Runner changed during execution")
        evidence = {p.name: ref(workspace, p) for p in sorted(output.iterdir()) if p.is_file()}
        write(output / "run-result.json", {"schemaVersion": "roadmark94.serial-qa-result.v1", "passed": True, "checkpoint": 94, "finishedAtUTC": now(), "runnerSHA256": approved_sha, "configuration": config, "frozenInputDigest": fixed, "stageReceipts": receipts, "outputObservations": observations, "evidence": evidence, "artifactCount": len(final), "actualBuildID": safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip(), "baselineBuildID": old_build_id, "exclusiveWorkspaceConfirmedByRoot": True, "publicExportRun": False, "boundary": "Trusted root execution and selected filesystem observation, not signed attestation. Portable aliases, server/app, static and four build/routing manifests only; server/chunks and caches excluded. No browser, phone, public export, publication or release approval."})
        print("SEVEN_QA_STAGES_COMPLETE; actual output captures retained; independent verifier pending", flush=True)
    finally:
        os.close(lock)


def parser():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--workspace", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--expected-inputs", required=True)
    p.add_argument("--expected-inputs-sha256", required=True)
    p.add_argument("--candidate-manifest", required=True)
    p.add_argument("--candidate-manifest-sha256", required=True)
    p.add_argument("--revision", action="append", nargs=2, metavar=("PATH", "SHA256"), default=[])
    p.add_argument("--approved-runner-sha256", required=True)
    p.add_argument("--exclusive-workspace-confirmed", action="store_true", required=True)
    return p


def main():
    args = parser().parse_args()
    workspace = Path(args.workspace).resolve()
    need(HEX.fullmatch(args.approved_runner_sha256) and sha(Path(__file__).resolve()) == args.approved_runner_sha256, "External runner review pin mismatch")
    config = {"expectedInputs": {"path": args.expected_inputs, "sha256": args.expected_inputs_sha256}, "candidate": {"path": args.candidate_manifest, "sha256": args.candidate_manifest_sha256}, "revisions": [{"path": n, "sha256": h} for n, h in args.revision]}
    output = new_output(workspace, args.output)
    write(output / "execution-request.json", {"schemaVersion": "roadmark94.serial-qa-request.v1", "startedAtUTC": now(), "argv": sys.argv, "runnerSHA256": args.approved_runner_sha256, "configuration": config, "exclusiveWorkspaceConfirmedByRoot": args.exclusive_workspace_confirmed})
    def terminated(signum, frame):
        raise InterruptedError("Runner received signal " + str(signum))
    signal.signal(signal.SIGTERM, terminated)
    try:
        run(workspace, output, config, args.approved_runner_sha256)
    except BaseException as error:
        write(output / "failure.json", {"passed": False, "errorType": type(error).__name__, "error": str(error), "atUTC": now(), "traceback": traceback.format_exc(), "successNotEstablished": True})
        raise


if __name__ == "__main__":
    main()
