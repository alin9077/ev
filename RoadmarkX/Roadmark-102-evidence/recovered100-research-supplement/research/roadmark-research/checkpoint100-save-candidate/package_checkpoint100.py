#!/usr/bin/env python3
"""ROOT-RUN ONLY: package a scoped checkpoint100 after genuine QA and observation.

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
PINS = {'applicationReceipt': ('roadmark-research/applied100/application-receipt.json', 'adb675fb91e8b7382f6dc49a9f93f6c006c72736bbe75b7a7026bb51a8d176bf'), 'baselineInputs': ('roadmark-research/applied99/revision4/expected-inputs.json', '4a4204128daf108f35296c77d3beb4476a453c98ab571648da9d85b1b0085e86'), 'candidate': ('roadmark-research/applied100/qa-candidate-manifest.json', '7d85b68eb8b73d6b3dcdca3c6df7f882cf494686c610c5820d5222253fe6784d'), 'expectedInputs': ('roadmark-research/applied100/expected-inputs.json', '39caa8ae30cf2c6bc09026d0dd87b6fd42811fd8ddb2d632c5d3d18092818225'), 'originalCandidate': ('roadmark-research/market100-candidate/manifest.json', '52061d869f2e1cab0ca3cec6252a57200f251bb4b7317337dd3f9cf168ebaa66'), 'preview99': ('roadmark-recovery/final99-attempt1/Roadmark-recovered-99-portable-preview.zip', '0ababbe0d9e9c16aea35f1cb3f427e20d5536d1d0b3b4e11a0a3a88ab78e993a'), 'runner': ('roadmark-research/qa99-candidate/run_qa99.py', 'a043d6ac749a39d025bf452eddb55440d2ac81ba3b73be9f4d894a5055a2e10f'), 'saved99': ('roadmark-recovery/final99-review/correlated-save-receipt.json', '71f2234b1d225cec88384ae056052270de6777aad3e25e7a296d47562c43435e'), 'saved99helper': ('roadmark-recovery/final99-review/library-upload.stdout.json', '17764d775ba36041aa2424cd323efc8071320de231ab42db19a897df23d9b5ca'), 'saved99plan': ('roadmark-recovery/final99-attempt1/upload-plan.json', '319afbd9404a7444b1361678f382080e5c4d4af9dcb042177a618bdb3c937e65'), 'source99': ('roadmark-recovery/final99-attempt1/Roadmark-recovered-99-source.zip', '7514bab9524cdb08af0b9fb8b7b1f001435f61526590c929f069d03c8b7f4fd1'), 'sourceCandidate': ('roadmark-research/applied100/candidate-manifest.json', '52061d869f2e1cab0ca3cec6252a57200f251bb4b7317337dd3f9cf168ebaa66'), 'sourceReview': ('roadmark-research/review-market100/DECISION.json', 'ff08ea1eb44d828136bc5da242c776ad98752ebd859519ac9653a68675a01c64'), 'artifactVerifier': ('roadmark-research/artifact100-candidate/verify-portable100-delta.py', 'aa431a1114e942b9100d680cc7df35cfacb9bdc8487be023eef0ccbec9dafd3e')}
CANDIDATE_PATHS = ['data/market-inventory-2026-10-10.json', 'qa/checkpoint100-market-fixture.json', 'tests/checkpoint100-market.test.ts', 'tests/helpers/checkpoint100-market-history.ts', 'tests/helpers/checkpoint99-history.ts']
HELD_IDS = ['bmw-i3', 'bmw-ix4', 'dfac-captain-45e', 'dfac-captain-85e', 'pioneer-ev-dfsk-ec35', 'mercedes-benz-eqb', 'mercedes-benz-eqe-sedan', 'mercedes-benz-eqe-suv', 'mercedes-benz-eqs-suv', 'mercedes-benz-maybach-eqs']
REQUIRED_RESEARCH = set(['roadmark-research/artifact100-candidate/BASELINE-STATIC-INSPECTION.json', 'roadmark-research/artifact100-candidate/DERIVATION.md', 'roadmark-research/artifact100-candidate/INPUT-PINS.json', 'roadmark-research/artifact100-candidate/SHA256SUMS', 'roadmark-research/artifact100-candidate/derivation.diff', 'roadmark-research/artifact100-candidate/manifest.json', 'roadmark-research/artifact100-candidate/reviewed99-helpers.txt', 'roadmark-research/artifact100-candidate/verify-portable100-delta.py', 'roadmark-research/bmw-market-gap-research/SHA256SUMS', 'roadmark-research/bmw-market-gap-research/before-objects.json', 'roadmark-research/bmw-market-gap-research/research-candidate.json', 'roadmark-research/bmw-market-gap-research/source-provenance.json', 'roadmark-research/checkpoint100-save-candidate/DERIVATION-BASES.json', 'roadmark-research/checkpoint100-save-candidate/DERIVATION.diff', 'roadmark-research/checkpoint100-save-candidate/HANDOFF.md', 'roadmark-research/checkpoint100-save-candidate/PROTECTED-PRIOR-LIBRARY-IDS.json', 'roadmark-research/checkpoint100-save-candidate/verify_checkpoint100_saves.py', 'roadmark-research/market100-candidate/BASELINE-STATIC-CHECK.json', 'roadmark-research/market100-candidate/README.md', 'roadmark-research/market100-candidate/STATIC-VERIFICATION.json', 'roadmark-research/market100-candidate/changes.patch', 'roadmark-research/mercedes-market-batch-research/candidate.json', 'roadmark-research/mercedes-market-batch-research/capture-manifest.json', 'roadmark-research/next-market-gap-research/input-manifest.json', 'roadmark-research/next-market-gap-research/lead-dispositions.json', 'roadmark-research/next-market-gap-research/manifest.json', 'roadmark-research/next-market-gap-research/source-provenance.json', 'roadmark-research/qa99-candidate/MANIFEST.json', 'roadmark-research/qa99-candidate/README.md', 'roadmark-research/review-bmw-market-gap/README.md', 'roadmark-research/review-bmw-market-gap/review.json', 'roadmark-research/review-market100/REVIEW.md', 'roadmark-research/review-market100/candidate-code-and-packet-review.json', 'roadmark-research/review-market100/candidate-data-review.json', 'roadmark-research/review-market100/research-integrity-check.json', 'roadmark-research/review-mercedes-market-batch/REVIEW.md', 'roadmark-research/review-mercedes-market-batch/VERIFICATION.json', 'roadmark-research/review-next-market-gap/REVIEW.json', 'roadmark-research/review-next-market-gap/REVIEW.md'])
RESEARCH_PINS = {'roadmark-research/bmw-market-gap-research/research-candidate.json': '8c7a14e8937f85aabed7ec30676c5a26fdc09445203166fc51b21259fbe31937', 'roadmark-research/bmw-market-gap-research/before-objects.json': 'dc3b354910e4a52d1fd34a9435d7288deff359030d4b4ec177a134e7fefa5895', 'roadmark-research/bmw-market-gap-research/source-provenance.json': '64831fac7b3fca4bc06b9c6c9144d7d2e3545094107875d9c543b0e44dffaf65', 'roadmark-research/bmw-market-gap-research/SHA256SUMS': '5564599b0123a88ab9d8cdec459fe3ec66ebd138050e68301bd50eba463b74a1', 'roadmark-research/review-bmw-market-gap/review.json': '61ea93982c3fbc82f26c0989e2cc732db5fe32eff795262c593d4a6d28cbbab3', 'roadmark-research/review-bmw-market-gap/README.md': '2cec95c92ac50296672bc97494eef4d3466c34a51f42affad641088cefd40f53', 'roadmark-research/next-market-gap-research/lead-dispositions.json': '6eba755df5527d2ff860ebb23f04864e66971d401e87f6ebfc23ea6a69ca295f', 'roadmark-research/next-market-gap-research/input-manifest.json': '3a21b3f5315e7c05f1dbfd2e2710473457b6ad04a7cead2aa546d750ebd20e7d', 'roadmark-research/next-market-gap-research/source-provenance.json': '7f8eb04fffb8c56fb63db429834ecd959b7de3dc49fafe3bf84913ebc0163270', 'roadmark-research/next-market-gap-research/manifest.json': '131b3ccbbc11229fc0dd21d5007da2675e09086f59c5966c8b8b4bb95eddd8a1', 'roadmark-research/review-next-market-gap/REVIEW.json': '8b276209aec9b5587d553a9cda05d25a760653ae52b1b56c055e25547bb28df7', 'roadmark-research/review-next-market-gap/REVIEW.md': 'd0522b0f76047f149699a52d1d69a171861d08a198655e8a731b5ad1d3979257', 'roadmark-research/mercedes-market-batch-research/candidate.json': '42b92bc028673a2af0aa7730dcfb8fa24dfc84e834b1462289629a0b85a13df6', 'roadmark-research/mercedes-market-batch-research/capture-manifest.json': '97fd9578b149199fcf71636a5ed1c511f78f92c9489a958b31caa4aa7765ba09', 'roadmark-research/review-mercedes-market-batch/VERIFICATION.json': '523f047ae3bc174436acd746d24c7dea549c2e4f1ea9e1a1812ea20792f31d81', 'roadmark-research/review-mercedes-market-batch/REVIEW.md': '42d3d4d44ea0587608447d1969fad09123490e5d312dd2ef24bb67bcf75b5a0d'}
ALLOWED_RESEARCH = ('roadmark-research/applied100/', 'roadmark-research/market100-candidate/', 'roadmark-research/review-market100/', 'roadmark-research/qa99-candidate/', 'roadmark-research/review-qa99/', 'roadmark-research/checkpoint100-save-candidate/', 'roadmark-research/review-checkpoint100-save/', 'roadmark-research/browser-market100/', 'roadmark-research/artifact100-candidate/', 'roadmark-research/review-artifact100/', 'roadmark-recovery/final100-review/')
OPEN = {'phoneVerified': False, 'acceleratedWebGLVerified': False, 'fullJourneyVerified': False, 'fullVisualPassClaimed': False, 'sustainedStabilityClaimed': False, 'publicExportRun': False, 'releaseApproved': False, 'wholeProductionRuntimeGraphEquivalenceClaimed': False, 'independentServerByteVerificationPerformed': False, 'fresh100PerformanceImprovementClaimed': False, 'automatedBrowserSuitePassed': False, 'newEvidenceIndexRestorationIncluded': False, 'newVehicleOrTrimAdmissionClaimed': False, 'availabilityVerified': False}

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
    # The unchanged reviewed99 runner retains its mechanics schema label.
    # Actual100 identity is the exact configuration, map, artifacts and terminal.
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
    need(read(app / '.next/BUILD_ID').decode().strip() == qa['actualBuildID'] and qa['actualBuildID'] != '2ATnTkC6XOpEMKXbUzc0U', 'Current BUILD_ID not fresh100')
    external = decoded(pinned(root, binding['externalRunnerObservation']))
    need(external['schemaVersion'] == 'roadmark100.external-runner-observation.v1' and external['qaResultSHA256'] == sha(raw) and external['runnerSHA256'] == PINS['runner'][1] and external['exitCode'] == 0 and external['actualTerminalReviewed'] is True and external['observedAtUTC'], 'Actual external runner exit not established')
    need(type(external['exitCode']) is int, 'Outer exit must be an observed integer')
    terminal_evidence = external['terminalEvidence']
    if 'path' in terminal_evidence:
        evidence[terminal_evidence['path']] = pinned(root, terminal_evidence)
    else:
        tool_result = terminal_evidence['toolResult']
        need(type(tool_result) is dict and tool_result['exit_code'] == 0 and type(tool_result['output']) is str and tool_result['chunk_id'], 'Actual inline success terminal differs')
    evidence[binding['qaResult']['path']] = raw
    return qa, tallies, evidence


def verify_portable_delta(root, app, binding, qa, anchors, evidence):
    raw = pinned(root, binding['portableArtifactVerification'])
    result = decoded(raw)
    need(result['schema'] == 'roadmark-portable100-static-observation-v1' and result['status'] == 'passed' and result['checkpoint'] == 100 and result['baselineCheckpoint'] == 99, 'Actual successful100 portable comparison required')
    need(result['scriptSHA256'] == PINS['artifactVerifier'][1] and result['verificationScope'] == 'actual_HTML_bytes_and_complete_decoded_payload', 'Reviewed artifact verifier/scope differs')
    inputs = result['inputs']
    need(inputs['saved99ZIP'] == {'path': str(local(root, PINS['preview99'][0])), 'sha256': PINS['preview99'][1]}, 'Artifact baseline ZIP differs')
    need(inputs['saved99HTML'] == {'member': 'roadmark/index.html', 'sha256': '22bbd67dcb7de6fd46598c61c34f10894ef63f2cb02eb7f58af0c7ffb1336a80', 'bytes': 37013686}, 'Artifact baseline99 HTML differs')
    current = inputs['actual100HTML']
    portable = qa['artifacts'][ALIASES[0]]
    need(current['sha256'] == current['expectedSHA256SuppliedExternally'] == portable['sha256'] and current['bytes'] == portable['bytes'] and current['path'] in {str(local(app, rel)) for rel in ALIASES}, 'Actual100 portable proof is not joined to current QA output')
    fixture_raw = read(local(app, 'qa/checkpoint100-market-fixture.json'))
    fixture = decoded(fixture_raw)
    need(inputs['reviewedFixtureSHA256'] == sha(fixture_raw) == '6ca6057ef2db97fb7aa1251e307f9d419c88dadfe67d2390014ccd436f967837' and inputs['candidateManifestSHA256'] == PINS['sourceCandidate'][1] and inputs['candidateMarketSHA256'] == '2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac', 'Portable proof fixture/candidate/market differs')
    delta = result['delta']
    fields = ['checkedAt', 'evidenceNote', 'limitations', 'sourceUrls']
    expected_rows = [[row['section'], row['index'], row['id']] for row in fixture['changes']]
    expected_paths = ['/marketInventory/' + row['section'] + '/' + str(row['index']) + '/' + field for row in fixture['changes'] for field in fields]
    need(delta['rows'] == expected_rows and delta['changedFieldsPerRow'] == fields and delta['allowedFieldPaths'] == expected_paths, 'Portable proof exceeds exact ten-row/four-field scope')
    need(delta['fixtureExact'] is True and delta['candidateMarketExact'] is True and delta['additionalAuditExceptions'] == [] and result['outsideEvData']['byteIdentical'] is True, 'Portable payload/exterior differs')
    preserved = result['preserved']
    need(all(preserved[key] is True for key in ('allOtherDecodedValues', 'arrayOrder', 'objectKeyOrder')) and preserved['topLevelKeys'] == ['marketInventory', 'cars', 'packs', 'research', 'counts', 'art'] and preserved['marketRecords'] == 242 and preserved['unverifiedLeads'] == 143, 'Portable preservation contract differs')
    need(result['notVerified'] == ['browser_hydration_or_runtime_execution', 'visual_or_mobile_rendering', 'whole_Next_production_module_graph', 'source_tree_or_build_provenance', 'canonical_string_table_layout_or_unused_dictionary_entries', 'other_HTML_files_or_delivery_archives', 'market_claim_truth_or_freshness', 'full_market_or_trim_universe', 'publisher_origin_bytes'], 'Portable proof limitations missing or changed')
    evidence[binding['portableArtifactVerification']['path']] = raw
    evidence[PINS['artifactVerifier'][0]] = anchors['artifactVerifier']
    return result


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
    joiner_raw = read(Path(__file__).parent / 'join_recovered100_source.py')
    need(sha(joiner_raw) == args.approved_joiner_sha256, 'Joiner approval pin differs')
    binding_raw = pinned(root, {'path': args.binding, 'sha256': args.binding_sha256})
    binding = decoded(binding_raw)
    need(binding['schemaVersion'] == 'roadmark100.save-inputs.v1', 'Wrong current100 save binding')
    for field in ('rootReviewed', 'allKnownFailedAndRetryEvidenceListed', 'noConcurrentAppWriters', 'selectedResearchReviewedForSecretsAndRelevance'):
        need(binding[field] is True, 'Root acceptance missing: ' + field)
    anchors = {key: pinned(root, {'path': path, 'sha256': digest}) for key, (path, digest) in PINS.items()}
    need(len(anchors['source99']) == 47830120 and len(anchors['preview99']) == 16423587, 'Wrong saved99 fallback sizes')
    saved99, prior_plan = decoded(anchors['saved99']), decoded(anchors['saved99plan'])
    need(saved99['librarySavesComplete'] is True and saved99['applicationCheckpoint'] == 99, 'Verified saved99 fallback required')
    need(saved99['actualHelperResults']['sha256'] == sha(anchors['saved99helper']) and saved99['uploadPlanSHA256'] == sha(anchors['saved99plan']), 'Actual99 receipt/helper/plan chain differs')
    need(prior_plan['fullSourceArchive']['sha256'] == PINS['source99'][1] and prior_plan['fullSourceArchive']['bytes'] == len(anchors['source99']) and prior_plan['pairId'] == saved99['pairId'], 'Actual99 source/save identity differs')
    prior_preview = [row for row in saved99['saved'] if row['role'] == 'preview']
    need(len(prior_preview) == 1 and prior_preview[0]['localSHA256'] == PINS['preview99'][1] and prior_preview[0]['localBytes'] == len(anchors['preview99']), 'Actual99 preview identity differs')
    baseline, expected, candidate = (decoded(anchors[key]) for key in ('baselineInputs', 'expectedInputs', 'sourceCandidate'))
    need(anchors['sourceCandidate'] == anchors['originalCandidate'], 'Application candidate differs from reviewed original')
    need(candidate['baselineSourceMap'] == dict(path=PINS['baselineInputs'][0], sha256=PINS['baselineInputs'][1], inputCount=1675), 'Candidate baseline differs')
    need(len(baseline) == 1675 and len(expected) == 1678, 'Wrong current100 input count')
    need([row['path'] for row in candidate['files']] == CANDIDATE_PATHS and len(CANDIDATE_PATHS) == 5, 'Wrong reviewed five-path scope')
    projected = [{'path': row['path'], 'beforeSHA256': row['beforeSHA256'], 'sha256': row['afterSHA256'], 'bytes': row['afterBytes']} for row in candidate['files']]
    need(decoded(anchors['candidate']) == {'appRoot': APP, 'files': projected}, 'QA projection differs from exact reviewed100 source fields')
    review, applied = decoded(anchors['sourceReview']), decoded(anchors['applicationReceipt'])
    need(review['decision'] == 'GO_EXACT_CANDIDATE_ROOT_APPLICATION_AND_EXECUTION_ONLY' and review['candidateManifest'] == dict(zip(('path', 'sha256'), PINS['originalCandidate'])), 'Exact100 source review differs')
    need(applied['rootApplied'] is True and applied['baselineInputs'] == 1675 and applied['finalInputs'] == 1678 and applied['candidateSHA256'] == PINS['originalCandidate'][1] and applied['reviewSHA256'] == PINS['sourceReview'][1] and applied['files'] == candidate['files'], 'Root application receipt differs')
    rows, wanted = {}, dict(baseline)
    for original, row in zip(candidate['files'], projected):
        rel = name(row['path'])
        need(rel not in rows and original['operation'] == ('add' if row['beforeSHA256'] is None else 'replace'), 'Duplicate or incorrect operation')
        need(row['beforeSHA256'] == baseline.get(rel) and row['sha256'] != row['beforeSHA256'], 'Candidate baseline/unchanged postimage differs')
        need((row['beforeSHA256'] is None and original['beforeBytes'] is None) or (type(original['beforeBytes']) is int and original['beforeBytes'] > 0), 'Invalid preimage size')
        data = read(local(app, rel))
        need(info(data) == {k: row[k] for k in ('sha256', 'bytes')}, 'Applied postimage differs')
        data.decode('utf-8')
        rows[rel] = dict(row, beforeBytes=original['beforeBytes'])
        wanted[rel] = row['sha256']
    need(sum(row['beforeSHA256'] is None for row in rows.values()) == 3, 'Exactly three additions required')
    need(wanted == expected == input_map(app), 'Current source differs from exact reviewed delta')
    qa, tallies, evidence = verify_qa(root, app, binding, expected)
    portable = qa['artifacts'][ALIASES[0]]
    artifact_verification = verify_portable_delta(root, app, binding, qa, anchors, evidence)
    browser = decoded(pinned(root, binding['scopedMarketObservation']))
    need(browser['schemaVersion'] == 'roadmark100.scoped-market-observation.v1' and browser['checkpoint'] == 100 and browser['browser'] == 'own VM Chromium' and browser['observedAtUTC'], 'Actual bounded market observation required')
    need(browser['productionBuildID'] == qa['actualBuildID'] and browser['portableSHA256'] == portable['sha256'] and browser['portableBytes'] == portable['bytes'], 'Observed100 artifacts differ')
    need(browser['candidateManifestSHA256'] == PINS['sourceCandidate'][1] and browser['qaCandidateManifestSHA256'] == PINS['candidate'][1] and browser['expectedInputsSHA256'] == PINS['expectedInputs'][1] and browser['sourceRevisionReviewSHA256'] == PINS['sourceReview'][1], 'Browser/source100 identity differs')
    need(browser['baselineSourceSHA256'] == PINS['source99'][1] and browser['baselinePreviewSHA256'] == PINS['preview99'][1], 'Observed saved99 baseline differs')
    need(all(browser.get(k) is v for k, v in OPEN.items()) and browser['prior99EvidenceIsHistoricalOnly'] is True, 'Bounded observation overstates fresh verification')
    need(browser['observations'] and browser['limitations'] and browser['checks'], 'Actual observation text and caveats required')
    disposition = browser['integrationDisposition']
    need(disposition['decision'] in {'retain_scoped', 'experimental_unaccepted'} and type(disposition['checksSupportRetention']) is bool and disposition['reason'], 'Explicit integration disposition required')
    retaining = disposition['decision'] == 'retain_scoped'
    need(not retaining or disposition['checksSupportRetention'] is True, 'Retention needs actual support')
    semantic = browser['semanticReview']
    need(semantic['heldIds'] == HELD_IDS and semantic['changedFields'] == ['checkedAt', 'evidenceNote', 'limitations', 'sourceUrls'], 'Ten held objects/four fields differ')
    for field in ('tenHeldEntriesOnly', 'noVehicleTrimTechnicalRankingCountOrCompletenessAdmission', 'orderAndStockUnknownsRetained', 'globalAustralianVariantTimingSeparated', 'researchProvenanceQualificationsRetained', 'originalModelYHeroAndNineSellingPointsUnchanged', 'allOtherBaselineInputsByteIdentical', 'eightUnresolvedLeadsAreStaticAuditDataNotVisibleUI'):
        need(semantic[field] is True, 'Required bounded semantic review missing: ' + field)
    need(semantic['evidence'], 'Actual semantic/preservation receipts required')
    for ref in semantic['evidence']:
        evidence[ref['path']] = pinned(root, ref)
    observed = set()
    required = {(surface, width, kind) for surface in ('production', 'portable') for width in ('desktop', 'narrow') for kind in ('market', 'original_hero')}
    for check in browser['checks']:
        key = (check['surface'], check['viewportClass'], check['kind'])
        need(key in required and key not in observed, 'Unexpected/duplicate bounded browser case')
        need(check['method'] == 'CUA_visible_inspection' and check['route'] and check['location'] and check['observed'] and check['limitations'] and check['viewportDescription'], 'Actual visible browser evidence missing')
        width, document_width = check['viewportCSSWidth'], check['documentScrollWidth']
        need(all(type(value) in (int, float) and math.isfinite(value) and value > 0 for value in (width, document_width)), 'Actual CSS geometry required')
        need(check['measurementKind'] == 'actual_browser_geometry' and ((check['viewportClass'] == 'narrow' and 320 <= width <= 500) or (check['viewportClass'] == 'desktop' and width >= 1000)), 'Viewport coverage class differs from actual geometry')
        need(type(check['supportsScopedRetention']) is bool, 'Actual scoped retention observation required')
        need(not retaining or (check['supportsScopedRetention'] is True and document_width <= width + 1), 'Retaining with unsupported visible case or observed horizontal overflow')
        ids = check['sampledHeldIds']
        need(type(ids) is list and len(ids) == len(set(ids)) and set(ids) <= set(HELD_IDS), 'Unknown/duplicate visible sample ID')
        need((key[2] == 'market' and set(ids) == {'bmw-i3', 'bmw-ix4'}) or (key[2] == 'original_hero' and ids == []), 'Only the two revised visible BMW records are required; unresolved leads are static audit-data scope')
        evidence[check['evidence']['path']] = pinned(root, check['evidence'])
        need(evidence[check['evidence']['path']], 'Empty visible observation evidence')
        observed.add(key)
    need(observed == required, 'Eight bounded production/portable desktop/narrow market/hero checks required')
    for field in ('externalRunnerObservation', 'scopedMarketObservation', 'saveToolingReview', 'portableArtifactVerification', 'successfulLaunchStdout', 'successfulLaunchStderr'):
        row = binding[field]
        evidence[row['path']] = pinned(root, row)
    # All earlier failures are preserved in the exact saved99 source payload.
    # Any100 failure must keep its actual100 identity, logs and outer terminal.
    need(type(binding['failedAndRetryAttempts']) is list, 'Explicit100 failure/retry inventory required')
    seen_failures, failed_outer_capture_scopes = set(), []
    for attempt in binding['failedAndRetryAttempts']:
        result_path = attempt['qaResult']['path']
        need(result_path not in seen_failures and result_path != binding['qaResult']['path'], 'Duplicate/current run in failed history')
        seen_failures.add(result_path)
        result_raw = pinned(root, attempt['qaResult'])
        failed, directory = decoded(result_raw), local(root, result_path).parent
        need(failed['schema'] == 'roadmark99.serial-qa.v1' and failed['passed'] is False and failed['runnerSHA256'] == PINS['runner'][1], 'Retained100 failed result differs')
        need(failed['configuration'] == qa['configuration'], 'Failed100 source changed; separately reviewed revision required')
        need(decoded(read(directory / 'frozen-inputs.json')) == expected, 'Failed100 frozen source differs')
        failed_digest = sha(json.dumps(expected, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())
        need('frozenInputDigest' not in failed or failed['frozenInputDigest'] == failed_digest, 'Failed100 digest differs')
        request = decoded(read(directory / 'execution-request.json'))
        need(request['configuration'] == failed['configuration'] and request['runnerSHA256'] == failed['runnerSHA256'], 'Failed100 original launch identity differs')
        for stage in STAGES:
            stage_path = directory / (stage + '.json')
            if stage_path.is_file():
                failed_stage = decoded(read(stage_path))
                need(failed_stage['inputDigestBefore'] == failed_digest and failed_stage['inputDigestAfter'] in (None, failed_digest), 'Failed100 stage source differs')
        need({p.name for p in directory.iterdir()} == set(failed['evidence']) | {'run-result.json'}, 'Failed100 evidence membership differs')
        for filename, row in failed['evidence'].items():
            need(Path(name(filename)).name == filename, 'Failed evidence must be flat')
            path = local(directory, filename)
            data = read(path)
            need(info(data) == {k: row[k] for k in ('sha256', 'bytes')} and path.stat().st_mtime_ns == row['mtimeNs'], 'Failed100 evidence drift')
            evidence[path.relative_to(root).as_posix()] = data
        exit_row = decoded(pinned(root, attempt['externalRunnerObservation']))
        need(exit_row['schemaVersion'] == 'roadmark100.external-runner-observation.v1' and exit_row['qaResultSHA256'] == sha(result_raw) and exit_row['runnerSHA256'] == PINS['runner'][1] and type(exit_row['exitCode']) is int and exit_row['exitCode'] != 0 and exit_row['actualTerminalReviewed'] is True and exit_row['observedAtUTC'], 'Genuine100 failure exit required')
        terminal = exit_row['terminalEvidence']
        if 'path' in terminal:
            evidence[terminal['path']] = pinned(root, terminal)
        else:
            result = terminal['toolResult']
            need(type(result) is dict and result['exit_code'] == exit_row['exitCode'] and type(result['output']) is str and result['chunk_id'], 'Actual failed terminal differs')
        for field in ('qaResult', 'externalRunnerObservation', 'launchStdout', 'launchStderr'):
            row = attempt[field]
            evidence[row['path']] = pinned(root, row)
        failed_outer_capture_scopes.append(attempt)
    listed = set()
    for row in binding['researchFiles']:
        need(row['path'] not in listed, 'Duplicate research reference')
        listed.add(row['path'])
        evidence[row['path']] = pinned(root, row)
    need(REQUIRED_RESEARCH <= listed, 'Required100 source/research/review context omitted')
    for path, digest in RESEARCH_PINS.items():
        need(sha(evidence[path]) == digest, 'Original text provenance metadata changed')
    for key in ('sourceCandidate', 'originalCandidate', 'candidate', 'expectedInputs', 'runner', 'sourceReview', 'applicationReceipt'):
        evidence[PINS[key][0]] = anchors[key]
    evidence[args.binding] = binding_raw
    evidence['roadmark-research/checkpoint100-save-candidate/package_checkpoint100.py'] = read(Path(__file__))
    evidence['roadmark-research/checkpoint100-save-candidate/join_recovered100_source.py'] = joiner_raw
    for path, data in evidence.items():
        lower = path.lower()
        need((path.startswith(ALLOWED_RESEARCH) or path in RESEARCH_PINS) and (Path(path).suffix.lower() in {'.json', '.jsonl', '.log', '.md', '.txt', '.py', '.mjs', '.patch', '.diff'} or Path(path).name == 'SHA256SUMS'), 'Unapproved research text path/type: ' + path)
        need(not any(term in lower for term in ('screenshot', 'private', 'secret', 'queue')) and ('capture' not in lower or path in RESEARCH_PINS), 'Sensitive/raw/unrelated research rejected: ' + path)
        need(len(data) <= 2 * 1024 * 1024, 'Research file exceeds concise limit: ' + path)
        data.decode('utf-8')
    need(sum(map(len, evidence.values())) <= 12 * 1024 * 1024, 'Research supplement exceeds12MiB')
    prior = zip_read(local(root, PINS['source99'][0]))
    need(prior['roadmark/recovery99/research/roadmark-research/applied99/revision4/expected-inputs.json'] == anchors['baselineInputs'], 'Exact99 map history differs')
    old_manifest = prior['roadmark/CHECKPOINT-SOURCE-MANIFEST.json']
    old = decoded(old_manifest)
    prior_inventory = {row['path']: {'sha256': row['sha256'], 'bytes': row['bytes']} for row in old['files']}
    need(len(prior_inventory) == len(old['files']) and set(prior) == set(prior_inventory) | {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json'}, 'Prior99 inventory differs')
    need(all(info(prior[path]) == row for path, row in prior_inventory.items()) and old['pairId'] == saved99['pairId'], 'Prior99 payload or pair differs')
    excluded = {row['path'] for row in old['excludedQABrowserRasters']}
    need(excluded.isdisjoint(expected) and all('roadmark/' + path not in prior for path in excluded) and all('roadmark/' + path not in prior for path in ALIASES), 'Previously excluded output entered source')
    need(all(sha(prior['roadmark/' + path]) == digest for path, digest in baseline.items()), 'Saved99 input map mismatch')
    for rel, row in rows.items():
        if row['beforeSHA256'] is None:
            need('roadmark/' + rel not in prior, 'New100 path exists in saved99')
        else:
            need(info(prior['roadmark/' + rel]) == {'sha256': row['beforeSHA256'], 'bytes': row['beforeBytes']}, 'Saved99 exact preimage differs')
    pair = 'roadmark-recovered100-' + portable['sha256'][:16] + '-' + qa['actualBuildID']
    scope = dict(OPEN, fullSerialQAPassed=True, qaRunnerMechanicsSchema='roadmark99.serial-qa.v1', actualApplicationCheckpoint=100, qaResult=binding['qaResult'], actualExternalExit=binding['externalRunnerObservation'], actualTestTallies=tallies, failedAttemptOuterCaptureScopes=failed_outer_capture_scopes, scopedMarketObservation=browser, portableArtifactVerification=binding['portableArtifactVerification'], boundary=qa['boundary'], prior99EvidenceIsHistoricalOnly=True, upstreamOriginalResearchRecoveryIncomplete=True)
    common = {'schemaVersion': 'roadmark100.checkpoint-manifest.v1', 'applicationCheckpoint': 100, 'pairId': pair, 'createdAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'productionBuildId': qa['actualBuildID'], 'portableIndexSHA256': portable['sha256'], 'portableIndexBytes': portable['bytes'], 'integrationDisposition': disposition, 'verificationScope': scope, 'baseline99': {'source': dict(path=PINS['source99'][0], **info(anchors['source99'])), 'preview': dict(path=PINS['preview99'][0], **info(anchors['preview99'])), 'saveReceipt': dict(path=PINS['saved99'][0], **info(anchors['saved99']))}, 'sourceScope': {'baselineInputCount': len(baseline), 'finalInputCount': len(expected), 'candidateManifestSHA256': PINS['sourceCandidate'][1], 'qaCandidateManifestSHA256': PINS['candidate'][1], 'expectedInputsSHA256': PINS['expectedInputs'][1], 'changes': list(rows.values())}, 'releaseApproved': False}
    notice = ('ROADMARK100 HELD-MARKET EVIDENCE CHECKPOINT\n\nPair: ' + pair + '\nIntegration disposition: ' + disposition['decision'] + '\nReason: ' + disposition['reason'] + '\n\nTen existing held market entries receive evidence URL, check-date, note and limitation amendments only. There is no new vehicle, trim, technical, model-year, ranking, count, completeness, accepted-order or stock admission. The original Model Y hero and nine selling points remain unchanged. All earlier source, code, failures and historical payloads remain byte-for-byte except the two explicitly replaced paths; their exact saved99 preimages, previous source manifest and actual99 save evidence are preserved separately. Three exact reviewed QA/test paths are added. Fresh100 serial QA uses the unchanged reviewed99 runner with actual100 configuration; schema99 is a mechanics label, not a reused99 pass. Current production/portable desktop/narrow observations cover only the two revised visible BMW records and original hero. The eight commercial/Mercedes unresolved leads are checked as static audit data and are not displayed by the current market UI. Previous99 Mazda/mobile/reflow evidence remains historical. Real phones, accelerated WebGL, full journeys, sustained stability, full visual/release approval, public export and complete upstream research recovery remain open. No deployment or publication is implied.\n\nSource is shipped in numbered parts plus a recovery kit. Extract only the kit, keep every numbered ZIP beside its manifest, and run its joiner with Python3. The joiner reconstructs the full source ZIP; it never executes the application. Keep the full source ZIP locally. Never treat a preview as source recovery.\n').encode()
    source = dict(prior)
    source.pop('roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    additions = {'roadmark/recovery100/history/checkpoint99-source-manifest.json': old_manifest, 'roadmark/recovery100/history/checkpoint99-correlated-save-receipt.json': anchors['saved99'], 'roadmark/recovery100/history/checkpoint99-actual-helper-results.json': anchors['saved99helper'], 'roadmark/recovery100/history/checkpoint99-upload-plan.json': anchors['saved99plan'], 'READ-ME-FIRST-ROADMARK100.txt': notice, 'roadmark/RECOVERY100-READ-ME-FIRST.txt': notice}
    additions.update({'roadmark/recovery100/history/checkpoint99-preimages/' + rel: prior['roadmark/' + rel] for rel, row in rows.items() if row['beforeSHA256'] is not None})
    additions.update({'roadmark/recovery100/research/' + path: data for path, data in evidence.items()})
    need(set(additions).isdisjoint(source), 'New100 recovery path collides')
    source.update(additions)
    for rel in rows:
        source['roadmark/' + rel] = read(local(app, rel))
    for path, data in prior.items():
        if path not in {'roadmark/CHECKPOINT-SOURCE-MANIFEST.json', *('roadmark/' + rel for rel in rows)}:
            need(source[path] == data, 'Unrelated99 payload changed: ' + path)
    source['roadmark/CHECKPOINT-SOURCE-MANIFEST.json'] = encoded(dict(common, role='source', files=inventory(source), excludedQABrowserRasters=old['excludedQABrowserRasters'], portablePreviewArchive='Roadmark-recovered-100-portable-preview.zip'))
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(app), 'Output must be new, external, with existing parent')
    output.mkdir()
    source_path = output / 'Roadmark-recovered-100-source.zip'
    zip_write(source_path, source)
    full = dict(filename=source_path.name, **info(read(source_path)), role='source', operation='create', chatDelivery=False)
    preview = {'roadmark/' + p: read(local(app, p)) for p in ALIASES}
    preview.update({'READ-ME-FIRST-ROADMARK100.txt': notice, 'roadmark/OPEN-PORTABLE-PREVIEW100.txt': b'Open index.html or index-b.html in a browser. This is a portable preview, not the source archive.\n'})
    preview['roadmark/CHECKPOINT-PREVIEW-MANIFEST.json'] = encoded(dict(common, role='preview', files=inventory(preview), sourceArchive=full))
    preview_path = output / 'Roadmark-recovered-100-portable-preview.zip'
    zip_write(preview_path, preview)
    research = {'research/' + path: raw for path, raw in evidence.items()}
    research['READ-ME-FIRST-ROADMARK100.txt'] = notice
    research['RESEARCH-MANIFEST.json'] = encoded(dict(common, role='concise_research_supplement', files=inventory(research), notOriginalResearchIndex79=True))
    research_path = output / 'Roadmark-100-recovery-research-supplement.zip'
    zip_write(research_path, research)
    source_bytes, parts = read(source_path), []
    for offset in range(0, len(source_bytes), CHUNK):
        number = len(parts) + 1
        payload = source_bytes[offset:offset + CHUNK]
        member = 'roadmark-source-100.part%02d.bin' % number
        path = output / ('Roadmark-source-100-chat-part-%d.zip' % number)
        zip_write(path, {member: payload}, stored=True)
        parts.append(dict(filename=path.name, **info(read(path)), member=member, payloadBytes=len(payload), payloadSHA256=sha(payload), role='source_part', operation='create', chatDelivery=True))
    part_manifest = {'schemaVersion': 'roadmark100.source-parts.v1', 'applicationCheckpoint': 100, 'pairId': pair, 'chunkBytes': CHUNK, 'originalFilename': full['filename'], 'originalBytes': full['bytes'], 'originalSHA256': full['sha256'], 'parts': parts}
    kit_files = {'source-parts.json': encoded(part_manifest), 'join_recovered100_source.py': joiner_raw, 'README.txt': notice}
    kit_path = output / 'Roadmark-source-100-recovery-kit.zip'
    zip_write(kit_path, kit_files)
    # Execute bytes read back from the shipped kit, not a separate implementation.
    recovered_kit = zip_read(kit_path)
    test_root = output / 'joiner-self-test'
    test_root.mkdir()
    for filename, raw in recovered_kit.items():
        write(test_root / filename, raw)
    for part in parts:
        write(test_root / part['filename'], read(output / part['filename']))
    argv = [sys.executable, '-B', str(test_root / 'join_recovered100_source.py'), '--parts-directory', str(test_root)]
    started = dt.datetime.now(dt.timezone.utc).isoformat()
    proc = subprocess.run(argv, capture_output=True, text=True, check=False)
    write(test_root / 'stdout.log', proc.stdout.encode())
    write(test_root / 'stderr.log', proc.stderr.encode())
    need(proc.returncode == 0, 'Shipped joiner failed; retain attempt and stop')
    joined = read(test_root / full['filename'])
    result = decoded(proc.stdout)
    need(joined == source_bytes and result['sha256'] == full['sha256'] and result['bytes'] == full['bytes'] and result['pairId'] == pair, 'Shipped joiner reconstruction differs')
    self_test = {'schemaVersion': 'roadmark100.kit-self-test.v1', 'argv': argv, 'startedAtUTC': started, 'finishedAtUTC': dt.datetime.now(dt.timezone.utc).isoformat(), 'exitCode': proc.returncode, 'result': result, 'exactBytesReassembled': True, 'applicationExecuted': False, 'kitSHA256': sha(read(kit_path)), 'shippedJoinerSHA256': sha(recovered_kit['join_recovered100_source.py']), 'stdout': dict(path='joiner-self-test/stdout.log', **info(proc.stdout.encode())), 'stderr': dict(path='joiner-self-test/stderr.log', **info(proc.stderr.encode()))}
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
    plan = {'schemaVersion': 'roadmark100.upload-plan.v1', 'applicationCheckpoint': 100, 'pairId': pair, 'status': 'local_archives_verified_not_uploaded', 'allLibraryItemsNewCreates': True, 'sourcePartsAlwaysProvidedForChat': True, 'fullSourceLibrarySaveRequested': full['bytes'] < POLICY, 'localUploadPolicyBytes': POLICY, 'genericHelperSizeCapVerified': False, 'fullSourceArchive': full, 'joinerSelfTest': dict(path='joiner-self-test-receipt.json', **info(encoded(self_test))), 'binding': dict(path=args.binding, **info(binding_raw)), 'packagerSHA256': args.approved_packager_sha256, 'joinerSHA256': args.approved_joiner_sha256, 'uploads': uploads, 'immutable99FallbackRetained': True, 'releaseApproved': False}
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
