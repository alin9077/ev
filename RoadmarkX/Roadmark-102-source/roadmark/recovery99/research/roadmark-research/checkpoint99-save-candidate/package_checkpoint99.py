#!/usr/bin/env python3
"""ROOT-RUN ONLY: package a scoped checkpoint99 after genuine QA and observation.

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
    'source98': ('roadmark-recovery/final98-attempt1/Roadmark-recovered-98-source.zip', '182cfb8fa457fb6f5d0acbf9e0c45cb68f31c7f9bf78cda4ff73a73577c8761e'),
    'preview98': ('roadmark-recovery/final98-attempt1/Roadmark-recovered-98-portable-preview.zip', 'f3af970d8ab4ca3a9e224b4fea6d3acbdb41630dd5b449567cf92e0fc1f7b403'),
    'saved98': ('roadmark-recovery/final98-review/correlated-save-receipt.json', 'bf0eb155dcd0e44d77e0d5027657d063d0c70631c6753f74260b50d3f104e916'),
    'saved98helper': ('roadmark-recovery/final98-review/actual-helper-results.json', '6fd08879ea5bfe945c6b8a8716d71f1ac632cb0cdd6689b95f2901575fa32112'),
    'saved98plan': ('roadmark-recovery/final98-attempt1/upload-plan.json', '3bb6e2d9567b781906431cc7329fbda6bce4fe1f8fa44645c19bfd7308d8f642'),
    'baselineInputs': ('roadmark-research/applied98/expected-inputs.json', 'e1f1afa40710976b5ef057264cb09b3443866764f1ef584c9ce05a5ebad875d2'),
    'expectedInputs': ('roadmark-research/applied99/revision4/expected-inputs.json', '4a4204128daf108f35296c77d3beb4476a453c98ab571648da9d85b1b0085e86'),
    'candidate': ('roadmark-research/applied99/revision4/qa-candidate-manifest.json', '51e2b73e998f80b4fd10260df54c97ba8d337642c384a4c57606e58875ee590a'),
    'runner': ('roadmark-research/qa99-candidate/run_qa99.py', 'a043d6ac749a39d025bf452eddb55440d2ac81ba3b73be9f4d894a5055a2e10f'),
    'sourceCandidate': ('roadmark-research/applied99/revision4/candidate-manifest.json', 'c710eb25970241c720c8695024f66a31cbaaaa2e6dd4b101143b531a02ae0850'),
    'initialSourceCandidate': ('roadmark-research/mazda-trim99-candidate/manifest.json', '089238cd78a3d7712cca9e691f78b9d91f7f46d292b30890086628edb4cf7c42'),
    'initialExpectedInputs': ('roadmark-research/applied99/expected-inputs.json', '63d8ce2723a3262df3d52531e22fd81397e03ae09418068efc7362902817f25f'),
    'initialQACandidate': ('roadmark-research/applied99/qa-candidate-manifest.json', 'a4841e51e947a55b07cabfc55592d21f8b5308a66cda9a22cfd6e82161a2095e'),
    'repairCandidate': ('roadmark-research/mazda-trim99-candidate/revision2/manifest.json', '5a68f63bad07833c31a173689616c06bc3dd6dd4b2044c7768aaa70d0fe0d46b'),
    'secondSourceCandidate': ('roadmark-research/applied99/revision2/candidate-manifest.json', 'c3ec1f62102a55a4721641fca61c56547a5193b011e659938ea7fbff87006c8c'),
    'secondExpectedInputs': ('roadmark-research/applied99/revision2/expected-inputs.json', '8914e219a8fde52dcce4bab12ebae5b3541893e5cabdd1edc8ab3a143091cb76'),
    'secondQACandidate': ('roadmark-research/applied99/revision2/qa-candidate-manifest.json', '7932ada0ed98a4ee5f63ae01f7758ee713642e8eda6fc8751a3a9a6c604f5450'),
    'thirdSourceCandidate': ('roadmark-research/applied99/revision3/candidate-manifest.json', 'd5e4a096ad701c4c575fcef2841a068d761477b38224ac0aa6b9299d89192afa'),
    'thirdExpectedInputs': ('roadmark-research/applied99/revision3/expected-inputs.json', '29bcb7fca21d126b996fb506dd755dfac1d743710e07d265346b060d26fe7d7e'),
    'thirdQACandidate': ('roadmark-research/applied99/revision3/qa-candidate-manifest.json', '89010ff70bac7d72a3084718e1eaf71d37b5a5fcdf037be4c00075aad427b72b'),
    'typeRepairCandidate': ('roadmark-research/mazda-trim99-candidate/revision3/manifest.json', 'ef550abc42ab248b26170b9b54c1121cf5e0d5aecead6d2f311d164072853a2f'),
    'scopedTypeRepairCandidate': ('roadmark-research/mazda-trim99-candidate/revision4/manifest.json', 'd744f716d6d5ca9c3db73bacf72390bc5315cafe4cd5575e1833e780fb3a6790'),
}
REVIEWED99 = {'bindingsResolved': True, 'candidateSchema': 'roadmark-checkpoint99-candidate-manifest-v1', 'candidatePaths': ['data/buyer-identity-snapshots-2026-10-10.json', 'data/buyer-selling-points-2026-10-10.json', 'data/catalogue-additions-2026-10-10.json', 'data/market-inventory-2026-10-10.json', 'data/mazda-cx6e-technical-evidence-2026-10-12.json', 'qa/checkpoint99-mazda-fixture.json', 'tests/buyer-display-copy-render.test.ts', 'tests/checkpoint84-transit-city.test.ts', 'tests/checkpoint93-market.test.ts', 'tests/checkpoint95-market.test.ts', 'tests/checkpoint96-source-history.test.ts', 'tests/checkpoint99-mazda.test.ts', 'tests/configuration-payload.test.ts', 'tests/domain.test.ts', 'tests/helpers/checkpoint84-runtime.ts', 'tests/helpers/checkpoint91-history.ts', 'tests/helpers/checkpoint95-market-history.ts', 'tests/helpers/checkpoint99-history.ts', 'tests/research-refresh.test.ts', 'tests/source-citation-label92.test.ts', 'tests/avatar-dimension-projection.test.ts', 'tests/checkpoint99-history-coverage.test.ts'], 'expectedInputCount': 1675, 'detailRoutes': ['/cars/mazda-cx6e-au-aug2026/e35-gt-20261012', '/cars/mazda-cx6e-au-aug2026/e35-azami-20261012'], 'requiredResearchPaths': ['roadmark-research/mazda-trim99-candidate/README.md', 'roadmark-research/mazda-trim99-candidate/count-deltas.json', 'roadmark-research/mazda-trim99-candidate/expected-cars.json', 'roadmark-research/mazda-trim99-candidate/data-delta.json', 'roadmark-research/mazda-trim99-candidate/summary-delta.json', 'roadmark-research/mazda-trim99-candidate/adapter-audit/static-adapter-audit.md', 'roadmark-research/applied99/application-receipt.json', 'roadmark-research/applied99/focused-attempt1.log', 'roadmark-research/review-mazda-trim99/review.md', 'roadmark-research/review-mazda-trim99/review-pins.json', 'roadmark-research/applied99/focused-attempt1-observation.json', 'roadmark-research/applied99/revision2/candidate-manifest.json', 'roadmark-research/applied99/revision2/qa-candidate-manifest.json', 'roadmark-research/applied99/revision2/expected-inputs.json', 'roadmark-research/mazda-trim99-candidate/manifest.json', 'roadmark-research/applied99/qa-candidate-manifest.json', 'roadmark-research/applied99/expected-inputs.json', 'roadmark-research/mazda-trim99-candidate/revision2/manifest.json', 'roadmark-research/review-mazda-trim99/revision2-review.md', 'roadmark-research/review-mazda-trim99/revision2-review-pins.json', 'roadmark-research/review-mazda-trim99/cumulative-revision2-review-pins.json', 'roadmark-research/review-mazda-trim99/cumulative-revision2-review.md', 'roadmark-research/applied99/revision2/application-receipt.json', 'roadmark-research/applied99/qa-attempt1-external-exit.json', 'roadmark-research/applied99/qa-attempt1-outer-tool-excerpts.json', 'roadmark-research/applied99/qa-attempt1-external-terminal.json', 'roadmark-research/applied99/revision3/candidate-manifest.json', 'roadmark-research/applied99/revision3/expected-inputs.json', 'roadmark-research/applied99/revision3/qa-candidate-manifest.json', 'roadmark-research/applied99/revision3/application-receipt.json', 'roadmark-research/applied99/revision3/quick-checks-observation.json', 'roadmark-research/applied99/revision3/typecheck-quick.log', 'roadmark-research/applied99/revision4/candidate-manifest.json', 'roadmark-research/applied99/revision4/expected-inputs.json', 'roadmark-research/applied99/revision4/qa-candidate-manifest.json', 'roadmark-research/applied99/revision4/application-receipt.json', 'roadmark-research/applied99/revision4/quick-checks-observation.json', 'roadmark-research/applied99/revision4/typecheck-quick.log', 'roadmark-research/applied99/revision4/lint-quick.log', 'roadmark-research/applied99/revision4/type-erasure-observation.json', 'roadmark-research/mazda-trim99-candidate/revision3/manifest.json', 'roadmark-research/mazda-trim99-candidate/revision4/manifest.json', 'roadmark-research/review-mazda-trim99/revision3-review.md', 'roadmark-research/review-mazda-trim99/revision3-review-pins.json', 'roadmark-research/review-mazda-trim99/cumulative-revision3-review.md', 'roadmark-research/review-mazda-trim99/cumulative-revision3-review-pins.json', 'roadmark-research/review-mazda-trim99/revision3-typecheck-hold.md', 'roadmark-research/review-mazda-trim99/revision4-review.md', 'roadmark-research/review-mazda-trim99/revision4-review-pins.json', 'roadmark-research/review-mazda-trim99/cumulative-revision4-review.md', 'roadmark-research/review-mazda-trim99/cumulative-revision4-review-pins.json', 'roadmark-research/review-mazda-trim99/revision4-root-execution-gate.md', 'roadmark-research/review-mazda-trim99/revision4-root-execution-gate.json', 'roadmark-research/applied99/qa-attempt2-external-exit.json', 'roadmark-research/applied99/qa-attempt2-external-terminal.json', 'roadmark-research/applied99/qa-attempt2-launch.stdout.log', 'roadmark-research/applied99/qa-attempt2-launch.stderr.log'], 'expectedNewFileCount': 5, 'expectedReplacementCount': 17, 'requiredFailedAttemptPaths': ['roadmark-research/applied99/qa-attempt1/run-result.json', 'roadmark-research/applied99/qa-attempt2/run-result.json'], 'supersededInitial99Postimages': [{'applicationPath': 'tests/checkpoint84-transit-city.test.ts', 'path': 'roadmark-research/mazda-trim99-candidate/files/tests/checkpoint84-transit-city.test.ts', 'sha256': 'd41567ac458ee42771332302b40dc5ea02ea6803bfc22f93cc27066bfabaf4dc', 'bytes': 11905}, {'applicationPath': 'tests/checkpoint95-market.test.ts', 'path': 'roadmark-research/mazda-trim99-candidate/files/tests/checkpoint95-market.test.ts', 'sha256': '81eaf8711aaea83ef66004ef28021060781e3dd1cbc69f76ffacfc96b71146b5', 'bytes': 9419}], 'supersededIntermediate99Postimages': [{'historyPhase': 'revision3', 'applicationPath': 'tests/helpers/checkpoint99-history.ts', 'path': 'roadmark-research/applied99/revision4/preimages/tests/helpers/checkpoint99-history.ts', 'sha256': 'c78c7048e1d9654ddb71b6680c9441bda9c30e4e569d65e6fc9bfd8bd13d8ceb', 'bytes': 7150}], 'repairSteps': [{'phase': 'revision2', 'repairPin': 'repairCandidate', 'cumulativePin': 'secondSourceCandidate', 'expectedInputsPin': 'secondExpectedInputs', 'qaCandidatePin': 'secondQACandidate', 'paths': ['tests/avatar-dimension-projection.test.ts', 'tests/checkpoint84-transit-city.test.ts', 'tests/checkpoint99-history-coverage.test.ts'], 'lineageRefs': {'parentCandidate': 'initialSourceCandidate', 'repairCandidate': 'repairCandidate'}}, {'phase': 'revision3', 'repairPin': 'typeRepairCandidate', 'cumulativePin': 'thirdSourceCandidate', 'expectedInputsPin': 'thirdExpectedInputs', 'qaCandidatePin': 'thirdQACandidate', 'paths': ['tests/helpers/checkpoint99-history.ts'], 'lineageRefs': {'parentCandidate': 'initialSourceCandidate', 'repairCandidate': 'repairCandidate', 'typeRepairCandidate': 'typeRepairCandidate', 'previousCumulativeCandidate': 'secondSourceCandidate'}}, {'phase': 'revision4', 'repairPin': 'scopedTypeRepairCandidate', 'cumulativePin': 'sourceCandidate', 'expectedInputsPin': 'expectedInputs', 'qaCandidatePin': 'candidate', 'paths': ['tests/checkpoint95-market.test.ts', 'tests/helpers/checkpoint99-history.ts'], 'lineageRefs': {'parentCandidate': 'initialSourceCandidate', 'repairCandidate': 'repairCandidate', 'typeRepairCandidate': 'typeRepairCandidate', 'scopedTypeRepairCandidate': 'scopedTypeRepairCandidate', 'previousCumulativeCandidate': 'thirdSourceCandidate'}}], 'requiredFailedConfigurations': {'roadmark-research/applied99/qa-attempt1/run-result.json': {'expectedInputsPin': 'initialExpectedInputs', 'qaCandidatePin': 'initialQACandidate'}, 'roadmark-research/applied99/qa-attempt2/run-result.json': {'expectedInputsPin': 'secondExpectedInputs', 'qaCandidatePin': 'secondQACandidate'}}, 'admittedFailedConfigurationPins': [{'expectedInputsPin': 'initialExpectedInputs', 'qaCandidatePin': 'initialQACandidate'}, {'expectedInputsPin': 'secondExpectedInputs', 'qaCandidatePin': 'secondQACandidate'}, {'expectedInputsPin': 'thirdExpectedInputs', 'qaCandidatePin': 'thirdQACandidate'}, {'expectedInputsPin': 'expectedInputs', 'qaCandidatePin': 'candidate'}]}
# Final scoped type repair is separately bound to its complete actual lineage.
# Failed/quick outcomes remain historical; repaired full QA still needs proof.
REQUIRED_RESEARCH = {
    'roadmark-research/qa99-candidate/MANIFEST.json',
    'roadmark-research/qa99-candidate/README.md',
    'roadmark-research/mazda-root-visual99/root-visual-observations.json',
    'roadmark-research/review-mazda-technical/root-visual-follow-up.md',
    'roadmark-research/review-mazda-technical/root-visual-follow-up-pins.json',
}
ALLOWED_RESEARCH = (
    'roadmark-research/applied99/',
    'roadmark-research/mazda-trim99-candidate/',
    'roadmark-research/review-mazda-trim99/',
    'roadmark-research/qa99-candidate/',
    'roadmark-research/review-qa99/',
    'roadmark-research/checkpoint99-save-candidate/',
    'roadmark-research/review-checkpoint99-save/',
    'roadmark-research/browser-mazda99/',
    'roadmark-research/mazda-root-visual99/',
    'roadmark-research/review-mazda-technical/',
    'roadmark-recovery/final99-review/',
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
    'fresh99PerformanceImprovementClaimed': False,
    'automatedBrowserSuitePassed': False,
    'newEvidenceIndexRestorationIncluded': False,
}


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
    need(qa['schema'] == 'roadmark99.serial-qa.v1' and qa['passed'] is True and qa['publicExportRun'] is False, 'Full current QA not established')
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
    need(read(app / '.next/BUILD_ID').decode().strip() == qa['actualBuildID'] and qa['actualBuildID'] != 'G0_48b3NTh9WvzoSGPGR5', 'Current BUILD_ID not fresh99')
    external = decoded(pinned(root, binding['externalRunnerObservation']))
    need(external['schemaVersion'] == 'roadmark99.external-runner-observation.v1' and external['qaResultSHA256'] == sha(raw) and external['runnerSHA256'] == PINS['runner'][1] and external['exitCode'] == 0 and external['actualTerminalReviewed'] is True and external['observedAtUTC'], 'Actual external runner exit not established')
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
    joiner_path = Path(__file__).parent / 'join_recovered99_source.py'
    joiner_raw = read(joiner_path)
    need(sha(joiner_raw) == args.approved_joiner_sha256, 'Joiner approval pin differs')
    binding_raw = pinned(root, {'path': args.binding, 'sha256': args.binding_sha256})
    binding = decoded(binding_raw)
    need(binding['schemaVersion'] == 'roadmark99.save-inputs.v1' and binding['rootReviewed'] is True and binding['allKnownFailedAndRetryEvidenceListed'] is True and binding['noConcurrentAppWriters'] is True and binding['selectedResearchReviewedForSecretsAndRelevance'] is True, 'Root input review/exclusivity/research-content review required')
    need(REVIEWED99['bindingsResolved'] is True, 'STOP: unresolved99 candidate/map/scope bindings require root completion and independent review')
    need(type(REVIEWED99['candidateSchema']) is str and REVIEWED99['candidateSchema'] and type(REVIEWED99['expectedInputCount']) is int and REVIEWED99['expectedInputCount'] >= 1670 and REVIEWED99['candidatePaths'] and REVIEWED99['requiredResearchPaths'], 'Incomplete reviewed99 scope contract')
    need(len(REVIEWED99['detailRoutes']) == 2 and len(set(REVIEWED99['detailRoutes'])) == 2 and all(type(route) is str and route.startswith('/cars/') for route in REVIEWED99['detailRoutes']), 'Two actual reviewed Mazda detail routes required')
    anchors = {key: pinned(root, {'path': path, 'sha256': digest}) for key, (path, digest) in PINS.items()}
    need(len(anchors['source98']) == 37370410 and len(anchors['preview98']) == 16380150, 'Wrong98 fallback sizes')
    saved98 = decoded(anchors['saved98'])
    need(saved98['librarySavesComplete'] is True and saved98['applicationCheckpoint'] == 98, 'Verified saved98 fallback required')
    need(saved98['actualHelperResults']['sha256'] == sha(anchors['saved98helper']) and saved98['uploadPlanSHA256'] == sha(anchors['saved98plan']), 'Actual98 receipt/helper/plan chain differs')
    prior_plan = decoded(anchors['saved98plan'])
    need(prior_plan['fullSourceArchive']['sha256'] == PINS['source98'][1] and prior_plan['fullSourceArchive']['bytes'] == len(anchors['source98']) and prior_plan['pairId'] == saved98['pairId'], 'Actual98 source/save identity differs')
    prior_preview = [row for row in saved98['saved'] if row['role'] == 'preview']
    need(len(prior_preview) == 1 and prior_preview[0]['localSHA256'] == PINS['preview98'][1] and prior_preview[0]['localBytes'] == len(anchors['preview98']), 'Actual98 preview identity differs')
    baseline, expected, candidate = (decoded(anchors[key]) for key in ('baselineInputs', 'expectedInputs', 'sourceCandidate'))
    initial_candidate = decoded(anchors['initialSourceCandidate'])
    initial_rows = {row['path']: row for row in initial_candidate['candidateFiles']}
    need(len(initial_rows) == len(initial_candidate['candidateFiles']) == 20, 'Initial99 source inventory differs')
    cumulative_rows = dict(initial_rows)
    lineage_states = [('initial99', dict(cumulative_rows))]
    for step in REVIEWED99['repairSteps']:
        repair = decoded(anchors[step['repairPin']])
        cumulative = decoded(anchors[step['cumulativePin']])
        need([row['path'] for row in repair['candidateFiles']] == step['paths'] and all(rel.startswith('tests/') for rel in step['paths']), 'Repair differs from its exact reviewed test-path scope')
        for field, pin in step['lineageRefs'].items():
            need(cumulative[field] == dict(zip(('path', 'sha256'), PINS[pin])), 'Cumulative lineage reference differs: ' + field)
        for row in repair['candidateFiles']:
            rel = name(row['path'])
            previous = cumulative_rows.get(rel)
            need(row['beforeSHA256'] == (previous['afterSHA256'] if previous else baseline.get(rel)) and row['checkpoint98BeforeSHA256'] == baseline.get(rel), 'Repair immediate/baseline preimage differs')
            need(previous is None or row['beforeBytes'] == previous['afterBytes'], 'Repair immediate preimage length differs')
            cumulative_rows[rel] = {'path': rel, 'beforeSHA256': baseline.get(rel), 'beforeBytes': previous['beforeBytes'] if previous else row['beforeBytes'], 'afterSHA256': row['afterSHA256'], 'afterBytes': row['afterBytes']}
        need(len(cumulative['candidateFiles']) == len(cumulative_rows) and {row['path']: row for row in cumulative['candidateFiles']} == cumulative_rows, 'Cumulative candidate differs from exact chronological repair composition')
        step_expected = dict(baseline)
        step_expected.update({rel: row['afterSHA256'] for rel, row in cumulative_rows.items()})
        need(decoded(anchors[step['expectedInputsPin']]) == step_expected, 'Intermediate/final expected map differs from its own cumulative source')
        step_projection = decoded(anchors[step['qaCandidatePin']])
        need(step_projection['originalCandidate'] == dict(zip(('path', 'sha256'), PINS[step['cumulativePin']])) and step_projection['files'] == [{'path': row['path'], 'beforeSHA256': row['beforeSHA256'], 'sha256': row['afterSHA256'], 'bytes': row['afterBytes']} for row in cumulative['candidateFiles']], 'Intermediate/final QA projection differs from its actual source')
        lineage_states.append((step['phase'], dict(cumulative_rows)))
    need({row['path']: row for row in candidate['candidateFiles']} == cumulative_rows, 'Final source is not the final reviewed lineage state')
    history_expected, seen_versions = {}, set()
    for phase, state in lineage_states[:-1]:
        for rel, row in state.items():
            identity = (rel, row['afterSHA256'])
            if row['afterSHA256'] != cumulative_rows[rel]['afterSHA256'] and identity not in seen_versions:
                seen_versions.add(identity)
                history_expected[(phase, rel)] = {'sha256': row['afterSHA256'], 'bytes': row['afterBytes']}
    historical_source = {}
    history_refs = [dict(ref, historyPhase='initial99') for ref in REVIEWED99['supersededInitial99Postimages']] + REVIEWED99['supersededIntermediate99Postimages']
    for ref in history_refs:
        phase, rel = name(ref['historyPhase']), name(ref['applicationPath'])
        key = (phase, rel)
        need(key not in historical_source and key in history_expected, 'Unexpected/duplicate historical99 postimage')
        raw = pinned(root, ref)
        need(info(raw) == history_expected[key], 'Superseded or rejected99 code postimage differs')
        historical_source[key] = raw
    need(set(historical_source) == set(history_expected), 'Superseded initial/intermediate99 code history missing')
    normalized_candidate = decoded(anchors['candidate'])
    need(normalized_candidate['schema'] == 'roadmark99-normalized-qa-candidate.v1', 'Wrong normalized QA projection schema')
    need(normalized_candidate['originalCandidate'] == dict(zip(('path', 'sha256'), PINS['sourceCandidate'])), 'Normalized QA candidate lost the exact original manifest binding')
    need(len(baseline) == 1670 and len(expected) == REVIEWED99['expectedInputCount'], 'Wrong reviewed99 input count')
    need(candidate['schema'] == REVIEWED99['candidateSchema'] and type(candidate['candidateFiles']) is list and candidate['candidateFiles'], 'Wrong reviewed Mazda99 candidate')
    need(candidate.get('appRoot', APP) == APP and candidate.get('applicationRoot', str(app)) == str(app), 'Candidate targets another application')
    rows = {}
    projected_rows = [{'path': row['path'], 'beforeSHA256': row['beforeSHA256'], 'sha256': row['afterSHA256'], 'bytes': row['afterBytes']} for row in candidate['candidateFiles']]
    need(normalized_candidate['files'] == projected_rows, 'QA candidate is not the exact original manifest projection')
    need(sum(row['beforeSHA256'] is None for row in candidate['candidateFiles']) == REVIEWED99['expectedNewFileCount'] and sum(row['beforeSHA256'] is not None for row in candidate['candidateFiles']) == REVIEWED99['expectedReplacementCount'], 'Wrong reviewed addition/replacement count')
    for original_row, row in zip(candidate['candidateFiles'], projected_rows):
        rel = name(row['path'])
        need(rel not in rows and not rel.startswith('.next/') and rel not in (*ALIASES, *METADATA, 'tsconfig.tsbuildinfo') and not ({'node_modules', '.git'} & set(Path(rel).parts)), 'Duplicate/excluded candidate path')
        need(Path(rel).suffix.lower() in {'.json', '.ts', '.tsx', '.js', '.cjs', '.mjs', '.py', '.md', '.txt', '.css'} and not any(term in rel.lower() for term in ('capture', 'screenshot', 'private', 'secret', 'queue')), 'Only explicitly reviewed source text is admitted in the99 delta')
        need(row['beforeSHA256'] == baseline.get(rel), 'Candidate baseline preimage differs')
        need(type(row['sha256']) is str and re.fullmatch('[0-9a-f]{64}', row['sha256']) and row['sha256'] != row['beforeSHA256'] and type(row['bytes']) is int and row['bytes'] > 0, 'Invalid/unchanged candidate postimage')
        need((row['beforeSHA256'] is None and original_row['beforeBytes'] is None) or (row['beforeSHA256'] is not None and type(original_row['beforeBytes']) is int and original_row['beforeBytes'] > 0), 'Invalid original candidate preimage size')
        rows[rel] = dict(row, beforeBytes=original_row['beforeBytes'])
    need(set(rows) == set(REVIEWED99['candidatePaths']) and len(rows) == len(REVIEWED99['candidatePaths']), 'Candidate differs from explicit reviewed99 path allowlist')
    wanted = dict(baseline)
    for rel, row in rows.items():
        need(baseline.get(rel) == row['beforeSHA256'], 'Replacement preimage/operation mismatch')
        wanted[rel] = row['sha256']
        applied_raw = read(local(app, rel))
        need(info(applied_raw) == {k: row[k] for k in ('sha256', 'bytes')}, 'Applied delta differs')
        applied_raw.decode('utf-8')
    need(wanted == expected == input_map(app), 'Current source scope differs')
    qa, tallies, evidence = verify_qa(root, app, binding, expected)
    browser_raw = pinned(root, binding['scopedMazdaObservation'])
    browser = decoded(browser_raw)
    portable = qa['artifacts'][ALIASES[0]]
    need(browser['schemaVersion'] == 'roadmark99.scoped-mazda-observation.v1' and browser['checkpoint'] == 99 and browser['browser'] == 'own VM Chromium' and browser['observedAtUTC'], 'Actual scoped Mazda observation required')
    need(browser['productionBuildID'] == qa['actualBuildID'] and browser['portableSHA256'] == portable['sha256'] and browser['portableBytes'] == portable['bytes'] and browser['baselineSourceSHA256'] == PINS['source98'][1] and browser['baselinePreviewSHA256'] == PINS['preview98'][1], 'Observed artifact identity differs')
    need(browser['candidateManifestSHA256'] == PINS['sourceCandidate'][1] and browser['qaCandidateManifestSHA256'] == PINS['candidate'][1] and browser['expectedInputsSHA256'] == PINS['expectedInputs'][1] and browser['sourceRevisionReviewSHA256'] == binding['sourceRevisionReview']['sha256'], 'Mazda observation/source review binding differs')
    need(all(browser.get(k) is v for k, v in OPEN.items()), 'Observation overstates verification')
    need(browser['prior98QAAndReflowAreHistoricalOnly'] is True and browser['prior96PerformanceIsHistoricalOnly'] is True, 'Historical evidence must not become fresh99 proof')
    need(browser['observations'] and browser['limitations'] and browser['checks'], 'Actual scoped CUA observations and caveats required')
    disposition = browser['integrationDisposition']
    need(disposition['decision'] in {'retain_scoped', 'experimental_unaccepted'} and type(disposition['checksSupportRetention']) is bool and disposition['reason'], 'Explicit integration disposition required')
    need(disposition['decision'] != 'retain_scoped' or disposition['checksSupportRetention'] is True, 'Scoped retention needs reviewed Mazda checks')
    retaining = disposition['decision'] == 'retain_scoped'
    semantic = browser['semanticReview']
    configurations = semantic['configurations']
    need(len(configurations) == 2 and {row['route'] for row in configurations} == set(REVIEWED99['detailRoutes']) and {row['grade'] for row in configurations} == {'E35 GT', 'E35 Azami'}, 'Exactly two reviewed source-bound Mazda configurations required')
    for row in configurations:
        need(row['sourceBoundOnly'] is True and row['rankingEligible'] is False and row['completeCurrentVehicleEligible'] is False, 'Brochure detail is not ranking or completeness admission')
        for field in ('manufacturerModelYear', 'batteryUsableKWh', 'batteryGrossKWh', 'normalizedCargoLitres', 'normalizedClimateZones', 'normalizedScreenInches'):
            need(field in row and row[field] is None, 'Unresolved normalized value must remain explicit null: ' + field)
    for field in ('twoSourceBoundConfigurationsOnly', 'rankingAndCompletenessRemainFalse', 'manufacturerMYVINBuildAndAvailabilityUnknownsRetained', 'batteryGrossUsableUnknownsRetained', 'cargoClimateScreenConflictsRetained', 'buyerSummaryGuardsReviewed', 'noUnreviewedSafetyColourPayloadOrDeliveryClaims', 'priorSourceEvidenceAndConflictsRetained'):
        need(semantic[field] is True, 'Required bounded Mazda semantic review missing: ' + field)
    need(semantic['evidence'], 'Actual source/semantic evidence required')
    for ref in semantic['evidence']:
        evidence[ref['path']] = pinned(root, ref)
    def measured(value):
        return type(value) in (int, float) and math.isfinite(value) and value >= 0
    observed, supporting = set(), set()
    required_checks = {(surface, width, 'detail', route) for surface in ('production', 'portable') for width in ('narrow', 'desktop') for route in REVIEWED99['detailRoutes']}
    required_checks |= {(surface, width, kind, None) for surface in ('production', 'portable') for width in ('narrow', 'desktop') for kind in ('discovery', 'compare', 'original_hero')}
    for check in browser['checks']:
        need(check['surface'] in {'production', 'portable'} and check['viewportClass'] in {'narrow', 'desktop'} and check['kind'] in {'detail', 'discovery', 'compare', 'original_hero'}, 'Wrong scoped browser case')
        need(check['method'] == 'CUA_visible_inspection' and check['measurementKind'] == 'actual_browser_geometry' and check['route'] and check['location'] and check['observed'] and check['limitations'], 'Actual visible and measured browser evidence missing')
        width, document_width = check['viewportCSSWidth'], check['documentScrollWidth']
        need(measured(width) and width > 0 and measured(document_width) and document_width > 0, 'Actual CSS geometry missing')
        need((check['viewportClass'] == 'narrow' and 320 <= width <= 500) or (check['viewportClass'] == 'desktop' and width >= 1000), 'Actual viewport does not match declared coverage class')
        for field in ('nativeZoomPercent', 'viewportPhysicalWidth'):
            need(check[field] is None or (measured(check[field]) and check[field] > 0), 'Invalid independently observed viewport metadata')
        routes = check['configurationRoutes']
        if check['kind'] == 'detail':
            need(len(routes) == 1 and routes[0] in REVIEWED99['detailRoutes'] and check['route'] == routes[0], 'Detail case must bind one actual new route')
            key = (check['surface'], check['viewportClass'], check['kind'], routes[0])
        else:
            need((check['kind'] == 'original_hero' and routes == []) or (check['kind'] != 'original_hero' and len(routes) == 2 and set(routes) == set(REVIEWED99['detailRoutes'])), 'Discovery/compare must cover both new routes')
            key = (check['surface'], check['viewportClass'], check['kind'], None)
        fields = ('noEvidenceClippingObserved', 'heroAndNineSellingPointsUnchanged') if check['kind'] == 'original_hero' else ('noEvidenceClippingObserved', 'sourceAndEvidenceBehaviorReviewed', 'unknownsAndConflictWordingRetained', 'buyerSummaryGuardsRetained')
        need(all(type(check[field]) is bool for field in fields), 'Actual visible result booleans required')
        supported = document_width <= width + 1 and all(check[field] is True for field in fields)
        need(not retaining or supported, 'Retained Mazda integration has an unsupported observed case')
        observed.add(key)
        if supported:
            supporting.add(key)
        ref = check['evidence']
        evidence[ref['path']] = pinned(root, ref)
        need(evidence[ref['path']], 'Empty browser evidence')
    need(required_checks <= observed, 'Actual production/portable narrow/desktop detail, discovery, pair/compare and original-hero coverage required')
    need(not retaining or required_checks <= supporting, 'Scoped retention requires supporting visible evidence for every required case')
    preservation = browser['evidencePreservation']
    for field in ('exactReviewedCandidateDelta', 'allOtherBaselineInputsByteIdentical', 'originalModelYHeroAndNineSellingPointsUnchanged', 'priorSourceCodeQAAndFailureHistoryRetained', 'freshnessPlaceholderUnchanged', 'emittedArtifactComparisonAccountsForReviewedCandidateDelta'):
        need(preservation[field] is True, 'Required evidence/source-preservation review missing: ' + field)
    for ref in preservation['evidence']:
        evidence[ref['path']] = pinned(root, ref)
    need(preservation['evidence'], 'Evidence-preservation receipts missing')
    for field in ('externalRunnerObservation', 'scopedMazdaObservation', 'sourceRevisionReview', 'repairApplicationReceipt', 'cumulativeSourceReview', 'saveToolingReview', 'successfulLaunchStdout', 'successfulLaunchStderr'):
        row = binding[field]
        evidence[row['path']] = pinned(root, row)
    # Every actual failed99 attempt is listed explicitly. All earlier failures,
    # including97 failures and98 quick retries, remain in the saved98 payload.
    need(type(binding['failedAndRetryAttempts']) is list, 'Explicit failure/retry inventory required')
    seen_failures = set()
    failed_outer_capture_scopes = []
    for attempt in binding['failedAndRetryAttempts']:
        result_path = attempt['qaResult']['path']
        need(result_path not in seen_failures and result_path != binding['qaResult']['path'], 'Duplicate/current run in failed history')
        seen_failures.add(result_path)
        result_raw = pinned(root, attempt['qaResult'])
        failed = decoded(result_raw)
        failed_directory = local(root, attempt['qaResult']['path']).parent
        need(failed['schema'] == 'roadmark99.serial-qa.v1' and failed['passed'] is False and failed['runnerSHA256'] == PINS['runner'][1], 'Retained failed result was rewritten')
        admitted_failed_configurations = [
            {'baselineInputs': dict(zip(('path', 'sha256'), PINS['baselineInputs'])), 'expectedInputs': dict(zip(('path', 'sha256'), PINS[row['expectedInputsPin']])), 'candidate': dict(zip(('path', 'sha256'), PINS[row['qaCandidatePin']]))}
            for row in REVIEWED99['admittedFailedConfigurationPins']
        ]
        need(failed['configuration'] in admitted_failed_configurations, 'Failed attempt must retain its actual original or repaired source configuration')
        failed_configuration_bytes = {key: pinned(root, ref) for key, ref in failed['configuration'].items()}
        failed_expected = decoded(failed_configuration_bytes['expectedInputs'])
        failed_digest = sha(json.dumps(failed_expected, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())
        need(decoded(read(failed_directory / 'frozen-inputs.json')) == failed_expected, 'Failed attempt frozen map was rebound or rewritten')
        need('frozenInputDigest' not in failed or failed['frozenInputDigest'] == failed_digest, 'Actual optional failed-result digest differs')
        failed_request = decoded(read(failed_directory / 'execution-request.json'))
        need(failed_request['configuration'] == failed['configuration'] and failed_request['runnerSHA256'] == failed['runnerSHA256'], 'Failed launch configuration differs')
        for stage in STAGES:
            stage_path = failed_directory / (stage + '.json')
            if stage_path.is_file():
                failed_stage = decoded(read(stage_path))
                need(failed_stage['inputDigestBefore'] == failed_digest and failed_stage['inputDigestAfter'] in (None, failed_digest), 'Failed stage source identity differs')
        for key, ref in failed['configuration'].items():
            # Baseline98 is still pinned/verified above and retained byte-for-byte
            # in the complete saved98 archive; do not redundantly admit applied98/
            # into the strictly99 research selection.
            if key != 'baselineInputs':
                evidence[ref['path']] = failed_configuration_bytes[key]
        if result_path in REVIEWED99['requiredFailedConfigurations']:
            required_config = REVIEWED99['requiredFailedConfigurations'][result_path]
            need(failed['configuration']['expectedInputs'] == dict(zip(('path', 'sha256'), PINS[required_config['expectedInputsPin']])) and failed['configuration']['candidate'] == dict(zip(('path', 'sha256'), PINS[required_config['qaCandidatePin']])), 'Known failure must retain its own actual source configuration')
        need({p.name for p in failed_directory.iterdir()} == set(failed['evidence']) | {'run-result.json'}, 'Retained failed attempt membership differs')
        for filename, row in failed['evidence'].items():
            need(Path(name(filename)).name == filename, 'Failed evidence must be flat')
            path = local(failed_directory, filename)
            data = read(path)
            need(info(data) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Retained failed attempt drifted')
            evidence[path.relative_to(root).as_posix()] = data
        failed_exit = decoded(pinned(root, attempt['externalRunnerObservation']))
        need(failed_exit['schemaVersion'] == 'roadmark99.external-runner-observation.v1' and failed_exit['qaResultSHA256'] == sha(result_raw) and failed_exit['runnerSHA256'] == failed['runnerSHA256'] and type(failed_exit['exitCode']) is int and failed_exit['exitCode'] != 0 and failed_exit['actualTerminalReviewed'] is True and failed_exit['observedAtUTC'], 'Actual retained external failure missing')
        terminal_evidence = failed_exit['terminalEvidence']
        if 'path' in terminal_evidence:
            evidence[terminal_evidence['path']] = pinned(root, terminal_evidence)
        else:
            # Preserve the genuine inline tool response in the pinned root
            # receipt. It is not converted into an invented execution artifact.
            tool_result = terminal_evidence['toolResult']
            need(type(tool_result) is dict and tool_result['exit_code'] == failed_exit['exitCode'] and type(tool_result['output']) is str and tool_result['chunk_id'], 'Actual inline failure terminal differs')
        for field in ('qaResult', 'externalRunnerObservation'):
            ref = attempt[field]
            evidence[ref['path']] = pinned(root, ref)
        if 'launchToolExcerpts' in attempt:
            need('launchStdout' not in attempt and 'launchStderr' not in attempt, 'Merged tool excerpts must not masquerade as separate outer streams')
            ref = attempt['launchToolExcerpts']
            excerpts_raw = pinned(root, ref)
            excerpts = decoded(excerpts_raw)
            need(excerpts['schema'] == 'roadmark99.outer-tool-output-excerpts.v1' and excerpts['captureMode'] == 'merged_exec_tool_output' and excerpts['stdoutStderrSeparated'] is False and excerpts['completeOuterStreamsRetained'] is False and excerpts['note'], 'Explicit partial/merged outer capture scope required')
            need(type(excerpts['sessionId']) is int and excerpts['sessionId'] > 0 and type(excerpts['excerpts']) is list and excerpts['excerpts'], 'Actual tool session/excerpts missing')
            for item in excerpts['excerpts']:
                need(type(item['chunk_id']) is str and item['chunk_id'] and type(item['output']) is str, 'Actual tool excerpt fields missing')
                need('exit_code' not in item or (type(item['exit_code']) is int and item['exit_code'] == failed_exit['exitCode']), 'Tool excerpt exit differs from real failure')
            terminal_result = decoded(pinned(root, terminal_evidence))['toolResult'] if 'path' in terminal_evidence else terminal_evidence['toolResult']
            need(terminal_result['exit_code'] == failed_exit['exitCode'] and any(all(item.get(key) == terminal_result[key] for key in ('chunk_id', 'output', 'exit_code')) for item in excerpts['excerpts']), 'Merged excerpts do not retain the exact real terminal return')
            evidence[ref['path']] = excerpts_raw
            failed_outer_capture_scopes.append({'qaResult': attempt['qaResult'], 'launchToolExcerpts': ref, 'stdoutStderrSeparated': False, 'completeOuterStreamsRetained': False, 'note': excerpts['note']})
        else:
            for field in ('launchStdout', 'launchStderr'):
                ref = attempt[field]
                evidence[ref['path']] = pinned(root, ref)
            failed_outer_capture_scopes.append({'qaResult': attempt['qaResult'], 'captureMode': 'actual_separate_launch_files', 'launchStdout': attempt['launchStdout'], 'launchStderr': attempt['launchStderr']})
    need(set(REVIEWED99['requiredFailedAttemptPaths']) <= seen_failures, 'Known failed99 attempt omitted; actual sealed failure and outer exit are required')
    listed = set()
    for row in binding['researchFiles']:
        need(row['path'] not in listed, 'Duplicate research reference')
        listed.add(row['path'])
        evidence[row['path']] = pinned(root, row)
    need(REQUIRED_RESEARCH | set(REVIEWED99['requiredResearchPaths']) <= listed, 'Required source/review/quick-check history omitted')
    # Explicitly freeze everything selected for the concise research supplement.
    for key in ('sourceCandidate', 'candidate', 'expectedInputs', 'runner', 'initialSourceCandidate', 'initialExpectedInputs', 'initialQACandidate', 'secondSourceCandidate', 'secondExpectedInputs', 'secondQACandidate', 'thirdSourceCandidate', 'thirdExpectedInputs', 'thirdQACandidate', 'repairCandidate', 'typeRepairCandidate', 'scopedTypeRepairCandidate'):
        evidence[PINS[key][0]] = anchors[key]
    evidence[args.binding] = binding_raw
    for path, raw in evidence.items():
        lower = path.lower()
        need(path.startswith(ALLOWED_RESEARCH) and Path(path).suffix.lower() in {'.json', '.jsonl', '.log', '.md', '.txt', '.py', '.mjs', '.patch'}, 'Unapproved research path/type: ' + path)
        need(not any(x in lower for x in ('capture', 'screenshot', 'private', 'secret', 'queue', 'mercedes', 'technical-candidate')), 'Sensitive/raw/unrelated research path rejected: ' + path)
        need(len(raw) <= 2 * 1024 * 1024, 'Research file exceeds concise limit: ' + path)
        raw.decode('utf-8')
    need(sum(map(len, evidence.values())) <= 12 * 1024 * 1024, 'Research supplement exceeds12MiB')
    prior = zip_read(local(root, PINS['source98'][0]))
    need(prior['roadmark/recovery98/research/roadmark-research/applied98/expected-inputs.json'] == anchors['baselineInputs'], 'Exact baseline98 map history differs')
    old_manifest = prior['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']
    old = decoded(old_manifest)
    prior_inventory = {r['path']: {'sha256': r['sha256'], 'bytes': r['bytes']} for r in old['files']}
    need(set(prior) == set(prior_inventory) | {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json'}, 'Prior source inventory differs')
    need(all(info(prior[p]) == row for p, row in prior_inventory.items()), 'Prior payload drift')
    need(old['pairId'] == saved98['pairId'], 'Prior saved/source pair differs')
    excluded = {r['path'] for r in old['excludedQABrowserRasters']}
    need(excluded.isdisjoint(expected) and all('roadmark/' + p not in prior for p in excluded) and all('roadmark/' + p not in prior for p in ALIASES), 'Previously excluded output entered source')
    need(all(sha(prior['roadmark/' + p]) == value for p, value in baseline.items()), 'Saved98/input map mismatch')
    for rel, row in rows.items():
        if row['beforeSHA256'] is not None:
            need(info(prior['roadmark/' + rel]) == {'sha256': row['beforeSHA256'], 'bytes': row['beforeBytes']}, 'Saved98 exact replacement preimage differs')
        else:
            need('roadmark/' + rel not in prior, 'New99 path already exists in saved98 payload')
    pair = 'roadmark-recovered99-' + portable['sha256'][:16] + '-' + qa['actualBuildID']
    scope = dict(OPEN, fullSerialQAPassed=True, qaResult=binding['qaResult'], actualExternalExit=binding['externalRunnerObservation'], actualTestTallies=tallies, failedAttemptOuterCaptureScopes=failed_outer_capture_scopes, scopedMazdaObservation=browser, boundary=qa['boundary'], prior98QAIsHistoricalOnly=True, prior98PerformanceIsHistoricalOnly=True, prior96PerformanceIsHistoricalOnly=True, independent98OutputEquivalenceClaimed=False, upstreamOriginalResearchRecoveryIncomplete=True)
    common = {'schemaVersion': 'roadmark99.checkpoint-manifest.v1', 'applicationCheckpoint': 99, 'pairId': pair, 'createdAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'productionBuildId': qa['actualBuildID'], 'portableIndexSHA256': portable['sha256'], 'portableIndexBytes': portable['bytes'], 'integrationDisposition': disposition, 'verificationScope': scope, 'baseline98': {'source': dict(path=PINS['source98'][0], **info(anchors['source98'])), 'preview': dict(path=PINS['preview98'][0], **info(anchors['preview98'])), 'saveReceipt': dict(path=PINS['saved98'][0], **info(anchors['saved98']))}, 'sourceScope': {'baselineInputCount': len(baseline), 'finalInputCount': len(expected), 'candidateManifestSHA256': PINS['sourceCandidate'][1], 'qaCandidateManifestSHA256': PINS['candidate'][1], 'expectedInputsSHA256': PINS['expectedInputs'][1], 'changes': list(rows.values())}, 'releaseApproved': False}
    notice = ('ROADMARK99 SOURCE-BOUND MAZDA CHECKPOINT\n\nPair: ' + pair + '\nIntegration disposition: ' + disposition['decision'] + '\nReason: ' + disposition['reason'] + '\n\nTwo source-bound Mazda E35 GT/E35 Azami detail configurations are included only within the reviewed candidate delta. An experimental_unaccepted disposition does not establish an accepted integration; retain saved98 as fallback. Manufacturer MY, VIN/build applicability, accepted orders and present unsold physical stock remain unverified. Gross/usable battery and normalized cargo/climate/screen conflicts remain unresolved. Ranking and completeness admission remain false. Buyer-summary guards and original Model Y hero plus nine selling points are retained. All earlier source, code, QA failures and historical payloads remain; replaced preimages, the old source manifest and actual98 save evidence are preserved separately. Fresh serial QA and scoped production/portable browser evidence are recorded. Prior98 reflow/QA and earlier performance evidence remain historical. Real phones, accelerated WebGL, full journeys, sustained stability, full visual/release approval, public export and complete upstream research recovery remain open. No deployment or publication is implied.\n\nSource is shipped in numbered parts plus a recovery kit. Extract only the kit, keep every numbered ZIP beside its manifest, and run its joiner with Python3. The joiner reconstructs the full source ZIP; it does not execute the application. Keep the full source ZIP locally. Never treat a preview as source recovery.\n').encode()
    source = dict(prior)
    source.pop('roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    additions = {'roadmark/recovery99/history/checkpoint98-source-manifest.json': old_manifest, 'roadmark/recovery99/history/checkpoint98-correlated-save-receipt.json': anchors['saved98'], 'roadmark/recovery99/history/checkpoint98-actual-helper-results.json': anchors['saved98helper'], 'roadmark/recovery99/history/checkpoint98-upload-plan.json': anchors['saved98plan'], 'READ-ME-FIRST-ROADMARK99.txt': notice, 'roadmark/RECOVERY99-READ-ME-FIRST.txt': notice}
    additions.update({'roadmark/recovery99/history/checkpoint98-preimages/' + rel: prior['roadmark/' + rel] for rel, row in rows.items() if row['beforeSHA256'] is not None})
    additions.update({'roadmark/recovery99/history/' + phase + '-superseded-postimages/' + rel: raw for (phase, rel), raw in historical_source.items()})
    additions.update({'roadmark/recovery99/research/' + path: raw for path, raw in evidence.items()})
    need(set(additions).isdisjoint(source), 'New history/research path collides')
    source.update(additions)
    for rel in rows:
        source['roadmark/' + rel] = read(local(app, rel))
    for p, raw in prior.items():
        if p not in {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json', *('roadmark/' + p for p in rows)}:
            need(source[p] == raw, 'Unrelated98 payload changed: ' + p)
    source['roadmark/CHECKPOINT-SOURCE-MANIFEST.json'] = encoded(dict(common, role='source', files=inventory(source), excludedQABrowserRasters=old['excludedQABrowserRasters'], portablePreviewArchive='Roadmark-recovered-99-portable-preview.zip'))
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(app), 'Output must be new, external, with existing parent')
    output.mkdir()
    source_path = output / 'Roadmark-recovered-99-source.zip'
    zip_write(source_path, source)
    full = dict(filename=source_path.name, **info(read(source_path)), role='source', operation='create', chatDelivery=False)
    preview = {'roadmark/' + p: read(local(app, p)) for p in ALIASES}
    preview.update({'READ-ME-FIRST-ROADMARK99.txt': notice, 'roadmark/OPEN-PORTABLE-PREVIEW99.txt': b'Open index.html or index-b.html in a browser. This is a portable preview, not the source archive.\n'})
    preview['roadmark/CHECKPOINT-PREVIEW-MANIFEST.json'] = encoded(dict(common, role='preview', files=inventory(preview), sourceArchive=full))
    preview_path = output / 'Roadmark-recovered-99-portable-preview.zip'
    zip_write(preview_path, preview)
    research = {'research/' + path: raw for path, raw in evidence.items()}
    research['READ-ME-FIRST-ROADMARK99.txt'] = notice
    research['RESEARCH-MANIFEST.json'] = encoded(dict(common, role='concise_research_supplement', files=inventory(research), notOriginalResearchIndex79=True))
    research_path = output / 'Roadmark-99-recovery-research-supplement.zip'
    zip_write(research_path, research)
    source_bytes, parts = read(source_path), []
    for offset in range(0, len(source_bytes), CHUNK):
        number = len(parts) + 1
        payload = source_bytes[offset:offset + CHUNK]
        member = 'roadmark-source-99.part%02d.bin' % number
        path = output / ('Roadmark-source-99-chat-part-%d.zip' % number)
        zip_write(path, {member: payload}, stored=True)
        parts.append(dict(filename=path.name, **info(read(path)), member=member, payloadBytes=len(payload), payloadSHA256=sha(payload), role='source_part', operation='create', chatDelivery=True))
    part_manifest = {'schemaVersion': 'roadmark99.source-parts.v1', 'applicationCheckpoint': 99, 'pairId': pair, 'chunkBytes': CHUNK, 'originalFilename': full['filename'], 'originalBytes': full['bytes'], 'originalSHA256': full['sha256'], 'parts': parts}
    kit_files = {'source-parts.json': encoded(part_manifest), 'join_recovered99_source.py': joiner_raw, 'README.txt': notice}
    kit_path = output / 'Roadmark-source-99-recovery-kit.zip'
    zip_write(kit_path, kit_files)
    # Execute bytes read back from the shipped kit, not a separate implementation.
    recovered_kit = zip_read(kit_path)
    test_root = output / 'joiner-self-test'
    test_root.mkdir()
    for filename, raw in recovered_kit.items():
        write(test_root / filename, raw)
    for part in parts:
        write(test_root / part['filename'], read(output / part['filename']))
    argv = [sys.executable, '-B', str(test_root / 'join_recovered99_source.py'), '--parts-directory', str(test_root)]
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    proc = subprocess.run(argv, capture_output=True, text=True, check=False)
    write(test_root / 'stdout.log', proc.stdout.encode())
    write(test_root / 'stderr.log', proc.stderr.encode())
    need(proc.returncode == 0, 'Shipped joiner failed; retain attempt and stop')
    joined = read(test_root / full['filename'])
    result = decoded(proc.stdout)
    need(joined == source_bytes and result['sha256'] == full['sha256'] and result['bytes'] == full['bytes'] and result['pairId'] == pair, 'Shipped joiner reconstruction differs')
    self_test = {'schemaVersion': 'roadmark99.kit-self-test.v1', 'argv': argv, 'startedAtUTC': started, 'finishedAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'exitCode': proc.returncode, 'result': result, 'exactBytesReassembled': True, 'applicationExecuted': False, 'kitSHA256': sha(read(kit_path)), 'shippedJoinerSHA256': sha(recovered_kit['join_recovered99_source.py']), 'stdout': dict(path='joiner-self-test/stdout.log', **info(proc.stdout.encode())), 'stderr': dict(path='joiner-self-test/stderr.log', **info(proc.stderr.encode()))}
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
    plan = {'schemaVersion': 'roadmark99.upload-plan.v1', 'applicationCheckpoint': 99, 'pairId': pair, 'status': 'local_archives_verified_not_uploaded', 'allLibraryItemsNewCreates': True, 'sourcePartsAlwaysProvidedForChat': True, 'fullSourceLibrarySaveRequested': full['bytes'] < POLICY, 'localUploadPolicyBytes': POLICY, 'genericHelperSizeCapVerified': False, 'fullSourceArchive': full, 'joinerSelfTest': dict(path='joiner-self-test-receipt.json', **info(encoded(self_test))), 'binding': dict(path=args.binding, **info(binding_raw)), 'packagerSHA256': args.approved_packager_sha256, 'joinerSHA256': args.approved_joiner_sha256, 'uploads': uploads, 'immutable98FallbackRetained': True, 'releaseApproved': False}
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
