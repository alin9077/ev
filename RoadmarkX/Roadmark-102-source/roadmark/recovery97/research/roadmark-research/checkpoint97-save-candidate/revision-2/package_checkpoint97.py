#!/usr/bin/env python3
"""ROOT-RUN ONLY: package a scoped checkpoint97 after genuine QA and observation.

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
    'source96': ('roadmark-recovery/final96-attempt1/Roadmark-recovered-96-source.zip', '07c72f00d60d88ea06d9bb0e88739af928940efb5b4def11a516edc84bff2e8b'),
    'preview96': ('roadmark-recovery/final96-attempt1/Roadmark-recovered-96-portable-preview.zip', '640149ac423837c36ea36029adcc6611b0266c4aa0539d426c035219cd30cebf'),
    'saved96': ('roadmark-recovery/final96-review/correlated-save-receipt.json', '444e4f1f21b57247289fbd47c4ed02f5a5702dbccc5b517962bb7f6c3be48377'),
    'baselineInputs': ('roadmark-research/applied96/expected-inputs-revision3.json', '3dbb0442fcd4ac25c29ee489fa721b4bd8aa138601b0618c4256af6f37880c80'),
    'expectedInputs': ('roadmark-research/applied97/expected-inputs-revision2.json', 'cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e'),
    'candidate': ('roadmark-research/buyer-copy97-candidate/revision-3/MANIFEST.json', 'b81abc7d68882213eb911d039a8c7fecaece87009e1e68ea1d18c1b4248e2cad'),
    'copyManifest': ('roadmark-research/buyer-copy97-candidate/revision-3/COPY-MANIFEST.json', 'a83d4416cbc60774b6255f396eaa0d7c5e1b43d4342a6ae6c5ff758240dbb66a'),
    'runner': ('roadmark-research/qa97-candidate/run_qa97.py', '8987a86aa9ae380211e3e6ca0765d73a2146558bd1bc754a2756d69c53ba860d'),
    'renderTestPreimage': ('roadmark-research/buyer-copy97-candidate/revision-3/incremental-before/tests/buyer-display-copy-render.test.ts', '1b59462adae6a9afd0c6301e27703d5cea25a7954ad745f89b30efcb0d4b1035'),
    'failedQA1': ('roadmark-research/applied97/qa-attempt1/run-result.json', '2a18bc25d3c96e83a1206ff6be54ba1e4ae5837be62f3c3c8324a5f3df7e9f7d'),
    'failedExit1': ('roadmark-research/applied97/qa-attempt1-external-exit.json', 'a705094bed6bb27cfd15fa37ef7afb1148219a9a22b782f501dbabab2a682802'),
    'failedQA2': ('roadmark-research/applied97/qa-attempt2/run-result.json', 'a7f960091b20b37373afd34c2274ab177fc077ec84c00a8cf4fb08b436def755'),
    'failedExit2': ('roadmark-research/applied97/qa-attempt2-external-exit.json', 'e8cfa45ad2f6eca8c4c6da26c195c66ba8b29f88e7c0379cbd5c3002a5ca7982'),
}
REQUIRED_RESEARCH = {
    'roadmark-research/applied97/application-receipt.json',
    'roadmark-research/applied97/focused-attempt1.log',
    'roadmark-research/applied97/typecheck-attempt1.log',
    'roadmark-research/applied97/root-runner-and-quick-review.json',
    'roadmark-research/buyer-copy97-assessment/ASSESSMENT.md',
    'roadmark-research/buyer-copy97-assessment/REPLACEMENTS.json',
    'roadmark-research/buyer-copy97-assessment/VERIFICATION-PLAN.md',
    'roadmark-research/buyer-copy97-candidate/REPORT.md',
    'roadmark-research/buyer-copy97-candidate/candidate.patch',
    'roadmark-research/review-buyer-copy97/REVIEW.md',
    'roadmark-research/review-buyer-copy97/REVIEW-PINS.json',
    'roadmark-research/review-buyer-copy97/static-consistency.json',
    'roadmark-research/qa97-candidate/MANIFEST.json',
    'roadmark-research/qa97-candidate/README.md',
    'roadmark-research/applied97/application-revision2-receipt.json',
    'roadmark-research/applied97/focused-attempt2.log',
    'roadmark-research/applied97/typecheck-attempt2.log',
    'roadmark-research/applied97/lint-attempt2.log',
    'roadmark-research/applied97/revision2-quick-checks-observation.json',
    'roadmark-research/buyer-copy97-candidate/MANIFEST.json',
    'roadmark-research/buyer-copy97-candidate/revision-2/MANIFEST.json',
    'roadmark-research/buyer-copy97-candidate/revision-2/CUMULATIVE-MANIFEST.json',
    'roadmark-research/buyer-copy97-candidate/revision-2/REPORT.md',
    'roadmark-research/buyer-copy97-candidate/revision-2/correction.patch',
    'roadmark-research/buyer-copy97-candidate/revision-3/REPORT.md',
    'roadmark-research/buyer-copy97-candidate/revision-3/cumulative.patch',
    'roadmark-research/buyer-copy97-candidate/revision-3/incremental.patch',
    'roadmark-research/buyer-copy97-candidate/revision-3/STATIC-CONTRACT-CHECK.json',
    'roadmark-research/review-buyer-copy97/REVISION-2-REVIEW.md',
    'roadmark-research/review-buyer-copy97/revision-2-static-consistency.json',
}
ALLOWED_RESEARCH = ('roadmark-research/applied97/', 'roadmark-research/buyer-copy97-assessment/', 'roadmark-research/buyer-copy97-candidate/', 'roadmark-research/review-buyer-copy97/', 'roadmark-research/qa97-candidate/', 'roadmark-research/review-qa97/', 'roadmark-research/checkpoint97-save-candidate/', 'roadmark-research/review-checkpoint97-save/', 'roadmark-research/browser-copy97/', 'roadmark-recovery/final97-review/')
OPEN = {'phoneVerified': False, 'acceleratedWebGLVerified': False, 'fullJourneyVerified': False, 'fullVisualPassClaimed': False, 'sustainedStabilityClaimed': False, 'publicExportRun': False, 'releaseApproved': False, 'wholeProductionRuntimeGraphEquivalenceClaimed': False, 'independentServerByteVerificationPerformed': False, 'fresh97PerformanceImprovementClaimed': False}


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
    need(qa['schema'] == 'roadmark97.serial-qa.v1' and qa['passed'] is True and qa['publicExportRun'] is False, 'Full current QA not established')
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
    need(read(app / '.next/BUILD_ID').decode().strip() == qa['actualBuildID'] and qa['actualBuildID'] != 'i9nSXvDMk9qf8wSVyThUa', 'Current BUILD_ID not fresh97')
    external = decoded(pinned(root, binding['externalRunnerObservation']))
    need(external['schemaVersion'] == 'roadmark97.external-runner-observation.v1' and external['qaResultSHA256'] == sha(raw) and external['runnerSHA256'] == PINS['runner'][1] and external['exitCode'] == 0 and external['actualTerminalReviewed'] is True and external['observedAtUTC'], 'Actual external runner exit not established')
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
    joiner_path = Path(__file__).parent / 'join_recovered97_source.py'
    joiner_raw = read(joiner_path)
    need(sha(joiner_raw) == args.approved_joiner_sha256, 'Joiner approval pin differs')
    binding_raw = pinned(root, {'path': args.binding, 'sha256': args.binding_sha256})
    binding = decoded(binding_raw)
    need(binding['schemaVersion'] == 'roadmark97.save-inputs.v1' and binding['rootReviewed'] is True and binding['allKnownFailedAndRetryEvidenceListed'] is True and binding['noConcurrentAppWriters'] is True, 'Root input review/exclusivity required')
    anchors = {key: pinned(root, {'path': path, 'sha256': digest}) for key, (path, digest) in PINS.items()}
    need(len(anchors['source96']) == 35980957 and len(anchors['preview96']) == 16353701, 'Wrong96 fallback sizes')
    saved96 = decoded(anchors['saved96'])
    need(saved96['librarySavesComplete'] is True and saved96['applicationCheckpoint'] == 96, 'Verified saved96 fallback required')
    baseline, expected, candidate = (decoded(anchors[key]) for key in ('baselineInputs', 'expectedInputs', 'candidate'))
    need(len(baseline) == 1662 and len(expected) == 1668, 'Wrong input count')
    rows = {row['path']: row for row in candidate['files']}
    need(len(candidate['files']) == 12 and set(rows) == {'src/components/detail.tsx', 'src/components/discovery.tsx', 'src/components/market-audit.tsx', 'src/lib/buyer-display-copy.ts', 'tests/buyer-display-copy-render.test.ts', 'tests/buyer-display-copy.test.ts', 'tests/checkpoint96-source-history.test.ts', 'tests/checkpoint97-source-history.test.ts', 'tests/detail-discovery.test.ts', 'tests/fixtures/buyer-copy97.json', 'tests/helpers/checkpoint91-history.ts', 'tests/helpers/checkpoint97-source-history.ts'}, 'Unexpected exact buyer-copy97 delta')
    need(sum(row['beforeSHA256'] is None for row in rows.values()) == 6, 'Expected six additions and six replacements')
    need(candidate['revision'] == 3 and candidate['revision3ApplicationDelta'] == [], 'Expected metadata-only cumulative revision3')
    incremental = candidate['incrementalFiles']
    need(len(incremental) == 1 and incremental[0]['path'] == 'tests/buyer-display-copy-render.test.ts' and incremental[0]['beforeSHA256'] == PINS['renderTestPreimage'][1] and incremental[0]['beforeBytes'] == len(anchors['renderTestPreimage']) == 9382 and incremental[0]['sha256'] == rows[incremental[0]['path']]['sha256'], 'Exact pre-lint-fix97 test history required')
    wanted = dict(baseline)
    for rel, row in rows.items():
        need(baseline.get(rel) == row['beforeSHA256'] and row['operation'] == ('add' if row['beforeSHA256'] is None else 'modify'), 'Replacement preimage/operation mismatch')
        wanted[rel] = row['sha256']
        need(info(read(local(app, rel))) == {k: row[k] for k in ('sha256', 'bytes')}, 'Applied delta differs')
    need(wanted == expected == input_map(app), 'Current source scope differs')
    qa, tallies, evidence = verify_qa(root, app, binding, expected)
    browser_raw = pinned(root, binding['scopedCopyObservation'])
    browser = decoded(browser_raw)
    portable = qa['artifacts'][ALIASES[0]]
    need(browser['schemaVersion'] == 'roadmark97.scoped-copy-observation.v1' and browser['checkpoint'] == 97 and browser['browser'] == 'own VM Chromium' and browser['observedAtUTC'], 'Actual scoped observation required')
    need(browser['productionBuildID'] == qa['actualBuildID'] and browser['portableSHA256'] == portable['sha256'] and browser['portableBytes'] == portable['bytes'] and browser['baselineSourceSHA256'] == PINS['source96'][1] and browser['baselinePreviewSHA256'] == PINS['preview96'][1], 'Observed artifact identity differs')
    need(all(browser.get(k) is v for k, v in OPEN.items()), 'Observation overstates verification')
    need(browser['prior96PerformanceIsHistoricalOnly'] is True, 'Historical96 performance must not become fresh97 proof')
    need(browser['observations'] and browser['limitations'] and browser['visualChecks'] and browser['copyChecks'], 'Actual scoped visual/copy observations and caveats required')
    disposition = browser['copyDisposition']
    need(disposition['decision'] in {'retain_scoped', 'experimental_unaccepted'} and type(disposition['checksSupportRetention']) is bool and disposition['reason'], 'Explicit copy-check disposition required')
    need(disposition['decision'] != 'retain_scoped' or disposition['checksSupportRetention'] is True, 'Scoped retention needs reviewed copy and visual checks')
    preservation = browser['evidencePreservation']
    for field in ('allTenCopyMappingsReviewed', 'allTenEvidencePreimagesUnchanged', 'allBaselineDataFilesByteIdentical', 'originalModelYHeroAndNineSellingPointsUnchanged', 'identityDatesAvailabilitySpecificationsRankingsCountsUnchanged', 'freshnessPlaceholderUnchanged'):
        need(preservation[field] is True, 'Required evidence-preservation review missing: ' + field)
    copy_manifest = decoded(anchors['copyManifest'])
    mappings = {(row['id'], row['displayField']): row for row in copy_manifest['replacements']}
    need(len(mappings) == len(copy_manifest['replacements']) == 10 and len({row['before'] for row in mappings.values()}) == 7, 'Wrong exact display-copy manifest')
    checked = set()
    for check in browser['copyChecks']:
        key = (check['id'], check['displayField'])
        need(key in mappings and key not in checked and check['observedText'] == mappings[key]['after'] and check['method'] and check['limitations'], 'Copy observation differs from exact mapping')
        checked.add(key)
        ref = check['evidence']
        evidence[ref['path']] = pinned(root, ref)
    for check in browser['visualChecks']:
        need(check['location'] and check['observed'] and check['limitations'], 'Empty scoped visual observation')
        ref = check['evidence']
        evidence[ref['path']] = pinned(root, ref)
    for ref in preservation['evidence']:
        evidence[ref['path']] = pinned(root, ref)
    need(preservation['evidence'], 'Evidence-preservation source receipts missing')
    for field in ('externalRunnerObservation', 'scopedCopyObservation', 'sourceRevisionReview', 'saveToolingReview', 'successfulLaunchStdout', 'successfulLaunchStderr'):
        row = binding[field]
        evidence[row['path']] = pinned(root, row)
    # Both known failed97 attempts are mandatory immutable history. Root also
    # lists every later failure; retained attempt membership/hashes remain sealed.
    need(type(binding['failedAndRetryAttempts']) is list, 'Explicit failure/retry inventory required')
    required_failures = {PINS['failedQA1'][0]: ('failedQA1', 'failedExit1'), PINS['failedQA2'][0]: ('failedQA2', 'failedExit2')}
    seen_failures = set()
    for attempt in binding['failedAndRetryAttempts']:
        result_path = attempt['qaResult']['path']
        need(result_path not in seen_failures and result_path != binding['qaResult']['path'], 'Duplicate/current run in failed history')
        seen_failures.add(result_path)
        result_raw = pinned(root, attempt['qaResult'])
        if result_path in required_failures:
            result_key, exit_key = required_failures[result_path]
            need(sha(result_raw) == PINS[result_key][1] and attempt['externalRunnerObservation']['path'] == PINS[exit_key][0] and attempt['externalRunnerObservation']['sha256'] == PINS[exit_key][1], 'Immutable known failed97 result or external exit differs')
        failed = decoded(result_raw)
        failed_directory = local(root, attempt['qaResult']['path']).parent
        need(failed['schema'] == 'roadmark97.serial-qa.v1' and failed['passed'] is False and failed['runnerSHA256'] == PINS['runner'][1], 'Retained failed result was rewritten')
        need({p.name for p in failed_directory.iterdir()} == set(failed['evidence']) | {'run-result.json'}, 'Retained failed attempt membership differs')
        for filename, row in failed['evidence'].items():
            need(Path(name(filename)).name == filename, 'Failed evidence must be flat')
            path = local(failed_directory, filename)
            data = read(path)
            need(info(data) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Retained failed attempt drifted')
            evidence[path.relative_to(root).as_posix()] = data
        failed_exit = decoded(pinned(root, attempt['externalRunnerObservation']))
        need(failed_exit['schemaVersion'] == 'roadmark97.external-runner-observation.v1' and failed_exit['qaResultSHA256'] == sha(result_raw) and failed_exit['runnerSHA256'] == failed['runnerSHA256'] and type(failed_exit['exitCode']) is int and failed_exit['exitCode'] != 0 and failed_exit['actualTerminalReviewed'] is True and failed_exit['observedAtUTC'], 'Actual retained external failure missing')
        terminal_evidence = failed_exit['terminalEvidence']
        if 'path' in terminal_evidence:
            evidence[terminal_evidence['path']] = pinned(root, terminal_evidence)
        else:
            # Preserve the genuine inline tool response in the pinned root
            # receipt. It is not converted into an invented execution artifact.
            tool_result = terminal_evidence['toolResult']
            need(type(tool_result) is dict and tool_result['exit_code'] == failed_exit['exitCode'] and type(tool_result['output']) is str and tool_result['chunk_id'], 'Actual inline failure terminal differs')
        for field in ('qaResult', 'externalRunnerObservation', 'launchStdout', 'launchStderr'):
            ref = attempt[field]
            evidence[ref['path']] = pinned(root, ref)
    need(set(required_failures) <= seen_failures, 'Known failed97 attempt omitted')
    listed = set()
    for row in binding['researchFiles']:
        need(row['path'] not in listed, 'Duplicate research reference')
        listed.add(row['path'])
        evidence[row['path']] = pinned(root, row)
    need(REQUIRED_RESEARCH <= listed, 'Required source/review/quick-check history omitted')
    # Explicitly freeze everything selected for the concise research supplement.
    for key in ('candidate', 'copyManifest', 'expectedInputs', 'runner'):
        evidence[PINS[key][0]] = anchors[key]
    evidence[args.binding] = binding_raw
    for path, raw in evidence.items():
        lower = path.lower()
        need(path.startswith(ALLOWED_RESEARCH) and Path(path).suffix.lower() in {'.json', '.jsonl', '.log', '.md', '.txt', '.py', '.mjs', '.patch'}, 'Unapproved research path/type: ' + path)
        need(not any(x in lower for x in ('capture', 'screenshot', 'private', 'secret', 'queue', 'mercedes', 'technical-candidate')), 'Sensitive/raw/unrelated research path rejected: ' + path)
        need(len(raw) <= 2 * 1024 * 1024, 'Research file exceeds concise limit: ' + path)
        raw.decode('utf-8')
    need(sum(map(len, evidence.values())) <= 12 * 1024 * 1024, 'Research supplement exceeds12MiB')
    prior = zip_read(local(root, PINS['source96'][0]))
    old_manifest = prior['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']
    old = decoded(old_manifest)
    prior_inventory = {r['path']: {'sha256': r['sha256'], 'bytes': r['bytes']} for r in old['files']}
    need(set(prior) == set(prior_inventory) | {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json'}, 'Prior source inventory differs')
    need(all(info(prior[p]) == row for p, row in prior_inventory.items()), 'Prior payload drift')
    need(old['pairId'] == saved96['pairId'], 'Prior saved/source pair differs')
    excluded = {r['path'] for r in old['excludedQABrowserRasters']}
    need(excluded.isdisjoint(expected) and all('roadmark/' + p not in prior for p in excluded) and all('roadmark/' + p not in prior for p in ALIASES), 'Previously excluded output entered source')
    need(all(sha(prior['roadmark/' + p]) == value for p, value in baseline.items()), 'Saved96/input map mismatch')
    for rel, row in rows.items():
        if row['beforeSHA256'] is not None:
            need(info(prior['roadmark/' + rel]) == {'sha256': row['beforeSHA256'], 'bytes': row['beforeBytes']}, 'Saved96 exact replacement preimage differs')
        else:
            need('roadmark/' + rel not in prior, 'New97 path already exists in saved96 payload')
    pair = 'roadmark-recovered97-' + portable['sha256'][:16] + '-' + qa['actualBuildID']
    scope = dict(OPEN, fullSerialQAPassed=True, qaResult=binding['qaResult'], actualExternalExit=binding['externalRunnerObservation'], actualTestTallies=tallies, scopedCopyObservation=browser, boundary=qa['boundary'], prior96QAIsHistoricalOnly=True, prior96PerformanceIsHistoricalOnly=True, independent96OutputEquivalenceClaimed=False, upstreamOriginalResearchRecoveryIncomplete=True)
    common = {'schemaVersion': 'roadmark97.checkpoint-manifest.v1', 'applicationCheckpoint': 97, 'pairId': pair, 'createdAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'productionBuildId': qa['actualBuildID'], 'portableIndexSHA256': portable['sha256'], 'portableIndexBytes': portable['bytes'], 'copyDisposition': disposition, 'verificationScope': scope, 'baseline96': {'source': dict(path=PINS['source96'][0], **info(anchors['source96'])), 'preview': dict(path=PINS['preview96'][0], **info(anchors['preview96'])), 'saveReceipt': dict(path=PINS['saved96'][0], **info(anchors['saved96']))}, 'sourceScope': {'baselineInputCount': len(baseline), 'finalInputCount': len(expected), 'candidateManifestSHA256': PINS['candidate'][1], 'expectedInputsSHA256': PINS['expectedInputs'][1], 'changes': list(rows.values())}, 'releaseApproved': False}
    notice = ('ROADMARK97 SCOPED BUYER-COPY CHECKPOINT\n\nPair: ' + pair + '\nCopy-check disposition: ' + disposition['decision'] + '\nReason: ' + disposition['reason'] + '\n\nSeven exact display-string substitutions cover ten ID/field mappings. Three runtime components and three historical/test integration files are replaced; six new helper/test files are included. Original96 source/history payloads, exact replaced preimages, the pre-lint-fix97 render test and both failed97 attempts are retained. Evidence JSON, provenance, dates, specifications, availability, ranking/count logic, the original Model Y hero and nine selling points remain unchanged. Fresh full serial QA and actual limited browser/copy observations are recorded in the manifest. Prior96 QA and performance evidence stay historical; this copy-only checkpoint claims no fresh performance improvement. Real phones, accelerated WebGL, full journeys, full visual/release approval, public export and complete upstream research recovery remain open. No deployment or publication is implied.\n\nSource is shipped in numbered parts plus a recovery kit. Extract only the kit, keep every numbered ZIP beside its manifest, and run its joiner with Python3. The joiner reconstructs the full source ZIP; it does not execute the application. Keep the full source ZIP locally. Never treat a preview as source recovery.\n').encode()
    source = dict(prior)
    source.pop('roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    additions = {'roadmark/recovery97/history/checkpoint96-source-manifest.json': old_manifest, 'roadmark/recovery97/history/checkpoint96-correlated-save-receipt.json': anchors['saved96'], 'READ-ME-FIRST-ROADMARK97.txt': notice, 'roadmark/RECOVERY97-READ-ME-FIRST.txt': notice}
    additions['roadmark/recovery97/history/pre-lint-fix97/tests/buyer-display-copy-render.test.ts'] = anchors['renderTestPreimage']
    additions.update({'roadmark/recovery97/history/checkpoint96-preimages/' + rel: prior['roadmark/' + rel] for rel, row in rows.items() if row['beforeSHA256'] is not None})
    additions.update({'roadmark/recovery97/research/' + path: raw for path, raw in evidence.items()})
    need(set(additions).isdisjoint(source), 'New history/research path collides')
    source.update(additions)
    for rel in rows:
        source['roadmark/' + rel] = read(local(app, rel))
    for p, raw in prior.items():
        if p not in {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json', *('roadmark/' + p for p in rows)}:
            need(source[p] == raw, 'Unrelated96 payload changed: ' + p)
    source['roadmark/CHECKPOINT-SOURCE-MANIFEST.json'] = encoded(dict(common, role='source', files=inventory(source), excludedQABrowserRasters=old['excludedQABrowserRasters'], portablePreviewArchive='Roadmark-recovered-97-portable-preview.zip'))
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(app), 'Output must be new, external, with existing parent')
    output.mkdir()
    source_path = output / 'Roadmark-recovered-97-source.zip'
    zip_write(source_path, source)
    full = dict(filename=source_path.name, **info(read(source_path)), role='source', operation='create', chatDelivery=False)
    preview = {'roadmark/' + p: read(local(app, p)) for p in ALIASES}
    preview.update({'READ-ME-FIRST-ROADMARK97.txt': notice, 'roadmark/OPEN-PORTABLE-PREVIEW97.txt': b'Open index.html or index-b.html in a browser. This is a portable preview, not the source archive.\n'})
    preview['roadmark/CHECKPOINT-PREVIEW-MANIFEST.json'] = encoded(dict(common, role='preview', files=inventory(preview), sourceArchive=full))
    preview_path = output / 'Roadmark-recovered-97-portable-preview.zip'
    zip_write(preview_path, preview)
    research = {'research/' + path: raw for path, raw in evidence.items()}
    research['READ-ME-FIRST-ROADMARK97.txt'] = notice
    research['RESEARCH-MANIFEST.json'] = encoded(dict(common, role='concise_research_supplement', files=inventory(research), notOriginalResearchIndex79=True))
    research_path = output / 'Roadmark-97-recovery-research-supplement.zip'
    zip_write(research_path, research)
    source_bytes, parts = read(source_path), []
    for offset in range(0, len(source_bytes), CHUNK):
        number = len(parts) + 1
        payload = source_bytes[offset:offset + CHUNK]
        member = 'roadmark-source-97.part%02d.bin' % number
        path = output / ('Roadmark-source-97-chat-part-%d.zip' % number)
        zip_write(path, {member: payload}, stored=True)
        parts.append(dict(filename=path.name, **info(read(path)), member=member, payloadBytes=len(payload), payloadSHA256=sha(payload), role='source_part', operation='create', chatDelivery=True))
    part_manifest = {'schemaVersion': 'roadmark97.source-parts.v1', 'applicationCheckpoint': 97, 'pairId': pair, 'chunkBytes': CHUNK, 'originalFilename': full['filename'], 'originalBytes': full['bytes'], 'originalSHA256': full['sha256'], 'parts': parts}
    kit_files = {'source-parts.json': encoded(part_manifest), 'join_recovered97_source.py': joiner_raw, 'README.txt': notice}
    kit_path = output / 'Roadmark-source-97-recovery-kit.zip'
    zip_write(kit_path, kit_files)
    # Execute bytes read back from the shipped kit, not a separate implementation.
    recovered_kit = zip_read(kit_path)
    test_root = output / 'joiner-self-test'
    test_root.mkdir()
    for filename, raw in recovered_kit.items():
        write(test_root / filename, raw)
    for part in parts:
        write(test_root / part['filename'], read(output / part['filename']))
    argv = [sys.executable, '-B', str(test_root / 'join_recovered97_source.py'), '--parts-directory', str(test_root)]
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    proc = subprocess.run(argv, capture_output=True, text=True, check=False)
    write(test_root / 'stdout.log', proc.stdout.encode())
    write(test_root / 'stderr.log', proc.stderr.encode())
    need(proc.returncode == 0, 'Shipped joiner failed; retain attempt and stop')
    joined = read(test_root / full['filename'])
    result = decoded(proc.stdout)
    need(joined == source_bytes and result['sha256'] == full['sha256'] and result['bytes'] == full['bytes'] and result['pairId'] == pair, 'Shipped joiner reconstruction differs')
    self_test = {'schemaVersion': 'roadmark97.kit-self-test.v1', 'argv': argv, 'startedAtUTC': started, 'finishedAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'exitCode': proc.returncode, 'result': result, 'exactBytesReassembled': True, 'applicationExecuted': False, 'kitSHA256': sha(read(kit_path)), 'shippedJoinerSHA256': sha(recovered_kit['join_recovered97_source.py']), 'stdout': dict(path='joiner-self-test/stdout.log', **info(proc.stdout.encode())), 'stderr': dict(path='joiner-self-test/stderr.log', **info(proc.stderr.encode()))}
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
    plan = {'schemaVersion': 'roadmark97.upload-plan.v1', 'applicationCheckpoint': 97, 'pairId': pair, 'status': 'local_archives_verified_not_uploaded', 'allLibraryItemsNewCreates': True, 'sourcePartsAlwaysProvidedForChat': True, 'fullSourceLibrarySaveRequested': full['bytes'] < POLICY, 'localUploadPolicyBytes': POLICY, 'genericHelperSizeCapVerified': False, 'fullSourceArchive': full, 'joinerSelfTest': dict(path='joiner-self-test-receipt.json', **info(encoded(self_test))), 'binding': dict(path=args.binding, **info(binding_raw)), 'packagerSHA256': args.approved_packager_sha256, 'joinerSHA256': args.approved_joiner_sha256, 'uploads': uploads, 'immutable96FallbackRetained': True, 'releaseApproved': False}
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
