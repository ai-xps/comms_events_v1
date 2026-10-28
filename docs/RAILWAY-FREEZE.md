# Railway freeze before SQLite `experiment` push

SQLite is now the schema in this branch. Railway’s live service still expects **Postgres**.

## If login shows `pkce_cookie_missing`

Railway needs a small security cookie while GitHub hands you back. Browsers often drop it.

Try in order:

1. Open a **private/incognito** window (or another browser).  
2. Allow cookies for `railway.com` and `backboard.railway.com` (turn off blockers for those).  
3. Go to https://railway.com → Login with GitHub once, finish without switching profiles mid-flow.  
4. Still stuck: GitHub → Settings → Applications → Authorized OAuth Apps → revoke **Railway** → try Login again.

This is browser login only. It does not change Gather code.

## Before `git push` of SQLite commits to a Railway-connected branch

1. In Railway: **pause auto-deploy** on the Gather service, **or** pin the service to the last known-good **Postgres** commit.  
2. Confirm live demo still serves https://commseventsv1-production.up.railway.app  
3. Only then push SQLite `experiment` for Ubuntu/Oracle install.  
4. `scripts/start.sh` **exits 1** if `DATABASE_URL` is `postgres://` / `postgresql://` — a mistaken Railway redeploy will fail closed instead of corrupting start.

## After Ubuntu chaos gate is green

Update README / Canva / testers → **then** stop or delete the Railway project.

Until gate: Railway remains the announced demo.
