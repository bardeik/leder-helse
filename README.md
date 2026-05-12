# Health Loop

Local-first web app for storing key health data:

- Weekly weigh-in (1x/week) + weekly review — `/check-in` page
- Weekly Check-In date navigation: current week plus up to 2 previous weeks
- Daily energy score (1–5), auto-saved on change
- Daily sleep check (yes/no + optional hours), auto-saved on change
- Workouts: Strength, Walk; with per-item delete
- Date navigation on Log Today: up to 14 days back, stops at today
- Dashboard: current week adherence (green/yellow/red), prorated to days elapsed this week, 6-week trends, next actions
- [x] Trend graphs with data point labels for weight, energy, and sleep
- Optional browser notifications (localStorage-persisted toggle)
- Settings: JSON export/import backup of all data
- Local browser data storage via IndexedDB (Dexie), no cloud required
- Locale-aware numeric inputs for weight and sleep hours
- Save confirmation toast fixed to the visible viewport on mobile

## Language

- UI language: **Norwegian (Bokmål)**
- App name shown to users: **Helseloggen**
- Auto-save toast text: **"Endringer lagret"**

## Tech Stack

- **Next.js 16.2** (App Router) + **React 19.2** + **TypeScript strict**
- **Dexie 4.4** (IndexedDB) for local persistence — DB name: `leader-health-loop`
- **Zod 4.3** for schema intent and form/domain validation
- **Vitest 4.1** for unit tests and **Playwright 1.59** for Mobile Chrome + Desktop Chrome E2E coverage

## Project Structure

- `src/domain/` — framework-agnostic types, Zod schemas, pure calculations
- `src/data/` — Dexie database (`db.ts`), repositories, backup export/import
- `src/features/logging/` — Log Today and Weekly Check-In (forms + hooks)
- `src/features/dashboard/` — adherence snapshot and trend helpers
- `src/features/settings/` — notification logic
- `src/components/` — `Nav`, `ReminderEngine`
- `src/app/` — Next.js App Router pages (`/`, `/log`, `/check-in`, `/settings`)

## Exact Commands

Step 1:Install dependencies:

```bash
npm install
```

Step 2: Run development server:

```bash
npm run dev
```

Step 3: Check and apply formatting:

```bash
npm run format:check   # report formatting issues
npm run format         # apply formatting
```

Step 4: Run lint:

```bash
npm run lint
```

Step 5: Run unit tests:

```bash
npm run test
```

Step 6: Run E2E tests across Mobile Chrome and Desktop Chrome:

```bash
npm run test:e2e
```

Step 7: Run browser error smoke check (requires app running on localhost:3000):

```bash
npm run test:browser-errors
```

Step 8: Run production build:

```bash
npm run build
```

## Verification Steps

1. Open the app at `http://localhost:3000`.
2. Go to `/log` (Logg i dag):

- Change energy or sleep — verify "Endringer lagret" appears briefly (no save button needed).
- Use `‹` / `›` navigation to go back to previous days and edit them.
- Add a workout, then delete it.

1. Go to `/check-in` and save a weekly weight.

- Use week navigation to move between current week and up to two earlier weeks.

1. Return to `/` (Oversikt) and verify:

- Adherence percent and green/yellow/red status for current week.
- Weight, energy, and sleep trend rows for recent weeks.
- Recent workouts list and "Next actions" section.

1. Go to `/settings` (Innstillinger) and verify:

- Reminder toggles are persisted across page refresh.
- Export downloads a JSON backup file.
- Import accepts a valid JSON backup and restores data.

1. Local storage check:

- Run `npm run build && npm run start` for a production build.
- Log data on `/log` and `/check-in`, then refresh.
- Verify entries remain available from local IndexedDB.

## Fly.io Deployment

This app fits Fly.io well as a small stateless web service because all user data stays in browser IndexedDB.

1. Install Fly CLI and authenticate:

```bash
fly auth login
```

1. Create the Fly app if needed:

```bash
fly apps create leader-health-loop
```

1. Review `fly.toml` and change the `app` value if your preferred name differs.

2. Deploy:

```bash
fly deploy
```

1. Open the deployed app:

```bash
fly open
```

Notes:

- The app listens on `0.0.0.0:3000` for Fly compatibility.
- Deployment uses Next.js standalone output for a smaller production image.
- No Fly volume or external database is required for the current MVP.
- HTTPS is required for reliable browser notification support.

## Built with

- [Next.js](https://nextjs.org/) — React framework (MIT)
- [React](https://react.dev/) — UI library (MIT)
- [Dexie](https://dexie.org/) — IndexedDB wrapper (Apache-2.0)
- [Zod](https://zod.dev/) — schema validation (MIT)

## License

MIT — see [LICENSE](./LICENSE) for details.

## Security and Safety Notes

- Treat AI-generated code as third-party code: review, test, and verify licenses before shipping.
- Do not add secrets, credentials, tokens, or private company/customer data.
- App is local-first by default; no server-side data collection is required.
- Next.js is kept on a patched baseline (`^16.2.6`), addressing the earlier vulnerable `<16.2.5` range.
- Backup import is user-initiated, stays local, rejects malformed JSON, and enforces a 5 MB payload limit plus 10,000-item collection limits.
- Persisted timestamps are validated against the app's canonical ISO-8601 UTC format (`YYYY-MM-DDTHH:mm:ss.sssZ`).
- Production builds serve stricter security headers and CSP than development builds.
