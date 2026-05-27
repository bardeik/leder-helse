# Leader Health Loop / Helseloggen

Offline-first app for a 6-week health loop.

## Current features / Nåværende funksjoner
- Weekly weigh-in and review / Ukentlig veiing og refleksjon
- Daily energy and sleep logging with auto-save / Daglig energi- og søvnlogg med autolagring
- Workouts: Strength A, Strength B, Walk / Økter: Styrke A, Styrke B, Gåtur
- Dashboard with adherence, trends, next actions, and recent workouts / Oversikt med etterlevelse, trender, neste tiltak og nylige økter
- Local JSON backup export/import / Lokal JSON-sikkerhetskopi med eksport/import
- Browser notification reminders stored locally / Nettleservarsler lagret lokalt
- Bilingual UI with Norwegian and English text / Tospråklig UI med norsk og engelsk tekst
- First-open language choice and settings switcher / Språkvalg ved første åpning og bytte i innstillinger

## Language / Språk
- Default UI language: Norwegian Bokmål / Standard språk: norsk bokmål
- Supported languages: Norwegian Bokmål and English / Støttede språk: norsk bokmål og engelsk
- Translation parity is enforced in tests so both locales stay in sync / Oversettelsesparitet håndheves i tester

## Tech stack / Teknologistack
- Next.js 16 (App Router)
- TypeScript strict
- Dexie 4 for IndexedDB
- Zod for validation
- Vitest 4 for unit tests
- Playwright for mobile and desktop E2E tests

## Project structure / Prosjektstruktur
- `src/domain/` — pure domain logic and schemas / ren domene-logikk og skjemaer
- `src/data/` — Dexie database, repositories, backup / Dexie-database, repositorier, sikkerhetskopi
- `src/features/` — feature hooks and UI / feature-hooks og UI
- `src/components/` — shared components / delte komponenter
- `src/i18n/` — shared locale data and provider / delt språkdata og provider
- `src/app/` — Next.js routes and pages / Next.js-ruter og sider

## Commands / Kommandoer
```bash
npm install
npm run dev
npm run lint
npm run test
npm run test:e2e
npm run build
```

## Verify / Verifiser
- Save energy or sleep on `/log` and confirm the toast / Lag energi eller søvn på `/log` og bekreft toasten
- Save a weekly weight on `/check-in` / Lagre ukentlig vekt på `/check-in`
- Switch language in `/settings` and confirm both locales render / Bytt språk i `/settings` og bekreft at begge språk vises
- Export/import a backup / Eksporter og importer en sikkerhetskopi

