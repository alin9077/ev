#!/usr/bin/env python3
"""Reviewed ROOT ONLY: serial checkpoint95 QA and in-process output capture.

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
BASE_INPUT = "roadmark-research/applied94/expected-inputs-revision2.json"
BASE_INPUT_SHA = "6fe274badc06ae64b9fa2be225d73019ef98bd503dcdf0cc9b38238daa33a3ba"
BASE_ARTIFACTS = "roadmark-research/applied94/emitted-proof-attempt1/artifact-pins.json"
BASE_ARTIFACTS_SHA = "0605725e6536302590871a7ec23f36674046d5fb8aa3d1eff193cd2d49534c44"
BASE_PROOF = "roadmark-research/applied94/emitted-proof-attempt1/proof.json"
BASE_PROOF_SHA = "65bc2b5b45956ed608cea36993c8441e89c54b2d9a772762e2fdddf4fd096538"
BASE_VALIDATION = "roadmark-research/applied94/qa-attempt1/validation.log"
BASE_VALIDATION_SHA = "ef2d03ab304c6a06f1acd3d6a6ed3547c9845e5d1c43791fe0727485a94a03a9"
BASE_BUILD_ID = "bRi5VFzp553AQovWPUkLQ"
BASE_HTML = "roadmark-restoration/browser92/current93.html"
PORTABLE_SHA = "da97acddcc6319fb1e0185a835870f52325a98b4eeb74750935da732c11997e9"
PORTABLE_BYTES = 36889206
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
METADATA = {"CHECKPOINT-PREVIEW-MANIFEST.json", "CHECKPOINT-SOURCE-MANIFEST.json", "OPEN-PORTABLE-PREVIEW.txt"}
MARKET = "data/market-inventory-2026-10-10.json"
FIXTURE = "qa/checkpoint95-market-fixture.json"
ADDITIONS = {"data/market-mazda-cx6e-lead-evidence-2026-10-12.json", FIXTURE, "tests/checkpoint95-market.test.ts", "tests/helpers/checkpoint95-market-history.ts"}
REPLACEMENTS = {MARKET, "tests/checkpoint93-market.test.ts", "tests/helpers/checkpoint93-market-history.ts"}
CHANGES = ADDITIONS | REPLACEMENTS
CANDIDATE_SHA = "2b8f983e5da1524d0517aa0e400231c651a179fd524b71359cebb707516499ed"
NON_HTTP_TESTS = 850
TOTAL_INPUTS = 1659
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


def presentation(app, artifacts, predecessor=False):
    """Static markup only, excluding script bodies/tags and JS preload links.

    This deliberately says nothing about production hydration/RSC execution.
    The portable comparison separately preserves executable bundle bytes.
    """
    pages = {}
    for name in sorted(artifacts):
        if not (name.startswith(".next/server/app/") and name.endswith(".html")):
            continue
        text = safe(app, name).read_text(encoding="utf-8")
        text = re.sub(r"<script\b[^>]*>.*?</script\s*>", "", text, flags=re.I | re.S)
        need(not re.search(r"<script\b", text, re.I), "Unparsed production script tag")
        def link(match):
            tag = match.group(0)
            return "" if re.search(r'\brel="preload"', tag) and re.search(r'\bas="script"', tag) else tag
        text = re.sub(r"<link\b[^>]*>", link, text, flags=re.I)
        if name == ".next/server/app/market.html":
            count = "241" if predecessor else "242"
            replacements = (
                (count + "<!-- --> additional model records · Audit incomplete", "{RECORD_COUNT}<!-- --> additional model records · Audit incomplete"),
                ('<p role="status">' + count + "<!-- --> model records.", '<p role="status">{RECORD_COUNT}<!-- --> model records.'),
                ("Showing <!-- -->24<!-- --> of <!-- -->" + count + "<!-- --> matching model records.", "Showing <!-- -->24<!-- --> of <!-- -->{RECORD_COUNT}<!-- --> matching model records."),
            )
            for old, replacement in replacements:
                need(text.count(old) == 1, "Missing/ambiguous market presentation count: " + old)
                text = text.replace(old, replacement)
        pages[name] = {"sha256": hashlib.sha256(text.encode()).hexdigest(), "bytes": len(text.encode())}
    css = {n: v["sha256"] for n, v in artifacts.items() if n.startswith(".next/static/") and n.endswith(".css")}
    need(pages and css, "Missing presentation/CSS scope")
    return {"html": pages, "css": css, "excluded": "All production script elements and script preload links; exactly three market record-count tokens normalized"}


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
    need(baseline.stat().st_size == PORTABLE_BYTES and proof["passed"] is True and proof["checkpoint"] == 94 and proof["portableSHA256"] == PORTABLE_SHA and proof["actualProductionBuildID"] == BASE_BUILD_ID and proof["artifactPinsSHA256"] == BASE_ARTIFACTS_SHA, "Invalid verified94 anchor")
    pinned(workspace, BASE_VALIDATION, BASE_VALIDATION_SHA)
    expected = load(pinned(workspace, config["expectedInputs"]["path"], config["expectedInputs"]["sha256"]))
    need(config["candidate"]["sha256"] == CANDIDATE_SHA, "Unreviewed market95 manifest")
    manifest = load(pinned(workspace, config["candidate"]["path"], config["candidate"]["sha256"]))
    rows = manifest["files"]
    need(len(rows) == 7 and {r["path"] for r in rows} == CHANGES, "Manifest is not exact seven-file delta")
    final = {}
    for row in rows:
        n = row["path"]
        need(row["beforeSHA256"] == base.get(n), "Candidate preimage differs from94")
        final[n] = row["sha256"]
        need(safe(app, n).stat().st_size == row["bytes"], "Candidate byte length differs")
    need(len(base) == 1655 and len(expected) == TOTAL_INPUTS and set(expected) == set(base) | ADDITIONS and not set(base) & ADDITIONS, "Wrong complete source membership")
    for n, pin in expected.items():
        need(type(pin) is str and HEX.fullmatch(pin), "Malformed input hash")
        need(pin == (final[n] if n in CHANGES else base[n]), "Unapproved protected input change: " + n)
    need(all(expected[n] != base[n] for n in REPLACEMENTS), "Missing reviewed replacement")
    fixed = inputs(app, expected)
    for n in REGISTERS:
        need(type(load(app / n)) is list and load(app / n) == [] and expected[n] == base[n], "Approval register changed/nonempty")
    return expected, fixed, final, artifacts, proof


def commands(expected):
    tests = sorted(n for n in expected if re.fullmatch(r"tests/[^/]+\.test\.ts", n) and n != "tests/local-review.test.ts")
    need({"tests/checkpoint95-market.test.ts", "tests/checkpoint93-market.test.ts", "tests/checkpoint91-market.test.ts", "tests/report-review-cli.test.ts", "tests/report-review-dry-run.test.ts"} <= set(tests), "Required new or historical tests omitted")
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
        write(output / "freeze-receipt.json", {"atUTC": now(), "checkpoint": 95, "fileCount": len(expected), "canonicalDigest": fixed, "frozenInputManifestSHA256": sha(output / "frozen-inputs.json"), "approvedInputMap": config["expectedInputs"], "changedOrAddedFiles": changes, "checkpointMetadata": initial_metadata})
        pre_start = now()
        pre = capture(app, "all")
        pre_end = now()
        need({n: v["sha256"] for n, v in pre.items()} == baseline_artifacts, "Prebuild outputs are not the actual verified94 artifact set")
        old_build_id = safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip()
        need(old_build_id == baseline_proof["actualProductionBuildID"] == BASE_BUILD_ID, "Prebuild BUILD_ID differs from verified94")
        pre_presentation = presentation(app, pre, predecessor=True)
        need(capture(app, "all") == pre, "Prebuild outputs drifted during presentation capture")
        pre_end = now()
        write(output / "prebuild-observation.json", {"captureStartedAtUTC": pre_start, "captureFinishedAtUTC": pre_end, "buildID": old_build_id, "artifacts": pre, "presentation": pre_presentation, "runnerSHA256": approved_sha, "productionStageNotStarted": True})
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
                    markup = presentation(app, artifacts) if stage == "production_build" else None
                    capture_end = now()
                    observation = {"schemaVersion": "roadmark95.producer-output-observation.v1", "stage": stage, "command": argv, "processId": process.pid, "exitCode": exit_code, "producerStartedAtUTC": start, "producerFinishedAtUTC": finish, "captureStartedAtUTC": capture_start, "captureFinishedAtUTC": capture_end, "artifacts": artifacts, "presentation": markup}
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
            result = {"schemaVersion": "roadmark95.stage-receipt.v1", "processTerminal": ref(workspace, output / (stage + "-process-terminal.json")), "checkpoint": 95, "stage": stage, "startedAtUTC": start, "finishedAtUTC": finish, "durationNs": elapsed, "processId": process.pid, "command": argv, "cwd": str(app), "environmentOverrides": ENV, "requiredAbsentEnvironment": list(ABSENT_ENV), "exitCode": exit_code, "interrupted": error is not None, "inputDriftError": drift_error, "captureError": capture_error, "frozenInputManifestSHA256": sha(output / "frozen-inputs.json"), "frozenInputDigestBefore": before, "frozenInputDigestAfter": after, "log": ref(workspace, output / (stage + ".log")), "outputObservation": observations.get(stage)}
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
                    need(observation["presentation"] == pre_presentation, "Static production presentation changed beyond three reviewed market counts")
                else:
                    aliases = observation["artifacts"]
                    need(len({v["sha256"] for v in aliases.values()}) == 1 and len({v["bytes"] for v in aliases.values()}) == 1 and aliases["index.html"]["sha256"] != PORTABLE_SHA, "Portable aliases differ or market95 bytes were not emitted")
        produced = load(output / "production_build-outputs.json")["artifacts"]
        portable = load(output / "portable_build-outputs.json")["artifacts"]
        final = capture(app, "all")
        need(final == {**produced, **portable}, "Output drift after producer capture")
        check_configuration(workspace, config)
        need({n: metadata(safe(app, n)) for n in sorted(METADATA)} == initial_metadata, "Checkpoint metadata changed")
        need(sha(Path(__file__).resolve()) == approved_sha, "Runner changed during execution")
        evidence = {p.name: ref(workspace, p) for p in sorted(output.iterdir()) if p.is_file()}
        write(output / "run-result.json", {"schemaVersion": "roadmark95.serial-qa-result.v1", "passed": True, "checkpoint": 95, "finishedAtUTC": now(), "runnerSHA256": approved_sha, "configuration": config, "frozenInputDigest": fixed, "stageReceipts": receipts, "outputObservations": observations, "evidence": evidence, "artifactCount": len(final), "actualBuildID": safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip(), "baselineBuildID": old_build_id, "exclusiveWorkspaceConfirmedByRoot": True, "publicExportRun": False, "boundary": "Trusted root execution and selected filesystem observation, not signed attestation. Portable aliases, server/app, static and four build/routing manifests only; server/chunks and caches excluded. No browser, phone, public export, publication or release approval."})
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
    p.add_argument("--approved-runner-sha256", required=True)
    p.add_argument("--exclusive-workspace-confirmed", action="store_true", required=True)
    return p


def main():
    args = parser().parse_args()
    workspace = Path(args.workspace).resolve()
    need(HEX.fullmatch(args.approved_runner_sha256) and sha(Path(__file__).resolve()) == args.approved_runner_sha256, "External runner review pin mismatch")
    config = {"expectedInputs": {"path": args.expected_inputs, "sha256": args.expected_inputs_sha256}, "candidate": {"path": args.candidate_manifest, "sha256": args.candidate_manifest_sha256}}
    output = new_output(workspace, args.output)
    write(output / "execution-request.json", {"schemaVersion": "roadmark95.serial-qa-request.v1", "startedAtUTC": now(), "argv": sys.argv, "runnerSHA256": args.approved_runner_sha256, "configuration": config, "exclusiveWorkspaceConfirmedByRoot": args.exclusive_workspace_confirmed})
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
