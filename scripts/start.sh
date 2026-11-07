#!/usr/bin/env sh
# Production start. Schema/seed only when BOOTSTRAP=1 (first install / deliberate reset).
# Do not db push on every systemd restart (R5).
set -eu

mkdir -p prisma/data

case "${DATABASE_URL:-}" in
  postgresql:*|postgres:*)
    echo "This build expects SQLite (file:...). Got a Postgres URL." >&2
    echo "Pause Railway redeploy or point APP at Ubuntu. Refusing to start." >&2
    exit 1
    ;;
esac

if [ "${BOOTSTRAP:-0}" = "1" ]; then
  npx prisma db push
  # Demo seed refuses NODE_ENV=production unless ALLOW_DEMO_SEED=1.
  ALLOW_DEMO_SEED="${ALLOW_DEMO_SEED:-0}" npx tsx prisma/seed.ts
fi

exec npx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
