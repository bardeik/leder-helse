# Leader Health Loop (6 weeks) — Repository Custom Instructions

> Purpose: help GitHub Copilot plan and implement a small, secure, offline-first app that tracks a 6‑week health loop (weight, energy, sleep) plus workouts (Strength A/B, walks).

## 0) Ground rules (quality + safety)
- Treat any Copilot-generated code as *third-party code*: review carefully, run tests, and ensure licensing compatibility before merging.
- Do **not** include or paste sensitive company data, secrets, credentials, tokens, customer information, or internal confidential material into prompts, issues, or code comments.
- Prefer local-first storage. Cloud sync must be opt-in and must not require using company-internal systems.

## 1) Product scope (MVP)
Build a **PWA web app** (mobile-friendly) that works offline and allows:
- Weekly weigh-in (1x/week) + weekly review (5 min)
- Daily energy score at 15:00 (1–5)
- Daily sleep check (yes/no + optional hours)
- Workout logging: Strength A, Strength B, Walk (20–30m)
- Dashboard: week view + trends + adherence (green/yellow/red)
- Reminders (optional): browser notifications + scheduled prompts (not hard requirement)

## 2) Tech stack (keep it simple)
- Frontend: **Next.js (App Router)** + **TypeScript** + **React**
- UI: minimal, high readability. Use accessible components.
- Local storage: **IndexedDB (Dexie)** with a small schema.
- State: React hooks + simple store (Context or Zustand). Avoid complexity.
- Validation: Zod.
- Testing: Vitest for unit tests + Playwright (optional) for E2E.

## 3) Architecture rules
- Keep domain logic in `/src/domain` (pure functions + types).
- Keep persistence in `/src/data` (Dexie, repositories).
- Keep UI in `/src/app` and `/src/components`.
- Use feature folders for UI: `/src/features/logging`, `/src/features/dashboard`, `/src/features/settings`.
- Every feature must have:
  - types + validation
  - repository methods
  - UI components
  - at least 1 unit test for core calculations

## 4) Key domain model
- `DailyLog`: date, energy(1-5), sleepOk(bool), sleepHours?(number), notes?
- `WeeklyCheckIn`: weekStartDate, weightKg(number), notes?, adjustment?
- `WorkoutLog`: dateTime, type('strengthA'|'strengthB'|'walk'), durationMin?, notes?

## 5) UX requirements
- Mobile-first, 2 taps to log.
- Default flow: open app → “Log today” → save.
- Dashboard should show:
  - current week adherence (counts)
  - 6-week trend charts (simple)
  - next actions (e.g., “Strength A tomorrow morning 07:15”)

## 6) Engineering standards
- Use TypeScript strict mode.
- Prefer named exports.
- Functions should be small and testable.
- Add JSDoc for public domain functions.
- Include `README.md` with setup + scripts.
- Include `SECURITY.md` and `PRIVACY.md`.

## 7) Output expectations from Copilot
When asked to implement a feature, Copilot should:
1. Propose a short plan (files to touch)
2. Implement incrementally (small batches)
3. Add tests for domain logic
4. Run lint/test commands and report results
