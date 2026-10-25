# Cutover gate status (Tier 1)

## Done in repo (agent)

- [x] SQLite schema + CI file DB  
- [x] SQLite-safe Attend + scrape lock; WAL; health `/api/health`  
- [x] Prod `start.sh` without per-boot `db push`; refuses Postgres URLs  
- [x] Install script, systemd, Caddyfile, backup, scrape cron, disk alert  
- [x] [`deploy-ubuntu.md`](deploy-ubuntu.md) Phase 0 + chaos gate  
- [x] [`incident-card.md`](incident-card.md), [`RAILWAY-FREEZE.md`](RAILWAY-FREEZE.md)  
- [x] `npm test` + `npm run typecheck` + `npm run build` green locally  

## Waiting on humans / Oracle

- [x] Railway auto-deploy **paused** (freeze)  
- [x] Live demo still on last Postgres deploy: https://commseventsv1-production.up.railway.app  
- [x] SQLite Phase 1 committed and pushed to `experiment` (do not re-enable Railway auto-deploy until Ubuntu gate)  
- [ ] Guillaume: Phase 0 A1 VM + DNS + SSH keys (Guillaume + An)  
- [ ] Run `install-ubuntu.sh` on the box; dual backup + uptime → Telegram  
- [ ] Chaos gate ticks in [`deploy-ubuntu.md`](deploy-ubuntu.md)  
- [ ] Announce new URL; **then** stop Railway  

Do not mark community cutover complete until every chaos tick is green.
