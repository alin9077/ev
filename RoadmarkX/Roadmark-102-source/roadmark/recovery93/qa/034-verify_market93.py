#!/usr/bin/env python3
"""Root-only, standard-library, read-only Roadmark93 emitted-output comparison.

Never imports application code, rebuilds, starts a server, or opens a browser.
Writes only a new evidence directory outside the application. Failures remain.
This candidate must be independently reviewed and externally SHA-pinned first.
"""
import argparse
import datetime as dt
import hashlib
from html.parser import HTMLParser
import json
import math
import os
from pathlib import Path
import re
import sys
import traceback

APP = "roadmark-work/roadmark"
ALIASES = ("index.html", "index-b.html", "public/index.html", "public/index-b.html")
STAGES = ("non_http_tests", "local_http_tests", "typecheck", "lint", "validation", "production_build", "portable_build")
PAYLOAD_KEYS = {"marketInventory", "cars", "packs", "research", "counts", "art"}
CHANGES = {
    "data/market-deepway-star-lead-evidence-2026-10-12.json",
    "data/market-inventory-2026-10-10.json", "qa/checkpoint93-market-fixture.json",
    "tests/checkpoint91-market.test.ts", "tests/checkpoint93-market.test.ts",
    "tests/helpers/checkpoint91-market-history.ts", "tests/helpers/checkpoint93-market-history.ts",
}
PINS = {
    "roadmark-research/applied93/expected-inputs-after-type-fix.json": "e8161ffb02c560a482c4dbf4fbde2fd3d908a0cd8e9f47585e092fc22411d5ad",
    "roadmark-research/market-lead93-implementation/candidate-manifest-revision3.json": "23c7857372a56d9eb2492e924d61bf7bc1294762734bc6a800d31bdce948a22f",
    "roadmark-restoration/browser92/current92.html": "afbf227614232924ec771319c771552d1080e7e88fb5aca2a3650f414b6e6563",
    "roadmark-restoration/qa92/frozen-inputs.json": "d834fc9c6f58cd20a7d6fac7a3f504fe2428ccb4b879d6d96d51a8d6c66b306a",
    "roadmark-research/restored92-application/final-artifact-pins.json": "119f91c251db5338245c6004f936abdcdd7eeb0c1a9c6794ca33c2797dc24967",
    "roadmark-research/restored92-application/emitted-proof-retry1/proof.json": "d90b705ffe8a830cf194e56e1c8e093cfc320ce03212b6674bd1c4b37b278ef8",
}
EXPECTED_PATH, CANDIDATE_PATH, BASE_HTML_PATH, BASE_INPUT_PATH, BASE_ARTIFACT_PATH, BASE_PROOF_PATH = PINS
HEX = re.compile(r"[0-9a-f]{64}\Z")
OBSERVER_FILE = "roadmark-research/market93-output-check/observe_market93_build.py"
OBSERVER_SHA = "af483048ca73c957fdb4553a01a534e265f9a885d2db161c3bd14a5ded798ff6"
PREBUILD_FILE = "roadmark-research/applied93/prebuild-artifact-observation.json"
PREBUILD_SHA = "bf829f1b96b6113d9a0641faa0c5688d8bea006e3da0d34436c59425fefb76cf"
RUNNER_FILE = "roadmark-research/applied93/root-scripts/run-qa93.py"
RUNNER_SHA = "aaf08718b3b0d8d4136eb1ca3d06f1f5498bf67ae399184b250371d9addc23d8"
OBSERVER_WRAPPER_FILE = "roadmark-research/applied93/root-scripts/run-build-observer.py"
OBSERVER_WRAPPER_SHA = "97a9683bb61f737764861e618bc75505731827d8ed6b53378594068ec2feb34a"
KNOWN_CHECKPOINT_METADATA = {"CHECKPOINT-PREVIEW-MANIFEST.json", "CHECKPOINT-SOURCE-MANIFEST.json", "OPEN-PORTABLE-PREVIEW.txt"}


def require(value, reason):
    if not value:
        raise AssertionError(reason)


def sha_file(path):
    h = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def sha_text(value):
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def strict_json(text):
    def pairs(values):
        obj = {}
        for key, value in values:
            require(key not in obj, "Duplicate JSON key: " + key)
            obj[key] = value
        return obj
    def invalid(value):
        raise ValueError("Non-finite JSON number: " + value)
    def floating(value):
        number = float(value)
        require(math.isfinite(number), "Non-finite JSON number")
        return number
    return json.loads(text, object_pairs_hook=pairs, parse_constant=invalid, parse_float=floating)


def same(a, b, label):
    """Complete JSON value comparison; Python bool/int coercion is forbidden."""
    pending = [(a, b)]
    while pending:
        left, right = pending.pop()
        require(type(left) is type(right), label + ": value type differs")
        if isinstance(left, dict):
            require(left.keys() == right.keys(), label + ": object keys differ")
            pending.extend((left[k], right[k]) for k in left)
        elif isinstance(left, list):
            require(len(left) == len(right), label + ": array length differs")
            pending.extend(zip(left, right))
        else:
            require(left == right, label + ": value differs")


def safe_path(root, name, directory=False):
    require(isinstance(name, str) and name and "\\" not in name, "Invalid relative path")
    parts = name.split("/")
    require(not Path(name).is_absolute() and all(p not in {"", ".", ".."} for p in parts), "Unsafe relative path: " + name)
    path = root.joinpath(*parts)
    require(not any(root.joinpath(*parts[:i]).is_symlink() for i in range(1, len(parts) + 1)), "Symlink rejected: " + name)
    require(path.resolve().is_relative_to(root.resolve()), "Escaped root: " + name)
    require(path.is_dir() if directory else path.is_file(), "Missing file/directory: " + name)
    return path


def scope_names(root, predicate):
    names = []
    for directory, children, files in os.walk(root, followlinks=False):
        children[:] = [p for p in children if p not in {"node_modules", ".git"}]
        for child in children:
            path = Path(directory) / child
            if path.is_symlink():
                # A symlinked directory can hide unmanifested code/assets.
                require(False, "Unexpected symlinked directory: " + str(path))
        for name in files:
            rel = (Path(directory) / name).relative_to(root).as_posix()
            if predicate(rel):
                safe_path(root, rel)
                names.append(rel)
    return sorted(names)


def runtime_or_qa(name):
    roots = {"package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml", "tsconfig.json", "next.config.ts", "next-env.d.ts", "eslint.config.mjs", "playwright.config.ts", "CODEX_MASTER_PROMPT.md", "TESLA_MEDIA_AUDIT.md", "au_ev_all_variants_2026-10-06.json", "Australian_EV_All_Variants_2026-10-06.xlsx", "Australian_EV_All_Variants_Report_2026-10-06.pdf"}
    return name in roots or name.startswith(("src/", "data/", "scripts/", "tests/", "media/", "backups/")) or (name.startswith("public/") and name not in ALIASES) or name in {"qa/scenes-b-new-brief.png", "qa/car-rear-views.png"} or (name.startswith("qa/") and Path(name).suffix in {".json", ".cjs", ".mjs", ".ts", ".tsx", ".js", ".py", ".sha256"})


def artifact(name):
    return name in ALIASES or name in {".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json"} or name.startswith((".next/server/app/", ".next/static/"))


def nongenerated_input(name):
    # Every other app file, including new root .env/Babel/PostCSS/Next configs,
    # must be in the exact frozen manifest. Dependencies and .git are pruned by
    # scope_names; these three retained checkpoint metadata files are pinned
    # separately and cannot silently authorize a runtime/config input.
    return not name.startswith(".next/") and name not in set(ALIASES) | KNOWN_CHECKPOINT_METADATA | {"tsconfig.tsbuildinfo"}


def parts(text):
    found = re.fullmatch(r'(.*?<script id="ev-data" type="application/json">)(.*?)(</script><script>)(.*?)(</script></body></html>)', text, re.S)
    require(found is not None, "Unexpected portable framing")
    prefix, encoded, middle, javascript, suffix = found.groups()
    require(prefix.count("<script") == 1 and "</script" not in javascript, "Unexpected portable script topology")
    require(javascript.startswith("window.__EV_B=true;"), "Original hero flag missing")
    return prefix, encoded, middle, javascript, suffix


def base36(n):
    chars = "0123456789abcdefghijklmnopqrstuvwxyz"
    out = ""
    while n:
        n, remainder = divmod(n, 36)
        out = chars[remainder] + out
    return out or "0"


def decode(encoded):
    """Independent equivalent of the pinned roadmark-string-table-v1 decoder."""
    envelope = strict_json(encoded)
    require(type(envelope) is dict and set(envelope) == {"format", "strings", "data"}, "Wrong string-table envelope")
    require(envelope["format"] == "roadmark-string-table-v1", "Wrong string-table version")
    strings = envelope["strings"]
    require(type(strings) is list and all(type(s) is str for s in strings), "Invalid dictionary")
    refs = {"~" + base36(i): value for i, value in enumerate(strings)}
    def string(value):
        if not value.startswith("~"):
            return value
        if value.startswith("~~"):
            return value[1:]
        require(value in refs, "Unknown or noncanonical string-table reference")
        return refs[value]
    value = envelope["data"]
    if isinstance(value, str):
        return string(value)
    pending = [value] if isinstance(value, (dict, list)) else []
    while pending:
        container = pending.pop()
        for key in range(len(container)) if isinstance(container, list) else container:
            item = container[key]
            if isinstance(item, str):
                container[key] = string(item)
            elif isinstance(item, (dict, list)):
                pending.append(item)
    return value


def check_market(before, after, fixture):
    require(set(before) == set(after), "Market top-level keys changed")
    for key in before.keys() - {"counts", "sourceArtifacts", "unverifiedLeads"}:
        same(before[key], after[key], "Protected market field " + key)
    same(after["counts"], {**before["counts"], "unresolvedLeadGroups": 144}, "Only lead count may change")
    same(after["unverifiedLeads"], before["unverifiedLeads"] + [fixture["addedLead"]], "Exact one approved lead append")
    same(after["sourceArtifacts"], before["sourceArtifacts"] + [fixture["addedArtifact"]], "Exact one approved artifact append")
    require(len(before["records"]) == len(after["records"]) == 241, "Market records changed")
    require(len(before["unverifiedLeads"]) == 143 and len(after["unverifiedLeads"]) == 144, "Wrong lead counts")
    require(len(before["sourceArtifacts"]) == 17 and len(after["sourceArtifacts"]) == 18, "Wrong artifact counts")
    require(before["counts"]["unresolvedLeadGroups"] == 143, "Wrong prior unresolved count")
    require(after["checkedAt"] == "2026-10-10" and after["complete"] is False, "Global market date/completeness changed")
    lead = after["unverifiedLeads"][-1]
    require(lead["id"] == "deepway-star" and lead["rankingEligible"] is False, "Lead promoted")
    require(lead["trims"] == [] and lead["modelAliases"] == [], "Deepway trim or alias added")
    require(lead["orderStatus"] == "listed_unconfirmed" and lead["stockStatus"] == "unverified" and lead["roadRegistrationScope"] == "unverified" and lead["resolutionStatus"] == "unresolved" and lead["recordScope"] == "unverified_lead", "Lead hold changed")
    require(sum(row["id"] == "deepway-star" for row in after["unverifiedLeads"]) == 1, "Duplicate Deepway lead")
    require(not any(row["id"] == "deepway-star" for row in after["records"]), "Deepway promoted to market record")


class VisibleHTML(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.hidden = 0
        self.text = []
        self.ids = set()
        self.hrefs = set()
        self.verdicts = 0
        self.feed(text)
        self.close()
    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style"}:
            self.hidden += 1
        if not self.hidden:
            attrs = dict(attrs)
            self.ids.add(attrs.get("id"))
            self.hrefs.add(attrs.get("href"))
            if "verdict-reason" in (attrs.get("class") or "").split():
                self.verdicts += 1
    def handle_endtag(self, tag):
        if tag in {"script", "style"}:
            self.hidden -= 1
            require(self.hidden >= 0, "Unbalanced hidden HTML tag")
    def handle_data(self, data):
        if not self.hidden:
            self.text.append(data)
    def normalized(self):
        return " ".join("".join(self.text).split())


def instant(text):
    value = dt.datetime.fromisoformat(text.replace("Z", "+00:00"))
    require(value.tzinfo is not None, "QA timestamp lacks timezone")
    return value


def observed_metadata_matches(row, actual_sha, actual_bytes, actual_mtime_ns):
    require(type(row) is dict and set(row) == {"sha256", "bytes", "mtimeNs"} and type(row["bytes"]) is int and type(row["mtimeNs"]) is int, "Malformed observed artifact metadata")
    require(row["sha256"] == actual_sha and row["bytes"] == actual_bytes and row["mtimeNs"] == actual_mtime_ns, "Observed producer output changed")


def producer_mtime_matches(mtime_ns, started, finished):
    require(type(mtime_ns) is int and instant(started).timestamp() - 2 <= mtime_ns / 1e9 <= instant(finished).timestamp() + 2, "Core output mtime does not match producer stage")


def write_json(path, value):
    with path.open("x", encoding="utf-8") as dest:
        json.dump(value, dest, indent=2, sort_keys=True, ensure_ascii=False, allow_nan=False)
        dest.write("\n")


def run(workspace, qa_name, output, verifier_sha, binding_name, binding_sha, terminal_name, terminal_sha):
    app = safe_path(workspace, APP, directory=True)
    qa = safe_path(workspace, qa_name, directory=True)
    evidence = {}
    def remember(path, pin=None):
        rel = path.relative_to(workspace).as_posix()
        safe_path(workspace, rel)
        actual = sha_file(path)
        require(pin is None or actual == pin, "SHA mismatch: " + rel)
        require(rel not in evidence or evidence[rel] == actual, "Evidence changed: " + rel)
        evidence[rel] = actual
        return path
    def read_json(path, pin=None):
        return strict_json(remember(path, pin).read_text(encoding="utf-8"))
    for name, pin in PINS.items():
        remember(safe_path(workspace, name), pin)
    expected = read_json(workspace / EXPECTED_PATH)
    baseline_inputs = read_json(workspace / BASE_INPUT_PATH)
    baseline_artifacts = read_json(workspace / BASE_ARTIFACT_PATH)
    baseline_proof = read_json(workspace / BASE_PROOF_PATH)
    require(baseline_proof["passed"] is True and baseline_proof["runtime"]["passed"] is True and baseline_proof["portableSHA256"] == PINS[BASE_HTML_PATH], "Invalid92 proof anchor")
    require(len(expected) == 1650, "Expected1650 pinned inputs")
    candidate = read_json(workspace / CANDIDATE_PATH)
    changed = {row["path"]: row for row in candidate["files"]}
    require(len(candidate["files"]) == 7 and set(changed) == CHANGES, "Wrong reviewed change set")
    require(set(expected) == set(baseline_inputs) | CHANGES, "Input membership differs beyond approved93 additions")
    for name, pin in expected.items():
        require(isinstance(pin, str) and HEX.fullmatch(pin), "Invalid input hash")
        remember(safe_path(app, name), pin)
        if name in changed:
            require(pin == changed[name]["sha256"] and baseline_inputs.get(name) == changed[name]["beforeSHA256"] and pin != baseline_inputs.get(name), "Candidate before/after mismatch: " + name)
        else:
            require(pin == baseline_inputs[name], "Protected92 input changed: " + name)
    input_names = scope_names(app, runtime_or_qa)
    require(set(input_names) == {n for n in expected if runtime_or_qa(n)}, "Unpinned runtime/QA input or missing input")
    all_input_names = scope_names(app, nongenerated_input)
    require(set(all_input_names) == set(expected), "Unmanifested application file outside explicit generated/checkpoint exclusions")
    for name in KNOWN_CHECKPOINT_METADATA:
        remember(safe_path(app, name))
    frozen_path = qa / "frozen-inputs.json"
    same(read_json(frozen_path, PINS[EXPECTED_PATH]), expected, "QA frozen inputs")
    canonical_digest = sha_text(json.dumps(expected, sort_keys=True, separators=(",", ":")))
    freeze = read_json(qa / "freeze-receipt.json")
    require(freeze["fileCount"] == 1650 and freeze["frozenInputManifestSHA256"] == PINS[EXPECTED_PATH] and freeze["canonicalDigest"] == canonical_digest, "Wrong93 freeze receipt")
    same(freeze["changedOrAddedFiles"], {name: row["sha256"] for name, row in changed.items()}, "Freeze change list")
    commands = {
        "non_http_tests": ["node", "--import", "tsx", "--test", "--test-concurrency=1", *sorted(n for n in expected if re.fullmatch(r"tests/[^/]+\.test\.ts", n) and n != "tests/local-review.test.ts")],
        "local_http_tests": ["node", "--import", "tsx", "--test", "tests/local-review.test.ts"],
        "typecheck": ["node", "node_modules/typescript/bin/tsc", "--noEmit"],
        "lint": ["node", "node_modules/eslint/bin/eslint.js", "src", "tests", "scripts"],
        "validation": ["node", "--import", "tsx", "scripts/validate.ts"],
        "production_build": ["node", "node_modules/next/dist/bin/next", "build"],
        "portable_build": ["node", "--import", "tsx", "scripts/build-portable.ts"],
    }
    qa_result = {}
    qa_receipts = {}
    previous_end = instant(freeze["atUTC"])
    for stage in STAGES:
        receipt = read_json(qa / (stage + ".json"))
        qa_receipts[stage] = receipt
        require(receipt["schema"] == "roadmark-stage93-receipt-v1" and type(receipt["checkpoint"]) is int and receipt["checkpoint"] == 93 and receipt["stage"] == stage, "Wrong93 stage receipt: " + stage)
        require(type(receipt["exitCode"]) is int and receipt["exitCode"] == 0, "QA stage not successful: " + stage)
        same(receipt["command"], commands[stage], "Exact QA command " + stage)
        require(Path(receipt["cwd"]).resolve() == app, "QA cwd mismatch")
        require(receipt["frozenInputManifestSHA256"] == PINS[EXPECTED_PATH] and receipt["frozenInputDigestBefore"] == receipt["frozenInputDigestAfter"] == canonical_digest, "QA frozen input drift")
        start, end = instant(receipt["startedAtUTC"]), instant(receipt["finishedAtUTC"])
        require(previous_end <= start <= end <= dt.datetime.now(dt.timezone.utc), "QA stages out of order or future dated")
        previous_end = end
        log_ref = receipt["log"]
        require(set(log_ref) == {"path", "sha256", "bytes"}, "Invalid stage log reference")
        log_file = safe_path(workspace, log_ref["path"])
        require(log_file == qa / (stage + ".log"), "Stage log from wrong attempt")
        remember(log_file, log_ref["sha256"])
        require(type(log_ref["bytes"]) is int and log_file.stat().st_size == log_ref["bytes"], "Stage log size mismatch")
        log = log_file.read_text(encoding="utf-8")
        summary = {"exitCode": 0, "startedAtUTC": receipt["startedAtUTC"], "finishedAtUTC": receipt["finishedAtUTC"]}
        if stage in {"non_http_tests", "local_http_tests"}:
            tallies = {}
            for field in ("tests", "pass", "fail", "cancelled", "skipped", "todo"):
                matches = re.findall(r"^(?:#|ℹ) " + field + r" (\d+)\s*$", log, re.M)
                require(len(matches) == 1, "Missing/ambiguous complete test summary: " + stage + "/" + field)
                tallies[field] = int(matches[0])
            require(tallies["tests"] == tallies["pass"] > 0 and all(tallies[k] == 0 for k in ("fail", "cancelled", "skipped", "todo")), "Incomplete/failing test suite")
            summary["tallies"] = tallies
        if stage == "production_build":
            require(re.search(r"Generating static pages[^\n]*\(389/389\)", log) is not None, "Missing complete389-page production terminal")
            require(re.search(r"(?:○|●)\s+/market(?:\s|$)", log) is not None, "Missing emitted static /market route")
        if stage == "validation":
            validation = strict_json(log)
            same(validation, {"result": "PASS", "counts": {"variants": 343, "families": 149, "generations": 153, "criteria": 69, "evidence": 23667, "current": 327, "outgoing": 11, "provisional": 5}, "sourceReferences": 2196, "publicationIssues": 15, "sha256": "010ded194b4d61cd7be606ce0cc332fa7e32906bba70abff2b5c38541e634657", "approvedExternalAssets": 0, "note": "Structural integrity, not independent factual verification."}, "Actual validation JSON PASS/counts/source hash")
            summary["validation"] = validation
        if stage == "portable_build":
            require("Portable Roadmark experience written (" in log and "index.html and index-b.html retain the Model Y hero above discovery" in log, "Missing portable build success terminal")
        qa_result[stage] = summary
    # All seven genuine93 terminal receipts must exist before outputs are read.
    artifact_names = scope_names(app, artifact)
    artifacts = {name: sha_file(safe_path(app, name)) for name in artifact_names}
    for name, pin in artifacts.items():
        remember(app / name, pin)
    # The unchanged active QA runner did not itself hash outputs. Require the
    # separately reviewed root observer's real terminal and pre/post binding.
    remember(safe_path(workspace, OBSERVER_FILE), OBSERVER_SHA)
    remember(safe_path(workspace, RUNNER_FILE), RUNNER_SHA)
    remember(safe_path(workspace, OBSERVER_WRAPPER_FILE), OBSERVER_WRAPPER_SHA)
    prebuild = read_json(safe_path(workspace, PREBUILD_FILE), PREBUILD_SHA)
    binding_path = safe_path(workspace, binding_name)
    observation_dir = binding_path.parent
    binding = read_json(binding_path, binding_sha)
    require(binding["schemaVersion"] == "roadmark.market93-root-build-output-binding.v1" and binding["passed"] is True and type(binding["checkpoint"]) is int and binding["checkpoint"] == 93, "No successful actual93 output binding")
    require(binding["observerSHA256"] == OBSERVER_SHA and binding["runnerSHA256"] == RUNNER_SHA and binding["prebuildObservationSHA256"] == PREBUILD_SHA and binding["frozenInputManifestSHA256"] == PINS[EXPECTED_PATH], "Wrong observer/runner/prebuild/input binding")
    require(binding["coreProducerMtimesWithinStages"] is True and binding["mtimeAllowanceSeconds"] == 2, "Missing bounded core-output timestamp checks")
    terminal = read_json(safe_path(workspace, terminal_name), terminal_sha)
    require(terminal["schemaVersion"] == "roadmark.market93-root-observer-terminal.v1" and type(terminal["checkpoint"]) is int and terminal["checkpoint"] == 93 and type(terminal["exitCode"]) is int and terminal["exitCode"] == 0, "Observer lacks genuine successful root terminal")
    require(terminal["observerSHA256"] == OBSERVER_SHA and terminal["buildBindingSHA256"] == binding_sha and Path(terminal["cwd"]).resolve() == workspace, "Observer terminal does not bind this script/output/workspace")
    command = ["python", "-B", str(workspace / OBSERVER_FILE), "--workspace", str(workspace), "--output", observation_dir.relative_to(workspace).as_posix(), "--approved-observer-sha256", OBSERVER_SHA]
    same(terminal["command"], command, "Exact independently reviewed observer invocation")
    terminal_log = terminal["log"]
    require(set(terminal_log) == {"path", "sha256", "bytes"}, "Invalid observer terminal log reference")
    log_path = remember(safe_path(workspace, terminal_log["path"]), terminal_log["sha256"])
    require(log_path.stat().st_size == terminal_log["bytes"] and "PASS: genuine93 build output observation completed" in log_path.read_text(encoding="utf-8"), "Observer terminal log has no successful completion")
    observer_start = read_json(observation_dir / "observer-start.json", binding["observerStartSHA256"])
    require(observer_start["schemaVersion"] == "roadmark.market93-build-observer-start.v1" and observer_start["startMode"] == "pinned-trusted-root-prebuild-capture" and observer_start["productionTerminalAbsentAtObserverStart"] is True, "Observer start not established before production terminal")
    require(observer_start["observerSHA256"] == OBSERVER_SHA and observer_start["frozenInputManifestSHA256"] == PINS[EXPECTED_PATH], "Observer start pins mismatch")
    same(observer_start["prebuildObservation"], {"path": PREBUILD_FILE, "sha256": PREBUILD_SHA}, "Observer trusted prebuild reference")
    same(observer_start["runner"], {"path": RUNNER_FILE, "sha256": RUNNER_SHA}, "Observer runner reference")
    # sys.argv omits the interpreter and -B; validate both root command and the
    # actual observer's saved argument vector.
    same(observer_start["argv"], command[2:], "Observed argument vector")
    observer_execution = read_json(observation_dir / "execution-request.json")
    require(observer_execution["observerSHA256"] == OBSERVER_SHA, "Observer execution request pin differs")
    same(observer_execution["argv"], command[2:], "Observer execution request argv")
    require(prebuild["productionStageNotStarted"] is True and prebuild["runnerSHA256"] == RUNNER_SHA, "Wrong trusted root prebuild provenance")
    require(set(prebuild["artifacts"]) == set(baseline_artifacts) | {".next/server/app-paths-manifest.json"} and all(prebuild["artifacts"][name]["sha256"] == pin for name, pin in baseline_artifacts.items()), "Root prebuild capture is not exact verified92 artifact baseline")
    production = qa_receipts["production_build"]
    portable = qa_receipts["portable_build"]
    require(instant(prebuild["observedAtUTC"]) <= instant(production["startedAtUTC"]) and instant(terminal["startedAtUTC"]) <= instant(observer_execution["startedAtUTC"]) <= instant(observer_start["startedAtUTC"]) <= instant(production["finishedAtUTC"]), "Prebuild/observer timing does not bind producer")
    require(observer_start["initialBuildID"] == prebuild["buildID"] and observer_start["initialOutputCount"] == len(prebuild["artifacts"]) == 2463, "Observer starting artifact identity differs")
    produced = read_json(observation_dir / "production-artifacts.json", binding["productionArtifactMapSHA256"])
    aliases_observed = read_json(observation_dir / "portable-artifacts.json", binding["portableArtifactMapSHA256"])
    production_observation = read_json(observation_dir / "production-observation.json", binding["productionObservationSHA256"])
    require(production_observation["schemaVersion"] == "roadmark.market93-production-observation.v1" and production_observation["artifactMapSHA256"] == binding["productionArtifactMapSHA256"] and production_observation["coreProducerMtimesWithinStage"] is True and production_observation["mtimeAllowanceSeconds"] == 2, "Wrong production observation")
    for stage, receipt in (("production_build", production), ("portable_build", portable)):
        observed_ref = binding["productionReceipt" if stage == "production_build" else "portableReceipt"]
        expected_path = (qa / (stage + ".json")).relative_to(workspace).as_posix()
        require(observed_ref["path"] == expected_path and observed_ref["sha256"] == evidence[expected_path], "Observer used a different producer receipt")
        same(observed_ref["log"], receipt["log"], "Observed actual producer log")
        require(instant(receipt["finishedAtUTC"]) <= instant(observed_ref["observedAtUTC"]), "Receipt observed before completion")
    same(production_observation["receipt"], binding["productionReceipt"], "Separate production observation receipt")
    require(instant(binding["productionReceipt"]["observedAtUTC"]) <= instant(production_observation["captureStartedAtUTC"]) <= instant(production_observation["captureFinishedAtUTC"]), "Production capture time order")
    require(instant(binding["portableReceipt"]["observedAtUTC"]) <= instant(binding["portableCaptureStartedAtUTC"]) <= instant(binding["portableCaptureFinishedAtUTC"]) <= instant(binding["finishedAtUTC"]) <= instant(terminal["finishedAtUTC"]) <= dt.datetime.now(dt.timezone.utc), "Portable/binding/terminal time order")
    require(set(aliases_observed) == set(ALIASES) and not set(produced) & set(ALIASES), "Observation map scopes overlap/differ")
    observed = {**produced, **aliases_observed}
    require(set(observed) == set(artifacts) and binding["artifactCount"] == len(artifacts), "Observation/current artifact membership differs")
    for name, row in observed.items():
        actual_stat = (app / name).stat()
        observed_metadata_matches(row, artifacts[name], actual_stat.st_size, actual_stat.st_mtime_ns)
    core_production = (".next/BUILD_ID", ".next/prerender-manifest.json", ".next/routes-manifest.json", ".next/server/app-paths-manifest.json", ".next/server/app/market.html", ".next/server/app/market/page.js", ".next/server/app/market/page/app-paths-manifest.json")
    for names, receipt in ((core_production, production), (ALIASES, portable)):
        for name in names:
            producer_mtime_matches(observed[name]["mtimeNs"], receipt["startedAtUTC"], receipt["finishedAtUTC"])
    require(all(artifacts.get(name) == artifacts.get("index.html") for name in ALIASES), "Four emitted aliases differ")
    require(artifacts["index.html"] != PINS[BASE_HTML_PATH], "Old92 portable cannot be relabeled93")
    require(artifacts[".next/BUILD_ID"] != baseline_artifacts[".next/BUILD_ID"], "Old92 production build cannot be relabeled93")
    baseline = parts((workspace / BASE_HTML_PATH).read_text(encoding="utf-8"))
    current = parts((app / "index.html").read_text(encoding="utf-8"))
    require(tuple(baseline[i] for i in (0, 2, 3, 4)) == tuple(current[i] for i in (0, 2, 3, 4)), "Portable HTML/CSS shell, hero flag, or emitted JavaScript changed")
    js_hash = sha_text(current[3][len("window.__EV_B=true;"):])
    require(js_hash == baseline_proof["runtime"]["emittedJavascriptSHA256"], "Emitted JS differs from verified92 runtime anchor")
    encoded_hash = sha_text(current[1])
    old = decode(baseline[1])
    new = decode(current[1])
    del baseline, current
    require(type(old) is dict and type(new) is dict and set(old) == set(new) == PAYLOAD_KEYS, "Wrong complete portable payload schema")
    for key in PAYLOAD_KEYS - {"marketInventory"}:
        same(old[key], new[key], "Complete protected payload " + key)
    fixture = read_json(app / "qa/checkpoint93-market-fixture.json")
    require(fixture["schemaVersion"] == "roadmark.checkpoint93.market-lead.v1", "Wrong reviewed fixture schema")
    check_market(old["marketInventory"], new["marketInventory"], fixture)
    same(new["marketInventory"], read_json(app / "data/market-inventory-2026-10-10.json"), "Actual emitted market equals reviewed source JSON")
    same(fixture["previousMetadata"], {k: v for k, v in old["marketInventory"].items() if k not in {"records", "unverifiedLeads"}}, "Fixture preserves complete92 metadata")
    require(len(new["cars"]) == len(new["packs"]) == 343 and len(new["research"]["sources"]) == 2196, "Catalogue counts changed")
    cars = [pack["car"] for pack in new["packs"].values()]
    require(len({car.get("modelFamily") or car["family"] for car in cars}) == 149, "Family count changed")
    require(not any("deepway" in (car["brand"] + " " + car["model"]).lower() for car in cars + new["cars"]), "Deepway admitted to catalogue")
    detail_routes = {"/cars/" + car["family"] + "/" + car["slug"] for car in cars}
    require(len(detail_routes) == 343, "Duplicate detail route")
    del old, new
    prerender = read_json(app / ".next/prerender-manifest.json")
    require(artifacts[".next/routes-manifest.json"] == baseline_artifacts[".next/routes-manifest.json"], "Production routing policy differs from verified92")
    routing = read_json(app / ".next/routes-manifest.json")
    same([row for row in routing["staticRoutes"] if row["page"] == "/market"], [{"page": "/market", "regex": "^/market(?:/)?$", "routeKeys": {}, "namedRegex": "^/market(?:/)?$"}], "Actual /market routing entry")
    require(prerender["version"] == 4 and "/market" in prerender["routes"], "Missing production /market prerender")
    require({route for route in prerender["routes"] if route.startswith("/cars/")} == detail_routes, "Production detail route set differs from retained343cars")
    for route in detail_routes | {"/market"}:
        row = prerender["routes"][route]
        require(row["routeType"] == "page" and row["compute"] == "static" and row["response"] == "complete" and row["initialRevalidateSeconds"] is False, "Incomplete/nonstatic production route")
        require(".next/server/app" + route + ".html" in artifacts, "Missing actual detail/market HTML")
    emitted_details = {"/" + name[len(".next/server/app/"):-len(".html")] for name in artifacts if name.startswith(".next/server/app/cars/") and name.endswith(".html")}
    require(emitted_details == detail_routes, "Extra/missing production detail HTML")
    route_manifest = read_json(app / ".next/server/app/market/page/app-paths-manifest.json")
    same(route_manifest, {"/market/page": "app/market/page.js"}, "Actual production market route binding")
    require(".next/server/app/market/page.js" in artifacts, "Missing emitted production market JS")
    app_routes = read_json(app / ".next/server/app-paths-manifest.json")
    require(app_routes["/market/page"] == "app/market/page.js", "Production app manifest market mismatch")
    market = VisibleHTML((app / ".next/server/app/market.html").read_text(encoding="utf-8"))
    visible_market = market.normalized()
    require("Checked 2026-10-10 · 241 additional model records · Audit incomplete" in visible_market and "241 model records." in visible_market, "Actual static market date/count/caveat changed")
    require("deepway" not in visible_market.lower(), "Deepway visible market card unexpectedly added")
    home = VisibleHTML((app / ".next/server/app/index.html").read_text(encoding="utf-8"))
    require("Tesla Model Y is the EV car of the year" in home.normalized() and home.verdicts == 9, "Original production hero or nine reasons missing")
    for target in ("detail-adas_optional", "chapter-07", "detail-safety_ancap", "detail-supercharger_access", "detail-boot_l", "detail-bidirectional_v2g", "detail-sentry_parked_recording", "chapter-05", "detail-pet_mode"):
        require(target in home.ids and "#" + target in home.hrefs, "Original hero target missing: " + target)
    # Evidence membership and bytes must still match after the entire check.
    require(scope_names(app, runtime_or_qa) == input_names and scope_names(app, nongenerated_input) == all_input_names and scope_names(app, artifact) == artifact_names, "Input/artifact membership changed during verification")
    for name, pin in evidence.items():
        require(sha_file(safe_path(workspace, name)) == pin, "File drift during verification: " + name)
    for name, row in observed.items():
        actual_stat = (app / name).stat()
        observed_metadata_matches(row, artifacts[name], actual_stat.st_size, actual_stat.st_mtime_ns)
    require(sha_file(Path(__file__).resolve()) == verifier_sha, "Verifier changed during verification")
    write_json(output / "evidence-pins.json", evidence)
    write_json(output / "artifact-pins.json", artifacts)
    write_json(output / "proof.json", {
        "schemaVersion": "roadmark.market93-emitted-output-proof.v1", "passed": True,
        "checkedAtUTC": dt.datetime.now(dt.timezone.utc).isoformat(), "verifierSHA256": verifier_sha,
        "checkpoint": 93, "baselineCheckpoint": 92, "frozenInputCount": 1650,
        "frozenInputManifestSHA256": PINS[EXPECTED_PATH], "candidateManifestSHA256": PINS[CANDIDATE_PATH],
        "baselinePortableSHA256": PINS[BASE_HTML_PATH], "portableSHA256": artifacts["index.html"],
        "encodedPortableDataSHA256": encoded_hash, "emittedJavascriptSHA256": js_hash,
        "actual93ProductionBuildID": (app / ".next/BUILD_ID").read_text(encoding="utf-8").strip(),
        "qa": qa_result, "artifactCount": len(artifacts),
        "rootBuildObservationVerified": True, "buildOutputBindingSHA256": binding_sha,
        "observerTerminalSHA256": terminal_sha, "observerSHA256": OBSERVER_SHA,
        "observerWrapperSHA256": OBSERVER_WRAPPER_SHA,
        "prebuildObservationSHA256": PREBUILD_SHA, "qaRunnerSHA256": RUNNER_SHA,
        "allNongeneratedApplicationInputsManifested": True,
        "explicitInputMembershipExclusions": ["node_modules/**", ".git/**", ".next/**", *ALIASES, *sorted(KNOWN_CHECKPOINT_METADATA), "tsconfig.tsbuildinfo"],
        "exactSevenReviewedInputChanges": True,
        "wholeDecodedNonmarketPayloadExactlyEqualTo92": True,
        "all343CarsAndPacksExactlyEqualTo92": True, "all2196SourcesExactlyEqualTo92": True,
        "all241MarketRecordsExactlyEqualTo92": True, "exactHeldLeadAppendAndArtifactCount144And18": True,
        "actualPortablePayloadMatchesApproved93Delta": True,
        "marketDelta": {"changedTopFields": ["counts", "sourceArtifacts", "unverifiedLeads"], "records": 241, "priorLeadsPreserved": 143, "leads": 144, "sourceArtifacts": 18, "globalCheckedAt": "2026-10-10", "complete": False},
        "catalogue": {"configurations": 343, "families": 149, "sources": 2196, "detailHTMLPages": 343},
        "fourPortableAliasesByteIdentical": True, "portableJavaScriptAndHTMLCSSShellUnchanged": True,
        "originalShippedSourcePublicMediaAssetsUnchanged": True, "embeddedArtExactlyEqualTo92": True,
        "productionMarketManifestAndStaticHTMLInspected": True, "originalProductionHeroNineTargetsPresent": True,
        "newDeepwayCatalogueCardTrimOrRankAdmission": False,
        "deepwayAbsentFromCatalogueAndAuditedMarketCards": True,
        "boundary": "Actual emitted JSON and portable JavaScript comparison, full frozen-source pins and selected production artifacts tied to a separately reviewed trusted root prebuild/postreceipt observation. Selected artifact coverage is portable aliases, .next/server/app, .next/static and explicit route/build manifests; .next/server/chunks and caches are excluded. Production checks are static HTML/manifest inspection only. Existing92 runtime proof is inherited only for byte-identical portable executable code and equal protected payload; no new93 application module execution, rank recomputation, runtime mutation suite, hydrated browser, phone, deployment, save receipt or release verification is claimed.",
        "new93RuntimeProofExecuted": False, "browserVerified": False, "phoneVerified": False, "releaseApproved": False,
        "evidencePinsSHA256": sha_file(output / "evidence-pins.json"), "artifactPinsSHA256": sha_file(output / "artifact-pins.json"),
    })


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workspace", required=True)
    parser.add_argument("--qa-directory", required=True, help="Workspace-relative completed genuine93 QA attempt directory")
    parser.add_argument("--output", required=True, help="New workspace-relative directory outside the application")
    parser.add_argument("--approved-verifier-sha256", required=True, help="Independent-review/root-approved SHA256 of this exact script")
    parser.add_argument("--build-output-binding", required=True, help="Workspace-relative actual successful observer binding")
    parser.add_argument("--build-output-binding-sha256", required=True)
    parser.add_argument("--observer-terminal", required=True, help="Workspace-relative genuine root observer terminal receipt")
    parser.add_argument("--observer-terminal-sha256", required=True)
    args = parser.parse_args()
    workspace = Path(args.workspace).resolve()
    require(HEX.fullmatch(args.approved_verifier_sha256) is not None and sha_file(Path(__file__).resolve()) == args.approved_verifier_sha256, "Externally approved verifier SHA256 mismatch")
    require(HEX.fullmatch(args.build_output_binding_sha256) is not None and HEX.fullmatch(args.observer_terminal_sha256) is not None, "External observation pins missing")
    require(args.output and not Path(args.output).is_absolute() and "\\" not in args.output and all(p not in {"", ".", ".."} for p in args.output.split("/")), "Unsafe output path")
    output = workspace / args.output
    require(not output.exists() and not output.is_symlink() and output.resolve().is_relative_to(workspace) and not output.resolve().is_relative_to(workspace / APP), "Output must be new and outside application")
    safe_path(workspace, output.parent.relative_to(workspace).as_posix(), directory=True)
    output.mkdir()
    write_json(output / "execution-request.json", {"startedAtUTC": dt.datetime.now(dt.timezone.utc).isoformat(), "argv": sys.argv, "verifierSHA256": args.approved_verifier_sha256, "noApplicationExecution": True})
    try:
        run(workspace, args.qa_directory, output, args.approved_verifier_sha256, args.build_output_binding, args.build_output_binding_sha256, args.observer_terminal, args.observer_terminal_sha256)
    except BaseException as error:
        write_json(output / "failure.json", {"schemaVersion": "roadmark.market93-emitted-output-failure.v1", "passed": False, "errorType": type(error).__name__, "error": str(error), "atUTC": dt.datetime.now(dt.timezone.utc).isoformat(), "traceback": traceback.format_exc(), "successProofNotEstablished": True})
        raise
    print("PASS: bounded93 emitted-output proof; runtime/browser/phone/release claims excluded")


if __name__ == "__main__":
    main()
