# Leader Health Loop (6 weeks) — Repository Custom Instructions

> Purpose: help GitHub Copilot plan and implement a small, secure, offline-first app that tracks a 6-week health loop (weight, energy, sleep) plus workouts (Strength A/B, walks).

## 0) Ground rules (quality + safety)
- Treat any Copilot-generated code as *third-party code*: review carefully, run tests, and ensure licensing compatibility before merging.
- Do **not** include or paste sensitive company data, secrets, credentials, tokens, customer information, or internal confidential material into prompts, issues, or code comments.
- Prefer local-first storage. Cloud sync must be opt-in and must not require using company-internal systems.

## 1) Product scope — implementation status
The MVP is **fully implemented**. Features marked [x] are complete and working.

- [x] Weekly weigh-in (1x/week) + weekly review — `/check-in` page
- [x] Weekly Check-In date navigation — current week plus up to 2 weeks back
- [x] Daily energy score (1-5) — auto-saved on every change
- [x] Daily sleep check (yes/no + optional hours) — auto-saved on every change
- [x] Workout logging: Strength A, Strength B, Walk; individual delete actions
- [x] Date navigation on Log Today: navigate up to 14 days back, stops at today
- [x] Dashboard: current week adherence (green/yellow/red), 6-week trends, next actions, recent workouts
- [x] PWA: 100% offline via next-pwa (Workbox) build-time precaching; app shell loads without network
- [x] SW update lifecycle: startup check, long-interval polling, user-visible update banner, controlled restart
- [x] Reminders: browser notifications toggle persisted in localStorage, ReminderEngine component
- [x] Settings: export/import JSON backup of all IndexedDB data
- [x] Locale-aware numeric inputs for weight and sleep hours, with raw editing on focus and localized formatting on blur
- [x] Save confirmation toast anchored to the visible viewport via portal rendering

Not yet implemented (potential next steps):
- Push notifications (requires server-side)
- Cloud sync / multi-device

## 2) Tech stack (actual, as implemented)
- Frontend: **Next.js 16 (App Router)** + **TypeScript strict** + **React**
- UI: minimal custom CSS, no UI library. Accessible semantic HTML.
- UI language: **Norwegian (Bokmål)** for all user-facing labels and messages.
- Local storage: **Dexie 4 (IndexedDB)** — DB name: `leader-health-loop`
  - Tables: `dailyLogs (&date)`, `weeklyCheckIns (&weekStartDate)`, `workoutLogs (++id,date,dateTime,type)`
- PWA: **next-pwa 5.6.0** (Workbox); config in `next.config.ts`:
  - `dest: "public"`, `register: false`, `skipWaiting: false`
  - `public/sw.js` and `public/workbox-*.js` are **generated at build time** (gitignored — do NOT edit manually)
  - SW registration handled by `src/components/PwaRegister.tsx` (production-only guard)
- Validation: **Zod** — schemas in `src/domain/schemas.ts`
- Testing: **Vitest 4** for unit tests and **Playwright** for mobile + desktop viewport E2E checks
- Current tests include `src/domain/calc.test.ts`, `src/domain/localeNumber.test.ts`, `src/domain/validation.test.ts`, `src/features/dashboard/trends.test.ts`, `src/features/settings/notifications.test.ts`, `src/data/backup.test.ts`, `src/components/ServiceWorkerCleanup.test.tsx`, `tests/e2e/save-message-mobile.spec.ts`, `tests/e2e/dashboard-trends-mobile.spec.ts`, `tests/e2e/headers.spec.ts`

## 3) Architecture rules
- Domain logic in `/src/domain` — pure functions + types, no React, no browser APIs.
- Persistence in `/src/data` — Dexie db setup (`db.ts`) + per-entity repositories in `repositories/`.
- Pages in `/src/app` — Next.js App Router pages.
- Shared components in `/src/components`.
- Feature UI + hooks in `/src/features/<feature>/` with a `hooks/` subfolder.
- Every new feature must have: types + validation, repository methods, UI components, at least 1 unit test.

## 4) Key domain model
```ts
DailyLog:      { date: string; energy: number; sleepOk: boolean; sleepHours?: number; notes?: string }
WeeklyCheckIn: { weekStartDate: string; weightKg: number; notes?: string; adjustment?: string }
WorkoutLog:    { id?: number; dateTime: string; date: string; type: 'strengthA'|'strengthB'|'walk'; durationMin?: number; notes?: string }
WeeklyAdherence: { weekStartDate: string; energyDays: number; sleepDays: number; workouts: number; adherencePercent: number; status: 'green'|'yellow'|'red' }
WeeklyTrendPoint: { weekStartDate: string; weightKg?: number; weightDeltaKg?: number; energyAverage?: number; sleepOkCount: number }
```
> `WorkoutLog.date` (YYYY-MM-DD) is indexed for efficient per-day queries. `dateTime` is used for chronological ordering.
> For workouts logged on past dates, `dateTime` is set to `${date}T12:00:00.000Z` for stable ordering.

## 5) Implemented UX patterns (preserve these when extending)
- **Auto-save**: `/log` page saves on every field change (radio `onChange`, input `onBlur`). `/check-in` auto-saves on blur as well. No manual save button. Transient "Endringer lagret" message appears for 1800ms.
- **Date navigation** on Log Today: `useLogToday` exposes `selectedDate`, `canGoBack`, `canGoForward`, `goBack()`, `goForward()`. `MAX_PAST_DAYS = 13` (14 days including today).
- **Date navigation** on Weekly Check-In: `useWeeklyCheckIn` exposes bounded Monday-based navigation for the current week and the 2 preceding weeks.
- **Workout delete**: workouts are removed via per-item delete actions; no separate undo button is present.
- **Localized numeric editing**: weight and sleep-hours inputs accept both `.` and `,`, keep raw text while focused, and format using the user's locale on blur.
- **Save toast placement**: save confirmation is rendered through a portal to `document.body` so it stays fixed to the visible viewport on mobile while scrolling.
- **Update banner**: `PwaRegister.tsx` shows a fixed banner at the bottom when a new SW version is waiting; user clicks to restart and apply the update.
- **Safe-area padding**: `main` uses `padding-bottom: env(safe-area-inset-bottom, 0px)` for iPhone home-bar clearance. Body uses `min-height: 100svh`.

## 6) Engineering standards
- Use TypeScript strict mode.
- Prefer named exports.
- Functions should be small and testable.
- Add JSDoc for public domain functions.
- All day-level dates are ISO `YYYY-MM-DD` strings. Full timestamps are ISO-8601.
- Do not add arbitrary `console.log` statements.
- Always run `npm run lint` and `npm run test` after implementing changes.

## 7) Output expectations from Copilot
When asked to implement a feature:
1. Read the relevant existing files before writing any code.
2. Propose a short plan (list of files to touch).
3. Implement in small increments.
4. Add unit tests for any domain calculations.
5. Run `npm run lint` and `npm run test`; when UI behavior or viewport placement changes, also run `npm run test:e2e`.
