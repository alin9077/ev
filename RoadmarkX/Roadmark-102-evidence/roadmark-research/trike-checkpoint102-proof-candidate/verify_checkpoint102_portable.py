#!/usr/bin/env python3
"""Candidate only: root-run checkpoint102 portable preservation and producer join.

Static standard-library reads only. No app imports, JS execution, subprocesses,
network, archive extraction, or file writes. This is NOT a full QA or runtime proof.
"""
import argparse
import hashlib
import json
import re
import stat
import sys
from decimal import Decimal
from pathlib import Path

APP = 'roadmark-work/roadmark'
MARKET = 'data/market-inventory-2026-10-10.json'
ALIASES = ['index.html', 'index-b.html', 'public/index.html', 'public/index-b.html']
STAGES = ['non_http_tests', 'local_http_tests', 'typecheck', 'lint', 'validation', 'production_build', 'portable_build']
OPEN_TAG = b'<script id="ev-data" type="application/json">'
CLOSE_TAG = b'</script>'
BASELINE_HTML_SHA = 'cb4fe95ff34b375fe139b7ef81e959c7ae000a1cb4b44ed74ad340a662f4e39b'
BASELINE_MARKET_SHA = '2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac'
RUNNER_SHA = 'a043d6ac749a39d025bf452eddb55440d2ac81ba3b73be9f4d894a5055a2e10f'
DECODER_SHA = 'cafe3df97dee699e2928c19c285834f3783e4d2d2a2f8a9be561cf046d978187'
ENVIRONMENT = {'NODE_OPTIONS': '--max-old-space-size=1280 --max-semi-space-size=8', 'NEXT_TELEMETRY_DISABLED': '1'}
REMOVED_ENVIRONMENT = ['SITE_STATIC_EXPORT', 'NEXT_PUBLIC_SITE_URL', 'NODE_ENV']
PINS_PATH = 'roadmark-research/trike-checkpoint102-proof-candidate/INPUT-PINS.json'
PINS_SHA = '3a2010df65a774d23a2ac633dd6495df3dacb493dcf544dd6432697ed69a984d'
NOT_VERIFIED = [
    'full_seven_stage_QA_acceptance_or_TAP_tallies',
    'enumerated_input_map_completeness_or_dependency_integrity',
    'emitted_runtime_semantics_or_unrelated_runtime_code_preservation',
    'browser_hydration_interactions_layout_or_visible_Model_Y_hero',
    'Next_client_projection_or_whole_emitted_Next_module_graph',
    'real_phone_performance_publisher_claim_truth_or_market_completeness',
    'signed_source_to_build_attestation_release_approval_or_durable_save',
]

# BEGIN EXACT REVIEWED DECODER/COMPARISON HELPERS
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


# END EXACT REVIEWED DECODER/COMPARISON HELPERS

# BEGIN EXACT REVIEWED SAFE READ HELPERS
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

# END EXACT REVIEWED SAFE READ HELPERS

def clean_path(value):
    require(type(value) is str and not any(c in value for c in ('?', '#', '\x00')),
            'ambiguous_path_rejected', path=value)
    return value


def exact_ref(root, ref, label):
    require(type(ref) is dict and set(ref) == {'path', 'sha256', 'bytes'} and
            type(ref['bytes']) is int and ref['bytes'] >= 0,
            'explicit_path_hash_size_required', input=label)
    clean_path(ref['path'])
    return pin(root, ref)


def same_ordered(actual, expected, path):
    differences = ordered_json_differences(actual, expected, path)
    require(not differences, 'ordered_value_preservation_failed', path=path,
            differences=differences)


def digest_map(value):
    return sha(json.dumps(value, sort_keys=True, separators=(',', ':'), allow_nan=False).encode())


def check_outer(outer):
    require(type(outer) is dict and outer.get('session_id') is None and
            type(outer.get('exit_code')) is int and outer['exit_code'] == 0 and
            type(outer.get('output')) is str and type(outer.get('chunk_id')) is str and outer['chunk_id'],
            'genuine_root_terminal_must_be_completed_zero_exit')


def check_baseline(root, script):
    refs = parse_json(pin(root, {'path': PINS_PATH, 'sha256': PINS_SHA}), 'baselinePins')['inputs']
    raw = {key: exact_ref(root, ref, key) for key, ref in refs.items()
           if key not in ('copiedHelperBlock', 'copiedReadBlock')}
    require(sha(raw['reviewedDecoder']) == DECODER_SHA and sha(raw['runner']) == RUNNER_SHA and
            sha(raw['baselineHTML']) == BASELINE_HTML_SHA, 'baseline_identity_constants_disagree')
    for key, start, end in (
        ('copiedHelperBlock', b'class VerificationFailure', b'\ndef local('),
        ('copiedReadBlock', b'def local(', b'\ndef member('),
    ):
        source = raw['reviewedDecoder']
        block = source[source.index(start):source.index(end)]
        require(info(block) == {k: refs[key][k] for k in ('sha256', 'bytes')} and
                script.count(block) == 1, 'reviewed_helper_copy_drift', block=key)
    proof = parse_json(raw['verified101Proof'], 'verified101Proof')
    check_outer(parse_json(raw['verified101ProofTerminal'], 'verified101ProofTerminal'))
    require(proof['status'] == 'passed' and proof['checkpoint'] == 101 and
            proof['scriptSHA256'] == DECODER_SHA and
            proof['artifactPreservation']['wholeHTMLByteIdentical'] is True and
            proof['artifactPreservation']['actual101']['sha256'] == BASELINE_HTML_SHA,
            'pinned101_baseline_provenance_invalid')
    require(proof['sourceScope']['source100CanonicalMember']['sha256'] == BASELINE_MARKET_SHA,
            'pinned101_canonical_provenance_invalid')
    return refs, raw


def check_sources(root, final, baseline_raw):
    expected_raw = exact_ref(root, final['inputMap'], 'finalInputMap')
    expected = parse_json(expected_raw, 'finalInputMap')
    before = parse_json(baseline_raw['baselineInputs'], 'baseline101InputMap')
    require(type(expected) is dict and type(before) is dict, 'invalid_input_map')
    planned = parse_json(baseline_raw['plannedChangeMap'], 'plannedChangeMap')
    changed = sorted(p for p in before if p in expected and before[p] != expected[p])
    added = sorted(set(expected) - set(before))
    equal(sorted(set(before) - set(expected)), [], '/source/removedPaths')
    equal(changed, sorted(row['path'] for row in planned['modifiedExisting']), '/source/changedPaths')
    equal(added, sorted(row['path'] for row in planned['introduced']), '/source/introducedPaths')
    app = local(root, APP)
    for path, digest in expected.items():
        clean_path(path)
        require(path not in ALIASES and not path.startswith(('.next/', 'node_modules/')),
                'generated_or_dependency_path_in_input_map', path=path)
        pin(app, {'path': path, 'sha256': digest})
    equal(final['canonical']['path'], APP + '/' + MARKET, '/canonical/path')
    canonical_raw = exact_ref(root, final['canonical'], 'finalCanonical')
    equal(sha(canonical_raw), expected[MARKET], '/source/canonicalMapJoin')
    require(sha(canonical_raw) != BASELINE_MARKET_SHA, 'old101_canonical_is_not102')
    canonical = parse_json(canonical_raw, 'finalCanonical')
    return expected, canonical, {
        'finalInputMap': final['inputMap'], 'canonical': final['canonical'],
        'modifiedPaths': changed, 'introducedPaths': added,
        'enumeratedCurrentFileHashesMatched': len(expected),
        'allOtherEnumerated101SourceHashesUnchanged': True,
        'sourceMapCompletenessIndependentlyProved': False,
        'sourceCandidateApprovalInferred': False,
    }


def check_qa_join(root, refs, final, expected):
    qa_raw = exact_ref(root, final['qaResult'], 'actualFinalQAResult')
    qa = parse_json(qa_raw, 'actualFinalQAResult')
    directory = local(root, final['qaResult']['path']).parent
    require(Path(final['qaResult']['path']).name == 'run-result.json', 'unexpected_QA_result_name')
    require(qa['schema'] == 'roadmark99.serial-qa.v1' and qa['passed'] is True and
            qa['publicExportRun'] is False and qa['runnerSHA256'] == RUNNER_SHA,
            'current_pinned_runner_success_record_required')
    expected_ref = {k: final['inputMap'][k] for k in ('path', 'sha256')}
    equal(qa['configuration']['expectedInputs'], expected_ref, '/qa/expectedInputs')
    equal(set(qa['configuration']), {'baselineInputs', 'expectedInputs', 'candidate'}, '/qa/configurationKeys')
    for key, ref in qa['configuration'].items():
        require(set(ref) == {'path', 'sha256'}, 'unexpected_QA_configuration_reference', key=key)
        clean_path(ref['path'])
        pin(root, ref)
    digest = digest_map(expected)
    equal(qa['frozenInputDigest'], digest, '/qa/frozenInputDigest')
    equal(set(qa['stageStatus']), set(STAGES), '/qa/stageStatusKeys')
    equal(set(qa['stageReceipts']), set(STAGES), '/qa/stageReceiptKeys')
    for stage in STAGES:
        equal(qa['stageStatus'][stage], 'passed', '/qa/claimedStageStatus/' + stage)
    sealed = {}
    for filename, ref in qa['evidence'].items():
        clean_path(filename)
        require('/' not in filename and type(ref) is dict and
                set(ref) == {'sha256', 'bytes', 'mtimeNs'}, 'invalid_QA_evidence_reference')
        sealed[filename] = pin(directory, {'path': filename, **ref})
    require({p.name for p in directory.iterdir()} == set(sealed) | {'run-result.json'},
            'QA_directory_membership_drift')
    equal(parse_json(sealed['frozen-inputs.json'], 'frozenInputs'), expected, '/qa/frozenInputs')
    request = parse_json(sealed['execution-request.json'], 'executionRequest')
    argv = [refs['runner']['path'], '--workspace', str(root), '--output', directory.relative_to(root).as_posix()]
    for name, key in [('baseline-inputs', 'baselineInputs'), ('expected-inputs', 'expectedInputs'),
                      ('candidate-manifest', 'candidate')]:
        ref = qa['configuration'][key]
        argv.extend(['--' + name, ref['path'], '--' + name + '-sha256', ref['sha256']])
    argv.extend(['--approved-runner-sha256', RUNNER_SHA, '--exclusive-workspace-confirmed'])
    equal(request['argv'], argv, '/qa/executionRequest/argv')
    require(request['schema'] == qa['schema'] and request['runnerSHA256'] == RUNNER_SHA and
            request['configuration'] == qa['configuration'] and request['startedAtUTC'] == qa['startedAtUTC'] and
            request['exclusiveWorkspaceConfirmedByRoot'] is True, 'execution_request_join_invalid')
    equal(request['environmentOverrides'], ENVIRONMENT, '/qa/executionRequest/environment')
    removed = request['removedInheritedEnvironmentNames']
    require(type(removed) is list and removed == [name for name in REMOVED_ENVIRONMENT if name in removed],
            'unexpected_removed_inherited_environment_names')
    plan = parse_json(sealed['stage-plan.json'], 'stagePlan')
    equal(plan['serialOrder'], STAGES, '/qa/stagePlan/order')
    command = ['node', '--import', 'tsx', 'scripts/build-portable.ts']
    equal(plan['commands']['portable_build'], command, '/qa/stagePlan/portableCommand')
    ref = qa['stageReceipts']['portable_build']
    receipt_raw = pin(directory, ref)
    require(sealed.get(ref['path']) == receipt_raw, 'portable_receipt_not_sealed')
    receipt = parse_json(receipt_raw, 'portableReceipt')
    require(receipt['stage'] == 'portable_build' and receipt['passed'] is True and
            receipt['inputDigestBefore'] == receipt['inputDigestAfter'] == digest and
            receipt['sourceError'] is None and receipt['outputOrTestError'] is None,
            'portable_receipt_invalid')
    equal(receipt['environmentOverrides'], ENVIRONMENT, '/qa/portableEnvironment')
    equal(receipt['removedEnvironmentNames'], REMOVED_ENVIRONMENT, '/qa/portableRemovedEnvironment')
    terminal_raw = pin(directory, {'path': receipt['terminal'], 'sha256': receipt['terminalSHA256']})
    require(sealed.get(receipt['terminal']) == terminal_raw, 'portable_terminal_not_sealed')
    terminal = parse_json(terminal_raw, 'portableTerminal')
    require(terminal['stage'] == 'portable_build' and
            type(terminal['returnCode']) is int and type(terminal['exitCode']) is int and
            terminal['returnCode'] == terminal['exitCode'] == 0 and
            terminal['signal'] is None and terminal['error'] is None and terminal['interrupted'] is False and
            terminal['cleanupSignals'] == [] and terminal['groupCleanup'] is None,
            'portable_terminal_not_clean_zero_exit')
    app = local(root, APP)
    require(terminal['cwd'] == str(app) and type(terminal['processId']) is int and terminal['processId'] > 0 and
            type(terminal['startedEpochNs']) is int and type(terminal['finishedEpochNs']) is int and
            0 < terminal['startedEpochNs'] <= terminal['finishedEpochNs'], 'portable_launch_invalid')
    equal(terminal['command'], command, '/qa/portableTerminal/command')
    for stream in ('stdout', 'stderr'):
        stream_raw = pin(directory, terminal[stream])
        require(sealed.get(terminal[stream]['path']) == stream_raw, 'portable_log_not_sealed', stream=stream)
    observation = parse_json(sealed[receipt['outputObservation']], 'portableOutputObservation')
    require(observation['stage'] == 'portable_build' and
            observation['producerTerminalSHA256'] == sha(terminal_raw) and
            set(observation['artifacts']) == set(ALIASES), 'portable_producer_output_join_invalid')
    equal(set(final['aliases']), set(ALIASES), '/final/aliasKeys')
    outputs = {}
    for path in ALIASES:
        row = final['aliases'][path]
        require(type(row) is dict and set(row) == {'sha256', 'bytes', 'mtimeNs'} and
                type(row['bytes']) is int and row['bytes'] > 0 and type(row['mtimeNs']) is int,
                'explicit_final_artifact_hash_size_mtime_required', path=path)
        equal(row, qa['artifacts'][path], '/qa/finalArtifact/' + path)
        equal(row, observation['artifacts'][path], '/qa/producerArtifact/' + path)
        require(terminal['startedEpochNs'] - 2_000_000_000 <= row['mtimeNs'] <=
                terminal['finishedEpochNs'] + 2_000_000_000, 'artifact_outside_producer_interval', path=path)
        outputs[path] = pin(app, {'path': path, **row})
    outer_raw = exact_ref(root, final['outerTerminal'], 'genuineRootOuterTerminal')
    check_outer(parse_json(outer_raw, 'genuineRootOuterTerminal'))
    return outputs, {
        'qaResult': final['qaResult'], 'rootSuppliedOuterTerminal': final['outerTerminal'],
        'frozenInputDigest': digest, 'portableReceipt': ref,
        'portableTerminalSHA256': sha(terminal_raw), 'portableCommand': command,
        'portableProducerSourceOutputAndCurrentByteJoinsValidated': True,
        'allEvidenceBytesPinned': True, 'fullSevenStageQAVerified': False,
        'boundary': 'Root must supply the genuine observed terminal from this same run; local unsigned records cannot authenticate their own origin. Full QA acceptance is separate.',
    }


def split_runtime(suffix, label):
    opening, closing = b'</script><script>', b'</script></body></html>'
    require(suffix.startswith(opening) and suffix.endswith(closing), 'unexpected_static_suffix_wrapper', input=label)
    runtime = suffix[len(opening):-len(closing)]
    require(runtime.startswith(b'window.__EV_B=true;') and b'</script' not in runtime.lower(),
            'hero_flag_or_single_runtime_script_boundary_drift', input=label)
    return opening, runtime, closing


def check_artifacts(root, final, before, outputs, canonical, baseline_raw):
    actual = outputs['index.html']
    require(all(raw == actual for raw in outputs.values()), 'four_alias_bytes_disagree')
    require(actual != before, 'old101_portable_is_not102')
    pre0, raw0, post0 = split_html(before, 'verified101Baseline')
    pre1, raw1, post1 = split_html(actual, 'actual102')
    require(pre1 == pre0, 'static_HTML_prefix_including_CSS_drift',
            difference=outside_drift(pre1, pre0, 'prefix', 0, 0))
    open0, runtime0, close0 = split_runtime(post0, 'verified101Baseline')
    open1, runtime1, close1 = split_runtime(post1, 'actual102')
    require(open1 == open0 and close1 == close0, 'static_suffix_wrapper_drift')
    require(type(final['expectedRuntimeSHA256']) is str and
            re.fullmatch('[0-9a-f]{64}', final['expectedRuntimeSHA256']) is not None and
            sha(runtime1) == final['expectedRuntimeSHA256'], 'explicit_final_runtime_hash_mismatch')
    require(runtime1 != runtime0, 'expected102_market_copy_runtime_change_missing')
    require(pre1.count(b'<style>') == pre1.count(b'</style>') == 1, 'ambiguous_inline_CSS_boundary')
    css = pre1.split(b'<style>', 1)[1].split(b'</style>', 1)[0]
    require(css == read(local(local(root, APP), 'src/app/globals.css')), 'inline_CSS_source_mismatch')
    old, old_stats = decode_payload(raw0, 'verified101Baseline')
    new, new_stats = decode_payload(raw1, 'actual102')
    equal(list(new), list(old), '/payload/topLevelKeyOrder')
    require('marketInventory' in new and 'art' in new, 'required_payload_members_missing')
    same_ordered(new['marketInventory'], canonical, '/marketInventory')
    for key in old:
        if key != 'marketInventory':
            same_ordered(new[key], old[key], pointer('', key))
    inventory, old_inventory = new['marketInventory'], old['marketInventory']
    observed = {}
    tails = {
        'records': (243, ['ozetrike-mate150']),
        'unverifiedLeads': (148, ['kyburz-dxp', 'emos-ct-kargo', 'emos-ct-kube', 'stealth-ozpod', 'ozetrike-mate150l']),
        'peripheralRecords': (6, ['jinpeng-e-ql150']),
    }
    for key, (count, ids) in tails.items():
        rows, old_rows = inventory[key], old_inventory[key]
        require(type(rows) is list and type(old_rows) is list, 'invalid_market_collection', collection=key)
        equal(len(rows), count, '/marketInventory/' + key + '/count')
        same_ordered(rows[:len(old_rows)], old_rows, '/marketInventory/' + key + '/prior101Prefix')
        equal([row['id'] for row in rows[len(old_rows):]], ids, '/marketInventory/' + key + '/newIDs')
        observed[key] = len(rows)
    same_ordered(inventory['reconciledLeads'], old_inventory['reconciledLeads'], '/marketInventory/reconciledLeads')
    equal(len(inventory['reconciledLeads']), 21, '/marketInventory/reconciledLeads/count')
    planned_counts = parse_json(baseline_raw['plannedCounts'], 'plannedCounts')['counts']
    same_ordered(inventory['counts'], planned_counts, '/marketInventory/counts')
    return {
        'baseline101HTML': info(before), 'actual102HTML': info(actual),
        'fourAliasesByteIdentical': True, 'aliases': final['aliases'],
        'wholeHTMLByteIdentical': False, 'encodedPayloadByteIdentical': raw0 == raw1,
        'encodedPayload': {'baseline101': info(raw0), 'actual102': info(raw1)},
        'completeCanonical102AuditRetainedWithValueAndKeyArrayOrder': True,
        'observedMarketCollections': observed, 'newDispositionIDs': {key: value[1] for key, value in tails.items()},
        'allPrior101CollectionRowsAndReconciledLeadsPreserved': True,
        'declaredCountsMatchPinnedPlan': True,
        'allOtherDecodedPayloadValuesAndKeyArrayOrderPreserved': True,
        'preservedDecodedTopLevelMembers': [key for key in old if key != 'marketInventory'],
        'wholeDecodedArtPreserved': True,
        'staticHTMLPrefixIncludingInlineCSSByteIdentical': True, 'inlineCSS': info(css),
        'staticSuffixWrappersByteIdentical': True, 'originalHeroSelectorFlagPreserved': True,
        'runtime': {'baseline101': info(runtime0), 'actual102': info(runtime1),
                    'wholeRuntimeByteIdentical': False, 'semanticPreservationVerified': False,
                    'disposition': 'Changed runtime accepted only as externally pinned bytes; this checker does not limit or prove its semantic delta. Independent runtime/source/browser review remains required.'},
        'visibleHeroPreservationClaimed': False,
        'decoder': {'baseline101': old_stats, 'actual102': new_stats},
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace-root', type=Path, required=True)
    parser.add_argument('--final-inputs', required=True)
    parser.add_argument('--final-inputs-sha256', required=True)
    parser.add_argument('--approved-verifier-sha256', required=True)
    args = parser.parse_args()
    try:
        root = args.workspace_root.resolve()
        script = read(Path(__file__))
        require(re.fullmatch('[0-9a-f]{64}', args.approved_verifier_sha256) is not None and
                sha(script) == args.approved_verifier_sha256, 'reviewed_verifier_identity_mismatch')
        refs, baseline_raw = check_baseline(root, script)
        clean_path(args.final_inputs)
        final_raw = pin(root, {'path': args.final_inputs, 'sha256': args.final_inputs_sha256})
        final = parse_json(final_raw, 'rootFinalInputs')
        equal(set(final), {'schema', 'checkpoint', 'canonical', 'inputMap', 'qaResult', 'outerTerminal',
                           'aliases', 'expectedRuntimeSHA256'}, '/finalInputKeys')
        equal(final['schema'], 'roadmark102.portable-proof.final-inputs.v1', '/final/schema')
        equal(final['checkpoint'], 102, '/final/checkpoint')
        expected, canonical, source = check_sources(root, final, baseline_raw)
        outputs, qa = check_qa_join(root, refs, final, expected)
        artifact = check_artifacts(root, final, baseline_raw['baselineHTML'], outputs, canonical, baseline_raw)
        report = {
            'schema': 'roadmark102.portable-preservation-observation.v1', 'status': 'passed',
            'checkpoint': 102, 'baselineCheckpoint': 101, 'scriptSHA256': sha(script),
            'finalInputs': {'path': args.final_inputs, **info(final_raw)},
            'statusScope': 'Exact decoded portable payload, static shell/CSS, enumerated source preservation, and narrow portable producer join only',
            'sourceBinding': source, 'portableQABinding': qa, 'artifactPreservation': artifact,
            'historical101QAReusedAs102QA': False, 'notVerified': NOT_VERIFIED,
        }
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
