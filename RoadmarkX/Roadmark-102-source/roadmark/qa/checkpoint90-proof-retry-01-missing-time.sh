#!/bin/bash
set -euo pipefail
cd /workspace/scratch/586427eef9f2/roadmark-work/roadmark
trap 'status=$?; printf "{\"checkpoint\":90,\"stage\":\"emitted-artifact-proof-only\",\"exitCode\":%s,\"heapMiB\":1024,\"semiSpaceMiB\":8,\"finishedAtUTC\":\"%s\"}\n" "$status" "$(date -u +%FT%TZ)" > /tmp/roadmark90-proof-retry-terminal.json' EXIT
/usr/bin/time -v env NODE_OPTIONS='--max-old-space-size=1024 --max-semi-space-size=8' node --import tsx /tmp/verify_checkpoint90_portable.cjs > /tmp/roadmark90-proof-retry.log 2> /tmp/roadmark90-proof-retry-resource.log
