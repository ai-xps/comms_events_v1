# Project card (fill this once)

Picture: one **address book entry** for the whole team. Every other lesson reads from here.

## How accounts work (read this first)

Two different things — do not mix them up:

| | What it is | Picture |
| --- | --- | --- |
| **Your GitHub login** | The account **you** created for yourself | Your own house key. You sign in as you. Comments and reviews show **your** name. |
| **Central GitHub home (`ORG`)** | The shared place that **owns** the Gather notebook (`REPO`) | The community noticeboard. Everyone clips notes onto **this** board — not onto private boards. |

**Rules**

1. Everyone uses **their own** GitHub account (never share passwords).  
2. An owner **invites** each person to the central home (`ORG` / `REPO`) so they can copy, push, and open pull requests there.  
3. All day-to-day changes go through that **one** central repo (`PROJECT_URL`). Do not invent a second “main” copy for the team.  
4. Cursor signs in as **you**. The remote address still points at the **central** `CLONE_URL`.  
5. **Never** put the central account password, recovery codes, or private keys into git, a pull request, a comment, a film, Cursor chat, or tutorial docs. Owners sign in themselves in a private browser.

If you were not invited yet: ask the owner. Clone and push will fail until they add you.

---

## Placeholders (edit these)

| Name | What it means | Your value |
| --- | --- | --- |
| `HOST` | Web home for Git | `github.com` |
| `ORG` | **Central** team / org that owns the repo | `heaventech1984` *(target central home for the demo move)* |
| `REPO` | Project name under that central home | `comms_events_v1` |
| `WORK_LINE` | Daily notebook line | `experiment` |
| `PROJECT_URL` | Full web address of the shared repo | `https://github.com/heaventech1984/comms_events_v1` *(after transfer)* |
| `CLONE_URL` | Address used to copy the shared repo | `https://github.com/heaventech1984/comms_events_v1.git` *(after transfer)* |

```text
PROJECT_URL = https://github.com/heaventech1984/comms_events_v1
CLONE_URL   = https://github.com/heaventech1984/comms_events_v1.git
```

Until the move finishes, clones and the live remote may still point at the **old** shelf below. Update laptop remotes after GitHub shows the new home.

---

## Current shelf vs target shelf

| | Old (still live until move) | Target (Guillaume’s central home) |
| --- | --- | --- |
| `ORG` | `ai-xps` | `heaventech1984` |
| `REPO` | `comms_events_v1` | `comms_events_v1` (same name, new owner) |
| `PROJECT_URL` | `https://github.com/ai-xps/comms_events_v1` | `https://github.com/heaventech1984/comms_events_v1` |

**Owner contact for the central home:** Guillaume — GitHub user `heaventech1984` (Gmail used to create that account stays with Guillaume; do not paste passwords here).

---

## Move checklist (demo: `ai-xps` → `heaventech1984`)

Do this as humans on GitHub. Agents do **not** log into the central account for you.

1. Guillaume signs into GitHub as **`heaventech1984`** in a **private** browser window (password only on his machine — change it if it was ever sent on Telegram or chat).  
2. Confirm https://github.com/heaventech1984 opens while signed in.  
3. On the **current** owner account for `ai-xps/comms_events_v1`: **Settings → General → Danger Zone → Transfer ownership** → transfer to `heaventech1984` (or create a fresh mirror under that user if transfer is blocked — owner chooses).  
4. After GitHub shows `heaventech1984/comms_events_v1`, invite each person’s **own** GitHub username (Collaborators / People).  
5. On each laptop:

```bash
git remote -v
git remote set-url origin https://github.com/heaventech1984/comms_events_v1.git
git fetch origin
git status
```

6. Update any docs that still hard-code `ai-xps` (deploy notes, stakeholder checklist) once the move is confirmed.  
7. Oracle / CI remotes: only after the shelf URL is stable — owner pulls from the new `origin`.

**Done when.** Browser opens `PROJECT_URL` under `heaventech1984`, collaborators can push to `experiment`, and no password appears in this repo.

---

## Example only (old Gather copy — historical sample)

`ai-xps` was the **previous** demo shelf. Prefer the filled table above after the move.

| Name | Old sample |
| --- | --- |
| `HOST` | `github.com` |
| `ORG` | `ai-xps` |
| `REPO` | `comms_events_v1` |
| `WORK_LINE` | `experiment` |
| `PROJECT_URL` | `https://github.com/ai-xps/comms_events_v1` |
| `CLONE_URL` | `https://github.com/ai-xps/comms_events_v1.git` |

---

## Owner checklist (invite people)

1. Open `PROJECT_URL` while signed into the **central** owner account (or an org admin).  
2. **Settings → Collaborators** (or org **People**) → invite each person’s **own** GitHub username.  
3. They accept the email/invite while signed in as **themselves**.  
4. They clone `CLONE_URL` and push to that same remote — still as themselves.

## Central door (use every day)

1. Sign in to GitHub as **you**.  
2. Open `PROJECT_URL` (the central repo).  
3. Open the same folder in **Cursor** (File → Open Folder).  
4. Work on `WORK_LINE` (`experiment`).  
5. Comments and reviews: pull request pages on that same `PROJECT_URL` — [review-and-comment.md](review-and-comment.md).

## Who can change this card?

Project owner (An / Guillaume or the central-home admin). Everyone else only **reads** the filled values.
