#!/usr/bin/env sh
# Install Gather on Ubuntu for Oracle/Pi. Run as the deploy user (not root for npm start).
set -eu

ROOT="$(CDPATH= cd -- "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ "$(id -u)" = "0" ]; then
  echo "Refusing to install as root. Use the deploy user (e.g. gather)." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "Node not found. Install Node 22 (NodeSource or nvm), then re-run." >&2
  exit 1
fi

NODE_MAJOR="$(node -v | sed 's/^v//;s/\..*//')"
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "Need Node 20+ (pin 22 in production). Found $(node -v)." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "Copy .env.example to .env, set secrets and APP_ORIGIN, chmod 600 .env, then re-run." >&2
  exit 1
fi

mkdir -p prisma/data backups
chmod 600 .env || true

echo "npm ci…"
npm ci

echo "prisma generate + db push…"
npx prisma generate
npx prisma db push

echo "build…"
npm run build

echo ""
echo "Next steps:"
echo "  1. BOOTSTRAP=1 npm start   # once if you need seed; Ctrl+C after healthy"
echo "     or: npm run db:seed"
echo "  2. sudo cp deploy/gather.service /etc/systemd/system/"
echo "     (edit User/WorkingDirectory/EnvironmentFile if needed)"
echo "  3. sudo cp deploy/Caddyfile /etc/caddy/Caddyfile  # set hostname"
echo "  4. sudo systemctl daemon-reload && sudo systemctl enable --now gather caddy"
echo "  5. Install cron: scripts/scrape-cron.sh, scripts/backup-sqlite.sh, scripts/disk-alert.sh"
echo "  6. Point uptime at https://YOUR_HOST/api/health"
echo ""
echo "Single writer only. Do not start a second next process on this DB."
