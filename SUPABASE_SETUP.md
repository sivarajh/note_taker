# Supabase + Google login setup

This app now requires signing in with Google and stores each user's notebooks in
Supabase (one JSONB blob per user). Follow these steps once to get it running.

## 1. Create a Supabase project

1. Go to <https://supabase.com>, create a project.
2. In **Settings → API**, copy the **Project URL** and the **anon / public** key.

## 2. Configure environment variables

Copy `.env.example` to `.env.local` (git-ignored) and fill in the values:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Only the **anon/public** key belongs in the client — never the service-role key.
Row Level Security (step 4) keeps each user's data private.

## 3. Enable Google sign-in

1. In the Supabase dashboard: **Authentication → Providers → Google** → enable it.
2. In the **Google Cloud Console**, create an OAuth 2.0 Client ID (type: Web application):
   - Authorized redirect URI:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Paste the Google **Client ID** and **Client Secret** back into the Supabase Google
   provider settings and save.
4. In Supabase: **Authentication → URL Configuration**, set the **Site URL** and add
   **Redirect URLs** for every environment you run, including the app's `/note_taker/`
   base path, e.g.:
   - `http://localhost:5173/note_taker/` (local dev)
   - your deployed URL (e.g. `https://<host>/note_taker/`)

## 4. Create the notes table + RLS policy

Open **SQL Editor** and run:

```sql
create table public.notes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.notes enable row level security;

create policy "Users manage own notes" on public.notes
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Each user has exactly one row; `data` holds `{ "notebooks": [...] }`. The app reads it on
login and debounce-upserts it on every change.

## 5. Run

```
npm install
npm run dev
```

Visit `http://localhost:5173/note_taker/`, sign in with Google, and your notes will sync to
Supabase. Reloading or signing in from another browser with the same account restores them.

## 6. Deploy via GitHub Actions (GitHub Pages)

Two workflows are included:

- **`.github/workflows/ci.yml`** — runs `npm ci`, `npm run lint`, and `npm run build` on every
  push and pull request (a build check).
- **`.github/workflows/deploy.yml`** — builds and publishes to GitHub Pages on push to `main`
  (or manually via **Actions → Deploy to GitHub Pages → Run workflow**).

Because Vite inlines `VITE_SUPABASE_*` **at build time**, the Actions build needs them too:

1. **Add repo secrets** — Settings → Secrets and variables → Actions → *New repository secret*:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   (The anon key is public-safe — it ships to the browser regardless — but secrets keep it out
   of the workflow YAML. Without them, the deployed site loads and then throws.)
2. **Enable Pages** — Settings → Pages → **Source: GitHub Actions**.
3. **Register the production URL for OAuth** (required or Google sign-in fails on the live
   site). The deployed URL is `https://<your-username>.github.io/note_taker/`:
   - Supabase → Authentication → URL Configuration → add it to **Redirect URLs** (and set it
     as the Site URL if this is your primary environment).
   - Google Cloud OAuth client → add it under authorized JavaScript origins / redirect as
     needed.
4. Push to `main` (or run the Deploy workflow manually) → the site builds with the Supabase
   values inlined and publishes to Pages.
