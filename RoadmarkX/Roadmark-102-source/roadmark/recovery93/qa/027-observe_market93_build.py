#!/usr/bin/env python3
"""ROOT ONLY: observe existing serial QA; never run/edit the app or QA runner.

Use the exact trusted root prebuild snapshot. Start before production finishes,
then poll two real stage receipts and bind outputs after each in a new directory.
This is a trusted root observation, not a signed attestation or browser proof.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
import traceback

APP = "roadmark-work/roadmark"
QA = "roadmark-research/applied93/qa"
RUNNER = "roadmark-research/applied93/root-scripts/run-qa93.py"
RUNNER_SHA = "aaf08718b3b0d8d4136eb1ca3d06f1f5498bf67ae399184b250371d9addc23d8"
PRE = "roadmark-research/applied93/prebuild-artifact-observation.json"
PRE_SHA = "bf829f1b96b6113d9a0641faa0c5688d8bea006e3da0d34436c59425fefb76cf"
FROZEN_SHA = "e8161ffb02c560a482c4dbf4fbde2fd3d908a0cd8e9f47585e092fc22411d5ad"
BASE_PINS = "roadmark-research/restored92-application/final-artifact-pins.json"
BASE_SHA = "119f91c251db5338245c6004f936abdcdd7eeb0c1a9c6794ca33c2797dc24967"
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
CORE_PRODUCTION = (".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json", ".next/server/app/market.html", ".next/server/app/market/page.js", ".next/server/app/market/page/app-paths-manifest.json")


def need(value, reason):
    if not value:
        raise AssertionError(reason)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def sha(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(chunk)
    return result.hexdigest()


def load(path):
    def unique(pairs):
        value = {}
        for key, part in pairs:
            need(key not in value, "Duplicate JSON key")
            value[key] = part
        return value
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique)


def write(path, value):
    with path.open("x", encoding="utf-8") as stream:
        json.dump(value, stream, indent=2, sort_keys=True, allow_nan=False)
        stream.write("\n")


def file(root, rel):
    need(isinstance(rel, str) and rel and not Path(rel).is_absolute() and "\\" not in rel and all(p not in {"", ".", ".."} for p in rel.split("/")), "Unsafe relative path")
    path = root / rel
    need(path.is_file() and not any(root.joinpath(*Path(rel).parts[:i]).is_symlink() for i in range(1, len(Path(rel).parts) + 1)), "Missing/symlink file: " + rel)
    return path


def metadata(path):
    before = path.stat()
    result = {"sha256": sha(path), "bytes": before.st_size, "mtimeNs": before.st_mtime_ns}
    after = path.stat()
    need((before.st_size, before.st_mtime_ns, before.st_ino) == (after.st_size, after.st_mtime_ns, after.st_ino), "File changed while hashing: " + str(path))
    return result


def generated(name):
    return name in ALIASES or name in {".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json"} or name.startswith((".next/server/app/", ".next/static/"))


def capture(app, portable=False, all_outputs=False):
    result = {}
    if portable:
        names = ALIASES
    else:
        names = []
        for directory, children, filenames in os.walk(app, followlinks=False):
            children[:] = [name for name in children if name not in {"node_modules", ".git"}]
            for name in filenames:
                rel = (Path(directory) / name).relative_to(app).as_posix()
                if generated(rel) and (all_outputs or rel not in ALIASES):
                    names.append(rel)
    for name in sorted(names):
        result[name] = metadata(file(app, name))
    return result


def stamp(value):
    result = dt.datetime.fromisoformat(value.replace("Z", "+00:00"))
    need(result.tzinfo is not None, "Timestamp timezone missing")
    return result.timestamp()


def wait_receipt(workspace, stage, frozen_digest):
    path = workspace / QA / (stage + ".json")
    while not path.exists():
        time.sleep(2)
    # The active runner writes once but without rename; allow a bounded partial
    # JSON write to finish, never reinterpret a complete failed receipt.
    deadline = time.monotonic() + 5
    while True:
        try:
            value = load(path)
            break
        except json.JSONDecodeError:
            need(time.monotonic() < deadline, "Stage receipt remained incomplete")
            time.sleep(0.1)
    command = {"production_build": ["node", "node_modules/next/dist/bin/next", "build"], "portable_build": ["node", "--import", "tsx", "scripts/build-portable.ts"]}[stage]
    need(value["schema"] == "roadmark-stage93-receipt-v1" and type(value["checkpoint"]) is int and value["checkpoint"] == 93 and value["stage"] == stage, "Wrong stage/checkpoint receipt")
    need(type(value["exitCode"]) is int and value["exitCode"] == 0, "Observed unsuccessful build: " + stage)
    need(value["command"] == command and Path(value["cwd"]).resolve() == workspace / APP, "Wrong producer command/cwd")
    need(value["frozenInputManifestSHA256"] == FROZEN_SHA and value["frozenInputDigestBefore"] == value["frozenInputDigestAfter"] == frozen_digest, "Producer input binding mismatch")
    need(stamp(value["startedAtUTC"]) <= stamp(value["finishedAtUTC"]) <= stamp(now()), "Bad producer timestamps")
    log = value["log"]
    need(log["path"] == QA + "/" + stage + ".log", "Wrong producer log attempt")
    log_file = file(workspace, log["path"])
    need(metadata(log_file) == {"sha256": log["sha256"], "bytes": log["bytes"], "mtimeNs": log_file.stat().st_mtime_ns}, "Producer log pin mismatch")
    return value, {"path": path.relative_to(workspace).as_posix(), "sha256": sha(path), "log": log, "observedAtUTC": now()}


def stage_mtimes(outputs, required, receipt):
    # Same-host UTC timestamps; a two-second allowance covers filesystem/date
    # precision, not arbitrary old artifacts. Cached .next/static is excluded.
    low = stamp(receipt["startedAtUTC"]) - 2
    high = stamp(receipt["finishedAtUTC"]) + 2
    for name in required:
        need(name in outputs and low <= outputs[name]["mtimeNs"] / 1e9 <= high, "Core output mtime outside producer interval: " + name)


def observe(workspace, output, approved_sha):
    app, qa = workspace / APP, workspace / QA
    for name, pin in ((RUNNER, RUNNER_SHA), (PRE, PRE_SHA), (BASE_PINS, BASE_SHA), (QA + "/frozen-inputs.json", FROZEN_SHA)):
        need(sha(file(workspace, name)) == pin, "Pinned observer prerequisite changed: " + name)
    pre = load(workspace / PRE)
    base = load(workspace / BASE_PINS)
    frozen = load(qa / "frozen-inputs.json")
    frozen_digest = hashlib.sha256(json.dumps(frozen, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    need(pre["productionStageNotStarted"] is True and pre["runnerSHA256"] == RUNNER_SHA and len(pre["artifacts"]) == 2463, "Wrong trusted root pre-observation")
    need(set(pre["artifacts"]) == set(base) | {".next/server/app-paths-manifest.json"}, "Pre-observation output scope differs")
    need(all(pre["artifacts"][name]["sha256"] == pin for name, pin in base.items()), "Pre-observation is not exact verified92 outputs")
    need(not (qa / "production_build.json").exists(), "Too late: observer must start before production terminal receipt")
    initial = pre["artifacts"]
    start = {"schemaVersion": "roadmark.market93-build-observer-start.v1", "startedAtUTC": now(), "prebuildObservation": {"path": PRE, "sha256": PRE_SHA}, "runner": {"path": RUNNER, "sha256": RUNNER_SHA}, "observerSHA256": approved_sha, "argv": sys.argv, "frozenInputManifestSHA256": FROZEN_SHA, "productionAlreadyRunningAtObserverStart": (qa / "production_build.log").exists(), "productionTerminalAbsentAtObserverStart": True, "startMode": "pinned-trusted-root-prebuild-capture", "initialBuildID": pre["buildID"], "initialOutputCount": len(initial)}
    need(not (qa / "production_build.json").exists(), "Production completed before observer start was established")
    write(output / "observer-start.json", start)
    production, production_ref = wait_receipt(workspace, "production_build", frozen_digest)
    need(stamp(pre["observedAtUTC"]) <= stamp(production["startedAtUTC"]) and stamp(pre["observedAtUTC"]) <= stamp(start["startedAtUTC"]) <= stamp(production["finishedAtUTC"]), "Trusted pre-observation or observer-start timing does not bind this production stage")
    production_capture_start = now()
    produced = capture(app)
    production_capture_end = now()
    stage_mtimes(produced, CORE_PRODUCTION, production)
    need(produced[".next/BUILD_ID"]["sha256"] != initial[".next/BUILD_ID"]["sha256"], "Production BUILD_ID did not change")
    write(output / "production-artifacts.json", produced)
    write(output / "production-observation.json", {"schemaVersion": "roadmark.market93-production-observation.v1", "receipt": production_ref, "captureStartedAtUTC": production_capture_start, "captureFinishedAtUTC": production_capture_end, "artifactMapSHA256": sha(output / "production-artifacts.json"), "coreProducerMtimesWithinStage": True, "mtimeAllowanceSeconds": 2})
    portable, portable_ref = wait_receipt(workspace, "portable_build", frozen_digest)
    need(stamp(production["finishedAtUTC"]) <= stamp(portable["startedAtUTC"]), "Build stages are not serial")
    portable_capture_start = now()
    aliases = capture(app, portable=True)
    portable_capture_end = now()
    stage_mtimes(aliases, ALIASES, portable)
    need(len({row["sha256"] for row in aliases.values()}) == 1 and aliases["index.html"]["sha256"] != initial["index.html"]["sha256"], "Aliases differ or retain old92 bytes")
    write(output / "portable-artifacts.json", aliases)
    final = capture(app, all_outputs=True)
    need(final == {**produced, **aliases}, "Generated outputs drifted after capture")
    for ref in (production_ref, portable_ref):
        need(sha(file(workspace, ref["path"])) == ref["sha256"] and sha(file(workspace, ref["log"]["path"])) == ref["log"]["sha256"], "Producer evidence drifted")
    need(sha(file(workspace, RUNNER)) == RUNNER_SHA and sha(file(workspace, PRE)) == PRE_SHA and sha(file(workspace, QA + "/frozen-inputs.json")) == FROZEN_SHA and sha(Path(__file__).resolve()) == approved_sha, "Observer prerequisite drifted")
    write(output / "build-output-binding.json", {"schemaVersion": "roadmark.market93-root-build-output-binding.v1", "passed": True, "checkpoint": 93, "finishedAtUTC": now(), "observerSHA256": approved_sha, "observerStartSHA256": sha(output / "observer-start.json"), "prebuildObservationSHA256": PRE_SHA, "runnerSHA256": RUNNER_SHA, "frozenInputManifestSHA256": FROZEN_SHA, "productionReceipt": production_ref, "portableReceipt": portable_ref, "productionArtifactMapSHA256": sha(output / "production-artifacts.json"), "productionObservationSHA256": sha(output / "production-observation.json"), "portableArtifactMapSHA256": sha(output / "portable-artifacts.json"), "portableCaptureStartedAtUTC": portable_capture_start, "portableCaptureFinishedAtUTC": portable_capture_end, "artifactCount": len(final), "coreProducerMtimesWithinStages": True, "mtimeAllowanceSeconds": 2, "boundary": "Trusted root prebuild/postreceipt filesystem observation tied to exact QA producer commands and frozen inputs. Not a signed attestation, browser/runtime proof, deployment or release approval."})
    print("PASS: genuine93 build output observation completed", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--approved-observer-sha256", required=True)
    args = parser.parse_args()
    workspace = Path(args.workspace).resolve()
    need(re.fullmatch(r"[a-f0-9]{64}", args.approved_observer_sha256) and sha(Path(__file__).resolve()) == args.approved_observer_sha256, "Observer review pin mismatch")
    need(args.output and not Path(args.output).is_absolute() and "\\" not in args.output and all(p not in {"", ".", ".."} for p in args.output.split("/")), "Unsafe output path")
    output = workspace / args.output
    need(output.parent.is_dir() and not output.exists() and output.parent.resolve() == output.parent and not output.resolve().is_relative_to(workspace / APP), "Use new external evidence directory with nonsymlink parents")
    output.mkdir()
    write(output / "execution-request.json", {"startedAtUTC": now(), "argv": sys.argv, "observerSHA256": args.approved_observer_sha256})
    try:
        observe(workspace, output, args.approved_observer_sha256)
    except BaseException as error:
        write(output / "failure.json", {"passed": False, "error": str(error), "errorType": type(error).__name__, "atUTC": now(), "traceback": traceback.format_exc()})
        raise


if __name__ == "__main__":
    main()
