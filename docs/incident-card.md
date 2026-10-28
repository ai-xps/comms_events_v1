# Gather incident card (Oracle / Pi)

**On-call:** Guillaume primary · An backup  
**Live until cutover:** Railway https://commseventsv1-production.up.railway.app  
**Oracle (not announced):** https://132.145.68.166.sslip.io  
**Health:** `GET https://132.145.68.166.sslip.io/api/health`  
**SSH:** `ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@132.145.68.166` then `cd /var/www/gather`

## Quick path

1. `ssh gather@HOST`  
2. `systemctl status gather` → `sudo systemctl restart gather`  
3. `curl -sS https://APP_ORIGIN/api/health`  
4. `journalctl -u gather -n 100 --no-pager`  
5. Restore latest backup (OCI **or** Pi copy) → restart  
6. Host gone / reclaimed: restore DB on Pi → DNS → update `.env` `APP_ORIGIN` → restart  
7. **Before Railway stop only:** re-enable Railway and tell testers that URL  

## Do not

- Fake CPU/load to dodge Oracle reclaim  
- Run a second `next start` on the same SQLite file  
- Commit `.env` or seed passwords into git  

## Announce wording (after gate)

Demo host on Oracle Always Free. Oracle may reclaim idle free VMs. We keep a Pi backup and off-box DB copies.
