# Cutover gate status (Tier 1)

## Done in repo (agent)

- [x] SQLite schema + CI file DB  
- [x] SQLite-safe Attend + scrape lock; WAL; health `/api/health`  
- [x] Prod `start.sh` without per-boot `db push`; refuses Postgres URLs  
- [x] Install script, systemd, Caddyfile, backup, scrape cron, disk alert  
- [x] [`deploy-ubuntu.md`](deploy-ubuntu.md) Phase 0 + chaos gate  
- [x] [`incident-card.md`](incident-card.md), [`RAILWAY-FREEZE.md`](RAILWAY-FREEZE.md)  
- [x] `npm test` + `npm run typecheck` + `npm run build` green locally  
- [x] `/api/health` is a public middleware path (`24c0ec3`)  

## Waiting on humans / Oracle

- [x] Railway auto-deploy **paused** (freeze)  
- [x] Live demo still on last Postgres deploy: https://commseventsv1-production.up.railway.app  
- [x] SQLite Phase 1 committed and pushed to `experiment`  
- [x] Oracle A1 Ubuntu VM up (An tenancy) — public IP `132.145.68.166`  
- [x] SSH works for An; Guillaume key should be on instance  
- [x] Gather installed: Node 22, Caddy, systemd, seed, cron scripts  
- [x] Host iptables allow 80/443 before REJECT (OCI gotcha)  
- [x] Smoke: `http://132.145.68.166/api/health` → `{"ok":true}`; login 200  
- [x] App path: `/var/www/gather`; `APP_ORIGIN` still `http://132.145.68.166` (HTTP)  
- [x] Local nightly backup cron + scrape + disk alert (`cron` package installed)  
- [x] First backup: `backups/gather-2026-10-26.db` (+ sha256 OK)  
- [x] Chaos partial: `:3000` closed from outside; `DISK_ALERT_TEST=1` exits 1; restore side-copy `.tables` OK  
- [x] Private HTTP smoke: login API 200 as admin  
- [x] Cookie `Secure` now follows `APP_ORIGIN` https (deployed on Oracle) — HTTP IP sign-in can stick; HTTPS still preferred for announce  
- [x] An solo ops note (private store): `gather-oracle-solo-ops.md` — domain / Uptime / Pi blanks  

- [x] DNS hostname + Caddy HTTPS — interim free name `https://132.145.68.166.sslip.io` (Let's Encrypt; `APP_ORIGIN` matches; Secure cookie on). Swap to owned domain later if wanted.  
- [ ] Dual backup **off-box** (OCI Object Storage + Pi `scp`) — local only until targets exist  
- [ ] Uptime → Telegram on health URL (needs HTTPS URL + checker account)  
- [ ] Chaos remaining: stop→Telegram alert; Attend on HTTPS; announce text  
- [ ] Rotate/disable stock seed admin after real import  
- [ ] Announce new URL; **then** stop Railway  

Do not mark community cutover complete until every chaos tick is green.
