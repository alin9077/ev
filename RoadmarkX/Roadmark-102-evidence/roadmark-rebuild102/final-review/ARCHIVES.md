# Checkpoint 102 source and preview archive review

Both final archives pass independent CRC, safe-path, duplicate-name, ZIP-member and manifest hash/size checks.

- Roadmark-102-source.zip: 49,135,311 bytes, 2,823 members. SHA-256 13a9c0f32f7a35839fde6377d33c873770e7b9aadee76d7b27f8db60fa9ff09d
- Roadmark-102-portable-preview.zip: 16,435,592 bytes, 6 members. SHA-256 a733b6778701d48f2231ffcd0d012cf9268cf49f3e11bddc6b8330539cb38d5b

The source ZIP contains all 2,820 final frozen QA inputs with exact hashes, the original guarded historical CHECKPOINT-SOURCE-MANIFEST.json, current package instructions and the current source package manifest. It includes package.json and pnpm-lock.yaml. No predecessor patch chain is needed. Dependencies, build output, VCS data, private queue and environment files are absent.

The preview manifest names the exact source archive above with matching hash, size and member count. Its four HTML aliases exactly match the live generated files and the QA producer observations: 37,037,396 bytes each, SHA-256 97e5186cacce6062d8e7c088f7c36f9cc71fe4f79a36807a7ee7cb2b7877652c. Both packages use the roadmark/ root, with no source/alias name collisions when merged. Root instructions distinguish editable source, generated preview, current package authority and historical checkpoint metadata.

Every archive member was decompressed and hashed in memory. This establishes a complete byte-exact source/preview restoration set. It is not a cold-install/re-execution test, dependency audit, filesystem extraction test, direct file:// test, or release approval.

The final evidence ZIP is to contain these reviews and the corresponding execution/proof/browser/research records. Its complete archive hash belongs in a separate final receipt; embedding its own final hash would be circular.
