# Empire MVP

MVP web app for the Empire party game setup flow:
- Host creates a game with optional theme and host-playing toggle
- Invite code + invite link are generated
- Players join, enter display name, submit exactly one secret famous person name
- Submission requires confirmation and then moves to waiting screen
- Host dashboard shows players + submitted status
- Privacy rule enforced on backend:
  - Host playing: can view submissions anonymously (no player mapping)
  - Host not playing: can view all submissions mapped to players

## Stack
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- In-memory server store + HTTP-only cookie sessions (temporary sessions)

## Local Setup
1. Install dependencies:

```bash
npm install
```

2. Run dev server:

```bash
npm run dev
```

3. Open:

```text
http://localhost:3000
```

## How To Use
1. Home -> `Create Game`
2. Fill game name, optional theme, choose whether host is also playing
3. Share code or invite link from host dashboard
4. Players join via `/join` (or invite link), add display name
5. Players submit one famous person and confirm final submission
6. Players see waiting screen after submit
7. Host monitors joined/submitted status live (auto-refresh every 3s)

## Deploy
This app can deploy to any Node.js host that supports Next.js:

### Option A: Vercel (Root domain or subdomain)
1. Push repo to GitHub
2. Import into Vercel
3. Framework preset: Next.js
4. Deploy

### Option A2: Vercel at `jonahanderson.me/empire` (path deploy)
Set this environment variable in Vercel Project Settings before deploy:

```text
NEXT_PUBLIC_BASE_PATH=/empire
```

Then redeploy. The app will run under `/empire` and API routes under `/empire/api`.

### Option B: Render / Fly.io / Railway / VPS
1. Build:

```bash
npm run build
```

2. Start:

```bash
npm run start
```

3. Expose port `3000` (or set `PORT` env var per host requirements)

## MVP Notes
- Game/session data is temporary and kept in memory; restarting the server clears games.
- Cookie sessions persist across refreshes during session TTL (12 hours).
- For multi-instance production scaling, replace in-memory store with Redis/Postgres.

## Security/Privacy
- Submissions are stored server-side only.
- Regular players have no endpoint access to other players' submissions.
- Host dashboard endpoint is protected by host session cookie.
- When `hostPlays = true`, host dashboard response includes submissions without player identity.
