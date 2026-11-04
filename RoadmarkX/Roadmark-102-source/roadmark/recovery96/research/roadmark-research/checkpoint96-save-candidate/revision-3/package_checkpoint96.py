#!/usr/bin/env python3
"""ROOT-RUN ONLY: package a scoped checkpoint96 after genuine QA and observation.

Standard library only. No imports from the app, builds, browser, network, Git or
Library actions. Runs only the exact joiner that it ships, in an isolated local
reconstruction directory. All outputs are exclusive creates outside the app.
"""
import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import zipfile

APP = 'roadmark-work/roadmark'
ALIASES = ('index.html', 'index-b.html', 'public/index.html', 'public/index-b.html')
PRODUCTION = ('.next/BUILD_ID', '.next/prerender-manifest.json', '.next/routes-manifest.json', '.next/server/app-paths-manifest.json')
METADATA = ('CHECKPOINT-PREVIEW-MANIFEST.json', 'CHECKPOINT-SOURCE-MANIFEST.json', 'OPEN-PORTABLE-PREVIEW.txt')
STAGES = ('non_http_tests', 'local_http_tests', 'typecheck', 'lint', 'validation', 'production_build', 'portable_build')
CHUNK, POLICY = 16 * 1024 * 1024, 32 * 1024 * 1024
PINS = {
    'source95': ('roadmark-recovery/final95-attempt1/Roadmark-recovered-95-source.zip', 'e3a8478bc95321fecd3ad248b5f8f34c260a8124f3379bc346572b207cea4062'),
    'preview95': ('roadmark-recovery/final95-attempt1/Roadmark-recovered-95-portable-preview.zip', '802ddbb2721f7dd9229f6c4e33c61459546cf3dcc021d7adaaa237a5b92b7b90'),
    'saved95': ('roadmark-recovery/final95-review/correlated-save-receipt.json', 'f4cee255729bfc7db2a5bfef467cc9fcaa7dedcc7cb3955f3b05f9d0c566fee0'),
    'baselineInputs': ('roadmark-research/applied95/expected-inputs.json', '42e12fc28be57b321a7b05ce553f59cd19faed85161ee74dc0fb8122bc3b1c57'),
    'expectedInputs': ('roadmark-research/applied96/expected-inputs-revision3.json', '3dbb0442fcd4ac25c29ee489fa721b4bd8aa138601b0618c4256af6f37880c80'),
    'candidate': ('roadmark-research/discovery-prefetch96-candidate/revision-3/MANIFEST.json', '5af3f4bf5da3f7a7d73481d5d225b8835101f1e1b9eaa8ee01335cab2d100b60'),
    'runner': ('roadmark-research/qa96-candidate/revision-2/run_qa96.py', '927d4bdf6318b300c4f8581fb074eb929555b902e5dd355381fcafadc4d50ff3'),
    'failedQA1': ('roadmark-research/applied96/qa-attempt1/run-result.json', 'e112cd3fc9f267abfd6897aaeae725d52ef54476ae359771a69c5e367d9fd60a'),
    'failedExit1': ('roadmark-research/applied96/qa-attempt1-external-exit.json', 'b96354acbc04a205b6703fa882bc2882ad065e56754ec20163540f3ad36324f1'),
}
REQUIRED_RESEARCH = {
    'roadmark-research/applied96/application-receipt.json',
    'roadmark-research/applied96/application-revision2-receipt.json',
    'roadmark-research/applied96/application-revision3-receipt.json',
    'roadmark-research/applied96/focused-attempt3.log',
    'roadmark-research/applied96/typecheck-attempt3.log',
    'roadmark-research/applied96/historical-retry-attempt1.log',
    'roadmark-research/applied96/quick-checks-observation.json',
    'roadmark-research/applied96/typecheck-attempt1.log',
    'roadmark-research/applied96/typecheck-attempt2.log',
    'roadmark-research/applied96/focused-attempt1.log',
    'roadmark-research/applied96/focused-attempt2.log',
    'roadmark-research/applied96/lint-attempt1.log',
    'roadmark-research/review-prefetch96/REVIEW.md',
    'roadmark-research/review-prefetch96/REVISION-2-REVIEW.md',
    'roadmark-research/review-prefetch96/revision-3-verified-pins.json',
    'roadmark-research/review-prefetch96/REVISION-3-REVIEW.md',
    'roadmark-research/discovery-prefetch96-candidate/revision-2/REPORT.md',
    'roadmark-research/discovery-prefetch96-candidate/revision-2/correction.patch',
    'roadmark-research/discovery-prefetch96-candidate/revision-2/MANIFEST.json',
    'roadmark-research/discovery-prefetch96-candidate/revision-3/REPORT.md',
    'roadmark-research/discovery-prefetch96-candidate/revision-3/support.patch',
    'roadmark-research/applied96/qa-attempt1-external-exit.json',
    'roadmark-research/applied96/qa-attempt1-launch.stdout.log',
    'roadmark-research/applied96/qa-attempt1-launch.stderr.log',
    'roadmark-research/applied96/qa-attempt1/run-result.json',
    'roadmark-research/applied96/qa-attempt1/execution-request.json',
    'roadmark-research/applied96/qa-attempt1/frozen-inputs.json',
    'roadmark-research/applied96/qa-attempt1/non_http_tests-start.json',
    'roadmark-research/applied96/qa-attempt1/non_http_tests-terminal.json',
    'roadmark-research/applied96/qa-attempt1/non_http_tests.json',
    'roadmark-research/applied96/qa-attempt1/non_http_tests.stdout.log',
    'roadmark-research/applied96/qa-attempt1/non_http_tests.stderr.log',
    'roadmark-research/applied96/qa-attempt1/preexisting-outputs.json',
    'roadmark-research/applied96/qa-attempt1/protected-input-comparison.json',
    'roadmark-research/applied96/qa-attempt1/stage-plan.json',
    'roadmark-research/review-checkpoint96-save/REPORT.md',
    'roadmark-research/review-qa96/INITIAL-STATIC-REVIEW.md',
    'roadmark-research/review-qa96/REVISION2-STATIC-APPROVAL.md',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-discover-no-click-observation.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-discover-no-click.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18863-no-click.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18864-no-click.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-repeat-observation.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-complete-observation.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-selected-trim-cold-observation.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-selected-trim-cold.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18860-complete.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18861-complete.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18862-complete.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18863-complete.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/baseline95-18864-complete.jsonl',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/interruption-attempt1.log',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/interruption-attempt1-followup.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/repeat96a-scroll-observations.json',
    'roadmark-research/mobile-performance96-assessment/root-runtime-observations/repeat96b-scroll-observations.json',
}
ALLOWED_RESEARCH = ('roadmark-research/applied96/', 'roadmark-research/review-prefetch96/', 'roadmark-research/discovery-prefetch96-candidate/', 'roadmark-research/qa96-candidate/', 'roadmark-research/review-qa96/', 'roadmark-research/mobile-performance96-assessment/', 'roadmark-research/review-mobile-measurement96/', 'roadmark-research/initial-strengths96-assessment/', 'roadmark-research/checkpoint96-save-candidate/', 'roadmark-research/review-checkpoint96-save/', 'roadmark-recovery/final96-review/')
OPEN = {'phoneVerified': False, 'acceleratedWebGLVerified': False, 'fullJourneyVerified': False, 'fullVisualPassClaimed': False, 'sustainedStabilityClaimed': False, 'publicExportRun': False, 'releaseApproved': False, 'wholeProductionRuntimeGraphEquivalenceClaimed': False, 'independentServerByteVerificationPerformed': False}


def need(ok, message):
    if not ok:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def encoded(value):
    return (json.dumps(value, indent=2, sort_keys=True, allow_nan=False) + '\n').encode()


def decoded(raw):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            need(key not in result, 'Duplicate JSON key: ' + key)
            result[key] = value
        return result
    def invalid(value):
        raise ValueError('Non-finite JSON: ' + value)
    return json.loads(raw, object_pairs_hook=unique, parse_constant=invalid)


def name(value):
    need(type(value) is str and value and not Path(value).is_absolute() and '\\' not in value and all(x not in {'', '.', '..'} for x in value.split('/')), 'Unsafe relative path: ' + str(value))
    return value


def local(root, relative):
    parts = name(relative).split('/')
    need(not any(root.joinpath(*parts[:i]).is_symlink() for i in range(1, len(parts) + 1)), 'Symlink rejected: ' + relative)
    return root.joinpath(*parts)


def info(raw):
    return {'sha256': sha(raw), 'bytes': len(raw)}


def read(path):
    before = path.stat()
    need(stat.S_ISREG(before.st_mode), 'Not regular: ' + str(path))
    raw = path.read_bytes()
    after = path.stat()
    need(all(getattr(before, k) == getattr(after, k) for k in ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns')), 'Changed while reading: ' + str(path))
    return raw


def pinned(root, row):
    need(type(row.get('sha256')) is str and re.fullmatch('[0-9a-f]{64}', row['sha256']), 'Invalid digest')
    raw = read(local(root, row['path']))
    need(sha(raw) == row['sha256'] and ('bytes' not in row or len(raw) == row['bytes']), 'Pin mismatch: ' + row['path'])
    return raw


def write(path, raw):
    with path.open('xb') as target:
        target.write(raw)
        target.flush()
        os.fsync(target.fileno())


def zip_read(path):
    result = {}
    with zipfile.ZipFile(path) as archive:
        for item in archive.infolist():
            name(item.filename)
            need(item.filename not in result and not item.is_dir() and not item.flag_bits & 1, 'Duplicate/directory/encrypted ZIP member')
            need(stat.S_IFMT(item.external_attr >> 16) in (0, stat.S_IFREG), 'Nonregular ZIP member')
            result[item.filename] = archive.read(item)
    return result


def zip_write(path, files, stored=False):
    with zipfile.ZipFile(path, 'x', compression=zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED, compresslevel=None if stored else 6) as archive:
        for key, raw in sorted(files.items()):
            item = zipfile.ZipInfo(name(key), (2026, 10, 12, 0, 0, 0))
            item.external_attr = (stat.S_IFREG | 0o644) << 16
            item.compress_type = zipfile.ZIP_STORED if stored else zipfile.ZIP_DEFLATED
            archive.writestr(item, raw)
    need(zip_read(path) == files, 'ZIP readback mismatch: ' + str(path))


def inventory(files):
    return [dict(path=k, **info(v)) for k, v in sorted(files.items())]


def input_map(app):
    result = {}
    for folder, directories, files in os.walk(app, followlinks=False):
        directories[:] = [d for d in directories if d not in {'node_modules', '.git'} and (Path(folder) / d).relative_to(app).as_posix() != '.next']
        for child in directories:
            need(not (Path(folder) / child).is_symlink(), 'Application symlink rejected')
        for child in files:
            path = Path(folder) / child
            rel = path.relative_to(app).as_posix()
            if rel not in (*ALIASES, *METADATA, 'tsconfig.tsbuildinfo'):
                result[rel] = sha(read(local(app, rel)))
    return result


def verify_qa(root, app, binding, expected):
    raw = pinned(root, binding['qaResult'])
    qa, directory = decoded(raw), local(root, binding['qaResult']['path']).parent
    need(qa['schema'] == 'roadmark96.serial-qa.v1' and qa['passed'] is True and qa['publicExportRun'] is False, 'Full current QA not established')
    need(qa['runnerSHA256'] == PINS['runner'][1], 'Unreviewed runner')
    for key in ('baselineInputs', 'expectedInputs', 'candidate'):
        need(qa['configuration'][key] == dict(zip(('path', 'sha256'), PINS[key])), 'QA configuration differs')
    digest = sha(json.dumps(expected, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())
    need(qa['frozenInputDigest'] == digest and decoded(read(directory / 'frozen-inputs.json')) == expected, 'QA source map differs')
    evidence = {}
    for filename, row in qa['evidence'].items():
        need(Path(name(filename)).name == filename, 'QA evidence must be flat')
        path = local(directory, filename)
        data = read(path)
        need(info(data) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'QA evidence drift: ' + filename)
        evidence[path.relative_to(root).as_posix()] = data
    need({p.name for p in directory.iterdir()} == set(qa['evidence']) | {'run-result.json'}, 'QA attempt membership differs')
    need(set(qa['stageReceipts']) == set(qa['stageStatus']) == set(STAGES), 'Incomplete QA stage inventory')
    plan = decoded(read(directory / 'stage-plan.json'))
    need(plan['serialOrder'] == list(STAGES), 'Stages not serial')
    previous_finish = 0
    tallies = {}
    for stage in STAGES:
        need(qa['stageStatus'][stage] == 'passed', 'QA stage not passed: ' + stage)
        row = qa['stageReceipts'][stage]
        receipt = decoded(pinned(directory, row))
        need(receipt['stage'] == stage and receipt['passed'] is True and receipt['inputDigestBefore'] == receipt['inputDigestAfter'] == digest and receipt['sourceError'] is None and receipt['outputOrTestError'] is None, 'Invalid QA stage receipt')
        terminal = decoded(pinned(directory, {'path': receipt['terminal'], 'sha256': receipt['terminalSHA256']}))
        need(terminal['stage'] == stage and terminal['returnCode'] == terminal['exitCode'] == 0 and terminal['signal'] is None and terminal['error'] is None and terminal['interrupted'] is False and terminal['cleanupSignals'] == [] and terminal['groupCleanup'] is None, 'Process terminal not an ordinary successful exit')
        need(terminal['command'] == plan['commands'][stage] and terminal['cwd'] == str(app) and type(terminal['processId']) is int and terminal['processId'] > 0, 'Process launch mismatch')
        need(previous_finish <= terminal['startedEpochNs'] <= terminal['finishedEpochNs'] and terminal['spawnedAtUTC'], 'Invalid stage timing')
        previous_finish = terminal['finishedEpochNs']
        for stream in ('stdout', 'stderr'):
            pinned(directory, terminal[stream])
        if stage in STAGES[:2]:
            text = pinned(directory, terminal['stdout']).decode()
            summary = {}
            for counter in ('tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo'):
                hits = re.findall(r'^# ' + counter + r' (\d+)\r?$', text, re.M)
                need(len(hits) == 1, 'Missing/ambiguous TAP count')
                summary[counter] = int(hits[0])
            need(summary == receipt['testSummary'] and summary['tests'] > 0 and summary['pass'] == summary['tests'] and all(summary[k] == 0 for k in ('fail', 'cancelled', 'skipped', 'todo')), 'TAP failure or incomplete count')
            tallies[stage] = summary
        if stage in STAGES[-2:]:
            observed = decoded(read(directory / receipt['outputObservation']))
            names = PRODUCTION if stage == 'production_build' else ALIASES
            need(observed['stage'] == stage and observed['producerTerminalSHA256'] == receipt['terminalSHA256'] and set(observed['artifacts']) == set(names), 'Output producer binding differs')
            for rel in names:
                artifact = observed['artifacts'][rel]
                need(artifact == qa['artifacts'][rel] and terminal['startedEpochNs'] - 2_000_000_000 <= artifact['mtimeNs'] <= terminal['finishedEpochNs'] + 2_000_000_000, 'Output freshness/binding differs')
    need(set(qa['artifacts']) == set(PRODUCTION + ALIASES), 'Wrong QA output scope')
    for rel, row in qa['artifacts'].items():
        path = local(app, rel)
        need(info(read(path)) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Current output differs from QA: ' + rel)
    need(len({(qa['artifacts'][p]['sha256'], qa['artifacts'][p]['bytes']) for p in ALIASES}) == 1, 'Portable aliases differ')
    need(read(app / '.next/BUILD_ID').decode().strip() == qa['actualBuildID'] and qa['actualBuildID'] != 'GBi2ZoKnrPlQiT3VGNxcB', 'Current BUILD_ID not fresh96')
    external = decoded(pinned(root, binding['externalRunnerObservation']))
    need(external['schemaVersion'] == 'roadmark96.external-runner-observation.v1' and external['qaResultSHA256'] == sha(raw) and external['runnerSHA256'] == PINS['runner'][1] and external['exitCode'] == 0 and external['actualTerminalReviewed'] is True and external['observedAtUTC'], 'Actual external runner exit not established')
    pinned(root, external['terminalEvidence'])
    evidence[binding['qaResult']['path']] = raw
    evidence[external['terminalEvidence']['path']] = pinned(root, external['terminalEvidence'])
    return qa, tallies, evidence


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', required=True, type=Path)
    parser.add_argument('--binding', required=True)
    parser.add_argument('--binding-sha256', required=True)
    parser.add_argument('--approved-packager-sha256', required=True)
    parser.add_argument('--approved-joiner-sha256', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    root = args.workspace.resolve()
    app = local(root, APP)
    need(sha(read(Path(__file__))) == args.approved_packager_sha256, 'Packager approval pin differs')
    joiner_path = Path(__file__).parent / 'join_recovered96_source.py'
    joiner_raw = read(joiner_path)
    need(sha(joiner_raw) == args.approved_joiner_sha256, 'Joiner approval pin differs')
    binding_raw = pinned(root, {'path': args.binding, 'sha256': args.binding_sha256})
    binding = decoded(binding_raw)
    need(binding['schemaVersion'] == 'roadmark96.save-inputs.v1' and binding['rootReviewed'] is True and binding['allKnownFailedAndRetryEvidenceListed'] is True and binding['noConcurrentAppWriters'] is True, 'Root input review/exclusivity required')
    anchors = {key: pinned(root, {'path': path, 'sha256': digest}) for key, (path, digest) in PINS.items()}
    need(len(anchors['source95']) == 34143193 and len(anchors['preview95']) == 16057932, 'Wrong95 fallback sizes')
    failed = decoded(anchors['failedQA1'])
    failed_directory = local(root, PINS['failedQA1'][0]).parent
    need(failed['passed'] is False and failed['stageStatus'] == {stage: ('failed' if stage == 'non_http_tests' else 'not_started') for stage in STAGES}, 'Retained failure status was rewritten')
    need({p.name for p in failed_directory.iterdir()} == set(failed['evidence']) | {'run-result.json'}, 'Retained failure attempt membership differs')
    for filename, row in failed['evidence'].items():
        need(Path(name(filename)).name == filename, 'Failed evidence must be flat')
        path = local(failed_directory, filename)
        need(info(read(path)) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Retained failed attempt drifted')
    failed_exit = decoded(anchors['failedExit1'])
    need(failed_exit['qaResultSHA256'] == PINS['failedQA1'][1] and failed_exit['exitCode'] == 1 and failed_exit['actualTerminalReviewed'] is True, 'Retained external failure differs')
    saved95 = decoded(anchors['saved95'])
    need(saved95['librarySavesComplete'] is True and saved95['applicationCheckpoint'] == 95, 'Verified saved95 fallback required')
    baseline, expected, candidate = (decoded(anchors[key]) for key in ('baselineInputs', 'expectedInputs', 'candidate'))
    need(len(baseline) == 1659 and len(expected) == 1662, 'Wrong input count')
    rows = {row['path']: row for row in candidate['files']}
    need(len(candidate['files']) == 6 and set(rows) == {'src/components/discovery.tsx', 'src/portable/link.tsx', 'tests/discovery-prefetch.test.ts', 'tests/helpers/checkpoint91-history.ts', 'tests/helpers/checkpoint96-source-history.ts', 'tests/checkpoint96-source-history.test.ts'}, 'Unexpected cumulative revision3 delta')
    wanted = dict(baseline)
    for rel, row in rows.items():
        need(baseline.get(rel) == row['beforeSHA256'], 'Replacement preimage mismatch')
        wanted[rel] = row['sha256']
        need(info(read(local(app, rel))) == {k: row[k] for k in ('sha256', 'bytes')}, 'Applied delta differs')
    need(wanted == expected == input_map(app), 'Current source scope differs')
    qa, tallies, evidence = verify_qa(root, app, binding, expected)
    browser_raw = pinned(root, binding['scopedBrowserMeasurement'])
    browser = decoded(browser_raw)
    portable = qa['artifacts'][ALIASES[0]]
    need(browser['schemaVersion'] == 'roadmark96.scoped-browser-measurement.v1' and browser['checkpoint'] == 96 and browser['browser'] == 'own VM Chromium' and browser['observedAtUTC'], 'Actual scoped observation required')
    need(browser['productionBuildID'] == qa['actualBuildID'] and browser['portableSHA256'] == portable['sha256'] and browser['portableBytes'] == portable['bytes'] and browser['baselineSourceSHA256'] == PINS['source95'][1] and browser['baselinePreviewSHA256'] == PINS['preview95'][1], 'Observed artifact identity differs')
    need(all(browser.get(k) is v for k, v in OPEN.items()), 'Observation overstates verification')
    need(browser['observations'] and browser['limitations'] and browser['comparisons'], 'Actual observations/comparisons/caveats required')
    disposition = browser['optimizationDisposition']
    need(disposition['decision'] in {'retain_scoped', 'experimental_unaccepted'} and type(disposition['measurementSupportsRetention']) is bool and disposition['reason'], 'Explicit measurement-based disposition required')
    need(disposition['decision'] != 'retain_scoped' or disposition['measurementSupportsRetention'] is True, 'QA alone cannot justify retaining an optimization')
    for comparison in browser['comparisons']:
        need(all(k in comparison for k in ('metric', 'baseline', 'after', 'units', 'protocolAndCaveats', 'baselineEvidence', 'afterEvidence')), 'Incomplete actual comparison')
        need(comparison['metric'] and comparison['units'] and comparison['protocolAndCaveats'] and comparison['baseline'] is not None and comparison['after'] is not None, 'Empty comparison')
        for field in ('baselineEvidence', 'afterEvidence'):
            ref = comparison[field]
            evidence[ref['path']] = pinned(root, ref)
    for field in ('externalRunnerObservation', 'scopedBrowserMeasurement'):
        row = binding[field]
        evidence[row['path']] = pinned(root, row)
    listed = set()
    for row in binding['researchFiles']:
        need(row['path'] not in listed, 'Duplicate research reference')
        listed.add(row['path'])
        evidence[row['path']] = pinned(root, row)
    need(REQUIRED_RESEARCH <= listed, 'Required failed/retry/source-review history omitted')
    # Explicitly freeze everything selected for the concise research supplement.
    for key in ('candidate', 'expectedInputs', 'runner'):
        evidence[PINS[key][0]] = anchors[key]
    evidence[args.binding] = binding_raw
    for path, raw in evidence.items():
        lower = path.lower()
        need(path.startswith(ALLOWED_RESEARCH) and Path(path).suffix.lower() in {'.json', '.jsonl', '.log', '.md', '.txt', '.py', '.mjs', '.patch'}, 'Unapproved research path/type: ' + path)
        need(not any(x in lower for x in ('capture', 'screenshot', 'private', 'secret', 'queue', 'mercedes', 'technical-candidate')), 'Sensitive/raw/unrelated research path rejected: ' + path)
        need(len(raw) <= 2 * 1024 * 1024, 'Research file exceeds concise limit: ' + path)
        raw.decode('utf-8')
    need(sum(map(len, evidence.values())) <= 12 * 1024 * 1024, 'Research supplement exceeds12MiB')
    prior = zip_read(local(root, PINS['source95'][0]))
    old_manifest = prior['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']
    old = decoded(old_manifest)
    prior_inventory = {r['path']: {'sha256': r['sha256'], 'bytes': r['bytes']} for r in old['files']}
    need(set(prior) == set(prior_inventory) | {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json'}, 'Prior source inventory differs')
    need(all(info(prior[p]) == row for p, row in prior_inventory.items()), 'Prior payload drift')
    need(old['pairId'] == saved95['pairId'], 'Prior saved/source pair differs')
    excluded = {r['path'] for r in old['excludedQABrowserRasters']}
    need(excluded.isdisjoint(expected) and all('roadmark/' + p not in prior for p in excluded) and all('roadmark/' + p not in prior for p in ALIASES), 'Previously excluded output entered source')
    need(all(sha(prior['roadmark/' + p]) == value for p, value in baseline.items()), 'Saved95/input map mismatch')
    pair = 'roadmark-recovered96-' + portable['sha256'][:16] + '-' + qa['actualBuildID']
    scope = dict(OPEN, fullSerialQAPassed=True, qaResult=binding['qaResult'], actualExternalExit=binding['externalRunnerObservation'], actualTestTallies=tallies, scopedBrowserMeasurement=browser, boundary=qa['boundary'], prior95QAIsHistoricalOnly=True, independent95OutputEquivalenceClaimed=False, upstreamOriginalResearchRecoveryIncomplete=True)
    common = {'schemaVersion': 'roadmark96.checkpoint-manifest.v1', 'applicationCheckpoint': 96, 'pairId': pair, 'createdAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'productionBuildId': qa['actualBuildID'], 'portableIndexSHA256': portable['sha256'], 'portableIndexBytes': portable['bytes'], 'optimizationDisposition': disposition, 'verificationScope': scope, 'baseline95': {'source': dict(path=PINS['source95'][0], **info(anchors['source95'])), 'preview': dict(path=PINS['preview95'][0], **info(anchors['preview95'])), 'saveReceipt': dict(path=PINS['saved95'][0], **info(anchors['saved95']))}, 'sourceScope': {'baselineInputCount': len(baseline), 'finalInputCount': len(expected), 'candidateManifestSHA256': PINS['candidate'][1], 'expectedInputsSHA256': PINS['expectedInputs'][1], 'changes': list(rows.values())}, 'releaseApproved': False}
    notice = ('ROADMARK96 SCOPED PREFETCH CHECKPOINT\n\nPair: ' + pair + '\nOptimization disposition: ' + disposition['decision'] + '\nReason: ' + disposition['reason'] + '\n\nTwo runtime replacements, one historical test-helper replacement and three new test/helper files are included. Original95 source/history payloads are retained; prior95 manifests and QA are historical. Fresh full serial QA and the actual limited browser/network observations are recorded in the manifest. QA alone is not a performance pass. Browser network measurements are local observations, not a phone/performance SLA or proof of full rendering equivalence. Real phones, accelerated WebGL, full journeys, full release, public export and complete upstream research recovery remain open. No deployment or publication is implied.\n\nSource is shipped in numbered parts plus a recovery kit. Extract only the kit, keep every numbered ZIP beside its manifest, and run its joiner with Python3. The joiner reconstructs the full source ZIP; it does not execute the application. Keep the full source ZIP locally. Never treat a preview as source recovery.\n').encode()
    source = dict(prior)
    source.pop('roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    additions = {'roadmark/recovery96/history/checkpoint95-source-manifest.json': old_manifest, 'READ-ME-FIRST-ROADMARK96.txt': notice, 'roadmark/RECOVERY96-READ-ME-FIRST.txt': notice}
    additions.update({'roadmark/recovery96/history/checkpoint95-preimages/' + rel: prior['roadmark/' + rel] for rel, row in rows.items() if row['beforeSHA256'] is not None})
    additions.update({'roadmark/recovery96/research/' + path: raw for path, raw in evidence.items()})
    need(set(additions).isdisjoint(source), 'New history/research path collides')
    source.update(additions)
    for rel in rows:
        source['roadmark/' + rel] = read(local(app, rel))
    for p, raw in prior.items():
        if p not in {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json', *('roadmark/' + p for p in rows)}:
            need(source[p] == raw, 'Unrelated95 payload changed: ' + p)
    source['roadmark/CHECKPOINT-SOURCE-MANIFEST.json'] = encoded(dict(common, role='source', files=inventory(source), excludedQABrowserRasters=old['excludedQABrowserRasters'], portablePreviewArchive='Roadmark-recovered-96-portable-preview.zip'))
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(app), 'Output must be new, external, with existing parent')
    output.mkdir()
    source_path = output / 'Roadmark-recovered-96-source.zip'
    zip_write(source_path, source)
    full = dict(filename=source_path.name, **info(read(source_path)), role='source', operation='create', chatDelivery=False)
    preview = {'roadmark/' + p: read(local(app, p)) for p in ALIASES}
    preview.update({'READ-ME-FIRST-ROADMARK96.txt': notice, 'roadmark/OPEN-PORTABLE-PREVIEW96.txt': b'Open index.html or index-b.html in a browser. This is a portable preview, not the source archive.\n'})
    preview['roadmark/CHECKPOINT-PREVIEW-MANIFEST.json'] = encoded(dict(common, role='preview', files=inventory(preview), sourceArchive=full))
    preview_path = output / 'Roadmark-recovered-96-portable-preview.zip'
    zip_write(preview_path, preview)
    research = {'research/' + path: raw for path, raw in evidence.items()}
    research['READ-ME-FIRST-ROADMARK96.txt'] = notice
    research['RESEARCH-MANIFEST.json'] = encoded(dict(common, role='concise_research_supplement', files=inventory(research), notOriginalResearchIndex79=True))
    research_path = output / 'Roadmark-96-recovery-research-supplement.zip'
    zip_write(research_path, research)
    source_bytes, parts = read(source_path), []
    for offset in range(0, len(source_bytes), CHUNK):
        number = len(parts) + 1
        payload = source_bytes[offset:offset + CHUNK]
        member = 'roadmark-source-96.part%02d.bin' % number
        path = output / ('Roadmark-source-96-chat-part-%d.zip' % number)
        zip_write(path, {member: payload}, stored=True)
        parts.append(dict(filename=path.name, **info(read(path)), member=member, payloadBytes=len(payload), payloadSHA256=sha(payload), role='source_part', operation='create', chatDelivery=True))
    part_manifest = {'schemaVersion': 'roadmark96.source-parts.v1', 'applicationCheckpoint': 96, 'pairId': pair, 'chunkBytes': CHUNK, 'originalFilename': full['filename'], 'originalBytes': full['bytes'], 'originalSHA256': full['sha256'], 'parts': parts}
    kit_files = {'source-parts.json': encoded(part_manifest), 'join_recovered96_source.py': joiner_raw, 'README.txt': notice}
    kit_path = output / 'Roadmark-source-96-recovery-kit.zip'
    zip_write(kit_path, kit_files)
    # Execute bytes read back from the shipped kit, not a separate implementation.
    recovered_kit = zip_read(kit_path)
    test_root = output / 'joiner-self-test'
    test_root.mkdir()
    for filename, raw in recovered_kit.items():
        write(test_root / filename, raw)
    for part in parts:
        write(test_root / part['filename'], read(output / part['filename']))
    argv = [sys.executable, '-B', str(test_root / 'join_recovered96_source.py'), '--parts-directory', str(test_root)]
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    proc = subprocess.run(argv, capture_output=True, text=True, check=False)
    write(test_root / 'stdout.log', proc.stdout.encode())
    write(test_root / 'stderr.log', proc.stderr.encode())
    need(proc.returncode == 0, 'Shipped joiner failed; retain attempt and stop')
    joined = read(test_root / full['filename'])
    result = decoded(proc.stdout)
    need(joined == source_bytes and result['sha256'] == full['sha256'] and result['bytes'] == full['bytes'] and result['pairId'] == pair, 'Shipped joiner reconstruction differs')
    self_test = {'schemaVersion': 'roadmark96.kit-self-test.v1', 'argv': argv, 'startedAtUTC': started, 'finishedAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'exitCode': proc.returncode, 'result': result, 'exactBytesReassembled': True, 'applicationExecuted': False, 'kitSHA256': sha(read(kit_path)), 'shippedJoinerSHA256': sha(recovered_kit['join_recovered96_source.py']), 'stdout': dict(path='joiner-self-test/stdout.log', **info(proc.stdout.encode())), 'stderr': dict(path='joiner-self-test/stderr.log', **info(proc.stderr.encode()))}
    write(output / 'joiner-self-test-receipt.json', encoded(self_test))
    write(output / 'source-parts.json', encoded(part_manifest))
    uploads = list(parts)
    for role, path in (('source_recovery_kit', kit_path), ('preview', preview_path), ('research', research_path)):
        uploads.append(dict(filename=path.name, **info(read(path)), role=role, operation='create', chatDelivery=True))
    if full['bytes'] < POLICY:
        uploads.append(full)
    need(all(0 < row['bytes'] < POLICY for row in uploads), 'Local conservative upload policy exceeded')
    # Last source/output/evidence guard before generating any actionable save plan.
    need(input_map(app) == expected, 'Application drifted during packaging')
    verify_qa(root, app, binding, expected)
    for path, raw in evidence.items():
        need(read(local(root, path)) == raw, 'Research changed during packaging')
    for key, (path, digest) in PINS.items():
        need(sha(read(local(root, path))) == digest, 'Fallback/anchor changed during packaging')
    plan = {'schemaVersion': 'roadmark96.upload-plan.v1', 'applicationCheckpoint': 96, 'pairId': pair, 'status': 'local_archives_verified_not_uploaded', 'allLibraryItemsNewCreates': True, 'sourcePartsAlwaysProvidedForChat': True, 'fullSourceLibrarySaveRequested': full['bytes'] < POLICY, 'localUploadPolicyBytes': POLICY, 'genericHelperSizeCapVerified': False, 'fullSourceArchive': full, 'joinerSelfTest': dict(path='joiner-self-test-receipt.json', **info(encoded(self_test))), 'binding': dict(path=args.binding, **info(binding_raw)), 'packagerSHA256': args.approved_packager_sha256, 'joinerSHA256': args.approved_joiner_sha256, 'uploads': uploads, 'immutable95FallbackRetained': True, 'releaseApproved': False}
    write(output / 'upload-plan.json', encoded(plan))
    request = {'uploads': [{'local_path': str(output / row['filename']), 'purpose': 'create_library_file', 'library_artifact_type': 'other'} for row in uploads]}
    write(output / 'library-create-request.json', encoded(request))
    hash_rows = {row['filename']: row for row in [full, *uploads]}
    write(output / 'SHA256SUMS', ''.join(row['sha256'] + '  ' + row['filename'] + '\n' for row in hash_rows.values()).encode())
    print(json.dumps({'status': plan['status'], 'pairId': pair, 'output': str(output), 'source': full, 'orderedUploads': [r['filename'] for r in uploads], 'joinerActuallyExecuted': True, 'uploadPlanSHA256': sha(encoded(plan)), 'libraryRequestSHA256': sha(encoded(request))}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
