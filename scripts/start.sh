#!/usr/bin/env sh
set -eu

npx prisma db push
npx tsx prisma/seed.ts
exec npx next start --hostname 0.0.0.0 --port "${PORT:-3000}"
