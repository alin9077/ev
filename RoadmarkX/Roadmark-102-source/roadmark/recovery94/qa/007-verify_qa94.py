#!/usr/bin/env python3
"""ROOT ONLY: read-only bounded checkpoint94 proof; never imports app code.

Imports only the externally pinned reviewed runner as a standard-library helper.
Requires the actual successful runner result SHA supplied by root after execution.
Writes a fresh external evidence directory; never overwrites previous attempts.
"""
import argparse
import importlib.util
import hashlib
import json
from pathlib import Path
import re
import sys
import traceback


def bootstrap_sha(path):
    with path.open("rb") as f:
        h = hashlib.sha256()
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
        return h.hexdigest()


def run(r, workspace, qa, output, args):
    evidence = {}
    def remember(path, pin=None):
        value = r.ref(workspace, path)
        r.need(pin is None or value["sha256"] == pin, "Evidence pin mismatch: " + str(path))
        evidence[value["path"]] = value
        return value
    def read_ref(value):
        r.need(type(value) is dict and set(value) == {"path", "sha256", "bytes"}, "Malformed evidence reference")
        path = r.safe(workspace, value["path"])
        r.need(remember(path, value["sha256"]) == value, "Evidence bytes differ")
        return r.load(path)
    result_path = qa / "run-result.json"
    remember(result_path, args.run_result_sha256)
    result = r.load(result_path)
    r.need(result["schemaVersion"] == "roadmark94.serial-qa-result.v1" and result["passed"] is True and type(result["checkpoint"]) is int and result["checkpoint"] == 94, "No successful actual94 runner result")
    r.need(not (qa / "failure.json").exists(), "Failed QA attempt cannot pass")
    r.need(result["runnerSHA256"] == args.approved_runner_sha256 and result["exclusiveWorkspaceConfirmedByRoot"] is True and result["publicExportRun"] is False, "Wrong root execution boundary")
    r.need(type(result["evidence"]) is dict, "Missing actual runner evidence map")
    for name, value in result["evidence"].items():
        r.need(value["path"] == (qa / name).relative_to(workspace).as_posix() and "/" not in name, "Evidence from wrong attempt")
        path = r.safe(workspace, value["path"])
        r.need(remember(path, value["sha256"]) == value, "QA evidence drift")
    required = {"execution-request.json", "frozen-inputs.json", "freeze-receipt.json", "prebuild-observation.json", "production_build-outputs.json", "portable_build-outputs.json"} | {s + suffix for s in r.STAGES for suffix in (".json", ".log", "-process-terminal.json")}
    r.need(set(result["evidence"]) == required and {p.name for p in qa.iterdir()} == required | {"run-result.json"}, "Missing/extra files in successful QA attempt")
    request = r.load(qa / "execution-request.json")
    config = result["configuration"]
    expected, fixed, changes, baseline_artifacts, baseline_proof = r.check_configuration(workspace, config)
    for name, pin in ((r.BASE_INPUT, r.BASE_INPUT_SHA), (r.BASE_PROOF, r.BASE_PROOF_SHA), (r.BASE_ARTIFACTS, r.BASE_ARTIFACTS_SHA), (r.BASE_HTML, r.PORTABLE_SHA)):
        remember(r.safe(workspace, name), pin)
    for item in [config["expectedInputs"], config["candidate"], *config["revisions"]]:
        remember(r.safe(workspace, item["path"]), item["sha256"])
    remember(Path(args.runner).resolve(), args.approved_runner_sha256)
    remember(Path(__file__).resolve(), args.approved_verifier_sha256)
    r.need(request["schemaVersion"] == "roadmark94.serial-qa-request.v1" and request["configuration"] == config and request["runnerSHA256"] == args.approved_runner_sha256 and request["exclusiveWorkspaceConfirmedByRoot"] is True, "Runner request differs")
    # Reparse real saved argv with the reviewed parser. Do not execute main/run.
    saved = r.parser().parse_args(request["argv"][1:])
    r.need(Path(request["argv"][0]).resolve() == Path(args.runner).resolve() and Path(saved.workspace).resolve() == workspace and workspace / saved.output == qa and saved.approved_runner_sha256 == args.approved_runner_sha256 and saved.exclusive_workspace_confirmed, "Wrong actual runner argv/workspace/attempt")
    actual_config = {"expectedInputs": {"path": saved.expected_inputs, "sha256": saved.expected_inputs_sha256}, "candidate": {"path": saved.candidate_manifest, "sha256": saved.candidate_manifest_sha256}, "revisions": [{"path": n, "sha256": h} for n, h in saved.revision]}
    r.need(actual_config == config, "Runner argv differs from pinned manifest configuration")
    freeze = r.load(qa / "freeze-receipt.json")
    r.need(r.load(qa / "frozen-inputs.json") == expected and freeze["frozenInputManifestSHA256"] == r.sha(qa / "frozen-inputs.json") and freeze["canonicalDigest"] == result["frozenInputDigest"] == fixed and freeze["fileCount"] == 1655 and freeze["changedOrAddedFiles"] == changes and freeze["approvedInputMap"] == config["expectedInputs"], "Wrong frozen input proof")
    app = workspace / r.APP
    r.need(freeze["checkpointMetadata"] == {n: r.metadata(r.safe(app, n)) for n in sorted(r.METADATA)}, "Historical metadata changed")
    pre = r.load(qa / "prebuild-observation.json")
    r.need(pre["runnerSHA256"] == args.approved_runner_sha256 and pre["productionStageNotStarted"] is True and {n: v["sha256"] for n, v in pre["artifacts"].items()} == baseline_artifacts, "Actual prebuild capture differs from93")
    r.need(pre["buildID"] == result["baselineBuildID"] == baseline_proof["actual93ProductionBuildID"], "Prebuild identity differs")
    r.need(r.stamp(request["startedAtUTC"]) <= r.stamp(freeze["atUTC"]) <= r.stamp(pre["captureStartedAtUTC"]) <= r.stamp(pre["captureFinishedAtUTC"]), "Invalid prebuild chronology")
    previous_end = r.stamp(pre["captureFinishedAtUTC"])
    r.need(set(result["stageReceipts"]) == set(r.STAGES) and set(result["outputObservations"]) == {"production_build", "portable_build"}, "Wrong stage coverage")
    summaries, captured = {}, {}
    for stage, argv in r.commands(expected).items():
        receipt = read_ref(result["stageReceipts"][stage])
        r.need(result["stageReceipts"][stage]["path"] == (qa / (stage + ".json")).relative_to(workspace).as_posix(), "Receipt from wrong attempt")
        r.need(receipt["schemaVersion"] == "roadmark94.stage-receipt.v1" and receipt["checkpoint"] == 94 and receipt["stage"] == stage and receipt["command"] == argv and Path(receipt["cwd"]) == app, "Wrong actual QA command/cwd")
        r.need(type(receipt["exitCode"]) is int and receipt["exitCode"] == 0 and receipt["interrupted"] is False and receipt["inputDriftError"] is None and receipt["captureError"] is None, "Failed/interrupted/drifted stage or output capture")
        r.need(receipt["frozenInputManifestSHA256"] == freeze["frozenInputManifestSHA256"] and receipt["frozenInputDigestBefore"] == receipt["frozenInputDigestAfter"] == fixed and receipt["environmentOverrides"] == r.ENV and receipt["requiredAbsentEnvironment"] == list(r.ABSENT_ENV), "Input/environment binding differs")
        start, end = r.stamp(receipt["startedAtUTC"]), r.stamp(receipt["finishedAtUTC"])
        r.need(previous_end <= start <= end <= r.stamp(r.now()) and type(receipt["durationNs"]) is int and receipt["durationNs"] > 0 and type(receipt["processId"]) is int and receipt["processId"] > 0, "Invalid/nonserial execution times/PID")
        previous_end = end
        terminal = read_ref(receipt["processTerminal"])
        r.need(receipt["processTerminal"]["path"] == (qa / (stage + "-process-terminal.json")).relative_to(workspace).as_posix(), "Wrong process terminal attempt")
        r.need(terminal == {k: receipt[k] for k in ("stage", "command", "cwd", "processId", "startedAtUTC", "finishedAtUTC", "durationNs", "exitCode", "interrupted", "log")}, "Receipt differs from actual saved process terminal")
        log_ref = receipt["log"]
        r.need(log_ref["path"] == (qa / (stage + ".log")).relative_to(workspace).as_posix() and remember(r.safe(workspace, log_ref["path"]), log_ref["sha256"]) == log_ref, "Actual log differs")
        text = r.safe(workspace, log_ref["path"]).read_text(encoding="utf-8")
        summary = {"exitCode": 0, "startedAtUTC": receipt["startedAtUTC"], "finishedAtUTC": receipt["finishedAtUTC"]}
        if stage in {"non_http_tests", "local_http_tests"}:
            tallies = {}
            for field in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
                matches = re.findall(r"^(?:#|ℹ) " + field + r" (\d+)\s*$", text, re.M)
                r.need(len(matches) == 1, "Missing/ambiguous complete test tally")
                tallies[field] = int(matches[0])
            r.need(tallies["tests"] == tallies["pass"] == (820 if stage == "non_http_tests" else 1) and all(tallies[n] == 0 for n in ("fail", "cancelled", "skipped", "todo")), "Incorrect complete suite tally")
            summary["tallies"] = tallies
        if stage == "validation":
            r.need(r.load(qa / (stage + ".log")) == baseline_proof["qa"]["validation"]["validation"], "Actual validation differs from93 PASS/count/source result")
        if stage == "production_build":
            r.need(re.search(r"Generating static pages[^\n]*\(389/389\)", text) and re.search(r"(?:○|●)\s+/market(?:\s|$)", text), "Missing normal production terminal")
        if stage == "portable_build":
            r.need("Portable Roadmark experience written (" in text and "index.html and index-b.html retain the Model Y hero above discovery" in text, "Missing portable terminal")
        if stage in result["outputObservations"]:
            value = result["outputObservations"][stage]
            r.need(receipt["outputObservation"] == value and value["path"] == (qa / (stage + "-outputs.json")).relative_to(workspace).as_posix(), "Observation not bound to producer receipt")
            obs = read_ref(value)
            r.need(obs["schemaVersion"] == "roadmark94.producer-output-observation.v1" and obs["stage"] == stage and obs["command"] == argv and obs["processId"] == receipt["processId"] and obs["exitCode"] == 0 and obs["producerStartedAtUTC"] == receipt["startedAtUTC"] and obs["producerFinishedAtUTC"] == receipt["finishedAtUTC"], "Observation producer differs")
            r.need(end <= r.stamp(obs["captureStartedAtUTC"]) <= r.stamp(obs["captureFinishedAtUTC"]), "Post-terminal capture chronology differs")
            previous_end = r.stamp(obs["captureFinishedAtUTC"])
            r.stage_mtimes(obs["artifacts"], r.CORE if stage == "production_build" else r.ALIASES, receipt)
            captured[stage] = obs["artifacts"]
        else:
            r.need(receipt["outputObservation"] is None, "Unexpected output observation")
        summaries[stage] = summary
    produced, aliases = captured["production_build"], captured["portable_build"]
    r.need(set(aliases) == set(r.ALIASES) and not set(produced) & set(aliases), "Observation scopes differ")
    current = r.capture(app, "all")
    r.need(current == {**produced, **aliases} and len(current) == result["artifactCount"], "Output metadata/membership drift after actual captures")
    r.need(all(v["sha256"] == r.PORTABLE_SHA and v["bytes"] == r.PORTABLE_BYTES for v in aliases.values()), "Portable aliases are not saved93 byte identity")
    build_id = r.safe(app, ".next/BUILD_ID").read_text(encoding="utf-8").strip()
    r.need(build_id == result["actualBuildID"] and build_id != pre["buildID"] and produced[".next/BUILD_ID"]["sha256"] != pre["artifacts"][".next/BUILD_ID"]["sha256"], "No fresh actual production BUILD_ID")
    for name in (".next/routes-manifest.json", ".next/server/app-paths-manifest.json"):
        r.need(produced[name]["sha256"] == baseline_artifacts[name], "Production routing changed")
    old_pages = {n for n in baseline_artifacts if n.startswith(".next/server/app/") and n.endswith(".html")}
    pages = {n for n in produced if n.startswith(".next/server/app/") and n.endswith(".html")}
    r.need(pages == old_pages and len([n for n in pages if n.startswith(".next/server/app/cars/")]) == 343, "Production page membership changed")
    prerender = r.load(r.safe(app, ".next/prerender-manifest.json"))
    detail_routes = {n[len(".next/server/app"):-len(".html")] for n in pages if n.startswith(".next/server/app/cars/")}
    r.need(prerender["version"] == 4 and {n for n in prerender["routes"] if n.startswith("/cars/")} == detail_routes, "Production detail routes differ")
    for name in detail_routes | {"/market"}:
        row = prerender["routes"][name]
        r.need(row["routeType"] == "page" and row["compute"] == "static" and row["response"] == "complete" and row["initialRevalidateSeconds"] is False, "Incomplete/nonstatic actual production route")
    r.need(previous_end <= r.stamp(result["finishedAtUTC"]) <= r.stamp(r.now()), "Final runner result chronology differs")
    r.check_configuration(workspace, config)
    r.need(r.capture(app, "all") == current, "Generated outputs changed during proof")
    for name, value in evidence.items():
        r.need(r.ref(workspace, r.safe(workspace, name)) == value, "Evidence changed during proof")
    r.write(output / "evidence-pins.json", evidence)
    r.write(output / "artifact-pins.json", {n: v["sha256"] for n, v in current.items()})
    r.write(output / "proof.json", {"schemaVersion": "roadmark94.bounded-emitted-proof.v1", "passed": True, "checkpoint": 94, "baselineCheckpoint": 93, "checkedAtUTC": r.now(), "verifierSHA256": args.approved_verifier_sha256, "runnerSHA256": args.approved_runner_sha256, "runResultSHA256": args.run_result_sha256, "configuration": config, "frozenInputCount": 1655, "protectedOldInputsUnchanged": 1649, "reviewedDocumentationChanges": 1, "reviewedAdditions": 5, "allNongeneratedInputsManifested": True, "registersUnchangedAndEmpty": True, "noNewCLIModuleReferencesInProtectedRuntimeBuildSources": True, "actualProductionBuildID": build_id, "baselineProductionBuildID": pre["buildID"], "portableSHA256": r.PORTABLE_SHA, "portableBytes": r.PORTABLE_BYTES, "fourPortableAliasesByteIdenticalToSaved93": True, "qa": summaries, "artifactCount": len(current), "evidencePinsSHA256": r.sha(output / "evidence-pins.json"), "artifactPinsSHA256": r.sha(output / "artifact-pins.json"), "newCLIAndDryRunTestsExecutedInFullSuite": True, "browserVerified": False, "phoneVerified": False, "publicExportRun": False, "releaseApproved": False, "boundary": "Trusted root actual serial execution with integrated prebuild/post-process output captures. All portable HTML/CSS/JavaScript/data/art bytes equal saved93, so UI/rank facts are unchanged-bytes claims, not new browser or independent rank proof. Selected production output scope: server/app, static and four explicit build/routing manifests; server/chunks/caches/dependencies excluded. Production routing/page membership checked statically; no whole production runtime graph equivalence. No public export, deployment, publication or release approval."})


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("workspace", "runner", "approved-runner-sha256", "approved-verifier-sha256", "qa-directory", "run-result-sha256", "output"):
        p.add_argument("--" + name, required=True)
    args = p.parse_args()
    workspace = Path(args.workspace).resolve()
    runner = Path(args.runner).resolve()
    if not runner.is_relative_to(workspace) or runner.is_relative_to(workspace / "roadmark-work/roadmark"):
        raise AssertionError("Runner must be reviewed external workspace file")
    if not re.fullmatch(r"[0-9a-f]{64}", args.approved_runner_sha256) or bootstrap_sha(runner) != args.approved_runner_sha256 or bootstrap_sha(Path(__file__).resolve()) != args.approved_verifier_sha256:
        raise AssertionError("External runner/verifier review pins differ")
    spec = importlib.util.spec_from_file_location("reviewed_qa94_runner", runner)
    r = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(r)
    qa = r.safe(workspace, args.qa_directory, directory=True)
    r.need(not qa.is_relative_to(workspace / r.APP), "QA evidence must be external")
    output = r.new_output(workspace, args.output)
    r.write(output / "execution-request.json", {"startedAtUTC": r.now(), "argv": sys.argv, "verifierSHA256": args.approved_verifier_sha256, "runnerSHA256": args.approved_runner_sha256, "runResultSHA256": args.run_result_sha256, "noApplicationImportsOrExecution": True})
    try:
        run(r, workspace, qa, output, args)
    except BaseException as error:
        r.write(output / "failure.json", {"passed": False, "errorType": type(error).__name__, "error": str(error), "atUTC": r.now(), "traceback": traceback.format_exc(), "successProofNotEstablished": True})
        raise
    print("PASS: bounded checkpoint94 proof; UI/data unchanged bytes; no new browser/public-release claim")


if __name__ == "__main__":
    main()
