#!/usr/bin/env python3
"""ROOT-RUN ONLY: package a scoped checkpoint98 after genuine QA and observation.

Standard library only. No imports from the app, builds, browser, network, Git or
Library actions. Runs only the exact joiner that it ships, in an isolated local
reconstruction directory. All outputs are exclusive creates outside the app.
"""
import argparse
import datetime as dt
import hashlib
import json
import math
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
    'source97': ('roadmark-recovery/final97-attempt1/Roadmark-recovered-97-source.zip', '1e75bf0751a4d959167e5ba3ffe0a8db01441dfe69336dbe9f90ffdd406a6a31'),
    'preview97': ('roadmark-recovery/final97-attempt1/Roadmark-recovered-97-portable-preview.zip', '1052aa94b700d9da0280e48aaab96d47bab2c8a35b00075164e020d8ef74d9b3'),
    'saved97': ('roadmark-recovery/final97-review/correlated-save-receipt.json', 'bbf2421a8885f526891b7bef6dd6654f462ffdb460449da78bba571b97cb993c'),
    'baselineInputs': ('roadmark-research/applied97/expected-inputs-revision2.json', 'cc6d49660a61a4f658194c87b64330c5149f435ebc2273f9e9fe19a20f00013e'),
    'expectedInputs': ('roadmark-research/applied98/expected-inputs.json', 'e1f1afa40710976b5ef057264cb09b3443866764f1ef584c9ce05a5ebad875d2'),
    'candidate': ('roadmark-research/narrow-detail98-candidate/MANIFEST.json', '1201400954d6562939644bb09c522ae2275b545ede2e68e5b3abc601ba8cb1a9'),
    'runner': ('roadmark-research/qa98-candidate/run_qa98.py', 'cdc2fb3925fff38fd41fe5a2fad9f5ea608915ec5b31bad2448f48ba4ec6879e'),
}
REQUIRED_RESEARCH = {
    'roadmark-research/applied98/application-receipt.json',
    'roadmark-research/applied98/focused-attempt1-wrong-cwd.log',
    'roadmark-research/applied98/focused-attempt2.log',
    'roadmark-research/applied98/typecheck-quick.log',
    'roadmark-research/applied98/lint-quick.log',
    'roadmark-research/applied98/quick-checks-observation.json',
    'roadmark-research/narrow-detail98-candidate/REPORT.md',
    'roadmark-research/narrow-detail98-candidate/candidate.patch',
    'roadmark-research/review-narrow-detail98/REVIEW.md',
    'roadmark-research/review-narrow-detail98/DECISION.json',
    'roadmark-research/qa98-candidate/MANIFEST.json',
    'roadmark-research/qa98-candidate/README.md',
}
ALLOWED_RESEARCH = (
    'roadmark-research/applied98/',
    'roadmark-research/narrow-detail98-candidate/',
    'roadmark-research/review-narrow-detail98/',
    'roadmark-research/qa98-candidate/',
    'roadmark-research/review-qa98/',
    'roadmark-research/checkpoint98-save-candidate/',
    'roadmark-research/review-checkpoint98-save/',
    'roadmark-research/browser-reflow98/',
    'roadmark-recovery/final98-review/',
)
OPEN = {
    'phoneVerified': False,
    'acceleratedWebGLVerified': False,
    'fullJourneyVerified': False,
    'fullVisualPassClaimed': False,
    'sustainedStabilityClaimed': False,
    'publicExportRun': False,
    'releaseApproved': False,
    'wholeProductionRuntimeGraphEquivalenceClaimed': False,
    'independentServerByteVerificationPerformed': False,
    'fresh98PerformanceImprovementClaimed': False,
    'automatedBrowserSuitePassed': False,
    'newEvidenceIndexRestorationIncluded': False,
}
KAWASAKI_ROUTE = "/cars/kawasaki-ninja-e1-my26/kawasaki-ninja-e1-my26-nx011atfnn-brisbane-kaw-ne1-my26-1--20261010"
SOURCE_TOKEN = "dealer_advertised_exact_MY26_page_not_manufacturer_verified"


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
    need(qa['schema'] == 'roadmark98.serial-qa.v1' and qa['passed'] is True and qa['publicExportRun'] is False, 'Full current QA not established')
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
    need(read(app / '.next/BUILD_ID').decode().strip() == qa['actualBuildID'] and qa['actualBuildID'] != 'HtZ4GcLoYLo7SEOB7yLVd', 'Current BUILD_ID not fresh98')
    external = decoded(pinned(root, binding['externalRunnerObservation']))
    need(external['schemaVersion'] == 'roadmark98.external-runner-observation.v1' and external['qaResultSHA256'] == sha(raw) and external['runnerSHA256'] == PINS['runner'][1] and external['exitCode'] == 0 and external['actualTerminalReviewed'] is True and external['observedAtUTC'], 'Actual external runner exit not established')
    need(type(external['exitCode']) is int, 'Outer exit must be an observed integer')
    terminal_evidence = external['terminalEvidence']
    if 'path' in terminal_evidence:
        evidence[terminal_evidence['path']] = pinned(root, terminal_evidence)
    else:
        tool_result = terminal_evidence['toolResult']
        need(type(tool_result) is dict and tool_result['exit_code'] == 0 and type(tool_result['output']) is str and tool_result['chunk_id'], 'Actual inline success terminal differs')
    evidence[binding['qaResult']['path']] = raw
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
    joiner_path = Path(__file__).parent / 'join_recovered98_source.py'
    joiner_raw = read(joiner_path)
    need(sha(joiner_raw) == args.approved_joiner_sha256, 'Joiner approval pin differs')
    binding_raw = pinned(root, {'path': args.binding, 'sha256': args.binding_sha256})
    binding = decoded(binding_raw)
    need(binding['schemaVersion'] == 'roadmark98.save-inputs.v1' and binding['rootReviewed'] is True and binding['allKnownFailedAndRetryEvidenceListed'] is True and binding['noConcurrentAppWriters'] is True, 'Root input review/exclusivity required')
    anchors = {key: pinned(root, {'path': path, 'sha256': digest}) for key, (path, digest) in PINS.items()}
    need(len(anchors['source97']) == 36797595 and len(anchors['preview97']) == 16359950, 'Wrong97 fallback sizes')
    saved97 = decoded(anchors['saved97'])
    need(saved97['librarySavesComplete'] is True and saved97['applicationCheckpoint'] == 97, 'Verified saved97 fallback required')
    baseline, expected, candidate = (decoded(anchors[key]) for key in ('baselineInputs', 'expectedInputs', 'candidate'))
    need(len(baseline) == 1668 and len(expected) == 1670, 'Wrong input count')
    rows = {row['path']: row for row in candidate['files']}
    need(candidate['schema'] == 'roadmark98.narrow-detail-reflow-candidate.v1' and len(candidate['files']) == 3 and set(rows) == {'src/app/globals.css', 'tests/detail-responsive.test.ts', 'tests/e2e/detail-reflow.spec.ts'}, 'Unexpected exact reflow98 delta')
    need(rows['src/app/globals.css']['beforeSHA256'] == '18bd4641d0b37f32dea2f54c9ed3d8a6169e6a7d4503cb62d37e1cb96343d74e' and sum(row['beforeSHA256'] is None for row in rows.values()) == 2, 'Expected one CSS replacement and two test additions')
    # Reverse only the three reviewed declarations and require the complete
    # checkpoint97 stylesheet identity, independently of prose scope claims.
    restored_css = read(local(app, 'src/app/globals.css'))
    for before, after in (
        (b'.detail-facts section {\n  padding: 24px 0;', b'.detail-facts section {\n  min-width: 0;\n  overflow-wrap: anywhere;\n  padding: 24px 0;'),
        (b'  .detail-facts {\n    grid-template-columns: 1fr;\n    gap: 0;\n  }', b'  .detail-facts {\n    grid-template-columns: minmax(0, 1fr);\n    gap: 0;\n  }'),
    ):
        need(restored_css.count(after) == 1, 'Reviewed CSS replacement is not unique')
        restored_css = restored_css.replace(after, before)
    need(len(restored_css) == 113703 and sha(restored_css) == baseline['src/app/globals.css'], 'Unrelated CSS drift outside the three declarations')
    wanted = dict(baseline)
    for rel, row in rows.items():
        need(baseline.get(rel) == row['beforeSHA256'], 'Replacement preimage/operation mismatch')
        wanted[rel] = row['sha256']
        need(info(read(local(app, rel))) == {k: row[k] for k in ('sha256', 'bytes')}, 'Applied delta differs')
    need(wanted == expected == input_map(app), 'Current source scope differs')
    qa, tallies, evidence = verify_qa(root, app, binding, expected)
    browser_raw = pinned(root, binding['scopedReflowObservation'])
    browser = decoded(browser_raw)
    portable = qa['artifacts'][ALIASES[0]]
    need(browser['schemaVersion'] == 'roadmark98.scoped-reflow-observation.v1' and browser['checkpoint'] == 98 and browser['browser'] == 'own VM Chromium' and browser['observedAtUTC'], 'Actual scoped reflow observation required')
    need(browser['productionBuildID'] == qa['actualBuildID'] and browser['portableSHA256'] == portable['sha256'] and browser['portableBytes'] == portable['bytes'] and browser['baselineSourceSHA256'] == PINS['source97'][1] and browser['baselinePreviewSHA256'] == PINS['preview97'][1], 'Observed artifact identity differs')
    need(all(browser.get(k) is v for k, v in OPEN.items()), 'Observation overstates verification')
    need(browser['prior97QAIsHistoricalOnly'] is True and browser['prior96PerformanceIsHistoricalOnly'] is True, 'Historical evidence must not become fresh98 proof')
    need(browser['observations'] and browser['limitations'] and browser['geometryChecks'] and browser['visualChecks'], 'Actual geometry, visible CUA observations and caveats required')
    disposition = browser['reflowDisposition']
    need(disposition['decision'] in {'retain_scoped', 'experimental_unaccepted'} and type(disposition['checksSupportRetention']) is bool and disposition['reason'], 'Explicit reflow disposition required')
    need(disposition['decision'] != 'retain_scoped' or disposition['checksSupportRetention'] is True, 'Scoped retention needs reviewed reflow checks')
    retaining = disposition['decision'] == 'retain_scoped'
    def measured(value):
        return type(value) in (int, float) and math.isfinite(value) and value >= 0
    measured_surfaces, visible_surfaces = set(), set()
    for check in browser['geometryChecks']:
        need(check['surface'] in {'production', 'portable'} and check['route'].startswith('/cars/') and check['method'] and check['limitations'], 'Geometry scope/method missing')
        need(check['measurementKind'] == 'actual_browser_geometry', 'Test declaration is not observed geometry')
        width, document_width = check['viewportCSSWidth'], check['documentScrollWidth']
        need(measured(width) and width > 0 and measured(document_width) and document_width > 0, 'Actual CSS geometry missing')
        need(check['nativeZoomPercent'] is None or (measured(check['nativeZoomPercent']) and check['nativeZoomPercent'] > 0), 'Invalid native zoom observation')
        need(check['viewportPhysicalWidth'] is None or (measured(check['viewportPhysicalWidth']) and check['viewportPhysicalWidth'] > 0), 'Invalid physical viewport observation')
        sections = check['factSections']
        need(type(sections) is list and sections, 'Actual visible fact-section measurements required')
        all_fit = document_width <= width + 1
        for section in sections:
            need(section['label'] and all(measured(section[k]) for k in ('left', 'right', 'clientWidth', 'scrollWidth', 'gridLeft', 'gridRight')), 'Actual fact-section geometry missing')
            need(section['right'] >= section['left'] and section['gridRight'] >= section['gridLeft'] and section['clientWidth'] > 0, 'Invalid section geometry')
            all_fit = all_fit and section['left'] >= section['gridLeft'] - 1 and section['right'] <= section['gridRight'] + 1 and section['right'] <= width + 1 and section['scrollWidth'] <= section['clientWidth'] + 1
        need(not retaining or all_fit, 'Retained reflow still overflows in an observed case')
        if check['route'] == KAWASAKI_ROUTE and 332 <= width <= 334:
            measured_surfaces.add(check['surface'])
        ref = check['evidence']
        evidence[ref['path']] = pinned(root, ref)
        need(evidence[ref['path']], 'Empty geometry evidence')
    for check in browser['visualChecks']:
        need(check['surface'] in {'production', 'portable'} and check['route'] and check['location'] and check['observed'] and check['limitations'] and check['method'] == 'CUA_visible_inspection', 'Actual scoped visible CUA observation required')
        need(measured(check['viewportCSSWidth']) and check['viewportCSSWidth'] > 0, 'Visual viewport scope missing')
        for field in ('fullKawasakiSourceTokenReadable', 'openedReportWithinViewport', 'noEvidenceClippingObserved'):
            need(type(check[field]) is bool, 'Visible check must report actual reviewed result')
        if check['route'] == KAWASAKI_ROUTE and 332 <= check['viewportCSSWidth'] <= 334:
            need(check['sourceToken'] == SOURCE_TOKEN, 'Full original token differs')
            if all(check[field] is True for field in ('fullKawasakiSourceTokenReadable', 'openedReportWithinViewport', 'noEvidenceClippingObserved')):
                visible_surfaces.add(check['surface'])
        ref = check['evidence']
        evidence[ref['path']] = pinned(root, ref)
        need(evidence[ref['path']], 'Empty visual evidence')
    need(measured_surfaces == {'production', 'portable'}, 'Original narrow defect needs actual measurement on both rebuilt surfaces')
    need(not retaining or visible_surfaces == {'production', 'portable'}, 'Scoped retention needs visible full-token, report and no-clipping checks on both narrow surfaces')
    preservation = browser['evidencePreservation']
    for field in ('exactThreeDeclarationCSSDeltaReviewed', 'allBaselineDataFilesByteIdentical', 'originalModelYHeroAndNineSellingPointsUnchanged', 'identityDatesAvailabilitySpecificationsRankingsCountsUnchanged', 'displayCopyAndEvidenceTextUnchanged', 'allOtherBaselineInputsByteIdentical', 'freshnessPlaceholderUnchanged', 'emittedArtifactComparisonAccountsForReviewedCSSDelta'):
        need(preservation[field] is True, 'Required evidence/source-preservation review missing: ' + field)
    for ref in preservation['evidence']:
        evidence[ref['path']] = pinned(root, ref)
    need(preservation['evidence'], 'Evidence-preservation receipts missing')
    for field in ('externalRunnerObservation', 'scopedReflowObservation', 'sourceRevisionReview', 'saveToolingReview', 'successfulLaunchStdout', 'successfulLaunchStderr'):
        row = binding[field]
        evidence[row['path']] = pinned(root, row)
    # Every actual failed98 attempt is listed explicitly. Failed97 attempts
    # remain byte-identical within the complete saved97 historical payload.
    need(type(binding['failedAndRetryAttempts']) is list, 'Explicit failure/retry inventory required')
    seen_failures = set()
    for attempt in binding['failedAndRetryAttempts']:
        result_path = attempt['qaResult']['path']
        need(result_path not in seen_failures and result_path != binding['qaResult']['path'], 'Duplicate/current run in failed history')
        seen_failures.add(result_path)
        result_raw = pinned(root, attempt['qaResult'])
        failed = decoded(result_raw)
        failed_directory = local(root, attempt['qaResult']['path']).parent
        need(failed['schema'] == 'roadmark98.serial-qa.v1' and failed['passed'] is False and failed['runnerSHA256'] == PINS['runner'][1], 'Retained failed result was rewritten')
        need({p.name for p in failed_directory.iterdir()} == set(failed['evidence']) | {'run-result.json'}, 'Retained failed attempt membership differs')
        for filename, row in failed['evidence'].items():
            need(Path(name(filename)).name == filename, 'Failed evidence must be flat')
            path = local(failed_directory, filename)
            data = read(path)
            need(info(data) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Retained failed attempt drifted')
            evidence[path.relative_to(root).as_posix()] = data
        failed_exit = decoded(pinned(root, attempt['externalRunnerObservation']))
        need(failed_exit['schemaVersion'] == 'roadmark98.external-runner-observation.v1' and failed_exit['qaResultSHA256'] == sha(result_raw) and failed_exit['runnerSHA256'] == failed['runnerSHA256'] and type(failed_exit['exitCode']) is int and failed_exit['exitCode'] != 0 and failed_exit['actualTerminalReviewed'] is True and failed_exit['observedAtUTC'], 'Actual retained external failure missing')
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
    listed = set()
    for row in binding['researchFiles']:
        need(row['path'] not in listed, 'Duplicate research reference')
        listed.add(row['path'])
        evidence[row['path']] = pinned(root, row)
    need(REQUIRED_RESEARCH <= listed, 'Required source/review/quick-check history omitted')
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
    prior = zip_read(local(root, PINS['source97'][0]))
    old_manifest = prior['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']
    old = decoded(old_manifest)
    prior_inventory = {r['path']: {'sha256': r['sha256'], 'bytes': r['bytes']} for r in old['files']}
    need(set(prior) == set(prior_inventory) | {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json'}, 'Prior source inventory differs')
    need(all(info(prior[p]) == row for p, row in prior_inventory.items()), 'Prior payload drift')
    need(old['pairId'] == saved97['pairId'], 'Prior saved/source pair differs')
    excluded = {r['path'] for r in old['excludedQABrowserRasters']}
    need(excluded.isdisjoint(expected) and all('roadmark/' + p not in prior for p in excluded) and all('roadmark/' + p not in prior for p in ALIASES), 'Previously excluded output entered source')
    need(all(sha(prior['roadmark/' + p]) == value for p, value in baseline.items()), 'Saved97/input map mismatch')
    for rel, row in rows.items():
        if row['beforeSHA256'] is not None:
            need(info(prior['roadmark/' + rel]) == {'sha256': row['beforeSHA256'], 'bytes': 113703}, 'Saved97 exact replacement preimage differs')
        else:
            need('roadmark/' + rel not in prior, 'New98 path already exists in saved97 payload')
    pair = 'roadmark-recovered98-' + portable['sha256'][:16] + '-' + qa['actualBuildID']
    scope = dict(OPEN, fullSerialQAPassed=True, qaResult=binding['qaResult'], actualExternalExit=binding['externalRunnerObservation'], actualTestTallies=tallies, scopedReflowObservation=browser, boundary=qa['boundary'], prior97QAIsHistoricalOnly=True, prior97PerformanceIsHistoricalOnly=True, prior96PerformanceIsHistoricalOnly=True, independent97OutputEquivalenceClaimed=False, upstreamOriginalResearchRecoveryIncomplete=True)
    common = {'schemaVersion': 'roadmark98.checkpoint-manifest.v1', 'applicationCheckpoint': 98, 'pairId': pair, 'createdAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'productionBuildId': qa['actualBuildID'], 'portableIndexSHA256': portable['sha256'], 'portableIndexBytes': portable['bytes'], 'reflowDisposition': disposition, 'verificationScope': scope, 'baseline97': {'source': dict(path=PINS['source97'][0], **info(anchors['source97'])), 'preview': dict(path=PINS['preview97'][0], **info(anchors['preview97'])), 'saveReceipt': dict(path=PINS['saved97'][0], **info(anchors['saved97']))}, 'sourceScope': {'baselineInputCount': len(baseline), 'finalInputCount': len(expected), 'candidateManifestSHA256': PINS['candidate'][1], 'expectedInputsSHA256': PINS['expectedInputs'][1], 'changes': list(rows.values())}, 'releaseApproved': False}
    notice = ('ROADMARK98 SCOPED EXACT-DETAIL REFLOW CHECKPOINT\n\nPair: ' + pair + '\nReflow-check disposition: ' + disposition['decision'] + '\nReason: ' + disposition['reason'] + '\n\nThree CSS declarations target narrow fact-grid shrinking and wrapping. An experimental_unaccepted disposition does not establish an accepted repair; retain saved97 as fallback. Only the stylesheet is replaced, and two regression-test files are added. All original97 source/history payloads remain, with the old stylesheet, source manifest and actual97 save receipt preserved separately. Evidence JSON, display copy, provenance, dates, specifications, availability, ranking/count logic, original Model Y hero and nine selling points remain unchanged. Fresh serial QA and actual scoped reflow measurements/CUA observations are recorded. Browser test declarations are not executed browser passes. Historical97 QA and earlier performance evidence stay historical; no fresh performance improvement is claimed. Real phones, accelerated WebGL, full journeys, sustained stability, full visual/release approval, public export and complete upstream research recovery remain open. No deployment or publication is implied.\n\nSource is shipped in numbered parts plus a recovery kit. Extract only the kit, keep every numbered ZIP beside its manifest, and run its joiner with Python3. The joiner reconstructs the full source ZIP; it does not execute the application. Keep the full source ZIP locally. Never treat a preview as source recovery.\n').encode()
    source = dict(prior)
    source.pop('roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    additions = {'roadmark/recovery98/history/checkpoint97-source-manifest.json': old_manifest, 'roadmark/recovery98/history/checkpoint97-correlated-save-receipt.json': anchors['saved97'], 'READ-ME-FIRST-ROADMARK98.txt': notice, 'roadmark/RECOVERY98-READ-ME-FIRST.txt': notice}
    additions.update({'roadmark/recovery98/history/checkpoint97-preimages/' + rel: prior['roadmark/' + rel] for rel, row in rows.items() if row['beforeSHA256'] is not None})
    additions.update({'roadmark/recovery98/research/' + path: raw for path, raw in evidence.items()})
    need(set(additions).isdisjoint(source), 'New history/research path collides')
    source.update(additions)
    for rel in rows:
        source['roadmark/' + rel] = read(local(app, rel))
    for p, raw in prior.items():
        if p not in {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json', *('roadmark/' + p for p in rows)}:
            need(source[p] == raw, 'Unrelated97 payload changed: ' + p)
    source['roadmark/CHECKPOINT-SOURCE-MANIFEST.json'] = encoded(dict(common, role='source', files=inventory(source), excludedQABrowserRasters=old['excludedQABrowserRasters'], portablePreviewArchive='Roadmark-recovered-98-portable-preview.zip'))
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(app), 'Output must be new, external, with existing parent')
    output.mkdir()
    source_path = output / 'Roadmark-recovered-98-source.zip'
    zip_write(source_path, source)
    full = dict(filename=source_path.name, **info(read(source_path)), role='source', operation='create', chatDelivery=False)
    preview = {'roadmark/' + p: read(local(app, p)) for p in ALIASES}
    preview.update({'READ-ME-FIRST-ROADMARK98.txt': notice, 'roadmark/OPEN-PORTABLE-PREVIEW98.txt': b'Open index.html or index-b.html in a browser. This is a portable preview, not the source archive.\n'})
    preview['roadmark/CHECKPOINT-PREVIEW-MANIFEST.json'] = encoded(dict(common, role='preview', files=inventory(preview), sourceArchive=full))
    preview_path = output / 'Roadmark-recovered-98-portable-preview.zip'
    zip_write(preview_path, preview)
    research = {'research/' + path: raw for path, raw in evidence.items()}
    research['READ-ME-FIRST-ROADMARK98.txt'] = notice
    research['RESEARCH-MANIFEST.json'] = encoded(dict(common, role='concise_research_supplement', files=inventory(research), notOriginalResearchIndex79=True))
    research_path = output / 'Roadmark-98-recovery-research-supplement.zip'
    zip_write(research_path, research)
    source_bytes, parts = read(source_path), []
    for offset in range(0, len(source_bytes), CHUNK):
        number = len(parts) + 1
        payload = source_bytes[offset:offset + CHUNK]
        member = 'roadmark-source-98.part%02d.bin' % number
        path = output / ('Roadmark-source-98-chat-part-%d.zip' % number)
        zip_write(path, {member: payload}, stored=True)
        parts.append(dict(filename=path.name, **info(read(path)), member=member, payloadBytes=len(payload), payloadSHA256=sha(payload), role='source_part', operation='create', chatDelivery=True))
    part_manifest = {'schemaVersion': 'roadmark98.source-parts.v1', 'applicationCheckpoint': 98, 'pairId': pair, 'chunkBytes': CHUNK, 'originalFilename': full['filename'], 'originalBytes': full['bytes'], 'originalSHA256': full['sha256'], 'parts': parts}
    kit_files = {'source-parts.json': encoded(part_manifest), 'join_recovered98_source.py': joiner_raw, 'README.txt': notice}
    kit_path = output / 'Roadmark-source-98-recovery-kit.zip'
    zip_write(kit_path, kit_files)
    # Execute bytes read back from the shipped kit, not a separate implementation.
    recovered_kit = zip_read(kit_path)
    test_root = output / 'joiner-self-test'
    test_root.mkdir()
    for filename, raw in recovered_kit.items():
        write(test_root / filename, raw)
    for part in parts:
        write(test_root / part['filename'], read(output / part['filename']))
    argv = [sys.executable, '-B', str(test_root / 'join_recovered98_source.py'), '--parts-directory', str(test_root)]
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    proc = subprocess.run(argv, capture_output=True, text=True, check=False)
    write(test_root / 'stdout.log', proc.stdout.encode())
    write(test_root / 'stderr.log', proc.stderr.encode())
    need(proc.returncode == 0, 'Shipped joiner failed; retain attempt and stop')
    joined = read(test_root / full['filename'])
    result = decoded(proc.stdout)
    need(joined == source_bytes and result['sha256'] == full['sha256'] and result['bytes'] == full['bytes'] and result['pairId'] == pair, 'Shipped joiner reconstruction differs')
    self_test = {'schemaVersion': 'roadmark98.kit-self-test.v1', 'argv': argv, 'startedAtUTC': started, 'finishedAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'exitCode': proc.returncode, 'result': result, 'exactBytesReassembled': True, 'applicationExecuted': False, 'kitSHA256': sha(read(kit_path)), 'shippedJoinerSHA256': sha(recovered_kit['join_recovered98_source.py']), 'stdout': dict(path='joiner-self-test/stdout.log', **info(proc.stdout.encode())), 'stderr': dict(path='joiner-self-test/stderr.log', **info(proc.stderr.encode()))}
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
    plan = {'schemaVersion': 'roadmark98.upload-plan.v1', 'applicationCheckpoint': 98, 'pairId': pair, 'status': 'local_archives_verified_not_uploaded', 'allLibraryItemsNewCreates': True, 'sourcePartsAlwaysProvidedForChat': True, 'fullSourceLibrarySaveRequested': full['bytes'] < POLICY, 'localUploadPolicyBytes': POLICY, 'genericHelperSizeCapVerified': False, 'fullSourceArchive': full, 'joinerSelfTest': dict(path='joiner-self-test-receipt.json', **info(encoded(self_test))), 'binding': dict(path=args.binding, **info(binding_raw)), 'packagerSHA256': args.approved_packager_sha256, 'joinerSHA256': args.approved_joiner_sha256, 'uploads': uploads, 'immutable97FallbackRetained': True, 'releaseApproved': False}
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
