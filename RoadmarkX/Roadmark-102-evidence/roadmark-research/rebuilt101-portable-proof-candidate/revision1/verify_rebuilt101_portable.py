#!/usr/bin/env python3
"""Root-only static rebuilt101 source/QA/portable preservation verification.

No app imports, execution, browser, network, extraction, or writes. All generated
results are observations of final root-supplied inputs, never historical101 passes.
"""
import argparse
import hashlib
import io
import json
import re
import stat
import sys
import zipfile
from decimal import Decimal
from pathlib import Path

PINS = 'roadmark-research/rebuilt101-portable-proof-candidate/INPUT-PINS.json'
PINS_SHA = '005906c3a3833e6bf34ece22a82b00fa2fa23df1a10bafb58e96ae35317d38eb'
APP = 'roadmark-work/roadmark'
HTML_SHA = 'cb4fe95ff34b375fe139b7ef81e959c7ae000a1cb4b44ed74ad340a662f4e39b'
HTML_BYTES = 37020751
MARKET = 'data/market-inventory-2026-10-10.json'
MARKET_SHA = '2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac'
ALIASES = ['index.html', 'index-b.html', 'public/index.html', 'public/index-b.html']
PRODUCTION = ['.next/BUILD_ID', '.next/prerender-manifest.json', '.next/routes-manifest.json', '.next/server/app-paths-manifest.json']
STAGES = ['non_http_tests', 'local_http_tests', 'typecheck', 'lint', 'validation', 'production_build', 'portable_build']
ENVIRONMENT = {'NODE_OPTIONS': '--max-old-space-size=1280 --max-semi-space-size=8', 'NEXT_TELEMETRY_DISABLED': '1'}
REMOVED_ENVIRONMENT = ['SITE_STATIC_EXPORT', 'NEXT_PUBLIC_SITE_URL', 'NODE_ENV']
OPEN_TAG = b'<script id="ev-data" type="application/json">'
CLOSE_TAG = b'</script>'
NOT_VERIFIED = ['browser_hydration_or_interactions', 'real_phone_performance', 'whole_Next_module_graph',
                'dependency_integrity_or_cryptographic_build_attestation', 'publisher_claim_truth',
                'release_approval_or_final_delivery_archives']

# Reviewed100 helper text, copied from its pinned source100 research supplement.
class VerificationFailure(Exception):
    def __init__(self, detail):
        self.detail = detail
        super().__init__(str(detail))


def fail(check, **detail):
    raise VerificationFailure({"check": check, **detail})


def require(condition, check, **detail):
    if not condition:
        fail(check, **detail)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def describe(value):
    if isinstance(value, dict):
        return {"type": "object", "keys": list(value)}
    if isinstance(value, list):
        return {"type": "array", "length": len(value)}
    if isinstance(value, Decimal):
        return {"type": "number", "value": str(value)}
    return value


def pointer(path, key):
    return path + "/" + str(key).replace("~", "~0").replace("/", "~1")


def equal(actual, expected, path):
    """JSON equality with ordered arrays and distinct boolean/number types."""
    pending = [(actual, expected, path)]
    while pending:
        actual, expected, here = pending.pop()
        number_types = (int, Decimal)
        same_number_type = type(actual) in number_types and type(expected) in number_types
        if type(actual) is not type(expected) and not same_number_type:
            fail("json_type_drift", path=here, expected=describe(expected), actual=describe(actual))
        if isinstance(expected, dict):
            if set(actual) != set(expected):
                fail("json_keys_drift", path=here,
                     missing=sorted(set(expected) - set(actual)),
                     unexpected=sorted(set(actual) - set(expected)))
            pending.extend((actual[k], expected[k], pointer(here, k)) for k in reversed(expected))
        elif isinstance(expected, list):
            if len(actual) != len(expected):
                fail("json_length_drift", path=here, expected=len(expected), actual=len(actual))
            pending.extend((actual[i], expected[i], pointer(here, i)) for i in range(len(expected) - 1, -1, -1))
        elif actual != expected:
            fail("json_value_drift", path=here, expected=describe(expected), actual=describe(actual))


def strict_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "duplicate_json_key", key=key)
        result[key] = value
    return result


def reject_constant(value):
    fail("non_json_numeric_constant", value=value)


def parse_json(data, label):
    try:
        return json.loads(data.decode("utf-8"), object_pairs_hook=strict_object,
                          parse_float=Decimal, parse_constant=reject_constant)
    except (UnicodeError, json.JSONDecodeError) as exc:
        fail("invalid_json", input=label, error=str(exc))


def read_pinned(path, expected_sha, label):
    data = path.read_bytes()
    actual_sha = sha(data)
    require(actual_sha == expected_sha, "input_sha256_mismatch", input=label,
            path=str(path), expected=expected_sha, actual=actual_sha)
    return data


def split_html(data, label):
    require(data.count(OPEN_TAG) == 1, "ev_data_open_tag_count", input=label,
            actual=data.count(OPEN_TAG))
    start = data.index(OPEN_TAG) + len(OPEN_TAG)
    end = data.find(CLOSE_TAG, start)
    require(end >= start, "missing_ev_data_close_tag", input=label)
    # Tags remain in the compared regions. Only the JSON body is excluded.
    return data[:start], data[start:end], data[end:]


def outside_drift(actual, expected, segment, actual_origin, expected_origin):
    if actual == expected:
        return None
    limit = min(len(actual), len(expected))
    first = next((i for i in range(limit) if actual[i] != expected[i]), limit)
    common_tail = 0
    while common_tail < limit - first and actual[-1 - common_tail] == expected[-1 - common_tail]:
        common_tail += 1
    a_end, e_end = len(actual) - common_tail, len(expected) - common_tail
    return {
        "segment": segment,
        "expectedBytes": len(expected), "actualBytes": len(actual),
        "expectedSHA256": sha(expected), "actualSHA256": sha(actual),
        "firstDifferingSegmentOffset": first,
        "firstDifferingExpectedFileOffset": expected_origin + first,
        "firstDifferingActualFileOffset": actual_origin + first,
        "expectedChangedSpan": [first, e_end], "actualChangedSpan": [first, a_end],
        "expectedChangedSpanSHA256": sha(expected[first:e_end]),
        "actualChangedSpanSHA256": sha(actual[first:a_end]),
        "expectedNext64BytesHex": expected[first:first + 64].hex(),
        "actualNext64BytesHex": actual[first:first + 64].hex(),
    }


def decode_payload(raw, label):
    envelope = parse_json(raw, label)
    require(type(envelope) is dict, "invalid_envelope_object", input=label)
    equal(sorted(envelope), ["data", "format", "strings"], label + "/envelopeKeys")
    equal(envelope["format"], "roadmark-string-table-v1", label + "/format")
    strings = envelope["strings"]
    require(type(strings) is list and all(type(s) is str for s in strings),
            "invalid_dictionary", input=label)
    stats = {"dictionaryValues": len(strings), "references": 0, "escapedLiterals": 0}

    def decode_string(value, path):
        if not value.startswith("~"):
            return value
        if value.startswith("~~"):
            stats["escapedLiterals"] += 1
            return value[1:]
        require(re.fullmatch(r"~(?:0|[1-9a-z][0-9a-z]*)", value) is not None,
                "invalid_dictionary_token", input=label, path=path, token=value)
        index = int(value[1:], 36)
        require(index < len(strings), "dictionary_index_out_of_range",
                input=label, path=path, token=value, dictionaryValues=len(strings))
        stats["references"] += 1
        # Dictionary values are original literals, never recursively decoded.
        return strings[index]

    data = envelope["data"]
    require(type(data) is dict, "invalid_payload_object", input=label)
    pending = [(data, label)]
    while pending:
        container, path = pending.pop()
        keys = list(container) if isinstance(container, dict) else range(len(container))
        for key in keys:
            value = container[key]
            here = pointer(path, key)
            if isinstance(value, str):
                container[key] = decode_string(value, here)
            elif isinstance(value, (dict, list)):
                pending.append((value, here))
    return data, stats


def ordered_json_differences(actual, expected, path):
    """All semantic differences; arrays AND object key order remain significant.

    JSON numbers compare numerically (int/Decimal); booleans remain distinct.
    No ignored paths, projection exceptions, numeric tolerance or result cap.
    """
    differences = []
    pending = [(actual, expected, path)]
    while pending:
        actual, expected, here = pending.pop()
        both_numbers = type(actual) in (int, Decimal) and type(expected) in (int, Decimal)
        if type(actual) is not type(expected) and not both_numbers:
            differences.append({"kind": "type", "path": here,
                                "expected": describe(expected), "actual": describe(actual)})
            continue
        if isinstance(expected, dict):
            if list(actual) != list(expected):
                differences.append({"kind": "object_keys_or_order", "path": here,
                                    "expectedKeys": list(expected), "actualKeys": list(actual),
                                    "missing": {k: expected[k] for k in expected if k not in actual},
                                    "unexpected": {k: actual[k] for k in actual if k not in expected}})
            pending.extend((actual[k], expected[k], pointer(here, k))
                           for k in reversed(expected) if k in actual)
        elif isinstance(expected, list):
            if len(actual) != len(expected):
                differences.append({"kind": "array_length", "path": here,
                                    "expectedLength": len(expected), "actualLength": len(actual),
                                    "expectedTail": expected[len(actual):],
                                    "actualTail": actual[len(expected):]})
            pending.extend((actual[i], expected[i], pointer(here, i))
                           for i in range(min(len(actual), len(expected)) - 1, -1, -1))
        elif actual != expected:
            differences.append({"kind": "value", "path": here,
                                "expected": describe(expected), "actual": describe(actual)})
    return differences



def local(root, relative):
    require(type(relative) is str and relative and not Path(relative).is_absolute() and
            '\\' not in relative and all(p not in ('', '.', '..') for p in relative.split('/')),
            'unsafe_relative_path', path=relative)
    path = root
    for part in relative.split('/'):
        path /= part
        require(not path.is_symlink(), 'symlink_rejected', path=str(path))
    return path


def read(path):
    before = path.stat()
    require(stat.S_ISREG(before.st_mode) and before.st_size <= 128 * 1024 * 1024,
            'unsafe_file_type_or_size', path=str(path))
    raw = path.read_bytes()
    after = path.stat()
    require(all(getattr(before, key) == getattr(after, key) for key in
                ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns')),
            'file_changed_during_read', path=str(path))
    return raw


def info(raw):
    return {'sha256': sha(raw), 'bytes': len(raw)}


def pin(root, ref):
    require(type(ref['sha256']) is str and re.fullmatch('[0-9a-f]{64}', ref['sha256']) is not None,
            'invalid_sha256_pin', path=ref['path'])
    path = local(root, ref['path'])
    raw = read(path)
    require(sha(raw) == ref['sha256'], 'pinned_file_drift', path=ref['path'], actual=sha(raw), expected=ref['sha256'])
    if 'bytes' in ref:
        equal(len(raw), ref['bytes'], '/pin/bytes')
    if 'mtimeNs' in ref:
        equal(path.stat().st_mtime_ns, ref['mtimeNs'], '/pin/mtimeNs')
    return raw


def member(z, name, digest=None):
    require(not name.startswith('/') and '\\' not in name and all(p not in ('', '.', '..') for p in name.split('/')),
            'unsafe_member_name', member=name)
    rows = [r for r in z.infolist() if r.filename == name]
    require(len(rows) == 1, 'ambiguous_or_missing_member', member=name)
    row = rows[0]
    require(not row.is_dir() and not row.flag_bits & 1 and row.file_size <= 128 * 1024 * 1024 and
            stat.S_IFMT(row.external_attr >> 16) in (0, stat.S_IFREG), 'unsafe_member', member=name)
    raw = z.read(row)
    require(len(raw) == row.file_size and (digest is None or sha(raw) == digest), 'member_pin_drift', member=name)
    return raw


def canonical_digest(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())


def verify_source(root, refs):
    raw = {key: pin(root, refs[key]) for key in
           ('source100', 'baselineInputs', 'expectedInputs', 'finalAuthoredInputs', 'qaBaselineInputs', 'qaExpectedInputs', 'candidate')}
    base, earlier, qb, qe, candidate = [parse_json(raw[k], k) for k in
                                       ('baselineInputs', 'expectedInputs', 'qaBaselineInputs', 'qaExpectedInputs', 'candidate')]
    equal([len(base), len(earlier), len(qb), len(qe)], [1678, 1684, 2807, 2813], '/source/mapCounts')
    equal(candidate['appRoot'], APP, '/source/appRoot')
    equal({p: qb[p] for p in base}, base, '/source/baselineSubset')
    rows = candidate['files']
    require(len(rows) == 14 and len({r['path'] for r in rows}) == 14, 'actual14delta_required')
    derived, app_map = dict(qb), dict(base)
    app = local(root, APP)
    with zipfile.ZipFile(io.BytesIO(raw['source100'])) as z:
        for path, digest in qb.items():
            member(z, 'roadmark/' + path, digest)
        canonical_market = member(z, 'roadmark/' + MARKET, MARKET_SHA)
        for row in rows:
            path = row['path']
            equal(row['beforeSHA256'], qb.get(path), '/source/preimage/' + path)
            equal(row['beforeSHA256'], base.get(path), '/source/originalPreimage/' + path)
            require(row['sha256'] != row['beforeSHA256'], 'unchanged_candidate_row', path=path)
            if row['beforeSHA256'] is None:
                require(not any(i.filename == 'roadmark/' + path for i in z.infolist()), 'added_path_already_archived', path=path)
            pin(app, {'path': path, 'sha256': row['sha256'], 'bytes': row['bytes']})
            derived[path] = app_map[path] = row['sha256']
        archived_metadata = member(z, 'roadmark/CHECKPOINT-SOURCE-MANIFEST.json')
    equal(derived, qe, '/source/expandedFinalMap')
    equal(app_map, parse_json(raw['finalAuthoredInputs'], 'finalAuthoredInputs'), '/source/finalAuthoredMap')
    require(len(app_map) == 1684 and sum(r['beforeSHA256'] is None for r in rows) == 6,
            'source_map_delta_count_invalid')
    extras = set(qb) - set(base)
    require(len(extras) == 1129 and all(qe[p] == qb[p] for p in extras), 'restored_history_changed')
    for path, digest in qe.items():
        pin(app, {'path': path, 'sha256': digest})
    require(read(local(app, MARKET)) == canonical_market, 'full_canonical_market_changed')
    require(read(local(app, 'CHECKPOINT-SOURCE-MANIFEST.json')) == archived_metadata, 'historical100_manifest_changed')
    stale = [{'path': p, 'earlierSHA256': earlier[p], 'finalSHA256': app_map[p]}
             for p in sorted(earlier) if earlier[p] != app_map[p]]
    equal([r['path'] for r in stale], ['tests/helpers/checkpoint101-source-history.ts', 'tests/market-view.test.ts'],
          '/source/knownEarlierMapMismatchPaths')
    return qe, canonical_market, {
        'source100': refs['source100'], 'source100CanonicalMember': {'member': 'roadmark/' + MARKET, **info(canonical_market)},
        'candidate': refs['candidate'], 'finalAuthoredInputs': refs['finalAuthoredInputs'], 'qaBaselineInputs': refs['qaBaselineInputs'], 'qaExpectedInputs': refs['qaExpectedInputs'],
        'actualDeltaPaths': 14, 'modifiedPaths': 8, 'addedPaths': 6,
        'originalAppInputCounts': [1678, 1684], 'expandedQAInputCounts': [2807, 2813],
        'unchangedAdditionalHistoricalInputs': 1129, 'currentEnumeratedInputHashesVerified': len(qe),
        'earlierAuthoredExpectedMapIsFinal': False, 'earlierAuthoredMapMismatches': stale,
        'delta': rows, 'canonicalAuditSourceUnchanged': True, 'historical100ManifestUnchanged': True,
        'scopeBoundary': 'Enumerated map plus historical manifest; QA runner separately checks full input inventory under documented exclusions',
    }


def required_commands(expected):
    """Derive all test paths from final frozen inputs, independently of QA's plan."""
    http = 'tests/local-review.test.ts'
    tests = sorted(p for p in expected if re.fullmatch(r'tests/.+\.test\.ts', p) and p != http)
    require(http in expected and tests, 'missing_required_frozen_tests')
    test = ['node', '--import', 'tsx', '--test', '--test-reporter=tap', '--test-concurrency=1']
    return {
        'non_http_tests': [*test, *tests],
        'local_http_tests': [*test, http],
        'typecheck': ['node', 'node_modules/typescript/bin/tsc', '--noEmit'],
        'lint': ['node', 'node_modules/eslint/bin/eslint.js', 'src', 'tests', 'scripts'],
        'validation': ['node', '--import', 'tsx', 'scripts/validate.ts'],
        'production_build': ['node', 'node_modules/next/dist/bin/next', 'build'],
        'portable_build': ['node', '--import', 'tsx', 'scripts/build-portable.ts'],
    }


def verify_execution_request(raw, root, directory, refs, qa):
    request = parse_json(raw, 'executionRequest')
    expected_argv = [refs['runner']['path'], '--workspace', str(root), '--output', directory.relative_to(root).as_posix()]
    for name, refkey in [('baseline-inputs', 'qaBaselineInputs'), ('expected-inputs', 'qaExpectedInputs'),
                         ('candidate-manifest', 'candidate')]:
        expected_argv.extend(['--' + name, refs[refkey]['path'], '--' + name + '-sha256', refs[refkey]['sha256']])
    expected_argv.extend(['--approved-runner-sha256', refs['runner']['sha256'], '--exclusive-workspace-confirmed'])
    equal(request['argv'], expected_argv, '/qa/executionRequest/argv')
    equal(request['schema'], 'roadmark99.serial-qa.v1', '/qa/executionRequest/schema')
    equal(request['configuration'], qa['configuration'], '/qa/executionRequest/configuration')
    equal(request['runnerSHA256'], refs['runner']['sha256'], '/qa/executionRequest/runner')
    equal(request['startedAtUTC'], qa['startedAtUTC'], '/qa/executionRequest/start')
    require(request['exclusiveWorkspaceConfirmedByRoot'] is True, 'exclusive_workspace_confirmation_missing')
    equal(request['environmentOverrides'], ENVIRONMENT, '/qa/executionRequest/environment')
    removed = request['removedInheritedEnvironmentNames']
    require(type(removed) is list and removed == [name for name in REMOVED_ENVIRONMENT if name in removed],
            'unexpected_removed_inherited_environment_names')
    return {'exactRequestValidated': True, 'environmentOverrides': ENVIRONMENT,
            'removedInheritedEnvironmentNames': removed}


def verify_qa(root, args, refs, expected):
    qa_ref = {'path': args.qa_result, 'sha256': args.qa_result_sha256}
    qa_raw = pin(root, qa_ref)
    qa = parse_json(qa_raw, 'finalQA')
    directory, app = local(root, args.qa_result).parent, local(root, APP)
    require(qa['schema'] == 'roadmark99.serial-qa.v1' and qa['passed'] is True and qa['publicExportRun'] is False,
            'final_successful_QA_required')
    pin(root, refs['runner'])
    equal(qa['runnerSHA256'], refs['runner']['sha256'], '/qa/runner')
    for key, refkey in [('baselineInputs', 'qaBaselineInputs'), ('expectedInputs', 'qaExpectedInputs'), ('candidate', 'candidate')]:
        equal(qa['configuration'][key], {k: refs[refkey][k] for k in ('path', 'sha256')}, '/qa/configuration/' + key)
    digest = canonical_digest(expected)
    equal(qa['frozenInputDigest'], digest, '/qa/frozenDigest')
    sealed = {}
    for filename, ref in qa['evidence'].items():
        require('/' not in filename, 'qa_evidence_not_flat')
        sealed[filename] = pin(directory, {'path': filename, **ref})
    require({p.name for p in directory.iterdir()} == set(sealed) | {'run-result.json'}, 'qa_evidence_membership_drift')
    # Raw frozen snapshot is sealed by QA, not by the authored map's formatting.
    frozen = parse_json(sealed['frozen-inputs.json'], 'frozenInputs')
    equal(frozen, expected, '/qa/exactParsedMap')
    equal(canonical_digest(frozen), digest, '/qa/frozenCanonicalDigest')
    request_observation = verify_execution_request(sealed['execution-request.json'], root, directory, refs, qa)
    expected_commands = required_commands(expected)
    plan = parse_json(sealed['stage-plan.json'], 'stagePlan')
    equal(plan['serialOrder'], STAGES, '/qa/serialOrder')
    equal(plan['commands'], expected_commands, '/qa/independentlyDerivedStageCommands')
    equal(set(qa['stageStatus']), set(STAGES), '/qa/stageStatusKeys')
    equal(set(qa['stageReceipts']), set(STAGES), '/qa/stageReceiptKeys')
    previous_finish = 0
    stage_refs, outputs, tallies = {}, {}, {}
    for stage in STAGES:
        equal(qa['stageStatus'][stage], 'passed', '/qa/stage/' + stage)
        ref = qa['stageReceipts'][stage]
        receipt_raw = pin(directory, ref)
        require(sealed.get(ref['path']) == receipt_raw, 'stage_receipt_not_sealed', stage=stage)
        receipt = parse_json(receipt_raw, stage)
        equal(receipt['environmentOverrides'], ENVIRONMENT, '/qa/stageEnvironment/' + stage)
        equal(receipt['removedEnvironmentNames'], REMOVED_ENVIRONMENT, '/qa/stageRemovedEnvironment/' + stage)
        require(receipt['stage'] == stage and receipt['passed'] is True and
                receipt['inputDigestBefore'] == receipt['inputDigestAfter'] == digest and
                receipt['sourceError'] is None and receipt['outputOrTestError'] is None, 'stage_receipt_invalid', stage=stage)
        terminal_raw = pin(directory, {'path': receipt['terminal'], 'sha256': receipt['terminalSHA256']})
        require(sealed.get(receipt['terminal']) == terminal_raw, 'terminal_not_sealed', stage=stage)
        terminal = parse_json(terminal_raw, stage + 'Terminal')
        require(terminal['stage'] == stage and type(terminal['returnCode']) is int and type(terminal['exitCode']) is int and
                terminal['returnCode'] == terminal['exitCode'] == 0 and terminal['signal'] is None and terminal['error'] is None and
                terminal['interrupted'] is False and terminal['cleanupSignals'] == [] and terminal['groupCleanup'] is None,
                'stage_not_clean_zero_exit', stage=stage)
        require(terminal['cwd'] == str(app) and type(terminal['processId']) is int and terminal['processId'] > 0 and
                previous_finish <= terminal['startedEpochNs'] <= terminal['finishedEpochNs'], 'stage_launch_or_timing_invalid', stage=stage)
        equal(terminal['command'], expected_commands[stage], '/qa/command/' + stage)
        previous_finish = terminal['finishedEpochNs']
        for stream in ('stdout', 'stderr'):
            stream_raw = pin(directory, terminal[stream])
            require(sealed.get(terminal[stream]['path']) == stream_raw, 'stage_stream_not_sealed', stage=stage)
        if stage in STAGES[:2]:
            text = sealed[terminal['stdout']['path']].decode('utf-8')
            tally = {}
            for key in ('tests', 'suites', 'pass', 'fail', 'cancelled', 'skipped', 'todo'):
                hits = re.findall(r'^# ' + key + r' (\d+)\r?$', text, re.M)
                require(len(hits) == 1, 'missing_TAP_tally', stage=stage, key=key)
                tally[key] = int(hits[0])
            require(tally == receipt['testSummary'] and tally['tests'] > 0 and tally['pass'] == tally['tests'] and
                    all(tally[k] == 0 for k in ('fail', 'cancelled', 'skipped', 'todo')), 'TAP_not_complete_success', stage=stage)
            tallies[stage] = tally
        if stage in STAGES[-2:]:
            names = PRODUCTION if stage == 'production_build' else ALIASES
            observation = parse_json(sealed[receipt['outputObservation']], stage + 'Outputs')
            require(observation['stage'] == stage and observation['producerTerminalSHA256'] == sha(terminal_raw) and
                    set(observation['artifacts']) == set(names), 'producer_output_join_invalid', stage=stage)
            if stage == 'portable_build':
                equal(terminal['command'], ['node', '--import', 'tsx', 'scripts/build-portable.ts'], '/qa/portableProducerCommand')
            for relative in names:
                row = observation['artifacts'][relative]
                equal(row, qa['artifacts'][relative], '/qa/producerArtifact/' + relative)
                require(terminal['startedEpochNs'] - 2_000_000_000 <= row['mtimeNs'] <= terminal['finishedEpochNs'] + 2_000_000_000,
                        'artifact_not_fresh_in_producer_interval', path=relative)
                artifact_raw = pin(app, {'path': relative, **row})
                outputs[relative] = artifact_raw
        stage_refs[stage] = {'receipt': ref, 'terminal': {'path': receipt['terminal'], **info(terminal_raw)}}
    equal(set(qa['artifacts']), set(PRODUCTION + ALIASES), '/qa/artifactKeys')
    build_id = outputs['.next/BUILD_ID'].decode('utf-8').strip()
    require(build_id == qa['actualBuildID'] and build_id and build_id != 'lBzNgnFnu62t8Fg0e4IQ5', 'production_build_not_fresh101')
    outer_ref = {'path': args.outer_terminal, 'sha256': args.outer_terminal_sha256}
    outer_raw = pin(root, outer_ref)
    outer = parse_json(outer_raw, 'rootExternalTerminal')
    require(type(outer) is dict and outer.get('session_id') is None and
            type(outer['exit_code']) is int and outer['exit_code'] == 0 and
            type(outer['output']) is str and outer['chunk_id'], 'root_external_terminal_not_completed_zero_exit')
    return outputs, {
        'qaResult': {**qa_ref, 'bytes': len(qa_raw)}, 'rootSuppliedExternalTerminal': {**outer_ref, 'bytes': len(outer_raw)},
        'frozenInputs': {'path': str(directory / 'frozen-inputs.json'), **qa['evidence']['frozen-inputs.json'],
                         'canonicalDigest': digest, 'exactParsedMapEqualsFinalQAInputs': True},
        'producerStages': stage_refs, 'testTallies': tallies, 'actualBuildID': build_id,
        'artifacts': qa['artifacts'], 'allSevenStageReceiptsValidated': True,
        'allStageCommandsIndependentlyDerived': True, 'executionRequest': request_observation,
        'selectedFrozenTestPaths': expected_commands['non_http_tests'][6:] + ['tests/local-review.test.ts'],
        'outerTerminalHasNoActiveSession': True,
        'actualRunBoundary': 'Root-supplied genuine terminal and locally sealed producer evidence; not signed attestation',
    }


def compare_artifacts(root, refs, outputs, final_hash):
    before = pin(root, refs['preview100HTML'])
    require(sha(before) == HTML_SHA and len(before) == HTML_BYTES, 'saved100_preview_identity_wrong')
    preview_archive = pin(root, refs['preview100Archive'])
    with zipfile.ZipFile(io.BytesIO(preview_archive)) as z:
        require(member(z, 'roadmark/index.html', HTML_SHA) == before, 'materialized_preview_does_not_match_archive')
    actual = outputs['index.html']
    require(re.fullmatch('[0-9a-f]{64}', final_hash) is not None and sha(actual) == final_hash,
            'root_supplied_actual101_hash_does_not_match_current_QA_alias')
    aliases = {p: {'byteIdenticalToIndex': outputs[p] == actual, 'byteIdenticalToSaved100': outputs[p] == before,
                   **info(outputs[p])} for p in ALIASES}
    pre0, raw0, post0 = split_html(before, 'saved100')
    pre1, raw1, post1 = split_html(actual, 'actual101')
    outside = [outside_drift(pre1, pre0, 'HTML_prefix_including_style', 0, 0),
               outside_drift(post1, post0, 'HTML_suffix_including_runtime', len(pre1) + len(raw1), len(pre0) + len(raw0))]
    outside = [x for x in outside if x is not None]
    try:
        old, stats0 = decode_payload(raw0, 'saved100')
        new, stats1 = decode_payload(raw1, 'actual101')
    except VerificationFailure as exc:
        exc.detail['artifactContext'] = {'aliases': aliases, 'outsideEvDataDifferences': outside,
                                         'baselineEvData': info(raw0), 'actualEvData': info(raw1)}
        raise
    differences = ordered_json_differences(new, old, '')
    canonical = parse_json(read(local(local(root, APP), MARKET)), 'canonicalMarket')
    market_differences = ordered_json_differences(new['marketInventory'], canonical, '/marketInventory')
    result = {
        'baseline': {**info(before), 'path': refs['preview100HTML']['path'], 'archive': refs['preview100Archive']},
        'actual101': {**info(actual), 'path': APP + '/index.html', 'expectedSHA256SuppliedExternally': final_hash},
        'wholeHTMLByteIdentical': actual == before, 'aliases': aliases,
        'encodedEvData': {'byteIdentical': raw0 == raw1, 'baseline': info(raw0), 'actual': info(raw1)},
        'outsideEvData': {'byteIdentical': not outside, 'differences': outside},
        'decodedPayload': {'allValuesAndObjectArrayOrderPreserved': not differences, 'differences': differences},
        'canonicalMarket': {'completeAuditPayloadRetained': not market_differences, 'differences': market_differences,
                            'records': len(new['marketInventory']['records']), 'unverifiedLeads': len(new['marketInventory']['unverifiedLeads'])},
        'art': {'wholeDecodedArtIdentical': not ordered_json_differences(new['art'], old['art'], '/art'),
                'differences': ordered_json_differences(new['art'], old['art'], '/art')},
        'runtimeDisposition': 'exact_HTML_suffix_bytes_unchanged' if post0 == post1 else 'unknown_runtime_or_shell_delta_requires_review',
        'semanticEquivalenceInferredFromSource': False, 'decoder': {'saved100': stats0, 'actual101': stats1},
    }
    require(all(row['byteIdenticalToIndex'] and row['byteIdenticalToSaved100'] for row in aliases.values()) and
            not differences and not market_differences and raw0 == raw1 and not outside,
            'portable_preservation_mismatch_no_automatic_acceptance', observation=result)
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace-root', type=Path, default=Path(__file__).resolve().parents[3])
    for name in ('qa-result', 'qa-result-sha256', 'outer-terminal', 'outer-terminal-sha256', 'expected-html101-sha256'):
        parser.add_argument('--' + name, required=True)
    args = parser.parse_args()
    try:
        root = args.workspace_root.resolve()
        refs = parse_json(pin(root, {'path': PINS, 'sha256': PINS_SHA}), 'inputPins')['inputs']
        expected, market, source = verify_source(root, refs)
        outputs, qa = verify_qa(root, args, refs, expected)
        artifact = compare_artifacts(root, refs, outputs, args.expected_html101_sha256)
        report = {'schema': 'roadmark-rebuilt101-portable-preservation-v1', 'status': 'passed',
                  'checkpoint': 101, 'baselineCheckpoint': 100, 'historical101PassReused': False,
                  'scriptSHA256': sha(read(Path(__file__))), 'sourceScope': source, 'qaBinding': qa,
                  'artifactPreservation': artifact, 'notVerified': NOT_VERIFIED}
        print(json.dumps(report, ensure_ascii=False, separators=(',', ':'), allow_nan=False))
        return 0
    except VerificationFailure as exc:
        print(json.dumps({'status': 'failed', **exc.detail, 'notVerified': NOT_VERIFIED}, default=str), file=sys.stderr)
    except Exception as exc:
        print(json.dumps({'status': 'failed', 'check': 'verification_exception', 'type': type(exc).__name__,
                          'error': str(exc), 'notVerified': NOT_VERIFIED}), file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())
