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
- Manual interval timer with adjustable activity, rest and rounds / Manuell tidtaking med justerbar aktivitet, pause og runder

## Manual timer / Manuell tidtaking
- Open `/manual-timer` from the menu. Defaults: 40 seconds activity, 20 seconds rest, 6 rounds. Duration buttons adjust by 10 seconds; round buttons adjust by one. / Åpne `/manual-timer` fra menyen. Standard: 40 sekunder aktivitet, 20 sekunder pause, 6 runder. Tidsknappene justerer med 10 sekunder; rundeknappene justerer med én.
- Each activity completes one round. There is a three-second preparation countdown and no rest after the last round. Rest may be zero. / Hver aktivitet fullfører én runde. Økten starter med tre sekunders klargjøring og avsluttes uten pause etter siste runde. Pause kan være null.
- Short beeps at three and two seconds before activity; a long beep at one second, at the start of rest, and at completion. / Korte pip tre og to sekunder før aktivitet; langt pip ett sekund før aktivitet, ved pausestart og ved fullføring.
- Validated settings are stored in localStorage, separately from IndexedDB backups. Sessions do not resume after a reload and are not automatically logged as workouts. / Validerte innstillinger lagres i localStorage, separat fra IndexedDB-sikkerhetskopier. Økter fortsetter ikke etter sideoppdatering og loggføres ikke automatisk som trening.
- Screen Wake Lock requires browser support and a secure context. It remains requested while on hold on the visible page, but the device may revoke it. Audio also depends on browser permissions. Test both on a physical device. / Skjermlås krever nettleserstøtte og sikker kontekst. Den beholdes når en synlig økt settes på vent, men enheten kan trekke den tilbake. Lyd avhenger også av nettleseren. Prøv begge på en fysisk enhet.
- Hiding the page puts the session on hold. Returning requests screen wake lock again; continue the timer manually. / Skjules siden, settes økten på vent. Ved retur forsøkes skjermlås på nytt; fortsett timeren manuelt.

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
npm run dev:turbopack
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

`npm run dev` uses webpack dev mode for stability. `npm run dev:turbopack` is available for Turbopack-specific testing.

`npm run typecheck` runs the separate TypeScript compiler without emitting files. CI requires it before tests and build; Next.js still skips its built-in type-checking. / `npm run typecheck` kjører den separate TypeScript-kompilatoren uten å generere filer. CI krever den før tester og bygg; Next.js hopper fortsatt over sin innebygde typesjekk.

Vitest uses an ESM configuration (`vitest.config.mts`) with module-relative paths. / Vitest bruker ESM-konfigurasjon (`vitest.config.mts`) med modulrelative stier.

## Verify / Verifiser
- Save energy or sleep on `/log` and confirm the toast / Lag energi eller søvn på `/log` og bekreft toasten
- Save a weekly weight on `/check-in` / Lagre ukentlig vekt på `/check-in`
- Switch language in `/settings` and confirm both locales render / Bytt språk i `/settings` og bekreft at begge språk vises
- Export/import a backup / Eksporter og importer en sikkerhetskopi

## E2E troubleshooting / Feilsøking for E2E
- Production header tests use an HTTPS browser origin and intercept only that test server's loopback requests to the HTTP fixture. CSP remains enabled; this validates browser behavior and headers, not a TLS handshake. This avoids WebKit upgrading HTTP assets to an unavailable HTTPS server. / Produksjonsheadertestene bruker HTTPS-origin i nettleseren og mapper bare testserverens lokale kall til HTTP-fixturen. CSP er fortsatt aktiv; testen validerer nettleseroppførsel og headere, ikke TLS-håndtrykk. Dette hindrer at WebKit oppgraderer HTTP-ressurser til en utilgjengelig HTTPS-server.
- To reuse a development server on another port, set `PLAYWRIGHT_BASE_URL` to its loopback URL before running E2E. / Sett `PLAYWRIGHT_BASE_URL` til lokaladressen for å bruke en utviklingsserver på en annen port under E2E.
- Some local environments may intermittently fail Playwright `webServer` readiness checks with `ECONNRESET` even when the app starts normally. Use CI as source of truth for security header validation via `.github/workflows/e2e-security.yml`.
- Enkelte lokale miljøer kan periodevis feile Playwright `webServer`-tilgjengelighet med `ECONNRESET` selv når appen starter normalt. Bruk CI som fasit for validering av sikkerhetsheadere via `.github/workflows/e2e-security.yml`.
