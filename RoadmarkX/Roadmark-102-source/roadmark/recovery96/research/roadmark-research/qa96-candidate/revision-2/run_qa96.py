#!/usr/bin/env python3
"""Root-only serial QA; review and externally pin this file before execution."""
import argparse
import datetime as dt
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import sys
import time
import traceback

APP = "roadmark-work/roadmark"
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
PRODUCTION = (".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json")
METADATA = ("CHECKPOINT-PREVIEW-MANIFEST.json", "CHECKPOINT-SOURCE-MANIFEST.json", "OPEN-PORTABLE-PREVIEW.txt")
ENV = {"NODE_OPTIONS": "--max-old-space-size=1280 --max-semi-space-size=8", "NEXT_TELEMETRY_DISABLED": "1"}
REMOVE_ENV = ("SITE_STATIC_EXPORT", "NEXT_PUBLIC_SITE_URL", "NODE_ENV")
HEX = re.compile(r"[0-9a-f]{64}\Z")
SIGNALS = (signal.SIGINT, signal.SIGTERM, signal.SIGHUP)
STAGES = ("non_http_tests", "local_http_tests", "typecheck", "lint", "validation", "production_build", "portable_build")


def need(ok, message):
    if not ok:
        raise RuntimeError(message)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False).encode()).hexdigest()


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def relative(name):
    need(type(name) is str and name and not Path(name).is_absolute() and "\\" not in name and all(p not in {"", ".", ".."} for p in name.split("/")), "Unsafe relative path: " + str(name))
    return name


def safe(root, name):
    relative(name)
    parts = Path(name).parts
    need(not any(root.joinpath(*parts[:i]).is_symlink() for i in range(1, len(parts) + 1)), "Symlink rejected: " + name)
    return root / name


def file_info(path):
    before = path.stat()
    need(stat.S_ISREG(before.st_mode), "Not a regular file: " + str(path))
    result = {"sha256": sha(path), "bytes": before.st_size, "mtimeNs": before.st_mtime_ns}
    after = path.stat()
    fields = ("st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns")
    need(all(getattr(before, f) == getattr(after, f) for f in fields), "File changed while hashing: " + str(path))
    return result


def write(path, value):
    with path.open("x", encoding="utf-8") as target:
        json.dump(value, target, indent=2, sort_keys=True, allow_nan=False)
        target.write("\n")
        target.flush()
        os.fsync(target.fileno())


def load(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            need(key not in result, "Duplicate JSON key: " + key)
            result[key] = value
        return result
    def invalid(value):
        raise ValueError("Non-finite JSON: " + value)
    return json.loads(path.read_text(encoding="utf-8"), object_pairs_hook=unique, parse_constant=invalid)


def pinned(workspace, row):
    need(type(row["sha256"]) is str and HEX.fullmatch(row["sha256"]), "Invalid SHA256 pin")
    path = safe(workspace, row["path"])
    need(file_info(path)["sha256"] == row["sha256"], "Pinned file drift: " + row["path"])
    return path


def input_name(name):
    return not name.startswith(".next/") and name not in (*ALIASES, *METADATA, "tsconfig.tsbuildinfo") and not ({"node_modules", ".git"} & set(Path(name).parts))


def input_map(app):
    result = {}
    for folder, dirs, files in os.walk(app, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in {"node_modules", ".git"} and not (Path(folder) == app and d == ".next"))
        for child in dirs:
            safe(app, (Path(folder) / child).relative_to(app).as_posix())
        for child in sorted(files):
            name = (Path(folder) / child).relative_to(app).as_posix()
            if input_name(name):
                result[name] = file_info(safe(app, name))["sha256"]
    return result


def snapshot(app, names, optional=False):
    result = {}
    for name in names:
        path = safe(app, name)
        result[name] = None if optional and not path.exists() else file_info(path)
    return result


def commands(expected):
    http = "tests/local-review.test.ts"
    tests = sorted(n for n in expected if re.fullmatch(r"tests/.+\.test\.ts", n) and n != http)
    need(http in expected and tests, "Missing isolated local HTTP test or non-HTTP suite")
    test = ["node", "--import", "tsx", "--test", "--test-reporter=tap", "--test-concurrency=1"]
    return {
        "non_http_tests": [*test, *tests],
        "local_http_tests": [*test, http],
        "typecheck": ["node", "node_modules/typescript/bin/tsc", "--noEmit"],
        "lint": ["node", "node_modules/eslint/bin/eslint.js", "src", "tests", "scripts"],
        "validation": ["node", "--import", "tsx", "scripts/validate.ts"],
        "production_build": ["node", "node_modules/next/dist/bin/next", "build"],
        "portable_build": ["node", "--import", "tsx", "scripts/build-portable.ts"],
    }


def tap_summary(path):
    text = path.read_text(encoding="utf-8", errors="strict")
    result = {}
    for name in ("tests", "suites", "pass", "fail", "cancelled", "skipped", "todo"):
        matches = re.findall(r"^# " + name + r" (\d+)\r?$", text, re.M)
        need(len(matches) == 1, "Missing/ambiguous TAP terminal: " + name)
        result[name] = int(matches[0])
    need(result["tests"] > 0 and result["pass"] == result["tests"] and all(result[n] == 0 for n in ("fail", "cancelled", "skipped", "todo")), "TAP does not establish all tests passing")
    return result


class RunnerSignal(InterruptedError):
    def __init__(self, signum):
        self.signum = signum
        super().__init__("Runner received " + signal.Signals(signum).name)


def interrupted(signum, frame):
    # Permit cleanup/evidence writing after the first catchable interruption.
    for number in SIGNALS:
        signal.signal(number, signal.SIG_IGN)
    raise RunnerSignal(signum)


def error_info(error):
    return {"type": type(error).__name__, "message": str(error), "receivedSignal": getattr(error, "signum", None)}


def leader_identity(pid):
    # Linux stat fields after the last comm delimiter start with state (field 3).
    fields = Path("/proc", str(pid), "stat").read_text().rsplit(") ", 1)[1].split()
    return {"pid": pid, "processGroup": int(fields[2]), "session": int(fields[3]), "startTicks": int(fields[19])}


def cleanup_group(process, identity, receipt):
    cleanup = {"groupID": process.pid, "leaderIdentity": identity, "startedAtUTC": now(), "groupAbsent": False, "probes": [], "errors": [], "childWaitError": None}
    receipt["groupCleanup"] = cleanup

    def observe(phase, seconds):
        observation = {"phase": phase, "startedAtUTC": now(), "deadlineSeconds": seconds, "probeCount": 0, "groupPresent": None, "error": None}
        cleanup["probes"].append(observation)
        deadline = time.monotonic() + seconds
        try:
            while True:
                observation["probeCount"] += 1
                try:
                    os.killpg(process.pid, 0)
                    observation["groupPresent"] = True
                except ProcessLookupError:
                    observation["groupPresent"] = False
                    return True
                if time.monotonic() >= deadline:
                    return False
                time.sleep(min(0.1, max(0, deadline - time.monotonic())))
        except BaseException as error:
            observation["error"] = error_info(error)
            raise
        finally:
            observation["finishedAtUTC"] = now()

    def send_owned(number):
        # Never reap/poll before the final signal: the original leader PID,
        # including a zombie leader, keeps this group identity reserved.
        need(process.returncode is None and identity is not None, "Leader already reaped or original identity unavailable; group ownership is unestablished")
        need(identity["processGroup"] == identity["session"] == process.pid and leader_identity(process.pid) == identity, "Original owned process-group identity cannot be verified")
        try:
            os.killpg(process.pid, number)
            receipt["cleanupSignals"].append({"signal": number, "sentAtUTC": now(), "verifiedLeaderIdentity": identity})
        except ProcessLookupError:
            cleanup["groupAbsent"] = True

    try:
        if not observe("before_cleanup", 0):
            send_owned(signal.SIGTERM)
            # Do not mistake the direct child's death for group disappearance.
            # A retained zombie leader can conservatively consume this full wait.
            if not observe("after_sigterm_before_reap", 10):
                send_owned(signal.SIGKILL)
    except BaseException as error:
        cleanup["errors"].append(error_info(error))
    try:
        receipt["returnCode"] = process.wait(timeout=10)
    except BaseException as error:
        cleanup["childWaitError"] = error_info(error)
    try:
        # Read-only after reaping: never signal a possibly reused group ID.
        cleanup["groupAbsent"] = observe("after_final_signal_and_child_wait", 5)
    except BaseException as error:
        cleanup["errors"].append(error_info(error))
        cleanup["groupAbsent"] = False
    cleanup["finishedAtUTC"] = now()
    cleanup["established"] = cleanup["groupAbsent"] and not cleanup["errors"] and cleanup["childWaitError"] is None
    cleanup["manualCleanupMayBeNeeded"] = not cleanup["established"]


def execute(app, output, stage, argv, env):
    receipt = {"stage": stage, "command": argv, "cwd": str(app), "startedAtUTC": now(), "startedEpochNs": time.time_ns(), "processId": None, "spawnedAtUTC": None, "returnCode": None, "exitCode": None, "signal": None, "interrupted": False, "error": None, "cleanupSignals": [], "groupCleanup": None}
    write(output / (stage + "-start.json"), receipt)
    clock_start = time.monotonic_ns()
    process = None
    identity = None
    with (output / (stage + ".stdout.log")).open("xb") as stdout, (output / (stage + ".stderr.log")).open("xb") as stderr:
        try:
            process = subprocess.Popen(argv, cwd=app, env=env, stdin=subprocess.DEVNULL, stdout=stdout, stderr=stderr, start_new_session=True)
            receipt.update(processId=process.pid, spawnedAtUTC=now())
            identity = leader_identity(process.pid)
            need(identity["processGroup"] == identity["session"] == process.pid, "Child did not create the required owned session/group")
            receipt["returnCode"] = process.wait()
        except BaseException as error:
            receipt["error"] = error_info(error)
            receipt["interrupted"] = isinstance(error, (KeyboardInterrupt, InterruptedError))
            if process is not None:
                cleanup_group(process, identity, receipt)
    rc = receipt["returnCode"]
    receipt.update(finishedAtUTC=now(), finishedEpochNs=time.time_ns(), durationNs=time.monotonic_ns() - clock_start)
    receipt["exitCode"] = rc if rc is not None and rc >= 0 else None
    receipt["signal"] = {"number": -rc, "name": signal.Signals(-rc).name} if rc is not None and rc < 0 else None
    receipt["stdout"] = file_info(output / (stage + ".stdout.log"))
    receipt["stderr"] = file_info(output / (stage + ".stderr.log"))
    receipt["stdout"]["path"] = stage + ".stdout.log"
    receipt["stderr"]["path"] = stage + ".stderr.log"
    write(output / (stage + "-terminal.json"), receipt)
    return receipt


def run(workspace, output, config, runner_pin):
    app = safe(workspace, APP)
    need(app.is_dir(), "Missing application directory")
    lock = os.open(app, os.O_RDONLY | os.O_DIRECTORY)
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        baseline, expected, manifest = [load(pinned(workspace, config[k])) for k in ("baselineInputs", "expectedInputs", "candidate")]
        for source in (baseline, expected):
            need(type(source) is dict and source, "Input map must be a nonempty object")
            for name, pin in source.items():
                relative(name)
                need(input_name(name) and type(pin) is str and HEX.fullmatch(pin), "Malformed input-map entry: " + name)
        need(type(manifest) is dict and type(manifest.get("files")) is list and manifest["files"], "Missing candidate files")
        need(manifest.get("appRoot", APP) == APP, "Candidate targets another application")
        need(manifest.get("applicationRoot", str(app)) == str(app), "Candidate absolute application root differs")
        rows, derived = {}, dict(baseline)
        for row in manifest["files"]:
            name = relative(row["path"])
            need(name not in rows and input_name(name), "Duplicate/excluded candidate path: " + name)
            need(row["beforeSHA256"] == baseline.get(name), "Candidate baseline preimage mismatch: " + name)
            need(type(row["sha256"]) is str and HEX.fullmatch(row["sha256"]) and row["sha256"] != row["beforeSHA256"], "Invalid/unchanged candidate postimage")
            need(type(row["bytes"]) is int and row["bytes"] > 0, "Invalid candidate byte length")
            need(file_info(safe(app, name))["bytes"] == row["bytes"], "Candidate byte length mismatch: " + name)
            rows[name], derived[name] = row, row["sha256"]
        need(expected == derived, "Expected map is not precisely baseline plus reviewed candidate")
        frozen, historical = digest(expected), snapshot(app, METADATA, optional=True)

        def guard():
            need(file_info(Path(__file__).resolve())["sha256"] == runner_pin, "Runner changed")
            for row in config.values():
                pinned(workspace, row)
            actual = input_map(app)
            need(actual == expected, "Application source drift: " + json.dumps({"missing": sorted(set(expected) - set(actual)), "unexpected": sorted(set(actual) - set(expected)), "changed": sorted(n for n in set(actual) & set(expected) if actual[n] != expected[n])}))
            need(snapshot(app, METADATA, optional=True) == historical, "Historical checkpoint metadata drift")
            return digest(actual)

        guard()
        stage_commands = commands(expected)
        need(tuple(stage_commands) == STAGES, "Unexpected stage order")
        write(output / "stage-plan.json", {"serialOrder": list(STAGES), "commands": stage_commands, "testSelection": "Every frozen tests/**/*.test.ts path, sorted; local-review.test.ts is run only in the isolated second stage"})
        write(output / "frozen-inputs.json", expected)
        write(output / "protected-input-comparison.json", {"baseline": config["baselineInputs"], "expected": config["expectedInputs"], "candidate": config["candidate"], "baselineFileCount": len(baseline), "finalFileCount": len(expected), "protectedUnchangedInputs": {n: baseline[n] for n in sorted(set(baseline) - set(rows))}, "candidateDelta": rows, "deletedInputs": [], "historicalCheckpointMetadata": historical})
        old = snapshot(app, (*PRODUCTION, *ALIASES), optional=True)
        write(output / "preexisting-outputs.json", {"observedAtUTC": now(), "artifacts": old, "boundary": "Informational pre-run bytes, not independently verified predecessor output provenance"})
        env = {k: v for k, v in os.environ.items() if k not in REMOVE_ENV}
        env.update(ENV)
        receipts, produced = {}, {}
        for stage, argv in stage_commands.items():
            before = guard()
            print("START", stage, now(), flush=True)
            terminal = execute(app, output, stage, argv, env)
            result = {"stage": stage, "inputDigestBefore": before, "inputDigestAfter": None, "sourceError": None, "outputOrTestError": None, "terminal": stage + "-terminal.json", "terminalSHA256": sha(output / (stage + "-terminal.json")), "environmentOverrides": ENV, "removedEnvironmentNames": list(REMOVE_ENV), "passed": False}
            try:
                result["inputDigestAfter"] = guard()
            except BaseException as error:
                result["sourceError"] = error_info(error)
            try:
                if stage in {"non_http_tests", "local_http_tests"}:
                    result["testSummary"] = tap_summary(output / (stage + ".stdout.log"))
                if stage in {"production_build", "portable_build"}:
                    artifacts = snapshot(app, PRODUCTION if stage == "production_build" else ALIASES)
                    observation = {"stage": stage, "observedAtUTC": now(), "producerTerminalSHA256": result["terminalSHA256"], "artifacts": artifacts}
                    write(output / (stage + "-outputs.json"), observation)
                    result["outputObservation"] = stage + "-outputs.json"
                    # These must be written in the actual producer interval (2s filesystem tolerance).
                    need(all(terminal["startedEpochNs"] - 2_000_000_000 <= row["mtimeNs"] <= terminal["finishedEpochNs"] + 2_000_000_000 for row in artifacts.values()), "Output timestamp outside producer interval")
                    if stage == "production_build":
                        build_id = safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip()
                        need(build_id and (old[".next/BUILD_ID"] is None or artifacts[".next/BUILD_ID"]["sha256"] != old[".next/BUILD_ID"]["sha256"]), "BUILD_ID was not freshly emitted")
                        result["actualBuildID"] = build_id
                    else:
                        need(len({(r["sha256"], r["bytes"]) for r in artifacts.values()}) == 1, "Portable aliases are not byte-identical")
                    produced.update(artifacts)
            except BaseException as error:
                result["outputOrTestError"] = error_info(error)
            result["passed"] = terminal["returnCode"] == 0 and terminal["error"] is None and result["inputDigestAfter"] == before == frozen and result["sourceError"] is None and result["outputOrTestError"] is None
            write(output / (stage + ".json"), result)
            receipts[stage] = {"path": stage + ".json", "sha256": sha(output / (stage + ".json"))}
            print("END", stage, terminal["returnCode"], "PASS" if result["passed"] else "FAIL", flush=True)
            need(result["passed"], "Stage not established successful: " + stage)
        guard()
        need(snapshot(app, (*PRODUCTION, *ALIASES)) == produced, "Producer outputs drifted before final capture")
        return {"passed": True, "frozenInputDigest": frozen, "stageReceipts": receipts, "artifacts": produced, "actualBuildID": safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip()}
    finally:
        os.close(lock)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("workspace", "output", "baseline-inputs", "baseline-inputs-sha256", "expected-inputs", "expected-inputs-sha256", "candidate-manifest", "candidate-manifest-sha256", "approved-runner-sha256"):
        parser.add_argument("--" + name, required=True)
    parser.add_argument("--exclusive-workspace-confirmed", action="store_true", required=True)
    args = parser.parse_args()
    workspace = Path(args.workspace).resolve()
    runner = Path(__file__).resolve()
    need(runner.is_relative_to(workspace) and not runner.is_relative_to(workspace / APP), "Runner must be external to app and inside workspace")
    need(HEX.fullmatch(args.approved_runner_sha256) and file_info(runner)["sha256"] == args.approved_runner_sha256, "External runner review pin mismatch")
    output = safe(workspace, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(workspace / APP), "Use a new external output directory with an existing parent")
    output.mkdir()  # Atomic exclusivity: never reuse or erase an attempt.
    config = {key: {"path": getattr(args, attr), "sha256": getattr(args, attr + "_sha256")} for key, attr in (("baselineInputs", "baseline_inputs"), ("expectedInputs", "expected_inputs"), ("candidate", "candidate_manifest"))}
    started = now()
    write(output / "execution-request.json", {"schema": "roadmark96.serial-qa.v1", "startedAtUTC": started, "argv": sys.argv, "runnerSHA256": args.approved_runner_sha256, "configuration": config, "exclusiveWorkspaceConfirmedByRoot": True, "environmentOverrides": ENV, "removedInheritedEnvironmentNames": [k for k in REMOVE_ENV if k in os.environ]})
    for number in SIGNALS:
        signal.signal(number, interrupted)
    code = 1
    try:
        result = run(workspace, output, config, args.approved_runner_sha256)
        code = 0
    except BaseException as error:
        result = {"passed": False, "error": error_info(error), "traceback": traceback.format_exc(), "successNotEstablished": True}
        code = 128 + error.signum if isinstance(error, RunnerSignal) else 1
    result.update(schema="roadmark96.serial-qa.v1", startedAtUTC=started, finishedAtUTC=now(), runnerSHA256=args.approved_runner_sha256, configuration=config, publicExportRun=False, boundary="Trusted serial process evidence, not signed attestation. Inputs exclude dependencies/VCS, .next, four aliases, tsconfig.tsbuildinfo and separately guarded historical metadata. Output observation covers only four build identity/routing files and four aliases; no hydration, route/visual equivalence, full emitted graph, publication or release approval. Root must also observe this runner's actual external exit.")
    result["stageStatus"] = {}
    for stage in STAGES:
        receipt = output / (stage + ".json")
        result["stageStatus"][stage] = ("passed" if load(receipt)["passed"] else "failed") if receipt.is_file() else ("incomplete" if (output / (stage + "-start.json")).exists() else "not_started")
    result["evidence"] = {p.name: file_info(p) for p in sorted(output.iterdir()) if p.is_file()}
    write(output / "run-result.json", result)
    print("QA96_COMPLETE" if result["passed"] else "QA96_FAILED", flush=True)
    return code


if __name__ == "__main__":
    sys.exit(main())
