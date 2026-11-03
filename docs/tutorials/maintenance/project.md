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

If you were not invited yet: ask the owner. Clone and push will fail until they add you.

---

## Placeholders (edit these)

| Name | What it means | Your value |
| --- | --- | --- |
| `HOST` | Web home for Git | `github.com` |
| `ORG` | **Central** team / org that owns the repo | `YOUR_ORG` |
| `REPO` | Project name under that central home | `YOUR_REPO` |
| `WORK_LINE` | Daily notebook line | `experiment` |
| `PROJECT_URL` | Full web address of the shared repo | `https://HOST/ORG/REPO` |
| `CLONE_URL` | Address used to copy the shared repo | `https://HOST/ORG/REPO.git` |

```text
PROJECT_URL = https://HOST/ORG/REPO
CLONE_URL   = https://HOST/ORG/REPO.git
```

## Example only (this Gather copy — sample fill)

`ai-xps` here is a **placeholder sample** for this demo. Replace `ORG` when your central account has another name.

| Name | Sample |
| --- | --- |
| `HOST` | `github.com` |
| `ORG` | `ai-xps` *(central home — placeholder for this demo)* |
| `REPO` | `comms_events_v1` |
| `WORK_LINE` | `experiment` |
| `PROJECT_URL` | `https://github.com/ai-xps/comms_events_v1` |
| `CLONE_URL` | `https://github.com/ai-xps/comms_events_v1.git` |

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
