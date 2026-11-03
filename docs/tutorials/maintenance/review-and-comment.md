# Comment and review work

Picture: the pull request page is the **kitchen table**. The code change is the dish. Comments are sticky notes on the plate. A review is saying “ready to serve” or “needs a tweak.”

You need the [project card](project.md) filled (`PROJECT_URL`, `WORK_LINE`).

- Sign in to GitHub as **yourself**.  
- Open the pull request on the **central** repo (`PROJECT_URL`) — not a private fork unless the team said so.  
- Work in **Cursor** as you. Comment and review on that central web page. Your name appears on every note.

---

## Open the right page

**What.** Find the letter that asks for a check.

**Do this**

1. Open `PROJECT_URL` in the browser (from [project.md](project.md)).  
2. Click **Pull requests**.  
3. Open the one you are reviewing (or that you opened for your own work).  
4. Read the **Summary** and **Test plan** at the top.

**Paste this into Cursor** (optional helper)

```
Open the linked pull request summary. In five short bullets, what changed and what should a reviewer check? Do not edit files yet.
```

**Done when.** You can see the list of changed files on that page.

**If it fails.** No pull request → the author must push and open one onto `WORK_LINE` first ([from-scratch.md](from-scratch.md) chapter F).

---

## Read the change (review the code)

**What.** Taste the dish before you comment.

**Do this**

1. On the pull request, open the **Files changed** tab.  
2. Skim each file. Ask: does this match the Summary?  
3. On your laptop (optional but good):

```bash
git checkout WORK_LINE
git pull --ff-only origin WORK_LINE
npm test
npm run typecheck
```

(Replace `WORK_LINE` with the value from [project.md](project.md), usually `experiment`.)

4. If the change is visual: open the app locally and click through the screens named in the Test plan.

**Paste this into Cursor**

```
Review this pull request’s diff in plain words. List risks for login, export, or real member data. Do not commit. Do not approve for me.
```

**Done when.** You know what changed and whether tests were asked for.

**If it fails.** Diff too big → ask the author to split. Secrets or `.env` in the diff → **request changes** and stop.

---

## Leave a comment

**What.** Stick a note on one line or on the whole letter.

**Do this**

1. Stay on **Files changed**.  
2. Hover a line → click the **+** (add comment).  
3. Write one clear note (what is wrong or what is good).  
4. Choose:  
   - **Add single comment** — one note now  
   - **Start a review** — collect notes, then send together  
5. For a whole-letter note: **Conversation** tab → comment box at the bottom → **Comment**.

Be kind and specific. Point at the line. Suggest a fix when you can.

**Paste this into Cursor**

```
Help me draft one short pull-request comment for this issue: [paste]. No jargon. One ask.
```

**Done when.** Your note is visible on the pull request.

**If it fails.** Cannot comment → you need write or comment access; ask the owner to add you.

---

## Finish a review (approve or ask for changes)

**What.** Sign the kitchen slip.

**Do this**

1. On the pull request: **Review changes** (or **Finish your review**).  
2. Pick one:  
   - **Comment** — notes only, no pass/fail  
   - **Approve** — good to merge when the team is ready  
   - **Request changes** — must fix before merge  
3. Submit.

Authors: reply on the thread, push fixes, then ask for another look.

**Paste this into Cursor**

```
Draft a short review body: either approve with one praise, or request changes with a numbered list. Wait for me to paste it myself.
```

**Done when.** The pull request shows your review state.

**If it fails.** Only “Comment” available → that is fine for day one; an owner can still merge.

---

## Reply when someone commented on your work

**What.** Answer the sticky notes on your dish.

**Do this**

1. Open your pull request → **Conversation**.  
2. Fix the code in Cursor if needed → save → share (commit + push).  
3. On each thread: reply what you did, or ask a question.  
4. Re-request review if the tool offers it.

**Done when.** Open threads are answered and new commits appear on the pull request.

**If it fails.** Push did not show up → confirm you pushed the same branch named on the pull request.

---

## Never on a review

- Do not paste passwords, `.env`, or real member data into comments.  
- Do not approve if you did not look at **Files changed**.  
- Do not merge to `main` unless a human owner asked. Daily merges target `WORK_LINE` (`experiment`).
