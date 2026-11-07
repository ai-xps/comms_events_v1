#!/usr/bin/env sh
# Nightly scrape — loads secrets from .env (not crontab plaintext).
set -eu
ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
# shellcheck disable=SC1091
set -a
. "$ROOT/.env"
set +a
exec /usr/bin/npm run scrape
