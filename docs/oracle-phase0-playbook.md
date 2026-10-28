# Oracle Phase 0 playbook (Guillaume + An)

**Who creates the VM:** Guillaume (his Always Free tenancy).  
**Who this machine can do from Cursor:** prepare An’s SSH public key, docs, install scripts. **Cannot** open Guillaume’s Oracle console or create the instance without his login + API keys.

Keep Railway frozen. Live demo stays on Postgres until the chaos gate.

---

## Issues to expect (read first)

| Issue | What you see | Fix |
| --- | --- | --- |
| **Out of host capacity** | Create instance fails | Try **other Availability Domain**, wait hours/days, retry. After **48h** still blocked → **Pi** with same `install-ubuntu.sh`. Do not pay-upgrade unless Guillaume chooses. |
| **Wrong region** | Free A1 missing | A1 Always Free must be in **home region**. |
| **SSH timeout** | `ssh` hangs | Security list missing TCP **22**; or no public IP; or wrong username (`ubuntu` for Ubuntu). |
| **Permission denied (publickey)** | SSH refuses key | Paste **both** Guillaume + An `.pub` keys at create time (or add An later via console serial / Guillaume). |
| **Ports open but site dead** | 80/443 open, app unreachable | App must listen on **127.0.0.1:3000**; Caddy proxies. Do **not** open 3000 to the internet. |
| **ufw breaks Ubuntu on OCI** | Box won’t boot after `ufw` | **Do not use ufw** on Oracle Ubuntu images. Use **iptables** (or OCI security lists only). |
| **No DNS** | Can’t get Let’s Encrypt | Need an **A record** hostname → public IP before Caddy TLS gate. |
| **Idle reclaim** | VM gone later | Real always-on Node + scrape; dual backups (OCI + Pi). No fake load. |

---

## A. An (this laptop) — before Guillaume creates

1. Have an SSH key (see below). Copy the **public** line only.  
2. Send Guillaume that public key (Telegram). Never send the private file.  
3. Agree a DNS hostname he can point (e.g. `gather.something.org`) or confirm who owns DNS.

### An public key (after generation on An’s Mac)

```bash
cat ~/.ssh/gather_oracle_ed25519.pub
```

Connect later:

```bash
ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@PUBLIC_IP
# or after DNS:
ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@gather.example.org
```

---

## B. Guillaume — console steps (robust)

### B1. Account

1. Sign in at https://cloud.oracle.com (Always Free / Free Tier).  
2. Confirm **home region**.  
3. Optional: set a **budget / email alert** so surprise paid usage is noticed.

### B2. Networking (VCN)

If you already have a working VCN from another app, reuse it. Else:

1. **Networking → Virtual Cloud Networks → Start VCN Wizard → Create VCN with Internet Connectivity**.  
2. Note the **public subnet**.  
3. **Security List** (or NSG) on that subnet — **Ingress** rules:

| Source | Protocol | Dest ports | Purpose |
| --- | --- | --- | --- |
| `0.0.0.0/0` (or your IPs `/32`) | TCP | **22** | SSH |
| `0.0.0.0/0` | TCP | **80** | HTTP → Caddy / ACME |
| `0.0.0.0/0` | TCP | **443** | HTTPS |

**Do not** add port **3000**.

Egress: default allow is fine.

### B3. Create compute (A1)

1. **Compute → Instances → Create instance**.  
2. Name: e.g. `gather-demo`.  
3. **Placement:** pick an Availability Domain. If capacity fails, try the **next AD**.  
4. **Image:** Canonical **Ubuntu** 22.04 or 24.04 (Always Free eligible).  
5. **Shape:** Change shape → **Ampere** → `VM.Standard.A1.Flex` → **2 OCPU**, **12 GB** RAM.  
6. **Networking:** public subnet; **assign public IPv4**.  
7. **SSH keys:** paste **Guillaume’s** `.pub` **and** **An’s** `.pub` (both).  
8. Create.

**If “Out of host capacity”:** note time + AD tried → try other AD → wait → retry. Start a 48h clock; then Pi.

### B4. DNS

1. Copy **Public IP** from instance details.  
2. At your DNS host: **A record** `gather` (or chosen host) → that IP. TTL 300 is fine.  
3. Wait until `dig +short gather.example.org` returns the IP.

### B5. First SSH + host harden (Guillaume or An)

```bash
ssh -i /path/to/private_key ubuntu@PUBLIC_IP
```

On the box (safe pattern; **no ufw**):

```bash
sudo apt update
sudo apt install -y fail2ban unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades   # enable if prompted

# Optional: allow 80/443 in iptables if security list alone is not enough
# (Oracle Ubuntu often needs host rules too — check before assuming)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT || true
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT || true
sudo apt install -y iptables-persistent || true
sudo netfilter-persistent save || true
```

Confirm **3000 is not** reachable from the public internet once Gather is installed.

### B6. Hand off to install

Share with An (private channel, not git):

- Public IP  
- Hostname  
- Confirm both SSH keys work  
- That Auto-deploy on Railway stays **Off**

Then run [`scripts/install-ubuntu.sh`](../scripts/install-ubuntu.sh) per [`deploy-ubuntu.md`](deploy-ubuntu.md).

---

## C. Capacity >48h → Pi

1. Same git branch `experiment`, same install script.  
2. Cloudflare Tunnel if no public IP.  
3. Set `APP_ORIGIN` to the tunnel HTTPS URL.  
4. Dual backup still applies (Pi can be primary; OCI optional).

---

## D. Verify before calling Phase 0 done

- [ ] `ssh ubuntu@HOST` works for Guillaume  
- [ ] `ssh -i ~/.ssh/gather_oracle_ed25519 ubuntu@HOST` works for An  
- [ ] `nc -vz HOST 22` OK; `nc -vz HOST 80` OK after Caddy; **`nc -vz HOST 3000` fails** from outside  
- [ ] DNS A record matches public IP  
- [ ] Private ops note: key paths, OCI console login owner, Pi plan  

---

## Telegram draft (An → Guillaume)

Hey, for Gather free host we need an Oracle Always Free A1 Ubuntu box when you can. Shape 2 OCPU and 12 GB, Ubuntu. Open only 22, 80, 443 (not 3000). Please paste my SSH public key as well as yours when you create it. If capacity errors keep blocking for more than a couple of days we fall back to the Pi with the same install script. Ill send my .pub in the next message. Thanks, happy to chat.
