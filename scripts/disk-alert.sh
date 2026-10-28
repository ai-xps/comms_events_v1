#!/usr/bin/env sh
# Exit 1 if filesystem usage for TARGET exceeds THRESHOLD percent (R17).
# DISK_ALERT_TEST=1 forces failure for chaos gate.
set -eu
TARGET="${DISK_ALERT_PATH:-/}"
THRESHOLD="${DISK_ALERT_THRESHOLD:-80}"

if [ "${DISK_ALERT_TEST:-0}" = "1" ]; then
  echo "disk-alert test mode: forcing failure" >&2
  exit 1
fi

USED="$(df -P "$TARGET" | awk 'NR==2 {gsub(/%/,"",$5); print $5}')"
if [ -z "$USED" ]; then
  echo "Could not read df for $TARGET" >&2
  exit 1
fi

if [ "$USED" -ge "$THRESHOLD" ]; then
  echo "Disk ${TARGET} at ${USED}% (threshold ${THRESHOLD}%)" >&2
  exit 1
fi

echo "Disk ${TARGET} at ${USED}% OK"
