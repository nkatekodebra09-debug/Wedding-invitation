# Deploying the wedding invitation site to Render

This guide deploys the app to **Render** (free Node service) with **MongoDB Atlas** (free tier). It assumes the repo is on GitHub.

## What you'll end up with

- **Public guest URL**: `https://<your-app>.onrender.com/` — the wedding invitation.
- **Admin URL**: `https://<your-app>.onrender.com/#admin` — password-protected dashboard listing every invited guest, their RSVP status, and any walk-ins.
- Admin credentials are NOT on the guest site anywhere. They live only in:
  - this repo's `ADMIN_CREDENTIALS.txt` (gitignored, local-only), and
  - Render's environment variables (encrypted at rest).

---

## 1. MongoDB Atlas (free tier, ~10 minutes)

1. Sign up at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a **free M0 cluster** in a region close to you. Pick any cloud + region.
3. **Database Access** → Add a database user. Note the username and password (you'll need them in the connection string).
4. **Network Access** → Add IP `0.0.0.0/0` so Render can reach it (Atlas free tier doesn't have static outbound IPs).
5. **Deployment → Database** → click **Connect** → **Drivers** → **Node.js**. Copy the connection string. It looks like:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Append the database name before the `?` so it's `...mongodb.net/wedding?retryWrites=true&w=majority`.

> **Tip**: Render free instances spin down after 15 min of inactivity. Atlas M0 has 512MB — plenty for an RSVP list.

## 2. Push the repo to GitHub

If this folder isn't already a git repo:

```powershell
cd "C:\Users\nkate\OneDrive\Documents\Software Development Projects\TshepoAndSandisile'sWeddingInvitation"
git init
git add .
git commit -m "Initial wedding invitation site"
```

Create a new GitHub repo (private is fine), then:

```powershell
git remote add origin https://github.com/<your-user>/<your-repo>.git
git branch -M main
git push -u origin main
```

> `ADMIN_CREDENTIALS.txt`, `.env`, `invitees.json`, and `node_modules/` are gitignored — none of your secrets or invitee emails get pushed.

## 3. Create the Render service

1. Sign up at <https://render.com> (free).
2. **New** → **Blueprint** → point it at your GitHub repo. Render will detect `render.yaml` and prefill the config.
3. Confirm:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/healthz`
4. **Environment** tab — set these (Render auto-generates `JWT_SECRET` from the blueprint):
   - `MONGO_URI` → paste the Atlas connection string
   - `ADMIN_USER` → from `ADMIN_CREDENTIALS.txt`
   - `ADMIN_PASSWORD` → from `ADMIN_CREDENTIALS.txt`
5. Click **Deploy**. The first build takes a few minutes.

## 4. Seed the admin + invitees

After the first deploy succeeds, open the **Shell** tab in Render and run:

```bash
npm run seed:admin
npm run seed:invitees
```

- `seed:admin` bcrypt-hashes `ADMIN_PASSWORD` and stores it in the `admins` collection. It is idempotent — safe to re-run.
- `seed:invitees` reads `invitees.json` (your local pre-loaded guest list with tokens) and writes them into the `invitees` collection. **If your invitee file isn't committed (it's gitignored), you'll need to upload it to Render first** — easiest path: commit a redacted copy or upload via the Shell.

## 5. Sanity checks

- Visit `https://<your-app>.onrender.com/healthz` → `{"status":"ok",...}`
- Visit `https://<your-app>.onrender.com/` → guest invitation.
- Visit `https://<your-app>.onrender.com/#admin` → login form. Log in with the credentials in `ADMIN_CREDENTIALS.txt`. You should see the stat tiles and the full guest table with status badges.

## 6. Custom domain (optional)

In Render → **Settings** → **Custom Domains** → add `www.yourdomain.com`. Then in your registrar, point a CNAME at `your-app.onrender.com`. HTTPS is automatic.

## 7. Sharing the link with guests

The **public guest URL** is safe to share on WhatsApp, save-the-dates, etc. The `#admin` URL is what you bookmark privately — guests will never find it unless you tell them. The login form is only shown at `#admin`; every other route renders the invitation.

## Local development

```powershell
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASSWORD
npm install
npm run dev
```

App runs on http://localhost:5000. Admin at http://localhost:5000/#admin.

## Troubleshooting

- **"JWT_SECRET is not set"** → set it in `.env` (local) or the Render env vars (production).
- **"MongoDB connection failed"** → Atlas Network Access must allow `0.0.0.0/0`. The connection string must include the password (URL-encoded if it has special chars).
- **Login works but guest list is empty** → run `npm run seed:invitees` from the Render Shell.
- **Cold start delay** → Render free tier sleeps after 15 min of inactivity. The first request after a sleep takes 30–60s.

## Security notes

- Admin session JWT expires after 1 hour. The frontend stores it in `localStorage`; signing out clears it.
- Admin endpoints (`/api/admin/*` except `/login`) all go through `authMiddleware.js` which verifies the JWT.
- `JWT_SECRET` is auto-generated by Render — never reuse one between environments.
- All public routes (`/`, `/api/guests/*`, `/api/views/*`) contain no admin functionality or credentials.
