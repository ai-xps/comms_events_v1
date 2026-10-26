# Deploy Gather on Oracle Always Free (Ubuntu + Caddy + SQLite)

**Tier 1 hardened.** Railway stays live until the chaos gate below is all green. Do not announce a new URL early.

**Also:** do not deploy a SQLite-only build to Railway while its `DATABASE_URL` is still Postgres — `scripts/start.sh` refuses Postgres URLs. Pause Railway redeploys (or keep Railway on the last Postgres commit) until Ubuntu is ready. See [`RAILWAY-FREEZE.md`](RAILWAY-FREEZE.md). Incident card: [`incident-card.md`](incident-card.md).

A **SQLite** database is one file on disk (like a notebook). No Postgres on this path.

```bash
DATABASE_URL="file:./data/gather.db"
```

(Path relative to `prisma/` → `prisma/data/gather.db`.)

**Single writer:** one systemd `gather` unit only. Never run two `next start` processes against the same `.db` file.

---

## Phase 0 — Oracle box (Guillaume)

**Full click-path + troubleshooting:** [`oracle-phase0-playbook.md`](oracle-phase0-playbook.md).

Checklist for Always Free A1. An gets a second SSH key (bus factor).

1. [ ] Always Free tenancy in home region; billing alert if the account can leave free  
2. [ ] VCN + public subnet; security list / NSG: **22, 80, 443** only; **3000 closed**  
3. [ ] VM: `VM.Standard.A1.Flex`, **2 OCPU / 12 GB**, Ubuntu  
4. [ ] Capacity fail → other AD → wait → retry. If blocked **>48h** → Phase 0b Pi as primary  
5. [ ] Public IP + **DNS A record** hostname (needed for Caddy TLS before gate)  
6. [ ] SSH **keys only**; keys for **Guillaume + An**  
7. [ ] `unattended-upgrades` + fail2ban on sshd (**do not use `ufw`** on OCI Ubuntu — can break boot; use iptables if needed)  
8. [ ] Private ops note (not in git): key inventory, OCI console break-glass  

### Capacity playbook

- Error `Out of host capacity` is common on free A1.  
- Retry another availability domain, wait hours, retry.  
- Do not upgrade to paid just to clear capacity unless Guillaume explicitly chooses that.  
- After 48 hours still blocked → install on Pi (Phase 0b) with the same scripts.

### Phase 0b — Pi cold standby

- Same [`scripts/install-ubuntu.sh`](../scripts/install-ubuntu.sh); Cloudflare Tunnel if no public IP.  
- Receives nightly DB copies (`scp`/`rsync`).  
- Not announced until failover.

### Idle reclaim (honest)

Oracle may reclaim Always Free A1 if CPU, network, **and** memory stay under 20% for 7 days. Mitigation: keep Gather running + nightly scrape. **Do not** fake load (ToS). Dual off-box backups survive reclaim.

---

## Gate — ready to move (tick all, then move)

### Hardened smoke

1. [ ] SQLite Phase 1 on `experiment`, CI green  
2. [ ] App running on Ubuntu via systemd  
3. [ ] Public **HTTPS** URL loads Gather login; admin sign-in works  
4. [ ] Seed or import loaded; member **Attend** works once  
5. [ ] `APP_ORIGIN` matches that exact URL (no trailing slash)  
6. [ ] Becca/Guillaume know the **new URL** (and that Railway will stop)  
7. [ ] TLS works; dual backup cron exists; backup age &lt;26h  

### Chaos extras (must pass once)

8. [ ] `systemctl stop gather` → uptime alert fires  
9. [ ] Restore drill: side-path restore, login once, revert prod file  
10. [ ] From outside: `curl` to `PUBLIC_IP:3000` **fails**  
11. [ ] Disk alert script non-zero in test mode  
12. [ ] Concurrent Attend test (CI/unit) does not overbook capacity  
13. [ ] Announce text includes: demo host; Oracle may reclaim; Pi backup exists  
14. [ ] Incident card filled; Guillaume primary on-call, An backup  
15. [ ] After import: stock seed admin rotated or disabled if still present  

**Then** update README / Canva / checklist to the Ubuntu URL, and **only then** stop Railway.

Any box unchecked → **stay on Railway**.

---

## What you need before a seamless move

### 1. SSH + on-call

- `ssh gather@host` (or cloud console).  
- Name Guillaume primary, An backup for demo mornings.

### 2. Public URL

- Prefer `https://gather.yourdomain.org`.  
- IP-only HTTP is fine for private smoke, not for community announce.

### 3. Node 22, disk, HTTPS, reboot

```bash
node -v   # need v20+ (install script pins 22)
```

- A few GB free for clone + `node_modules` + build + DB.  
- Caddy for TLS.  
- systemd so Gather starts after reboot.  
- Firewall: 22, 80, 443; port 3000 localhost only.

### 4. Secrets in `.env` (never commit)

| Variable | Meaning | Example |
| --- | --- | --- |
| `DATABASE_URL` | SQLite file | `file:./data/gather.db` |
| `SESSION_SECRET` | Cookie signing | `openssl rand -hex 32` |
| `CRON_SECRET` | Nightly scrape auth | another `openssl rand -hex 32` |
| `APP_ORIGIN` | Exact public URL | `https://gather.example.org` |
| `NODE_ENV` | Production | `production` |

`chmod 600 .env`. `APP_ORIGIN` must match the browser address bar exactly.

### 5. Data choice (default: fresh)

- Empty DB → bootstrap seed and/or Guillaume’s member import CSV.  
- Railway bookings are **not** copied automatically.

---

## Install (preferred: script)

As the deploy user (not root for `npm start`):

```bash
sudo apt update
# Node 22, Caddy, git, ufw helpers — or let the script guide you
cd /var/www   # or /home/gather
sudo mkdir -p gather && sudo chown "$USER:$USER" gather
cd gather
git clone -b experiment https://github.com/ai-xps/comms_events_v1.git .
cp .env.example .env
# Edit .env: secrets + APP_ORIGIN=https://your-host
chmod 600 .env

./scripts/install-ubuntu.sh
# First bootstrap:
BOOTSTRAP=1 npm start   # once, or: npx prisma db push && npm run db:seed
sudo systemctl enable --now gather caddy
```

Manual equivalent: `npm ci` → `npx prisma generate` → `npx prisma db push` → `npm run build` → systemd + Caddyfile from `deploy/`.

Smoke on the box:

```bash
curl -sS http://127.0.0.1:3000/api/health
curl -sS -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/login
```

---

## systemd

Unit template: [`deploy/gather.service`](../deploy/gather.service).

```bash
sudo cp deploy/gather.service /etc/systemd/system/gather.service
# Edit WorkingDirectory / User / EnvironmentFile if paths differ
sudo systemctl daemon-reload
sudo systemctl enable --now gather
sudo systemctl status gather
```

`npm start` → `scripts/start.sh` (no per-boot `db push` unless `BOOTSTRAP=1`).

---

## Caddy + TLS

Template: [`deploy/Caddyfile`](../deploy/Caddyfile).

- Proxy to `127.0.0.1:3000`.  
- Automatic HTTPS for the DNS hostname.  
- fail2ban on sshd; optional Caddy rate-limit plugin for login.  
- Do not put secrets in the Caddyfile.

```bash
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
# Set your hostname
sudo systemctl reload caddy
```

---

## Cron scraper (05:00 Europe/London)

Prefer timezone Europe/London on the host, or document UTC offset.

```cron
0 5 * * * /var/www/gather/scripts/scrape-cron.sh
```

`scrape-cron.sh` loads `.env` so `CRON_SECRET` is not duplicated in crontab.

---

## Dual backup (OCI + Pi)

Scripts: [`scripts/backup-sqlite.sh`](../scripts/backup-sqlite.sh).

- Nightly copy of `prisma/data/gather.db` (+ sha256).  
- Retain ≥7 days.  
- Target A: OCI Object Storage Always Free (or Guillaume’s off-box).  
- Target B: **Pi** via `scp`/`rsync` (survives Oracle tenancy loss).  

Restore drill (chaos gate):

```bash
systemctl stop gather
cp /backups/gather-YYYY-MM-DD.db /tmp/gather-restore-test.db
# Point a one-off process at the side file, or sqlite3 .tables
# Confirm login against restored copy if booting side-by-side
# Put prod file back, systemctl start gather
```

---

## Disk alert

[`scripts/disk-alert.sh`](../scripts/disk-alert.sh) — exit non-zero if root filesystem &gt;80%. Cron hourly. `DISK_ALERT_TEST=1` forces failure for chaos gate.

---

## Observability

- Uptime check: `GET https://hostname/api/health` → Telegram (Uptime Kuma on Pi or free checker).  
- Logs: `journalctl -u gather -f`  
- Optional: weekly note of memory use (reclaim awareness). No fake load.

---

## Incident card (one page)

1. `systemctl status gather` / `restart gather`  
2. `curl -sS https://APP_ORIGIN/api/health`  
3. `journalctl -u gather -n 100`  
4. Restore latest dual backup → restart  
5. If host gone: restore on Pi → update DNS → set `APP_ORIGIN` → restart  
6. Pre-cutover only: turn Railway back on and point testers there  

On-call: Guillaume primary, An backup.

---

## After gate is green

1. Update README live link, Canva brief, stakeholder checklist.  
2. Tell testers the new URL + demo/reclaim wording.  
3. **Then** stop or pause the Railway project.

Until then: **Railway remains the live demo.**

---

## Red-team residual (accepted)

Single primary VM; capacity lottery; Oracle policy changes; cold Pi failover (minutes–hour); humans ignoring Telegram; both Oracle and Pi dying leaves only older copies. Not NHS production hosting.
