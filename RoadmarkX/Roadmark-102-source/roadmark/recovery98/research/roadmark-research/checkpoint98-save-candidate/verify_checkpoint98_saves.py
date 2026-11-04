#!/usr/bin/env python3
"""ROOT-RUN: correlate one genuine complete ordered create-helper result batch.

Offline only. Reads local identity/version xattrs already written by the current
supported helper. Does not contact Library or repeat denied metadata reads.
Partial/uncertain batches stop; retain evidence and review before any retry.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys

PRIOR = ('roadmark-recovery/final97-review/correlated-save-receipt.json', 'bbf2421a8885f526891b7bef6dd6654f462ffdb460449da78bba571b97cb993c')
PROTECTED_EARLIER_IDS = {
    'libfile_0c2af50fad3881919851f3728b506be7',
    'libfile_1ea206b403f48191825690b9b455b21e',
    'libfile_2072ae586eb88191a3f08e3bdda2abeb',
    'libfile_27ab5129a6788191ad8ac343b706de19',
    'libfile_2cd9ab40f714819192cd6af94341abd8',
    'libfile_3d5976f913dc8191ad5078a7c37f9e71',
    'libfile_4d421f590fbc8191954f4c06a79ca634',
    'libfile_4db08d74cdf881919c71d26ae75dc26f',
    'libfile_4dcf0d7fcf488191b7d658547498bad4',
    'libfile_51b7321f2b9881918fba32743baaefdb',
    'libfile_54928bae13448191a73a50e652f309ac',
    'libfile_5db2ea332b788191ae18182ed6505cc9',
    'libfile_5f7ba4b42dec81918884b41998f95952',
    'libfile_6c04b112e8948191abbef4a6c7c0cb56',
    'libfile_79dc7785f4208191a4d31f1025c311b3',
    'libfile_8089aa3d019c8191be242847f158400b',
    'libfile_85238a65ba3c8191a33d326c66c2782d',
    'libfile_8831c2a6a158819187e606994428ed02',
    'libfile_88e02edffb3481918debbba3a4216c69',
    'libfile_8d99f8dbf3688191afd4abf1e501a8d8',
    'libfile_8e2b0cfb395c819188950e493311bd14',
    'libfile_8f6cc6ed4ca08191864212ab3f55f4e8',
    'libfile_9620921dd9648191b6da2a70dda71ea8',
    'libfile_9c3c3c5746c48191866174412f1311e2',
    'libfile_a1dbfd71d6c4819181c337efc5acc641',
    'libfile_ac54bb7148388191a7c60cb486f83384',
    'libfile_bc094b5c14d48191be4393d5195876f5',
    'libfile_ca2df87cb9088191bbeb0d487d2c5bef',
    'libfile_cf8908bb98688191a615333a425c9474',
    'libfile_d5f1a4f2c99c8191b0d4a51fc3170dd4',
    'libfile_d824bfda103c8191a1d665e289931632',
    'libfile_fb159411750c8191b16edb10fd69e5c1',
}


def need(ok, message):
    if not ok:
        raise ValueError(message)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def load(raw):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            need(key not in result, 'Duplicate JSON key')
            result[key] = value
        return result
    return json.loads(raw, object_pairs_hook=unique)


def local(root, relative):
    need(type(relative) is str and relative and not Path(relative).is_absolute() and '\\' not in relative and all(x not in {'', '.', '..'} for x in relative.split('/')), 'Unsafe relative path')
    path = root
    for part in relative.split('/'):
        path /= part
        need(not path.is_symlink(), 'Symlink rejected')
    return path


def pinned(root, path, digest):
    raw = local(root, path).read_bytes()
    need(re.fullmatch('[0-9a-f]{64}', digest) and sha(raw) == digest, 'Local evidence pin differs: ' + path)
    return raw


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for field in ('workspace', 'archive-directory', 'plan-sha256', 'request-sha256', 'actual-results', 'actual-results-sha256', 'output'):
        parser.add_argument('--' + field, required=True)
    args = parser.parse_args()
    root = Path(args.workspace).resolve()
    directory = local(root, args.archive_directory)
    plan = load(pinned(directory, 'upload-plan.json', args.plan_sha256))
    request = load(pinned(directory, 'library-create-request.json', args.request_sha256))
    actual_raw = pinned(root, args.actual_results, args.actual_results_sha256)
    actual = load(actual_raw)
    prior = load(pinned(root, *PRIOR))
    need(plan['schemaVersion'] == 'roadmark98.upload-plan.v1' and plan['applicationCheckpoint'] == 98 and plan['status'] == 'local_archives_verified_not_uploaded' and plan['allLibraryItemsNewCreates'] is True and plan['immutable97FallbackRetained'] is True and plan['releaseApproved'] is False, 'Wrong upload plan')
    need(plan['sourcePartsAlwaysProvidedForChat'] is True and plan['localUploadPolicyBytes'] == 32 * 1024 * 1024 and plan['genericHelperSizeCapVerified'] is False, 'Wrong transport/local policy')
    need(prior['librarySavesComplete'] is True and prior['applicationCheckpoint'] == 97, 'Prior97 saved fallback missing')
    actual97_ids = {row['library_file_id'] for row in prior['saved']}
    need(len(PROTECTED_EARLIER_IDS) == 32 and len(actual97_ids) == 6 and PROTECTED_EARLIER_IDS.isdisjoint(actual97_ids), 'Incomplete prior identity protection')
    forbidden = PROTECTED_EARLIER_IDS | actual97_ids
    full = plan['fullSourceArchive']
    raw = local(directory, full['filename']).read_bytes()
    need(full['filename'] == 'Roadmark-recovered-98-source.zip' and full['chatDelivery'] is False and len(raw) == full['bytes'] and sha(raw) == full['sha256'], 'Full source differs')
    need(plan['fullSourceLibrarySaveRequested'] is (full['bytes'] < plan['localUploadPolicyBytes']), 'Optional monolith threshold differs')
    test_ref = plan['joinerSelfTest']
    test = load(pinned(directory, test_ref['path'], test_ref['sha256']))
    need(test['schemaVersion'] == 'roadmark98.kit-self-test.v1' and test['exitCode'] == 0 and test['exactBytesReassembled'] is True and test['applicationExecuted'] is False, 'Actual shipped joiner test missing')
    need(test['result']['sha256'] == full['sha256'] and test['result']['bytes'] == full['bytes'] and test['result']['pairId'] == plan['pairId'] and test['shippedJoinerSHA256'] == plan['joinerSHA256'], 'Reconstruction identity differs')
    planned = plan['uploads']
    parts = [row for row in planned if row['role'] == 'source_part']
    expected_roles = ['source_part'] * len(parts) + ['source_recovery_kit', 'preview', 'research'] + (['source'] if plan['fullSourceLibrarySaveRequested'] else [])
    need(parts and [row['role'] for row in planned] == expected_roles, 'Wrong save/delivery order')
    need(len(planned) == len(request['uploads']) == len(actual['results']), 'Partial/missing/extra results; retain actual evidence and stop')
    need(all(row['operation'] == 'create' and row['chatDelivery'] is (row['role'] != 'source') and 0 < row['bytes'] < plan['localUploadPolicyBytes'] for row in planned), 'Unsafe save role/size')
    ids, filenames, saved = set(), set(), []
    for index, (row, requested, returned) in enumerate(zip(planned, request['uploads'], actual['results'])):
        path = local(directory, row['filename'])
        need(path.name == row['filename'] and row['filename'] not in filenames, 'Duplicate/unsafe artifact name')
        filenames.add(row['filename'])
        need(requested == {'local_path': str(path), 'purpose': 'create_library_file', 'library_artifact_type': 'other'}, 'Actual ordered request differs or targets existing identity')
        need(returned['local_path'] == str(path) and returned.get('purpose') == 'create_library_file' and returned.get('status') == 'succeeded' and returned.get('local_metadata_applied') is True and not returned.get('error') and returned.get('isError') is not True, 'Actual helper item not a successful create')
        raw = path.read_bytes()
        need(len(raw) == row['bytes'] and sha(raw) == row['sha256'], 'Artifact changed after packaging')
        identity, version, backing = returned['library_file_id'], returned['current_version_number'], returned['file_id']
        need(type(identity) is str and identity.startswith('libfile_') and identity not in ids | forbidden and type(version) is int and version == 0 and type(backing) is str and backing.startswith('file_'), 'Invalid/reused create identity')
        need(returned['file_name'] == row['filename'], 'Service renamed file: retain result and review a narrow correlation adaptation')
        local_id = os.getxattr(path, 'user.library-file-id').decode()
        local_version = os.getxattr(path, 'user.library-file-version').decode()
        need(local_id == identity and local_version == str(version), 'Actual helper identity/version not persisted')
        sizes = {key: returned[key] for key in ('file_size_bytes', 'file_size', 'size_bytes') if key in returned}
        need(all(type(value) is int and value == row['bytes'] for value in sizes.values()), 'Real returned size differs')
        ids.add(identity)
        saved.append({'helperItemIndex': index, 'localFilename': row['filename'], 'file_name': returned['file_name'], 'path': returned.get('path'), 'library_file_id': identity, 'file_id': backing, 'current_version_number': version, 'role': row['role'], 'chatDeliveryRequested': row['chatDelivery'], 'localSHA256': sha(raw), 'localBytes': len(raw), 'localIdentityXattrs': {'user.library-file-id': local_id, 'user.library-file-version': local_version}, 'actualReturnedByteSizes': sizes, 'serverByteSizeReported': bool(sizes)})
    receipt = {'schemaVersion': 'roadmark98.correlated-save-receipt.v1', 'applicationCheckpoint': 98, 'status': 'actual_create_helper_results_and_local_xattrs_correlated', 'pairId': plan['pairId'], 'uploadPlanSHA256': args.plan_sha256, 'requestSHA256': args.request_sha256, 'actualHelperResults': {'path': args.actual_results, 'sha256': args.actual_results_sha256, 'bytes': len(actual_raw)}, 'librarySavesComplete': True, 'saved': saved, 'chatDeliveryComplete': False, 'independentServerByteVerificationPerformed': False, 'deniedMetadataReadsRetried': False, 'releaseApproved': False}
    output = local(root, args.output)
    need(output.parent.is_dir() and not output.exists() and not output.resolve().is_relative_to(root / 'roadmark-work'), 'Use a new external receipt path')
    with output.open('x', encoding='utf-8') as target:
        json.dump(receipt, target, indent=2, sort_keys=True)
        target.write('\n')
    print(json.dumps({'status': receipt['status'], 'savedArtifacts': len(saved), 'receipt': str(output), 'chatDeliveryStillRequiresActualSendResults': True}))


if __name__ == '__main__':
    try:
        main()
    except Exception as exc:
        print('STOP: ' + str(exc), file=sys.stderr)
        sys.exit(1)
