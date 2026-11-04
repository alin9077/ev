#!/usr/bin/env python3
"""ROOT ONLY: launch the reviewed QA95 runner and retain its actual exit."""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import signal
import subprocess
import sys
import time


def need(value, reason):
    if not value:
        raise AssertionError(reason)


def sha(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("workspace", "runner", "approved-runner-sha256", "approved-launcher-sha256", "output", "expected-inputs", "expected-inputs-sha256", "candidate-manifest", "candidate-manifest-sha256"):
        p.add_argument("--" + name, required=True)
    p.add_argument("--exclusive-workspace-confirmed", action="store_true", required=True)
    args = p.parse_args()
    workspace = Path(args.workspace).resolve()
    runner = Path(args.runner).resolve()
    launcher = Path(__file__).resolve()
    app = workspace / "roadmark-work/roadmark"
    for path, pin in ((runner, args.approved_runner_sha256), (launcher, args.approved_launcher_sha256)):
        need(path.is_relative_to(workspace) and not path.is_relative_to(app) and re.fullmatch(r"[0-9a-f]{64}", pin) and sha(path) == pin, "External tool pin/path mismatch")
    need(args.output and not Path(args.output).is_absolute() and "\\" not in args.output and all(part not in {"", ".", ".."} for part in args.output.split("/")), "Unsafe attempt path")
    output = workspace / args.output
    need(not output.resolve().is_relative_to(app), "QA attempt must be outside app")
    need(output.parent.is_dir() and not any(workspace.joinpath(*Path(args.output).parts[:i]).is_symlink() for i in range(1, len(Path(args.output).parts) + 1)), "Missing/symlinked attempt parent")
    log = output.with_name(output.name + "-launch.log")
    terminal = output.with_name(output.name + "-terminal.json")
    need(all(not path.exists() and not path.is_symlink() for path in (output, log, terminal)), "Use entirely new QA attempt/log/terminal paths")
    argv = [sys.executable, "-B", str(runner)]
    for name in ("workspace", "output", "expected-inputs", "expected-inputs-sha256", "candidate-manifest", "candidate-manifest-sha256", "approved-runner-sha256"):
        argv += ["--" + name, str(workspace) if name == "workspace" else getattr(args, name.replace("-", "_"))]
    argv += ["--exclusive-workspace-confirmed"]
    def terminated(signum, frame):
        raise InterruptedError("Root launcher received signal " + str(signum))
    signal.signal(signal.SIGTERM, terminated)
    started, clock_start = now(), time.monotonic_ns()
    process, error, exit_code = None, None, None
    print("ROOT_QA95_START", started, flush=True)
    with log.open("xb") as target:
        try:
            process = subprocess.Popen(argv, cwd=workspace, stdout=target, stderr=subprocess.STDOUT, start_new_session=True)
            exit_code = process.wait()
        except BaseException as caught:
            error = {"type": type(caught).__name__, "message": str(caught)}
            if process is not None:
                try:
                    os.killpg(process.pid, signal.SIGTERM)
                except ProcessLookupError:
                    pass
                # The reviewed runner owns cleanup of its stage process group.
                # Wait rather than kill the runner before it records that cleanup.
                exit_code = process.wait()
    finished, elapsed = now(), time.monotonic_ns() - clock_start
    result = output / "run-result.json"
    value = {"schemaVersion": "roadmark95.root-qa-terminal.v1", "checkpoint": 95, "command": argv, "cwd": str(workspace), "launcherPath": launcher.relative_to(workspace).as_posix(), "launcherSHA256": args.approved_launcher_sha256, "launcherArgv": sys.argv, "runnerSHA256": args.approved_runner_sha256, "startedAtUTC": started, "finishedAtUTC": finished, "durationNs": elapsed, "processId": process.pid if process is not None else None, "exitCode": exit_code, "interruptionOrLaunchError": error, "runResultSHA256": sha(result) if result.is_file() else None, "log": {"path": log.relative_to(workspace).as_posix(), "sha256": sha(log), "bytes": log.stat().st_size}}
    with terminal.open("x", encoding="utf-8") as target:
        json.dump(value, target, sort_keys=True, indent=2, allow_nan=False)
        target.write("\n")
    need(sha(runner) == args.approved_runner_sha256 and sha(launcher) == args.approved_launcher_sha256, "Tool changed during root run")
    print(json.dumps(value, sort_keys=True), flush=True)
    sys.exit(exit_code if type(exit_code) is int and exit_code != 0 else (1 if error else 0))


if __name__ == "__main__":
    main()
