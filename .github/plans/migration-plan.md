<!-- markdownlint-disable MD024 -->

# Masterplan for migrering

## Mål

Migrer Helse Loop til en felles .NET 10-kodebase for Web, Windows, Android, iOS og Mac Catalyst uten å risikere eksisterende lokale data eller fjerne den fungerende Next.js-appen for tidlig.

Strategien er side-by-side strangler-migrering:

1. Beslutt kontrakter og produktsemantikk.
2. Porter og tester domeneoppførsel.
3. Etabler application boundaries.
4. Bevis arkitekturen med én komplett Web-vertikal.
5. Oppnå Web-paritet.
6. Gjenbruk Shared UI i Windows og Android.
7. Lever Apple-støtte når verktøykjeden er klar.
8. Gjennomfør staged cutover og behold rollback.

## Omfang

Paritets-MVP inkluderer:

- Daglig energi og søvn.
- Ukentlig vekt og refleksjon.
- Workout-logging og eksisterende workout-timer.
- Dashboard og seksukers trender.
- Settings, språk og reminders.
- Backup import/export.
- Lokal persistens.
- Norsk Bokmål og engelsk.

Ikke inkludert uten separat beslutning:

- Egen historikkside.
- Cloud sync og konto.
- API-klienter.
- Web Push.
- AI-innsikt.
- Vaner, fokusområder og generaliserte mål.
- Kamera, biometri og deep links.
- Kryptert backup eller database.

PWA offline app-shell behandles som forbedring etter paritet.

## Fase 0: Beslutninger og sannhetsgrunnlag

### Oppgaver

1. ADR: side-by-side under `/dotnet`.
2. ADR: .NET 10 og MAUI servicing.
3. ADR: Blazor Web App global WASM mot standalone WASM PWA.
4. ADR: lokal kalenderdag mot UTC-dag.
5. Produktbeslutning: skal besøk på tom dato opprette standardlogg?
6. Produktbeslutning: behold eller fjern 80 kg-fallback.
7. Produktbeslutning: workout timer og workout log forblir separate.
8. Databeslutning: merge-policy for workout-ID-kollisjon.
9. Omfangsbeslutning: historikkside og PWA er forbedringer, ikke paritet.
10. Oppdater foreldede repository-instruksjoner.
11. Opprett språk-nøytrale golden fixtures fra TypeScript-testene.

### Filer

- `/dotnet/docs/adr/*`
- `/dotnet/tests/fixtures/*`
- `.github/copilot-instructions.md`
- `.github/instructions/data.instructions.md`
- `.github/instructions/domain.instructions.md`
- `.github/skills/health-loop/SKILL.md`

### Hard gate

Ingen domenekode porteres før dato-, standardlogg-, vektfallback- og backup-merge-semantikk er besluttet eller eksplisitt markert som blokkert.

## Fase 1: Domain foundation

### Oppgaver

1. Opprett `global.json`, `Directory.Build.props`, `Directory.Packages.props` og `HelseLoop.slnx`.
2. Opprett kun `HelseLoop.Domain` og `HelseLoop.Domain.Tests`.
3. Porter entiteter og value semantics.
4. Bruk `DateOnly` for dag/uke og UTC `DateTimeOffset` for instants.
5. Porter week start, add days, goals, adherence og trends.
6. Porter legacy workout-normalisering.
7. Porter timer-state-machine som ren funksjon.
8. Kjør identiske golden cases i TypeScript og .NET.
9. Legg til uavhengig .NET CI-jobb uten å endre Node-gaten.

### Hard gate

- Domain har ingen UI-, storage-, localization- eller framework-avhengighet.
- TypeScript og .NET gir identiske resultater for grenseverdier.
- Tester dekker ugyldige kalenderdatoer, midnatt, årsskifte og DST-relevante scenarier.

## Fase 2: Application boundary

### Oppgaver

1. Opprett `HelseLoop.Application` og tester.
2. Definer repositories, `IClock`, `IBackupStore` og typed settings stores.
3. Definer typede resultater og feilkoder.
4. Implementer daglig logg-use cases og bounded navigation.
5. Implementer weekly check-in og besluttet fallback.
6. Implementer workout add/delete/list.
7. Implementer dashboard-projeksjon uten lokalisert tekst.
8. Implementer workout session coordinator rundt state-machine.
9. Implementer backup v1 DTO/parser/serializer.
10. Legg til arkitekturtester.

### Hard gate

- Application refererer kun Domain.
- Ingen `DateTime.Now`, browser-globals eller konkrete repositories.
- Backup v1 golden fixtures parses og serialiseres identisk.
- Malformed/oversized backup gir ingen writes.

## Fase 3: Web-vertikal

### Oppgaver

1. Opprett valgt Web-host etter ADR.
2. Opprett `HelseLoop.Shared.UI` og `HelseLoop.Infrastructure.Browser`.
3. Implementer IndexedDB gjennom isolert JS-modul.
4. Bruk ny database eller separat origin i første versjon.
5. Implementer språkvalg og typed localization.
6. Implementer komplett `/log` page body:
   - 14-dagers navigasjon.
   - eksisterende eller tom/default state etter beslutning.
   - energi og søvn.
   - localized numeric input.
   - noter.
   - quick workouts og delete.
   - auto-save.
   - loading/error/empty.
   - 1800 ms viewport-synlig save notice.
7. Implementer browser backup roundtrip for denne slicen.
8. Test reell IndexedDB-transaksjon og reload.

### Hard gate

- xUnit, bUnit og browser contract tests passerer.
- Playwright passerer mobil og desktop.
- Data overlever reload.
- Backup kan flyttes mellom gammel og ny Web-app.
- Keyboard og tilgjengelighetskontroll er bestått.
- Ingen bred UI-porting starter før denne gaten.

## Fase 4: Web-paritet

### Oppgaver

1. Weekly check-in med tre-ukers grense.
2. Dashboard med seksukers trender og next actions.
3. Workout timer og presentasjon.
4. Browser audio, speech, wake lock og external links.
5. Settings, språk, reminder-hour og permissions.
6. Backup merge/overwrite med eksplisitt konfliktpolicy.
7. Storage summary og eksplisitt «slett alle lokale data»-flyt.
8. Security headers og CSP for Blazor/WASM.
9. Container/Fly eller besluttet Web-deploy.
10. Privacy/Security/README oppdateres.

En eventuell historikkside opprettes i egen produkt-PR.

### Hard gate

- Alle eksisterende fem kjerneflyter fungerer uten serverdata.
- Norsk/engelsk paritet er grønn.
- TypeScript/.NET backup roundtrip er grønn.
- CSP gir ingen runtime-brudd.
- ExorLive-lenker er lisens- og personvernvurdert.

## Fase 4B: Valgfri PWA-forbedring

### Oppgaver

1. Implementer scoped app-shell-caching.
2. Definer update/reload-strategi.
3. Test install, offline reload, upgrade og worker-retirement.
4. Bevis at IndexedDB-data overlever oppdatering.
5. Slett aldri andre appers cacher på samme origin.

### Hard gate

Kald offline-start er testet eksplisitt. Dette skal ikke omtales som eksisterende paritet.

## Fase 5: Native foundation

### Oppgaver

1. Opprett `HelseLoop.Infrastructure.Native` og `HelseLoop.App.Maui`.
2. Implementer SQLite med schema-versjoner og migrasjoner.
3. Kjør samme repository/backup contract suite som IndexedDB.
4. Implementer Preferences, file import/export og external URI.
5. Registrer Shared UI i minimal `BlazorWebView`-shell.

### Hard gate

- SQLite-kontraktene matcher browserens observerbare semantikk.
- Merge/overwrite er transaksjonell.
- Upgrade-test bevarer data.
- Shared UI har ingen compile-time MAUI-avhengighet.

## Fase 6: Windows og Android

### Windows

1. Bevis `/log`-slicen først.
2. Test resize, keyboard, high DPI, screen reader og lifecycle.
3. Test filimport/-eksport, audio, speech, keep-awake og links.
4. Implementer native reminders.
5. Velg MSIX eller unpackaged distribution.
6. Kjør packaged upgrade-smoke.

### Android

1. Bevis `/log`-slicen på emulator.
2. Test også fysisk enhet.
3. Test background/resume, rotation, keyboard og safe areas.
4. Test SQLite retention, file picker, varsler, audio, speech og wake lock.
5. Produser signert AAB med dokumentert eierskap.

### Hard gate

Kjerneflyter passerer på pakkede builds. Android må passere minst én fysisk enhet før release.

## Fase 7: Apple readiness

### Oppgaver

1. Skaff Mac build-host og støttet Xcode.
2. Avklar Apple developer-eierskap.
3. Opprett bundle IDs, sertifikater og provisioning profiles.
4. Bygg iOS og Mac Catalyst.
5. Test reelle enheter, safe areas, lifecycle, filtilgang og varsler.
6. Dokumenter signing og distribusjon.
7. Legg til macOS CI først når secrets/eierskap er bærekraftig.

### Hard gate

Signerte builds fungerer på reelle enheter. Apple er ikke blocker for Web/Windows/Android-MVP.

## Fase 8: Stabilisering og cutover

### Oppgaver

1. Roundtrip backup mellom gammel Web, ny Web, Windows og Android.
2. Test ugyldig, oversize og ID-kollisjon uten datatap.
3. Rehearse migrering og rollback.
4. Kjør tilgjengelighetsgjennomgang.
5. Etabler performance budgets for WASM og MAUI startup.
6. Gjennomfør security/privacy review.
7. Verifiser at logger ikke inneholder helseverdier eller fritekst.
8. Stage release: Web, Windows, Android, deretter Apple.
9. Behold Next deploybar gjennom rollback-vinduet.
10. Fjern Next/Node/Fly-artefakter først etter eksplisitt godkjenning.

### Cutover-gate

- Datamigrering og rollback er gjennomført i produksjonslikt miljø.
- Ingen kritiske tilgjengelighetsfeil.
- Privacy/Security er oppdatert.
- Produktansvarlig godkjenner cutover.
- Backup v1-støtte har dokumentert supportvindu.

## PR-sekvens

### PR 1: ADR-er og karakteriseringsgrunnlag

Inkluderer:

- Arkitektur- og produktbeslutninger.
- Golden fixtures.
- Korrigerte repository-instruksjoner.

Ekskluderer all .NET-produksjonskode.

### PR 2: .NET Domain foundation

Inkluderer:

- Minimal løsning.
- Domain og tester.
- .NET CI.

Ekskluderer Blazor, MAUI og lagring.

### PR 3: Application ports og use cases

### PR 4: Backup v1-kontrakt og fixtures

### PR 5: Web-host og IndexedDB foundation

### PR 6: Daglig logg vertikal slice

Videre PR-er deles per funksjonsområde og plattform. Én branch/PR per backlog-issue er standard.

## Verifikasjon per PR

Så lenge Next.js finnes:

```text
npm run lint
npm run test
npm run build
```

For berørte .NET-prosjekter:

```text
dotnet restore
dotnet build --no-restore
dotnet test --no-build
```

UI-/viewport-endringer krever relevante Playwright- eller Appium-løp. Emulator- og signing-jobber kan være scheduled/release gates hvis de er for trege eller ustabile som PR-gate.
