#!/usr/bin/env python3
"""Root-only, read-only static comparison of the actual100 portable HTML to saved99.

Requires an independently supplied actual100 HTML hash. Reads pinned saved99 ZIP,
fixture, candidate manifest and market JSON. Never imports app/candidate modules,
evaluates HTML/JavaScript, builds, runs a browser, uses network, or writes files.
"""

import argparse
import copy
import hashlib
import io
import json
import re
import sys
import zipfile
from decimal import Decimal
from pathlib import Path


BASELINE_ZIP_PATH = "roadmark-recovery/final99-attempt1/Roadmark-recovered-99-portable-preview.zip"
BASELINE_ZIP_SHA256 = "0ababbe0d9e9c16aea35f1cb3f427e20d5536d1d0b3b4e11a0a3a88ab78e993a"
BASELINE_MEMBER = "roadmark/index.html"
BASELINE_HTML_SHA256 = "22bbd67dcb7de6fd46598c61c34f10894ef63f2cb02eb7f58af0c7ffb1336a80"
BASELINE_HTML_BYTES = 37013686
FIXTURE_PATH = "roadmark-research/market100-candidate/files/qa/checkpoint100-market-fixture.json"
FIXTURE_SHA256 = "6ca6057ef2db97fb7aa1251e307f9d419c88dadfe67d2390014ccd436f967837"
CANDIDATE_PATH = "roadmark-research/market100-candidate/manifest.json"
CANDIDATE_SHA256 = "52061d869f2e1cab0ca3cec6252a57200f251bb4b7317337dd3f9cf168ebaa66"
MARKET_PATH = "roadmark-research/market100-candidate/files/data/market-inventory-2026-10-10.json"
MARKET_SHA256 = "2469610f9bea19221ed99483b01ca23ca4f9bb62356a873398e9895c2eb838ac"
OPEN_TAG = b'<script id="ev-data" type="application/json">'
CLOSE_TAG = b"</script>"
TOP_KEYS = ["marketInventory", "cars", "packs", "research", "counts", "art"]
ALLOWED_FIELDS = ["checkedAt", "evidenceNote", "limitations", "sourceUrls"]
TARGETS = [
    ["records", 33, "bmw-i3"],
    ["records", 40, "bmw-ix4"],
    ["unverifiedLeads", 47, "dfac-captain-45e"],
    ["unverifiedLeads", 48, "dfac-captain-85e"],
    ["unverifiedLeads", 74, "pioneer-ev-dfsk-ec35"],
    ["unverifiedLeads", 137, "mercedes-benz-eqb"],
    ["unverifiedLeads", 138, "mercedes-benz-eqe-sedan"],
    ["unverifiedLeads", 139, "mercedes-benz-eqe-suv"],
    ["unverifiedLeads", 140, "mercedes-benz-eqs-suv"],
    ["unverifiedLeads", 141, "mercedes-benz-maybach-eqs"],
]
NOT_VERIFIED = [
    "browser_hydration_or_runtime_execution", "visual_or_mobile_rendering",
    "whole_Next_production_module_graph", "source_tree_or_build_provenance",
    "canonical_string_table_layout_or_unused_dictionary_entries",
    "other_HTML_files_or_delivery_archives", "market_claim_truth_or_freshness",
    "full_market_or_trim_universe", "publisher_origin_bytes",
]

# BEGIN VERBATIM REVIEWED99 HELPERS; see DERIVATION.md and helper pins.
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


# END VERBATIM REVIEWED99 HELPERS.


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


def verify(args):
    workspace = args.workspace_root.resolve()
    target = args.html100.resolve()
    expected_sha = args.expected_html100_sha256
    require(re.fullmatch(r"[0-9a-f]{64}", expected_sha) is not None,
            "expected_html100_sha256_must_be_64_lowercase_hex")
    require(expected_sha != BASELINE_HTML_SHA256, "saved99_cannot_substitute_for_actual100")
    archive_path = workspace / BASELINE_ZIP_PATH
    archive_bytes = read_pinned(archive_path, BASELINE_ZIP_SHA256, "saved99ZIP")
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        members = [i for i in archive.infolist() if i.filename == BASELINE_MEMBER]
        require(len(members) == 1, "saved99_member_count", count=len(members))
        equal(members[0].file_size, BASELINE_HTML_BYTES, "/saved99/memberBytes")
        before_bytes = archive.read(members[0])
    equal(len(before_bytes), BASELINE_HTML_BYTES, "/saved99/htmlBytes")
    equal(sha(before_bytes), BASELINE_HTML_SHA256, "/saved99/htmlSHA256")
    after_bytes = read_pinned(target, expected_sha, "actual100HTML")
    fixture_bytes = read_pinned(workspace / FIXTURE_PATH, FIXTURE_SHA256, "reviewed100Fixture")
    manifest_bytes = read_pinned(workspace / CANDIDATE_PATH, CANDIDATE_SHA256, "reviewed100Manifest")
    market_bytes = read_pinned(workspace / MARKET_PATH, MARKET_SHA256, "reviewed100Market")
    fixture = parse_json(fixture_bytes, "reviewed100Fixture")
    manifest = parse_json(manifest_bytes, "reviewed100Manifest")
    candidate_market = parse_json(market_bytes, "reviewed100Market")
    equal(fixture["schemaVersion"], 1, "/fixture/schemaVersion")
    equal(fixture["allowedFields"], ALLOWED_FIELDS, "/fixture/allowedFields")
    equal(fixture["marketFile"], "data/market-inventory-2026-10-10.json", "/fixture/marketFile")
    equal(fixture["afterSHA256"], MARKET_SHA256, "/fixture/afterSHA256")
    equal(len(manifest["files"]), 5, "/manifest/fileCount")
    by_path = {row["path"]: row for row in manifest["files"]}
    equal(len(by_path), 5, "/manifest/uniqueFileCount")
    equal(by_path[fixture["marketFile"]]["afterSHA256"], MARKET_SHA256, "/manifest/marketSHA256")
    equal(by_path["qa/checkpoint100-market-fixture.json"]["afterSHA256"], FIXTURE_SHA256,
          "/manifest/fixtureSHA256")
    changes = fixture["changes"]
    equal([[r["section"], r["index"], r["id"]] for r in changes], TARGETS, "/fixture/targets")

    pre99, raw99, post99 = split_html(before_bytes, "saved99")
    pre100, raw100, post100 = split_html(after_bytes, "actual100")
    outside = [
        outside_drift(pre100, pre99, "before_ev_data_body", 0, 0),
        outside_drift(post100, post99, "after_ev_data_body",
                      len(pre100) + len(raw100), len(pre99) + len(raw99)),
    ]
    outside = [row for row in outside if row is not None]
    try:
        old, decode99 = decode_payload(raw99, "saved99")
        new, decode100 = decode_payload(raw100, "actual100")
    except VerificationFailure as exc:
        exc.detail["outsideEvDataDifferences"] = outside
        raise
    equal(list(old), TOP_KEYS, "/saved99/topLevelKeys")
    expected = copy.deepcopy(old)
    permitted_paths = []
    for row in changes:
        section, index, identity = row["section"], row["index"], row["id"]
        path = "/marketInventory/" + section + "/" + str(index)
        before, after = row["before"], row["after"]
        equal(old["marketInventory"][section][index], before, "/saved99" + path)
        equal(before["id"], identity, "/fixture" + path + "/before/id")
        equal(after["id"], identity, "/fixture" + path + "/after/id")
        equal(list(after), list(before), "/fixture" + path + "/orderedKeys")
        equal(row["changedFields"], ALLOWED_FIELDS, "/fixture" + path + "/changedFields")
        equal(sorted(k for k in before if before[k] != after[k]), ALLOWED_FIELDS,
              "/fixture" + path + "/actualChangedFields")
        for value in [before, after]:
            equal(value["rankingEligible"], False, "/fixture" + path + "/rankingEligible")
        expected["marketInventory"][section][index] = copy.deepcopy(after)
        permitted_paths.extend(path + "/" + field for field in ALLOWED_FIELDS)
    equal(old["marketInventory"]["counts"], fixture["countsBefore"], "/saved99/marketCounts")
    equal(fixture["countsAfter"], fixture["countsBefore"], "/fixture/unchangedCounts")
    candidate_diff = ordered_json_differences(candidate_market, expected["marketInventory"],
                                             "/candidateMarket")
    require(not candidate_diff, "fixture_does_not_reconstruct_candidate_market", differences=candidate_diff)
    # Every decoded leaf, ordered array and ordered object is compared. The
    # copied baseline already contains its generated audits; none are exempted.
    payload_diff = ordered_json_differences(new, expected, "")
    require(not outside and not payload_diff, "artifact_delta_mismatch",
            outsideEvDataDifferences=outside, decodedPayloadDifferences=payload_diff,
            note="All detected payload differences are retained; no paths are ignored.")
    return {
        "schema": "roadmark-portable100-static-observation-v1", "status": "passed",
        "checkpoint": 100, "baselineCheckpoint": 99,
        "verificationScope": "actual_HTML_bytes_and_complete_decoded_payload",
        "scriptSHA256": sha(Path(__file__).read_bytes()),
        "inputs": {
            "saved99ZIP": {"path": str(archive_path), "sha256": sha(archive_bytes)},
            "saved99HTML": {"member": BASELINE_MEMBER, "sha256": sha(before_bytes), "bytes": len(before_bytes)},
            "actual100HTML": {"path": str(target), "sha256": sha(after_bytes), "bytes": len(after_bytes),
                              "expectedSHA256SuppliedExternally": expected_sha},
            "reviewedFixtureSHA256": sha(fixture_bytes), "candidateManifestSHA256": sha(manifest_bytes),
            "candidateMarketSHA256": sha(market_bytes),
        },
        "outsideEvData": {"byteIdentical": True, "prefixBytes": len(pre100), "suffixBytes": len(post100),
                          "prefixSHA256": sha(pre100), "suffixSHA256": sha(post100)},
        "decoder": {"format": "roadmark-string-table-v1", "saved99": decode99, "actual100": decode100},
        "delta": {"rows": TARGETS, "changedFieldsPerRow": ALLOWED_FIELDS, "allowedFieldPaths": permitted_paths,
                  "fixtureExact": True, "candidateMarketExact": True, "additionalAuditExceptions": []},
        "preserved": {"allOtherDecodedValues": True, "arrayOrder": True, "objectKeyOrder": True,
                      "topLevelKeys": TOP_KEYS, "cataloguePickerRows": len(old["cars"]),
                      "wholePacks": len(old["packs"]), "marketRecords": len(old["marketInventory"]["records"]),
                      "unverifiedLeads": len(old["marketInventory"]["unverifiedLeads"])},
        "notVerified": NOT_VERIFIED,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html100", required=True, type=Path, help="Final actual100 portable HTML built by root")
    parser.add_argument("--expected-html100-sha256", required=True,
                        help="Independently established actual100 SHA256; no default exists")
    parser.add_argument("--workspace-root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    try:
        report = verify(args)
    except VerificationFailure as exc:
        print(json.dumps({"status": "failed", **exc.detail, "notVerified": NOT_VERIFIED},
                         ensure_ascii=False, separators=(",", ":"), default=str), file=sys.stderr)
        return 1
    except Exception as exc:
        print(json.dumps({"status": "failed", "check": "unexpected_verification_error",
                          "errorType": type(exc).__name__, "error": str(exc), "notVerified": NOT_VERIFIED},
                         ensure_ascii=False, separators=(",", ":")), file=sys.stderr)
        return 1
    print(json.dumps(report, ensure_ascii=False, separators=(",", ":"), allow_nan=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
