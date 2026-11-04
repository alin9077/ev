#!/usr/bin/env python3
"""ROOT ONLY: read-only bounded checkpoint95 proof; never imports app code.

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
import zipfile

BASE_SAVE_PLAN = "roadmark-recovery/final94-attempt1/upload-plan.json"
BASE_SAVE_PLAN_SHA = "6eb55b84ce97918c56935775c94d8c6c413a7d8b625729526fec126f827ed0ba"
BASE_SAVE_RECEIPT = "roadmark-recovery/final94-review/correlated-save-receipt.json"
BASE_SAVE_RECEIPT_SHA = "d23275b3f20a5916c0224c4f1a88fad99561b4d48542e1ea151d5d35ae649925"
BASE_ARCHIVES = {
    "source": {"path": "roadmark-recovery/final94-attempt1/Roadmark-recovered-94-source.zip", "sha256": "f94845534bfd184e2fe41ebf7a5d2ad38339fd371946b2284b79bf2ffb5ddeff", "bytes": 32953368},
    "preview": {"path": "roadmark-recovery/final94-attempt1/Roadmark-recovered-94-portable-preview.zip", "sha256": "1c1ffd7cbb55e3bd1bf03f077794b79a83c823326b09dc3ea679dc79ac40462e", "bytes": 16048612},
}


def bootstrap_sha(path):
    with path.open("rb") as f:
        h = hashlib.sha256()
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
        return h.hexdigest()


def verify_saved94(r, workspace, remember):
    plan = r.load(r.pinned(workspace, BASE_SAVE_PLAN, BASE_SAVE_PLAN_SHA))
    receipt = r.load(r.pinned(workspace, BASE_SAVE_RECEIPT, BASE_SAVE_RECEIPT_SHA))
    remember(workspace / BASE_SAVE_PLAN, BASE_SAVE_PLAN_SHA)
    remember(workspace / BASE_SAVE_RECEIPT, BASE_SAVE_RECEIPT_SHA)
    pair = "roadmark-recovered94-da97acddcc6319fb-" + r.BASE_BUILD_ID
    r.need(plan["schemaVersion"] == "roadmark94.upload-plan.v1" and receipt["schemaVersion"] == "roadmark94.correlated-save-receipt.v1" and plan["applicationCheckpoint"] == receipt["applicationCheckpoint"] == 94 and plan["pairId"] == receipt["pairId"] == pair and receipt["uploadPlanSHA256"] == BASE_SAVE_PLAN_SHA and receipt["librarySavesComplete"] is True, "Saved94 receipt/plan binding differs")
    for role, expected in BASE_ARCHIVES.items():
        archive = r.pinned(workspace, expected["path"], expected["sha256"])
        r.need(remember(archive, expected["sha256"]) == expected, "Saved94 local archive size differs")
        planned = [row for row in plan["uploads"] if row["role"] == role]
        saved = [row for row in receipt["saved"] if row["role"] == role]
        r.need(len(planned) == len(saved) == 1 and planned[0]["filename"] == saved[0]["localFilename"] == archive.name and planned[0]["sha256"] == saved[0]["localSHA256"] == expected["sha256"] and planned[0]["bytes"] == saved[0]["localBytes"] == expected["bytes"] and bool(saved[0]["library_file_id"]), "Saved94 source/preview identity mismatch")
        with zipfile.ZipFile(archive) as z:
            names = z.namelist()
            r.need(len(names) == len(set(names)), "Duplicate saved94 ZIP members")
            name = "roadmark/CHECKPOINT-" + role.upper() + "-MANIFEST.json"
            r.need(z.getinfo(name).file_size <= 1024 * 1024, "Oversized saved94 manifest")
            manifest = json.loads(z.read(name))
            r.need(manifest["applicationCheckpoint"] == 94 and manifest["pairId"] == pair and manifest["portableIndexSHA256"] == r.PORTABLE_SHA and manifest["portableIndexBytes"] == r.PORTABLE_BYTES and manifest["productionBuildId"] == r.BASE_BUILD_ID, "Saved94 manifest does not bind local baseline outputs")
            if role == "preview":
                for alias in r.ALIASES:
                    member = "roadmark/" + alias
                    r.need(z.getinfo(member).file_size == r.PORTABLE_BYTES, "Saved94 preview alias size differs")
                    h = hashlib.sha256()
                    with z.open(member) as source:
                        for chunk in iter(lambda: source.read(1024 * 1024), b""):
                            h.update(chunk)
                    r.need(h.hexdigest() == r.PORTABLE_SHA, "Saved94 preview alias differs from pinned portable baseline")
    return {"pairId": pair, "sourceArchive": BASE_ARCHIVES["source"], "previewArchive": BASE_ARCHIVES["preview"], "uploadPlanSHA256": BASE_SAVE_PLAN_SHA, "correlatedSaveReceiptSHA256": BASE_SAVE_RECEIPT_SHA, "remoteServerContentIndependentlyReverified": False}


def read_portable(r, path):
    """Parse JSON data only. Never evaluate JavaScript or import app modules."""
    r.need(path.stat().st_size <= 64 * 1024 * 1024, "Portable exceeds reviewed 64 MiB bound")
    raw = path.read_bytes()
    marker = b'<script id="ev-data" type="application/json">'
    r.need(raw.count(marker) == 1, "Missing/ambiguous portable JSON marker")
    prefix, body = raw.split(marker)
    payload, close, suffix = body.partition(b"</script>")
    r.need(close == b"</script>" and payload and b"<" not in payload, "Unescaped/missing portable JSON boundary")
    def unique(pairs):
        result = {}
        for key, value in pairs:
            r.need(key not in result, "Duplicate portable JSON key")
            result[key] = value
        return result
    def invalid(value):
        raise ValueError("Nonfinite JSON constant: " + value)
    envelope = json.loads(payload.decode("utf-8"), object_pairs_hook=unique, parse_constant=invalid)
    r.need(type(envelope) is dict and set(envelope) == {"format", "strings", "data"} and envelope["format"] == "roadmark-string-table-v1", "Unexpected portable codec envelope")
    strings = envelope["strings"]
    r.need(type(strings) is list and all(type(v) is str for v in strings) and len(strings) == len(set(strings)), "Invalid/duplicate portable dictionary")
    def base36(index):
        result = ""
        while index:
            index, digit = divmod(index, 36)
            result = "0123456789abcdefghijklmnopqrstuvwxyz"[digit] + result
        return result or "0"
    references = {"~" + base36(i): value for i, value in enumerate(strings)}
    data = envelope["data"]
    r.need(type(data) is dict, "Portable payload is not an object")
    pending = [data]
    while pending:
        container = pending.pop()
        for key in (range(len(container)) if type(container) is list else list(container)):
            value = container[key]
            if type(value) is str and value.startswith("~"):
                if value.startswith("~~"):
                    container[key] = value[1:]
                else:
                    r.need(value in references, "Invalid portable dictionary reference")
                    container[key] = references[value]
            elif type(value) in (dict, list):
                pending.append(value)
    return prefix + marker, close + suffix, data


def market_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode()).hexdigest()


def verify_portable(r, workspace, app):
    old_prefix, old_suffix, old = read_portable(r, workspace / r.BASE_HTML)
    prefix, suffix, data = read_portable(r, app / "index.html")
    r.need(prefix == old_prefix and suffix == old_suffix, "Portable HTML/CSS/executable JavaScript outside JSON changed")
    keys = {"marketInventory", "cars", "packs", "research", "counts", "art"}
    r.need(set(old) == set(data) == keys, "Portable projection membership changed")
    protected = {}
    for key in sorted(keys - {"marketInventory"}):
        old_hash, new_hash = r.digest(old[key]), r.digest(data[key])
        r.need(old_hash == new_hash, "Nonmarket portable projection changed: " + key)
        protected[key] = new_hash
    market, before = data["marketInventory"], old["marketInventory"]
    fixture = r.load(app / r.FIXTURE)
    source = r.load(app / r.MARKET)
    r.need(r.canonical(market) == r.canonical(source), "Emitted market JSON differs from exact admitted source")
    r.need(market_digest(before) == fixture["previousCanonicalSHA256"] and market_digest(market) == fixture["approvedCanonicalSHA256"], "Decoded market predecessor/successor differs")
    r.need(set(market) == set(before), "Unexpected market top-level field")
    changed = {key for key in market if r.canonical(market[key]) != r.canonical(before[key])}
    r.need(changed == {"counts", "records", "reconciledLeads", "sourceArtifacts", "unverifiedLeads"}, "Unapproved market projection field change")
    r.need(r.canonical(market["records"][-1]) == r.canonical(fixture["appendedRecord"]) and r.canonical(market["reconciledLeads"][-1]) == r.canonical(fixture["appendedReconciledLead"]) and r.canonical(market["sourceArtifacts"][-1]) == r.canonical(fixture["appendedArtifact"]), "Appended market objects differ")
    index = fixture["originalLeadIndex"]
    r.need(type(index) is int and index == 40 and r.canonical(before["unverifiedLeads"][index]) == r.canonical(fixture["originalLead"]), "Original lead/index differs")
    reconstructed = dict(market)
    reconstructed.update({"counts": fixture["countsBefore"], "records": market["records"][:-1], "unverifiedLeads": market["unverifiedLeads"][:index] + [fixture["originalLead"]] + market["unverifiedLeads"][index:], "reconciledLeads": market["reconciledLeads"][:-1], "sourceArtifacts": market["sourceArtifacts"][:-1]})
    r.need(r.canonical(reconstructed) == r.canonical(before), "Market predecessor cannot be reconstructed exactly")
    lengths = {key: len(market[key]) for key in ("records", "unverifiedLeads", "reconciledLeads", "sourceArtifacts", "peripheralRecords")}
    r.need(lengths == {"records": 242, "unverifiedLeads": 143, "reconciledLeads": 21, "sourceArtifacts": 19, "peripheralRecords": 5}, "Market lengths differ")
    r.need(r.canonical(market["counts"]) == r.canonical(fixture["countsAfter"]), "Market dependent counts differ")
    records = market["records"]
    r.need(sum(len(row["trims"]) for row in records) == market["counts"]["namedTrimConfigurationEntries"] == 395, "Named entry tally differs")
    for category, field in (("byVehicleClass", "vehicleClass"), ("byOrderStatus", "orderStatus")):
        actual = {}
        for row in records:
            actual[row[field]] = actual.get(row[field], 0) + 1
        r.need(actual == market["counts"][category], "Dependent class/status count differs")
    record = records[-1]
    r.need(record["id"] == "mazda-cx-6e" and record["trims"] == ["GT", "Azami"] and record["orderStatus"] == "preorder" and record["stockStatus"] == "new_stock_listed", "Wrong admitted CX-6e identity/status")
    r.need(all(record[key] is False for key in ("rankingEligible", "completeVehicleCountEligible", "factoryOrderAcceptanceVerified", "physicalStockVerified")) and record["modelYear"] is None and record["sourceTechnicalEpoch"] is None and market["complete"] is False, "Held claims were promoted")
    cars = [pack["car"] for pack in data["packs"].values()]
    r.need(len(data["cars"]) == len(cars) == data["counts"]["variants"] == 343 and len({car.get("modelFamily") or car["family"] for car in cars}) == data["counts"]["families"] == 149 and len(data["research"]["sources"]) == 2196, "Detailed catalogue counts changed")
    r.need(not any(car["brand"] == "Mazda" and re.search(r"CX[- ]?6e", car["model"], re.I) for car in cars), "CX-6e unexpectedly entered detailed catalogue")
    established = [car for car in cars if car.get("researchStage") != "partial"]
    alternative_families = sorted({car["family"] for car in established if car["modelId"] != "tesla_model_y"})
    r.need(len(alternative_families) == 9 and any(car["id"] == "tesla_model_y__premium_rwd__2" for car in established), "Original Model Y and nine alternatives changed")
    return {"outerHtmlCssAndJavaScriptByteIdenticalTo94": True, "decodedNonmarketProjectionDigests": protected, "decodedMarketExactlyMatchesAdmittedSource": True, "exactPre94MarketReconstruction": True, "marketCounts": market["counts"], "marketLengths": lengths, "detailedConfigurations": 343, "detailedFamilies": 149, "catalogueSources": 2196, "originalModelYBaseline": "tesla_model_y__premium_rwd__2", "originalAlternativeFamilyCount": 9, "alternativeFamilies": alternative_families, "independentRankingRecomputed": False}


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
    saved94 = verify_saved94(r, workspace, remember)
    result_path = qa / "run-result.json"
    remember(result_path, args.run_result_sha256)
    result = r.load(result_path)
    r.need(result["schemaVersion"] == "roadmark95.serial-qa-result.v1" and result["passed"] is True and type(result["checkpoint"]) is int and result["checkpoint"] == 95, "No successful actual95 runner result")
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
    for name, pin in ((r.BASE_INPUT, r.BASE_INPUT_SHA), (r.BASE_PROOF, r.BASE_PROOF_SHA), (r.BASE_ARTIFACTS, r.BASE_ARTIFACTS_SHA), (r.BASE_HTML, r.PORTABLE_SHA), (r.BASE_VALIDATION, r.BASE_VALIDATION_SHA)):
        remember(r.safe(workspace, name), pin)
    for item in [config["expectedInputs"], config["candidate"]]:
        remember(r.safe(workspace, item["path"]), item["sha256"])
    remember(Path(args.runner).resolve(), args.approved_runner_sha256)
    remember(Path(__file__).resolve(), args.approved_verifier_sha256)
    r.need(request["schemaVersion"] == "roadmark95.serial-qa-request.v1" and request["configuration"] == config and request["runnerSHA256"] == args.approved_runner_sha256 and request["exclusiveWorkspaceConfirmedByRoot"] is True, "Runner request differs")
    # Reparse real saved argv with the reviewed parser. Do not execute main/run.
    saved = r.parser().parse_args(request["argv"][1:])
    r.need(Path(request["argv"][0]).resolve() == Path(args.runner).resolve() and Path(saved.workspace).resolve() == workspace and workspace / saved.output == qa and saved.approved_runner_sha256 == args.approved_runner_sha256 and saved.exclusive_workspace_confirmed, "Wrong actual runner argv/workspace/attempt")
    actual_config = {"expectedInputs": {"path": saved.expected_inputs, "sha256": saved.expected_inputs_sha256}, "candidate": {"path": saved.candidate_manifest, "sha256": saved.candidate_manifest_sha256}}
    r.need(actual_config == config, "Runner argv differs from pinned manifest configuration")
    root_path = r.pinned(workspace, args.root_terminal, args.root_terminal_sha256)
    r.need(root_path == qa.with_name(qa.name + "-terminal.json"), "Root terminal belongs to another attempt")
    remember(root_path, args.root_terminal_sha256)
    root = r.load(root_path)
    r.need(root["schemaVersion"] == "roadmark95.root-qa-terminal.v1" and root["checkpoint"] == 95 and type(root["exitCode"]) is int and root["exitCode"] == 0 and root["interruptionOrLaunchError"] is None, "Root wrapper has no actual clean successful exit")
    r.need(root["runnerSHA256"] == args.approved_runner_sha256 and root["launcherSHA256"] == args.approved_launcher_sha256 and root["runResultSHA256"] == args.run_result_sha256, "Root terminal pins differ")
    remember(r.pinned(workspace, root["launcherPath"], args.approved_launcher_sha256), args.approved_launcher_sha256)
    r.need(len(root["command"]) >= 3 and root["command"][1] == "-B" and root["command"][2:] == request["argv"] and Path(root["cwd"]) == workspace, "Root wrapper command differs from actual runner request")
    r.need(type(root["processId"]) is int and root["processId"] > 0 and type(root["durationNs"]) is int and root["durationNs"] > 0, "Root wrapper process evidence missing")
    r.need(root["log"]["path"] == qa.with_name(qa.name + "-launch.log").relative_to(workspace).as_posix() and remember(r.safe(workspace, root["log"]["path"]), root["log"]["sha256"]) == root["log"], "Root console log differs")
    root_log = r.safe(workspace, root["log"]["path"]).read_text(encoding="utf-8")
    r.need(re.findall(r"^START (\w+) ", root_log, re.M) == list(r.STAGES) and re.findall(r"^END (\w+) 0 ", root_log, re.M) == list(r.STAGES) and root_log.count("SEVEN_QA_STAGES_COMPLETE; actual output captures retained; independent verifier pending") == 1, "Incomplete root runner console terminal")
    r.need(r.stamp(root["startedAtUTC"]) <= r.stamp(request["startedAtUTC"]) <= r.stamp(result["finishedAtUTC"]) <= r.stamp(root["finishedAtUTC"]) <= r.stamp(r.now()), "Root wrapper chronology differs")
    freeze = r.load(qa / "freeze-receipt.json")
    r.need(r.load(qa / "frozen-inputs.json") == expected and freeze["frozenInputManifestSHA256"] == r.sha(qa / "frozen-inputs.json") and freeze["canonicalDigest"] == result["frozenInputDigest"] == fixed and freeze["fileCount"] == r.TOTAL_INPUTS and freeze["changedOrAddedFiles"] == changes and freeze["approvedInputMap"] == config["expectedInputs"], "Wrong frozen input proof")
    app = workspace / r.APP
    r.need(freeze["checkpointMetadata"] == {n: r.metadata(r.safe(app, n)) for n in sorted(r.METADATA)}, "Historical metadata changed")
    pre = r.load(qa / "prebuild-observation.json")
    r.need(pre["runnerSHA256"] == args.approved_runner_sha256 and pre["productionStageNotStarted"] is True and {n: v["sha256"] for n, v in pre["artifacts"].items()} == baseline_artifacts, "Actual prebuild capture differs from94")
    r.need(pre["buildID"] == result["baselineBuildID"] == baseline_proof["actualProductionBuildID"] == r.BASE_BUILD_ID, "Prebuild identity differs")
    r.need(r.stamp(request["startedAtUTC"]) <= r.stamp(freeze["atUTC"]) <= r.stamp(pre["captureStartedAtUTC"]) <= r.stamp(pre["captureFinishedAtUTC"]), "Invalid prebuild chronology")
    previous_end = r.stamp(pre["captureFinishedAtUTC"])
    r.need(set(result["stageReceipts"]) == set(r.STAGES) and set(result["outputObservations"]) == {"production_build", "portable_build"}, "Wrong stage coverage")
    summaries, captured = {}, {}
    for stage, argv in r.commands(expected).items():
        receipt = read_ref(result["stageReceipts"][stage])
        r.need(result["stageReceipts"][stage]["path"] == (qa / (stage + ".json")).relative_to(workspace).as_posix(), "Receipt from wrong attempt")
        r.need(receipt["schemaVersion"] == "roadmark95.stage-receipt.v1" and receipt["checkpoint"] == 95 and receipt["stage"] == stage and receipt["command"] == argv and Path(receipt["cwd"]) == app, "Wrong actual QA command/cwd")
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
            r.need(tallies["tests"] == tallies["pass"] == (r.NON_HTTP_TESTS if stage == "non_http_tests" else 1) and all(tallies[n] == 0 for n in ("fail", "cancelled", "skipped", "todo")), "Incorrect complete suite tally")
            summary["tallies"] = tallies
        if stage == "validation":
            validation = r.load(qa / (stage + ".log"))
            r.need(r.canonical(validation) == r.canonical(r.load(workspace / r.BASE_VALIDATION)), "Actual validation differs from94 PASS/count/source result")
            summary["validation"] = validation
        if stage == "production_build":
            r.need(re.search(r"Generating static pages[^\n]*\(389/389\)", text) and re.search(r"(?:○|●)\s+/market(?:\s|$)", text), "Missing normal production terminal")
        if stage == "portable_build":
            r.need("Portable Roadmark experience written (" in text and "index.html and index-b.html retain the Model Y hero above discovery" in text, "Missing portable terminal")
        if stage in result["outputObservations"]:
            value = result["outputObservations"][stage]
            r.need(receipt["outputObservation"] == value and value["path"] == (qa / (stage + "-outputs.json")).relative_to(workspace).as_posix(), "Observation not bound to producer receipt")
            obs = read_ref(value)
            r.need(obs["schemaVersion"] == "roadmark95.producer-output-observation.v1" and obs["stage"] == stage and obs["command"] == argv and obs["processId"] == receipt["processId"] and obs["exitCode"] == 0 and obs["producerStartedAtUTC"] == receipt["startedAtUTC"] and obs["producerFinishedAtUTC"] == receipt["finishedAtUTC"], "Observation producer differs")
            r.need(end <= r.stamp(obs["captureStartedAtUTC"]) <= r.stamp(obs["captureFinishedAtUTC"]), "Post-terminal capture chronology differs")
            previous_end = r.stamp(obs["captureFinishedAtUTC"])
            r.stage_mtimes(obs["artifacts"], r.CORE if stage == "production_build" else r.ALIASES, receipt)
            captured[stage] = obs["artifacts"]
            if stage == "production_build":
                r.need(obs["presentation"] == pre["presentation"] == r.presentation(app, obs["artifacts"]), "Production presentation changed outside three admitted count tokens")
            else:
                r.need(obs["presentation"] is None, "Unexpected portable production-presentation record")
        else:
            r.need(receipt["outputObservation"] is None, "Unexpected output observation")
        summaries[stage] = summary
    produced, aliases = captured["production_build"], captured["portable_build"]
    r.need(set(aliases) == set(r.ALIASES) and not set(produced) & set(aliases), "Observation scopes differ")
    current = r.capture(app, "all")
    r.need(current == {**produced, **aliases} and len(current) == result["artifactCount"], "Output metadata/membership drift after actual captures")
    portable_sha, portable_bytes = aliases["index.html"]["sha256"], aliases["index.html"]["bytes"]
    r.need(all(v["sha256"] == portable_sha and v["bytes"] == portable_bytes for v in aliases.values()) and portable_sha != r.PORTABLE_SHA, "Portable aliases differ or unchanged old market emitted")
    portable = verify_portable(r, workspace, app)
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
    r.write(output / "proof.json", {
        "schemaVersion": "roadmark95.bounded-emitted-proof.v1", "passed": True,
        "checkpoint": 95, "baselineCheckpoint": 94, "checkedAtUTC": r.now(),
        "verifierSHA256": args.approved_verifier_sha256, "runnerSHA256": args.approved_runner_sha256,
        "launcherSHA256": args.approved_launcher_sha256, "rootTerminalSHA256": args.root_terminal_sha256,
        "runResultSHA256": args.run_result_sha256, "configuration": config, "saved94Baseline": saved94,
        "frozenInputCount": r.TOTAL_INPUTS, "protectedOldInputsUnchanged": 1652,
        "reviewedReplacements": 3, "reviewedAdditions": 4, "allNongeneratedInputsManifested": True,
        "registersUnchangedAndEmpty": True, "protectedRuntimeBuildConfigInputsByteIdenticalTo94": True,
        "actualProductionBuildID": build_id, "baselineProductionBuildID": pre["buildID"],
        "portableSHA256": portable_sha, "portableBytes": portable_bytes,
        "fourPortableAliasesByteIdentical": True, "portableProjection": portable,
        "productionPresentationMatches94ExceptThreeMarketCountTokens": True,
        "productionPresentationExclusions": pre["presentation"]["excluded"],
        "qa": summaries, "fullTestCount": r.NON_HTTP_TESTS + 1, "artifactCount": len(current),
        "evidencePinsSHA256": r.sha(output / "evidence-pins.json"), "artifactPinsSHA256": r.sha(output / "artifact-pins.json"),
        "checkpoint95AndHistoricalTestsExecutedInFullSuite": True,
        "browserVerified": False, "phoneVerified": False, "publicExportRun": False, "releaseApproved": False,
        "boundary": "Trusted root actual serial execution and root-wrapper exit with integrated prebuild/post-process captures. Portable outer HTML/CSS/JavaScript bytes and every nonmarket decoded JSON value equal verified94; market JSON equals only the seven-file admitted95 source delta. Rank inputs are preserved, not independently recomputed. Production HTML presentation excludes all scripts and script preloads and allows exactly three market 241-to-242 count tokens; production CSS remains byte-identical. Selected output hashes cover server/app, static and four build/routing manifests, not server/chunks/caches/dependencies or whole runtime graph/hydration. Local saved94 source/preview identities and actual correlated save receipt are bound without new remote server-byte verification. No fresh browser, phone, public export, deployment, publication or release approval."
    })


def main():
    p = argparse.ArgumentParser(description=__doc__)
    for name in ("workspace", "runner", "approved-runner-sha256", "approved-verifier-sha256", "approved-launcher-sha256", "qa-directory", "run-result-sha256", "root-terminal", "root-terminal-sha256", "output"):
        p.add_argument("--" + name, required=True)
    args = p.parse_args()
    workspace = Path(args.workspace).resolve()
    runner = Path(args.runner).resolve()
    if not runner.is_relative_to(workspace) or runner.is_relative_to(workspace / "roadmark-work/roadmark"):
        raise AssertionError("Runner must be reviewed external workspace file")
    if not re.fullmatch(r"[0-9a-f]{64}", args.approved_runner_sha256) or bootstrap_sha(runner) != args.approved_runner_sha256 or bootstrap_sha(Path(__file__).resolve()) != args.approved_verifier_sha256:
        raise AssertionError("External runner/verifier review pins differ")
    spec = importlib.util.spec_from_file_location("reviewed_qa95_runner", runner)
    r = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(r)
    qa = r.safe(workspace, args.qa_directory, directory=True)
    r.need(not qa.is_relative_to(workspace / r.APP), "QA evidence must be external")
    output = r.new_output(workspace, args.output)
    r.write(output / "execution-request.json", {"startedAtUTC": r.now(), "argv": sys.argv, "verifierSHA256": args.approved_verifier_sha256, "runnerSHA256": args.approved_runner_sha256, "launcherSHA256": args.approved_launcher_sha256, "runResultSHA256": args.run_result_sha256, "rootTerminal": args.root_terminal, "rootTerminalSHA256": args.root_terminal_sha256, "noApplicationImportsOrExecution": True})
    try:
        run(r, workspace, qa, output, args)
    except BaseException as error:
        r.write(output / "failure.json", {"passed": False, "errorType": type(error).__name__, "error": str(error), "atUTC": r.now(), "traceback": traceback.format_exc(), "successProofNotEstablished": True})
        raise
    print("PASS: bounded checkpoint95 proof; only admitted market projection changed; no new browser/public-release claim")


if __name__ == "__main__":
    main()
