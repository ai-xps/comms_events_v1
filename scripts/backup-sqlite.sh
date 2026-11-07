#!/usr/bin/env sh
# Dual off-box backup helper: local dated copy + sha256; optional OCI/Pi upload hooks.
# Set BACKUP_DIR, optional BACKUP_SCP_TARGET (user@pi:/path/), optional BACKUP_OCI_UPLOAD_CMD.
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
DB="${ROOT}/prisma/data/gather.db"
BACKUP_DIR="${BACKUP_DIR:-${ROOT}/backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"
STAMP="$(date +%F)"
DEST="${BACKUP_DIR}/gather-${STAMP}.db"

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB" ]; then
  echo "No database at $DB" >&2
  exit 1
fi

# Consistent-enough demo copy (app may be writing; WAL checkpoint best-effort).
if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB" "PRAGMA wal_checkpoint(TRUNCATE);" || true
fi

cp "$DB" "$DEST"
sha256sum "$DEST" > "${DEST}.sha256"
echo "Wrote $DEST"

# Optional: scp to Pi (R3 — survives Oracle tenancy loss)
if [ -n "${BACKUP_SCP_TARGET:-}" ]; then
  scp "$DEST" "${DEST}.sha256" "$BACKUP_SCP_TARGET"
  echo "Copied to $BACKUP_SCP_TARGET"
fi

# Optional: custom OCI upload one-liner (oci CLI, rclone, etc.)
if [ -n "${BACKUP_OCI_UPLOAD_CMD:-}" ]; then
  sh -c "$BACKUP_OCI_UPLOAD_CMD" -- "$DEST" "${DEST}.sha256"
  echo "OCI upload command finished"
fi

# Prune local dated copies older than KEEP_DAYS
find "$BACKUP_DIR" -name 'gather-*.db' -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
find "$BACKUP_DIR" -name 'gather-*.db.sha256' -mtime +"$KEEP_DAYS" -delete 2>/dev/null || true
