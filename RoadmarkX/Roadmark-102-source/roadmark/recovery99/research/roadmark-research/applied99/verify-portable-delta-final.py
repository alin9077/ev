#!/usr/bin/env python3
"""Root-only, read-only static verification of a built99 portable HTML artifact.

This verification candidate uses only Python's standard library. It never
imports application modules or evaluates HTML, JavaScript or fixture code.
"""

import argparse
import copy
import hashlib
import json
import re
import sys
from decimal import Decimal
from pathlib import Path


BASELINE_PATH = "roadmark-restoration/browser98/current98.html"
BASELINE_SHA256 = "bcfa654d4ec7df52c61dd49dd2c131e8f5d98a52b1fc83da2267f16281d787e7"
FIXTURE_PATH = "roadmark-work/roadmark/qa/checkpoint99-mazda-fixture.json"
FIXTURE_SHA256 = "405e14b6a02a771fba0fb8cdfea6f651c817f6b8e112dfb531dd94b73164e3a2"
CANDIDATE_PATH = "roadmark-research/applied99/revision4/candidate-manifest.json"
CANDIDATE_SHA256 = "c710eb25970241c720c8695024f66a31cbaaaa2e6dd4b101143b531a02ae0850"
OPEN_TAG = b'<script id="ev-data" type="application/json">'
CLOSE_TAG = b"</script>"
NEW_IDS = [
    "mazda_cx6e_au_aug2026__e35_gt__20261012",
    "mazda_cx6e_au_aug2026__e35_azami__20261012",
]
NEW_SOURCE_IDS = ["r99_mazda_cx6e_m" + str(n).zfill(2) for n in range(2, 8)]
TOP_KEYS = {"marketInventory", "cars", "packs", "research", "counts", "art"}
RESEARCH_KEYS = {"sources", "criteria", "publication_issues", "trim_equipment"}
PACK_KEYS = {"car", "features", "eligibility", "events", "configuration", "sourceIds"}
NOVATED_AUDIT = {
    "value": "Exact eligibility needs confirmation",
    "conditions": "The listed price alone does not establish FBT eligibility. The May 2026 announcement described proposed changes from April 2027 and April 2029; this audit has not established that those proposals are law. Confirm the current rules, acquisition conditions and taxable value with the ATO and your adviser.",
    "status": "not_verified",
    "condition_label": "Source audit",
    "last_evidence_date": "2026-10-08",
    "reviewed_date": "2026-10-08",
    "verification_state": "full_text_audit_2026-10-08",
    "usability_notes": [],
}


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


def keyed(rows, key, label):
    require(type(rows) is list, "expected_array", path=label)
    result = {}
    for index, row in enumerate(rows):
        require(type(row) is dict and type(row.get(key)) is str,
                "invalid_row_identity", path=pointer(label, index), key=key)
        identity = row[key]
        require(identity not in result, "duplicate_row_identity", path=label, id=identity)
        result[identity] = row
    return result


def validate_registry_references(packs, registry, label):
    for pack_id, pack in packs.items():
        equal(pack["car"]["id"], pack_id, pointer(label, pack_id) + "/car/id")
        references = pack["sourceIds"]
        require(type(references) is list and all(type(x) is str for x in references),
                "invalid_pack_source_ids", pack=pack_id)
        require(len(references) == len(set(references)), "duplicate_pack_source_id", pack=pack_id)
        require(all(x in registry for x in references), "unresolved_pack_source_id",
                pack=pack_id, missing=[x for x in references if x not in registry])


def expected_new_pack(car, fixture, criteria, old_packs):
    car_id = car["id"]
    rows = copy.deepcopy([r for r in fixture["researchDelta"]["feature_evidence"] if r["variant_id"] == car_id])
    equal([r["criterion"] for r in rows], [r["key"] for r in criteria], car_id + "/fixtureFeatureCriteria")
    # This single generic audit projection is present in saved98 and the
    # unchanged audit source. All other new feature fields remain fixture-exact.
    anchors = [r for p in old_packs.values() for r in p["features"]
               if r["criterion"] == "novated_fbt"
               and r.get("verification_state") == "full_text_audit_2026-10-08"]
    require(bool(anchors), "missing_saved98_novated_audit_anchor")
    for index, anchor in enumerate(anchors):
        equal({k: anchor.get(k) for k in NOVATED_AUDIT}, NOVATED_AUDIT,
              "/saved98/novatedAuditAnchor/" + str(index))
    for row in rows:
        equal(row["model_id"], car["modelId"], car_id + "/fixtureFeatureModelId")
        require(type(row["value"]) is str, "nonstring_fixture_feature", car=car_id, criterion=row["criterion"])
        if row["criterion"] == "novated_fbt":
            row.update(copy.deepcopy(NOVATED_AUDIT))
            row.pop("confirmation_needed", None)
        del row["variant_id"]
        del row["model_id"]
    eligibility = [r for r in fixture["researchDelta"]["update_eligibility"] if r["variant_id"] == car_id]
    equal(len(eligibility), 1, car_id + "/fixtureEligibilityCount")
    return {
        "car": car, "features": rows, "eligibility": eligibility[0],
        "events": [], "configuration": [], "sourceIds": NEW_SOURCE_IDS,
    }


def check_holds(car, path):
    equal(car["year"], None, path + "/year")
    evidence = car["configurationEvidence"]
    for key in ["rankingEligible", "completeVehicleCountEligible", "fullyClosedFactoryBuild",
                "brochureToVinApplicabilityVerified", "rawPdfBytesRetained"]:
        equal(evidence[key], False, path + "/configurationEvidence/" + key)
    equal(evidence["rawPdfSHA256"], None, path + "/configurationEvidence/rawPdfSHA256")
    equal(evidence["sourceIdentity"]["manufacturerModelYear"], None,
          path + "/configurationEvidence/sourceIdentity/manufacturerModelYear")
    equal(car["availabilityEvidence"]["orderStatus"], "preorder", path + "/availabilityEvidence/orderStatus")
    for key in ["physicalStockVerified", "factoryOrderAcceptanceVerified", "factoryProductionVerified",
                "factoryBuildSpecificationVerified", "deliveryToBuyerVerified"]:
        equal(car["availabilityEvidence"][key], False, path + "/availabilityEvidence/" + key)
    for index, conflict in enumerate(evidence["heldConflicts"]):
        equal(conflict["normalizedValue"], None,
              path + "/configurationEvidence/heldConflicts/" + str(index) + "/normalizedValue")
    for key, fact in car["facts"].items():
        equal(fact["comparisonBasis"], "", path + "/facts/" + key + "/comparisonBasis")
        require(fact["status"] in ["conditional", "not_verified"], "new_fact_claims_unqualified_status",
                path=path + "/facts/" + key + "/status", actual=fact["status"])


def aggregate(payload):
    cars = [p["car"] for p in payload["packs"].values()]
    return {
        "variants": len(cars),
        "families": len({c.get("modelFamily") or c["family"] for c in cars}),
        "generations": len({c["modelId"] for c in cars}),
        "criteria": len(payload["research"]["criteria"]),
        "evidence": sum(len(p["features"]) for p in payload["packs"].values()),
        "current": sum(c["availability"] == "current_or_order_listed" for c in cars),
        "outgoing": sum(c["availability"] == "outgoing" for c in cars),
        "provisional": sum(c["availability"] == "announced_provisional" for c in cars),
    }


def summary_counts(payload):
    cars = [p["car"] for p in payload["packs"].values()]
    summaries = [c["buyerSummary"] for c in cars if c.get("buyerSummary") is not None]
    return {
        "total": len(summaries),
        "paired": sum(s.get("strength") is not None and s.get("tradeoff") is not None for s in summaries),
        "strengthOnly": sum(s.get("strength") is not None and s.get("tradeoff") is None for s in summaries),
        "absent": len(cars) - len(summaries),
    }


def verify(args):
    workspace = args.workspace_root.resolve()
    target = args.html99.resolve()
    expected_sha = args.expected_html99_sha256
    require(re.fullmatch(r"[0-9a-f]{64}", expected_sha) is not None,
            "expected_html99_sha256_must_be_64_lowercase_hex")
    require(expected_sha != BASELINE_SHA256, "saved98_cannot_be_substituted_for_built99")
    baseline = (workspace / BASELINE_PATH).resolve()
    require(target != baseline, "saved98_cannot_be_substituted_for_built99")
    before_bytes = read_pinned(baseline, BASELINE_SHA256, "saved98")
    after_bytes = read_pinned(target, expected_sha, "built99")
    fixture_bytes = read_pinned(workspace / FIXTURE_PATH, FIXTURE_SHA256, "reviewed99Fixture")
    manifest_bytes = read_pinned(workspace / CANDIDATE_PATH, CANDIDATE_SHA256, "reviewed99CandidateManifest")
    fixture = parse_json(fixture_bytes, "reviewed99Fixture")
    manifest = parse_json(manifest_bytes, "reviewed99CandidateManifest")
    equal(fixture["schema"], "roadmark-checkpoint99-static-candidate.v1", "/fixture/schema")
    equal(manifest["expectedCounts"], fixture["counts"], "/candidateManifest/expectedCounts")
    equal(manifest["runtimeSourceChanges"], 0, "/candidateManifest/runtimeSourceChanges")
    equal([c["id"] for c in fixture["expectedCars"]], NEW_IDS, "/fixture/expectedCarIds")
    equal([s["id"] for s in fixture["dataDelta"]["sources"]], NEW_SOURCE_IDS, "/fixture/sourceIds")

    pre98, raw98, post98 = split_html(before_bytes, "saved98")
    pre99, raw99, post99 = split_html(after_bytes, "built99")
    drift = [
        outside_drift(pre99, pre98, "before_ev_data_body", 0, 0),
        outside_drift(post99, post98, "after_ev_data_body",
                      len(pre99) + len(raw99), len(pre98) + len(raw98)),
    ]
    drift = [d for d in drift if d is not None]
    require(not drift, "bytes_outside_ev_data_changed", differences=drift)
    old, decode98 = decode_payload(raw98, "saved98")
    new, decode99 = decode_payload(raw99, "built99")
    for label, payload in [("saved98", old), ("built99", new)]:
        equal(sorted(payload), sorted(TOP_KEYS), "/" + label + "/keys")
        equal(sorted(payload["research"]), sorted(RESEARCH_KEYS), "/" + label + "/research/keys")
        require(type(payload["packs"]) is dict, "packs_not_object", input=label)
        for pack_id, pack in payload["packs"].items():
            equal(sorted(pack), sorted(PACK_KEYS), "/" + label + "/packs/" + pack_id + "/keys")
    equal(len(old["packs"]), 343, "/saved98/packCount")
    equal(list(new["packs"]), list(old["packs"]) + NEW_IDS, "/built99/orderedPackIds")
    for pack_id, pack in old["packs"].items():
        equal(new["packs"][pack_id], pack, "/built99/packs/" + pack_id)

    source98 = keyed(old["research"]["sources"], "id", "/saved98/research/sources")
    source99 = keyed(new["research"]["sources"], "id", "/built99/research/sources")
    insertion = fixture["sourceInsertionIndex"]
    require(type(insertion) is int and 0 < insertion < len(source98), "source_insertion_not_interior")
    equal(insertion, 2055, "/fixture/sourceInsertionIndex")
    expected_sources = (old["research"]["sources"][:insertion] + fixture["dataDelta"]["sources"]
                        + old["research"]["sources"][insertion:])
    equal(new["research"]["sources"], expected_sources, "/built99/research/sources")
    equal(len(source98), 2196, "/saved98/sourceCount")
    equal(len(source99), 2202, "/built99/sourceCount")
    validate_registry_references(old["packs"], source98, "/saved98/packs")
    validate_registry_references(new["packs"], source99, "/built99/packs")
    for key in ["criteria", "publication_issues"]:
        equal(new["research"][key], old["research"][key], "/built99/research/" + key)
    equal(new["art"], old["art"], "/built99/art")
    equal(new["research"]["trim_equipment"],
          old["research"]["trim_equipment"] + fixture["researchDelta"]["trim_equipment"],
          "/built99/research/trim_equipment")
    equal([r["variant_id"] for r in fixture["researchDelta"]["trim_equipment"]],
          NEW_IDS, "/fixture/trimEquipmentIds")

    picker98 = keyed(old["cars"], "id", "/saved98/cars")
    picker99 = keyed(new["cars"], "id", "/built99/cars")
    equal(list(picker98), list(old["packs"]), "/saved98/pickerIds")
    equal(list(picker99), list(picker98) + NEW_IDS, "/built99/pickerIds")
    for car_id, picker in picker98.items():
        equal(picker99[car_id], picker, "/built99/cars/" + car_id)
    for car in fixture["expectedCars"]:
        car_id = car["id"]
        expected_pack = expected_new_pack(car, fixture, old["research"]["criteria"], old["packs"])
        equal(new["packs"][car_id], expected_pack, "/built99/packs/" + car_id)
        # Only new rows use the narrowly inspected picker projection; old rows
        # are compared whole by their baseline IDs, with no schema guessing.
        expected_picker = {k: v for k, v in car.items() if k != "buyerSummary"}
        expected_picker["facts"] = {k: car["facts"][k] for k in ["price_aud", "range_km", "seats"]}
        expected_picker["issues"] = []
        equal(picker99[car_id], expected_picker, "/built99/cars/" + car_id)
        check_holds(new["packs"][car_id]["car"], "/built99/packs/" + car_id + "/car")
        check_holds(picker99[car_id], "/built99/cars/" + car_id)

    for version, payload in [("before", old), ("after", new)]:
        equal(payload["counts"], fixture["counts"][version], "/" + version + "/counts")
        equal(aggregate(payload), payload["counts"], "/" + version + "/independentAggregates")
    equal(fixture["counts"]["sources"], {"before": len(source98), "after": len(source99)}, "/sourceCounts")
    sums98, sums99 = summary_counts(old), summary_counts(new)
    sums = fixture["counts"]["summaries"]
    equal(sums98, {"total": sums["before"], "paired": sums["pairedBefore"],
                  "strengthOnly": sums["strengthOnlyBefore"], "absent": sums["absent"]}, "/saved98/summaries")
    equal(sums99, {"total": sums["after"], "paired": sums["pairedAfter"],
                  "strengthOnly": sums["strengthOnlyAfter"], "absent": sums["absent"]}, "/built99/summaries")

    market98, market99 = old["marketInventory"], new["marketInventory"]
    delta = fixture["market"]
    equal(delta["index"], 241, "/fixture/market/index")
    equal(market98["records"][delta["index"]], delta["beforeRow"], "/saved98/market/targetRow")
    equal(market98["detailedCatalogueContext"], delta["beforeContext"], "/saved98/market/context")
    expected_market = copy.deepcopy(market98)
    expected_market["records"][delta["index"]] = delta["afterRow"]
    expected_market["detailedCatalogueContext"] = delta["afterContext"]
    expected_market["sourceArtifacts"].append(delta["appendedArtifact"])
    equal(market99, expected_market, "/built99/marketInventory")
    for label, market, artifact_count in [("saved98", market98, 19), ("built99", market99, 20)]:
        equal(len(market["records"]), 242, "/" + label + "/market/recordCount")
        equal(market["counts"]["namedTrimConfigurationEntries"], 395, "/" + label + "/market/namedEntryCount")
        equal(len(market["sourceArtifacts"]), artifact_count, "/" + label + "/market/artifactCount")
        equal(market["complete"], False, "/" + label + "/market/complete")
    for key in ["rankingEligible", "completeVehicleCountEligible", "physicalStockVerified",
                "factoryOrderAcceptanceVerified"]:
        equal(market99["records"][241][key], False, "/built99/market/targetRow/" + key)
    equal(market99["records"][241]["modelYear"], None, "/built99/market/targetRow/modelYear")

    # No success output is constructed until every check above has succeeded.
    return {
        "schema": "roadmark-portable99-static-observation-v1",
        "status": "passed",
        "verificationScope": "static_actual_html_bytes_and_decoded_payload",
        "scriptSHA256": sha(Path(__file__).read_bytes()),
        "inputs": {
            "saved98": {"path": str(baseline), "sha256": sha(before_bytes), "bytes": len(before_bytes)},
            "built99": {"path": str(target), "sha256": sha(after_bytes), "bytes": len(after_bytes),
                        "expectedSHA256SuppliedExternally": expected_sha},
            "reviewedFixtureSHA256": sha(fixture_bytes), "candidateManifestSHA256": sha(manifest_bytes),
        },
        "outsideEvData": {"byteIdentical": True,
                          "prefixBytes": len(pre99), "suffixBytes": len(post99),
                          "prefixSHA256": sha(pre99), "suffixSHA256": sha(post99)},
        "decoder": {"format": "roadmark-string-table-v1", "saved98": decode98, "built99": decode99},
        "preserved": {"wholeOldPacks": len(old["packs"]), "wholeOldPickerRows": len(picker98),
                      "oldSources": len(source98), "criteria": len(old["research"]["criteria"]),
                      "publicationIssues": len(old["research"]["publication_issues"]),
                      "trimEquipment": len(old["research"]["trim_equipment"]), "artEntries": len(old["art"])},
        "added": {"packIds": NEW_IDS, "pickerIds": NEW_IDS, "sourceIds": NEW_SOURCE_IDS,
                  "sourceInsertionIndex": insertion, "trimEquipment": 2,
                  "featureRows": 138, "newEligibilityGuardsRemainFalse": True,
                  "newPacksExactAgainstFixtureWithRetainedNovatedAuditProjection": True},
        "counts": {"before": old["counts"], "after": new["counts"]},
        "summaries": {"before": sums98, "after": sums99},
        "market": {"records": 242, "namedEntries": 395, "sourceArtifactsBefore": 19,
                   "sourceArtifactsAfter": 20, "exactFixtureDeltaOnly": True, "complete": False},
        "notVerified": ["browser_hydration", "visual_rendering", "runtime_ranking_execution",
                        "full_production_module_graph", "raw_publisher_pdf_bytes"],
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--html99", required=True, type=Path, help="Root-built actual portable HTML")
    parser.add_argument("--expected-html99-sha256", required=True,
                        help="Exact SHA256 supplied independently by the root; no built99 default exists")
    parser.add_argument("--workspace-root", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    try:
        report = verify(args)
        output = json.dumps(report, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    except VerificationFailure as exc:
        print(json.dumps({"status": "failed", **exc.detail}, ensure_ascii=False,
                         separators=(",", ":"), default=str), file=sys.stderr)
        return 1
    except Exception as exc:
        print(json.dumps({"status": "failed", "check": "unexpected_verification_error",
                          "errorType": type(exc).__name__, "error": str(exc)},
                         ensure_ascii=False, separators=(",", ":")), file=sys.stderr)
        return 1
    print(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())
